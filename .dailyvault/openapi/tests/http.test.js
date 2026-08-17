import test from 'node:test';
import assert from 'node:assert/strict';
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

test('HTTP rejects invalid section, dry_run type, and malformed JSON', async () => {
  await withServer(async (baseUrl) => {
    for (const body of [
      JSON.stringify({ section: 'unknown', content: '- invalid' }),
      JSON.stringify({ section: '输入', content: '- invalid', dry_run: 'false' }),
      '{'
    ]) {
      const response = await fetch(`${baseUrl}/daily/20260817/append`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body
      });
      assert.equal(response.status, 400);
    }
  });
});

async function withServer(callback) {
  const server = createDailyVaultHttpServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
