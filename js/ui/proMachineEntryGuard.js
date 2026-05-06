/**
 * Bloqueo de pùgina completa para calculadoras listadas en PRO_CALCULATOR_PATHS
 * (excepto lienzo, que tiene su propio paywall en el DOM).
 */

import { isProMachineAppPath } from '../config/freemium.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { mountProMachinePaywall } from './paywallMount.js';

/**
 * @returns {boolean} true si debe cargarse el mùdulo de cùlculo
 */
export function runProMachineEntryGuard() {
  if (!isProMachineAppPath(window.location.pathname)) return true;
  if (isPremiumEffective()) return true;
  mountProMachinePaywall();
  return false;
}
