/**
 * DailyVault ZNorth promotion contract tests.
 * by AI.Coding
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dryRunCandidatePromotions } from '../src/bridge/promotion-batch.js';
import { tmpdir } from 'node:os';
import { promoteCandidate } from '../src/bridge/promotion.js';
import { createDailyVaultHttpServer } from '../src/http/server.js';

const BODY_SENTINEL = 'SHOULD_NOT_LEAK_FROM_SOURCE_BODY';

test('ZNorth promotion 生成 candidate-envelope.v1', async () => {
  await withTempVault(async (vaultRoot) => {
    const sourcePath = await writeSource(vaultRoot, 'valid.md', validSourceMarkdown());

    const result = await promoteCandidate({ target: 'znorth', source_path: sourcePath });
    const envelope = result.candidate.envelope;

    assert.equal(result.candidate.status, 'candidate');
    assert.equal(envelope.schemaVersion, 'candidate-envelope.v1');
    assert.match(envelope.candidateId, /^cand_20260716_example-public-title$/);
    assert.equal(envelope.source.system, 'dailyvault');
    assert.equal(envelope.source.kind, 'source');
    assert.equal(envelope.source.ref, 'dv:source:dv_src_20260716_example');
    assert.match(envelope.source.digest, /^sha256:[a-f0-9]{64}$/);
    assert.equal(envelope.authorization.analysisAllowed, true);
    assert.equal(envelope.authorization.privacy, 'summary');
    assert.equal(envelope.summary.title, 'Example Public Title');
    assert.equal(envelope.summary.readerPromise, 'This source helps readers understand a concrete example.');
    assert.equal(envelope.summary.digestSummary, 'Safe public summary for ZNorth readers.');
    assert.deepEqual(envelope.risk, { level: 'low', notes: '' });
    assert.equal(envelope.evidence.role, 'inspiration');
    assert.equal(envelope.aiRecommendation.recommendedAction, 'triage');
    assert.deepEqual(envelope.signals, [
      { type: 'tag', value: 'public/candidate' },
      { type: 'tag', value: 'domain/example' },
      { type: 'category', value: 'reading' },
      { type: 'source_type', value: 'article' },
      { type: 'score', name: 'public_score', value: 4 }
    ]);
    assert.equal(Object.hasOwn(envelope, 'status'), false);
    assert.equal(Object.hasOwn(envelope, 'humanDecision'), false);
    assert.equal(Object.hasOwn(envelope, 'accepted'), false);
    assert.equal(Object.hasOwn(envelope, 'published'), false);
    assertNoLeakage(result, [BODY_SENTINEL, '/Users/', 'dailyvault_source_path', 'suggested_fields']);
  });
});

test('ZNorth promotion 不使用正文摘要兜底', async () => {
  await withTempVault(async (vaultRoot) => {
    const sourcePath = await writeSource(vaultRoot, 'missing-summary.md', validSourceMarkdown({ public_summary: '' }));

    const result = await promoteCandidate({ target: 'znorth', source_path: sourcePath });

    assert.equal(result.candidate.status, 'incomplete_candidate');
    assert.deepEqual(result.candidate.missing_fields, ['public_summary']);
    assert.deepEqual(result.candidate.reasons, ['missing:public_summary']);
    assertNoLeakage(result, [BODY_SENTINEL]);
  });
});

test('ZNorth promotion 拒绝非 Sources 路径', async () => {
  await withTempVault(async (vaultRoot) => {
    await mkdir(join(vaultRoot, 'Notes'), { recursive: true });
    await writeFile(join(vaultRoot, 'Notes', 'public-note.md'), validSourceMarkdown({ note_type: 'note' }), 'utf8');

    const result = await promoteCandidate({ target: 'znorth', source_path: 'Notes/public-note.md' });

    assert.equal(result.candidate.status, 'incomplete_candidate');
    assert.deepEqual(result.candidate.reasons, ['not_source_path', 'not_source_note_type:note']);
    assert.equal(result.candidate.envelope, undefined);
  });
});

test('ZNorth promotion 缺少授权或风险时失败关闭', async () => {
  await withTempVault(async (vaultRoot) => {
    const noAnalysisPath = await writeSource(vaultRoot, 'no-analysis.md', validSourceMarkdown({ analysis_allowed: '' }));
    const noRiskPath = await writeSource(vaultRoot, 'no-risk.md', validSourceMarkdown({ public_risk_level: '' }));
    const invalidRiskPath = await writeSource(vaultRoot, 'bad-risk.md', validSourceMarkdown({ public_risk_level: 'unknown' }));

    const noAnalysis = await promoteCandidate({ target: 'znorth', source_path: noAnalysisPath });
    const noRisk = await promoteCandidate({ target: 'znorth', source_path: noRiskPath });
    const invalidRisk = await promoteCandidate({ target: 'znorth', source_path: invalidRiskPath });

    assert.deepEqual(noAnalysis.candidate.reasons, ['missing:analysis_allowed']);
    assert.deepEqual(noAnalysis.candidate.missing_fields, ['analysis_allowed']);
    assert.deepEqual(noRisk.candidate.reasons, ['missing:public_risk_level']);
    assert.deepEqual(noRisk.candidate.missing_fields, ['public_risk_level']);
    assert.deepEqual(invalidRisk.candidate.reasons, ['invalid_public_risk_level:unknown']);
    assert.equal(noRisk.candidate.envelope, undefined);
  });
});

test('ZNorth candidateId、source.ref 与 digest 对公开投影稳定', async () => {
  await withTempVault(async (vaultRoot) => {
    const firstPath = await writeSource(vaultRoot, 'stable.md', validSourceMarkdown({ body_extra: 'private body v1' }));
    const first = await promoteCandidate({ target: 'znorth', source_path: firstPath });
    const secondPath = await writeSource(vaultRoot, 'stable.md', validSourceMarkdown({ body_extra: 'private body v2' }));
    const second = await promoteCandidate({ target: 'znorth', source_path: secondPath });
    const changedPath = await writeSource(vaultRoot, 'stable.md', validSourceMarkdown({ public_summary: 'Changed public projection.' }));
    const changed = await promoteCandidate({ target: 'znorth', source_path: changedPath });

    assert.equal(first.candidate.envelope.candidateId, second.candidate.envelope.candidateId);
    assert.equal(first.candidate.envelope.source.ref, second.candidate.envelope.source.ref);
    assert.equal(first.candidate.envelope.source.digest, second.candidate.envelope.source.digest);
    assert.notEqual(first.candidate.envelope.source.digest, changed.candidate.envelope.source.digest);
  });
});

test('ZNorth promotion 拒绝公开投影中的绝对路径泄漏', async () => {
  await withTempVault(async (vaultRoot) => {
    const sourcePath = await writeSource(vaultRoot, 'leaky.md', validSourceMarkdown({ public_summary: 'Leaky /Users/example/private path.' }));

    const result = await promoteCandidate({ target: 'znorth', source_path: sourcePath });

    assert.equal(result.candidate.status, 'incomplete_candidate');
    assert.deepEqual(result.candidate.reasons, ['leakage:absolute_user_path']);
    assert.equal(result.candidate.envelope, undefined);
  });
});

test('ZNorth promotion audit 不记录 source_path 或 Source body', async () => {
  await withTempVault(async (vaultRoot) => {
    const sourcePath = await writeSource(vaultRoot, 'audit.md', validSourceMarkdown());

    await promoteCandidate({ target: 'znorth', source_path: sourcePath, dry_run: false });

    const audit = await readFile(join(vaultRoot, 'Server', 'logs', 'audit', auditDateFile()), 'utf8');
    assertNoLeakage(audit, [sourcePath, BODY_SENTINEL, 'source_path', 'body']);
    assert.match(audit, /candidate-envelope\.v1/);
  });
});

test('HTTP ZNorth promotion 返回同一 envelope 结构', async () => {
  await withTempVault(async (vaultRoot) => {
    const sourcePath = await writeSource(vaultRoot, 'http.md', validSourceMarkdown());
    const direct = await promoteCandidate({ target: 'znorth', source_path: sourcePath });
    const server = createDailyVaultHttpServer();
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    try {
      const response = await fetch(`http://127.0.0.1:${port}/promotions/candidate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ target: 'znorth', source_path: sourcePath })
      });
      const payload = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(payload.candidate.envelope, direct.candidate.envelope);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

test('Nervia target 保持原有 candidate 结构', async () => {
  await withTempVault(async (vaultRoot) => {
    const sourcePath = await writeSource(vaultRoot, 'nervia.md', validSourceMarkdown({ source_type: 'repo', daily_path: 'Daily/20260716.md' }));

    const result = await promoteCandidate({ target: 'nervia', source_path: sourcePath });

    assert.equal(result.candidate.status, 'candidate');
    assert.equal(result.candidate.suggested_fields.nervia_role, 'experiment');
    assert.equal(result.candidate.source.dailyvault_source_path, sourcePath);
  });
});

test('本地 ZNorth dry-run report 统计 changed、rejected、unchanged 并保存最小 state', async () => {
  await withTempVault(async (vaultRoot) => {
    await writeSource(vaultRoot, 'eligible.md', validSourceMarkdown());
    await writeSource(vaultRoot, 'rejected.md', validSourceMarkdown({ visibility: 'private' }));

    const first = await dryRunCandidatePromotions({ limit: 10, save_state: true });
    const second = await dryRunCandidatePromotions({ limit: 10 });
    const state = JSON.parse(await readFile(join(vaultRoot, 'Server', 'state', 'znorth-promotion-state.json'), 'utf8'));

    assert.deepEqual(first.summary, { scanned: 2, eligible: 1, rejected: 1, unchanged: 0, changed: 1 });
    assert.deepEqual(second.summary, { scanned: 2, eligible: 1, rejected: 1, unchanged: 1, changed: 0 });
    assert.equal(Object.keys(state.entries).length, 1);
    assert.deepEqual(Object.keys(state.entries[Object.keys(state.entries)[0]]).sort(), ['digest', 'last_result', 'source_ref', 'timestamp']);
    assertNoLeakage(first, [BODY_SENTINEL, '/Users/', 'raw_body', 'markdown']);
  });
});

test('HTTP ZNorth dry-run report 不写 ZNorth 且返回 report', async () => {
  await withTempVault(async (vaultRoot) => {
    await writeSource(vaultRoot, 'http-dry-run.md', validSourceMarkdown());
    const server = createDailyVaultHttpServer();
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    try {
      const response = await fetch(`http://127.0.0.1:${port}/promotions/candidate/dry-run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ target: 'znorth', limit: 10 })
      });
      const payload = await response.json();

      assert.equal(response.status, 200);
      assert.equal(payload.dry_run, true);
      assert.equal(payload.summary.scanned, 1);
      assert.equal(payload.summary.changed, 1);
      assert.equal(payload.items[0].source_ref, 'dv:source:dv_src_20260716_example');
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

test('HTTP ZNorth dry-run 拒绝字符串 save_state', async () => {
  await withTempVault(async (vaultRoot) => {
    await writeSource(vaultRoot, 'http-dry-run-type.md', validSourceMarkdown());
    const server = createDailyVaultHttpServer();
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    try {
      const response = await fetch(`http://127.0.0.1:${port}/promotions/candidate/dry-run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ target: 'znorth', limit: 10, save_state: 'false' })
      });
      const payload = await response.json();

      assert.equal(response.status, 400);
      assert.match(payload.error, /save_state/);
      await assert.rejects(
        readFile(join(vaultRoot, 'Server', 'state', 'znorth-promotion-state.json'), 'utf8'),
        { code: 'ENOENT' }
      );
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

async function withTempVault(callback) {
  const previousRoot = process.env.DAILYVAULT_ROOT;
  const vaultRoot = await mkdtemp(join(tmpdir(), 'dailyvault-promotion-test-'));
  process.env.DAILYVAULT_ROOT = vaultRoot;
  try {
    await callback(vaultRoot);
  } finally {
    if (previousRoot === undefined) delete process.env.DAILYVAULT_ROOT;
    else process.env.DAILYVAULT_ROOT = previousRoot;
    await rm(vaultRoot, { recursive: true, force: true });
  }
}

async function writeSource(vaultRoot, filename, markdown) {
  const sourcePath = `Sources/reading/${filename}`;
  await mkdir(join(vaultRoot, 'Sources', 'reading'), { recursive: true });
  await writeFile(join(vaultRoot, sourcePath), markdown, 'utf8');
  return sourcePath;
}

function validSourceMarkdown(overrides = {}) {
  const fields = {
    source_id: 'dv_src_20260716_example',
    date: '2026-07-16',
    note_type: 'source',
    source_type: 'article',
    category: 'reading',
    title: 'Example Source',
    public_title: 'Example Public Title',
    visibility: 'summary',
    analysis_allowed: true,
    public_summary: 'Safe public summary for ZNorth readers.',
    public_reader_promise: 'This source helps readers understand a concrete example.',
    public_risk_level: 'low',
    public_tags: '[public/candidate, domain/example]',
    public_score: 4,
    canonical_url: 'https://example.com/source',
    ...overrides
  };
  const bodyExtra = fields.body_extra || '';
  delete fields.body_extra;
  const frontmatter = Object.entries(fields)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  return `---\n${frontmatter}\n---\n\n# ${fields.title}\n\n${BODY_SENTINEL}\n一句话摘要：${BODY_SENTINEL}\n${bodyExtra}\n`;
}

function auditDateFile() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.jsonl`;
}

function assertNoLeakage(value, sentinels) {
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  for (const sentinel of sentinels) {
    assert.equal(json.includes(sentinel), false, `leaked ${sentinel}`);
  }
}
