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

function colorFromHex(hex, fallback) {
  if (typeof hex !== 'string') return fallback;
  const value = Number.parseInt(hex.replace('#', ''), 16);
  if (!Number.isFinite(value)) return fallback;
  return C((value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF);
}

function wrappedAngleDelta(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function zonePixelColor(zone, tx, ty, d, angle, colors, isAurora) {
  if (isAurora) {
    const along = wrappedAngleDelta(angle, zone.angle);
    const across = (d - zone.dMin) / Math.max(0.001, zone.dMax - zone.dMin);

    if (zone.type === 'boost') {
      const flow = Math.floor((along + zone.angleWidth) * 210);
      const wing = Math.floor(Math.abs(across - 0.5) * 12);
      return ((flow - wing + 24) % 8) < 4 ? colors.boostA : colors.boostB;
    }

    if (zone.type === 'hazard') {
      const slashA = Math.floor(along * 260 + across * 18);
      const slashB = Math.floor(along * 260 - across * 18);
      return (Math.abs(slashA % 7) <= 1 || Math.abs(slashB % 9) <= 1)
        ? colors.hazardA
        : colors.hazardB;
    }

    if (zone.type === 'recharge') {
      const cellX = Math.floor((along + zone.angleWidth) * 120);
      const cellY = Math.floor(across * 9);
      return ((cellX + cellY) & 1) ? colors.rechargeA : colors.rechargeB;
    }
  }

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
  const isAurora = track.theme?.id === 'aurora-causeway';
  const theme = track.theme ?? {};
  const colors = {
    roadBase: colorFromHex(theme.roadBase, ROAD_BASE),
    roadAlt: colorFromHex(theme.roadAlt, ROAD_ALT),
    roadPanel: colorFromHex(theme.roadPanel, CYAN_LINE),
    lane: colorFromHex(theme.lane, CYAN_LINE),
    startLine: colorFromHex(theme.startLine, GOLD_DOT),
    outerEdge: colorFromHex(theme.outerEdge, EDGE_GLOW),
    innerEdge: colorFromHex(theme.innerEdge, EDGE_GLOW),
    voidOuter: colorFromHex(theme.voidOuter, VOID_BASE),
    voidOuterAccent: colorFromHex(theme.voidOuterAccent, VOID_GRID),
    voidInner: colorFromHex(theme.voidInner, VOID_BASE),
    cityLightCool: colorFromHex(theme.cityLightCool, CYAN_LINE),
    cityLightWarm: colorFromHex(theme.cityLightWarm, GOLD_DOT),
    boostA: colorFromHex(theme.boostA, BOOST_A),
    boostB: colorFromHex(theme.boostB, BOOST_B),
    hazardA: colorFromHex(theme.hazardA, HAZARD_A),
    hazardB: colorFromHex(theme.hazardB, HAZARD_B),
    rechargeA: colorFromHex(theme.rechargeA, RECHARGE_A),
    rechargeB: colorFromHex(theme.rechargeB, RECHARGE_B),
  };
  const roadSpan = dOuter - dInner;
  const laneA = dInner + roadSpan / 3;
  const laneB = dInner + roadSpan * 2 / 3;

  for (let ty = 0; ty < W; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const idx = ty * W + tx;
      const dx = tx - cx;
      const dy = ty - cy;
      const d = Math.sqrt((dx / a) * (dx / a) + (dy / b) * (dy / b));
      const angle = Math.atan2(dy / b, dx / a);
      const onRoad = d >= dInner && d <= dOuter;

      if (onRoad && d > dOuter - edgeWidth) {
        pixels[idx] = colors.outerEdge;
        continue;
      }

      if (onRoad && d < dInner + edgeWidth) {
        pixels[idx] = colors.innerEdge;
        continue;
      }

      if (!onRoad) {
        if (isAurora) {
          if (d < dInner) {
            const innerD = d / dInner;
            const blockX = Math.floor(tx / 22);
            const blockY = Math.floor(ty / 18);
            const block = ((blockX * 5) ^ (blockY * 3)) & 31;
            const terrace = Math.abs((innerD * 15) % 1) < 0.045;
            const radialConduit = Math.abs(Math.sin(angle * 8)) < 0.055 && innerD > 0.20;
            const districtEdge = tx % 22 < 2 || ty % 18 < 2;

            if (innerD < 0.13) {
              pixels[idx] = ((Math.floor(innerD * 80) + Math.floor(angle * 12)) & 1)
                ? colors.cityLightCool
                : colors.startLine;
            } else if (innerD < 0.20) {
              pixels[idx] = colors.cityLightWarm;
            } else if (radialConduit) {
              pixels[idx] = (Math.floor(innerD * 36) & 1)
                ? colors.cityLightCool
                : colors.roadPanel;
            } else if (terrace) {
              pixels[idx] = colors.roadPanel;
            } else if (innerD > 0.30 && innerD < 0.88 && districtEdge) {
              pixels[idx] = block % 5 === 0 ? colors.cityLightWarm : colors.roadPanel;
            } else if (block === 2 || block === 19) {
              pixels[idx] = colors.cityLightCool;
            } else if (block === 7) {
              pixels[idx] = colors.cityLightWarm;
            } else {
              pixels[idx] = colors.voidInner;
            }
          } else {
            const wave = (Math.floor(ty / 11) + Math.floor(tx / 53)) & 15;
            pixels[idx] = wave === 0 ? colors.voidOuterAccent : colors.voidOuter;
          }
          continue;
        }

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

      if (isAurora) {
        const startDelta = Math.abs(wrappedAngleDelta(angle, -Math.PI / 2));
        if (startDelta < 0.012) {
          const startBand = Math.floor((d - dInner) / Math.max(0.001, roadSpan) * 14);
          pixels[idx] = (startBand & 1) ? colors.startLine : colors.outerEdge;
          continue;
        }
      }

      // Feel Lab adds thin green calibration ticks at quarter-track angles.
      if (isFeelLab && (Math.abs(dx) < 1 || Math.abs(dy) < 1) && d > dInner + 0.16 && d < dOuter - 0.16) {
        pixels[idx] = LAB_MARKER;
        continue;
      }

      const zone = findTrackZoneForCoord(track, angle, d);
      if (zone) {
        pixels[idx] = zonePixelColor(zone, tx, ty, d, angle, colors, isAurora);
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

      if (isAurora) {
        const dashPhase = Math.floor((angle + Math.PI) * 30);
        const dashOn = (dashPhase & 1) === 0;
        const laneWidth = 0.0035;
        if (dashOn && (Math.abs(d - laneA) < laneWidth || Math.abs(d - laneB) < laneWidth)) {
          pixels[idx] = colors.lane;
          continue;
        }

        const angularPanel = Math.abs(((angle + Math.PI) * 48) % 1) < 0.025;
        const radialPanel = Math.abs(((d - dInner) / roadSpan * 10) % 1) < 0.018;
        if (angularPanel || radialPanel) {
          pixels[idx] = colors.roadPanel;
          continue;
        }

        const base = d < dCenter ? colors.roadAlt : colors.roadBase;
        const v = ((tx * 1619) ^ (ty * 3733)) & 0x07;
        const n = v - 4;
        const r = Math.max(0, Math.min(255, (base & 0xFF) + n));
        const g = Math.max(0, Math.min(255, ((base >> 8) & 0xFF) + n));
        const b0 = Math.max(0, Math.min(255, ((base >> 16) & 0xFF) + n));
        pixels[idx] = C(r, g, b0);
        continue;
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
