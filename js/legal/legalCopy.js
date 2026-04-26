/**
 * Textos legales orientativos (ES/EN). Revise con asesor antes de comercio B2C en la UE.
 * Sustituya FEATURES.legalContactEmail en features.js por un correo operativo.
 */

import { FEATURES } from '../config/features.js';

function contactLine(lang) {
  const em =
    typeof FEATURES.legalContactEmail === 'string' && FEATURES.legalContactEmail.trim().length > 0
      ? FEATURES.legalContactEmail.trim()
      : null;
  if (!em) {
    return lang === 'en'
      ? 'Configure a contact email in site settings (legalContactEmail) for data requests.'
      : 'Configure un correo de contacto en la configuraciùn del sitio (legalContactEmail) para solicitudes de datos.';
  }
  return lang === 'en'
    ? 'For privacy-related requests: ' + em
    : 'Para solicitudes relacionadas con privacidad: ' + em;
}

function disclaimer(lang) {
  return lang === 'en'
    ? 'This document is a practical template for a software tool. It does not constitute legal advice. Have it reviewed for your company, jurisdiction and processing activities (especially if you add accounts, payments or newsletters).'
    : 'Este documento es una plantilla prùctica para una herramienta software. No constituye asesoramiento legal. Revùselo con su asesor segùn su empresa, jurisdicciùn y actividades de tratamiento (especialmente si aùade cuentas, pagos o newsletters).';
}

function responsibleParagraphs(lang) {
  const name =
    typeof FEATURES.legalEntityName === 'string' ? FEATURES.legalEntityName.trim() : '';
  if (name) {
    const out = [];
    out.push(
      lang === 'en'
        ? `${name} operates this website and the MechAssist application (the "service") and, as described here, acts as the data controller for the processing involved.`
        : `${name} opera este sitio web y la aplicaci\u00f3n MechAssist (el "servicio") y, en los t\u00e9rminos aqu\u00ed descritos, act\u00faa como responsable del tratamiento de los datos.`,
    );
    const addrRaw =
      typeof FEATURES.legalEntityAddress === 'string' ? FEATURES.legalEntityAddress.trim() : '';
    if (addrRaw) {
      const addrLine = addrRaw.replace(/\r\n/g, '\n').replace(/\n/g, ', ');
      out.push(
        lang === 'en' ? `Postal address: ${addrLine}` : `Direcci\u00f3n postal: ${addrLine}`,
      );
    }
    const reg =
      typeof FEATURES.legalRegistrationNote === 'string'
        ? FEATURES.legalRegistrationNote.trim()
        : '';
    if (reg) out.push(reg);
    return out;
  }
  return [
    lang === 'en'
      ? 'The party operating this website and the MechAssist application (the "service") is responsible for processing under applicable data protection law. Fill in legalEntityName, legalEntityAddress and legalRegistrationNote in site settings when you publish.'
      : 'La entidad que opera este sitio web y la aplicaci\u00f3n MechAssist (el "servicio") es responsable del tratamiento seg\u00fan la normativa de protecci\u00f3n de datos aplicable. Rellene legalEntityName, legalEntityAddress y legalRegistrationNote en la configuraci\u00f3n del sitio al publicar.',
  ];
}

