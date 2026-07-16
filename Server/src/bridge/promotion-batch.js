/**
 * Local candidate promotion dry-run report.
 * by AI.Coding
 */
import { readFile } from 'node:fs/promises';
import { resolveVaultPath } from '../config/paths.js';
import { atomicWriteFile } from '../vault/atomic-write.js';
import { searchSources } from '../vault/source.js';
import { formatDate } from '../util/dates.js';
import { promoteCandidate } from './promotion.js';

const STATE_PATH = 'Server/state/znorth-promotion-state.json';

/**
 * Scan Source records and report eligible/rejected/changed status without writing ZNorth.
 */
export async function dryRunCandidatePromotions({ target = 'znorth', limit = 50, save_state = false } = {}) {
  if (target !== 'znorth') throw new Error('batch dry-run 首版只支持 target: znorth');
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    const error = new Error('limit 必须是 1 到 200 的整数');
    error.statusCode = 400;
    throw error;
  }
  if (typeof save_state !== 'boolean') {
    const error = new Error('save_state 必须是布尔值');
    error.statusCode = 400;
    throw error;
  }

  const sources = await searchSources({ limit });
  const previousState = await readState();
  const nextState = { ...previousState };
  const items = [];
  const summary = { scanned: 0, eligible: 0, rejected: 0, unchanged: 0, changed: 0 };

  for (const source of sources) {
    summary.scanned += 1;
    const result = await promoteCandidate({ target, source_path: source.path, dry_run: true });
    const item = summarizePromotion(source.path, result.candidate, previousState);
    items.push(item);
    summary[item.result] += 1;
    if (item.result !== 'rejected') summary.eligible += 1;
    if (item.source_ref) {
      nextState[item.source_ref] = {
        source_ref: item.source_ref,
        digest: item.digest,
        last_result: item.result,
        timestamp: new Date().toISOString()
      };
    }
  }

  if (save_state) await writeState(nextState);
  return { target, dry_run: true, save_state, state_path: save_state ? STATE_PATH : '', summary, items };
}

function summarizePromotion(path, candidate, previousState) {
  if (candidate.status !== 'candidate') {
    return {
      path,
      result: 'rejected',
      reasons: candidate.reasons || [],
      missing_fields: candidate.missing_fields || []
    };
  }
  const envelope = candidate.envelope;
  const previous = previousState[envelope.source.ref];
  const result = previous?.digest === envelope.source.digest ? 'unchanged' : 'changed';
  return {
    path,
    result,
    candidate_id: envelope.candidateId,
    source_ref: envelope.source.ref,
    digest: envelope.source.digest,
    risk_level: envelope.risk.level
  };
}

async function readState() {
  try {
    const parsed = JSON.parse(await readFile(resolveVaultPath(STATE_PATH), 'utf8'));
    return parsed.entries || {};
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    error.message = `读取 ZNorth promotion state 失败：${error.message}`;
    throw error;
  }
}

async function writeState(state) {
  await atomicWriteFile(resolveVaultPath(STATE_PATH), `${JSON.stringify({ updated_at: formatDate(), entries: state }, null, 2)}\n`);
}
