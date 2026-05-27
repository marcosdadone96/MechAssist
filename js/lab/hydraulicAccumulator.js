/**
 * Hydraulic accumulator calculations ù TheMechAssist
 * Gas law: p ù V^n = const (n=1 isothermal, n=1.4 adiabatic)
 */

export const COMMERCIAL_SIZES_L = [1, 2, 4, 6, 10, 16, 20, 32, 50, 80, 100];

/**
 * @param {object} p
 * @param {'bladder'|'piston'|'diaphragm'} p.type
 * @param {'isothermal'|'adiabatic'} p.process
 * @param {number} p.p0Bar
 * @param {number} p.p1Bar
 * @param {number} p.p2Bar
 * @param {number} p.deltaVL
 * @param {number|null} p.vnomL
 * @param {number} p.tempC
 * @param {'design'|'diagnostic'} p.mode
 */
export function calcAccumulator({
  type,
  process,
  p0Bar,
  p1Bar,
  p2Bar,
  deltaVL,
  vnomL,
  tempC,
  mode,
}) {
  const errors = [];

  if (p0Bar <= 0) errors.push('p\u2080 debe ser > 0 bar');
  if (p1Bar <= 0) errors.push('p\u2081 debe ser > 0 bar');
  if (p2Bar <= 0) errors.push('p\u2082 debe ser > 0 bar');
  if (p0Bar >= p1Bar) errors.push('p\u2080 debe ser menor que p\u2081 (precarga < presi\u00f3n m\u00ednima)');
  if (p1Bar >= p2Bar) errors.push('p\u2081 debe ser menor que p\u2082');
  if (mode === 'design' && (!deltaVL || deltaVL <= 0)) errors.push('\u0394V debe ser > 0 L');
  if (mode === 'diagnostic' && (!vnomL || vnomL <= 0)) errors.push('Volumen nominal debe ser > 0 L');

  if (errors.length) {
    return { ok: false, errors };
  }

  const n = process === 'adiabatic' ? 1.4 : 1.0;

  // Pre-charge reference temperature (manufacturer nominal 20ùC)
  const T_REF_K = 293.15;
  const tWorkK =
    typeof tempC === 'number' && Number.isFinite(tempC) ? tempC + 273.15 : T_REF_K;
  const p0Eff = p0Bar * (tWorkK / T_REF_K);
  const tempCorrectionApplied = Math.abs(tWorkK - T_REF_K) > 1;

  if (p0Eff >= p1Bar) {
    return {
      ok: false,
      errors: [
        tempCorrectionApplied
          ? 'Con la temperatura de trabajo, la precarga efectiva p\u2080 supera p\u2081. Reduzca p\u2080, baje la temperatura o aumente p\u2081.'
          : 'p\u2080 debe ser menor que p\u2081 (precarga < presi\u00f3n m\u00ednima)',
      ],
    };
  }

  const p0EffPa = p0Eff * 1e5;
  const p1Pa = p1Bar * 1e5;
  const p2Pa = p2Bar * 1e5;

  const ratioP2P1 = p2Bar / p1Bar;

  let v0MinL;
  let vnomUsedL;

  if (mode === 'design') {
    const denom = Math.pow(p0Eff / p1Bar, 1 / n) - Math.pow(p0Eff / p2Bar, 1 / n);
    if (denom <= 0) {
      return {
        ok: false,
        errors: ['El rango de presiones no permite calcular el volumen. Revise p\u2080, p\u2081 y p\u2082.'],
      };
    }
    v0MinL = deltaVL / denom;
    vnomUsedL =
      COMMERCIAL_SIZES_L.find((s) => s >= v0MinL) ??
      COMMERCIAL_SIZES_L[COMMERCIAL_SIZES_L.length - 1];
  } else {
    vnomUsedL = vnomL;
    v0MinL = null;
  }

  const v0M3 = vnomUsedL / 1000;

  const deltaVReal =
    vnomUsedL * (Math.pow(p0Eff / p1Bar, 1 / n) - Math.pow(p0Eff / p2Bar, 1 / n));

  let energyJ;
  if (n === 1.0) {
    energyJ = p0EffPa * v0M3 * Math.log(p2Pa / p1Pa);
  } else {
    energyJ =
      (p0EffPa * v0M3) / (n - 1) *
      (Math.pow(p2Pa / p0EffPa, (n - 1) / n) - Math.pow(p1Pa / p0EffPa, (n - 1) / n));
  }
  const energyKJ = energyJ / 1000;

  const pMeanBar = (p1Bar + p2Bar) / 2;
  const qEstLmin = (deltaVReal / 30) * 60;
  const powerKW = (qEstLmin * pMeanBar) / 600;

  const dischargeTimeS = powerKW > 0 ? energyKJ / powerKW : null;

  const deltaVOk = mode === 'design' ? deltaVReal >= deltaVL * 0.999 : true;
  const ratioOk = ratioP2P1 <= 4;
  const p0Ratio = p0Eff / p1Bar;
  const p0Ok = p0Ratio >= 0.82 && p0Ratio <= 0.92;

  return {
    ok: true,
    errors: [],
    type,
    process,
    tempC,
    mode,
    v0MinL,
    vnomUsedL,
    deltaVRealL: deltaVReal,
    energyJ,
    energyKJ,
    powerKW,
    qEstLmin,
    dischargeTimeS,
    ratioP2P1,
    p0Ratio,
    ratioOk,
    p0Ok,
    deltaVOk,
    n,
    p0Bar,
    p0EffBar: p0Eff,
    tempCorrectionApplied,
    p1Bar,
    p2Bar,
    deltaVL,
  };
}

