/**
 * Add data-i18n to weld electrode table and power-screw ISO table headers (UTF-8 safe).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const weldOld = `<table class="lab-table">
                      <thead>
                        <tr><th>Cat.</th><th>?<sub>adm</sub></th><th>?<sub>adm</sub></th><th>Acero ref.</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>E35</td><td>140 MPa</td><td>84 MPa</td><td>S235</td></tr>
                        <tr><td>E42</td><td>175 MPa</td><td>105 MPa</td><td>S275/S355</td></tr>
                        <tr><td>E50</td><td>210 MPa</td><td>126 MPa</td><td>S355/S420</td></tr>
                      </tbody>
                    </table>`;

const weldNew = `<table class="lab-table">
                      <thead>
                        <tr>
                          <th data-i18n="weld.tableThCat">Cat.</th>
                          <th data-i18n="weld.tableThSigma">\u03c3<sub>adm</sub></th>
                          <th data-i18n="weld.tableThTau">\u03c4<sub>adm</sub></th>
                          <th data-i18n="weld.tableThSteel">Acero ref.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td data-i18n="weld.tableRowE35">E35</td>
                          <td data-i18n="weld.tableRowE35Sigma">140 MPa</td>
                          <td data-i18n="weld.tableRowE35Tau">84 MPa</td>
                          <td data-i18n="weld.tableRowE35Steel">S235</td>
                        </tr>
                        <tr>
                          <td data-i18n="weld.tableRowE42">E42</td>
                          <td data-i18n="weld.tableRowE42Sigma">175 MPa</td>
                          <td data-i18n="weld.tableRowE42Tau">105 MPa</td>
                          <td data-i18n="weld.tableRowE42Steel">S275/S355</td>
                        </tr>
                        <tr>
                          <td data-i18n="weld.tableRowE50">E50</td>
                          <td data-i18n="weld.tableRowE50Sigma">210 MPa</td>
                          <td data-i18n="weld.tableRowE50Tau">126 MPa</td>
                          <td data-i18n="weld.tableRowE50Steel">S355/S420</td>
                        </tr>
                      </tbody>
                    </table>`;

const weldPath = path.join(root, 'calc-weld-joint.html');
let weld = fs.readFileSync(weldPath, 'utf8');
if (!weld.includes(weldOld)) {
  if (weld.includes('weld.tableThCat')) {
    console.log('calc-weld-joint.html table i18n already present');
  } else {
    console.error('calc-weld-joint.html: electrode table marker not found');
    process.exit(1);
  }
} else {
  weld = weld.replace(weldOld, weldNew);
  fs.writeFileSync(weldPath, weld, 'utf8');
  console.log('patched calc-weld-joint.html electrode table');
}

const psPath = path.join(root, 'calc-power-screw.html');
let ps = fs.readFileSync(psPath, 'utf8');
const psReps = [
  ['data-i18n="pscrew.isoThDesig"', 'data-i18n="pscrew.tableThSize"'],
  ['data-i18n="pscrew.isoThPitch"', 'data-i18n="pscrew.tableThPitch"'],
];
let psChanged = false;
for (const [a, b] of psReps) {
  if (ps.includes(a)) {
    ps = ps.split(a).join(b);
    psChanged = true;
  }
}
if (psChanged) {
  fs.writeFileSync(psPath, ps, 'utf8');
  console.log('patched calc-power-screw.html table headers');
} else if (ps.includes('pscrew.tableThSize')) {
  console.log('calc-power-screw.html table headers already present');
} else {
  console.error('calc-power-screw.html: ISO table header keys not found');
  process.exit(1);
}
