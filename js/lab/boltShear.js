/**
 * Bolt shear / bearing / slip ù indicative (complements ISO 898 tension calc).
 */

/** @typedef {'4.6'|'5.6'|'6.8'|'8.8'|'10.9'|'12.9'} BoltClass */
/** @typedef {'single'|'double'} ShearPlanes */
/** @typedef {'s235'|'s275'|'s355'|'al6061'} PlateMaterial */
/** @typedef {'safe'|'tight'|'unsafe'} CheckLevel */

/** @type {Record<BoltClass, { Rp0_2_MPa: number, fub_MPa: number }>} */
export const BOLT_CLASS_PROPS = {
  '4.6': { Rp0_2_MPa: 240, fub_MPa: 400 },
  '5.6': { Rp0_2_MPa: 300, fub_MPa: 500 },
  '6.8': { Rp0_2_MPa: 480, fub_MPa: 600 },
  '8.8': { Rp0_2_MPa: 640, fub_MPa: 800 },
  '10.9': { Rp0_2_MPa: 900, fub_MPa: 1000 },
  '12.9': { Rp0_2_MPa: 1080, fub_MPa: 1200 },
};

/** @type {Record<PlateMaterial, { fu_MPa: number, labelKey: string }>} */
export const PLATE_MATERIALS = {
  s235: { fu_MPa: 360, labelKey: 's235' },
  s275: { fu_MPa: 430, labelKey: 's275' },
  s355: { fu_MPa: 510, labelKey: 's355' },
  al6061: { fu_MPa: 310, labelKey: 'al6061' },
};

const NET_SHEAR_FACTOR = 0.78;
const VON_MISES_SHEAR = 0.577;
const PRELOAD_FUB_FACTOR = 0.7;
const BEARING_GAMMA = 2.5;

/**
 * Bolt positions (mm) for top view ù symmetric pattern around origin.
 * @param {number} n
 * @param {number} spacing_mm
 * @returns {{ x: number, y: number }[]}
 */
export function boltPatternPositions(n, spacing_mm) {
  const s = Math.max(spacing_mm, 1);
  const nInt = Math.max(1, Math.round(n));
  if (nInt === 1) return [{ x: 0, y: 0 }];
  if (nInt === 2) return [
    { x: -s / 2, y: 0 },
    { x: s / 2, y: 0 },
  ];
  if (nInt === 4) {
    const h = s / 2;
    return [
      { x: -h, y: -h },
      { x: h, y: -h },
      { x: h, y: h },
      { x: -h, y: h },
    ];
  }
  const r = s * 0.55;
  return Array.from({ length: nInt }, (_, i) => {
    const ang = (i / nInt) * 2 * Math.PI - Math.PI / 2;
    return { x: r * Math.cos(ang), y: r * Math.sin(ang) };
  });
}

/**
 * Per-bolt shear (N) with eccentricity e_mm (force line offset +Y from centroid).
 * @param {number} F_N
 * @param {number} n
 * @param {number} e_mm
 * @param {{ x: number, y: number }[]} positions
 */
export function boltShearDistribution(F_N, n, e_mm, positions) {
  const nB = positions.length;
  const J = positions.reduce((s, p) => s + p.x * p.x + p.y * p.y, 0) || 1;
  const M = F_N * e_mm;
  return positions.map((p, idx) => {
    const vx = F_N / nB + (M * p.y) / J;
    const vy = -(M * p.x) / J;
    const V = Math.sqrt(vx * vx + vy * vy);
    return { index: idx + 1, x: p.x, y: p.y, V_N: V, vx, vy };
  });
}

/**
 * @param {object} p
 * @param {number} p.d_mm
 * @param {BoltClass} p.boltClass
 * @param {number} p.n
 * @param {ShearPlanes} p.shearPlanes
 * @param {number} p.F_N
 * @param {number} p.t_mm
 * @param {number} p.mu
 * @param {PlateMaterial} p.plateMaterial
 * @param {number} [p.ecc_mm]
 * @param {number} [p.spacing_mm]
 */
