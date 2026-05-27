/**
 * Fix remaining ? placeholders and broken markup in calc-power-screw.html (UTF-8 safe).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'calc-power-screw.html');
let s = fs.readFileSync(p, 'utf8');

const rep = [
  ['fricci\u00f3n ?.', 'fricci\u00f3n \u03bc.'],
  ['fricci\u00f3n ?</span>', 'fricci\u00f3n \u03bc</span>'],
  ['tornillotuerca', 'tornillo\u2013tuerca'],
  [
    'Par de avance: <strong>T = F(d<sub>2</sub>/2)tan(\u03bb  ??)</strong>',
    'Par de avance: <strong>T = F\u00b7(d<sub>2</sub>/2)\u00b7tan(\u03bb \u00b1 \u03c6\u2032)</strong>',
  ],
  ['<strong>Tr 30\u00d7/strong>', '<strong>Tr 30\u00b0</strong>'],
  ['<strong>d<sub>2</sub> ? d ? 0,5\u00b7p</strong>', '<strong>d<sub>2</sub> \u2248 d \u2212 0,5\u00b7p</strong>'],
  ['Lmite orientativo', 'L\u00edmite orientativo'],
  ['Elevacin o prensa?', 'Elevaci\u00f3n o prensa?'],
  ['veh\u00edculos ?</a>', 'veh\u00edculos \u2192</a>'],
  ['Tr 8\u00d7 1,5', 'Tr 8 \u00d7 1,5'],
  ['Tr 10\u00d7 2', 'Tr 10 \u00d7 2'],
  ['Tr 12\u00d7 3', 'Tr 12 \u00d7 3'],
  ['Tr 16\u00d7 4', 'Tr 16 \u00d7 4'],
  ['Tr 20\u00d7 4', 'Tr 20 \u00d7 4'],
  ['Tr 24\u00d7 5', 'Tr 24 \u00d7 5'],
  ['Tr 32\u00d7 6', 'Tr 32 \u00d7 6'],
  ['Tr 40\u00d7 7', 'Tr 40 \u00d7 7'],
  ['Tr 50\u00d7 8', 'Tr 50 \u00d7 8'],
];

for (const [a, b] of rep) s = s.split(a).join(b);

fs.writeFileSync(p, s, 'utf8');
const bad = (s.match(/\?/g) || []).length;
const fffd = (s.match(/\uFFFD/g) || []).length;
console.log('calc-power-screw.html', 'FFFD:', fffd, 'remaining ?:', bad);
