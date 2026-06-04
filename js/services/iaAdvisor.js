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

/**
 * @param {{ sf?: number, sigma_a?: number, sigma_m?: number, Se?: number, Sut?: number, criterion?: string, lang?: 'es'|'en' }} ctx
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export function buildFatigueAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const sf = Number(ctx.sf);
  const sigmaA = Number(ctx.sigma_a);
  const sigmaM = Number(ctx.sigma_m);
  const se = Number(ctx.Se);
  const sut = Number(ctx.Sut);

  if (Number.isFinite(sf) && sf < 1.0) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Outside Goodman diagram' : 'Fuera del diagrama de Goodman',
      body:
        lang === 'en'
          ? 'Operating point is outside the Goodman diagram: predictable fatigue failure. Reduce \u03c3_a or \u03c3_m, or raise S_e with better surface finish.'
          : 'Punto fuera del diagrama de Goodman: fallo por fatiga predecible. Reducir \u03c3_a o \u03c3_m, o aumentar S_e con mejor acabado superficial.',
      normRef: 'Shigley / modified Goodman \u2014 indicative.',
    });
  } else if (Number.isFinite(sf) && sf < 1.5) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Tight fatigue margin' : 'Margen de fatiga ajustado',
      body:
        lang === 'en'
          ? 'Fatigue safety factor SF < 1.5. Consider a lower stress concentration (K_f) or material with higher S_ut.'
          : 'Margen de fatiga ajustado (SF < 1.5). Considerar entalla menor (K_f) o material con mayor S_ut.',
      normRef: ctx.criterion ? String(ctx.criterion) : 'Goodman / Gerber / Soderberg.',
    });
  }
  if (Number.isFinite(sigmaM) && Number.isFinite(sut) && sut > 0 && sigmaM / sut > 0.7) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'High mean stress' : 'Tensi\u00f3n media elevada',
      body:
        lang === 'en'
          ? 'Mean stress > 70% of S_ut. Risk of static yield combined with fatigue. Verify von Mises.'
          : 'Tensi\u00f3n media elevada (>70% de S_ut). Riesgo de fluencia est\u00e1tica combinada con fatiga. Verificar Von Mises.',
      normRef: 'Combined static + fatigue \u2014 detailed check recommended.',
    });
  }
  if (Number.isFinite(se) && Number.isFinite(sut) && sut > 0 && se < 0.3 * sut) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Low corrected endurance limit' : 'S_e muy bajo respecto a S_ut',
      body:
        lang === 'en'
          ? 'S_e is well below 0.3\u00b7S_ut. Review surface and size factors: machined finish with Ra < 1.6 \u00b5m raises K_a noticeably.'
          : 'S_e muy bajo respecto a S_ut. Revisar factores de superficie y tama\u00f1o: acabado mecanizado con Ra < 1,6 \u00b5m sube K_a notablemente.',
      normRef: 'Marin factors \u2014 surface finish tables.',
    });
  }
  if (!out.length) {
    out.push({
      tone: 'info',
      title: lang === 'en' ? 'Fatigue advisor' : 'Asesor fatiga',
      body:
        lang === 'en'
          ? 'Safety factor, mean stress and S_e are within typical bands for this quick Goodman check.'
          : 'Factor de seguridad, tensi\u00f3n media y S_e dentro de bandas t\u00edpicas para esta comprobaci\u00f3n Goodman.',
    });
  }
  return out;
}

/**
 * @param {{ i?: number, gamma_deg?: number, eta?: number, autoblocking?: boolean, lang?: 'es'|'en' }} ctx
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export function buildWormGearAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const i = Number(ctx.i);
  const eta = Number(ctx.eta);
  const autoblocking = Boolean(ctx.autoblocking);

  if (autoblocking && Number.isFinite(eta) && eta < 0.4) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Self-locking with low efficiency' : 'Autobloqueo con bajo rendimiento',
      body:
        lang === 'en'
          ? 'Self-locking with efficiency < 40%: high heat build-up. Plan oil cooling or limit duty cycles.'
          : 'Autobloqueo con rendimiento < 40%: alto calentamiento. Prever refrigeraci\u00f3n del aceite o limitaci\u00f3n de ciclos.',
      normRef: 'ISO 14521 context \u2014 thermal duty indicative.',
    });
  }
  if (Number.isFinite(eta) && eta < 0.5) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Low worm efficiency' : 'Rendimiento bajo',
      body:
        lang === 'en'
          ? 'Efficiency below 50%. Consider Z1=2 or Z1=4 if self-locking is not required. Synthetic EP oil typically improves \u03b7 by 3\u20135 points.'
          : 'Rendimiento bajo. Considerar Z1=2 o Z1=4 si no se necesita autobloqueo. Aceite EP sint\u00e9tico mejora \u03b7 en 3\u20135 puntos.',
      normRef: 'Worm pair lubrication \u2014 manufacturer data.',
    });
  }
  if (Number.isFinite(i) && i > 60) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'High reduction ratio' : 'Relaci\u00f3n de transmisi\u00f3n alta',
      body:
        lang === 'en'
          ? 'Reduction ratio > 60: verify bronze wheel strength \u2014 specific load rises with i.'
          : 'Relaci\u00f3n de transmisi\u00f3n > 60: verificar resistencia de la corona (bronce) \u2014 la carga espec\u00edfica aumenta con i.',
      normRef: 'ISO 14521 \u2014 worm wheel contact stress.',
    });
  }
  if (!out.length) {
    out.push({
      tone: 'info',
      title: lang === 'en' ? 'Worm gear advisor' : 'Asesor tornillo sin fin',
      body:
        lang === 'en'
          ? 'Ratio, lead angle, efficiency and self-locking are within typical bands for this screening.'
          : 'Relaci\u00f3n, \u00e1ngulo de avance, rendimiento y autobloqueo dentro de bandas t\u00edpicas para este cribado.',
    });
  }
  return out;
}

/**
 * @param {{ deflection_mm?: number, L_mm?: number, sigma_MPa?: number, sigma_adm?: number, beamType?: string, lang?: 'es'|'en' }} ctx
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export function buildBeamAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const delta = Number(ctx.deflection_mm);
  const Lmm = Number(ctx.L_mm);
  const sigma = Number(ctx.sigma_MPa);
  const sigmaAdm = Number(ctx.sigma_adm);

  if (Number.isFinite(delta) && Number.isFinite(Lmm) && Lmm > 0 && delta / Lmm > 1 / 300) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'High relative deflection' : 'Flecha relativa elevada',
      body:
        lang === 'en'
          ? 'Relative deflection > L/300. Typical industrial beam limit: L/300. For crane runways: L/600.'
          : 'Flecha relativa > L/300. L\u00edmite t\u00edpico para vigas industriales: L/300. Para puentes gr\u00faa: L/600.',
      normRef: 'Serviceability limits \u2014 confirm project specification.',
    });
  }
  if (Number.isFinite(sigma) && Number.isFinite(sigmaAdm) && sigmaAdm > 0 && sigma > sigmaAdm) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Stress above allowable' : 'Tensi\u00f3n sobre admisible',
      body:
        lang === 'en'
          ? 'Extreme-fibre stress exceeds the allowable. Increase section inertia or reduce load.'
          : 'Tensi\u00f3n en fibra extrema supera la admisible. Aumentar inercia de secci\u00f3n o reducir la carga.',
      normRef: 'Flexure \u2014 confirm code and material.',
    });
  } else if (Number.isFinite(sigma) && Number.isFinite(sigmaAdm) && sigmaAdm > 0 && sigma > 0.7 * sigmaAdm) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Stress near allowable' : 'Tensi\u00f3n cerca del admisible',
      body:
        lang === 'en'
          ? 'Stress above 70% of allowable. Tight margin against overloads.'
          : 'Tensi\u00f3n por encima del 70% del admisible. Margen de seguridad ajustado ante sobrecargas.',
      normRef: 'Flexure \u2014 allow for load uncertainty.',
    });
  }
  if (!out.length) {
    out.push({
      tone: 'info',
      title: lang === 'en' ? 'Beam advisor' : 'Asesor viga',
      body:
        lang === 'en'
          ? 'Deflection and stress are within typical bands for this quick Euler-Bernoulli check.'
          : 'Flecha y tensi\u00f3n dentro de bandas t\u00edpicas para esta comprobaci\u00f3n Euler-Bernoulli.',
    });
  }
  return out;
}

/**
 * @param {{ sf_shear?: number, sf_bearing?: number, has_friction?: boolean, lang?: 'es'|'en' }} ctx
 */
