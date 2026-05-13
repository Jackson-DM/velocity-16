// Phase 2: Procedural 24×16 pixel-art hover car with 9 horizontal-shear tilt frames.
// All data baked into Uint32Array at startup — no per-frame allocations.
// Phase 5: blitAiSprite added — perspective-projected opponent blit.
import { PALETTE } from '../graphics/palette.js';
import { clamp } from '../utils/math.js';

// ─── Color aliases ────────────────────────────────────────────────────────────
const O = PALETTE.BLACK;        // outline
const B = PALETTE.NEON_MAGENTA; // body (Apex-Red scheme)
const V = PALETTE.NEON_CYAN;    // fins/trim (Apex-Red scheme)
const C = PALETTE.NEON_CYAN;    // cockpit glow
const W = PALETTE.WHITE;        // glint
const G = PALETTE.NEON_MAGENTA; // engine glow
const Y = PALETTE.NEON_YELLOW;  // nozzle
const D = PALETTE.DARK_GRAY;  // shadow
const _ = 0x00000000;         // transparent (alpha=0)

// ─── 24×16 neutral frame pixel art ───────────────────────────────────────────
const NEUTRAL = new Uint32Array([
  // Row  0
  _,_,_,_,_,_,_,_,O,O,O,O,O,O,O,O,_,_,_,_,_,_,_,_,
  // Row  1
  _,_,_,_,_,O,O,O,B,B,B,B,B,B,B,B,O,O,O,_,_,_,_,_,
  // Row  2
  _,_,_,O,O,B,B,B,B,B,C,C,B,B,B,B,B,B,B,O,O,_,_,_,
  // Row  3
  _,_,O,B,B,B,B,B,B,B,W,C,B,B,B,B,B,B,B,B,B,O,_,_,
  // Row  4
  _,O,B,B,B,B,B,V,V,B,B,B,B,V,V,B,B,B,B,B,B,B,O,_,
  // Row  5
  O,B,B,B,B,B,V,V,V,B,B,B,B,V,V,V,B,B,B,B,B,B,B,O,
  // Row  6
  O,B,B,B,B,V,V,V,V,B,B,B,B,V,V,V,V,B,B,B,B,B,B,O,
  // Row  7
  O,D,B,B,B,V,G,G,V,B,B,B,B,V,G,G,V,B,B,B,D,D,B,O,
  // Row  8
  O,D,D,B,B,G,G,G,G,B,B,B,B,G,G,G,G,B,B,D,D,D,B,O,
  // Row  9
  O,D,D,D,G,G,Y,G,G,B,B,B,B,G,G,Y,G,G,D,D,D,D,D,O,
  // Row 10
  _,O,D,D,G,G,Y,G,G,D,D,D,D,G,G,Y,G,G,D,D,D,D,O,_,
  // Row 11
  _,_,O,D,D,G,G,G,G,D,D,D,D,G,G,G,G,D,D,D,D,O,_,_,
  // Row 12
  _,_,_,O,O,D,D,G,G,D,D,D,D,G,G,D,D,D,D,O,O,_,_,_,
  // Row 13
  _,_,_,_,_,O,O,D,G,G,D,D,G,G,D,D,O,O,_,_,_,_,_,_,
  // Row 14
  _,_,_,_,_,_,_,O,O,G,G,G,G,O,O,_,_,_,_,_,_,_,_,_,
  // Row 15
  _,_,_,_,_,_,_,_,_,O,O,O,O,_,_,_,_,_,_,_,_,_,_,_,
]);

// ─── buildCarSprite ──────────────────────────────────────────────────────────
// Bakes 9 tilt frames via horizontal shear of the neutral sprite.
export function buildCarSprite() {
  const FW = 24, FH = 16, COUNT = 9;
  const frames = new Uint32Array(FW * FH * COUNT);

  for (let f = 0; f < COUNT; f++) {
    const shearOffset = f - 4;
    const base = f * FW * FH;

    for (let y = 0; y < FH; y++) {
      const shift = Math.round(shearOffset * y / 15);
      for (let x = 0; x < FW; x++) {
        const srcX = x - shift;
        if (srcX < 0 || srcX >= FW) continue;
        frames[base + y * FW + x] = NEUTRAL[y * FW + srcX];
      }
    }
  }

  return { frames, frameW: FW, frameH: FH, count: COUNT };
}

