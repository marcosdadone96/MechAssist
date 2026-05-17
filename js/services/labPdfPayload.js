/**
 * Recoge entradas y resultados del DOM para informes PDF del laboratorio.
 */

import { formatDateTimeLocale, getCurrentLang } from '../config/locales.js';

function langEs() {
  return getCurrentLang() !== 'en';
}

/**
 * @param {string} raw
 */
function cleanLabel(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\?+\s*$/g, '')
    .trim()
    .slice(0, 72);
}

/**
 * @param {string} raw
 */
function cleanValue(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

/**
 * @param {ParentNode} scope
 * @param {string} id
 */
export function labelForLabField(scope, id) {
  const lab = scope.querySelector(`label[for="${CSS.escape(id)}"]`);
  if (lab) {
    const textEl = lab.querySelector('.lab-field__label-text');
    if (textEl) return cleanLabel(textEl.textContent);
    return cleanLabel(lab.textContent);
  }
  const el = scope.querySelector(`#${CSS.escape(id)}`);
  if (el) {
    const aria = el.getAttribute('aria-label');
    if (aria) return cleanLabel(aria);
  }
  return cleanLabel(id);
}

/**
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} el
 */
function displayValueForField(el) {
  if (el instanceof HTMLSelectElement) {
    const opt = el.selectedOptions[0];
    if (!opt) return cleanValue(el.value);
    const txt = String(opt.textContent || '').trim();
    const short = txt.split(' — ')[0].split(' – ')[0];
    return cleanValue(short || el.value);
  }
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox') return el.checked ? (langEs() ? 'Si' : 'Yes') : langEs() ? 'No' : 'No';
    return cleanValue(el.value);
  }
  return cleanValue(el.value);
}

/**
 * @param {ParentNode} scope
 * @returns {Array<{ label: string; value: string }>}
 */
export function collectLabInputRows(scope) {
  /** @type {Array<{ label: string; value: string }>} */
  const rows = [];
  const seen = new Set();

  scope.querySelectorAll('.lab-field').forEach((field) => {
    if (!(field instanceof HTMLElement)) return;
    if (field.closest('.lab-presets, [data-lab-preset-bar]')) return;

    const control = field.querySelector('input[id], select[id], textarea[id]');
    if (
      !control ||
      !(
        control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement ||
        control instanceof HTMLTextAreaElement
      )
    ) {
      return;
    }
    if (control instanceof HTMLInputElement) {
      const t = control.type;
      if (t === 'button' || t === 'submit' || t === 'reset' || t === 'search' || t === 'hidden') return;
    }

    const id = control.id;
    if (!id || seen.has(id)) return;
    seen.add(id);

    const value = displayValueForField(control);
    if (!value && control instanceof HTMLInputElement && control.type !== 'checkbox') return;

    rows.push({ label: labelForLabField(scope, id), value });
  });

  return rows;
}

/**
 * @param {ParentNode} scope
 * @returns {Array<{ label: string; value: string }>}
 */
