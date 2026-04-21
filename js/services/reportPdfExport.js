/**
 * Informe detallado en PDF — disponible con plan Pro (requiere red para cargar jsPDF).
 */

import { BRANDS } from '../data/gearmotorCatalog.js';
import { getBestCatalogPick } from '../ui/driveSelection.js';

const JSPDF_CDN = 'https://esm.sh/jspdf@2.5.2';

/**
 * @param {import('jspdf').jsPDF} doc
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxW
 * @param {number} lineMm
 * @returns {number} nueva Y
 */
function addWrapped(doc, text, x, y, maxW, lineMm) {
  const lines = doc.splitTextToSize(String(text), maxW);
  doc.text(lines, x, y);
  return y + lines.length * lineMm;
}

/**
 * @param {object} payload
 * @param {string} payload.title
 * @param {string} payload.fileBase
 * @param {string} payload.timestamp
 * @param {{ power_kW: number; torque_Nm: number; drum_rpm: number }} payload.requirements
 * @param {Array<{ label: string; value: string }>} payload.inputRows
 * @param {Array<{ label: string; value: string }>} payload.resultRows
 * @param {string[]} [payload.assumptions]
 * @param {string[]} [payload.stepsSummary]
 * @param {string} [payload.topMotor]
 * @param {string} [payload.explanationsBlock]
 * @param {string} payload.disclaimer
 */
export async function exportEngineeringReportPdf(payload) {
  let jsPDF;
  try {
    const mod = await import(/* webpackIgnore: true */ JSPDF_CDN);
    jsPDF = mod.jsPDF;
  } catch {
    throw new Error(
      'No se pudo cargar el generador PDF (jsPDF). Compruebe la conexión a Internet o inténtelo más tarde.',
    );
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const m = 14;
  let y = 18;

  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(payload.title, m, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`DriveLab · ${payload.timestamp}`, m, 24);
  doc.setTextColor(33, 37, 41);
  y = 38;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Punto de trabajo', m, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const req = payload.requirements;
  y = addWrapped(
    doc,
    `Potencia de eje (estim.): ${req.power_kW.toFixed(3)} kW · Par diseño en tambor: ${req.torque_Nm.toFixed(1)} N·m · Velocidad tambor: ${req.drum_rpm.toFixed(2)} min⁻¹`,
    m,
    y,
    pageW - 2 * m,
    5,
  );
  y += 6;

  const section = (title, rows) => {
    if (y > 258) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title, m, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    for (const row of rows) {
      if (y > 278) {
        doc.addPage();
        y = 20;
      }
      y = addWrapped(doc, `${row.label}: ${row.value}`, m, y, pageW - 2 * m, 4.8);
      y += 1.5;
    }
    y += 4;
  };

  section('Datos de entrada', payload.inputRows);
  section('Resultados principales', payload.resultRows);

  if (payload.topMotor) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Sugerencia de catálogo (ejemplo)', m, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    y = addWrapped(doc, payload.topMotor, m, y, pageW - 2 * m, 5);
    y += 6;
  }

  if (payload.explanationsBlock) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Razonamiento (resumen)', m, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    y = addWrapped(doc, payload.explanationsBlock, m, y, pageW - 2 * m, 4.5);
    y += 6;
  }

  if (payload.assumptions?.length) {
    if (y > 235) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Hipótesis del modelo', m, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const a of payload.assumptions) {
      y = addWrapped(doc, `• ${a}`, m, y, pageW - 2 * m, 4.5);
      y += 2;
      if (y > 278) {
        doc.addPage();
        y = 20;
      }
    }
    y += 4;
  }

  if (payload.stepsSummary?.length) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Pasos de cálculo (resumen)', m, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    for (const line of payload.stepsSummary) {
      y = addWrapped(doc, line, m, y, pageW - 2 * m, 4);
      y += 0.5;
      if (y > 278) {
        doc.addPage();
        y = 20;
      }
    }
    y += 6;
  }

  if (y > 255) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  addWrapped(doc, payload.disclaimer, m, y, pageW - 2 * m, 4);

  doc.save(`${payload.fileBase}.pdf`);
}

function formatStepLine(s) {
  const u = s.unit || '';
  let v = '';
  if (u === '°') v = `${Number(s.value).toFixed(2)}°`;
  else if (u === 'N·m') v = `${Number(s.value).toFixed(2)} N·m`;
  else if (u === 'kW') v = `${Number(s.value).toFixed(3)} kW`;
  else if (u === 'N') v = `${Number(s.value).toFixed(1)} N`;
  else v = `${s.value} ${u}`.trim();
  return `${s.title}: ${v}`;
}

