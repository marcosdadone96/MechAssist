import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'calc-beam.html');
let s = fs.readFileSync(p, 'utf8');
if (s.includes('helpBeamTypeHtml')) {
  console.log('already has help');
  process.exit(0);
}

const nl = s.includes('\r\n') ? '\r\n' : '\n';

s = s.replace(
  `                </select>${nl}              </div>${nl}              <div class="lab-field">${nl}                <label for="beamLoadType" class="lab-field__label-row">`,
  `                </select>${nl}                <p class="lab-field-help" data-i18n="beam.helpBeamTypeHtml" data-i18n-html>${nl}                  <strong>Apoyada</strong>: dos apoyos. <strong>Voladizo</strong>: un empotramiento. <strong>Empotrada&ndash;empotrada</strong>: modelo simplificado.${nl}                </p>${nl}              </div>${nl}              <div class="lab-field">${nl}                <label for="beamLoadType" class="lab-field__label-row">`,
);

s = s.replace(
  `                </select>${nl}              </div>${nl}              <div class="lab-field">${nl}                <label for="beamSection" class="lab-field__label-row">`,
  `                </select>${nl}                <p class="lab-field-help" data-i18n="beam.helpLoadTypeHtml" data-i18n-html>${nl}                  <strong>F</strong> puntual (N) o <strong>q</strong> distribuida (N/m). Posici&oacute;n <strong>a</strong> si aplica.${nl}                </p>${nl}              </div>${nl}              <div class="lab-field">${nl}                <label for="beamSection" class="lab-field__label-row">`,
);

s = s.replace(
  `                </select>${nl}              </div>${nl}              <div class="lab-field">${nl}                <label for="beamE" class="lab-field__label-row">`,
  `                </select>${nl}                <p class="lab-field-help" data-i18n="beam.helpSectionHtml" data-i18n-html>${nl}                  Dimensiones en <strong>mm</strong>. Perfil I/T: alma y alas seg&uacute;n cat&aacute;logo o medida propia.${nl}                </p>${nl}              </div>${nl}              <div class="lab-field">${nl}                <label for="beamE" class="lab-field__label-row">`,
);

s = s.replace(
  `<input inputmode="decimal" id="beamSpan" type="number" step="0.001" min="0.001" value="3" />${nl}              </div>${nl}              <div class="lab-field">${nl}                <label for="beamLoad" class="lab-field__label-row">`,
  `<input inputmode="decimal" id="beamSpan" type="number" step="0.001" min="0.001" value="3" />${nl}                <p class="lab-field-help" data-i18n="beam.helpSpanHtml" data-i18n-html>${nl}                  Vano <strong>L</strong> entre apoyos (m). En voladizo, longitud libre desde el empotramiento.${nl}                </p>${nl}              </div>${nl}              <div class="lab-field">${nl}                <label for="beamLoad" class="lab-field__label-row">`,
);

fs.writeFileSync(p, s, 'utf8');
console.log('inserted', s.includes('helpBeamTypeHtml'));
