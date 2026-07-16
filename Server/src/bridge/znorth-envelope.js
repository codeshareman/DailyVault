/**
 * ZNorth Candidate Envelope v1 mapper.
 * by AI.Coding
 */
import { createHash } from 'node:crypto';
import { getVaultRoot } from '../config/paths.js';
import { slugify } from '../util/slug.js';

const SCHEMA_VERSION = 'candidate-envelope.v1';
const ALLOWED_VISIBILITY = new Set(['summary', 'public']);
const ALLOWED_RISK_LEVEL = new Set(['low', 'medium', 'high']);
const SCORE_FIELDS = ['quality_score', 'relevance_score', 'actionability_score', 'memory_score', 'public_score'];
const LEAKAGE_KEYS = ['dailyvault_source_path', 'source_path', 'body', 'markdown', 'raw_body'];

/**
 * Build a ZNorth envelope or a machine-readable rejection result from one Source record.
 */
export function buildZNorthEnvelopeCandidate(source) {
  const frontmatter = source.frontmatter || {};
  const rejection = validateSourceEligibility(frontmatter, source.path);
  if (rejection.reasons.length) return incompleteCandidate(rejection);

  const projection = buildSanitizedProjection(source);
  const leakageReason = findLeakageReason(projection);
  if (leakageReason) return incompleteCandidate({ reasons: [leakageReason], missing_fields: [] });

  return {
    status: 'candidate',
    envelope: projection
  };
}

/**
 * Return fail-closed eligibility problems without reading Source body fallback data.
 */
export function validateSourceEligibility(frontmatter, sourcePath = '') {
  const reasons = [];
  const missingFields = [];

  if (!String(sourcePath || '').startsWith('Sources/')) {
    reasons.push('not_source_path');
  }

  if (frontmatter.note_type !== 'source') {
    reasons.push(`not_source_note_type:${frontmatter.note_type || 'missing'}`);
  }

  if (!hasText(frontmatter.visibility)) {
    addMissing(reasons, missingFields, 'visibility');
  } else if (!ALLOWED_VISIBILITY.has(frontmatter.visibility)) {
    reasons.push(`privacy_not_publishable:${frontmatter.visibility}`);
  }

  if (!Object.hasOwn(frontmatter, 'analysis_allowed')) {
    addMissing(reasons, missingFields, 'analysis_allowed');
  } else if (frontmatter.analysis_allowed !== true) {
    reasons.push('analysis_not_allowed');
  }

  if (!hasText(frontmatter.public_summary)) {
    addMissing(reasons, missingFields, 'public_summary');
  }

  if (!hasText(frontmatter.public_risk_level)) {
    addMissing(reasons, missingFields, 'public_risk_level');
  } else if (!ALLOWED_RISK_LEVEL.has(frontmatter.public_risk_level)) {
    reasons.push(`invalid_public_risk_level:${frontmatter.public_risk_level}`);
  }

  if (!hasText(frontmatter.public_title) && !hasText(frontmatter.title)) {
    addMissing(reasons, missingFields, 'title');
  }

  if (!resolveDate(frontmatter, sourcePath)) {
    addMissing(reasons, missingFields, 'date');
  }

  return { reasons, missing_fields: missingFields };
}

function buildSanitizedProjection(source) {
  const frontmatter = source.frontmatter || {};
  const title = text(frontmatter.public_title) || text(frontmatter.title);
  const readerPromise = text(frontmatter.public_reader_promise) || text(frontmatter.public_summary);
  const projection = {
    schemaVersion: SCHEMA_VERSION,
    candidateId: buildCandidateId(frontmatter, source.path),
    source: {
      system: 'dailyvault',
      ref: buildSourceRef(frontmatter, source.path),
      kind: 'source'
    },
    authorization: {
      analysisAllowed: true,
      privacy: frontmatter.visibility
    },
    summary: {
      title,
      readerPromise,
      digestSummary: text(frontmatter.public_summary)
    },
    signals: buildSignals(frontmatter),
    evidence: {
      status: 'verified',
      role: 'inspiration'
    },
    risk: {
      level: frontmatter.public_risk_level,
      notes: text(frontmatter.public_risk_notes)
    },
    aiRecommendation: buildAiRecommendation(frontmatter)
  };
  projection.source.digest = buildDigest(projection);
  return projection;
}

