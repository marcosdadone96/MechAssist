/**
 * Euler-Bernoulli beam bending ù static load cases (educational predesign).
 * Lengths in m, forces in N, distributed load in N/m, E in MPa, section dims in mm.
 */

const E_PRESETS = {
  steel: 210000,
  stainless: 200000,
  aluminum: 70000,
  'cast-iron': 170000,
  timber: 12000,
};

/**
 * @param {string} section
 * @param {Record<string, number>} dims mm
 */
export function beamSectionProps(section, dims) {
  const b = dims.width ?? dims.bf ?? 0;
  const h = dims.height ?? dims.h ?? 0;
  const d = dims.diam ?? 0;
  const dExt = dims.diamExt ?? 0;
  const dInt = dims.diamInt ?? 0;
  const tw = dims.webT ?? 0;
  const tf = dims.flangeT ?? 0;

  if (section === 'rectangular' && b > 0 && h > 0) {
    const I = (b * h ** 3) / 12;
    const W = (b * h ** 2) / 6;
    const A = b * h;
    return { I, W, A, yMax: h / 2 };
  }
  if (section === 'circular-solid' && d > 0) {
    const I = (Math.PI * d ** 4) / 64;
    const W = (Math.PI * d ** 3) / 32;
    const A = (Math.PI * d ** 2) / 4;
    return { I, W, A, yMax: d / 2 };
  }
  if (section === 'circular-hollow' && dExt > 0 && dInt >= 0 && dInt < dExt) {
    const I = (Math.PI * (dExt ** 4 - dInt ** 4)) / 64;
    const A = (Math.PI * (dExt ** 2 - dInt ** 2)) / 4;
    const W = (2 * I) / dExt;
    return { I, W, A, yMax: dExt / 2 };
  }
  if (section === 'i-section' && b > 0 && h > 0 && tw > 0 && tf > 0 && h > 2 * tf) {
    const hw = h - 2 * tf;
    const Af = b * tf;
    const Aw = hw * tw;
    const A = 2 * Af + Aw;
    const yBar = h / 2;
    const I =
      2 * (Af * (h / 2 - tf / 2) ** 2 + (b * tf ** 3) / 12) + (tw * hw ** 3) / 12;
    const W = I / yBar;
    return { I, W, A, yMax: yBar };
  }
  if (section === 't-section' && b > 0 && h > 0 && tw > 0 && tf > 0) {
    const hw = h - tf;
    const Af = b * tf;
    const Aw = hw * tw;
    const A = Af + Aw;
    const yBar = (Af * (h - tf / 2) + Aw * hw / 2) / A;
    const I =
      Af * (yBar - (h - tf / 2)) ** 2 +
      (b * tf ** 3) / 12 +
      Aw * (hw / 2 + tf - yBar) ** 2 +
      (tw * hw ** 3) / 12;
    const W = I / Math.max(yBar, h - yBar);
    return { I, W, A, yMax: Math.max(yBar, h - yBar) };
  }
  return null;
}

/**
 * @param {object} p
 * @returns {null | { M_max: number, V_max: number, delta_max_mm: number, tauFactor: number }}
 */
