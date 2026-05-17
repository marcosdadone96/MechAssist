/**
 * Créditos por hub (lab / machines / fluids) y costes de uso.
 * Persistencia en Netlify Blobs vía `credits-balance` y `credits-consume`.
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
    welcomePerPool: Number(c.welcomePerPool) > 0 ? Number(c.welcomePerPool) : 100,
    starterPdfLimit: Number(c.starterPdfLimitPerMonth) > 0 ? Number(c.starterPdfLimitPerMonth) : 30,
  };
}
