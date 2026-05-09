/**
 * Hub (home): cuenta en cabecera + badges si existiera el aro radial (legacy).
 */

import { getCurrentUser, clearLocalUser } from '../services/accountAuth.js';
import { clearProEntitlementClient } from '../services/proEntitlement.js';
import { FEATURES } from '../config/features.js';
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

function applyPublicFreeReleaseHomeUi() {
  if (!FEATURES.publicFreeRelease) return;
  document.documentElement.setAttribute('data-public-free-release', '1');
  document.getElementById('hub-pricing')?.setAttribute('hidden', '');
  document.querySelectorAll('a[data-nav-plans]').forEach((a) => a.setAttribute('hidden', ''));
  document.querySelector('p.hub-footnote--detail')?.setAttribute('hidden', '');
  document.querySelector('a[href="my-gearmotors.html"] .premium-flag')?.remove();
}

function renderHubProBadges() {
  if (!document.querySelector('.hub-rim')) return;
  document.querySelectorAll('.hub-rim a.hub-node--go[href]').forEach((a) => {
    const current = a.querySelector(':scope > .hub-badge');
    if (current instanceof HTMLElement) current.remove();

    const badge = document.createElement('span');
    if (FEATURES.publicFreeRelease) {
      badge.className = 'hub-badge hub-badge--free';
      badge.textContent = freeBadgeText();
    } else if (isProNode(a)) {
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
    document.querySelector('#hub-header-auth-slot') || document.querySelector('.site-nav__auth');
  if (!(slot instanceof HTMLElement)) return;
  slot.replaceChildren();

  const user = getCurrentUser();
  const hasAuthModal = !!document.getElementById('ma-modal-auth');

  if (user) {
    const wrap = document.createElement('div');
    wrap.className = 'site-nav__account';
    const userEl = document.createElement('span');
    userEl.className = 'site-nav__user';
    userEl.textContent = helloLabel(user.name);
    const out = document.createElement('button');
    out.type = 'button';
    out.className = 'site-nav__btn site-nav__btn--ghost';
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
  wrap.className = 'site-nav__account site-nav__account--anon';

  if (hasAuthModal) {
    const loginBtn = document.createElement('button');
    loginBtn.type = 'button';
    loginBtn.className = 'site-nav__btn site-nav__btn--ghost';
    loginBtn.setAttribute('data-ma-modal-open', 'auth');
    loginBtn.setAttribute('data-auth-tab', 'login');
    loginBtn.textContent = t('auth.login', lang() === 'en' ? 'Log in' : 'Iniciar sesi\u00f3n');

    const regBtn = document.createElement('button');
    regBtn.type = 'button';
    regBtn.className = 'site-nav__btn site-nav__btn--register';
    regBtn.setAttribute('data-ma-modal-open', 'auth');
    regBtn.setAttribute('data-auth-tab', 'register');
    regBtn.textContent = t('auth.register', lang() === 'en' ? 'Sign up' : 'Registrarse');

    wrap.appendChild(loginBtn);
    wrap.appendChild(regBtn);
  } else {
    const loginA = document.createElement('a');
    loginA.href = 'index.html?auth=login';
    loginA.className = 'site-nav__btn site-nav__btn--ghost';
    loginA.textContent = t('auth.login', lang() === 'en' ? 'Log in' : 'Iniciar sesi\u00f3n');

    const regA = document.createElement('a');
    regA.href = 'register.html';
    regA.className = 'site-nav__btn site-nav__btn--register';
    regA.textContent = t('auth.register', lang() === 'en' ? 'Sign up' : 'Registrarse');

    wrap.appendChild(loginA);
    wrap.appendChild(regA);
  }

  slot.appendChild(wrap);
}

applyPublicFreeReleaseHomeUi();
renderHubProBadges();
mountHomeAccountControls();

if (FEATURES.useServerAuth) {
  queueMicrotask(() => {
    import('../services/userCloudSync.js').then((m) => {
      void m.initUserCloudSync();
    });
  });
}

window.addEventListener('home-language-changed', () => {
  applyPublicFreeReleaseHomeUi();
  renderHubProBadges();
  mountHomeAccountControls();
});
