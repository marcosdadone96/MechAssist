# Prompts post-auditoría completa (mayo 2026)

Para Cursor / agente. Basado en `docs/audit-completa-2026.md` y `node scripts/check-go-live-o.mjs` (**PASSED**).

**Orden recomendado:** P0 (manual tú) ? **P1** ? **P2** ? **P3**. Tras cada bloque: navegador ES + EN, consola limpia, un preset + recálculo.

**Patrones obligatorios** (igual que fases K–O):

- Chip: `data-i18n-attrs="title=prefix.tipX"` en `<span class="info-chip">`
- Label con chip: `data-i18n-html` en `<label>` (no solo `data-i18n`)
- SVG: `data-i18n="*.diagramSvgAria" data-i18n-attr="aria-label"`
- EN en `js/lab/i18n/pages/*En.js`; `watchLangAndApply(MAP, { reloadOnEs: false, onEnApplied: () => recalc() })`

---

## PROMPT P0 — Go-live comercial (no es código i18n)

```
Contexto: auditoría mayo 2026. El código i18n del catálogo pasa check-go-live-o.
Antes de publicar cobros reales, completar checklist manual e infra.

TAREAS (usuario / deploy):
1. docs/go-live-qa-o-manual.md — marcar 27 URLs o muestra lab+máquina+fluido.
2. docs/go-live-billing-checklist.md — preview Netlify con publicFreeRelease:false;
   compra test Lemon; webhook ls-webhook sin 4xx; pro-claim + refreshProEntitlement.
3. Textos legales checkout (IVA, renovación, desistimiento UE).
4. Solo entonces: publicFreeRelease:false en producción (paso a paso tabla features.js).

NO tocar i18n en este prompt salvo bugs encontrados en QA manual.
```

---

## PROMPT P1 — Tornillo + tracción: chips al patrón flat

```
Contexto: screw-conveyor.html y traction-elevator.html son las únicas máquinas del
catálogo con chips vía data-sc-chip / data-te-chip y mapas CHIPS en
screwConveyorStaticI18n.js / tractionElevatorStaticI18n.js. Funcionan en EN pero
no pasan el mismo check que flat (data-i18n-attrs en HTML).

Referencia: flat-conveyor.html + js/lab/i18n/pages/flatConvEn.js (tip*).

ARCHIVOS:
- screw-conveyor.html, js/lab/i18n/pages/screwConveyorEn.js,
  js/ui/screwConveyorPage.js, js/ui/screwConveyorStaticI18n.js
- traction-elevator.html, js/lab/i18n/pages/tractionElevatorEn.js,
  js/ui/tractionElevatorPage.js, js/ui/tractionElevatorStaticI18n.js
- scripts/check-machines-k.mjs (añadir ambas URLs)

TAREA tornillo:
1. Por cada <span class="info-chip" data-sc-chip="X">, sustituir por
   data-i18n-attrs="title=scConv.tipX" (y aria-label si flat lo usa).
2. Mover textos de CHIPS[k].en/es.title a screwConveyorEn.js como scConv.tipX.
3. Eliminar applyChips() o dejarlo solo para chips generados en runtime (si los hay).
4. Mantener applySelectOptions / SF / motor verifier sin romper (check-phase-n).

TAREA tracción: igual con teConv.tip* y data-te-chip.

TAREA CI:
5. Añadir screw-conveyor.html y traction-elevator.html a check-machines-k.mjs
   (mismas reglas: chips attrs, diagram aria, reloadOnEs:false, missing EN).

VERIFICACIÓN:
- EN: todos los ? con tooltip inglés; ES: español; cambio ES?EN sin F5.
- node scripts/check-machines-k.mjs && node scripts/check-phase-n.mjs
```

---

## PROMPT P2a — CI: lab completo en check-lab-i18n

```
Contexto: check-lab-i18n.mjs solo audita 6 páginas; el resto del lab está cableado
pero no protegido en CI.

ARCHIVO: scripts/check-lab-i18n.mjs

Añadir entradas (html + *En.js) para:
- calc-belts.html ? beltsEn.js
- calc-chains.html ? chainsEn.js
- calc-bolts-iso898.html ? boltsIsoEn.js
- calc-keys-din6885.html ? keysDinEn.js
- calc-iso-fit.html ? isoFitPageEn.js
- calc-gearmotor-inertia.html ? gearmotorInertiaEn.js
- calc-compression-spring.html ? compressionSpringEn.js

Reglas iguales: missing EN en data-i18n, lab-field-help sin data-i18n,
lab-next-steps obligatorio donde ya existe en HTML.

Integrar en scripts/check-go-live-o.mjs si no está ya.

VERIFICACIÓN: node scripts/check-lab-i18n.mjs ? sin fallos.
```

