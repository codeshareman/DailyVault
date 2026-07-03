/**
 * DailyVault MCP stdio server。
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
    description: 'Read Daily/YYYYMMDD.md from the DailyVault Markdown source of truth.',
    inputSchema: { date: z.string().describe('YYYY-MM-DD or YYYYMMDD') }
  },
  async (input) => textContent(await readDaily(input.date))
);

server.registerTool(
  'dailyvault.append_daily',
  {
    description: 'Append content to a Daily section. Defaults to dry_run for safety.',
    inputSchema: {
      date: z.string().describe('YYYY-MM-DD or YYYYMMDD'),
      section: z.string().describe('Heading without ##, for example 输入 or 输出'),
      content: z.string(),
      dry_run: z.boolean().default(true)
    }
  },
  async (input) => textContent(await appendDaily(input))
);

server.registerTool(
  'dailyvault.intake_source_url',
  {
    description: 'Read a public URL, extract observable metadata, classify it, and optionally save a Source record.',
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
    description: 'Read a Source Markdown record by vault-relative path.',
    inputSchema: { source_path: z.string() }
  },
  async (input) => textContent(await readSource(input.source_path))
);

server.registerTool(
  'dailyvault.search_sources',
  {
    description: 'Search Source records by text, category, and visibility.',
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
    description: 'Return public/summary-safe source records only.',
    inputSchema: { limit: z.number().int().min(1).max(200).default(50) }
  },
  async (input) => textContent(await exportPublicSources(input))
);

server.registerTool(
  'dailyvault.promote_candidate',
  {
    description: 'Generate a dry-run promotion candidate for Nervia or ZNorth. Does not sync source truth.',
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
  console.error('DailyVault MCP server running on stdio');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('DailyVault MCP fatal error:', error);
    process.exit(1);
  });
}
