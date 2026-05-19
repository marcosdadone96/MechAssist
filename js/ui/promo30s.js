/**
 * Promo ~30 s: recorrido real inicio -> maquinas -> lab -> hidraulica.
 */

/** @typedef {'home'|'hub'|'calc-machine'|'calc-lab'|'calc-fluid'|'cta'} PromoFrame} */

const SCENES = [
  {
    key: 'home',
    url: 'index.html?promo=1',
    displayUrl: 'themechassist.com',
    ms: 3500,
    frame: 'home',
    title: 'TheMechAssist',
    lead: 'Calculadoras de ingenier\u00eda mec\u00e1nica en la nube.',
    demo: 'home',
    overlay: 'light',
  },
  {
    key: 'machines-hub',
    url: 'machines-hub.html?promo=1',
    displayUrl: 'themechassist.com/machines-hub.html',
    ms: 3000,
    frame: 'hub',
    title: 'M\u00e1quinas y transporte',
    lead: 'Cintas, elevadores, bombas, tornillos\u2026',
    demo: 'machinesHub',
    overlay: 'light',
  },
  {
    key: 'flat',
    url: 'flat-conveyor.html?promo=1',
    displayUrl: 'themechassist.com/flat-conveyor.html',
    ms: 7000,
    frame: 'calc-machine',
    title: 'Entra, introduce datos, obtiene resultados',
    lead: 'Cinta plana: tensi\u00f3n, potencia y motorreductor.',
    demo: 'flat',
    overlay: 'calc',
  },
  {
    key: 'lab-hub',
    url: 'transmission-lab.html?promo=1',
    displayUrl: 'themechassist.com/transmission-lab.html',
    ms: 3000,
    frame: 'hub',
    title: 'Laboratorio de transmisi\u00f3n',
    lead: 'Engranajes, correas, ejes, rodamientos\u2026',
    demo: 'labHub',
    overlay: 'light',
  },
  {
    key: 'gears',
    url: 'calc-gears.html?promo=1',
    displayUrl: 'themechassist.com/calc-gears.html',
    ms: 6500,
    frame: 'calc-lab',
    title: 'Transmisi\u00f3n y resistencia',
    lead: 'Par, m\u00f3dulo y dientes \u2014 actualizaci\u00f3n al vuelo.',
    demo: 'gears',
    overlay: 'calc',
  },
  {
    key: 'hydraulic',
    url: 'calc-hydraulic-cylinder.html?promo=1',
    displayUrl: 'themechassist.com/calc-hydraulic-cylinder.html',
    ms: 6000,
    frame: 'calc-fluid',
    title: 'Hidr\u00e1ulica y neum\u00e1tica',
    lead: 'Cilindros, prensas, bombas con el mismo flujo.',
    demo: 'hydraulic',
    overlay: 'calc',
  },
  {
    key: 'cta',
    url: null,
    displayUrl: 'themechassist.com',
    ms: 2500,
    frame: 'cta',
    title: 'Empieza gratis',
    lead: 'www.themechassist.com',
    demo: null,
    overlay: 'none',
  },
];

const TOTAL_MS = SCENES.reduce((s, sc) => s + sc.ms, 0);

const CALC_SCENES = new Set(['flat', 'gears', 'hydraulic']);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {number} index
 */
function setSceneUi(index) {
  const scene = SCENES[index];
  const overlay = document.getElementById('promoOverlay');
  const title = document.getElementById('promoOverlayTitle');
  const lead = document.getElementById('promoOverlayLead');
  const urlEl = document.getElementById('promoBrowserUrl');
  const browser = document.getElementById('promoBrowser');
  const cta = document.getElementById('promoCta');
  const flash = document.querySelector('.promo-flash-results');

  if (title) title.textContent = scene.title || '';
  if (lead) lead.textContent = scene.lead || '';
  if (urlEl) urlEl.textContent = scene.displayUrl || 'themechassist.com';

  const isCta = scene.key === 'cta';
  if (overlay) {
    overlay.hidden = isCta || scene.overlay === 'none';
    overlay.classList.toggle('promo-overlay--light', scene.overlay === 'light');
    overlay.classList.toggle('promo-overlay--calc', scene.overlay === 'calc');
  }
  if (browser) {
    browser.hidden = isCta;
    browser.className = `promo-browser promo-browser--${scene.frame || 'home'}`;
  }
  if (cta) cta.hidden = !isCta;
  if (flash instanceof HTMLElement) {
    flash.hidden = !CALC_SCENES.has(scene.key);
  }

  document.body.dataset.promoScene = scene.key;
}

