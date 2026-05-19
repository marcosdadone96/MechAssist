/**
 * Desbloqueo puntual de una calculadora (1 ?/mes): independiente de Starter e Ilimitado.
 */
import { FEATURES } from '../config/features.js';
import { isCalcUnlockCatalogSlug } from '../config/calcUnlockCatalog.js';
import { rememberPendingCalcUnlockSlug } from './creditsApi.js';

/**
 * @param {string} calcSlug p. ej. calc-gears.html
 * @returns {string}
 */
export function buildCalcUnlockCheckoutUrl(calcSlug) {
  const slug = String(calcSlug || '').trim().slice(0, 80);
  if (slug && !isCalcUnlockCatalogSlug(slug)) {
    return 'checkout.html#unlock';
  }
  if (slug) rememberPendingCalcUnlockSlug(slug);
  const base = String(FEATURES.lemonCheckout?.calcUnlock || '').trim();
  if (!base) {
    const q = slug ? `?unlock=${encodeURIComponent(slug)}` : '';
    return `checkout.html${q}`;
  }
  if (base.includes('{{calc_slug}}')) {
    return base.replace(/\{\{calc_slug\}\}/g, encodeURIComponent(slug));
  }
  if (/calc_slug=/.test(base)) {
    return base.replace(/calc_slug=[^&]*/, `calc_slug=${encodeURIComponent(slug)}`);
  }
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}checkout[custom][calc_slug]=${encodeURIComponent(slug)}`;
}
