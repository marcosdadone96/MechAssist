/**
 * Estudio modular — solo con Pro efectivo.
 */

import { mountTierStatusBar } from './paywallMount.js';
import { patchLabPaywallQueryProLink } from './patchLabPaywallQueryProLink.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { startProCheckoutFlow } from '../services/proCheckoutFlow.js';

mountTierStatusBar();
patchLabPaywallQueryProLink('studioPaywall');

const app = document.getElementById('studioApp');
const pay = document.getElementById('studioPaywall');

document.getElementById('studioActivateDemo')?.addEventListener('click', () => {
  startProCheckoutFlow();
});

if (isPremiumEffective()) {
  if (pay) pay.hidden = true;
  if (app) app.hidden = false;
  await import('./transmissionStudioPage.js');
} else {
  if (pay) pay.hidden = false;
  if (app) app.hidden = true;
}
