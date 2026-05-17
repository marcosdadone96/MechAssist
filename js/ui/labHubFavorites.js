/**
 * Pin / reorder calculators on hub index pages (Laboratorio, Maquinas, Fluidos).
 */
import { getCurrentLang, HOME_LANG_CHANGED_EVENT } from '../config/locales.js';
import {
  clearLabHubPins,
  getLabHubPins,
  isLabHubFavoritesEnabled,
  setLabHubPins,
} from '../services/labHubFavoritesStore.js';
import { initUserCloudSync } from '../services/userCloudSync.js';

/** @param {string} es @param {string} en */
function tx(es, en) {
  return getCurrentLang() === 'en' ? en : es;
}

/**
 * @param {HTMLAnchorElement} card
 * @returns {string | null}
 */
function calcIdFromCard(card) {
  const href = card.getAttribute('href');
  if (!href) return null;
  try {
    const path = new URL(href, window.location.href).pathname;
    const name = path.split('/').pop();
    return name || href;
  } catch {
    return href;
  }
}

/**
 * @param {HTMLElement} root
 */
function mountLabHubFavoritesSignInGate(root) {
  const filterRow = root.querySelector('.lab-hub-filter-row');
  if (!filterRow?.parentNode) return;
  if (root.querySelector('.lab-hub-favorites-gate')) return;

  const box = document.createElement('div');
  box.className = 'lab-hub-favorites-gate';
  const p = document.createElement('p');
  p.className = 'lab-hub-favorites-gate__text muted';
  p.textContent = tx(
    'Inicia sesi\u00f3n para fijar calculadoras arriba y guardar tus accesos r\u00e1pidos en tu cuenta.',
    'Sign in to pin calculators to the top and save shortcuts to your account.',
  );
  const link = document.createElement('a');
  link.className = 'lab-hub-favorites-gate__link';
  link.href = 'register.html';
  link.textContent = tx('Iniciar sesi\u00f3n o crear cuenta', 'Sign in or create account');
  box.appendChild(p);
  box.appendChild(link);
  filterRow.parentNode.insertBefore(box, filterRow.nextSibling);

  const onLang = () => {
    p.textContent = tx(
      'Inicia sesi\u00f3n para fijar calculadoras arriba y guardar tus accesos r\u00e1pidos en tu cuenta.',
      'Sign in to pin calculators to the top and save shortcuts to your account.',
    );
    link.textContent = tx('Iniciar sesi\u00f3n o crear cuenta', 'Sign in or create account');
  };
  window.addEventListener(HOME_LANG_CHANGED_EVENT, onLang);
  window.addEventListener('lab-language-changed', onLang);
}

/**
 * @param {ParentNode} root
 */
