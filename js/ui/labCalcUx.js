/**
 * Patrones UX compartidos para calculadoras del laboratorio (jerarquía de resultados,
 * regla de potencias IEC, alertas accesibles, feedback de recálculo).
 */

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
  return `<div class="lab-metric"><div class="lab-metric__head"><span class="k">${k}</span>${tip}</div><div class="v">${v}</div></div>`;
}

/**
 * @param {Array<{ label: string, value: string, unit?: string, hint?: string }>} items
 */
export function renderResultHero(items) {
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
        <span class="lab-result-hero__value">${it.display != null ? it.display : `${it.value}${it.unit ? ` ${it.unit}` : ''}`}</span>
      </div>
    </div>`,
    )
    .join('');
  return `<div class="lab-result-hero">${cells}</div>`;
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
export function runCalcWithIndustrialFeedback(wrap, fn) {
  if (!wrap) {
    fn();
    return;
  }
  wrap.classList.add('lab-results-wrap--computing');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        fn();
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
