/**
 * Hub (home): cuenta en cabecera + badges si existiera el aro radial (legacy).
 */

import { getCurrentUser, clearLocalUser } from '../services/localAuth.js';
import { clearProEntitlementClient } from '../services/proEntitlement.js';
import { isProCalculatorPath } from '../config/freemium.js';

function lang() {
  return window.__homeLang === 'en' ? 'en' : 'es';
}

function t(key, fallback) {
  if (typeof window.__t === 'function') {
    const v = window.__t(key);
    if (v && v !== key) return v;
  }
  return fallback;
}

function helloLabel(name) {
  return lang() === 'en' ? `Hi, ${name}` : `Hola, ${name}`;
}

function badgeText() {
  return t('badgePro', lang() === 'en' ? 'PRO' : 'PRO');
}

function freeBadgeText() {
  return t('badgeFree', lang() === 'en' ? 'FREE' : 'GRATIS');
}

function isProNode(anchor) {
  const href = anchor.getAttribute('href') || '';
  return isProCalculatorPath(href);
}

function renderHubProBadges() {
  if (!document.querySelector('.hub-rim')) return;
  document.querySelectorAll('.hub-rim a.hub-node--go[href]').forEach((a) => {
    const current = a.querySelector(':scope > .hub-badge');
    if (current instanceof HTMLElement) current.remove();

    const badge = document.createElement('span');
    if (isProNode(a)) {
      badge.className = 'hub-badge hub-badge--pro';
      badge.textContent = badgeText();
    } else {
      badge.className = 'hub-badge hub-badge--free';
      badge.textContent = freeBadgeText();
    }
    a.appendChild(badge);
  });
}

function mountHomeAccountControls() {
  const slot =
    document.querySelector('#hub-header-auth-slot') || document.querySelector('.hub-header__auth-slot');
  if (!(slot instanceof HTMLElement)) return;
  slot.replaceChildren();

  const user = getCurrentUser();

  if (user) {
    const wrap = document.createElement('div');
    wrap.className = 'hub-account';
    const userEl = document.createElement('span');
    userEl.className = 'hub-account__user';
    userEl.textContent = helloLabel(user.name);
    const out = document.createElement('button');
    out.type = 'button';
    out.className = 'hub-account__btn';
    out.setAttribute('data-logout', '');
    out.textContent = t('auth.logout', lang() === 'en' ? 'Log out' : 'Cerrar sesi\u00f3n');
    out.addEventListener('click', () => {
      clearLocalUser();
      clearProEntitlementClient();
      window.location.reload();
    });
    wrap.appendChild(userEl);
    wrap.appendChild(out);
    slot.appendChild(wrap);
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'hub-account hub-account--anon';

  const loginBtn = document.createElement('button');
  loginBtn.type = 'button';
  loginBtn.className = 'hub-account__btn hub-account__btn--ghost';
  loginBtn.setAttribute('data-ma-modal-open', 'auth');
  loginBtn.setAttribute('data-auth-tab', 'login');
  loginBtn.textContent = t('auth.login', lang() === 'en' ? 'Log in' : 'Iniciar sesi\u00f3n');

  const regBtn = document.createElement('button');
  regBtn.type = 'button';
  regBtn.className = 'hub-account__btn hub-account__btn--procta';
  regBtn.setAttribute('data-ma-modal-open', 'auth');
  regBtn.setAttribute('data-auth-tab', 'register');
  regBtn.textContent = t('auth.register', lang() === 'en' ? 'Sign up' : 'Registrarse');

  wrap.appendChild(loginBtn);
  wrap.appendChild(regBtn);
  slot.appendChild(wrap);
}

renderHubProBadges();
mountHomeAccountControls();

window.addEventListener('home-language-changed', () => {
  renderHubProBadges();
  mountHomeAccountControls();
});
