import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

let ps = fs.readFileSync(path.join(root, 'calc-power-screw.html'), 'utf8');
ps = ps.replace(/Tr 30\u00d7strong>/g, 'Tr 30\u00b0</strong>');
ps = ps.replace(
  /T = F\u00b7\(d<sub>2<\/sub>\/2\)tan\(/g,
  'T = F\u00b7(d<sub>2</sub>/2)\u00b7tan(',
);
fs.writeFileSync(path.join(root, 'calc-power-screw.html'), ps, 'utf8');

let beam = fs.readFileSync(path.join(root, 'calc-beam.html'), 'utf8');
const nl = beam.includes('\r\n') ? '\r\n' : '\n';
if (!beam.includes('helpSigAdmHtml')) {
  beam = beam.replace(
    `placeholder="0 = omitir" />${nl}              </div>${nl}            </div>`,
    `placeholder="0 = omitir" />${nl}                <p class="lab-field-help" data-i18n="beam.helpSigAdmHtml" data-i18n-html>${nl}                  Tensi\u00f3n normal m\u00e1xima admisible orientativa. <strong>0</strong> omite la comprobaci\u00f3n de uso.${nl}                </p>${nl}              </div>${nl}            </div>`,
  );
}
fs.writeFileSync(path.join(root, 'calc-beam.html'), beam, 'utf8');

let weld = fs.readFileSync(path.join(root, 'calc-weld-joint.html'), 'utf8');
const nlW = weld.includes('\r\n') ? '\r\n' : '\n';
if (!weld.includes('helpForceHtml')) {
  weld = weld.replace(
    `value="25000" />${nlW}              </div>${nlW}              <div class="lab-field" data-weld-butt hidden>`,
    `value="25000" />${nlW}                <p class="lab-field-help" data-i18n="weld.helpForceHtml" data-i18n-html>${nlW}                  Fuerza <strong>F</strong> sobre la junta (N).${nlW}                </p>${nlW}              </div>${nlW}              <div class="lab-field" data-weld-butt hidden>`,
  );
}
if (!weld.includes('helpMomentHtml')) {
  weld = weld.replace(
    `placeholder="0 = omitir" />${nlW}              </div>${nlW}              <div class="lab-field" id="weldMomentArmRow"`,
    `placeholder="0 = omitir" />${nlW}                <p class="lab-field-help" data-i18n="weld.helpMomentHtml" data-i18n-html>${nlW}                  Momento flector <strong>M</strong> (N\u00b7m). <strong>0</strong> si no aplica.${nlW}                </p>${nlW}              </div>${nlW}              <div class="lab-field" id="weldMomentArmRow"`,
  );
}
fs.writeFileSync(path.join(root, 'calc-weld-joint.html'), weld, 'utf8');

console.log('ok', {
  tr30: ps.includes('Tr 30\u00b0</strong>'),
  sig: beam.includes('helpSigAdmHtml'),
  force: weld.includes('helpForceHtml'),
  moment: weld.includes('helpMomentHtml'),
});
