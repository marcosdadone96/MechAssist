/**
 * Hub (home): cuenta en cabecera + badges si existiera el aro radial (legacy).
 */

import { getCurrentUser } from '../services/accountAuth.js';
import { FEATURES } from '../config/features.js';
import { isProCalculatorPath } from '../config/freemium.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import {
  applyLoggedInNavChrome,
  mountProfileMenu,
  wirePlansLinksForLoggedInUser,
} from './hubProfileMenu.js';

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

function badgeText() {
  return t('badgePro', lang() === 'en' ? 'PRO' : 'PRO');
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

    if (isProNode(a)) {
      const badge = document.createElement('span');
      badge.className = 'hub-badge hub-badge--pro';
      badge.textContent = badgeText();
      a.appendChild(badge);
    }
  });
}

function mountAuthFallback(slot) {
  const wrap = document.createElement('div');
  wrap.className = 'site-nav__account site-nav__account--anon';
  wrap.setAttribute('data-auth-fallback', '1');

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
  slot.replaceChildren(wrap);
}

function mountHomeAccountControls() {
  const slot =
    document.querySelector('#hub-header-auth-slot') || document.querySelector('.site-nav__auth');
  if (!(slot instanceof HTMLElement)) return;
  slot.replaceChildren();
  slot.classList.remove('site-nav__auth--has-menu');

  const user = getCurrentUser();
  const hasAuthModal = !!document.getElementById('ma-modal-auth');

  if (user?.email) {
    mountProfileMenu(slot);
    applyLoggedInNavChrome();
    wirePlansLinksForLoggedInUser();
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
  applyLoggedInNavChrome();
}

function ensureHomeAccountControls() {
  try {
    mountHomeAccountControls();
  } catch (err) {
    console.error('[hubFreemium] mountHomeAccountControls', err);
    const slot =
      document.querySelector('#hub-header-auth-slot') || document.querySelector('.site-nav__auth');
    if (slot instanceof HTMLElement && !getCurrentUser()?.email) mountAuthFallback(slot);
  }
  const slot =
    document.querySelector('#hub-header-auth-slot') || document.querySelector('.site-nav__auth');
  if (slot instanceof HTMLElement && !slot.childElementCount && !getCurrentUser()?.email) {
    mountAuthFallback(slot);
  }
}

applyPublicFreeReleaseHomeUi();
renderHubProBadges();
ensureHomeAccountControls();
wirePlansLinksForLoggedInUser();

if (isCreditsSystemEnabled()) {
  queueMicrotask(async () => {
    if (!getCurrentUser()?.email) {
      const { initGuestCalcMode } = await import('./guestCalcMode.js');
      initGuestCalcMode();
    } else {
      const { bootPageCredits } = await import('./creditsPageBoot.js');
      await bootPageCredits();
    }
    const hubRoot = document.getElementById('lab-hub-root');
    if (hubRoot) {
      const { applyHubCalcCreditBadges, watchHubCalcCreditBadges } = await import('./hubCreditsBadges.js');
      applyHubCalcCreditBadges(hubRoot);
      watchHubCalcCreditBadges(hubRoot);
    }
  });
}

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
  ensureHomeAccountControls();
  wirePlansLinksForLoggedInUser();
  const hubRoot = document.getElementById('lab-hub-root');
  if (hubRoot) {
    import('./hubCreditsBadges.js').then((m) => m.applyHubCalcCreditBadges(hubRoot));
  }
});
