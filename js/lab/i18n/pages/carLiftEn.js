/** English strings for car-lift-screw.html (`carConv.*`). ASCII-safe. */
export const CAR_LIFT_EN = {
  'carConv.h2': 'Screw-type car lift',
  'carConv.calcSeoIntro':
    'This calculator links lifted mass, stroke and target time to ISO trapezoidal screw lead and diameter for advance speed, resisting torque and motor power, plus indicative bronze nut pressure and friction-angle self-locking behavior. It helps lift OEMs and body shops validate an existing screw before extending the platform. A practical case is checking whether a higher rated load forces a larger thread or longer nut bearing length.',
  'carConv.heroLead':
    'Two columns, power screw and bronze nut. Torque, power, nut pressure and self-locking (lambda < phi) with the same workflow as belt and roller tools: form on the left, schematic and results on the right.',
  'carConv.helpSummary': 'Quick guide',
  'carConv.helpBodyHtml': `<p class="help-details__lead muted">
      Several labels have a <span class="info-chip info-chip--static" aria-hidden="true">?</span>: hover on desktop; on touch, <strong>tap</strong> for help.
    </p>
    <ul>
      <li><strong>m, H, t:</strong> lifted mass, useful stroke and target time; set screw rpm via lead and turns.</li>
      <li><strong>p, d:</strong> lead (single start) and nominal diameter; define helix angle and torque.</li>
      <li><strong>Nut:</strong> bearing length and steel\u2013bronze mu; modeled pressure is indicative.</li>
      <li><strong>Self-locking:</strong> if lambda &ge; phi, the model flags an error; real installs need brake and safety nut.</li>
    </ul>`,
  'carConv.accStandards': 'Standards and power-screw safety',
  'carConv.accGeometry': 'Geometry and kinematics',
  'carConv.accNut': 'Nut, friction and service factor',
  'carConv.accStandardsBodyHtml': `<p class="muted" style="margin: 0 0 0.8rem; line-height: 1.45">
      <strong>ISO metric trapezoidal thread family:</strong> <strong>ISO 2901, 2902, 2903 and 2904</strong> define the basic profile, tolerances, gauging and designation for screw\u2013nut interchangeability. In industrial design they give a reproducible geometry before validating load, wear and life with the manufacturer.
    </p>
    <p class="muted" style="margin: 0 0 0.8rem; line-height: 1.45">
      <strong>Irreversibility (safety):</strong> to prevent back-driving under gravity, helix angle <strong>alpha</strong> must stay below the friction angle. Compact form: <strong>alpha &lt; arctan(mu)</strong>. If not, the screw can be overhauling and needs brake, anti-backdrive and redundant safety elements.
    </p>
    <div style="overflow-x: auto; margin: 0.8rem 0">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #d7dee7; padding: 0.45rem 0.4rem">Designation (Tr d x P)</th>
            <th style="text-align: left; border-bottom: 1px solid #d7dee7; padding: 0.45rem 0.4rem">Nominal diameter</th>
            <th style="text-align: left; border-bottom: 1px solid #d7dee7; padding: 0.45rem 0.4rem">Pitch</th>
            <th style="text-align: left; border-bottom: 1px solid #d7dee7; padding: 0.45rem 0.4rem">Core area (approx.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem"><strong>Tr 32 x 6</strong></td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">32 mm</td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">6 mm</td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">~505 mm\u00b2</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem"><strong>Tr 40 x 7</strong></td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">40 mm</td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">7 mm</td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">~855 mm\u00b2</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem"><strong>Tr 45 x 7</strong></td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">45 mm</td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">7 mm</td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">~1,134 mm\u00b2</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem"><strong>Tr 50 x 8</strong></td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">50 mm</td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">8 mm</td>
            <td style="border-bottom: 1px solid #edf1f5; padding: 0.45rem 0.4rem">~1,385 mm\u00b2</td>
          </tr>
          <tr>
            <td style="padding: 0.45rem 0.4rem"><strong>Tr 55 x 9</strong></td>
            <td style="padding: 0.45rem 0.4rem">55 mm</td>
            <td style="padding: 0.45rem 0.4rem">9 mm</td>
            <td style="padding: 0.45rem 0.4rem">~1,630 mm\u00b2</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="muted" style="margin: 0 0 0.8rem; line-height: 1.45">
      <strong>Materials and wear:</strong> typical industrial lift pairing: <strong>carbon steel screw (e.g. C45)</strong> + <strong>bronze nut (e.g. CuSn12)</strong>. Goal: reduce galling and concentrate wear in the replaceable nut.
      Typical bronze nut life: <strong>500\u20132000 h</strong> depending on load and lubrication; plan periodic clearance and wear inspections.
    </p>
    <div style="margin-top: 0.8rem; padding: 0.7rem 0.8rem; border: 1px solid rgba(2, 132, 199, 0.35); background: rgba(14, 165, 233, 0.08); border-radius: 8px">
      <p style="margin: 0; font-size: 0.9rem; line-height: 1.45">
        <strong>Engineering note:</strong> keep a <strong>periodic lubrication</strong> plan. If lubrication fails, effective friction drifts from design: torque, temperature, wear and self-lock margin all change.
      </p>
    </div>`,
  'carConv.modelScopeHtml':
    '<strong>Model:</strong> educational, 2 columns, simplified power screw. <a href="#car-lift-assumptions">Assumptions and exclusions</a>',
  'carConv.btnMotors': 'View suggested gearmotors',
  'carConv.calcHintHtml':
    'Results and the diagram <strong>update when inputs change</strong>. This button expands the gearmotor block.',
  'carConv.dashboardTitle': 'Sizing dashboard',
  'carConv.dashboardLeadHtml':
    'Torque and power at the <strong>screw</strong> (design includes service factor). Check <strong>self-locking</strong> and <strong>nut pressure</strong> alerts. <a href="#car-lift-assumptions">Assumptions</a> \u2014 indicative model, not a full code check.',
  'carConv.diagramNoteHtml':
    '<strong>Quick read:</strong> qualitative <strong>two-post</strong> layout, screw, load and safety nuts, motor position (top or bottom per your selection). <strong>H</strong>, <strong>p</strong> and <strong>d</strong> are your form values; always validate with the lift OEM.',
  'carConv.photoCaptionHtml':
    'Reference: workshop application (example). <a href="https://commons.wikimedia.org/wiki/File:Two-post_lift.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>.',
  'carConv.verifyH2Html': '<span class="panel-icon">&#10003;</span> Check a gearmotor I already have',
  'carConv.verifyLeadHtml':
    '<strong>Two ways:</strong> (1) Brand and model from the <strong>sample catalog</strong> and <em>Check for this lift</em>. (2) <em>Or enter my gearmotor manually</em>, nameplate data and run the check. Motor power, torque and <strong>output rpm vs. screw</strong> are compared to the calculated duty.',
  'carConv.verifyRunBtn': 'Check for this lift',
  'carConv.engTitle': 'Engineering breakdown',
  'carConv.engHint': 'Collapsed by default \u2014 gearbox, motor strategies and power-screw steps',
  'carConv.engLead': 'Screw torque, kinematics, nut pressure and indicative gearmotor approaches.',
  'carConv.motorsTitle': 'Gearmotors (sample catalog)',
  'carConv.motorsHint': 'Collapsed by default \u2014 recommendations, export and verification',
  'carConv.assumptionsTitle': 'Model assumptions',
  'carConv.assumptionsHint': 'Educational limits (not a certified lift calculation)',
  'carConv.pdfExportH2Html': '<span class="panel-icon">PDF</span> Export report',
  'carConv.threadPresetHintLocked': 'd and lead locked to the selected standard',
  'carConv.threadPresetHintCustom': 'Enter d and lead manually',
};
