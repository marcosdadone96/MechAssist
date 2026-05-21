/** English strings for traction-elevator.html (`teConv.*` field keys). ASCII-safe. */
export const TRACTION_ELEVATOR_EN = {
  'teConv.introSummary': 'Calculator description and scope',
  'teConv.calcSeoIntro':
    'This sheet integrates cabin mass, payload and counterweight with cable tension on the inclined path, applying an Euler\u2013Eytelwein traction limit and estimating sheave torque, for training only and not replacing the lift code memo in your jurisdiction. It helps installation engineers and educators compare doubling ropes or changing groove friction. Picture retuning counterweight when switching from freight to a service with more short stops.',
  'teConv.heroLeadHtml':
    'Indicative <strong>ropes and counterweight</strong> model: tension ratio vs <strong>Euler\u2013Eytelwein</strong>, counterweight mass (car + 40\u201350% useful load), <strong>diameter and rope count</strong> with safety factor (\u224810 freight / 12 passenger), and <strong>braking torque</strong> at the sheave. The <strong>shaft schematic</strong> is on the right, like flat belt and bucket elevator tools. Does not replace EN 81 or a full installation study.',
  'teConv.safetyNoticeHtml':
    '<strong>&#9888; Indicative calculation</strong> \u2014 Does not replace code-compliant design (EN&nbsp;81-1 / EN&nbsp;81-20) or sign-off by a competent professional. Always validate with the manufacturer and an authorised installer.',
  'teConv.diagramSvgAria': 'Traction elevator schematic',
  'teConv.helpSummary': 'Quick guide to each parameter',
  'teConv.helpBodyHtml': `<p class="help-details__lead muted">
      Every label has a <span class="info-chip info-chip--static" aria-hidden="true">?</span>: on desktop hover; on touch, tap to read help.
    </p><ul>
      <li><strong>Q and Mc:</strong> set mass imbalance, indicative power and sheave torque.</li>
      <li><strong>Optimal counterweight:</strong> starting point Mc + 45%\u00b7Q, then tune to project duty.</li>
      <li><strong>Euler (T1/T2):</strong> checks groove traction against e^(\u03bc\u00b7\u03b1) limit.</li>
      <li><strong>Ropes and SF:</strong> indicative rope pick by breaking load and minimum safety factor.</li>
    </ul>`,
  'teConv.lblQ': 'Payload',
  'teConv.lblMc': 'Cabin mass',
  'teConv.lblH': 'Travel height',
  'teConv.lblV': 'Rated speed',
  'teConv.lblDuty': 'Service type',
  'teConv.optFreight': 'Goods lift / freight (SF \u2248 10)',
  'teConv.optPersons': 'Passenger lift (SF \u2248 12)',
  'teConv.lblReeving': 'Roping ratio',
  'teConv.reeving11Desc': 'Fixed sheave \u00b7 cabin moves at cable speed.',
  'teConv.reeving21Desc': 'Movable sheave on car \u00b7 more mechanical advantage, higher sheave rpm.',
  'teConv.lblKcw': 'Useful load fraction balanced (k)',
  'teConv.hintKcw':
    'Fraction of useful load Q balanced by the counterweight. Typical range: 0.40\u20130.50 (EN 81: \u2265 0.40). With 0.45 and Q=2000 kg, counterweight mass is Mc + 0.45\u00b7Q.',
  'teConv.lblCwManual': 'Fix counterweight manually (kg)',
  'teConv.lblMcpManual': 'Suggested counterweight (editable)',
  'teConv.lblD': 'Traction sheave pitch \u00d8',
  'teConv.lblAlpha': 'Wrap angle',
  'teConv.lblMu': 'Rope\u2013groove friction \u03bc',
  'teConv.lblMaxN': 'Max. ropes / strands',
  'teConv.lblVBrand': 'Brand',
  'teConv.lblVSearch': 'Filter model (text)',
  'teConv.lblVModel': 'Sample catalog model',
  'teConv.accLoads': 'Loads and travel',
  'teConv.accCw': 'Counterweight',
  'teConv.accSheave': 'Sheave and traction (Euler\u2013Eytelwein)',
  'teConv.presetFreightTooltip':
    'Freight lift Q 2000 kg, car 1200 kg, 1:1, v 1 m/s, H 12 m.',
  'teConv.presetGoodsTooltip': 'Goods Q 3200 kg, 2:1, v 0.63 m/s, H 8.5 m.',
  'teConv.engTitle': 'Engineering breakdown',
  'teConv.engHint': 'Collapsed by default \u2014 traction ratio, strategies and model steps',
  'teConv.motorsTitle': 'Gearmotors (sample catalog \u00b7 SEW, Siemens, Nord\u2026)',
  'teConv.motorsHint': 'Collapsed by default \u2014 brand cards and verifier',
  'teConv.sfGuideSummary': 'Indicative minimum safety factors',
  'teConv.sfGuideThService': 'Service',
  'teConv.sfGuideThSf': 'Indicative min. SF',
  'teConv.sfGuideRowFreight': 'Goods lift / freight',
  'teConv.sfGuideRowPersons': 'Passenger lift',
  'teConv.reevingVisualAria': 'Visual roping ratio selector',

  'teConv.tipQ': 'Rated payload Q (kg). Drives imbalance and traction demand.',
  'teConv.tipMc': 'Cabin mass Mc (kg). Sum with Q gives the loaded car mass.',
  'teConv.tipH': 'Travel height H (m). Drives duty cycle and rope length.',
  'teConv.tipV': 'Rated speed v (m/s). Affects motor power and traction sheave rpm.',
  'teConv.tipDuty':
    'Service type (passenger / freight). Sets minimum safety factor for rope selection.',
  'teConv.tipReeving':
    'Roping ratio: 1:1 = direct; 2:1 = rope doubles at car and counterweight.',
  'teConv.tipKcw':
    'Fraction of useful load Q balanced by the counterweight (not total counterweight mass). Typical 0.40\u20130.50; EN 81: \u2265 0.40. Indicative: Mcp \u2248 Mc + k\u00b7Q. With k=0.45 and Q=2000 kg, add 900 kg to Mc.',
  'teConv.tipMcpManual': 'Enable to fix counterweight mass manually (overrides the optimal formula).',
  'teConv.tipD': 'Traction sheave pitch diameter D (m). Sets rope speed and sheave rpm.',
  'teConv.tipAlpha': 'Rope wrap angle on the sheave (rad). Affects Euler\u2013Eytelwein traction.',
  'teConv.tipMu':
    'Effective rope\u2013groove friction \u03bc on the traction sheave. \u2248 0.09\u20130.13 for semicircular (U) groove; \u2248 0.20\u20130.25 for undercut (V) groove. Check the traction sheave manufacturer catalog.',
  'teConv.tipMaxN': 'Design cap for demo rope selection. If exceeded, review diameter/loads.',
  'teConv.tipVBrand':
    'Sample catalog brand. Does not change elevator inputs; filters models before comparison.',
  'teConv.tipVSearch': 'Text/code search to narrow available models.',
  'teConv.tipVModel':
    'Demo catalog model. Check compares power, torque and rpm with the calculated sheave duty (does not change the form).',
};
