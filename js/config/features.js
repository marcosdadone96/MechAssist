/**
 * Feature flags — MechAssist
 * ---------------------------------------------------------------------------
 * CHECKLIST PUBLICACION (revise antes de abrir el sitio al publico):
 * - publicSiteBaseUrl: URL del sitio sin barra final; luego `node scripts/generate-sitemap.mjs`
 *   y descomente Sitemap en robots.txt con la misma base.
 * - proClientPolicy: 'production' en Netlify antes de cobrar (bloquea ?pro=1, localStorage Pro demo, usos prueba).
 * - allowPremiumViaQueryPro: false en produccion (no activar Pro por ?pro=1).
 * - allowFreeProTrialUses: false si no ofrece prueba Pro en cliente.
 * - showDemoCheckoutCompleteButton: false cuando el pago sea real (Stripe u otro).
 * - legalContactEmail, legalEntityName, legalEntityAddress: datos del responsable RGPD.
 * - subscriptionManageUrl: enlace al portal de gestion de suscripcion (p. ej. Stripe Customer Portal).
 * - cookiesAndAnalyticsBoot.js: confirme el ID de Google Analytics si cambia de propiedad.
 *
 * Freemium: cinta plana e inclinada accesibles sin Pro; `whichCalculatorIsFree` afecta sobre todo mensajes legacy / pruebas.
 * Pruebas locales: ponga `proClientPolicy: 'development'`, `allowPremiumViaQueryPro: true`, etc.; `?freeTool=flat|inclined`, sesion Pro `?pro=1`, boton «Activar Pro» (licencia: clave v2 vía `getProPersistentStorageKey` en `accessTier.js`) o barra dev en cabecera.
 * Ver `js/services/accessTier.js` y `js/ui/conveyorAppEntry.js`.
 *
 * Futuro (placeholders):
 * - gearmotorDatabase, pdfExport, userAuth, stripePayments (Checkout solo servidor)
 */
