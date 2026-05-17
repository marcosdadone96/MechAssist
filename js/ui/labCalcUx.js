/**
 * Patrones UX compartidos para calculadoras del laboratorio (jerarquía de resultados,
 * regla de potencias IEC, alertas accesibles, feedback de recálculo).
 */

import { incrementCalcCounter } from '../services/calcCounter.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { ensureCalcSessionCharged } from '../services/creditSession.js';
import { showNoCreditsModal } from './creditsUi.js';
import { copyLabReportToClipboard, buildLabCopyReportFromScope } from '../services/labCopyReport.js';
import { getLabLang } from '../lab/i18n/labLang.js';

/** Potencias nominales típicas IEC / catálogo (kW) — mismas familias que SEW Eurodrive, Siemens SIMOTICS, etc. */
export const IEC_MOTOR_KW_SERIES = [
  0.12, 0.18, 0.25, 0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132,
  160, 200, 250,
];

const ALERT_ICONS = {
  info: `<svg class="lab-alert__glyph" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  warn: `<svg class="lab-alert__glyph" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>`,
  danger: `<svg class="lab-alert__glyph" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
  ok: `<svg class="lab-alert__glyph" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>`,
};

function isEnglishUi() {
  return document?.documentElement?.lang?.toLowerCase().startsWith('en') || false;
}

