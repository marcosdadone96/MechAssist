/**
 * Lienzo técnico Pro — acceso con mismo criterio que Estudio modular.
 */

import { mountTierStatusBar } from './paywallMount.js';
import { isPremiumEffective, activateProDemoInBrowser } from '../services/accessTier.js';

mountTierStatusBar();

const app = document.getElementById('txApp');
const pay = document.getElementById('txPaywall');

document.getElementById('txActivateDemo')?.addEventListener('click', () => {
  activateProDemoInBrowser();
});

if (isPremiumEffective()) {
  if (pay) pay.hidden = true;
  if (app) app.hidden = false;
  await import('./transmissionCanvasPage.js');
} else {
  if (pay) pay.hidden = false;
  if (app) app.hidden = true;
}
