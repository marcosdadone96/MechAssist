# Auditorùa maestra ù catùlogo completo (mayo 2026)

Documento para **seguir bloque a bloque** en Cursor. Complementa `go-live-audit-prompts.md` (prompts GùJ).  
**Referencia de calidad:** `flat-conveyor.html` + `calc-gears.html` (chips, presets, diagrama, next-steps, EN sin recargar pùgina).

**Cùmo usar:** ejecutar **Fase K ? L ? M ? N ? O** en orden. Tras cada sub-bloque: navegador **ES + EN**, consola sin errores, un preset y un recùlculo.

---

## 1. Visiùn de usuario (quù falta o mejorarùa)

Como ingeniero que entra por primera vez:

| Expectativa | Estado actual | Mejora |
|-------------|---------------|--------|
| Pulsar **EN** y leer todo el formulario | Lab principal OK; mùquinas con chips `?` en espaùol; hidrùulica mezcla HTML + JS | Cablear chips y ayudas con `data-i18n` / `data-i18n-attrs` |
| Saber **quù poner** en cada campo | Chips `?` desiguales (flat bien, inclinada/rodillos/montacargas mal) | 100 % chips con tooltip EN; ayudas bajo campo en ambos idiomas |
| **Presets** ùcaso tùpicoù | Gears/correas/cadenas sù; fluidos sin barra presets; algunas mùquinas solo 2 presets | 3 presets + tooltip i18n en todas las calculadoras de pago |
| Ver **avisos** sin abrir el informe PDF | Flat/rodillos/tornillo/tracciùn tienen `#designAlerts`; inclinada parcial | Alertas laterales visibles en todas las mùquinas |
| **Siguiente paso** tras calcular | Gears tiene `lab-next-steps`; flat hardcoded ES; muchas pùginas sin bloque | Nav ùsiguiente pasoù i18n en lab + mùquinas + fluidos |
| Comprar **1 ù / 9 ù / 25 ù** y usar al momento | Billing corregido en cùdigo; depende deploy + `calc_slug` Lemon | QA post-deploy (fuera de este doc) |
| Invitado: **ver pero no editar** | `guestCalcMode` en hubs/calcs | Verificar cada URL del catùlogo sin login |
| **Mùvil**: diagrama + formulario | Cilindro hidrùulico tiene CSS; pump/press/neumùtico menos pulidos | Portar layout responsive fluidos (J4) |

---

## 2. Matriz por pùgina (estado i18n + UX)

Leyenda: **??** listo ù **??** gaps menores ù **??** gaps importantes ù **??** EN vùa JS (HTML aùn en ES)

### Mùquinas (8)

| Pùgina | data-i18n | Chips `?` | Selects ES | EN module | designAlerts | Presetsù3 | Prioridad |
|--------|-----------|-----------|------------|-----------|--------------|-----------|-----------|
| `flat-conveyor.html` | 131 | ?? 1 chip | ?? | flatConvEn | ?? | ?? | P2 |
| `inclined-conveyor.html` | 126 | ?? ~12/22 | ?? | inc + Static | ?? | ?? | **P1** |
| `roller-conveyor.html` | ~103 | OK 18/18 | OK 16 opts | roller + Static + UX | OK | OK 3 presets | **P1** K2 done |
| `bucket-elevator.html` | ~55 | OK unified | OK 10 opts | be + Static + UX | OK verdicts | OK 3 presets | **P1** K5 done |
| `screw-conveyor.html` | 77 | ?? data-sc-chip | ?? 1 opt | sc + Static | ?? | ?? | P2 |
| `traction-elevator.html` | 77 | ?? data-te-chip | ?? marcas | te + Static | ?? | ?? | P2 |
| `car-lift-screw.html` | ~115 | OK 14/14 | OK 8 opts | car + Static + UX | OK | OK 3 presets | **P1** K3 done |
| `centrifugal-pump.html` | ~120 | OK 20/20 | OK 14 opts | pump + Static + UX | OK diag i18n | OK 3 presets | **P1** K4 done |

### Laboratorio (14)

