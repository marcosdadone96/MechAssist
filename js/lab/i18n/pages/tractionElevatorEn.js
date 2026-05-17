/** English strings for traction-elevator.html (`teConv.*` field keys). ASCII-safe. */
export const TRACTION_ELEVATOR_EN = {
  'teConv.introSummary': 'Calculator description and scope',
  'teConv.calcSeoIntro':
    'This sheet integrates cabin mass, payload and counterweight with cable tension on the inclined path, applying an Euler\u2013Eytelwein traction limit and estimating sheave torque, for training only and not replacing the lift code memo in your jurisdiction. It helps installation engineers and educators compare doubling ropes or changing groove friction. Picture retuning counterweight when switching from freight to a service with more short stops.',
  'teConv.heroLeadHtml':
    'Indicative <strong>ropes and counterweight</strong> model: tension ratio vs <strong>Euler\u2013Eytelwein</strong>, counterweight mass (car + 40\u201350% useful load), <strong>diameter and rope count</strong> with safety factor (\u224810 freight / 12 passenger), and <strong>braking torque</strong> at the sheave. The <strong>shaft schematic</strong> is on the right, like flat belt and bucket elevator tools. Does not replace EN 81 or a full installation study.',
  'teConv.helpSummary': 'Quick guide to each quantity',
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
  'teConv.lblReeving': 'Roping ratio',
  'teConv.lblKcw': 'Q fraction in optimal counterweight',
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
};
