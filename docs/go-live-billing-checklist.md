# Checklist priorizada � cobros Pro y salida de �modo p�blico gratuito�

Referencia cruzada: `js/config/BILLING_RESTORE.txt` (valores m�nimos) y comentario largo en `js/config/features.js` (Netlify / Lemon / RGPD).

---

## Fase 0 � Antes de tocar flags (orden fijo)

- [ ] **Textos legales**: precios finales, IVA, renovaci�n, cancelaci�n y enlace a `subscriptionManageUrl` alineados con lo que hace Lemon (mensual / anual).
- [ ] **RGPD**: `legalContactEmail`, `legalEntityName`, `legalEntityAddress` (y `legalRegistrationNote` si aplica) coherentes con `privacy.html` / checkout.
- [ ] **Desistimiento UE**: `requireCheckoutWithdrawalWaiver` en checkout � flujo probado con casilla obligatoria.
- [ ] **Expectativa de producto**: copy en home y calculadoras deja claro �orientativo / no sustituye cat�logo del fabricante� donde corresponda (reduce reclamaciones tras pago).

---

## Fase 1 � Netlify y Lemon (sin cambiar a�n `publicFreeRelease`)

- [ ] Variables del bloque superior de `features.js`: `PRO_JWT_SECRET` (o `AUTH_JWT_SECRET`), `LEMON_SQUEEZY_WEBHOOK_SECRET`, `LEMON_PRO_VARIANT_IDS`, URL del webhook `/.netlify/functions/ls-webhook`, URL de �xito `checkout.html?paid=1`.
- [ ] **Auth**: `RESEND_API_KEY`, `AUTH_MAIL_FROM` si registro/login servidor est� activo (`useServerAuth`).
- [ ] **Supabase** (si us�is RLS / guardados): mismas notas que en `features.js` (`supabase-session-mint`, claves p�blicas + service role solo servidor).
- [ ] **Pro en cliente**: tras compra de prueba, comprobar que `pro-claim` + `pro-verify` rellenan cache (`js/services/proEntitlement.js`, `hasProductionProSessionCache()`).

---

## Fase 2 � Deploy preview (recomendado)

En una **rama o deploy preview** de Netlify:

1. Poner **`publicFreeRelease: false`** solo en ese entorno (variable de build o bundle de preview), **sin** tocar producci�n hasta cerrar la lista.
2. Verificar que **no** quede `data-public-free-release` en `<html>` (home: pricing visible, enlaces �Planes�, nota de badges si aplica � ver `js/ui/hubFreemium.js`).
3. Flujo completo: registro ? verificaci�n correo ? login ? checkout Lemon (test) ? vuelta con `?paid=1` si aplica ? calculadora Pro desbloqueada tras `refreshProEntitlementIfNeeded` (carga inicial en `accessTier.js`).

---

## Fase 3 � Orden sugerido de toggles en `js/config/features.js` (producci�n)

Hacer en este orden y **commitear** entre pasos si algo falla.

| Paso | Clave | Valor recomendado (cobro real) | Nota |
|------|--------|--------------------------------|------|
| 1 | `publicFreeRelease` | `false` | Activa UI comercial y deja de forzar �todo Pro� en cliente. |
| 2 | `proClientPolicy` | `'production'` | Ya suele estar as�: bloquea `?pro=1` y licencia solo localStorage. |
| 3 | `allowPremiumViaQueryPro` | `false` | Evita atajo URL en prod. |
| 4 | `allowFreeProTrialUses` | `false` | Sin contador de �5 usos Pro gratis� salvo que quieras esa promoci�n. |
| 5 | `showDemoCheckoutCompleteButton` | `false` | Sin bot�n �simular pago� en `checkout.html`. |
| 6 | `stripePayments` | seg�n pasarela | Hoy el checklist de c�digo apunta a **Lemon**; Stripe solo si activ�is flujo y `stripeCheckoutSessionUrl`. |
| 7 | `whichCalculatorIsFree` | `'flat'` o `'inclined'` | Solo afecta mensajes / `?freeTool=`; **cinta plana, inclinada y rodillos** siguen con c�lculo completo sin Pro por `freemium.js`. |
| 8 | `monetization.*` | por herramienta | Mantener en `false` hasta tener UX y copy por feature; activar de una en una. |
| 9 | `showLabCloudSnapshotButton` | cuando tenga valor | Solo activar si el usuario puede **ver sentido** al guardar (listar/restaurar o informe claro). |

