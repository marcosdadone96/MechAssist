/**
 * Una sesiùn de cùlculo facturada por ventana (evita cobrar cada recùlculo automùtico).
 */
import {
  calcSlugFromPath,
  creditPoolFromPath,
  getCreditCosts,
  isCreditsSystemEnabled,
} from '../config/credits.js';
import { FEATURES } from '../config/features.js';
import {
  consumeCredits,
  fetchCreditsBalance,
  getCachedCreditsState,
  isCalcSlugUnlocked,
} from './creditsApi.js';
import { getCurrentUser } from './localAuth.js';

const SS_PREFIX = 'mdr-credit-session:';

/**
 * @returns {Promise<{ allowed: boolean, reason?: string }>}
 */
export async function ensureCalcSessionCharged() {
  if (!isCreditsSystemEnabled()) return { allowed: true };

  const user = getCurrentUser();
  if (!user?.email || !user?.serverAuth) return { allowed: true };

  const pool = creditPoolFromPath();
  const calcSlug = calcSlugFromPath();
  const costs = getCreditCosts();
  const sessionMs = Number(FEATURES.credits?.calcSessionMs) || 12 * 60 * 1000;

  const cached = getCachedCreditsState();
  if (cached?.unlimited || isCalcSlugUnlocked(calcSlug, cached)) return { allowed: true };

  const sessionKey = `${SS_PREFIX}${pool}:${calcSlug}`;
  let session = null;
  try {
    session = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
  } catch (_) {
    session = null;
  }

  const now = Date.now();
  if (session?.chargedAt && now - session.chargedAt < sessionMs) {
    return { allowed: true };
  }

  const idempotencyKey = `calc:${calcSlug}:${session?.sessionId || now}`;

  const result = await consumeCredits({
    pool,
    amount: costs.calcSession,
    reason: 'calc_session',
    idempotencyKey,
    calcSlug,
  });

  if (result.ok) {
    try {
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({
          sessionId: session?.sessionId || `s_${now}`,
          chargedAt: now,
        }),
      );
    } catch (_) {
      /* ignore */
    }
    await fetchCreditsBalance(calcSlug).catch(() => {});
    return { allowed: true };
  }

  if (result.error === 'insufficient_credits') {
    await fetchCreditsBalance(calcSlug).catch(() => {});
    return { allowed: false, reason: 'no_credits' };
  }

  return { allowed: false, reason: result.error || 'unknown' };
}

/**
 * @returns {Promise<{ allowed: boolean, reason?: string }>}
 */
export async function ensurePdfExportCharged() {
  if (!isCreditsSystemEnabled()) return { allowed: true };

  const user = getCurrentUser();
  if (!user?.email || !user?.serverAuth) return { allowed: false, reason: 'guest' };

  const pool = creditPoolFromPath();
  const calcSlug = calcSlugFromPath();
  const costs = getCreditCosts();

  const cached = getCachedCreditsState();
  if (cached?.unlimited || isCalcSlugUnlocked(calcSlug, cached)) return { allowed: true };
  if (cached?.starter && (cached.balance?.pdfCountMonth ?? 0) < (cached.balance?.limits?.starterPdfPerMonth ?? 30)) {
    /* starter: primeros PDF del mes sin crùditos si bajo lùmite ù servidor decide */
  }

  const idempotencyKey = `pdf:${calcSlug}:${Date.now()}`;

  const result = await consumeCredits({
    pool,
    amount: costs.pdf,
    reason: 'pdf',
    idempotencyKey,
    calcSlug,
  });

  if (result.ok) return { allowed: true };
  if (result.error === 'insufficient_credits') {
    return { allowed: false, reason: 'no_credits' };
  }
  return { allowed: false, reason: result.error || 'unknown' };
}

/**
 * Ejecuta fn solo si hay sesiùn de cùlculo (o ilimitado). Para pùginas sin runCalcWithIndustrialFeedback.
 * @param {() => void} fn
 */
export async function withCalcCredits(fn) {
  if (!isCreditsSystemEnabled()) {
    fn();
    return;
  }
  const gate = await ensureCalcSessionCharged();
  if (!gate.allowed) {
    if (gate.reason === 'no_credits') {
      const { showNoCreditsModal } = await import('../ui/creditsUi.js');
      showNoCreditsModal();
    }
    return;
  }
  fn();
}
