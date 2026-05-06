/**
 * Home hub i18n. Spanish non-ASCII uses \\uXXXX escapes so the file is ASCII-safe
 * valid UTF-8 even if the server omits charset on *.js (avoids mojibake).
 */
import { HOME_LANG_CHANGED_EVENT } from '../config/locales.js';

const LS_LANG = 'mdr-home-lang';

const dict = {
  es: {
    'header.tag': 'Transmisi\u00f3n',
    'hero.eyebrow': 'Para taller y oficina t\u00e9cnica',
    'hero.tagline': 'Calculadoras profesionales de Ingenier\u00eda Mec\u00e1nica',
    'hero.expand': 'Ver presentaci\u00f3n',
    'hero.desc1':
      'Dimension\u00e1 engranajes, correas, rodamientos, cilindros hidr\u00e1ulicos, torniller\u00eda y m\u00e1s en segundos.',
    'hero.desc2':
      'Herramientas t\u00e9cnicas confiables basadas en normas, la mayor\u00eda gratuitas.',
    'hero.mockupTitle': 'Calculadora de correas',
    'hero.mockup.url': 'mechassist.app/calc-belts',
    'hero.mockup.live': 'En vivo',
    'hero.mockup.pill': 'ISO / AGMA orientativo',
    'hero.mockup.hint': 'Actualizado al cambiar entradas',
    'hero.mockup.power': 'Potencia',
    'hero.mockup.rpm': 'RPM motriz',
    'hero.mockup.ratio': 'Relaci\u00f3n',
    'hero.mockup.suggested': 'Correa sugerida',
    'hero.mockup.result': 'SPA 1600 + Poleas 112/315',
    'hero.mockup.tabInputs': 'Entradas',
    'hero.mockup.tabResults': 'Resultados',
    'hero.mockup.tabNorm': 'Norma',
    'hero.mockup.service': 'Factor servicio',
    'hero.mockup.diagramTitle': 'Esquema \u00b7 polea motriz / conducida',
    'hero.mockup.svgCaption': 'Vista orientativa \u00b7 no escala',
    'hero.mockup.kpiTorque': 'Par eje',
    'hero.mockup.kpiBelt': 'Vel. correa',
    'hero.mockup.kpiSafety': 'Margen',
    'hero.mockup.kpiOk': 'OK',
    'zones.subtitle': 'Tres entradas al cat\u00e1logo: elija su disciplina y abra calculadoras listas para usar.',
    'hero.ctaLab': 'Explorar calculadoras gratis',
    'hero.ctaExplore': 'Ver todas las \u00e1reas',
    'zones.title': 'Explora por \u00e1reas',
    'featured.eyebrow': 'M\u00e1s usadas',
    'featured.title': 'Calculadoras destacadas',
    'featured.subtitle':
      'Ocho atajos probados en obra: resultados claros, sin hojas de c\u00e1lculo interminables.',
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
      'Gratis: calculadoras b\u00e1sicas de transmisi\u00f3n, ISO, torniller\u00eda y la mayor\u00eda de m\u00e1quinas fluidos. Pro: PDF/Excel, proyectos guardados, historial sin l\u00edmites diarios, lienzo multieje y calculadoras premium se\u00f1aladas con badge.',
    'nav.plans': 'Planes',
    'zone.machines': 'M\u00e1quinas',
    'zone.machinesIntro':
      'Transporte, elevaci\u00f3n y bombas: potencias y fuerzas para validar concepto antes del detalle CAD.',
    'zone.machines.peek': 'Cinta plana \u00b7 Rodillos (gratis) \u00b7 resto Pro',
    'zone.lab.peek': 'Engranajes \u00b7 Correas \u00b7 Rodamientos \u00b7 ISO',
    'zone.fluids.peek': 'Bombas \u00b7 Cilindros \u00b7 Prensa \u00b7 Neum\u00e1tica',
    'zone.lab': 'Laboratorio',
    'zone.labIntro':
      'Engranajes, correas, rodamientos y tolerancias: el n\u00facleo de transmisi\u00f3n con criterio de norma y salida lista para informe.',
    'zone.fluids': 'Hidr\u00e1ulica y neum\u00e1tica',
    'zone.fluidsIntro':
      'Cilindros, bombas y prensas: fuerza \u00fatil, secciones y tiempos de ciclo para cerrar el esquema del circuito.',
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
    footnote:
      'Badges: GRATIS (verde) = calculadora incluida en el plan gratuito; PRO (violeta) = requiere suscripci\u00f3n Pro. Pol\u00edtica sujeta a cambios antes del checkout.',
    badgePro: 'PRO',
    badgeFree: 'GRATIS',
    'pricing.title': 'Elige tu plan',
    'pricing.lead': 'Empiece en minutos con el plan gratuito; pase a Pro cuando necesite informes y m\u00f3dulos premium.',
    'pricing.free.name': 'Gratuito',
    'pricing.free.price': '$0',
    'pricing.free.hint': 'Sin tarjeta \u00b7 para siempre',
    'pricing.free.tagline': 'N\u00facleo amplio de calculadoras listas para dimensionar hoy.',
    'pricing.free.b1': 'Laboratorio de transmisi\u00f3n y calculadoras ISO / torniller\u00eda',
    'pricing.free.b2': 'Cinta plana, inclinada y rodillos sin l\u00edmite en m\u00f3dulos abiertos',
    'pricing.free.b3': 'Actualizaciones del n\u00facleo gratuito sin coste',
    'pricing.free.b4': 'Ideal para presupuestos r\u00e1pidos, aulas y mantenimiento',
    'pricing.free.cta': 'Empezar gratis',
    'pricing.pro.ribbon': 'M\u00e1s popular',
    'pricing.pro.name': 'Pro',
    'pricing.pro.priceFull': '$9/mes o $79/a\u00f1o (ahorr\u00e1 27%)',
    'pricing.pro.tagline': 'Para equipos de planta, informes y m\u00f3dulos avanzados.',
    'pricing.pro.b1': 'Todo el cat\u00e1logo, incluidos m\u00f3dulos Pro y lienzo multieje',
    'pricing.pro.b2': 'Exporte hojas y memorias a PDF / Excel con su marca',
    'pricing.pro.b3': 'Guarde configuraciones y vuelva a cargarlas en un clic',
    'pricing.pro.b4': 'Sin topes de uso en funciones incluidas en su plan',
    'pricing.pro.b5': 'Soporte prioritario y anticipo de nuevas calculadoras',
    'pricing.pro.b6': 'Flujo de trabajo pensado para oficina t\u00e9cnica y obra',
    'pricing.pro.cta': 'Empezar con Pro',
    'pricing.footnote':
      'Precios orientativos en USD. El cobro definitivo se confirmar\u00e1 antes del lanzamiento del checkout.',
    'auth.login': 'Iniciar sesi\u00f3n',
    'auth.register': 'Registrarse',
    'auth.logout': 'Cerrar sesi\u00f3n',
    'auth.close': 'Cerrar',
    'auth.headline': 'Tu cuenta MechAssist',
    'auth.sub':
      'El registro completo llegar\u00e1 en breve. Esta vista adelanta el flujo para alinear dise\u00f1o y mensajes.',
    'auth.tabLogin': 'Iniciar sesi\u00f3n',
    'auth.tabRegister': 'Registrarse',
    'auth.email': 'Correo',
    'auth.emailPh': 'ingeniero@empresa.com',
    'auth.password': 'Contrase\u00f1a',
    'auth.name': 'Nombre',
    'auth.submitLogin': 'Entrar',
    'auth.submitRegister': 'Crear cuenta',
    'auth.backendNote': 'Backend pendiente: estos botones no env\u00edan datos todav\u00eda.',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'T\u00e9rminos',
    'footer.cookies': 'Cookies',
    'footer.cookiePrefs': 'Preferencias cookies',
  },
  en: {
    'header.tag': 'Power Transmission',
    'hero.eyebrow': 'For shop floor and design office',
    'hero.tagline': 'Professional calculators for mechanical engineering',
    'hero.expand': 'View presentation',
    'hero.desc1':
      'Size gears, belts, bearings, hydraulic cylinders, bolting, and more in seconds.',
    'hero.desc2':
      'Reliable, standards-grounded technical tools \u2014 most of them free.',
    'hero.mockupTitle': 'Belt calculator',
    'hero.mockup.url': 'mechassist.app/calc-belts',
    'hero.mockup.live': 'Live',
    'hero.mockup.pill': 'ISO / AGMA (indicative)',
    'hero.mockup.hint': 'Updates as inputs change',
    'hero.mockup.power': 'Power',
    'hero.mockup.rpm': 'Driver RPM',
    'hero.mockup.ratio': 'Ratio',
    'hero.mockup.suggested': 'Suggested belt',
    'hero.mockup.result': 'SPA 1600 + Pulleys 112/315',
    'hero.mockup.tabInputs': 'Inputs',
    'hero.mockup.tabResults': 'Results',
    'hero.mockup.tabNorm': 'Standard',
    'hero.mockup.service': 'Service factor',
    'hero.mockup.diagramTitle': 'Diagram \u00b7 driver / driven pulley',
    'hero.mockup.svgCaption': 'Illustrative view \u00b7 not to scale',
    'hero.mockup.kpiTorque': 'Shaft torque',
    'hero.mockup.kpiBelt': 'Belt speed',
    'hero.mockup.kpiSafety': 'Margin',
    'hero.mockup.kpiOk': 'OK',
    'zones.subtitle': 'Three entry points: pick your discipline and open calculators that are ready to run.',
    'hero.ctaLab': 'Explore free calculators',
    'hero.ctaExplore': 'Browse all areas',
    'zones.title': 'Explore by area',
    'featured.eyebrow': 'Most used',
    'featured.title': 'Featured calculators',
    'featured.subtitle':
      'Eight proven shortcuts: clear outputs without endless spreadsheets.',
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
      'Free: basic transmission, ISO fits, bolting and most machine/fluid models. Pro: PDF/Excel, saved projects, unlimited daily use where included, multi-shaft canvas and premium calculators marked with a badge.',
    'nav.plans': 'Plans',
    'zone.machines': 'Machines',
    'zone.machinesIntro':
      'Conveying, lifting and pumps: powers and forces to validate a concept before deep CAD work.',
    'zone.machines.peek': 'Flat belt \u00b7 Rollers (free) \u00b7 rest Pro',
    'zone.lab.peek': 'Gears \u00b7 Belts \u00b7 Bearings \u00b7 ISO',
    'zone.fluids.peek': 'Pumps \u00b7 Cylinders \u00b7 Press \u00b7 Pneumatics',
    'zone.lab': 'Laboratory',
    'zone.labIntro':
      'Gears, belts, bearings and tolerances: transmission essentials with standards-based checks and report-ready outputs.',
    'zone.fluids': 'Hydraulics and pneumatics',
    'zone.fluidsIntro':
      'Cylinders, pumps and presses: usable force, areas and cycle times to close the hydraulic or pneumatic sketch.',
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
      'Badges: FREE (green) = included on the free plan; PRO (violet) = requires Pro. Policy may change before checkout.',
    badgePro: 'PRO',
    badgeFree: 'FREE',
    'pricing.title': 'Choose your plan',
    'pricing.lead': 'Start in minutes on Free; move to Pro when you need exports and premium modules.',
    'pricing.free.name': 'Free',
    'pricing.free.price': '$0',
    'pricing.free.hint': 'No card required \u00b7 forever',
    'pricing.free.tagline': 'A broad free core so you can size real jobs today.',
    'pricing.free.b1': 'Transmission lab plus ISO fits and bolting calculators',
    'pricing.free.b2': 'Flat, inclined and roller conveyors with no cap on open modules',
    'pricing.free.b3': 'Free-tier updates as the core library grows',
    'pricing.free.b4': 'Great for quick budgets, classrooms and maintenance teams',
    'pricing.free.cta': 'Start free',
    'pricing.pro.ribbon': 'Most popular',
    'pricing.pro.name': 'Pro',
    'pricing.pro.priceFull': '$9/mo or $79/yr (save 27%)',
    'pricing.pro.tagline': 'Built for plant teams, documentation and premium modules.',
    'pricing.pro.b1': 'Full catalog including Pro-only tools and the multi-shaft canvas',
    'pricing.pro.b2': 'Export worksheets and summaries to PDF / Excel with your workflow',
    'pricing.pro.b3': 'Save machine configurations and reload them in one click',
    'pricing.pro.b4': 'No artificial caps on features included in your subscription',
    'pricing.pro.b5': 'Priority support and early access to new calculators',
    'pricing.pro.b6': 'A workflow tuned for design office and field engineering',
    'pricing.pro.cta': 'Get Pro',
    'pricing.footnote':
      'Indicative USD pricing. Final billing will be confirmed before checkout goes live.',
    'auth.login': 'Log in',
    'auth.register': 'Sign up',
    'auth.logout': 'Log out',
    'auth.close': 'Close',
    'auth.headline': 'Your MechAssist account',
    'auth.sub':
      'Full sign-up is coming soon. This preview aligns UX and messaging ahead of backend work.',
    'auth.tabLogin': 'Log in',
    'auth.tabRegister': 'Sign up',
    'auth.email': 'Email',
    'auth.emailPh': 'engineer@company.com',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.submitLogin': 'Sign in',
    'auth.submitRegister': 'Create account',
    'auth.backendNote': 'Backend pending: buttons do not submit data yet.',
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
