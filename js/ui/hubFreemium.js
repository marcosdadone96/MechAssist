/**
 * Marca en el hub qué calculador es gratuito y cuál es Pro (según estrategia y tier).
 */

import { getEffectiveTier, isToolUnlocked } from '../services/accessTier.js';

function toolFromHref(href) {
  if (href.includes('flat-conveyor')) return 'flat';
  if (href.includes('inclined-conveyor')) return 'inclined';
  if (href.includes('centrifugal-pump')) return 'pump';
  if (href.includes('screw-conveyor')) return 'screw';
  return null;
}

document.querySelectorAll('.hub-rim--machines a.hub-node--go[href]').forEach((a) => {
  const tool = toolFromHref(a.getAttribute('href') || '');
  if (!tool) return;

  const badge = document.createElement('span');
  const tier = getEffectiveTier();

  if (tier === 'premium') {
    badge.className = 'hub-badge hub-badge--ok';
    badge.textContent = 'Acceso Pro';
  } else if (isToolUnlocked(tool)) {
    badge.className = 'hub-badge hub-badge--free';
    badge.textContent = 'Gratis';
  } else {
    badge.className = 'hub-badge hub-badge--pro';
    badge.textContent = 'Pro';
  }

  a.appendChild(badge);
});