/** @param {{ result: object, lang?: string }} opts */
export function buildAccumulatorFormulaLines({ result, lang = 'es' }) {
  const en = lang === 'en';
  const { n, p0Bar, p1Bar, p2Bar, vnomUsedL, v0MinL, deltaVRealL, energyKJ } = result;
  const fmt = (v, d = 2) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(d) : '\u2014');
  return [
    en
      ? `Gas law: <strong>p\u00b7V\u207f = const</strong> (n = ${n}, ${n === 1 ? 'isothermal' : 'adiabatic'})`
      : `Ley del gas: <strong>p\u00b7V\u207f = cte</strong> (n = ${n}, ${n === 1 ? 'isotermo' : 'adiab\u00e1tico'})`,
    v0MinL != null
      ? en
        ? `V\u2080_min = \u0394V / ((p\u2080/p\u2081)^(1/n) \u2212 (p\u2080/p\u2082)^(1/n)) = ${fmt(v0MinL)} L`
        : `V\u2080_min = \u0394V / ((p\u2080/p\u2081)^(1/n) \u2212 (p\u2080/p\u2082)^(1/n)) = ${fmt(v0MinL)} L`
      : '',
    en
      ? `Nominal volume selected: <strong>${fmt(vnomUsedL, 0)} L</strong>`
      : `Volumen nominal elegido: <strong>${fmt(vnomUsedL, 0)} L</strong>`,
    en
      ? `Actual usable volume \u0394V = ${fmt(deltaVRealL, 2)} L`
      : `Volumen \u00fatil real \u0394V = ${fmt(deltaVRealL, 2)} L`,
    en
      ? `Stored energy E = ${fmt(energyKJ, 2)} kJ`
      : `Energ\u00eda almacenada E = ${fmt(energyKJ, 2)} kJ`,
    en
      ? `p\u2080=${p0Bar} bar \u00b7 p\u2081=${p1Bar} bar \u00b7 p\u2082=${p2Bar} bar`
      : `p\u2080=${p0Bar} bar \u00b7 p\u2081=${p1Bar} bar \u00b7 p\u2082=${p2Bar} bar`,
  ].filter(Boolean);
}
