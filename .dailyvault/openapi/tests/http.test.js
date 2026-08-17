import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createDailyVaultHttpServer } from '../src/http/server.js';

test('HTTP exposes health and the OpenAPI contract', async () => {
  await withServer(async (baseUrl) => {
    const health = await fetch(`${baseUrl}/health`);
    assert.deepEqual(await health.json(), { status: 'ok' });

    const contract = await fetch(`${baseUrl}/openapi.yaml`);
    assert.equal(contract.status, 200);
    assert.match(await contract.text(), /openapi: 3\.1\.0/);
  });
});

test('HTTP appends to Daily as a dry-run by default', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/daily/20260817/append`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section: '输入', content: '- dry-run test #kind/article' })
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.dry_run, true);
    assert.match(payload.markdown, /#kind\/article/);
  });
});

test('HTTP append with dry_run=false writes to the temp vault and records audit', async () => {
  await withServer(async (baseUrl, vaultRoot) => {
    const response = await fetch(`${baseUrl}/daily/20260817/append`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section: '输出', content: '- saved #kind/decision', dry_run: false })
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.saved, true);
    const markdown = await readFile(join(vaultRoot, 'Daily', '20260817.md'), 'utf8');
    assert.match(markdown, /## 输出\n- saved #kind\/decision/);

    const auditFiles = await listDir(join(vaultRoot, '.dailyvault', 'openapi', 'logs', 'audit'));
    assert.equal(auditFiles.length, 1);
    assert.match(await readFile(join(vaultRoot, '.dailyvault', 'openapi', 'logs', 'audit', auditFiles[0]), 'utf8'), /daily\.append/);
  });
});

test('HTTP rejects invalid section, dry_run type, malformed JSON, non-object body', async () => {
  await withServer(async (baseUrl) => {
    const badBodies = [
      JSON.stringify({ section: 'unknown', content: '- invalid' }),
      JSON.stringify({ section: '输入', content: '- invalid', dry_run: 'false' }),
      '{',
      '"just a string"'
    ];
    for (const body of badBodies) {
      const response = await fetch(`${baseUrl}/daily/20260817/append`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body
      });
      assert.equal(response.status, 400, `expected 400 for body: ${body}`);
    }
  });
});

test('HTTP returns 413 for oversized JSON body', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/daily/20260817/append`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section: '输入', content: `- ${'x'.repeat(300 * 1024)}` })
    });
    assert.equal(response.status, 413);
  });
});

test('HTTP read: 404 for missing Daily, 400 for invalid date, 404 for non-read paths', async () => {
  await withServer(async (baseUrl) => {
    const missing = await fetch(`${baseUrl}/daily/20260801`);
    assert.equal(missing.status, 404);

    const invalidDate = await fetch(`${baseUrl}/daily/2026-8-1`);
    assert.equal(invalidDate.status, 400);

    const appendViaGet = await fetch(`${baseUrl}/daily/20260817/append`);
    assert.equal(appendViaGet.status, 404);

    const unknown = await fetch(`${baseUrl}/nope`);
    assert.equal(unknown.status, 404);
  });
});

test('HTTP append with invalid date returns 400', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/daily/2026-8-1/append`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section: '输入', content: '- nope' })
    });
    assert.equal(response.status, 400);
  });
});

async function withServer(callback) {
  const previousVaultRoot = process.env.DAILYVAULT_ROOT;
  const previousOpenApiRoot = process.env.DAILYVAULT_OPENAPI_ROOT;
  const vaultRoot = await mkdtemp(join(tmpdir(), 'dailyvault-http-test-'));
  const openApiRoot = join(vaultRoot, '.dailyvault', 'openapi');
  process.env.DAILYVAULT_ROOT = vaultRoot;
  process.env.DAILYVAULT_OPENAPI_ROOT = openApiRoot;

  // 把契约文件复制到临时模块目录，保持 OPENAPI_ROOT 指向完整模块的语义。
  await mkdir(openApiRoot, { recursive: true });
  await copyFile(new URL('../openapi.yaml', import.meta.url), join(openApiRoot, 'openapi.yaml'));

  const server = createDailyVaultHttpServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    await callback(`http://127.0.0.1:${port}`, vaultRoot);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previousVaultRoot === undefined) delete process.env.DAILYVAULT_ROOT;
    else process.env.DAILYVAULT_ROOT = previousVaultRoot;
    if (previousOpenApiRoot === undefined) delete process.env.DAILYVAULT_OPENAPI_ROOT;
    else process.env.DAILYVAULT_OPENAPI_ROOT = previousOpenApiRoot;
    await rm(vaultRoot, { recursive: true, force: true });
  }
}

async function listDir(dirPath) {
  try {
    return await readdir(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}
