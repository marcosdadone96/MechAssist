/**
 * Elevador de cangilones — modelo orientativo inspirado en criterios CEMA habituales.
 * No sustituye el manual CEMA completo ni selección de fabricante certificada.
 */

/** @typedef {'poor'|'medium'|'good'} Fluidity */
/** @typedef {'fragile_abrasive'|'normal'|'fluid_light'} MaterialNature */

/**
 * Catálogo demo de cangilones (volumen nominal relleno, ancho mínimo de banda típico).
 * @type {Array<{ id: string, label: string, volume_L: number, minBelt_mm: number, typicalPitch_mm: number }>}
 */
export const BUCKET_CATALOG = [
  { id: 'b05', label: 'Profundo ligero · ~0,5 L', volume_L: 0.5, minBelt_mm: 200, typicalPitch_mm: 280 },
  { id: 'b1', label: 'Profundo · ~1 L', volume_L: 1.0, minBelt_mm: 250, typicalPitch_mm: 320 },
  { id: 'b2', label: 'Profundo · ~2 L', volume_L: 2.0, minBelt_mm: 300, typicalPitch_mm: 380 },
  { id: 'b3', label: 'Profundo · ~3 L', volume_L: 3.0, minBelt_mm: 350, typicalPitch_mm: 430 },
  { id: 'b5', label: 'Profundo · ~5 L', volume_L: 5.0, minBelt_mm: 400, typicalPitch_mm: 500 },
  { id: 'b8', label: 'Profundo · ~8 L', volume_L: 8.0, minBelt_mm: 500, typicalPitch_mm: 560 },
  { id: 'b12', label: 'Profundo · ~12 L', volume_L: 12.0, minBelt_mm: 600, typicalPitch_mm: 630 },
];

/**
 * Factor de llenado φ (orientativo) según fluidez y naturaleza del material.
 */
export function fillFactorForMaterial(fluidity, nature, particle_mm) {
  let base = 0.65;
  if (fluidity === 'poor') base = 0.52;
  else if (fluidity === 'medium') base = 0.68;
  else if (fluidity === 'good') base = 0.82;

  if (nature === 'fragile_abrasive') base *= 0.88;
  if (nature === 'fluid_light') base = Math.min(0.92, base * 1.05);

  const p = Number(particle_mm) || 2;
  if (p > 25) base *= 0.92;
  if (p > 50) base *= 0.9;

  return Math.max(0.4, Math.min(0.92, base));
}

/**
 * Banda de velocidad recomendada (m/s) según material.
 * @returns {{ vMin: number, vMax: number, vNominal: number, label: string }}
 */
export function recommendedBeltSpeedRange(nature) {
  if (nature === 'fragile_abrasive') {
    return { vMin: 0.85, vMax: 1.6, vNominal: 1.2, label: 'Baja (frágil / abrasivo)' };
  }
  if (nature === 'fluid_light') {
    return { vMin: 2.0, vMax: 3.6, vNominal: 2.8, label: 'Alta (fluido / ligero)' };
  }
  return { vMin: 1.2, vMax: 2.6, vNominal: 1.9, label: 'Media (granel estándar)' };
}

/**
 * Potencia de elevación útil (kW): P_e ≈ Q·H / (367·η) con Q en t/h, H en m (forma habitual en elevadores).
 * @param {number} Q_tph
 * @param {number} H_m
 * @param {number} eta_elev — rendimiento del sistema de elevación (poleas, holguras orientativas)
 */
export function pureLiftPower_kW(Q_tph, H_m, eta_elev) {
  const Q = Math.max(0, Number(Q_tph) || 0);
  const H = Math.max(0, Number(H_m) || 0);
  const eta = Math.max(0.35, Math.min(0.98, Number(eta_elev) || 0.78));
  if (Q <= 0 || H <= 0) return 0;
  return (Q * H) / (367 * eta);
}

/**
 * Paso mínimo entre cangilones (m) para lograr capacidad con v, ρ, V, φ.
 * Q_tph = 3.6 · (v/pitch) · ρ · (V_L/1000) · φ
 */
export function pitchForCapacity_m(Q_tph, v_m_s, rho_kg_m3, volume_L, fillFactor) {
  const Q = Math.max(1e-6, Number(Q_tph) || 0);
  const v = Math.max(0.05, Number(v_m_s) || 1);
  const rho = Math.max(100, Number(rho_kg_m3) || 800);
  const V = Math.max(0.05, Number(volume_L) || 1);
  const phi = Math.max(0.35, Math.min(0.95, Number(fillFactor) || 0.65));
  const vol_m3 = V / 1000;
  const num = 3.6 * v * rho * vol_m3 * phi;
  return num / Q;
}

