/**
 * 公开 URL 抓取与元数据提取。
 * by AI.Coding
 */

const MAX_TEXT_LENGTH = 12000;
const MAX_RESPONSE_BYTES = 1_000_000;
const FETCH_TIMEOUT_MS = 15000;

/**
 * 读取公开 URL，并从 HTML / 纯文本中提取可观察元数据。
 */
export async function fetchUrlMetadata(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw httpError(400, `URL 无效：${url}`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw httpError(400, `仅支持 http/https URL：${url}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(parsed.href, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // 标明普通网页读取意图，减少站点返回二进制或移动端特殊页面。
        'user-agent': 'DailyVaultServer/0.1 (+https://local.dailyvault)',
        accept: 'text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5'
      }
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw httpError(504, `抓取超时，已等待 ${FETCH_TIMEOUT_MS}ms：${parsed.href}`);
    }
    throw httpError(502, `抓取失败：${error.message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw httpError(502, `抓取返回 HTTP ${response.status}：${parsed.href}`);
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_RESPONSE_BYTES) {
    throw httpError(413, `抓取响应过大：${contentLength} 字节`);
  }

  const contentType = response.headers.get('content-type') || '';
  const finalUrl = response.url || parsed.href;
  let text;
  try {
    text = await readResponseText(response);
  } catch (error) {
    if (error.statusCode) throw error;
    throw httpError(502, `抓取正文读取失败：${finalUrl}：${error.message}`);
  }
  const isHtml = contentType.includes('html') || /<html[\s>]/i.test(text);

  if (isHtml) {
    return extractHtmlMetadata(text, finalUrl, contentType);
  }

  return {
    url: parsed.href,
    canonical_url: finalUrl,
    title: titleFromUrl(finalUrl),
    site_name: new URL(finalUrl).hostname,
    platform: new URL(finalUrl).hostname,
    author: '',
    creator: '',
    published_at: '',
    updated_at: '',
    language: '',
    content_type: contentType,
    text: text.slice(0, MAX_TEXT_LENGTH),
    excerpt: text.replace(/\s+/g, ' ').trim().slice(0, 500)
  };
}


/**
 * 以流式方式读取响应正文，在解码前限制最大字节数。
 */
async function readResponseText(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const chunks = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_RESPONSE_BYTES) {
      throw httpError(413, `抓取响应过大：${totalBytes} 字节`);
    }
    chunks.push(decoder.decode(value, { stream: true }));
  }
  chunks.push(decoder.decode());
  return chunks.join('');
}

/**
 * 构造带 HTTP 状态码的错误，供本地 HTTP 层区分用户输入和上游故障。
 */
function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
/**
 * 从 HTML 中提取 meta、标题、正文摘要等可观察信息。
 */
export function extractHtmlMetadata(html, finalUrl, contentType = 'text/html') {
  const canonical = getLinkHref(html, 'canonical') || finalUrl;
  const hostname = new URL(finalUrl).hostname;
  const jsonLd = parseJsonLdBlocks(html);
  const title = firstNonEmpty(
    getMeta(html, 'property', 'og:title'),
    getMeta(html, 'name', 'twitter:title'),
    getTitle(html),
    titleFromUrl(finalUrl)
  );
  const description = firstNonEmpty(
    getMeta(html, 'name', 'description'),
    getMeta(html, 'property', 'og:description'),
    getMeta(html, 'name', 'twitter:description')
  );
  const author = firstNonEmpty(
    getMeta(html, 'name', 'author'),
    getMeta(html, 'property', 'article:author'),
    getJsonLdValue(jsonLd.values, ['author', 'name'])
  );
  const published = firstNonEmpty(
    getMeta(html, 'property', 'article:published_time'),
    getMeta(html, 'name', 'date'),
    getJsonLdValue(jsonLd.values, ['datePublished'])
  );
  const updated = firstNonEmpty(
    getMeta(html, 'property', 'article:modified_time'),
    getMeta(html, 'name', 'last-modified'),
    getJsonLdValue(jsonLd.values, ['dateModified'])
  );
  const siteName = firstNonEmpty(
    getMeta(html, 'property', 'og:site_name'),
    hostname
  );
  const language = firstNonEmpty(
    getHtmlLang(html),
    getMeta(html, 'http-equiv', 'content-language')
  );
  const mainText = htmlToReadableText(html);

  return {
    url: finalUrl,
    canonical_url: canonical,
    title,
    site_name: siteName,
    platform: siteName || hostname,
    author,
    creator: author,
    published_at: published,
    updated_at: updated,
    language,
    content_type: contentType,
    extraction_warnings: jsonLd.warnings,
    text: mainText.slice(0, MAX_TEXT_LENGTH),
    excerpt: firstNonEmpty(description, mainText.replace(/\s+/g, ' ').trim().slice(0, 500))
  };
}