**Rollback r�pido**: `publicFreeRelease: true` restaura �todo abierto� y oculta pricing en home (ver `BILLING_RESTORE.txt`).

---

## Fase 4 � Dos funciones de tier (no confundir)

| Funci�n | Uso t�pico |
|---------|------------|
| `isPremiumEffective()` | PDF, motorreductores avanzados, extras que pueden depender de JWT **o** modo gratuito total. |
| `isPremiumForMachineForm()` | Formularios / acordeones �Pro� en m�quinas; en **`proClientPolicy === 'production'`** exige **JWT verificado** (no basta licencia local). |

- [ ] Usuario **gratis** en **bomba / cangilones / tornillo / tracci�n / ascensor tornillo**: paywall de acordeones v�a `applyMachinePremiumGates` (`machinePremiumGates.js`) salvo que teng�is otra pol�tica.
- [ ] Usuario **gratis** en **cinta plana / inclinada / rodillos**: c�lculo completo; **PDF y barra de config Pro** siguen ligados a `isPremiumEffective()` (revisar cada p�gina).

---

## Fase 5 � Matriz de prueba manual (URLs `.html`)

Marcar cada celda: an�nimo / cuenta gratis / cuenta Pro (JWT OK).

| P�gina / flujo | Comportamiento esperado (resumen) |
|----------------|-------------------------------------|
| `index.html` | Pricing visible; CTA checkout; contador sesi�n si usaste calculadoras. |
| `register.html` ? mail ? login | Cuenta verificada; sesi�n `Bearer` para sync. |
| `checkout.html` | Lemon abre; waiver UE; sin demo si `showDemoCheckoutCompleteButton: false`. |
| Post-pago | `pro-claim` / `pro-verify`; recargar: Pro efectivo. |
| `flat-conveyor.html`, `inclined-conveyor.html`, `roller-conveyor.html` | C�lculo abierto; PDF / config seg�n tier. |
| `centrifugal-pump.html`, `bucket-elevator.html`, `screw-conveyor.html`, `traction-elevator.html`, `car-lift-screw.html` | Sin Pro: acordeones bloqueados + CTA upgrade; con Pro: contenido completo. |
| `transmission-canvas.html` | Pro (badge en hub); acceso seg�n tier. |
| `transmission-lab.html` + 2�3 calculadoras lab | Sin regresiones; `runCalcWithIndustrialFeedback` ok. |
| `my-gearmotors.html` | Sync / paywall seg�n `isPremiumEffective` y flags. |
| `fluids-hub.html` + 1 calculadora fluidos | Sin errores de auth / tier. |

---

## Fase 6 � Post go-live (primera semana)

- [ ] Monitorizar webhook Lemon (fallos 4xx/5xx en Netlify).
- [ ] Revisar emails de bienvenida / facturaci�n Lemon.
- [ ] Tener respuesta tipo para �no me desbloque� Pro� (cookies, otro navegador, `pro-verify`).

---

## Archivos de c�digo que suelen tocar al monetizar

- `js/config/features.js` � flags.
- `js/config/freemium.js` � qu� m�quinas son gratis completas vs Pro.
- `js/services/accessTier.js`, `js/services/proEntitlement.js`, `js/services/proCheckoutFlow.js`.
- `js/ui/hubFreemium.js` � home pricing / `data-public-free-release`.
- `netlify/functions/ls-webhook.js`, `pro-claim.js`, `pro-verify.js`.

---

## Producto (carril A)

- [ ] **`trust.html`**: revisar tras cambios en guardado de datos, sync o Supabase; actualizar la seccion **Cambios recientes** en `getTrustDoc` (`js/legal/legalCopy.js`).
- [ ] **Biblioteca "mis proyectos"**: cuando exista listado y restauracion unificada, ajustar el copy de **Que mejoramos a continuacion** en el mismo documento.
