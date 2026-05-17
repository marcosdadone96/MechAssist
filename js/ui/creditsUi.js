/**
 * UI: barra de creditos, modales de paywall.
 */
import { isCreditsSystemEnabled } from '../config/credits.js';
import { fetchCreditsBalance, getCachedCreditsState } from '../services/creditsApi.js';
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
  showCreditsModal({
    title: en ? 'Credits used up' : 'Cr\u00e9ditos agotados',
    body: en
      ? 'You have used your free credits in this area. Subscribe from \u20ac9/month, unlock a single calculator for \u20ac1, or choose unlimited access at \u20ac25/month.'
      : 'Has agotado los cr\u00e9ditos gratuitos en esta \u00e1rea. Suscr\u00edbete desde 9 \u20ac/mes, desbloquea una calculadora por 1 \u20ac o elige acceso ilimitado por 25 \u20ac/mes.',
    primaryLabel: en ? 'View plans' : 'Ver planes',
    primaryHref: checkout,
    secondaryLabel: en ? 'Close' : 'Cerrar',
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

  const data = await fetchCreditsBalance().catch(() => null);
  if (data?.ok) renderBarContent(bar, data, pool);
}

export async function refreshCreditsUi(pool) {
  if (!isCreditsSystemEnabled()) return;
  await mountCreditsBar(pool);
}