function beamResponse(p) {
  const Lm = p.L_m;
  const Lmm = Lm * 1000;
  const E = p.E_MPa;
  const I = p.I_mm4;
  if (!(Lm > 0) || !(E > 0) || !(I > 0)) return null;

  const EI = E * I;
  const type = p.beamType;
  const load = p.loadType;
  const F = p.F_N ?? 0;
  const q = p.q_Nm ?? 0;
  const a = Math.min(Math.max(0, p.a_m ?? Lm / 2), Lm);
  const bEnd = Math.min(Math.max(p.b_m ?? Lm, a), Lm);
  const c = Math.max(0, bEnd - a);

  let M_max = 0;
  let V_max = 0;
  let delta_max_mm = 0;
  let tauFactor = 1.5;

  if (type === 'simply-supported') {
    if (load === 'point-center') {
      M_max = (F * Lm) / 4;
      V_max = F / 2;
      delta_max_mm = (F * Lmm ** 3) / (48 * EI);
    } else if (load === 'point-custom') {
      const b = Lm - a;
      M_max = (F * a * b) / Lm;
      V_max = Math.max((F * b) / Lm, (F * a) / Lm);
      delta_max_mm = (F * (a * 1000) ** 2 * (b * 1000) ** 2) / (3 * EI * Lmm);
    } else if (load === 'distributed') {
      M_max = (q * Lm ** 2) / 8;
      V_max = (q * Lm) / 2;
      delta_max_mm = (5 * q * (Lm ** 3) * 1e9) / (384 * EI);
    } else if (load === 'distributed-partial' && c > 0) {
      const xBar = a + c / 2;
      const R1 = (q * c * (Lm - xBar)) / Lm;
      const R2 = (q * c * xBar) / Lm;
      V_max = Math.max(R1, R2) + q * 0.01;
      M_max = Math.max(R1 * xBar - q * (c / 2) ** 2 / 2, R2 * (Lm - xBar));
      delta_max_mm = (q * (c * 1000) ** 4) / (185 * EI) + (q * c * (Lm ** 3) * 1e9) / (384 * EI) * 0.15;
    }
  } else if (type === 'cantilever') {
    tauFactor = 1.5;
    if (load === 'point-center' || load === 'point-custom') {
      const arm = load === 'point-center' ? Lm : a;
      M_max = F * arm;
      V_max = F;
      delta_max_mm =
        load === 'point-center'
          ? (F * Lmm ** 3) / (3 * EI)
          : (F * (arm * 1000) ** 2 * (3 * Lm - arm) * 1e3) / (6 * EI);
    } else if (load === 'distributed') {
      M_max = (q * Lm ** 2) / 2;
      V_max = q * Lm;
      delta_max_mm = (q * (Lm ** 3) * 1e9) / (8 * EI);
    } else if (load === 'distributed-partial' && c > 0) {
      M_max = q * c * (Lm - a - c / 2);
      V_max = q * c;
      delta_max_mm = (q * (c * 1000) ** 4) / (8 * EI) + (q * c * (Lm ** 3) * 1e9) / (8 * EI) * 0.2;
    }
  } else if (type === 'fixed-both') {
    if (load === 'point-center' || load === 'point-custom') {
      const atCenter = load === 'point-center';
      M_max = atCenter ? (F * Lm) / 8 : (F * a * (Lm - a)) / Lm;
      V_max = F / 2;
      delta_max_mm = atCenter
        ? (F * Lmm ** 3) / (192 * EI)
        : (F * (a * 1000) ** 2 * ((Lm - a) * 1000) ** 2) / (3 * EI * Lmm) * 0.5;
    } else if (load === 'distributed') {
      M_max = (q * Lm ** 2) / 12;
      V_max = (q * Lm) / 2;
      delta_max_mm = (q * (Lm ** 3) * 1e9) / (384 * EI);
    } else if (load === 'distributed-partial' && c > 0) {
      M_max = (q * c * Lm) / 8;
      V_max = (q * c) / 2;
      delta_max_mm = (q * (Lm ** 3) * 1e9) / (384 * EI) * (c / Lm);
    }
  }

  if (p.section === 'circular-solid' || p.section === 'circular-hollow') {
    tauFactor = 4 / 3;
  }

  return { M_max, V_max, delta_max_mm, tauFactor };
}

/**
 * @param {object} input
 */
export function computeBeamAnalysis(input) {
  const E_MPa =
    input.material === 'custom'
      ? input.E_custom_MPa
      : E_PRESETS[input.material] ?? input.E_custom_MPa;

  const sec = beamSectionProps(input.section, input.dims);
  if (!sec) {
    return { ok: false, error: 'section' };
  }

  if (input.section === 'circular-hollow' && input.dims.diamInt >= input.dims.diamExt) {
    return { ok: false, error: 'hollow_diam' };
  }

  const isDistributed = input.loadType === 'distributed' || input.loadType === 'distributed-partial';
  const F_N = isDistributed ? 0 : input.load;
  const q_Nm = isDistributed ? input.load : 0;

  const resp = beamResponse({
    beamType: input.beamType,
    loadType: input.loadType,
    L_m: input.span_m,
    F_N,
    q_Nm,
    a_m: input.loadPos_m,
    b_m: input.loadPosB_m,
    E_MPa,
    I_mm4: sec.I,
    section: input.section,
  });

  if (!resp) return { ok: false, error: 'inputs' };

  const sigma_max = sec.W > 0 ? resp.M_max * 1e6 / sec.W : 0;
  const tau_max = sec.A > 0 ? (resp.tauFactor * resp.V_max) / sec.A : 0;
  const delta_ratio = input.span_m > 0 ? resp.delta_max_mm / (input.span_m * 1000) : 0;
  const sigAdm = input.sigAdm_MPa;
  const usageSigma = sigAdm > 0 ? sigma_max / sigAdm : null;

  const partialDistApprox =
    input.beamType === 'simply-supported' && input.loadType === 'distributed-partial';

  return {
    ok: true,
    ...resp,
    span_m: input.span_m,
    sigma_max,
    tau_max,
    I: sec.I,
    W: sec.W,
    A: sec.A,
    E_MPa,
    delta_ratio,
    usageSigma,
    fixedIndeterminate: input.beamType === 'fixed-both',
    partialDistApprox,
  };
}

export { E_PRESETS };
