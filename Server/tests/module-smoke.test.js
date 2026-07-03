/**
 * DailyVault Server 模块加载与 HTTP dry-run 测试。
 * by AI.Coding
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyVaultHttpServer } from '../src/http/server.js';
import { fetchUrlMetadata } from '../src/ingest/fetch-url.js';

test('server modules import without side effects', async () => {
  await import('../src/mcp/server.js');
  await import('../src/vault/export.js');
  await import('../src/bridge/promotion.js');
  assert.ok(true);
});

test('HTTP daily append defaults to dry-run', async () => {
  const server = createDailyVaultHttpServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/daily/20260702/append`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section: '输入', content: '- dry-run test' })
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.dry_run, true);
    assert.equal(payload.saved, undefined);
    assert.match(payload.markdown, /- dry-run test/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('HTTP rejects oversized JSON bodies', async () => {
  const server = createDailyVaultHttpServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/daily/20260702/append`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section: '输入', content: 'x'.repeat(300 * 1024) })
    });
    const payload = await response.json();
    assert.equal(response.status, 413);
    assert.match(payload.error, /JSON body too large/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('HTTP reports invalid source URL as client error', async () => {
  const server = createDailyVaultHttpServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/sources/intake-url`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'not a url' })
    });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.match(payload.error, /Invalid URL/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('HTTP reports malformed JSON as client error', async () => {
  const server = createDailyVaultHttpServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/daily/20260702/append`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{'
    });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.match(payload.error, /Invalid JSON body/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('fetchUrlMetadata classifies response body read failures as upstream errors', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(new ReadableStream({
    start(controller) {
      controller.error(new Error('stream broke'));
    }
  }), { status: 200, headers: { 'content-type': 'text/plain' } });
  try {
    await assert.rejects(
      () => fetchUrlMetadata('https://example.com/broken'),
      (error) => error.statusCode === 502 && /Fetch body read failed/.test(error.message)
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
