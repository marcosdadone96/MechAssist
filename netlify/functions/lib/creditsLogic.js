/**
 * Ledger de créditos por usuario (Netlify Blobs, store mechassist-pro).
 * Saldo único compartido (lab, máquinas e hidráulica).
 */
const crypto = require('crypto');
const { normalizeEmail, emailBlobKey } = require('./proEntitlementLogic.js');

const WELCOME_TOTAL =
  Number(process.env.CREDITS_WELCOME_TOTAL) ||
  (Number(process.env.CREDITS_WELCOME_PER_POOL) > 0
    ? Number(process.env.CREDITS_WELCOME_PER_POOL) * 3
    : 1000);
const COST_CALC = Number(process.env.CREDITS_COST_CALC) || 10;
const COST_PDF = Number(process.env.CREDITS_COST_PDF) || 10;
const STARTER_PDF_LIMIT = Number(process.env.CREDITS_STARTER_PDF_LIMIT) || 30;
const UNLOCK_DAYS = Number(process.env.CREDITS_CALC_UNLOCK_DAYS) || 31;

/** @deprecated alias */
const WELCOME_PER_POOL = WELCOME_TOTAL;

function creditsKey(email) {
  return `credits:${emailBlobKey(normalizeEmail(email))}`;
}

function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Migra registros antiguos (lab + machines + fluids) al saldo único.
 * @param {Record<string, unknown>} r
 */
function resolveCreditsAmount(r) {
  if (r && typeof r.credits === 'number' && Number.isFinite(r.credits)) {
    return clampInt(r.credits, 0, 1_000_000);
  }
  const legacy =
    clampInt(r?.lab, 0, 1_000_000) +
    clampInt(r?.machines, 0, 1_000_000) +
    clampInt(r?.fluids, 0, 1_000_000);
  return legacy;
}

/** @returns {import('./creditsLogic.js').CreditsRecord} */
function defaultRecord() {
  return {
    credits: WELCOME_TOTAL,
    welcomeGranted: true,
    subscription: null,
    subscriptionEndsAt: null,
    pdfMonthKey: monthKey(),
    pdfCountMonth: 0,
    calcUnlocks: {},
    idempotency: {},
  };
}

/**
 * @param {unknown} raw
 * @returns {import('./creditsLogic.js').CreditsRecord}
 */
function normalizeRecord(raw) {
  const base = defaultRecord();
  if (!raw || typeof raw !== 'object') return base;
  const r = /** @type {Record<string, unknown>} */ (raw);
  const migrated = resolveCreditsAmount(r);
  const welcomeGranted = Boolean(r.welcomeGranted);
  return {
    credits: welcomeGranted || migrated > 0 ? migrated : 0,
    welcomeGranted,
    subscription:
      r.subscription === 'starter' || r.subscription === 'unlimited' ? r.subscription : null,
    subscriptionEndsAt: r.subscriptionEndsAt ? String(r.subscriptionEndsAt) : null,
    pdfMonthKey: String(r.pdfMonthKey || monthKey()),
    pdfCountMonth: clampInt(r.pdfCountMonth, 0, 100_000),
    calcUnlocks:
      r.calcUnlocks && typeof r.calcUnlocks === 'object'
        ? /** @type {Record<string, string>} */ (r.calcUnlocks)
        : {},
    idempotency:
      r.idempotency && typeof r.idempotency === 'object'
        ? /** @type {Record<string, number>} */ (r.idempotency)
        : {},
  };
}

function clampInt(v, min, max) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function subscriptionActive(rec) {
  if (!rec?.subscription) return false;
  const ends = rec.subscriptionEndsAt ? Date.parse(rec.subscriptionEndsAt) : NaN;
  if (Number.isFinite(ends) && Date.now() > ends) return false;
  return rec.subscription === 'starter' || rec.subscription === 'unlimited';
}

function calcUnlockActive(rec, calcSlug) {
  const until = rec.calcUnlocks?.[calcSlug];
  if (!until) return false;
  const t = Date.parse(until);
  return Number.isFinite(t) && Date.now() < t;
}

