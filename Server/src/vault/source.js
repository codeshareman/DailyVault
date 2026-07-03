/**
 * Source 记录读写与 URL intake 业务逻辑。
 * by AI.Coding
 */
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { resolveVaultPath, toVaultRelative } from '../config/paths.js';
import { atomicWriteFile } from './atomic-write.js';
import { composeMarkdown, parseFrontmatter } from './frontmatter.js';
import { fetchUrlMetadata, buildObservableSummary } from '../ingest/fetch-url.js';
import { formatDate, formatTimestamp, normalizeDate } from '../util/dates.js';
import { slugify } from '../util/slug.js';
import { appendAudit } from '../policy/audit.js';

const SOURCE_FRONTMATTER_ORDER = [
  'source_id', 'date', 'week', 'month', 'quarter', 'year', 'time', 'module', 'note_type',
  'source_type', 'category', 'status', 'url', 'canonical_url', 'title', 'site_name', 'platform',
  'author', 'creator', 'published_at', 'updated_at', 'captured_at', 'language', 'extraction_warnings', 'tags',
  'interest_tags', 'quality_score', 'relevance_score', 'actionability_score', 'memory_score',
  'public_score', 'rating', 'visibility', 'public_title', 'public_summary', 'public_tags',
  'related_daily', 'daily_path', 'source_ref', 'raw_source_path', 'nervia_status',
  'nervia_source_id', 'nervia_topic', 'nervia_role', 'znorth_status', 'znorth_bridge_id',
  'znorth_product', 'znorth_distribution', 'reviewed'
];

const CATEGORY_DIRS = new Set(['inbox', 'reading', 'watching', 'listening', 'learning', 'tools', 'places', 'events', 'fitness']);

/**
 * 从公开 URL 建立 Source 记录；save=false 时只返回预览，不写入 Vault。
 */
export async function intakeSourceUrl({ url, daily_date, save = false, reason = '', next_action = '', append_daily = true }) {
  const metadata = await fetchUrlMetadata(url);
  const dailyDate = normalizeDate(daily_date || formatDate());
  const classification = classifySource(metadata);
  const record = buildSourceRecord({ metadata, classification, dailyDate, reason, nextAction: next_action });
  const relativePath = await chooseSourcePath(record.frontmatter.category, record.frontmatter.title, record.frontmatter.date);
  const markdown = composeSourceMarkdown(record);
  const result = {
    saved: false,
    source_path: relativePath,
    frontmatter: record.frontmatter,
    summary: record.summary,
    key_points: record.keyPoints,
    scores: record.scores,
    next_action: record.nextAction,
    markdown
  };

  if (!save) {
    return result;
  }

  const absolutePath = resolveVaultPath(relativePath);
  await atomicWriteFile(absolutePath, markdown);
  await appendAudit({ action: 'source.intake_url', source_path: relativePath, url: metadata.url, daily_date: dailyDate });

  if (append_daily) {
    const { appendDaily } = await import('./daily.js');
    await appendDaily({
      date: dailyDate,
      section: '输入',
      content: `- Source: [[${relativePath.replace(/\.md$/, '')}|${record.frontmatter.title}]] — ${record.summary}`,
      dry_run: false
    });
  }

  return { ...result, saved: true };
}

/**
 * 读取单个 Source Markdown。
 */
export async function readSource(sourcePath) {
  const absolutePath = resolveVaultPath(sourcePath);
  const markdown = await readFile(absolutePath, 'utf8');
  const parsed = parseFrontmatter(markdown);
  return { path: toVaultRelative(absolutePath), frontmatter: parsed.data, body: parsed.body, markdown };
}

/**
 * 搜索 Source 文件；默认返回轻量 frontmatter 和摘要片段。
 */
