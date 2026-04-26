/**
 * Hub de maquinas: etiqueta de acceso Pro en cada modulo.
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
      hello: (name) => `Hi, ${name}`,
      logout: 'Log out',
      register: 'Register',
    };
  }
  return {
    badgePro: 'ACCESO PRO',
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

function renderHubProBadges() {
  document.querySelectorAll('.hub-rim--machines a.hub-node--go[href]').forEach((a) => {
    let badge = a.querySelector(':scope > .hub-badge.hub-badge--pro');
    if (!(badge instanceof HTMLElement)) {
      badge = document.createElement('span');
      badge.className = 'hub-badge hub-badge--pro';
      a.appendChild(badge);
    }
    badge.textContent = badgeText();
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
