/**
 * DailyVault 本地 HTTP API 服务。
 * by AI.Coding
 */
import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readDaily, appendDaily } from '../vault/daily.js';
import { intakeSourceUrl, readSource, searchSources } from '../vault/source.js';
import { exportPublicSources } from '../vault/export.js';
import { promoteCandidate } from '../bridge/promotion.js';
import { dryRunCandidatePromotions } from '../bridge/promotion-batch.js';
import { appendAudit } from '../policy/audit.js';
import { readJsonBody, writeJson } from '../util/response.js';

export const HOST = process.env.DAILYVAULT_HOST || '127.0.0.1';
export const PORT = Number(process.env.DAILYVAULT_PORT || 3417);

/**
 * 根据 URL 和 method 分发本地 API 请求。
 */
export async function route(request, response) {
  let url;
  try {
    url = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);
    if (request.method === 'GET' && url.pathname.startsWith('/daily/')) {
      const date = decodeURIComponent(url.pathname.slice('/daily/'.length));
      return writeJson(response, 200, await readDaily(date));
    }

    if (request.method === 'POST' && url.pathname.match(/^\/daily\/[^/]+\/append$/)) {
      const date = decodeURIComponent(url.pathname.split('/')[2]);
      const body = await readJsonBody(request);
      return writeJson(response, 200, await appendDaily({ date, ...body, dry_run: body.dry_run ?? true }));
    }

    if (request.method === 'POST' && url.pathname === '/sources/intake-url') {
      const body = await readJsonBody(request);
      return writeJson(response, 200, await intakeSourceUrl({ ...body, save: body.save ?? false }));
    }

    if (request.method === 'GET' && url.pathname === '/sources') {
      return writeJson(response, 200, await searchSources({
        query: url.searchParams.get('query') || '',
        category: url.searchParams.get('category') || '',
        visibility: url.searchParams.get('visibility') || '',
        limit: Number(url.searchParams.get('limit') || 20)
      }));
    }

    if (request.method === 'GET' && url.pathname.startsWith('/sources/')) {
      const sourcePath = decodeURIComponent(url.pathname.slice('/sources/'.length));
      return writeJson(response, 200, await readSource(sourcePath));
    }

    if (request.method === 'GET' && url.pathname === '/exports/public') {
      return writeJson(response, 200, await exportPublicSources({ limit: Number(url.searchParams.get('limit') || 50) }));
    }

    if (request.method === 'POST' && url.pathname === '/promotions/candidate') {
      const body = await readJsonBody(request);
      return writeJson(response, 200, await promoteCandidate({ ...body, dry_run: body.dry_run ?? true }));
    }

    if (request.method === 'POST' && url.pathname === '/promotions/candidate/dry-run') {
      const body = await readJsonBody(request);
      return writeJson(response, 200, await dryRunCandidatePromotions(body));
    }

    return writeJson(response, 404, { error: '未找到' });
  } catch (error) {
    return writeHttpError(request, response, error, url);
  }
}

/**
 * 把预期错误和服务端异常区分返回，避免把内部故障伪装成用户输入错误。
 */
async function writeHttpError(request, response, error, url) {
  const statusCode = error.statusCode || 500;
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
