/**
 * Static ES/EN for roller-conveyor.html (labels, selects, blocks).
 */
import { getCurrentLang } from '../config/locales.js';
import { LOAD_DUTY_OPTIONS_EN } from '../modules/serviceFactorByDuty.js';
import { applyMachinePresetLabels } from '../lab/i18n/machineHubPresetLabels.js';

/** @type {Record<string, { es: string; en: string }>} */
const DUTY_ROWS = {
  uniform: { es: 'Uniforme', en: 'Uniform' },
  moderate: { es: 'Moderada', en: 'Moderate' },
  heavy: { es: 'Pesada', en: 'Heavy' },
  custom: { es: 'Personalizada', en: 'Custom' },
};

/** @param {'es'|'en'} lang */
function applySelects(lang) {
  const en = lang === 'en';
  const std = document.getElementById('designStandard');
  if (std) {
    const iso = std.querySelector('option[value="ISO5048"]');
    const cema = std.querySelector('option[value="CEMA"]');
    if (iso) iso.textContent = en ? 'ISO 5048' : 'ISO 5048';
    if (cema) cema.textContent = en ? 'CEMA' : 'CEMA';
  }
  const duty = document.getElementById('loadDuty');
  if (duty) {
    const o = /** @type {HTMLSelectElement} */ (duty).options;
    Object.keys(DUTY_ROWS).forEach((v, i) => {
      if (o[i] && o[i].value === v) o[i].textContent = en ? DUTY_ROWS[v].en : DUTY_ROWS[v].es;
    });
  }
  const support = document.getElementById('loadSupportMode');
  if (support) {
    const o = /** @type {HTMLSelectElement} */ (support).options;
    if (o[0]) o[0].textContent = en ? 'Uniform spread along length L' : 'Reparto uniforme en el tramo L';
    if (o[1]) o[1].textContent = en ? 'Standard pallet / dimensions' : 'Paleta est\u00e1ndar / dimensiones';
  }
  const orient = document.getElementById('palletOrientation');
  if (orient) {
    const o = /** @type {HTMLSelectElement} */ (orient).options;
    if (o[0]) o[0].textContent = en ? 'Long side along transport' : 'Lado largo seg\u00fan transporte';
    if (o[1]) o[1].textContent = en ? 'Short side along transport' : 'Lado corto seg\u00fan transporte';
  }
  const pallet = document.getElementById('palletPreset');
  if (pallet) {
    const o = /** @type {HTMLSelectElement} */ (pallet).options;
    const rows = [
      { v: 'eur1', es: 'EUR 1 (800\u00d71200 mm)', en: 'EUR 1 (800\u00d71200 mm)' },
      { v: 'eur2', es: 'EUR 2 (1200\u00d71000 mm)', en: 'EUR 2 (1200\u00d71000 mm)' },
      { v: 'eur6', es: 'Media EUR (800\u00d7600 mm)', en: 'Half EUR (800\u00d7600 mm)' },
      { v: 'ind1000', es: 'Industrial (1000\u00d71200 mm)', en: 'Industrial (1000\u00d71200 mm)' },
      { v: 'us48x40', es: 'US 48\u00d740" (1219\u00d71016 mm)', en: 'US 48\u00d740" (1219\u00d71016 mm)' },
      { v: 'custom', es: 'Personalizado (L\u00d7W mm)', en: 'Custom (L\u00d7W mm)' },
    ];
    rows.forEach((r, i) => {
      if (o[i] && o[i].value === r.v) o[i].textContent = en ? r.en : r.es;
    });
  }
}

/** @param {'es'|'en'} lang */
export function applyRollerConveyorStaticI18n(lang = getCurrentLang()) {
  const en = lang === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? 'Roller conveyor \u2014 TheMechAssist' : 'Transportador de rodillos \u2014 TheMechAssist';
  applySelects(lang);
  if (en) applyMachinePresetLabels('en');
}

export function applyRollerConveyorPageLanguage() {
  applyRollerConveyorStaticI18n(getCurrentLang());
}