/**
 * @param {ReturnType<import('../modules/flatConveyor.js').computeFlatConveyor>} r
 * @param {object} raw
 */
export function buildFlatPdfPayload(raw, r) {
  const d = r.detail || {};
  const pick = getBestCatalogPick({
    power_kW: r.requiredMotorPower_kW,
    torque_Nm: r.torqueWithService_Nm,
    drum_rpm: r.drumRpm,
  });
  const brandName = pick ? BRANDS.find((b) => b.id === pick.m.brandId)?.name || pick.m.brandId : '';

  return {
    title: 'Informe — Cinta transportadora horizontal',
    fileBase: `informe-cinta-plana-${new Date().toISOString().slice(0, 10)}`,
    timestamp: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
    requirements: {
      power_kW: r.requiredMotorPower_kW,
      torque_Nm: r.torqueWithService_Nm,
      drum_rpm: r.drumRpm,
    },
    inputRows: [
      { label: 'Norma de referencia', value: String(raw.designStandard || r.designStandard || '—') },
      { label: 'Tipo de carga (factor servicio)', value: String(raw.loadDuty || r.loadDuty || '—') },
      { label: 'Longitud L', value: `${raw.beltLength_m} m` },
      { label: 'Masa carga', value: `${raw.loadMass_kg} kg` },
      { label: 'Velocidad v', value: `${raw.beltSpeed_m_s} m/s` },
      { label: 'Diámetro tambor D', value: `${raw.rollerDiameter_mm} mm` },
      { label: 'Coef. rozamiento μ', value: String(raw.frictionCoeff) },
      { label: 'Rendimiento η', value: `${r.efficiency_pct_effective ?? raw.efficiency_pct} %` },
      { label: 'Ancho banda B', value: `${raw.beltWidth_m} m` },
      { label: 'Masa banda', value: `${raw.beltMass_kg} kg` },
    ],
    resultRows: [
      ...(r.steadyStandardMultiplier > 1
        ? [{ label: 'Margen normativo régimen', value: `×${r.steadyStandardMultiplier.toFixed(2)} (${r.designStandard})` }]
        : []),
      { label: 'Fuerza régimen (tambor)', value: `${(d.F_steady_N ?? 0).toFixed(0)} N` },
      { label: 'Fuerza arranque (pico)', value: `${(d.F_total_start_N ?? 0).toFixed(0)} N` },
      { label: 'Par diseño (con servicio)', value: `${r.torqueWithService_Nm.toFixed(1)} N·m` },
      { label: 'Potencia motor (eje)', value: `${r.requiredMotorPower_kW.toFixed(3)} kW` },
      { label: 'Velocidad giro tambor', value: `${r.drumRpm.toFixed(2)} min⁻¹` },
      { label: 'Caudal másico', value: `${r.massFlow_kg_s.toFixed(3)} kg/s` },
    ],
    assumptions: r.assumptions || [],
    stepsSummary: (r.steps || []).map(formatStepLine),
    topMotor: pick ? `${pick.m.code} — ${brandName} · ${pick.m.motor_kW} kW · i≈${pick.m.ratio.toFixed(1)} · n₂≈${pick.m.n2_rpm.toFixed(1)} min⁻¹` : '—',
    explanationsBlock: (r.explanations || []).join('\n\n'),
    disclaimer:
      'Documento generado automáticamente por DriveLab. Los datos de motorreductor son de catálogo de demostración. No sustituye proyecto ejecutivo, normativa aplicable ni validación del fabricante. Revise siempre fichas técnicas y condiciones de servicio (S1, temperatura, ciclo, freno, etc.).',
  };
}

/**
 * @param {ReturnType<import('../modules/inclinedConveyor.js').computeInclinedConveyor>} r
 * @param {object} raw
 */
