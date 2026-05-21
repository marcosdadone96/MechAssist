/** English strings for screw-conveyor.html (`scConv.*` field keys). ASCII-safe. */
export const SCREW_CONVEYOR_EN = {
  'scConv.docTitle': 'Screw conveyor \u2014 TheMechAssist',
  'scConv.h2': 'Screw conveyor',
  'scConv.introSummary': 'Calculator description and scope',
  'scConv.calcSeoIntro':
    'This assistant links target mass throughput to screw pitch, diameter and trough fill to estimate speed, shaft power and torque, following semi-empirical lines documented in CEMA-style guides without replacing the full OEM manual. It helps process engineers in feed, biomass and waste plants compare diameters before tendering. For example, you can see whether higher pellet moisture cuts fill enough to need a larger diameter or different speed to avoid dry running.',
  'scConv.heroLead':
    'Capacity, geometry and bulk solid. Indicative model (not a full CEMA 350 replacement). Dashboard and schematic on the right, like the flat belt tool.',
  'scConv.diagramSvgAria': 'Screw conveyor schematic',
  'scConv.helpSummary': 'Quick guide to each quantity',
  'scConv.helpBodyHtml': `<p class="help-details__lead muted">
      Almost every label has a <span class="info-chip info-chip--static" aria-hidden="true">?</span>: on desktop hover; on touch <strong>tap</strong> for help.
    </p>
    <ul>
      <li><strong>Capacity</strong> and geometry (D, pitch, L, \u03b8): the model estimates screw speed and shaft torque.</li>
      <li><strong>Material</strong>: bulk density, trough fill, abrasiveness and corrosiveness adjust margins.</li>
      <li><strong>\u03bc and efficiency</strong>: solid\u2013steel friction and bearing losses; load duty sets the base service factor.</li>
      <li><strong>RPM</strong>: if a high-speed warning appears, cross-check with the screw OEM.</li>
    </ul>`,
  'scConv.lblCap': 'Capacity Q',
  'scConv.lblCapUnit': 'Flow unit (m\u00b3/h or t/h)',
  'scConv.lblDiam': 'Helix diameter D',
  'scConv.lblDiamUnit': 'Unit for D',
  'scConv.lblPitch': 'Helix pitch p',
  'scConv.lblPitchUnit': 'Unit for p',
  'scConv.lblLength': 'Conveyor length L',
  'scConv.lblAngle': 'Incline angle \u03b8',
  'scConv.lblRho': 'Material density \u03c1 (kg/m\u00b3)',
  'scConv.lblTrough': 'Trough fill \u03c6 (%)',
  'scConv.lblAbrasive': 'Abrasiveness',
  'scConv.lblCorrosive': 'Corrosiveness',
  'scConv.lblMu': 'Friction coefficient \u03bc',
  'scConv.lblBearingEta': 'Drive efficiency \u03b7 (%)',
  'scConv.lblLoadDuty': 'Load duty',
  'scConv.lblSf': 'Service factor SF',
  'scConv.lblVBrand': 'Brand',
  'scConv.lblVSearch': 'Filter model',
  'scConv.lblVModel': 'Model',
  'scConv.accGeom': 'Geometry and kinematics',
  'scConv.accMat': 'Material and fill',
  'scConv.accFriction': 'Friction and service',
  'scConv.coldStartNote':
    'Note: cold-start power with a full screw may be 2\u20133\u00d7 steady-state power for cohesive or wet materials. Check available breakaway torque with the gearmotor supplier.',
  'scConv.presetFoodTooltip': 'Fine powder, \u00d8250 mm, 18 m\u00b3/h, 5\u00b0 incline.',
  'scConv.presetBiomassTooltip': 'Biomass chip \u00d8400 mm, 12\u00b0 incline, 45 m\u00b3/h.',
  'scConv.presetCementTooltip': 'Dense mineral \u00d8500 mm, 35 t/h, 18\u00b0 incline, abrasive.',
  'scConv.engTitle': 'Engineering breakdown',
  'scConv.engHint': 'Step-by-step calculation',
  'scConv.motorsTitle': 'Gearmotors (sample catalog)',
  'scConv.motorsHint': 'Recommendations and export',
  'scConv.modelScopeHtml':
    '<strong>Model:</strong> bulk solid \u00b7 indicative shaft power. <a href="#screw-conveyor-assumptions">Assumptions and exclusions</a>',
  'scConv.btnSuggestedMotors': 'View suggested gearmotors',
  'scConv.calcHintHtml':
    'Results and the diagram <strong>update automatically</strong>. This button expands suggested gearmotors.',
  'scConv.dashboardTitle': 'Sizing dashboard',
  'scConv.dashboardLead':
    'Torque, motor power and screw speed; review the RPM banner if it appears.',
  'scConv.presetFoodBtn': 'Powder \u00b7 food',
  'scConv.presetBiomassBtn': 'Chip \u00b7 biomass',
  'scConv.presetCementBtn': 'Dense mineral',
  'scConv.presetPresetsAria': 'Screw conveyor presets',
  'scConv.capUnitHint': 't/h uses bulk density from Material.',
  'scConv.sfCombinedHint': 'Combined with abrasiveness / corrosiveness margins.',
  'scConv.optInches': 'in',
  'scConv.optTrough15': '15 % \u2014 abrasive / difficult',
  'scConv.optTrough30': '30 % \u2014 general duty',
  'scConv.optTrough45': '45 % \u2014 fluid-like / dry fine powders',
  'scConv.wearLow': 'Low',
  'scConv.wearMed': 'Medium',
  'scConv.wearHigh': 'High',
  'scConv.recCap': 'Typ. 10\u2013120 m\u00b3/h \u00b7 food / 15\u201380 t/h fine ore',
  'scConv.recDiam': '\u00d8 200\u2013500 mm general \u00b7 >500 mm heavy duty',
  'scConv.recPitch': 'p \u2248 0.8\u20131.0 \u00b7 D (rule of thumb)',
  'scConv.recLength': 'L 4\u201325 m typical \u00b7 >30 m check supports',
  'scConv.recAngle': '\u03b8 0\u201312\u00b0 mild \u00b7 12\u201325\u00b0 check OEM',
  'scConv.recRho': '550\u2013850 feed \u00b7 1200\u20131600 fines/mineral',
  'scConv.recMu': '\u03bc 0.25\u20130.40 easy \u00b7 0.40\u20130.55 sticky',
  'scConv.recBearingEta': '\u03b7 88\u201394 % typical mechanical train',
  'scConv.ariaCap': 'Capacity',
  'scConv.ariaDiam': 'Screw diameter',
  'scConv.ariaPitch': 'Pitch',
  'scConv.ariaLength': 'Length L',
  'scConv.ariaAngle': 'Angle \u03b8',
  'scConv.ariaRho': 'Density \u03c1',
  'scConv.ariaMu': 'Coefficient \u03bc',
  'scConv.troughGuideSummary': 'Indicative trough fill table',
  'scConv.troughGuideThMaterial': 'Material type',
  'scConv.troughGuideThFill': 'Recommended fill',
  'scConv.troughGuideR1c1': 'Fluid / dry fine powders',
  'scConv.troughGuideR1c2': '45%',
  'scConv.troughGuideR2c1': 'General industrial',
  'scConv.troughGuideR2c2': '30%',
  'scConv.troughGuideR3c1': 'Abrasive or difficult',
  'scConv.troughGuideR3c2': '15%',
  'scConv.verifyH2Html': '<span class="panel-icon">\u2713</span> Check a gearmotor',
  'scConv.verifyRunBtn': 'Check for this screw',
  'scConv.visualSectionAria': 'Schematic and reference photo',
  'scConv.diagramNoteHtml':
    '<strong>Quick read:</strong> qualitative side view of trough, screw and bulk flow; <strong>L</strong>, <strong>OD</strong>, <strong>pitch</strong> and <strong>angle</strong> come from the form. The dashboard updates when inputs change.',
  'scConv.photoAlt': 'Screw conveyor reference photo',
  'scConv.photoCaptionHtml':
    'Reference: screw (illustrative). <a href="https://commons.wikimedia.org/wiki/File:Archimedes_screw_at_Kinderdijk.jpg" target="_blank" rel="noopener">Wikimedia</a>',
  'scConv.pdfExportH2Html': '<span class="panel-icon">PDF</span> Export report',

  'scConv.tipCap':
    'Target capacity. Actual screw speed is estimated from fill, diameter and pitch.',
  'scConv.tipCapUnit':
    'm\u00b3/h for volumetric or t/h for mass flow. t/h uses bulk density directly in the math.',
  'scConv.tipDiam':
    'Helix outer diameter D (mm). Larger D \u2192 lower rpm for the same throughput.',
  'scConv.tipDiamUnit': 'Diameter in mm or inches; internally normalized to metres.',
  'scConv.tipPitch':
    'Helix pitch p (mm). Standard: p \u2248 D. Short pitch (p \u2248 0.8D): inclined or sticky. Long pitch (p \u2248 1.5D): free-flowing at low speed.',
  'scConv.tipPitchUnit': 'Pitch unit (mm or in); converted automatically for internal formulas.',
  'scConv.tipLength':
    'Conveyor axis length L (m). Longer conveyors require more power and may need intermediate bearings.',
  'scConv.tipAngle':
    'Inclination angle \u03b8 (\u00b0). Reduces effective capacity; 0\u00b0 = horizontal. Max typical: ~20\u00b0 for free-flowing materials.',
  'scConv.tipRho': 'Bulk density \u03c1 (kg/m\u00b3). Use vendor datasheet or standard tables.',
  'scConv.tipTrough':
    'Trough fill factor \u03c6 (%). 15\u201345% typical; higher fill raises rpm and power disproportionately.',
  'scConv.tipAbrasive':
    'Adjusts wear margin and indicative RPM cap. Abrasive materials need more margin and lower speed.',
  'scConv.tipCorrosive':
    'Design margin for corrosive environment/material. High levels suggest special materials/linings.',
  'scConv.tipMu':
    'Solid\u2013steel friction. Affects shaft torque; use 0.20\u20130.35 for free-flowing, 0.35\u20130.55 for sticky or abrasive.',
  'scConv.tipBearingEta': 'Bearing + seal efficiency on the screw shaft. Typical 0.90\u20130.97.',
  'scConv.tipLoadDuty': 'Base service factor by duty severity (uniform, moderate, heavy) or custom value.',
  'scConv.tipSf':
    'Sizing margin on torque/power. Common: 1.15\u20131.35 moderate, up to 1.75+ for severe duty.',
  'scConv.tipVBrand': 'Demo catalog manufacturer to filter models.',
  'scConv.tipVSearch': 'Text/code search to shorten the model list.',
  'scConv.tipVModel': 'Compared to calculated power, torque and RPM for this screw conveyor.',
};
