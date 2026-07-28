// HUD rendering on a high-resolution overlay canvas.

const COL_MAIN = '#FFFF00';
const COL_BEST = '#00FF00';
const COL_DONE = '#FF00FF';
const PULSE_CYAN = '#00FFFF';
const PULSE_MAGENTA = '#FF00FF';
const PILOT_NAME = "Jackson 'Digital' Miller";
const SHIP_NAME = 'APEX-RED';
const MAP_CYAN = '#00FFFF';
const MAP_MAGENTA = '#FF00FF';
const MAP_GOLD = '#FFD000';

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function pulseColor(nowMs) {
  return (Math.floor(nowMs / 400) % 2 === 0) ? PULSE_CYAN : PULSE_MAGENTA;
}

function p2(n) {
  return String(n).padStart(2, '0');
}

function fmtTime(ms) {
  if (!isFinite(ms) || ms < 0) return '--:--.--';
  const cs = Math.floor(ms / 10);
  const cents = cs % 100;
  const totS = Math.floor(cs / 100);
  const secs = totS % 60;
  const mins = Math.floor(totS / 60);
  return `${mins}:${p2(secs)}.${p2(cents)}`;
}

export function drawHUD(hudCtx, scale, lapState, world, track = null, feedback = null, debug = null, guidance = null) {
  const W = hudCtx.canvas.width;
  const H = hudCtx.canvas.height;

  hudCtx.clearRect(0, 0, W, H);

  const nowMs = performance.now();
  const finished = lapState.lap >= lapState.totalLaps;
  const currentMs = finished ? null : (nowMs - lapState.lapStart);
  const fontSize = Math.round(8 * scale);
  const lineH = Math.round(10 * scale);
  const margin = Math.round(4 * scale);

  hudCtx.save();
  hudCtx.font = `bold ${fontSize}px "Courier New", monospace`;
  hudCtx.textBaseline = 'top';
  hudCtx.shadowColor = '#000';
  hudCtx.shadowBlur = Math.max(2, scale);

  hudCtx.textAlign = 'left';
  const displayLap = Math.min(lapState.lap + 1, lapState.totalLaps);
  hudCtx.fillStyle = finished ? COL_DONE : COL_MAIN;
  hudCtx.fillText(finished ? 'FINISHED' : `LAP ${displayLap}/${lapState.totalLaps}`, margin, margin);

  if (!finished) {
    hudCtx.fillStyle = COL_MAIN;
    hudCtx.fillText(fmtTime(currentMs), margin, margin + lineH);

    hudCtx.fillStyle = pulseColor(nowMs);
    hudCtx.fillText(PILOT_NAME, margin, margin + lineH * 2);

    hudCtx.fillStyle = pulseColor(nowMs + 200);
    hudCtx.fillText(SHIP_NAME, margin, margin + lineH * 3);
  }

  if (track) {
    hudCtx.fillStyle = '#00FFFF';
    hudCtx.fillText(track.name, margin, margin + lineH * (finished ? 2 : 4));
  }

  if (isFinite(lapState.bestMs)) {
    hudCtx.fillStyle = COL_BEST;
    hudCtx.fillText(`BEST ${fmtTime(lapState.bestMs)}`, margin, margin + lineH * (finished ? 1 : 5));
  }

  hudCtx.textAlign = 'right';
  hudCtx.fillStyle = COL_MAIN;
  const spd = String(Math.floor(world.speed)).padStart(3, '0');
  hudCtx.fillText(`SPD ${spd}`, W - margin, margin);

  hudCtx.restore();

  if (track) {
    drawMiniMap(hudCtx, scale, W, track, world);
  }

  if (finished) {
    drawFinishPanel(hudCtx, scale, W, H, lapState);
  }

  // Bottom-left keeps the center-mounted player ship clear.
  const barH = Math.round(6 * scale);
  const segW = Math.round(8 * scale);
  const segGap = Math.round(1 * scale);
  const barW = segW * 8 + segGap * 7;
  const barX = margin;
  const barY = Math.round(H - barH - margin * 2);
  const energy = clamp01(world.energy);
  const filled = energy > 0 ? Math.ceil(energy * 8) : 0;
  const isEmpty = energy <= 0;

  hudCtx.save();
  hudCtx.font = `bold ${Math.round(6 * scale)}px "Courier New", monospace`;
  hudCtx.textBaseline = 'bottom';
  hudCtx.textAlign = 'center';
  hudCtx.shadowColor = '#000';
  hudCtx.shadowBlur = Math.max(2, scale);
  hudCtx.fillStyle = isEmpty ? pulseColor(nowMs) : COL_MAIN;
  hudCtx.fillText(isEmpty ? 'EMPTY' : 'ENERGY', barX + barW / 2, barY - Math.round(2 * scale));

  for (let i = 0; i < 8; i++) {
    const col = i < filled
      ? (filled > 4 ? '#00FF40' : filled > 2 ? '#FFFF00' : '#FF2020')
      : (isEmpty ? '#050508' : '#1A1A2A');
    hudCtx.fillStyle = col;
    hudCtx.shadowBlur = 0;
    hudCtx.fillRect(barX + i * (segW + segGap), barY, segW, barH);
  }

  hudCtx.strokeStyle = isEmpty ? pulseColor(nowMs + 200) : COL_MAIN;
  hudCtx.lineWidth = Math.max(1, scale * 0.5);
  hudCtx.shadowBlur = Math.max(2, scale);
  hudCtx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
  hudCtx.restore();

  if (guidance && !finished) {
    drawRaceGuidance(hudCtx, scale, W, H, guidance, nowMs);
  }

  if (feedback && feedback.untilMs > nowMs) {
    drawZoneFeedback(hudCtx, scale, W, H, feedback, nowMs);
  }

  if (debug?.enabled) {
    drawDebugPanel(hudCtx, scale, W, debug);
  }
}

