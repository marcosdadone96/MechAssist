/**
 * Utilidades de accionamiento (rpm de tambor, etc.).
 */

/**
 * RPM aproximados del tambor a partir de velocidad lineal y diámetro.
 * @param {number} v_m_s
 * @param {number} drumDiameter_m
 */
export function drumRpmFromBeltSpeed(v_m_s, drumDiameter_m) {
  if (drumDiameter_m <= 0 || v_m_s < 0) return 0;
  return (v_m_s / (Math.PI * drumDiameter_m)) * 60;
}
