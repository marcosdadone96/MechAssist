/** English strings for calc-hydraulic-pump.html (`hpump.*` keys). ASCII-safe. */
export const HYDRAULIC_PUMP_EN = {
  'hpump.docTitle': 'Hydraulic pump calculator online \u2014 TheMechAssist',
  'hpump.h2': 'Hydraulic pump \u00b7 flow, power and pipe sizing',
  'hpump.heroLead':
    'Actual flow, shaft power and indicative pipe sizing from displacement, speed, pressure and efficiencies.',
  'hpump.helpSummary': 'Methodology and model limits',
  'hpump.presetsLabel': 'Typical examples:',
  'hpump.diagTitle': 'Schematic view \u00b7 pump and circuit',
  'hpump.diagAriaLabel': 'Cross-section schematic by pump type',
  'hpump.pipeDiagAriaLabel': 'Pipe schematic with pressure loss gradient',
  'hpump.labelTier': 'Report detail level',
  'hpump.optBasic': 'Classroom (basic)',
  'hpump.optProject': 'Project (NPSH + tank elevation)',
  'hpump.labelTankZ': 'Fluid level above pump inlet z (m)',
  'hpump.labelNPSHr': 'Pump NPSHr (m) \u2014 nameplate',
  'hpump.labelOilTemp': 'Oil temperature (\u00b0C)',
  'hpump.labelMode': 'What do you want to calculate?',
  'hpump.optDesign': 'Design new installation',
  'hpump.optDiagnostic': 'Diagnose existing machine',
  'hpump.seoSummary': 'Extended context and usage notes',
  'hpump.labelDisplacement': 'Displacement V\u1d4d (cm\u00b3/rev)',
  'hpump.helpDisplacement':
    'Geometric volume swept per revolution. Actual flow is lower due to volumetric efficiency (leakage and compressibility).',
  'hpump.labelSpeed': 'Speed n (rpm)',
  'hpump.helpSpeed': 'Pump shaft speed. Typical gear pumps: 1000\u20133500\u00a0rpm.',
  'hpump.labelPressure': 'Operating pressure p (bar)',
  'hpump.helpPressure':
    'Differential pressure between outlet and inlet. Shaft power and torque scale linearly with p.',
  'hpump.labelVolEff': 'Volumetric efficiency \u03b7\u1d65 (%)',
  'hpump.helpVolEff':
    'Ratio of actual to theoretical flow. Reduces with pressure and wear. Gear pumps typically 90\u201396\u00a0%.',
  'hpump.labelMechEff': 'Mechanical efficiency \u03b7\u2098 (%)',
  'hpump.helpMechEff':
    'Accounts for friction in bearings and gears. Overall efficiency = \u03b7\u1d65\u00a0\u00d7\u00a0\u03b7\u2098.',
  'hpump.labelFluidType': 'Fluid type',
  'hpump.helpFluidType':
    'Standard: mineral hydraulic oil ISO VG 32\u201368 (e.g. HLP 46). Project mode: indicative \u03c1(T) and Pv(T) for NPSHa. Not valid for glycol, bio-based oils or emulsions unless you choose Other and enter \u03c1 and \u03bd manually.',
  'hpump.helpOilTemp':
    'With mineral ISO VG oil, project mode applies indicative \u03c1(T) and Pv(T) for NPSHa. Does not auto-adjust line viscosity \u03bd.',
  'hpump.labelDensity': 'Density \u03c1 (kg/m\u00b3)',
  'hpump.helpDensity':
    'Fluid density at service temperature (datasheet or measurement). Used in head loss and NPSHa.',
  'hpump.helpViscosity':
    'Enter kinematic viscosity \u03bd (cSt) at service temperature (datasheet or VG table). The model does not adjust \u03bd with temperature automatically.',
  'hpump.fluidModelFootnote':
    'Viscosity model is for mineral ISO VG 32\u201368 hydraulic oil. For water-glycol, bio-based fluids, emulsions or other media, select Other and enter density \u03c1 and viscosity \u03bd manually.',
  'hpump.optFluidMineral': 'Mineral hydraulic oil ISO VG 32\u201368 (HLP/HM)',
  'hpump.optFluidCustom': 'Other (water-glycol, bio-based, emulsion\u2026)',
  'hpump.sectionPipe': 'Pipe sizing',
  'hpump.labelPipeDiam': 'Pipe inner diameter (mm)',
  'hpump.labelLineType': 'Line type',
  'hpump.hintLineType': 'Updates recommended velocity band and alert thresholds',
  'hpump.optLineSuction': 'Suction',
  'hpump.optLinePressure': 'Pressure',
  'hpump.optLineReturn': 'Return',
  'hpump.helpLineType':
    'Select the line being sized. Alert thresholds: suction \u2264\u00a01\u00a0m/s (cavitation), pressure \u2264\u00a04\u00a0m/s (ISO\u00a04413), return 2\u20134\u00a0m/s.',
  'hpump.helpPipeDiam':
    'Inner bore for the selected line type. ISO\u00a04413 guidance: pressure \u2264\u00a04\u00a0m/s; suction \u2264\u00a01\u00a0m/s to limit cavitation; return typically 2\u20134\u00a0m/s.',
  'hpump.labelPipeLen': 'Pipe length (m)',
  'hpump.labelPipeRough': 'Roughness \u03b5 (mm)',
  'hpump.helpPipeRough': 'Absolute roughness. Steel\u00a0\u2248\u00a00.046\u00a0mm; smooth bore \u2248\u00a00.0015\u00a0mm.',
  'hpump.resultFlow': 'Actual flow Q',
  'hpump.resultShaftPower': 'Shaft power P\u209b',
  'hpump.resultTorque': 'Drive torque T',
  'hpump.resultVelocity': 'Pipe velocity v',
  'hpump.resultReynolds': 'Reynolds number Re',
  'hpump.resultFriction': 'Darcy friction factor f',
  'hpump.resultPressureDrop': 'Pipe pressure drop \u0394p',
  'hpump.alertPressureVelocity':
    'Pressure line velocity exceeds 4\u00a0m/s. Erosion and noise risk. Check pipe bore (ISO\u00a04413: \u2264\u00a04\u00a0m/s).',
  'hpump.alertSuctionVelocity':
    'Suction line velocity exceeds 1\u00a0m/s. High cavitation risk. Increase suction line bore.',
  'hpump.alertLaminar': 'Laminar flow (Re\u00a0<\u00a02300) \u2014 viscosity dominates losses.',
  'hpump.scopeNote':
    'Indicative calculation for preliminary sizing. Confirm with manufacturer catalogue and applicable standards (ISO\u00a04413).',
  'hpump.relatedHintHtml':
    'Sizing a hydraulic system? <a href="fluids-hub.html">Explore all fluid calculators \u2192</a>',
  'hpump.seoIntroHtml':
    'Links pump displacement and speed to effective flow, absorbed power and line pressure with a simplified Darcy\u2013Weisbach friction balance and laminar/turbulent regime hints. Useful for mobile and stationary power units before confirming curves with the OEM. Picture validating oil temperature when the circuit grows on a three-shift press.',
  'hpump.methodologyLeadHtml':
    'Advanced pump and line analysis with <strong>rule-based alerts</strong> for cavitation, head loss and an indicative safety/efficiency verdict. Simplified Darcy\u2013Weisbach and Reynolds. Default fluid: mineral ISO VG 32\u201368 hydraulic oil; line \u03bd is manual (VG table). In <strong>project mode</strong>, \u03c1 and P<sub>v</sub> of that oil follow indicative temperature trends (not a datasheet). For other fluids choose Other and enter \u03c1 and \u03bd. NPSH and curves are <strong>indicative</strong>.',
  'hpump.diagPumpTitle': '\u2460 Hydraulic pump \u2014 schematic section',
  'hpump.diagPipeTitle': '\u2461 Piping \u2014 head-loss map',
  'hpump.blockPumpTitle': '\u2460 Hydraulic pump',
  'hpump.blockPumpSub':
    'Working pressure, RPM, displacement, pump type and suction diameter at the pump.',
  'hpump.labelPumpType': 'Pump type',
  'hpump.optPumpGear': 'Gear',
  'hpump.optPumpVane': 'Vane',
  'hpump.optPumpPiston': 'Piston',
  'hpump.labelPressureUnit': 'Pressure unit',
  'hpump.labelElbows': 'Number of elbows',
  'hpump.labelValves': 'Number of valves',
  'hpump.verdictOk': 'SYSTEM SUITABLE',
  'hpump.vsTitle': 'Check summary',
  'hpump.vsCavitation': 'Cavitation / inlet',
  'hpump.vsCavitationOk': 'Inlet margin acceptable for this model.',
  'hpump.vsCavitationBad': 'High cavitation risk \u2014 review suction line and NPSH.',
  'hpump.vsPressure': 'Working pressure',
  'hpump.vsPressureOk': 'Within typical limit for selected pump technology.',
  'hpump.vsPressureBad': 'Pressure exceeds indicative technology limit.',
  'hpump.vsVelocity': 'Line velocity',
  'hpump.vsVelocityOk': 'Velocity within recommended band for line type.',
  'hpump.vsVelocityBad': 'Velocity outside recommended range \u2014 resize bore.',
  'hpump.vsMotor': 'Motor power',
  'hpump.vsMotorSub': 'Recommended {rec} kW (standardized {std} kW).',
  'hpump.presetsLabel': 'Typical examples:',
  'hpump.preset1': 'Gear pump \u00b7 32 cm\u00b3/rev',
  'hpump.preset2': 'High flow \u00b7 55 cm\u00b3/rev',
  'hpump.preset3': 'Project \u00b7 NPSH check',
  'hpump.hintMemPdf': 'Expanded memory and PDF in Project mode',
  'hpump.helpProjectTier':
    'Project mode includes tank elevation above the pump, nameplate NPSHr and indicative NPSHa traceability.',
  'hpump.projectBadgeTitle': 'Includes indicative NPSHa, tank elevation and expanded memory/PDF traceability',
  'hpump.hintTankZ': 'Positive if level is above',
  'hpump.hintNPSHr': '0 if unknown',
  'hpump.hintOilTemp': 'Standard fluid only in project mode',
  'hpump.hintCalcMode': 'Calculation objective mode',
  'hpump.helpMode':
    'Design: performance target and full verification. Diagnostic: real flow from displacement and RPM.',
  'hpump.hintPumpType': 'Sets efficiency and pressure limit',
  'hpump.helpPumpType':
    'Each technology has distinct volumetric and mechanical efficiency and pressure range for safety evaluation.',
  'hpump.hintPressureUnit': 'Automatic internal conversion',
  'hpump.helpPressureUnit':
    'You may enter pressure in bar or PSI; calculations are unified in bar.',
  'hpump.hintPressure': 'Effective operating pressure',
  'hpump.hintSpeed': 'Primary shaft speed',
  'hpump.hintDisplacement': 'Volume per revolution',
  'hpump.labelSuctionDiam': 'Suction diameter at pump',
  'hpump.hintSuction': 'Critical for suction cavitation',
  'hpump.helpSuctionUnit':
    'The same unit selector applies to line diameter in the piping block.',
  'hpump.diaUnitAria': 'Diameter unit',
  'hpump.diaUnitIn': 'inches',
  'hpump.diaUnitMm': 'mm',
  'hpump.btnCalcPump': 'Update pump and results',
  'hpump.blockPipeSub':
    'Line type, line flow, viscosity, length, inner diameter, elbows and valves.',
  'hpump.labelFlow': 'Flow (L/min)',
  'hpump.hintFlow': 'Flow in line',
  'hpump.helpFlow':
    'With inner diameter, yields fluid velocity and Reynolds number for flow classification.',
  'hpump.labelViscosity': 'Kinematic viscosity (cSt)',
  'hpump.hintViscosity': 'Affects Reynolds and friction',
  'hpump.hintPipeLen': 'Main linear head loss',
  'hpump.helpPipeLen':
    'Increases head loss proportionally in the Darcy\u2013Weisbach f\u00b7(L/D) term.',
  'hpump.hintPipeDiam': 'Key optimization variable',
  'hpump.hintElbows': 'Minor losses from direction changes',
  'hpump.helpElbows':
    'Each elbow adds singular losses to the energy balance, increasing total pressure drop.',
  'hpump.hintValves': 'Localized minor losses',
  'hpump.helpValves':
    'Summed as K coefficients for additional localized line loss.',
  'hpump.btnCalcPipes': 'Update piping and results',
  'hpump.formulasSummary': 'Calculation memory, formulas and assumptions',
  'hpump.infoKeyDataHtml':
    '<strong>How to obtain key data:</strong> <strong>Kinematic viscosity (cSt)</strong> comes from the oil datasheet (typically at 40 \u00b0C and 100 \u00b0C, ISO VG), and '
    + '<strong>displacement (cm\u00b3/rev)</strong> is on the pump nameplate or datasheet. If missing, estimate with <strong>D = (Q\u00d71000)/n</strong>.',
  'hpump.vgTableAria': 'ISO VG oil guidance at 40 \u00b0C',
  'hpump.vgThOil': 'ISO VG oil',
  'hpump.vgThNu': '\u03bd at 40 \u00b0C (cSt)',
  'hpump.vgThUse': 'Typical use',
  'hpump.vgUse32': 'High-speed systems',
  'hpump.vgUse46': 'General industrial use',
  'hpump.vgUse68': 'High-pressure systems',
  'hpump.vgUse100': 'High temperature / outdoor',
};
