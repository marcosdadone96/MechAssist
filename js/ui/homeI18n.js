/**
 * Home hub i18n. Spanish non-ASCII uses \\uXXXX escapes so the file is ASCII-safe
 * valid UTF-8 even if the server omits charset on *.js (avoids mojibake).
 */
import { HOME_LANG_CHANGED_EVENT } from '../config/locales.js';

const LS_LANG = 'mdr-home-lang';

const dict = {
  es: {
    'header.tag': 'Transmisi\u00f3n',
    'hero.eyebrow': 'MechAssist',
    'hero.tagline': 'Calculadoras profesionales de Ingenier\u00eda Mec\u00e1nica',
    'hero.expand': 'Ver presentaci\u00f3n',
    'hero.desc1':
      'Dimension\u00e1 engranajes, correas, rodamientos, cilindros hidr\u00e1ulicos, torniller\u00eda y m\u00e1s en segundos.',
    'hero.desc2':
      'Herramientas t\u00e9cnicas confiables basadas en normas, la mayor\u00eda gratuitas.',
    'hero.mockupTitle': 'Calculadora de correas',
    'hero.mockup.url': 'calc-belts \u00b7 vista previa',
    'hero.mockup.live': 'En vivo',
    'hero.mockup.pill': 'ISO / AGMA orientativo',
    'hero.mockup.hint': 'Actualizado al cambiar entradas',
    'hero.mockup.power': 'Potencia',
    'hero.mockup.rpm': 'RPM motriz',
    'hero.mockup.ratio': 'Relaci\u00f3n',
    'hero.mockup.suggested': 'Correa sugerida',
    'hero.mockup.result': 'SPA 1600 + Poleas 112/315',
    'hero.ctaLab': 'Explorar calculadoras gratis',
    'hero.ctaExplore': 'Ver todas las \u00e1reas',
    'zones.title': 'Explora por \u00e1reas',
    'featured.eyebrow': 'M\u00e1s usadas',
    'featured.title': 'Calculadoras destacadas',
    'featured.subtitle':
      'Empieza por estas herramientas para dimensionar transmisi\u00f3n, elementos mec\u00e1nicos y accionamientos en menos de un minuto.',
    'featured.cta': 'Probar ahora',
    'featured.gears.title': 'Engranajes cil\u00edndricos',
    'featured.gears.desc': 'Define relaci\u00f3n y centros en segundos para validar si tu transmisi\u00f3n encaja antes de fabricar.',
    'featured.belts.title': 'Correas',
    'featured.belts.desc': 'Compara V, s\u00edncrona, plana o Poly-V y obt\u00e9n una selecci\u00f3n r\u00e1pida para arrancar tu dise\u00f1o.',
    'featured.chains.title': 'Cadenas y pi\u00f1ones',
    'featured.chains.desc': 'Chequea dientes, paso y riesgo din\u00e1mico para evitar vibraciones y sobredimensionado innecesario.',
    'featured.bearings.title': 'Rodamientos',
    'featured.bearings.desc': 'Selecciona por serie y valida vida \u00fatil esperada para decidir con mayor seguridad desde el inicio.',
    'featured.shaft.title': 'Eje \u00b7 torsi\u00f3n',
    'featured.shaft.desc': 'Calcula di\u00e1metro m\u00ednimo y comprueba viabilidad para evitar fallos tempranos por subdimensionado.',
    'featured.spring.title': 'Muelle helicoidal',
    'featured.spring.desc': 'Obt\u00e9n rigidez y carrera \u00fatil r\u00e1pidamente para pasar de idea a especificaci\u00f3n sin perder tiempo.',
    'featured.bolts.title': 'Torniller\u00eda ISO 898-1',
    'featured.bolts.desc': 'Define par de apriete y precarga con criterio pr\u00e1ctico para montaje confiable y repetible.',
    'featured.iso.title': 'Ajustes ISO 286',
    'featured.iso.desc': 'Elige ajuste correcto en minutos y evita retrabajos por holguras o interferencias mal definidas.',
    'hero.tier':
      'Gratis: acceso amplio al n\u00facleo de calculadoras y modelos de m\u00e1quinas base. Pro: funciones extendidas por m\u00f3dulo (p. ej. lienzo t\u00e9cnico multieje, exportaciones o flujos premium, seg\u00fan disponibilidad).',
    'zone.machines': 'M\u00e1quinas',
    'zone.machinesIntro':
      'Bombas y transporte de materiales con c\u00e1lculo r\u00e1pido para dise\u00f1o y validaci\u00f3n.',
    'zone.lab': 'Laboratorio',
    'zone.labIntro':
      'Transmisi\u00f3n mec\u00e1nica esencial para pasar de idea a dimensionado en minutos.',
    'zone.fluids': 'Hidr\u00e1ulica y neum\u00e1tica',
    'zone.fluidsIntro':
      'Hidr\u00e1ulica y neum\u00e1tica para estimar fuerza, caudal y tiempos de forma confiable.',
    'fluids.pump': 'Bomba hidr\u00e1ulica',
    'fluids.pumpMeta': 'Curva, potencia y selecci\u00f3n',
    'fluids.compressor': 'Compresor neum\u00e1tico',
    'fluids.compressorMeta': 'Calculadora pr\u00f3xima',
    'fluids.cylinder': 'Cilindro neum\u00e1tico',
    'fluids.cylinderMeta': 'Fuerza, caudal y tiempos',
    'fluids.hydraulicCylinder': 'Cilindro hidr\u00e1ulico',
    'fluids.hydraulicUnit': 'Unidad hidr\u00e1ulica',
    'fluids.hydraulicUnitMeta': 'Dep\u00f3sito, bomba y p\u00e9rdidas',
    'fluids.valves': 'V\u00e1lvulas',
    'fluids.more': 'M\u00e1s fluidos',
    'fluids.press': 'Prensa hidr\u00e1ulica',
    'machine.pump': 'Bomba',
    'machine.extruder': 'Extrusor',
    'machine.flatConveyor': 'Cinta plana',
    'machine.rollerConveyor': 'Rodillos',
    'machine.carLift': 'Elevador coches',
    'machine.bucketElevator': 'Elev. cangilones',
    'machine.screwConveyor': 'Tornillo',
    'machine.fan': 'Ventilador',
    'machine.tractionElevator': 'Ascensor',
    'machine.inclinedConveyor': 'Cinta inclinada',
    'lab.index': '\u00cdndice',
    'lab.canvasPro': 'Lienzo Pro',
    'lab.gears': 'Engranajes',
    'lab.belts': 'Correas',
    'lab.chains': 'Cadenas',
    'lab.bearings': 'Rodamientos',
    'lab.shaft': 'Eje',
    'lab.more': 'M\u00e1s',
    'aria.langSelector': 'Selector de idioma',
    'aria.heroMockup': 'Vista previa de calculadora',
    'aria.machineSystems': 'Sistemas disponibles',
    'aria.transmissionCalcs': 'Calculadoras de transmisi\u00f3n',
    'aria.fluidCalcs': 'Calculadoras de hidr\u00e1ulica y neum\u00e1tica',
    'aria.machinesHub': 'Abrir listado de m\u00e1quinas y transporte',
    'aria.labHub': 'Abrir laboratorio de transmisi\u00f3n y calculadoras',
    'aria.fluidsHub': 'Abrir listado de hidr\u00e1ulica y neum\u00e1tica',
    footnote: 'Verde = activo \u00b7 Cintas: Gratis o Pro seg\u00fan el m\u00f3dulo',
    badgePro: 'ACCESO PRO',
    badgeFree: 'GRATIS',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'T\u00e9rminos',
    'footer.cookies': 'Cookies',
    'footer.cookiePrefs': 'Preferencias cookies',
  },
  en: {
    'header.tag': 'Power Transmission',
    'hero.eyebrow': 'MechAssist',
    'hero.tagline': 'Professional calculators for mechanical engineering',
    'hero.expand': 'View presentation',
    'hero.desc1':
      'Size gears, belts, bearings, hydraulic cylinders, bolting, and more in seconds.',
    'hero.desc2':
      'Reliable technical tools grounded in standards, most of them free.',
    'hero.mockupTitle': 'Belt calculator',
    'hero.mockup.url': 'calc-belts \u00b7 preview',
    'hero.mockup.live': 'Live',
    'hero.mockup.pill': 'ISO / AGMA (indicative)',
    'hero.mockup.hint': 'Updates as inputs change',
    'hero.mockup.power': 'Power',
    'hero.mockup.rpm': 'Driver RPM',
    'hero.mockup.ratio': 'Ratio',
    'hero.mockup.suggested': 'Suggested belt',
    'hero.mockup.result': 'SPA 1600 + Pulleys 112/315',
    'hero.ctaLab': 'Explore free calculators',
    'hero.ctaExplore': 'Browse all areas',
    'zones.title': 'Explore by area',
    'featured.eyebrow': 'Most used',
    'featured.title': 'Featured calculators',
    'featured.subtitle':
      'Start with these tools to size transmission, mechanical elements and drives in under a minute.',
    'featured.cta': 'Try now',
    'featured.gears.title': 'Spur gears',
    'featured.gears.desc': 'Set ratio and center distance in seconds to confirm fit before manufacturing.',
    'featured.belts.title': 'Belts',
    'featured.belts.desc': 'Compare V, synchronous, flat and Poly-V options to start with a practical selection.',
    'featured.chains.title': 'Chains and sprockets',
    'featured.chains.desc': 'Check teeth, pitch and dynamic risk early to avoid vibration issues and oversizing.',
    'featured.bearings.title': 'Bearings',
    'featured.bearings.desc': 'Pick by series and validate expected life so you can decide with confidence.',
    'featured.shaft.title': 'Shaft · torsion',
    'featured.shaft.desc': 'Get minimum diameter and a quick viability check to reduce underdesign risk.',
    'featured.spring.title': 'Helical spring',
    'featured.spring.desc': 'Estimate stiffness and working stroke quickly to move from concept to spec.',
    'featured.bolts.title': 'Bolting ISO 898-1',
    'featured.bolts.desc': 'Set tightening torque and preload with practical guidance for reliable assembly.',
    'featured.iso.title': 'ISO 286 fits',
    'featured.iso.desc': 'Select the right fit in minutes and avoid rework from poor tolerance choices.',
    'hero.tier':
      'Free: broad access to core calculators and base machine models. Pro: extended features per module (e.g. multi-shaft technical canvas, exports or premium flows, where available).',
    'zone.machines': 'Machines',
    'zone.machinesIntro':
      'Pumps and material handling tools for quick sizing and practical checks.',
    'zone.lab': 'Laboratory',
    'zone.labIntro':
      'Core power transmission calculators to go from concept to sizing in minutes.',
    'zone.fluids': 'Hydraulics and pneumatics',
    'zone.fluidsIntro':
      'Hydraulic and pneumatic tools to estimate force, flow and cycle timing with confidence.',
    'fluids.pump': 'Hydraulic pump',
    'fluids.pumpMeta': 'Curve, power and selection',
    'fluids.compressor': 'Pneumatic compressor',
    'fluids.compressorMeta': 'Calculator coming soon',
    'fluids.cylinder': 'Pneumatic cylinder',
    'fluids.cylinderMeta': 'Force, flow and timing',
    'fluids.hydraulicCylinder': 'Hydraulic cylinder',
    'fluids.hydraulicUnit': 'Hydraulic unit',
    'fluids.hydraulicUnitMeta': 'Tank, pump and losses',
    'fluids.valves': 'Valves',
    'fluids.more': 'More fluids',
    'fluids.press': 'Hydraulic press',
    'machine.pump': 'Pump',
    'machine.extruder': 'Extruder',
    'machine.flatConveyor': 'Flat conveyor',
    'machine.rollerConveyor': 'Roller conveyor',
    'machine.carLift': 'Car lift',
    'machine.bucketElevator': 'Bucket elevator',
    'machine.screwConveyor': 'Screw conveyor',
    'machine.fan': 'Fan',
    'machine.tractionElevator': 'Elevator',
    'machine.inclinedConveyor': 'Inclined conveyor',
    'lab.index': 'Index',
    'lab.canvasPro': 'Pro canvas',
    'lab.gears': 'Gears',
    'lab.belts': 'Belts',
    'lab.chains': 'Chains',
    'lab.bearings': 'Bearings',
    'lab.shaft': 'Shaft',
    'lab.more': 'More',
    'aria.langSelector': 'Language selector',
    'aria.heroMockup': 'Calculator preview',
    'aria.machineSystems': 'Available systems',
    'aria.transmissionCalcs': 'Power transmission calculators',
    'aria.fluidCalcs': 'Hydraulic and pneumatic calculators',
    'aria.machinesHub': 'Open machine and bulk-handling calculators',
    'aria.labHub': 'Open transmission lab and calculators',
    'aria.fluidsHub': 'Open hydraulic and pneumatic calculators',
    footnote:
      'Legend: green = active calculator. Free tier covers most of the lab; Pro adds advanced capabilities on selected modules (including some conveyor models depending on configuration).',
    badgePro: 'PRO ACCESS',
    badgeFree: 'FREE',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.cookies': 'Cookies',
    'footer.cookiePrefs': 'Cookie settings',
  },
};

