import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'calc-beam.html');
let s = fs.readFileSync(p, 'utf8');

if (s.includes('beam.stdSectionsSummary')) {
  console.log('beam std sections table already present');
  process.exit(0);
}

const nl = s.includes('\r\n') ? '\r\n' : '\n';
const marker = `          </details>${nl}        </header>${nl}        <nav class="lab-next-steps"`;
if (!s.includes(marker)) {
  console.error('marker not found');
  process.exit(1);
}

const block = `          </details>
          <details class="lab-calc-seo" style="margin-top: 0.75rem">
            <summary data-i18n="beam.stdSectionsSummary">
              Dimensiones de perfiles est&aacute;ndar orientativas (IPE/HEA)
            </summary>
            <div class="lab-table-wrap">
              <table class="lab-table">
                <thead>
                  <tr>
                    <th data-i18n="beam.thProfile">Perfil</th>
                    <th>h (mm)</th>
                    <th>b<sub>f</sub> (mm)</th>
                    <th>t<sub>w</sub> (mm)</th>
                    <th>t<sub>f</sub> (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>IPE 100</td><td>100</td><td>55</td><td>4.1</td><td>5.7</td></tr>
                  <tr><td>IPE 140</td><td>140</td><td>73</td><td>4.7</td><td>6.9</td></tr>
                  <tr><td>IPE 160</td><td>160</td><td>82</td><td>5.0</td><td>7.4</td></tr>
                  <tr><td>IPE 200</td><td>200</td><td>100</td><td>5.6</td><td>8.5</td></tr>
                  <tr><td>IPE 240</td><td>240</td><td>120</td><td>6.2</td><td>9.8</td></tr>
                  <tr><td>IPE 270</td><td>270</td><td>135</td><td>6.6</td><td>10.2</td></tr>
                  <tr><td>IPE 300</td><td>300</td><td>150</td><td>7.1</td><td>10.7</td></tr>
                  <tr><td>HEA 100</td><td>96</td><td>100</td><td>5.0</td><td>8.0</td></tr>
                  <tr><td>HEA 120</td><td>114</td><td>120</td><td>5.0</td><td>8.0</td></tr>
                  <tr><td>HEA 140</td><td>133</td><td>140</td><td>5.5</td><td>8.5</td></tr>
                  <tr><td>HEA 160</td><td>152</td><td>160</td><td>6.0</td><td>9.0</td></tr>
                  <tr><td>HEA 200</td><td>190</td><td>200</td><td>6.5</td><td>10.0</td></tr>
                </tbody>
              </table>
            </div>
          </details>
        </header>
        <nav class="lab-next-steps"`;

s = s.replace(marker, block.replace(/\n/g, nl));
fs.writeFileSync(p, s, 'utf8');
console.log('inserted std sections table');
