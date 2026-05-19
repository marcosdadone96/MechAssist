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
  const headers = authHeaders();
  const res = await fetch(`${functionsBase()}/credits-balance${q}`, {
    method: 'GET',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  const usedTok = headers.Authorization || '';
  if (handleAuthHttpResponse(res, data, usedTok)) return { ok: false, error: 'session_revoked' };
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

  const headers = authHeaders();
  const res = await fetch(`${functionsBase()}/credits-consume`, {
    method: 'POST',
    headers,
    body: JSON.stringify(req),
  });
  const data = await res.json().catch(() => ({}));
  const usedTok = headers.Authorization || '';
  if (handleAuthHttpResponse(res, data, usedTok)) return { ok: false, error: 'session_revoked' };
  if (data.balance) {
    try {
      const prev = getCachedCreditsState();
      localStorage.setItem(
        LS_BALANCE,
        JSON.stringify({
          ok: true,
          balance: data.balance,
          unlimited: data.unlimited,
          starter: data.starter,
          calcUnlocked: data.calcUnlocked,
          calcSlug: data.calcSlug || prev?.calcSlug,
          unlockedCalcs: data.unlockedCalcs || prev?.unlockedCalcs,
          subscriptionPlan: data.subscriptionPlan || prev?.subscriptionPlan,
          subscriptionEndsAt: data.subscriptionEndsAt ?? prev?.subscriptionEndsAt,
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
  await syncAccountBillingState();
}

/**
 * Refresca plan/saldo y reconcilia un desbloqueo 1 € pendiente (webhook lento).
 */
/**
 * @returns {Promise<{ ok: boolean, hint?: string, message?: string }>}
 */
export async function fetchBillingStatus() {
  if (!isCreditsSystemEnabled()) return { ok: true, hint: 'credits_disabled' };
  const u = getCurrentUser();
  if (!u?.email || !u?.serverAuth) return { ok: false, hint: 'auth' };

  const headers = authHeaders();
  const res = await fetch(`${functionsBase()}/credits-billing-status`, {
    method: 'GET',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  const usedTok = headers.Authorization || '';
  if (handleAuthHttpResponse(res, data, usedTok)) return { ok: false, hint: 'session_revoked' };
  if (!res.ok || !data.ok) return { ok: false, hint: data.error || 'status' };
  return { ok: true, hint: data.hint, lemon: data.lemon, credits: data.credits };
}

/** @param {string} [hint] */
export function billingStatusMessage(hint, lang = 'es') {
  const en = lang === 'en';
  /** @type {Record<string, [string, string]>} */
  const map = {
    ok: [
      'Plan sincronizado correctamente.',
      'Plan synced successfully.',
    ],
    lemon_webhook_never_received: [
      'Lemon no tiene datos para este correo. Inicie sesión con el mismo email del pago (p. ej. marcosdadone96@gmail.com si pagó con ese) y reenvíe el webhook.',
      'No Lemon data for this email. Sign in with the same email used at checkout, then resend the webhook.',
    ],
    lemon_record_inactive: [
      'Hay registro en Lemon pero está inactivo. Compruebe la suscripción en Lemon o el signing secret en Netlify.',
      'Lemon record exists but is inactive. Check subscription in Lemon or webhook secret in Netlify.',
    ],
    subscription_not_synced_to_credits: [
      'Suscripción detectada; sincronizando créditos… Si sigue en 0, vuelva a pulsar Actualizar.',
      'Subscription detected; syncing credits… If still 0, tap Refresh again.',
    ],
    starter_low_credits: [
      'Plan Starter activo. Si el saldo es 0, pulse Actualizar de nuevo tras desplegar.',
      'Starter plan active. If balance is 0, tap Refresh again after deploy.',
    ],
    no_active_subscription: [
      'No hay suscripción activa en el servidor para este correo. ¿Mismo email que en Lemon?',
      'No active subscription on the server for this email. Same email as in Lemon?',
    ],
    no_subscription: [
      'No hay suscripción activa en el servidor para este correo. ¿Mismo email que en Lemon?',
      'No active subscription on the server for this email. Same email as in Lemon?',
    ],
  };
  const pair = map[String(hint || '')] || [
    'No se pudo sincronizar el plan. Revise webhook Lemon → ls-webhook en Netlify.',
    'Could not sync plan. Check Lemon webhook → ls-webhook on Netlify.',
  ];
  return en ? pair[1] : pair[0];
}

export async function syncAccountBillingState() {
  if (!isCreditsSystemEnabled()) return { ok: false, hint: 'credits_disabled' };
  const u = getCurrentUser();
  if (!u?.email || !u?.serverAuth) return { ok: false, hint: 'auth' };

  const sub = await reconcileSubscriptionAfterPayment().catch(() => ({ ok: false }));
  const pending = readPendingCalcUnlockSlug();
  if (pending) {
    await reconcileCalcUnlockAfterPayment(pending).catch(() => {});
  }
  await fetchCreditsBalance().catch(() => {});

  const status = await fetchBillingStatus().catch(() => ({ ok: false }));
  if (status.ok && status.hint === 'ok') {
    return { ok: true, hint: 'ok', message: billingStatusMessage('ok') };
  }
  if (sub.ok) {
    const again = await fetchBillingStatus().catch(() => status);
    if (again.ok && again.hint === 'ok') {
      return { ok: true, hint: 'ok', message: billingStatusMessage('ok') };
    }
    return {
      ok: false,
      hint: again.hint || status.hint,
      message: billingStatusMessage(again.hint || status.hint),
    };
  }
  const errHint =
    status.hint ||
    (sub && typeof sub === 'object' && 'error' in sub ? String(sub.error) : '') ||
    'no_subscription';
  return {
    ok: false,
    hint: errHint,
    message: billingStatusMessage(errHint),
  };
}

/**
 * Sincroniza suscripción Starter/Ilimitado desde Lemon (webhook tardío o variant mal configurada).
 */
export async function reconcileSubscriptionAfterPayment() {
  if (!isCreditsSystemEnabled()) return { ok: false };
  const u = getCurrentUser();
  if (!u?.email || !u?.serverAuth) return { ok: false, error: 'auth' };

  const headers = authHeaders();
  const res = await fetch(`${functionsBase()}/credits-reconcile-subscription`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  const data = await res.json().catch(() => ({}));
  const usedTok = headers.Authorization || '';
  if (handleAuthHttpResponse(res, data, usedTok)) return { ok: false, error: 'session_revoked' };
  if (res.status === 403) return { ok: false, error: data.error || 'no_subscription' };
  if (!res.ok || !data.ok) return { ok: false, error: data.error || 'reconcile' };

  try {
    const prev = getCachedCreditsState();
    localStorage.setItem(
      LS_BALANCE,
      JSON.stringify({
        ok: true,
        balance: data.balance,
        unlimited: data.unlimited,
        starter: data.starter,
        calcUnlocked: prev?.calcUnlocked,
        calcSlug: prev?.calcSlug,
        unlockedCalcs: data.unlockedCalcs || prev?.unlockedCalcs,
        subscriptionPlan: data.subscriptionPlan || prev?.subscriptionPlan,
        subscriptionEndsAt: data.subscriptionEndsAt ?? prev?.subscriptionEndsAt,
      }),
    );
    localStorage.setItem(LS_BALANCE_AT, String(Date.now()));
    notifyCreditsChanged();
  } catch (_) {
    /* ignore */
  }

  return { ok: true, data };
}

/** @param {ReturnType<typeof getCachedCreditsState>} [state] */
export function countActiveCalcUnlocks(state = getCachedCreditsState()) {
  const map = state?.unlockedCalcs;
  if (!map || typeof map !== 'object') return 0;
  const now = Date.now();
  return Object.values(map).filter((until) => {
    const t = Date.parse(String(until));
    return Number.isFinite(t) && now < t;
  }).length;
}

/** @param {ReturnType<typeof getCachedCreditsState>} [state] */
export function hasActiveBillingEntitlement(state = getCachedCreditsState()) {
  if (!state) return false;
  if (state.unlimited || state.starter) return true;
  return countActiveCalcUnlocks(state) > 0;
}

const SS_PENDING_UNLOCK = 'mdr-pending-unlock-slug';

export function rememberPendingCalcUnlockSlug(slug) {
  try {
    const s = String(slug || '').trim();
    if (s) sessionStorage.setItem(SS_PENDING_UNLOCK, s);
    else sessionStorage.removeItem(SS_PENDING_UNLOCK);
  } catch (_) {
    /* ignore */
  }
}

export function readPendingCalcUnlockSlug() {
  try {
    return String(sessionStorage.getItem(SS_PENDING_UNLOCK) || '').trim();
  } catch (_) {
    return '';
  }
}

export function clearPendingCalcUnlockSlug() {
  try {
    sessionStorage.removeItem(SS_PENDING_UNLOCK);
  } catch (_) {
    /* ignore */
  }
}

/**
 * Tras pago Lemon: intenta reconciliar desbloqueo si el webhook tardó.
 * @param {string} calcSlug
 */
export async function reconcileCalcUnlockAfterPayment(calcSlug) {
  const slug = String(calcSlug || '').trim();
  if (!slug || !isCreditsSystemEnabled()) return { ok: false };
  const u = getCurrentUser();
  if (!u?.email || !u?.serverAuth) return { ok: false, error: 'auth' };

  const headers = authHeaders();
  const res = await fetch(`${functionsBase()}/credits-reconcile-unlock`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ calcSlug: slug }),
  });
  const data = await res.json().catch(() => ({}));
  const usedTok = headers.Authorization || '';
  if (handleAuthHttpResponse(res, data, usedTok)) return { ok: false, error: 'session_revoked' };
  if (!res.ok || !data.ok) return { ok: false, error: data.error || 'reconcile' };

  clearPendingCalcUnlockSlug();
  await fetchCreditsBalance(slug).catch(() => {});
  return { ok: true, data };
}

/**
 * Espera a que el saldo refleje suscripción o desbloqueo tras ?paid=1.
 * @param {string} [preferredSlug]
 * @param {{ maxMs?: number }} [opts]
 */
export async function waitForCreditsAfterCheckout(preferredSlug = '', opts = {}) {
  const slug = String(preferredSlug || '').trim();
  const maxMs = Number(opts.maxMs) > 0 ? Number(opts.maxMs) : 30000;
  const started = Date.now();

  while (Date.now() - started < maxMs) {
    await reconcileSubscriptionAfterPayment().catch(() => {});
    if (slug) {
      await reconcileCalcUnlockAfterPayment(slug).catch(() => {});
    }
    const data = await fetchCreditsBalance(slug).catch(() => null);
    if (data?.ok) {
      if (data.unlimited) return { status: 'unlimited', data };
      if (data.starter) return { status: 'starter', data };
      const map = data.unlockedCalcs && typeof data.unlockedCalcs === 'object' ? data.unlockedCalcs : {};
      const keys = Object.keys(map);
      if (keys.length) return { status: 'unlock', data, slugs: keys };
      if (slug && data.calcUnlocked) return { status: 'unlock', data, slugs: [slug] };
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  const last = getCachedCreditsState();
  return { status: 'pending', data: last };
}