export function buildBoltShearAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const sfShear = Number(ctx.sf_shear);
  const sfBearing = Number(ctx.sf_bearing);
  const hasFriction = Boolean(ctx.has_friction);

  if (Number.isFinite(sfShear) && sfShear < 1.0) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Shear exceeds allowable' : 'Cortante supera la resistencia admisible',
      body:
        lang === 'en'
          ? 'Shear exceeds allowable resistance. Increase diameter or number of bolts.'
          : 'Cortante supera la resistencia admisible. Aumentar diámetro o número de tornillos.',
      normRef: 'ISO 898-1 / VDI 2230 — indicative.',
    });
  } else if (Number.isFinite(sfShear) && sfShear < 1.5) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Tight shear margin' : 'Margen a cortante ajustado',
      body:
        lang === 'en'
          ? 'Tight shear margin (SF < 1.5). Consider class 10.9 or more bolts.'
          : 'Margen a cortante ajustado (SF < 1.5). Considerar clase 10.9 o más tornillos.',
      normRef: 'Bolt shear — simplified model.',
    });
  }
  if (Number.isFinite(sfBearing) && sfBearing < 1.5) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Low bearing margin' : 'Aplastamiento bajo',
      body:
        lang === 'en'
          ? 'Low bearing margin. Check plate thickness or use a larger washer diameter.'
          : 'Aplastamiento bajo. Verificar espesor de placa o cambiar a arandela de mayor diámetro.',
      normRef: 'Bearing on plate — indicative.',
    });
  }
  if (hasFriction && Number.isFinite(sfShear) && sfShear > 3) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Oversized for shear' : 'Sobredimensionado a cortante',
      body:
        lang === 'en'
          ? 'With friction available, bolts are oversized for shear. Review whether sizing is driven by preload.'
          : 'Con fricción disponible, los tornillos están sobredimensionados a cortante. Revisar si el dimensionado es por precarga.',
      normRef: 'Slip-critical joint — friction model.',
    });
  }
  return out;
}

