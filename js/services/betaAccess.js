/**
 * Beta abierta: cuentas registradas con sesión servidor = acceso Pro + créditos ilimitados sin cobro.
 * Sincronizar `BETA_OPEN_ACCESS` en netlify/functions/lib/creditsLogic.js al cambiar el flag.
 */
import { isBetaOpenAccess } from '../config/features.js';
import { getCreditCosts } from '../config/credits.js';
import { getCurrentUser } from './localAuth.js';

/** @returns {boolean} */
export function hasBetaRegisteredFullAccess() {
  if (!isBetaOpenAccess()) return false;
  const u = getCurrentUser();
  return Boolean(u?.email && u?.serverAuth);
}

/**
 * Respuesta sintética de saldo ilimitado (cliente / caché antes del fetch).
 * @param {string} [calcSlug]
 */
export function buildBetaCreditsBalancePayload(calcSlug = '') {
  const costs = getCreditCosts();
  const slug = String(calcSlug || '').trim();
  return {
    ok: true,
    unlimited: true,
    beta: true,
    subscriptionPlan: 'unlimited',
    balance: {
      credits: costs.welcomeTotal,
      subscription: 'unlimited',
      subscriptionEndsAt: null,
      pdfCountMonth: 0,
      costs: { calcSession: costs.calcSession, pdf: costs.pdf },
      limits: { starterPdfPerMonth: costs.starterPdfLimit },
    },
    calcUnlocked: slug ? true : undefined,
    calcSlug: slug || undefined,
    unlockedCalcs: {},
  };
}