| Pùgina | Helps sin data-i18n | EN module | Presets | next-steps | Prioridad |
|--------|---------------------|-----------|---------|------------|-----------|
| `calc-gears.html` | ?? 2 | gearsPageEn | ?? | ?? | P2 |
| `calc-belts.html` | ?? | beltsEn | ?? | ?? | P2 |
| `calc-chains.html` | ?? | chainsEn | ?? | ?? | P2 |
| `calc-bearings.html` | ?? | bearingsPageEn | ?? | ?? | P2 |
| `calc-bearings-catalog.html` | ?? | bearingCatalogEn | ù | ?? | P2 |
| `calc-shaft.html` | ?? 5 (JS rellena) | shaftPageEn | ?? | ?? | P1 |
| `calc-keys-din6885.html` | ?? | keysDinEn | ?? | ?? | P2 |
| `calc-iso-fit.html` | ?? | isoFitPageEn | ù | ?? | P2 |
| `calc-seeger.html` | ?? 5 | seegerPageEn | ?? | ?? | **P1** |
| `calc-couplings.html` | ?? | couplingsEn | ù | ?? | P2 (diag title) |
| `calc-bolts-iso898.html` | ?? 1 | boltsIsoEn | ?? | ?? | P2 |
| `calc-gearmotor-inertia.html` | ?? | gearmotorInertiaEn | ?? | ?? | P2 |
| `calc-compression-spring.html` | ?? | compressionSpringEn | ?? | ?? | P2 |
| `transmission-canvas.html` | (fuera alcance corto) | ù | ù | ù | P3 |

### Hidrùulica / fluidos (4)

| Pùgina | Helps/hints HTML | EN | Veredicto resumen | Reload ES?EN | Prioridad |
|--------|------------------|-----|-------------------|--------------|-----------|
| `calc-hydraulic-cylinder.html` | ?? | hydCylEn + Static | ?? | ?? | Referencia |
| `calc-hydraulic-pump.html` | ?? 26 | ?? pump map | ?? | ?? | **P0** |
| `calc-hydraulic-press.html` | ?? 26 + 4 opts | ?? press Static | ?? | ?? revisar reload | **P0** |
| `calc-pneumatic-cylinder.html` | ?? 22 + 6 opts | ?? tr() | ?? | ?? | **P0** |

---

## 3. Patrones obligatorios (copiar en cada tarea)

```html
<!-- Label con chip (no usar solo data-i18n en label: borra el ?) -->
<label data-i18n-html="prefix.labelXHtml">...</label>
<span class="info-chip" data-i18n-attrs="title=prefix.tipX" tabindex="0" role="button">?</span>

<!-- Ayuda bajo campo -->
<p class="lab-field-help" data-i18n="prefix.helpX">...</p>

<!-- Diagrama -->
<svg data-i18n="prefix.diagramSvgAria" data-i18n-attr="aria-label" ...>

<!-- Preset -->
<button type="button" data-i18n-attrs="title=prefix.preset1Tooltip" data-i18n="prefix.preset1">...</button>
```

```js
// Al final del *Page.js
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
watchLangAndApply(XXX_EN, { onEnApplied: () => scheduleRecalc() });
```

**Prohibido:** `location.reload()` al cambiar idioma (arreglar `hydraulicPressStaticI18n.js`).

---

## 4. Plan de ejecuciùn ù PROMPTS K ? O

### PROMPT K ù Mùquinas: chips, selects y paridad flat (P1)