/**
 * @param {{ utilisation?: number, cateto_mm?: number, weld_type?: string, lang?: 'es'|'en' }} ctx
 */
export function buildWeldJointAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const util = Number(ctx.utilisation);
  const cateto = Number(ctx.cateto_mm);
  const weldType = String(ctx.weld_type || '');

  if (Number.isFinite(util) && util > 1.0) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Insufficient weld' : 'Cordón de soldadura insuficiente',
      body:
        lang === 'en'
          ? 'Weld leg insufficient. Increase leg size or weld length.'
          : 'Cordón de soldadura insuficiente. Aumentar cateto o longitud de cordón.',
      normRef: 'EN 1993-1-8 — indicative.',
    });
  } else if (Number.isFinite(util) && util > 0.85) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'High usage factor' : 'Factor de uso elevado',
      body:
        lang === 'en'
          ? 'Usage factor > 85%. Reduced margin against overloads or fatigue.'
          : 'Factor de uso > 85%. Margen reducido ante sobrecargas o fatiga.',
      normRef: 'EN 1993-1-8 — indicative.',
    });
  }
  if (Number.isFinite(cateto) && cateto < 3) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Small leg size' : 'Cateto pequeño',
      body:
        lang === 'en'
          ? 'Leg < 3 mm: difficult execution. Practical minimum recommended: 3–4 mm.'
          : 'Cateto < 3 mm: dificultad de ejecución. Mínimo práctico recomendado: 3–4 mm.',
      normRef: 'EN 1993 / AWS D1.1 — workmanship.',
    });
  }
  if (weldType === 'fillet' && Number.isFinite(util) && util < 0.4) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Oversized fillet' : 'Cordón sobredimensionado',
      body:
        lang === 'en'
          ? 'Weld heavily oversized. Leg may be reduced to save filler metal.'
          : 'Cordón muy sobredimensionado. Puede reducirse para ahorrar material de aporte.',
      normRef: 'Fillet weld — economic design.',
    });
  }
  return out;
}

