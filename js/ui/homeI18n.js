/**
 * Home hub i18n. Spanish non-ASCII uses \\uXXXX escapes so the file is ASCII-safe
 * valid UTF-8 even if the server omits charset on *.js (avoids mojibake).
 */
import { HOME_LANG_CHANGED_EVENT } from '../config/locales.js';
import { LAB_LANG_EVENT } from '../lab/i18n/labLang.js';
import { applyMachinePresetLabels } from '../lab/i18n/machineHubPresetLabels.js';
import { updateCounterUI } from '../services/calcCounter.js';

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
    'hero.mockup.url': 'www.themechassist.com/calc-belts.html',
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
    'hero.mockup.diagramPanelTitle': 'Esquema de Transmisi\u00f3n',
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
    'cases.title': 'Lo que un ingeniero resuelve en 3 minutos',
    'cases.sub': 'Casos reales, datos reales. Sin Excel, sin tablas de cat\u00e1logo.',
    'cases.tag.conveyor': 'Cinta transportadora',
    'cases.tag.screw': 'Tornillo sin fin',
    'cases.tag.elevator': 'Elevador de cangilones',
    'cases.cta': 'Calcular con mis datos \u2192',
    'cases.case1.problem':
      'Cinta horizontal de 80 m, 15 t/h de \u00e1ridos, tambor \u00d8315 mm',
    'cases.case1.row1Label': 'Potencia eje',
    'cases.case1.row1Value': '5,5 kW',
    'cases.case1.row2Label': 'Par de salida',
    'cases.case1.row2Value': '328 N\u00b7m',
    'cases.case1.row3Label': 'Motorreductor (ej. cat\u00e1logo)',
    'cases.case1.row3Value': 'R67 DRE112M4',
    'cases.case2.problem':
      'Tornillo \u00d8250 mm, paso 250 mm, 6 m horizontal, pellet biomasa 15 t/h',
    'cases.case2.row1Label': 'Velocidad tornillo',
    'cases.case2.row1Value': '87 rpm',
    'cases.case2.row2Label': 'Potencia requerida',
    'cases.case2.row2Value': '4,7 kW',
    'cases.case2.row3Label': 'Motorreductor (ej. cat\u00e1logo)',
    'cases.case2.row3Value': 'K57 DRE100L4',
    'cases.case3.problem': 'Elevador de trigo, 18 m altura, 25 t/h, cangil\u00f3n 2 L',
    'cases.case3.row1Label': 'Potencia requerida',
    'cases.case3.row1Value': '3,8 kW',
    'cases.case3.row2Label': 'Velocidad tambor',
    'cases.case3.row2Value': '85 rpm',
    'cases.case3.row3Label': 'Motorreductor (ej. cat\u00e1logo)',
    'cases.case3.row3Value': 'K57 DRE90L4',
    'cases.note':
      'Ejemplos orientativos con modelo TheMechAssist; referencias comerciales sin v\u00ednculo con fabricantes.',
    'sessionCounter.prefix': 'Has hecho ',
    'sessionCounter.suffix': ' c\u00e1lculos en esta sesi\u00f3n de navegador.',
    'pricing.free.useCase': 'Para estudiantes de ingenier\u00eda y verificaciones ocasionales.',
    'pricing.pro.useCase':
      'Para oficinas t\u00e9cnicas, ingenieros de planta e integradores que dimensionan m\u00e1s de una instalaci\u00f3n al mes.',
    'pricing.pro.roiLabel': '\u00bfCu\u00e1nto vale tu hora?',
    'pricing.pro.roiValue': 'Si ahorras 1 h/mes \u2192 el plan se paga solo.',
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
      'Gratis: calculadoras b\u00e1sicas de transmisi\u00f3n, ISO, torniller\u00eda, lienzo multieje y la mayor\u00eda de m\u00e1quinas fluidos. Pro: PDF/Excel, proyectos guardados, historial sin l\u00edmites diarios y calculadoras premium se\u00f1aladas con badge.',
    'nav.plans': 'Planes',
    'nav.hubLab': 'Laboratorio',
    'nav.hubMachines': 'M\u00e1quinas',
    'nav.hubFluids': 'Hidr\u00e1ulica',
    'nav.myGearmotors': 'Mis motorreductores',
    'nav.mySavedCalcs': 'Mis c\u00e1lculos guardados',
    'zone.machines': 'M\u00e1quinas',
    'zone.machinesIntro':
      'Transporte, elevaci\u00f3n y bombas: potencias y fuerzas para validar concepto antes del detalle CAD.',
    'zone.machines.peek': 'Cinta plana \u00b7 Rodillos \u00b7 bombas y elevaci\u00f3n',
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
    'fluids.scopeNote':
      'C\u00e1lculo orientativo para dimensionado previo. Confirma siempre con cat\u00e1logo de fabricante y normativa aplicable (ISO 4413 / ISO 4414).',
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
    'lab.canvasPro': 'Lienzo multieje',
    'hub.machines.eyebrow': 'M\u00e1quinas',
    'hub.machines.title': 'M\u00e1quinas y transporte',
    'hub.machines.lead':
      'Eleg\u00ed un m\u00f3dulo para dimensionar potencias, fuerzas y par\u00e1metros operativos en equipos de manejo de materiales.',
    'hub.machines.sectionActive': 'Activos',
    'hub.machines.sectionSoon': 'Pr\u00f3ximamente',
    'hub.fluids.eyebrow': 'Fluidos',
    'hub.fluids.title': 'Hidr\u00e1ulica y neum\u00e1tica',
    'hub.fluids.lead':
      'Calculadoras para estimar fuerzas, secciones \u00fatiles, caudales y tiempos de ciclo en actuadores y bombas.',
    'hub.fluids.sectionActive': 'Activos',
    'hub.fluids.sectionSoon': 'Pr\u00f3ximamente',
    'hub.fluids.pump.title': 'Bomba hidr\u00e1ulica',
    'hub.fluids.pump.desc':
      'Caudal, presi\u00f3n y potencia para orientar el grupo hidr\u00e1ulico.',
    'hub.fluids.pneuCyl.title': 'Cilindro neum\u00e1tico',
    'hub.fluids.pneuCyl.desc':
      'Fuerza, consumo y tiempos de carrera con aire comprimido.',
    'hub.fluids.hydCyl.title': 'Cilindro hidr\u00e1ulico',
    'hub.fluids.hydCyl.desc':
      'Fuerza, velocidad y caudal en actuaci\u00f3n oleohidr\u00e1ulica.',
    'hub.fluids.hydPress.title': 'Prensa hidr\u00e1ulica',
    'hub.fluids.hydPress.desc':
      'Fuerza de prensado y par\u00e1metros de circuito orientativos.',
    'hub.fluids.soonCompressor.title': 'Compresor neum\u00e1tico',
    'hub.fluids.soonCompressor.desc': 'M\u00f3dulo en preparaci\u00f3n.',
    'hub.fluids.soonValves.title': 'V\u00e1lvulas y distribuci\u00f3n',
    'hub.fluids.soonValves.desc': 'M\u00f3dulo en preparaci\u00f3n.',
    'hub.lab.eyebrow': 'Laboratorio',
    'hub.lab.title': 'Laboratorio de elementos de m\u00e1quina',
    'hub.lab.startHint':
      '\u00bfNo sabes por d\u00f3nde empezar? Si tienes un motor y una carga, empieza por Engranajes o Correas.',
    'hub.lab.leadHtml':
      'Calculadoras r\u00e1pidas con <strong>diagramas t\u00e9cnicos</strong>. Pensadas para dimensionar o verificar transmisiones habituales antes de abrir el cat\u00e1logo. El <a href="transmission-canvas.html">lienzo t\u00e9cnico</a> permite multieje con arrastre y validaciones en vivo.',
    'hub.lab.sectionKinematic': 'Transmisi\u00f3n cinem\u00e1tica',
    'hub.lab.sectionShaft': 'Elementos de eje',
    'hub.lab.sectionJoin': 'Uni\u00f3n y fijaci\u00f3n',
    'hub.lab.sectionDynamic': 'Din\u00e1mica',
    'hub.lab.sectionCanvas': 'Lienzo multieje',
    'hub.lab.gears.title': 'Engranajes cil\u00edndricos',
    'hub.lab.gears.desc':
      'm, z\u2081, z\u2082, b, n\u2081 \u2014 i, n\u2082, v en primitivo; modelo simplificado AGMA 2001 y alertas por lubricaci\u00f3n.',
    'hub.lab.belts.title': 'Correas \u00b7 V, s\u00edncrona, plana, Poly-V',
    'hub.lab.belts.desc':
      'Tipo de correa, cinem\u00e1tica (i, n\u2082, v, L), esquema SVG y veredicto por velocidad lineal (5\u201330 m/s \u00f3ptimo).',
    'hub.lab.chains.title': 'Cadenas y pi\u00f1ones',
    'hub.lab.chains.desc':
      'Paso, z\u2081, z\u2082, n\u2081 \u2014 \u03c9\u2082, v lineal, frecuencia de articulaci\u00f3n; efecto poligonal y lubricaci\u00f3n por v.',
    'hub.lab.bearingsL10.title': 'Rodamientos \u00b7 L10',
    'hub.lab.bearingsL10.desc':
      'Carga din\u00e1mica C, carga equivalente P \u2014 vida nominal b\u00e1sica (ISO simplificada). \u00dasalo cuando ya tienes C del cat\u00e1logo.',
    'hub.lab.shaft.title': 'Eje \u00b7 torsi\u00f3n',
    'hub.lab.shaft.desc': 'Par y tensi\u00f3n admisible \u2014 di\u00e1metro m\u00ednimo orientativo (macizo).',
    'hub.lab.keys.title': 'Chavetas DIN 6885',
    'hub.lab.keys.desc': 'Autocompletar b\u00d7h por \u00d8 eje; aplastamiento con L y material (C45/inox).',
    'hub.lab.isoFit.title': 'Ajustes ISO 286',
    'hub.lab.isoFit.desc':
      '\u00d8 nominal, letra e IT agujero/eje \u2014 l\u00edmites, juego o apriete y esquema de zonas (extracto 1\u2013500 mm).',
    'hub.lab.seeger.title': 'Anillos Seeger \u00b7 DIN 471 / 472',
    'hub.lab.seeger.desc':
      '\u00d8 eje o agujero \u2192 designaci\u00f3n, norma y cotas de ranura; diagrama de montaje.',
    'hub.lab.bearingsCat.title': 'Rodamientos \u00b7 cat\u00e1logo 62xx',
    'hub.lab.bearingsCat.desc':
      'Series 6000/6200/6300 con C demo; L\u2081\u2080h y veredicto vs horas objetivo. \u00dasalo para seleccionar la referencia directamente por serie.',
    'hub.lab.couplings.title': 'Acoplamientos \u00b7 cat\u00e1logo',
    'hub.lab.couplings.desc':
      'P, n, K \u2014 par de dise\u00f1o vs T nom Lovejoy/KTR/Flender (demo); error y modelo superior sugerido.',
    'hub.lab.bolts.title': 'Torniller\u00eda ISO 898-1',
    'hub.lab.bolts.desc': 'M6\u2013M36, 8.8/10.9/12.9; precarga y par de apriete; aptitud vs fuerza de tracci\u00f3n.',
    'hub.lab.gearmotor.title': 'Motor \u00b7 inercia J',
    'hub.lab.gearmotor.desc':
      'Cat\u00e1logo demo de motorreductores, relaci\u00f3n J<sub>ext</sub>/J<sub>mot</sub> y gr\u00e1fico par motor vs carga.',
    'hub.lab.spring.title': 'Muelle helicoidal compresi\u00f3n \u00b7 DIN 2089',
    'hub.lab.spring.desc':
      'k, F\u2099, \u03c4 con factor de Wahl; esquema SVG din\u00e1mico, gr\u00e1fico F\u2013s y simulaci\u00f3n Pro por deslizador.',
    'hub.lab.canvas.title': 'Lienzo t\u00e9cnico multieje',
    'hub.lab.canvas.desc':
      'Construye transmisiones multieje con arrastre directo de elementos, propagaci\u00f3n autom\u00e1tica de n/T y veredictos en vivo mientras editas.',
    'hub.machines.centrif.title': 'Bomba centr\u00edfuga',
    'hub.machines.centrif.desc':
      'Curva, potencia y par\u00e1metros de operaci\u00f3n para orientar selecci\u00f3n y revisi\u00f3n.',
    'hub.machines.flatConv.title': 'Cinta transportadora plana',
    'hub.machines.flatConv.desc':
      'Tensi\u00f3n, potencia y geometr\u00eda de transporte horizontal u orientativo.',
    'hub.machines.roller.title': 'Transportador de rodillos',
    'hub.machines.roller.desc':
      'Cargas, velocidad y requisitos de accionamiento en l\u00edneas de rodillos.',
    'hub.machines.inclined.title': 'Cinta inclinada',
    'hub.machines.inclined.desc':
      'Componente en pendiente: potencia, tensiones y factores de uso.',
    'hub.machines.bucket.title': 'Elevador de cangilones',
    'hub.machines.bucket.desc':
      'Altura, caudal s\u00f3lido y potencia para elevaci\u00f3n vertical de material.',
    'hub.machines.screw.title': 'Tornillo sin fin',
    'hub.machines.screw.desc':
      'Llenado, velocidad y potencia para transporte helicoidal de s\u00f3lidos.',
    'hub.machines.traction.title': 'Ascensor de tracci\u00f3n',
    'hub.machines.traction.desc':
      'Cinem\u00e1tica, contrapeso y par\u00e1metros de cuadro para ascensores.',
    'hub.machines.carLift.title': 'Elevador de veh\u00edculos',
    'hub.machines.carLift.desc':
      'Mecanismo y cargas para plataformas de elevaci\u00f3n tipo tornillo.',
    'hub.machines.soonExtruder.title': 'Extrusor',
    'hub.machines.soonExtruder.desc': 'M\u00f3dulo en preparaci\u00f3n.',
    'hub.machines.soonFan.title': 'Ventilador industrial',
    'hub.machines.soonFan.desc': 'M\u00f3dulo en preparaci\u00f3n.',
    'labHub.filterLabel': 'Filtrar',
    'labHub.searchPlaceholder': 'Buscar calculadora\u2026',
    'labHub.bearingsPathHint':
      '\u00bfRodamientos? Si ya tienes la carga din\u00e1mica C del cat\u00e1logo, abre L10. Si quieres elegir la referencia en series 62xx, usa el m\u00f3dulo de cat\u00e1logo.',
    'page.transmissionLab.docTitle': 'Laboratorio de transmisi\u00f3n \u2014 TheMechAssist',
    'page.transmissionLab.metaDesc':
      'Engranajes, correas, cadenas, rodamientos, ejes, chavetas, ajustes ISO, Seeger, acoplamientos y torniller\u00eda: calculadoras con diagramas. TheMechAssist.',
    'lab.gears': 'Engranajes',
    'lab.belts': 'Correas',
    'lab.chains': 'Cadenas',
    'lab.bearings': 'Rodamientos',
    'lab.shaft': 'Eje',
    'lab.more': 'M\u00e1s',
    'aria.siteNav': 'Navegaci\u00f3n principal',
    'aria.langSelector': 'Selector de idioma',
    'aria.heroMockup': 'Vista previa de calculadora',
    'aria.machineSystems': 'Sistemas disponibles',
    'aria.transmissionCalcs': 'Calculadoras de transmisi\u00f3n',
    'aria.fluidCalcs': 'Calculadoras de hidr\u00e1ulica y neum\u00e1tica',
    'aria.machinesHub': 'Abrir listado de m\u00e1quinas y transporte',
    'aria.labHub': 'Abrir laboratorio de transmisi\u00f3n y calculadoras',
    'aria.fluidsHub': 'Abrir listado de hidr\u00e1ulica y neum\u00e1tica',
    footnote: '',
    badgePro: 'PRO',
    badgeFree: 'GRATIS',
    'pricing.title': 'Elige tu plan',
    'pricing.lead':
      'Cuatro caminos independientes: registro con cr\u00e9ditos, Starter (9 \u20ac/mes), Ilimitado (25 \u20ac/mes) o desbloqueo puntual de una calculadora (1 \u20ac/mes).',
    'pricing.free.name': 'Registro',
    'pricing.free.price': '0 \u20ac',
    'pricing.free.hint': '100 cr\u00e9ditos de bienvenida por \u00e1rea',
    'pricing.free.tagline': 'Pruebe calculadoras con sus datos tras crear cuenta.',
    'pricing.free.b1': 'Presets demo sin registro (solo lectura en campos propios)',
    'pricing.free.b2': 'Laboratorio, m\u00e1quinas e hidr\u00e1ulica con saldo independiente',
    'pricing.free.b3': 'Un cargo por sesi\u00f3n de c\u00e1lculo, no por cada rec\u00e1lculo autom\u00e1tico',
    'pricing.free.b4': 'PDF y guardado en nube con cr\u00e9ditos o plan de pago',
    'pricing.free.cta': 'Crear cuenta gratis',
    'pricing.starter.ribbon': 'Starter',
    'pricing.starter.name': 'Starter',
    'pricing.starter.priceBig': '9 \u20ac',
    'pricing.starter.perMonth': '/mes',
    'pricing.starter.annualLine': 'o 79 \u20ac/a\u00f1o \u00b7 \u2248 6,58 \u20ac/mes de media',
    'pricing.starter.tagline': 'Cr\u00e9ditos renovados y hasta 30 PDF/mes.',
    'pricing.starter.b1': 'Cr\u00e9ditos para lab, m\u00e1quinas e hidr\u00e1ulica',
    'pricing.starter.b2': 'Hasta 30 PDF/mes en el cat\u00e1logo',
    'pricing.starter.b3': 'Plan anual con descuento',
    'pricing.starter.b4': 'Independiente del desbloqueo puntual (1 \u20ac)',
    'pricing.starter.cta': 'Starter 9 \u20ac/mes',
    'pricing.unlimited.ribbon': 'Ilimitado',
    'pricing.unlimited.name': 'Ilimitado',
    'pricing.unlimited.priceBig': '25 \u20ac',
    'pricing.unlimited.perMonth': '/mes',
    'pricing.unlimited.tagline': 'Todo el cat\u00e1logo sin gastar cr\u00e9ditos.',
    'pricing.unlimited.b1': 'Sin consumir cr\u00e9ditos en ninguna calculadora',
    'pricing.unlimited.b2': 'PDF y sesiones sin l\u00edmite por saldo',
    'pricing.unlimited.b3': 'Para uso intensivo en oficina t\u00e9cnica',
    'pricing.unlimited.b4': 'IVA seg\u00fan pa\u00eds en checkout Lemon',
    'pricing.unlimited.useCase': 'Si dimensiona a diario y no quiere vigilar el saldo de cr\u00e9ditos.',
    'pricing.unlimited.cta': 'Ilimitado 25 \u20ac/mes',
    'pricing.unlock.name': 'Una calculadora',
    'pricing.unlock.priceBig': '1 \u20ac',
    'pricing.unlock.perMonth': '/30 días',
    'pricing.unlock.tagline': 'Sin suscripci\u00f3n. Solo la herramienta que necesite.',
    'pricing.unlock.b1': 'Uso ilimitado en esa calculadora durante 30 d\u00edas',
    'pricing.unlock.b2': 'C\u00e1lculos y PDF en esa p\u00e1gina sin gastar cr\u00e9ditos',
    'pricing.unlock.b3': 'Puede comprar varias calculadoras por separado',
    'pricing.unlock.b4': 'Ideal si solo usa un m\u00f3dulo Pro de forma intensiva',
    'pricing.unlock.cta': 'Elegir calculadora',
    'pricing.footnote':
      'Precios orientativos en euros; IVA o impuestos aplicables seg\u00fan pa\u00eds. Importe final en checkout.',
    'auth.login': 'Iniciar sesi\u00f3n',
    'auth.register': 'Registrarse',
    'auth.logout': 'Cerrar sesi\u00f3n',
    'auth.close': 'Cerrar',
    'auth.headline': 'Tu cuenta TheMechAssist',
    'auth.sub':
      'Accede con tu cuenta TheMechAssist para continuar al checkout y guardar tus proyectos.',
    'auth.tabLogin': 'Iniciar sesi\u00f3n',
    'auth.tabRegister': 'Registrarse',
    'auth.email': 'Correo',
    'auth.emailPh': 'ingeniero@empresa.com',
    'auth.password': 'Contrase\u00f1a',
    'auth.name': 'Nombre',
    'auth.submitLogin': 'Entrar',
    'auth.submitRegister': 'Crear cuenta',
    'auth.backendNote':
      'Recibir\u00e1s un correo de verificaci\u00f3n antes de poder iniciar sesi\u00f3n.',
    'auth.pendingVerify':
      'Revisa tu correo y pulsa el enlace de verificaci\u00f3n para activar la cuenta. Despu\u00e9s podr\u00e1s iniciar sesi\u00f3n.',
    'nav.feedback': 'Sugerencias',
    'feedback.navHome': 'Inicio',
    'feedback.docTitle': 'Sugerencias \u2014 TheMechAssist',
    'feedback.eyebrow': 'Tu opini\u00f3n',
    'feedback.title': 'Sugerencias y mejoras',
    'feedback.lead':
      'Describe qu\u00e9 te gustar\u00eda mejorar, qu\u00e9 calculadora falta o qu\u00e9 no queda claro. Lo revisamos para priorizar el roadmap.',
    'feedback.thanks': 'Gracias. Hemos recibido tu mensaje.',
    'feedback.error':
      'No se pudo enviar el mensaje. Int\u00e9ntalo m\u00e1s tarde o usa el contacto indicado en la pol\u00edtica de privacidad.',
    'feedback.errorFile':
      'Abre esta p\u00e1gina desde la web publicada; desde un archivo .html en tu equipo no hay servidor que reciba el env\u00edo.',
    'feedback.honeypotLabel': 'No rellenar si eres humano',
    'feedback.labelMessage': 'Mensaje',
    'feedback.placeholderMessage':
      'Ej.: falta una calculadora de poleas; en la bomba me gustar\u00eda exportar a PDF...',
    'feedback.labelName': 'Nombre (opcional)',
    'feedback.labelEmail': 'Correo (opcional, si quieres respuesta)',
    'feedback.note':
      'El mensaje se env\u00eda de forma segura al servicio del sitio solo para mejorar TheMechAssist, seg\u00fan la pol\u00edtica de privacidad.',
    'feedback.submit': 'Enviar sugerencia',
    'footer.feedback': 'Sugerencias',
    'footer.trust': 'Confianza',
    'footer.mySavedCalcs': 'Mis c\u00e1lculos guardados',
    'footer.contactHtml':
      '\u00bfPreguntas? <a href="feedback.html">Escr\u00edbenos</a> o cont\u00e1ctanos en <a href="mailto:hola@themechassist.com">hola@themechassist.com</a>',
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
    'hero.mockup.url': 'www.themechassist.com/calc-belts.html',
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
    'hero.mockup.diagramPanelTitle': 'Transmission diagram',
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
    'cases.title': 'What an engineer solves in 3 minutes',
    'cases.sub': 'Real cases, real data. No Excel, no catalog tables.',
    'cases.tag.conveyor': 'Belt conveyor',
    'cases.tag.screw': 'Screw conveyor',
    'cases.tag.elevator': 'Bucket elevator',
    'cases.cta': 'Calculate with my data \u2192',
    'cases.case1.problem':
      'Horizontal belt 80 m, 15 t/h aggregates, \u00d8315 mm drum',
    'cases.case1.row1Label': 'Shaft power',
    'cases.case1.row1Value': '5.5 kW',
    'cases.case1.row2Label': 'Output torque',
    'cases.case1.row2Value': '328 N\u00b7m',
    'cases.case1.row3Label': 'Gearmotor (catalog example)',
    'cases.case1.row3Value': 'R67 DRE112M4',
    'cases.case2.problem':
      'Screw \u00d8250 mm, 250 mm pitch, 6 m horizontal, 15 t/h biomass pellets',
    'cases.case2.row1Label': 'Screw speed',
    'cases.case2.row1Value': '87 rpm',
    'cases.case2.row2Label': 'Power required',
    'cases.case2.row2Value': '4.7 kW',
    'cases.case2.row3Label': 'Gearmotor (catalog example)',
    'cases.case2.row3Value': 'K57 DRE100L4',
    'cases.case3.problem': 'Wheat elevator, 18 m lift, 25 t/h, 2 L bucket',
    'cases.case3.row1Label': 'Power required',
    'cases.case3.row1Value': '3.8 kW',
    'cases.case3.row2Label': 'Drum speed',
    'cases.case3.row2Value': '85 rpm',
    'cases.case3.row3Label': 'Gearmotor (catalog example)',
    'cases.case3.row3Value': 'K57 DRE90L4',
    'cases.note':
      'Illustrative examples using the TheMechAssist model; trade names are not endorsed.',
    'sessionCounter.prefix': 'You have run ',
    'sessionCounter.suffix': ' calculations in this browser session.',
    'pricing.free.useCase': 'For engineering students and occasional checks.',
    'pricing.pro.useCase':
      'For technical offices, plant engineers and integrators sizing more than one installation per month.',
    'pricing.pro.roiLabel': 'What is your hourly rate?',
    'pricing.pro.roiValue': 'Save one hour a month \u2192 the plan pays for itself.',
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
      'Free: basic transmission, ISO fits, bolting, multi-shaft canvas and most machine/fluid models. Pro: PDF/Excel, saved projects, unlimited daily use where included, and premium calculators marked with a badge.',
    'nav.plans': 'Plans',
    'nav.hubLab': 'Lab',
    'nav.hubMachines': 'Machines',
    'nav.hubFluids': 'Hydraulics',
    'nav.myGearmotors': 'My gearmotors',
    'nav.mySavedCalcs': 'My saved calculations',
    'zone.machines': 'Machines',
    'zone.machinesIntro':
      'Conveying, lifting and pumps: powers and forces to validate a concept before deep CAD work.',
    'zone.machines.peek': 'Flat belt \u00b7 Rollers \u00b7 pumps and lifts',
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
    'fluids.scopeNote':
      'Indicative calculation for preliminary sizing. Always confirm with the manufacturer catalogue and applicable standards (ISO 4413 / ISO 4414).',
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
    'lab.canvasPro': 'Multi-shaft canvas',
    'hub.machines.eyebrow': 'Machines',
    'hub.machines.title': 'Machines and conveying',
    'hub.machines.lead':
      'Pick a module to size powers, forces and operating parameters for materials-handling equipment.',
    'hub.machines.sectionActive': 'Available',
    'hub.machines.sectionSoon': 'Coming soon',
    'hub.fluids.eyebrow': 'Fluids',
    'hub.fluids.title': 'Hydraulics and pneumatics',
    'hub.fluids.lead':
      'Tools to estimate forces, effective areas, flows and cycle times in actuators and pumps.',
    'hub.fluids.sectionActive': 'Available',
    'hub.fluids.sectionSoon': 'Coming soon',
    'hub.fluids.pump.title': 'Hydraulic pump',
    'hub.fluids.pump.desc': 'Flow, pressure and power to size the hydraulic group.',
    'hub.fluids.pneuCyl.title': 'Pneumatic cylinder',
    'hub.fluids.pneuCyl.desc': 'Force, air use and stroke timing with compressed air.',
    'hub.fluids.hydCyl.title': 'Hydraulic cylinder',
    'hub.fluids.hydCyl.desc': 'Force, speed and flow for oleohydraulic actuation.',
    'hub.fluids.hydPress.title': 'Hydraulic press',
    'hub.fluids.hydPress.desc': 'Clamping force and indicative circuit parameters.',
    'hub.fluids.soonCompressor.title': 'Pneumatic compressor',
    'hub.fluids.soonCompressor.desc': 'Module in preparation.',
    'hub.fluids.soonValves.title': 'Valves and distribution',
    'hub.fluids.soonValves.desc': 'Module in preparation.',
    'hub.lab.eyebrow': 'Laboratory',
    'hub.lab.title': 'Machine-element lab',
    'hub.lab.startHint':
      'Not sure where to start? If you have a motor and a load, begin with Gears or Belts.',
    'hub.lab.leadHtml':
      'Quick calculators with <strong>technical diagrams</strong>. Use them to size or check common drives before opening a catalogue. The <a href="transmission-canvas.html">technical canvas</a> supports multi-shaft layouts with drag-and-drop and live validation.',
    'hub.lab.sectionKinematic': 'Kinematic power transmission',
    'hub.lab.sectionShaft': 'Shaft elements',
    'hub.lab.sectionJoin': 'Joining and fastening',
    'hub.lab.sectionDynamic': 'Dynamics',
    'hub.lab.sectionCanvas': 'Multi-shaft canvas',
    'hub.lab.gears.title': 'Spur & helical gears (cylindrical)',
    'hub.lab.gears.desc':
      'm, z\u2081, z\u2082, b, n\u2081 \u2014 i, n\u2082, pitch-line velocity; simplified AGMA 2001-style checks and lubrication hints.',
    'hub.lab.belts.title': 'Belts \u00b7 V, synchronous, flat, Poly-V',
    'hub.lab.belts.desc':
      'Belt type, kinematics (i, n\u2082, v, L), SVG sketch and a belt-speed verdict (often 5\u201330 m/s).',
    'hub.lab.chains.title': 'Roller chains & sprockets',
    'hub.lab.chains.desc':
      'Pitch, z\u2081, z\u2082, n\u2081 \u2014 \u03c9\u2082, line speed, articulation frequency; polygonal effect and lubrication by v.',
    'hub.lab.bearingsL10.title': 'Rolling bearings \u00b7 L10',
    'hub.lab.bearingsL10.desc':
      'Dynamic rating C, equivalent load P \u2014 basic rating life (simplified ISO). Use when C already comes from a catalogue.',
    'hub.lab.shaft.title': 'Shaft \u00b7 torsion',
    'hub.lab.shaft.desc': 'Torque and allowable shear \u2014 indicative minimum solid diameter.',
    'hub.lab.keys.title': 'Keys DIN 6885',
    'hub.lab.keys.desc': 'Auto b\u00d7h from shaft diameter; crushing check with L and material (C45/stainless).',
    'hub.lab.isoFit.title': 'ISO 286 fits',
    'hub.lab.isoFit.desc':
      'Nominal \u00d8, letter and IT for bore/shaft \u2014 limits, clearance or interference and zone diagram (extract 1\u2013500 mm).',
    'hub.lab.seeger.title': 'Retaining rings \u00b7 DIN 471 / 472',
    'hub.lab.seeger.desc':
      'Shaft or bore \u00d8 \u2192 designation, standard and groove dimensions; mounting diagram.',
    'hub.lab.bearingsCat.title': 'Bearings \u00b7 62xx catalogue',
    'hub.lab.bearingsCat.desc':
      '6000/6200/6300 series with demo C; L\u2081\u2080 hours vs target hours. Use to pick a reference directly by series.',
    'hub.lab.couplings.title': 'Couplings \u00b7 catalogue',
    'hub.lab.couplings.desc':
      'P, n, K \u2014 design torque vs Lovejoy/KTR/Flender nominal T (demo); mismatch and suggested upsize.',
    'hub.lab.bolts.title': 'Bolting ISO 898-1',
    'hub.lab.bolts.desc': 'M6\u2013M36, 8.8/10.9/12.9; preload and tightening torque; suitability vs tensile load.',
    'hub.lab.gearmotor.title': 'Motor \u00b7 inertia J',
    'hub.lab.gearmotor.desc':
      'Demo geared-motor catalogue, J_ext/J_mot ratio and motor torque vs load chart.',
    'hub.lab.spring.title': 'Helical compression spring \u00b7 DIN 2089',
    'hub.lab.spring.desc':
      'k, F\u2099, \u03c4 with Wahl factor; live SVG, F\u2013s chart and Pro slider simulation.',
    'hub.lab.canvas.title': 'Multi-shaft technical canvas',
    'hub.lab.canvas.desc':
      'Build multi-shaft trains with direct element drag, automatic n/T propagation and live verdicts while you edit.',
    'hub.machines.centrif.title': 'Centrifugal pump',
    'hub.machines.centrif.desc': 'Curve, power and operating parameters to guide selection and review.',
    'hub.machines.flatConv.title': 'Flat belt conveyor',
    'hub.machines.flatConv.desc': 'Tension, power and geometry for horizontal conveying (indicative).',
    'hub.machines.roller.title': 'Roller conveyor',
    'hub.machines.roller.desc': 'Loads, speed and drive requirements on roller lines.',
    'hub.machines.inclined.title': 'Inclined belt',
    'hub.machines.inclined.desc': 'Slope duty: power, tensions and service factors.',
    'hub.machines.bucket.title': 'Bucket elevator',
    'hub.machines.bucket.desc': 'Lift height, solid throughput and power for vertical conveying.',
    'hub.machines.screw.title': 'Screw conveyor',
    'hub.machines.screw.desc': 'Fill level, speed and power for helical bulk transport.',
    'hub.machines.traction.title': 'Traction lift',
    'hub.machines.traction.desc': 'Kinematics, counterweight and controller-oriented parameters.',
    'hub.machines.carLift.title': 'Vehicle lift',
    'hub.machines.carLift.desc': 'Mechanism and loads for screw-type vehicle platforms.',
    'hub.machines.soonExtruder.title': 'Extruder',
    'hub.machines.soonExtruder.desc': 'Module in preparation.',
    'hub.machines.soonFan.title': 'Industrial fan',
    'hub.machines.soonFan.desc': 'Module in preparation.',
    'labHub.filterLabel': 'Filter',
    'labHub.searchPlaceholder': 'Search calculators\u2026',
    'labHub.bearingsPathHint':
      'Bearings? If you already have dynamic load C from a catalogue, open L10. To pick a 62xx reference, use the catalogue module.',
    'page.transmissionLab.docTitle': 'Transmission lab \u2014 TheMechAssist',
    'page.transmissionLab.metaDesc':
      'Gears, belts, chains, bearings, shafts, keys, ISO fits, retaining rings, couplings and bolting: calculators with diagrams. TheMechAssist.',
    'lab.gears': 'Gears',
    'lab.belts': 'Belts',
    'lab.chains': 'Chains',
    'lab.bearings': 'Bearings',
    'lab.shaft': 'Shaft',
    'lab.more': 'More',
    'aria.siteNav': 'Main navigation',
    'aria.langSelector': 'Language selector',
    'aria.heroMockup': 'Calculator preview',
    'aria.machineSystems': 'Available systems',
    'aria.transmissionCalcs': 'Power transmission calculators',
    'aria.fluidCalcs': 'Hydraulic and pneumatic calculators',
    'aria.machinesHub': 'Open machine and bulk-handling calculators',
    'aria.labHub': 'Open transmission lab and calculators',
    'aria.fluidsHub': 'Open hydraulic and pneumatic calculators',
    footnote: '',
    badgePro: 'PRO',
    badgeFree: 'FREE',
    'pricing.title': 'Choose your plan',
    'pricing.lead':
      'Four independent paths: sign up with welcome credits, Starter (\u20ac9/mo), Unlimited (\u20ac25/mo), or unlock one calculator (\u20ac1/mo).',
    'pricing.free.name': 'Sign up',
    'pricing.free.price': '0 \u20ac',
    'pricing.free.hint': '100 welcome credits per area',
    'pricing.free.tagline': 'Run calculators with your own inputs after creating an account.',
    'pricing.free.b1': 'Guest demos with presets (custom fields are read-only)',
    'pricing.free.b2': 'Separate balances for lab, machines and hydraulics',
    'pricing.free.b3': 'One charge per calc session, not per auto-recalc',
    'pricing.free.b4': 'PDF and cloud save via credits or a paid plan',
    'pricing.free.cta': 'Create free account',
    'pricing.starter.ribbon': 'Starter',
    'pricing.starter.name': 'Starter',
    'pricing.starter.priceBig': '\u20ac9',
    'pricing.starter.perMonth': '/month',
    'pricing.starter.annualLine': 'or \u20ac79/year \u00b7 \u2248 \u20ac6.58/mo average',
    'pricing.starter.tagline': 'Renewed credits and up to 30 PDFs/month.',
    'pricing.starter.b1': 'Credits for lab, machines and hydraulics',
    'pricing.starter.b2': 'Up to 30 PDFs/month across the catalog',
    'pricing.starter.b3': 'Annual plan with discount',
    'pricing.starter.b4': 'Separate from pay-per-calculator unlock (\u20ac1)',
    'pricing.starter.cta': 'Starter \u20ac9/month',
    'pricing.unlimited.ribbon': 'Unlimited',
    'pricing.unlimited.name': 'Unlimited',
    'pricing.unlimited.priceBig': '\u20ac25',
    'pricing.unlimited.perMonth': '/month',
    'pricing.unlimited.tagline': 'Full catalog without spending credits.',
    'pricing.unlimited.b1': 'No credit spend on any calculator',
    'pricing.unlimited.b2': 'PDF and calc sessions not limited by balance',
    'pricing.unlimited.b3': 'Best for intensive daily technical use',
    'pricing.unlimited.b4': 'VAT by country at Lemon checkout',
    'pricing.unlimited.useCase': 'When you calculate daily and do not want to track credit balance.',
    'pricing.unlimited.cta': 'Unlimited \u20ac25/month',
    'pricing.unlock.name': 'One calculator',
    'pricing.unlock.priceBig': '\u20ac1',
    'pricing.unlock.perMonth': '/30 days',
    'pricing.unlock.tagline': 'No subscription. Only the tool you need.',
    'pricing.unlock.b1': 'Unlimited use on that calculator for 30 days',
    'pricing.unlock.b2': 'Calc sessions and PDF on that page without credits',
    'pricing.unlock.b3': 'Buy multiple calculators separately',
    'pricing.unlock.b4': 'Ideal if you only need one Pro module intensively',
    'pricing.unlock.cta': 'Pick a calculator',
    'pricing.footnote':
      'Indicative EUR prices; VAT/taxes may apply by country. Final amount shown at checkout.',
    'auth.login': 'Log in',
    'auth.register': 'Sign up',
    'auth.logout': 'Log out',
    'auth.close': 'Close',
    'auth.headline': 'Your account on TheMechAssist',
    'auth.sub':
      'Sign in to your TheMechAssist account to access checkout and save your projects.',
    'auth.tabLogin': 'Log in',
    'auth.tabRegister': 'Sign up',
    'auth.email': 'Email',
    'auth.emailPh': 'engineer@company.com',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.submitLogin': 'Sign in',
    'auth.submitRegister': 'Create account',
    'auth.backendNote':
      'You will receive a verification email before you can sign in.',
    'auth.pendingVerify':
      'Check your inbox and click the verification link to activate your account. You can then sign in.',
    'nav.feedback': 'Feedback',
    'feedback.navHome': 'Home',
    'feedback.docTitle': 'Feedback \u2014 TheMechAssist',
    'feedback.eyebrow': 'Your feedback',
    'feedback.title': 'Suggestions & improvements',
    'feedback.lead':
      'Tell us what to improve, which calculator is missing, or what feels unclear. We use this to prioritize the roadmap.',
    'feedback.thanks': 'Thank you \u2014 we received your message.',
    'feedback.error':
      'Could not send your message. Try again later or use the contact details in the privacy policy.',
    'feedback.errorFile':
      'Open this page from the published website; opening a local .html file cannot submit feedback.',
    'feedback.honeypotLabel': 'Leave blank if you are human',
    'feedback.labelMessage': 'Message',
    'feedback.placeholderMessage':
      'e.g. need a sheave calculator; pump page should export PDF...',
    'feedback.labelName': 'Name (optional)',
    'feedback.labelEmail': 'Email (optional, if you want a reply)',
    'feedback.note':
      'Your message is sent securely to site operators only to improve TheMechAssist, as described in the privacy policy.',
    'feedback.submit': 'Send feedback',
    'footer.feedback': 'Feedback',
    'footer.trust': 'Trust',
    'footer.mySavedCalcs': 'My saved calculations',
    'footer.contactHtml':
      'Questions? <a href="feedback.html">Contact us</a> or email <a href="mailto:hola@themechassist.com">hola@themechassist.com</a>',
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
    const useHtml = el.hasAttribute('data-i18n-html');
    if (attr) {
      el.setAttribute(attr, txt);
    } else if (useHtml) {
      el.innerHTML = txt;
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
  window.dispatchEvent(new CustomEvent(LAB_LANG_EVENT, { detail: { lang: l } }));
  if (l === 'en') applyMachinePresetLabels('en');
  updateCounterUI();
}

document.querySelectorAll('.hub-lang__btn[data-lang]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const l = btn.getAttribute('data-lang');
    setLang(l === 'en' ? 'en' : 'es');
  });
});

setLang(currentLang());
