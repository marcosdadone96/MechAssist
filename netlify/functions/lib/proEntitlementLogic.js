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

/** Starter / Ilimitado (features.js lemonCheckout) — respaldo si falta env en Netlify. */
const DEFAULT_STARTER_VARIANT_IDS = [
  'acd30d30-72e7-4434-827e-e51487e492ca',
  'bfd83e87-ac81-46ad-a5cf-2c2c94b1d70d',
];
const DEFAULT_UNLIMITED_VARIANT_IDS = [
  'a8ac7a03-694b-43be-89cf-75804a221e30',
  '85d69c29-1149-46cf-b335-5c288a685143',
];

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
function parseStarterVariantsFromEnv() {
  const raw =
    process.env.LEMON_VARIANT_STARTER_IDS || process.env.LEMON_PRO_VARIANT_IDS || '';
  const set = new Set();
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((id) => set.add(id));
  DEFAULT_STARTER_VARIANT_IDS.forEach((id) => set.add(id));
  return set;
}

/** @returns {Set<string>} */
function parseUnlimitedVariantsFromEnv() {
  const raw = process.env.LEMON_VARIANT_UNLIMITED_IDS || '';
  const set = new Set();
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((id) => set.add(id));
  DEFAULT_UNLIMITED_VARIANT_IDS.forEach((id) => set.add(id));
  return set;
}

/**
 * @param {string | number | null | undefined} variantId
 * @returns {'starter'|'unlimited'|'calc_unlock'|null}
 */
function tierFromVariant(variantId) {
  const id = variantId != null ? String(variantId).trim() : '';
  if (!id) return null;
  if (parseUnlimitedVariantsFromEnv().has(id)) return 'unlimited';
  if (parseStarterVariantsFromEnv().has(id)) return 'starter';
  if (isCalcUnlockVariant(id)) return 'calc_unlock';
  return null;
}

/**
 * Lemon webhooks usan variant_id numérico (API); checkout usa UUID. Respaldo por nombre.
 * @param {Record<string, unknown>} attrs
 */
function tierFromSubscriptionAttrs(attrs) {
  const vid = attrs?.variant_id != null ? String(attrs.variant_id).trim() : '';
  const fromVariant = tierFromVariant(vid);
  if (fromVariant) return fromVariant;

  const product = String(attrs?.product_name || '').toLowerCase();
  const variant = String(attrs?.variant_name || '').toLowerCase();
  if (!product && !variant) return null;

  if (
    product.includes('ilimitado') ||
    product.includes('unlimited') ||
    variant.includes('ilimitado') ||
    variant.includes('unlimited')
  ) {
    return 'unlimited';
  }
  if (
    product.includes('themechassist') &&
    (product.includes('pro') || product.includes('starter'))
  ) {
    return 'starter';
  }
  if (product.includes('starter') || variant.includes('starter')) {
    return 'starter';
  }
  return null;
}

/**
 * @param {Record<string, unknown>} attrs
 */
function subscriptionAttrsAllowed(attrs) {
  if (isVariantAllowed(attrs?.variant_id)) return true;
  return tierFromSubscriptionAttrs(attrs) != null;
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
  if (variantId == null || variantId === '') return false;
  const id = String(variantId);
  if (isCalcUnlockVariant(id)) return true;
  if (parseStarterVariantsFromEnv().has(id)) return true;
  if (parseUnlimitedVariantsFromEnv().has(id)) return true;
  const allowed = parseAllowedVariantsFromEnv();
  if (allowed.size === 0) return true;
  return allowed.has(id);
}

/**
 * @param {{
 *   active?: boolean,
 *   status?: string,
 *   endsAt?: string | null,
 * }} rec
 */
function subscriptionRecordActive(rec) {
  if (!rec) return false;
  const st = String(rec.status || '').toLowerCase();
  if (st === 'expired' || st === 'unpaid' || st === 'paused' || st === 'refunded') return false;
  const ends = rec.endsAt ? Date.parse(String(rec.endsAt)) : NaN;
  if (Number.isFinite(ends) && Date.now() > ends) return false;
  if (rec.active === false) {
    const tier =
      tierFromVariant(rec.variantId) ||
      (rec.productName ? tierFromSubscriptionAttrs({ product_name: rec.productName }) : null);
    if (tier === 'starter' || tier === 'unlimited') {
      return st === 'active' || st === 'on_trial' || st === 'past_due' || st === 'cancelled';
    }
    return false;
  }
  return true;
}

module.exports = {
  STORE_NAME,
  normalizeEmail,
  emailBlobKey,
  isVariantAllowed,
  isCalcUnlockVariant,
  tierFromVariant,
  tierFromSubscriptionAttrs,
  subscriptionAttrsAllowed,
  subscriptionRecordActive,
  DEFAULT_STARTER_VARIANT_IDS,
  DEFAULT_UNLIMITED_VARIANT_IDS,
};