function baseSections(lang) {
  return [
    {
      title: lang === 'en' ? 'Who is responsible' : 'Responsable del tratamiento',
      paragraphs: responsibleParagraphs(lang),
    },
    {
      title: lang === 'en' ? 'What we process' : 'Quù datos tratamos',
      paragraphs: [
        lang === 'en'
          ? 'Depending on how you use the service, we may process: (1) technical and usage data (e.g. pages viewed) if you accept analytics cookies; (2) data you enter locally in your browser for demo features (e.g. local ùaccountù stored only on your device until you clear it); (3) if you enable payments in the future, data required by the payment provider.'
          : 'Segùn cùmo use el servicio, podemos tratar: (1) datos tùcnicos y de uso (p. ej. pùginas vistas) si acepta cookies de analùtica; (2) datos que introduzca localmente en el navegador en funciones demo (p. ej. ùcuentaù local solo en su dispositivo hasta que la borre); (3) si activa pagos en el futuro, los datos que exija el proveedor de pago.',
      ],
    },
    {
      title: lang === 'en' ? 'Cookies and similar technologies' : 'Cookies y tecnologùas similares',
      paragraphs: [
        lang === 'en'
          ? 'We use strictly necessary storage to remember your language and cookie choice. If you accept, we load Google Analytics (GA4) to measure traffic. You can withdraw analytics consent at any time by clearing site data or using the option we provide when available.'
          : 'Usamos almacenamiento estrictamente necesario para recordar su idioma y su elecciùn de cookies. Si acepta, cargamos Google Analytics (GA4) para medir el trùfico. Puede retirar el consentimiento de analùtica en cualquier momento borrando los datos del sitio o usando la opciùn que facilitemos cuando estù disponible.',
      ],
    },
    {
      title: lang === 'en' ? 'Legal bases (GDPR)' : 'Bases legales (RGPD)',
      paragraphs: [
        lang === 'en'
          ? 'Cookie choice and language: consent or legitimate interest as applicable. Analytics: consent when required. Contract performance and pre-contract steps when you purchase a digital product. Compliance with legal obligations where applicable.'
          : 'Elecciùn de cookies e idioma: consentimiento o interùs legùtimo segùn corresponda. Analùtica: consentimiento cuando sea exigible. Ejecuciùn del contrato y medidas precontractuales si adquiere un producto digital. Cumplimiento de obligaciones legales cuando aplique.',
      ],
    },
    {
      title: lang === 'en' ? 'Retention' : 'Plazos de conservaciùn',
      paragraphs: [
        lang === 'en'
          ? 'Cookie preference: until you change or clear storage. Analytics: according to Google Analytics configuration (typically aggregated). Local demo profile: until the user clears browser storage.'
          : 'Preferencia de cookies: hasta que la cambie o borre el almacenamiento. Analùtica: segùn la configuraciùn de Google Analytics (habitualmente agregada). Perfil demo local: hasta que el usuario borre el almacenamiento del navegador.',
      ],
    },
    {
      title: lang === 'en' ? 'Transfers outside the EEA' : 'Transferencias fuera del EEE',
      paragraphs: [
        lang === 'en'
          ? 'Providers such as Google (Analytics, fonts if loaded from Google) may process data in the United States or other countries. Use Googleùs documentation and, where required, appropriate safeguards (e.g. SCCs) and transparency in this policy.'
          : 'Proveedores como Google (Analytics, fuentes si se cargan desde Google) pueden tratar datos en Estados Unidos u otros paùses. Use la documentaciùn de Google y, cuando proceda, garantùas adecuadas (p. ej. SCC) y transparencia en esta polùtica.',
      ],
    },
    {
      title: lang === 'en' ? 'Your rights' : 'Sus derechos',
      paragraphs: [
        lang === 'en'
          ? 'You may have the right to access, rectify, erase, restrict processing, object, data portability and to lodge a complaint with a supervisory authority. ' +
            contactLine('en')
          : 'Puede tener derecho de acceso, rectificaciùn, supresiùn, limitaciùn del tratamiento, oposiciùn, portabilidad y a reclamar ante una autoridad de control. ' +
            contactLine('es'),
      ],
    },
  ];
}

export function getPrivacyDoc(lang) {
  const l = lang === 'en' ? 'en' : 'es';
  return {
    title: l === 'en' ? 'Privacy policy' : 'Polùtica de privacidad',
    disclaimer: disclaimer(l),
    sections: baseSections(l),
  };
}

export function getCookiesDoc(lang) {
  const l = lang === 'en' ? 'en' : 'es';
  return {
    title: l === 'en' ? 'Cookies' : 'Cookies',
    disclaimer: disclaimer(l),
    sections: [
      {
        title: l === 'en' ? 'What are cookies?' : 'ùQuù son las cookies?',
        paragraphs: [
          l === 'en'
            ? 'Cookies are small files or storage entries that a site can place on your device to remember settings or measure usage.'
            : 'Las cookies son pequeùos archivos o entradas de almacenamiento que un sitio puede guardar en su dispositivo para recordar ajustes o medir el uso.',
        ],
      },
      {
        title: l === 'en' ? 'What we use on MechAssist' : 'Quù usamos en MechAssist',
        paragraphs: [
          l === 'en'
            ? 'Strictly necessary: storing your cookie choice (e.g. mdr-cookie-consent-v1) and language preference (e.g. mdr-home-lang) in localStorage where applicable. Optional: Google Analytics 4 if you click ùAccept analyticsù.'
            : 'Estrictamente necesarias: guardar su elecciùn de cookies (p. ej. mdr-cookie-consent-v1) y preferencia de idioma (p. ej. mdr-home-lang) en localStorage cuando aplique. Opcional: Google Analytics 4 si pulsa ùAceptar analùticaù.',
        ],
      },
      {
        title: l === 'en' ? 'How to change your choice' : 'C\u00f3mo cambiar su elecci\u00f3n',
        paragraphs: [
          l === 'en'
            ? 'Use the Cookie settings page (cookie-preferences.html) to enable or disable analytics at any time. You can also clear site data for this origin in your browser. Clearing only the consent key shows the banner again if you use the option on that page.'
            : 'Use la p\u00e1gina Preferencias de cookies (cookie-preferences.html) para activar o desactivar la anal\u00edtica en cualquier momento. Tambi\u00e9n puede borrar los datos del sitio para este origen en el navegador. Si borra solo la clave de consentimiento, el banner volver\u00e1 a mostrarse con la opci\u00f3n indicada en esa p\u00e1gina.',
        ],
      },
      {
        title: l === 'en' ? 'More information' : 'Mùs informaciùn',
        paragraphs: [
          l === 'en' ? 'See also our Privacy policy.' : 'Vùase tambiùn nuestra Polùtica de privacidad.',
        ],
      },
    ],
  };
}

