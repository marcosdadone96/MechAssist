/**
 * Plan de acceso — gratuito vs Pro (sin backend; listo para enlazar a pagos más adelante).
 *
 * Estrategia (qué módulo es la puerta gratis): `FEATURES.whichCalculatorIsFree` o `?freeTool=flat|inclined`.
 * Pro efectivo: `FEATURES.devSimulatePremium`, `?pro=1` (sesión), o localStorage tras "Activar Pro (demo)".
 */

import { FEATURES } from '../config/features.js';

const LS_TIER = 'mdr-access-tier';
const SS_PRO_DEMO = 'mdr-session-pro';

/** @returns {'flat'|'inclined'} */
export function getFreemiumStrategy() {
  try {
    const u = new URLSearchParams(window.location.search).get('freeTool');
    if (u === 'flat' || u === 'inclined') return u;
  } catch (_) {
    /* ignore */
  }
  const w = FEATURES.whichCalculatorIsFree;
  return w === 'inclined' ? 'inclined' : 'flat';
}

/** @returns {'free'|'premium'} */
export function getEffectiveTier() {
  if (FEATURES.devSimulatePremium) return 'premium';
  try {
    if (sessionStorage.getItem(SS_PRO_DEMO) === '1') return 'premium';
    if (localStorage.getItem(LS_TIER) === 'premium') return 'premium';
  } catch (_) {
    /* private mode */
  }
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get('pro') === '1') {
      /** Misma persistencia que «Activar Pro (demo)»: si solo se usa ?pro=1, antes quedaba en sessionStorage y se perdía al cerrar la pestaña. */
      try {
        localStorage.setItem(LS_TIER, 'premium');
      } catch (_) {
        /* ignore */
      }
      try {
        sessionStorage.setItem(SS_PRO_DEMO, '1');
      } catch (_) {
        /* p. ej. modo privado: Pro sigue activo en esta carga vía URL */
      }
      return 'premium';
    }
  } catch (_) {
    /* ignore */
  }
  return 'free';
}

/** @param {'flat'|'inclined'|'pump'|'screw'} tool */
export function isToolUnlocked(tool) {
  if (getEffectiveTier() === 'premium') return true;
  if (tool === 'pump' || tool === 'screw') return true;
  return getFreemiumStrategy() === tool;
}

export function setPremiumPersistent() {
  try {
    localStorage.setItem(LS_TIER, 'premium');
  } catch (_) {
    /* ignore */
  }
  try {
    sessionStorage.setItem(SS_PRO_DEMO, '1');
  } catch (_) {
    /* ignore */
  }
}

/**
 * Demo Pro: guarda en almacenamiento si el navegador lo permite y redirige con ?pro=1.
 * Así funciona aunque localStorage falle (p. ej. algunos entornos file:// o modo estricto).
 */
export function activateProDemoInBrowser() {
  setPremiumPersistent();
  try {
    const u = new URL(window.location.href);
    u.searchParams.set('pro', '1');
    window.location.replace(u.toString());
  } catch (_) {
    const href = window.location.href.replace(/\?.*$/, '');
    window.location.replace(`${href}?pro=1`);
  }
}

export function clearPremiumPersistent() {
  try {
    localStorage.removeItem(LS_TIER);
    sessionStorage.removeItem(SS_PRO_DEMO);
  } catch (_) {
    /* ignore */
  }
}

export function isPremiumEffective() {
  return getEffectiveTier() === 'premium';
}
