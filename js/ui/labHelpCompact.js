/**
 * Convierte textos largos de ayuda en campos (.lab-field-help, .hint) en un botón "?" con tooltip al hover.
 * La ayuda queda fuera del <label> (fila .lab-field__label-row) para no romper data-i18n / snapshots.
 */

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

    const helpP = field.querySelector(':scope > p.lab-field-help');
    const hintEl = field.querySelector(':scope > span.hint');
    if (!helpP && !hintEl) return;

    const label =
      field.querySelector(':scope > label.lab-field__label-row') ||
      field.querySelector(':scope > label');
    if (!label) return;

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
    tip.innerHTML = buildFieldTooltipContent(
      hintEl instanceof HTMLElement ? hintEl : null,
      helpP instanceof HTMLElement ? helpP : null,
    );

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
}

/**
 * Actualiza el HTML del globo tras applyModuleTranslations (hint/help siguen en DOM ocultos).
 * @param {ParentNode} [root]
 */
export function refreshCompactLabFieldHelp(root = document) {
  root.querySelectorAll('.lab-field[data-help-compact="1"]').forEach((field) => {
    if (!(field instanceof HTMLElement)) return;
    const tip = field.querySelector(':scope .lab-help-hover__tip');
    if (!tip) return;
    const helpP = field.querySelector(':scope > p.lab-field-help');
    const hintEl = field.querySelector(':scope > span.hint');
    tip.innerHTML = buildFieldTooltipContent(
      hintEl instanceof HTMLElement ? hintEl : null,
      helpP instanceof HTMLElement ? helpP : null,
    );
  });
}
