/** English strings for inclined-conveyor.html (`incConv.*` field keys). ASCII-safe. */
export const INCLINED_CONVEYOR_EN = {
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
  'incConv.optIso5048': 'ISO 5048 / DIN 22101 \u2014 analytic approach',
  'incConv.optCema': 'CEMA \u2014 +6% margin on steady traction',
};
