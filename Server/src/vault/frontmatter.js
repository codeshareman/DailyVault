/**
 * Markdown frontmatter 读写工具。
 * by AI.Coding
 */

/**
 * 解析简单 YAML frontmatter；只处理 DailyVault 当前模板需要的标量和一维数组。
 */
export function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) {
    return { data: {}, body: markdown };
  }
  const end = markdown.indexOf('\n---', 4);
  if (end === -1) {
    return { data: {}, body: markdown };
  }
  const raw = markdown.slice(4, end).trim();
  const body = markdown.slice(end + 5).replace(/^\n/, '');
  const data = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^([^:#]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    data[key] = parseValue(value);
  }
  return { data, body };
}

/**
 * 生成稳定顺序的 frontmatter 字符串。
 */
export function formatFrontmatter(data, order = []) {
  const keys = [...order, ...Object.keys(data).filter((key) => !order.includes(key))];
  const lines = keys.map((key) => `${key}: ${formatValue(data[key])}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

/**
 * 把 frontmatter 和正文合并成 Markdown。
 */
export function composeMarkdown(data, body, order = []) {
  return `${formatFrontmatter(data, order)}\n${body.replace(/^\n+/, '')}`;
}

/**
 * 解析 frontmatter 标量值。
 */
function parseValue(value) {
  if (value === '') return '';
  if (value === '[]') return [];
  if (value.startsWith('[[') && value.endsWith(']]')) return value;
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (/^true|false$/.test(value)) return value === 'true';
  return value.replace(/^"(.*)"$/, '$1');
}

/**
 * 序列化 frontmatter 值。
 */
function formatValue(value) {
  if (Array.isArray(value)) return `[${value.join(', ')}]`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null || value === undefined) return '';
  return String(value);
}
