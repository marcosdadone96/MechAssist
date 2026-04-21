/**
 * Shared physical constants and pure math helpers for conveyor engineering.
 * All SI internally unless noted.
 */

/** Standard gravity (m/s²) — ISO 80000-3 */
export const G = 9.80665;

/**
 * @param {number} degrees
 * @returns {number} radians
 */
export function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * @param {number} radians
 * @returns {number} degrees
 */
export function radToDeg(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * Clamp numeric input for stable diagrams / UX.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Parse user number; returns fallback if NaN.
 * @param {string|number} raw
 * @param {number} fallback
 */
export function parsePositive(raw, fallback) {
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

/**
 * Parse non-negative (allows zero).
 */
export function parseNonNegative(raw, fallback) {
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

/**
 * Mechanical power from force and velocity: P = F · v (collinear, same direction).
 * @param {number} force_N
 * @param {number} velocity_m_s
 * @returns {number} W
 */
export function powerFromForceVelocity(force_N, velocity_m_s) {
  return force_N * velocity_m_s;
}

/**
 * Torque from tangential force at drum periphery: T = F * (D/2).
 * @param {number} force_N
 * @param {number} drumDiameter_m
 * @returns {number} N·m
 */
export function torqueFromForceAtDrum(force_N, drumDiameter_m) {
  return force_N * (drumDiameter_m / 2);
}

/**
 * Motor shaft power accounting for drivetrain efficiency: P_motor = P_load / η.
 * @param {number} loadPower_W
 * @param {number} efficiency_0_1 — fraction, e.g. 0.85
 * @returns {number} W
 */
export function motorPowerWithEfficiency(loadPower_W, efficiency_0_1) {
  if (efficiency_0_1 <= 0 || efficiency_0_1 > 1) return NaN;
  return loadPower_W / efficiency_0_1;
}
