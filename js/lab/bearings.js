/**
 * Vida básica L10 — ISO 281 forma simplificada (bolas p=3, rodillos p=10/3).
 */

import { rpmToRadPerSec } from './siUnits.js';

/**
 * @param {object} p
 * @param {number} p.dynamicLoad_N — C catálogo
 * @param {number} p.equivalentLoad_N — P
 * @param {'ball'|'roller'} p.type
 */
export function computeBearingL10(p) {
  const C = Math.max(100, Number(p.dynamicLoad_N) || 25500);
  const P = Math.max(1, Number(p.equivalentLoad_N) || 7800);
  const type = p.type === 'roller' ? 'roller' : 'ball';
  const exp = type === 'roller' ? 10 / 3 : 3;
  const L10_million = Math.pow(C / P, exp);
  const L10_rev = L10_million * 1e6;
  const n = Number(p.speed_rpm);
  const nf = Number.isFinite(n) && n > 0 ? n : null;
  const nh = nf != null ? L10_rev / (60 * nf) : null;
  const omega_rad_s = nf != null ? rpmToRadPerSec(nf) : null;
  return {
    dynamicLoad_N: C,
    equivalentLoad_N: P,
    type,
    L10_million_rev: L10_million,
    L10_rev: L10_rev,
    nominalLife_hours: nh,
    speed_rpm: nf,
    omega_rad_s,
  };
}

/**
 * Carga dinámica mínima C (N) para alcanzar L₁₀ en horas a velocidad n y carga P (ISO 281 forma básica).
 * L = (C/P)^p en millones de rev; L₁₀(rev) = 60·n·h.
 * @param {{ equivalentLoad_N: number; type: 'ball'|'roller'; L10_target_hours: number; speed_rpm: number }} p
 * @returns {number | null}
 */
export function requiredDynamicLoadC_N(p) {
  const P = Math.max(1e-9, Number(p.equivalentLoad_N) || 0);
  const type = p.type === 'roller' ? 'roller' : 'ball';
  const exp = type === 'roller' ? 10 / 3 : 3;
  const n = Number(p.speed_rpm);
  const h = Number(p.L10_target_hours);
  if (!(n > 0) || !(h > 0)) return null;
  const L10_rev = 60 * n * h;
  const L10_million = L10_rev / 1e6;
  if (!(L10_million > 0)) return null;
  return P * Math.pow(L10_million, 1 / exp);
}
