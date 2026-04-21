/**
 * Diámetro mínimo orientativo de eje circular macizo por criterio de torsión.
 * τ = 16T / (πd³) → d = ∛(16T / (π τ_adm))
 * T en N·m, τ en Pa, d en m. Uso preliminar; validar fatiga, llaves, rodamientos y norma de fabricante.
 */

/** Tensión tangencial admisible orientativa (acero, servicio general, sin detalle de fatiga). */
export const DEFAULT_TAU_ADM_PA = 35e6;

/**
 * @param {number} torque_Nm
 * @param {number} [tau_Pa]
 * @returns {number} diámetro en metros o NaN
 */
export function solidShaftDiameter_m(torque_Nm, tau_Pa = DEFAULT_TAU_ADM_PA) {
  if (!Number.isFinite(torque_Nm) || torque_Nm <= 0) return NaN;
  if (!Number.isFinite(tau_Pa) || tau_Pa <= 0) return NaN;
  return Math.cbrt((16 * torque_Nm) / (Math.PI * tau_Pa));
}

/**
 * @param {number} torque_Nm
 * @param {number} [tau_Pa]
 * @returns {number} mm o NaN
 */
export function solidShaftDiameter_mm(torque_Nm, tau_Pa = DEFAULT_TAU_ADM_PA) {
  const d = solidShaftDiameter_m(torque_Nm, tau_Pa);
  return Number.isFinite(d) ? d * 1000 : NaN;
}

/**
 * Par aproximado en el eje del motor antes del reductor.
 * T_m ≈ T_tambor / (i · η_red), η_red ≈ 0,96 orientativo.
 */
export function motorShaftTorqueApprox_Nm(torqueDrum_Nm, ratio, etaGearbox = 0.96) {
  if (!Number.isFinite(torqueDrum_Nm) || torqueDrum_Nm <= 0) return NaN;
  if (!Number.isFinite(ratio) || ratio <= 0) return NaN;
  const η = Number.isFinite(etaGearbox) && etaGearbox > 0 ? etaGearbox : 0.96;
  return torqueDrum_Nm / (ratio * η);
}

/** Redondeo hacia arriba a paso comercial (mm). */
export function roundUpShaft_mm(d_mm, stepMm = 5) {
  if (!Number.isFinite(d_mm) || d_mm <= 0) return NaN;
  const s = Math.max(1, stepMm);
  return Math.ceil(d_mm / s) * s;
}

/**
 * @param {object} p
 * @param {number} p.torqueDrum_Nm — par de diseño en tambor / salida reductor
 * @param {number} p.ratio — i = n_motor / n_tambor
 * @param {number} [p.etaGearbox]
 * @param {number} [p.tau_Pa]
 */
export function shaftSizingFromDrive(p) {
  const Td = p.torqueDrum_Nm;
  const i = p.ratio;
  const η = p.etaGearbox ?? 0.96;
  const τ = p.tau_Pa ?? DEFAULT_TAU_ADM_PA;
  const Tm = motorShaftTorqueApprox_Nm(Td, i, η);
  const dMotorMin_mm = solidShaftDiameter_mm(Tm, τ);
  const dOutMin_mm = solidShaftDiameter_mm(Td, τ);
  return {
    torqueMotor_Nm: Tm,
    dMotor_min_mm: dMotorMin_mm,
    dMotor_suggest_mm: roundUpShaft_mm(dMotorMin_mm, 5),
    dGearboxOut_min_mm: dOutMin_mm,
    dGearboxOut_suggest_mm: roundUpShaft_mm(dOutMin_mm, 5),
    /** Mismo orden de magnitud que salida de reductor si acopla directo al tambor */
    dDrumShaft_min_mm: dOutMin_mm,
    dDrumShaft_suggest_mm: roundUpShaft_mm(dOutMin_mm, 5),
    tau_used_Pa: τ,
  };
}
