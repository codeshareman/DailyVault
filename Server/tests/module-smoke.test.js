/**
 * DailyVault 服务模块加载与 HTTP dry-run 测试。
 * by AI.Coding
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyVaultHttpServer } from '../src/http/server.js';
import { fetchUrlMetadata } from '../src/ingest/fetch-url.js';

test('服务模块导入没有副作用', async () => {
  await import('../src/mcp/server.js');
  await import('../src/vault/export.js');
  await import('../src/bridge/promotion.js');
  assert.ok(true);
});

test('HTTP Daily 追加默认 dry-run', async () => {
  const server = createDailyVaultHttpServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/daily/20260702/append`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section: '输入', content: '- dry-run 测试' })
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.dry_run, true);
    assert.equal(payload.saved, undefined);
    assert.match(payload.markdown, /- dry-run 测试/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('HTTP 拒绝过大的 JSON 请求体', async () => {
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
    assert.match(payload.error, /JSON 请求体过大/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('HTTP 将无效 Source URL 报告为客户端错误', async () => {
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
    assert.match(payload.error, /URL 无效/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('HTTP 将格式错误的 JSON 报告为客户端错误', async () => {
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
    assert.match(payload.error, /JSON 请求体无效/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('fetchUrlMetadata 将响应正文读取失败归类为上游错误', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(new ReadableStream({
    start(controller) {
      controller.error(new Error('流中断'));
    }
  }), { status: 200, headers: { 'content-type': 'text/plain' } });
  try {
    await assert.rejects(
      () => fetchUrlMetadata('https://example.com/broken'),
      (error) => error.statusCode === 502 && /抓取正文读取失败/.test(error.message)
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
