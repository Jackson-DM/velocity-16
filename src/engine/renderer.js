// Renderer — owns the Canvas 2D context.
// Orchestrates all draw passes each frame:
//   1. Mode 7 sky + floor (via ImageData buffer for pixel-perfect control)
//   2. Sprites (Phase 2)
//   3. HUD (Phase 2)

import { renderFloor, renderSky } from './mode7.js';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Single ImageData allocation — reused every frame, never GC'd
  const imageData = ctx.createImageData(W, H);
  // Uint32 view over the same buffer for fast pixel writes (ABGR, little-endian)
  const buffer = new Uint32Array(imageData.data.buffer);

  return {
    render(camera, floorTexture) {
      renderSky(buffer, W, camera.horizon);
      renderFloor(buffer, W, H, camera, floorTexture);
      ctx.putImageData(imageData, 0, 0);
    },

    get width()  { return W; },
    get height() { return H; },
  };
}
