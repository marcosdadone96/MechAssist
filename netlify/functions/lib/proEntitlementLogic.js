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

/** UUID del producto desbloqueo 1 € en Lemon (features.js) — respaldo si falta env. */
const DEFAULT_CALC_UNLOCK_VARIANT_IDS = ['3e5a7c0f-4faf-47fd-aede-0a6488ef5f40'];

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

/** @returns {Set<string>} */
function parseCalcUnlockVariantsFromEnv() {
  const raw = process.env.LEMON_VARIANT_CALC_UNLOCK_IDS || '';
  const set = new Set();
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((id) => set.add(id));
  if (set.size === 0) {
    DEFAULT_CALC_UNLOCK_VARIANT_IDS.forEach((id) => set.add(id));
  }
  return set;
}

/**
 * @param {string | number | null | undefined} variantId
 * @returns {boolean}
 */
function isCalcUnlockVariant(variantId) {
  if (variantId == null || variantId === '') return false;
  return parseCalcUnlockVariantsFromEnv().has(String(variantId));
}

/**
 * @param {string | number | null | undefined} variantId
 * @returns {boolean} true si la env esta vacia (solo desarrollo) o coincide
 */
function isVariantAllowed(variantId) {
  if (isCalcUnlockVariant(variantId)) return true;
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
  isCalcUnlockVariant,
  subscriptionRecordActive,
};
