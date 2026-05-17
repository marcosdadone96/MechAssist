/**
 * Badges en tarjetas de hub: ocultar GRATIS sin cr\u00e9ditos y mostrar desbloqueo 1 \u20ac.
 */
import { FEATURES } from '../config/features.js';
import { creditPoolFromPath, isCreditsSystemEnabled } from '../config/credits.js';
import { getCachedCreditsState, fetchCreditsBalance } from '../services/creditsApi.js';
import { getCurrentUser } from '../services/localAuth.js';

const CREDITS_CHANGED = 'mdr-credits-changed';

function langEn() {
  return document.documentElement.lang?.toLowerCase().startsWith('en');
}

/**
 * @param {HTMLElement} root
 * @returns {'lab'|'machines'|'fluids'}
 */
function poolFromHubRoot(root) {
  const id = root.getAttribute('data-lab-hub-id');
  if (id === 'machines') return 'machines';
  if (id === 'fluids') return 'fluids';
  return 'lab';
}

/**
 * @param {HTMLAnchorElement} card
 */
function calcSlugFromCard(card) {
  const href = card.getAttribute('href') || '';
  try {
    return new URL(href, window.location.href).pathname.split('/').pop() || href;
  } catch {
    return href.split('/').pop() || href;
  }
}

/**
 * @param {string} calcSlug
 */
function calcUnlockHref(calcSlug) {
  const lemon = String(FEATURES.lemonCheckout?.calcUnlock || '').trim();
  if (lemon) {
    const u = lemon.includes('?') ? lemon : `${lemon}?`;
    const sep = lemon.includes('?') && !lemon.endsWith('?') ? '&' : '';
    return `${lemon}${sep}calc_slug=${encodeURIComponent(calcSlug)}`;
  }
  return `checkout.html?calc=${encodeURIComponent(calcSlug)}`;
}

/**
 * @param {'lab'|'machines'|'fluids'} pool
 */
function hubCreditsState(pool) {
  if (!isCreditsSystemEnabled()) {
    return { active: false, isGuest: !getCurrentUser()?.email, showUnlock: false, unlimited: false };
  }
  const user = getCurrentUser();
  const isGuest = !user?.email;
  if (isGuest) {
    return { active: true, isGuest: true, showUnlock: false, unlimited: false };
  }
  const c = getCachedCreditsState();
  if (c?.unlimited) {
    return { active: true, isGuest: false, showUnlock: false, unlimited: true };
  }
  const bal = c?.balance?.[pool] ?? 0;
  const cost = c?.balance?.costs?.calcSession ?? 10;
  const showUnlock = bal < cost;
  return { active: true, isGuest: false, showUnlock, unlimited: false };
}

/**
 * @param {HTMLElement} card
 * @param {{ active: boolean, isGuest: boolean, showUnlock: boolean, unlimited: boolean }} state
 */
function applyBadgeToCard(card, state) {
  if (!(card instanceof HTMLAnchorElement)) return;
  if (!state.active) return;

  let badge = card.querySelector(':scope > .lab-badge');
  const en = langEn();

  if (state.isGuest) {
    if (badge instanceof HTMLElement) badge.hidden = false;
    return;
  }

  if (state.unlimited) {
    if (badge instanceof HTMLElement) badge.hidden = true;
    return;
  }

  if (state.showUnlock) {
    const slug = calcSlugFromCard(card);
    if (!badge) {
      badge = document.createElement('a');
      card.appendChild(badge);
    }
    badge.className = 'lab-badge lab-badge--unlock';
    badge.href = calcUnlockHref(slug);
    badge.textContent = en ? 'Unlock \u00b7 \u20ac1' : 'Desbloquear \u00b7 1 \u20ac';
    badge.hidden = false;
    badge.removeAttribute('data-i18n');
    return;
  }

  if (badge instanceof HTMLElement) badge.hidden = true;
}

/**
 * @param {ParentNode} [root]
 */
export function applyHubCalcCreditBadges(root = document) {
  const hubRoot = root instanceof HTMLElement && root.id === 'lab-hub-root' ? root : root.querySelector?.('#lab-hub-root');
  if (!(hubRoot instanceof HTMLElement)) return;

  const pool = poolFromHubRoot(hubRoot);
  const state = hubCreditsState(pool);

  hubRoot.querySelectorAll('a.lab-card--hub[href]').forEach((card) => {
    applyBadgeToCard(card, state);
  });
}

/**
 * @param {ParentNode} [root]
 */
export function watchHubCalcCreditBadges(root = document) {
  const hubRoot = root instanceof HTMLElement && root.id === 'lab-hub-root' ? root : root.querySelector?.('#lab-hub-root');
  if (!(hubRoot instanceof HTMLElement)) return;

  const refresh = () => applyHubCalcCreditBadges(hubRoot);

  window.addEventListener(CREDITS_CHANGED, refresh);
  window.addEventListener('home-language-changed', refresh);

  if (isCreditsSystemEnabled() && getCurrentUser()?.email) {
    void fetchCreditsBalance().then(refresh);
  }
}
