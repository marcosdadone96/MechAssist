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
      'Herramientas t\u00e9cnicas confiables basadas en normas: n\u00facleo amplio gratis y Pro para exportar, historial y m\u00f3dulos avanzados.',
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
      'Gratis: calculadoras b\u00e1sicas de transmisi\u00f3n, ISO, torniller\u00eda y la mayor\u00eda de m\u00e1quinas fluidos. Pro: PDF/Excel, proyectos guardados, historial sin l\u00edmites diarios, lienzo multieje y calculadoras premium se\u00f1aladas con badge.',
    'nav.plans': 'Planes',
    'zone.machines': 'M\u00e1quinas',
    'zone.machinesIntro':
      'Bombas y transporte de materiales con c\u00e1lculo r\u00e1pido para dise\u00f1o y validaci\u00f3n.',
    'zone.machines.peek': 'Cinta plana \u00b7 Rodillos (gratis) \u00b7 resto Pro',
    'zone.lab.peek': 'Engranajes \u00b7 Correas \u00b7 Rodamientos \u00b7 ISO',
    'zone.fluids.peek': 'Bombas \u00b7 Cilindros \u00b7 Prensa \u00b7 Neum\u00e1tica',
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
    footnote:
      'Badges: GRATIS (verde) = calculadora incluida en el plan gratuito; PRO (violeta) = requiere suscripci\u00f3n Pro. Pol\u00edtica sujeta a cambios antes del checkout.',
    badgePro: 'PRO',
    badgeFree: 'GRATIS',
    'pricing.title': 'Elige tu plan',
    'pricing.lead': 'Empieza gratis y escala cuando lo necesites',
    'pricing.free.name': 'Gratuito',
    'pricing.free.price': '$0',
    'pricing.free.hint': 'Sin tarjeta \u00b7 para siempre',
    'pricing.free.b1': 'Acceso a calculadoras b\u00e1sicas',
    'pricing.free.b2': 'Uso ilimitado en m\u00f3dulos gratuitos',
    'pricing.free.b3': 'Soporte comunitario',
    'pricing.free.b4': 'Ideal para estudiantes y pruebas',
    'pricing.free.cta': 'Empezar gratis',
    'pricing.pro.ribbon': 'M\u00e1s popular',
    'pricing.pro.name': 'Pro',
    'pricing.pro.priceFull': '$9/mes o $79/a\u00f1o (ahorr\u00e1 27%)',
    'pricing.pro.b1': 'Todas las calculadoras + funciones avanzadas',
    'pricing.pro.b2': 'Exportar resultados a PDF y Excel',
    'pricing.pro.b3': 'Guardar y recuperar proyectos',
    'pricing.pro.b4': 'Sin l\u00edmites de uso',
    'pricing.pro.b5': 'Soporte prioritario',
    'pricing.pro.b6': 'Nuevas calculadoras prioritarias',
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
    'hero.eyebrow': 'MechAssist',
    'hero.tagline': 'Professional calculators for mechanical engineering',
    'hero.expand': 'View presentation',
    'hero.desc1':
      'Size gears, belts, bearings, hydraulic cylinders, bolting, and more in seconds.',
    'hero.desc2':
      'Reliable, standards-grounded tools: a broad free core plus Pro for exports, history, and advanced modules.',
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
      'Free: basic transmission, ISO fits, bolting and most machine/fluid models. Pro: PDF/Excel, saved projects, unlimited daily use where included, multi-shaft canvas and premium calculators marked with a badge.',
    'nav.plans': 'Plans',
    'zone.machines': 'Machines',
    'zone.machinesIntro':
      'Pumps and material handling tools for quick sizing and practical checks.',
    'zone.machines.peek': 'Flat belt \u00b7 Rollers (free) \u00b7 rest Pro',
    'zone.lab.peek': 'Gears \u00b7 Belts \u00b7 Bearings \u00b7 ISO',
    'zone.fluids.peek': 'Pumps \u00b7 Cylinders \u00b7 Press \u00b7 Pneumatics',
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
      'Badges: FREE (green) = included on the free plan; PRO (violet) = requires Pro. Policy may change before checkout.',
    badgePro: 'PRO',
    badgeFree: 'FREE',
    'pricing.title': 'Choose your plan',
    'pricing.lead': 'Start free and scale when you need to',
    'pricing.free.name': 'Free',
    'pricing.free.price': '$0',
    'pricing.free.hint': 'No card required \u00b7 forever',
    'pricing.free.b1': 'Access to core calculators',
    'pricing.free.b2': 'Unlimited use on free modules',
    'pricing.free.b3': 'Community support',
    'pricing.free.b4': 'Ideal for students and trying the product',
    'pricing.free.cta': 'Start free',
    'pricing.pro.ribbon': 'Most popular',
    'pricing.pro.name': 'Pro',
    'pricing.pro.priceFull': '$9/mo or $79/yr (save 27%)',
    'pricing.pro.b1': 'All calculators plus advanced features',
    'pricing.pro.b2': 'Export results to PDF and Excel',
    'pricing.pro.b3': 'Save and restore projects',
    'pricing.pro.b4': 'Unlimited usage',
    'pricing.pro.b5': 'Priority support',
    'pricing.pro.b6': 'Early access to new calculators',
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