/**
 * @param {{ autoblocking?: boolean, efficiency?: number, pressure_ratio?: number | null, lang?: 'es'|'en' }} ctx
 */
export function buildPowerScrewAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const autoblocking = Boolean(ctx.autoblocking);
  const eta = Number(ctx.efficiency);
  const pRatio = ctx.pressure_ratio != null ? Number(ctx.pressure_ratio) : NaN;

  if (autoblocking && Number.isFinite(eta) && eta < 0.35) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Self-locking with low efficiency' : 'Autobloqueo con bajo rendimiento',
      body:
        lang === 'en'
          ? 'Self-locking with efficiency < 35%: high heat dissipation in continuous duty. Plan forced lubrication.'
          : 'Autobloqueo con rendimiento <35%: alta disipación térmica en operación continua. Prever lubricación forzada.',
      normRef: 'Power screw — thermal duty indicative.',
    });
  }
  if (Number.isFinite(pRatio) && pRatio > 1.0) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Nut pressure exceeded' : 'Presión en tuerca excesiva',
      body:
        lang === 'en'
          ? 'Flank pressure exceeds allowable. Increase nut thread engagement or reduce load.'
          : 'Presión específica en flancos supera la admisible. Aumentar espiras de tuerca o reducir carga.',
      normRef: 'Nut bearing pressure — indicative.',
    });
  }
  if (!autoblocking) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'No self-locking' : 'Sin autobloqueo',
      body:
        lang === 'en'
          ? 'No self-locking: load may run back on its own. Add a brake or use γ < friction angle design.'
          : 'Sin autobloqueo: la carga puede bajar por sí sola. Añadir freno o usar diseño con γ < φ_fricción.',
      normRef: 'Lead angle vs friction angle.',
    });
  }
  return out;
}

/**
 * @param {{ sf?: number, solid_clearance_mm?: number, slenderness_ratio?: number, stress_ratio?: number, lang?: 'es'|'en' }} ctx
 */
export function buildSpringAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const sf = Number(ctx.sf);
  const clearance = Number(ctx.solid_clearance_mm);
  const slenderness = Number(ctx.slenderness_ratio);

  if (Number.isFinite(sf) && sf < 1.2) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Low torsion safety factor' : 'Margen de seguridad a torsión bajo',
      body:
        lang === 'en'
          ? 'Torsion safety factor < 1.2. Increase wire diameter or reduce load.'
          : 'Margen de seguridad a torsión <1.2. Aumentar diámetro de alambre o reducir carga.',
      normRef: 'DIN 2089 / EN 13906 — indicative.',
    });
  }
  if (Number.isFinite(clearance) && clearance < 1) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Low solid clearance' : 'Holgura al sólido baja',
      body:
        lang === 'en'
          ? 'Clearance to solid < 1 mm. Risk of clash at full compression. Increase free length.'
          : 'Holgura al sólido <1 mm. Riesgo de chocar a pleno apriete. Aumentar longitud libre.',
      normRef: 'Solid height — assembly margin.',
    });
  }
  if (Number.isFinite(slenderness) && slenderness > 4) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'High slenderness' : 'Esbeltez elevada',
      body:
        lang === 'en'
          ? 'Slenderness ratio > 4. Lateral buckling risk. Guide spring in bore or sleeve.'
          : 'Relación esbeltez >4. Riesgo de pandeo lateral. Guiar el muelle en espiga o casquillo.',
      normRef: 'Buckling — educational L0/Dm model.',
    });
  }
  return out;
}

/**
 * @param {{ J_ratio?: number, lang?: 'es'|'en' }} ctx
 */
export function buildGearmotorAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const jRatio = Number(ctx.J_ratio);

  if (Number.isFinite(jRatio) && jRatio > 10) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'High reflected inertia' : 'Inercia reflejada muy alta',
      body:
        lang === 'en'
          ? 'Reflected inertia exceeds 10× rotor inertia. Long acceleration time; motor may saturate.'
          : 'Inercia reflejada supera 10× la del rotor. Tiempo de aceleración elevado; el motor puede saturarse.',
      normRef: "d'Alembert — gearmotor selection.",
    });
  } else if (Number.isFinite(jRatio) && jRatio > 3) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Moderate inertia ratio' : 'Inercia reflejada moderada',
      body:
        lang === 'en'
          ? 'Reflected inertia between 3–10× rotor. Verify acceleration time with gearmotor manufacturer.'
          : 'Inercia reflejada entre 3–10× la del rotor. Verificar tiempo de ciclo de aceleración con el fabricante del motorreductor.',
      normRef: 'Inertia ratio — manufacturer data.',
    });
  }
  return out;
}

