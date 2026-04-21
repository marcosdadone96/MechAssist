/**
 * Tornillería métrica ISO 898-1 — datos orientativos (precarga y par tipo catálogo montaje).
 * A_s mm², Rp MPa, T_apriete N·m con K≈0.20, μ≈0.14 (valores de banco de ensayo genéricos).
 */

export const METRIC_THREAD_PITCH = {
  6: 1.0,
  8: 1.25,
  10: 1.5,
  12: 1.75,
  14: 2.0,
  16: 2.0,
  18: 2.5,
  20: 2.5,
  22: 2.5,
  24: 3.0,
  27: 3.0,
  30: 3.5,
  33: 3.5,
  36: 4.0,
};

/** Rp0.2 MPa aproximado por grado */
export const GRADE_PROOF_MPA = {
  '8.8': 640,
  '10.9': 900,
  '12.9': 1080,
};

/**
 * Área tensión A_s ISO 898-1 aproximación: π/16 * (d3 + d2)^2 con d2=d-0.6495P, d3=d-1.2268P
 */
export function metricTensileStressArea_mm2(d_nom, pitch) {
  const d2 = d_nom - 0.6495 * pitch;
  const d3 = d_nom - 1.226869 * pitch;
  return (Math.PI / 16) * (d3 + d2) * (d3 + d2);
}

/**
 * Fila catálogo: precarga recomendada 75% Rp * A_s, par K F d
 */
export function boltRowCatalog(d_mm, grade) {
  const P = METRIC_THREAD_PITCH[d_mm];
  if (!P) return null;
  const As = metricTensileStressArea_mm2(d_mm, P);
  const Rp = GRADE_PROOF_MPA[grade];
  if (!Rp) return null;
  const Fv = 0.75 * Rp * As; // N (orientativo montaje)
  const K = 0.2;
  const T_nm = (K * Fv * d_mm) / 1000;
  const Ft_Rd_kN = (Rp * As) / 1000 / 1.25; // resistencia cálculo simplificada EN (orden de magnitud)
  return { d_mm, pitch_mm: P, As_mm2: As, Rp_MPa: Rp, F_preload_N: Fv, T_tighten_Nm: T_nm, Ft_Rd_kN };
}

export const BOLT_DIAMETERS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30, 33, 36];
