/** English strings for roller-conveyor.html (`rollerConv.*`). ASCII-safe. */
export const ROLLER_CONVEYOR_EN = {
  'rollerConv.docTitle': 'Roller conveyor \u2014 TheMechAssist',
  'rollerConv.h2': 'Motorized roller line',
  'rollerConv.introSummary': 'Calculator description and scope',
  'rollerConv.calcSeoIntro':
    'This tool maps load distribution on free or driven rollers, pitch and line speed into drag force and power at the drive zone, using the same dashboard workflow as flat belts for easy comparison. It suits picking, controlled accumulation and parcel lines where throughput changes brushless motor duty. Plant engineers can check whether a heavier EUR pallet forces zone drives instead of under-table belt propulsion.',
  'rollerConv.heroLead':
    'Horizontal line with rolling resistance and extra drag. Same workflow as flat belt: results panel and schematic on the right.',
  'rollerConv.diagramSvgAria': 'Motorized roller conveyor schematic',
  'rollerConv.helpSummary': 'Quick guide to each quantity',
  'rollerConv.helpBodyHtml': `<p class="help-details__lead muted">
      Almost every label has a <span class="info-chip info-chip--static" aria-hidden="true">?</span>: on desktop hover; on touch <strong>tap</strong> for help.
    </p>
    <ul>
      <li><strong>L</strong> and <strong>m</strong>: useful length and total load; mass flow \u2248 (m/L)\u00b7v assumes mass spread along L.</li>
      <li><strong>Pitch and pallet:</strong> roller center distance and, if applicable, pallet type and orientation; the app estimates rollers under the footprint (indicative). Force remains F = C<sub>rr</sub>\u00b7m\u00b7g total unless you change other inputs.</li>
      <li><strong>C<sub>rr</sub>:</strong> lumped value (rollers + bearings + contact); use the slider guide or the ? chip for typical ranges.</li>
      <li><strong>v, D</strong>: line speed and drive roller diameter (torque T = F\u00b7R, R = D/2).</li>
      <li><strong>Standard:</strong> simplified ISO 5048 here; CEMA adds +6% on steady traction only.</li>
      <li><strong>Advanced:</strong> extra resistance (N), acceleration time and inertia for startup peak.</li>
    </ul>`,
  'rollerConv.accNormSf': 'Standard and service factor',
  'rollerConv.accGeom': 'Geometry and kinematics',
  'rollerConv.accSupport': 'Load support and roller pitch',
  'rollerConv.accRolling': 'Rolling resistance and efficiency',
  'rollerConv.labelStandard': 'Reference standard',
  'rollerConv.labelStandardHtml':
    'Reference standard <span class="info-chip" data-i18n-attrs="title=rollerConv.tipDesignStandard" title="Declared framework in reports." aria-label="Help ISO and CEMA standard.">?</span>',
  'rollerConv.optIso5048':
    'ISO 5048 / DIN 22101 \u2014 analytic approach (default)',
  'rollerConv.optCema': 'CEMA \u2014 +6 % margin over steady traction',
  'rollerConv.cemaHint': 'CEMA applies \u00d71.06 to steady traction only (horizontal traction as modeled).',
  'rollerConv.labelLoadDuty': 'Load duty',
  'rollerConv.labelLoadDutyHtml':
    'Load type (sets SF) <span class="info-chip" data-i18n-attrs="title=rollerConv.tipLoadDuty" title="Service class." aria-label="Help load type and service factor.">?</span>',
  'rollerConv.optDutyUniform': 'Uniform load \u2014 SF \u2248 1.15',
  'rollerConv.optDutyModerate': 'Moderate shock \u2014 SF \u2248 1.35',
  'rollerConv.optDutyHeavy': 'Heavy shock \u2014 SF \u2248 1.75',
  'rollerConv.optDutyCustom': 'Custom (edit Service factor above)',
  'rollerConv.labelSf': 'Service factor',
  'rollerConv.labelSfHtml':
    'Service factor (number) <span class="info-chip" data-i18n-attrs="title=rollerConv.tipServiceFactor" title="Synced with load type." aria-label="Help synced service factor.">?</span>',
  'rollerConv.labelLength': 'Useful length L',
  'rollerConv.labelLoadMass': 'Total load m',
  'rollerConv.labelSpeed': 'Line speed v',
  'rollerConv.labelRollerD': 'Drive roller diameter D',
  'rollerConv.supportLead':
    'Use this section to document support geometry or spot cases with few rollers under the load. It does not change the power calculation.',
  'rollerConv.labelPitch': 'Roller pitch (centers)',
  'rollerConv.labelSupportMode': 'How to document support',
  'rollerConv.optUniform': 'Uniform spread along length L',
  'rollerConv.optPallet': 'Standard pallet / dimensions',
  'rollerConv.labelRollersOverride': 'Rollers under load (optional)',
  'rollerConv.labelPalletType': 'Pallet type',
  'rollerConv.labelPalletOrient': 'Side along transport direction',
  'rollerConv.optPalletLong': 'Long side along transport',
  'rollerConv.optPalletShort': 'Short side along transport',
  'rollerConv.labelPalletL': 'Pallet length (mm)',
  'rollerConv.labelPalletW': 'Pallet width (mm)',
  'rollerConv.supportNoteHtml':
    'Rolling resistance in the simulator remains <strong>F = C<sub>rr</sub>\u00b7m\u00b7g</strong> on total load; pitch and pallet document support and flag unusual geometry (few rollers, footprint longer than L).',
  'rollerConv.labelCrr': 'Rolling coeff. C<sub>rr</sub>',
  'rollerConv.labelEfficiency': 'Efficiency \u03b7',
  'rollerConv.advSummary': 'Drag and startup <span class="field-badge field-badge--optional">Advanced</span>',
  'rollerConv.btnMotors': 'View suggested gearmotors',
  'rollerConv.calcHintHtml':
    'Results and the diagram <strong>update automatically</strong>. This button expands suggested gearmotors.',
  'rollerConv.dashboardTitle': 'Sizing dashboard',
  'rollerConv.dashboardLeadHtml':
    'Design torque = max(steady, startup) \u00d7 SF. Power <strong>(T<sub>design</sub> \u00d7 \u03c9) / \u03b7</strong>. <a href="#roller-conveyor-assumptions">Assumptions</a> \u00b7 hover the schematic chips.',
  'rollerConv.modelScopeHtml':
    '<strong>Model:</strong> horizontal \u00b7 rolling \u00b7 simplified startup. <a href="#roller-conveyor-assumptions">Assumptions and exclusions</a>',
  'rollerConv.verifyH2Html': '<span class="panel-icon">\u2713</span> Check a gearmotor I already have',
  'rollerConv.verifyLeadHtml':
    '<strong>Two ways:</strong> (1) Brand and model from the <strong>sample catalog</strong> below and <em>Check for this machine</em>. (2) If your unit is not listed, open <em>Or enter my gearmotor manually</em>, fill nameplate data and run the check. Both compare motor power, rated output torque and output rpm with the calculated duty point.',
  'rollerConv.labelVerifyBrand': 'Brand',
  'rollerConv.labelVerifySearch': 'Filter model',
  'rollerConv.labelVerifyModel': 'Catalog model',
  'rollerConv.verifyRunBtn': 'Check for this machine',
  'rollerConv.motorsTitle': 'Gearmotors (sample catalog)',
  'rollerConv.motorsHint': 'Recommendations, export, verification',
  'rollerConv.engTitle': 'Engineering breakdown',
  'rollerConv.engHint': 'Collapsed by default \u2014 expand for intermediate math and rationale',
  'rollerConv.presetsGroupAria': 'Roller conveyor presets',
  'rollerConv.presetEcommerceBtn': 'E-commerce · light',
  'rollerConv.presetPalletBtn': 'Distribution · pallet',
  'rollerConv.presetHeavyBtn': 'Pallet · heavy',
  'rollerConv.presetEcommerceTooltip': 'Short line, light cartons, low C_rr, uniform spread.',
  'rollerConv.presetPalletTooltip': 'EUR pallet, medium travel, distribution duty.',
  'rollerConv.presetHeavyTooltip': 'Heavy pallet load, higher C_rr, CEMA margin.',
  'rollerConv.tipDesignStandard':
    'Declared framework in reports. ISO 5048: simplified analytic model here (not full DIN 22101). CEMA: +6% on steady traction only.',
  'rollerConv.tipLoadDuty':
    'Orientative service class. Sets the numeric factor except Custom, where you edit it below.',
  'rollerConv.tipServiceFactor': 'Synced with Load type (read-only except Custom mode).',
  'rollerConv.tipLength':
    'Span where load is modelled. Mass flow (m/L)\u00b7v assumes mass spread along L; check if your load is grouped.',
  'rollerConv.tipLoadMass': 'Nominal mass on span L; the model uses N = m\u00b7g on rollers.',
  'rollerConv.tipSpeed':
    'Roller surface speed in steady state. Enters power (F\u00b7v) and drive rpm via v and D.',
  'rollerConv.tipRollerD':
    'Drive roller diameter: torque T = F\u00b7R with R = D/2. Validate with conveyor OEM.',
  'rollerConv.tipPitch':
    'Centre distance between consecutive rollers. Estimates rollers under footprint (pallet) or along L (uniform). Not in F = C_rr\u00b7m\u00b7g; documents the case.',
  'rollerConv.tipSupportMode':
    'Uniform: load spread along L; optional roller count. Pallet: pick type and orientation; app estimates rollers under footprint along transport.',
  'rollerConv.tipUniformRollers':
    'If empty, estimated from L and pitch. If filled, used for report only (force model stays N = m\u00b7g total).',
  'rollerConv.tipPalletOrient':
    'Which pallet dimension runs parallel to transport. Sets the footprint in mm used to count rollers under load.',
  'rollerConv.tipCrr':
    'Lumped coefficient (not bearing Crr alone). Typical: 0.01\u20130.02 clean line; 0.02\u20130.04 industrial; 0.05\u20130.08 dirt or drag \u2014 validate if higher.',
  'rollerConv.tipEfficiency':
    'From motor electrical power to drive roller shaft: gearbox, coupling and losses in one value. Do not discount motor efficiency again.',
  'rollerConv.tipAddResistance':
    'Sum of extra resisting forces in N not in C_rr: stops, guides, scrapers, etc.',
  'rollerConv.tipAccelTime':
    'Time to reach speed v from rest. Shorter time implies higher acceleration force on mass.',
  'rollerConv.tipInertiaFactor':
    'Factor \u2265 1 increases startup force beyond m\u00b7a: simplified rotating masses (drum, couplings).',
  'rollerConv.tipVerifyBrand': 'Demo catalogue manufacturer. Filters models in the list.',
  'rollerConv.tipVerifySearch': 'Search by code or text to narrow the model dropdown.',
  'rollerConv.tipVerifyModel':
    'Expanded example list in code. Check uses same design point as Final results (torque, power, drum rpm).',
  'rollerConv.labelLengthHtml':
    'Useful length L <span class="info-chip" data-i18n-attrs="title=rollerConv.tipLength" title="Useful transport length along the line." aria-label="Help length L.">?</span>',
  'rollerConv.labelLoadMassHtml':
    'Total load m <span class="info-chip" data-i18n-attrs="title=rollerConv.tipLoadMass" title="Total load mass." aria-label="Help load mass.">?</span>',
  'rollerConv.labelSpeedHtml':
    'Line speed v <span class="info-chip" data-i18n-attrs="title=rollerConv.tipSpeed" title="Line speed." aria-label="Help speed.">?</span>',
  'rollerConv.labelRollerDHtml':
    'Drive roller diameter D <span class="info-chip" data-i18n-attrs="title=rollerConv.tipRollerD" title="Drive roller D." aria-label="Help roller D.">?</span>',
  'rollerConv.labelPitchHtml':
    'Roller pitch (centres) <span class="info-chip" data-i18n-attrs="title=rollerConv.tipPitch" title="Roller pitch." aria-label="Help pitch.">?</span>',
  'rollerConv.labelSupportModeHtml':
    'How to document support <span class="info-chip" data-i18n-attrs="title=rollerConv.tipSupportMode" title="Support mode." aria-label="Help support mode.">?</span>',
  'rollerConv.labelUniformRollersHtml':
    'Rollers under load (optional) <span class="info-chip" data-i18n-attrs="title=rollerConv.tipUniformRollers" title="Optional roller count." aria-label="Help rollers under load.">?</span>',
  'rollerConv.labelPalletTypeHtml': 'Pallet type',
  'rollerConv.labelPalletOrientHtml':
    'Side along transport <span class="info-chip" data-i18n-attrs="title=rollerConv.tipPalletOrient" title="Pallet orientation." aria-label="Help orientation.">?</span>',
  'rollerConv.labelPalletCustomL': 'Pallet length (mm)',
  'rollerConv.labelPalletCustomW': 'Pallet width (mm)',
  'rollerConv.labelCrrHtml':
    'Rolling coeff. C<sub>rr</sub> <span class="info-chip" data-i18n-attrs="title=rollerConv.tipCrr" title="Crr." aria-label="Help Crr.">?</span>',
  'rollerConv.labelEfficiencyHtml':
    'Efficiency \u03b7 <span class="info-chip" data-i18n-attrs="title=rollerConv.tipEfficiency" title="Efficiency." aria-label="Help efficiency.">?</span>',
  'rollerConv.labelAddResistanceHtml':
    'Additional resistance <span class="info-chip" data-i18n-attrs="title=rollerConv.tipAddResistance" title="Extra N." aria-label="Help extra resistance.">?</span>',
  'rollerConv.labelAccelTimeHtml':
    'Acceleration time <span class="info-chip" data-i18n-attrs="title=rollerConv.tipAccelTime" title="Accel time." aria-label="Help accel time.">?</span>',
  'rollerConv.labelInertiaFactorHtml':
    'Startup inertia factor <span class="info-chip" data-i18n-attrs="title=rollerConv.tipInertiaFactor" title="Inertia factor." aria-label="Help inertia.">?</span>',
  'rollerConv.labelVerifyBrandHtml':
    'Brand <span class="info-chip" data-i18n-attrs="title=rollerConv.tipVerifyBrand" title="Brand." aria-label="Help brand.">?</span>',
  'rollerConv.labelVerifySearchHtml':
    'Filter model <span class="info-chip" data-i18n-attrs="title=rollerConv.tipVerifySearch" title="Filter." aria-label="Help filter.">?</span>',
  'rollerConv.labelVerifyModelHtml':
    'Catalogue model <span class="info-chip" data-i18n-attrs="title=rollerConv.tipVerifyModel" title="Model." aria-label="Help model.">?</span>',
  'rollerConv.optPalletEur1': 'EUR 1 (800\u00d71200 mm)',
  'rollerConv.optPalletEur2': 'EUR 2 (1200\u00d71000 mm)',
  'rollerConv.optPalletEur6': 'Half EUR (800\u00d7600 mm)',
  'rollerConv.optPalletInd1000': 'Industrial (1000\u00d71200 mm)',
  'rollerConv.optPalletUs4840': 'US 48\u00d740" (1219\u00d71016 mm)',
  'rollerConv.optPalletCustom': 'Custom (L\u00d7W mm)',
  'rollerConv.visualSectionAria': 'Schematic and reference photo',
  'rollerConv.engLead': 'Intermediate calculations, motor strategies and design-point reasoning at the drive roller.',
  'rollerConv.assumptionsTitle': 'Model assumptions',
  'rollerConv.assumptionsHint': 'Assumptions and limits',
  'rollerConv.pdfExportH2Html':
    '<span class="premium-flag">Pro</span> <span class="panel-icon">PDF</span> Export report',
  'rollerConv.diagramNoteHtml':
    '<strong>Quick read:</strong> at the top, <strong>steady</strong> (no SF) vs <strong>design</strong> (with SF and \u03b7). <strong>L</strong> is useful length and <strong>D</strong> the drive roller diameter (your inputs); the drawing is qualitative.',
  'rollerConv.photoCaptionHtml':
    'Roller conveyor on site. <a href="https://commons.wikimedia.org/wiki/File:Conveyor_belt_(2).jpg" target="_blank" rel="noopener">Wikimedia Commons</a>.',
};