/**
 * @param {{ sf_tightening?: number, torque_nm?: number, lang?: 'es'|'en' }} ctx
 */
export function buildBoltsIsoAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const sf = Number(ctx.sf_tightening);
  const torque = Number(ctx.torque_nm);

  if (Number.isFinite(sf) && sf < 1.2) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Low tightening margin' : 'Margen de apriete bajo',
      body:
        lang === 'en'
          ? 'Tightening margin < 1.2. Risk of bolt plasticisation.'
          : 'Margen de apriete <1.2. Riesgo de plastificación del tornillo.',
      normRef: 'ISO 898-1 / VDI 2230 — indicative preload.',
    });
  }
  if (Number.isFinite(torque) && torque > 0 && Number.isFinite(sf) && sf > 3.0) {
    out.push({
      tone: 'tip',
      title: lang === 'en' ? 'Oversized bolt' : 'Tornillo sobredimensionado',
      body:
        lang === 'en'
          ? 'Bolt heavily oversized. Consider lower grade or smaller diameter.'
          : 'Tornillo muy sobredimensionado. Considerar clase inferior o diámetro menor.',
      normRef: 'ISO 898-1 — simplified resistance.',
    });
  }
  return out;
}

/**
 * @param {{ axial_load_n?: number, rated_load_n?: number, lang?: 'es'|'en' }} ctx
 */
export function buildSeegerAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const fax = Number(ctx.axial_load_n);
  const rated = Number(ctx.rated_load_n);

  if (Number.isFinite(fax) && Number.isFinite(rated) && rated > 0 && fax > 0.8 * rated) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'High axial load' : 'Carga axial elevada',
      body:
        lang === 'en'
          ? 'Axial load > 80% of allowable circlip capacity. Risk of opening or permanent deformation.'
          : 'Carga axial >80% de la admisible del circlip. Riesgo de apertura o deformación permanente.',
      normRef: 'DIN 471 / DIN 472 — summary table.',
    });
  }
  return out;
}

/**
 * @param {{ t_design?: number, t_nom?: number, lang?: 'es'|'en' }} ctx
 */
export function buildCouplingsAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const tDes = Number(ctx.t_design);
  const tNom = Number(ctx.t_nom);

  if (Number.isFinite(tDes) && Number.isFinite(tNom) && tNom > 0 && tDes > 0.9 * tNom) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Torque near nominal' : 'Par cerca del nominal',
      body:
        lang === 'en'
          ? 'Design torque exceeds 90% of coupling nominal torque. Consider a higher-capacity model.'
          : 'Par de diseño supera el 90% del nominal del acoplamiento. Considerar modelo de mayor capacidad.',
      normRef: 'Coupling catalogue — demonstration data.',
    });
  }
  return out;
}

/**
 * @param {{ fit_type?: string, interference_mm?: number, d_mm?: number, lang?: 'es'|'en' }} ctx
 */
export function buildIsoFitAdvisorInsights(ctx, opts = {}) {
  const lang = opts.lang === 'en' || ctx.lang === 'en' ? 'en' : 'es';
  /** @type {AdvisorInsight[]} */
  const out = [];
  const fitType = String(ctx.fit_type || '');
  const interference = Number(ctx.interference_mm);
  const d = Number(ctx.d_mm);

  if (fitType === 'interference' && Number.isFinite(interference) && Number.isFinite(d) && d > 0 && interference > 0.003 * d) {
    out.push({
      tone: 'warn',
      title: lang === 'en' ? 'Heavy interference fit' : 'Apriete pronunciado',
      body:
        lang === 'en'
          ? 'Relative interference > 3‰ of diameter. Verify assembly stresses and need for heating.'
          : 'Apriete relativo >3‰ del diámetro. Verificar tensiones de montaje y necesidad de calentamiento.',
      normRef: 'ISO 286-1 — assembly practice.',
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