export async function searchSources({ query = '', category = '', visibility = '', limit = 20 } = {}) {
  const files = await listSourceFiles();
  const normalizedQuery = query.toLowerCase();
  const results = [];

  for (const file of files) {
    const markdown = await readFile(resolveVaultPath(file), 'utf8');
    const parsed = parseFrontmatter(markdown);
    const haystack = `${parsed.data.title || ''}\n${parsed.body}`.toLowerCase();
    if (category && parsed.data.category !== category) continue;
    if (visibility && parsed.data.visibility !== visibility) continue;
    if (normalizedQuery && !haystack.includes(normalizedQuery)) continue;
    results.push({
      path: file,
      title: parsed.data.title || path.basename(file, '.md'),
      category: parsed.data.category || '',
      source_type: parsed.data.source_type || '',
      visibility: parsed.data.visibility || 'private',
      related_daily: parsed.data.related_daily || '',
      summary: extractSummary(parsed.body)
    });
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * 根据元数据推断 Source 分类、标签和目标目录。
 */
export function classifySource(metadata) {
  const url = metadata.canonical_url || metadata.url;
  const host = new URL(url).hostname.toLowerCase();
  const title = (metadata.title || '').toLowerCase();
  const text = `${title} ${host} ${metadata.excerpt || ''}`.toLowerCase();

  if (host.includes('github.com')) return classification('repo', 'tools', ['type/repo', 'source/web', 'status/to-read']);
  if (host.includes('youtube.com') || host.includes('youtu.be') || host.includes('bilibili.com') || host.includes('vimeo.com')) {
    return classification('video', 'watching', ['type/video', 'format/video', 'source/web']);
  }
  if (host.includes('spotify.com') || host.includes('podcast') || text.includes('podcast')) {
    return classification('podcast', 'listening', ['type/podcast', 'format/audio', 'source/web']);
  }
  if (host.includes('arxiv.org') || text.includes('paper') || url.endsWith('.pdf')) {
    return classification('paper', 'reading', ['type/paper', 'source/web']);
  }
  if (text.includes('docs') || text.includes('documentation') || text.includes('course') || text.includes('tutorial')) {
    return classification(text.includes('course') ? 'course' : 'docs', 'learning', ['type/docs', 'source/web', 'status/to-learn']);
  }
  if (text.includes('event') || text.includes('conference') || text.includes('concert') || text.includes('ticket')) {
    return classification('event', 'events', ['type/event', 'source/web']);
  }
  if (host.includes('maps.google') || text.includes('restaurant') || text.includes('venue')) {
    return classification('place', 'places', ['type/place', 'source/web']);
  }
  return classification('article', 'reading', ['type/article', 'source/web', 'status/to-read']);
}

/**
 * 构建 Source frontmatter、正文摘要和推荐分。
 */
export function buildSourceRecord({ metadata, classification, dailyDate, reason = '', nextAction = '' }) {
  const date = normalizeDate(dailyDate);
  const compact = date.replaceAll('-', '');
  const timestamp = formatTimestamp();
  const scores = scoreSource(metadata, classification);
  const summary = buildObservableSummary(metadata);
  const keyPoints = extractKeyPoints(metadata.text, 5);
  const title = metadata.title || metadata.canonical_url || metadata.url;
  const frontmatter = {
    source_id: `dv_src_${timestamp}_${slugify(title)}`,
    date,
    week: '',
    month: date.slice(0, 7),
    quarter: `${date.slice(0, 4)}-Q${Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1}`,
    year: date.slice(0, 4),
    time: '',
    module: 'Sources',
    note_type: 'source',
    source_type: classification.source_type,
    category: classification.category,
    status: 'inbox',
    url: metadata.url,
    canonical_url: metadata.canonical_url || metadata.url,
    title,
    site_name: metadata.site_name || '',
    platform: metadata.platform || metadata.site_name || '',
    author: metadata.author || '',
    creator: metadata.creator || metadata.author || '',
    published_at: metadata.published_at || '',
    updated_at: metadata.updated_at || '',
    captured_at: new Date().toISOString(),
    language: metadata.language || '',
    extraction_warnings: metadata.extraction_warnings || [],
    tags: classification.tags,
    interest_tags: [],
    quality_score: scores.quality_score,
    relevance_score: scores.relevance_score,
    actionability_score: scores.actionability_score,
    memory_score: scores.memory_score,
    public_score: scores.public_score,
    rating: '',
    visibility: 'private',
    public_title: '',
    public_summary: '',
    public_tags: [],
    related_daily: `[[Daily/${compact}]]`,
    daily_path: `Daily/${compact}.md`,
    source_ref: metadata.canonical_url || metadata.url,
    raw_source_path: '',
    nervia_status: '',
    nervia_source_id: '',
    nervia_topic: '',
    nervia_role: '',
    znorth_status: '',
    znorth_bridge_id: '',
    znorth_product: '',
    znorth_distribution: '',
    reviewed: false
  };
  return { frontmatter, summary, keyPoints, reason, nextAction, scores };
}

/**
 * 组合完整 Source Markdown。
 */
export function composeSourceMarkdown(record) {
  const { frontmatter, summary, keyPoints, reason, nextAction, scores } = record;
  const keyPointLines = keyPoints.length ? keyPoints.map((point) => `  - ${point}`).join('\n') : '  - 未观察到';
  const scoreLine = `quality=${scores.quality_score}, relevance=${scores.relevance_score}, actionability=${scores.actionability_score}, memory=${scores.memory_score}, public=${scores.public_score}`;
  const body = `# ${frontmatter.title}

> 用户只需要给链接；Server/AI 负责读取公开页面并补齐可观察元数据。未知就留空，不编造。

## 快速记录

- URL：${frontmatter.url}
- 为什么保存：${reason}
- 下一步：${nextAction}

## AI 整理结果

- 一句话摘要：${summary}
- 关键内容：
${keyPointLines}
- 适合分类：${frontmatter.category} / ${frontmatter.source_type}
- 推荐标签：${frontmatter.tags.join(', ')}
- 推荐评分：[推断] ${scoreLine}
- 可公开性：默认 private；公开前需人工确认 visibility。

## 源信息

- 标题：${frontmatter.title}
- 站点 / 平台：${frontmatter.site_name || frontmatter.platform}
- 作者 / 创作者：${frontmatter.author || frontmatter.creator}
- 发布时间 / 更新时间：${frontmatter.published_at} / ${frontmatter.updated_at}
- 语言：${frontmatter.language}
- Canonical URL：${frontmatter.canonical_url}
- 抓取证据：${frontmatter.source_ref}
- 抓取警告：${frontmatter.extraction_warnings.length ? frontmatter.extraction_warnings.join('；') : '无'}

## Promotion

- Nervia：
- ZNorth：

## 关联

- Daily: ${frontmatter.related_daily}
- Clipping:
- Note:
`;
  return composeMarkdown(frontmatter, body, SOURCE_FRONTMATTER_ORDER);
}

/**
 * 为 Source 选择不会覆盖已有文件的路径。
 */
async function chooseSourcePath(category, title, date) {
  const safeCategory = CATEGORY_DIRS.has(category) ? category : 'inbox';
  const base = `${date.replaceAll('-', '')}-${slugify(title)}`;
  for (let index = 0; index < 100; index += 1) {
    const suffix = index === 0 ? '' : `-${index + 1}`;
    const relative = `Sources/${safeCategory}/${base}${suffix}.md`;
    try {
      await access(resolveVaultPath(relative));
    } catch (error) {
      if (error.code === 'ENOENT') return relative;
      error.message = `Unable to check source path availability for ${relative}: ${error.message}`;
      throw error;
    }
  }
  throw new Error(`Unable to choose source path for ${title}`);
}

/**
 * 列出 Sources 下全部 Markdown 文件。
 */
async function listSourceFiles() {
  const root = resolveVaultPath('Sources');
  const output = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') output.push(toVaultRelative(absolute));
    }
  }
  await walk(root);
  return output.sort();
}

