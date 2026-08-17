/**
 * MCP / HTTP 响应与请求体处理工具。
 */
const MAX_JSON_BODY_BYTES = 256 * 1024;

/**
 * 生成 MCP 文本响应。
 */
export function textContent(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return { content: [{ type: 'text', text }] };
}

/**
 * 解析 HTTP JSON 请求体。
 */
export async function readJsonBody(request) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    totalBytes += chunk.byteLength;
    if (totalBytes > MAX_JSON_BODY_BYTES) {
      const error = new Error(`JSON 请求体过大：${totalBytes} 字节`);
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    error.statusCode = 400;
    error.message = `JSON 请求体无效：${error.message}`;
    throw error;
  }
}

/**
 * 写 HTTP JSON 响应。
 */
export function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload, null, 2));
}

export function writeText(response, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(statusCode, { 'content-type': contentType });
  response.end(body);
}
