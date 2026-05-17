/**
 * Créditos en páginas de máquinas / fluidos (no usan runCalcWithIndustrialFeedback del lab).
 */
import { calcSlugFromPath, creditPoolFromPath, isCreditsSystemEnabled } from '../config/credits.js';
import { withCalcCredits } from '../services/creditSession.js';
import { fetchCreditsBalance } from '../services/creditsApi.js';
import { getCurrentUser } from '../services/localAuth.js';
import { mountCreditsBar } from './creditsUi.js';

/** Precarga saldo y barra de créditos del hub actual (lab / machines / fluids). */
export async function bootPageCredits() {
  if (!isCreditsSystemEnabled()) return;
  if (!getCurrentUser()?.email) return;
  const pool = creditPoolFromPath();
  const slug = calcSlugFromPath();
  await fetchCreditsBalance(slug && slug !== 'unknown' ? slug : '').catch(() => {});
  await mountCreditsBar(pool);
}

/**
 * Envuelve refresh / computeAndRender para cobrar una sesión de cálculo por ventana.
 * @param {(...args: unknown[]) => void} fn
 */
export function wrapCalcRefresh(fn) {
  return (...args) => {
    if (!isCreditsSystemEnabled()) {
      fn(...args);
      return;
    }
    void withCalcCredits(() => fn(...args));
  };
}
