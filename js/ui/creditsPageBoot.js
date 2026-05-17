/**
 * Creditos en paginas de maquinas / fluidos (no usan runCalcWithIndustrialFeedback del lab).
 */
import { calcSlugFromPath, creditPoolFromPath, isCreditsSystemEnabled } from '../config/credits.js';
import { shouldLockCalcInputsForCredits, withCalcCredits } from '../services/creditSession.js';
import { fetchCreditsBalance, getCachedCreditsState } from '../services/creditsApi.js';
import { getCurrentUser } from '../services/localAuth.js';
import { mountCreditsBar } from './creditsUi.js';
import { initNoCreditsLockWatch, syncNoCreditsInputLock } from './noCreditsLockMode.js';

/** @type {WeakSet<( ...args: unknown[]) => void>} */
const machineViewBooted = new WeakSet();

/** Precarga saldo y barra de creditos del hub actual (lab / machines / fluids). */
export async function bootPageCredits() {
  if (!isCreditsSystemEnabled()) return;
  if (!getCurrentUser()?.email) return;
  const pool = creditPoolFromPath();
  const slug = calcSlugFromPath();
  await fetchCreditsBalance(slug && slug !== 'unknown' ? slug : '').catch(() => {});
  await mountCreditsBar(pool);
  initNoCreditsLockWatch();
  syncNoCreditsInputLock();
}

/**
 * Envuelve refresh / computeAndRender para cobrar una sesion de calculo por ventana.
 * @param {(...args: unknown[]) => void} fn
 */
export function wrapCalcRefresh(fn) {
  const charged = (...args) => {
    if (!isCreditsSystemEnabled()) {
      fn(...args);
      return;
    }
    if (shouldLockCalcInputsForCredits()) {
      syncNoCreditsInputLock();
      return;
    }
    void withCalcCredits(() => fn(...args));
  };
  /** Vista inicial (diagrama, PDF, resultados) sin consumir creditos si el saldo esta agotado. */
  charged.runPreview = (...args) => {
    fn(...args);
  };
  return charged;
}

/**
 * Primera pintura de calculadoras maquina / fluidos: con creditos cobra sesion; sin creditos solo vista.
 * @param {ReturnType<typeof wrapCalcRefresh>} refresh
 */
export function bootMachineCalcView(refresh) {
  void bootMachineCalcViewInner(refresh);
}

/**
 * @param {ReturnType<typeof wrapCalcRefresh>} refresh
 */
async function bootMachineCalcViewInner(refresh) {
  if (machineViewBooted.has(refresh)) return;
  machineViewBooted.add(refresh);

  if (!isCreditsSystemEnabled()) {
    refresh.runPreview();
    return;
  }

  if (getCurrentUser()?.email && !getCachedCreditsState()) {
    const slug = calcSlugFromPath();
    await fetchCreditsBalance(slug && slug !== 'unknown' ? slug : '').catch(() => {});
  }

  if (shouldLockCalcInputsForCredits()) {
    refresh.runPreview();
    syncNoCreditsInputLock();
    return;
  }

  void withCalcCredits(() => refresh());
}
