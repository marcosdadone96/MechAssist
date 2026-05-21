/** English strings for inclined-conveyor.html (`incConv.*` field keys). ASCII-safe. */
export const INCLINED_CONVEYOR_EN = {
  'incConv.docTitle': 'Inclined conveyor \u2014 TheMechAssist',
  'incConv.h2': 'Inclined conveyor',
  'incConv.introSummary': 'Calculator description and scope',
  'incConv.calcSeoIntro':
    'This module adds slope and vertical lift effects on belt traction, combining drum power with an indicative gearmotor check when the line runs inclined or on a troughed profile. The theory follows the same analytic schemes as the horizontal belt plus the usual gravity terms in bulk-handling literature. It helps quarry, aggregate and in-plant designers judge whether a steeper grade still works with the same drive. Imagine a short climb to a silo when product moisture rises and the equivalent friction coefficient increases.',
  'incConv.heroLead':
    'Slope, friction and lift. Values recalculate instantly; the right panel shows the dashboard, schematic and gearmotors.',
  'incConv.helpSummary': 'Quick guide',
  'incConv.helpBodyHtml': `<p class="help-details__lead muted">
      Almost every label has a <span class="info-chip info-chip--static" aria-hidden="true">?</span>: on desktop hover; on touch <strong>tap</strong> for help.
    </p>
    <ul>
      <li><strong>L</strong>: length along slope; <strong>H</strong>: lift. If theta is empty, theta = arcsin(H/L).</li>
      <li>If you enter <strong>theta</strong>, it overrides H in the angle calculation.</li>
      <li>Typical maximum angles by material: dry grains ~20\u00b0, wet sand ~15\u00b0, fine materials ~12\u00b0.</li>
      <li>Resistance combines slope weight and friction; P and T at the drum follow.</li>
      <li><strong>Standard</strong>: ISO/DIN or CEMA (+6% on steady traction only, not the acceleration term).</li>
      <li><strong>Service factor</strong>: set by load duty; use Custom for a manual SF.</li>
    </ul>`,
  'incConv.accNormSf': 'Standard and service factor',
  'incConv.accGeom': 'Geometry and kinematics',
  'incConv.accFriction': 'Friction and efficiency',
  'incConv.labelBulkMaterial': 'Bulk material',
  'incConv.labelMaterialHtml':
    'Material type (angle warning) <span class="info-chip" title="Only affects the indicative maximum-angle warning. Does not enter the power calculation." aria-label="Help material type.">?</span>',
  'incConv.hintMaterial':
    'Only affects the indicative maximum-angle warning; does not change the power calculation.',
  'incConv.matGrain': 'Grain / cereal',
  'incConv.matSandDry': 'Dry sand',
  'incConv.matSandWet': 'Wet sand',
  'incConv.matCoal': 'Coal / coke',
  'incConv.matGravel': 'Gravel / aggregate',
  'incConv.matSoil': 'Soil / earth',
  'incConv.matDefault': 'General material',
  'incConv.modelScopeHtml':
    '<strong>Model:</strong> inclined \u00b7 Coulomb \u00b7 weight on slope + friction \u00b7 no Euler. <a href="#inclined-conveyor-assumptions">Assumptions and exclusions</a>',
  'incConv.advSummary':
    'Advanced options \u2014 belt, distribution, startup <span class="field-badge field-badge--optional">Advanced</span>',
  'incConv.btnMotors': 'View suggested gearmotors',
  'incConv.calcHintHtml':
    'Results and the diagram <strong>update automatically</strong>. This button opens the recommendations block.',
  'incConv.dashboardTitle': 'Sizing dashboard',
  'incConv.dashboardLeadHtml':
    'Design torque = max(steady, startup) \u00d7 SF. Power <strong>(T<sub>design</sub> \u00d7 \u03c9) / \u03b7</strong>. <a href="#inclined-conveyor-assumptions">Assumptions</a> \u00b7 hover the inclined schematic.',
  'incConv.diagramNote': 'Schematic: forces along slope; qualitative drawing.',
  'incConv.photoCaptionHtml':
    'Inclined conveyor on site. <a href="https://commons.wikimedia.org/wiki/File:Conveyor_belt_(2).jpg" target="_blank" rel="noopener">Wikimedia Commons</a>.',
  'incConv.verifyH2Html': '<span class="panel-icon">\u2713</span> Check a gearmotor I already have',
  'incConv.verifyLeadHtml':
    'Comparison with the calculated design point for <strong>this</strong> incline (same logic as flat belt).',
  'incConv.verifyRunBtn': 'Check for this machine',
  'incConv.motorsTitle': 'Gearmotors (sample catalog)',
  'incConv.motorsHint': 'Recommendations, export, verification',
  'incConv.engTitle': 'Engineering breakdown',
  'incConv.engHint': 'Expand for intermediate calculations and rationale',
  'incConv.engLead': 'Gearbox, motor strategies, and step-by-step detail.',
  'incConv.assumptionsTitle': 'Model assumptions',
  'incConv.assumptionsHint': 'Assumptions and limits',
  'incConv.pdfExportH2Html':
    '<span class="premium-flag">Pro</span> <span class="panel-icon">PDF</span> Export report',
  'incConv.labelDesignStandardHtml':
    'Reference standard <span class="info-chip" title="Declares the calculation framework in reports. CEMA adds margin on steady traction only." aria-label="Help reference standard.">?</span>',
  'incConv.labelLoadDutyHtml':
    'Load type (sets SF) <span class="info-chip" title="Select service severity and recommended service factor. Use Custom for a manual SF." aria-label="Help load type.">?</span>',
  'incConv.labelServiceFactorHtml':
    'Service factor (number) <span class="info-chip" title="Design multiplier on steady/startup torque. Higher SF = more margin and higher required torque." aria-label="Help service factor.">?</span>',
  'incConv.labelLengthHtml':
    'Length L (slope) <span class="info-chip" title="Useful transport length measured along the belt slope." aria-label="Help belt length.">?</span>',
  'incConv.labelAngleHtml':
    'Angle \u03b8 (optional) <span class="info-chip" title="If filled, the model uses this angle instead of deriving it from H and L." aria-label="Help angle.">?</span>',
  'incConv.labelSpeedHtml':
    'Belt speed v <span class="info-chip" title="Linear belt speed. Affects drum rpm and motor power." aria-label="Help belt speed.">?</span>',
  'incConv.optIso5048': 'ISO 5048 / DIN 22101 \u2014 analytic approach',
  'incConv.optCema': 'CEMA \u2014 +6 % margin over steady traction',
  'incConv.optUniform': 'Uniform load \u2014 SF \u2248 1.15',
  'incConv.optModerate': 'Moderate shock \u2014 SF \u2248 1.35',
  'incConv.optHeavy': 'Heavy shock \u2014 SF \u2248 1.75',
  'incConv.optCustom': 'Custom (edit Service factor above)',
  'incConv.diagramSvgAria': 'Inclined belt schematic',
  'incConv.visualSectionAria': 'Schematic and reference',
  'incConv.presetsGroupAria': 'Inclined belt presets',
  'incConv.presetQuarryBtn': 'Quarry · short',
  'incConv.presetSandBtn': 'Wet sand',
  'incConv.presetWarehouseBtn': 'Silo feed',
  'incConv.presetQuarryTooltip': 'Quarry, L ~35 m, variable load',
  'incConv.presetSandTooltip': 'Wet sand, higher \u03bc and extra resistance',
  'incConv.presetWarehouseTooltip': 'Silo feed, shorter lighter belt',
  'incConv.hintStandard': 'Framework declared in reports.',
  'incConv.hintServiceFactorSync': 'Synced with load type except Custom.',
  'incConv.labelVerifyBrandHtml':
    'Brand <span class="info-chip" title="Demo catalogue manufacturer for quick verification." aria-label="Help brand.">?</span>',
  'incConv.labelVerifySearchHtml':
    'Filter model <span class="info-chip" title="Filter by text or code to find a catalogue model faster." aria-label="Help model filter.">?</span>',
  'incConv.labelVerifyModelHtml':
    'Example catalogue model <span class="info-chip" title="Compared against the calculated point: power, torque and rpm." aria-label="Help catalogue model.">?</span>',
  'incConv.angleWarnHtml':
    '\u26a0 \u03b8 &gt; 18\u00b0: use a belt with cleats/ribs for grip.',
  'incConv.tipDesignStandard':
    'Declares the calculation framework in reports. CEMA adds margin on steady traction only.',
  'incConv.tipLoadDuty':
    'Select service severity and recommended service factor. Use Custom for a manual SF.',
  'incConv.tipServiceFactor':
    'Design multiplier on steady/startup torque. Higher SF = more margin and higher required torque.',
  'incConv.tipLength': 'Useful transport length measured along the belt slope.',
  'incConv.tipHeight':
    'Vertical lift between loading and discharge. If \u03b8 is empty, calculated as arcsin(H/L).',
  'incConv.tipAngle': 'If filled, the model uses this angle instead of deriving it from H and L.',
  'incConv.tipMaterial':
    'Only affects the indicative maximum-angle warning. Does not enter the power calculation.',
  'incConv.tipLoadMass': 'Total material mass in the span considered by the model.',
  'incConv.tipSpeed': 'Belt line speed. Affects drum rpm and motor power.',
  'incConv.tipRollerD': 'Drive drum pitch diameter. Converts force to torque (T = F\u00b7D/2).',
  'incConv.tipFriction':
    'Effective friction coefficient on the slope. Typical range 0.25\u20130.60 depending on condition.',
  'incConv.tipEfficiency':
    'Total mechanical efficiency from motor to drum. Usually 80\u201395% depending on transmission.',
  'incConv.tipBeltWidth': 'Nominal belt width. Helps contextualize flow and belt family.',
  'incConv.tipBeltMass':
    'Belt self-weight used in the extended gravity/friction term of the model.',
  'incConv.tipLoadDist':
    'Fraction of load effectively active in the analysed span (1 = full load active).',
  'incConv.tipBeltSlopePart':
    'Fraction of belt mass on the inclined run that contributes to the effort.',
  'incConv.tipAddResistance':
    'Extra losses not modelled (scrapers, seals, hard spots, etc.) in newtons.',
  'incConv.tipAccelTime':
    'Ramp time to nominal speed. Shorter time implies higher startup peak.',
  'incConv.tipInertiaFactor':
    'Multiplier for drum/coupling rotational inertias during startup.',
  'incConv.tipVerifyBrand': 'Demo catalogue manufacturer for quick verification.',
  'incConv.tipVerifySearch': 'Filter by text or code to find a catalogue model faster.',
  'incConv.tipVerifyModel': 'Compared against the calculated point: power, torque and rpm.',
  'incConv.labelHeightHtml':
    'Lift H <span class="info-chip" title="Vertical lift between loading and discharge. If \u03b8 is empty, calculated as arcsin(H/L)." aria-label="Help lift.">?</span>',
  'incConv.labelLoadMassHtml':
    'Load mass m <span class="info-chip" title="Total material mass in the span considered by the model." aria-label="Help load mass.">?</span>',
  'incConv.labelRollerDHtml':
    'Drive drum diameter D <span class="info-chip" title="Drive drum pitch diameter. Converts force to torque (T = F\u00b7D/2)." aria-label="Help drum diameter.">?</span>',
  'incConv.labelFrictionHtml':
    'Coefficient \u03bc <span class="info-chip" title="Effective friction coefficient on the slope. Typical range 0.25\u20130.60." aria-label="Help friction.">?</span>',
  'incConv.labelEfficiencyHtml':
    'Efficiency \u03b7 (to drum) <span class="info-chip" title="Total mechanical efficiency from motor to drum. Usually 80\u201395%." aria-label="Help efficiency.">?</span>',
  'incConv.labelBeltWidthHtml':
    'Belt width B <span class="info-chip" title="Nominal belt width." aria-label="Help belt width.">?</span>',
  'incConv.labelBeltMassHtml':
    'Belt mass m_b <span class="info-chip" title="Belt self-weight in the extended model." aria-label="Help belt mass.">?</span>',
  'incConv.labelLoadDistHtml':
    'Active load fraction f_dist <span class="info-chip" title="Fraction of load active in the analysed span (1 = all load active)." aria-label="Help load fraction.">?</span>',
  'incConv.labelBeltSlopePartHtml':
    'Belt on slope f_p <span class="info-chip" title="Fraction of belt mass on the inclined run contributing to effort." aria-label="Help belt on slope.">?</span>',
  'incConv.labelAddResistanceHtml':
    'Additional resistance <span class="info-chip" title="Extra losses not modelled (scrapers, seals, etc.) in N." aria-label="Help additional resistance.">?</span>',
  'incConv.labelAccelTimeHtml':
    'Acceleration time <span class="info-chip" title="Ramp time to nominal speed." aria-label="Help acceleration time.">?</span>',
  'incConv.labelInertiaFactorHtml':
    'Inertia factor k_in <span class="info-chip" title="Multiplier for drum/coupling inertias at startup." aria-label="Help inertia factor.">?</span>',
};
