/**
 * Server 写入审计日志。
 * by AI.Coding
 */
import { appendFile } from 'node:fs/promises';
import { resolveVaultPath, ensureParentDir } from '../config/paths.js';
import { formatCompactDate } from '../util/dates.js';

/**
 * 记录写入或候选提升操作，便于回溯外部访问层改动。
 */
export async function appendAudit(entry) {
  const logPath = resolveVaultPath(`Server/logs/audit/${formatCompactDate()}.jsonl`);
  await ensureParentDir(logPath);
  const line = JSON.stringify({ at: new Date().toISOString(), ...entry });
  await appendFile(logPath, `${line}\n`, 'utf8');
}
