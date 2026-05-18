/**
 * Badges en tarjetas de hub: ocultar GRATIS sin cr\u00e9ditos y mostrar desbloqueo 1 \u20ac.
 */
import { FEATURES } from '../config/features.js';
import { creditsAmountFromBalance, isCreditsSystemEnabled } from '../config/credits.js';
import { getCachedCreditsState, fetchCreditsBalance, isCalcSlugUnlocked } from '../services/creditsApi.js';
import { buildCalcUnlockCheckoutUrl } from '../services/calcUnlockCheckout.js';
import { getCurrentUser } from '../services/localAuth.js';

const CREDITS_CHANGED = 'mdr-credits-changed';

function langEn() {
  return document.documentElement.lang?.toLowerCase().startsWith('en');
}

/**
 * @param {HTMLAnchorElement} card
 * @returns {HTMLElement}
 */
function badgeHostForCard(card) {
  const visual = card.querySelector('.lab-card--hub__visual');
  return visual instanceof HTMLElement ? visual : card;
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


function hubCreditsState() {
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
  const bal = creditsAmountFromBalance(c?.balance);
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
    if (badge instanceof HTMLElement && badge.classList.contains('lab-badge--free')) {
      badge.hidden = true;
    }
    return;
  }

  if (state.unlimited) {
    if (badge instanceof HTMLElement) badge.hidden = true;
    return;
  }

  if (state.showUnlock) {
    const slug = calcSlugFromCard(card);
    if (isCalcSlugUnlocked(slug, getCachedCreditsState())) {
      if (badge instanceof HTMLElement) badge.hidden = true;
      return;
    }
    const host = badgeHostForCard(card);
    if (!badge) {
      badge = document.createElement('a');
    }
    if (badge.parentElement !== host) {
      host.appendChild(badge);
    }
    badge.className = 'lab-badge lab-badge--unlock lab-badge--unlock-mini';
    badge.href = buildCalcUnlockCheckoutUrl(slug);
    badge.textContent = en ? '\u20ac1' : '1 \u20ac';
    badge.setAttribute('title', en ? 'Unlock this calculator (\u20ac1)' : 'Desbloquear esta calculadora (1 \u20ac)');
    badge.setAttribute('aria-label', badge.getAttribute('title') || '');
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

  const state = hubCreditsState();

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
