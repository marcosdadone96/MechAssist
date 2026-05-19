/**
 * Static ES/EN for inclined-conveyor.html (selects, title, presets).
 */
import { getCurrentLang } from '../config/locales.js';
import { applyMachinePresetLabels } from '../lab/i18n/machineHubPresetLabels.js';

/** @type {Record<string, { es: string; en: string }>} */
const DUTY_ROWS = {
  uniform: { es: 'Carga uniforme \u2014 SF \u2248 1,15', en: 'Uniform load \u2014 SF \u2248 1.15' },
  moderate: { es: 'Choque moderado \u2014 SF \u2248 1,35', en: 'Moderate shock \u2014 SF \u2248 1.35' },
  heavy: { es: 'Choque pesado \u2014 SF \u2248 1,75', en: 'Heavy shock \u2014 SF \u2248 1.75' },
  custom: {
    es: 'Personalizado (editar \u00abFactor de servicio\u00bb arriba)',
    en: 'Custom (edit Service factor above)',
  },
};

/** @param {'es'|'en'} lang */
function applySelects(lang) {
  const en = lang === 'en';
  const std = document.getElementById('incDesignStandard');
  if (std) {
    const iso = std.querySelector('option[value="ISO5048"]');
    const cema = std.querySelector('option[value="CEMA"]');
    if (iso) iso.textContent = en ? 'ISO 5048 / DIN 22101 \u2014 analytic approach' : 'ISO 5048 / DIN 22101 \u2014 enfoque anal\u00edtico';
    if (cema) cema.textContent = en ? 'CEMA \u2014 +6% margin on steady traction' : 'CEMA \u2014 margen +6 % sobre tracci\u00f3n de r\u00e9gimen';
  }
  const duty = document.getElementById('incLoadDuty');
  if (duty) {
    const o = /** @type {HTMLSelectElement} */ (duty).options;
    Object.keys(DUTY_ROWS).forEach((v, i) => {
      if (o[i] && o[i].value === v) o[i].textContent = en ? DUTY_ROWS[v].en : DUTY_ROWS[v].es;
    });
  }
}

/** @param {'es'|'en'} lang */
export function applyInclinedConveyorStaticI18n(lang = getCurrentLang()) {
  const en = lang === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? 'Inclined conveyor \u2014 TheMechAssist' : 'Cinta inclinada \u2014 TheMechAssist';
  applySelects(lang);
  if (en) applyMachinePresetLabels('en');
}

export function applyInclinedConveyorPageLanguage() {
  applyInclinedConveyorStaticI18n(getCurrentLang());
}
