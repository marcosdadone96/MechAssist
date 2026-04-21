/**
 * Registro paramétrico de familias de motorreductores (no catálogo plano).
 * Valores orientativos tipo catálogo — validar siempre con el fabricante.
 *
 * Niveles: fabricante → serie (topología) → talla → relación × rpm motor × montaje → fila generada.
 */

/**
 * @typedef {'worm'|'helical'|'bevel_helical'|'parallel'} GearboxTopology
 */

/**
 * @typedef {Object} ParametricSize
 * @property {string} size_id
 * @property {number} max_torque_nm — límite mecánico orientativo salida
 * @property {[number, number]} nominal_power_range_kw — [mín, máx] motor típico acoplable
 * @property {[number, number]} efficiency_range — η reductor solo (min, max) orientativo
 * @property {Array<'B3'|'B5'|'B14'|'hollowShaft'>} available_mounting_types
 * @property {'solid'|'hollow'} shaft_type_default
 * @property {number} reference_motor_kw — potencia de referencia para estimar T₂ (típ. tope útil de la talla)
 * @property {number} [solid_shaft_d_mm]
 * @property {number} [hollow_bore_mm]
 * @property {number} [weight_kg]
 */

/**
 * @typedef {Object} ParametricRatio
 * @property {number} value — i nominal
 * @property {number} [efficiencyModifier] — multiplicador sobre η media de la talla (default 1)
 */

/**
 * @typedef {Object} ParametricSeries
 * @property {string} series_id
 * @property {string} label
 * @property {GearboxTopology} topology
 * @property {ParametricSize[]} sizes
 * @property {ParametricRatio[]} ratios
 * @property {number[]} standard_motor_sync_rpm — ej. 750, 1000, 1500, 3000
 */

/**
 * @typedef {Object} ParametricManufacturer
 * @property {string} brandId — id interno (sew, nord, …)
 * @property {string} displayName
 * @property {ParametricSeries[]} series
 */

