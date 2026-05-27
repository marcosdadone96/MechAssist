/**
 * Trapezoidal power screw (ISO 2904 style) — simplified mechanics.
 */

const MU_PRESETS = {
  'bronze-lub': 0.08,
  'bronze-dry': 0.12,
  'steel-lub': 0.15,
  'steel-dry': 0.2,
};

/**
 * @param {object} p
 */
export function computePowerScrew(p) {
  const p_mm = p.pitch_mm;
  const d_mm = p.diameter_mm;
  const nStarts = p.starts || 1;
  const F_N = p.load_N;
  const mu = p.mu_custom ?? MU_PRESETS[p.mu_key] ?? 0.12;
  const alphaDeg = 15;
  const nutTurns = Math.max(1, p.nutTurns || 5);
  const padm = p.padm_MPa || 0;

  if (!(p_mm > 0) || !(d_mm > 0) || !(F_N >= 0)) return { ok: false };

  const L_mm = nStarts * p_mm;
  const d2 = d_mm - 0.5 * p_mm;
  const d1 = d_mm - p_mm;
  const alpha = (alphaDeg * Math.PI) / 180;
  const lambda = Math.atan(L_mm / (Math.PI * d2));
  const phiP = Math.atan(mu / Math.cos(alpha));

  const T_raise_Nmm = F_N * (d2 / 2) * Math.tan(lambda + phiP);
  const T_lower_Nmm = F_N * (d2 / 2) * Math.tan(phiP - lambda);
  const T_raise_Nm = T_raise_Nmm / 1000;
  const T_lower_Nm = T_lower_Nmm / 1000;

  const selfLocking = lambda < phiP;
  const eta_raise = T_raise_Nmm > 0 ? (F_N * L_mm) / (2 * Math.PI * T_raise_Nmm) : 0;
  const eta_lower =
    !selfLocking && T_lower_Nmm > 0 ? (2 * Math.PI * T_lower_Nmm) / (F_N * L_mm) : 0;

  const N_rpm = p.rpm;
  const P_kW =
    N_rpm > 0 && T_raise_Nm > 0 ? (T_raise_Nm * 2 * Math.PI * N_rpm) / 60000 : null;

  const p_surf =
    nutTurns > 0 && d2 > 0 && p_mm > 0 ? F_N / (nutTurns * Math.PI * d2 * (p_mm / 2)) : 0;
  const usageP = padm > 0 ? p_surf / padm : null;

  const lambdaDeg = (lambda * 180) / Math.PI;

  return {
    ok: true,
    L_mm,
    d2,
    d1,
    lambdaDeg,
    T_raise_Nm,
    T_lower_Nm,
    selfLocking,
    eta_raise,
    eta_lower,
    P_kW,
    p_surf,
    usageP,
    mu,
  };
}

export { MU_PRESETS };
