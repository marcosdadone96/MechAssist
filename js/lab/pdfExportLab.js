/**
 * Exportaciùn PDF compartida ù calculadoras del laboratorio (calc-*).
 * jsPDF vùa CDN UMD (sin duplicar lùgica en cada pùgina).
 */

import { svgToPngData } from '../services/reportPdfExport.js';
import { collectLabInputRows, collectLabResultRows } from '../services/labPdfPayload.js';
import { isLabPdfExportAllowed, labPdfSignInMessage, labPdfSignInUrl } from '../services/labPdfAuth.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { ensurePdfExportCharged } from '../services/creditSession.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { formatDateTimeLocale, getCurrentLang } from '../config/locales.js';
import { showToast } from '../ui/labToast.js';
import { showNoCreditsModal } from '../ui/creditsUi.js';
import { LAB_LANG_EVENT } from './i18n/labLang.js';

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

const TEAL = [13, 148, 136];
const NAVY = [15, 23, 42];
const SLATE = [71, 85, 105];
const MUTED = [100, 116, 139];
const BORDER = [226, 232, 240];
const ZEBRA = [248, 250, 252];
/** @returns {Promise<typeof import('jspdf').jsPDF>} */
async function loadJsPDF() {
  const existing = globalThis.jspdf?.jsPDF;
  if (existing) return existing;

  return new Promise((resolve, reject) => {
    const prev = document.querySelector('script[data-mdr-jspdf]');
    if (prev) {
      prev.addEventListener('load', () => {
        if (globalThis.jspdf?.jsPDF) resolve(globalThis.jspdf.jsPDF);
        else reject(new Error('jsPDF no disponible'));
      });
      prev.addEventListener('error', () => reject(new Error('jsPDF no disponible')));
      return;
    }
    const s = document.createElement('script');
    s.src = JSPDF_CDN;
    s.async = true;
    s.dataset.mdrJspdf = '1';
    s.onload = () => {
      if (globalThis.jspdf?.jsPDF) resolve(globalThis.jspdf.jsPDF);
      else reject(new Error('jsPDF no disponible'));
    };
    s.onerror = () => reject(new Error('No se pudo cargar jsPDF. Compruebe la conexiùn.'));
    document.head.appendChild(s);
  });
}

function langEs() {
  return getCurrentLang() !== 'en';
}

