// Renderer — owns the game Canvas 2D context.
// Draw order each frame:
//   1. Sky          (Uint32Array buffer)
//   2. Floor        (Uint32Array buffer)
//   3. Speed lines  (Uint32Array buffer)  — WOW #3
//   4. Car sprite   (Uint32Array buffer)
//   5. putImageData (flush to canvas)
//
// HUD is drawn by main.js on a separate overlay canvas after render() returns.

import { renderFloor, renderSky } from './mode7.js';
import { blitCarSprite }          from '../graphics/sprites.js';
import { PALETTE }                from '../graphics/palette.js';
import { TOP_SPEED }              from '../physics/hover.js';

// ─── WOW #3: Speed lines ─────────────────────────────────────────────────────
const SPEED_LINE_THRESHOLD = TOP_SPEED * 0.8;  // 480 WU/s trigger
const LINE_COLORS = [PALETTE.NEON_CYAN, PALETTE.WHITE, PALETTE.NEON_YELLOW];

// Fixed fractional Y positions in the floor half (0 = just below horizon, 1 = bottom).
// Spread intentionally — not random — so they read as deliberate streaks.
const LINE_FRACS = [0.08, 0.22, 0.42, 0.62, 0.80, 0.94];

function drawSpeedLines(buffer, W, H, camera, world, frame) {
  const t = (world.speed - SPEED_LINE_THRESHOLD) / (TOP_SPEED - SPEED_LINE_THRESHOLD);
  if (t <= 0) return;

  const yMin  = Math.ceil(camera.horizon + 8);
  const yMax  = H - 16;
  const range = Math.max(1, yMax - yMin);

  // Subtle pulse (±8% over ~1.3s) — gives a "vibrating at speed" feel
  const pulse = 1 + 0.08 * Math.sin(frame * 0.08);

  for (let i = 0; i < LINE_FRACS.length; i++) {
    const py = Math.round(yMin + LINE_FRACS[i] * range);

    // Perspective: lines near the horizon are short (far away),
    // lines near the bottom are long (close up). Max 80px at full speed.
    const perspScale = 0.15 + LINE_FRACS[i] * 0.85;
    const len = Math.round(t * 80 * perspScale * pulse);
    if (len < 1) continue;

    const color  = LINE_COLORS[i % LINE_COLORS.length];
    const rowOff = py * W;

    for (let x = 0; x < len; x++)          buffer[rowOff + x] = color;
    for (let x = W - 1; x >= W - len; x--) buffer[rowOff + x] = color;
  }
}

// ─── createRenderer ──────────────────────────────────────────────────────────
export function createRenderer(canvas, carSprite = null) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const imageData = ctx.createImageData(W, H);
  const buffer    = new Uint32Array(imageData.data.buffer);

  return {
    render(camera, floorTexture, world = null, frame = 0) {
      renderSky(buffer, W, camera.horizon);
      renderFloor(buffer, W, H, camera, floorTexture);

      if (world && world.speed > SPEED_LINE_THRESHOLD) {
        drawSpeedLines(buffer, W, H, camera, world, frame);
      }

      if (carSprite && world) {
        blitCarSprite(buffer, W, carSprite, world);
      }

      ctx.putImageData(imageData, 0, 0);
    },

    get width()  { return W; },
    get height() { return H; },
  };
}
