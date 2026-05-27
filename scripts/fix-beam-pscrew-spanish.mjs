/**
 * Fix Spanish copy and symbols in calc-beam.html and calc-power-screw.html (UTF-8 safe).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixBeam(html) {
  let s = html;
  const rep = [
    ['Clculo orientativo segn teora', 'C\u00e1lculo orientativo seg\u00fan teor\u00eda'],
    ['Flecha m\u00e1xima ?, momento', 'Flecha m\u00e1xima \u03b4, momento'],
    ['tensi\u00f3n normal ? a partir', 'tensi\u00f3n normal \u03c3 a partir'],
    ['la seccin y la carga', 'la secci\u00f3n y la carga'],
    ['Metodologa y lmites', 'Metodolog\u00eda y l\u00edmites'],
    ['Teora <strong>Euler-Bernoulli</strong>', 'Teor\u00eda <strong>Euler-Bernoulli</strong>'],
    ['vlido para vigas', 'v\u00e1lido para vigas'],
    ['Tensin <strong>? = M/W</strong>', 'Tensi\u00f3n <strong>\u03c3 = M/W</strong>'],
    ['<strong>? = 1,5V/A</strong>', '<strong>\u03c4 = 1,5V/A</strong>'],
    ['til para bastidores', '\u00fatil para bastidores'],
    ['torsin</a>', 'torsi\u00f3n</a>'],
    ['Unin soldada</a>', 'Uni\u00f3n soldada</a>'],
    ['unin atornillada', 'uni\u00f3n atornillada'],
    ['Vista esquemtica  se actualiza', 'Vista esquem\u00e1tica \u00b7 se actualiza'],
    ['flecha <strong>?</strong>', 'flecha <strong>\u03b4</strong>'],
    ['Seccin transversal', 'Secci\u00f3n transversal'],
    ['Rectangular b  h', 'Rectangular b \u00d7 h'],
    ['Fundicin', 'Fundici\u00f3n'],
    ['Posicin a desde', 'Posici\u00f3n a desde'],
    ['Dimetro d (mm)', 'Di\u00e1metro d (mm)'],
    ['Dimetro exterior', 'Di\u00e1metro exterior'],
    ['Dimetro interior', 'Di\u00e1metro interior'],
    ['Tensin normal m\u00e1xima admisible', 'Tensi\u00f3n normal m\u00e1xima admisible'],
    ['comprobacin de uso', 'comprobaci\u00f3n de uso'],
    ['Cmo ver los resultados', 'C\u00f3mo ver los resultados'],
    ['Tensin</span>', 'Tensi\u00f3n</span>'],
    ['value="N/mm\u00b22"', 'value="Nmm2"'],
    ['data-i18n="beam.optN/mm\u00b22"', 'data-i18n="beam.optNmm2"'],
    ['Transmisin completa?', 'Transmisi\u00f3n completa?'],
    ['mquina accionada ?', 'm\u00e1quina accionada \u2192'],
    ['\u00a1Enlace copiado!!', '\u00a1Enlace copiado!'],
  ];
  for (const [a, b] of rep) s = s.split(a).join(b);

  if (!s.includes('beam.helpBeamTypeHtml')) {
    s = s.replace(
      `<select id="beamType">
                  <option value="simply-supported"`,
      `<select id="beamType">
                  <option value="simply-supported"`,
    );
    s = s.replace(
      `</select>
              </div>
              <div class="lab-field">
                <label for="beamLoadType"`,
      `</select>
                <p class="lab-field-help" data-i18n="beam.helpBeamTypeHtml" data-i18n-html>
                  <strong>Apoyada</strong>: dos apoyos. <strong>Voladizo</strong>: un empotramiento. <strong>Empotrada&ndash;empotrada</strong>: modelo simplificado.
                </p>
              </div>
              <div class="lab-field">
                <label for="beamLoadType"`,
    );
    s = s.replace(
      `</select>
              </div>
              <div class="lab-field">
                <label for="beamSection"`,
      `</select>
                <p class="lab-field-help" data-i18n="beam.helpLoadTypeHtml" data-i18n-html>
                  <strong>F</strong> puntual (N) o <strong>q</strong> distribuida (N/m). Indique posici&oacute;n <strong>a</strong> si aplica.
                </p>
              </div>
              <div class="lab-field">
                <label for="beamSection"`,
    );
    s = s.replace(
      `</select>
              </div>
              <div class="lab-field">
                <label for="beamE"`,
      `</select>
                <p class="lab-field-help" data-i18n="beam.helpSectionHtml" data-i18n-html>
                  Dimensiones en <strong>mm</strong>. Perfil I/T: alma y alas seg&uacute;n cat&aacute;logo o medida propia.
                </p>
              </div>
              <div class="lab-field">
                <label for="beamE"`,
    );
    s = s.replace(
      `<input inputmode="decimal" id="beamSpan" type="number" step="0.001" min="0.001" value="3" />
              </div>`,
      `<input inputmode="decimal" id="beamSpan" type="number" step="0.001" min="0.001" value="3" />
                <p class="lab-field-help" data-i18n="beam.helpSpanHtml" data-i18n-html>
                  Vano <strong>L</strong> entre apoyos (m). En voladizo, longitud libre desde el empotramiento.
                </p>
              </div>`,
    );
  }

  s = s.replace(
    '<details class="lab-results-details lab-results-details--chevron-end lab-results-details--stacked">',
    '<details class="lab-results-details lab-results-details--chevron-end lab-results-details--stacked" open>',
  );

  return s;
}

function fixPscrew(html) {
  let s = html;
  const rep = [
    ['rendimiento ?, autobloqueo', 'rendimiento \u03b7, autobloqueo'],
    ['dimetro d, n\u00famero', 'di\u00e1metro d, n\u00famero'],
    ['fricci\u00f3n ?.', 'fricci\u00f3n \u03bc.'],
    ['friccin ?.', 'fricci\u00f3n \u03bc.'],
    ['modelo clsico', 'modelo cl\u00e1sico'],
    ['til para comparar', '\u00fatil para comparar'],
    ['tan(?  ??)', 'tan(\u03bb \u00b1 \u03c6\u2032)'],
    ['verificacin de tuerca seg\u00fan catlogo', 'verificaci\u00f3n de tuerca seg\u00fan cat\u00e1logo'],
    ['Eje  torsi\u00f3n</a>  dimetro', 'Eje \u00b7 torsi\u00f3n</a> \u2014 di\u00e1metro'],
    ['Rodamientos  L10</a>  apoyos', 'Rodamientos \u00b7 L10</a> \u2014 apoyos'],
    ['Ejemplos tpicos:', 'Ejemplos t\u00edpicos:'],
    ['Coeficiente de friccin', 'Coeficiente de fricci\u00f3n'],
    ['? personalizado', '\u03bc personalizado'],
    ['seg\u00fan ISO 2904. El avance L = n?p', 'seg\u00fan ISO 2904. El avance L = n\u00b7p'],
    ['L = n?p', 'L = n\u00b7p'],
    ['d  d ', 'd\u2082 \u2248 d \u2212 '],
    ['rendimiento ? y', 'rendimiento \u03b7 y'],
    ['friccin ? y', 'fricci\u00f3n \u03bc y'],
    ['aplicaci\u00f3n tpica', 'aplicaci\u00f3n t\u00edpica'],
    ['Elevacin de veh', 'Elevaci\u00f3n de veh'],
  ];
  for (const [a, b] of rep) s = s.split(a).join(b);

  s = s.replace(
    '<details class="lab-results-details lab-results-details--chevron-end lab-results-details--stacked">',
    '<details class="lab-results-details lab-results-details--chevron-end lab-results-details--stacked" open>',
  );

  return s;
}

for (const [file, fn] of [
  ['calc-beam.html', fixBeam],
  ['calc-power-screw.html', fixPscrew],
]) {
  const p = path.join(root, file);
  const out = fn(fs.readFileSync(p, 'utf8'));
  fs.writeFileSync(p, out, 'utf8');
  console.log(file, 'ok', 'delta:', out.includes('\u03b4'), 'eta:', out.includes('\u03b7'));
}
