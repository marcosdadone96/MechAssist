# Checklist QA manual (go-live)

Completar en **staging/producción** antes del deploy final. Marcar cada ítem al validarlo.

## Hubs y navegación

- [ ] `index.html` carga sin errores de consola
- [ ] `machines-hub.html` — enlaces a todas las máquinas publicadas
- [ ] `transmission-lab.html` — enlaces a calculadoras de lab
- [ ] `fluids-hub.html` — enlaces a las 4 calculadoras hidráulicas/neumáticas

## Idioma ES / EN

- [ ] Toggle ES?EN en una página de **máquinas** (p. ej. `flat-conveyor.html`)
- [ ] Toggle ES?EN en una página de **lab** (p. ej. `calc-gears.html`)
- [ ] Toggle ES?EN en una página de **fluidos** (p. ej. `calc-hydraulic-press.html`) sin `location.reload` ni errores consola
- [ ] Volver a ES (recarga o flujo documentado) — textos coherentes

## Presets

- [ ] Un preset por **máquina** con barra de ejemplos (carga valores y recalcula)
- [ ] Un preset en **cilindro hidráulico**, **bomba**, **prensa** y **neumático**
- [ ] Un preset en **correas** o **cadenas** (lab transmisión)

## RFQ / resultados

- [ ] Copiar RFQ o bloque de resultados en **una máquina** (p. ej. transportador)
- [ ] Copiar RFQ o resultados en **un calc lab** (p. ej. engranajes o rodamientos)

## Guest mode y facturación

- [ ] Modo invitado: límites de créditos según `js/config/features.js`
- [ ] PDF Pro / export según flags en `features.js` (logueado vs invitado)
- [ ] Checkout / registro no rompe sesión (smoke)

## Assets

- [ ] `assets/conveyor-belt-reference.png` responde 200 en el entorno de deploy (`flat-conveyor.html`)

## Fluidos (bloque J)

- [ ] `lab-next-steps` visible en las 4 páginas de fluidos con enlaces correctos
- [ ] Diagramas SVG legibles en **móvil** (&lt;480px) en bomba, prensa y neumático
- [ ] Barra de unidades en `calc-shaft.html` — opción **in** formatea longitudes

## Notas

- Errores de consola: anotar URL, idioma y pasos para reproducir.
- Fecha de pasada: _______________  Responsable: _______________