/** @type {{ manufacturers: ParametricManufacturer[] }} */
export const PARAMETRIC_REGISTRY = {
  manufacturers: [
    {
      brandId: 'motovario',
      displayName: 'Motovario',
      series: [
        {
          series_id: 'NMRV',
          label: 'NMRV / sinfín-cubo',
          topology: 'worm',
          standard_motor_sync_rpm: [750, 1000, 1500, 3000],
          ratios: [
            { value: 5, efficiencyModifier: 1 },
            { value: 7.5, efficiencyModifier: 0.99 },
            { value: 10, efficiencyModifier: 0.98 },
            { value: 15, efficiencyModifier: 0.96 },
            { value: 20, efficiencyModifier: 0.95 },
            { value: 25, efficiencyModifier: 0.93 },
            { value: 30, efficiencyModifier: 0.92 },
            { value: 40, efficiencyModifier: 0.9 },
            { value: 50, efficiencyModifier: 0.88 },
            { value: 60, efficiencyModifier: 0.86 },
            { value: 80, efficiencyModifier: 0.83 },
            { value: 100, efficiencyModifier: 0.8 },
          ],
          sizes: [
            {
              size_id: '025',
              max_torque_nm: 18,
              nominal_power_range_kw: [0.06, 0.18],
              efficiency_range: [0.62, 0.72],
              available_mounting_types: ['B5', 'B14'],
              shaft_type_default: 'solid',
              reference_motor_kw: 0.18,
              solid_shaft_d_mm: 9,
              weight_kg: 1.2,
            },
            {
              size_id: '030',
              max_torque_nm: 32,
              nominal_power_range_kw: [0.09, 0.25],
              efficiency_range: [0.64, 0.74],
              available_mounting_types: ['B5', 'B14'],
              shaft_type_default: 'solid',
              reference_motor_kw: 0.25,
              solid_shaft_d_mm: 11,
              weight_kg: 1.8,
            },
            {
              size_id: '040',
              max_torque_nm: 58,
              nominal_power_range_kw: [0.25, 0.55],
              efficiency_range: [0.66, 0.76],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 0.55,
              solid_shaft_d_mm: 14,
              weight_kg: 3.2,
            },
            {
              size_id: '050',
              max_torque_nm: 105,
              nominal_power_range_kw: [0.55, 1.1],
              efficiency_range: [0.68, 0.78],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 1.1,
              solid_shaft_d_mm: 18,
              weight_kg: 6.5,
            },
            {
              size_id: '063',
              max_torque_nm: 195,
              nominal_power_range_kw: [1.1, 2.2],
              efficiency_range: [0.7, 0.8],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 2.2,
              solid_shaft_d_mm: 22,
              weight_kg: 12,
            },
            {
              size_id: '075',
              max_torque_nm: 340,
              nominal_power_range_kw: [2.2, 4],
              efficiency_range: [0.72, 0.82],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 4,
              solid_shaft_d_mm: 28,
              weight_kg: 22,
            },
            {
              size_id: '090',
              max_torque_nm: 560,
              nominal_power_range_kw: [4, 7.5],
              efficiency_range: [0.73, 0.83],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 7.5,
              solid_shaft_d_mm: 32,
              weight_kg: 38,
            },
            {
              size_id: '110',
              max_torque_nm: 920,
              nominal_power_range_kw: [7.5, 15],
              efficiency_range: [0.74, 0.84],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 15,
              solid_shaft_d_mm: 40,
              weight_kg: 68,
            },
            {
              size_id: '130',
              max_torque_nm: 1450,
              nominal_power_range_kw: [11, 22],
              efficiency_range: [0.75, 0.85],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 22,
              solid_shaft_d_mm: 45,
              weight_kg: 105,
            },
            {
              size_id: '150',
              max_torque_nm: 2200,
              nominal_power_range_kw: [15, 30],
              efficiency_range: [0.75, 0.85],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 30,
              solid_shaft_d_mm: 55,
              weight_kg: 165,
            },
          ],
        },
        {
          series_id: 'H',
          label: 'H — cilíndrico helicoidal',
          topology: 'helical',
          standard_motor_sync_rpm: [750, 1000, 1500, 3000],
          ratios: [
            { value: 3.5 },
            { value: 5 },
            { value: 7 },
            { value: 10 },
            { value: 15 },
            { value: 20 },
            { value: 28 },
            { value: 35 },
            { value: 40 },
          ],
          sizes: [
            {
              size_id: '063',
              max_torque_nm: 520,
              nominal_power_range_kw: [0.55, 5.5],
              efficiency_range: [0.92, 0.97],
              available_mounting_types: ['B3', 'B5'],
              shaft_type_default: 'solid',
              reference_motor_kw: 5.5,
              solid_shaft_d_mm: 35,
            },
            {
              size_id: '080',
              max_torque_nm: 980,
              nominal_power_range_kw: [1.1, 11],
              efficiency_range: [0.93, 0.97],
              available_mounting_types: ['B3', 'B5'],
              shaft_type_default: 'solid',
              reference_motor_kw: 11,
              solid_shaft_d_mm: 40,
            },
            {
              size_id: '100',
              max_torque_nm: 1850,
              nominal_power_range_kw: [2.2, 22],
              efficiency_range: [0.93, 0.97],
              available_mounting_types: ['B3', 'B5'],
              shaft_type_default: 'solid',
              reference_motor_kw: 22,
              solid_shaft_d_mm: 45,
            },
            {
              size_id: '125',
              max_torque_nm: 3400,
              nominal_power_range_kw: [5.5, 45],
              efficiency_range: [0.94, 0.98],
              available_mounting_types: ['B3', 'B5'],
              shaft_type_default: 'solid',
              reference_motor_kw: 45,
              solid_shaft_d_mm: 55,
            },
          ],
        },
      ],
    },
    {
      brandId: 'sew',
      displayName: 'SEW-Eurodrive',
      series: [
        {
          series_id: 'R',
          label: 'R — sinfín (familia orientativa)',
          topology: 'worm',
          standard_motor_sync_rpm: [1000, 1500],
          ratios: [
            { value: 10, efficiencyModifier: 0.97 },
            { value: 20, efficiencyModifier: 0.94 },
            { value: 30, efficiencyModifier: 0.9 },
            { value: 40, efficiencyModifier: 0.87 },
            { value: 50, efficiencyModifier: 0.85 },
          ],
          sizes: [
            {
              size_id: '37',
              max_torque_nm: 200,
              nominal_power_range_kw: [0.55, 3],
              efficiency_range: [0.72, 0.84],
              available_mounting_types: ['B5', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 3,
              solid_shaft_d_mm: 25,
            },
            {
              size_id: '47',
              max_torque_nm: 420,
              nominal_power_range_kw: [1.5, 7.5],
              efficiency_range: [0.74, 0.86],
              available_mounting_types: ['B5', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 7.5,
              solid_shaft_d_mm: 32,
            },
            {
              size_id: '67',
              max_torque_nm: 900,
              nominal_power_range_kw: [4, 15],
              efficiency_range: [0.76, 0.88],
              available_mounting_types: ['B5', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 15,
              solid_shaft_d_mm: 40,
            },
          ],
        },
      ],
    },
    {
      brandId: 'siemens',
      displayName: 'Siemens Simogear',
      series: [
        {
          series_id: 'E',
          label: 'E — coaxial helicoidal (orientativo)',
          topology: 'helical',
          standard_motor_sync_rpm: [1000, 1500],
          ratios: [{ value: 8 }, { value: 16 }, { value: 24 }, { value: 32 }],
          sizes: [
            {
              size_id: '089',
              max_torque_nm: 800,
              nominal_power_range_kw: [1.1, 11],
              efficiency_range: [0.94, 0.98],
              available_mounting_types: ['B3', 'B5'],
              shaft_type_default: 'solid',
              reference_motor_kw: 11,
              solid_shaft_d_mm: 38,
            },
            {
              size_id: '109',
              max_torque_nm: 1600,
              nominal_power_range_kw: [3, 30],
              efficiency_range: [0.94, 0.98],
              available_mounting_types: ['B3', 'B5'],
              shaft_type_default: 'solid',
              reference_motor_kw: 30,
              solid_shaft_d_mm: 48,
            },
          ],
        },
      ],
    },
    {
      brandId: 'nord',
      displayName: 'Nord Drivesystems',
      series: [
        {
          series_id: 'SK',
          label: 'SK — UNICASE (orientativo)',
          topology: 'helical',
          standard_motor_sync_rpm: [1000, 1500],
          ratios: [{ value: 10 }, { value: 20 }, { value: 30 }, { value: 40 }],
          sizes: [
            {
              size_id: '42',
              max_torque_nm: 350,
              nominal_power_range_kw: [0.75, 5.5],
              efficiency_range: [0.93, 0.97],
              available_mounting_types: ['B3', 'B5'],
              shaft_type_default: 'solid',
              reference_motor_kw: 5.5,
              solid_shaft_d_mm: 35,
            },
            {
              size_id: '62',
              max_torque_nm: 1100,
              nominal_power_range_kw: [3, 18.5],
              efficiency_range: [0.94, 0.98],
              available_mounting_types: ['B3', 'B5'],
              shaft_type_default: 'solid',
              reference_motor_kw: 18.5,
              solid_shaft_d_mm: 45,
            },
          ],
        },
      ],
    },
    {
      brandId: 'bonfiglioli',
      displayName: 'Bonfiglioli',
      series: [
        {
          series_id: 'VF',
          label: 'VF — sinfín (orientativo)',
          topology: 'worm',
          standard_motor_sync_rpm: [1000, 1500],
          ratios: [
            { value: 10, efficiencyModifier: 0.96 },
            { value: 20, efficiencyModifier: 0.92 },
            { value: 30, efficiencyModifier: 0.88 },
            { value: 50, efficiencyModifier: 0.82 },
          ],
          sizes: [
            {
              size_id: '63',
              max_torque_nm: 240,
              nominal_power_range_kw: [0.55, 4],
              efficiency_range: [0.7, 0.82],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 4,
              solid_shaft_d_mm: 28,
            },
            {
              size_id: '86',
              max_torque_nm: 720,
              nominal_power_range_kw: [2.2, 15],
              efficiency_range: [0.74, 0.86],
              available_mounting_types: ['B5', 'B14', 'B3'],
              shaft_type_default: 'solid',
              reference_motor_kw: 15,
              solid_shaft_d_mm: 40,
            },
          ],
        },
      ],
    },
  ],
};
