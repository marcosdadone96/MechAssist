/**
 * Reglas compartidas webhook / claim / verify.
 */

const crypto = require('crypto');

const STORE_NAME = 'mechassist-pro';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function emailBlobKey(email) {
  const n = normalizeEmail(email);
  const hex = crypto.createHash('sha256').update(n, 'utf8').digest('hex');
  return `e:${hex}`;
}

/** @returns {Set<string>} */
function parseAllowedVariantsFromEnv() {
  const raw = process.env.LEMON_PRO_VARIANT_IDS || '';
  const set = new Set();
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((id) => set.add(id));
  return set;
}

/**
 * @param {string | number | null | undefined} variantId
 * @returns {boolean} true si la env esta vacia (solo desarrollo) o coincide
 */
function isVariantAllowed(variantId) {
  const allowed = parseAllowedVariantsFromEnv();
  if (allowed.size === 0) return true;
  if (variantId == null || variantId === '') return false;
  return allowed.has(String(variantId));
}

/**
 * @param {{
 *   active?: boolean,
 *   status?: string,
 *   endsAt?: string | null,
 * }} rec
 */
function subscriptionRecordActive(rec) {
  if (!rec || rec.active === false) return false;
  const st = String(rec.status || '').toLowerCase();
  if (st === 'expired' || st === 'unpaid' || st === 'paused' || st === 'refunded') return false;
  const ends = rec.endsAt ? Date.parse(String(rec.endsAt)) : NaN;
  if (Number.isFinite(ends) && Date.now() > ends) return false;
  return true;
}

module.exports = {
  STORE_NAME,
  normalizeEmail,
  emailBlobKey,
  isVariantAllowed,
  subscriptionRecordActive,
};
