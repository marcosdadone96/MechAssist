import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function patch(file, reps) {
  let s = fs.readFileSync(path.join(root, file), 'utf8');
  s = s.replace(/\uFFFD/g, '');
  for (const [a, b] of reps) {
    if (a instanceof RegExp) s = s.replace(a, b);
    else s = s.split(a).join(b);
  }
  fs.writeFileSync(path.join(root, file), s, 'utf8');
  console.log(file, 'fffd', (s.match(/\uFFFD/g) || []).length);
}

patch('calc-power-screw.html', [
  [/fricci\u00f3n \?/g, 'fricci\u00f3n \u03bc'],
  [/tornillotuerca/g, 'tornillo\u2013tuerca'],
  [/T = F\(d/g, 'T = F\u00b7(d'],
  [/tan\(\u03bb\s+\?\?\)/g, 'tan(\u03bb \u00b1 \u03c6\u2032)'],
  [/Tr 30\u00d7\/strong>/g, 'Tr 30\u00b0</strong>'],
  [/Tr 30\u00d7strong>/g, 'Tr 30\u00b0</strong>'],
  [/Tr 30.\/strong>/g, 'Tr 30\u00b0</strong>'],
  [/\? orientativo/g, '\u03bc orientativo'],
  [/\? y autobloqueo/g, '\u03b7 y autobloqueo'],
  [/rendimiento \? y/g, 'rendimiento \u03b7 y'],
  [/Coeficiente de fricci\u00f3n \?\?\?/g, 'Coeficiente de fricci\u00f3n \u03bc'],
  [/d\u2082 \? d/g, 'd\u2082 \u2248 d'],
  [/n\u00famero de entradas n/g, 'N\u00famero de entradas n'],
  [/n\u00famero de principios/g, 'N\u00famero de principios'],
]);

patch('calc-beam.html', [
  [/\u00da\u00fatil/g, '\u00datil'],
  [/\u00da\u00fatil/g, '\u00datil'],
]);

patch('calc-weld-joint.html', [
  [/segn tipo/g, 'seg\u00fan tipo'],
  [/LMITES/g, 'L\u00cdMITES'],
  [/Garganta <strong>a \? 0/g, 'Garganta <strong>a \u2248 0'],
  [/l \? 2h/g, 'l \u2212 2h'],
]);
