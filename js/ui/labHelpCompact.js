/**
 * Convierte textos largos de ayuda en campos (.lab-field-help, .hint) en un botón "?" con tooltip al hover.
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

/**
 * @param {ParentNode} [root]
 */
export function mountCompactLabFieldHelp(root = document) {
  const helpAria = document.documentElement.lang?.toLowerCase().startsWith('en')
    ? 'Help for this field'
    : 'Ayuda sobre este campo';

  root.querySelectorAll('.lab-calc-layout__inputs .lab-field').forEach((field) => {
    if (!(field instanceof HTMLElement)) return;
    if (field.dataset.helpCompact === '1') return;

    const helpP = field.querySelector(':scope > p.lab-field-help');
    const hintEl = field.querySelector(':scope > span.hint');
    if (!helpP && !hintEl) return;

    const label = field.querySelector(':scope > label.lab-field__label-row') || field.querySelector(':scope > label');
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
    label.appendChild(wrap);

    hintEl?.remove();
    helpP?.remove();
  });
}
