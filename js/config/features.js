/**
 * Feature flags — TheMechAssist
 * ---------------------------------------------------------------------------
 * CHECKLIST NETLIFY (antes de cobrar):
 * - PRO_JWT_SECRET: secreto largo (firma JWT pro-claim / pro-verify).
 * - LEMON_SQUEEZY_WEBHOOK_SECRET: signing secret del webhook en Lemon.
 * - LEMON_PRO_VARIANT_IDS: UUIDs variant legacy (opcional si usa Starter/Ilimitado por env dedicada).
 * - LEMON_VARIANT_STARTER_IDS: Starter 9 € (acd30d30-… mensual; bfd83e87-… anual). Hay defaults en código.
 * - LEMON_VARIANT_UNLIMITED_IDS: Ilimitado 25 € (a8ac7a03-… / 85d69c29-…).
 * - Webhook URL en Lemon: https://SU-DOMINIO/.netlify/functions/ls-webhook (eventos order_* y subscription_*).
 * - URL exito checkout Lemon: https://SU-DOMINIO/checkout.html?paid=1
 * - publicSiteBaseUrl: URL del sitio sin barra final; luego `node scripts/generate-sitemap.mjs`
 *   y descomente Sitemap en robots.txt con la misma base.
 * - proClientPolicy: 'production' en Netlify antes de cobrar (bloquea ?pro=1, localStorage Pro demo, usos prueba).
 * - allowPremiumViaQueryPro: false en produccion (no activar Pro por ?pro=1).
 * - allowFreeProTrialUses: false si no ofrece prueba Pro en cliente.
 * - showDemoCheckoutCompleteButton: false cuando el pago sea real (Stripe u otro).
 * - legalContactEmail, legalEntityName, legalEntityAddress: datos del responsable RGPD.
 * - subscriptionManageUrl: portal de gestion Lemon `https://TU-TIENDA.lemonsqueezy.com/billing` (o dominio custom + `/billing`).
 * - cookiesAndAnalyticsBoot.js: confirme el ID de Google Analytics si cambia de propiedad.
 * - SUPABASE_SERVICE_ROLE_KEY + SUPABASE_URL (o NEXT_PUBLIC_SUPABASE_URL): insert tabla proyectos_transmision solo desde transmission-project-save (nunca en cliente).
 * - La funcion supabase-session-mint necesita en Netlify las mismas vars que el front (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY) mas SUPABASE_SERVICE_ROLE_KEY (emitir sesion Supabase tras login Netlify).
 * - SQL en docs/supabase/proyectos_transmision_server_only.sql (columna owner_email + RLS) antes de usar guardado en la nube.
 *
 * Freemium: cinta plana e inclinada accesibles sin Pro; `whichCalculatorIsFree` afecta sobre todo mensajes legacy / pruebas.
 * Pruebas locales: ponga `proClientPolicy: 'development'`, `allowPremiumViaQueryPro: true`, etc.; `?freeTool=flat|inclined`, sesion Pro `?pro=1`, boton «Activar Pro» (licencia: clave v2 vía `getProPersistentStorageKey` en `accessTier.js`) o barra dev en cabecera.
 * Ver `js/services/accessTier.js` y `js/ui/conveyorAppEntry.js`.
 *
 * Futuro (placeholders):
 * - gearmotorDatabase, pdfExport, userAuth, stripePayments (Checkout solo servidor)
 *
 * Modo publico gratuito (`publicFreeRelease: true`): mismo efecto que Pro en cliente (calculadoras,
 * CFG máquina, motorreductores en nube); la cuenta sigue siendo necesaria para guardar datos con
 * sesión / sync. Sin UI agresiva de planes (checkout opcional más adelante).
 * Restauracion de billing: ver `js/config/BILLING_RESTORE.txt` y `docs/go-live-billing-checklist.md`.
 */