/**
 * 从正文中提取摘要行。
 */
function extractSummary(body) {
  return body.match(/一句话摘要：([^\n]+)/)?.[1]?.trim() || body.split('\n').find((line) => line.trim().startsWith('- ')) || '';
}

/**
 * 生成简单分类对象。
 */
function classification(sourceType, category, tags) {
  return { source_type: sourceType, category, tags };
}

/**
 * 基于可观察内容给推荐分，不代表用户主观评分。
 */
function scoreSource(metadata, classificationValue) {
  const hasAuthor = Boolean(metadata.author || metadata.creator);
  const hasDate = Boolean(metadata.published_at || metadata.updated_at);
  const textLength = (metadata.text || '').length;
  const quality = Math.min(5, 2 + Number(textLength > 800) + Number(hasAuthor) + Number(hasDate));
  const relevance = ['repo', 'docs', 'course', 'tool'].includes(classificationValue.source_type) ? 4 : 3;
  const actionability = ['docs', 'course', 'tutorial', 'repo', 'tool'].includes(classificationValue.source_type) ? 4 : 3;
  const memory = ['paper', 'course', 'repo', 'event', 'place'].includes(classificationValue.source_type) ? 4 : 3;
  const publicScore = metadata.author || metadata.site_name ? 3 : 2;
  return {
    quality_score: quality,
    relevance_score: relevance,
    actionability_score: actionability,
    memory_score: memory,
    public_score: publicScore
  };
}

/**
 * 从正文中截取可读关键点，避免调用模型时编造未观察到的信息。
 */
function extractKeyPoints(text = '', limit = 5) {
  const sentences = String(text)
    .split(/[。！？.!?\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 20 && item.length < 220);
  return sentences.slice(0, limit);
}