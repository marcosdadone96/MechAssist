/**
 * Estudio modular — solo con Pro efectivo.
 */

import { mountTierStatusBar } from './paywallMount.js';
import { isPremiumEffective, activateProDemoInBrowser } from '../services/accessTier.js';

mountTierStatusBar();

const app = document.getElementById('studioApp');
const pay = document.getElementById('studioPaywall');

document.getElementById('studioActivateDemo')?.addEventListener('click', () => {
  activateProDemoInBrowser();
});

if (isPremiumEffective()) {
  if (pay) pay.hidden = true;
  if (app) app.hidden = false;
  await import('./transmissionStudioPage.js');
} else {
  if (pay) pay.hidden = false;
  if (app) app.hidden = true;
}
