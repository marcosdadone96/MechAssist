import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'calc-weld-joint.html');
let s = fs.readFileSync(p, 'utf8');

if (s.includes('weldCustomAdmRow')) {
  console.log('weld custom electrode already present');
  process.exit(0);
}

const nl = s.includes('\r\n') ? '\r\n' : '\n';
const marker = `                  <option value="E50" data-i18n="weld.optE50">E50</option>${nl}                </select>`;
if (!s.includes(marker)) {
  console.error('electrode select marker not found');
  process.exit(1);
}

const insertSelect = `                  <option value="E50" data-i18n="weld.optE50">E50</option>${nl}                  <option value="custom" data-i18n="weld.optCustom">Personalizado</option>${nl}                </select>`;

s = s.replace(marker, insertSelect);

const afterSelect = `                </select>${nl}                <p class="lab-field-help" data-i18n="weld.helpElectrodeHtml" data-i18n-html>`;
const customRow = `                </select>${nl}                <div class="lab-field" id="weldCustomAdmRow" hidden>${nl}                  <label for="weldCustomAdm" class="lab-field__label-row">${nl}                    <span class="lab-field__label-text" data-i18n="weld.labelCustomAdm">&#964;_adm personalizado (MPa)</span>${nl}                  </label>${nl}                  <input inputmode="decimal" id="weldCustomAdm" type="number" step="any" min="10" value="100" />${nl}                </div>${nl}                <p class="lab-field-help" data-i18n="weld.helpElectrodeHtml" data-i18n-html>`;

if (!s.includes(afterSelect)) {
  console.error('after-select marker not found');
  process.exit(1);
}

s = s.replace(afterSelect, customRow);
fs.writeFileSync(p, s, 'utf8');
console.log('patched weld custom electrode');