function escMini(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Separa valor numérico inicial y unidades para tipografía (número destacado, unidad apagada).
 * No altera cadenas que ya parecen HTML.
 */
export function labValueWithMutedUnit(display) {
  const s = String(display ?? '').trim();
  if (!s) return '';
  if (s.includes('<')) return s;
  if (s === '—') return `<span class="lab-num">${escMini(s)}</span>`;
  const m = s.match(/^(-?[\d][\d.,]*)\s+(.+)$/);
  if (m) {
    return `<span class="lab-num">${escMini(m[1])}</span><span class="lab-num__unit">\u00a0${escMini(m[2])}</span>`;
  }
  return `<span class="lab-num">${escMini(s)}</span>`;
}

export function uxCopy(es, en) {
  return isEnglishUi() ? en : es;
}

/**
 * @param {'info'|'warn'|'danger'|'ok'} level
 * @param {string} htmlInner - texto ya escapado o HTML seguro
 */
export function labAlert(level, htmlInner) {
  const cls =
    level === 'danger' ? 'danger' : level === 'warn' ? 'warn' : level === 'ok' ? 'ok' : 'info';
  const icon = ALERT_ICONS[cls === 'ok' ? 'ok' : cls === 'danger' ? 'danger' : cls === 'warn' ? 'warn' : 'info'];
  const role = cls === 'danger' || cls === 'warn' ? 'alert' : 'status';
  return `<div class="lab-alert lab-alert--${cls}" role="${role}"><span class="lab-alert__icon" aria-hidden="true">${icon}</span><span class="lab-alert__body">${htmlInner}</span></div>`;
}

/**
 * Resumen ejecutivo estándar para cada cálculo.
 * @param {{
 *   level: 'info'|'warn'|'danger'|'ok',
 *   titleEs: string,
 *   titleEn: string,
 *   actionsEs?: string[],
 *   actionsEn?: string[]
 * }} opts
 */
export function executiveSummaryAlert(opts) {
  const title = uxCopy(opts.titleEs, opts.titleEn);
  const actions = uxCopy(opts.actionsEs || [], opts.actionsEn || []);
  const list = actions.length
    ? `<ul class="lab-alert__list">${actions.map((a) => `<li>${a}</li>`).join('')}</ul>`
    : '';
  return labAlert(opts.level, `<strong>${title}</strong>${list}`);
}

/**
 * Tooltip "?" reutilizable (HTML de ayuda ya confiable / generado por la app).
 * @param {string} html
 * @param {string} [ariaLabel]
 */
/**
 * @param {string} html
 * @param {string} [ariaLabel]
 * @param {string} [extraClass] p. ej. lab-help-hover--hero
 */
export function labHelpTooltipMarkup(html, ariaLabel = 'Ayuda', extraClass = '') {
  const safeLabel = String(ariaLabel).replace(/"/g, '&quot;');
  const cls = `lab-help-hover lab-help-hover--inline${extraClass ? ` ${extraClass}` : ''}`;
  return `<span class="${cls}">
    <button type="button" class="lab-help-hover__btn" aria-label="${safeLabel}">?</button>
    <span class="lab-help-hover__tip">${html}</span>
  </span>`;
}

/**
 * Casilla de resultado: un solo valor visible + ayuda opcional en tooltip "?".
 * @param {string} k
 * @param {string} v
 * @param {string} [help]
 */
export function metricHtml(k, v, help) {
  const tip = help
    ? labHelpTooltipMarkup(help, isEnglishUi() ? 'Help for this metric' : 'Ayuda sobre esta magnitud')
    : '';
  return `<div class="lab-metric"><div class="lab-metric__head"><span class="k">${k}</span>${tip}</div><div class="v">${labValueWithMutedUnit(v)}</div></div>`;
}

const LAB_FINAL_VERDICT_LABELS = {
  ok: { es: 'APTO PARA DISE\u00d1O BASE', en: 'SUITABLE FOR BASELINE DESIGN' },
  warn: { es: 'REVISAR', en: 'REVIEW' },
  error: { es: 'FUERA DE L\u00cdMITE', en: 'OUT OF RANGE' },
};

/**
 * Banner único de veredicto (laboratorio): va sobre el hero numérico.
 * @param {'ok'|'warn'|'error'} verdict
 */
export function renderLabFinalVerdictBanner(verdict) {
  const v = verdict === 'error' ? 'error' : verdict === 'warn' ? 'warn' : 'ok';
  const cls = v === 'ok' ? 'ok' : v === 'warn' ? 'warn' : 'error';
  const icon = cls === 'ok' ? '\u2713' : cls === 'warn' ? '\u26a0' : '\u2717';
  const L = LAB_FINAL_VERDICT_LABELS[v];
  const label = uxCopy(L.es, L.en);
  return `<div class="lab-verdict lab-verdict--${cls}" role="status"><span class="lab-verdict__icon" aria-hidden="true">${icon}</span><span class="lab-verdict__label">${escMini(label)}</span></div>`;
}

/**
 * @param {Array<{ label: string, value: string, unit?: string, hint?: string }>} items
 * @param {{ verdict?: 'ok'|'warn'|'error' }} [opts] — si `verdict` está definido, se antepone el bloque .lab-verdict
 */
export function renderResultHero(items, opts = {}) {
  if (!items.length) return '';
  const helpLabel = isEnglishUi() ? 'Help' : 'Ayuda';
  const cells = items
    .map(
      (it) => `
    <div class="lab-result-hero__cell">
      <div class="lab-result-hero__head">
        <div class="lab-result-hero__label">${it.label}</div>
        ${it.hint ? labHelpTooltipMarkup(it.hint, helpLabel, 'lab-help-hover--hero') : ''}
      </div>
      <div class="lab-result-hero__value-line">
        <span class="lab-result-hero__value">${labValueWithMutedUnit(it.display != null ? it.display : `${it.value}${it.unit ? ` ${it.unit}` : ''}`)}</span>
      </div>
    </div>`,
    )
    .join('');
  const verdict = opts.verdict;
  const verdictPrefix =
    verdict === 'ok' || verdict === 'warn' || verdict === 'error' ? renderLabFinalVerdictBanner(verdict) : '';
  return `${verdictPrefix}<div class="lab-result-hero">${cells}</div>`;
}

/**
 * Regla horizontal: posición del usuario frente a escalones IEC.
 * @param {number} powerKw
 */
export function renderMotorPowerRuler(powerKw) {
  if (!(powerKw > 0) || !Number.isFinite(powerKw)) return '';
  const en = isEnglishUi();
  const maxScale = Math.max(90, powerKw * 1.35);
  const ticks = IEC_MOTOR_KW_SERIES.filter((p) => p <= maxScale);
  const needlePct = Math.min(100, Math.max(0, (powerKw / maxScale) * 100));

  const tickHtml = ticks
    .map((p) => {
      const left = (p / maxScale) * 100;
      const major = p >= 1 ? p % 1 === 0 || p === 0.75 || p === 0.55 || p === 0.37 : true;
      return `<span class="lab-motor-ruler__tick ${major ? 'lab-motor-ruler__tick--major' : ''}" style="left:${left}%"><span class="lab-motor-ruler__tick-label">${p}</span></span>`;
    })
    .join('');

  const nextUp = IEC_MOTOR_KW_SERIES.find((p) => p >= powerKw);
  const nextLine =
    nextUp != null && nextUp !== powerKw
      ? en
        ? ` Next IEC nominal size up: <strong>${nextUp} kW</strong>.`
        : ` Próximo nominal IEC hacia arriba: <strong>${nextUp} kW</strong>.`
      : '';

  return `<figure class="lab-motor-ruler" aria-label="${en ? 'Power comparison against standard motors' : 'Comparativa de potencia con motores estándar'}">
    <div class="lab-motor-ruler__head">
      <span class="lab-motor-ruler__title">${en ? 'Power · commercial reference' : 'Potencia · referencia comercial'}</span>
      <span class="lab-motor-ruler__brands">${en ? 'IEC · SEW · Siemens (indicative)' : 'IEC · SEW · Siemens (orientativo)'}</span>
    </div>
    <div class="lab-motor-ruler__track" role="presentation">
      <div class="lab-motor-ruler__bar"></div>
      ${tickHtml}
      <span class="lab-motor-ruler__needle" style="left:${needlePct}%">
        <span class="lab-motor-ruler__needle-cap" title="${en ? 'Your value' : 'Su valor'}">${powerKw.toFixed(2)} kW</span>
      </span>
    </div>
    <figcaption class="lab-motor-ruler__cap">
      ${
        en
          ? `Scale 0–${maxScale.toFixed(0)} kW. Your input/calculation: <strong>${powerKw.toFixed(2)} kW</strong>.${nextLine}
      Real catalogues include frame, poles, and duty variants; use this ruler only as a quick guide.`
          : `Escala 0–${maxScale.toFixed(0)} kW. Su cálculo/entrada: <strong>${powerKw.toFixed(2)} kW</strong>.${nextLine}
      Catálogos reales incluyen variantes de marco, polos y servicio; use esta línea solo como guía rápida.`
      }
    </figcaption>
  </figure>`;
}

/**
 * Borde rojo / mensaje solo en blur para rangos; en input se limpia el error cuando el valor ya es válido.
 * No bloquea el recálculo (solo visual).
 * @param {Array<{ id: string, min?: number, max?: number, label?: string }>} inputConfigs
 */
export function bindInputValidation(inputConfigs) {
  inputConfigs.forEach(({ id, min, max }) => {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLInputElement)) return;
    if (el.dataset.labValidationBound === '1') return;
    el.dataset.labValidationBound = '1';

    const errEl = document.createElement('span');
    errEl.className = 'lab-field-error';
    errEl.setAttribute('aria-live', 'polite');
    el.insertAdjacentElement('afterend', errEl);

    function validate(commit) {
      const invalidMsg = uxCopy('Introduce un número válido', 'Enter a valid number');
      const minMsg = (m) => uxCopy(`Mínimo: ${m}`, `Minimum: ${m}`);
      const maxMsg = (m) => uxCopy(`Máximo: ${m}`, `Maximum: ${m}`);

      const raw = String(el.value).trim();
      if (raw === '') {
        el.classList.remove('lab-input--error', 'lab-input--ok');
        errEl.textContent = '';
        return;
      }

      const v = parseFloat(raw.replace(',', '.'));

      if (commit) {
        if (!Number.isFinite(v)) {
          el.classList.add('lab-input--error');
          el.classList.remove('lab-input--ok');
          errEl.textContent = invalidMsg;
          return;
        }
        if (min !== undefined && v < min) {
          el.classList.add('lab-input--error');
          el.classList.remove('lab-input--ok');
          errEl.textContent = minMsg(min);
          return;
        }
        if (max !== undefined && v > max) {
          el.classList.add('lab-input--error');
          el.classList.remove('lab-input--ok');
          errEl.textContent = maxMsg(max);
          return;
        }
        el.classList.remove('lab-input--error');
        el.classList.add('lab-input--ok');
        errEl.textContent = '';
        return;
      }

      if (!Number.isFinite(v)) {
        el.classList.remove('lab-input--ok');
        return;
      }

      const inRange =
        (min === undefined || v >= min) && (max === undefined || v <= max);
      if (inRange) {
        el.classList.remove('lab-input--error');
        el.classList.add('lab-input--ok');
        errEl.textContent = '';
      } else {
        el.classList.remove('lab-input--ok', 'lab-input--error');
        errEl.textContent = '';
      }
    }

    el.addEventListener('input', () => validate(false));
    el.addEventListener('blur', () => validate(true));
    validate(true);
  });
}

