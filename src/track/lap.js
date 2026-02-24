// Lap logic — checkpoint crossing detection + lap timing.
// Uses pre-computed gate segments from track-data.js (no per-frame trig).
//
// Crossing algorithm: strict 2D segment intersection test.
// Direction guard: dot(movement, gate_normal) > 0 — rejects reverse crossings.
//
// Tunneling analysis: at TOP_SPEED=600 WU/s, dt=1/60s → max 10 WU/frame.
// Gate half-width=100 WU → car cannot skip a gate. No sub-step required.

// ─── createLapState ────────────────────────────────────────────────────────────
// Call once. Pass totalLaps from the track definition.
export function createLapState(totalLaps = 3) {
  return {
    lap:       0,              // completed laps (0 = none yet; display as "lap+1")
    totalLaps,                 // stored for HUD use without passing track separately
    nextCp:    1,              // first required checkpoint (skip start line on init)
    lapStart:  performance.now(),
    bestMs:    Infinity,       // Infinity = no completed lap yet
    events:    [],             // cleared and repopulated each frame; read same frame only
  };
}

// ─── updateLap ─────────────────────────────────────────────────────────────────
// Call once per frame AFTER world position is updated.
//   prevX/prevY — world position BEFORE this frame's physics step
//   currX/currY — world position AFTER  this frame's physics step
export function updateLap(lapState, track, prevX, prevY, currX, currY) {
  lapState.events = [];

  if (lapState.lap >= lapState.totalLaps) return;  // race over, nothing to do

  const cp = track.checkpoints[lapState.nextCp];

  if (_crossesGate(prevX, prevY, currX, currY, cp)) {
    lapState.events.push({ type: 'checkpoint', index: lapState.nextCp });

    if (lapState.nextCp === 0) {
      // ── Crossed start/finish with all other checkpoints cleared → lap complete ──
      const nowMs     = performance.now();
      const lapTimeMs = nowMs - lapState.lapStart;
      const isNewBest = lapTimeMs < lapState.bestMs;

      if (isNewBest) lapState.bestMs = lapTimeMs;

      lapState.lap     += 1;
      lapState.lapStart = nowMs;
      lapState.nextCp   = 1;  // reset to first interior checkpoint for next lap

      lapState.events.push({ type: 'lap', time: lapTimeMs, isNewBest });

      if (lapState.lap >= lapState.totalLaps) {
        lapState.events.push({ type: 'finish' });
      }
    } else {
      // Advance to next checkpoint in sequence; wraps 7 → 0 (start/finish)
      lapState.nextCp = (lapState.nextCp + 1) % track.checkpoints.length;
    }
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

// Signed area of triangle (A, B, P). Positive = P is left of AB.
function _side(ax, ay, bx, by, px, py) {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

// True if segment (p1→p2) crosses gate segment (A→B) in the forward direction.
// Uses strict inequality → collinear/grazing touches return false (no ghost triggers).
function _crossesGate(p1x, p1y, p2x, p2y, cp) {
  const { ax, ay, bx, by, nx, ny } = cp;

  // Both endpoints of the gate must be on opposite sides of the movement line,
  // AND both movement endpoints must be on opposite sides of the gate line.
  const d1 = _side(p1x, p1y, p2x, p2y, ax, ay);
  const d2 = _side(p1x, p1y, p2x, p2y, bx, by);
  const d3 = _side(ax,  ay,  bx,  by,  p1x, p1y);
  const d4 = _side(ax,  ay,  bx,  by,  p2x, p2y);

  if (!(d1 * d2 < 0 && d3 * d4 < 0)) return false;

  // Direction guard: movement must align with gate's forward normal
  const dx = p2x - p1x;
  const dy = p2y - p1y;
  return (dx * nx + dy * ny) > 0;
}
