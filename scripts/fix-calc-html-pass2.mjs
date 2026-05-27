import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const common = [
  [/rendimiento \?,/g, 'rendimiento \u03b7,'],
  [/dimetro/g, 'di\u00e1metro'],
  [/clsico/g, 'cl\u00e1sico'],
  [/; til /g, '; \u00fatil '],
  [/tan\(\?  \?\?\)/g, 'tan(\u03bb \u00b1 \u03c6\u2032)'],
  [/verificacin/g, 'verificaci\u00f3n'],
  [/catlogo/g, 'cat\u00e1logo'],
  [/tpicos/g, 't\u00edpicos'],
  [/Eje  torsi/g, 'Eje \u00b7 torsi'],
  [/Rodamientos  L10/g, 'Rodamientos \u00b7 L10'],
  [/clculo/g, 'c\u00e1lculo'],
  [/friccin \?/g, 'fricci\u00f3n \u03bc'],
  [/Coeficiente de friccin /g, 'Coeficiente de fricci\u00f3n \u03bc'],
  [/  aplicaci/g, ' \u2014 aplicaci'],
  [/  dimetro/g, ' \u2014 di\u00e1metro'],
  [/  apoyos/g, ' \u2014 apoyos'],
  [/\? personalizado/g, '\u03bc personalizado'],
  [/\? \(personalizado\)/g, '\u03bc (personalizado)'],
  [/\? orientativo/g, '\u03bc orientativo'],
  [/rendimiento \? y/g, 'rendimiento \u03b7 y'],
  [/\(\? &lt; \?\?\)/g, '(\u03bb &lt; \u03c6\u2032)'],
  [/d\u2082 \u2248 d \u2212 0,5p/g, 'd<sub>2</sub> \u2248 d \u2212 0,5\u00b7p'],
  [/d2 \? d/g, 'd<sub>2</sub> \u2248 d'],
];

for (const file of ['calc-power-screw.html', 'calc-weld-joint.html', 'calc-beam.html']) {
  const p = path.join(root, file);
  let s = fs.readFileSync(p, 'utf8');
  for (const [re, rep] of common) s = s.replace(re, rep);
  fs.writeFileSync(p, s, 'utf8');
  console.log('pass2', file);
}
