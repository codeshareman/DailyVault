/**
 * 文件名 slug 生成工具。
 * by AI.Coding
 */

/**
 * 将标题或 URL 转成可读、稳定、保守的文件名片段。
 */
export function slugify(input, fallback = 'source') {
  const ascii = String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return ascii || fallback;
}
