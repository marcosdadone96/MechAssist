/**
 * Copia al portapapeles resúmenes RFQ (texto / CSV) reutilizable en páginas de máquinas.
 */

import { getCurrentLang } from '../config/locales.js';
import { showToast } from './toast.js';
import { MACHINE_HUB_UX_EN } from '../lab/i18n/pages/machineHubUxEn.js';

const RFQ_ES = {
  textTitle:
    'Exportar datos como solicitud de oferta (RFQ) en formato texto — para enviar a proveedor de motorreductores',
  csvTitle:
    'Exportar datos como solicitud de oferta (RFQ) en formato CSV — para enviar a proveedor de motorreductores',
  ariaText: 'Copiar resumen de trabajo en texto para RFQ de proveedor',
  ariaCsv: 'Copiar resumen de trabajo en CSV para RFQ de proveedor',
};

const RFQ_EN = {
  textTitle:
    'Export data as a Request For Quotation (RFQ) in plain text — to send to a gearmotor supplier',
  csvTitle: 'Export data as a Request For Quotation (RFQ) in CSV — to send to a gearmotor supplier',
};

/** @param {unknown} v */
export function escapeCsvCell(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rfqMeta() {
  const en = getCurrentLang() === 'en';
  const titles = en ? RFQ_EN : RFQ_ES;
  return {
    textTitle: titles.textTitle,
    csvTitle: titles.csvTitle,
    ariaText: en ? MACHINE_HUB_UX_EN['machineHub.rfqAriaText'] : RFQ_ES.ariaText,
    ariaCsv: en ? MACHINE_HUB_UX_EN['machineHub.rfqAriaCsv'] : RFQ_ES.ariaCsv,
  };
}

function applyRfqButtonAria() {
  const m = rfqMeta();
  const textBtn = document.getElementById('machineRfqCopyText');
  const csvBtn = document.getElementById('machineRfqCopyCsv');
  if (textBtn instanceof HTMLButtonElement) {
    textBtn.setAttribute('aria-label', m.ariaText);
    textBtn.title = m.textTitle;
  }
  if (csvBtn instanceof HTMLButtonElement) {
    csvBtn.setAttribute('aria-label', m.ariaCsv);
    csvBtn.title = m.csvTitle;
  }
}

/**
 * @param {object} opts
 * @param {string} [opts.textButtonId]
 * @param {string} [opts.csvButtonId]
 * @param {() => { raw: object; result: object; mount: object }} opts.getPayload
 * @param {(raw: object, result: object, mount: object, lang: 'es'|'en') => string} opts.buildPlainText
 * @param {(raw: object, result: object, mount: object) => string} opts.buildCsv
 * @param {string} [opts.toastCopiedEs]
 * @param {string} [opts.toastErrEs]
 * @param {string} [opts.toastCopiedEn]
 * @param {string} [opts.toastErrEn]
 */
export function wireMachineRfqExport(opts) {
  const textId = opts.textButtonId ?? 'machineRfqCopyText';
  const csvId = opts.csvButtonId ?? 'machineRfqCopyCsv';
  const toastOkEs = opts.toastCopiedEs ?? 'Copiado al portapapeles.';
  const toastErrEs =
    opts.toastErrEs ??
    'No se pudo copiar (el navegador bloqueó el portapapeles). Seleccione y copie manualmente.';
  const toastOkEn = opts.toastCopiedEn ?? 'Copied to clipboard.';
  const toastErrEn =
    opts.toastErrEn ?? 'Could not copy (browser blocked clipboard). Select and copy manually.';

  applyRfqButtonAria();

  const run = async (/** @type {'text'|'csv'} */ kind) => {
    const en = getCurrentLang() === 'en';
    try {
      const { raw, result, mount } = opts.getPayload();
      const lang = getCurrentLang();
      const text =
        kind === 'csv'
          ? opts.buildCsv(raw, result, mount)
          : opts.buildPlainText(raw, result, mount, lang);
      await navigator.clipboard.writeText(text);
      showToast(en ? toastOkEn : toastOkEs, { variant: 'success', duration: 4200 });
    } catch {
      showToast(en ? toastErrEn : toastErrEs, { variant: 'error', duration: 7200 });
    }
  };

  document.getElementById(textId)?.addEventListener('click', () => void run('text'));
  document.getElementById(csvId)?.addEventListener('click', () => void run('csv'));

  if (!document.documentElement.dataset.rfqLangWired) {
    document.documentElement.dataset.rfqLangWired = '1';
    const onLang = () => applyRfqButtonAria();
    window.addEventListener('lab-language-changed', onLang);
    window.addEventListener('home-language-changed', onLang);
  }
}
