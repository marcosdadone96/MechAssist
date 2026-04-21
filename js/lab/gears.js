/**
 * Par de engranajes cilíndricos rectos — relación, distancia entre ejes, diámetros, cinemática en primitivo.
 */

import { rpmToRadPerSec } from './siUnits.js';

/**
 * @param {object} p
 * @param {number} p.z1
 * @param {number} p.z2
 * @param {number} p.module_mm
 * @param {number} [p.pressureAngle_deg] — 20 típico
 * @param {number} [p.n1] — rpm motor en rueda 1
 * @param {number} [p.faceWidth_mm] — ancho de cara b (mm)
 */
export function computeSpurGearPair(p) {
  const m = Math.max(0.2, Number(p.module_mm) || 2);
  const z1 = Math.max(6, Math.round(Number(p.z1) || 20));
  const z2 = Math.max(6, Math.round(Number(p.z2) || 40));
  const alphaDeg = Number(p.pressureAngle_deg);
  const α = ((Number.isFinite(alphaDeg) ? alphaDeg : 20) * Math.PI) / 180;

  const d1 = m * z1;
  const d2 = m * z2;
  const ha = m;
  const hf = 1.25 * m;
  const da1 = d1 + 2 * ha;
  const da2 = d2 + 2 * ha;
  const df1 = d1 - 2 * hf;
  const df2 = d2 - 2 * hf;
  const db1 = d1 * Math.cos(α);
  const db2 = d2 * Math.cos(α);
  const a = (d1 + d2) / 2;
  const i = z2 / z1;
  const n1 = Number(p.n1);
  const n1f = Number.isFinite(n1) && n1 > 0 ? n1 : null;
  const n2 = n1f != null ? (n1f * z1) / z2 : null;
  const omega1_rad_s = n1f != null ? rpmToRadPerSec(n1f) : null;
  const omega2_rad_s = n2 != null ? rpmToRadPerSec(n2) : null;

  const v_pitch_m_s = n1f != null ? (Math.PI * d1 * n1f) / 60000 : null;

  const bIn = Number(p.faceWidth_mm);
  const faceWidth_mm = Number.isFinite(bIn) && bIn > 0 ? bIn : null;

  return {
    z1,
    z2,
    module_mm: m,
    pressureAngle_deg: (α * 180) / Math.PI,
    d1,
    d2,
    da1,
    da2,
    df1,
    df2,
    db1,
    db2,
    centerDistance_mm: a,
    ratio: i,
    ratio_transmission: i,
    n1: n1f,
    n2,
    omega1_rad_s,
    omega2_rad_s,
    v_pitch_m_s,
    faceWidth_mm,
  };
}
