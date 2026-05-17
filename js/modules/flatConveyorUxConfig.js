/**
 * UX presets and application profiles for the flat-belt conveyor calculator.
 * Does not perform physics � only defaults, ranges, and copy for guided sizing.
 */

/** @typedef {'light'|'medium'|'heavy'} FlatAppProfileId */

/**
 * Numeric ranges for green (typical) validation per profile.
 * Values outside are flagged visually; physics is unchanged.
 */
export const FLAT_APP_PROFILES = Object.freeze({
  light: Object.freeze({
    id: 'light',
    beltLength_m: Object.freeze([2, 30]),
    rollerDiameter_mm: Object.freeze([80, 280]),
    beltSpeed_m_s: Object.freeze([0.1, 1.1]),
    loadMass_kg: Object.freeze([10, 600]),
    friction: Object.freeze([0.18, 0.45]),
    /** Advisory: belt speed high for light packaging lines */
    beltSpeedWarnAbove_m_s: 0.85,
    /** Advisory: drum rpm above this with light profile */
    drumRpmWarnAbove: 180,
  }),
  medium: Object.freeze({
    id: 'medium',
    beltLength_m: Object.freeze([5, 60]),
    rollerDiameter_mm: Object.freeze([200, 600]),
    beltSpeed_m_s: Object.freeze([0.4, 2.2]),
    loadMass_kg: Object.freeze([100, 4000]),
    friction: Object.freeze([0.22, 0.5]),
    beltSpeedWarnAbove_m_s: 2.8,
    drumRpmWarnAbove: 320,
  }),
  heavy: Object.freeze({
    id: 'heavy',
    beltLength_m: Object.freeze([10, 80]),
    rollerDiameter_mm: Object.freeze([400, 1200]),
    beltSpeed_m_s: Object.freeze([0.6, 4.5]),
    loadMass_kg: Object.freeze([800, 8000]),
    friction: Object.freeze([0.25, 0.6]),
    beltSpeedWarnAbove_m_s: 4.0,
    drumRpmWarnAbove: 450,
  }),
});

/**
 * @typedef {Object} FlatPresetValues
 * @property {'rollers'|'slide_plate'} carrySurface
 * @property {'ISO5048'|'CEMA'} designStandard
 * @property {'uniform'|'moderate'|'heavy'|'custom'} loadDuty
 * @property {number} beltLength
 * @property {number} rollerD
 * @property {number} beltSpeed
 * @property {number} loadMass
 * @property {number} friction
 * @property {number} efficiency
 * @property {number} beltWidth
 * @property {number} beltMass
 * @property {number} loadDistribution
 * @property {number} beltCarryFraction
 * @property {number} additionalResistance
 * @property {number} accelTime
 * @property {number} inertiaFactor
 */

/**
 * @typedef {Object} FlatPresetDef
 * @property {string} id
 * @property {FlatAppProfileId} profileId
 * @property {FlatPresetValues} values
 * @property {number} typicalSlipPct � belt creep / lag, informational only (not in physics model)
 * @property {number} tailDrumMm � typical tail / bend pulley � for documentation
 */

/** @type {FlatPresetDef[]} */
export const FLAT_CONV_PRESETS = Object.freeze([
  Object.freeze({
    id: 'light_retail',
    profileId: 'light',
    typicalSlipPct: 1.2,
    tailDrumMm: 100,
    values: Object.freeze({
      carrySurface: 'rollers',
      designStandard: 'ISO5048',
      loadDuty: 'uniform',
      beltLength: 6,
      rollerD: 120,
      beltSpeed: 0.38,
      loadMass: 110,
      friction: 0.27,
      efficiency: 88,
      beltWidth: 0.5,
      beltMass: 7,
      loadDistribution: 1,
      beltCarryFraction: 0.52,
      additionalResistance: 0,
      accelTime: 2.8,
      inertiaFactor: 1.08,
    }),
  }),
  Object.freeze({
    id: 'medium_industrial',
    profileId: 'medium',
    typicalSlipPct: 1.5,
    tailDrumMm: 280,
    values: Object.freeze({
      carrySurface: 'rollers',
      designStandard: 'ISO5048',
      loadDuty: 'moderate',
      beltLength: 22,
      rollerD: 400,
      beltSpeed: 1.05,
      loadMass: 920,
      friction: 0.35,
      efficiency: 88,
      beltWidth: 0.85,
      beltMass: 42,
      loadDistribution: 1,
      beltCarryFraction: 0.5,
      additionalResistance: 120,
      accelTime: 3,
      inertiaFactor: 1.15,
    }),
  }),
  Object.freeze({
    id: 'heavy_duty',
    profileId: 'heavy',
    typicalSlipPct: 1.8,
    tailDrumMm: 560,
    values: Object.freeze({
      carrySurface: 'rollers',
      designStandard: 'ISO5048',
      loadDuty: 'heavy',
      beltLength: 48,
      rollerD: 800,
      beltSpeed: 2.05,
      loadMass: 5200,
      friction: 0.4,
      efficiency: 90,
      beltWidth: 1.2,
      beltMass: 180,
      loadDistribution: 1,
      beltCarryFraction: 0.5,
      additionalResistance: 450,
      accelTime: 4.5,
      inertiaFactor: 1.22,
    }),
  }),
]);

/** @type {Record<string, FlatPresetDef>} */
export const FLAT_PRESET_BY_ID = Object.freeze(
  Object.fromEntries(FLAT_CONV_PRESETS.map((p) => [p.id, p])),
);

export function getFlatPreset(id) {
  return FLAT_PRESET_BY_ID[id] ?? null;
}

export function getFlatProfile(id) {
  if (id === 'light') return FLAT_APP_PROFILES.light;
  if (id === 'heavy') return FLAT_APP_PROFILES.heavy;
  return FLAT_APP_PROFILES.medium;
}
