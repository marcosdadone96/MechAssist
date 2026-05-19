# Variables Netlify — sistema de créditos

Tras activar `publicFreeRelease: false` y `credits.enabled: true` en `js/config/features.js`:

## Créditos

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `CREDITS_WELCOME_PER_POOL` | `100` | Créditos iniciales por hub al verificar email |
| `CREDITS_COST_CALC` | `10` | Coste por sesión de cálculo (12 min por defecto en cliente) |
| `CREDITS_COST_PDF` | `10` | Coste por exportación PDF |
| `CREDITS_STARTER_PDF_LIMIT` | `30` | PDF/mes incluidos en plan Starter antes de gastar créditos |
| `CREDITS_CALC_UNLOCK_DAYS` | `30` | Días de acceso ilimitado a una calculadora (compra 1 €) |

## Lemon — variantes (UUID)

| Variable | Descripción |
|----------|-------------|
| `LEMON_VARIANT_STARTER_IDS` | Plan ~9 €/mes (`acd30d30-72e7-4434-827e-e51487e492ca` mensual, `bfd83e87-…` anual). **Incluidos por defecto en código** si la env falta. |
| `LEMON_VARIANT_UNLIMITED_IDS` | Plan ~25 €/mes ilimitado |
| `LEMON_VARIANT_CALC_UNLOCK_IDS` | Compra desbloqueo calculadora (~1 €) |
| `LEMON_PRO_VARIANT_IDS` | Legacy; si Starter vacío, se usa como fallback Starter |

En checkout Lemon, añadir campo personalizado `calc_slug` (ej. `calc-gears.html`) en productos de desbloqueo.

## Modelo de negocio (independiente)

| Producto | Precio | Efecto |
|----------|--------|--------|
| **Starter** | 9 €/mes (79 €/año) | Suscripción: créditos + hasta 30 PDF/mes |
| **Ilimitado** | 25 €/mes | Suscripción: sin gastar créditos en todo el sitio |
| **Desbloqueo** | 1 €/mes por calculadora | **Sin suscripción**: uso ilimitado solo en esa URL durante ~30 días |

El desbloqueo puntual usa `LEMON_VARIANT_CALC_UNLOCK_IDS` (distinto de Starter/Ilimitado). El webhook `order_created` llama a `applyCalcUnlock` con el `calc_slug` del pedido.

En cliente: `FEATURES.lemonCheckout.calcUnlock` (URL base Lemon) y `buildCalcUnlockCheckoutUrl(slug)` en `js/services/calcUnlockCheckout.js`.

## Lemon — modo test vs live

| Modo Lemon | Webhook | Pago de prueba |
|------------|---------|----------------|
| **Test mode** (interruptor naranja) | Crear webhook en **Settings ? Webhooks** con aviso *Test mode* | Solo pedidos/suscripciones de prueba |
| **Live** | Otro webhook (o el mismo URL) sin modo test | Pagos reales |

URL del webhook (test y live): `https://www.themechassist.com/.netlify/functions/ls-webhook`

El email de la cuenta en la web debe ser **el mismo** que en el checkout Lemon.

Tras pagar en test: menú perfil ? **Actualizar estado de cuenta**, o recargar la página (el saldo sincroniza la suscripción Starter si Lemon ya notificó al servidor).

## Caducidad de suscripción

Cuando Lemon envía `subscription_expired` o `status: expired`, el webhook y `credits-balance` llaman a `revokeSubscription`: se quita Starter/Ilimitado del ledger, el saldo pasa a **0** y las máquinas quedan en solo lectura (como sin créditos). Los desbloqueos puntuales de 1 € por calculadora **no** se revocan hasta que venza su plazo (~30 días).

## Funciones

- `credits-balance` (GET, Bearer sesión) — sincroniza Starter/Ilimitado desde el blob Pro si existe
- `credits-consume` (POST, Bearer sesión)
- `credits-reconcile-subscription` (POST) — forzar sync tras pago
- Los créditos se guardan en Blobs (`credits:e:…`) en el store `mechassist-pro`.
