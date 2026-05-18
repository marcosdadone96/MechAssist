/**
 * API de cr?ditos (Netlify Functions).
 */
import { getCurrentUser } from './localAuth.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { handleAuthHttpResponse } from './authSessionClient.js';

const LS_BALANCE = 'mdr-credits-balance-v1';
const LS_BALANCE_AT = 'mdr-credits-balance-at-v1';
const CREDITS_CHANGED = 'mdr-credits-changed';

function notifyCreditsChanged() {
  try {
    window.dispatchEvent(new CustomEvent(CREDITS_CHANGED));
  } catch (_) {
    /* ignore */
  }
}

function functionsBase() {
  return '/.netlify/functions';
}

function authHeaders() {
  const u = getCurrentUser();
  const tok = u?.serverAuth && u?.authToken ? String(u.authToken).trim() : '';
  /** @type {Record<string, string>} */
  const h = { 'Content-Type': 'application/json' };
  if (tok) h.Authorization = `Bearer ${tok}`;
  return h;
}

/** @typedef {{ credits: number, subscription: string|null, subscriptionEndsAt: string|null, pdfCountMonth: number, costs: { calcSession: number, pdf: number }, limits: { starterPdfPerMonth: number } }} CreditsBalance */

/**
 * @returns {Promise<{ ok: boolean, balance?: CreditsBalance, unlimited?: boolean, starter?: boolean, calcUnlocked?: boolean }>}
 */
export async function fetchCreditsBalance(calcSlug = '') {
  if (!isCreditsSystemEnabled()) return { ok: true, unlimited: true };
  const u = getCurrentUser();
  if (!u?.email || !u?.serverAuth) return { ok: false, error: 'auth' };

  const q = calcSlug ? `?calcSlug=${encodeURIComponent(calcSlug)}` : '';
  const res = await fetch(`${functionsBase()}/credits-balance${q}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (handleAuthHttpResponse(res, data)) return { ok: false, error: 'session_revoked' };
  if (!res.ok || !data.ok) return { ok: false, error: data.error || 'balance' };

  if (calcSlug) data.calcSlug = calcSlug;

  try {
    localStorage.setItem(LS_BALANCE, JSON.stringify(data));
    localStorage.setItem(LS_BALANCE_AT, String(Date.now()));
    notifyCreditsChanged();
  } catch (_) {
    /* ignore */
  }
  return data;
}

/**
 * @returns {{ balance?: CreditsBalance, unlimited?: boolean, starter?: boolean } | null}
 */
export function getCachedCreditsState() {
  try {
    const raw = localStorage.getItem(LS_BALANCE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

/**
 * @param {{
 *   pool: string,
 *   amount: number,
 *   reason: string,
 *   idempotencyKey: string,
 *   calcSlug?: string,
 * }} req
 */
export async function consumeCredits(req) {
  if (!isCreditsSystemEnabled()) return { ok: true, unlimited: true, charged: 0 };
  const u = getCurrentUser();
  if (!u?.email || !u?.serverAuth) return { ok: false, error: 'auth' };

  const res = await fetch(`${functionsBase()}/credits-consume`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  const data = await res.json().catch(() => ({}));
  if (handleAuthHttpResponse(res, data)) return { ok: false, error: 'session_revoked' };
  if (data.balance) {
    try {
      localStorage.setItem(
        LS_BALANCE,
        JSON.stringify({
          ok: true,
          balance: data.balance,
          unlimited: data.unlimited,
          starter: data.starter,
          calcUnlocked: data.calcUnlocked,
        }),
      );
      localStorage.setItem(LS_BALANCE_AT, String(Date.now()));
      notifyCreditsChanged();
    } catch (_) {
      /* ignore */
    }
  }
  return data;
}

/**
 * @param {string} slug
 * @param {ReturnType<typeof getCachedCreditsState>} [state]
 */
export function isCalcSlugUnlocked(slug, state = getCachedCreditsState()) {
  const s = String(slug || '').trim();
  if (!s || !state) return false;
  if (state.unlimited) return true;
  if (state.calcSlug === s && state.calcUnlocked) return true;
  const map = state.unlockedCalcs;
  if (!map || typeof map !== 'object') return false;
  const until = map[s];
  if (!until) return false;
  const t = Date.parse(until);
  return Number.isFinite(t) && Date.now() < t;
}

export function clearCreditsCache() {
  try {
    localStorage.removeItem(LS_BALANCE);
    localStorage.removeItem(LS_BALANCE_AT);
    notifyCreditsChanged();
  } catch (_) {
    /* ignore */
  }
}

/** Tras login/registro: precarga saldo para la barra y sesiones de c?lculo. */
export async function refreshCreditsAfterAuth() {
  if (!isCreditsSystemEnabled()) return;
  const u = getCurrentUser();
  if (!u?.email || !u?.serverAuth) return;
  await fetchCreditsBalance().catch(() => {});
}
