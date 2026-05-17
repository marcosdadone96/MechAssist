/**
 * Hub cards: compact schematic diagram (like in each calculator) + title.
 */
import { getHubCardArt } from '../lab/hubCardIllustrations.js';

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
 * @param {import('../lab/hubCardIllustrations.js').HubCardArt} cfg
 */
function buildDiagramInner(cfg) {
  if (cfg.type === 'img') {
    return `<img src="${cfg.src}" alt="${cfg.alt || ''}" loading="lazy" decoding="async" />`;
  }
  return prepareHubDiagramSvg(cfg.svg);
}

/**
 * @param {HTMLElement} card
 * @param {import('../lab/hubCardIllustrations.js').HubCardArt} cfg
 */
function applyMinimalCard(card, cfg) {
  if (card.dataset.hubArtReady === '1') return;

  const badge = card.querySelector('.lab-badge');
  const title = card.querySelector('h3');
  const desc = card.querySelector('p');

  const visual = document.createElement('div');
  visual.className = `lab-card--hub__visual lab-card--hub__visual--${cfg.theme}`;

  const diagram = document.createElement('div');
  diagram.className = 'lab-card--hub__diagram';
  diagram.setAttribute('aria-hidden', 'true');
  diagram.innerHTML = buildDiagramInner(cfg);

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
  card.dataset.hubArtReady = '1';
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
    applyMinimalCard(card, getHubCardArt(id));
  });

  root.querySelectorAll('.lab-card--hub--soon').forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    applyMinimalCard(card, getHubCardArt('_soon'));
  });
}
