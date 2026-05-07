/**
 * Pro en produccion: JWT emitido por /.netlify/functions/pro-claim y validado por pro-verify.
 * Cache local solo tras respuesta 200 del servidor (no confiar sin verificar).
 */

import { FEATURES } from '../config/features.js';

const LS_JWT = 'mdr-pro-jwt-v1';
/** Unix ms hasta el cual la cache de tier es valida (renovar con pro-verify). */
const LS_VERIFIED_UNTIL = 'mdr-pro-verified-until-v1';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function functionsBase() {
  return '/.netlify/functions';
}

export function getStoredProJwt() {
  try {
    return localStorage.getItem(LS_JWT) || '';
  } catch (_) {
    return '';
  }
}

export function setStoredProJwt(token) {
  try {
    if (token) localStorage.setItem(LS_JWT, token);
    else localStorage.removeItem(LS_JWT);
  } catch (_) {
    /* ignore */
  }
}

export function getVerifiedUntilMs() {
  try {
    const n = Number(localStorage.getItem(LS_VERIFIED_UNTIL) || 0);
    return Number.isFinite(n) ? n : 0;
  } catch (_) {
    return 0;
  }
}

function setVerifiedUntil(untilMs) {
  try {
    localStorage.setItem(LS_VERIFIED_UNTIL, String(untilMs));
  } catch (_) {
    /* ignore */
  }
}

export function clearProEntitlementClient() {
  setStoredProJwt('');
  try {
    localStorage.removeItem(LS_VERIFIED_UNTIL);
  } catch (_) {
    /* ignore */
  }
}

/**
 * @returns {boolean} true si la verificacion reciente indica Pro (solo produccion).
 */
export function hasProductionProSessionCache() {
  if (FEATURES.proClientPolicy !== 'production') return false;
  return getVerifiedUntilMs() > Date.now();
}

export async function claimProToken(email) {
  const res = await fetch(`${functionsBase()}/pro-claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: String(email || '').trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) {
    return { ok: false, status: res.status };
  }
  setStoredProJwt(data.token);
  return { ok: true };
}

export async function verifyProToken() {
  const token = getStoredProJwt();
  if (!token) {
    setVerifiedUntil(0);
    return false;
  }
  const res = await fetch(`${functionsBase()}/pro-verify`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    if (res.status === 401) clearProEntitlementClient();
    return false;
  }
  setVerifiedUntil(Date.now() + CACHE_TTL_MS);
  return true;
}

export async function claimAndVerifyProAfterCheckout(email) {
  const c = await claimProToken(email);
  if (!c.ok) return false;
  return verifyProToken();
}

export async function refreshProEntitlementIfNeeded() {
  if (FEATURES.proClientPolicy !== 'production') return;
  const token = getStoredProJwt();
  if (!token) return;
  const until = getVerifiedUntilMs();
  if (until > Date.now() + 60_000) return;
  const cacheWasFresh = until > Date.now();
  const ok = await verifyProToken();
  if (ok && !cacheWasFresh && hasProductionProSessionCache()) {
    window.location.reload();
  }
}