function dispatchInput(el, value) {
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLSelectElement)) return;
  el.focus();
  el.value = String(value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * @param {Document} doc
 */
function injectPromoStyles(doc) {
  if (!doc || doc.getElementById('promo-embed-style')) return;
  const style = doc.createElement('style');
  style.id = 'promo-embed-style';
  style.textContent = `
    html[data-promo-embed="1"] .site-nav { pointer-events: none; }
    html[data-promo-embed="1"] .mdr-cookie-banner { display: none !important; }
    .promo-highlight-flash {
      outline: 3px solid #0d9488 !important;
      outline-offset: 3px;
      box-shadow: 0 0 0 10px rgba(13, 148, 136, 0.28);
    }
    .promo-card-pulse {
      outline: 3px solid #38bdf8 !important;
      outline-offset: 4px;
      transition: outline 0.2s ease;
    }
  `;
  doc.documentElement.setAttribute('data-promo-embed', '1');
  doc.head.appendChild(style);
}

/**
 * @param {Document} doc
 * @param {string} selector
 */
function scrollToSel(doc, selector) {
  const el = doc.querySelector(selector);
  if (el instanceof HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else if (doc.scrollingElement) {
    doc.scrollingElement.scrollTop = 0;
  }
}

/**
 * @param {HTMLIFrameElement} iframe
 */
async function demoHome(iframe) {
  const doc = iframe.contentDocument;
  if (!doc) return;
  injectPromoStyles(doc);
  await sleep(500);
  scrollToSel(doc, '#hub-zones');
  await sleep(900);
  scrollToSel(doc, '#hub-pricing');
}

/**
 * @param {HTMLIFrameElement} iframe
 */
async function demoMachinesHub(iframe) {
  const doc = iframe.contentDocument;
  if (!doc) return;
  injectPromoStyles(doc);
  await sleep(350);
  const card = doc.querySelector('a.lab-card--hub[href*="flat-conveyor"]');
  if (card instanceof HTMLElement) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(500);
    card.classList.add('promo-card-pulse');
    setTimeout(() => card.classList.remove('promo-card-pulse'), 1400);
  }
}

/**
 * @param {HTMLIFrameElement} iframe
 */
async function demoFlat(iframe) {
  const doc = iframe.contentDocument;
  if (!doc) return;
  injectPromoStyles(doc);
  await sleep(500);
  const mass = doc.getElementById('loadMass');
  const slider = doc.getElementById('loadMassR');
  if (mass) {
    dispatchInput(mass, '1200');
    if (slider instanceof HTMLInputElement) {
      slider.value = '1200';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await sleep(700);
  }
  const grid = doc.getElementById('resultsGrid');
  if (grid) {
    grid.classList.add('promo-highlight-flash');
    grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => grid.classList.remove('promo-highlight-flash'), 1500);
  }
}

/**
 * @param {HTMLIFrameElement} iframe
 */
async function demoLabHub(iframe) {
  const doc = iframe.contentDocument;
  if (!doc) return;
  injectPromoStyles(doc);
  await sleep(350);
  const card = doc.querySelector('a.lab-card--hub[href*="calc-gears"]');
  if (card instanceof HTMLElement) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(450);
    card.classList.add('promo-card-pulse');
    setTimeout(() => card.classList.remove('promo-card-pulse'), 1200);
  }
}

/**
 * @param {HTMLIFrameElement} iframe
 */
async function demoGears(iframe) {
  const doc = iframe.contentDocument;
  if (!doc) return;
  injectPromoStyles(doc);
  await sleep(400);
  dispatchInput(doc.getElementById('gZ1'), '24');
  await sleep(350);
  dispatchInput(doc.getElementById('gTorque'), '210');
  await sleep(600);
  const wrap = doc.getElementById('gResultsWrap');
  if (wrap) {
    wrap.classList.add('promo-highlight-flash');
    wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => wrap.classList.remove('promo-highlight-flash'), 1600);
  }
}

/**
 * @param {HTMLIFrameElement} iframe
 */
async function demoHydraulic(iframe) {
  const doc = iframe.contentDocument;
  if (!doc) return;
  injectPromoStyles(doc);
  await sleep(400);
  dispatchInput(doc.getElementById('hcLoadKg'), '2200');
  await sleep(350);
  dispatchInput(doc.getElementById('hcPressureBar'), '200');
  await sleep(600);
  const res = doc.getElementById('hcResults');
  if (res) {
    res.classList.add('promo-highlight-flash');
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => res.classList.remove('promo-highlight-flash'), 1600);
  }
}

/** @type {Record<string, (iframe: HTMLIFrameElement) => Promise<void>>} */
const DEMOS = {
  home: demoHome,
  machinesHub: demoMachinesHub,
  flat: demoFlat,
  labHub: demoLabHub,
  gears: demoGears,
  hydraulic: demoHydraulic,
};

/**
 * @param {number} index
 * @param {HTMLIFrameElement} iframe
 */
async function runSceneDemo(index, iframe) {
  const scene = SCENES[index];
  const fn = scene?.demo ? DEMOS[scene.demo] : null;
  if (!fn || !(iframe instanceof HTMLIFrameElement)) return;
  try {
    await fn(iframe);
  } catch (e) {
    console.warn('[promo30s] demo', scene.demo, e);
  }
}

/**
 * @param {HTMLIFrameElement} iframe
 * @param {string} url
 * @returns {boolean} true si se cambio la URL (hay que esperar load)
 */
function loadIframe(iframe, url) {
  if (!(iframe instanceof HTMLIFrameElement) || !url) return false;
  const target = new URL(url, window.location.href).href;
  if (iframe.src === target) return false;
  iframe.src = url;
  return true;
}

export function mountPromo30s() {
  if (location.search.includes('record=1')) {
    document.body.dataset.record = '1';
  }

  const iframe = document.getElementById('promoIframe');
  const progress = document.getElementById('promoProgressBar');
  if (progress) {
    progress.style.animation = `promoProgress ${TOTAL_MS}ms linear infinite`;
  }

  if (iframe instanceof HTMLIFrameElement) {
    iframe.src = 'index.html?promo=1';
  }

  let index = 0;
  let demoGen = 0;

  const advance = () => {
    const sceneIndex = index;
    const scene = SCENES[sceneIndex];
    setSceneUi(sceneIndex);

    if (scene.url && iframe instanceof HTMLIFrameElement) {
      const gen = ++demoGen;
      const startDemo = () => {
        if (gen !== demoGen) return;
        void runSceneDemo(sceneIndex, iframe);
      };
      const navigated = loadIframe(iframe, scene.url);
      if (navigated) {
        iframe.addEventListener('load', startDemo, { once: true });
      } else {
        setTimeout(startDemo, 200);
      }
    }

    const wait = scene.ms;
    index = (index + 1) % SCENES.length;
    setTimeout(advance, wait);
  };

  advance();
}