export function buildInclinedPdfPayload(raw, r) {
  const d = r.detail || {};
  const pick = getBestCatalogPick({
    power_kW: r.requiredMotorPower_kW,
    torque_Nm: r.torqueWithService_Nm,
    drum_rpm: r.drumRpm,
  });
  const brandName = pick ? BRANDS.find((b) => b.id === pick.m.brandId)?.name || pick.m.brandId : '';

  return {
    title: 'Informe — Cinta transportadora inclinada',
    fileBase: `informe-cinta-inclinada-${new Date().toISOString().slice(0, 10)}`,
    timestamp: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
    requirements: {
      power_kW: r.requiredMotorPower_kW,
      torque_Nm: r.torqueWithService_Nm,
      drum_rpm: r.drumRpm,
    },
    inputRows: [
      { label: 'Norma de referencia', value: String(raw.designStandard || r.designStandard || '—') },
      { label: 'Tipo de carga', value: String(raw.loadDuty || r.loadDuty || '—') },
      { label: 'Longitud L', value: `${raw.length_m} m` },
      { label: 'Desnivel H', value: `${raw.height_m} m` },
      {
        label: 'Ángulo θ',
        value: raw.angle_deg != null && Number.isFinite(raw.angle_deg) ? `${raw.angle_deg}°` : 'auto (H/L)',
      },
      { label: 'Masa carga', value: `${raw.loadMass_kg} kg` },
      { label: 'Velocidad v', value: `${raw.beltSpeed_m_s} m/s` },
      { label: 'Diámetro tambor D', value: `${raw.rollerDiameter_mm} mm` },
      { label: 'μ', value: String(raw.frictionCoeff) },
      { label: 'η', value: `${r.efficiency_pct_effective ?? raw.efficiency_pct} %` },
    ],
    resultRows: [
      ...(r.steadyStandardMultiplier > 1
        ? [{ label: 'Margen normativo régimen', value: `×${r.steadyStandardMultiplier.toFixed(2)} (${r.designStandard})` }]
        : []),
      { label: 'Ángulo de pendiente', value: `${r.angle_deg.toFixed(2)}°` },
      { label: 'Fuerza régimen', value: `${(d.F_steady_N ?? 0).toFixed(0)} N` },
      { label: 'Fuerza arranque', value: `${(d.F_total_start_N ?? 0).toFixed(0)} N` },
      { label: 'Par diseño', value: `${r.torqueWithService_Nm.toFixed(1)} N·m` },
      { label: 'Potencia motor', value: `${r.requiredMotorPower_kW.toFixed(3)} kW` },
      { label: 'n tambor', value: `${r.drumRpm.toFixed(2)} min⁻¹` },
    ],
    assumptions: r.assumptions || [],
    stepsSummary: (r.steps || []).map(formatStepLine),
    topMotor: pick ? `${pick.m.code} — ${brandName} · ${pick.m.motor_kW} kW · i≈${pick.m.ratio.toFixed(1)}` : '—',
    explanationsBlock: (r.explanations || []).join('\n\n'),
    disclaimer:
      'Documento generado automáticamente por DriveLab. Datos de motorreductor de demostración. Valide con fabricante y normativa. En pendiente revise seguridad (freno, anti-retorno, paradas).',
  };
}

/**
 * @param {object} raw — entradas leídas del formulario bomba
 * @param {object} r — resultado de computeCentrifugalPump
 */
