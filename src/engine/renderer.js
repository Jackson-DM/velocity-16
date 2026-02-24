// Renderer — owns the Canvas 2D context.
// Draw order each frame: sky → floor → speed lines → sprite → putImageData

import { renderFloor, renderSky } from './mode7.js';
import { blitCarSprite } from '../graphics/sprites.js';
import { PALETTE } from '../graphics/palette.js';
import { TOP_SPEED } from '../physics/hover.js';

// ─── WOW #3: Speed lines ─────────────────────────────────────────────────────
const SPEED_LINE_THRESHOLD = TOP_SPEED * 0.8;  // 480 WU/s trigger
const LINE_COLORS = [PALETTE.NEON_CYAN, PALETTE.NEON_YELLOW, PALETTE.WHITE];
const LINE_COUNT  = 8;

function drawSpeedLines(buffer, W, H, camera, world, frame) {
  const t = (world.speed - SPEED_LINE_THRESHOLD) / (TOP_SPEED - SPEED_LINE_THRESHOLD);
  const maxLen = Math.round(t * 16);  // 0–16 px from each edge
  if (maxLen < 1) return;

  const yMin = Math.ceil(camera.horizon + 10);
  const yMax = H - 20;
  const range = Math.max(1, yMax - yMin);

  // Positions seeded by frame — advance every 4 frames for smooth scroll, no flicker
  const tick = frame >> 2;

  for (let i = 0; i < LINE_COUNT; i++) {
    const py = yMin + ((i * 23 + tick) % range);
    if (py < yMin || py >= yMax) continue;

    const color = LINE_COLORS[i % 3];
    const rowOff = py * W;

    // Left edge streak (x = 0..maxLen-1, max 16px)
    for (let x = 0; x < maxLen; x++) {
      buffer[rowOff + x] = color;
    }
    // Right edge streak (x = W-1 downto W-maxLen, max 16px)
    for (let x = W - 1; x >= W - maxLen; x--) {
      buffer[rowOff + x] = color;
    }
  }
}

// ─── createRenderer ───────────────────────────────────────────────────────────
export function createRenderer(canvas, carSprite = null) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Single ImageData allocation — reused every frame, never GC'd
  const imageData = ctx.createImageData(W, H);
  const buffer = new Uint32Array(imageData.data.buffer);

  return {
    // world and frame are optional for backwards compatibility
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
