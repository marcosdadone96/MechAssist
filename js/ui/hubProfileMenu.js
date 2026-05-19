/**
 * Men\u00fa desplegable de perfil (cabecera): cr\u00e9ditos, enlaces de cuenta y cierre de sesi\u00f3n.
 */
import { getCurrentUser, clearLocalUser } from '../services/accountAuth.js';
import { clearProEntitlementClient } from '../services/proEntitlement.js';
import { FEATURES } from '../config/features.js';
import { creditsAmountFromBalance, isCreditsSystemEnabled } from '../config/credits.js';
import { getCachedCreditsState, fetchCreditsBalance } from '../services/creditsApi.js';

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

function userInitials(name) {
  const parts = String(name || '?')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
}

/**
 * @param {HTMLElement} host
 * @param {{ unlimited?: boolean, balance?: { credits?: number, costs?: { calcSession?: number } } }} state
 */
function renderCreditsInMenu(host, state) {
  if (!host) return;
  const en = lang() === 'en';
  const b = state?.balance;
  if (!b && !state?.unlimited) {
    host.hidden = true;
    host.textContent = '';
    return;
  }
  host.hidden = false;
  if (state?.unlimited) {
    host.innerHTML = `<p class="hub-user-menu__credits-line hub-user-menu__credits-line--unlimited"><span class="hub-user-menu__credits-badge">${en ? 'Unlimited' : 'Ilimitado'}</span> ${en ? 'Full access' : 'Acceso completo'}</p>`;
    return;
  }
  const cost = b.costs?.calcSession ?? 10;
  const total = creditsAmountFromBalance(b);
  host.innerHTML = `<p class="hub-user-menu__credits-title">${en ? 'Credits' : 'Cr\u00e9ditos'}</p><p class="hub-user-menu__credits-line"><strong>${total}</strong> ${en ? 'available across transmission lab, machines and hydraulics' : 'disponibles en laboratorio de transmisi\u00f3n, m\u00e1quinas e hidr\u00e1ulica'}</p><p class="hub-user-menu__credits-hint">${en ? `${cost} credits per calc session` : `${cost} cr\u00e9ditos por sesi\u00f3n de c\u00e1lculo`}</p>`;
}

async function refreshMenuCredits(host) {
  if (!isCreditsSystemEnabled() || !host) return;
  const cached = getCachedCreditsState();
  if (cached) renderCreditsInMenu(host, cached);
  const data = await fetchCreditsBalance().catch(() => null);
  if (data?.ok) renderCreditsInMenu(host, data);
}

function closeAllProfileMenus() {
  document.querySelectorAll('.hub-user-menu.is-open').forEach((el) => {
    el.classList.remove('is-open');
    el.querySelector('.hub-user-menu__trigger')?.setAttribute('aria-expanded', 'false');
  });
}

/**
 * @param {HTMLElement} slot
 */
export function mountProfileMenu(slot) {
  const user = getCurrentUser();
  if (!user?.email) return;

  slot.replaceChildren();
  slot.classList.add('site-nav__auth--has-menu');

  const en = lang() === 'en';
  const checkout = FEATURES.proCheckoutPagePath || 'checkout.html';
  const wrap = document.createElement('div');
  wrap.className = 'hub-user-menu';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'hub-user-menu__trigger';
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = `<span class="hub-user-menu__avatar" aria-hidden="true">${userInitials(user.name)}</span><span class="hub-user-menu__name">${user.name}</span><span class="hub-user-menu__chev" aria-hidden="true">\u25be</span>`;

  const panel = document.createElement('div');
  panel.className = 'hub-user-menu__panel';
  panel.setAttribute('role', 'menu');
  panel.innerHTML = `
    <div class="hub-user-menu__head">
      <p class="hub-user-menu__head-name"></p>
      <p class="hub-user-menu__head-email"></p>
    </div>
    <div id="hub-user-menu-credits" class="hub-user-menu__credits" hidden></div>
    <nav class="hub-user-menu__nav" aria-label="${en ? 'Account' : 'Cuenta'}">
      <a role="menuitem" class="hub-user-menu__link" href="my-gearmotors.html">${t('nav.myGearmotors', en ? 'My gearmotors' : 'Mis motorreductores')}</a>
      <a role="menuitem" class="hub-user-menu__link" href="my-saved-calcs.html">${t('nav.mySavedCalcs', en ? 'My saved calcs' : 'Mis c\u00e1lculos guardados')}</a>
      <a role="menuitem" class="hub-user-menu__link hub-user-menu__link--accent" href="${checkout}">${en ? 'Plans & billing' : 'Planes y pago'}</a>
      <a role="menuitem" class="hub-user-menu__link" href="feedback.html">${t('nav.feedback', en ? 'Feedback' : 'Sugerencias')}</a>
    </nav>
    <button type="button" class="hub-user-menu__logout" role="menuitem">${t('auth.logout', en ? 'Log out' : 'Cerrar sesi\u00f3n')}</button>
  `

  panel.querySelector('.hub-user-menu__head-name').textContent = user.name;
  panel.querySelector('.hub-user-menu__head-email').textContent = user.email;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = wrap.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) void refreshMenuCredits(panel.querySelector('#hub-user-menu-credits'));
  });

  panel.querySelector('.hub-user-menu__logout')?.addEventListener('click', async () => {
    await clearLocalUser();
    clearProEntitlementClient();
    try {
      const { clearCreditsCache } = await import('../services/creditsApi.js');
      clearCreditsCache();
    } catch (_) {
      /* ignore */
    }
    window.location.reload();
  });

  wrap.appendChild(trigger);
  wrap.appendChild(panel);
  slot.appendChild(wrap);

  if (!window.__hubProfileMenuCreditsBound) {
    window.__hubProfileMenuCreditsBound = true;
    window.addEventListener('mdr-credits-changed', () => {
      const host = document.getElementById('hub-user-menu-credits');
      if (host && !host.hidden) void refreshMenuCredits(host);
    });
  }

  if (!window.__hubProfileMenuDocBound) {
    window.__hubProfileMenuDocBound = true;
    document.addEventListener('click', (e) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest('.hub-user-menu')) return;
      closeAllProfileMenus();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllProfileMenus();
    });
  }
}

/** Oculta enlaces duplicados en la barra cuando hay men\u00fa de perfil. */
export function applyLoggedInNavChrome() {
  if (!getCurrentUser()?.email) {
    document.querySelectorAll('.site-nav__link--in-menu').forEach((el) => el.classList.remove('site-nav__link--in-menu'));
    return;
  }
  document.querySelectorAll('.site-nav__end .site-nav__link--plans, .site-nav__end .site-nav__link--feedback').forEach((el) => {
    el.classList.add('site-nav__link--in-menu');
  });
}

export function wirePlansLinksForLoggedInUser() {
  const checkout = FEATURES.proCheckoutPagePath || 'checkout.html';
  document.querySelectorAll('[data-nav-plans], [data-auth-next="checkout.html"]').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.dataset.mdrPlansWired === '1') return;
    el.dataset.mdrPlansWired = '1';
    el.addEventListener('click', (e) => {
      if (!getCurrentUser()?.email) return;
      e.preventDefault();
      e.stopPropagation();
      window.location.assign(checkout);
    });
  });
}
