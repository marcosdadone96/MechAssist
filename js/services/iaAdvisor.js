/**
 * IA Advisor — reglas predictivas orientativas (ISO / AGMA / buenas prácticas).
 * No sustituye ingeniería certificada ni datos de fabricante.
 */

import { typicalBeltEfficiency } from '../data/commerceCatalog.js';

/**
 * @typedef {Object} AdvisorInsight
 * @property {'info'|'tip'|'warn'} tone
 * @property {string} title
 * @property {string} body
 * @property {string} [normRef]
 */

/**
 * @param {object} ctx
 * @param {Array<{ label: string, value: number }>} [ctx.safetyMargins] — SF, SH, etc. (valor >1 = margen)
 * @param {{ beltType?: string, powerKw?: number | null }} [ctx.belt]
 * @param {{ L10_hours?: number | null, speed_rpm?: number }} [ctx.bearing]
 * @param {{ dutyHoursPerDay?: number | null }} [ctx.machineDuty]
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export function buildAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];

  const te = ctx.tractionElevator;
  if (te && typeof te === 'object') {
    if (te.adhesionOk === false) {
      out.push({
        tone: 'warn',
        title: 'Riesgo de resbalamiento en polea',
        body:
          'La relación de tensiones frente al límite e^(μα) sugiere posible pérdida de adherencia. Revise ángulo de abrazamiento, coeficiente μ, estado de canales y equilibrio de masas (contrapeso).',
        normRef: 'Euler-Eytelwein orientativo; proyecto según EN 81 y fabricante.',
      });
    } else if (Number.isFinite(te.adhesionMargin) && te.adhesionMargin < 1.15) {
      out.push({
        tone: 'tip',
        title: 'Margen de adherencia ajustado',
        body: `Margen ≈ ${Number(te.adhesionMargin).toFixed(2)}. Mantenga canales y cables según mantenimiento reglamentario.`,
        normRef: 'Tracción — validación en memoria de instalación.',
      });
    }
    if (Number.isFinite(te.energySavingPct) && te.energySavingPct > 10) {
      out.push({
        tone: 'tip',
        title: 'Ahorro con contrapeso equilibrado',
        body: `Frente a un modelo sin contrapeso ideal, el desequilibrio actual sugiere del orden de ${Number(te.energySavingPct).toFixed(0)} % menos energía en ciclo subida+bajada (cálculo demo, sin regeneración).`,
        normRef: 'Orden de magnitud; perfil de tráfico real modifica el resultado.',
      });
    }
    if (out.length === 0) {
      out.push({
        tone: 'info',
        title: 'Tracción — Advisor',
        body: 'Condición de adherencia y datos de entrada coherentes con el modelo demo. Confirme siempre normativa y taller de cables.',
        normRef: 'EN 81 / EN 12385 (referencias generales).',
      });
    }
  }

  const margins = ctx.safetyMargins || [];
  for (const m of margins) {
    if (Number.isFinite(m.value) && m.value > 5) {
      out.push({
        tone: 'tip',
        title: 'Posible sobredimensionamiento',
        body: `El margen «${m.label}» es ${m.value.toFixed(2)} (> 5). Diseño sobredimensionado: podría reducir el tamaño del componente y ahorrar material, tras validar con norma y fabricante.`,
        normRef: 'Criterio orientativo; AGMA/ISO según elemento.',
      });
    }
  }

  if (ctx.belt?.beltType) {
    const bt = ctx.belt.beltType;
    const eta = typicalBeltEfficiency(/** @type {any} */ (bt));
    const etaSync = typicalBeltEfficiency('synchronous');
    if (bt === 'flat') {
      const pctLoss = (1 - eta) * 100;
      let body = `Correa plana: rendimiento típico η ≈ ${(eta * 100).toFixed(0)} % (pérdidas por deslizamiento y flexión mayores que en dentada). Valorar correa síncrona o Poly-V si busca eficiencia y sincronismo.`;
      const P = ctx.belt.powerKw;
      if (P != null && P > 0) {
        const dP = P * (1 / eta - 1 / etaSync);
        body += ` A ${P.toFixed(2)} kW, la pérdida extra orientativa frente a síncrona ≈ ${Math.max(0, dP).toFixed(2)} kW (orden de magnitud).`;
      }
      out.push({
        tone: 'info',
        title: 'Eficiencia · correa plana',
        body,
        normRef: 'ISO 4184 / catálogo — comparativa orientativa.',
      });
    } else if (bt === 'v_trapezoidal' && eta < etaSync - 0.01) {
      const P = ctx.belt.powerKw;
      let body = `Correa trapezoidal: η típico ≈ ${(eta * 100).toFixed(0)} %. La síncrona suele rondar ${(etaSync * 100).toFixed(0)} % con menor holgura angular.`;
      if (P != null && P > 0) {
        body += ` Pérdida orientativa añadida vs. síncrona ≈ ${Math.max(0, P * (1 / eta - 1 / etaSync)).toFixed(2)} kW.`;
      }
      out.push({
        tone: 'tip',
        title: 'Alternativa más eficiente',
        body,
        normRef: 'ISO 4184 vs. correas dentadas — modelo educativo.',
      });
    }
  }

  const L10 = ctx.bearing?.L10_hours;
  const rpm = ctx.bearing?.speed_rpm ?? 0;
  const duty = ctx.machineDuty?.dutyHoursPerDay;
  if (L10 != null && Number.isFinite(L10) && L10 > 80000 && rpm > 0) {
    const heavyDuty = duty != null && duty >= 16;
    if (!heavyDuty) {
      out.push({
        tone: 'tip',
        title: 'Vida L₁₀ muy alta',
        body: `L₁₀ ≈ ${Math.round(L10)} h es elevada para muchas máquinas de servicio intermitente. Podría valorarse una serie más ligera (mayor nº dimensiones o jaula poliamida) si P y n se confirman — ahorro habitual en coste unitario.`,
        normRef: 'ISO 281 — vida básica; confirme a_ISO y temperatura en catálogo.',
      });
    }
  }

  if (out.length === 0) {
    out.push(
      lang === 'en'
        ? {
            tone: 'info',
            title: 'No Advisor alerts',
            body: 'No strong inefficiencies matched the current rules. Keep full code and supplier validation.',
            normRef: 'ISO / AGMA per module.',
          }
        : {
            tone: 'info',
            title: 'Sin alertas Advisor',
            body: 'No se detectaron ineficiencias marcadas con las reglas actuales. Mantenga validación normativa completa.',
            normRef: 'ISO / AGMA según módulo.',
          },
    );
  }

  return out;
}

