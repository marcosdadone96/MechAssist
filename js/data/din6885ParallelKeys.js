/**
 * Chavetas paralelas forma A — dimensiones nominales tipo DIN 6885-1 (extracto educativo).
 * d_eje en mm: rango [d_min, d_max) → b, h, t1 (prof. eje), t2 (prof. cubo) orientativos.
 */

export const DIN6885_FORM_A_ROWS = [
  { d_min: 6, d_max: 8, b: 2, h: 2, t1: 1.2, t2: 1.0 },
  { d_min: 8, d_max: 10, b: 3, h: 3, t1: 1.8, t2: 1.4 },
  { d_min: 10, d_max: 12, b: 4, h: 4, t1: 2.5, t2: 1.8 },
  { d_min: 12, d_max: 17, b: 5, h: 5, t1: 3.0, t2: 2.3 },
  { d_min: 17, d_max: 22, b: 6, h: 6, t1: 3.5, t2: 2.8 },
  { d_min: 22, d_max: 30, b: 8, h: 7, t1: 4.0, t2: 3.3 },
  { d_min: 30, d_max: 38, b: 10, h: 8, t1: 5.0, t2: 3.3 },
  { d_min: 38, d_max: 44, b: 12, h: 8, t1: 5.0, t2: 3.3 },
  { d_min: 44, d_max: 50, b: 14, h: 9, t1: 5.5, t2: 3.8 },
  { d_min: 50, d_max: 58, b: 16, h: 10, t1: 6.0, t2: 4.3 },
  { d_min: 58, d_max: 65, b: 18, h: 11, t1: 7.0, t2: 4.4 },
  { d_min: 65, d_max: 75, b: 20, h: 12, t1: 7.5, t2: 4.9 },
  { d_min: 75, d_max: 85, b: 22, h: 14, t1: 9.0, t2: 5.4 },
  { d_min: 85, d_max: 95, b: 25, h: 14, t1: 9.0, t2: 5.4 },
  { d_min: 95, d_max: 110, b: 28, h: 16, t1: 10.0, t2: 6.4 },
];

/** Longitudes comerciales típicas L (mm) */
export const DIN6885_STANDARD_LENGTHS = [8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40, 45, 50, 56, 63, 70, 80, 90, 100];

/** Tensión admisible a aplastamiento (MPa) — valores orientativos con SF ya implícito en uso */
export const KEY_MATERIAL_ALLOWABLE_MPA = {
  c45: { label: 'Acero C45 (temple+revenido)', sigma_lim_MPa: 100 },
  inox: { label: 'Acero inox. (AISI 304 aprox.)', sigma_lim_MPa: 70 },
};
