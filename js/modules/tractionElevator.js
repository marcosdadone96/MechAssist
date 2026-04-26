/**
 * Ascensor de tracción (montacargas / orientativo personas) — tracción por cable, contrapeso, Euler-Eytelwein.
 * Modelo educativo; no sustituye EN 81-20/50, códigos locales ni memoria de cálculo de fabricante.
 */

/** @typedef {'1_1'|'2_1'} ReevingType */
/** @typedef {'freight'|'persons'} ElevatorDuty */

const g = 9.81;

/**
 * Catálogo demo: cable acero 6×19 clase orientativa — carga mínima de rotura por cable (kN).
 * @type {Array<{ d_mm: number, minBreak_kN: number }>}
 */
export const WIRE_ROPE_CATALOG = [
  { d_mm: 8, minBreak_kN: 44 },
  { d_mm: 9, minBreak_kN: 55 },
  { d_mm: 10, minBreak_kN: 68 },
  { d_mm: 11, minBreak_kN: 82 },
  { d_mm: 12, minBreak_kN: 97 },
  { d_mm: 13, minBreak_kN: 113 },
  { d_mm: 14, minBreak_kN: 130 },
];

/**
 * Masa de contrapeso habitual: cabina + k · carga útil (k ≈ 0,4–0,5).
 */
export function optimalCounterweight_kg(emptyCar_kg, usefulLoad_kg, k = 0.45) {
  const Mc = Math.max(0, Number(emptyCar_kg) || 0);
  const Q = Math.max(0, Number(usefulLoad_kg) || 0);
  const kk = Math.max(0.35, Math.min(0.55, Number(k) || 0.45));
  return Mc + kk * Q;
}

/**
 * Límite Euler-Eytelwein: T₁/T₂ ≤ e^(μ α) (α en rad).
 */
export function eulerLimit(mu, wrapAngle_rad) {
  const m = Math.max(0.02, Number(mu) || 0.1);
  const a = Math.max(0.1, Number(wrapAngle_rad) || Math.PI);
  return Math.exp(m * a);
}

/**
 * Peor relación de tensiones estáticas en la polea (rama cargada / rama contrapeso) — casos típicos ascenso pleno y descenso vacío.
 */
export function worstStaticTensionRatio(Mc, Q, Mcp) {
  const mc = Math.max(1e-6, Mc);
  const q = Math.max(0, Q);
  const mcp = Math.max(1e-6, Mcp);
  const fullCar = mc + q;
  const r1 = fullCar / mcp;
  const r2 = mcp / mc;
  return Math.max(r1, r2);
}

/**
 * Selección de diámetro y número de cables: n · F_rot ≥ (Mc+Q)·g · SF.
 * @returns {{ d_mm: number, n: number, minBreak_kN: number, utilFactor: number }}
 */
export function selectWireRope(Mc, Q, safetyFactor, maxStrands = 8) {
  const W = Math.max(0, Mc + Q) * g;
  const SF = Math.max(4, Number(safetyFactor) || 10);
  const maxN = Math.max(2, Math.round(Number(maxStrands) || 8));
  let best = /** @type {{ d_mm: number, n: number, minBreak_kN: number, utilFactor: number } | null} */ (null);
  for (const row of WIRE_ROPE_CATALOG) {
    const F = row.minBreak_kN * 1000;
    const n = Math.ceil((W * SF) / F);
    if (n <= maxN) {
      const util = W / (n * F);
      if (!best || row.d_mm < best.d_mm || (row.d_mm === best.d_mm && n < best.n)) {
        best = { d_mm: row.d_mm, n, minBreak_kN: row.minBreak_kN, utilFactor: util };
      }
    }
  }
  if (!best) {
    const row = WIRE_ROPE_CATALOG[WIRE_ROPE_CATALOG.length - 1];
    const F = row.minBreak_kN * 1000;
    const n = Math.ceil((W * SF) / F);
    best = { d_mm: row.d_mm, n, minBreak_kN: row.minBreak_kN, utilFactor: W / (n * F) };
  }
  return best;
}

