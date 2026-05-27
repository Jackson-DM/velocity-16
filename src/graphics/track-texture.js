// World-space HD Mode 7 circuit texture.
// The track bounds are shared with collision so road edge art matches walls.

import { TRACK_01 } from '../track/track-data.js';
import { findTrackZoneForCoord } from '../track/track-zones.js';

const W = 2048;

function C(r, g, b) {
  return (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}

const ROAD_BASE = C(14, 10, 28);
const ROAD_ALT = C(10, 7, 22);
const CYAN_LINE = C(0, 220, 255);
const MAG_LINE = C(255, 0, 200);
const GOLD_DOT = C(255, 190, 0);
const EDGE_GLOW = C(0, 120, 150);
const VOID_BASE = C(4, 4, 10);
const VOID_GRID = C(20, 12, 40);
const LAB_MARKER = C(0, 255, 80);
const BOOST_A = C(0, 255, 255);
const BOOST_B = C(255, 210, 0);
const HAZARD_A = C(255, 80, 0);
const HAZARD_B = C(255, 0, 50);
const RECHARGE_A = C(0, 255, 90);
const RECHARGE_B = C(170, 255, 0);

function zonePixelColor(zone, tx, ty, d) {
  const stripe = Math.floor((tx + ty) / 18) & 1;

  if (zone.type === 'boost') {
    const chevron = (Math.floor((tx - ty) / 24) % 4 + 4) % 4;
    return chevron < 2 ? BOOST_A : BOOST_B;
  }

  if (zone.type === 'hazard') {
    const radial = Math.floor(d * 90) & 1;
    return (stripe ^ radial) ? HAZARD_A : HAZARD_B;
  }

  if (zone.type === 'recharge') {
    const pulse = (Math.floor(tx / 20) + Math.floor(ty / 20)) & 1;
    return pulse ? RECHARGE_A : RECHARGE_B;
  }

  return null;
}

export function buildCircuitTexture(track = TRACK_01) {
  const pixels = new Uint32Array(W * W);
  const { cx, cy, a, b, dInner, dOuter, edgeWidth = 0.035 } = track.bounds;
  const dCenter = (dOuter + dInner) * 0.5;
  const isFeelLab = track.textureKey === 'feel-lab-surface';

  for (let ty = 0; ty < W; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const idx = ty * W + tx;
      const dx = tx - cx;
      const dy = ty - cy;
      const d = Math.sqrt((dx / a) * (dx / a) + (dy / b) * (dy / b));
      const angle = Math.atan2(dy / b, dx / a);
      const onRoad = d >= dInner && d <= dOuter;

      if (onRoad && (d > dOuter - edgeWidth || d < dInner + edgeWidth)) {
        pixels[idx] = EDGE_GLOW;
        continue;
      }

      if (!onRoad) {
        if (tx % 128 < 1 || ty % 128 < 1) {
          pixels[idx] = VOID_GRID;
        } else {
          const v = ((tx * 1619) ^ (ty * 2731)) & 0x03;
          const r = (VOID_BASE & 0xFF) + v;
          const g = ((VOID_BASE >> 8) & 0xFF) + v;
          const b0 = ((VOID_BASE >> 16) & 0xFF) + v;
          pixels[idx] = C(r, g, b0);
        }
        continue;
      }

      // Feel Lab adds thin green calibration ticks at quarter-track angles.
      if (isFeelLab && (Math.abs(dx) < 1 || Math.abs(dy) < 1) && d > dInner + 0.16 && d < dOuter - 0.16) {
        pixels[idx] = LAB_MARKER;
        continue;
      }

      const zone = findTrackZoneForCoord(track, angle, d);
      if (zone) {
        pixels[idx] = zonePixelColor(zone, tx, ty, d);
        continue;
      }

      // Orange braking chevrons before the lab's tightest visual reference zones.
      if (isFeelLab && d > dInner + 0.12 && d < dOuter - 0.12) {
        const nearTurn = Math.abs(Math.sin(angle * 2)) < 0.08;
        const stripe = ((Math.floor(tx / 32) + Math.floor(ty / 32)) & 7) === 0;
        if (nearTurn && stripe) {
          pixels[idx] = C(255, 110, 0);
          continue;
        }
      }

      if (tx % 128 < 2 || ty % 128 < 2) {
        pixels[idx] = MAG_LINE;
        continue;
      }

      if (tx % 32 === 0 && ty % 32 === 0) {
        pixels[idx] = GOLD_DOT;
        continue;
      }

      if (tx % 64 < 2 || ty % 64 < 2) {
        pixels[idx] = CYAN_LINE;
        continue;
      }

      const base = d < dCenter ? ROAD_ALT : ROAD_BASE;
      const v = ((tx * 1619) ^ (ty * 3733)) & 0x0F;
      const n = v - 8;
      const r = Math.max(0, Math.min(255, (base & 0xFF) + n));
      const g = Math.max(0, Math.min(255, ((base >> 8) & 0xFF) + n));
      const b0 = Math.max(0, Math.min(255, ((base >> 16) & 0xFF) + n));
      pixels[idx] = C(r, g, b0);
    }
  }

  return { pixels, width: W, height: W, scale: 1 };
}