export function initLabHubFavorites(root) {
  if (!(root instanceof HTMLElement)) return;

  if (!isLabHubFavoritesEnabled()) {
    mountLabHubFavoritesSignInGate(root);
    return;
  }

  const hubId =
    root.getAttribute('data-lab-hub-id') ||
    window.location.pathname.split('/').pop() ||
    'hub';

  /** @type {Map<string, HTMLAnchorElement>} */
  const cardById = new Map();
  /** @type {Map<string, { grid: HTMLElement, index: number }>} */
  const homeById = new Map();

  const linkCards = [...root.querySelectorAll('a.lab-card--hub[href]')];

  linkCards.forEach((card) => {
    if (!(card instanceof HTMLAnchorElement)) return;
    const id = calcIdFromCard(card);
    if (!id) return;
    const grid = card.parentElement;
    if (!(grid instanceof HTMLElement)) return;
    cardById.set(id, card);
    homeById.set(id, { grid, index: [...grid.children].indexOf(card) });
    card.dataset.labHubCalcId = id;
  });

  const filterRow = root.querySelector('.lab-hub-filter-row');
  const prefsRow = document.createElement('div');
  prefsRow.className = 'lab-hub-prefs-row';
  prefsRow.innerHTML = `
    <button type="button" class="lab-hub-prefs-row__btn" data-lab-hub-customize-toggle></button>
    <button type="button" class="lab-hub-prefs-row__btn lab-hub-prefs-row__btn--ghost" data-lab-hub-reset hidden></button>
  `;

  const favSection = document.createElement('div');
  favSection.className = 'lab-hub-favorites';
  favSection.hidden = true;
  favSection.innerHTML = `
    <h2 class="lab-index-section lab-index-section--hub lab-hub-favorites__title"></h2>
    <p class="lab-hub-favorites__hint muted" data-lab-hub-customize-hint hidden></p>
    <div class="lab-index-grid lab-index-grid--hub lab-hub-favorites__grid"></div>
  `;
  const favGrid = favSection.querySelector('.lab-hub-favorites__grid');
  if (!(favGrid instanceof HTMLElement)) return;

  const insertBefore = root.querySelector('.lab-index-section--hub') || filterRow?.nextElementSibling;
  if (filterRow?.parentNode) {
    filterRow.parentNode.insertBefore(prefsRow, filterRow.nextSibling);
    filterRow.parentNode.insertBefore(favSection, insertBefore || null);
  }

  const customizeBtn = prefsRow.querySelector('[data-lab-hub-customize-toggle]');
  const resetBtn = prefsRow.querySelector('[data-lab-hub-reset]');
  const customizeHint = favSection.querySelector('[data-lab-hub-customize-hint]');
  let customizeMode = false;

  function restoreHome(id) {
    const card = cardById.get(id);
    const home = homeById.get(id);
    if (!card || !home) return;
    const wrap = card.closest('.lab-hub-card-wrap');
    if (!(wrap instanceof HTMLElement)) return;
    const siblings = [...home.grid.children];
    const ref = siblings[home.index] || null;
    if (ref) home.grid.insertBefore(wrap, ref);
    else home.grid.appendChild(wrap);
  }

  function updatePinButtons(pins) {
    const set = new Set(pins);
    root.querySelectorAll('[data-lab-hub-pin]').forEach((btn) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const id = btn.getAttribute('data-lab-hub-pin');
      const on = id != null && set.has(id);
      btn.classList.toggle('lab-hub-pin--on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        on
          ? tx('Quitar de accesos r\u00e1pidos', 'Remove from shortcuts')
          : tx('Fijar arriba', 'Pin to top'),
      );
      btn.title = btn.getAttribute('aria-label') || '';
    });
  }

  function renderReorderControls() {
    favGrid.querySelectorAll('.lab-hub-reorder').forEach((el) => el.remove());
    if (!customizeMode) return;

    const pins = getLabHubPins(hubId);
    pins.forEach((id, i) => {
      const card = cardById.get(id);
      const wrap = card?.closest('.lab-hub-card-wrap');
      if (!(wrap instanceof HTMLElement)) return;

      const bar = document.createElement('div');
      bar.className = 'lab-hub-reorder';
      bar.innerHTML = `
        <button type="button" class="lab-hub-reorder__btn" data-lab-hub-move="up" ${i === 0 ? 'disabled' : ''} aria-label="${tx('Mover arriba', 'Move up')}">\u2191</button>
        <button type="button" class="lab-hub-reorder__btn" data-lab-hub-move="down" ${i === pins.length - 1 ? 'disabled' : ''} aria-label="${tx('Mover abajo', 'Move down')}">\u2193</button>
      `;
      wrap.appendChild(bar);

      bar.querySelectorAll('[data-lab-hub-move]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const dir = btn.getAttribute('data-lab-hub-move');
          const next = [...pins];
          const j = dir === 'up' ? i - 1 : i + 1;
          if (j < 0 || j >= next.length) return;
          [next[i], next[j]] = [next[j], next[i]];
          setLabHubPins(hubId, next);
          applyLayout();
        });
      });
    });
  }

  function applyLayout() {
    const pins = getLabHubPins(hubId);
    const pinSet = new Set(pins);

    pins.forEach((id) => {
      const card = cardById.get(id);
      const wrap = card?.closest('.lab-hub-card-wrap');
      if (wrap instanceof HTMLElement) favGrid.appendChild(wrap);
    });

    cardById.forEach((_card, id) => {
      if (pinSet.has(id)) return;
      restoreHome(id);
    });

    favSection.hidden = pins.length === 0;
    if (customizeHint instanceof HTMLElement) {
      customizeHint.hidden = !customizeMode || pins.length === 0;
    }
    if (resetBtn instanceof HTMLButtonElement) {
      resetBtn.hidden = pins.length === 0;
    }

    updatePinButtons(pins);
    renderReorderControls();
    root.dispatchEvent(new CustomEvent('lab-hub-layout-changed'));
  }

  function togglePin(id) {
    let pins = getLabHubPins(hubId);
    if (pins.includes(id)) {
      pins = pins.filter((x) => x !== id);
    } else {
      pins = [...pins, id];
    }
    setLabHubPins(hubId, pins);
    applyLayout();
  }

  linkCards.forEach((card) => {
    if (!(card instanceof HTMLAnchorElement)) return;
    const id = card.dataset.labHubCalcId;
    if (!id) return;

    const wrap = document.createElement('div');
    wrap.className = 'lab-hub-card-wrap';
    const parent = card.parentNode;
    if (!parent) return;
    parent.insertBefore(wrap, card);
    wrap.appendChild(card);

    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'lab-hub-pin';
    pin.setAttribute('data-lab-hub-pin', id);
    wrap.appendChild(pin);
    pin.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePin(id);
    });
  });

  function applyStaticCopy() {
    const title = favSection.querySelector('.lab-hub-favorites__title');
    if (title) {
      title.textContent = tx('Tus accesos r\u00e1pidos', 'Your shortcuts');
    }
    if (customizeHint instanceof HTMLElement) {
      customizeHint.textContent = tx(
        'Usa las flechas para ordenar. Pulsa la estrella para quitar un acceso.',
        'Use arrows to reorder. Click the star to remove a shortcut.',
      );
    }
    if (customizeBtn instanceof HTMLButtonElement) {
      customizeBtn.textContent = customizeMode
        ? tx('Listo', 'Done')
        : tx('Personalizar orden', 'Customize order');
    }
    if (resetBtn instanceof HTMLButtonElement) {
      resetBtn.textContent = tx('Restaurar orden por defecto', 'Reset default layout');
    }
    updatePinButtons(getLabHubPins(hubId));
  }

  if (customizeBtn instanceof HTMLButtonElement) {
    customizeBtn.addEventListener('click', () => {
      customizeMode = !customizeMode;
      root.classList.toggle('lab-hub-root--customize', customizeMode);
      if (customizeHint instanceof HTMLElement) {
        customizeHint.hidden = !customizeMode || getLabHubPins(hubId).length === 0;
      }
      applyStaticCopy();
      renderReorderControls();
    });
  }

  if (resetBtn instanceof HTMLButtonElement) {
    resetBtn.addEventListener('click', () => {
      clearLabHubPins(hubId);
      customizeMode = false;
      root.classList.remove('lab-hub-root--customize');
      if (customizeHint instanceof HTMLElement) customizeHint.hidden = true;
      applyLayout();
      applyStaticCopy();
    });
  }

  window.addEventListener(HOME_LANG_CHANGED_EVENT, applyStaticCopy);
  window.addEventListener('lab-language-changed', applyStaticCopy);
  window.addEventListener('mdr-lab-hub-pins-changed', () => {
    applyLayout();
    applyStaticCopy();
  });

  const boot = () => {
    applyLayout();
    applyStaticCopy();
  };

  void initUserCloudSync().finally(boot);
}
