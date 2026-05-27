/**
 * Add hcCalcMode / hppCalcMode selectors with dynamic help (UTF-8 safe).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function patchCylinder() {
  const p = path.join(root, 'calc-hydraulic-cylinder.html');
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('id="hcCalcMode"')) {
    console.log('calc-hydraulic-cylinder.html: hcCalcMode already present');
    return;
  }

  const insertAfter = '<div class="lab-grid lab-grid--2">';
  const block = `<div class="lab-grid lab-grid--2">
              <div class="lab-field lab-field--wide">
                <label for="hcCalcMode" data-i18n="hydCyl.labelCalcMode">Modo de trabajo</label>
                <select id="hcCalcMode">
                  <option value="diagnostic" selected data-i18n="hydCyl.optDiagnostic">Diagn\u00f3stico \u2014 cilindro instalado \u2192 comprobar fuerza y pandeo</option>
                  <option value="design" data-i18n="hydCyl.optDesign">Dise\u00f1o \u2014 fuerza requerida \u2192 calcular di\u00e1metro m\u00ednimo</option>
                </select>
                <div class="lab-field-help lab-field-help--hc-modes" id="hcCalcModeHelp">
                  <p class="hc-calc-mode-help__line hc-calc-mode-help__line--active" data-hc-mode="diagnostic" data-i18n="hydCyl.helpCalcModeDiagnosticHtml" data-i18n-html><strong>Diagn\u00f3stico:</strong> introduce di\u00e1metro de pist\u00f3n, v\u00e1stago, presi\u00f3n y carga \u2192 comprueba fuerza disponible, pandeo Euler y espesor de tubo.</p>
                  <p class="hc-calc-mode-help__line" data-hc-mode="design" data-i18n="hydCyl.helpCalcModeDesignHtml" data-i18n-html><strong>Dise\u00f1o:</strong> fuerza requerida y presi\u00f3n de trabajo \u2192 obtienes el di\u00e1metro m\u00ednimo de pist\u00f3n recomendado (serie ISO) y el resto de comprobaciones.</p>
                </div>
              </div>`;

  if (!s.includes(insertAfter)) {
    console.error('calc-hydraulic-cylinder.html: grid marker not found');
    process.exit(1);
  }
  s = s.replace(insertAfter, block);

  const oldMode = `              <div class="lab-field lab-field--wide">
                <label for="hcMode" data-i18n="hydCyl.labelMode">¿Qué quieres calcular?</label>
                <select id="hcMode">
                  <option value="design" selected data-i18n="hydCyl.optDesign">Diseñar nueva máquina</option>
                  <option value="diagnostic" data-i18n="hydCyl.optDiagnostic">Diagnosticar máquina existente</option>
                </select>
                <span class="hint" data-i18n="hydCyl.hintMode">Diseño o flujo inverso</span>
                <p class="lab-field-help" data-i18n="hydCyl.helpMode">Diseño: carga objetivo y dimensionado. Diagnóstico: presión y diámetro reales para obtener fuerza/tonelaje disponible.</p>
              </div>
`;
  const oldModeAlt = oldMode
    .replace(/Diseñar/g, 'Dise\u00f1ar')
    .replace(/Diagnóstico/g, 'Diagn\u00f3stico')
    .replace(/Diagnóstico/g, 'Diagn\u00f3stico');
  if (s.includes(oldMode)) s = s.replace(oldMode, '');
  else if (s.includes(oldModeAlt)) s = s.replace(oldModeAlt, '');
  else {
    const re = /\s*<div class="lab-field lab-field--wide">\s*<label for="hcMode"[\s\S]*?<\/div>\s*\n/;
    if (!re.test(s)) {
      console.error('calc-hydraulic-cylinder.html: hcMode block not found');
      process.exit(1);
    }
    s = s.replace(re, '\n');
  }

  fs.writeFileSync(p, s, 'utf8');
  console.log('patched calc-hydraulic-cylinder.html');
}

function patchPress() {
  const p = path.join(root, 'calc-hydraulic-press.html');
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('id="hppCalcMode"')) {
    console.log('calc-hydraulic-press.html: hppCalcMode already present');
    return;
  }

  const insertAfter = '<div class="lab-grid lab-grid--2">';
  const block = `<div class="lab-grid lab-grid--2">
              <div class="lab-field lab-field--wide">
                <label for="hppCalcMode" data-i18n="hpress.labelCalcMode">Modo de trabajo</label>
                <select id="hppCalcMode">
                  <option value="diagnostic" data-i18n="hpress.optDiagnostic">Diagn\u00f3stico \u2014 prensa instalada \u2192 tonelaje real disponible</option>
                  <option value="design" selected data-i18n="hpress.optDesign">Dise\u00f1o \u2014 tonelaje requerido \u2192 di\u00e1metro de cilindro y bomba</option>
                </select>
                <div class="lab-field-help lab-field-help--hpress-modes" id="hppCalcModeHelp">
                  <p class="hpp-calc-mode-help__line" data-hpress-mode="diagnostic" data-i18n="hpress.helpCalcModeDiagnosticHtml" data-i18n-html><strong>Diagn\u00f3stico:</strong> di\u00e1metro de pist\u00f3n y presi\u00f3n reales \u2192 fuerza/tonelaje disponible y comprobaci\u00f3n de columnas.</p>
                  <p class="hpp-calc-mode-help__line hpp-calc-mode-help__line--active" data-hpress-mode="design" data-i18n="hpress.helpCalcModeDesignHtml" data-i18n-html><strong>Dise\u00f1o:</strong> tonelaje objetivo y tiempo de ciclo \u2192 di\u00e1metro de pist\u00f3n ISO, caudal de bomba y potencia de motor orientativos.</p>
                </div>
              </div>`;

  if (!s.includes(insertAfter)) {
    console.error('calc-hydraulic-press.html: grid marker not found');
    process.exit(1);
  }
  s = s.replace(insertAfter, block);

  const re = /\s*<div class="lab-field lab-field--wide">\s*<label for="hppMode"[\s\S]*?<\/div>\s*\n/;
  if (!re.test(s)) {
    console.error('calc-hydraulic-press.html: hppMode block not found');
    process.exit(1);
  }
  s = s.replace(re, '\n');

  fs.writeFileSync(p, s, 'utf8');
  console.log('patched calc-hydraulic-press.html');
}

patchCylinder();
patchPress();
