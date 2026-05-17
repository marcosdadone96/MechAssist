/**
 * Static ES/EN for calc-hydraulic-press.html (labels, selects, blocks).
 */
import { getCurrentLang } from '../config/locales.js';

/** @param {'es'|'en'} lang */
export function applyHydraulicPressStaticI18n(lang = getCurrentLang()) {
  const en = lang === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? 'Hydraulic press \u2014 TheMechAssist' : 'Prensa hidr\u00e1ulica \u2014 TheMechAssist';
  if (!en) return;

  const map = {
    'Contexto ampliado y notas de uso': 'Expanded context and usage notes',
    'Calcula el di\u00e1metro de pist\u00f3n, caudal de bomba, potencia motriz y chequeo b\u00e1sico de columnas para una prensa de 2 o 4 columnas con criterio de productividad.':
      'Computes piston bore, pump flow, motor power and basic column checks for a 2- or 4-column press with productivity criteria.',
    'Pandeo Euler y ciclos son simplificados; no modela flexi\u00f3n del bastidor ni excentricidad de carga en el plato. No sustituye c\u00e1lculo estructural ni norma de prensas certificadas.':
      'Euler buckling and cycles are simplified; frame flexure and load eccentricity on the platen are not modeled. Does not replace structural design or certified press codes.',
    'Se muestra aplicaci\u00f3n de presi\u00f3n sobre el plato m\u00f3vil y trayectoria de prensado.':
      'Shows pressure on the moving platen and pressing path.',
    'Nivel de detalle memoria': 'Memory detail level',
    'Aula (b\u00e1sico)': 'Classroom (basic)',
    'Proyecto (detallado + pandeo columnas)': 'Project (detailed + column buckling)',
    'F\u00f3rmulas y campos extra': 'Extra formulas and fields',
    'Proyecto activa pandeo Euler en columnas (longitud libre + K) y ampl\u00eda la memoria de c\u00e1lculo y el PDF.':
      'Project enables Euler buckling on columns (free length + K) and expands calculation memory and PDF.',
    'Columnas \u2014 pandeo (Euler)': 'Columns \u2014 buckling (Euler)',
    'Longitud libre columna L (mm)': 'Column free length L (mm)',
    'Entre gu\u00edas / longitud no arriostrada': 'Between guides / unbraced length',
    'Coeficiente K (longitud efectiva)': 'K factor (effective length)',
    '0,5 \u2014 empotrado-libre': '0.5 \u2014 fixed-free',
    '0,7 \u2014 recomendado conservador': '0.7 \u2014 conservative default',
    '1,0 \u2014 bi-articulado': '1.0 \u2014 pinned-pinned',
    '1,4 \u2014 un extremo empotrado': '1.4 \u2014 one end fixed',
    '2,0 \u2014 libre-libre guiado': '2.0 \u2014 guided free-free',
    'M\u00f3dulo E columnas (GPa)': 'Column modulus E (GPa)',
    'Acero t\u00edpico 200\u2013210': 'Typical steel 200\u2013210',
    '\u00bfQu\u00e9 quieres calcular?': 'What do you want to calculate?',
    'Dise\u00f1ar nueva m\u00e1quina': 'Design new machine',
    'Diagnosticar m\u00e1quina existente': 'Diagnose existing machine',
    'Cambia el flujo de c\u00e1lculo': 'Changes calculation flow',
    'Dise\u00f1o: fuerza objetivo \u2192 se sugiere di\u00e1metro/presi\u00f3n. Diagn\u00f3stico: di\u00e1metro + presi\u00f3n \u2192 tonelaje real.':
      'Design: target force \u2192 suggested bore/pressure. Diagnostic: bore + pressure \u2192 real tonnage.',
    'Carga de trabajo objetivo': 'Target working load',
    'Di\u00e1metro pist\u00f3n existente (mm)': 'Existing piston diameter (mm)',
    'Dato real de m\u00e1quina instalada': 'Installed machine data',
    'En diagn\u00f3stico se usa junto con la presi\u00f3n para calcular la fuerza/tonelaje real disponible.':
      'In diagnostic mode, used with pressure to compute available real force/tonnage.',
    'L\u00edmite hidr\u00e1ulico nominal': 'Nominal hydraulic limit',
    'Influye en tiempo, caudal y volumen total desplazado.': 'Affects time, flow and total displaced volume.',
    'Recorrido \u00fatil vertical': 'Useful vertical stroke',
    'Objetivo de productividad': 'Productivity target',
    'Factor velocidad aproximaci\u00f3n': 'Approach speed factor',
    'Aproximaci\u00f3n m\u00e1s r\u00e1pida que prensado': 'Faster approach than pressing',
    'Caudal de bomba actual (L/min)': 'Current pump flow (L/min)',
    'Para comparar contra requerido': 'Compare against required',
    'Si es insuficiente, el asesor sugiere el caudal m\u00ednimo necesario.':
      'If insufficient, the advisor suggests minimum required flow.',
    'N\u00famero de columnas': 'Number of columns',
    '4 columnas': '4 columns',
    '2 columnas': '2 columns',
    'Modelo estructural simplificado': 'Simplified structural model',
    'Se reparte carga por columna para estimar di\u00e1metro m\u00ednimo el\u00e1stico.':
      'Load is split per column to estimate minimum elastic diameter.',
    'Tensi\u00f3n admisible columna (MPa)': 'Allowable column stress (MPa)',
    'Depende del acero y factor de dise\u00f1o': 'Depends on steel and design factor',
    'Valor conservador para chequeo b\u00e1sico de secci\u00f3n en columnas.':
      'Conservative value for basic column section check.',
    'Di\u00e1metro de columna disponible (mm)': 'Available column diameter (mm)',
    'Opcional': 'Optional',
    'Si lo indica, se compara con el m\u00ednimo calculado': 'If provided, compared to calculated minimum',
    'Di\u00e1metro real de columnas (mm)': 'Actual column diameter (mm)',
    'Para veredicto estructural en diagn\u00f3stico': 'For structural verdict in diagnostic mode',
    'Memoria de c\u00e1culo, f\u00f3rmulas y supuestos': 'Calculation memory, formulas and assumptions',
    'SISTEMA APTO': 'SYSTEM SUITABLE',
    Aplicaci\u00f3n: 'Application',
    'Tonelaje t\u00edpico': 'Typical tonnage',
    'Factor velocidad aproximaci\u00f3n': 'Approach speed factor',
    'Relaci\u00f3n entre la velocidad de bajada en vac\u00edo y la velocidad de prensado bajo carga. Valores mayores mejoran productividad, pero exigen m\u00e1s caudal instant\u00e1neo y m\u00e1s potencia hidr\u00e1ulica.':
      'Ratio of idle descent speed to speed under pressing load. Higher values improve productivity but need more instantaneous flow and hydraulic power.',
    'Verificaci\u00f3n adicional frente al di\u00e1metro m\u00ednimo orientativo por tensi\u00f3n axial (\u00d71,2).':
      'Additional check against indicative minimum diameter for axial stress (\u00d71.2).',
    'Permite estimar el m\u00e1ximo tonelaje soportado por sus columnas actuales antes de deformaci\u00f3n el\u00e1stica.':
      'Estimates maximum tonnage your current columns support before elastic deformation.',
    'Embutici\u00f3n chapa fina (< 2 mm)': 'Thin sheet drawing (< 2 mm)',
    'Conformado / estampaci\u00f3n media': 'Medium forming / stamping',
    'Forja en fr\u00edo / sinterizado': 'Cold forging / sintering',
    'Forja en caliente / grandes piezas': 'Hot forging / large parts',
    '10 \u2013 50 t': '10 \u2013 50 t',
    '50 \u2013 200 t': '50 \u2013 200 t',
    '200 \u2013 500 t': '200 \u2013 500 t',
    '500 \u2013 2000 t': '500 \u2013 2000 t',
    'Tonelajes t\u00edpicos por aplicaci\u00f3n industrial': 'Typical tonnage by industrial application',
    'SISTEMA APTO': 'SYSTEM SUITABLE',
    'CONFIGURACI\u00d3N EQUILIBRADA \u2014 Productividad y coste de potencia en rango razonable.':
      'BALANCED CONFIGURATION \u2014 Productivity and power cost in a reasonable range.',
    'CONFIGURACI\u00d3N AJUSTABLE \u2014 Revise caudal de bomba, presi\u00f3n de trabajo y potencia instalada para equilibrar productividad frente a coste.':
      'TUNABLE CONFIGURATION \u2014 Review pump flow, working pressure and installed power to balance productivity vs. cost.',
  };

  document.querySelectorAll(
    'label, span.hint, p.lab-field-help, p.lab-diagram-caption, p.hpp-k-note, option, summary, #hppVerdict',
  ).forEach((el) => {
    const raw = (el.textContent || '').trim();
    if (map[raw]) el.textContent = map[raw];
  });

  const helpLead = document.querySelector('.lab-calc-help .lab-lead--in-help');
  if (helpLead) {
    helpLead.innerHTML =
      'Computes piston bore, pump flow, motor power and basic column checks for a 2- or 4-column press with productivity criteria. '
      + '<strong>Euler buckling and cycles are simplified</strong>; frame flexure and load eccentricity on the platen are not modeled. '
      + 'Does not replace structural design or certified press codes.';
  }

  const kNote = document.querySelector('.hpp-k-note');
  if (kNote) {
    kNote.innerHTML =
      'For industrial presses with guided columns at both ends, use <strong>K = 0.7</strong> (conservative default). '
      + '<strong>K = 0.5</strong> only if fixed-end support is guaranteed in construction.';
  }
}

export function applyHydraulicPressPageLanguage() {
  applyHydraulicPressStaticI18n(getCurrentLang());
}
