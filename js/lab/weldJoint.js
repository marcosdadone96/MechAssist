/**
 * Welded joint — indicative fillet and butt checks (predesign).
 */

const ELECTRODE_TAU = {
  E35: { sigma: 140, tau: 84 },
  E42: { sigma: 175, tau: 105 },
  E50: { sigma: 210, tau: 126 },
};

/** @param {number} t_mm plate thickness */
export function filletMinCathetus(t_mm) {
  if (t_mm <= 6) return 3;
  if (t_mm <= 12) return 4;
  if (t_mm <= 19) return 5;
  return 6;
}

/**
 * @param {object} p
 */
export function computeWeldJoint(p) {
  const mode = p.mode;
  const cords = p.cords || 1;

  if (mode === 'fillet') {
    const h = p.cathetus_mm;
    const l = p.length_mm;
    const t = p.plateThickness_mm || 10;
    const a = 0.7 * h;
    const lEff = Math.max(0, l - 2 * h);
    const F = p.force_N;
    const M = p.moment_Nm || 0;
    const z_mm = p.momentArm_mm || 50;

    if (!(h > 0) || !(l > 0) || lEff <= 0) return { ok: false, error: 'geometry' };

    const tauF = F / (cords * 2 * a * lEff);
    const tauM = M > 0 && z_mm > 0 ? M * 1e3 / (cords * 2 * a * lEff * z_mm) : 0;
    const tau_r = Math.sqrt(tauF ** 2 + tauM ** 2);

    const electrode = p.electrode;
    const tauAdm =
      electrode === 'custom'
        ? (p.tauAdm_custom || 100)
        : ELECTRODE_TAU[electrode]?.tau ?? 105;

    const usage = tauAdm > 0 ? tau_r / tauAdm : null;
    const hMin = filletMinCathetus(t);

    return {
      ok: true,
      mode,
      tau_r,
      tauAdm,
      usage,
      a,
      lEff,
      hMin,
      h,
      t,
      shortLength: lEff < 6 * h,
    };
  }

  const t = p.plateThickness_mm;
  const l = p.length_mm;
  const F = p.force_N;
  const V = p.shear_N || 0;
  const sigAdm = p.sigmaAdm_MPa || ELECTRODE_TAU[p.electrode]?.sigma || 175;

  if (!(t > 0) || !(l > 0)) return { ok: false, error: 'geometry' };

  const sigma = F / (t * l);
  const tau = V / (t * l);
  const sigma_eq = Math.sqrt(sigma ** 2 + 3 * tau ** 2);
  const usage = sigAdm > 0 ? sigma_eq / sigAdm : null;

  return {
    ok: true,
    mode,
    sigma,
    tau,
    sigma_eq,
    sigAdm,
    usage,
    t,
    l,
  };
}

export { ELECTRODE_TAU };
