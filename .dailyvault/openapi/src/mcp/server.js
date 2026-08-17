/**
 * DailyVault MCP stdio 服务：向 AI 客户端暴露 Daily 的读取与追加能力。
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readDaily, appendDaily, DAILY_SECTIONS } from '../vault/daily.js';
import { textContent } from '../util/response.js';

export const server = new McpServer({ name: 'dailyvault-server', version: '0.1.0' });

server.registerTool(
  'dailyvault.read_daily',
  {
    description: '读取 YYYY/YYYY-MM-DD.md 的 Markdown 内容。',
    inputSchema: { date: z.string().describe('YYYY-MM-DD 或 YYYYMMDD') }
  },
  async (input) => textContent(await readDaily(input.date))
);

server.registerTool(
  'dailyvault.append_daily',
  {
    description: '向 Daily 指定章节追加内容；默认 dry_run 只预览不写入。',
    inputSchema: {
      date: z.string().describe('YYYY-MM-DD 或 YYYYMMDD'),
      section: z.enum(DAILY_SECTIONS),
      content: z.string().min(1),
      dry_run: z.boolean().default(true)
    }
  },
  async (input) => textContent(await appendDaily(input))
);

/**
 * 启动 stdio transport；以 node src/mcp/server.js 运行时生效。
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
