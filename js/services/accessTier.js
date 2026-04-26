/**
 * Plan de acceso — gratuito vs Pro (sin backend; listo para enlazar a pagos más adelante).
 *
 * Estrategia (qué módulo es la puerta gratis): `FEATURES.whichCalculatorIsFree` o `?freeTool=flat|inclined`.
 * Pro efectivo (por orden):
 * - `FEATURES.devSimulatePremium`
 * - `?pro=1` en la URL si `FEATURES.allowPremiumViaQueryPro`
 * - `mdr-pro-persistent-v1` en localStorage (pago o demo)
 * - Usos de prueba gratuitos si `FEATURES.allowFreeProTrialUses` (`mdr-free-pro-uses`, tope 5)
 */

import { FEATURES } from '../config/features.js';

const LS_FREE_PRO_USES = 'mdr-free-pro-uses';
const LS_PRO_PERSISTENT = 'mdr-pro-persistent-v1';
const SS_FREE_PRO_PAGE_MARK = 'mdr-free-pro-page-mark';
const MAX_FREE_PRO_USES = 5;

export function getProPersistentStorageKey() {
  return LS_PRO_PERSISTENT;
}

/** Pro demo / licencia guardada en este navegador (sin depender de la URL). */
export function hasPersistentProEnabled() {
  try {
    return localStorage.getItem(LS_PRO_PERSISTENT) === '1';
  } catch (_) {
    return false;
  }
}

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
    const q = new URLSearchParams(window.location.search);
    if (q.get('pro') === '1') {
      return 'premium';
    }
  } catch (_) {
    /* ignore */
  }
  if (hasPersistentProEnabled()) return 'premium';
  if (getFreeProRemainingUses() > 0) return 'premium';
  return 'free';
}

/** @param {'flat'|'inclined'|'pump'|'screw'} tool */
export function isToolUnlocked(tool) {
  if (getEffectiveTier() === 'premium') return true;
  if (tool === 'inclined' || tool === 'pump' || tool === 'screw') return true;
  return getFreemiumStrategy() === tool;
}

/** Marca licencia Pro persistente sin navegar (p. ej. tras confirmar pago en checkout). */
export function grantProLicensePersistent() {
  try {
    localStorage.setItem(LS_PRO_PERSISTENT, '1');
  } catch (_) {
    /* ignore */
  }
}

/**
 * Activa Pro en este navegador: marca localStorage y redirige con `?pro=1` para recargar la vista actual.
 * Tras un pago real, use `grantProLicensePersistent()` y redirija al inicio sin forzar la query.
 */
export function setPremiumPersistent() {
  grantProLicensePersistent();
  if (FEATURES.allowPremiumViaQueryPro) {
    activateProDemoInBrowser();
  } else {
    try {
      window.location.assign(window.location.pathname || '/');
    } catch (_) {
      window.location.reload();
    }
  }
}

/**
 * Solo añade `?pro=1` y recarga (p. ej. enlaces rápidos). No marca persistencia.
 * Preferir `setPremiumPersistent()` para «Activar Pro» en UI.
 */
export function activateProDemoInBrowser() {
  if (!FEATURES.allowPremiumViaQueryPro) return;
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
    localStorage.removeItem(LS_PRO_PERSISTENT);
  } catch (_) {
    /* ignore */
  }
  try {
    const u = new URL(window.location.href);
    u.searchParams.delete('pro');
    window.location.replace(u.toString());
  } catch (_) {
    const href = window.location.href.replace(/\?.*$/, '');
    window.location.replace(href);
  }
}

export function isPremiumEffective() {
  return getEffectiveTier() === 'premium';
}

function getUsageCounterRaw() {
  try {
    const n = Number(localStorage.getItem(LS_FREE_PRO_USES) || 0);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch (_) {
    return 0;
  }
}

function setUsageCounterRaw(v) {
  try {
    localStorage.setItem(LS_FREE_PRO_USES, String(Math.max(0, Math.floor(v))));
  } catch (_) {
    /* ignore */
  }
}

/**
 * Marca un uso Pro gratuito (máximo 1 por página/sesión del navegador).
 * No aplica si ya es Pro por URL, persistencia o flag de desarrollo.
 */
export function consumeFreeProUseIfNeeded() {
  if (FEATURES.devSimulatePremium) return;
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get('pro') === '1') return;
  } catch (_) {
    /* ignore */
  }
  if (hasPersistentProEnabled()) return;

  const key = `${window.location.pathname}|${window.location.search}`;
  try {
    if (sessionStorage.getItem(SS_FREE_PRO_PAGE_MARK) === key) return;
    sessionStorage.setItem(SS_FREE_PRO_PAGE_MARK, key);
  } catch (_) {
    /* ignore */
  }

  const used = getUsageCounterRaw();
  if (used >= MAX_FREE_PRO_USES) return;
  setUsageCounterRaw(used + 1);
}

export function getFreeProUsageCount() {
  return getUsageCounterRaw();
}

export function getFreeProRemainingUses() {
  if (!FEATURES.allowFreeProTrialUses) return 0;
  const left = MAX_FREE_PRO_USES - getUsageCounterRaw();
  return left > 0 ? left : 0;
}

export function getFreeProUsageLimit() {
  return MAX_FREE_PRO_USES;
}
