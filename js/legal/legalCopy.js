/**
 * Textos legales orientativos (ES/EN). Revise con asesor antes de comercio B2C en la UE.
 * Sustituya FEATURES.legalContactEmail en features.js por un correo operativo.
 */

import { FEATURES } from '../config/features.js';

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function contactLine(lang) {
  const em =
    typeof FEATURES.legalContactEmail === 'string' && FEATURES.legalContactEmail.trim().length > 0
      ? FEATURES.legalContactEmail.trim()
      : null;
  if (!em) {
    return lang === 'en'
      ? 'Configure a contact email in site settings (legalContactEmail) for data requests.'
      : 'Configure un correo de contacto en la configuraci?n del sitio (legalContactEmail) para solicitudes de datos.';
  }
  return lang === 'en'
    ? 'For privacy-related requests: ' + em
    : 'Para solicitudes relacionadas con privacidad: ' + em;
}

/**
 * Bloque HTML seguro (solo FEATURES) sobre cancelacion / portal de facturacion.
 * @param {'en'|'es'} lang
 */
function subscriptionCancellationHtml(lang) {
  const url =
    typeof FEATURES.subscriptionManageUrl === 'string' && FEATURES.subscriptionManageUrl.trim().length > 0
      ? FEATURES.subscriptionManageUrl.trim()
      : '';
  const em =
    typeof FEATURES.legalContactEmail === 'string' && FEATURES.legalContactEmail.trim().length > 0
      ? FEATURES.legalContactEmail.trim()
      : '';

  if (lang === 'en') {
    const ps = [];
    ps.push(
      `<p>${escHtml(
        'Paid subscriptions renew automatically until you cancel renewal. After you cancel, access to Pro features normally continues until the end of the period already billed, unless your payment provider states otherwise.',
      )}</p>`,
    );
    if (url) {
      ps.push(
        `<p><a href="${escAttr(url)}" target="_blank" rel="noopener noreferrer">${escHtml(
          'Manage billing, invoices and cancel renewal',
        )}</a>. ${escHtml('Use the link from your purchase receipt too if we sent one.')}</p>`,
      );
    } else {
      ps.push(
        `<p>${escHtml(
          'When checkout is connected to your payment provider, you should receive a secure self-service page (for example Stripe Customer Portal) to update your payment method, download invoices and turn off auto-renewal.',
        )}</p>`,
      );
    }
    if (em) {
      ps.push(
        `<p>${escHtml('Billing and cancellation support:')} <a href="mailto:${escAttr(em)}">${escHtml(em)}</a>.</p>`,
      );
    } else {
      ps.push(`<p>${escHtml('Configure legalContactEmail in site settings for billing contact.')}</p>`);
    }
    ps.push(
      `<p>${escHtml(
        'Locally stored Pro demo flags in your browser (development) are not the same as a paid subscription: you must cancel with your payment provider to stop charges.',
      )}</p>`,
    );
    return ps.join('');
  }

  const psEs = [];
  psEs.push(
    `<p>${escHtml(
      'Las suscripciones de pago se renuevan autom\u00e1ticamente hasta que cancela la renovaci\u00f3n. Tras cancelarla, el acceso Pro suele mantenerse hasta finalizar el periodo ya facturado, salvo que el proveedor de pago disponga otra cosa.',
    )}</p>`,
  );
  if (url) {
    psEs.push(
      `<p><a href="${escAttr(url)}" target="_blank" rel="noopener noreferrer">${escHtml(
        'Gestionar facturaci\u00f3n, facturas y cancelar la renovaci\u00f3n',
      )}</a>. ${escHtml('Guarde tambi\u00e9n el enlace del correo de compra si se lo enviamos.')}</p>`,
    );
  } else {
    psEs.push(
      `<p>${escHtml(
        'Cuando el checkout est\u00e9 conectado al proveedor de pago, recibir\u00e1 una p\u00e1gina segura de autogesti\u00f3n (por ejemplo el portal de cliente de Stripe) para actualizar la tarjeta, descargar facturas y desactivar la renovaci\u00f3n autom\u00e1tica.',
      )}</p>`,
    );
  }
  if (em) {
    psEs.push(
      `<p>${escHtml('Ayuda con facturaci\u00f3n y cancelaci\u00f3n:')} <a href="mailto:${escAttr(em)}">${escHtml(em)}</a>.</p>`,
    );
  } else {
    psEs.push(
      `<p>${escHtml(
        'Configure legalContactEmail en la configuraci\u00f3n del sitio como correo de contacto para cobros.',
      )}</p>`,
    );
  }
  psEs.push(
    `<p>${escHtml(
      'Las licencias Pro demo guardadas solo en el navegador (desarrollo) no sustituyen una suscripci\u00f3n real: debe cancelar ante el proveedor de pago para dejar de ser cargado.',
    )}</p>`,
  );
  return psEs.join('');
}

