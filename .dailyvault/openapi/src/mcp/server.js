/**
 * DailyVault MCP stdio 服务。
 * by AI.Coding
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readDaily, appendDaily } from '../vault/daily.js';
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
      section: z.enum(['今日计划', '随手记录', '输入', '输出', '生活时间线', '学到', '复盘', '明日 / 迁移']),
      content: z.string(),
      dry_run: z.boolean().default(true)
    }
  },
  async (input) => textContent(await appendDaily(input))
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
