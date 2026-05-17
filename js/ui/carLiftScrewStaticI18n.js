/**
 * Static ES/EN for car-lift-screw.html (selects, title, preset labels).
 */
import { getCurrentLang } from '../config/locales.js';
import { applyMachinePresetLabels } from '../lab/i18n/machineHubPresetLabels.js';

/** @param {'es'|'en'} lang */
function applySelects(lang) {
  const en = lang === 'en';
  const tp = document.getElementById('clThreadPreset');
  if (tp) {
    const rows = [
      { v: 'tr32x6', es: 'Tr 32 x 6 (est\u00e1ndar)', en: 'Tr 32 x 6 (standard)' },
      { v: 'tr40x7', es: 'Tr 40 x 7 (est\u00e1ndar)', en: 'Tr 40 x 7 (standard)' },
      { v: 'tr45x7', es: 'Tr 45 x 7 (est\u00e1ndar)', en: 'Tr 45 x 7 (standard)' },
      { v: 'tr50x8', es: 'Tr 50 x 8 (est\u00e1ndar)', en: 'Tr 50 x 8 (standard)' },
      { v: 'tr55x9', es: 'Tr 55 x 9 (est\u00e1ndar)', en: 'Tr 55 x 9 (standard)' },
      { v: 'custom', es: 'Personalizado (introducci\u00f3n manual)', en: 'Custom (manual entry)' },
    ];
    const o = /** @type {HTMLSelectElement} */ (tp).options;
    rows.forEach((r, i) => {
      if (o[i] && o[i].value === r.v) o[i].textContent = en ? r.en : r.es;
    });
  }
  const mp = document.getElementById('clMotorPos');
  if (mp) {
    const ot = mp.querySelector('option[value="top"]');
    const ob = mp.querySelector('option[value="base"]');
    if (ot) ot.textContent = en ? 'Top' : 'Parte superior';
    if (ob) ob.textContent = en ? 'Base / bottom' : 'Base / inferior';
  }
}

/** @param {'es'|'en'} lang */
export function applyCarLiftScrewStaticI18n(lang = getCurrentLang()) {
  const en = lang === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? 'Screw car lift \u2014 TheMechAssist' : 'Elevador de veh\u00edculos \u2014 TheMechAssist';
  applySelects(lang);
  if (en) applyMachinePresetLabels('en');
}

export function applyCarLiftScrewPageLanguage() {
  applyCarLiftScrewStaticI18n(getCurrentLang());
}
