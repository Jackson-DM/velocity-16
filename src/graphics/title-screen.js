// VELOCITY-16 title screen drawn on the HUD overlay canvas.

export function drawTitleScreen(ctx, scale, frame, trackName = 'FEEL LAB 01') {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  const border = Math.round(4 * scale);
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = Math.max(1, Math.round(2 * scale));
  ctx.strokeRect(border, border, W - border * 2, H - border * 2);

  const vSize = Math.round(20 * scale);
  const nSize = Math.round(14 * scale);
  const subSize = Math.round(8 * scale);

  ctx.textBaseline = 'top';
  ctx.font = `bold ${vSize}px "Courier New", monospace`;
  const vW = ctx.measureText('VELOCITY').width;

  ctx.font = `bold ${nSize}px "Courier New", monospace`;
  const nW = ctx.measureText('-16').width;

  const logoX = (W - (vW + nW)) / 2;
  const logoY = Math.round(H * 0.25);
  const shadowOff = Math.round(2 * scale);
  const nBaselineAdj = Math.round((vSize - nSize) / 2);

  ctx.fillStyle = '#2A0050';
  ctx.font = `bold ${vSize}px "Courier New", monospace`;
  ctx.fillText('VELOCITY', logoX + shadowOff, logoY + shadowOff);
  ctx.font = `bold ${nSize}px "Courier New", monospace`;
  ctx.fillText('-16', logoX + vW + shadowOff, logoY + nBaselineAdj + shadowOff);

  ctx.fillStyle = '#FFFF00';
  ctx.font = `bold ${vSize}px "Courier New", monospace`;
  ctx.fillText('VELOCITY', logoX, logoY);
  ctx.fillStyle = '#FF00CC';
  ctx.font = `bold ${nSize}px "Courier New", monospace`;
  ctx.fillText('-16', logoX + vW, logoY + nBaselineAdj);

  ctx.textAlign = 'center';
  ctx.font = `bold ${subSize}px "Courier New", monospace`;
  ctx.fillStyle = '#00FFFF';
  ctx.fillText(trackName, W / 2, logoY + vSize + Math.round(28 * scale));

  const pulse = (Math.floor(performance.now() / 400) % 2 === 0) ? '#00FFFF' : '#FF00FF';
  ctx.fillStyle = pulse;
  ctx.fillText("Jackson 'Digital' Miller", W / 2, logoY + vSize + Math.round(44 * scale));
  ctx.fillStyle = pulse === '#00FFFF' ? '#FF00FF' : '#00FFFF';
  ctx.fillText('APEX-RED', W / 2, logoY + vSize + Math.round(56 * scale));

  const alpha = 0.5 + 0.5 * Math.sin(frame * 0.06);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PRESS START', W / 2, Math.round(H * 0.68));
  ctx.globalAlpha = 1.0;

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let sy = 0; sy < H; sy += 2 * scale) {
    ctx.fillRect(0, sy, W, Math.max(1, Math.round(scale)));
  }

  const credSize = Math.round(6 * scale);
  const margin = Math.round(4 * scale);
  ctx.font = `${credSize}px "Courier New", monospace`;
  ctx.fillStyle = '#888888';
  ctx.textBaseline = 'bottom';
  ctx.fillText('VELOCITY-16 RECOVERY BUILD', W / 2, H - margin);
}