export function buildPumpPdfPayload(raw, r) {
  const d = r.detail || {};
  const pick = getBestCatalogPick({
    power_kW: r.requiredMotorPower_kW,
    torque_Nm: r.torqueWithService_Nm,
    drum_rpm: r.drumRpm,
  });
  const brandName = pick ? BRANDS.find((b) => b.id === pick.m.brandId)?.name || pick.m.brandId : '';

  const flowLabel = raw.flowUnit === 'lmin' ? 'L/min' : 'm³/h';
  const instLines = raw.installationProActive
    ? [
        {
          label: 'Presión succión (manométrica)',
          value:
            raw.suctionPressure_kPa_gauge != null && Number.isFinite(raw.suctionPressure_kPa_gauge)
              ? `${raw.suctionPressure_kPa_gauge} kPa`
              : '—',
        },
        {
          label: 'Diámetro tubería impulsión',
          value: raw.pipeDiameter_mm != null ? `${raw.pipeDiameter_mm} mm` : '—',
        },
        {
          label: 'Horas uso diario',
          value: raw.dailyRunHours != null ? `${raw.dailyRunHours} h/día` : '—',
        },
      ]
    : [];

  return {
    title: 'Informe — Bomba centrífuga (punto de trabajo)',
    fileBase: `informe-bomba-${new Date().toISOString().slice(0, 10)}`,
    timestamp: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
    requirements: {
      power_kW: r.requiredMotorPower_kW,
      torque_Nm: r.torqueWithService_Nm,
      drum_rpm: r.drumRpm,
    },
    inputRows: [
      { label: 'Caudal Q', value: `${raw.flowValue} ${flowLabel}` },
      { label: 'Altura manométrica H', value: `${raw.head_m} m` },
      { label: 'Rendimiento bomba η', value: `${raw.etaPump_pct} %` },
      { label: 'Tipo de fluido', value: String(raw.fluidType || '—') },
      { label: 'Densidad ρ', value: `${raw.rho_kg_m3} kg/m³` },
      { label: 'Viscosidad cinemática', value: `${raw.viscosity_mm2_s} mm²/s` },
      { label: 'Temperatura', value: `${raw.temp_C} °C` },
      { label: 'Régimen eje bomba', value: `${raw.pumpSpeed_rpm} min⁻¹` },
      { label: 'Tipo de carga (SF)', value: String(raw.loadDuty || '—') },
      { label: 'Acoplamiento', value: raw.couplingType === 'direct' ? 'Directo' : 'Motorreductor' },
      { label: 'Tensión / frecuencia', value: `${raw.voltage_V} V · ${raw.frequency_Hz} Hz` },
      ...instLines,
    ],
    resultRows: [
      { label: 'Potencia hidráulica P_h', value: `${r.hydraulicPower_kW.toFixed(3)} kW` },
      { label: 'Potencia eje bomba (antes SF)', value: `${r.shaftPower_kW.toFixed(3)} kW` },
      { label: 'Factor viscosidad / fluido (orient.)', value: `${(r.viscosityFactor ?? 1).toFixed(3)}` },
      { label: 'Caudal másico', value: `${r.massFlow_kg_s.toFixed(3)} kg/s` },
      { label: 'Par eje (régimen)', value: `${r.torqueAtDrum_Nm.toFixed(1)} N·m` },
      { label: 'Par diseño (con servicio)', value: `${r.torqueWithService_Nm.toFixed(1)} N·m` },
      { label: 'Potencia motor orientativa', value: `${r.requiredMotorPower_kW.toFixed(3)} kW` },
      { label: 'Velocidad giro eje', value: `${r.drumRpm.toFixed(2)} min⁻¹` },
      { label: 'Factor servicio usado', value: `${(r.serviceFactorUsed ?? 1).toFixed(3)}` },
    ],
    assumptions: r.assumptions || [],
    stepsSummary: (r.steps || []).map(formatStepLine),
    topMotor: pick
      ? `${pick.m.code} — ${brandName} · ${pick.m.motor_kW} kW · i≈${pick.m.ratio.toFixed(1)} · n₂≈${pick.m.n2_rpm.toFixed(1)} min⁻¹`
      : '—',
    explanationsBlock: (r.explanations || []).join('\n\n'),
    disclaimer:
      'Documento generado automáticamente por DriveLab. Modelo de punto único (Q,H,η); no sustituye curvas del fabricante, NPSH ni proyecto de tuberías. Datos de motorreductor de demostración.',
  };
}

/**
 * @param {object} raw
 * @param {object} r — computeScrewConveyor
 */
