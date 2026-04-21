/**
 * Magnitudes SI para el laboratorio — rotación: rad/s (principal), s⁻¹ y min⁻¹ como apoyo.
 */

export const TWO_PI = 2 * Math.PI;

/** min⁻¹ → rad/s */
export function rpmToRadPerSec(rpm) {
  return (TWO_PI * rpm) / 60;
}

/** rad/s → min⁻¹ */
export function radPerSecToRpm(omega) {
  return (60 * omega) / TWO_PI;
}

/** min⁻¹ → revoluciones por segundo (s⁻¹) */
export function rpmToRevPerSec(rpm) {
  return rpm / 60;
}

/** mm → m */
export function mmToM(mm) {
  return mm / 1000;
}
