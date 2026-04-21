/**
 * Vista lateral esquemática del hueco: polea tractora, cabina, contrapeso, guías, arrollamiento.
 */

/**
 * @param {SVGSVGElement | null} svg
 * @param {object} p
 * @param {number} p.travelHeight_m
 * @param {'1_1'|'2_1'} p.reeving
 */
export function renderTractionElevatorDiagram(svg, p) {
  if (!svg) return;
  const H = Math.max(2, Number(p.travelHeight_m) || 12);
  const reeving = p.reeving === '2_1' ? '2_1' : '1_1';
  const scale = 5.2;
  const top = 40;
  const shaftH = 28 + H * scale;
  const vbW = 320;
  const vbH = top + shaftH + 50;
  const xC = 95;
  const xW = 235;
  const xP = 175;
  const yP = top + 8;
  const rP = 22;
  const yBot = top + shaftH - 20;
  const carH = Math.min(52, 18 + H * 0.35);
  const cwH = carH * 0.85;
  const yCar = yBot - carH;
  const yCw = yBot - cwH;

  const rope1 = reeving === '1_1'
    ? `<path d="M ${xP} ${yP + rP} L ${xC + 22} ${yCar + 8}" fill="none" stroke="#334155" stroke-width="1.8"/>
       <path d="M ${xP} ${yP + rP} L ${xW - 18} ${yCw + 6}" fill="none" stroke="#64748b" stroke-width="1.8"/>
       <text x="${xP + 35}" y="${(yP + rP + yCar) / 2}" font-size="7" fill="#475569" font-family="Inter,system-ui,sans-serif">1:1</text>`
    : `<path d="M ${xP - 6} ${yP + rP} Q ${xC} ${yP + rP + 40} ${xC + 22} ${yCar + 8}" fill="none" stroke="#334155" stroke-width="1.6"/>
       <path d="M ${xP + 6} ${yP + rP} Q ${xW} ${yP + rP + 40} ${xW - 18} ${yCw + 6}" fill="none" stroke="#64748b" stroke-width="1.6"/>
       <text x="${xP + 40}" y="${yP + rP + 55}" font-size="7" fill="#475569" font-family="Inter,system-ui,sans-serif">2:1 (esquema)</text>`;

  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  svg.innerHTML = `
    <defs>
      <linearGradient id="teShaft" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f1f5f9"/><stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#f8fafc"/>
    <text x="12" y="22" font-size="11" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">Hueco · vista lateral</text>
    <text x="12" y="34" font-size="8" fill="#64748b" font-family="Inter,system-ui,sans-serif">Recorrido H ≈ ${H.toFixed(1)} m · Arrollamiento ${reeving === '2_1' ? '2:1' : '1:1'}</text>
    <rect x="40" y="${top}" width="240" height="${shaftH}" rx="4" fill="url(#teShaft)" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="${xC - 32}" y1="${top + 6}" x2="${xC - 32}" y2="${yBot + 8}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="5 4"/>
    <line x1="${xW + 32}" y1="${top + 6}" x2="${xW + 32}" y2="${yBot + 8}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="${xC - 48}" y="${(top + yBot) / 2}" font-size="6.5" fill="#94a3b8" font-family="Inter,system-ui,sans-serif" transform="rotate(-90,${xC - 52},${(top + yBot) / 2})">Guías</text>
    <circle cx="${xP}" cy="${yP}" r="${rP}" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5"/>
    <text x="${xP}" y="${yP - rP - 6}" text-anchor="middle" font-size="7" font-weight="700" fill="#0c4a6e" font-family="Inter,system-ui,sans-serif">Polea tractora</text>
    ${rope1}
    <rect x="${xC - 28}" y="${yCar}" width="56" height="${carH}" rx="3" fill="#ccfbf1" stroke="#0f766e" stroke-width="2"/>
    <text x="${xC}" y="${yCar + carH / 2 + 4}" text-anchor="middle" font-size="8" font-weight="700" fill="#134e4a" font-family="Inter,system-ui,sans-serif">Cabina</text>
    <rect x="${xW - 28}" y="${yCw}" width="56" height="${cwH}" rx="3" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
    <text x="${xW}" y="${yCw + cwH / 2 + 4}" text-anchor="middle" font-size="8" font-weight="700" fill="#78350f" font-family="Inter,system-ui,sans-serif">CP</text>
    <line x1="38" y1="${yBot + 8}" x2="282" y2="${yBot + 8}" stroke="#475569" stroke-width="2"/>
    <text x="${vbW / 2}" y="${vbH - 12}" text-anchor="middle" font-size="7" fill="#64748b" font-family="Inter,system-ui,sans-serif">Foso / última planta (esquema)</text>
  `;
}