export const FEATURES = Object.freeze({
  /**
   * Calculador incluido en el plan gratuito. El otro requiere Pro (`accessTier` + paywall).
   * Pruebe la otra asignación con `?freeTool=flat` o `?freeTool=inclined` en la URL.
   */
  whichCalculatorIsFree: 'flat',

  /** Si true, toda la app se comporta como Pro (solo desarrollo). */
  devSimulatePremium: false,

  /**
   * Politica de acceso Pro solo en el navegador (sin backend).
   * - 'development': aplican allowPremiumViaQueryPro, localStorage (clave v2, ver `getProPersistentStorageKey`), usos prueba.
   * - 'production': desactiva esos atajos; la app no concedera Pro hasta que integre validacion servidor (p. ej. Netlify Function + Stripe).
   *   La licencia por localStorage puede ser falsificada: en produccion debe usar 'production' hasta tener endpoint seguro.
   */
  proClientPolicy: 'production',

  /** Barra en cabecera de calculadoras: plan, estrategia y enlaces ?pro=1 / ?freeTool= (desactivar en producción). */
  showTierSwitcherInDev: false,

  /**
   * Correo público para solicitudes RGPD / privacidad (se muestra en textos legales).
   * Ej.: 'privacy@su-dominio.com'
   */
  legalContactEmail: 'marcosdadone96@gmail.com',

  /**
   * Identificacion del responsable (RGPD / transparencia). Si rellena legalEntityName,
   * la politica de privacidad muestra estos datos en lugar del texto generico.
   */
  legalEntityName: 'Marcos',
  /** Direccion postal; puede usar varias lineas separadas por \n */
  legalEntityAddress: 'Pol\u00edgono 16, Parcela 86 (C\u00e1lig)',
  /** Opcional: NIF-IVA, registro mercantil, nota de representante, etc. */
  legalRegistrationNote: '',

  /**
   * URL publica del sitio sin barra final. Usada por scripts/generate-sitemap.mjs
   * y debe coincidir con la linea Sitemap en robots.txt.
   * Ej.: 'https://www.mechassist.com'. Vacio: el script escribe el marcador REPLACE-WITH-YOUR-DOMAIN.
   */
  publicSiteBaseUrl: 'https://mechassist.netlify.app',

  /**
   * Atajos "demo" de Pro. En produccion suele ir todo false y showDemoCheckoutCompleteButton
   * solo true mientras prueba sin Stripe.
   * Ejemplo produccion: allowPremiumViaQueryPro false, allowFreeProTrialUses false,
   * showDemoCheckoutCompleteButton false, stripePayments true + stripeCheckoutSessionUrl.
   */
  allowPremiumViaQueryPro: false,
  /** Los N usos gratis de Pro (barra dev / accessTier) no aplican si false. */
  allowFreeProTrialUses: false,
  /** Boton "Simular pago" en checkout.html. Desactive cuando cobre con pasarela real. */
  showDemoCheckoutCompleteButton: false,

  /**
   * Consumidor UE: exige casilla de renuncia al desistimiento para suministro inmediato
   * de contenido digital antes de pagar (demo o Stripe).
   */
  requireCheckoutWithdrawalWaiver: true,

  /** @deprecated Use accessTier.isPremiumEffective() para cobros reales. */
  isPremium: false,

  /** Advanced motor/gearmotor selection tables and vendor specs */
  motorSelectionAdvanced: true,

  /** Detailed safety / service factor optimization suggestions */
  safetyOptimization: true,

  /** Panel lateral Smart Dashboard (IA Advisor + coste simulado + filtro stock) */
  smartLabDashboard: true,

  /** Placeholder: API remota de catálogo motorreductores */
  gearmotorDatabase: false,

  /**
   * Motorreductores paramétricos: familias/tallas/relaciones → filas generadas (ver gearmotorParametricRegistry.js).
   * Desactive si prefiere solo las filas demo estáticas en gearmotorCatalog.js.
   */
  parametricGearmotors: true,

  /** Tope de filas generadas al expandir el registro paramétrico (protección rendimiento). */
  parametricGearmotorMaxModels: 8000,

  /** Placeholder: export calculation sheet to PDF */
  pdfExport: false,

  /** Placeholder: user accounts */
  userLogin: false,

  /**
   * Placeholder: Stripe — solo clave publicable en cliente; Checkout y webhook en backend.
   * Tras pago válido, el servidor puede fijar la misma entrada que `grantProLicensePersistent()` (nombre de clave: `getProPersistentStorageKey()` en cliente).
   */
  stripePayments: false,

  /** Pagina de pago (ruta relativa al sitio). Tras registro se redirige aqui con `startProCheckoutFlow`. */
  proCheckoutPagePath: 'checkout.html',

  /**
   * Si no esta vacio y `stripePayments` es true, el boton principal del checkout abre esta URL (sesion Stripe u host de pago).
   * En demo dejar vacio: se usa el boton de simulacion en `checkout.html`.
   */
  stripeCheckoutSessionUrl: '',

  /**
   * URL para que el usuario gestione la suscripcion (portal de facturacion).
   * Suele ser una sesion del Stripe Customer Portal generada en su backend; tambien puede ser
   * una pagina propia con instrucciones. Cadena vacia: en la UI solo correo / terminos.
   */
  subscriptionManageUrl: '',

  /**
   * URL de donacion (Ko-fi, PayPal.me, enlace Stripe, etc.) para el pie de las calculadoras gratuitas del laboratorio.
   * Cadena vacia: se muestra el texto de apoyo sin boton externo.
   */
  labDonationUrl: '',

  /**
   * Cartel inferior "Laboratorio gratuito" / donaci\u00f3n en calculadoras del laboratorio (labDonationFooter.js).
   * false: no se muestra (recomendado si no usa labDonationUrl o prefiere UI limpia).
   */
  showLabDonationBanner: false,

  /**
   * Enlaces de compra Amazon / panel laboratorio: ver `js/config/labAffiliate.js` (tag Associates, dominio).
   */

  /**
   * Monetization matrix (prepared, opt-in by flag).
   * Keep all false until rollout. Each machine can enable Pro gates independently.
   */
  monetization: Object.freeze({
    flat: Object.freeze({
      scenarioCompare: false,
      advancedMotorCompare: false,
      premiumPresets: false,
    }),
    roller: Object.freeze({
      scenarioCompare: false,
      advancedMotorCompare: false,
      premiumPresets: false,
    }),
    inclined: Object.freeze({
      scenarioCompare: false,
      advancedMotorCompare: false,
      premiumPresets: false,
    }),
    carLift: Object.freeze({
      scenarioCompare: false,
      advancedMotorCompare: false,
      safetyChecklist: false,
    }),
  }),
});

/**
 * Helper for template / DOM: show element only if feature is on.
 * @param {keyof typeof FEATURES} key
 * @returns {boolean}
 */
export function isFeatureEnabled(key) {
  return FEATURES[key] === true;
}

/**
 * Atajo ?pro=1 en URL y textos asociados (solo pestaña). Desactivado en produccion o si allowPremiumViaQueryPro es false.
 */
export function isPremiumViaQueryProUiAllowed() {
  return (
    FEATURES.allowPremiumViaQueryPro === true && FEATURES.proClientPolicy !== 'production'
  );
}
