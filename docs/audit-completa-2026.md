# Auditoría completa — catálogo TheMechAssist (mayo 2026)

Revisión de **27 URLs** en `config/calc-unlock-catalog.json`: 14 laboratorio + 2 transmisión + 8 máquinas + 4 fluidos/hidráulica (+ `fluids-hub.html` fuera del catálogo de cobro).

**Referencias de calidad:** `flat-conveyor.html`, `calc-gears.html`.  
**Checks automatizados:** `node scripts/check-go-live-o.mjs` ? **PASSED** (mayo 2026).  
**Inventario ampliado:** `node scripts/audit-full-catalog.mjs` (matriz UX; ver notas de falsos positivos corregidos en el script).

---

## 1. Resumen ejecutivo

| Área | Estado global | Qué queda |
|------|---------------|-----------|
| **Laboratorio (14 calc)** | Listo para EN en formulario, presets, next-steps | P2: SEO intro sin `data-i18n` en 4 páginas; 1–2 ayudas sueltas; unificar checks CI |
| **Hidráulica (4 calc + hub)** | EN completo (`check-fluids-i18n`); `reloadOnEs: false` | P2: limpiar `applyStaticI18n` duplicado en cilindro/bomba; móvil (J4) |
| **Máquinas (8)** | 6/8 con chips `data-i18n-attrs` (K); next-steps en todas | **P1:** tornillo + tracción: chips vía `data-sc-chip` / `data-te-chip` + StaticI18n; **P2:** quitar StaticI18n donde ya hay HTML |
| **Transmisión (2)** | Canvas/Studio OK en i18n básico | P3: profundizar UX (fuera go-live corto) |
| **Go-live comercial** | Código billing coherente (`test-billing-tiers`) | **P0 manual:** staging Lemon, webhook, `publicFreeRelease: false`, QA `go-live-qa-o-manual.md` |

**Conclusión:** el producto está **cerca de go-live i18n/UX** en lab y en la mayoría de máquinas. El trabajo restante es sobre todo **deuda técnica i18n** (tornillo/tracción, StaticI18n), **pulido SEO** y **QA/billing en entorno real** — no bloqueos masivos de claves EN en el catálogo verificado por `check-go-live-o`.

---

## 2. Matriz por página

Leyenda: ? OK · ?? menor · ?? importante · ?? crítico (pre-publicar)

### 2.1 Laboratorio (14)

| Página | EN claves | Helps | Presets | next-steps | SEO intro | Notas |
|--------|-----------|-------|---------|------------|-----------|-------|
| `calc-gears.html` | ? | ?? modo cálculo (div wrapper; líneas con `data-i18n`) | ? | ? | ? | Referencia |
| `calc-belts.html` | ? | ? | ? | ? | ? | |
| `calc-chains.html` | ? | ? | ? | ? | ? | |
| `calc-bearings.html` | ? | ? | ? | ? | ? | |
| `calc-bearings-catalog.html` | ? | ? | — | ? | ?? sin `data-i18n` | |
| `calc-shaft.html` | ? | ? (2 helps dinámicos en JS excluidos en check) | ? | ? | ?? clave `shaft.seoIntro` en EN, HTML sin cablear | |
| `calc-keys-din6885.html` | ? | ? | ? | ? | ?? | Añadir `keys.seoIntro` + `data-i18n` |
| `calc-iso-fit.html` | ? | ? | — | ? | ?? | |
| `calc-seeger.html` | ? | ? | ? | ? | ? | |
| `calc-couplings.html` | ? | ? | — | ? | ? | |
| `calc-bolts-iso898.html` | ? | ?? 1 help | ? | ? | ? | |
| `calc-gearmotor-inertia.html` | ? | ? | ? | ? | ? | |
| `calc-compression-spring.html` | ? | ? | ? | ? | ? | |
| `transmission-canvas.html` | ? | — | — | — | — | P3 |
| `transmission-studio.html` | ? | — | — | — | — | P3 |

**CI:** `check-lab-i18n.mjs` solo cubre 6 páginas; el resto del lab **no está en CI** aunque el HTML está cableado (belts, chains, bolts, etc.).

### 2.2 Hidráulica y fluidos (4 + hub)

| Página | EN (`check-fluids`) | next-steps | Presets | Reload idioma | Deuda |
|--------|---------------------|------------|---------|---------------|-------|
| `calc-hydraulic-cylinder.html` | ? 97 claves | ? `fluids.*` | ? | ? `reloadOnEs: false` | `applyStaticI18n()` inline en Page |
| `calc-hydraulic-pump.html` | ? 114 claves | ? | ? | ? | `applyStaticI18n()` + 1 help suelto en HTML |
| `calc-hydraulic-press.html` | ? 97 claves | ? | ? | ? | `hydraulicPressStaticI18n.js` paralelo |
| `calc-pneumatic-cylinder.html` | ? 100 claves | ? | ? | ? | |
| `fluids-hub.html` | ? 46 claves | ? hub | — | ? | CSS móvil (J4) |

Claves `fluids.nextSteps*` viven en `js/lab/i18n/pages/fluidsHubUxEn.js` y se fusionan en `watchLangAndApply({ ...PAGE_EN, ...FLUIDS_HUB_UX_EN })`.