/**
 * Par de frenado orientativo en la polea (par resistente a desequilibrio máximo).
 */
export function emergencyBrakeTorque_Nm(Mc, Q, Mcp, sheaveDiameter_m, brakeFactor = 1.25) {
  const D = Math.max(0.1, Number(sheaveDiameter_m) || 0.5);
  const bf = Math.max(1, Number(brakeFactor) || 1.25);
  const dF = Math.max(Math.abs(Mc + Q - Mcp), Math.abs(Mcp - Mc)) * g;
  return bf * dF * (D / 2);
}

/**
 * @param {object} p
 * @param {number} p.usefulLoad_kg
 * @param {number} p.emptyCar_kg
 * @param {number | null} [p.counterweight_kg] — si null, se usa óptimo con p.counterweightFraction
 * @param {number} [p.counterweightFraction] — 0,4–0,5
 * @param {number} p.travelHeight_m
 * @param {number} p.speed_m_s
 * @param {ReevingType} p.reeving
 * @param {number} p.sheaveDiameter_m
 * @param {number} p.wrapAngle_deg — abrazamiento en polea tractora
 * @param {number} p.friction_mu — μ cable–canal (orientativo)
 * @param {ElevatorDuty} p.duty — freight → SF 10, persons → 12
 * @param {number} [p.maxStrands]
 * @param {'es'|'en'} [p.lang] — copy for verdicts, steps, assumptions (default 'es')
 */
