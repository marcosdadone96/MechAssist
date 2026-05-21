/**
 * Convierte textos largos de ayuda en campos (.lab-field-help, .hint) en un botón "?" con tooltip al hover.
 * La ayuda queda en la fila .lab-field__label-row (no dentro del texto del label) para no romper data-i18n.
 */

const canHoverUi = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function buildFieldTooltipContent(hintEl, helpP) {
  const parts = [];
  if (hintEl) {
    parts.push(`<div class="lab-help-hover__hint-line">${hintEl.innerHTML}</div>`);
  }
  if (helpP) {
    parts.push(`<div class="lab-help-hover__body">${helpP.innerHTML}</div>`);
  }
  return parts.join('');
}

function hideHelpSource(el) {
  if (!(el instanceof HTMLElement)) return;
  el.hidden = true;
  el.setAttribute('aria-hidden', 'true');
}

function findFieldHelpSources(field) {
  const helpP =
    field.querySelector(':scope > p.lab-field-help') ||
    field.querySelector(':scope > .lab-field-help') ||
    field.querySelector('p.lab-field-help');
  const hintEl =
    field.querySelector(':scope > span.hint') || field.querySelector(':scope > .hint');
  return {
    helpP: helpP instanceof HTMLElement ? helpP : null,
    hintEl: hintEl instanceof HTMLElement ? hintEl : null,
  };
}

function refreshWrapTip(wrap) {
  const field = wrap.closest('.lab-field');
  if (!(field instanceof HTMLElement)) return false;
  const tip = wrap.querySelector(':scope > .lab-help-hover__tip');
  if (!(tip instanceof HTMLElement)) return false;
  const { helpP, hintEl } = findFieldHelpSources(field);
  const html = buildFieldTooltipContent(hintEl, helpP);
  if (!html.trim()) return false;
  tip.innerHTML = html;
  return true;
}

/**
 * Refresca el HTML del globo desde hint/help ocultos (p. ej. tras cambio de idioma).
 * @param {ParentNode} [root]
 */
export function refreshCompactLabFieldHelp(root = document) {
  root.querySelectorAll('.lab-field[data-help-compact="1"] .lab-help-hover--field').forEach((wrap) => {
    if (wrap instanceof HTMLElement) refreshWrapTip(wrap);
  });
}

/**
 * Al pasar el ratón, vuelve a leer hint/help por si el DOM o i18n cambió (p. ej. tipo de correa).
 * @param {ParentNode} [root]
 */
export function bindLabHelpHover(root = document) {
  if (!canHoverUi()) return;

  root.querySelectorAll('.lab-help-hover--field').forEach((wrap) => {
    if (!(wrap instanceof HTMLElement) || wrap.dataset.labHelpHoverBound === '1') return;
    wrap.dataset.labHelpHoverBound = '1';

    const show = () => {
      if (!refreshWrapTip(wrap)) return;
      wrap.classList.add('lab-help-hover--open');
    };
    const hide = () => {
      wrap.classList.remove('lab-help-hover--open');
    };

    wrap.addEventListener('mouseenter', show);
    wrap.addEventListener('mouseleave', hide);
    wrap.addEventListener('focusin', show);
    wrap.addEventListener('focusout', hide);
  });
}

/**
 * @param {ParentNode} [root]
 */
export function mountCompactLabFieldHelp(root = document) {
  const helpAria = document.documentElement.lang?.toLowerCase().startsWith('en')
    ? 'Help for this field'
    : 'Ayuda sobre este campo';

  root.querySelectorAll('.lab-calc-layout__inputs .lab-field').forEach((field) => {
    if (!(field instanceof HTMLElement)) return;
    if (field.dataset.helpCompact === '1') {
      const legacyLabel =
        field.querySelector(':scope > label') || field.querySelector(':scope > .lab-field__label-row');
      if (legacyLabel?.querySelector(':scope > .lab-help-hover')) {
        delete field.dataset.helpCompact;
      } else {
        return;
      }
    }

    const { helpP, hintEl } = findFieldHelpSources(field);
    if (!helpP && !hintEl) return;

    const label =
      field.querySelector(':scope > label.lab-field__label-row') ||
      field.querySelector(':scope > label');
    if (!label) return;

    const html = buildFieldTooltipContent(hintEl, helpP);
    if (!html.trim()) return;

    field.dataset.helpCompact = '1';

    const wrap = document.createElement('span');
    wrap.className = 'lab-help-hover lab-help-hover--field';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lab-help-hover__btn';
    btn.setAttribute('aria-label', helpAria);
    btn.textContent = '?';

    const tip = document.createElement('span');
    tip.className = 'lab-help-hover__tip';
    tip.innerHTML = html;

    wrap.appendChild(btn);
    wrap.appendChild(tip);

    if (label.classList.contains('lab-field__label-row')) {
      label.appendChild(wrap);
    } else {
      const row = document.createElement('div');
      row.className = 'lab-field__label-row';
      label.parentNode?.insertBefore(row, label);
      row.appendChild(label);
      row.appendChild(wrap);
    }

    hideHelpSource(hintEl);
    hideHelpSource(helpP);
  });

  bindLabHelpHover(root);
}
