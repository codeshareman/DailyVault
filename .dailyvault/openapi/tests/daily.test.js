import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { appendDaily, appendToSection, createDailyMarkdown, readDaily } from '../src/vault/daily.js';

test('appendToSection appends within an existing section', () => {
  const original = '# 2026-08-17\n\n## 输入\n- old\n\n## 输出\n- done\n';
  const next = appendToSection(original, '输入', '- new');
  assert.match(next, /## 输入\n- old\n- new\n\n## 输出/);
});

test('appendDaily previews by default and saves only when requested', async () => {
  await withTempVault(async (vaultRoot) => {
    const dailyPath = join(vaultRoot, 'Daily', '20260817.md');
    await mkdir(join(vaultRoot, 'Daily'), { recursive: true });
    await writeFile(dailyPath, '# 2026-08-17\n\n## 输入\n- old\n', 'utf8');

    const preview = await appendDaily({ date: '2026-08-17', section: '输入', content: '- preview' });
    assert.equal(preview.dry_run, true);
    assert.doesNotMatch(await readFile(dailyPath, 'utf8'), /preview/);

    const saved = await appendDaily({ date: '2026-08-17', section: '输入', content: '- saved', dry_run: false });
    assert.equal(saved.saved, true);
    assert.match(await readFile(dailyPath, 'utf8'), /- saved/);
  });
});

test('appendDaily rejects unsupported sections and non-boolean dry_run', async () => {
  await assert.rejects(
    () => appendDaily({ date: '2026-08-17', section: '不存在', content: '- nope' }),
    { statusCode: 400 }
  );
  await assert.rejects(
    () => appendDaily({ date: '2026-08-17', section: '输入', content: '- nope', dry_run: 'false' }),
    { statusCode: 400 }
  );
});

test('appendToSection creates the section at the end when missing', () => {
  const original = '# 2026-08-17\n\n## 输入\n- old\n';
  const next = appendToSection(original, '学到', '- insight');
  assert.match(next, /## 输入\n- old\n\n## 学到\n- insight/);
});

test('readDaily returns 404 for a missing Daily', async () => {
  await withTempVault(async () => {
    await assert.rejects(() => readDaily('2026-08-01'), { statusCode: 404 });
  });
});

test('appendDaily rejects invalid dates with 400', async () => {
  await withTempVault(async () => {
    await assert.rejects(
      () => appendDaily({ date: '2026-8-1', section: '输入', content: '- nope' }),
      { statusCode: 400 }
    );
  });
});

test('appendDaily creates the Daily from template when it does not exist', async () => {
  await withTempVault(async (vaultRoot) => {
    const dailyPath = join(vaultRoot, 'Daily', '20260817.md');
    const saved = await appendDaily({ date: '2026-08-17', section: '随手记录', content: '- 闪念 #kind/idea', dry_run: false });
    assert.equal(saved.saved, true);
    const markdown = await readFile(dailyPath, 'utf8');
    assert.match(markdown, /note_type: daily-log/);
    assert.match(markdown, /## 随手记录\n- 闪念 #kind\/idea/);
    for (const section of ['今日计划', '输入', '输出', '生活时间线', '学到', '复盘', '明日 / 迁移']) {
      assert.match(markdown, new RegExp(`## ${section}`));
    }
  });
});

test('createDailyMarkdown matches the shared Daily template structure', () => {
  const markdown = createDailyMarkdown('2026-08-17');
  assert.match(markdown, /weekday: 星期一/);
  assert.match(markdown, /week: "2026-W34"/);
  for (const section of ['今日计划', '随手记录', '输入', '输出', '生活时间线', '学到', '复盘', '明日 / 迁移']) {
    assert.match(markdown, new RegExp(`## ${section}`));
  }
});

async function withTempVault(callback) {
  const previousVaultRoot = process.env.DAILYVAULT_ROOT;
  const previousOpenApiRoot = process.env.DAILYVAULT_OPENAPI_ROOT;
  const vaultRoot = await mkdtemp(join(tmpdir(), 'dailyvault-openapi-test-'));
  process.env.DAILYVAULT_ROOT = vaultRoot;
  process.env.DAILYVAULT_OPENAPI_ROOT = join(vaultRoot, '.dailyvault', 'openapi');
  try {
    await callback(vaultRoot);
  } finally {
    if (previousVaultRoot === undefined) delete process.env.DAILYVAULT_ROOT;
    else process.env.DAILYVAULT_ROOT = previousVaultRoot;
    if (previousOpenApiRoot === undefined) delete process.env.DAILYVAULT_OPENAPI_ROOT;
    else process.env.DAILYVAULT_OPENAPI_ROOT = previousOpenApiRoot;
    await rm(vaultRoot, { recursive: true, force: true });
  }
}
