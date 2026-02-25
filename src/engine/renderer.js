// Renderer — owns the game Canvas 2D context.
// Draw order each frame:
//   1. Sky          (Uint32Array buffer)
//   2. Floor        (Uint32Array buffer)
//   3. Speed lines  (Uint32Array buffer)  — WOW #3
//   4. Car sprite   (Uint32Array buffer)
//   5. Scanlines    (Uint32Array buffer)  — CRT darkening pass
//   6. putImageData (flush to canvas)
//
// HUD is drawn by main.js on a separate overlay canvas after render() returns.

import { renderFloor, renderSky } from './mode7.js';
import { blitCarSprite }          from '../graphics/sprites.js';
import { PALETTE }                from '../graphics/palette.js';
import { TOP_SPEED }              from '../physics/hover.js';

// ─── WOW #3: Speed lines ─────────────────────────────────────────────────────
const SPEED_LINE_THRESHOLD = TOP_SPEED * 0.8;  // 480 WU/s trigger
const LINE_COLORS = [PALETTE.NEON_CYAN, PALETTE.WHITE, PALETTE.NEON_YELLOW];

const LINE_FRACS = [0.08, 0.22, 0.42, 0.62, 0.80, 0.94];

function drawSpeedLines(buffer, W, H, camera, world, frame) {
  const t = (world.speed - SPEED_LINE_THRESHOLD) / (TOP_SPEED - SPEED_LINE_THRESHOLD);
  if (t <= 0) return;

  const yMin  = Math.ceil(camera.horizon + 8);
  const yMax  = H - 16;
  const range = Math.max(1, yMax - yMin);

  const pulse = 1 + 0.08 * Math.sin(frame * 0.08);

  for (let i = 0; i < LINE_FRACS.length; i++) {
    const py = Math.round(yMin + LINE_FRACS[i] * range);
    const perspScale = 0.15 + LINE_FRACS[i] * 0.85;
    const len = Math.round(t * 80 * perspScale * pulse);
    if (len < 1) continue;

    const color  = LINE_COLORS[i % LINE_COLORS.length];
    const rowOff = py * W;

    for (let x = 0; x < len; x++)          buffer[rowOff + x] = color;
    for (let x = W - 1; x >= W - len; x--) buffer[rowOff + x] = color;
  }
}

// ─── Scanline overlay ─────────────────────────────────────────────────────────
// Darkens every odd row by ~30%, giving a CRT scanline feel that also softens
// the raw pixel edges of the Mode 7 floor without blurring geometry.
function applyScanlines(buffer, W, H) {
  for (let y = 1; y < H; y += 2) {
    const rowBase = y * W;
    for (let px = 0; px < W; px++) {
      const c = buffer[rowBase + px];
      const r = ((c       ) & 0xFF) * 0.70 | 0;
      const g = ((c >>  8 ) & 0xFF) * 0.70 | 0;
      const b = ((c >>  16) & 0xFF) * 0.70 | 0;
      buffer[rowBase + px] = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
    }
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
        blitCarSprite(buffer, W, H, carSprite, world);
      }

      applyScanlines(buffer, W, H);

      ctx.putImageData(imageData, 0, 0);
    },

    get width()  { return W; },
    get height() { return H; },
  };
}
