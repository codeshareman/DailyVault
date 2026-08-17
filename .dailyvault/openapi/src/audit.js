/**
 * 写入审计：把外部访问层对 Daily 的写操作记录为 JSONL，便于回溯。
 */
import { appendFile } from 'node:fs/promises';
import { resolveOpenApiPath, ensureParentDir } from './config/paths.js';
import { formatCompactDate } from './util/dates.js';

/**
 * 追加一条审计记录，按天分文件存放在 logs/audit/YYYYMMDD.jsonl。
 */
export async function appendAudit(entry) {
  const logPath = resolveOpenApiPath(`logs/audit/${formatCompactDate()}.jsonl`);
  await ensureParentDir(logPath);
  const line = JSON.stringify({ at: new Date().toISOString(), ...entry });
  await appendFile(logPath, `${line}\n`, 'utf8');
}
