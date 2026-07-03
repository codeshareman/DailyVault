/**
 * MCP / HTTP 返回值格式化工具。
 * by AI.Coding
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
      const error = new Error(`JSON body too large: ${totalBytes} bytes`);
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
    error.message = `Invalid JSON body: ${error.message}`;
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
