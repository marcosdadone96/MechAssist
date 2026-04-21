/**
 * Transmisión por correa trapezoidal / plana (primitivos) — tramo abierto.
 * Longitud: L ≈ 2C + π(d₁+d₂)/2 + (d₂−d₁)²/(4C).
 * Cinemática: deslizamiento s (%) sobre la polea conducida reduce n₂ respecto al valor teórico.
 * Referencia dimensional: perfiles y pasos ISO 4184 (selección de correa no incluida en esta demo).
 */

import { rpmToRadPerSec } from './siUnits.js';

/**
 * @param {object} p
 * @param {number} p.d1_mm — polea motriz (menor en convención actual)
 * @param {number} p.d2_mm
 * @param {number} p.center_mm
 * @param {number} [p.n1_rpm]
 * @param {number} [p.slip_pct] — deslizamiento medio en % (típ. 1–3 % en V-belt)
 */
export function computeOpenBeltDrive(p) {
  const d1 = Math.max(10, Number(p.d1_mm) || 100);
  const d2 = Math.max(10, Number(p.d2_mm) || 200);
  const C = Math.max(50, Number(p.center_mm) || 400);
  const L = 2 * C + (Math.PI / 2) * (d1 + d2) + ((d2 - d1) * (d2 - d1)) / (4 * C);
  const alpha = Math.asin(Math.min(1, Math.abs(d2 - d1) / (2 * C)));
  const wrap1 = Math.PI - 2 * alpha;
  const wrap2 = Math.PI + 2 * alpha;

  const slipPct = Number(p.slip_pct);
  /** Sin valor explícito → 0 (p. ej. cintas que reutilizan esta función); correas V pasan s típico desde la UI. */
  const slip_frac = Number.isFinite(slipPct)
    ? Math.min(0.2, Math.max(0, slipPct / 100))
    : 0;

  const n1 = Number(p.n1_rpm);
  const n1f = Number.isFinite(n1) && n1 > 0 ? n1 : null;
  const r1_m = d1 / 2000;
  const r2_m = d2 / 2000;
  const omega1_rad_s = n1f != null ? rpmToRadPerSec(n1f) : null;
  const v_m_s = omega1_rad_s != null ? omega1_rad_s * r1_m : null;

  const n2_theoretical_rpm = n1f != null && d2 > 0 ? (n1f * d1) / d2 : null;
  const n2_rpm_real =
    n2_theoretical_rpm != null ? n2_theoretical_rpm * (1 - slip_frac) : null;
  const omega2_rad_s = n2_rpm_real != null ? rpmToRadPerSec(n2_rpm_real) : null;

  const engineeringAlerts = [];
  if (v_m_s != null) {
    if (v_m_s < 5) {
      engineeringAlerts.push({
        level: 'warn',
        text: 'Velocidad de correa baja (< ~5 m/s): enfriamiento limitado y mayor riesgo de inestabilidad — revise pretensado y nº de correas (ISO 4184 / catálogo).',
      });
    }
    if (v_m_s > 30) {
      engineeringAlerts.push({
        level: 'danger',
        text: 'Velocidad de correa > 30 m/s: fuerzas centrífugas elevadas y desgaste — típicamente requiere poleas balanceadas, perfiles especiales y validación de fabricante.',
      });
    } else if (v_m_s > 25) {
      engineeringAlerts.push({
        level: 'warn',
        text: 'Velocidad de correa alta (> ~25 m/s): comprobar límite del perfil y balanceo (ISO 4184 / fabricante).',
      });
    }
  }

  return {
    d1,
    d2,
    center_mm: C,
    beltLength_mm: L,
    ratio: d2 / d1,
    wrapAngle_deg_small: (wrap1 * 180) / Math.PI,
    wrapAngle_deg_large: (wrap2 * 180) / Math.PI,
    slip_pct: slip_frac * 100,
    n1_rpm: n1f,
    n2_rpm_theoretical: n2_theoretical_rpm,
    n2_rpm: n2_rpm_real,
    omega1_rad_s,
    omega2_rad_s,
    beltSpeed_m_s: v_m_s,
    engineeringAlerts,
    normNote: 'ISO 4184 — perfiles y pasos de correas trapezoidales; esta herramienta no selecciona sección SPZ/SPA/…',
  };
}
