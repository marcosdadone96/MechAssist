/**
 * Copiar resultados del laboratorio con formato legible (Word / correo).
 */
import { buildLabPdfPayload } from './labPdfPayload.js';
import { getCurrentLang, formatDateTimeLocale } from '../config/locales.js';

/**
 * @param {string} s
 */
function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} label
 * @param {string} value
 * @param {number} labelW
 */
function plainRow(label, value, labelW) {
  const l = String(label).slice(0, labelW).padEnd(labelW, ' ');
  return `  ${l}  ${value}`;
}

/**
 * @param {Array<{ label: string; value: string }>} rows
 * @param {number} labelW
 */
function maxLabelWidth(rows, labelW = 34) {
  let w = 12;
  for (const r of rows) {
    w = Math.max(w, Math.min(labelW, String(r.label || '').length));
  }
  return Math.min(labelW, w);
}

/**
 * @param {{
 *   title: string;
 *   timestamp?: string;
 *   inputRows?: Array<{ label: string; value: string }>;
 *   resultRows?: Array<{ label: string; value: string }>;
 *   verdict?: string;
 * }} report
 */
export function buildLabCopyPlainText(report) {
  const en = getCurrentLang() === 'en';
  const ts = report.timestamp || formatDateTimeLocale(new Date(), getCurrentLang());
  const inputs = report.inputRows || [];
  const results = report.resultRows || [];
  const labelW = Math.max(maxLabelWidth(inputs), maxLabelWidth(results), 28);

  const lines = [
    '============================================================',
    report.title || 'TheMechAssist',
    ts,
    '============================================================',
    '',
  ];

  if (inputs.length) {
    lines.push(en ? 'INPUTS' : 'ENTRADAS', en ? '------------------------------------------------------------' : '------------------------------------------------------------', '');
    for (const r of inputs) lines.push(plainRow(r.label, r.value, labelW));
    lines.push('');
  }

  if (results.length) {
    lines.push(en ? 'RESULTS' : 'RESULTADOS', '------------------------------------------------------------', '');
    for (const r of results) lines.push(plainRow(r.label, r.value, labelW));
    lines.push('');
  }

  if (report.verdict) {
    lines.push(en ? 'SUMMARY' : 'RESUMEN', '------------------------------------------------------------', `  ${report.verdict}`, '');
  }

  lines.push(
    '------------------------------------------------------------',
    en
      ? 'TheMechAssist - educational pre-design. Verify with standards and qualified engineering.'
      : 'TheMechAssist - predimensionado educativo. Verificar con normativa e ingenieria cualificada.',
  );

  return lines.join('\n');
}

/**
 * @param {{
 *   title: string;
 *   timestamp?: string;
 *   inputRows?: Array<{ label: string; value: string }>;
 *   resultRows?: Array<{ label: string; value: string }>;
 *   verdict?: string;
 * }} report
 */
export function buildLabCopyHtml(report) {
  const en = getCurrentLang() === 'en';
  const ts = escHtml(report.timestamp || formatDateTimeLocale(new Date(), getCurrentLang()));

  const tableSection = (heading, rows) => {
    if (!rows?.length) return '';
    const head = escHtml(heading);
    const body = rows
      .map(
        (r, i) => `<tr style="background:${i % 2 ? '#f8fafc' : '#ffffff'}">
  <td style="padding:6px 10px;border:1px solid #e2e8f0;color:#475569;width:42%">${escHtml(r.label)}</td>
  <td style="padding:6px 10px;border:1px solid #e2e8f0;color:#0f172a;font-weight:600">${escHtml(r.value)}</td>
</tr>`,
      )
      .join('');
    return `<h3 style="margin:18px 0 8px;font-family:Calibri,Arial,sans-serif;font-size:12pt;color:#0f766e">${head}</h3>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:640px;font-family:Calibri,Arial,sans-serif;font-size:11pt">
${body}
</table>`;
  };

  const verdictBlock = report.verdict
    ? `<p style="margin:14px 0 0;padding:10px 12px;background:#ecfdf5;border-left:4px solid #0d9488;font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#134e4a"><strong>${en ? 'Summary' : 'Resumen'}:</strong> ${escHtml(report.verdict)}</p>`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:12px">
<div style="border-bottom:3px solid #0d9488;padding-bottom:10px;margin-bottom:6px">
  <p style="margin:0;font-family:Calibri,Arial,sans-serif;font-size:14pt;font-weight:700;color:#0f172a">${escHtml(report.title || 'TheMechAssist')}</p>
  <p style="margin:4px 0 0;font-family:Calibri,Arial,sans-serif;font-size:9pt;color:#64748b">${ts} &middot; www.themechassist.com</p>
</div>
${tableSection(en ? 'Inputs' : 'Entradas', report.inputRows)}
${tableSection(en ? 'Results' : 'Resultados', report.resultRows)}
${verdictBlock}
<p style="margin:16px 0 0;font-family:Calibri,Arial,sans-serif;font-size:8.5pt;color:#94a3b8">${en ? 'Educational pre-design tool.' : 'Herramienta educativa de predimensionado.'}</p>
</body></html>`;
}

/**
 * @param {{
 *   title: string;
 *   timestamp?: string;
 *   inputRows?: Array<{ label: string; value: string }>;
 *   resultRows?: Array<{ label: string; value: string }>;
 *   verdict?: string;
 * }} report
 */
export async function copyLabReportToClipboard(report) {
  const plain = buildLabCopyPlainText(report);
  const html = buildLabCopyHtml(report);

  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([plain], { type: 'text/plain;charset=utf-8' }),
        'text/html': new Blob([html], { type: 'text/html;charset=utf-8' }),
      }),
    ]);
    return;
  }

  await navigator.clipboard.writeText(plain);
}

/**
 * @param {string} tipo_maquina
 * @param {ParentNode} scope
 */
export function buildLabCopyReportFromScope(tipo_maquina, scope) {
  const p = buildLabPdfPayload(tipo_maquina, scope);
  return {
    title: p.title,
    timestamp: p.timestamp,
    inputRows: p.inputRows,
    resultRows: p.resultRows,
    verdict: p.verdict,
  };
}
