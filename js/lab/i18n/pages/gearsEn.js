/** calc-gears.html — EN copy (data-lab-t keys) */
export const GEARS_EN = {
  __docTitle: 'Spur gears — Lab',
  gH2: 'Spur gears — geometry and kinematics',
  gLead:
    'Standard external geometry: <strong>a = m(z?+z?)/2</strong>, ha = m, hf = 1.25m. Kinematics at the <strong>pitch circle</strong>. Strength check follows a <strong>simplified AGMA 2001–inspired model</strong> (Lewis + approximate contact) — it does not replace the full method or certified material data.',
  gDiagTitle: 'Schematic view — updates when inputs change',
  gDiagAria: 'Gear pair diagram',
  gDiagCaption:
    'Dashed circle: pitch. Dimensions <strong>a</strong>, <strong>z</strong> and module are indicative; not a workshop drawing.',
  gZ1Lbl: 'z? (driver) · teeth',
  gZ1Help:
    'Pinion tooth count. With module defines pitch diameter <strong>d? = m·z?</strong> (mm): more teeth mean larger diameter at the same m.',
  gZ1Ico: 'Pinion tooth count',
  gZ2Lbl: 'z? · teeth',
  gZ2Help:
    'Driven gear teeth. Reduction ratio at pitch is approximately <strong>z?/z?</strong> (slower output if z? &gt; z?).',
  gZ2Ico: 'Gear teeth',
  gMLbl: 'Module m (mm)',
  gMHelp:
    '<strong>Module m</strong> (mm): tooth size; circular pitch p = ?m. Larger m ? taller teeth and more robust gears (same z).',
  gMIco: 'Normal module',
  gFaceLbl: 'Face width b (mm)',
  gFaceHelp:
    '<strong>Face width b</strong>: axial contact length between flanks; enters bending resistance (load sharing area).',
  gFaceIco: 'Face width',
  gAlphaLbl: 'Pressure angle ? (°)',
  gAlphaHelp:
    '<strong>Pressure angle ?</strong>: angle between line of action and pitch tangent; standard gears often use <strong>20°</strong>. Sets tooth form and force split.',
  gAlphaIco: 'Pressure angle',
  gN1Lbl: 'Input speed n? (RPM)',
  gN1Help:
    'Pinion rpm. Kinematics: <strong>n? = n?·z?/z?</strong>. Pitch line speed uses <strong>v = ? d n / 60 000</strong> (d in mm ? m/s).',
  gN1Ico: 'Input speed',
  gN1Hint: '0 = skip n?, ? and v_p',
  gLubeLbl: 'Lubrication (v_p limit)',
  gLubeHelp:
    'App compares <strong>pitch line v</strong> with indicative limits for grease (lower) or oil; confirm with OEM and duty.',
  gLubeIco: 'Lubrication type',
  gLubeGrease: 'Grease',
  gLubeOil: 'Oil (bath / splash)',
  gPowerLbl: 'Power on pinion P (kW) · optional',
  gPowerHelp:
    'Power on the <strong>pinion</strong> shaft. If <strong>T</strong> is filled, it wins; P drives tangential load and motor comparison.',
  gPowerIco: 'Power on pinion',
  gPowerPh: 'e.g. 4.5',
  gPowerHint: 'With P and n?, T is estimated for simplified AGMA',
  gTorqueLbl: 'Pinion torque T (N·m) · optional',
  gTorqueHelp:
    'Pinion torque (N·m). With n? gives P = T·?; with d? tangential load <strong>F? ? T/(d?/2)</strong> for the simplified check.',
  gTorqueIco: 'Pinion torque',
  gTorquePh: 'overrides P',
  gUnitsTitle: 'How to read results',
  gUnitsTip: 'Module, radii and centre distance in mm; angular speed (RPM, rad/s); pitch line speed.',
  gUnitsLen: 'Lengths',
  gUnitsRot: 'Rotation',
  gUnitsLin: 'Line speed',
  gOptMm: 'mm (shop)',
  gOptCm: 'cm',
  gOptM: 'm (SI)',
  gOptRpm: 'RPM',
  gOptRads: 'rad/s',
  gOptMs: 'm/s',
  gOptMms: 'mm/s',
  gOptKmh: 'km/h',
  gSumElem: 'Per-element results',
  gSumFull: 'Full result',
  gConvTitle: 'Converter (spur gears)',
};
