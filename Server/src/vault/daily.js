/**
 * Daily Markdown 读写与追加工具。
 * by AI.Coding
 */
import { readFile } from 'node:fs/promises';
import { resolveVaultPath, toVaultRelative } from '../config/paths.js';
import { atomicWriteFile } from './atomic-write.js';
import { dailyFileStem, formatDate, normalizeDate } from '../util/dates.js';
import { appendAudit } from '../policy/audit.js';

/**
 * 读取指定日期的 Daily 文件。
 */
export async function readDaily(date = formatDate()) {
  const relativePath = dailyPath(date);
  const absolutePath = resolveVaultPath(relativePath);
  const markdown = await readFile(absolutePath, 'utf8');
  return { path: toVaultRelative(absolutePath), markdown };
}

/**
 * 向 Daily 指定章节追加内容；默认 dry_run，避免外部接口误写。
 */
export async function appendDaily({ date = formatDate(), section, content, dry_run = true }) {
  if (!section || !content) {
    throw new Error('appendDaily 需要 section 和 content');
  }
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
 * 生成指定日期的 Daily 路径。
 */
export function dailyPath(date = formatDate()) {
  return `Daily/${dailyFileStem(date)}.md`;
}

/**
 * 读取 Daily；不存在时用低摩擦模板生成内容。
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
    return `${markdown.replace(/\s*$/, '\n')}${normalizedContent}`;
  }

  const before = markdown.slice(0, nextHeading).replace(/\s*$/, '\n');
  const after = markdown.slice(nextHeading);
  return `${before}${normalizedContent}${after}`;
}

/**
 * 用 Server 内置最小模板创建 Daily，保持低摩擦且 Dataview 友好。
 */
function createDailyMarkdown(dateInput) {
  const date = normalizeDate(dateInput);
  const compact = date.replaceAll('-', '');
  const year = date.slice(0, 4);
  const month = date.slice(0, 7);
  const quarter = `${year}-Q${Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1}`;
  return `---\ndaily_id: dv_${compact}\ndate: ${date}\nweek: \nmonth: ${month}\nquarter: ${quarter}\nyear: ${year}\nweekday: \nmodule: Daily\nnote_type: daily-log\nstatus: open\nenergy: \nmood: \nfocus_area: \ndaily_tags: []\nvisibility: private\nreviewed: false\n---\n\n# ${date}\n\n> Server 自动创建；先写，不求完整。\n\n## 今日主线\n- 最重要的一件事：\n- 刻意不做：\n\n## 最重要 3 件事\n- [ ] \n- [ ] \n- [ ] \n\n## 做了什么\n- \n\n## 输入\n- \n\n## 输出\n- \n\n## 生活时间线\n- 看了：\n- 听了：\n- 学了：\n- 去了：\n- 练了：\n- 其他值得记住的：\n\n## 学到 / 复盘\n- 学到：\n- 做得好：\n- 卡住：\n- 明天第一步：\n\n## 明天 / 迁移\n- [ ] \n`;
}