/**
 * @param {import('./creditsLogic.js').CreditsRecord} rec
 * @returns {Record<string, string>}
 */
function activeCalcUnlocks(rec) {
  /** @type {Record<string, string>} */
  const out = {};
  const now = Date.now();
  for (const [slug, until] of Object.entries(rec.calcUnlocks || {})) {
    const t = Date.parse(until);
    if (Number.isFinite(t) && now < t) out[slug] = String(until);
  }
  return out;
}

function resetPdfMonthIfNeeded(rec) {
  const mk = monthKey();
  if (rec.pdfMonthKey !== mk) {
    rec.pdfMonthKey = mk;
    rec.pdfCountMonth = 0;
  }
}

function trimIdempotency(rec) {
  const keys = Object.keys(rec.idempotency || {});
  if (keys.length <= 400) return;
  const sorted = keys.sort((a, b) => (rec.idempotency[b] || 0) - (rec.idempotency[a] || 0));
  const keep = new Set(sorted.slice(0, 300));
  /** @type {Record<string, number>} */
  const next = {};
  for (const k of keep) next[k] = rec.idempotency[k];
  rec.idempotency = next;
}

/**
 * @param {import('@netlify/blobs').Store} store
 * @param {string} email
 */
async function loadRecord(store, email) {
  const key = creditsKey(email);
  let raw = null;
  try {
    raw = await store.get(key, { type: 'json' });
  } catch (_) {
    raw = null;
  }
  const rec = normalizeRecord(raw);
  resetPdfMonthIfNeeded(rec);
  return { key, rec };
}

/**
 * @param {import('@netlify/blobs').Store} store
 * @param {string} key
 * @param {import('./creditsLogic.js').CreditsRecord} rec
 */
async function saveRecord(store, key, rec) {
  trimIdempotency(rec);
  await store.setJSON(key, rec);
}

/**
 * @param {import('./creditsLogic.js').CreditsRecord} rec
 */
function publicBalance(rec) {
  const credits = rec.credits;
  return {
    credits,
    subscription: rec.subscription,
    subscriptionEndsAt: rec.subscriptionEndsAt,
    pdfCountMonth: rec.pdfCountMonth,
    pdfMonthKey: rec.pdfMonthKey,
    costs: { calcSession: COST_CALC, pdf: COST_PDF },
    limits: { starterPdfPerMonth: STARTER_PDF_LIMIT },
  };
}

/**
 * @param {import('@netlify/blobs').Store} store
 * @param {string} email
 * @param {{ grantWelcome?: boolean }} [opts]
 */
async function ensureWelcomeCredits(store, email, opts = {}) {
  const { key, rec } = await loadRecord(store, email);
  if (rec.welcomeGranted && !opts.grantWelcome) {
    return { rec, created: false };
  }
  if (!rec.welcomeGranted || opts.grantWelcome) {
    rec.credits = WELCOME_TOTAL;
    rec.welcomeGranted = true;
    await saveRecord(store, key, rec);
    return { rec, created: true };
  }
  await saveRecord(store, key, rec);
  return { rec, created: false };
}

/**
 * @param {import('./creditsLogic.js').CreditsRecord} rec
 * @param {string} _pool
 * @param {string} [calcSlug]
 */
function hasUnlimitedAccess(rec, _pool, calcSlug) {
  if (subscriptionActive(rec) && rec.subscription === 'unlimited') return true;
  if (calcSlug && calcUnlockActive(rec, calcSlug)) return true;
  return false;
}

/**
 * @param {import('@netlify/blobs').Store} store
 * @param {string} email
 * @param {{
 *   pool?: string,
 *   amount: number,
 *   reason: string,
 *   idempotencyKey: string,
 *   calcSlug?: string,
 * }} req
 */