### 2.3 Máquinas (8)

| Página | Chips `?` | EN module | next-steps | Presets ?3 | designAlerts | CI `check-machines-k` |
|--------|-----------|-----------|------------|------------|--------------|----------------------|
| `flat-conveyor.html` | ? 20/20 attrs | flatConvEn + hubUx | ? | ? | ? | ? |
| `inclined-conveyor.html` | ? 22/22 | incEn + StaticI18n | ? | ? | ? | ? |
| `roller-conveyor.html` | ? 19/19 | rollerEn + Static | ? | ? | ? | ? |
| `bucket-elevator.html` | ? 19/19 | beEn + Static | ? | ? | ? | ? |
| `car-lift-screw.html` | ? 14/14 | carEn + Static | ? | ? | ? | ? |
| `centrifugal-pump.html` | ? 20/20 | pumpEn + Static | ? | ? | ? | ? |
| `screw-conveyor.html` | ?? 19× `data-sc-chip` | scEn + **CHIPS en StaticI18n** | ? | ? | ? | ? no en script K |
| `traction-elevator.html` | ?? 15× `data-te-chip` | teEn + **StaticI18n** | ? | ? | ? | ? no en script K |

**N3 (fase N):** motor/comprobador EN en tornillo y tracción — verificado por `check-phase-n.mjs`.

### 2.4 Transversal (todas las calculadoras)

| Tema | Estado |
|------|--------|
| `hubFreemium.js` en catálogo | ? 27/27 |
| `watchLangAndApply` + `reloadOnEs: false` | ? todos los `*Page.js` del catálogo |
| Modo invitado (`guestCalcMode`) | ? hubs; verificar cada calc en QA manual |
| RFQ `aria-label` i18n | ? `machineRfqExport` |
| Billing tiers (9 € / 25 € / unlock) | ? tests unitarios |

---

## 3. Hallazgos por prioridad

### P0 — Antes de cobrar en producción (manual / infra)

1. **QA navegador** — `docs/go-live-qa-o-manual.md` (ES?EN sin F5, presets, invitado, Pro).
2. **Billing staging** — `docs/go-live-billing-checklist.md`: Lemon webhook, `pro-claim`, `publicFreeRelease: false` en preview primero.
3. **Legal/RGPD** — precios, desistimiento checkout, copy “orientativo”.

### P1 — Mejora visible para usuario EN

1. **Tornillo sin fin + ascensor tracción:** migrar chips de `screwConveyorStaticI18n.js` / `tractionElevatorStaticI18n.js` a `data-i18n-attrs="title=scConv.tipX"` (patrón flat). Ampliar `check-machines-k.mjs` con estas dos URLs.
2. **Scripts CI:** extender `check-lab-i18n.mjs` a las 8 calculadoras lab que faltan (belts, chains, bolts, keys, iso-fit, gearmotor, spring, seeger ya está).

### P2 — Pulido y deuda técnica

1. **SEO intro** sin `data-i18n` en HTML: `calc-shaft`, `calc-keys-din6885`, `calc-iso-fit`, `calc-bearings-catalog` (claves EN parcialmente existentes).
2. **Eliminar doble vía i18n:** StaticI18n / `applyStaticI18n` en inclinada, rodillos, montacargas, cangilones, bomba centrífuga, prensa/cilindro/bomba hidráulica — dejar solo HTML + `watchLangAndApply` + runtime mínimo (selects dinámicos, chips de resultado).
3. **Ayudas sueltas:** 1 help en `calc-bolts-iso898.html`; revisar bomba si queda texto ES fuera de `lab-field-help`.
4. **`audit-full-catalog.mjs`:** corregido para mapas EN de máquinas, fusión `fluidsHubUxEn`, flag `reloadOnEs` y deduplicar hidráulica en listado lab.

### P3 — Post go-live

1. **Transmission Canvas / Studio** — auditoría UX profunda.
2. **Móvil fluidos** — portar layout tipo cilindro hidráulico a pump/press/neumático.
3. **Monetización por feature** — flags `monetization.*` en `features.js` de una en una.

---

## 4. Comandos de verificación

```bash
node scripts/check-go-live-o.mjs      # suite principal (debe PASSED)
node scripts/audit-full-catalog.mjs # matriz UX ampliada
node scripts/check-fluids-i18n.mjs
node scripts/check-lab-i18n.mjs     # solo 6 páginas lab
node scripts/check-machines-k.mjs   # 6 máquinas (sin tornillo/tracción)
node scripts/test-billing-tiers.mjs
```

---

## 5. Relación con documentos previos

| Documento | Uso |
|-----------|-----|
| `audit-maestro-calculadoras-2026.md` | Fases K?O (histórico) |
| `go-live-audit-prompts.md` | Prompts G?J legacy |
| **`prompt-mejoras-post-auditoria.md`** | **Prompts nuevos P1?P4** tras esta auditoría |
| `go-live-qa-o-manual.md` | Checklist manual O |
| `go-live-billing-checklist.md` | Deploy comercial |