function buildCandidateId(frontmatter, sourcePath) {
  const date = resolveDate(frontmatter, sourcePath);
  const slug = zNorthSlug(frontmatter.public_title || frontmatter.title || frontmatter.source_id);
  return `cand_${date}_${slug}`;
}

function buildSourceRef(frontmatter, sourcePath) {
  if (hasText(frontmatter.source_id)) return `dv:source:${frontmatter.source_id}`;
  return `dv:source:path:${sha256(sourcePath).slice(0, 12)}`;
}

function buildDigest(envelope) {
  const digestProjection = {
    ...envelope,
    source: {
      system: envelope.source.system,
      ref: envelope.source.ref,
      kind: envelope.source.kind
    }
  };
  return `sha256:${sha256(canonicalJson(digestProjection))}`;
}

function buildSignals(frontmatter) {
  const signals = [];
  for (const tag of list(frontmatter.public_tags)) {
    signals.push({ type: 'tag', value: tag });
  }
  if (hasText(frontmatter.category)) signals.push({ type: 'category', value: frontmatter.category });
  if (hasText(frontmatter.source_type)) signals.push({ type: 'source_type', value: frontmatter.source_type });
  for (const field of SCORE_FIELDS) {
    const value = normalizeScore(frontmatter[field]);
    if (value !== null) signals.push({ type: 'score', name: field, value });
  }
  return signals;
}

function buildAiRecommendation(frontmatter) {
  const highRisk = frontmatter.public_risk_level === 'high';
  const score = normalizeScore(frontmatter.public_score);
  return {
    recommendedAction: highRisk ? 'needs-human-review' : 'triage',
    rationale: highRisk
      ? 'DailyVault public summary candidate marked high risk; requires human editorial review in ZNorth.'
      : 'DailyVault public summary candidate; requires human editorial decision in ZNorth.',
    rank: score
  };
}

function incompleteCandidate(rejection) {
  return {
    status: 'incomplete_candidate',
    reasons: rejection.reasons,
    missing_fields: rejection.missing_fields,
    next_action: rejection.missing_fields.length
      ? `先补齐缺失的 Source 字段：${rejection.missing_fields.join(', ')}`
      : `先处理 ZNorth envelope 拒绝原因：${rejection.reasons.join(', ')}`
  };
}

function addMissing(reasons, missingFields, field) {
  reasons.push(`missing:${field}`);
  missingFields.push(field);
}

function resolveDate(frontmatter, sourcePath) {
  for (const value of [frontmatter.date, frontmatter.captured_at]) {
    const normalized = normalizeDate(value);
    if (normalized) return normalized;
  }
  const match = String(sourcePath || '').match(/(20\d{2})[-_/]?(\d{2})[-_/]?(\d{2})/);
  if (!match) return '';
  return normalizeDate(`${match[1]}-${match[2]}-${match[3]}`);
}

function normalizeDate(value) {
  const textValue = text(value);
  const match = textValue.match(/^(20\d{2})-?(\d{2})-?(\d{2})/);
  if (!match) return '';
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  if (`${date.getUTCFullYear()}${month}${day}` !== `${match[1]}${match[2]}${match[3]}`) return '';
  return `${match[1]}${match[2]}${match[3]}`;
}

function zNorthSlug(value) {
  return slugify(value, 'source')
    .replace(/[^a-z0-9\u4e00-\u9fff_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'source';
}

function findLeakageReason(envelope) {
  const json = JSON.stringify(envelope);
  const root = getVaultRoot();
  if (root && json.includes(root)) return 'leakage:absolute_vault_path';
  if (json.includes('/Users/')) return 'leakage:absolute_user_path';
  if (json.includes('dailyvault_source_path')) return 'leakage:dailyvault_source_path';
  if (json.includes('source_path')) return 'leakage:source_path';
  if (containsForbiddenKey(envelope)) return 'leakage:raw_field';
  return '';
}

function containsForbiddenKey(value) {
  if (Array.isArray(value)) return value.some(containsForbiddenKey);
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, nested]) => LEAKAGE_KEYS.includes(key) || containsForbiddenKey(nested));
}

function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortValue(value[key])]));
}

function normalizeScore(value) {
  if (value === '' || value === undefined || value === null) return null;
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function list(value) {
  if (Array.isArray(value)) return value.filter(hasText).map(text);
  if (!hasText(value)) return [];
  return [text(value)];
}

function hasText(value) {
  return text(value).length > 0;
}

function text(value) {
  return String(value ?? '').trim();
}

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}
