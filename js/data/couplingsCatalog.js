/**
 * Datos representativos tipo catálogo (no sustituyen hojas oficiales Lovejoy/KTR/Flender).
 * T_nom en N·m a velocidad nominal de catálogo; uso orientativo en selector.
 */

export const COUPLING_BRANDS = [
  {
    id: 'lovejoy',
    label: 'Lovejoy / estilo L (Jaw)',
    series: [
      { model: 'L035', family: 'Jaw', T_nom_Nm: 3.2, bore_max_mm: 16, note: 'Mini flexible' },
      { model: 'L050', family: 'Jaw', T_nom_Nm: 6.5, bore_max_mm: 22, note: 'Uso general' },
      { model: 'L070', family: 'Jaw', T_nom_Nm: 13, bore_max_mm: 28, note: 'Mayor elastómero' },
      { model: 'L075', family: 'Jaw', T_nom_Nm: 24, bore_max_mm: 32, note: 'Industrial ligero' },
      { model: 'L095', family: 'Jaw', T_nom_Nm: 52, bore_max_mm: 42, note: 'Taller / bomba' },
      { model: 'L100', family: 'Jaw', T_nom_Nm: 95, bore_max_mm: 48, note: 'Transmisión media' },
      { model: 'L110', family: 'Jaw', T_nom_Nm: 160, bore_max_mm: 55, note: 'Alto par' },
      { model: 'L150', family: 'Jaw', T_nom_Nm: 270, bore_max_mm: 65, note: 'Servicio pesado' },
      { model: 'L190', family: 'Jaw', T_nom_Nm: 480, bore_max_mm: 80, note: 'Grandes conjuntos' },
    ],
  },
  {
    id: 'ktr',
    label: 'KTR (ROTEX / estilo)',
    series: [
      { model: 'ROTEX 14', family: 'Jaw', T_nom_Nm: 10, bore_max_mm: 24, note: 'Compacto' },
      { model: 'ROTEX 19', family: 'Jaw', T_nom_Nm: 22, bore_max_mm: 32, note: 'Estándar' },
      { model: 'ROTEX 24', family: 'Jaw', T_nom_Nm: 45, bore_max_mm: 38, note: 'Media potencia' },
      { model: 'ROTEX 28', family: 'Jaw', T_nom_Nm: 90, bore_max_mm: 48, note: 'Versátil' },
      { model: 'ROTEX 38', family: 'Jaw', T_nom_Nm: 180, bore_max_mm: 60, note: 'Alta densidad' },
      { model: 'ROTEX 42', family: 'Jaw', T_nom_Nm: 260, bore_max_mm: 65, note: 'Servicio duro' },
      { model: 'ROTEX 48', family: 'Jaw', T_nom_Nm: 400, bore_max_mm: 75, note: 'Gran diámetro' },
    ],
  },
  {
    id: 'flender',
    label: 'Flender N-Eupex / estilo Grid-Gear',
    series: [
      { model: 'N-Eupex 80', family: 'Pin / elastómero', T_nom_Nm: 28, bore_max_mm: 38, note: 'B10x' },
      { model: 'N-Eupex 95', family: 'Pin / elastómero', T_nom_Nm: 56, bore_max_mm: 45, note: 'B12x' },
      { model: 'N-Eupex 110', family: 'Pin / elastómero', T_nom_Nm: 100, bore_max_mm: 55, note: 'Motoreductor' },
      { model: 'N-Eupex 125', family: 'Pin / elastómero', T_nom_Nm: 180, bore_max_mm: 65, note: 'Alta inercia' },
      { model: 'Zapex ZN 100', family: 'Gear', T_nom_Nm: 320, bore_max_mm: 70, note: 'Dientes rígidos' },
      { model: 'Zapex ZN 125', family: 'Gear', T_nom_Nm: 520, bore_max_mm: 85, note: 'Sin holgura' },
      { model: 'Rupex 140', family: 'Grid', T_nom_Nm: 750, bore_max_mm: 95, note: 'Grid flexible' },
      { model: 'Rupex 160', family: 'Grid', T_nom_Nm: 1200, bore_max_mm: 110, note: 'Muy alto par' },
    ],
  },
  {
    id: 'rexnord',
    label: 'Rexnord / Falk (estilo grid-elástico)',
    series: [
      { model: 'Steelflex 1020T', family: 'Grid', T_nom_Nm: 95, bore_max_mm: 45, note: 'Cargas cíclicas moderadas' },
      { model: 'Steelflex 1030T', family: 'Grid', T_nom_Nm: 190, bore_max_mm: 58, note: 'Servicio industrial general' },
      { model: 'Steelflex 1040T', family: 'Grid', T_nom_Nm: 360, bore_max_mm: 70, note: 'Par elevado' },
      { model: 'Steelflex 1050T', family: 'Grid', T_nom_Nm: 650, bore_max_mm: 85, note: 'Choques moderados' },
    ],
  },
  {
    id: 'ringfeder',
    label: 'Ringfeder / TSCHAN (estilo mandíbula)',
    series: [
      { model: 'TNS S-LSt 65', family: 'Jaw', T_nom_Nm: 60, bore_max_mm: 42, note: 'Compacto de uso general' },
      { model: 'TNS S-LSt 80', family: 'Jaw', T_nom_Nm: 120, bore_max_mm: 50, note: 'Media potencia' },
      { model: 'TNS S-LSt 100', family: 'Jaw', T_nom_Nm: 240, bore_max_mm: 62, note: 'Par medio-alto' },
      { model: 'TNS S-LSt 125', family: 'Jaw', T_nom_Nm: 420, bore_max_mm: 75, note: 'Servicio pesado' },
    ],
  },
];
