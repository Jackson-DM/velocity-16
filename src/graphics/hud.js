// HUD rendering — drawn on a separate overlay canvas at full display resolution.
// Text rasterises at the screen's native pixel density, never blurry from CSS upscaling.
//
// drawHUD(hudCtx, scale, lapState, world)
//   hudCtx : 2D context of the overlay canvas (sized to CSS display dimensions)
//   scale  : integer CSS scale factor shared with the game canvas (e.g. 4)
//
// Layout (in game-pixel units, multiplied by scale internally):
//   Top-left  : LAP X/N  (line 1) | M:SS.mm  (line 2) | BEST M:SS.mm (line 3)
//   Top-right : SPD NNN

const COL_MAIN = '#FFFF00';  // neon yellow
const COL_BEST = '#00FF00';  // neon green — best lap time
const COL_DONE = '#FF00FF';  // neon magenta — finished state

function p2(n) { return String(n).padStart(2, '0'); }

function fmtTime(ms) {
  if (!isFinite(ms) || ms < 0) return '--:--.--';
  const cs    = Math.floor(ms / 10);
  const cents = cs % 100;
  const totS  = Math.floor(cs / 100);
  const secs  = totS % 60;
  const mins  = Math.floor(totS / 60);
  return `${mins}:${p2(secs)}.${p2(cents)}`;
}

export function drawHUD(hudCtx, scale, lapState, world) {
  const W = hudCtx.canvas.width;
  const H = hudCtx.canvas.height;

  hudCtx.clearRect(0, 0, W, H);

  const nowMs     = performance.now();
  const finished  = lapState.lap >= lapState.totalLaps;
  const currentMs = finished ? null : (nowMs - lapState.lapStart);

  // Scale all layout constants by the CSS scale factor so they stay
  // visually identical to "8px text on a 320px canvas" but render natively.
  const fontSize = Math.round(8  * scale);
  const lineH    = Math.round(10 * scale);
  const margin   = Math.round(4  * scale);

  hudCtx.save();
  hudCtx.font         = `bold ${fontSize}px "Courier New", monospace`;
  hudCtx.textBaseline = 'top';
  hudCtx.shadowColor  = '#000';
  hudCtx.shadowBlur   = Math.max(2, scale);

  // ── Top-left ───────────────────────────────────────────────────────────────
  hudCtx.textAlign = 'left';

  const displayLap = Math.min(lapState.lap + 1, lapState.totalLaps);
  hudCtx.fillStyle = finished ? COL_DONE : COL_MAIN;
  hudCtx.fillText(
    finished ? 'FINISHED' : `LAP ${displayLap}/${lapState.totalLaps}`,
    margin, margin
  );

  if (!finished) {
    hudCtx.fillStyle = COL_MAIN;
    hudCtx.fillText(fmtTime(currentMs), margin, margin + lineH);
  }

  if (isFinite(lapState.bestMs)) {
    hudCtx.fillStyle = COL_BEST;
    hudCtx.fillText(`BEST ${fmtTime(lapState.bestMs)}`, margin, margin + lineH * (finished ? 1 : 2));
  }

  // ── Top-right: speed ───────────────────────────────────────────────────────
  hudCtx.textAlign = 'right';
  hudCtx.fillStyle = COL_MAIN;
  const spd = String(Math.floor(world.speed)).padStart(3, '0');
  hudCtx.fillText(`SPD ${spd}`, W - margin, margin);

  hudCtx.restore();

  // ── Energy bar: F-Zero style, bottom-center ───────────────────────────────
  const barW   = Math.round(80 * scale);
  const barH   = Math.round(6  * scale);
  const segW   = Math.round(8  * scale);
  const segGap = Math.round(1  * scale);
  const barX   = Math.round((W - barW) / 2);
  const barY   = Math.round(H - barH - margin * 2);
  const filled = Math.round(world.energy * 8);  // 0-8 segments

  hudCtx.save();
  hudCtx.font          = `bold ${Math.round(6 * scale)}px "Courier New", monospace`;
  hudCtx.textBaseline  = 'bottom';
  hudCtx.textAlign     = 'center';
  hudCtx.shadowColor   = '#000';
  hudCtx.shadowBlur    = Math.max(2, scale);
  hudCtx.fillStyle     = COL_MAIN;
  // Label centered above the bar — no overlap at any scale.
  hudCtx.fillText('ENERGY', barX + barW / 2, barY - Math.round(2 * scale));

  for (let i = 0; i < 8; i++) {
    let col;
    if (i < filled) {
      col = filled > 4 ? '#00FF40' : filled > 2 ? '#FFFF00' : '#FF2020';
    } else {
      col = '#1A1A2A';
    }
    hudCtx.fillStyle = col;
    hudCtx.shadowBlur = 0;
    hudCtx.fillRect(barX + i * (segW + segGap), barY, segW, barH);
  }

  // Outline
  hudCtx.strokeStyle = COL_MAIN;
  hudCtx.lineWidth   = Math.max(1, scale * 0.5);
  hudCtx.shadowBlur  = Math.max(2, scale);
  hudCtx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
  hudCtx.restore();
}
