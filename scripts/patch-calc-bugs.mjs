import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const isoTable = `                      <thead>
                        <tr>
                          <th data-i18n="pscrew.isoThDesig">Designaci\u00f3n</th>
                          <th data-i18n="pscrew.isoThPitch">p (mm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>Tr 8 \u00d7 1,5</td><td>1,5</td></tr>
                        <tr><td>Tr 10 \u00d7 2</td><td>2</td></tr>
                        <tr><td>Tr 12 \u00d7 3</td><td>3</td></tr>
                        <tr><td>Tr 16 \u00d7 4</td><td>4</td></tr>
                        <tr><td>Tr 20 \u00d7 4</td><td>4</td></tr>
                        <tr><td>Tr 24 \u00d7 5</td><td>5</td></tr>
                        <tr><td>Tr 32 \u00d7 6</td><td>6</td></tr>
                        <tr><td>Tr 40 \u00d7 7</td><td>7</td></tr>
                        <tr><td>Tr 50 \u00d7 8</td><td>8</td></tr>
                      </tbody>`;

let ps = fs.readFileSync(path.join(root, 'calc-power-screw.html'), 'utf8');
ps = ps.replace(/<thead>[\s\S]*?<\/tbody>/, isoTable);
fs.writeFileSync(path.join(root, 'calc-power-screw.html'), ps, 'utf8');

let weld = fs.readFileSync(path.join(root, 'calc-weld-joint.html'), 'utf8');
weld = weld.replace(/id="weldCopyToast"[^>]*>[^<]*<\/div>/, 'id="weldCopyToast" role="status" data-i18n="weld.copyToast">\u00a1Enlace copiado!</div>');
fs.writeFileSync(path.join(root, 'calc-weld-joint.html'), weld, 'utf8');

let beam = fs.readFileSync(path.join(root, 'calc-beam.html'), 'utf8');
beam = beam.replace(
  /data-i18n="beam\.labelSigAdm">[^<]*<\/span>/,
  'data-i18n="beam.labelSigAdm">\u03c3 admisible (MPa)</span>',
);
fs.writeFileSync(path.join(root, 'calc-beam.html'), beam, 'utf8');

let ps2 = fs.readFileSync(path.join(root, 'calc-power-screw.html'), 'utf8');
ps2 = ps2.replace(
  /data-i18n="pscrew\.labelFriction">[^<]*<\/span>/,
  'data-i18n="pscrew.labelFriction">Coeficiente de fricci\u00f3n \u03bc</span>',
);
fs.writeFileSync(path.join(root, 'calc-power-screw.html'), ps2, 'utf8');

console.log('patched table, toast, beam label, friction');