export function computeTractionElevator(p) {
  const lang = p.lang === 'en' ? 'en' : 'es';
  const en = lang === 'en';
  const Q = Math.max(0, Number(p.usefulLoad_kg) || 0);
  const Mc = Math.max(1, Number(p.emptyCar_kg) || 500);
  const H = Math.max(0.5, Number(p.travelHeight_m) || 10);
  const v = Math.max(0.1, Number(p.speed_m_s) || 1);
  const D = Math.max(0.2, Number(p.sheaveDiameter_m) || 0.6);
  const alpha_deg = Math.max(90, Math.min(360, Number(p.wrapAngle_deg) || 180));
  const alpha = (alpha_deg * Math.PI) / 180;
  const mu = Math.max(0.05, Math.min(0.25, Number(p.friction_mu) || 0.1));
  const duty = p.duty === 'persons' ? 'persons' : 'freight';
  const SF = duty === 'persons' ? 12 : 10;
  const kCw = Math.max(0.35, Math.min(0.55, Number(p.counterweightFraction) ?? 0.45));
  const Mcp_opt = optimalCounterweight_kg(Mc, Q, kCw);
  const Mcp =
    p.counterweight_kg != null && Number.isFinite(Number(p.counterweight_kg))
      ? Math.max(Mc * 0.5, Number(p.counterweight_kg))
      : Mcp_opt;

  const reeving = p.reeving === '2_1' ? '2_1' : '1_1';
  const mechFactor = reeving === '2_1' ? 0.5 : 1;

  const ratio = worstStaticTensionRatio(Mc, Q, Mcp);
  const lim = eulerLimit(mu, alpha);
  const adhesionOk = ratio <= lim * 0.999;
  const adhesionMargin = lim / Math.max(ratio, 1e-6);

  const rope = selectWireRope(Mc, Q, SF, p.maxStrands ?? 8);
  const T_brake = emergencyBrakeTorque_Nm(Mc, Q, Mcp, D, 1.25);
  const DdRatio = (D * 1000) / Math.max(1, rope.d_mm);
  const minDdRecommended = duty === 'persons' ? 40 : 35;

  const F_imbalance = Math.abs(Mc + Q - Mcp) * g;
  const P_lift_kW = (F_imbalance * v * mechFactor) / 1000;
  const E_no_cw_J = (Mc + Q) * g * H * 2;
  const E_with_J = F_imbalance * H * 2;
  const savingPct = E_no_cw_J > 0 ? Math.min(95, ((E_no_cw_J - E_with_J) / E_no_cw_J) * 100) : 0;

  const omega = (v * (reeving === '2_1' ? 2 : 1) * 2) / D;
  const n_rpm = (omega * 60) / (2 * Math.PI);

  /** @type {Array<{ level: 'ok'|'warn'|'err', code: string, text: string }>} */
  const verdicts = [];
  if (!adhesionOk) {
    verdicts.push({
      level: 'err',
      code: 'euler',
      text: en
        ? `Sheave slip risk: T\u2081/T\u2082 \u2248 ${ratio.toFixed(2)} exceeds e^(\u03bc\u03b1) \u2248 ${lim.toFixed(
            2,
          )}. Increase wrap angle, effective \u03bc (grooves), or adjust counterweight / masses.`
        : `Riesgo de deslizamiento en la polea: T\u2081/T\u2082 \u2248 ${ratio.toFixed(
            2,
          )} supera e^(\u03bc\u03b1) \u2248 ${lim.toFixed(
            2,
          )}. Aumente abrazamiento, \u03bc efectivo (entallas), o ajuste contrapeso / masas.`,
    });
  } else if (adhesionMargin < 1.12) {
    verdicts.push({
      level: 'warn',
      code: 'euler_margin',
      text: en
        ? `Low traction margin (\u2248 ${adhesionMargin.toFixed(2)}). Check groove, rope condition and real maximum load.`
        : `Margen de adherencia bajo (\u2248 ${adhesionMargin.toFixed(2)}). Revise canal, estado de cables y carga m\u00e1xima real.`,
    });
  }

  if (rope.utilFactor > 0.82) {
    verdicts.push({
      level: 'warn',
      code: 'rope_util',
      text: en
        ? 'High use of nominal rope strength in the demo model \u2014 prefer a larger diameter or more ropes.'
        : 'Utilizaci\u00f3n elevada de la resistencia nominal del cable en el modelo demo \u2014 prefiera di\u00e1metro superior o m\u00e1s tiras.',
    });
  }

  if (DdRatio < minDdRecommended) {
    verdicts.push({
      level: 'warn',
      code: 'dd_ratio',
      text: en
        ? `Low D/d ratio (\u2248 ${DdRatio.toFixed(
            1,
          )}). D/d \u2265 ${minDdRecommended} is advisable for this duty; consider a larger sheave or smaller rope.`
        : `Relaci\u00f3n D/d baja (\u2248 ${DdRatio.toFixed(
            1,
          )}). Recomendable D/d >= ${minDdRecommended} para este servicio; considere mayor polea o menor di\u00e1metro de cable.`,
    });
  }

  if (mu < 0.08 || mu > 0.15) {
    verdicts.push({
      level: 'warn',
      code: 'mu_range',
      text: en
        ? `\u03bc=${mu.toFixed(
            2,
          )} outside the typical indicative range (0.08\u20130.15). Validate groove, finish and real traction conditions.`
        : `\u03bc=${mu.toFixed(
            2,
          )} fuera del rango orientativo habitual (0.08\u20130.15). Valide canal, acabado y condiciones reales de tracci\u00f3n.`,
    });
  }

  if (adhesionOk && adhesionMargin < 1.2) {
    verdicts.push({
      level: 'warn',
      code: 'adhesion_target',
      text: en
        ? `Traction margin is OK but tight (\u00d7${adhesionMargin.toFixed(
            2,
          )}). Preliminary design target: \u2265 \u00d71.20.`
        : `Margen de adherencia correcto pero justo (x${adhesionMargin.toFixed(
            2,
          )}). Objetivo recomendado: >= x1.20 en dise\u00f1o preliminar.`,
    });
  }

  if ((duty === 'persons' && v > 1.75) || (duty === 'freight' && v > 1.25)) {
    verdicts.push({
      level: 'warn',
      code: 'speed_service',
      text: en
        ? `Speed ${v.toFixed(2)} m/s is high for ${
            duty === 'persons' ? 'passenger' : 'freight'
          } duty in this simplified model; confirm start/stop dynamics and comfort in detailed calculation.`
        : `Velocidad ${v.toFixed(2)} m/s elevada para servicio ${
            duty === 'persons' ? 'personas' : 'carga'
          } en este modelo simplificado; confirme din\u00e1mica de arranque/frenado y confort en c\u00e1lculo detallado.`,
    });
  }

  const tractionOk = adhesionOk && rope.n <= (p.maxStrands ?? 8) + 2;
  if (tractionOk && verdicts.length === 0) {
    verdicts.push({
      level: 'ok',
      code: 'ok',
      text: en
        ? `Traction check OK (indicative model). ${rope.n} rope(s) of \u00d8${rope.d_mm} mm required (SF \u2248 ${SF}).`
        : `C\u00e1lculo de tracci\u00f3n OK (modelo orientativo). Se requieren ${rope.n} cable(s) de \u00d8${rope.d_mm} mm (SF \u2248 ${SF}).`,
    });
  } else if (tractionOk && verdicts.every((x) => x.level !== 'err')) {
    verdicts.push({
      level: 'ok',
      code: 'rope_ok',
      text: en
        ? `Rope layout: ${rope.n} \u00d7 \u00d8${rope.d_mm} mm (nominal breaking \u2248 ${rope.minBreak_kN} kN per rope).`
        : `Configuraci\u00f3n de cables: ${rope.n} \u00d7 \u00d8${rope.d_mm} mm (rotura nominal \u2248 ${rope.minBreak_kN} kN/cable).`,
    });
  }

  const steps = [
    {
      id: 'cw',
      title: en ? 'Target counterweight' : 'Contrapeso objetivo',
      formula: 'Mcp_opt = Mc + k*Q',
      substitution: `Mc=${Mc.toFixed(0)} kg, Q=${Q.toFixed(0)} kg, k=${kCw.toFixed(2)}`,
      value: Mcp_opt,
      unit: 'kg',
      meaning: en
        ? 'Indicative balance of car and useful-load fraction.'
        : 'Compensaci\u00f3n orientativa de cabina y fracci\u00f3n de carga \u00fatil.',
    },
    {
      id: 'euler',
      title: en ? 'Traction limit' : 'L\u00edmite de adherencia',
      formula: 'T1/T2 <= exp(mu*alpha)',
      substitution: `mu=${mu.toFixed(3)}, alpha=${alpha_deg.toFixed(0)}\u00b0`,
      value: lim,
      unit: '\u2014',
      meaning: en ? 'Euler\u2013Eytelwein criterion at the traction sheave.' : 'Criterio Euler-Eytelwein en polea tractora.',
    },
    {
      id: 'ratio',
      title: en ? 'Worst-case tension ratio' : 'Relaci\u00f3n de tensiones peor caso',
      formula: 'max((Mc+Q)/Mcp, Mcp/Mc)',
      substitution: `Mcp=${Mcp.toFixed(0)} kg`,
      value: ratio,
      unit: '\u2014',
      meaning: en ? 'Compared against exp(mu*alpha).' : 'Se compara contra exp(mu*alpha).',
    },
    {
      id: 'power',
      title: en ? 'Indicative sheave power' : 'Potencia orientativa en polea',
      formula: 'P = |Mc+Q-Mcp|*g*v*factor',
      substitution: `v=${v.toFixed(2)} m/s, reeving=${reeving}`,
      value: P_lift_kW,
      unit: 'kW',
      meaning: en ? 'Order of magnitude from mass imbalance.' : 'Orden de magnitud por desequilibrio de masas.',
    },
    {
      id: 'brake',
      title: en ? 'Emergency brake torque' : 'Par de frenado de emergencia',
      formula: 'T_brake = bf*DeltaF*(D/2)',
      substitution: `bf=1.25, D=${D.toFixed(2)} m`,
      value: T_brake,
      unit: 'N\u00b7m',
      meaning: en ? 'Indicative holding torque.' : 'Par resistente orientativo para retenci\u00f3n.',
    },
    {
      id: 'dd',
      title: en ? 'D/d geometry check' : 'Chequeo geom\u00e9trico D/d',
      formula: 'D/d = (D*1000) / d_cable',
      substitution: `D=${(D * 1000).toFixed(0)} mm, d=${rope.d_mm} mm`,
      value: DdRatio,
      unit: '\u2014',
      meaning: en
        ? `Preliminary reference: D/d \u2265 ${minDdRecommended} (${duty === 'persons' ? 'passenger' : 'freight'}).`
        : `Referencia preliminar: D/d >= ${minDdRecommended} (${duty === 'persons' ? 'personas' : 'carga'}).`,
    },
  ];

  const explanations = en
    ? [
        `Traction: T1/T2=${ratio.toFixed(2)} vs exp(mu*alpha)=${lim.toFixed(2)} (margin \u00d7${adhesionMargin.toFixed(2)}).`,
        `Suggested ropes: ${rope.n} \u00d7 \u00d8${rope.d_mm} mm (${rope.minBreak_kN} kN per rope).`,
        `D/d check: ${DdRatio.toFixed(1)} (target \u2265 ${minDdRecommended}).`,
        `Indicative energy saving from counterweight: ${Math.max(0, savingPct).toFixed(0)} %.`,
      ]
    : [
        `Adherencia: T1/T2=${ratio.toFixed(2)} frente a limite exp(mu*alpha)=${lim.toFixed(2)} (margen x${adhesionMargin.toFixed(2)}).`,
        `Configuracion de cables sugerida: ${rope.n} x \u00d8${rope.d_mm} mm (${rope.minBreak_kN} kN por cable).`,
        `Chequeo D/d: ${DdRatio.toFixed(1)} (objetivo >= ${minDdRecommended}).`,
        `Ahorro energetico orientativo por contrapeso: ${Math.max(0, savingPct).toFixed(0)} %.`,
      ];

  const assumptions = en
    ? [
        'Static indicative rope-and-sheave traction model; does not replace EN 81 or a regulatory installation package.',
        'Traction assessed with Euler\u2013Eytelwein using declared \u03bc and wrap angle.',
        'Indicative power from mass imbalance (no regeneration or detailed duty cycle).',
        'Rope selection uses a demo minimum-breaking-load catalog; validate actual ropes and terminations.',
        'Demo safety factor: 10 (freight) and 12 (passenger).',
      ]
    : [
        'Modelo estatico-orientativo de traccion por cables y polea; no sustituye EN 81 ni proyecto reglamentario.',
        'Se evalua adherencia con Euler-Eytelwein usando mu y angulo de abrazamiento declarados.',
        'Potencia orientativa basada en desequilibrio de masas (sin regeneracion ni ciclo real detallado).',
        'Seleccion de cables con catalogo demo de carga minima de rotura; validar cable real y terminaciones.',
        'Factor de seguridad demo: 10 (carga) y 12 (personas).',
      ];

  return {
    inputs: {
      Q,
      Mc,
      Mcp,
      Mcp_optimal: Mcp_opt,
      counterweightFraction: kCw,
      H,
      v,
      D,
      alpha_deg,
      mu,
      reeving,
      duty,
      SF,
    },
    euler: {
      tensionRatioWorst: ratio,
      limit: lim,
      adhesionOk,
      adhesionMargin,
    },
    rope,
    brake: { torque_Nm: T_brake },
    energy: {
      savingVsNoCounterweight_pct: Math.max(0, savingPct),
      note: en
        ? 'Indicative up+down cycle comparison without regeneration.'
        : 'Comparativa orientativa subida+bajada sin regeneraci\u00f3n.',
    },
    drive: {
      imbalance_N: F_imbalance,
      power_kW_orientative: P_lift_kW,
      sheave_rpm: n_rpm,
    },
    steps,
    explanations,
    assumptions,
    verdicts,
    disclaimer: en
      ? 'This is not a regulatory installation memorandum. Verify EN 81, rope standards (e.g. EN 12385) and a signed engineering package.'
      : 'No es memoria de instalaci\u00f3n reglamentaria. Verifique EN 81, normas de cables (p. ej. EN 12385) y proyecto firmado.',
  };
}
