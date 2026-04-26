/**
 * Lienzo técnico Pro — acceso con mismo criterio que Estudio modular.
 */

import { mountTierStatusBar } from './paywallMount.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { startProCheckoutFlow } from '../services/proCheckoutFlow.js';

mountTierStatusBar();

const app = document.getElementById('txApp');
const pay = document.getElementById('txPaywall');

document.getElementById('txActivateDemo')?.addEventListener('click', () => {
  startProCheckoutFlow();
});

if (isPremiumEffective()) {
  if (pay) pay.hidden = true;
  if (app) app.hidden = false;
  await import('./transmissionCanvasPage.js');
} else {
  if (pay) pay.hidden = false;
  if (app) app.hidden = true;
}
