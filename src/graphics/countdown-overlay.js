// countdown-overlay.js — Rendered on the HUD overlay canvas (2D ctx).
// State phases: 'pilot_card' → '3' → '2' → '1' → 'go' → 'done'
//
// drawCountdown(hudCtx, scale, state)
// state = { phase, elapsed, pilotIndex, beepFired }

// Pilot card data — mirrors main.js RACER_PILOTS order (player, Juggernaut, Mantis)
const PILOTS = [
  { name: 'Jackson \'Digital\' Miller', ship: 'APEX-RED',     tagline: '"Speed is survival."',      color: '#FF00FF' },
  { name: 'BARON VON STRYKER',        ship: 'JUGGERNAUT-7', tagline: '"Crush them all."',        color: '#FF4500' },
  { name: 'XYLAR THE EXILED',         ship: 'MANTIS-RAY',   tagline: '"You cannot catch wind."', color: '#FF00FF' },
];

export function drawCountdown(hudCtx, scale, state) {
  const W = hudCtx.canvas.width;
  const H = hudCtx.canvas.height;

  hudCtx.clearRect(0, 0, W, H);

  if (state.phase === 'pilot_card') {
    _drawPilotCard(hudCtx, scale, W, H, state);
  } else if (state.phase === '3' || state.phase === '2' || state.phase === '1') {
    _drawDigit(hudCtx, scale, W, H, state.phase, state.elapsed);
  } else if (state.phase === 'go') {
    _drawGo(hudCtx, scale, W, H, state.elapsed);
  }
  // 'done' phase → nothing drawn (game takes over)
}

// ─── Pilot card ───────────────────────────────────────────────────────────────
function _drawPilotCard(ctx, scale, W, H, state) {
  const idx  = state.pilotIndex;
  if (idx >= PILOTS.length) return;

  const pilot = PILOTS[idx];

  // Semi-transparent black bg
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  const cx = W / 2;
  const cy = H / 2;

  // Pilot name — neon yellow 16px×scale
  ctx.font      = `bold ${Math.round(16 * scale)}px "Courier New", monospace`;
  ctx.fillStyle = '#FFFF00';
  ctx.fillText(pilot.name, cx, cy - Math.round(18 * scale));

  // Ship name — color 10px×scale
  ctx.font      = `bold ${Math.round(10 * scale)}px "Courier New", monospace`;
  ctx.fillStyle = pilot.color;
  ctx.fillText(pilot.ship, cx, cy);

  // Tagline — white 7px×scale
  ctx.font      = `${Math.round(7 * scale)}px "Courier New", monospace`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(pilot.tagline, cx, cy + Math.round(16 * scale));

  ctx.restore();
}

// ─── Countdown digit (3, 2, 1) ────────────────────────────────────────────────
function _drawDigit(ctx, scale, W, H, digit, elapsed) {
  // Pulsing scale: 1.0 + 0.25*sin(elapsed*π/0.85)
  const pulse  = 1.0 + 0.25 * Math.sin(elapsed * Math.PI / 0.85);
  const fSize  = Math.round(48 * scale * pulse);

  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font         = `bold ${fSize}px "Courier New", monospace`;
  ctx.fillStyle    = '#FF00FF';  // neon magenta
  ctx.fillText(digit, W / 2, H / 2);
  ctx.restore();
}

// ─── GO! ─────────────────────────────────────────────────────────────────────
function _drawGo(ctx, scale, W, H, elapsed) {
  const fSize = Math.round(52 * scale);
  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font         = `bold ${fSize}px "Courier New", monospace`;
  ctx.fillStyle    = '#FFFF00';  // neon yellow
  ctx.fillText('GO!', W / 2, H / 2);
  ctx.restore();
}
