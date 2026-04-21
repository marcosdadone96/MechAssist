/**
 * Eje sometido a torsión — tensión tangencial y diámetro mínimo (macizo).
 */

/**
 * @param {object} p
 * @param {number} p.torque_Nm
 * @param {number} p.tauAllow_MPa — tensión tangencial admisible (von Mises aprox. torsión pura)
 */
export function computeSolidShaftTorsion(p) {
  const T = Math.max(0, Number(p.torque_Nm) || 200);
  const tauMPa = Math.max(1, Number(p.tauAllow_MPa) || 40);
  const tauPa = tauMPa * 1e6;
  const d_m = Math.pow((16 * T) / (Math.PI * tauPa), 1 / 3);
  const d_mm = d_m * 1000;
  const tauActual_MPa = T > 0 && d_m > 0 ? (16 * T) / (Math.PI * d_m * d_m * d_m) / 1e6 : 0;
  return {
    torque_Nm: T,
    tauAllow_MPa: tauMPa,
    diameter_min_mm: d_mm,
    tauAtMinDiameter_MPa: tauActual_MPa,
  };
}
