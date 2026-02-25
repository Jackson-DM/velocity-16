// title-screen.js — VELOCITY-16 splash screen drawn on the HUD overlay canvas.
// drawTitleScreen(ctx, scale, frame) → void

export function drawTitleScreen(ctx, scale, frame) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  ctx.clearRect(0, 0, W, H);

  // ── Black fill ─────────────────────────────────────────────────────────────
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // ── Neon border: 2px cyan rect inset 4px from canvas edges ────────────────
  const border = Math.round(4 * scale);
  ctx.strokeStyle   = '#00FFFF';
  ctx.lineWidth     = Math.max(1, Math.round(2 * scale));
  ctx.strokeRect(border, border, W - border * 2, H - border * 2);

  // ── Logo: "VELOCITY" (neon yellow 20px) + "-16" (neon magenta 14px) ───────
  const vSize = Math.round(20 * scale);
  const nSize = Math.round(14 * scale);

  ctx.font = `bold ${vSize}px "Courier New", monospace`;
  ctx.textBaseline = 'top';
  const vW = ctx.measureText('VELOCITY').width;

  ctx.font = `bold ${nSize}px "Courier New", monospace`;
  const nW = ctx.measureText('-16').width;

  const logoTotalW = vW + nW;
  const logoX = (W - logoTotalW) / 2;
  const logoY = Math.round(H * 0.28);

  // Drop shadow (dark purple, 2px down-right)
  const shadowOff = Math.round(2 * scale);
  ctx.fillStyle    = '#2A0050';

  ctx.font = `bold ${vSize}px "Courier New", monospace`;
  ctx.fillText('VELOCITY', logoX + shadowOff, logoY + shadowOff);

  ctx.font = `bold ${nSize}px "Courier New", monospace`;
  const nBaselineAdj = Math.round((vSize - nSize) / 2);  // vertically center "-16" with "VELOCITY"
  ctx.fillText('-16', logoX + vW + shadowOff, logoY + nBaselineAdj + shadowOff);

  // "VELOCITY" — neon yellow
  ctx.fillStyle = '#FFFF00';
  ctx.font      = `bold ${vSize}px "Courier New", monospace`;
  ctx.fillText('VELOCITY', logoX, logoY);

  // "-16" — neon magenta
  ctx.fillStyle = '#FF00CC';
  ctx.font      = `bold ${nSize}px "Courier New", monospace`;
  ctx.fillText('-16', logoX + vW, logoY + nBaselineAdj);

  // ── "MUTE CITY I": 8px neon cyan, 32px below logo ─────────────────────────
  const subSize = Math.round(8 * scale);
  ctx.font      = `bold ${subSize}px "Courier New", monospace`;
  ctx.fillStyle = '#00FFFF';
  ctx.textAlign = 'center';
  ctx.fillText('MUTE CITY I', W / 2, logoY + vSize + Math.round(32 * scale));

  // ── "PRESS START": 8px white, centered at 60% height, pulsing ─────────────
  const alpha = 0.5 + 0.5 * Math.sin(frame * 0.06);
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = '#FFFFFF';
  ctx.font        = `bold ${subSize}px "Courier New", monospace`;
  ctx.fillText('PRESS START', W / 2, Math.round(H * 0.60));
  ctx.globalAlpha = 1.0;

  // ── Scanline overlay: 1px black line every 2 game-pixel rows ──────────────
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let sy = 0; sy < H; sy += 2 * scale) {
    ctx.fillRect(0, sy, W, Math.max(1, Math.round(scale)));
  }

  // ── Credit: © 1991 NINTENDO R&D, 6px gray, bottom-center ─────────────────
  const credSize = Math.round(6 * scale);
  const margin   = Math.round(4 * scale);
  ctx.font        = `${credSize}px "Courier New", monospace`;
  ctx.fillStyle   = '#888888';
  ctx.textBaseline = 'bottom';
  ctx.fillText('\u00A9 1991 NINTENDO R&D', W / 2, H - margin);
}