function drawRaceGuidance(ctx, scale, W, H, guidance, nowMs) {
  const cx = Math.round(W / 2);
  const cy = Math.round(H * 0.34);
  const arrowSize = Math.round(9 * scale);
  const pulse = 0.65 + 0.35 * Math.sin(nowMs * 0.012);
  const arrowColor = guidance.wrongWay ? '#FF3030' : '#00FFFF';
  const labelColor = guidance.wrongWay ? '#FFFF00' : '#FFD000';

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(guidance.targetAngle);
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = arrowColor;
  ctx.shadowBlur = Math.max(3, scale * 2);
  ctx.strokeStyle = arrowColor;
  ctx.lineWidth = Math.max(1, scale);
  ctx.beginPath();
  ctx.arc(0, 0, Math.round(arrowSize * 0.95), 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = arrowColor;
  ctx.beginPath();
  ctx.moveTo(0, -arrowSize);
  ctx.lineTo(Math.round(arrowSize * 0.62), Math.round(arrowSize * 0.52));
  ctx.lineTo(0, Math.round(arrowSize * 0.20));
  ctx.lineTo(-Math.round(arrowSize * 0.62), Math.round(arrowSize * 0.52));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `bold ${Math.round(5 * scale)}px "Courier New", monospace`;
  ctx.shadowColor = '#000';
  ctx.shadowBlur = Math.max(2, scale);
  ctx.fillStyle = labelColor;
  const gate = guidance.nextCheckpoint === 0 ? 'START' : `CP ${guidance.nextCheckpoint}`;
  ctx.fillText(gate, cx, cy + Math.round(arrowSize * 1.25));

  if (guidance.wrongWay) {
    const bannerY = Math.round(H * 0.43);
    const textPulse = pulse > 0.82 ? '#FFFFFF' : '#FF3030';
    ctx.font = `bold ${Math.round(11 * scale)}px "Courier New", monospace`;
    ctx.fillStyle = textPulse;
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = Math.max(4, scale * 3);
    ctx.fillText('WRONG WAY', cx, bannerY);
    ctx.font = `bold ${Math.round(6 * scale)}px "Courier New", monospace`;
    ctx.fillStyle = '#FFFF00';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = Math.max(2, scale);
    ctx.fillText('FOLLOW CHECKPOINT ARROW', cx, bannerY + Math.round(13 * scale));
  }

  ctx.restore();
}

function drawZoneFeedback(ctx, scale, W, H, feedback, nowMs) {
  const ttl = Math.max(1, feedback.untilMs - feedback.startedMs);
  const t = Math.max(0, Math.min(1, (nowMs - feedback.startedMs) / ttl));
  const alpha = 1 - t;
  const y = Math.round(H * 0.58 - t * 8 * scale);

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(11 * scale)}px "Courier New", monospace`;
  ctx.shadowColor = '#000';
  ctx.shadowBlur = Math.max(3, scale * 2);
  ctx.fillStyle = feedback.color;
  ctx.fillText(feedback.text, W / 2, y);
  ctx.restore();
}

function drawDebugPanel(ctx, scale, W, debug) {
  const margin = Math.round(4 * scale);
  const x = W - Math.round(88 * scale) - margin;
  const y = Math.round(60 * scale);
  const w = Math.round(88 * scale);
  const lineH = Math.round(7 * scale);
  const rows = debug.rows ?? [];
  const h = Math.round((rows.length + 2) * lineH + 5 * scale);

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.75)';
  ctx.lineWidth = Math.max(1, scale * 0.5);
  ctx.strokeRect(x, y, w, h);

  ctx.font = `bold ${Math.round(5 * scale)}px "Courier New", monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = Math.max(1, scale);

  let py = y + Math.round(3 * scale);
  ctx.fillStyle = '#00FFFF';
  ctx.fillText('DEBUG F3', x + Math.round(3 * scale), py);
  py += lineH + Math.round(2 * scale);

  for (const row of rows) {
    ctx.fillStyle = row.color ?? '#FFFF00';
    ctx.fillText(row.text, x + Math.round(3 * scale), py);
    py += lineH;
  }

  ctx.restore();
}

