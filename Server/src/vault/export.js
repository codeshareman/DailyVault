/**
 * 公开导出读取工具。
 * by AI.Coding
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { resolveVaultPath, toVaultRelative } from '../config/paths.js';
import { parseFrontmatter } from './frontmatter.js';

/**
 * 只导出 visibility 为 summary 或 public 的 Source 记录。
 */
export async function exportPublicSources({ limit = 50 } = {}) {
  const files = await listMarkdownFiles(resolveVaultPath('Sources'));
  const output = [];
  for (const absolutePath of files) {
    const markdown = await readFile(absolutePath, 'utf8');
    const parsed = parseFrontmatter(markdown);
    if (!['summary', 'public'].includes(parsed.data.visibility)) continue;
    const publicSummary = parsed.data.public_summary || '';
    const bodySummary = publicSummary ? '' : extractPublicSummary(parsed.body);
    output.push({
      path: toVaultRelative(absolutePath),
      title: parsed.data.public_title || parsed.data.title || path.basename(absolutePath, '.md'),
      summary: publicSummary || bodySummary,
      summary_source: publicSummary ? 'public_summary' : 'body_fallback',
      warnings: publicSummary ? [] : ['public_summary missing; summary extracted from body'],
      tags: parsed.data.public_tags || [],
      visibility: parsed.data.visibility,
      source_url: parsed.data.canonical_url || parsed.data.url || '',
      daily_path: parsed.data.daily_path || ''
    });
    if (output.length >= limit) break;
  }
  return output;
}

/**
 * 递归列出 Markdown 文件，跳过 README。
 */
async function listMarkdownFiles(root) {
  const output = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') output.push(absolute);
    }
  }
  await walk(root);
  return output.sort();
}

/**
 * 从正文中提取公开摘要候选。
 */
function extractPublicSummary(body) {
  return body.match(/一句话摘要：([^\n]+)/)?.[1]?.trim() || '';
}