---

## PROMPT P2b — SEO intro lab (4 páginas)

```
Contexto: calc-seo-intro sin data-i18n en shaft, keys, iso-fit, bearings-catalog.
Claves EN pueden existir parcialmente (ej. shaft.seoIntro en shaftPageEn.js).

Por cada página:
1. Añadir data-i18n="prefix.seoIntro" (o seoIntroHtml + data-i18n-html si hay HTML).
2. Completar traducción en *En.js si falta.
3. No duplicar texto en StaticI18n.

Páginas: calc-shaft.html, calc-keys-din6885.html, calc-iso-fit.html,
calc-bearings-catalog.html

VERIFICACIÓN: toggle EN ? párrafo intro debajo del H1 en inglés.
```

---

## PROMPT P2c — Reducir StaticI18n duplicado

```
Contexto: varias páginas tienen HTML con data-i18n Y además
*StaticI18n.js / applyStaticI18n que reescriben los mismos nodos. Riesgo de
regresiones y doble fuente de verdad.

Prioridad (una PR por máquina o grupo pequeño):
1. inclined-conveyor — retirar applyInclinedConveyorStaticI18n donde el HTML ya
   tenga la clave; dejar solo selects dinámicos / alertas runtime.
2. roller-conveyor, car-lift-screw, bucket-elevator, centrifugal-pump — igual.
3. calc-hydraulic-press — migrar restos de hydraulicPressStaticI18n a HTML+En.
4. calc-hydraulic-cylinder / calc-hydraulic-pump — eliminar applyStaticI18n()
   inline si watchLangAndApply ya cubre los nodos.

Regla: tras cada archivo, ES+EN sin F5 y sin strings españolas en inspector
en nodos estáticos.

NO tocar screw/traction chips aquí si P1 no está mergeado.
```

---

## PROMPT P2d — Script audit-full-catalog (mantenimiento)

```
Contexto: audit-full-catalog.mjs tenía falsos positivos (máquinas sin EN_MAP,
fluidos sin fluidsHubUxEn, flag reloadOnEs invertido, hidráulica duplicada en LAB).

ARCHIVO: scripts/audit-full-catalog.mjs

Verificar que incluye:
- EN_MAP máquinas: flatConvEn, inclinedConveyorEn, rollerConveyorEn,
  bucketElevatorEn, screwConveyorEn, tractionElevatorEn, carLiftEn, centrifugalPumpEn
  + machineHubUxEn + homeNavEn
- Hidráulica: fusionar fluidsHubUxEn.js en keys al auditar calc-hydraulic-*
- LAB sin duplicar slugs de fluidos
- reloadOnEs: mostrar OK cuando Page.js tiene reloadOnEs: false

VERIFICACIÓN: node scripts/audit-full-catalog.mjs — máquinas sin "missing EN" masivo;
fluidos next-steps sin WARN de claves fluids.*
```

---

## PROMPT P3 — Post go-live (opcional)

```
P3a — Transmission Canvas/Studio: misma barra que calc-gears (hero, chips, presets
si aplica, next-steps entre herramientas transmisión).

P3b — Fluidos móvil: en css/lab.css, portar patrón responsive de
calc-hydraulic-cylinder.html a pump, press, pneumatic (diagrama + form 1 columna).

P3c — monetization.* en features.js: activar de una calculadora cada vez con copy
y UX de créditos probados.
```

---

## Resumen rápido para el usuario

| Prompt | Esfuerzo | Impacto |
|--------|----------|---------|
| **P0** | Manual / deploy | Crítico go-live |
| **P1** | 1–2 sesiones | Paridad EN tornillo/tracción |
| **P2a** | Pequeño | CI no regresa |
| **P2b** | Pequeño | SEO EN |
| **P2c** | Medio | Mantenibilidad |
| **P2d** | Pequeño | Auditorías futuras |
| **P3** | Grande | Post-lanzamiento |
