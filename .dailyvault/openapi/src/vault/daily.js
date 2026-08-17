/**
 * Daily 读写与追加：本模块唯一的事实来源是 Daily/YYYY/YYYYMMDD.md。
 */
import { readFile } from 'node:fs/promises';
import { resolveVaultPath, toVaultRelative } from '../config/paths.js';
import { atomicWriteFile } from './atomic-write.js';
import { chineseWeekday, dailyFileStem, formatDate, isoWeek, normalizeDate } from '../util/dates.js';
import { appendAudit } from '../audit.js';

export const DAILY_SECTIONS = ['今日计划', '随手记录', '输入', '输出', '生活时间线', '学到', '复盘', '明日 / 迁移'];

/**
 * 读取指定日期的 Daily 文件。
 */
export async function readDaily(date = formatDate()) {
  const relativePath = dailyPath(date);
  const absolutePath = resolveVaultPath(relativePath);
  try {
    const markdown = await readFile(absolutePath, 'utf8');
    return { path: toVaultRelative(absolutePath), markdown };
  } catch (error) {
    if (error.code === 'ENOENT') error.statusCode = 404;
    throw error;
  }
}

/**
 * 向 Daily 指定章节追加内容；默认 dry_run，避免外部接口误写。
 */
export async function appendDaily({ date = formatDate(), section, content, dry_run = true }) {
  assertAppendInput({ section, content, dry_run });
  const relativePath = dailyPath(date);
  const absolutePath = resolveVaultPath(relativePath);
  const original = await readOrCreateDaily(date);
  const next = appendToSection(original, section, content);
  const preview = { path: relativePath, dry_run, markdown: next };

  if (dry_run) {
    return preview;
  }

  await atomicWriteFile(absolutePath, next);
  await appendAudit({ action: 'daily.append', daily_path: relativePath, section });
  return { ...preview, dry_run: false, saved: true };
}

/**
 * 生成指定日期的 Daily 路径（按年分子目录：Daily/YYYY/YYYYMMDD.md）。
 */
export function dailyPath(date = formatDate()) {
  const stem = dailyFileStem(date);
  return `Daily/${stem.slice(0, 4)}/${stem}.md`;
}

/**
 * 读取 Daily；不存在时用与 Templates/daily.md 一致的低摩擦模板生成内容。
 */
async function readOrCreateDaily(date) {
  try {
    return await readFile(resolveVaultPath(dailyPath(date)), 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return createDailyMarkdown(date);
  }
}

/**
 * 在指定章节末尾追加内容；没有章节时追加到文件末尾并创建章节。
 * 追加前会清掉章节尾部的空占位项（模板中的 `- `），避免留下孤立空行。
 */
export function appendToSection(markdown, section, content) {
  const heading = `## ${section}`;
  const normalizedContent = content.endsWith('\n') ? content : `${content}\n`;
  const headingIndex = markdown.indexOf(`${heading}\n`);
  if (headingIndex === -1) {
    const separator = markdown.endsWith('\n') ? '' : '\n';
    return `${markdown}${separator}\n${heading}\n${normalizedContent}`;
  }

  const afterHeading = headingIndex + heading.length + 1;
  const nextHeading = markdown.indexOf('\n## ', afterHeading);
  if (nextHeading === -1) {
    const before = stripTrailingEmptyItems(markdown.slice(afterHeading).replace(/\s*$/, '\n'));
    return `${markdown.slice(0, afterHeading)}${before}${normalizedContent}`;
  }

  const before = stripTrailingEmptyItems(markdown.slice(0, nextHeading).replace(/\s*$/, '\n'));
  const after = markdown.slice(nextHeading);
  return `${before}${normalizedContent}${after}`;
}

/**
 * 移除文本末尾的空行和空占位列表项（`- `、`-`、`* `），返回以换行结尾的干净文本。
 */
function stripTrailingEmptyItems(text) {
  const lines = text.split('\n');
  while (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  while (lines.length > 0 && /^[-*] ?$/.test(lines[lines.length - 1])) lines.pop();
  return lines.length ? `${lines.join('\n')}\n` : '';
}

function assertAppendInput({ section, content, dry_run }) {
  if (!DAILY_SECTIONS.includes(section)) {
    const error = new Error(`section 必须是以下章节之一：${DAILY_SECTIONS.join('、')}`);
    error.statusCode = 400;
    throw error;
  }
  if (typeof content !== 'string' || !content.trim()) {
    const error = new Error('content 必须是非空字符串');
    error.statusCode = 400;
    throw error;
  }
  if (typeof dry_run !== 'boolean') {
    const error = new Error('dry_run 必须是布尔值');
    error.statusCode = 400;
    throw error;
  }
}

/**
 * 用与 Templates/daily.md 一致的模板创建 Daily，保持低摩擦且 Dataview 友好。
 */
export function createDailyMarkdown(dateInput) {
  const date = normalizeDate(dateInput);
  const year = date.slice(0, 4);
  const month = date.slice(0, 7);
  const quarter = `${year}-Q${Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1}`;
  return `---\ndate: ${date}\nweekday: ${chineseWeekday(date)}\nweek: "${isoWeek(date)}"\nmonth: "${month}"\nquarter: "${quarter}"\nyear: ${year}\nnote_type: daily-log\n---\n\n# ${date}\n\n## 今日计划\n- [ ] \n- [ ] \n- [ ] \n\n## 随手记录\n- \n\n## 输入\n- \n\n## 输出\n- \n\n## 生活时间线\n- \n\n## 学到\n- \n\n## 复盘\n- \n\n## 明日 / 迁移\n- [ ] \n- \n`;
}
