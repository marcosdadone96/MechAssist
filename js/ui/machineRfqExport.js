/**
 * Copia al portapapeles res�menes RFQ (texto / CSV) reutilizable en p�ginas de m�quinas.
 */

import { getCurrentLang } from '../config/locales.js';
import { showToast } from './toast.js';

/** @param {unknown} v */
export function escapeCsvCell(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
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
    'No se pudo copiar (el navegador bloque� el portapapeles). Seleccione y copie manualmente.';
  const toastOkEn = opts.toastCopiedEn ?? 'Copied to clipboard.';
  const toastErrEn =
    opts.toastErrEn ?? 'Could not copy (browser blocked clipboard). Select and copy manually.';

  const rfqTitleEs =
    'Exportar datos como solicitud de oferta (RFQ) en formato CSV o texto � para enviar a proveedor de motorreductores';
  const rfqTitleEn =
    'Export data as a Request For Quotation (RFQ) in CSV or plain text � to send to a gearmotor supplier';
  const textBtn = document.getElementById(textId);
  const csvBtn = document.getElementById(csvId);
  const rfqTitle = getCurrentLang() === 'en' ? rfqTitleEn : rfqTitleEs;
  if (textBtn) textBtn.title = rfqTitle;
  if (csvBtn) csvBtn.title = rfqTitle;

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
}