function currentLang() {
  try {
    const saved = localStorage.getItem(LS_LANG);
    if (saved === 'en' || saved === 'es') return saved;
  } catch (_) {
    /* ignore */
  }
  return 'es';
}

function setLang(lang) {
  const l = lang === 'en' ? 'en' : 'es';
  try {
    localStorage.setItem(LS_LANG, l);
  } catch (_) {
    /* ignore */
  }
  document.documentElement.setAttribute('lang', l);
  const table = dict[l];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const txt = table[key];
    if (!txt) return;
    const attr = el.getAttribute('data-i18n-attr');
    if (attr) {
      el.setAttribute(attr, txt);
    } else {
      el.textContent = txt;
    }
  });
  document.querySelectorAll('.hub-lang__btn[data-lang]').forEach((btn) => {
    const on = btn.getAttribute('data-lang') === l;
    btn.classList.toggle('hub-lang__btn--active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  window.__homeLang = l;
  window.__t = (k) => dict[l][k] || k;
  window.dispatchEvent(new CustomEvent('home-language-changed', { detail: { lang: l } }));
  window.dispatchEvent(new CustomEvent(HOME_LANG_CHANGED_EVENT, { detail: { lang: l } }));
}

document.querySelectorAll('.hub-lang__btn[data-lang]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const l = btn.getAttribute('data-lang');
    setLang(l === 'en' ? 'en' : 'es');
  });
});

setLang(currentLang());
