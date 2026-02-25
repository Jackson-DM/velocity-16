// track-texture.js — Cyber Napa circuit surface.
// Replaces the checkerboard with a neon-painted asphalt texture.
//
// Returns { pixels: Uint32Array, width: 256, height: 256, scale: 4 }
// texScale 4 → 256px texture repeats every 64 WU; grid lines appear every 16 WU.

const W = 256;

// ABGR helpers (little-endian ImageData convention used throughout Velocity-16)
function C(r, g, b) {
  return (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}

const BASE_R   = 14,  BASE_G   = 10,  BASE_B   = 24;  // near-black violet-blue asphalt
const COL_CYAN = C(0,   220, 255);  // cyan grid lines  every 64px, 2px wide
const COL_MAG  = C(255,   0, 200);  // magenta accent   every 128px, 3px wide
const COL_GOLD = C(255, 190,   0);  // gold reflector dots at 32px crossings

export function buildCircuitTexture() {
  const pixels = new Uint32Array(W * W);

  for (let ty = 0; ty < W; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const idx = ty * W + tx;

      // ── Gold reflector dots (every 32px grid crossing) ───────────────────
      if (tx % 32 === 0 && ty % 32 === 0) {
        pixels[idx] = COL_GOLD;
        continue;
      }

      // ── Magenta accent lines every 128px, 3px wide (overtop cyan) ────────
      if (tx % 128 < 3 || ty % 128 < 3) {
        pixels[idx] = COL_MAG;
        continue;
      }

      // ── Cyan grid lines every 64px, 2px wide ─────────────────────────────
      if (tx % 64 < 2 || ty % 64 < 2) {
        pixels[idx] = COL_CYAN;
        continue;
      }

      // ── Base asphalt + deterministic noise ───────────────────────────────
      const v    = ((tx * 1619) ^ (ty * 3733)) & 0x0F;
      const n    = v - 8;
      const r    = Math.max(0, Math.min(255, BASE_R + n));
      const g    = Math.max(0, Math.min(255, BASE_G + n));
      const b    = Math.max(0, Math.min(255, BASE_B + n));
      pixels[idx] = C(r, g, b);
    }
  }

  return { pixels, width: W, height: W, scale: 4 };
}
