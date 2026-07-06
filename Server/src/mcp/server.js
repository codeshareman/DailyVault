/**
 * DailyVault MCP stdio 服务。
 * by AI.Coding
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readDaily, appendDaily } from '../vault/daily.js';
import { intakeSourceUrl, readSource, searchSources } from '../vault/source.js';
import { exportPublicSources } from '../vault/export.js';
import { promoteCandidate } from '../bridge/promotion.js';
import { textContent } from '../util/response.js';

export const server = new McpServer({ name: 'dailyvault-server', version: '0.1.0' });

server.registerTool(
  'dailyvault.read_daily',
  {
    description: '从 DailyVault Markdown 事实来源读取 Daily/YYYYMMDD.md。',
    inputSchema: { date: z.string().describe('YYYY-MM-DD 或 YYYYMMDD') }
  },
  async (input) => textContent(await readDaily(input.date))
);

server.registerTool(
  'dailyvault.append_daily',
  {
    description: '向 Daily 指定章节追加内容。为安全起见默认 dry_run。',
    inputSchema: {
      date: z.string().describe('YYYY-MM-DD 或 YYYYMMDD'),
      section: z.string().describe('不带 ## 的标题，例如 输入 或 输出'),
      content: z.string(),
      dry_run: z.boolean().default(true)
    }
  },
  async (input) => textContent(await appendDaily(input))
);

server.registerTool(
  'dailyvault.intake_source_url',
  {
    description: '读取公开 URL，提取可观察元数据，分类，并可选择保存 Source 记录。',
    inputSchema: {
      url: z.string().url(),
      daily_date: z.string().optional(),
      save: z.boolean().default(false),
      reason: z.string().default(''),
      next_action: z.string().default(''),
      append_daily: z.boolean().default(true)
    }
  },
  async (input) => textContent(await intakeSourceUrl(input))
);

server.registerTool(
  'dailyvault.read_source',
  {
    description: '按 Vault 相对路径读取 Source Markdown 记录。',
    inputSchema: { source_path: z.string() }
  },
  async (input) => textContent(await readSource(input.source_path))
);

server.registerTool(
  'dailyvault.search_sources',
  {
    description: '按文本、分类和可见性搜索 Source 记录。',
    inputSchema: {
      query: z.string().default(''),
      category: z.string().default(''),
      visibility: z.string().default(''),
      limit: z.number().int().min(1).max(100).default(20)
    }
  },
  async (input) => textContent(await searchSources(input))
);

server.registerTool(
  'dailyvault.export_public',
  {
    description: '只返回公开或摘要级安全的 Source 记录。',
    inputSchema: { limit: z.number().int().min(1).max(200).default(50) }
  },
  async (input) => textContent(await exportPublicSources(input))
);

server.registerTool(
  'dailyvault.promote_candidate',
  {
    description: '为 Nervia 或 ZNorth 生成 dry-run 提升候选。不会同步事实来源。',
    inputSchema: {
      target: z.enum(['nervia', 'znorth']),
      source_path: z.string(),
      dry_run: z.boolean().default(true)
    }
  },
  async (input) => textContent(await promoteCandidate(input))
);

/**
 * 启动 stdio MCP transport。
 */
export async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DailyVault MCP 服务已通过 stdio 运行');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('DailyVault MCP 致命错误：', error);
    process.exit(1);
  });
}
