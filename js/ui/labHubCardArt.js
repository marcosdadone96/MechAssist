/**
 * Hub cards: icono distintivo + titulo (layout minimal).
 */
import { getHubCardArt } from '../lab/hubCardIllustrations.js';
import { getHubMinimalGlyph } from '../lab/hubCardMinimalGlyphs.js';
import { HUB_MACHINE_ART_SVG } from '../lab/hubMachineArtSvgs.js';

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
 */
function resolveCardArt(calcId, cfg) {
  if (calcId && HUB_MACHINE_ART_SVG[calcId]) {
    return { theme: 'machine', type: 'svg', svg: HUB_MACHINE_ART_SVG[calcId] };
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
 * @param {import('../lab/hubCardIllustrations.js').HubCardArt} cfg
 * @param {string} calcId
 */
function buildDiagramInner(cfg, calcId) {
  if (cfg.type === 'img') {
    return `<img src="${cfg.src}" alt="${cfg.alt || ''}" loading="lazy" decoding="async" />`;
  }

  const resolved = resolveCardArt(calcId, cfg);
  const theme =
    resolved.theme === 'machine'
      ? 'machine'
      : resolved.theme === 'fluid'
        ? 'fluid'
        : undefined;

  const svgSource =
    (calcId && HUB_MACHINE_ART_SVG[calcId]) ||
    (resolved.type === 'svg' ? resolved.svg : '');

  if (svgSource) {
    const prepared = prepareHubDiagramSvg(svgSource);
    if (preparedDiagramHasShapes(prepared)) return prepared;
  }

  return `<span class="lab-card--hub__glyph">${getHubMinimalGlyph(calcId, theme)}</span>`;
}

/**
 * Strip full-card background and caption chrome so the mini diagram reads clearly.
 * @param {string} raw
 */
function prepareHubDiagramSvg(raw) {
  if (!raw) return '';
  let s = raw;
  s = s.replace(/viewBox="0 0 200 130"/gi, 'viewBox="0 0 200 104"');
  s = s.replace(/<rect\s+width="160"\s+height="96"[^>]*\/?>\s*/gi, '');
  s = s.replace(/<rect\s+width="200"\s+height="(?:104|130)"[^>]*\/?>\s*/gi, '');
  s = s.replace(/<rect\s+x="0"\s+y="104"[\s\S]*?<\/text>\s*/gi, '');
  s = s.replace(/\s*<text[\s\S]*?<\/text>/gi, '');
  return s.trim();
}

/**
 * @param {HTMLElement} card
 * @param {import('../lab/hubCardIllustrations.js').HubCardArt} cfg
 * @param {string} calcId
 */
function applyMinimalCard(card, cfg, calcId) {
  if (card.dataset.hubArtReady === '3') return;

  const resolved = resolveCardArt(calcId, cfg);
  const badge = card.querySelector('.lab-badge');
  const title = card.querySelector('h3');
  const desc = card.querySelector('p');

  const visual = document.createElement('di' + 'v');
  visual.className = `lab-card--hub__visual lab-card--hub__visual--${resolved.theme}`;

  const diagram = document.createElement('di' + 'v');
  diagram.className = 'lab-card--hub__diagram';
  diagram.setAttribute('aria-hidden', 'true');
  diagram.innerHTML = buildDiagramInner(cfg, calcId);

  visual.appendChild(diagram);

  const body = document.createElement('di' + 'v');
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
  card.dataset.hubArtReady = '3';
}

/**
 * @param {ParentNode} root
 */
export function initLabHubCardArt(root) {
  if (!(root instanceof HTMLElement)) return;

  root.querySelectorAll('a.lab-card--hub[href]').forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    const href = card.getAttribute('href');
    if (!href) return;
    const id = calcIdFromHref(href);
    applyMinimalCard(card, getHubCardArt(id), id);
  });

  root.querySelectorAll('.lab-card--hub--soon').forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    applyMinimalCard(card, getHubCardArt('_soon'), '_soon');
  });
}
