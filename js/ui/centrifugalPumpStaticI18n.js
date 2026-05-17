/**
 * Static ES/EN for centrifugal-pump.html (selects, title, fluid presets).
 */
import { getCurrentLang } from '../config/locales.js';
import { applyMachinePresetLabels } from '../lab/i18n/machineHubPresetLabels.js';

/** @type {Record<string, { es: string; en: string }>} */
const DUTY_ROWS = {
  uniform: { es: 'Carga uniforme \u2014 SF \u2248 1,15', en: 'Uniform load \u2014 SF \u2248 1.15' },
  moderate: { es: 'Choque moderado \u2014 SF \u2248 1,35', en: 'Moderate shock \u2014 SF \u2248 1.35' },
  heavy: { es: 'Choque pesado \u2014 SF \u2248 1,75', en: 'Heavy shock \u2014 SF \u2248 1.75' },
  custom: { es: 'Personalizado', en: 'Custom' },
};

/** @param {'es'|'en'} lang */
function applySelects(lang) {
  const en = lang === 'en';
  const mode = document.getElementById('pumpCalcMode');
  if (mode) {
    const d = mode.querySelector('option[value="design"]');
    const diag = mode.querySelector('option[value="diagnostic"]');
    if (d) d.textContent = en ? 'Design \u2014 Q, H and efficiency \u2192 power and drive' : 'Dise\u00f1o \u2014 Q, H y rendimiento \u2192 potencia y accionamiento';
    if (diag) {
      diag.textContent = en
        ? 'Diagnostic \u2014 compare duty point with nameplate power'
        : 'Diagn\u00f3stico \u2014 comparar punto de trabajo con potencia de placa';
    }
  }
  const ft = document.getElementById('fluidType');
  if (ft) {
    const m = {
      water: { es: 'Agua', en: 'Water' },
      oil: { es: 'Aceite', en: 'Oil' },
      brine: { es: 'Salmuera', en: 'Brine' },
      slurry: { es: 'Lodos / pulpa', en: 'Slurry / pulp' },
    };
    Object.entries(m).forEach(([v, row]) => {
      const o = ft.querySelector(`option[value="${v}"]`);
      if (o) o.textContent = en ? row.en : row.es;
    });
  }
  const cp = document.getElementById('couplingType');
  if (cp) {
    const d = cp.querySelector('option[value="direct"]');
    const g = cp.querySelector('option[value="gearmotor"]');
    if (d) d.textContent = en ? 'Direct motor\u2013pump (same shaft / ~1:1)' : 'Motor\u2013bomba directo (mismo eje / casi 1:1)';
    if (g) {
      g.textContent = en
        ? 'Geared motor (gearbox between motor and pump)'
        : 'Motorreductor (reductor entre motor y bomba)';
    }
  }
  const duty = document.getElementById('pumpLoadDuty');
  if (duty) {
    const o = /** @type {HTMLSelectElement} */ (duty).options;
    Object.keys(DUTY_ROWS).forEach((v, i) => {
      if (o[i] && o[i].value === v) o[i].textContent = en ? DUTY_ROWS[v].en : DUTY_ROWS[v].es;
    });
  }
}

/** @param {'es'|'en'} lang */
export function applyCentrifugalPumpStaticI18n(lang = getCurrentLang()) {
  const en = lang === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? 'Centrifugal pump \u2014 TheMechAssist' : 'Bomba centr\u00edfuga \u2014 TheMechAssist';
  applySelects(lang);
  if (en) applyMachinePresetLabels('en');
}

export function applyCentrifugalPumpPageLanguage() {
  applyCentrifugalPumpStaticI18n(getCurrentLang());
}
