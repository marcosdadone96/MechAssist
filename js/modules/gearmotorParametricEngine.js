/**
 * Expansión paramétrica: registro de familias → filas GearmotorModel compatibles con verify/recomendaciones.
 */

import { PARAMETRIC_REGISTRY } from '../data/gearmotorParametricRegistry.js';

/**
 * @typedef {import('../modules/motorVerify.js').GearmotorModel} GearmotorModel
 */

/**
 * @param {[number, number]} range
 */
function midRange(range) {
  return (Number(range[0]) + Number(range[1])) / 2;
}

/**
 * @param {import('../data/gearmotorParametricRegistry.js').ParametricManufacturer} mfr
 * @param {import('../data/gearmotorParametricRegistry.js').ParametricSeries} series
 * @param {import('../data/gearmotorParametricRegistry.js').ParametricSize} size
 * @param {import('../data/gearmotorParametricRegistry.js').ParametricRatio} ratioRow
 * @param {number} motor_rpm_nom
 * @param {'B3'|'B5'|'B14'|'hollowShaft'} mt
 * @returns {GearmotorModel}
 */
function buildGearmotorRow(mfr, series, size, ratioRow, motor_rpm_nom, mt) {
  const ratio = Math.max(1, Number(ratioRow.value) || 1);
  const mod = Number(ratioRow.efficiencyModifier);
  const etaModifier = Number.isFinite(mod) && mod > 0 ? mod : 1;
  let eta_g = midRange(size.efficiency_range) * etaModifier;
  eta_g = Math.max(0.5, Math.min(0.99, eta_g));

  const n2_rpm = motor_rpm_nom / ratio;

  let motor_kW = Math.min(
    size.reference_motor_kw,
    size.nominal_power_range_kw[1],
  );
  let T2_thermal = (9550 * motor_kW * eta_g) / Math.max(0.01, n2_rpm);
  if (T2_thermal > size.max_torque_nm) {
    motor_kW = (size.max_torque_nm * n2_rpm) / (9550 * eta_g);
  }
  const pMin = size.nominal_power_range_kw[0] * 0.45;
  const pMax = size.nominal_power_range_kw[1];
  motor_kW = Math.max(pMin, Math.min(pMax, Math.round(motor_kW * 100) / 100));
  const T2_from_motor = (9550 * motor_kW * eta_g) / Math.max(0.01, n2_rpm);

  const T2_nom_Nm = Math.min(size.max_torque_nm, T2_from_motor);
  const T2_peak_Nm = Math.min(size.max_torque_nm * 1.35, Math.max(T2_nom_Nm * 1.45, T2_nom_Nm + 1));

  /** @type {'solid'|'hollow'} */
  const shaftKind =
    mt === 'hollowShaft' ? 'hollow' : size.shaft_type_default === 'hollow' ? 'hollow' : 'solid';
  const dSolid = size.solid_shaft_d_mm ?? 30;
  const dHollow = size.hollow_bore_mm ?? 45;
  const outputShaft =
    shaftKind === 'hollow'
      ? { kind: /** @type {const} */ ('hollow'), nominalDiameter_mm: dHollow }
      : { kind: /** @type {const} */ ('solid'), nominalDiameter_mm: dSolid };

  const id = `prm-${mfr.brandId}-${series.series_id}-${size.size_id}-i${ratio}-n${motor_rpm_nom}-${mt}`;
  const code = `${series.series_id} ${size.size_id} · i=${ratio} · n₁=${motor_rpm_nom} · ${mt} · param`;
  const notes = `Paramétrico ${mfr.displayName} — ${series.label}. Validar talla/relación con catálogo oficial.`;

  return {
    id,
    brandId: mfr.brandId,
    code,
    series: `${series.label} (param.)`,
    motor_kW,
    motor_rpm_nom,
    ratio,
    n2_rpm,
    T2_nom_Nm,
    T2_peak_Nm,
    eta_g,
    enclosure: 'IP55',
    duty: 'S1',
    notes,
    mountingTypes: [mt],
    flangeLabel: `${series.series_id} · ${size.size_id}`,
    shaftConfigLabel: shaftKind === 'hollow' ? 'Salida hueca (orientativo)' : 'Salida sólida (orientativo)',
    outputShaft,
    parametric: true,
  };
}

/**
 * @param {typeof PARAMETRIC_REGISTRY} registry
 * @param {{ maxModels?: number }} [options]
 * @returns {GearmotorModel[]}
 */
export function expandParametricRegistryToGearmotorModels(registry, options = {}) {
  const maxModels = Math.max(100, Math.min(25000, Number(options.maxModels) || 6000));
  /** @type {GearmotorModel[]} */
  const out = [];

  for (const mfr of registry.manufacturers) {
    for (const series of mfr.series) {
      for (const size of series.sizes) {
        for (const ratioRow of series.ratios) {
          for (const motor_rpm of series.standard_motor_sync_rpm) {
            for (const mt of size.available_mounting_types) {
              if (out.length >= maxModels) return out;
              try {
                out.push(buildGearmotorRow(mfr, series, size, ratioRow, motor_rpm, mt));
              } catch {
                /* skip bad row */
              }
            }
          }
        }
      }
    }
  }
  return out;
}
