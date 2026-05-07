/**
 * Plan de acceso — gratuito vs Pro (sin backend; listo para enlazar a pagos más adelante).
 *
 * Cintas plana e inclinada: siempre desbloqueadas en `conveyorAppEntry`. `whichCalculatorIsFree` / `?freeTool=` quedan para pruebas o copy legacy.
 * Pro efectivo (por orden):
 * - `FEATURES.devSimulatePremium`
 * - `?pro=1` en la URL si `allowPremiumViaQueryPro` y `proClientPolicy !== 'production'`
 * - Licencia Pro en localStorage (clave opaca v2; ver `getProPersistentStorageKey`), ignorada si `proClientPolicy === 'production'`
 * - Usos de prueba gratuitos si `FEATURES.allowFreeProTrialUses` (`mdr-free-pro-uses`, tope 5)
 *
 * `proClientPolicy: 'production'` bloquea licencia y URL en cliente hasta integrar validación servidor (p. ej. Netlify Function + Stripe).
 */

import { FEATURES } from '../config/features.js';

/** Atajos Pro solo-navegador desactivados (licencia local, URL, usos prueba). */
function clientProShortcutsDisabled() {
  if (FEATURES.devSimulatePremium) return false;
  return FEATURES.proClientPolicy === 'production';
}

const LS_FREE_PRO_USES = 'mdr-free-pro-uses';
const SS_FREE_PRO_PAGE_MARK = 'mdr-free-pro-page-mark';
const MAX_FREE_PRO_USES = 5;

/** Semilla ASCII para derivar el nombre de la entrada en `localStorage` (v2). */
const PRO_LICENSE_STORAGE_SEED = 'pro-v2';

const PRO_LICENSE_KEY_PREFIX = '_mdr_';

/**
 * Base64 de `PRO_LICENSE_STORAGE_SEED` sin `=`; debe coincidir con `btoa` en el navegador.
 * Solo se usa si no existe `globalThis.btoa` (p. ej. tests Node sin jsdom).
 */
const PRO_LICENSE_KEY_SUFFIX_FALLBACK = 'cHJvLXYy';

const PRO_LICENSE_KEY_SUFFIX =
  typeof globalThis.btoa === 'function'
    ? globalThis.btoa(PRO_LICENSE_STORAGE_SEED).replace(/=/g, '')
    : PRO_LICENSE_KEY_SUFFIX_FALLBACK;

/** Clave v2: lectura/escritura de licencia Pro; unica fuente para este string en el bundle. */
const PRO_LICENSE_LOCAL_STORAGE_KEY = PRO_LICENSE_KEY_PREFIX + PRO_LICENSE_KEY_SUFFIX;

/** Clave v1 (migracion); unica aparicion del literal legado. */
const PRO_LICENSE_LOCAL_STORAGE_KEY_LEGACY = 'mdr-pro-persistent-v1';

/**
 * Nombre de clave en `localStorage` para licencia Pro (mismo string que el bundle; backend puede replicar la formula).
 * @returns {string}
 */
export function getProPersistentStorageKey() {
  return PRO_LICENSE_LOCAL_STORAGE_KEY;
}

/**
 * Nombre de la clave legada (solo migracion / compatibilidad).
 * @returns {string}
 */
export function getProPersistentLegacyStorageKey() {
  return PRO_LICENSE_LOCAL_STORAGE_KEY_LEGACY;
}

/** Pro demo / licencia guardada en este navegador (sin depender de la URL). */
export function hasPersistentProEnabled() {
  if (clientProShortcutsDisabled()) return false;
  try {
    if (localStorage.getItem(PRO_LICENSE_LOCAL_STORAGE_KEY) === '1') return true;
    if (localStorage.getItem(PRO_LICENSE_LOCAL_STORAGE_KEY_LEGACY) === '1') {
      localStorage.setItem(PRO_LICENSE_LOCAL_STORAGE_KEY, '1');
      localStorage.removeItem(PRO_LICENSE_LOCAL_STORAGE_KEY_LEGACY);
      return true;
    }
    return false;
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
  if (clientProShortcutsDisabled()) return 'free';
  if (FEATURES.allowPremiumViaQueryPro) {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get('pro') === '1') return 'premium';
    } catch (_) {
      /* ignore */
    }
  }
  if (hasPersistentProEnabled()) return 'premium';
  if (getFreeProRemainingUses() > 0) return 'premium';
  return 'free';
}

/** @param {'flat'|'inclined'} tool — solo entradas de conveyorAppEntry */
export function isToolUnlocked(tool) {
  if (getEffectiveTier() === 'premium') return true;
  if (tool === 'flat' || tool === 'inclined') return true;
  return false;
}

/** Marca licencia Pro persistente sin navegar (p. ej. tras confirmar pago en checkout). */
export function grantProLicensePersistent() {
  if (clientProShortcutsDisabled()) return;
  try {
    localStorage.setItem(PRO_LICENSE_LOCAL_STORAGE_KEY, '1');
    localStorage.removeItem(PRO_LICENSE_LOCAL_STORAGE_KEY_LEGACY);
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
  if (clientProShortcutsDisabled()) return;
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
    localStorage.removeItem(PRO_LICENSE_LOCAL_STORAGE_KEY);
    localStorage.removeItem(PRO_LICENSE_LOCAL_STORAGE_KEY_LEGACY);
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

/**
 * Pro suficiente para desbloquear formularios y acordeones en calculadoras m\u00e1quinas Pro.
 * No incluye el margen de \u00abusos Pro gratuitos\u00bb del contador local (sigue reservado para
 * otras partes de la app); exige `?pro=1`, licencia persistida o flag de desarrollo.
 *
 * @returns {boolean}
 */
export function isPremiumForMachineForm() {
  if (FEATURES.devSimulatePremium) return true;
  if (clientProShortcutsDisabled()) return false;
  if (FEATURES.allowPremiumViaQueryPro) {
    try {
      if (new URLSearchParams(window.location.search).get('pro') === '1') return true;
    } catch (_) {
      /* ignore */
    }
  }
  if (hasPersistentProEnabled()) return true;
  return false;
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
  if (clientProShortcutsDisabled()) return;
  if (FEATURES.allowPremiumViaQueryPro) {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get('pro') === '1') return;
    } catch (_) {
      /* ignore */
    }
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
  if (FEATURES.proClientPolicy === 'production' && !FEATURES.devSimulatePremium) return 0;
  const left = MAX_FREE_PRO_USES - getUsageCounterRaw();
  return left > 0 ? left : 0;
}

export function getFreeProUsageLimit() {
  return MAX_FREE_PRO_USES;
}