export function drawCrashOverlay(ctx, scale, world, crashState) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const t = Math.max(0, crashState.elapsed);
  const life = Math.min(1, t / crashState.duration);
  const cx = W / 2;
  const cy = H - Math.round(21 * scale);
  const radius = Math.round((10 + life * 42) * scale);
  const colors = ['#FFFFFF', '#FFFF00', '#FF7A00', '#FF2020', '#FF00FF'];

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2 + crashState.seed * 0.01;
    const wobble = Math.sin(t * 18 + i * 1.7) * 0.18;
    const dist = radius * (0.25 + ((i * 37) % 100) / 120) * (0.6 + life * 0.8);
    const x = cx + Math.cos(angle + wobble) * dist;
    const y = cy + Math.sin(angle + wobble) * dist * 0.58;
    const size = Math.max(2, Math.round((5 - life * 3 + (i % 3)) * scale));
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
  }

  ctx.strokeStyle = colors[Math.floor(t * 18) % colors.length];
  ctx.lineWidth = Math.max(1, Math.round(2 * scale));
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius * 0.75, radius * 0.36, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  if (life > 0.55) {
    const respawning = crashState.respawnAt && t > crashState.duration;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${Math.round(10 * scale)}px "Courier New", monospace`;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = Math.max(2, scale);
    ctx.fillStyle = pulseColor(performance.now());
    ctx.fillText(respawning ? 'RESPAWNING' : 'MACHINE LOST', W / 2, Math.round(H * 0.36));
    ctx.font = `bold ${Math.round(6 * scale)}px "Courier New", monospace`;
    ctx.fillStyle = '#FFFF00';
    ctx.fillText(respawning ? 'STANDBY' : 'RECOVERY INBOUND', W / 2, Math.round(H * 0.36 + 14 * scale));
    ctx.restore();
  }
}

function drawMiniMap(ctx, scale, W, track, world) {
  const mapW = Math.round(54 * scale);
  const mapH = Math.round(38 * scale);
  const margin = Math.round(4 * scale);
  const x = W - mapW - margin;
  const y = Math.round(18 * scale);
  const cx = x + mapW / 2;
  const cy = y + mapH / 2;
  const { bounds } = track;
  const outerRx = mapW * 0.44;
  const outerRy = mapH * 0.40;
  const innerRx = outerRx * (bounds.dInner / bounds.dOuter);
  const innerRy = outerRy * (bounds.dInner / bounds.dOuter);
  const mapOuter = track.theme?.outerEdge ?? MAP_CYAN;
  const mapInner = track.theme?.innerEdge ?? MAP_MAGENTA;
  const mapPlayer = track.theme?.centerGuide ?? MAP_GOLD;

  ctx.save();
  ctx.strokeStyle = track.theme?.id === 'aurora-causeway'
    ? 'rgba(255,231,163,0.24)'
    : 'rgba(0,255,255,0.28)';
  ctx.lineWidth = Math.max(1, scale * 0.5);
  ctx.strokeRect(x, y, mapW, mapH);

  ctx.beginPath();
  ctx.ellipse(cx, cy, outerRx, outerRy, 0, 0, Math.PI * 2);
  ctx.strokeStyle = mapOuter;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, cy, innerRx, innerRy, 0, 0, Math.PI * 2);
  ctx.strokeStyle = mapInner;
  ctx.stroke();

  const px = cx + ((world.x - bounds.cx) / (bounds.a * bounds.dOuter)) * outerRx;
  const py = cy + ((world.y - bounds.cy) / (bounds.b * bounds.dOuter)) * outerRy;
  ctx.fillStyle = mapPlayer;
  ctx.fillRect(Math.round(px - scale), Math.round(py - scale), Math.max(2, scale * 2), Math.max(2, scale * 2));

  const noseX = px + Math.cos(world.heading) * Math.max(4, scale * 4);
  const noseY = py + Math.sin(world.heading) * Math.max(4, scale * 4);
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(noseX, noseY);
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
  ctx.restore();
}

function drawFinishPanel(ctx, scale, W, H, lapState) {
  const panelW = Math.round(104 * scale);
  const panelH = Math.round(38 * scale);
  const x = Math.round((W - panelW) / 2);
  const y = Math.round(H * 0.16);
  const titleSize = Math.round(10 * scale);
  const bodySize = Math.round(7 * scale);

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.68)';
  ctx.fillRect(x, y, panelW, panelH);
  ctx.strokeStyle = MAP_CYAN;
  ctx.lineWidth = Math.max(1, scale);
  ctx.strokeRect(x, y, panelW, panelH);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = Math.max(2, scale);
  ctx.font = `bold ${titleSize}px "Courier New", monospace`;
  ctx.fillStyle = COL_DONE;
  ctx.fillText('FINISHED', W / 2, y + Math.round(4 * scale));

  ctx.font = `bold ${bodySize}px "Courier New", monospace`;
  ctx.fillStyle = COL_MAIN;
  ctx.fillText(`FINAL ${fmtTime(lapState.finishMs ?? lapState.totalMs)}`, W / 2, y + Math.round(18 * scale));
  ctx.fillStyle = COL_BEST;
  ctx.fillText(`BEST ${fmtTime(lapState.bestMs)}`, W / 2, y + Math.round(28 * scale));
  ctx.restore();
}