/**
 * Parámetro adimensional tipo Froude en el tambor de cabeza: v²/(gR). Valores altos → eyección marcada.
 */
export function centrifugalHeadParameter(v_m_s, drumDiameter_m) {
  const v = Number(v_m_s) || 0;
  const D = Math.max(0.1, Number(drumDiameter_m) || 0.5);
  const R = D / 2;
  const g = 9.81;
  return (v * v) / (g * R);
}

/**
 * Tensión efectiva orientativa en la rama cargada (N) — orden de magnitud para comparar con admisible.
 * Modelo simplificado: trabajo útil por unidad de longitud de elevación.
 */
export function approximateWorkingTension_N(Q_tph, H_m, v_m_s, kWrap) {
  const Q = Math.max(0, Number(Q_tph) || 0);
  const H = Math.max(0, Number(H_m) || 0);
  const v = Math.max(0.1, Number(v_m_s) || 1);
  const k = Math.max(1, Number(kWrap) || 1.25);
  const mdot = (Q * 1000) / 3600;
  if (mdot <= 0) return 0;
  return k * mdot * 9.81 * H / v;
}

/**
 * @param {object} p
 * @param {number} p.bulkDensity_kg_m3
 * @param {number} p.particle_mm
 * @param {Fluidity} p.fluidity
 * @param {MaterialNature} p.materialNature
 * @param {number} p.liftHeight_m
 * @param {number} p.centerDistance_m
 * @param {number} p.capacity_tph
 * @param {number} p.headDrumDiameter_m
 * @param {number} p.bootDrumDiameter_m
 * @param {number} p.beltSpeed_m_s — velocidad adoptada en la banda
 * @param {number} p.bucketVolume_L
 * @param {number} p.minBeltFromCatalog_mm
 * @param {number} p.beltWidth_mm — ancho adoptado
 * @param {number} p.beltStrength_N_per_mm — resistencia nominal banda (demo)
 * @param {number} [p.etaElev] — η elevación pura (default 0,78)
 * @param {number} [p.kBootDrag] — fracción sobre P_e arrastre/bota CEMA-style (default 0,18)
 * @param {number} [p.etaTransmission] — reductor/acoplamiento (default 0,96)
 */
