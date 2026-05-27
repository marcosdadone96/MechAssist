/**
 * Fatigue — Goodman / Gerber / Soderberg (Shigley-style, indicative).
 */

/** @typedef {'bending'|'axial'|'torsion'|'combined'} FatigueLoadType */
/** @typedef {'diagnostic'|'design'} FatigueCalcMode */
/** @typedef {'safe'|'tight'|'unsafe'} FatigueStatus */

/** @type {Record<string, { Su_MPa: number, Sy_MPa: number } | null>} */
export const FATIGUE_MATERIALS = {
  s235: { Su_MPa: 370, Sy_MPa: 235 },
  s355: { Su_MPa: 510, Sy_MPa: 355 },
  cr42: { Su_MPa: 900, Sy_MPa: 650 },
  custom: null,
};

/**
 * @param {object} p
 * @param {FatigueCalcMode} p.mode
 * @param {FatigueLoadType} [p.loadType]
 * @param {number} p.sigmaM_MPa
 * @param {number} [p.sigmaA_MPa]
 * @param {number} p.Su_MPa
 * @param {number} p.Sy_MPa
 * @param {number} p.Ka
 * @param {number} p.Kb
 * @param {number} p.Kc
 * @param {number} p.Kf
 * @param {number} [p.Kd]
 */
export function computeFatigue(p) {
  const Su = Math.max(1, p.Su_MPa);
  const Sy = Math.max(1, p.Sy_MPa);
  const sigmaM = Math.max(0, p.sigmaM_MPa);
  const sigmaA = Math.max(0, p.sigmaA_MPa ?? 0);
  const Ka = clamp(p.Ka, 0.1, 2);
  const Kb = clamp(p.Kb, 0.1, 2);
  const Kc = clamp(p.Kc, 0.1, 2);
  const Kf = clamp(p.Kf, 1, 6);
  const Kd = clamp(p.Kd ?? 1, 0.1, 2);

  const S_prime_MPa = 0.5 * Su;
  const Se_MPa = Ka * Kb * Kc * Kd * S_prime_MPa;
  const saEff = sigmaA * Kf;

  const goodmanDenom = saEff / Se_MPa + sigmaM / Su;
  const nf_goodman = goodmanDenom > 1e-12 ? 1 / goodmanDenom : Infinity;

  const gerberDenom = saEff / Se_MPa + (sigmaM / Su) ** 2;
  const nf_gerber = gerberDenom > 1e-12 ? 1 / gerberDenom : Infinity;

  const soderbergDenom = saEff / Se_MPa + sigmaM / Sy;
  const nf_soderberg = soderbergDenom > 1e-12 ? 1 / soderbergDenom : Infinity;

  const vm = Math.sqrt(sigmaM ** 2 + saEff ** 2);
  const ny = vm > 1e-12 ? Sy / vm : Infinity;

  const nf_min = Math.min(nf_goodman, nf_gerber, nf_soderberg);

  const criteria = [
    { key: 'goodman', labelKey: 'goodman', nf: nf_goodman },
    { key: 'gerber', labelKey: 'gerber', nf: nf_gerber },
    { key: 'soderberg', labelKey: 'soderberg', nf: nf_soderberg },
  ];
  const governingFatigue = criteria.reduce((a, b) => (b.nf < a.nf ? b : a));

  let criticalKey = governingFatigue.key;
  let nf_governing = nf_min;
  if (ny < nf_min) {
    criticalKey = 'yield';
    nf_governing = ny;
  }

  /** @type {FatigueStatus} */
  let status = 'safe';
  if (nf_governing < 1.5) status = 'unsafe';
  else if (nf_governing < 2) status = 'tight';

  const sigmaA_max_goodman = Math.max(0, (Se_MPa / Kf) * (1 - sigmaM / Su));
  const sigmaA_max_gerber =
    sigmaM < Su ? Math.max(0, (Se_MPa / Kf) * (1 - (sigmaM / Su) ** 2)) : 0;
  const sigmaA_max_soderberg = Math.max(0, (Se_MPa / Kf) * (1 - sigmaM / Sy));
  const sigmaA_max = Math.min(sigmaA_max_goodman, sigmaA_max_gerber, sigmaA_max_soderberg);

  return {
    mode: p.mode,
    loadType: p.loadType ?? 'bending',
    sigmaM_MPa: sigmaM,
    sigmaA_MPa: sigmaA,
    saEff_MPa: saEff,
    Su_MPa: Su,
    Sy_MPa: Sy,
    S_prime_MPa,
    Se_MPa,
    Ka,
    Kb,
    Kc,
    Kf,
    Kd,
    nf_goodman,
    nf_gerber,
    nf_soderberg,
    ny,
    nf_min,
    nf_governing,
    criticalKey,
    status,
    sigmaA_max_goodman,
    sigmaA_max_gerber,
    sigmaA_max_soderberg,
    sigmaA_max,
    governingFatigueKey: governingFatigue.key,
  };
}

/** @param {number} v @param {number} lo @param {number} hi */
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