function disclaimer(lang) {
  return lang === 'en'
    ? 'This document is a practical template for a software tool. It does not constitute legal advice. Have it reviewed for your company, jurisdiction and processing activities (especially if you add accounts, payments or newsletters).'
    : 'Este documento es una plantilla pr?ctica para una herramienta software. No constituye asesoramiento legal. Rev?selo con su asesor seg?n su empresa, jurisdicci?n y actividades de tratamiento (especialmente si a?ade cuentas, pagos o newsletters).';
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
      title: lang === 'en' ? 'What we process' : 'Qu? datos tratamos',
      paragraphs: [
        lang === 'en'
          ? 'Depending on how you use the service, we may process: (1) technical and usage data (e.g. pages viewed) if you accept analytics cookies; (2) data you enter locally in your browser for demo features (e.g. local ?account? stored only on your device until you clear it); (3) if you enable payments in the future, data required by the payment provider.'
          : 'Seg?n c?mo use el servicio, podemos tratar: (1) datos t?cnicos y de uso (p. ej. p?ginas vistas) si acepta cookies de anal?tica; (2) datos que introduzca localmente en el navegador en funciones demo (p. ej. ?cuenta? local solo en su dispositivo hasta que la borre); (3) si activa pagos en el futuro, los datos que exija el proveedor de pago.',
      ],
    },
    {
      title: lang === 'en' ? 'Cookies and similar technologies' : 'Cookies y tecnolog?as similares',
      paragraphs: [
        lang === 'en'
          ? 'We use strictly necessary storage to remember your language and cookie choice. If you accept, we load Google Analytics (GA4) to measure traffic. You can withdraw analytics consent at any time by clearing site data or using the option we provide when available.'
          : 'Usamos almacenamiento estrictamente necesario para recordar su idioma y su elecci?n de cookies. Si acepta, cargamos Google Analytics (GA4) para medir el tr?fico. Puede retirar el consentimiento de anal?tica en cualquier momento borrando los datos del sitio o usando la opci?n que facilitemos cuando est? disponible.',
      ],
    },
    {
      title: lang === 'en' ? 'Legal bases (GDPR)' : 'Bases legales (RGPD)',
      paragraphs: [
        lang === 'en'
          ? 'Cookie choice and language: consent or legitimate interest as applicable. Analytics: consent when required. Contract performance and pre-contract steps when you purchase a digital product. Compliance with legal obligations where applicable.'
          : 'Elecci?n de cookies e idioma: consentimiento o inter?s leg?timo seg?n corresponda. Anal?tica: consentimiento cuando sea exigible. Ejecuci?n del contrato y medidas precontractuales si adquiere un producto digital. Cumplimiento de obligaciones legales cuando aplique.',
      ],
    },
    {
      title: lang === 'en' ? 'Retention' : 'Plazos de conservaci?n',
      paragraphs: [
        lang === 'en'
          ? 'Cookie preference: until you change or clear storage. Analytics: according to Google Analytics configuration (typically aggregated). Local demo profile: until the user clears browser storage.'
          : 'Preferencia de cookies: hasta que la cambie o borre el almacenamiento. Anal?tica: seg?n la configuraci?n de Google Analytics (habitualmente agregada). Perfil demo local: hasta que el usuario borre el almacenamiento del navegador.',
      ],
    },
    {
      title: lang === 'en' ? 'Transfers outside the EEA' : 'Transferencias fuera del EEE',
      paragraphs: [
        lang === 'en'
          ? 'Providers such as Google (Analytics, fonts if loaded from Google) may process data in the United States or other countries. Use Google?s documentation and, where required, appropriate safeguards (e.g. SCCs) and transparency in this policy.'
          : 'Proveedores como Google (Analytics, fuentes si se cargan desde Google) pueden tratar datos en Estados Unidos u otros pa?ses. Use la documentaci?n de Google y, cuando proceda, garant?as adecuadas (p. ej. SCC) y transparencia en esta pol?tica.',
      ],
    },
    {
      title: lang === 'en' ? 'Your rights' : 'Sus derechos',
      paragraphs: [
        lang === 'en'
          ? 'You may have the right to access, rectify, erase, restrict processing, object, data portability and to lodge a complaint with a supervisory authority. ' +
            contactLine('en')
          : 'Puede tener derecho de acceso, rectificaci?n, supresi?n, limitaci?n del tratamiento, oposici?n, portabilidad y a reclamar ante una autoridad de control. ' +
            contactLine('es'),
      ],
    },
  ];
}

