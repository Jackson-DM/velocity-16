// VELOCITY-16 title and course-selection screen on the HUD overlay canvas.

export function drawTitleScreen(ctx, scale, frame, menu = {}) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const courses = menu.courses ?? [];
  const selectedIndex = menu.selectedIndex ?? 0;
  const selectedCourse = courses[selectedIndex] ?? null;
  const accent = selectedCourse?.accent ?? '#00FFFF';
  const secondary = selectedCourse?.secondary ?? '#FF00CC';

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0, 2, 14, 0.74)';
  ctx.fillRect(0, 0, W, H);

  const border = Math.round(4 * scale);
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1, Math.round(2 * scale));
  ctx.strokeRect(border, border, W - border * 2, H - border * 2);

  const vSize = Math.round(18 * scale);
  const nSize = Math.round(12 * scale);
  const subSize = Math.round(7 * scale);
  const tinySize = Math.round(5 * scale);

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = `bold ${vSize}px "Courier New", monospace`;
  const vW = ctx.measureText('VELOCITY').width;

  ctx.font = `bold ${nSize}px "Courier New", monospace`;
  const nW = ctx.measureText('-16').width;

  const logoX = (W - (vW + nW)) / 2;
  const logoY = Math.round(H * 0.10);
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
  ctx.fillStyle = secondary;
  ctx.font = `bold ${nSize}px "Courier New", monospace`;
  ctx.fillText('-16', logoX + vW, logoY + nBaselineAdj);

  ctx.textAlign = 'center';
  ctx.font = `bold ${subSize}px "Courier New", monospace`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('SELECT COURSE', W / 2, Math.round(H * 0.31));

  const rowW = Math.round(132 * scale);
  const rowH = Math.round(24 * scale);
  const rowGap = Math.round(5 * scale);
  const rowX = Math.round((W - rowW) / 2);
  const rowsY = Math.round(H * 0.39);

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const selected = i === selectedIndex;
    const rowY = rowsY + i * (rowH + rowGap);

    ctx.fillStyle = selected ? 'rgba(0,0,0,0.76)' : 'rgba(0,0,12,0.50)';
    ctx.fillRect(rowX, rowY, rowW, rowH);

    ctx.strokeStyle = selected ? accent : 'rgba(180,200,255,0.28)';
    ctx.lineWidth = Math.max(1, selected ? scale : scale * 0.5);
    ctx.strokeRect(rowX, rowY, rowW, rowH);

    ctx.font = `bold ${subSize}px "Courier New", monospace`;
    ctx.fillStyle = selected ? '#FFFFFF' : '#71809E';
    ctx.fillText(`${selected ? '>' : ' '} ${course.name} ${selected ? '<' : ' '}`, W / 2, rowY + Math.round(4 * scale));

    ctx.font = `${tinySize}px "Courier New", monospace`;
    ctx.fillStyle = selected ? course.accent : '#4E5870';
    ctx.fillText(course.description, W / 2, rowY + Math.round(14 * scale));
  }

  const pulse = (Math.floor(performance.now() / 400) % 2 === 0) ? accent : secondary;
  ctx.font = `bold ${subSize}px "Courier New", monospace`;
  ctx.fillStyle = pulse;
  ctx.fillText('↑ ↓ / A D  CHOOSE', W / 2, Math.round(H * 0.70));
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('ENTER / SPACE  RACE', W / 2, Math.round(H * 0.76));

  ctx.font = `${tinySize}px "Courier New", monospace`;
  ctx.fillStyle = '#A8B4C8';
  ctx.fillText("Jackson 'Digital' Miller  //  APEX-RED", W / 2, Math.round(H * 0.84));

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let sy = 0; sy < H; sy += 2 * scale) {
    ctx.fillRect(0, sy, W, Math.max(1, Math.round(scale)));
  }

  const margin = Math.round(4 * scale);
  ctx.font = `${tinySize}px "Courier New", monospace`;
  ctx.fillStyle = '#667088';
  ctx.textBaseline = 'bottom';
  ctx.fillText('PHASE 2 // FIRST OFFICIAL TRACK', W / 2, H - margin);
}
