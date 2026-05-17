/**
 * PDF para calculadoras de laboratorio — diseño tabular legible.
 * Requiere sesión iniciada y red para jsPDF.
 */
import { svgToPngData } from './reportPdfExport.js';
import { getCurrentLang, formatDateTimeLocale, t } from '../config/locales.js';
import { showToast } from '../ui/toast.js';
import { isLabPdfExportAllowed, labPdfSignInMessage, labPdfSignInUrl } from './labPdfAuth.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { ensurePdfExportCharged } from './creditSession.js';

const JSPDF_CDN = 'https://esm.sh/jspdf@2.5.2';

const TEAL = [13, 148, 136];
const NAVY = [15, 23, 42];
const SLATE = [71, 85, 105];
const MUTED = [100, 116, 139];
const BORDER = [226, 232, 240];
const ZEBRA = [248, 250, 252];

function sanitizePdfText(value) {
  let out = String(value ?? '');
  out = out.replace(/[·•—–−×⁻¹²³°→≤≥]/g, (m) => {
    const map = { '·': ' - ', '•': '- ', '—': '-', '–': '-', '−': '-', '×': 'x', '°': ' deg', '→': '->', '≤': '<=', '≥': '>=' };
    return map[m] || ' ';
  });
  out = out.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  out = out.replace(/[^\x20-\x7E\n]/g, ' ');
  out = out.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return out;
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
 * @param {import('jspdf').jsPDF} doc
 * @param {number} pageW
 * @param {number} pageH
 * @param {number} m
 * @param {string} ts
 * @param {number} pageNum
 * @param {number} totalPages
 */
function drawPageFooter(doc, pageW, pageH, m, ts, pageNum, totalPages) {
  const lang = getCurrentLang();
  doc.setDrawColor(...BORDER);
  doc.line(m, pageH - 14, pageW - m, pageH - 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text('TheMechAssist', m, pageH - 9);
  doc.text(ts, m, pageH - 5);
  const pageLbl =
    lang === 'en' ? `Page ${pageNum} / ${totalPages}` : `Página ${pageNum} / ${totalPages}`;
  doc.text(pageLbl, pageW - m, pageH - 7, { align: 'right' });
}

/**
 * @param {import('jspdf').jsPDF} doc
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {string} title
 * @param {boolean} en
 */
function drawSectionTitle(doc, x, y, w, title, en) {
  doc.setFillColor(...TEAL);
  doc.rect(x, y, w, 7.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(sanitizePdfText(title), x + 3, y + 5.2);
  return y + 10;
}

function drawKpiCard(doc, x, y, w, h, title, value) {
  doc.setDrawColor(...BORDER);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
  doc.setTextColor(...SLATE);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(sanitizePdfText(title), w - 6);
  doc.text(titleLines.slice(0, 2), x + 3, y + 5);
  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  const valLines = doc.splitTextToSize(sanitizePdfText(value), w - 6);
  doc.text(valLines.slice(0, 2), x + 3, y + 12);
}

/**
 * @param {import('jspdf').jsPDF} doc
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {Array<{ label: string; value: string }>} rows
 * @param {string} colParam
 * @param {string} colValue
 * @param {number} pageH
 * @param {number} m
 * @returns {number}
 */
function drawKeyValueTable(doc, x, y, w, rows, colParam, colValue, pageH, m) {
  const col1 = w * 0.48;
  const col2 = w - col1;
  const headerH = 7;
  const minRowH = 7;

  const drawHeader = (yy) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(x, yy, w, headerH, 'F');
    doc.setDrawColor(...BORDER);
    doc.rect(x, yy, w, headerH, 'S');
    doc.line(x + col1, yy, x + col1, yy + headerH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...SLATE);
    doc.text(colParam, x + 2.5, yy + 4.8);
    doc.text(colValue, x + col1 + 2.5, yy + 4.8);
    return yy + headerH;
  };

  y = drawHeader(y);
  let rowIdx = 0;

  for (const row of rows) {
    const labelLines = doc.splitTextToSize(sanitizePdfText(row.label), col1 - 5);
    const valueLines = doc.splitTextToSize(sanitizePdfText(row.value), col2 - 5);
    const rowH = Math.max(minRowH, Math.max(labelLines.length, valueLines.length) * 4 + 3);

    if (y + rowH > pageH - 18) {
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
    doc.line(x + col1, y, x + col1, y + rowH);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    doc.text(labelLines, x + 2.5, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(valueLines, x + col1 + 2.5, y + 4.5);

    y += rowH;
    rowIdx += 1;
  }

  return y + 4;
}

/**
 * @param {object} payload
 * @param {object} opts
 * @param {SVGElement[]} [opts.diagramEls]
 */
export async function exportLabFluidReportPdf(payload, opts = {}) {
  if (!isLabPdfExportAllowed()) {
    const en = getCurrentLang() === 'en';
    throw new Error(labPdfSignInMessage(en));
  }

  const lang = getCurrentLang();
  const en = lang === 'en';
  let jsPDF;
  try {
    const mod = await import(/* webpackIgnore: true */ JSPDF_CDN);
    jsPDF = mod.jsPDF;
  } catch {
    throw new Error(t('pdfLoadError', lang));
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 14;
  const contentW = pageW - 2 * m;
  const ts = payload.timestamp || formatDateTimeLocale(new Date(), lang);

  const inputRows = Array.isArray(payload.inputRows) ? payload.inputRows : [];
  const resultRows = Array.isArray(payload.resultRows) ? payload.resultRows : [];
  const formulaLines = Array.isArray(payload.formulaLines) ? payload.formulaLines : [];
  const assumptions = Array.isArray(payload.assumptions) ? payload.assumptions : [];
  const kpis = Array.isArray(payload.kpis) ? payload.kpis.slice(0, 4) : [];

  const diagramEls = Array.isArray(opts.diagramEls) ? opts.diagramEls.filter((e) => e instanceof SVGSVGElement) : [];

  // —— Página 1: portada + KPIs ——
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pageW, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(sanitizePdfText(payload.title || (en ? 'Lab report' : 'Informe laboratorio')), m, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(ts, m, 23);
  doc.text('www.themechassist.com', m, 30);

  let y = 46;
  if (kpis.length) {
    const kpiW = (contentW - 6) / 2;
    const kpiH = 20;
    for (let i = 0; i < kpis.length; i += 1) {
      const k = kpis[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      drawKpiCard(doc, m + col * (kpiW + 6), y + row * (kpiH + 5), kpiW, kpiH, k.title, k.value);
    }
    y += Math.ceil(kpis.length / 2) * (kpiH + 5) + 8;
  }

  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summary = en
    ? 'This report summarizes the current calculator state: schematic diagram, input parameters, results and notes.'
    : 'Este informe resume el estado actual de la calculadora: diagrama esquemático, parámetros de entrada, resultados y notas.';
  y = addWrapped(doc, summary, m, y, contentW, 4.5) + 6;

  if (payload.verdict) {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(153, 246, 228);
    const vLines = doc.splitTextToSize(sanitizePdfText(payload.verdict), contentW - 8);
    const boxH = vLines.length * 4.2 + 8;
    doc.roundedRect(m, y, contentW, boxH, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 118, 110);
    doc.text(en ? 'Summary' : 'Resumen', m + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NAVY);
    doc.text(vLines, m + 4, y + 10);
    y += boxH + 6;
  }

  // —— Página 2: diagrama ——
  doc.addPage();
  y = 18;
  y = drawSectionTitle(doc, m, y, contentW, en ? 'Schematic diagram' : 'Diagrama esquemático', en);

  const maxDiagramH = 110;
  if (diagramEls.length) {
    for (const svg of diagramEls) {
      const png = await svgToPngData(svg);
      if (!png) continue;
      const ratio = png.width / png.height;
      let drawW = contentW;
      let drawH = drawW / ratio;
      if (drawH > maxDiagramH) {
        drawH = maxDiagramH;
        drawW = drawH * ratio;
      }
      const x = m + (contentW - drawW) / 2;
      if (y + drawH > pageH - 20) {
        doc.addPage();
        y = 18;
        y = drawSectionTitle(doc, m, y, contentW, en ? 'Schematic diagram' : 'Diagrama esquemático', en);
      }
      doc.setDrawColor(...BORDER);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(m, y - 1, contentW, drawH + 4, 2, 2, 'FD');
      doc.addImage(png.dataUrl, 'PNG', x, y + 1, drawW, drawH, undefined, 'FAST');
      y += drawH + 12;
    }
  } else {
    doc.setTextColor(...MUTED);
    doc.setFontSize(9);
    doc.text(en ? 'No diagram available on this page.' : 'No hay diagrama en esta página.', m, y);
    y += 10;
  }

  // —— Página 3: entradas ——
  doc.addPage();
  y = 18;
  y = drawSectionTitle(
    doc,
    m,
    y,
    contentW,
    en ? `Inputs (${inputRows.length})` : `Entradas (${inputRows.length})`,
    en,
  );
  if (inputRows.length) {
    y = drawKeyValueTable(
      doc,
      m,
      y,
      contentW,
      inputRows,
      en ? 'Parameter' : 'Parámetro',
      en ? 'Value' : 'Valor',
      pageH,
      m,
    );
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(en ? 'No inputs recorded.' : 'Sin entradas registradas.', m, y);
    y += 8;
  }

  // —— Página 4: resultados ——
  doc.addPage();
  y = 18;
  y = drawSectionTitle(
    doc,
    m,
    y,
    contentW,
    en ? `Results (${resultRows.length})` : `Resultados (${resultRows.length})`,
    en,
  );
  if (resultRows.length) {
    y = drawKeyValueTable(
      doc,
      m,
      y,
      contentW,
      resultRows,
      en ? 'Magnitude' : 'Magnitud',
      en ? 'Value' : 'Valor',
      pageH,
      m,
    );
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(en ? 'Run the calculation to populate results.' : 'Ejecute el cálculo para ver resultados.', m, y);
    y += 8;
  }

  // —— Trazabilidad (si hay) ——
  if (formulaLines.length || assumptions.length) {
    doc.addPage();
    y = 18;
    if (formulaLines.length) {
      y = drawSectionTitle(doc, m, y, contentW, en ? 'Calculation trace' : 'Trazabilidad de cálculo', en);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...NAVY);
      for (const line of formulaLines) {
        if (y > pageH - 22) {
          doc.addPage();
          y = 18;
        }
        y = addWrapped(doc, `• ${line}`, m + 2, y, contentW - 4, 4) + 1;
      }
      y += 4;
    }
    if (assumptions.length) {
      y = drawSectionTitle(doc, m, y, contentW, en ? 'Assumptions' : 'Supuestos', en);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      for (const line of assumptions) {
        if (y > pageH - 22) {
          doc.addPage();
          y = 18;
        }
        y = addWrapped(doc, `• ${line}`, m + 2, y, contentW - 4, 4) + 1;
      }
    }
  }

  // —— Aviso legal en última página ——
  if (y > pageH - 50) {
    doc.addPage();
    y = 18;
  } else {
    y += 8;
  }
  y = drawSectionTitle(doc, m, y, contentW, en ? 'Disclaimer' : 'Aviso legal', en);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  addWrapped(
    doc,
    payload.disclaimer ||
      (en
        ? 'Educational pre-design tool. Verify with manufacturer data, applicable standards and qualified engineering review.'
        : 'Herramienta educativa de predimensionado. Verificar con datos de fabricante, normativa e ingeniería cualificada.'),
    m,
    y,
    contentW,
    4,
  );

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    drawPageFooter(doc, pageW, pageH, m, ts, p, totalPages);
  }

  doc.save(`${payload.fileBase || 'informe-lab'}.pdf`);
}

/**
 * @param {HTMLElement | null} el
 * @param {object} opts
 * @param {() => object} opts.getPayload
 * @param {() => SVGSVGElement[]} opts.getDiagramElements
 */
export function mountLabFluidPdfExportBar(el, { getPayload, getDiagramElements }) {
  if (!(el instanceof HTMLElement)) return;
  const lang = getCurrentLang();
  const en = lang === 'en';
  const signedIn = isLabPdfExportAllowed();
  const signUrl = labPdfSignInUrl(en);

  el.className = 'lab-fluid-pdf-mount premium-pdf-mount';

  if (!signedIn) {
    el.innerHTML = en
      ? `<div class="premium-export premium-export--teaser">
          <span class="premium-export__badge premium-export__badge--muted">PDF</span>
          <p class="premium-export__teaser-text">${labPdfSignInMessage(true)}</p>
          <a class="premium-export__link" href="${signUrl}">Sign in / Register</a>
        </div>`
      : `<div class="premium-export premium-export--teaser">
          <span class="premium-export__badge premium-export__badge--muted">PDF</span>
          <p class="premium-export__teaser-text">${labPdfSignInMessage(false)}</p>
          <a class="premium-export__link" href="${signUrl}">Iniciar sesi\u00f3n / Registrarse</a>
        </div>`;
    return;
  }

  el.innerHTML = en
    ? `<div class="premium-export premium-export--active">
        <div class="premium-export__copy">
          <span class="premium-export__badge">PDF</span>
          <div><strong>Export calculations and diagram</strong>
          <p class="premium-export__hint">Structured report with diagram, input table and results. Internet required.</p></div>
        </div>
        <button type="button" class="premium-export__btn" data-lab-fluid-pdf>Export calculations and diagram to PDF</button>
      </div>`
    : `<div class="premium-export premium-export--active">
        <div class="premium-export__copy">
          <span class="premium-export__badge">PDF</span>
          <div><strong>Exportar c\u00e1lculos y diagrama</strong>
          <p class="premium-export__hint">Informe estructurado con diagrama, tabla de entradas y resultados. Requiere conexi\u00f3n.</p></div>
        </div>
        <button type="button" class="premium-export__btn" data-lab-fluid-pdf>Exportar c\u00e1lculos y diagrama en PDF</button>
      </div>`;

  el.querySelector('[data-lab-fluid-pdf]')?.addEventListener('click', async () => {
    try {
      if (!isLabPdfExportAllowed()) {
        showToast(labPdfSignInMessage(en), { variant: 'error' });
        return;
      }
      if (isCreditsSystemEnabled()) {
        const pdfGate = await ensurePdfExportCharged();
        if (!pdfGate.allowed) {
          if (pdfGate.reason === 'no_credits') {
            const { showNoCreditsModal } = await import('../ui/creditsUi.js');
            showNoCreditsModal();
          } else {
            showToast(labPdfSignInMessage(en), { variant: 'error' });
          }
          return;
        }
      }
      const payload = getPayload();
      if (payload && payload.valid === false) {
        showToast(en ? 'Fix input errors before exporting.' : 'Corrija errores de entrada antes de exportar.', {
          variant: 'error',
        });
        return;
      }
      await exportLabFluidReportPdf(payload, { diagramEls: getDiagramElements() });
      showToast(en ? 'PDF downloaded.' : 'PDF descargado.', { variant: 'success', duration: 3500 });
    } catch (e) {
      showToast(String(e?.message || e), { variant: 'error', duration: 8000 });
    }
  });
}
