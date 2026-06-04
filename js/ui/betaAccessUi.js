/**
 * Avisos y flags de UI para modo beta (acceso gratuito con cuenta registrada).
 */
import { isBetaOpenAccess } from '../config/features.js';
import { hasBetaRegisteredFullAccess } from '../services/betaAccess.js';

function langEn() {
  return document.documentElement.lang?.toLowerCase().startsWith('en');
}

export function applyBetaOpenAccessDocumentFlags() {
  if (!isBetaOpenAccess()) return;
  document.documentElement.setAttribute('data-beta-open-access', '1');
}

/**
 * @param {ParentNode | null | undefined} host
 * @param {{ compact?: boolean }} [opts]
 */
export function mountBetaAccessBanner(host, opts = {}) {
  if (!isBetaOpenAccess() || !(host instanceof HTMLElement)) return;
  if (host.querySelector('.beta-access-banner')) return;

  const en = langEn();
  const registered = hasBetaRegisteredFullAccess();
  const banner = document.createElement('aside');
  banner.className = opts.compact ? 'beta-access-banner beta-access-banner--compact' : 'beta-access-banner';
  banner.setAttribute('role', 'status');

  if (registered) {
    banner.innerHTML = en
      ? '<strong>Beta</strong> — Registered accounts have <strong>unlimited credits</strong> and full access at no charge while we finish billing.'
      : '<strong>Beta</strong> — Las cuentas registradas tienen <strong>cr\u00e9ditos ilimitados</strong> y acceso completo gratis mientras terminamos el sistema de pago.';
  } else if (opts.compact) {
    banner.innerHTML = en
      ? '<strong>Beta</strong> — <a href="register.html">Sign up free</a> for unlimited access during beta.'
      : '<strong>Beta</strong> — <a href="register.html">Reg\u00edstrese gratis</a> para acceso ilimitado durante la beta.';
  } else {
    banner.innerHTML = en
      ? '<strong>Beta</strong> — Create a free account for unlimited credits and full access. Paid plans below will activate when billing goes live.'
      : '<strong>Beta</strong> — Cree una cuenta gratuita para cr\u00e9ditos ilimitados y acceso completo. Los planes de pago se activar\u00e1n al lanzar la facturaci\u00f3n.';
  }

  host.prepend(banner);
}
