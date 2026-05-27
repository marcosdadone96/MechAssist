/**
 * Insert units bar + copy-results block on fluid calculator pages.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const UNITS_BAR = `            <div
              class="lab-units-bar"
              role="group"
              data-i18n-attrs="aria-label=fluids.unitsAriaLabel data-lab-convert-title=fluids.convertTitle data-lab-convert-tip=fluids.convertTip"
              aria-label="Unidades de los resultados"
              data-lab-convert-categories="pressure"
              data-lab-convert-title="Conversor (fluidos)"
              data-lab-convert-tip="Presi\u00f3n en bar, MPa o psi; caudal en L/min o m\u00b3/h en los resultados."
            >
              <span class="lab-units-bar__title" data-i18n="fluids.unitsBarTitle">C\u00f3mo ver los resultados</span>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="fluids.lblPressure">Presi\u00f3n</span>
                <select id="labUnitPressure" class="lab-units-bar__select">
                  <option value="bar" data-i18n="fluids.optBar">bar</option>
                  <option value="mpa" data-i18n="fluids.optMpa">MPa</option>
                  <option value="psi" data-i18n="fluids.optPsi">psi</option>
                </select>
              </label>
              <label class="lab-units-bar__field">
                <span class="lab-units-bar__lbl" data-i18n="fluids.lblFlow">Caudal</span>
                <select id="labUnitFlow" class="lab-units-bar__select">
                  <option value="Lmin" data-i18n="fluids.optLmin">L/min</option>
                  <option value="m3h" data-i18n="fluids.optM3h">m\u00b3/h</option>
                </select>
              </label>
            </div>
`;

function copyBlock(copyBtnId, toastId) {
  return `            <div class="lab-results-actions">
              <button type="button" class="lab-btn lab-btn--block" id="${copyBtnId}" data-i18n="fluids.copyResults">Copiar resultados</button>
              <div class="lab-copy-toast" id="${toastId}" role="status" data-i18n="fluids.copyToast">\u00a1Copiado!</div>
            </div>
`;
}

const pages = [
  {
    file: 'calc-hydraulic-pump.html',
    marker: '          <div class="lab-calc-layout__out lab-calc-layout__out--panel">\n            <details class="lab-fluid-formulas"',
    resultsId: 'hpResults',
    copyBtn: 'hpCopyResults',
    toast: 'hpCopyToast',
  },
  {
    file: 'calc-hydraulic-cylinder.html',
    marker: '          <div class="lab-calc-layout__out lab-calc-layout__out--panel">\n            <details class="lab-fluid-formulas"',
    resultsId: 'hcResults',
    copyBtn: 'hcCopyResults',
    toast: 'hcCopyToast',
  },
  {
    file: 'calc-hydraulic-press.html',
    marker: '          <div class="lab-calc-layout__out lab-calc-layout__out--panel">\n            <details class="lab-fluid-formulas"',
    resultsId: 'hppResults',
    copyBtn: 'hppCopyResults',
    toast: 'hppCopyToast',
  },
  {
    file: 'calc-pneumatic-cylinder.html',
    marker: '          <div class="lab-calc-layout__out lab-calc-layout__out--panel">\n            <details class="lab-fluid-formulas"',
    resultsId: 'pcResults',
    copyBtn: 'pcCopyResults',
    toast: 'pcCopyToast',
  },
];

for (const { file, marker, resultsId, copyBtn, toast } of pages) {
  const p = path.join(root, file);
  let s = fs.readFileSync(p, 'utf8');
  const nl = s.includes('\r\n') ? '\r\n' : '\n';

  if (!s.includes('labUnitPressure')) {
    s = s.replace(marker, marker.replace('\n', nl).replace(
      '<div class="lab-calc-layout__out lab-calc-layout__out--panel">',
      `<div class="lab-calc-layout__out lab-calc-layout__out--panel">${nl}${UNITS_BAR.replace(/\n/g, nl)}`,
    ));
  }

  const resultsLine = `            <div id="${resultsId}" class="lab-results"></div>`;
  const copyHtml = copyBlock(copyBtn, toast).replace(/\n/g, nl);
  if (!s.includes(copyBtn)) {
    s = s.replace(resultsLine, `${resultsLine}${nl}${copyHtml}`);
  }

  fs.writeFileSync(p, s, 'utf8');
  console.log(file, 'labUnitPressure:', s.includes('labUnitPressure'), copyBtn + ':', s.includes(copyBtn));
}
