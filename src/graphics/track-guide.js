// Projected neon guide rails and Aurora's 2.5D infield architecture.
// These are gameplay-readable world markers, not collision geometry.

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

function scaleColor(color, amount) {
  const r = Math.round((color & 0xFF) * amount);
  const g = Math.round(((color >> 8) & 0xFF) * amount);
  const b = Math.round(((color >> 16) & 0xFF) * amount);
  return (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}

function fillSpan(buffer, W, H, y, x0, x1, color) {
  if (y < 0 || y >= H) return;
  const start = Math.max(0, x0);
  const end = Math.min(W - 1, x1);
  const row = y * W;
  for (let x = start; x <= end; x++) buffer[row + x] = color;
}

function drawBuildingSprite(buffer, W, H, structure, frame, colors) {
  const { p, heightPx, widthPx, seed } = structure;
  const topY = p.y - heightPx;
  const body = seed & 1 ? colors.bodyA : colors.bodyB;
  const side = scaleColor(body, 0.56);
  const roof = seed % 3 === 0 ? colors.warm : colors.cool;
  const pulseOn = ((Math.floor(frame / 18) + seed) & 3) === 0;

  for (let row = 0; row <= heightPx; row++) {
    const y = topY + row;
    const t = row / Math.max(1, heightPx);
    const halfWidth = Math.max(1, Math.round(widthPx * (0.34 + t * 0.16)));
    fillSpan(buffer, W, H, y, p.x - halfWidth, p.x + halfWidth, body);
    if (y < 0 || y >= H) continue;

    if (p.x - halfWidth >= 0) buffer[y * W + p.x - halfWidth] = side;
    if (p.x + halfWidth < W) buffer[y * W + p.x + halfWidth] = side;

    if (row > 2 && row < heightPx - 2 && row % 4 === seed % 4) {
      for (let x = p.x - halfWidth + 2; x <= p.x + halfWidth - 2; x += 4) {
        if (x >= 0 && x < W && ((x + seed) & 2) === 0) {
          buffer[y * W + x] = pulseOn ? colors.warm : colors.cool;
        }
      }
    }
  }

  fillSpan(buffer, W, H, topY, p.x - Math.max(1, Math.round(widthPx * 0.34)), p.x + Math.max(1, Math.round(widthPx * 0.34)), roof);
  drawDot(buffer, W, H, p.x, p.y, scaleColor(roof, 0.72), Math.max(1, Math.round(widthPx * 0.20)));
}

function drawReactorSprite(buffer, W, H, structure, frame, colors) {
  const { p, heightPx, widthPx } = structure;
  const topY = p.y - heightPx;
  const body = colors.core;
  const side = scaleColor(body, 0.48);

  for (let row = 0; row <= heightPx; row++) {
    const y = topY + row;
    const t = row / Math.max(1, heightPx);
    const waist = Math.sin(t * Math.PI);
    const halfWidth = Math.max(2, Math.round(widthPx * (0.34 + t * 0.20 - waist * 0.08)));
    fillSpan(buffer, W, H, y, p.x - halfWidth, p.x + halfWidth, body);
    if (y < 0 || y >= H) continue;

    if (p.x - halfWidth >= 0) buffer[y * W + p.x - halfWidth] = side;
    if (p.x + halfWidth < W) buffer[y * W + p.x + halfWidth] = side;
    if (row % 5 === 0) {
      fillSpan(buffer, W, H, y, p.x - halfWidth + 1, p.x + halfWidth - 1, colors.cool);
    } else if (p.x >= 0 && p.x < W) {
      buffer[y * W + p.x] = colors.warm;
    }
  }

  const capY = topY - 2;
  fillSpan(buffer, W, H, capY, p.x - Math.max(2, Math.round(widthPx * 0.46)), p.x + Math.max(2, Math.round(widthPx * 0.46)), colors.cool);
  for (let y = capY - 1; y >= Math.max(1, capY - Math.min(10, Math.round(heightPx * 0.25))); y--) {
    drawDot(buffer, W, H, p.x, y, colors.warm, 0);
  }
  drawDot(buffer, W, H, p.x, capY - Math.min(10, Math.round(heightPx * 0.25)), colors.cool, 1 + ((frame >> 4) & 1));
}

function renderInfieldPlant(buffer, W, H, camera, track, frame, colors) {
  const { bounds } = track;
  const structureRings = [
    { d: 0.26, count: 6, height: 112, width: 48, offset: 0.10 },
    { d: 0.44, count: 10, height: 86, width: 42, offset: -0.06 },
    { d: 0.62, count: 14, height: 64, width: 34, offset: 0.03 },
  ];
  const structures = [];

  for (let ringIndex = 0; ringIndex < structureRings.length; ringIndex++) {
    const ring = structureRings[ringIndex];
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 + ring.offset;
      const x = bounds.cx + bounds.a * ring.d * Math.cos(angle);
      const y = bounds.cy + bounds.b * ring.d * Math.sin(angle);
      const p = projectPoint(x, y, camera, W, H);
      if (!p) continue;

      structures.push({
        kind: 'building',
        p,
        seed: ringIndex * 19 + i * 7,
        heightPx: Math.max(6, Math.min(38, Math.round(ring.height * 112 / p.fwd))),
        widthPx: Math.max(3, Math.min(24, Math.round(ring.width * 96 / p.fwd))),
      });
    }
  }

  const core = projectPoint(bounds.cx, bounds.cy, camera, W, H);
  if (core) {
    structures.push({
      kind: 'reactor',
      p: core,
      seed: 999,
      heightPx: Math.max(18, Math.min(48, Math.round(180 * 116 / core.fwd))),
      widthPx: Math.max(7, Math.min(28, Math.round(72 * 100 / core.fwd))),
    });
  }

  structures.sort((a, b) => b.p.fwd - a.p.fwd);
  for (const structure of structures) {
    if (structure.kind === 'reactor') {
      drawReactorSprite(buffer, W, H, structure, frame, colors);
    } else {
      drawBuildingSprite(buffer, W, H, structure, frame, colors);
    }
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
  const cityColors = {
    bodyA: colorFromHex(theme.roadPanel, PALETTE.DEEP_BLUE),
    bodyB: colorFromHex(theme.skyline, PALETTE.DEEP_PURPLE),
    core: colorFromHex(theme.skyBottom, PALETTE.DEEP_PURPLE),
    cool: colorFromHex(theme.cityLightCool, outerPosts),
    warm: colorFromHex(theme.cityLightWarm, innerPosts),
  };

  if (theme.id === 'aurora-causeway') {
    renderInfieldPlant(buffer, W, H, camera, track, frame, cityColors);
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
