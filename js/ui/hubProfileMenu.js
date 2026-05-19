/**
 * Men\u00fa desplegable de perfil (cabecera): cr\u00e9ditos, enlaces de cuenta y cierre de sesi\u00f3n.
 */
import { getCurrentUser, clearLocalUser } from '../services/accountAuth.js';
import { clearProEntitlementClient } from '../services/proEntitlement.js';
import { FEATURES } from '../config/features.js';
import { creditsAmountFromBalance, isCreditsSystemEnabled } from '../config/credits.js';
import {
  getCachedCreditsState,
  fetchCreditsBalance,
  syncAccountBillingState,
} from '../services/creditsApi.js';
import { getCalcUnlockCatalogEntry } from '../config/calcUnlockCatalog.js';

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

function formatUnlockUntil(iso, en) {
  const t = Date.parse(String(iso || ''));
  if (!Number.isFinite(t)) return '';
  try {
    return new Date(t).toLocaleDateString(en ? 'en-GB' : 'es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (_) {
    return '';
  }
}

function calcLabelFromSlug(slug, en) {
  const entry = getCalcUnlockCatalogEntry(slug);
  if (entry) return en ? entry.en : entry.es;
  return slug.replace(/\.html$/, '').replace(/-/g, ' ');
}

/**
 * @param {HTMLElement} host
 * @param {Record<string, unknown> | null | undefined} state
 */
function renderCreditsInMenu(host, state) {
  if (!host) return;
  const en = lang() === 'en';
  const b = state?.balance;
  const unlockMap =
    state?.unlockedCalcs && typeof state.unlockedCalcs === 'object'
      ? /** @type {Record<string, string>} */ (state.unlockedCalcs)
      : {};
  const unlockEntries = Object.entries(unlockMap).filter(([, until]) => {
    const t = Date.parse(until);
    return Number.isFinite(t) && Date.now() < t;
  });

  if (!b && !state?.unlimited && !state?.starter && !unlockEntries.length) {
    host.hidden = true;
    host.textContent = '';
    return;
  }

  host.hidden = false;
  const parts = [];

  if (state?.unlimited) {
    parts.push(
      `<p class="hub-user-menu__credits-line hub-user-menu__credits-line--unlimited"><span class="hub-user-menu__credits-badge">${en ? 'Unlimited' : 'Ilimitado'}</span> ${en ? 'Full site access' : 'Acceso completo al sitio'}</p>`,
    );
  } else if (state?.starter) {
    parts.push(
      `<p class="hub-user-menu__credits-line"><span class="hub-user-menu__credits-badge">${en ? 'Starter' : 'Starter'}</span> ${en ? 'Active subscription' : 'Suscripci\u00f3n activa'}</p>`,
    );
  }

  if (unlockEntries.length) {
    parts.push(`<p class="hub-user-menu__credits-title">${en ? 'Unlocked calculators' : 'Calculadoras desbloqueadas'}</p>`);
    parts.push('<ul class="hub-user-menu__unlock-list">');
    for (const [slug, until] of unlockEntries) {
      const label = calcLabelFromSlug(slug, en);
      const untilStr = formatUnlockUntil(until, en);
      parts.push(
        `<li><strong>${label}</strong>${untilStr ? `<br><span class="hub-user-menu__credits-hint">${en ? 'Until' : 'Hasta'} ${untilStr}</span>` : ''}</li>`,
      );
    }
    parts.push('</ul>');
  }

  if (b && !state?.unlimited) {
    const cost = b.costs?.calcSession ?? 10;
    const total = creditsAmountFromBalance(b);
    const unlockN = unlockEntries.length;
    parts.push(
      `<p class="hub-user-menu__credits-title">${en ? 'Credits' : 'Cr\u00e9ditos'}</p>`,
      `<p class="hub-user-menu__credits-line"><strong>${total}</strong> ${en ? 'available (shared balance)' : 'disponibles (saldo \u00fanico)'}</p>`,
      unlockN
        ? `<p class="hub-user-menu__credits-hint">${en ? 'Unlocked calculators do not spend credits. Recharge for other tools.' : 'Las calculadoras desbloqueadas no gastan cr\u00e9ditos. Recargue para el resto.'}</p>`
        : `<p class="hub-user-menu__credits-hint">${en ? `${cost} credits per calc session` : `${cost} cr\u00e9ditos por sesi\u00f3n de c\u00e1lculo`}</p>`,
    );
  } else if (!state?.unlimited && !state?.starter && !unlockEntries.length) {
    parts.push(
      `<p class="hub-user-menu__credits-title">${en ? 'Your plan' : 'Tu plan'}</p>`,
      `<p class="hub-user-menu__credits-line">${en ? 'No active subscription or unlock.' : 'Sin suscripci\u00f3n ni desbloqueo activo.'}</p>`,
      `<p class="hub-user-menu__credits-hint"><a href="${FEATURES.proCheckoutPagePath || 'checkout.html'}">${en ? 'View plans' : 'Ver planes'}</a></p>`,
    );
  }

  parts.push(
    `<button type="button" class="hub-user-menu__sync" data-hub-sync-billing>${en ? 'Refresh account status' : 'Actualizar estado de cuenta'}</button>`,
  );

  host.innerHTML = parts.join('');
}

async function refreshMenuCredits(host, { forceSync = false } = {}) {
  if (!isCreditsSystemEnabled() || !host) return;
  const cached = getCachedCreditsState();
  if (cached) renderCreditsInMenu(host, cached);
  if (forceSync) await syncAccountBillingState().catch(() => {});
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

  const creditsHost = panel.querySelector('#hub-user-menu-credits');
  if (creditsHost) {
    creditsHost.hidden = false;
    void refreshMenuCredits(creditsHost, { forceSync: true });
    creditsHost.addEventListener('click', (ev) => {
      const btn = ev.target instanceof Element ? ev.target.closest('[data-hub-sync-billing]') : null;
      if (!btn) return;
      ev.preventDefault();
      btn.textContent = lang() === 'en' ? 'Updating…' : 'Actualizando…';
      void refreshMenuCredits(creditsHost, { forceSync: true }).finally(() => {
        renderCreditsInMenu(creditsHost, getCachedCreditsState());
      });
    });
  }

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
