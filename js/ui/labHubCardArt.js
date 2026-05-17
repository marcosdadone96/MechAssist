/**
 * Hub cards: icono distintivo + titulo (layout minimal).
 */
import { getHubCardArt } from '../lab/hubCardIllustrations.js';
import { getHubMinimalGlyph } from '../lab/hubCardMinimalGlyphs.js';

/**
 * @param {import('../lab/hubCardIllustrations.js').HubCardArt} cfg
 * @param {string} calcId
 */
function buildDiagramInner(cfg, calcId) {
  if (cfg.type === 'img') {
    return `<img src="${cfg.src}" alt="${cfg.alt || ''}" loading="lazy" decoding="async" />`;
  }
  if (cfg.type === 'svg' && cfg.svg) {
    const prepared = prepareHubDiagramSvg(cfg.svg);
    if (prepared) return prepared;
  }
  const theme =
    cfg.theme === 'machine' ? 'machine' : cfg.theme === 'fluid' ? 'fluid' : undefined;
  const glyph = getHubMinimalGlyph(calcId, theme);
  return `<span class="lab-card--hub__glyph">${glyph}</span>`;
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
  if (card.dataset.hubArtReady === '2') return;

  const badge = card.querySelector('.lab-badge');
  const title = card.querySelector('h3');
  const desc = card.querySelector('p');

  const visual = document.createElement('div');
  visual.className = `lab-card--hub__visual lab-card--hub__visual--${cfg.theme}`;

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
  card.dataset.hubArtReady = '2';
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
    const id = href.split('/').pop() || href;
    applyMinimalCard(card, getHubCardArt(id), id);
  });

  root.querySelectorAll('.lab-card--hub--soon').forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    applyMinimalCard(card, getHubCardArt('_soon'), '_soon');
  });
}
