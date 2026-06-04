/**
 * Single-screw extruder — drag-flow + Power-Law die model (Rauwendaal / Tadmor & Gogos).
 */

export const POLYMER_DATA = Object.freeze({
  hdpe: { K: 7000, n: 0.45, rho: 760, Cp: 2300, Trange: [180, 240] },
  ldpe: { K: 4000, n: 0.4, rho: 740, Cp: 2200, Trange: [160, 220] },
  pp: { K: 5500, n: 0.42, rho: 750, Cp: 2100, Trange: [200, 260] },
  abs: { K: 8000, n: 0.38, rho: 970, Cp: 1400, Trange: [210, 260] },
  pvc: { K: 12000, n: 0.35, rho: 1250, Cp: 1000, Trange: [160, 200] },
  custom: { K: 7000, n: 0.45, rho: 760, Cp: 2300, Trange: [100, 320] },
});

const IEC_KW = [
  0.12, 0.18, 0.25, 0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55,
  75, 90, 110, 132, 160, 200, 250,
];

/**
 * @param {object} p
 */
export function computeExtruder({
  D_mm,
  LD,
  h_mm,
  phi_deg,
  N_rpm,
  K,
  n_idx,
  rho_melt,
  die_D_mm,
  die_L_mm,
  die_Di_mm = '',
  die_type = 'circular',
  sf = 1.35,
  daily_hours = 16,
}) {
  const pi = Math.PI;
  const D = D_mm / 1000;
  const h = h_mm / 1000;
  const L = D * LD;
  const phi = (phi_deg * pi) / 180;
  const e = 0.1 * D;
  const W = pi * D * Math.cos(phi) - e;

  const FD = 1 / (1 + 0.37 * Math.pow(h / W, 1.2));
  const Vz = pi * D * (N_rpm / 60) * Math.cos(phi);
  const Q_drag = 0.5 * W * h * Vz * FD;

  const R = die_D_mm / 2 / 1000;
  const L_die = die_L_mm / 1000;
  const isAnnular = die_type === 'annular' && die_Di_mm;
  const Ri = isAnnular ? die_Di_mm / 2 / 1000 : 0;
  const gap = isAnnular ? R - Ri : 0;
  const peri = isAnnular ? pi * (R + Ri) : 0;

  let Q = Q_drag * 0.8;
  let dP_Pa = 0;
  let gamma_app = 0;
  let tau_w = 0;
  let converged = false;

  for (let i = 0; i < 20; i++) {
    if (!isAnnular) {
      gamma_app = (4 * Q) / (pi * Math.pow(R, 3));
      const gamma_true = (gamma_app * (3 * n_idx + 1)) / (4 * n_idx);
      tau_w = K * Math.pow(gamma_true, n_idx);
      dP_Pa = (2 * L_die * tau_w) / R;
    } else {
      gamma_app = (6 * Q) / (peri * Math.pow(gap, 2));
      const gamma_true = (gamma_app * (2 * n_idx + 1)) / (3 * n_idx);
      tau_w = K * Math.pow(gamma_true, n_idx);
      dP_Pa = (2 * L_die * tau_w) / gap;
    }
    const eta_eff = K * Math.pow(Math.max(gamma_app, 0.001), n_idx - 1);
    const Qp = (W * Math.pow(h, 3) * dP_Pa) / (12 * eta_eff * L);
    const Q_new = Q_drag - Qp;
    if (Math.abs(Q_new - Q) / Math.max(Math.abs(Q), 1e-12) < 0.001) {
      Q = Q_new;
      converged = true;
      break;
    }
    Q = Q_new;
  }

  const Q_net = Math.max(Q, 0);
  const Q_kg_h = Q_net * rho_melt * 3600;
  const dP_bar = dP_Pa / 1e5;

  const A_die = !isAnnular ? pi * R * R : pi * (R * R - Ri * Ri);
  const v_ext_mms = A_die > 0 ? (Q_net / A_die) * 1000 : 0;

  const tau_screw = K * Math.pow(Vz / h, n_idx);
  const P_base_W = (pi * pi * D * D * L * (N_rpm / 60) * tau_screw) / h;
  const P_total_kW = (P_base_W * 1.3) / 1000;
  const P_design_kW = P_total_kW * sf;

  const P_iec = IEC_KW.find((p) => p >= P_design_kW) ?? P_design_kW * 1.1;
  const ie_class = daily_hours >= 8 ? 'IE3' : 'IE2';

  const Cp_ref = 2000;
  const deltaT = Q_kg_h > 0 ? P_base_W / ((Q_kg_h / 3600) * Cp_ref) : 0;

  const omega = (2 * pi * N_rpm) / 60;
  const torque_Nm = omega > 0 ? (P_base_W / omega) : 0;
  const torqueWithService_Nm = torque_Nm * sf;

  const warnings = [];
  if (gamma_app > 500) warnings.push(gamma_app > 1000 ? 'danger:gamma_high' : 'warn:gamma_elevated');
  if (dP_bar > 300) warnings.push('warn:pressure_high');
  if (Q_net <= 0) warnings.push('danger:negative_flow');
  if (deltaT > 30) warnings.push('tip:shear_heating');

  return {
    D_m: D,
    L_m: L,
    h_m: h,
    W_m: W,
    FD,
    Vz_ms: Vz,
    Q_drag_kg_h: Q_drag * rho_melt * 3600,
    Q_net_kg_h: Q_kg_h,
    v_extrudate_mms: v_ext_mms,
    dP_die_bar: dP_bar,
    gamma_app_s: gamma_app,
    tau_w_Pa: tau_w,
    P_total_kW,
    P_design_kW,
    P_iec_kW: P_iec,
    ie_class,
    deltaT_K: deltaT,
    iter_converged: converged,
    warnings,
    drumRpm: N_rpm,
    torqueAtDrum_Nm: torque_Nm,
    torqueWithService_Nm,
    requiredMotorPower_kW: P_design_kW,
    serviceFactorUsed: sf,
  };
}