export function computeBoltShear(p) {
  const d = Math.max(1, p.d_mm);
  const n = Math.max(1, Math.round(p.n));
  const planes = p.shearPlanes === 'double' ? 2 : 1;
  const F = Math.max(0, p.F_N);
  const t = Math.max(0.1, p.t_mm);
  const mu = Math.max(0, p.mu);
  const ecc = p.ecc_mm ?? 0;
  const spacing = p.spacing_mm ?? 3 * d;

  const props = BOLT_CLASS_PROPS[p.boltClass] ?? BOLT_CLASS_PROPS['8.8'];
  const plate = PLATE_MATERIALS[p.plateMaterial] ?? PLATE_MATERIALS.s355;

  const A_tensil = (Math.PI / 4) * d * d;
  const A_shear = NET_SHEAR_FACTOR * A_tensil;

  const positions = boltPatternPositions(n, spacing);
  const distribution = boltShearDistribution(F, n, ecc, positions);
  const V_max = Math.max(...distribution.map((b) => b.V_N), 0);
  const criticalBolt = distribution.reduce((a, b) => (b.V_N > a.V_N ? b : a), distribution[0]);

  const V_bolt_mean = F / (n * planes);
  const tau_mean_MPa = V_bolt_mean / A_shear;
  const tau_max_MPa = V_max / A_shear;

  const sigma_bearing_MPa = F / (n * d * t);
  const tau_adm_MPa = VON_MISES_SHEAR * props.Rp0_2_MPa;
  const sigma_bearing_adm_MPa = plate.fu_MPa / BEARING_GAMMA;

  const nf_shear_mean = tau_mean_MPa > 1e-9 ? tau_adm_MPa / tau_mean_MPa : Infinity;
  const nf_shear_max = tau_max_MPa > 1e-9 ? tau_adm_MPa / tau_max_MPa : Infinity;
  const nf_bearing = sigma_bearing_MPa > 1e-9 ? (BEARING_GAMMA * plate.fu_MPa) / sigma_bearing_MPa : Infinity;

  const Fp_N = PRELOAD_FUB_FACTOR * props.fub_MPa * A_tensil;
  const Fv_slip_one = mu * Fp_N * planes;
  const Fv_slip_total = n * Fv_slip_one;
  const nf_slip = mu > 0 && F > 1e-9 ? Fv_slip_total / F : null;

  const nf_governing = Math.min(
    nf_shear_max,
    nf_bearing,
    nf_slip != null && Number.isFinite(nf_slip) ? nf_slip : Infinity,
  );

  return {
    d_mm: d,
    boltClass: p.boltClass,
    n,
    planes,
    F_N: F,
    t_mm: t,
    mu,
    ecc_mm: ecc,
    spacing_mm: spacing,
    A_tensil_mm2: A_tensil,
    A_shear_mm2: A_shear,
    V_bolt_mean_N: V_bolt_mean,
    V_max_N: V_max,
    tau_mean_MPa,
    tau_max_MPa,
    tau_adm_MPa,
    sigma_bearing_MPa,
    sigma_bearing_adm_MPa,
    nf_shear_mean,
    nf_shear_max,
    nf_bearing,
    nf_slip,
    nf_governing,
    Fp_N,
    Fv_slip_total_N: Fv_slip_total,
    Rp0_2_MPa: props.Rp0_2_MPa,
    fub_MPa: props.fub_MPa,
    fu_plate_MPa: plate.fu_MPa,
    distribution,
    criticalBolt,
    positions,
  };
}

/** @param {number} nf @returns {CheckLevel} */
export function nfToLevel(nf) {
  if (!Number.isFinite(nf) || nf >= 2) return 'safe';
  if (nf >= 1) return 'tight';
  return 'unsafe';
}

/** @param {number} used @param {number} adm @returns {CheckLevel} */
export function stressToLevel(used, adm) {
  if (!(adm > 0)) return 'safe';
  const ratio = used / adm;
  if (ratio <= 0.5) return 'safe';
  if (ratio <= 1) return 'tight';
  return 'unsafe';
}
