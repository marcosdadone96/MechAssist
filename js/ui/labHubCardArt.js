/**
 * Hub cards: icono distintivo + titulo (layout minimal).
 */
import { getHubCardArt } from '../lab/hubCardIllustrations.js';
import { getHubMinimalGlyph } from '../lab/hubCardMinimalGlyphs.js';

/** Calculadoras del hub Máquinas (y mismas rutas en otros hubs). */
export const MACHINE_HUB_SLUGS = new Set([
  'centrifugal-pump.html',
  'flat-conveyor.html',
  'roller-conveyor.html',
  'inclined-conveyor.html',
  'bucket-elevator.html',
  'screw-conveyor.html',
  'traction-elevator.html',
  'car-lift-screw.html',
]);

const HUB_ART_VERSION = '5';

/** @type {Record<string, string> | null} */
let machineArtCache = null;

/** @returns {Promise<Record<string, string>>} */
async function loadMachineArt() {
  if (machineArtCache) return machineArtCache;
  try {
    const mod = await import('../lab/hubMachineArtSvgs.js');
    machineArtCache =
      mod && typeof mod.HUB_MACHINE_ART_SVG === 'object' ? mod.HUB_MACHINE_ART_SVG : {};
  } catch (e) {
    console.warn('[labHubCardArt] hubMachineArtSvgs.js no disponible, iconos minimal.', e);
    machineArtCache = {};
  }
  return machineArtCache;
}

/** @param {string} href */
function calcIdFromHref(href) {
  if (!href) return '';
  try {
    const path = new URL(href, window.location.href).pathname;
    return (path.split('/').pop() || '').split('?')[0].split('#')[0];
  } catch {
    return (href.split('/').pop() || href).split('?')[0].split('#')[0];
  }
}

/**
 * @param {string} calcId
 * @param {import('../lab/hubCardIllustrations.js').HubCardArt} cfg
 * @param {Record<string, string>} machineArt
 */
function resolveCardArt(calcId, cfg, machineArt) {
  const machineSvg = calcId && machineArt[calcId];
  if (machineSvg) {
    return { theme: 'machine', type: 'svg', svg: machineSvg };
  }
  if (MACHINE_HUB_SLUGS.has(calcId)) {
    return { theme: 'machine', type: 'svg', svg: '' };
  }
  return cfg;
}

/**
 * @param {string} prepared
 */
function preparedDiagramHasShapes(prepared) {
  return (
    prepared.length > 48 && /<(?:path|circle|line|polyline|polygon|ellipse)\b/i.test(prepared)
  );
}

/**
 * @param {string} raw
 */
function prepareHubDiagramSvg(raw) {
  if (!raw) return '';
  let s = raw;
  s = s.replace(/viewBox="0 0 200 130"/gi, 'viewBox="0 0 200 104"');
  s = s.replace(/<rect\s+width="200"\s+height="104"[^>]*\/?>\s*/gi, '');
  s = s.replace(/<rect\s+x="0"\s+y="104"[\s\S]*?<\/text>\s*/gi, '');
  s = s.replace(/\s*<text[\s\S]*?<\/text>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  return s.trim();
}

/**
 * @param {HTMLElement} diagram
 * @param {string} rawSvg
 * @returns {boolean}
 */
function mountSvgInDiagram(diagram, rawSvg) {
  const prepared = prepareHubDiagramSvg(rawSvg);
  if (!preparedDiagramHasShapes(prepared)) return false;

  try {
    const doc = new DOMParser().parseFromString(prepared, 'image/svg+xml');
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== 'svg') return false;
    if (doc.querySelector('parsererror')) return false;
    diagram.replaceChildren(document.importNode(svg, true));
    return true;
  } catch (_) {
    /* innerHTML fallback */
  }

  try {
    diagram.innerHTML = prepared;
    return diagram.querySelector('svg') instanceof SVGSVGElement;
  } catch (_) {
    return false;
  }
}

/**
 * @param {HTMLElement} diagram
 * @param {string} calcId
 * @param {string} [theme]
 */
function mountGlyphInDiagram(diagram, calcId, theme) {
  const glyphTheme =
    MACHINE_HUB_SLUGS.has(calcId) || theme === 'machine' ? 'machine' : theme;
  const wrap = document.createElement('span');
  wrap.className = 'lab-card--hub__glyph';
  wrap.innerHTML = getHubMinimalGlyph(calcId, glyphTheme);
  diagram.replaceChildren(wrap);
}

/**
 * @param {HTMLElement} diagram
 * @param {import('../lab/hubCardIllustrations.js').HubCardArt} cfg
 * @param {string} calcId
 * @param {Record<string, string>} machineArt
 */
function fillDiagram(diagram, cfg, calcId, machineArt) {
  if (cfg.type === 'img' && cfg.src) {
    const img = document.createElement('img');
    img.src = cfg.src;
    img.alt = cfg.alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    diagram.replaceChildren(img);
    return;
  }

  const resolved = resolveCardArt(calcId, cfg, machineArt);
  const svgRaw =
    (calcId && machineArt[calcId]) ||
    (resolved.type === 'svg' && resolved.svg ? resolved.svg : '');

  if (svgRaw && mountSvgInDiagram(diagram, svgRaw)) return;

  mountGlyphInDiagram(diagram, calcId, resolved.theme);
}

/**
 * @param {HTMLElement} card
 * @param {import('../lab/hubCardIllustrations.js').HubCardArt} cfg
 * @param {string} calcId
 * @param {Record<string, string>} machineArt
 */
function applyMinimalCard(card, cfg, calcId, machineArt) {
  if (card.dataset.hubArtReady === HUB_ART_VERSION) return;

  const resolved = resolveCardArt(calcId, cfg, machineArt);
  const badge = card.querySelector('.lab-badge');
  const title = card.querySelector('h3');
  const desc = card.querySelector('p');

  const visual = document.createElement('div');
  visual.className = `lab-card--hub__visual lab-card--hub__visual--${resolved.theme}`;

  const diagram = document.createElement('div');
  diagram.className = 'lab-card--hub__diagram';
  diagram.setAttribute('aria-hidden', 'true');
  fillDiagram(diagram, cfg, calcId, machineArt);

  visual.appendChild(diagram);

  const body = document.createElement('div');
  body.className = 'lab-card--hub__body';
  if (title) body.appendChild(title);
  if (desc) body.appendChild(desc);

  const chev = document.createElement('span');
  chev.className = 'lab-card--hub__chev';
  chev.setAttribute('aria-hidden', 'true');

  card.replaceChildren();
  card.append(visual, body, chev);
  if (badge) card.appendChild(badge);

  card.classList.add('lab-card--hub--minimal');
  card.classList.remove('lab-card--hub--illustrated');
  card.dataset.hubArtReady = HUB_ART_VERSION;
}

/**
 * @param {ParentNode} root
 */
export async function initLabHubCardArt(root) {
  if (!(root instanceof HTMLElement)) return;

  const machineArt = await loadMachineArt();

  root.querySelectorAll('a.lab-card--hub[href]').forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    const href = card.getAttribute('href');
    if (!href) return;
    const id = calcIdFromHref(href);
    applyMinimalCard(card, getHubCardArt(id), id, machineArt);
  });

  root.querySelectorAll('.lab-card--hub--soon').forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    applyMinimalCard(card, getHubCardArt('_soon'), '_soon', machineArt);
  });
}
