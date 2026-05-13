// podium-screen.js — Race results screen on HUD overlay canvas.
// drawPodiumScreen(hudCtx, scale, state, frame)
// state = { results:[{rank,name,pilot,time,color},...], revealFrame }

const RANK_COLORS = ['#FFD700', '#00FFFF', '#FF00FF']; // gold, cyan, magenta

function _formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  const milli = Math.floor((ms % 1000) / 10);
  return `${m}:${String(rem).padStart(2, '0')}.${String(milli).padStart(2, '0')}`;
}

export function drawPodiumScreen(hudCtx, scale, state, frame) {
  if (!state) return;
  const W = hudCtx.canvas.width;
  const H = hudCtx.canvas.height;

  hudCtx.clearRect(0, 0, W, H);

  // ── Full black background ─────────────────────────────────────────────────
  hudCtx.fillStyle = '#000000';
  hudCtx.fillRect(0, 0, W, H);

  // ── Cyan neon border (same style as title-screen.js) ──────────────────────
  const border = Math.round(4 * scale);
  hudCtx.strokeStyle = '#00FFFF';
  hudCtx.lineWidth   = Math.max(1, Math.round(2 * scale));
  hudCtx.strokeRect(border, border, W - border * 2, H - border * 2);

  hudCtx.save();
  hudCtx.textAlign    = 'center';
  hudCtx.textBaseline = 'top';

  // ── "RACE RESULTS" header — neon yellow ───────────────────────────────────
  const headerSize = Math.round(14 * scale);
  hudCtx.font      = `bold ${headerSize}px "Courier New", monospace`;
  hudCtx.fillStyle = '#FFFF00';
  hudCtx.fillText('RACE RESULTS', W / 2, Math.round(H * 0.10));

  // ── Result rows (revealed progressively by revealFrame) ───────────────────
  const REVEAL_FRAMES = [20, 50, 80];
  const ROW_START_Y   = Math.round(H * 0.28);
  const ROW_STEP      = Math.round(H * 0.18);
  const ROW_FONT_LG   = Math.round(10 * scale);
  const ROW_FONT_SM   = Math.round(7  * scale);

  for (let i = 0; i < 3; i++) {
    if (state.revealFrame < REVEAL_FRAMES[i]) continue;
    const res  = state.results[i];
    if (!res) continue;
    const rowY = ROW_START_Y + i * ROW_STEP;

    // Rank — gold/cyan/magenta
    hudCtx.textAlign  = 'left';
    hudCtx.font       = `bold ${ROW_FONT_LG}px "Courier New", monospace`;
    hudCtx.fillStyle  = RANK_COLORS[i];
    const rankLabel   = `#${i + 1}`;
    const rankX       = Math.round(W * 0.12);
    hudCtx.fillText(rankLabel, rankX, rowY);

    // ASCII trophy for 1st
    if (i === 0) {
      hudCtx.fillStyle = '#FFD700';
      hudCtx.fillText(' [*]', rankX + Math.round(18 * scale), rowY);
    }

    // Racer name — in primary color
    hudCtx.textAlign  = 'center';
    hudCtx.fillStyle  = res.color || '#FFFFFF';
    hudCtx.fillText(res.name, W / 2, rowY);

    // Pilot name — gray, smaller
    hudCtx.font       = `${ROW_FONT_SM}px "Courier New", monospace`;
    hudCtx.fillStyle  = '#888888';
    hudCtx.fillText(res.pilot, W / 2, rowY + Math.round(ROW_FONT_LG * 1.4));

    // Time — white, right-aligned
    hudCtx.textAlign  = 'right';
    hudCtx.font       = `bold ${ROW_FONT_SM}px "Courier New", monospace`;
    hudCtx.fillStyle  = '#FFFFFF';
    hudCtx.fillText(_formatTime(res.timeMs), W - Math.round(W * 0.10), rowY);
  }

  // ── "PRESS ANY KEY" pulsing prompt after frame 150 ────────────────────────
  if (state.revealFrame >= 150) {
    const alpha = 0.5 + 0.5 * Math.sin(frame * 0.06);
    hudCtx.globalAlpha = alpha;
    const promptSize   = Math.round(7 * scale);
    hudCtx.font        = `bold ${promptSize}px "Courier New", monospace`;
    hudCtx.fillStyle   = '#FFFFFF';
    hudCtx.textAlign   = 'center';
    hudCtx.textBaseline = 'bottom';
    hudCtx.fillText('PRESS ANY KEY', W / 2, H - Math.round(10 * scale));
    hudCtx.globalAlpha = 1.0;
  }

  hudCtx.restore();

  // ── Scanline overlay (same as title-screen.js) ────────────────────────────
  hudCtx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let sy = 0; sy < H; sy += 2 * scale) {
    hudCtx.fillRect(0, sy, W, Math.max(1, Math.round(scale)));
  }
}
