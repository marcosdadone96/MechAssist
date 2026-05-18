/** English strings for screw-conveyor.html (`scConv.*` field keys). ASCII-safe. */
export const SCREW_CONVEYOR_EN = {
  'scConv.h2': 'Screw conveyor',
  'scConv.introSummary': 'Calculator description and scope',
  'scConv.calcSeoIntro':
    'This assistant links target mass throughput to screw pitch, diameter and trough fill to estimate speed, shaft power and torque, following semi-empirical lines documented in CEMA-style guides without replacing the full OEM manual. It helps process engineers in feed, biomass and waste plants compare diameters before tendering. For example, you can see whether higher pellet moisture cuts fill enough to need a larger diameter or different speed to avoid dry running.',
  'scConv.heroLead':
    'Capacity, geometry and bulk solid. Indicative model (not a full CEMA 350 replacement). Dashboard and schematic on the right, like the flat belt tool.',
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
};
