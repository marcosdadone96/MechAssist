/**
 * Sustituye el enlace ?pro=1 estatico en paywalls de laboratorio por el flujo de registro/checkout.
 */

import { isPremiumViaQueryProUiAllowed } from '../config/features.js';
import { buildRegisterUrlWithNextCheckout } from '../services/proCheckoutFlow.js';

/**
 * @param {string} paywallRootId — id del contenedor (p. ej. studioPaywall, txPaywall)
 */
export function patchLabPaywallQueryProLink(paywallRootId) {
  const root = document.getElementById(paywallRootId);
  if (!root) return;
  const a = root.querySelector('a[href*="pro=1"]');
  if (!(a instanceof HTMLAnchorElement)) return;
  if (!isPremiumViaQueryProUiAllowed()) {
    a.href = buildRegisterUrlWithNextCheckout();
    a.textContent = 'Obtener Pro';
  }
}