/**
 * Barra de ejemplos típicos (misma UX que engranajes/correas).
 * @param {string} containerId id del contenedor `.lab-presets-bar`
 * @param {Array<{ label: string, labelKey?: string, values: Record<string, string | number | boolean> }>} presets
 * @param {() => void} recalculate
 */
export function mountLabPresetsBar(containerId, presets, recalculate) {
  const container = document.getElementById(containerId);
  if (!container) {
    return {
      get applying() {
        return false;
      },
      clearActive() {},
    };
  }
  let applying = false;
  const clearActive = () => {
    container.querySelectorAll('.lab-preset-btn').forEach((b) => b.classList.remove('is-active'));
  };
  presets.forEach((preset) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lab-preset-btn';
    btn.textContent = preset.label;
    if (preset.labelKey) btn.setAttribute('data-i18n', preset.labelKey);
    btn.addEventListener('click', () => {
      clearActive();
      btn.classList.add('is-active');
      applying = true;
      try {
        Object.entries(preset.values).forEach(([id, value]) => {
          const el = document.getElementById(id);
          if (!el) return;
          if (el instanceof HTMLInputElement && el.type === 'checkbox') {
            el.checked = Boolean(value);
            el.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (el instanceof HTMLSelectElement) {
            el.value = String(value);
            el.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            el.value = value === '' || value == null ? '' : String(value);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      } finally {
        queueMicrotask(() => {
          applying = false;
        });
      }
      recalculate();
    });
    container.appendChild(btn);
  });
  return {
    get applying() {
      return applying;
    },
    clearActive,
  };
}

/**
 * Serializa / hidrata entradas del laboratorio en la URL (query corta).
 * Soporta checkbox como 1/0 en la query.
 * @param {Record<string, string>} paramToId
 * @param {{ hydrateOrder?: string[], afterHydrate?: () => void, hydrateKeyAliases?: Record<string, string[]> }} options
 *        hydrateKeyAliases: p.ej. `{ face: ['faceWidth'] }` acepta claves alternativas en la query.
 */
export function createLabUrlSync(paramToId, options = {}) {
  let hydrating = false;

  function getRawFromQuery(q, key) {
    let raw = q.get(key);
    if (raw != null) return raw;
    const alts = options.hydrateKeyAliases?.[key];
    if (alts) {
      for (const a of alts) {
        raw = q.get(a);
        if (raw != null) return raw;
      }
    }
    return null;
  }

  function applyQueryValue(key, raw) {
    const id = paramToId[key];
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      const on = raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
      el.checked = on;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      el.value = raw;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    if (el instanceof HTMLInputElement) {
      el.value = raw;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function serializeToUrl() {
    if (hydrating) return;
    const params = new URLSearchParams();
    for (const [key, id] of Object.entries(paramToId)) {
      const el = document.getElementById(id);
      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        params.set(key, el.checked ? '1' : '0');
      } else if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
      ) {
        params.set(key, el.value);
      }
    }
    const qs = params.toString();
    const path = `${location.pathname}${location.hash || ''}`;
    history.replaceState(null, '', qs ? `${path}?${qs}` : path);
  }

  function hydrateFromUrl() {
    const q = new URLSearchParams(location.search);
    if ([...q.keys()].length === 0) return;
    hydrating = true;
    try {
      const order = options.hydrateOrder ?? Object.keys(paramToId);
      const seen = new Set();
      for (const key of order) {
        const raw = getRawFromQuery(q, key);
        if (raw != null) {
          applyQueryValue(key, raw);
          seen.add(key);
        }
      }
      for (const key of Object.keys(paramToId)) {
        if (seen.has(key)) continue;
        const raw = getRawFromQuery(q, key);
        if (raw != null) applyQueryValue(key, raw);
      }
      options.afterHydrate?.();
    } finally {
      queueMicrotask(() => {
        hydrating = false;
      });
    }
  }

  return {
    get hydrating() {
      return hydrating;
    },
    serializeToUrl,
    hydrateFromUrl,
  };
}

/**
 * Boton «Copiar resultados» con tablas HTML para Word + texto plano alineado.
 * @param {string} buttonId
 * @param {{ moduleTitle: string; scopeSelector?: string }} opts
 */
export function wireLabCopyResultsButton(buttonId, { moduleTitle, scopeSelector = 'main.lab-main' }) {
  document.getElementById(buttonId)?.addEventListener('click', async () => {
    const btn = document.getElementById(buttonId);
    if (!(btn instanceof HTMLButtonElement)) return;
    const en = getLabLang() === 'en';
    const original = btn.textContent || uxCopy('Copiar resultados', 'Copy results');
    try {
      const scope = document.querySelector(scopeSelector) || document.body;
      const report = buildLabCopyReportFromScope(moduleTitle, scope);
      await copyLabReportToClipboard(report);
      btn.textContent = uxCopy('Resultados copiados', 'Results copied');
    } catch {
      btn.textContent = uxCopy('No se pudo copiar', 'Could not copy');
    } finally {
      window.setTimeout(() => {
        btn.textContent = original;
      }, 1400);
    }
  });
}

/** Botón «Copiar enlace» + toast (mensajes ES/EN con `uxCopy`). */
export function wireLabCopyLink(buttonId, toastId) {
  document.getElementById(buttonId)?.addEventListener('click', async () => {
    const toast = document.getElementById(toastId);
    try {
      await navigator.clipboard.writeText(location.href);
      if (toast) {
        toast.textContent = uxCopy('¡Enlace copiado!', 'Link copied!');
        toast.classList.add('is-shown');
        window.setTimeout(() => toast.classList.remove('is-shown'), 2000);
      }
    } catch {
      if (toast) {
        toast.textContent = uxCopy('No se pudo copiar', 'Could not copy');
        toast.classList.add('is-shown');
        window.setTimeout(() => toast.classList.remove('is-shown'), 2000);
      }
    }
  });
}

/** Muestra la fila de compartir cuando hay métricas en el bloque de resultados. */
export function updateLabShareVisibility(shareWrapId, resultsInnerElId) {
  const wrap = document.getElementById(shareWrapId);
  const inner = document.getElementById(resultsInnerElId);
  if (wrap && inner) {
    wrap.classList.toggle('is-visible', Boolean(inner.innerHTML.trim()));
  }
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Ejecuta el cálculo y permite al navegador pintar el estado "computing" si el trabajo supera ~un frame.
 * @param {HTMLElement | null} wrap
 * @param {() => void} fn
 */
function runCalcFeedbackInner(wrap, fn) {
  if (!wrap) {
    fn();
    incrementCalcCounter();
    return;
  }
  wrap.classList.add('lab-results-wrap--computing');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        fn();
        incrementCalcCounter();
      } finally {
        wrap.classList.remove('lab-results-wrap--computing');
        wrap.classList.remove('lab-results-wrap--pulse');
        void wrap.offsetWidth;
        wrap.classList.add('lab-results-wrap--pulse');
        setTimeout(() => wrap.classList.remove('lab-results-wrap--pulse'), 650);
      }
    });
  });
}

export function runCalcWithIndustrialFeedback(wrap, fn) {
  if (!isCreditsSystemEnabled()) {
    runCalcFeedbackInner(wrap, fn);
    return;
  }
  ensureCalcSessionCharged().then((gate) => {
    if (!gate.allowed) {
      if (gate.reason === 'no_credits') {
        showNoCreditsModal();
        import('./noCreditsLockMode.js').then((m) => m.syncNoCreditsInputLock());
      }
      return;
    }
    runCalcFeedbackInner(wrap, fn);
  });
}
