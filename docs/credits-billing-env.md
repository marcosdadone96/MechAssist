# Variables Netlify — sistema de créditos

Tras activar `publicFreeRelease: false` y `credits.enabled: true` en `js/config/features.js`:

## Créditos

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `CREDITS_WELCOME_PER_POOL` | `100` | Créditos iniciales por hub al verificar email |
| `CREDITS_COST_CALC` | `10` | Coste por sesión de cálculo (12 min por defecto en cliente) |
| `CREDITS_COST_PDF` | `10` | Coste por exportación PDF |
| `CREDITS_STARTER_PDF_LIMIT` | `30` | PDF/mes incluidos en plan Starter antes de gastar créditos |
| `CREDITS_CALC_UNLOCK_DAYS` | `31` | Días de acceso ilimitado a una calculadora (compra 1 €) |

## Lemon — variantes (UUID)

| Variable | Descripción |
|----------|-------------|
| `LEMON_VARIANT_STARTER_IDS` | Plan ~9 €/mes (p. ej. `acd30d30-72e7-4434-827e-e51487e492ca`) |
| `LEMON_VARIANT_UNLIMITED_IDS` | Plan ~25 €/mes ilimitado |
| `LEMON_VARIANT_CALC_UNLOCK_IDS` | Compra desbloqueo calculadora (~1 €) |
| `LEMON_PRO_VARIANT_IDS` | Legacy; si Starter vacío, se usa como fallback Starter |

En checkout Lemon, añadir campo personalizado `calc_slug` (ej. `calc-gears.html`) en productos de desbloqueo.

## Funciones

- `credits-balance` (GET, Bearer sesión)
- `credits-consume` (POST, Bearer sesión)
- Los créditos se guardan en Blobs (`credits:e:…`) en el store `mechassist-pro`.