export function collectLabResultRows(scope) {
  /** @type {Array<{ label: string; value: string }>} */
  const rows = [];
  const seen = new Set();

  const push = (label, value) => {
    const k = cleanLabel(label);
    const v = cleanValue(value);
    if (!k || !v) return;
    const key = `${k}::${v}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ label: k, value: v });
  };

  scope.querySelectorAll('.lab-metric').forEach((block) => {
    const kEl = block.querySelector('.k');
    const vEl = block.querySelector('.v');
    if (!kEl || !vEl) return;
    push(kEl.textContent, vEl.innerText);
  });

  scope.querySelectorAll('.lab-element-card').forEach((card) => {
    const title = card.querySelector('.lab-element-card__title');
    const prefix = title ? `${cleanLabel(title.textContent)} / ` : '';
    card.querySelectorAll('.lab-element-card__kv dt').forEach((dt) => {
      const dd = dt.nextElementSibling;
      if (dd) push(`${prefix}${dt.textContent}`, dd.textContent);
    });
  });

  scope.querySelectorAll('output[id]').forEach((el) => {
    const v = String(el.value ?? el.textContent ?? '').trim();
    if (!v) return;
    push(labelForLabField(scope, el.id) || el.id, v);
  });

  return rows;
}

/**
 * @param {ParentNode} scope
 * @returns {string[]}
 */
export function collectLabFormulaLines(scope) {
  /** @type {string[]} */
  const lines = [];
  const seen = new Set();

  const add = (raw) => {
    const line = String(raw || '')
      .trim()
      .replace(/\s+/g, ' ');
    if (line.length < 6 || line.length > 320) return;
    if (seen.has(line)) return;
    seen.add(line);
    lines.push(line);
  };

  const hosts = ['#formulaMemory', '#labFormulaMemory', '.lab-formula-memory', '.lab-calc-trace'];
  for (const sel of hosts) {
    const el = scope.querySelector(sel) || document.querySelector(sel);
    if (!el) continue;
    el.querySelectorAll('li, .lab-formula-line').forEach((node) => add(node.textContent));
  }

  return lines.slice(0, 48);
}

/**
 * @param {ParentNode} scope
 * @returns {string[]}
 */
export function collectLabAssumptions(scope) {
  /** @type {string[]} */
  const lines = [];
  const assumEl = scope.querySelector('#assumptions, .lab-assumptions');
  if (!assumEl) return lines;
  assumEl.querySelectorAll('li').forEach((node) => {
    const line = String(node.textContent || '')
      .trim()
      .replace(/\s+/g, ' ');
    if (line.length > 4 && line.length < 280) lines.push(line);
  });
  return lines.slice(0, 24);
}

/**
 * @param {ParentNode} scope
 */
export function collectLabVerdict(scope) {
  const hero = scope.querySelector('.lab-result-hero');
  if (hero) {
    const cells = hero.querySelectorAll('.lab-result-hero__cell');
    if (cells.length) {
      const parts = [];
      cells.forEach((cell) => {
        const label = cell.querySelector('.lab-result-hero__label');
        const value = cell.querySelector('.lab-result-hero__value');
        if (label && value) {
          parts.push(`${cleanLabel(label.textContent)}: ${cleanValue(value.textContent)}`);
        }
      });
      if (parts.length) return parts.join(' | ').slice(0, 400);
    }
    return String(hero.innerText || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 400);
  }
  const alertEl = scope.querySelector(
    '.lab-alert--verdict, .lab-alert[data-verdict], .lab-alert--ok, .lab-alert--warn, .lab-alert--error',
  );
  if (alertEl) {
    return String(alertEl.textContent || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 400);
  }
  return '';
}

/**
 * @param {string} tipo_maquina
 * @param {ParentNode} scope
 */
export function buildLabPdfPayload(tipo_maquina, scope) {
  const en = !langEs();
  const lang = getCurrentLang();
  const inputRows = collectLabInputRows(scope);
  const resultRows = collectLabResultRows(scope);
  const formulaLines = collectLabFormulaLines(scope);
  const assumptions = collectLabAssumptions(scope);
  const verdict = collectLabVerdict(scope);

  const kpis = resultRows.slice(0, 4).map((r) => ({
    title: r.label.slice(0, 36),
    value: r.value.slice(0, 32),
  }));

  const slug = String(tipo_maquina || 'lab')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);

  return {
    title: en ? `Report - ${tipo_maquina}` : `Informe - ${tipo_maquina}`,
    fileBase: `${en ? 'report' : 'informe'}-${slug || 'lab'}-${new Date().toISOString().slice(0, 10)}`,
    timestamp: formatDateTimeLocale(new Date(), lang),
    kpis,
    inputRows,
    resultRows,
    formulaLines,
    assumptions,
    verdict: verdict || (en ? 'See results table.' : 'Ver tabla de resultados.'),
    disclaimer: en
      ? 'Educational pre-design tool. Verify with manufacturer data, applicable standards and qualified engineering review before fabrication or operation.'
      : 'Herramienta educativa de predimensionado. Verificar con datos de fabricante, normativa aplicable e ingenieria cualificada antes de fabricar u operar.',
  };
}
