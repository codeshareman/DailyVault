/**
 * DailyVault 本地 HTTP API 服务：只监听 127.0.0.1，提供 Daily 的读取与追加。
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { readDaily, appendDaily } from '../vault/daily.js';
import { resolveOpenApiPath } from '../config/paths.js';
import { appendAudit } from '../audit.js';
import { readJsonBody, writeJson, writeText } from '../util/response.js';

export const HOST = process.env.DAILYVAULT_HOST || '127.0.0.1';
export const PORT = Number(process.env.DAILYVAULT_PORT || 3417);

const DAILY_READ_PATTERN = /^\/daily\/([^/]+)$/;
const DAILY_APPEND_PATTERN = /^\/daily\/([^/]+)\/append$/;

/**
 * 按 URL 与 method 分发本地 API 请求。
 */
export async function route(request, response) {
  let url;
  try {
    url = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);
    if (request.method === 'GET' && url.pathname === '/health') {
      return writeJson(response, 200, { status: 'ok' });
    }

    if (request.method === 'GET' && url.pathname === '/openapi.yaml') {
      const yaml = await readFile(resolveOpenApiPath('openapi.yaml'), 'utf8');
      return writeText(response, 200, yaml, 'application/yaml; charset=utf-8');
    }

    const readMatch = request.method === 'GET' ? url.pathname.match(DAILY_READ_PATTERN) : null;
    if (readMatch) {
      const date = parseDateSegment(readMatch[1]);
      return writeJson(response, 200, await readDaily(date));
    }

    const appendMatch = request.method === 'POST' ? url.pathname.match(DAILY_APPEND_PATTERN) : null;
    if (appendMatch) {
      const date = parseDateSegment(appendMatch[1]);
      const body = await readJsonBody(request);
      if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        const error = new Error('请求体必须是 JSON 对象');
        error.statusCode = 400;
        throw error;
      }
      return writeJson(response, 200, await appendDaily({ date, ...body, dry_run: body.dry_run ?? true }));
    }

    return writeJson(response, 404, { error: '未找到' });
  } catch (error) {
    return writeHttpError(request, response, error, url);
  }
}

/**
 * 解析日期路径段；畸形 percent-encoding 统一按 400 处理。
 */
function parseDateSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    const error = new Error('URL 路径编码无效');
    error.statusCode = 400;
    throw error;
  }
}

/**
 * 区分预期错误与内部故障：用户输入错误按原样返回，服务端异常记录审计并隐藏细节。
 */
async function writeHttpError(request, response, error, url) {
  const statusCode = error.statusCode || (error.code === 'ENOENT' ? 404 : 500);
  if (statusCode >= 500) {
    console.error('DailyVault HTTP 错误：', error);
    appendAudit({
      action: 'http.error',
      method: request.method,
      path: url?.pathname || request.url,
      status_code: statusCode,
      error: error.message
    }).catch((auditError) => console.error('DailyVault HTTP 审计失败：', auditError));
  }
  return writeJson(response, statusCode, { error: statusCode >= 500 ? '内部服务错误' : error.message });
}

export function createDailyVaultHttpServer() {
  return createServer((request, response) => {
    route(request, response).catch((error) => {
      if (!response.headersSent) writeJson(response, error.statusCode || 500, { error: error.message });
      else response.destroy(error);
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createDailyVaultHttpServer();
  server.listen(PORT, HOST, () => {
    console.error(`DailyVault HTTP 服务监听 http://${HOST}:${PORT}`);
  });
}
