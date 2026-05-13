// Projected neon guide rails for analytical oval tracks.
// These are gameplay-readable wall markers, not collision geometry.

import { PALETTE } from './palette.js';

const SAMPLE_COUNT = 192;
const MIN_FWD = 24;
const MAX_SEGMENT_PX = 70;

function projectPoint(x, y, camera, W, H) {
  const horizonI = Math.round(camera.horizon);
  const cosA = Math.cos(camera.angle);
  const sinA = Math.sin(camera.angle);
  const dx = x - camera.x;
  const dy = y - camera.y;
  const camFwd = dx * cosA + dy * sinA;
  const camSide = -dx * sinA + dy * cosA;

  if (camFwd <= MIN_FWD) return null;

  const fovScale = W / (2 * camera.fov);
  const sx = Math.round(W * 0.5 + (camSide / camFwd) * fovScale);
  const sy = Math.round(horizonI + camera.height / camFwd);

  if (sy <= horizonI || sy >= H || sx < -W || sx > W * 2) return null;
  return { x: sx, y: sy, fwd: camFwd };
}

function drawDot(buffer, W, H, x, y, color, radius) {
  for (let oy = -radius; oy <= radius; oy++) {
    const py = y + oy;
    if (py < 0 || py >= H) continue;
    const row = py * W;
    for (let ox = -radius; ox <= radius; ox++) {
      const px = x + ox;
      if (px < 0 || px >= W) continue;
      buffer[row + px] = color;
    }
  }
}

function drawLine(buffer, W, H, a, b, color) {
  const dxScreen = b.x - a.x;
  const dyScreen = b.y - a.y;
  if (Math.abs(dxScreen) > MAX_SEGMENT_PX || Math.abs(dyScreen) > MAX_SEGMENT_PX) return;

  let x0 = a.x;
  let y0 = a.y;
  const x1 = b.x;
  const y1 = b.y;
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  const radius = 0;

  while (true) {
    drawDot(buffer, W, H, x0, y0, color, radius);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function renderEllipse(buffer, W, H, camera, bounds, distanceScale, color, dashEvery = 0) {
  const { cx, cy, a, b } = bounds;
  let prev = null;

  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const angle = (i / SAMPLE_COUNT) * Math.PI * 2;
    const x = cx + a * distanceScale * Math.cos(angle);
    const y = cy + b * distanceScale * Math.sin(angle);
    const curr = projectPoint(x, y, camera, W, H);
    const dashedOff = dashEvery > 0 && Math.floor(i / dashEvery) % 2 === 1;

    if (curr && prev && !dashedOff) drawLine(buffer, W, H, prev, curr, color);
    prev = curr;
  }
}

function renderRailPosts(buffer, W, H, camera, bounds, distanceScale, color, step) {
  const { cx, cy, a, b } = bounds;

  for (let i = 0; i < SAMPLE_COUNT; i += step) {
    const angle = (i / SAMPLE_COUNT) * Math.PI * 2;
    const x = cx + a * distanceScale * Math.cos(angle);
    const y = cy + b * distanceScale * Math.sin(angle);
    const p = projectPoint(x, y, camera, W, H);
    if (!p) continue;
    const radius = p.fwd < 300 ? 2 : 1;
    drawDot(buffer, W, H, p.x, p.y, color, radius);
  }
}

export function renderTrackGuideRails(buffer, W, H, camera, track) {
  if (!track?.bounds) return;

  renderEllipse(buffer, W, H, camera, track.bounds, track.bounds.dOuter, PALETTE.NEON_CYAN);
  renderEllipse(buffer, W, H, camera, track.bounds, track.bounds.dInner, PALETTE.NEON_MAGENTA);
  renderEllipse(buffer, W, H, camera, track.bounds, (track.bounds.dInner + track.bounds.dOuter) * 0.5, PALETTE.GOLD, 5);
  renderRailPosts(buffer, W, H, camera, track.bounds, track.bounds.dOuter, PALETTE.WHITE, 8);
  renderRailPosts(buffer, W, H, camera, track.bounds, track.bounds.dInner, PALETTE.NEON_YELLOW, 12);
}
