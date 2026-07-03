/**
 * DailyVault Server 核心工具测试。
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

test('appendToSection appends under an existing heading', () => {
  const original = '# 2026-07-03\n\n## 输入\n- old\n\n## 输出\n- done\n';
  const next = appendToSection(original, '输入', '- new');
  assert.match(next, /## 输入\n- old\n- new\n\n## 输出/);
});

test('appendToSection creates a missing heading at the end', () => {
  const original = '# 2026-07-03\n';
  const next = appendToSection(original, '输入', '- source');
  assert.match(next, /## 输入\n- source\n$/);
});

test('appendDaily previews changes without writing by default', async () => {
  await withTempVault(async (vaultRoot) => {
    const dailyPath = join(vaultRoot, 'Daily', '20260703.md');
    await mkdir(join(vaultRoot, 'Daily'), { recursive: true });
    await writeFile(dailyPath, '# 2026-07-03\n\n## 输入\n- old\n\n## 输出\n- done\n', 'utf8');

    const result = await appendDaily({ date: '2026-07-03', section: '输入', content: '- preview only' });
    const persisted = await readFile(dailyPath, 'utf8');

    assert.equal(result.dry_run, true);
    assert.equal(result.saved, undefined);
    assert.match(result.markdown, /## 输入\n- old\n- preview only\n\n## 输出/);
    assert.doesNotMatch(persisted, /preview only/);
  });
});

test('appendDaily writes only when dry_run is disabled', async () => {
  await withTempVault(async (vaultRoot) => {
    const dailyPath = join(vaultRoot, 'Daily', '20260703.md');
    await mkdir(join(vaultRoot, 'Daily'), { recursive: true });
    await writeFile(dailyPath, '# 2026-07-03\n\n## 输入\n- old\n', 'utf8');

    const result = await appendDaily({ date: '2026-07-03', section: '输入', content: '- persisted', dry_run: false });
    const persisted = await readFile(dailyPath, 'utf8');

    assert.equal(result.saved, true);
    assert.match(persisted, /## 输入\n- old\n- persisted\n$/);
  });
});

test('classifySource routes GitHub links to tools repo sources', () => {
  const result = classifySource({ canonical_url: 'https://github.com/modelcontextprotocol/typescript-sdk', title: 'SDK' });
  assert.equal(result.source_type, 'repo');
  assert.equal(result.category, 'tools');
  assert.ok(result.tags.includes('type/repo'));
});

test('composeSourceMarkdown includes metadata and promotion sections', () => {
  const classification = classifySource({ canonical_url: 'https://example.com/article', title: 'Example Article', excerpt: 'A useful article.' });
  const record = buildSourceRecord({
    metadata: {
      url: 'https://example.com/article',
      canonical_url: 'https://example.com/article',
      title: 'Example Article',
      site_name: 'Example',
      platform: 'Example',
      author: 'Ada',
      creator: 'Ada',
      published_at: '2026-01-01',
      updated_at: '',
      language: 'en',
      excerpt: 'A useful article.',
      text: 'This is a long enough article sentence that can be extracted as a key point for testing.'
    },
    classification,
    dailyDate: '2026-07-03',
    reason: 'test',
    nextAction: 'read'
  });
  const markdown = composeSourceMarkdown(record);
  const parsed = parseFrontmatter(markdown);
  assert.equal(parsed.data.title, 'Example Article');
  assert.equal(parsed.data.related_daily, '[[Daily/20260703]]');
  assert.match(markdown, /## Promotion/);
  assert.match(markdown, /推荐评分：\[推断\]/);
});

test('parseFrontmatter preserves source metadata types used by search and export', () => {
  const parsed = parseFrontmatter(`---\ntitle: Example\nvisibility: public\nreviewed: true\narchived: false\ntags: [type/article, source/web]\nrelated_daily: [[Daily/20260703]]\nempty: \n---\n\n# Body\n`);

  assert.deepEqual(parsed.data, {
    title: 'Example',
    visibility: 'public',
    reviewed: true,
    archived: false,
    tags: ['type/article', 'source/web'],
    related_daily: '[[Daily/20260703]]',
    empty: ''
  });
  assert.equal(parsed.body, '# Body\n');
});

test('extractHtmlMetadata returns JSON-LD parse warnings without dropping visible metadata', () => {
  const metadata = extractHtmlMetadata('<html><head><title>Visible</title><script type="application/ld+json">{bad</script></head><body>Readable body text for extraction.</body></html>', 'https://example.com/page');

  assert.equal(metadata.title, 'Visible');
  assert.equal(metadata.extraction_warnings.length, 1);
  assert.match(metadata.extraction_warnings[0], /JSON-LD parse failed/);
});

test('exportPublicSources returns only summary and public Source records', async () => {
  await withTempVault(async (vaultRoot) => {
    await mkdir(join(vaultRoot, 'Sources', 'reading'), { recursive: true });
    await writeFile(join(vaultRoot, 'Sources', 'reading', 'private.md'), sourceMarkdown({ title: 'Private', visibility: 'private' }), 'utf8');
    await writeFile(join(vaultRoot, 'Sources', 'reading', 'summary.md'), sourceMarkdown({ title: 'Summary', visibility: 'summary', public_summary: 'Approved summary.' }), 'utf8');
    await writeFile(join(vaultRoot, 'Sources', 'reading', 'public.md'), sourceMarkdown({ title: 'Public', visibility: 'public', public_tags: '[publishable, tools]' }), 'utf8');

    const exported = await exportPublicSources();

    assert.deepEqual(exported.map((item) => item.title), ['Public', 'Summary']);
    assert.equal(exported.find((item) => item.title === 'Summary').summary, 'Approved summary.');
    assert.equal(exported.find((item) => item.title === 'Summary').summary_source, 'public_summary');
    assert.equal(exported.find((item) => item.title === 'Public').summary_source, 'body_fallback');
    assert.match(exported.find((item) => item.title === 'Public').warnings[0], /public_summary missing/);
    assert.deepEqual(exported.find((item) => item.title === 'Public').tags, ['publishable', 'tools']);
    assert.ok(exported.every((item) => ['summary', 'public'].includes(item.visibility)));
  });
});

test('promoteCandidate marks incomplete Sources instead of pretending they are ready', async () => {
  await withTempVault(async (vaultRoot) => {
    await mkdir(join(vaultRoot, 'Sources', 'reading'), { recursive: true });
    await writeFile(join(vaultRoot, 'Sources', 'reading', 'incomplete.md'), sourceMarkdown({ title: 'Incomplete', visibility: 'private' }), 'utf8');

    const result = await promoteCandidate({ target: 'znorth', source_path: 'Sources/reading/incomplete.md' });

    assert.equal(result.candidate.status, 'incomplete_candidate');
    assert.deepEqual(result.candidate.missing_fields, ['public_score', 'public_summary']);
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
  return `---\ntitle: ${title}\nvisibility: ${visibility}\ncanonical_url: https://example.com/${title.toLowerCase()}\npublic_summary: ${public_summary}\npublic_tags: ${public_tags}\ndaily_path: Daily/20260703.md\n---\n\n# ${title}\n\n- 一句话摘要：Fallback ${title}\n`;
}
