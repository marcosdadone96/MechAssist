/**
 * UI: barra de creditos, modales de paywall.
 */
import { calcSlugFromPath, isCreditsSystemEnabled } from '../config/credits.js';
import { fetchCreditsBalance, getCachedCreditsState, isCalcSlugUnlocked } from '../services/creditsApi.js';
import { buildCalcUnlockCheckoutUrl } from '../services/calcUnlockCheckout.js';
import { getCurrentUser } from '../services/localAuth.js';
import { FEATURES } from '../config/features.js';

function langEn() {
  return document.documentElement.lang?.toLowerCase().startsWith('en');
}

/**
 * @param {{ title: string, body: string, primaryLabel: string, primaryHref: string, secondaryLabel?: string, onSecondary?: () => void }} opts
 */
export function showCreditsModal(opts) {
  let backdrop = document.getElementById('credits-modal-backdrop');
  if (backdrop) backdrop.remove();

  backdrop = document.createElement('di' + 'v');
  backdrop.id = 'credits-modal-backdrop';
  backdrop.className = 'credits-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.innerHTML = `
    <div class="credits-modal">
      <h2 class="credits-modal__title">${opts.title}</h2>
      <p class="credits-modal__body">${opts.body}</p>
      <div class="credits-modal__actions">
        <a class="lab-btn" href="${opts.primaryHref}">${opts.primaryLabel}</a>
        ${opts.secondaryLabel ? `<button type="button" class="lab-btn lab-btn--ghost" data-credits-modal-secondary>${opts.secondaryLabel}</button>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  backdrop.querySelector('[data-credits-modal-secondary]')?.addEventListener('click', () => {
    opts.onSecondary?.();
    backdrop.remove();
  });
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });
}

export function showNoCreditsModal() {
  const en = langEn();
  const checkout = FEATURES.proCheckoutPagePath || 'checkout.html';
  const slug = calcSlugFromPath();
  const unlockHref = slug && slug !== 'unknown' ? buildCalcUnlockCheckoutUrl(slug) : `${checkout}#unlock`;
  const unlockLabel = en ? 'Unlock this calculator (\u20ac1/mo)' : 'Desbloquear esta calculadora (1 \u20ac/mes)';
  showCreditsModal({
    title: en ? 'Credits used up' : 'Cr\u00e9ditos agotados',
    body: en
      ? 'Choose independently: Starter (\u20ac9/mo, credits + PDF allowance), Unlimited (\u20ac25/mo, everything), or unlock only this calculator (\u20ac1/mo, unlimited use here for 30 days).'
      : 'Elija de forma independiente: Starter (9 \u20ac/mes, cr\u00e9ditos + PDF), Ilimitado (25 \u20ac/mes, todo) o solo esta calculadora (1 \u20ac/mes, uso ilimitado aqu\u00ed durante 30 d\u00edas).',
    primaryLabel: en ? 'Subscriptions (9 / 25 \u20ac)' : 'Suscripciones (9 / 25 \u20ac)',
    primaryHref: checkout,
    secondaryLabel: unlockLabel,
    onSecondary: () => {
      window.location.href = unlockHref;
    },
  });
}

function poolLabel(pool, en) {
  if (en) {
    if (pool === 'machines') return 'Machines';
    if (pool === 'fluids') return 'Hydraulics';
    return 'Lab';
  }
  if (pool === 'machines') return 'M\u00e1quinas';
  if (pool === 'fluids') return 'Hidr\u00e1ulica';
  return 'Laboratorio';
}

function renderBarContent(bar, state, pool) {
  const en = langEn();
  const b = state?.balance;
  if (!b) {
    bar.hidden = true;
    return;
  }
  if (state.unlimited) {
    bar.className = 'credits-bar credits-bar--unlimited';
    bar.innerHTML = en
      ? '<span class="credits-bar__badge">Unlimited</span> Full access active'
      : '<span class="credits-bar__badge">Ilimitado</span> Acceso completo activo';
    bar.hidden = false;
    return;
  }
  const slug = calcSlugFromPath();
  if (slug && isCalcSlugUnlocked(slug, state)) {
    bar.className = 'credits-bar credits-bar--unlimited';
    bar.innerHTML = en
      ? '<span class="credits-bar__badge">Unlocked</span> Unlimited on this calculator (30 days)'
      : '<span class="credits-bar__badge">Desbloqueada</span> Uso ilimitado en esta calculadora (30 d\u00edas)';
    bar.hidden = false;
    return;
  }
  const val = b[pool] ?? 0;
  bar.className = 'credits-bar';
  const sessionWord = en ? 'session' : 'sesi\u00f3n';
  const creditsWord = en ? 'credits' : 'cr\u00e9ditos';
  bar.innerHTML = `<span class="credits-bar__pool">${poolLabel(pool, en)}</span> <strong>${val}</strong> ${creditsWord} <span class="credits-bar__hint">(${b.costs?.calcSession ?? 10}/${sessionWord})</span>`;
  bar.hidden = false;
}

/**
 * @param {'lab'|'machines'|'fluids'} [pool]
 */
export async function mountCreditsBar(pool = 'lab') {
  if (!isCreditsSystemEnabled()) return;
  const user = getCurrentUser();
  if (!user?.email) return;
  if (document.querySelector('.hub-user-menu')) return;

  let bar = document.getElementById('credits-balance-bar');
  if (!bar) {
    bar = document.createElement('di' + 'v');
    bar.id = 'credits-balance-bar';
    bar.className = 'credits-bar';
    const navEnd = document.querySelector('.site-nav__end');
    if (navEnd) {
      navEnd.insertBefore(bar, navEnd.firstChild);
    } else {
      document.body.prepend(bar);
    }
  }
  bar.replaceWith(bar.cloneNode(false));
  bar = document.getElementById('credits-balance-bar');

  const cached = getCachedCreditsState();
  if (cached?.balance) {
    renderBarContent(bar, cached, pool);
  }

  const slug = calcSlugFromPath();
  const data = await fetchCreditsBalance(slug && slug !== 'unknown' ? slug : '').catch(() => null);
  if (data?.ok) renderBarContent(bar, data, pool);
}

export async function refreshCreditsUi(pool) {
  if (!isCreditsSystemEnabled()) return;
  await mountCreditsBar(pool);
}
