/**
 * Par de engranajes cilíndricos (rectos u helicoidales) — primitivos, distancia entre ejes, cinemática.
 * Convención: **module_mm** es el módulo **normal** mₙ (catálogo / fresado). Si β = 0, mₙ = mₜ (recto).
 */

import { rpmToRadPerSec } from './siUnits.js';

/**
 * @param {object} p
 * @param {number} p.z1
 * @param {number} p.z2
 * @param {number} p.module_mm — módulo normal mₙ (mm)
 * @param {number} [p.pressureAngle_deg] — ángulo de presión **normal** αₙ (20° típico)
 * @param {number} [p.helixAngle_deg] — ángulo de hélice β en el cilindro primitivo (0 = recto)
 * @param {number} [p.n1] — rpm motor en rueda 1
 * @param {number} [p.faceWidth_mm] — ancho de cara b (mm)
 */
export function computeSpurGearPair(p) {
  const mn = Math.max(0.2, Number(p.module_mm) || 2);
  const betaDegRaw = Number(p.helixAngle_deg);
  const betaDeg = Number.isFinite(betaDegRaw) ? Math.max(0, Math.min(45, betaDegRaw)) : 0;
  const β = (betaDeg * Math.PI) / 180;
  const cosB = Math.cos(β);
  const cosBSafe = Math.max(0.5, cosB);

  const alphaNDeg = Number(p.pressureAngle_deg);
  const αn = ((Number.isFinite(alphaNDeg) ? alphaNDeg : 20) * Math.PI) / 180;

  const z1 = Math.max(6, Math.round(Number(p.z1) || 20));
  const z2 = Math.max(6, Math.round(Number(p.z2) || 40));

  const mt = β < 1e-12 ? mn : mn / cosBSafe;
  const αt = Math.atan(Math.tan(αn) / cosBSafe);

  const d1 = mt * z1;
  const d2 = mt * z2;
  const ha = mn;
  const hf = 1.25 * mn;
  const da1 = d1 + 2 * ha;
  const da2 = d2 + 2 * ha;
  const df1 = d1 - 2 * hf;
  const df2 = d2 - 2 * hf;
  const db1 = d1 * Math.cos(αt);
  const db2 = d2 * Math.cos(αt);
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
    /** Módulo normal mₙ (entrada de usuario; en recto coincide con mₜ). */
    module_mm: mn,
    module_normal_mm: mn,
    module_transverse_mm: mt,
    helixAngle_deg: betaDeg,
    pressureAngle_deg: (αn * 180) / Math.PI,
    pressureAngle_normal_deg: (αn * 180) / Math.PI,
    pressureAngle_transverse_deg: (αt * 180) / Math.PI,
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
