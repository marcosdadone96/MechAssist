/**
 * Crditos (saldo nico) y costes de uso.
 * `creditPoolFromPath` solo etiqueta la seccin; el saldo es compartido.
 * Persistencia en Netlify Blobs va `credits-balance` y `credits-consume`.
 */
import { FEATURES } from './features.js';

export const CREDIT_POOLS = /** @type {const} */ (['lab', 'machines', 'fluids']);

/** @typedef {'lab'|'machines'|'fluids'} CreditPool */

/** @param {string} [pathname] */
export function creditPoolFromPath(pathname = '') {
  const p = String(pathname || (typeof location !== 'undefined' ? location.pathname : '')).toLowerCase();
  const file = p.split('/').pop() || '';
  if (
    file.includes('hydraulic') ||
    file.includes('pneumatic') ||
    file.includes('fluids-hub') ||
    file === 'calc-pneumatic-cylinder.html'
  ) {
    return 'fluids';
  }
  if (
    file.includes('transmission-lab') ||
    file.startsWith('calc-') ||
    file.includes('transmission-canvas') ||
    file.includes('transmission-studio')
  ) {
    return 'lab';
  }
  if (
    file.includes('conveyor') ||
    file.includes('elevator') ||
    file.includes('pump') ||
    file.includes('machines-hub') ||
    file.includes('car-lift') ||
    file.includes('bucket') ||
    file.includes('screw-conveyor') ||
    file.includes('traction') ||
    file.includes('roller') ||
    file.includes('flat-conv') ||
    file.includes('inclined') ||
    file.includes('centrifugal')
  ) {
    return 'machines';
  }
  return 'lab';
}

/** @param {string} [pathname] */
export function calcSlugFromPath(pathname = '') {
  const file = String(pathname || (typeof location !== 'undefined' ? location.pathname : ''))
    .split('/')
    .pop()
    .split('?')[0];
  return file || 'unknown';
}

export function isCreditsSystemEnabled() {
  if (FEATURES.publicFreeRelease === true) return false;
  return FEATURES.credits?.enabled === true;
}

export function getCreditCosts() {
  const c = FEATURES.credits || {};
  return {
    calcSession: Number(c.costCalcSession) > 0 ? Number(c.costCalcSession) : 10,
    pdf: Number(c.costPdf) > 0 ? Number(c.costPdf) : 10,
    welcomeTotal: Number(c.welcomeTotal) > 0 ? Number(c.welcomeTotal) : 1000,
    starterPdfLimit: Number(c.starterPdfLimitPerMonth) > 0 ? Number(c.starterPdfLimitPerMonth) : 30,
  };
}

/**
 * Saldo disponible (unificado o suma de registros antiguos en caché).
 * @param {Record<string, unknown> | null | undefined} balance
 */
export function creditsAmountFromBalance(balance) {
  if (!balance || typeof balance !== 'object') return 0;
  const b = /** @type {Record<string, unknown>} */ (balance);
  if (typeof b.credits === 'number' && Number.isFinite(b.credits)) {
    return Math.max(0, Math.floor(b.credits));
  }
  return (
    (Number(b.lab) || 0) + (Number(b.machines) || 0) + (Number(b.fluids) || 0)
  );
}