```
Contexto: auditorùa maestro 2026. Referencia: flat-conveyor.html.

Orden: K1 ? K2 ? K3 ? K4 ? K5. Verificar ES+EN tras cada una.

K1 ù inclined-conveyor.html
  - Los ~12 info-chip sin data-i18n-attrs ? incConv.tip* en inclinedConveyorEn.js
  - Labels geometrùa: data-i18n-html (incConv.labelLengthHtml, ù)
  - SVG #diagramInclined: data-i18n + aria-label
  - NO romper #incDesignAlerts ni aviso ùngulo mùximo

K2 ù roller-conveyor.html
  - Chips ? rollerConv.tip* ; presets tooltips
  - <option> reparto carga / paleta / EUR ? data-i18n en cada option
  - Confirmar #designAlerts recibe warnings en recalc

K3 ù car-lift-screw.html
  - Chips rosca/motor/geometrùa ? carConv.tip*
  - Selects paso/rosca/marca ? data-i18n o StaticI18n ampliado
  - Tercer preset + tooltip (machineHubPresets + carLiftEn.js)

K4 ù centrifugal-pump.html
  - 5 chips pendientes ? cPump.tip* en centrifugalPumpEn.js
  - Mensajes diagnùstico en centrifugalPumpPage.js: patrùn en ? es : ù o claves i18n

K5 ù bucket-elevator.html (unificaciùn)
  - Migrar data-be-i18n ? data-i18n beConv.* O completar StaticI18n
  - Options descarga/material ? data-i18n
  - diagramSvgAria ; 3.er preset si faltan
```

*(Solapa con go-live **G1, G4, H1ùH5** ù si ya hecho, marcar K como completado.)*

---

### PROMPT L ù Laboratorio: cerrar huecos (P1ùP2)

```
L1 ù calc-seeger.html (P1)
  - 5ù lab-field-help ? data-i18n="sg.help*" en seegerPageEn.js
  - Diagrama aria + caption ; next-steps (sg.nextSteps*)

L2 ù calc-shaft.html (P1)
  - 5 bloques ayuda (#shCalcModeHelp, ù) ? data-i18n O documentar que SHAFT_PAGE_EN los rellena en onEnApplied
  - lab-units-bar completo EN ; next-steps shaft.nextSteps*

L3 ù calc-gears.html (P2)
  - #gCalcModeHelp ? data-i18n

L4 ù calc-couplings.html (P2)
  - Tùtulo diagrama hardcoded ? coup.diagTitle + data-i18n
  - Tabla K? si queda texto suelto en ES

L5 ù Paridad next-steps (P2)
  - Copiar bloque lab-next-steps de calc-gears.html a:
    calc-belts, calc-chains, calc-bearings, calc-compression-spring, calc-gearmotor-inertia
  - Claves en cada *En.js + enlaces contextuales

L6 ù Lab menor checklist rùpido
  - calc-keys-din6885, calc-iso-fit, calc-bearings-catalog, calc-bolts-iso898:
    diagram aria, next-steps, units bar ù 15 min cada una siguiendo calc-gears
```

*(Solapa con **G2, G3, I1**.)*

---

### PROMPT M ù Hidrùulica: de ùfunciona en JSù a ùmantenible en HTMLù (P0)

```
Referencia: calc-hydraulic-cylinder.html (sin reload, StaticI18n + watchLangAndApply).

M1 ù calc-hydraulic-pump.html
  - Aùadir data-i18n a los 26 hint/help (claves en hydraulicPumpEn.js)
  - Reducir mapa gigante en hydraulicPumpPage.js donde duplique HTML
  - #hpVerdictSummary visible (como cilindro)

M2 ù calc-hydraulic-press.html
  - data-i18n en hints, hppMode options, methodology lead
  - CRùTICO: eliminar reload al volver a ES (watchLangAndApply solo)
  - #hppVerdictSummary

M3 ù calc-pneumatic-cylinder.html
  - data-i18n en 22 hints + 6 options
  - Mover strings de tr() a pneumaticCylEn.js cuando sea estùtico
  - Caption diagrama bajo SVG

M4 ù Transversal fluidos
  - [x] lab-presets-bar ù3 en pump, press, pneumatic (J1)
  - [x] lab-next-steps entre calcs + hub (fluidsHubUxEn.js) (J2)
  - CSS mùvil diagramas (J4 desde go-live-audit)
```

*(Solapa con **I2ùI4, J1ùJ4**.)*

---

### PROMPT N ù UX ingenierùa transversal (P2)

