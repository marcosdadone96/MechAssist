/**
 * Motorreductores tipo catálogo (SEW DR2S / Siemens orientativo) — J_motor, par nominal, curva simplificada.
 * Curva: par relativo vs velocidad relativa (1 = síncrono / campo base).
 */

export const GEAR_MOTOR_CATALOG = [
  {
    id: 'dr2s71',
    label: 'SEW DR2S 71 · 0,55 kW · 4p',
    P_kW: 0.55,
    n_sync: 1500,
    J_motor_kgm2: 0.00042,
    T_N_m: 3.55,
    n_nom: 1390,
    /** T(ω) puntos: fracción n/n_sync, T/T_N */
    curve: [
      [0.05, 2.2],
      [0.2, 1.35],
      [0.5, 1.08],
      [0.85, 1.02],
      [1.0, 0],
    ],
    J_ratio_max: 10,
  },
  {
    id: 'dr2s80',
    label: 'SEW DR2S 80 · 1,1 kW · 4p',
    P_kW: 1.1,
    n_sync: 1500,
    J_motor_kgm2: 0.00089,
    T_N_m: 7.1,
    n_nom: 1420,
    curve: [
      [0.05, 2.15],
      [0.2, 1.32],
      [0.5, 1.07],
      [0.85, 1.0],
      [1.0, 0],
    ],
    J_ratio_max: 10,
  },
  {
    id: 'dr2s90',
    label: 'SEW DR2S 90 · 2,2 kW · 4p',
    P_kW: 2.2,
    n_sync: 1500,
    J_motor_kgm2: 0.0021,
    T_N_m: 14.5,
    n_nom: 1435,
    curve: [
      [0.05, 2.1],
      [0.2, 1.3],
      [0.5, 1.06],
      [0.85, 0.98],
      [1.0, 0],
    ],
    J_ratio_max: 15,
  },
  {
    id: 'siem1la7',
    label: 'Siemens 1LA7 · 3 kW · 4p (orientativo)',
    P_kW: 3,
    n_sync: 1500,
    J_motor_kgm2: 0.0035,
    T_N_m: 19.5,
    n_nom: 1445,
    curve: [
      [0.05, 2.0],
      [0.2, 1.28],
      [0.5, 1.05],
      [0.85, 0.97],
      [1.0, 0],
    ],
    J_ratio_max: 10,
  },
];
