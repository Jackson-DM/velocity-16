// Projected neon guide rails for analytical oval tracks.
// These are gameplay-readable wall markers, not collision geometry.

import { PALETTE } from './palette.js';

const SAMPLE_COUNT = 192;
const MIN_FWD = 24;
const MAX_SEGMENT_PX = 70;

function colorFromHex(hex, fallback) {
  if (typeof hex !== 'string') return fallback;
  const value = Number.parseInt(hex.replace('#', ''), 16);
  if (!Number.isFinite(value)) return fallback;
  const r = (value >> 16) & 0xFF;
  const g = (value >> 8) & 0xFF;
  const b = value & 0xFF;
  return (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}

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

function renderPylons(buffer, W, H, camera, track, color) {
  const { bounds } = track;
  const pylonAngles = track.theme?.pylonAngles ?? [];

  for (const angle of pylonAngles) {
    const x = bounds.cx + bounds.a * bounds.dOuter * Math.cos(angle);
    const y = bounds.cy + bounds.b * bounds.dOuter * Math.sin(angle);
    const p = projectPoint(x, y, camera, W, H);
    if (!p) continue;

    const height = Math.max(4, Math.min(18, Math.round(1500 / p.fwd)));
    for (let py = p.y; py >= p.y - height; py--) {
      drawDot(buffer, W, H, p.x, py, color, p.fwd < 220 ? 1 : 0);
    }
    drawDot(buffer, W, H, p.x, p.y - height, PALETTE.WHITE, p.fwd < 320 ? 2 : 1);
  }
}

function renderEnergyChase(buffer, W, H, camera, track, frame, color) {
  const { bounds } = track;
  for (let i = 0; i < 7; i++) {
    const angle = (frame * 0.004 + i / 7) * Math.PI * 2;
    const x = bounds.cx + bounds.a * bounds.dOuter * Math.cos(angle);
    const y = bounds.cy + bounds.b * bounds.dOuter * Math.sin(angle);
    const p = projectPoint(x, y, camera, W, H);
    if (!p) continue;
    drawDot(buffer, W, H, p.x, p.y, color, p.fwd < 300 ? 2 : 1);
  }
}

function drawTower(buffer, W, H, p, height, bodyColor, lightColor, width = 0) {
  for (let py = p.y; py >= p.y - height; py--) {
    drawDot(buffer, W, H, p.x, py, bodyColor, width);
  }
  drawDot(buffer, W, H, p.x, p.y - height, lightColor, Math.max(1, width));
}

function renderInfieldPlant(buffer, W, H, camera, track, frame, coolColor, warmColor) {
  const { bounds } = track;
  const towerRings = [
    { d: 0.34, count: 8, height: 900, offset: 0.10 },
    { d: 0.55, count: 12, height: 650, offset: -0.06 },
    { d: 0.70, count: 16, height: 480, offset: 0.03 },
  ];

  for (const ring of towerRings) {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 + ring.offset;
      const x = bounds.cx + bounds.a * ring.d * Math.cos(angle);
      const y = bounds.cy + bounds.b * ring.d * Math.sin(angle);
      const p = projectPoint(x, y, camera, W, H);
      if (!p) continue;

      const height = Math.max(2, Math.min(13, Math.round(ring.height / p.fwd)));
      const light = ((i + Math.floor(frame / 24)) & 3) === 0 ? warmColor : coolColor;
      drawTower(buffer, W, H, p, height, PALETTE.DEEP_BLUE, light, p.fwd < 210 ? 1 : 0);
    }
  }

  const core = projectPoint(bounds.cx, bounds.cy, camera, W, H);
  if (core) {
    const coreHeight = Math.max(8, Math.min(24, Math.round(2600 / core.fwd)));
    drawTower(buffer, W, H, core, coreHeight, PALETTE.DEEP_PURPLE, coolColor, core.fwd < 260 ? 2 : 1);
    const pulseRadius = 1 + ((frame >> 4) & 1);
    drawDot(buffer, W, H, core.x, core.y - coreHeight, warmColor, pulseRadius);
  }
}

export function renderTrackGuideRails(buffer, W, H, camera, track, frame = 0) {
  if (!track?.bounds) return;

  const theme = track.theme ?? {};
  const outer = colorFromHex(theme.outerEdge, PALETTE.NEON_CYAN);
  const inner = colorFromHex(theme.innerEdge, PALETTE.NEON_MAGENTA);
  const center = colorFromHex(theme.centerGuide, PALETTE.GOLD);
  const outerPosts = colorFromHex(theme.outerPosts, PALETTE.WHITE);
  const innerPosts = colorFromHex(theme.innerPosts, PALETTE.NEON_YELLOW);

  if (theme.id === 'aurora-causeway') {
    renderInfieldPlant(buffer, W, H, camera, track, frame, outerPosts, innerPosts);
  }

  renderEllipse(buffer, W, H, camera, track.bounds, track.bounds.dOuter, outer);
  renderEllipse(buffer, W, H, camera, track.bounds, track.bounds.dInner, inner);
  renderEllipse(buffer, W, H, camera, track.bounds, (track.bounds.dInner + track.bounds.dOuter) * 0.5, center, 5);
  renderRailPosts(buffer, W, H, camera, track.bounds, track.bounds.dOuter, outerPosts, 8);
  renderRailPosts(buffer, W, H, camera, track.bounds, track.bounds.dInner, innerPosts, 12);

  if (theme.id === 'aurora-causeway') {
    renderPylons(buffer, W, H, camera, track, outer);
    renderEnergyChase(buffer, W, H, camera, track, frame, PALETTE.WHITE);
  }
}