export function getTermsDoc(lang) {
  const l = lang === 'en' ? 'en' : 'es';
  return {
    title: l === 'en' ? 'Terms of use and sale (digital)' : 'Tùrminos de uso y venta (digital)',
    disclaimer: disclaimer(l),
    sections: [
      {
        title: l === 'en' ? 'Service' : 'Servicio',
        paragraphs: [
          l === 'en'
            ? 'MechAssist provides engineering calculators, diagrams and related tools for information and education. Outputs are not a substitute for professional engineering judgement, applicable standards, or manufacturer data.'
            : 'MechAssist ofrece calculadoras de ingenierùa, diagramas y herramientas afines con fines informativos y educativos. Los resultados no sustituyen el criterio profesional, las normas aplicables ni los datos del fabricante.',
        ],
      },
      {
        title: l === 'en' ? 'Accounts and local demo' : 'Cuentas y demo local',
        paragraphs: [
          l === 'en'
            ? 'Where the product uses a local browser profile, it is not a cloud account unless we state otherwise. You are responsible for backing up any important data.'
            : 'Cuando el producto use un perfil local en el navegador, no es una cuenta en la nube salvo que indiquemos lo contrario. Usted es responsable de respaldar los datos importantes.',
        ],
      },
      {
        title: l === 'en' ? 'Pro / paid access' : 'Acceso Pro / de pago',
        paragraphs: [
          l === 'en'
            ? 'If you purchase digital access, the scope (modules, duration, devices) is as described at checkout. Payment processing may be handled by a third party (e.g. Stripe); their terms also apply.'
            : 'Si adquiere acceso digital, el alcance (mùdulos, duraciùn, dispositivos) es el descrito en el checkout. El pago puede gestionarlo un tercero (p. ej. Stripe); tambiùn le serùn de aplicaciùn sus condiciones.',
        ],
      },
      {
        title: l === 'en' ? 'Right of withdrawal (EU consumers)' : 'Derecho de desistimiento (consumidores UE)',
        paragraphs: [
          l === 'en'
            ? 'For digital content not supplied on a tangible medium, EU consumers normally have 14 days to withdraw from a distance contract unless they requested immediate supply and acknowledged losing the right of withdrawal once delivery started. Implement this flow explicitly in your checkout before going live.'
            : 'Para contenidos digitales no suministrados en soporte material, los consumidores de la UE suelen disponer de 14 dùas para desistir del contrato a distancia salvo que hayan solicitado el suministro inmediato y reconocido perder el derecho de desistimiento una vez iniciada la prestaciùn. Implemente este flujo explùcitamente en el checkout antes de publicar.',
        ],
      },
      {
        title: l === 'en' ? 'Liability' : 'Responsabilidad',
        paragraphs: [
          l === 'en'
            ? 'To the extent permitted by law, we limit liability for indirect damages and for errors in educational models. Your statutory rights as a consumer are not affected where mandatory law says otherwise.'
            : 'En la medida permitida por la ley, limitamos la responsabilidad por daùos indirectos y por errores en modelos educativos. Los derechos del consumidor que sean imperativos no quedan afectados.',
        ],
      },
      {
        title: l === 'en' ? 'Contact' : 'Contacto',
        paragraphs: [contactLine(l)],
      },
    ],
  };
}
