/**
 * Pneumatic compressor sizing — isothermal ideal + receiver rules (orientative).
 */

export const COMPRESSOR_TYPES = Object.freeze({
  piston: Object.freeze({ etaCenter: 0.75, etaMin: 0.7, etaMax: 0.8 }),
  screw: Object.freeze({ etaCenter: 0.86, etaMin: 0.8, etaMax: 0.92 }),
  vane: Object.freeze({ etaCenter: 0.76, etaMin: 0.7, etaMax: 0.82 }),
});

export const IEC_MOTOR_KW = Object.freeze([
  0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55,
]);

const PATM_BAR = 1.013;
const ETA_MEC = 0.92;
const MOTOR_SERVICE_FACTOR = 1.15;

/**
 * @param {number} kw
 * @returns {number}
 */
export function roundIecMotorKw(kw) {
  if (!Number.isFinite(kw) || kw <= 0) return IEC_MOTOR_KW[0];
  for (const s of IEC_MOTOR_KW) {
    if (s >= kw - 1e-9) return s;
  }
  return IEC_MOTOR_KW[IEC_MOTOR_KW.length - 1];
}

/**
 * @param {number} cEsp kW/(m³/min)
 * @returns {'excelente'|'bueno'|'aceptable'|'revisar'}
 */
export function specificPowerBadge(cEsp) {
  if (!Number.isFinite(cEsp)) return 'revisar';
  if (cEsp < 5.5) return 'excelente';
  if (cEsp < 7.0) return 'bueno';
  if (cEsp < 8.5) return 'aceptable';
  return 'revisar';
}

/**
 * @param {object} p
 * @param {number} p.qDem
 * @param {'nlmin'|'m3min'} p.qUnit
 * @param {number} p.pTrabajoBar gauge
 * @param {number} p.pRedBar gauge
 * @param {number} p.fSim 0–1
 * @param {number} p.fFugPct
 * @param {number} p.etaVolPct 10–100
 * @param {number} p.nEtapas 1|2
 * @param {number} p.pAspBar abs
 * @param {number} p.tAspC
 * @param {number} p.etaIsoPct
 * @param {number} p.tCicloS
 * @param {number|null} p.deltaPBar if null ? pRed - pTrabajo
 * @param {'piston'|'screw'|'vane'} p.tipo
 */
export function calcPneumaticCompressor(p) {
  const errors = [];

  const qDem = Number(p.qDem);
  const fSim = Number(p.fSim);
  const fFugPct = Number(p.fFugPct);
  const pTrabajo = Number(p.pTrabajoBar);
  const pRed = Number(p.pRedBar);
  const etaVolPct = Number(p.etaVolPct);
  const etaIsoPct = Number(p.etaIsoPct);
  const pAsp = Number(p.pAspBar);
  const tAsp = Number(p.tAspC);
  const tCiclo = Number(p.tCicloS);
  const nEtapas = Number(p.nEtapas) === 2 ? 2 : 1;

  if (!Number.isFinite(qDem) || qDem <= 0) errors.push('Q_dem debe ser > 0');
  if (!Number.isFinite(fSim) || fSim <= 0 || fSim > 1) errors.push('f_sim debe estar entre 0 y 1');
  if (!Number.isFinite(fFugPct) || fFugPct < 0 || fFugPct > 80) errors.push('f_fug debe estar entre 0 % y 80 %');
  if (!Number.isFinite(pTrabajo) || pTrabajo <= 0) errors.push('p_trabajo debe ser > 0 bar');
  if (!Number.isFinite(pRed) || pRed <= 0) errors.push('p_red debe ser > 0 bar');
  if (pRed <= pTrabajo) errors.push('p_red debe ser mayor que p_trabajo');
  if (!Number.isFinite(etaVolPct) || etaVolPct < 10 || etaVolPct > 100) {
    errors.push('\u03b7_vol debe estar entre 10 % y 100 %');
  }
  if (!Number.isFinite(etaIsoPct) || etaIsoPct < 10 || etaIsoPct > 100) {
    errors.push('\u03b7_iso debe estar entre 10 % y 100 %');
  }
  if (!Number.isFinite(pAsp) || pAsp <= 0.5) errors.push('p_asp debe ser > 0,5 bar (abs)');
  if (!Number.isFinite(tCiclo) || tCiclo <= 0) errors.push('t_ciclo debe ser > 0 s');

  if (errors.length) return { ok: false, errors };

  const qDemNlMin = p.qUnit === 'm3min' ? qDem * 1000 : qDem;
  const qRealNlMin = qDemNlMin * fSim * (1 + fFugPct / 100);
  const qRealM3Min = qRealNlMin / 1000;
  const qRealM3s = qRealM3Min / 60;

  const deltaPBar =
    p.deltaPBar != null && Number.isFinite(Number(p.deltaPBar)) && Number(p.deltaPBar) > 0
      ? Number(p.deltaPBar)
      : pRed - pTrabajo;

  if (deltaPBar <= 0) {
    return { ok: false, errors: ['\u0394p debe ser > 0 bar (p_red > p_trabajo o banda manual)'] };
  }

  const pDisAbs = pRed + PATM_BAR;
  const r = pDisAbs / pAsp;

  const pAspPa = pAsp * 1e5;
  const pIsoKw = qRealM3s * pAspPa * Math.log(Math.max(r, 1.0001));

  const etaIso = etaIsoPct / 100;
  const etaVol = etaVolPct / 100;
  const pEjeKw = pIsoKw / (etaIso * ETA_MEC);
  const pMotorRecKw = pEjeKw * MOTOR_SERVICE_FACTOR;
  const pMotorIecKw = roundIecMotorKw(pMotorRecKw);

  const cEsp = qRealM3Min > 0 ? pEjeKw / qRealM3Min : NaN;
  const badge = specificPowerBadge(cEsp);

  const qCompM3Min = etaVol > 0 ? qRealM3Min / etaVol : NaN;
  const vCycleL = ((qCompM3Min / 60) * tCiclo) / (2 * deltaPBar) * 1000;
  const vRuleL = qRealNlMin / 10;
  const vRecL = Math.max(vCycleL, vRuleL);

  const alerts = [];
  if (r > 8 && nEtapas === 1) alerts.push('etapas');
  if (deltaPBar < 0.5) alerts.push('banda');
  if (fFugPct > 25) alerts.push('fugas');
  if (tAsp > 40) alerts.push('temp');
  if (!alerts.length) alerts.push('ok');

  return {
    ok: true,
    qDemNlMin,
    qRealNlMin,
    qRealM3Min,
    qCompM3Min,
    r,
    pIsoKw,
    pEjeKw,
    pMotorRecKw,
    pMotorIecKw,
    cEsp,
    badge,
    vCycleL,
    vRuleL,
    vRecL,
    deltaPBar,
    nEtapas,
    pDisAbs,
    alerts,
  };
}
