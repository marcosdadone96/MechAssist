/**
 * Elevador de coches mecánico (2 columnas) — husillo/tornillo sin fin con tuerca de bronce + tuerca de seguridad.
 * Modelo educativo; no sustituye diseño normativo, cálculo de fatiga, estabilidad de columnas ni selección certificada.
 */

const g = 9.81;

/**
 * Ángulo de hélice (rad) en diámetro medio aproximado.
 * Aproximación: d_m ≈ d - 0.5·p (p y d en mm).
 */
export function helixAngle_rad(pitch_mm, screwDiameter_mm) {
  const p = Math.max(0.5, Number(pitch_mm) || 6);
  const d = Math.max(6, Number(screwDiameter_mm) || 35);
  const dm = Math.max(0.6 * d, d - 0.5 * p);
  const lead = p; // 1 entrada por defecto
  return Math.atan(lead / (Math.PI * dm));
}

/**
 * Par de elevación por columna (N·m) para tornillo de potencia con rozamiento en flanco.
 * Fórmula clásica (perfil cuadrado aproximado): T = F*(d_m/2)*tan(φ + λ).
 */
export function raisingTorquePerColumn_Nm(forcePerColumn_N, pitch_mm, screwDiameter_mm, mu_thread) {
  const F = Math.max(0, Number(forcePerColumn_N) || 0);
  const p = Math.max(0.5, Number(pitch_mm) || 6);
  const d = Math.max(6, Number(screwDiameter_mm) || 35);
  const dm_mm = Math.max(0.6 * d, d - 0.5 * p);
  const dm = dm_mm / 1000;
  const mu = Math.max(0.03, Math.min(0.25, Number(mu_thread) || 0.12));
  const phi = Math.atan(mu);
  const lam = helixAngle_rad(p, d);
  return F * (dm / 2) * Math.tan(phi + lam);
}

/**
 * Presión de contacto media (MPa) en tuerca: p ≈ F / (π d_m L).
 * d_m y L en mm; F en N → N/mm² = MPa.
 */
export function nutContactPressure_MPa(force_N, meanDiameter_mm, nutLength_mm) {
  const F = Math.max(0, Number(force_N) || 0);
  const dm = Math.max(6, Number(meanDiameter_mm) || 30);
  const L = Math.max(10, Number(nutLength_mm) || 80);
  const area_mm2 = Math.PI * dm * L;
  return area_mm2 > 1e-6 ? F / area_mm2 : 0;
}

/**
 * Autofrenado (self-locking): λ < φ (ángulo de hélice menor que ángulo de rozamiento).
 */
export function isSelfLocking(pitch_mm, screwDiameter_mm, mu_thread) {
  const mu = Math.max(0.03, Math.min(0.25, Number(mu_thread) || 0.12));
  const phi = Math.atan(mu);
  const lam = helixAngle_rad(pitch_mm, screwDiameter_mm);
  return lam < phi * 0.995;
}

/**
 * @param {object} p
 * @param {number} p.capacity_kg — capacidad total (vehículo) en kg
 * @param {number} p.liftHeight_m
 * @param {number} p.liftTime_s — tiempo deseado de elevación (s)
 * @param {number} p.pitch_mm
 * @param {number} p.screwDiameter_mm
 * @param {number} p.nutLength_mm — longitud efectiva de tuerca (mm)
 * @param {number} p.mu_thread — rozamiento efectivo en rosca (acero–bronce orientativo)
 * @param {number} [p.columns] — por defecto 2
 * @param {number} [p.serviceFactor] — margen dinámico para motorreductor (1.0–2.0)
 * @param {number} [p.pAllow_MPa] — presión admisible bronce (orientativo)
 */