// ─── blitCarSprite ────────────────────────────────────────────────────────────
// 2× nearest-neighbor upscale: each source pixel becomes a 2×2 block.
// Scaled size: 48×32. Centered horizontally, flush to bottom with 4px gap.
// screenW/screenH passed explicitly so this stays stateless.
export function blitCarSprite(buffer, screenW, screenH, sprite, world) {
  const { frames, frameW, frameH } = sprite;

  const tiltFrame = clamp(4 + Math.round(world.drift / 150 * 4), 0, 8);
  const base = tiltFrame * frameW * frameH;

  const SCALE  = 2;
  const scaledW = frameW * SCALE;  // 48
  const scaledH = frameH * SCALE;  // 32
  const destX  = (screenW - scaledW) >> 1;       // 136 on 320px screen — horizontally centred
  const destY  = screenH - scaledH - 4;          // 188 — flush to bottom with 4px gap

  for (let py = 0; py < frameH; py++) {
    const srcRow = base + py * frameW;
    for (let px = 0; px < frameW; px++) {
      const pixel = frames[srcRow + px];
      if ((pixel >>> 24) === 0) continue;  // skip transparent

      // Write 2×2 block into buffer
      for (let dy = 0; dy < SCALE; dy++) {
        const sy = destY + py * SCALE + dy;
        if (sy < 0 || sy >= screenH) continue;
        const rowBase = sy * screenW + destX + px * SCALE;
        for (let dx = 0; dx < SCALE; dx++) {
          buffer[rowBase + dx] = pixel;
        }
      }
    }
  }
}

// ─── blitAiSprite ─────────────────────────────────────────────────────────────
// Projects an AI racer into screen space using Mode 7 camera math.
// Only renders if ship is in front of camera (camFwd > 0).
// Perspective-scaled nearest-neighbor blit with horizon clip.
export function blitAiSprite(buffer, screenW, screenH, sprite, aiWorld, camera) {
  const { frames, frameW, frameH } = sprite;
  const world = aiWorld.world;

  const horizonI  = Math.round(camera.horizon);
  const cosA      = Math.cos(camera.angle);
  const sinA      = Math.sin(camera.angle);
  const camHeight = camera.height;

  // Camera-relative position
  const dx = world.x - camera.x;
  const dy = world.y - camera.y;

  // Rotate into camera space
  const camFwd  = dx * cosA + dy * sinA;
  const camSide = -dx * sinA + dy * cosA;

  // Must be in front of camera
  if (camFwd <= 0) return;

  // Screen position of sprite center.
  // Horizontal: camSide/camFwd in camera space maps to screenW/(2*fov) pixels.
  // fov is from camera.fov (0.66–0.80 depending on speed breath).
  const fovScale = screenW / (2 * camera.fov);
  const screenX  = Math.round(screenW * 0.5 + (camSide / camFwd) * fovScale);
  const screenY  = Math.round(horizonI + camHeight / camFwd);

  // Perspective scale: closer → bigger, clamped 0.5–3.0
  const drawScale = clamp(camHeight / camFwd * 0.055, 0.5, 3.0);

  const scaledW = Math.round(frameW * drawScale);
  const scaledH = Math.round(frameH * drawScale);

  // Tilt frame from drift
  const tiltFrame = clamp(4 + Math.round(world.drift / 150 * 4), 0, 8);
  const frameBase = tiltFrame * frameW * frameH;

  const destX = screenX - (scaledW >> 1);
  const destY = screenY - scaledH;  // anchor bottom of sprite to projected center

  for (let py = 0; py < scaledH; py++) {
    const sy = destY + py;
    if (sy < horizonI || sy >= screenH) continue;
    const srcY = Math.floor(py / drawScale);
    if (srcY >= frameH) continue;

    for (let px = 0; px < scaledW; px++) {
      const sx = destX + px;
      if (sx < 0 || sx >= screenW) continue;
      const srcX = Math.floor(px / drawScale);
      if (srcX >= frameW) continue;

      const pixel = frames[frameBase + srcY * frameW + srcX];
      if ((pixel >>> 24) === 0) continue;  // skip transparent

      buffer[sy * screenW + sx] = pixel;
    }
  }
}