function sanitizePdfText(value) {
  let out = String(value ?? '');
  out = out.replace(/[ùùùù?ù?ùùùù???]/g, (m) => {
    const map = {
      'ù': ' - ',
      'ù': '- ',
      'ù': '-',
      'ù': '-',
      '?': '-',
      'ù': 'x',
      'ù': ' deg',
      '?': '->',
      '?': '<=',
      '?': '>=',
    };
    return map[m] || ' ';
  });
  out = out.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  out = out.replace(/[^\x20-\x7E\n]/g, ' ');
  return out.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * @param {import('jspdf').jsPDF} doc
 */
function addWrapped(doc, text, x, y, maxW, lineMm) {
  const lines = doc.splitTextToSize(sanitizePdfText(text), maxW);
  doc.text(lines, x, y);
  return y + lines.length * lineMm;
}

/**
 * @param {'ok'|'warn'|'error'|null | undefined} status
 * @param {boolean} en
 */
function statusLabel(status, en) {
  if (status === 'ok') return en ? 'OK' : 'APTO';
  if (status === 'warn') return en ? 'REVIEW' : 'REVISAR';
  if (status === 'error') return en ? 'NOT OK' : 'NO APTO';
  return 'ù';
}

/**
 * @param {import('jspdf').jsPDF} doc
 * @param {number} pageW
 * @param {number} pageH
 * @param {number} m
 * @param {string} ts
 * @param {number} pageNum
 * @param {number} totalPages
 */
function drawPageFooter(doc, pageW, pageH, m, ts, pageNum, totalPages) {
  const en = !langEs();
  const disclaimer = en
    ? 'Indicative results - does not replace detailed engineering - TheMechAssist - '
    : 'Resultados orientativos - no sustituye ingenieria de detalle - TheMechAssist - ';
  doc.setDrawColor(...BORDER);
  doc.line(m, pageH - 16, pageW - m, pageH - 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(sanitizePdfText(disclaimer + ts), m, pageH - 10);
  const pageLbl = en ? `Page ${pageNum} / ${totalPages}` : `Pagina ${pageNum} / ${totalPages}`;
  doc.text(pageLbl, pageW - m, pageH - 10, { align: 'right' });
}

/**
 * @param {import('jspdf').jsPDF} doc
 */
function drawSectionTitle(doc, x, y, w, title) {
  doc.setFillColor(...TEAL);
  doc.rect(x, y, w, 7.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(sanitizePdfText(title), x + 3, y + 5.2);
  return y + 10;
}

/**
 * @param {import('jspdf').jsPDF} doc
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {Array<{ label: string; value: string; status?: 'ok'|'warn'|'error' }>} rows
 * @param {string} col1
 * @param {string} col2
 * @param {string} [col3]
 * @param {number} pageH
 * @param {number} m
 * @param {boolean} en
 */
function drawTable(doc, x, y, w, rows, col1, col2, col3, pageH, m, en) {
  const hasStatus = Boolean(col3);
  const c1 = hasStatus ? w * 0.42 : w * 0.48;
  const c2 = hasStatus ? w * 0.33 : w - c1;
  const c3 = hasStatus ? w - c1 - c2 : 0;
  const headerH = 7;
  const minRowH = 7;

  const drawHeader = (yy) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(x, yy, w, headerH, 'F');
    doc.setDrawColor(...BORDER);
    doc.rect(x, yy, w, headerH, 'S');
    doc.line(x + c1, yy, x + c1, yy + headerH);
    if (hasStatus) doc.line(x + c1 + c2, yy, x + c1 + c2, yy + headerH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...SLATE);
    doc.text(col1, x + 2.5, yy + 4.8);
    doc.text(col2, x + c1 + 2.5, yy + 4.8);
    if (hasStatus) doc.text(col3, x + c1 + c2 + 2.5, yy + 4.8);
    return yy + headerH;
  };

  y = drawHeader(y);
  let rowIdx = 0;

  for (const row of rows) {
    const labelLines = doc.splitTextToSize(sanitizePdfText(row.label), c1 - 5);
    const valueLines = doc.splitTextToSize(sanitizePdfText(row.value), c2 - 5);
    const statusLines = hasStatus
      ? doc.splitTextToSize(statusLabel(row.status, en), c3 - 4)
      : [''];
    const rowH = Math.max(
      minRowH,
      Math.max(labelLines.length, valueLines.length, statusLines.length) * 4 + 3,
    );

    if (y + rowH > pageH - 20) {
      doc.addPage();
      y = 18;
      y = drawHeader(y);
    }

    if (rowIdx % 2 === 0) {
      doc.setFillColor(...ZEBRA);
      doc.rect(x, y, w, rowH, 'F');
    }
    doc.setDrawColor(...BORDER);
    doc.rect(x, y, w, rowH, 'S');
    doc.line(x + c1, y, x + c1, y + rowH);
    if (hasStatus) doc.line(x + c1 + c2, y, x + c1 + c2, y + rowH);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    doc.text(labelLines, x + 2.5, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(valueLines, x + c1 + 2.5, y + 4.5);

    if (hasStatus) {
      const st = row.status;
      if (st === 'ok') doc.setTextColor(15, 118, 110);
      else if (st === 'warn') doc.setTextColor(180, 83, 9);
      else if (st === 'error') doc.setTextColor(185, 28, 28);
      else doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(statusLines, x + c1 + c2 + 2.5, y + 4.5);
    }

    y += rowH;
    rowIdx += 1;
  }

  return y + 4;
}

/**
 * @param {ParentNode} scope
 * @returns {Array<{ label: string; value: string; status?: 'ok'|'warn'|'error' }>}
 */
export function collectLabCatalogResultRows(scope) {
  /** @type {Array<{ label: string; value: string; status?: 'ok'|'warn'|'error' }>} */
  const rows = [];
  scope.querySelectorAll('.lab-catalog-table tbody tr').forEach((tr) => {
    const cells = [...tr.querySelectorAll('td')];
    if (cells.length < 2) return;
    const label = sanitizePdfText(cells[0].textContent);
    const value = cells
      .slice(1)
      .map((c) => sanitizePdfText(c.textContent))
      .filter(Boolean)
      .join(' ù ');
    if (label && value) rows.push({ label, value });
  });
  return rows;
}

/**
 * @param {ParentNode} scope
 * @returns {'ok'|'warn'|'error'|null}
 */
export function inferLabVerdictStatus(scope) {
  const hero = scope.querySelector('.lab-result-hero');
  if (hero) {
    if (hero.classList.contains('lab-result-hero--ok')) return 'ok';
    if (hero.classList.contains('lab-result-hero--warn')) return 'warn';
    if (hero.classList.contains('lab-result-hero--err')) return 'error';
  }
  const verdict = scope.querySelector('.lab-catalog-verdict .lab-verdict, .lab-verdict');
  if (verdict) {
    if (verdict.classList.contains('lab-verdict--ok')) return 'ok';
    if (verdict.classList.contains('lab-verdict--warn')) return 'warn';
    if (verdict.classList.contains('lab-verdict--err')) return 'error';
  }
  return null;
}

/**
 * @param {ParentNode} scope
 * @param {string} [svgSelector]
 * @returns {SVGElement[]}
 */
function resolveDiagramSvgs(scope, svgSelector) {
  /** @type {SVGElement[]} */
  const out = [];
  const seen = new Set();
  const add = (/** @type {Element | null} */ el) => {
    if (!(el instanceof SVGSVGElement)) return;
    if (seen.has(el)) return;
    seen.add(el);
    out.push(el);
  };

  if (svgSelector) {
    scope.querySelectorAll(svgSelector).forEach((el) => add(el));
    if (!out.length) document.querySelectorAll(svgSelector).forEach((el) => add(el));
  }
  scope.querySelectorAll('svg[id$="Diagram"], svg[id*="Diagram"]').forEach((el) => add(el));
  scope.querySelectorAll('.lab-diagram-wrap svg').forEach((el) => add(el));

  return out;
}

/**
 * @typedef {Object} LabPdfRow
 * @property {string} label
 * @property {string} value
 * @property {'ok'|'warn'|'error'} [status]
 */

/**
 * @typedef {Object} ExportLabCalcPdfOpts
 * @property {string} title
 * @property {string} [norm]
 * @property {LabPdfRow[]} [inputs]
 * @property {LabPdfRow[]} [results]
 * @property {string} [svgSelector]
 * @property {SVGElement | SVGElement[]} [svgElement]
 */

/**
 * @param {ExportLabCalcPdfOpts} opts
 */
export async function exportLabCalcPdf(opts) {
  if (!isLabPdfExportAllowed()) {
    throw new Error(labPdfSignInMessage(!langEs()));
  }

  const en = !langEs();
  const lang = getCurrentLang();
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 14;
  const contentW = pageW - 2 * m;
  const ts = formatDateTimeLocale(new Date(), lang);

  const title = sanitizePdfText(opts.title || (en ? 'Lab report' : 'Informe laboratorio'));
  const norm = sanitizePdfText(opts.norm || '');
  const inputRows = Array.isArray(opts.inputs) ? opts.inputs : [];
  const resultRows = Array.isArray(opts.results) ? opts.results : [];

  let diagramEls = [];
  if (opts.svgElement) {
    diagramEls = Array.isArray(opts.svgElement) ? opts.svgElement : [opts.svgElement];
  } else if (opts.svgSelector) {
    diagramEls = resolveDiagramSvgs(document, opts.svgSelector);
  }

  // Header
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pageW, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TheMechAssist', m, 12);
  doc.setFontSize(11);
  doc.text(title, m, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(ts, m, 27);

  let y = 42;
  if (norm) {
    doc.setTextColor(...SLATE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(en ? 'Reference standard' : 'Norma de referencia', m, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NAVY);
    y = addWrapped(doc, norm, m, y, contentW, 4.2) + 6;
  }

  const colParam = en ? 'Parameter' : 'Parametro';
  const colValue = en ? 'Value' : 'Valor';
  const colUnit = en ? 'Unit / note' : 'Unidad / nota';
  const colMag = en ? 'Magnitude' : 'Magnitud';
  const colStatus = en ? 'Status' : 'Estado';

  y = drawSectionTitle(doc, m, y, contentW, en ? 'Input parameters' : 'Parametros de entrada');
  if (inputRows.length) {
    y = drawTable(doc, m, y, contentW, inputRows, colParam, colValue, colUnit, pageH, m, en);
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(en ? 'No inputs recorded.' : 'Sin entradas registradas.', m, y);
    y += 10;
  }

  if (y > pageH - 60) {
    doc.addPage();
    y = 18;
  }

  y = drawSectionTitle(doc, m, y, contentW, en ? 'Main results' : 'Resultados principales');
  if (resultRows.length) {
    const withStatus = resultRows.some((r) => r.status);
    y = drawTable(
      doc,
      m,
      y,
      contentW,
      resultRows,
      colMag,
      colValue,
      withStatus ? colStatus : undefined,
      pageH,
      m,
      en,
    );
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(en ? 'Run the calculation to populate results.' : 'Ejecute el calculo para ver resultados.', m, y);
    y += 10;
  }

  // Diagram
  doc.addPage();
  y = 18;
  y = drawSectionTitle(doc, m, y, contentW, en ? 'Schematic diagram' : 'Diagrama esquematico');
  const maxDiagramH = 120;
  let diagramAdded = false;

  for (const svg of diagramEls.filter((e) => e instanceof SVGSVGElement)) {
    const png = await svgToPngData(svg);
    if (!png) continue;
    diagramAdded = true;
    const ratio = png.width / png.height;
    let drawW = contentW;
    let drawH = drawW / ratio;
    if (drawH > maxDiagramH) {
      drawH = maxDiagramH;
      drawW = drawH * ratio;
    }
    const x = m + (contentW - drawW) / 2;
    if (y + drawH > pageH - 22) {
      doc.addPage();
      y = 18;
      y = drawSectionTitle(doc, m, y, contentW, en ? 'Schematic diagram' : 'Diagrama esquematico');
    }
    doc.setDrawColor(...BORDER);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(m, y - 1, contentW, drawH + 4, 2, 2, 'FD');
    doc.addImage(png.dataUrl, 'PNG', x, y + 1, drawW, drawH, undefined, 'FAST');
    y += drawH + 10;
  }

  if (!diagramAdded) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(
      en
        ? 'Diagram could not be embedded (omitted).'
        : 'No se pudo incrustar el diagrama (omitido).',
      m,
      y,
    );
  }

  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const fileBase = `${en ? 'report' : 'informe'}-${slug || 'lab'}-${new Date().toISOString().slice(0, 10)}`;

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    drawPageFooter(doc, pageW, pageH, m, ts, p, totalPages);
  }

  doc.save(`${fileBase}.pdf`);
}

/**
 * @typedef {Object} MountLabPdfExportButtonOpts
 * @property {string | (() => string)} title
 * @property {string | (() => string)} norm
 * @property {string} [scopeSelector]
 * @property {string} [svgSelector]
 * @property {string} [anchorSelector]
 * @property {() => { inputs?: LabPdfRow[]; results?: LabPdfRow[] }} [getData]
 * @property {() => boolean} [canExport]
 */

/**
 * @param {MountLabPdfExportButtonOpts} opts
 */
export function mountLabPdfExportButton(opts) {
  const scopeSel = opts.scopeSelector || 'main.lab-main';
  const anchorSel =
    opts.anchorSelector || `${scopeSel} .lab-results-wrap .lab-results-actions, ${scopeSel} .lab-results-actions`;

  const scope = () => document.querySelector(scopeSel);
  const anchor = () => document.querySelector(anchorSel);

  const resolve = (v) => (typeof v === 'function' ? v() : v);

  const render = () => {
    const anchorEl = anchor();
    if (!(anchorEl instanceof HTMLElement)) return;

    let slot = anchorEl.parentElement?.querySelector('[data-lab-pdf-export-slot]');
    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'lab-pdf-export-slot';
      slot.dataset.labPdfExportSlot = '1';
      anchorEl.insertAdjacentElement('afterend', slot);
    }

    const en = !langEs();
    const premium = isPremiumEffective();
    const checkout = 'checkout.html';
    const tip = en ? 'Requires Pro plan ù View plans ?' : 'Requiere plan Pro ù Ver planes ?';
    const btnLabel = en ? 'Export PDF report' : 'Exportar informe PDF';

    if (!premium) {
      slot.innerHTML = `
        <button type="button" class="lab-btn lab-btn--block lab-btn--locked" disabled aria-disabled="true" title="${tip}">
          ${btnLabel}
        </button>
        <p class="lab-pdf-export-locked-hint">
          <a href="${checkout}">${tip}</a>
        </p>`;
      return;
    }

    slot.innerHTML = `
      <button type="button" class="lab-btn lab-btn--block lab-btn--pdf" data-lab-pdf-export>
        ${btnLabel}
      </button>`;

    slot.querySelector('[data-lab-pdf-export]')?.addEventListener('click', async () => {
      try {
        if (!isPremiumEffective()) {
          showToast(en ? 'Pro plan required for PDF export.' : 'Se requiere plan Pro para exportar PDF.', {
            type: 'error',
            durationMs: 6000,
          });
          return;
        }
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

        const sc = scope();
        if (!(sc instanceof HTMLElement)) return;

        if (typeof opts.canExport === 'function' && !opts.canExport()) {
          showToast(
            en ? 'Complete the calculation before exporting.' : 'Complete el calculo antes de exportar.',
            { type: 'error', durationMs: 5000 },
          );
          return;
        }

        const invalid = sc.querySelector('.field-input--danger[aria-invalid="true"]');
        if (invalid) {
          showToast(
            en ? 'Fix input errors before exporting.' : 'Corrija errores de entrada antes de exportar.',
            { type: 'error', durationMs: 5000 },
          );
          return;
        }

        const verdictStatus = inferLabVerdictStatus(sc);
        let inputs = [];
        let results = [];

        if (typeof opts.getData === 'function') {
          const data = opts.getData();
          inputs = data.inputs || [];
          results = data.results || [];
        } else {
          inputs = collectLabInputRows(sc);
          const metrics = collectLabResultRows(sc);
          const catalog = collectLabCatalogResultRows(sc);
          results = metrics.length ? metrics : catalog;
        }

        if (verdictStatus && results.length && !results.some((r) => r.status)) {
          results = [{ label: en ? 'Overall verdict' : 'Veredicto global', value: 'ù', status: verdictStatus }, ...results];
        }

        await exportLabCalcPdf({
          title: resolve(opts.title),
          norm: resolve(opts.norm),
          inputs,
          results,
          svgSelector: opts.svgSelector,
        });

        showToast(en ? 'PDF downloaded.' : 'PDF descargado.', { type: 'ok' });
      } catch (e) {
        const msg = e && typeof e === 'object' && 'message' in e ? String(/** @type {any} */ (e).message) : String(e);
        showToast(msg, { type: 'error', durationMs: 8000 });
      }
    });
  };

  render();
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'mdr-local-user-v1' || ev.key === 'mdr-pro-license-v1') render();
  });
  window.addEventListener('mdr-pro-status-changed', render);
  window.addEventListener(LAB_LANG_EVENT, render);
}