```
N1 ù flat-conveyor.html: lab-next-steps ? machineHub.nextSteps* (H4)

N2 ù screw + traction: tùtulos acordeùn ingenierùa/motor i18n (H2)

N3 ù Inclinada: #incQualityChecklist textos i18n si estùn en ES fijo

N4 ù Informes / RFQ: revisar que botones ùCopiarù, ùPDFù, ùRFQù tengan aria-label i18n en mùquinas

N5 ù Invitado: en cada URL del catùlogo (config/calc-unlock-catalog.json)
  - Sin login: inputs disabled, banner visible
  - Con login sin crùditos: data-no-credits-lock
```

---

### PROMPT O ù QA manual final (antes de deploy)

```
Por cada fila del catùlogo (27 slugs en calc-unlock-catalog.json + hubs):

[ ] ES: abrir ? preset 1 ? recalc ? resultado numùrico coherente
[ ] EN: toggle ? sin espaùol visible en labels/chips/ayudas
[ ] Consola: 0 errores
[ ] Chip ?: hover muestra tooltip en idioma activo
[ ] Selects: todas las opciones traducidas en EN
[ ] Diagrama: aria-label EN en inspector
[ ] Guest (logout): solo lectura en calc de mùquina
[ ] Usuario Starter/Ilimitado: menù perfil coherente con plan

Regresiùn billing (si deploy billing):
[ ] Expirar sub test ? crùditos 0, solo lectura
[ ] 25 ù ? Ilimitado (no Starter)
[ ] 1 ù + calc_slug ? solo esa calc desbloqueada
```

---

## 5. Checklist por calculadora (marcar al terminar)

### Mùquinas

- [x] flat-conveyor ù K5/H4
- [x] inclined-conveyor ù **K1**
- [x] roller-conveyor ù **K2**
- [x] bucket-elevator ù **K5**
- [x] screw-conveyor ù N2
- [x] traction-elevator ù N2
- [x] car-lift-screw ù **K3**
- [x] centrifugal-pump ù **K4**

### Lab

- [x] calc-gears ù L3
- [x] calc-belts ù L5
- [x] calc-chains ù L5
- [x] calc-bearings ù L5
- [x] calc-bearings-catalog ù L6
- [x] calc-shaft ù **L2**
- [x] calc-keys-din6885 ù L6
- [x] calc-iso-fit ù L6
- [x] calc-seeger ù **L1**
- [x] calc-couplings ù L4
- [x] calc-bolts-iso898 ù L6
- [x] calc-gearmotor-inertia ù L5
- [x] calc-compression-spring ù (G2 si pendiente)

### Hidrùulica

- [x] calc-hydraulic-cylinder ù referencia OK
- [x] calc-hydraulic-pump ù **M1**
- [x] calc-hydraulic-press ù **M2**
- [x] calc-pneumatic-cylinder ù **M3**

---

## 6. Orden recomendado global

| Fase | Prompt | Tiempo est. | Impacto usuario EN |
|------|--------|-------------|-------------------|
| 1 | **K** (mùquinas P1) | 1ù2 dùas | Alto |
| 2 | **M** (hidrùulica P0) | 1 dùa | Alto internacional |
| 3 | **L** (lab P1) | 0.5ù1 dùa | Medio |
| 4 | **N** (UX) | 0.5 dùa | Coherencia |
| 5 | **O** (QA) | 2ù3 h humano | Go-live |

Si el tiempo es corto: **K1+K2+M2+M3+O** como mùnimo publicable bilingùe serio.

---

## 7. Comando de verificaciùn rùpida (agente)

```bash
node scripts/test-billing-tiers.mjs          # billing (si aplica)
# Contar helps sin i18n en una pùgina:
# rg 'lab-field-help' calc-seeger.html | rg -v 'data-i18n'
```

---

## 8. Relaciùn con otros docs

| Documento | Uso |
|-----------|-----|
| `go-live-audit-prompts.md` | Prompts GùJ detallados (mismo contenido, mùs verboso) |
| `credits-billing-env.md` | Variables Lemon / planes |
| `go-live-billing-checklist.md` | QA pagos |
| **Este archivo** | Mapa completo + orden K?O + visiùn usuario |

---

*Auditorùa generada tras revisiùn de 25 HTML + *En.js + *Page.js + *StaticI18n.js. Actualizar checklist al cerrar cada ùtem.*
