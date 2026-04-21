/**
 * Presentación coherente SI en la UI del laboratorio.
 */

import { mmToM, rpmToRevPerSec } from './siUnits.js';

/**
 * @param {number | null | undefined} omega_rad_s
 */
export function formatOmega(omega_rad_s) {
  if (omega_rad_s == null || !Number.isFinite(omega_rad_s)) return '—';
  return `${omega_rad_s.toFixed(4)} rad/s`;
}

/**
 * @param {number | null | undefined} rpm
 */
export function formatRpmLine(rpm) {
  if (rpm == null || !Number.isFinite(rpm)) return '—';
  const rps = rpmToRevPerSec(rpm);
  return `${rpm.toFixed(2)} min⁻¹ · ${rps.toFixed(5)} s⁻¹ (rev/s)`;
}

/**
 * Longitud: muestra m (SI) y mm entre paréntesis
 * @param {number} mm
 */
export function formatLengthDual(mm) {
  if (!Number.isFinite(mm)) return '—';
  const m = mmToM(mm);
  return `${m.toFixed(6)} m (${mm.toFixed(3)} mm)`;
}
