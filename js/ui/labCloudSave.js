/**
 * Export PDF (cálculos + diagrama) en calculadoras del laboratorio (`main.lab-main`).
 */

import { FEATURES } from '../config/features.js';
import { exportLabFluidReportPdf } from '../services/fluidLabPdfExport.js';
import { buildLabPdfPayload } from '../services/labPdfPayload.js';
import {
  isLabPdfExportAllowed,
  labPdfSignInMessage,
  labPdfSignInUrl,
} from '../services/labPdfAuth.js';
import { ensurePdfExportCharged } from '../services/creditSession.js';
import { showNoCreditsModal } from './creditsUi.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { getCurrentLang, t } from '../config/locales.js';
import { showToast } from './labToast.js';

function langEs() {
  return getCurrentLang() !== 'en';
}

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
    if (el.classList.contains('lab-field-ico--stroke')) return;
    if (seen.has(el)) return;
    seen.add(el);
    out.push(el);
  };

  scope.querySelectorAll('svg[id$="Diagram"], svg[id*="Diagram"]').forEach((el) => add(el));
  scope.querySelectorAll('.lab-diagram-wrap svg').forEach((el) => add(el));

  return out;
}

/**
 * @param {HTMLElement} panel
 * @param {HTMLElement} wrap
 */
function attachLabPdfExportWrap(panel, wrap) {
  const head =
    panel.querySelector('.lab-calc-page-head') ||
    panel.querySelector('.flat-sidebar__head');
  if (head) {
    head.appendChild(wrap);
    return;
  }

  const bucketPanel = panel.querySelector('.be-main-col > section.panel');
  const tractionPanel =
    bucketPanel ||
    (panel.matches('main.app-main') ? panel.querySelector(':scope > section.panel') : null);
  const topPanel = tractionPanel;
  if (topPanel) {
    const lead = topPanel.querySelector('p.form-lead');
    if (lead) {
      lead.insertAdjacentElement('afterend', wrap);
      return;
    }
    const h2 = topPanel.querySelector('h2');
    if (h2) {
      h2.insertAdjacentElement('afterend', wrap);
      return;
    }
  }

  const sidebar = panel.querySelector('.flat-sidebar');
  if (sidebar) {
    sidebar.prepend(wrap);
    return;
  }

  panel.prepend(wrap);
}

/**
 * @param {boolean} en
 * @param {boolean} signedIn
 */
function pdfExportBarHtml(en, signedIn) {
  if (!signedIn) {
    const signUrl = labPdfSignInUrl(en);
    const msg = labPdfSignInMessage(en);
    return en
      ? `<div class="premium-export premium-export--teaser">
          <span class="premium-export__badge premium-export__badge--muted">PDF</span>
          <p class="premium-export__teaser-text">${msg}</p>
          <a class="premium-export__link" href="${signUrl}">Sign in / Register</a>
        </div>`
      : `<div class="premium-export premium-export--teaser">
          <span class="premium-export__badge premium-export__badge--muted">PDF</span>
          <p class="premium-export__teaser-text">${msg}</p>
          <a class="premium-export__link" href="${signUrl}">Iniciar sesi\u00f3n / Registrarse</a>
        </div>`;
  }

  return en
    ? `<div class="premium-export premium-export--active">
        <div class="premium-export__copy">
          <span class="premium-export__badge">PDF</span>
          <div><strong>Export calculations and diagram</strong>
          <p class="premium-export__hint">Structured report with schematic diagram, input table and results. Internet required.</p></div>
        </div>
        <button type="button" class="premium-export__btn" data-lab-pdf-export>Export calculations and diagram to PDF</button>
      </div>`
    : `<div class="premium-export premium-export--active">
        <div class="premium-export__copy">
          <span class="premium-export__badge">PDF</span>
          <div><strong>Exportar c\u00e1lculos y diagrama</strong>
          <p class="premium-export__hint">Informe estructurado con diagrama, tabla de entradas y resultados. Requiere conexi\u00f3n.</p></div>
        </div>
        <button type="button" class="premium-export__btn" data-lab-pdf-export>Exportar c\u00e1lculos y diagrama en PDF</button>
      </div>`;
}

/**
 * @param {string} tipo_maquina
 * @param {{ scopeSelector?: string; getPayload?: () => object; getDiagramElements?: () => SVGElement[] }} [opts]
 */
export function mountLabPdfExportBar(tipo_maquina, opts = {}) {
  if (!FEATURES.showLabCloudSnapshotButton) return;

  const sel = opts.scopeSelector || 'main.lab-main';
  const panel = document.querySelector(sel);
  if (!panel || !(panel instanceof HTMLElement)) return;
  if (!panel.classList.contains('lab-main')) return;

  const en = !langEs();
  const wrap = document.createElement('div');
  wrap.className = 'lab-pdf-export-actions';

  const renderBar = () => {
    wrap.innerHTML = pdfExportBarHtml(en, isLabPdfExportAllowed());
    const btn = wrap.querySelector('[data-lab-pdf-export]');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      try {
        if (!isLabPdfExportAllowed()) {
          showToast(labPdfSignInMessage(en), { type: 'error', durationMs: 6000 });
          return;
        }

        if (isCreditsSystemEnabled()) {
          const pdfGate = await ensurePdfExportCharged();
          if (!pdfGate.allowed) {
            if (pdfGate.reason === 'no_credits') showNoCreditsModal();
            else showToast(labPdfSignInMessage(en), { type: 'error', durationMs: 6000 });
            return;
          }
        }

        const scope = document.querySelector(sel) || document.body;
        const invalid = scope.querySelector('.field-input--danger[aria-invalid="true"]');
        if (invalid) {
          showToast(
            en ? 'Fix input errors before exporting.' : 'Corrija errores de entrada antes de exportar.',
            { type: 'error', durationMs: 5000 },
          );
          return;
        }

        const payload =
          typeof opts.getPayload === 'function'
            ? opts.getPayload()
            : buildLabPdfPayload(tipo_maquina, scope);
        if (payload && payload.valid === false) {
          showToast(
            en ? 'Complete the calculation before exporting.' : 'Complete el c\u00e1lculo antes de exportar.',
            { type: 'error', durationMs: 5000 },
          );
          return;
        }

        const diagramEls =
          typeof opts.getDiagramElements === 'function'
            ? opts.getDiagramElements()
            : findLabDiagramSvgs(scope);

        await exportLabFluidReportPdf(payload, { diagramEls });
        showToast(en ? 'PDF downloaded.' : 'PDF descargado.', { type: 'ok' });
      } catch (e) {
        const msg = e && typeof e === 'object' && 'message' in e ? String(/** @type {any} */ (e).message) : String(e);
        showToast(msg || t('pdfLoadError', getCurrentLang()), { type: 'error', durationMs: 8000 });
      }
    });
  };

  attachLabPdfExportWrap(panel, wrap);
  renderBar();

  window.addEventListener('storage', (ev) => {
    if (ev.key === 'mdr-local-user-v1') renderBar();
  });
}

/** @deprecated Use mountLabPdfExportBar */
export const mountLabCloudSaveBar = mountLabPdfExportBar;
