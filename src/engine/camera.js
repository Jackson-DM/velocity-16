// Camera state. Updated by input (Phase 1) or physics/hover.js (Phase 2).
// This object is the single source of truth for the Mode 7 renderer.

export function createCamera() {
  return {
    x:      512,    // world position
    y:      512,
    angle:  0,      // radians, 0 = facing +X
    height: 1000,   // altitude above floor plane — must be large enough that rowZ
                    // at the bottom of screen spans multiple texture tiles
    fov:    0.66,   // half-FOV scale factor (~60 degree spread)
    horizon: 80,    // screen Y of the vanishing point (top half = sky, bottom half = floor)
  };
}
