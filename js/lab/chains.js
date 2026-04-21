/**
 * Cadena de rodillos — longitud en pasos, relación cinemática por diámetros primitivos ISO.
 */

import { getChainById } from './chainCatalog.js';
import { chainAssemblyHints } from './chainCatalog.js';
import { rpmToRadPerSec } from './siUnits.js';

/** Diámetro primitivo (paso) mm — D = p / sin(π/z) */
export function chainPitchDiameter_mm(pitch_mm, z) {
  return pitch_mm / Math.sin(Math.PI / z);
}

/**
 * @param {object} p
 * @param {string} [p.chainRefId] — id en chainCatalog.js
 * @param {boolean} [p.useManualPitch] — si true, usa pitch_mm del formulario
 * @param {number} [p.pitch_mm] — paso manual o respaldo
 * @param {number} p.z1
 * @param {number} p.z2
 * @param {number} p.center_mm — distancia entre ejes
 * @param {number} [p.n1_rpm] — velocidad piñón motriz (z₁)
 */
export function computeRollerChain(p) {
  let pitch = null;
  let chainRefLabel = '';
  let chainNorm = '';
  let rollerDiameter_mm = null;

  if (p.chainRefId) {
    const row = getChainById(p.chainRefId);
    if (row) {
      pitch = row.pitch_mm;
      chainRefLabel = row.label;
      chainNorm = row.norm;
      rollerDiameter_mm = row.rollerDiameter_mm;
    }
  }

  const manual = Number(p.pitch_mm);
  if (p.useManualPitch && Number.isFinite(manual) && manual > 0) {
    pitch = manual;
  } else if (pitch == null) {
    pitch = Math.max(4, Number.isFinite(manual) && manual > 0 ? manual : 19.05);
  }

  const z1 = Math.max(6, Math.round(Number(p.z1) || 17));
  const z2 = Math.max(6, Math.round(Number(p.z2) || 25));
  const C = Math.max(2 * pitch, Number(p.center_mm) || 400);
  const Cd = C / pitch;
  const inv = ((z2 - z1) * (z2 - z1)) / (4 * Math.PI * Math.PI * Cd);
  const Lp = 2 * Cd + (z1 + z2) / 2 + inv;
  const LpRound = Math.ceil(Lp);

  const D1 = chainPitchDiameter_mm(pitch, z1);
  const D2 = chainPitchDiameter_mm(pitch, z2);
  const assembly = chainAssemblyHints(Lp);

  const n1 = Number(p.n1_rpm);
  const n1f = Number.isFinite(n1) && n1 > 0 ? n1 : null;
  const omega1_rad_s = n1f != null ? rpmToRadPerSec(n1f) : null;
  /** Misma velocidad lineal en primitivos: ω₁·D₁/2 = ω₂·D₂/2 */
  const omega2_rad_s = omega1_rad_s != null ? (omega1_rad_s * D1) / D2 : null;
  const n2_rpm = omega2_rad_s != null ? (omega2_rad_s * 60) / (2 * Math.PI) : null;

  const D1_m = D1 / 1000;
  const linearSpeed_m_s = omega1_rad_s != null ? omega1_rad_s * (D1_m / 2) : null;
  /** Articulaciones por segundo en el piñón motriz: z₁ vueltas/s. */
  const articulationFrequency_Hz = n1f != null ? (z1 * n1f) / 60 : null;
  const zMin = Math.min(z1, z2);
  const polygonalEffect =
    zMin < 17
      ? {
          active: true,
          text: 'Efecto poligonal (z < 17 en el piñón más pequeño): la cadena se enrolla sobre un polígono — velocidad angular y tensión fluctúan. Se recomienda z ≥ 17–19 para marcha más uniforme; valide vibración y ruido.',
        }
      : { active: false, text: '' };

  let chainLubrication = /** @type {{ class: string; label: string; detail: string }} */ ({
    class: '—',
    label: 'Indique n₁ para recomendar',
    detail: '',
  });
  if (linearSpeed_m_s != null && Number.isFinite(linearSpeed_m_s)) {
    const v = linearSpeed_m_s;
    if (v < 0.5) {
      chainLubrication = {
        class: 'I',
        label: 'Lubricación manual o discontinua',
        detail: 'v muy baja: re-engrase puntual; normas ISO 10823 / DIN 8187 orientan tipo I para velocidades bajas.',
      };
    } else if (v < 4) {
      chainLubrication = {
        class: 'I–II',
        label: 'Goteo o baño parcial',
        detail: 'Velocidad baja–media: baño ligero o goteo según fabricante.',
      };
    } else if (v < 10) {
      chainLubrication = {
        class: 'II',
        label: 'Baño / salpicadura',
        detail: 'v media: lubricación tipo II (aceite en carcasa) habitual en transmisiones industriales.',
      };
    } else {
      chainLubrication = {
        class: 'III',
        label: 'Circulación forzada / chorro',
        detail: 'v alta: tipo III (bomba, refrigeración) para evitar desgaste por falta de lubricación.',
      };
    }
  }

  return {
    pitch_mm: pitch,
    chainRefLabel,
    chainNorm,
    rollerDiameter_mm,
    z1,
    z2,
    center_mm: C,
    pitchDiameter1_mm: D1,
    pitchDiameter2_mm: D2,
    chainLength_pitches: Lp,
    chainLength_pitches_roundUp: LpRound,
    ratio_teeth: z2 / z1,
    ratio_primitive: D2 / D1,
    center_pitches: Cd,
    assembly,
    n1_rpm: n1f,
    n2_rpm,
    omega1_rad_s,
    omega2_rad_s,
    linearSpeed_m_s,
    articulationFrequency_Hz,
    polygonalEffect,
    chainLubrication,
    normsNote: 'DIN 8187 (ISO 606) paso métrico; ANSI B29.1 series inch — catálogo de paso según referencia.',
  };
}
