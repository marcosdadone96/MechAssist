/** English strings for calc-hydraulic-pump.html (`hpump.*` keys). ASCII-safe. */
export const HYDRAULIC_PUMP_EN = {
  'hpump.docTitle': 'Hydraulic pump calculator online \u2014 TheMechAssist',
  'hpump.h2': 'Hydraulic pump \u00b7 flow, power and pipe sizing',
  'hpump.heroLead':
    'Actual flow, shaft power and indicative pipe sizing from displacement, speed, pressure and efficiencies.',
  'hpump.helpSummary': 'Methodology and model limits',
  'hpump.presetsLabel': 'Typical examples:',
  'hpump.diagTitle': 'Schematic view \u00b7 pump and circuit',
  'hpump.diagAriaLabel': 'Hydraulic pump schematic',
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
  'hpump.labelFluidType': 'Fluid',
  'hpump.labelTemp': 'Temperature (\u00b0C)',
  'hpump.helpTemp': 'Operating temperature. Affects density and viscosity (auto-corrected for standard fluids).',
  'hpump.labelDensity': 'Density \u03c1 (kg/m\u00b3)',
  'hpump.labelViscosity': 'Kinematic viscosity \u03bd (cSt)',
  'hpump.sectionPipe': 'Pipe sizing',
  'hpump.labelPipeDiam': 'Pipe inner diameter (mm)',
  'hpump.helpPipeDiam':
    'Inner bore used to compute velocity. Keep pressure line \u2264\u00a04\u00a0m/s; suction line \u2264\u00a01\u00a0m/s to avoid cavitation.',
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
  'hpump.alertCavitation': 'Pipe velocity exceeds 3\u00a0m/s \u2014 check suction conditions and NPSH.',
  'hpump.alertLaminar': 'Laminar flow (Re\u00a0<\u00a02300) \u2014 viscosity dominates losses.',
  'hpump.scopeNote':
    'Indicative calculation for preliminary sizing. Confirm with manufacturer catalogue and applicable standards (ISO\u00a04413).',
  'hpump.relatedHintHtml':
    'Sizing a hydraulic system? <a href="fluids-hub.html">Explore all fluid calculators \u2192</a>',
};