/**
 * 生成用户可读的一句话摘要；不调用模型，只基于可观察描述和标题。
 */
export function buildObservableSummary(metadata) {
  if (metadata.excerpt) return metadata.excerpt;
  if (metadata.title) return `页面标题：${metadata.title}`;
  return '未能从公开页面提取摘要。';
}

/**
 * 提取 HTML 标题。
 */
function getTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeEntities(stripTags(match?.[1] || '').trim());
}

/**
 * 提取 meta content。
 */
function getMeta(html, attr, value) {
  const pattern = new RegExp(`<meta[^>]+${attr}=["']${escapeRegex(value)}["'][^>]*>`, 'i');
  const tag = html.match(pattern)?.[0] || '';
  const content = tag.match(/content=["']([\s\S]*?)["']/i)?.[1] || '';
  return decodeEntities(content.trim());
}

/**
 * 提取 link href。
 */
function getLinkHref(html, rel) {
  const pattern = new RegExp(`<link[^>]+rel=["']${escapeRegex(rel)}["'][^>]*>`, 'i');
  const tag = html.match(pattern)?.[0] || '';
  return decodeEntities(tag.match(/href=["']([\s\S]*?)["']/i)?.[1] || '').trim();
}

/**
 * 提取 html lang。
 */
function getHtmlLang(html) {
  return decodeEntities(html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] || '').trim();
}

/**
 * 解析 JSON-LD 块；失败不阻断页面抓取，但把降级原因返回给调用方。
 */
function parseJsonLdBlocks(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const values = [];
  const warnings = [];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(decodeEntities(block[1].trim()));
      values.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch (error) {
      warnings.push(`JSON-LD 解析失败：${error.message}`);
    }
  }
  return { values, warnings };
}

/**
 * 从已解析 JSON-LD 对象中读取常见字段。
 */
function getJsonLdValue(values, path) {
  for (const value of values) {
    const result = readPath(value, path);
    if (result) return String(result);
  }
  return '';
}

/**
 * 读取对象路径，支持 author.name 这类嵌套结构。
 */
function readPath(value, path) {
  let current = value;
  for (const key of path) {
    if (Array.isArray(current)) current = current[0];
    current = current?.[key];
    if (!current) return '';
  }
  return current;
}

/**
 * 将 HTML 粗略转换成可读正文，用于摘要和关键点候选。
 */
function htmlToReadableText(html) {
  return decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
    .replace(/<(h[1-6]|p|li|br|div|section|article)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 从 URL 兜底生成标题。
 */
function titleFromUrl(url) {
  const parsed = new URL(url);
  const stem = parsed.pathname.split('/').filter(Boolean).pop() || parsed.hostname;
  return decodeURIComponent(stem).replace(/[-_]+/g, ' ');
}

/**
 * 去除 HTML tag。
 */
function stripTags(text) {
  return text.replace(/<[^>]+>/g, ' ');
}

/**
 * 解码常见 HTML 实体。
 */
function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * 返回第一个非空字符串。
 */
function firstNonEmpty(...values) {
  return values.find((value) => String(value || '').trim()) || '';
}

/**
 * 转义正则特殊字符。
 */
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
