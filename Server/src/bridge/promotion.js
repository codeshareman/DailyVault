/**
 * Nervia / ZNorth 提升候选生成工具。
 * by AI.Coding
 */
import { readSource } from '../vault/source.js';
import { appendAudit } from '../policy/audit.js';

/**
 * 生成跨工程提升候选；默认 dry_run，不直接写 Nervia/ZNorth。
 */
export async function promoteCandidate({ target, source_path, dry_run = true }) {
  if (!['nervia', 'znorth'].includes(target)) {
    throw new Error('target must be nervia or znorth');
  }
  const source = await readSource(source_path);
  const payload = target === 'nervia' ? buildNerviaCandidate(source) : buildZNorthCandidate(source);

  if (!dry_run) {
    await appendAudit({ action: 'promotion.candidate', target, source_path, candidate: payload });
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
      ? `Complete missing Source fields first: ${missingFields.join(', ')}`
      : 'Decide topic/chapter/exercise role, then register once in Nervia sources/manifest.yaml after duplicate checks.'
  };
}

/**
 * 生成 ZNorth 候选负载，强调发布和编辑流程。
 */
function buildZNorthCandidate(source) {
  const missingFields = requiredFields(source.frontmatter, ['title', 'canonical_url', 'public_score', 'public_summary', 'daily_path']);
  return {
    status: missingFields.length ? 'incomplete_candidate' : 'candidate',
    missing_fields: missingFields,
    suggested_fields: {
      znorth_status: missingFields.length ? 'incomplete_candidate' : 'candidate',
      znorth_bridge_id: `dailyvault:${source.frontmatter.source_id || source.path}`,
      znorth_product: '',
      znorth_distribution: ''
    },
    source: {
      title: source.frontmatter.title || '',
      url: source.frontmatter.canonical_url || source.frontmatter.url || '',
      public_score: source.frontmatter.public_score || '',
      summary: source.frontmatter.public_summary || '',
      daily_path: source.frontmatter.daily_path || '',
      dailyvault_source_path: source.path
    },
    next_action: missingFields.length
      ? `Complete missing Source fields first: ${missingFields.join(', ')}`
      : 'Create an editorial brief or automation queue item in ZNorth; do not copy source truth.'
  };
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
