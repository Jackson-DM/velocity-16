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
const SPEED_LINE_THRESHOLD = TOP_SPEED * 0.8;  // 480 WU/s
const LINE_COLORS = [PALETTE.NEON_CYAN, PALETTE.NEON_YELLOW, PALETTE.WHITE];
const LINE_COUNT  = 8;

function drawSpeedLines(buffer, W, H, camera, world, frame) {
  const t = (world.speed - SPEED_LINE_THRESHOLD) / (TOP_SPEED - SPEED_LINE_THRESHOLD);
  const maxLen = Math.round(t * 16);
  if (maxLen < 1) return;

  const yMin  = Math.ceil(camera.horizon + 10);
  const yMax  = H - 20;
  const range = Math.max(1, yMax - yMin);
  const tick  = frame >> 2;  // advance every 4 frames = 15Hz scroll, no flicker

  for (let i = 0; i < LINE_COUNT; i++) {
    const py = yMin + ((i * 23 + tick) % range);
    if (py < yMin || py >= yMax) continue;

    const color  = LINE_COLORS[i % 3];
    const rowOff = py * W;

    for (let x = 0; x < maxLen; x++)          buffer[rowOff + x] = color;
    for (let x = W - 1; x >= W - maxLen; x--) buffer[rowOff + x] = color;
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
