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