export function buildScrewPdfPayload(raw, r) {
  const pick = getBestCatalogPick({
    power_kW: r.requiredMotorPower_kW,
    torque_Nm: r.torqueWithService_Nm,
    drum_rpm: r.drumRpm,
  });
  const brandName = pick ? BRANDS.find((b) => b.id === pick.m.brandId)?.name || pick.m.brandId : '';
  const capU = raw.capUnit === 'th' ? 't/h' : 'm³/h';
  const dU = raw.diamUnit === 'in' ? 'in' : 'mm';
  const pU = raw.pitchUnit === 'in' ? 'in' : 'mm';
  const wear = (x) => (x === 'high' ? 'Alta' : x === 'medium' ? 'Media' : 'Baja');

  return {
    title: 'Informe — Transportador de tornillo helicoidal',
    fileBase: `informe-tornillo-${new Date().toISOString().slice(0, 10)}`,
    timestamp: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
    requirements: {
      power_kW: r.requiredMotorPower_kW,
      torque_Nm: r.torqueWithService_Nm,
      drum_rpm: r.drumRpm,
    },
    inputRows: [
      { label: 'Capacidad', value: `${raw.capValue} ${capU}` },
      { label: 'Ø tornillo', value: `${raw.diamValue} ${dU}` },
      { label: 'Paso', value: `${raw.pitchValue} ${pU}` },
      { label: 'Longitud transporte', value: `${raw.length_m} m` },
      { label: 'Inclinación', value: `${raw.angle_deg}°` },
      { label: 'Densidad aparente', value: `${raw.rho_kg_m3} kg/m³` },
      { label: 'Trough loading', value: `${raw.troughLoadPct ?? '30'} %` },
      { label: 'Abrasividad', value: wear(raw.abrasive) },
      { label: 'Corrosividad', value: wear(raw.corrosive) },
      { label: 'μ material–acero', value: String(raw.frictionCoeff) },
      { label: 'η mecánica apoyos', value: `${raw.bearingMechanicalEff_pct} %` },
      { label: 'Tipo de carga (SF)', value: String(raw.loadDuty || '—') },
    ],
    resultRows: [
      { label: 'RPM tornillo (modelo)', value: `${r.screwRpm.toFixed(1)} min⁻¹` },
      { label: 'RPM tope orientativo', value: `${r.screwRpmMaxSuggested.toFixed(0)} min⁻¹` },
      { label: 'Riesgo RPM', value: r.rpmRisk?.label || '—' },
      { label: 'Potencia eje (sin SF extra servicio)', value: `${r.shaftPower_kW.toFixed(3)} kW` },
      { label: 'Potencia accionamiento (diseño)', value: `${r.requiredMotorPower_kW.toFixed(3)} kW` },
      { label: 'Potencia HP (diseño)', value: `${(r.requiredMotorPower_kW * 1.34102).toFixed(3)} HP` },
      { label: 'Par eje (régimen)', value: `${r.torqueAtDrum_Nm.toFixed(1)} N·m` },
      { label: 'Par diseño (× SF)', value: `${r.torqueWithService_Nm.toFixed(1)} N·m` },
      { label: 'Caudal másico', value: `${r.massFlow_kg_s.toFixed(3)} kg/s` },
      { label: 'Factor servicio usado', value: `${(r.serviceFactorUsed ?? 1).toFixed(3)}` },
    ],
    assumptions: r.assumptions || [],
    stepsSummary: (r.steps || []).map(formatStepLine),
    topMotor: pick
      ? `${pick.m.code} — ${brandName} · ${pick.m.motor_kW} kW · i≈${pick.m.ratio.toFixed(1)} · n₂≈${pick.m.n2_rpm.toFixed(1)} min⁻¹`
      : '—',
    explanationsBlock: (r.explanations || []).join('\n\n'),
    disclaimer:
      'Documento generado automáticamente por DriveLab. Modelo orientativo de tornillo; no sustituye CEMA 350 completo ni datos del fabricante. Revise RPM máximas y desgaste con el proveedor del equipo.',
  };
}

/**
 * @param {HTMLElement | null} el
 * @param {{ isPremium: boolean; getPayload: () => object }} opts
 */
export function mountPremiumPdfExportBar(el, opts) {
  if (!el) return;

  if (opts.isPremium) {
    el.innerHTML = `
      <div class="premium-export premium-export--active">
        <div class="premium-export__copy">
          <span class="premium-export__badge">Pro</span>
          <div>
            <strong>Exportar informe PDF</strong>
            <p class="premium-export__hint">Incluye entradas, resultados, hipótesis, razonamiento y resumen de pasos. Requiere conexión para generar el archivo.</p>
          </div>
        </div>
        <button type="button" class="premium-export__btn" data-pdf-export>Descargar PDF</button>
      </div>`;
    el.hidden = false;
    const btn = el.querySelector('[data-pdf-export]');
    btn?.addEventListener('click', async () => {
      try {
        await exportEngineeringReportPdf(opts.getPayload());
      } catch (e) {
        window.alert(String(e?.message || e));
      }
    });
  } else {
    el.hidden = false;
    el.innerHTML = `
      <div class="premium-export premium-export--teaser">
        <span class="premium-export__badge premium-export__badge--muted">Pro</span>
        <p class="premium-export__teaser-text">La exportación completa del informe en <strong>PDF</strong> está disponible con el plan Pro.</p>
        <a class="premium-export__link" href="?pro=1">Probar acceso Pro</a>
      </div>`;
  }
}
