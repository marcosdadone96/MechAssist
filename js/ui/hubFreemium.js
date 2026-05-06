/**
 * Hub (portada): antes inyectaba badges en nodos del aro; el aro se retiró.
 * Se mantiene el módulo por controles de cuenta en cabecera.
 */

import { getCurrentUser, clearLocalUser } from '../services/localAuth.js';

function getLang() {
  try {
    return localStorage.getItem('mdr-home-lang') === 'en' ? 'en' : 'es';
  } catch (_) {
    return 'es';
  }
}

function getTx(lang) {
  if (lang === 'en') {
    return {
      badgePro: 'PRO ACCESS',
      badgeFree: 'FREE',
      hello: (name) => `Hi, ${name}`,
      logout: 'Log out',
      register: 'Register',
    };
  }
  return {
    badgePro: 'ACCESO PRO',
    badgeFree: 'GRATIS',
    hello: (name) => `Hola, ${name}`,
    logout: 'Cerrar sesi\u00f3n',
    register: 'Registrarse',
  };
}

function badgeText() {
  const tx = getTx(getLang());
  if (typeof window.__t === 'function') return window.__t('badgePro');
  return tx.badgePro;
}

function freeBadgeText() {
  const tx = getTx(getLang());
  if (typeof window.__t === 'function') return window.__t('badgeFree');
  return tx.badgeFree;
}

const PRO_MACHINE_PATHS = new Set(['car-lift-screw.html', 'traction-elevator.html']);

function isProNode(anchor) {
  const href = anchor.getAttribute('href') || '';
  return PRO_MACHINE_PATHS.has(href);
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

renderHubProBadges();
window.addEventListener('home-language-changed', renderHubProBadges);

function mountHomeAccountControls() {
  const right = document.querySelector('.hub-header__right');
  if (!(right instanceof HTMLElement)) return;
  if (right.querySelector('.hub-account')) return;

  const user = getCurrentUser();
  const tx = getTx(getLang());
  const wrap = document.createElement('div');
  wrap.className = 'hub-account';
  wrap.innerHTML = user
    ? `<span class="hub-account__user">${tx.hello(user.name)}</span><button type="button" class="hub-account__btn" data-logout>${tx.logout}</button>`
    : `<a href="register.html" class="hub-account__btn hub-account__btn--link">${tx.register}</a>`;

  wrap.querySelector('[data-logout]')?.addEventListener('click', () => {
    clearLocalUser();
    window.location.reload();
  });
  right.appendChild(wrap);
}

mountHomeAccountControls();