export function computeCarLiftScrew(p) {
  const columns = Math.max(1, Math.round(Number(p.columns) || 2));
  const m = Math.max(0, Number(p.capacity_kg) || 3000);
  const H = Math.max(0.2, Number(p.liftHeight_m) || 1.8);
  const t = Math.max(2, Number(p.liftTime_s) || 45);
  const pitch = Math.max(0.5, Number(p.pitch_mm) || 8);
  const d = Math.max(10, Number(p.screwDiameter_mm) || 45);
  const mu = Math.max(0.03, Math.min(0.25, Number(p.mu_thread) || 0.12));
  const Lnut = Math.max(10, Number(p.nutLength_mm) || 90);
  const SF = Math.max(1.0, Math.min(2.2, Number(p.serviceFactor) || 1.35));
  const pAllow = Math.max(4, Math.min(25, Number(p.pAllow_MPa) || 10));

  const F_total = m * g;
  const F_col = F_total / columns;

  const dm_mm = Math.max(0.6 * d, d - 0.5 * pitch);
  const lam = helixAngle_rad(pitch, d);
  const phi = Math.atan(mu);
  const selfLocking = isSelfLocking(pitch, d, mu);

  const torque_col = raisingTorquePerColumn_Nm(F_col, pitch, d, mu);
  const torque_total = torque_col * columns;

  const turns = (H * 1000) / pitch;
  const rpm = (turns / (t / 60));
  const omega = (2 * Math.PI * rpm) / 60;
  const power_kW = (torque_total * omega) / 1000;

  const torque_design = torque_total * SF;
  const power_design_kW = power_kW * SF;

  const pContact = nutContactPressure_MPa(F_col, dm_mm, Lnut);

  /** @type {Array<{ level: 'ok'|'warn'|'err', code: string, text: string }>} */
  const verdicts = [];

  if (!selfLocking) {
    verdicts.push({
      level: 'err',
      code: 'self_lock',
      text: `No cumple autofrenado: ángulo hélice λ=${(lam * 180 / Math.PI).toFixed(1)}° ≥ ángulo rozamiento φ=${(phi * 180 / Math.PI).toFixed(1)}°. Riesgo de bajada por gravedad; use freno/antirretorno o ajuste paso/diámetro/μ.`,
    });
  } else if ((phi - lam) / Math.max(phi, 1e-6) < 0.12) {
    verdicts.push({
      level: 'warn',
      code: 'self_lock_margin',
      text: `Autofrenado OK pero con margen bajo (λ≈${(lam * 180 / Math.PI).toFixed(1)}°, φ≈${(phi * 180 / Math.PI).toFixed(1)}°). Considere freno redundante según normativa del elevador.`,
    });
  }

  if (pContact > pAllow) {
    verdicts.push({
      level: 'err',
      code: 'nut_pressure',
      text: `Presión de contacto alta en tuerca: p≈${pContact.toFixed(1)} MPa > admisible ${pAllow.toFixed(0)} MPa (orient.). Aumente longitud de tuerca, diámetro medio o reduzca carga por columna.`,
    });
  } else if (pContact > 0.85 * pAllow) {
    verdicts.push({
      level: 'warn',
      code: 'nut_pressure_margin',
      text: `Presión de contacto elevada en tuerca: p≈${pContact.toFixed(1)} MPa (cerca del límite ${pAllow.toFixed(0)} MPa). Revise desgaste y lubricación.`,
    });
  }

  if (rpm > 60) {
    verdicts.push({
      level: 'warn',
      code: 'rpm',
      text: `RPM de husillo alta (${rpm.toFixed(1)} min⁻¹) para tornillo de potencia típico. Revise vibración, lubricación y calor; ajuste tiempo de elevación o paso.`,
    });
  }

  if (verdicts.every((v) => v.level !== 'err')) {
    verdicts.push({
      level: 'ok',
      code: 'ok',
      text: `Cálculo OK (modelo orientativo). Par elevación ≈ ${torque_total.toFixed(0)} N·m (total), potencia ≈ ${power_kW.toFixed(2)} kW; autofrenado ${selfLocking ? 'OK' : 'NO'}.`,
    });
  }

  return {
    inputs: {
      columns,
      capacity_kg: m,
      liftHeight_m: H,
      liftTime_s: t,
      pitch_mm: pitch,
      screwDiameter_mm: d,
      meanDiameter_mm: dm_mm,
      nutLength_mm: Lnut,
      mu_thread: mu,
      serviceFactor: SF,
      pAllow_MPa: pAllow,
    },
    geometry: {
      helixAngle_deg: (lam * 180) / Math.PI,
      frictionAngle_deg: (phi * 180) / Math.PI,
    },
    selfLocking,
    loads: {
      forceTotal_N: F_total,
      forcePerColumn_N: F_col,
    },
    drive: {
      screw_rpm: rpm,
      torqueTotal_Nm: torque_total,
      power_kW: power_kW,
      torqueDesign_Nm: torque_design,
      powerDesign_kW: power_design_kW,
    },
    nut: {
      contactPressure_MPa: pContact,
    },
    verdicts,
    disclaimer:
      'Modelo educativo. Verifique tuerca de seguridad, freno, finales de carrera, pandeo/estabilidad de columnas y normativa aplicable.',
  };
}

