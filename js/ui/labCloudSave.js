/**
 * Montaje PDF del laboratorio — botón en panel de resultados.
 * @see js/lab/pdfExportLab.js
 */

import { FEATURES } from '../config/features.js';
import { mountLabNormRef } from './labCalcUx.js';
import { mountLabPdfExportButton, exportLabCalcPdf } from '../lab/pdfExportLab.js';
import { exportLabFluidReportPdf } from '../services/fluidLabPdfExport.js';
import { buildLabPdfPayload } from '../services/labPdfPayload.js';
import {
  isLabPdfExportAllowed,
  labPdfSignInMessage,
} from '../services/labPdfAuth.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { ensurePdfExportCharged } from '../services/creditSession.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { getCurrentLang, t } from '../config/locales.js';
import { showToast } from './labToast.js';
import { showNoCreditsModal } from './creditsUi.js';

/**
 * @param {ParentNode} scope
 * @returns {SVGElement[]}
 */
function findLabDiagramSvgs(scope) {
  /** @type {SVGElement[]} */
  const out = [];
  const seen = new Set();
  const add = (/** @type {Element | null} */ el) => {
    if (!(el instanceof SVGSVGElement)) return;
    if (el.closest('.lab-field')) return;
    if (seen.has(el)) return;
    seen.add(el);
    out.push(el);
  };
  scope.querySelectorAll('svg[id$="Diagram"], svg[id*="Diagram"]').forEach((el) => add(el));
  scope.querySelectorAll('.lab-diagram-wrap svg').forEach((el) => add(el));
  return out;
}

/**
 * API legacy (muelle, hidráulica con payload fluido).
 * @param {string} tipo_maquina
 * @param {{ scopeSelector?: string; getPayload?: () => object; getDiagramElements?: () => SVGElement[]; anchorSelector?: string }} opts
 */
function mountLabFluidPayloadPdf(tipo_maquina, opts = {}) {
  const scopeSel = opts.scopeSelector || 'main.lab-main';
  const anchorSel =
    opts.anchorSelector ||
    `${scopeSel} .lab-results-wrap .lab-results-actions, ${scopeSel} .lab-results-actions`;

  const render = () => {
    const anchorEl = document.querySelector(anchorSel);
    if (!(anchorEl instanceof HTMLElement)) return;

    let slot = anchorEl.parentElement?.querySelector('[data-lab-pdf-export-slot]');
    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'lab-pdf-export-slot';
      slot.dataset.labPdfExportSlot = '1';
      anchorEl.insertAdjacentElement('afterend', slot);
    }

    const en = getCurrentLang() === 'en';
    const premium = isPremiumEffective();
    const checkout = 'checkout.html';
    const tip = en ? 'Requires Pro plan · View plans →' : 'Requiere plan Pro · Ver planes →';
    const btnLabel = en ? 'Export PDF report' : 'Exportar informe PDF';

    if (!premium) {
      slot.innerHTML = `
        <button type="button" class="lab-btn lab-btn--block lab-btn--locked" disabled aria-disabled="true" title="${tip}">
          ${btnLabel}
        </button>
        <p class="lab-pdf-export-locked-hint"><a href="${checkout}">${tip}</a></p>`;
      return;
    }

    slot.innerHTML = `<button type="button" class="lab-btn lab-btn--block lab-btn--pdf" data-lab-pdf-export>${btnLabel}</button>`;

    slot.querySelector('[data-lab-pdf-export]')?.addEventListener('click', async () => {
      try {
        if (!isPremiumEffective() || !isLabPdfExportAllowed()) {
          showToast(labPdfSignInMessage(en), { type: 'error', durationMs: 6000 });
          return;
        }
        if (isCreditsSystemEnabled()) {
          const pdfGate = await ensurePdfExportCharged();
          if (!pdfGate.allowed) {
            if (pdfGate.reason === 'no_credits') showNoCreditsModal();
            return;
          }
        }
        const scope = document.querySelector(scopeSel) || document.body;
        const payload =
          typeof opts.getPayload === 'function' ? opts.getPayload() : buildLabPdfPayload(tipo_maquina, scope);
        if (payload?.valid === false) {
          showToast(en ? 'Complete the calculation first.' : 'Complete el cálculo antes de exportar.', {
            type: 'error',
            durationMs: 5000,
          });
          return;
        }
        const diagramEls =
          typeof opts.getDiagramElements === 'function'
            ? opts.getDiagramElements()
            : findLabDiagramSvgs(scope);
        await exportLabFluidReportPdf(payload, { diagramEls });
        showToast(en ? 'PDF downloaded.' : 'PDF descargado.', { type: 'ok' });
      } catch (e) {
        showToast(String(e?.message || e) || t('pdfLoadError', getCurrentLang()), { type: 'error', durationMs: 8000 });
      }
    });
  };

  render();
  window.addEventListener('mdr-pro-status-changed', render);
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'mdr-local-user-v1' || ev.key === 'mdr-pro-license-v1') render();
  });
}

/**
 * @param {string | (() => string)} title
 * @param {{ norm?: string; svgSelector?: string; scopeSelector?: string; getData?: () => { inputs?: object[]; results?: object[] }; getPayload?: () => object; getDiagramElements?: () => SVGElement[] }} [opts]
 */
export function mountLabCloudSaveBar(title, opts = {}) {
  mountLabNormRef(opts.scopeSelector);

  if (!FEATURES.showLabCloudSnapshotButton) return;

  if (typeof opts.getPayload === 'function') {
    const label = typeof title === 'function' ? title() : title;
    mountLabFluidPayloadPdf(label, opts);
    return;
  }

  mountLabPdfExportButton({
    title,
    norm: opts.norm || '',
    svgSelector: opts.svgSelector,
    scopeSelector: opts.scopeSelector,
    getData: opts.getData,
  });
}

export { exportLabCalcPdf };
export const mountLabPdfExportBar = mountLabCloudSaveBar;
