// HUD rendering — canvas 2D API drawn AFTER ctx.putImageData().
// All coordinates are in native canvas pixels (320×224 space).
// CSS integer scaling is handled externally; draw here as if at 1:1.
//
// Layout:
//   Top-left  : LAP X/N  (line 1)  +  M:SS.mm  (line 2)  +  BEST M:SS.mm  (line 3, once set)
//   Top-right : SPD NNN

const FONT      = 'bold 8px monospace';
const COL_MAIN  = '#FFFF00';   // neon yellow
const COL_BEST  = '#00FF00';   // neon green — best lap time
const COL_DONE  = '#FF00FF';   // neon magenta — "FINISHED" state
const LINE_H    = 10;          // px between HUD text lines
const MARGIN    = 4;           // px from canvas edge

// Pad number to 2 digits
function p2(n) { return String(n).padStart(2, '0'); }

// Format milliseconds as "M:SS.mm"
function fmtTime(ms) {
  if (!isFinite(ms)) return '--:--.--';
  const cs      = Math.floor(ms / 10);
  const cents   = cs % 100;
  const totalS  = Math.floor(cs / 100);
  const secs    = totalS % 60;
  const mins    = Math.floor(totalS / 60);
  return `${mins}:${p2(secs)}.${p2(cents)}`;
}

// drawHUD — call after ctx.putImageData() each frame.
export function drawHUD(ctx, lapState, world) {
  const nowMs      = performance.now();
  const currentMs  = nowMs - lapState.lapStart;
  const finished   = lapState.lap >= lapState.totalLaps;

  ctx.save();
  ctx.font         = FONT;
  ctx.textBaseline = 'top';
  ctx.shadowColor  = '#000000';
  ctx.shadowBlur   = 3;

  // ── Top-left: lap counter + timer ──────────────────────────────────────────
  ctx.textAlign = 'left';

  const displayLap = Math.min(lapState.lap + 1, lapState.totalLaps);
  ctx.fillStyle = finished ? COL_DONE : COL_MAIN;
  ctx.fillText(
    finished ? `FINISHED` : `LAP ${displayLap}/${lapState.totalLaps}`,
    MARGIN, MARGIN
  );

  ctx.fillStyle = COL_MAIN;
  ctx.fillText(fmtTime(finished ? 0 : currentMs), MARGIN, MARGIN + LINE_H);

  if (isFinite(lapState.bestMs)) {
    ctx.fillStyle = COL_BEST;
    ctx.fillText(`BEST ${fmtTime(lapState.bestMs)}`, MARGIN, MARGIN + LINE_H * 2);
  }

  // ── Top-right: speed ────────────────────────────────────────────────────────
  ctx.textAlign = 'right';
  ctx.fillStyle = COL_MAIN;
  const spd = String(Math.floor(world.speed)).padStart(3, '0');
  ctx.fillText(`SPD ${spd}`, 320 - MARGIN, MARGIN);

  ctx.restore();
}