async function consumeCredits(store, email, req) {
  const amount = clampInt(req.amount, 1, 1000);
  const idem = String(req.idempotencyKey || '').trim().slice(0, 120);
  const calcSlug = String(req.calcSlug || '').trim().slice(0, 80);
  const reason = String(req.reason || 'use').slice(0, 40);

  if (!idem) {
    return { ok: false, error: 'idempotency_required' };
  }

  const { key, rec } = await loadRecord(store, email);

  if (rec.idempotency[idem]) {
    return { ok: true, duplicate: true, balance: publicBalance(rec), charged: 0 };
  }

  if (hasUnlimitedAccess(rec, req.pool, calcSlug)) {
    rec.idempotency[idem] = Date.now();
    await saveRecord(store, key, rec);
    return { ok: true, unlimited: true, balance: publicBalance(rec), charged: 0 };
  }

  if (reason === 'pdf') {
    if (rec.subscription === 'starter' && subscriptionActive(rec)) {
      resetPdfMonthIfNeeded(rec);
      if (rec.pdfCountMonth >= STARTER_PDF_LIMIT && rec.credits < amount) {
        return { ok: false, error: 'insufficient_credits', balance: publicBalance(rec) };
      }
    }
  }

  if (rec.credits < amount) {
    return { ok: false, error: 'insufficient_credits', balance: publicBalance(rec) };
  }

  rec.credits -= amount;
  rec.idempotency[idem] = Date.now();

  if (reason === 'pdf') {
    resetPdfMonthIfNeeded(rec);
    rec.pdfCountMonth += 1;
  }

  await saveRecord(store, key, rec);
  return { ok: true, balance: publicBalance(rec), charged: amount };
}

/**
 * @param {string | number | null | undefined} variantId
 * @returns {'starter'|'unlimited'|'calc_unlock'|null}
 */
function tierFromVariant(variantId) {
  const id = variantId != null ? String(variantId).trim() : '';
  if (!id) return null;
  const unlimited = (process.env.LEMON_VARIANT_UNLIMITED_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const starter = (process.env.LEMON_VARIANT_STARTER_IDS || process.env.LEMON_PRO_VARIANT_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const unlock = (process.env.LEMON_VARIANT_CALC_UNLOCK_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (unlimited.includes(id)) return 'unlimited';
  if (starter.includes(id)) return 'starter';
  if (unlock.includes(id)) return 'calc_unlock';
  return null;
}

/**
 * @param {import('@netlify/blobs').Store} store
 * @param {string} email
 * @param {{ tier: 'starter'|'unlimited', endsAt?: string | null }} sub
 */
async function applySubscription(store, email, sub) {
  const { key, rec } = await loadRecord(store, email);
  rec.subscription = sub.tier;
  rec.subscriptionEndsAt = sub.endsAt || null;
  await saveRecord(store, key, rec);
  return rec;
}

/**
 * @param {import('@netlify/blobs').Store} store
 * @param {string} email
 * @param {string} calcSlug
 */
async function applyCalcUnlock(store, email, calcSlug) {
  const slug = String(calcSlug || '').trim().slice(0, 80);
  if (!slug) return null;
  const { key, rec } = await loadRecord(store, email);
  const until = new Date();
  until.setUTCDate(until.getUTCDate() + UNLOCK_DAYS);
  rec.calcUnlocks[slug] = until.toISOString();
  await saveRecord(store, key, rec);
  return rec;
}

/**
 * @param {unknown} customData
 */
function calcSlugFromCustomData(customData) {
  if (!customData) return '';
  let obj = customData;
  if (typeof customData === 'string') {
    try {
      obj = JSON.parse(customData);
    } catch (_) {
      return '';
    }
  }
  if (!obj || typeof obj !== 'object') return '';
  const o = /** @type {Record<string, unknown>} */ (obj);
  const slug = o.calc_slug || o.calcSlug || o.calculator;
  return slug ? String(slug).trim().slice(0, 80) : '';
}

module.exports = {
  creditsKey,
  COST_CALC,
  COST_PDF,
  WELCOME_TOTAL,
  WELCOME_PER_POOL,
  defaultRecord,
  normalizeRecord,
  publicBalance,
  loadRecord,
  saveRecord,
  ensureWelcomeCredits,
  consumeCredits,
  hasUnlimitedAccess,
  subscriptionActive,
  calcUnlockActive,
  tierFromVariant,
  applySubscription,
  applyCalcUnlock,
  calcSlugFromCustomData,
  activeCalcUnlocks,
};
