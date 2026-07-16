/**
 * Nervia / ZNorth 提升候选生成工具。
 * by AI.Coding
 */
import { readSource } from '../vault/source.js';
import { buildZNorthEnvelopeCandidate } from './znorth-envelope.js';
import { appendAudit } from '../policy/audit.js';

/**
 * 生成跨工程提升候选；默认 dry_run，不直接写 Nervia/ZNorth。
 */
export async function promoteCandidate({ target, source_path, dry_run = true }) {
  if (!['nervia', 'znorth'].includes(target)) {
    throw new Error('target 必须是 nervia 或 znorth');
  }
  const source = await readSource(source_path);
  const payload = target === 'nervia' ? buildNerviaCandidate(source) : buildZNorthCandidate(source);

  if (!dry_run) {
    await appendAudit({ action: 'promotion.candidate', target, candidate: auditCandidate(payload) });
  }

  return { target, source_path, dry_run, candidate: payload };
}

/**
 * 生成 Nervia 候选负载，强调 source-backed learning role。
 */
function buildNerviaCandidate(source) {
  const missingFields = requiredFields(source.frontmatter, ['title', 'canonical_url', 'source_type', 'daily_path']);
  return {
    status: missingFields.length ? 'incomplete_candidate' : 'candidate',
    missing_fields: missingFields,
    suggested_fields: {
      nervia_status: missingFields.length ? 'incomplete_candidate' : 'candidate',
      nervia_source_id: source.frontmatter.source_id || '',
      nervia_topic: '',
      nervia_role: suggestNerviaRole(source.frontmatter.source_type)
    },
    source: {
      title: source.frontmatter.title || '',
      url: source.frontmatter.canonical_url || source.frontmatter.url || '',
      type: source.frontmatter.source_type || '',
      quality_score: source.frontmatter.quality_score || '',
      daily_path: source.frontmatter.daily_path || '',
      dailyvault_source_path: source.path
    },
    next_action: missingFields.length
      ? `先补齐缺失的 Source 字段：${missingFields.join(', ')}`
      : '先决定主题、章节或练习角色；完成重复检查后，再登记到 Nervia sources/manifest.yaml。'
  };
}

/**
 * 生成 ZNorth 候选负载，强调发布和编辑流程。
 */
function buildZNorthCandidate(source) {
  return buildZNorthEnvelopeCandidate(source);
}

function auditCandidate(candidate) {
  if (candidate?.status === 'candidate') return { status: candidate.status, envelope: candidate.envelope };
  return candidate;
}


/**
 * 检查候选提升所需的最小 Source 字段，避免空字段伪装成可用候选。
 */
function requiredFields(frontmatter, keys) {
  return keys.filter((key) => !frontmatter[key]);
}
/**
 * 根据 Source 类型给出 Nervia 角色初始建议。
 */
function suggestNerviaRole(sourceType) {
  if (['docs', 'course', 'paper', 'book'].includes(sourceType)) return 'source';
  if (sourceType === 'repo') return 'experiment';
  return 'reference';
}