/**
 * @param {{ bendingSF?: number, contactSH?: number, hasLoad?: boolean }} agma
 * @returns {{ energyEfficiencyPct: number | null, materialUtilizationPct: number | null }}
 */
export function metricsFromGears(agma) {
  if (!agma?.hasLoad) {
    return { energyEfficiencyPct: 99, materialUtilizationPct: null };
  }
  const sf = Number(agma.bendingSF);
  const sh = Number(agma.contactSH);
  if (!Number.isFinite(sf) || !Number.isFinite(sh)) {
    return { energyEfficiencyPct: 99, materialUtilizationPct: null };
  }
  const target = 2.2;
  const util = Math.min(100, Math.round((target / Math.max(target, Math.min(sf, sh))) * 100));
  return { energyEfficiencyPct: 99, materialUtilizationPct: util };
}

/**
 * @param {string} beltType
 * @returns {{ energyEfficiencyPct: number | null, materialUtilizationPct: number | null }}
 */
/**
 * @param {{ sf?: number, sh?: number, pitchLineVelocity?: number, lubeType?: 'splash'|'forced'|'grease'|'oil', lang?: 'es'|'en' }} ctx
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export function buildGearsAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const sf = Number(ctx.sf);
  const sh = Number(ctx.sh);
  const vp = Number(ctx.pitchLineVelocity);
  const lube = ctx.lubeType === 'grease' ? 'grease' : ctx.lubeType === 'oil' ? 'forced' : ctx.lubeType;

  if (Number.isFinite(sf) && sf < 1.5) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Low bending safety factor' : 'Margen de flexión ajustado',
      body:
        lang === 'en'
          ? 'Bending safety factor SF < 1.5. Review module or face width.'
          : 'Margen de seguridad a flexión ajustado (SF < 1.5). Revise módulo o anchura de cara.',
      normRef: 'AGMA 2101-D04 (simplified) — indicative.',
    });
  }
  if (Number.isFinite(sh) && sh < 1.2) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Low pitting safety factor' : 'Margen de picadura bajo',
      body:
        lang === 'en'
          ? 'Contact safety factor SH < 1.2. Consider surface treatment or EP lubricant.'
          : 'Margen de picadura bajo (SH < 1.2). Considere tratamiento superficial o lubricante EP.',
      normRef: 'AGMA 2101-D04 (simplified) — indicative.',
    });
  }
  if (Number.isFinite(vp) && vp > 10) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'High pitch-line speed' : 'Velocidad en paso elevada',
      body:
        lang === 'en'
          ? 'Pitch-line speed > 10 m/s. Forced lubrication recommended; verify flank roughness.'
          : 'Velocidad en paso > 10 m/s. Lubricación forzada recomendada; verifique rugosidad de flancos.',
      normRef: lang === 'en' ? 'Manufacturer practice / ISO 6336 context.' : 'Práctica de fabricante / contexto ISO 6336.',
    });
  }
  if (lube === 'grease' && Number.isFinite(vp) && vp > 6) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Grease at moderate speed' : 'Grasa a velocidad moderada',
      body:
        lang === 'en'
          ? 'At this pitch-line speed, oil bath or forced lubrication is often preferred over grease alone.'
          : 'A esta velocidad en paso, baño de aceite o lubricación forzada suele preferirse frente a solo grasa.',
    });
  }
  if (!out.length) {
    out.push({
      tone: 'info',
      title: lang === 'en' ? 'Gears advisor' : 'Asesor engranajes',
      body:
        lang === 'en'
          ? 'SF, SH and pitch-line speed are within typical bands for this quick check.'
          : 'SF, SH y velocidad en paso dentro de bandas típicas para esta comprobación rápida.',
    });
  }
  return out;
}

/**
 * @param {{ chainSpeed?: number, pitch?: number, sprocketTeeth?: number, lang?: 'es'|'en' }} ctx
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export function buildChainsAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const v = Number(ctx.chainSpeed);
  const z = Number(ctx.sprocketTeeth);

  if (Number.isFinite(v) && v > 7) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'High chain speed' : 'Velocidad de cadena alta',
      body:
        lang === 'en'
          ? 'Speed > 7 m/s for this pitch. Noise and wear risk; consider silent chain or smaller pitch.'
          : 'Velocidad > 7 m/s para este paso. Riesgo de ruido y desgaste acelerado. Use cadena silenciosa o reduzca paso.',
      normRef: 'ISO 606 / manufacturer catalogue — indicative.',
    });
  }
  if (Number.isFinite(z) && z < 17) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Small sprocket' : 'Piñón pequeño',
      body:
        lang === 'en'
          ? 'Sprocket with < 17 teeth: higher polygonal effect and wear. Consider z ≥ 19.'
          : 'Piñón con < 17 dientes: mayor efecto poligonal y desgaste. Considere z ≥ 19.',
    });
  }
  if (!out.length) {
    out.push({
      tone: 'info',
      title: lang === 'en' ? 'Chains advisor' : 'Asesor cadenas',
      body:
        lang === 'en'
          ? 'Chain speed and driver teeth count look reasonable for a first pass.'
          : 'Velocidad y número de dientes del piñón motriz coherentes para un primer corte.',
    });
  }
  return out;
}

/**
 * @param {{ cpRatio?: number, L10_hours?: number, speed_rpm?: number, nRef_rpm?: number, lang?: 'es'|'en' }} ctx
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export function buildBearingsAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const cp = Number(ctx.cpRatio);
  const l10 = Number(ctx.L10_hours);
  const n = Number(ctx.speed_rpm);
  const nRef = Number(ctx.nRef_rpm) || 20000;

  if (Number.isFinite(cp) && cp < 3) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Low C/P ratio' : 'Relación C/P baja',
      body:
        lang === 'en'
          ? 'C/P < 3. Reduced L10 life; consider a bearing with higher dynamic load rating.'
          : 'Relación C/P < 3. Vida L₁₀ reducida; considere rodamiento de mayor capacidad dinámica.',
      normRef: 'ISO 281 — basic rating life.',
    });
  }
  if (Number.isFinite(l10) && l10 < 5000) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Short nominal life' : 'Vida nominal corta',
      body:
        lang === 'en'
          ? 'Nominal life < 5,000 h. For continuous industrial duty, L10 ≥ 20,000 h is often targeted.'
          : 'Vida nominal < 5.000 h. Para aplicaciones industriales continuas se recomienda L₁₀ ≥ 20.000 h.',
      normRef: 'ISO 281 — indicative duty targets.',
    });
  }
  if (Number.isFinite(n) && n > 0.8 * nRef) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Speed near catalogue limit' : 'Velocidad cercana al límite',
      body:
        lang === 'en'
          ? 'Operating speed is close to the indicative reference limit. Verify operating temperature.'
          : 'Velocidad cercana al límite orientativo del fabricante. Verifique temperatura de operación.',
      normRef: 'Manufacturer speed ratings — confirm with datasheet.',
    });
  }
  if (!out.length) {
    out.push({
      tone: 'info',
      title: lang === 'en' ? 'Bearings advisor' : 'Asesor rodamientos',
      body:
        lang === 'en'
          ? 'C/P, L10 and speed are within typical bands for this quick screening.'
          : 'C/P, L₁₀ y velocidad dentro de bandas típicas para este cribado rápido.',
    });
  }
  return out;
}

/**
 * @param {{ sf?: number, tau_MPa?: number, bending_MPa?: number, yield_steel_MPa?: number, lang?: 'es'|'en' }} ctx
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export function buildShaftAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const sf = Number(ctx.sf);
  const tau = Number(ctx.tau_MPa);
  const bend = Number(ctx.bending_MPa);
  const yieldSteel = Number(ctx.yield_steel_MPa) || 355;

  if (Number.isFinite(sf) && sf < 1.0) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Shaft overload' : 'Eje insuficiente',
      body:
        lang === 'en'
          ? 'The shaft does not resist the current load (SF < 1.0). Increase diameter or change material.'
          : 'El eje no resiste la carga actual (SF < 1.0). Aumente el diámetro o cambie el material.',
      normRef: 'Torsion / combined stress — indicative.',
    });
  } else if (Number.isFinite(sf) && sf < 1.5) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Low torsion safety factor' : 'Margen de torsión ajustado',
      body:
        lang === 'en'
          ? 'Torsion safety factor SF < 1.5. Review shaft diameter or material.'
          : 'Margen de seguridad a torsión ajustado (SF < 1.5). Revise el diámetro o material del eje.',
      normRef: 'Shaft sizing — indicative.',
    });
  }
  if (Number.isFinite(tau) && tau > 0.6 * yieldSteel) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Torsion stress near elastic limit' : 'Tensión de torsión elevada',
      body:
        lang === 'en'
          ? 'Torsion stress is close to 60% of the indicative yield limit. Consider 42CrMo4 or similar alloy.'
          : 'Tensión de torsión cercana al 60% del límite elástico orientativo. Considere acero 42CrMo4 o similar.',
      normRef: 'Material selection — confirm with datasheet.',
    });
  }
  if (Number.isFinite(bend) && bend > 0 && Number.isFinite(sf) && sf < 2.0) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Combined bending and torsion' : 'Flexión y torsión combinadas',
      body:
        lang === 'en'
          ? 'With combined bending, SF < 2 may be insufficient under variable loads (fatigue).'
          : 'Con flexión combinada, SF < 2 puede ser insuficiente en servicio con cargas variables (fatiga).',
      normRef: 'Fatigue / notch effects — detailed check recommended.',
    });
  }
  if (!out.length) {
    out.push({
      tone: 'info',
      title: lang === 'en' ? 'Shaft advisor' : 'Asesor eje',
      body:
        lang === 'en'
          ? 'Safety factor and stress levels are within typical bands for this quick check.'
          : 'Factor de seguridad y tensiones dentro de bandas típicas para esta comprobación rápida.',
    });
  }
  return out;
}

export function metricsFromBeltType(beltType) {
  const eta = typicalBeltEfficiency(/** @type {any} */ (beltType));
  return {
    energyEfficiencyPct: Math.round(eta * 100),
    materialUtilizationPct: null,
  };
}

/**
 * @param {{ tauAllow_MPa: number, tauAtMinDiameter_MPa: number }} shaft
 */
export function metricsFromShaft(shaft) {
  const ratio = shaft.tauAllow_MPa > 0 ? shaft.tauAtMinDiameter_MPa / shaft.tauAllow_MPa : 1;
  const util = Math.min(100, Math.round(ratio * 100));
  return { energyEfficiencyPct: null, materialUtilizationPct: util };
}