export function getPrivacyDoc(lang) {
  const l = lang === 'en' ? 'en' : 'es';
  return {
    title: l === 'en' ? 'Privacy policy' : 'Pol?tica de privacidad',
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
        title: l === 'en' ? 'What are cookies?' : '?Qu? son las cookies?',
        paragraphs: [
          l === 'en'
            ? 'Cookies are small files or storage entries that a site can place on your device to remember settings or measure usage.'
            : 'Las cookies son peque?os archivos o entradas de almacenamiento que un sitio puede guardar en su dispositivo para recordar ajustes o medir el uso.',
        ],
      },
      {
        title: l === 'en' ? 'What we use on MechAssist' : 'Qu? usamos en MechAssist',
        paragraphs: [
          l === 'en'
            ? 'Strictly necessary: storing your cookie choice (e.g. mdr-cookie-consent-v1) and language preference (e.g. mdr-home-lang) in localStorage where applicable. Optional: Google Analytics 4 if you click ?Accept analytics?.'
            : 'Estrictamente necesarias: guardar su elecci?n de cookies (p. ej. mdr-cookie-consent-v1) y preferencia de idioma (p. ej. mdr-home-lang) en localStorage cuando aplique. Opcional: Google Analytics 4 si pulsa ?Aceptar anal?tica?.',
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
        title: l === 'en' ? 'More information' : 'M?s informaci?n',
        paragraphs: [
          l === 'en' ? 'See also our Privacy policy.' : 'V?ase tambi?n nuestra Pol?tica de privacidad.',
        ],
      },
    ],
  };
}

export function getTermsDoc(lang) {
  const l = lang === 'en' ? 'en' : 'es';
  return {
    title: l === 'en' ? 'Terms of use and sale (digital)' : 'T?rminos de uso y venta (digital)',
    disclaimer: disclaimer(l),
    sections: [
      {
        title: l === 'en' ? 'Service' : 'Servicio',
        paragraphs: [
          l === 'en'
            ? 'MechAssist provides engineering calculators, diagrams and related tools for information and education. Outputs are not a substitute for professional engineering judgement, applicable standards, or manufacturer data.'
            : 'MechAssist ofrece calculadoras de ingenier?a, diagramas y herramientas afines con fines informativos y educativos. Los resultados no sustituyen el criterio profesional, las normas aplicables ni los datos del fabricante.',
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
            : 'Si adquiere acceso digital, el alcance (m?dulos, duraci?n, dispositivos) es el descrito en el checkout. El pago puede gestionarlo un tercero (p. ej. Stripe); tambi?n le ser?n de aplicaci?n sus condiciones.',
        ],
      },
      {
        title: l === 'en' ? 'Renewal and cancellation' : 'Renovaci\u00f3n y cancelaci\u00f3n',
        htmlBody: subscriptionCancellationHtml(l),
      },
      {
        title: l === 'en' ? 'Right of withdrawal (EU consumers)' : 'Derecho de desistimiento (consumidores UE)',
        paragraphs: [
          l === 'en'
            ? 'For digital content not supplied on a tangible medium, EU consumers normally have 14 days to withdraw from a distance contract unless they requested immediate supply and acknowledged losing the right of withdrawal once delivery started. Implement this flow explicitly in your checkout before going live.'
            : 'Para contenidos digitales no suministrados en soporte material, los consumidores de la UE suelen disponer de 14 d?as para desistir del contrato a distancia salvo que hayan solicitado el suministro inmediato y reconocido perder el derecho de desistimiento una vez iniciada la prestaci?n. Implemente este flujo expl?citamente en el checkout antes de publicar.',
        ],
      },
      {
        title: l === 'en' ? 'Liability' : 'Responsabilidad',
        paragraphs: [
          l === 'en'
            ? 'To the extent permitted by law, we limit liability for indirect damages and for errors in educational models. Your statutory rights as a consumer are not affected where mandatory law says otherwise.'
            : 'En la medida permitida por la ley, limitamos la responsabilidad por da?os indirectos y por errores en modelos educativos. Los derechos del consumidor que sean imperativos no quedan afectados.',
        ],
      },
      {
        title: l === 'en' ? 'Contact' : 'Contacto',
        paragraphs: [contactLine(l)],
      },
    ],
  };
}