export function computeBucketElevator(p) {
  const rho = Math.max(200, Number(p.bulkDensity_kg_m3) || 800);
  const H = Math.max(0.5, Number(p.liftHeight_m) || 10);
  const C = Math.max(H, Number(p.centerDistance_m) || H);
  const Q = Math.max(0.1, Number(p.capacity_tph) || 10);
  const D_head = Math.max(0.2, Number(p.headDrumDiameter_m) || 0.65);
  const D_boot = Math.max(0.2, Number(p.bootDrumDiameter_m) || 0.55);
  const v = Math.max(0.3, Number(p.beltSpeed_m_s) || 1.5);
  const V_L = Math.max(0.1, Number(p.bucketVolume_L) || 2);
  const minBeltCat = Math.max(150, Number(p.minBeltFromCatalog_mm) || 300);
  const B = Math.max(100, Number(p.beltWidth_mm) || minBeltCat);
  const sigma = Math.max(20, Number(p.beltStrength_N_per_mm) || 315);
  const etaElev = Math.max(0.5, Math.min(0.95, Number(p.etaElev) ?? 0.78));
  const kBoot = Math.max(0, Math.min(0.45, Number(p.kBootDrag) ?? 0.18));
  const etaTrans = Math.max(0.85, Math.min(0.99, Number(p.etaTransmission) ?? 0.96));

  const fluidity = p.fluidity === 'poor' || p.fluidity === 'good' ? p.fluidity : 'medium';
  const nature =
    p.materialNature === 'fragile_abrasive' || p.materialNature === 'fluid_light'
      ? p.materialNature
      : 'normal';

  const phi = fillFactorForMaterial(fluidity, nature, Number(p.particle_mm) || 5);
  const speedRec = recommendedBeltSpeedRange(nature);

  const P_e = pureLiftPower_kW(Q, H, etaElev);
  const P_drag = P_e * kBoot;
  const P_shaft_kW = (P_e + P_drag) / etaTrans;
  const P_HP = P_shaft_kW / 0.7457;

  const pitch_m = pitchForCapacity_m(Q, v, rho, V_L, phi);
  const pitch_mm = pitch_m * 1000;

  const minBeltWidth_mm = Math.max(minBeltCat, Math.ceil(B * 0.95));
  const widthOk = B >= minBeltCat - 1;

  const K_cent = centrifugalHeadParameter(v, D_head);
  const K_warn = nature === 'fragile_abrasive' ? 1.15 : nature === 'normal' ? 1.85 : 2.4;
  const K_danger = K_warn * 1.45;

  const T_work = approximateWorkingTension_N(Q, H, v, 1.28);
  const T_adm = sigma * B * 0.85;
  const tensionRatio = T_adm > 0 ? T_work / T_adm : 0;
  const tensionOk = tensionRatio <= 1;

  const vol_m3 = V_L / 1000;
  const Q_check = 3.6 * (v / Math.max(0.05, pitch_m)) * rho * vol_m3 * phi;

  const speedOutOfRange = v < speedRec.vMin - 0.05 || v > speedRec.vMax + 0.15;
  const spillRisk = v > speedRec.vMax + 0.25 || K_cent > K_danger;

  /** @type {Array<{ level: 'ok'|'warn'|'err', code: string, text: string }>} */
  const verdicts = [];

  if (!widthOk) {
    verdicts.push({
      level: 'warn',
      code: 'belt_narrow',
      text: `El ancho de banda adoptado (${B} mm) es inferior al mínimo orientativo del cangilón seleccionado (${minBeltCat} mm).`,
    });
  }
  if (tensionRatio > 1) {
    verdicts.push({
      level: 'err',
      code: 'tension',
      text: `Tensión de trabajo estimada frente a admisible (≈ ${(tensionRatio * 100).toFixed(0)} % del límite). Aumente ancho, clase de banda o reduzca capacidad/altura.`,
    });
  } else if (tensionRatio > 0.82) {
    verdicts.push({
      level: 'warn',
      code: 'tension_moderate',
      text: 'Uso elevado de la tensión admisible de la banda — conviene margen para arranques y fatiga.',
    });
  }

  if (K_cent > K_danger || spillRisk) {
    verdicts.push({
      level: 'err',
      code: 'centrifugal',
      text: 'Riesgo de derrame / eyección en descarga: velocidad periférica alta respecto al tambor de cabeza. Reduzca v o aumente Ø de tambor; valide con catálogo CEMA/fabricante.',
    });
  } else if (K_cent > K_warn) {
    verdicts.push({
      level: 'warn',
      code: 'centrifugal_soft',
      text: 'Parámetro de eyección (v²/gR) elevado: vigilar calidad de descarga y abrasión en tapa.',
    });
  }

  if (speedOutOfRange) {
    verdicts.push({
      level: 'warn',
      code: 'speed_class',
      text: `Velocidad fuera de la banda recomendada para este material (${speedRec.vMin.toFixed(1)}–${speedRec.vMax.toFixed(1)} m/s).`,
    });
  }

  if (verdicts.length === 0) {
    verdicts.push({
      level: 'ok',
      code: 'ok',
      text: 'Parámetros coherentes con el modelo orientativo — confirme siempre con norma y fabricante.',
    });
  }

  return {
    inputs: {
      rho,
      H,
      C,
      Q,
      D_head,
      D_boot,
      v,
      V_L,
      B,
      sigma,
      phi,
      fluidity,
      nature,
    },
    speedRecommendation: speedRec,
    fillFactor: phi,
    pitch_mm,
    pitch_m,
    minBeltWidth_mm: minBeltCat,
    capacity_check_tph: Q_check,
    power: {
      pureLift_kW: P_e,
      dragBoot_kW: P_drag,
      shaft_kW: P_shaft_kW,
      shaft_HP: P_HP,
      etaElev,
      kBootDrag: kBoot,
      etaTransmission: etaTrans,
    },
    tension: {
      working_N: T_work,
      admissible_N: T_adm,
      ratio: tensionRatio,
      ok: tensionOk,
      piK_note:
        'Relación trabajo/admisible orientativa; el factor Pi real de proyecto requiere radio de tambor, embridado y norma de banda.',
    },
    centrifugal: {
      K: K_cent,
      K_warn,
      K_danger,
      drumDiameter_m: D_head,
    },
    verdicts,
    disclaimer:
      'Modelo educativo basado en expresiones habituales (capacidad, P≈Q·H/(367·η), arrastre en bota). No sustituye el diseño CEMA completo.',
  };
}

export function kWtoHP(kw) {
  return Number(kw) / 0.7457;
}
