# Vídeo publicitario TheMechAssist (~45 s)

## Sobre tu archivo `2026-05-22 14-06-06.mkv`

- **Tamaño:** ~65 MB (grabación de pantalla típica en buena calidad).
- **No pude reproducir el vídeo** en este entorno (falta ffmpeg). Por el flujo del proyecto (`promo-30s.html`) y la fecha, asumo que es un **recorrido por la web** (home, hubs, calculadoras).
- Si el MKV ya muestra eso, úsalo como **material B-roll** y sincronízalo con el guion de abajo.

---

## Objetivo del anuncio

| Elemento | Detalle |
|----------|---------|
| **Público** | Taller, mantenimiento, oficina técnica, proyectista junior |
| **Dolor** | Excel lento, dudas normativas, retrabajo en transmisión / máquinas |
| **Promesa** | Resultados orientativos en segundos, basados en normas, **gratis para empezar** |
| **CTA** | `www.themechassist.com` — «Explorar calculadoras gratis» |

**Formato recomendado:** 1920×1080, 16:9, español (voz o solo texto + música).

---

## Guion 45 s (voz en off + texto en pantalla)

| Tiempo | Visual | Voz en off | Texto en pantalla |
|--------|--------|------------|-------------------|
| **0:00–0:04** | Plano rápido: Excel / calculadora / taller (o pantalla borrosa) | «¿Cuánto tardas en dimensionar una correa, un engranaje o una cinta?» | **¿A mano otra vez?** |
| **0:04–0:08** | Logo + home TheMechAssist | «TheMechAssist: calculadoras profesionales de ingeniería mecánica, en el navegador.» | **TheMechAssist** · Ingeniería mecánica en la nube |
| **0:08–0:12** | Hub **Máquinas** ? tarjeta cinta plana | «Máquinas y transporte: cintas, elevadores, tornillos…» | **Máquinas y transporte** |
| **0:12–0:20** | **Cinta plana**: cambiar carga ? resultados (kW, par) | «Introducís datos. En segundos: tensión, potencia, criterio de motor.» | **Datos ? Resultados** |
| **0:20–0:24** | Hub **Laboratorio de transmisión** | «Transmisión: engranajes, correas, rodamientos, ejes…» | **Laboratorio de transmisión** |
| **0:24–0:31** | **Engranajes**: z?, par ? diagrama + resultados | «Módulo, par, relación de transmisión. Todo actualizado al vuelo.» | **Engranajes · Correas** |
| **0:31–0:36** | **Correas**: 7,5 kW, 1450 rpm ? KPI par / velocidad | «Correas V, síncronas, Poly-V: selección orientativa al instante.» | **Calculadora de correas** |
| **0:36–0:41** | **Cilindro hidráulico** (carga, presión) | «Hidráulica y neumática con el mismo flujo claro.» | **Fluidos · Hidráulica** |
| **0:41–0:45** | Logo + URL sobre fondo marca | «La mayoría gratis. Empezá hoy en themechassist.com.» | **www.themechassist.com** · **Empieza gratis** |

**Duración total:** 45 s.

---

## Cómo grabar la versión «limpia» (sin editar el MKV)

1. En la carpeta del proyecto: `npx serve .`
2. Abrir `http://localhost:3000/promo-45s.html?record=1`
3. OBS / Xbox Game Bar: grabar **1920×1080**, ventana del navegador a pantalla completa.
4. Música de fondo (opcional): corporativa ligera, **-18 LUFS**, sin distracción.
5. Exportar MP4 H.264 para Meta, LinkedIn, web.

---

## Cómo editar tu MKV a 45 s (CapCut / Premiere / DaVinci)

1. Importar `2026-05-22 14-06-06.mkv`.
2. **Cortar** siguiendo la tabla de tiempos (busca en la timeline: home ? machines-hub ? flat ? lab ? gears ? belts ? hydraulic).
3. Acelerar tramos muertos (scroll sin acción) a **1,5×–2×**.
4. Añadir **títulos** de la columna «Texto en pantalla» (fuente Inter, blanco sobre banda oscura).
5. **Gancho 0–4 s:** si el MKV empieza directo en la web, inserta 4 s de intro (texto + música) antes del primer frame útil.
6. **CTA final:** congelar último frame 2 s + logo SVG `logo-themechassist.svg`.
7. Subtítulos quemados (mucho tráfico móvil sin sonido).

---

## Variantes por canal

| Canal | Duración | Cambio |
|-------|----------|--------|
| Instagram Reels / TikTok | 30 s | Quitar hidráulica; CTA en 0:28 |
| LinkedIn | 45 s | Guion completo + «Para oficina técnica» en 0:04 |
| YouTube pre-roll | 15 s | Solo gancho + home + CTA |

---

## Textos legales (pantalla final 1 s, pequeño)

«Resultados orientativos. No sustituyen ingeniería de detalle ni validación del fabricante.»

---

## Checklist antes de publicar

- [ ] URL legible: **www.themechassist.com**
- [ ] Sin datos personales en la grabación
- [ ] KPIs con unidades correctas (N·m, kW, m/s)
- [ ] Audio normalizado
- [ ] Primera imagen atractiva (thumbnail = frame cinta o correas con resultados)
