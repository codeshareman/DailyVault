/**
 * DailyVault 服务核心工具测试。
 * by AI.Coding
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { appendDaily, appendToSection } from '../src/vault/daily.js';
import { classifySource, buildSourceRecord, composeSourceMarkdown } from '../src/vault/source.js';
import { exportPublicSources } from '../src/vault/export.js';
import { extractHtmlMetadata } from '../src/ingest/fetch-url.js';
import { promoteCandidate } from '../src/bridge/promotion.js';
import { parseFrontmatter } from '../src/vault/frontmatter.js';

test('appendToSection 会追加到已有标题下', () => {
  const original = '# 2026-07-03\n\n## 输入\n- old\n\n## 输出\n- done\n';
  const next = appendToSection(original, '输入', '- new');
  assert.match(next, /## 输入\n- old\n- new\n\n## 输出/);
});

test('appendToSection 会在末尾创建缺失标题', () => {
  const original = '# 2026-07-03\n';
  const next = appendToSection(original, '输入', '- source');
  assert.match(next, /## 输入\n- source\n$/);
});

test('appendDaily 默认只预览变更不写入', async () => {
  await withTempVault(async (vaultRoot) => {
    const dailyPath = join(vaultRoot, 'Daily', '20260703.md');
    await mkdir(join(vaultRoot, 'Daily'), { recursive: true });
    await writeFile(dailyPath, '# 2026-07-03\n\n## 输入\n- old\n\n## 输出\n- done\n', 'utf8');

    const result = await appendDaily({ date: '2026-07-03', section: '输入', content: '- 仅预览' });
    const persisted = await readFile(dailyPath, 'utf8');

    assert.equal(result.dry_run, true);
    assert.equal(result.saved, undefined);
    assert.match(result.markdown, /## 输入\n- old\n- 仅预览\n\n## 输出/);
    assert.doesNotMatch(persisted, /仅预览/);
  });
});

test('appendDaily 只在关闭 dry_run 时写入', async () => {
  await withTempVault(async (vaultRoot) => {
    const dailyPath = join(vaultRoot, 'Daily', '20260703.md');
    await mkdir(join(vaultRoot, 'Daily'), { recursive: true });
    await writeFile(dailyPath, '# 2026-07-03\n\n## 输入\n- old\n', 'utf8');

    const result = await appendDaily({ date: '2026-07-03', section: '输入', content: '- 已保存', dry_run: false });
    const persisted = await readFile(dailyPath, 'utf8');

    assert.equal(result.saved, true);
    assert.match(persisted, /## 输入\n- old\n- 已保存\n$/);
  });
});

test('classifySource 会把 GitHub 链接归入 tools repo 资料', () => {
  const result = classifySource({ canonical_url: 'https://github.com/modelcontextprotocol/typescript-sdk', title: 'SDK' });
  assert.equal(result.source_type, 'repo');
  assert.equal(result.category, 'tools');
  assert.ok(result.tags.includes('type/repo'));
});

test('composeSourceMarkdown 包含元数据和提升候选章节', () => {
  const classification = classifySource({ canonical_url: 'https://example.com/article', title: '示例文章', excerpt: '一篇有用的文章。' });
  const record = buildSourceRecord({
    metadata: {
      url: 'https://example.com/article',
      canonical_url: 'https://example.com/article',
      title: '示例文章',
      site_name: '示例站点',
      platform: '示例站点',
      author: 'Ada',
      creator: 'Ada',
      published_at: '2026-01-01',
      updated_at: '',
      language: 'en',
      excerpt: '一篇有用的文章。',
      text: '这是一句足够长的文章内容，可以被提取为测试用关键点。'
    },
    classification,
    dailyDate: '2026-07-03',
    reason: 'test',
    nextAction: 'read'
  });
  const markdown = composeSourceMarkdown(record);
  const parsed = parseFrontmatter(markdown);
  assert.equal(parsed.data.title, '示例文章');
  assert.equal(parsed.data.related_daily, '[[Daily/20260703]]');
  assert.match(markdown, /## 提升候选/);
  assert.match(markdown, /推荐评分：\[推断\]/);
});

test('parseFrontmatter 保留搜索和导出所需的 Source 元数据类型', () => {
  const parsed = parseFrontmatter(`---\ntitle: 示例\nvisibility: public\nreviewed: true\narchived: false\ntags: [type/article, source/web]\nrelated_daily: [[Daily/20260703]]\nempty: \n---\n\n# 正文\n`);

  assert.deepEqual(parsed.data, {
    title: '示例',
    visibility: 'public',
    reviewed: true,
    archived: false,
    tags: ['type/article', 'source/web'],
    related_daily: '[[Daily/20260703]]',
    empty: ''
  });
  assert.equal(parsed.body, '# 正文\n');
});

test('extractHtmlMetadata 返回 JSON-LD 解析警告且不丢弃可见元数据', () => {
  const metadata = extractHtmlMetadata('<html><head><title>可见标题</title><script type="application/ld+json">{bad</script></head><body>用于提取的可读正文。</body></html>', 'https://example.com/page');

  assert.equal(metadata.title, '可见标题');
  assert.equal(metadata.extraction_warnings.length, 1);
  assert.match(metadata.extraction_warnings[0], /JSON-LD 解析失败/);
});

test('exportPublicSources 只返回 summary 和 public 的 Source 记录', async () => {
  await withTempVault(async (vaultRoot) => {
    await mkdir(join(vaultRoot, 'Sources', 'reading'), { recursive: true });
    await writeFile(join(vaultRoot, 'Sources', 'reading', 'private.md'), sourceMarkdown({ title: '私有', visibility: 'private' }), 'utf8');
    await writeFile(join(vaultRoot, 'Sources', 'reading', 'summary.md'), sourceMarkdown({ title: '摘要', visibility: 'summary', public_summary: '已批准摘要。' }), 'utf8');
    await writeFile(join(vaultRoot, 'Sources', 'reading', 'public.md'), sourceMarkdown({ title: '公开', visibility: 'public', public_tags: '[publishable, tools]' }), 'utf8');

    const exported = await exportPublicSources();

    assert.deepEqual(exported.map((item) => item.title), ['公开', '摘要']);
    assert.equal(exported.find((item) => item.title === '摘要').summary, '已批准摘要。');
    assert.equal(exported.find((item) => item.title === '摘要').summary_source, 'public_summary');
    assert.equal(exported.find((item) => item.title === '公开').summary_source, 'body_fallback');
    assert.match(exported.find((item) => item.title === '公开').warnings[0], /缺少 public_summary/);
    assert.deepEqual(exported.find((item) => item.title === '公开').tags, ['publishable', 'tools']);
    assert.ok(exported.every((item) => ['summary', 'public'].includes(item.visibility)));
  });
});

test('promoteCandidate 会用机器可读原因拒绝不完整 ZNorth Source', async () => {
  await withTempVault(async (vaultRoot) => {
    await mkdir(join(vaultRoot, 'Sources', 'reading'), { recursive: true });
    await writeFile(join(vaultRoot, 'Sources', 'reading', 'incomplete.md'), sourceMarkdown({ title: '不完整', visibility: 'private' }), 'utf8');

    const result = await promoteCandidate({ target: 'znorth', source_path: 'Sources/reading/incomplete.md' });

    assert.equal(result.candidate.status, 'incomplete_candidate');
    assert.deepEqual(result.candidate.missing_fields, ['analysis_allowed', 'public_summary', 'public_risk_level']);
    assert.deepEqual(result.candidate.reasons, ['privacy_not_publishable:private', 'missing:analysis_allowed', 'missing:public_summary', 'missing:public_risk_level']);
  });
});

async function withTempVault(callback) {
  const previousRoot = process.env.DAILYVAULT_ROOT;
  const vaultRoot = await mkdtemp(join(tmpdir(), 'dailyvault-server-test-'));
  process.env.DAILYVAULT_ROOT = vaultRoot;
  try {
    await callback(vaultRoot);
  } finally {
    if (previousRoot === undefined) delete process.env.DAILYVAULT_ROOT;
    else process.env.DAILYVAULT_ROOT = previousRoot;
    await rm(vaultRoot, { recursive: true, force: true });
  }
}
function sourceMarkdown({ title, visibility, public_summary = '', public_tags = '[]' }) {
  return `---\ndate: 2026-07-03\nnote_type: source\ntitle: ${title}\nvisibility: ${visibility}\ncanonical_url: https://example.com/${title.toLowerCase()}\npublic_summary: ${public_summary}\npublic_tags: ${public_tags}\ndaily_path: Daily/20260703.md\n---\n\n# ${title}\n\n- 一句话摘要：备用摘要 ${title}\n`;
}