export const FEATURES = Object.freeze({
  /**
   * Calculador incluido en el plan gratuito. El otro requiere Pro (`accessTier` + paywall).
   * Pruebe la otra asignación con `?freeTool=flat` o `?freeTool=inclined` en la URL.
   */
  whichCalculatorIsFree: 'flat',

  /**
   * Si true: mismo efecto que Pro para todos los usuarios y se oculta la UI comercial (home, checkout…).
   * El codigo de Lemon/Netlify y checkout.html permanece en el repo para reactivar.
   */
  publicFreeRelease: false,

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
  legalContactEmail: 'hola@themechassist.com',

  /**
   * Identificacion del responsable (RGPD / transparencia). Si rellena legalEntityName,
   * la politica de privacidad muestra estos datos en lugar del texto generico.
   */
  legalEntityName: 'Marcos',
  /** Direccion postal; puede usar varias lineas separadas por \n */
  legalEntityAddress: 'Castell\u00f3n, Espa\u00f1a',
  /** Opcional: NIF-IVA, registro mercantil, nota de representante, etc. */
  legalRegistrationNote: '',

  /**
   * URL publica del sitio sin barra final. Usada por scripts/generate-sitemap.mjs
   * y debe coincidir con la linea Sitemap en robots.txt.
   * Ej.: 'https://www.mechassist.com'. Vacio: el script escribe el marcador REPLACE-WITH-YOUR-DOMAIN.
   */
  publicSiteBaseUrl: 'https://www.themechassist.com',

  /**
   * Registro e inicio de sesión con servidor Netlify (correo de verificación + Blobs + JWT).
   * Requiere RESEND_API_KEY, AUTH_MAIL_FROM, AUTH_JWT_SECRET o PRO_JWT_SECRET.
   * Si false: comportamiento anterior solo en localStorage (demo en este navegador).
   */
  useServerAuth: true,

  /**
   * RLS en Supabase con auth.uid(): filas ligadas al usuario Auth, sin confiar en email enviado por el cliente.
   * Tras login Netlify, `supabase-session-mint` entrega tokens; en modo solo-local, login/registro llaman a Supabase Auth.
   */
  useSupabaseRLS: true,

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
   * Portal de facturacion del cliente (Lemon Squeezy: `/billing` en la tienda).
   * Mismo subdominio que los enlaces `checkout/buy/...` en checkout.html.
   * Vacio: checkout solo muestra correo legal / terminos para gestionar la suscripcion.
   */
  subscriptionManageUrl: 'https://mechassist.lemonsqueezy.com/billing',

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
   * Botón «Exportar cálculos y diagrama en PDF» en calculadoras `main.lab-main`.
   * (Antes: guardado en nube → `calculos_mecanicos` / `my-saved-calcs.html`.)
   */
  showLabCloudSnapshotButton: true,

  /**
   * Enlaces de compra Amazon / panel laboratorio: ver `js/config/labAffiliate.js` (tag Associates, dominio).
   */

  /**
   * Monetization matrix (prepared, opt-in by flag).
   * Keep all false until rollout. Each machine can enable Pro gates independently.
   */
  /**
   * Créditos (saldo único compartido). Desactivado si publicFreeRelease es true.
   */
  credits: Object.freeze({
    enabled: true,
    welcomeTotal: 1000,
    costCalcSession: 10,
    costPdf: 10,
    starterPdfLimitPerMonth: 30,
    /** Duración de sesión de cálculo facturada (ms) — un cargo por ventana. */
    calcSessionMs: 12 * 60 * 1000,
    /** Días de uso ilimitado en una calculadora tras compra puntual (1 €). */
    calcUnlockDays: 30,
    /** Guardar motorreductores en nube sin suscripción Pro (cuenta verificada). */
    allowRegisteredGearmotorSave: true,
  }),

  /**
   * Enlaces Lemon Squeezy (checkout/buy/{uuid}). Vacío = botón oculto en checkout.html.
   * Desbloqueo 1 €: producto one-time/sub independiente; campo `calc_slug` o plantilla {{calc_slug}}.
   * En Netlify: LEMON_VARIANT_CALC_UNLOCK_IDS (distinto de Starter/Ilimitado).
   */
  lemonCheckout: Object.freeze({
    starterMonthly: 'https://mechassist.lemonsqueezy.com/checkout/buy/acd30d30-72e7-4434-827e-e51487e492ca',
    starterAnnual: 'https://mechassist.lemonsqueezy.com/checkout/buy/bfd83e87-ac81-46ad-a5cf-2c2c94b1d70d',
    unlimitedMonthly: 'https://mechassist.lemonsqueezy.com/checkout/buy/a8ac7a03-694b-43be-89cf-75804a221e30',
    /** Ilimitado anual (199 €/año). Vacío = enlace oculto en checkout hasta crear producto Lemon. */
    unlimitedAnnual: 'https://mechassist.lemonsqueezy.com/checkout/buy/85d69c29-1149-46cf-b335-5c288a685143',
    /** Desbloqueo 1 €/mes por calculadora (campo Lemon: calc_slug) */
    calcUnlock:
      'https://mechassist.lemonsqueezy.com/checkout/buy/3e5a7c0f-4faf-47fd-aede-0a6488ef5f40?checkout[custom][calc_slug]={{calc_slug}}',
  }),

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
 * Clave Web3Forms para feedback.html. No versionar la clave; inyectar en runtime
 * (p. ej. `globalThis.__FEEDBACK_WEB3FORMS_KEY__` desde plantilla/Netlify).
 * Vacío: se usan email-feedback y Netlify Forms.
 * @returns {string}
 */
export function getFeedbackWeb3FormsAccessKey() {
  try {
    const g = /** @type {{ __FEEDBACK_WEB3FORMS_KEY__?: string }} */ (globalThis);
    if (typeof g.__FEEDBACK_WEB3FORMS_KEY__ === 'string') {
      const s = g.__FEEDBACK_WEB3FORMS_KEY__.trim();
      if (s) return s;
    }
  } catch (_) {}
  return '';
}

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

/** Sitio en modo gratuito total (sin mostrar planes ni checkout). */
export function isPublicFreeRelease() {
  return FEATURES.publicFreeRelease === true;
}
