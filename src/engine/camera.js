// Camera state. Updated by updateCamera() each frame (Phase 2).
// This object is the single source of truth for the Mode 7 renderer.
import { wrapAngle } from '../utils/math.js';
import { TOP_SPEED } from '../physics/hover.js';

const POS_SPRING   = 8;     // position spring — 1 - exp(-8*dt) per frame
const ANG_SPRING   = 4;     // angle lags 2× more → look-ahead feel
const BASE_HORIZON = 90;    // screen Y of vanishing point at zero drift
const DRIFT_K      = 0.04;  // horizon shifts ±5.8px at equilibrium drift (~145 WU/s)
const BASE_FOV     = 0.66;  // half-FOV at rest (~60° spread)
const FOV_EXTRA    = 0.14;  // fov → 0.80 at top speed

export function createCamera() {
  return {
    x:       512,   // world position (springs toward world.x/y)
    y:       512,
    angle:   0,     // radians, 0 = facing +X (springs toward world.heading)
    height:  1000,  // altitude above floor plane — fixed
    fov:     BASE_FOV,
    horizon: BASE_HORIZON,
  };
}

// Spring-follow camera with WOW effects.
// Call once per frame after updateHover().
export function updateCamera(camera, world, dt) {
  // Position spring
  const posAlpha = 1 - Math.exp(-POS_SPRING * dt);
  camera.x += (world.x - camera.x) * posAlpha;
  camera.y += (world.y - camera.y) * posAlpha;

  // Angle spring (shortest-arc via wrapAngle)
  const angAlpha = 1 - Math.exp(-ANG_SPRING * dt);
  camera.angle = wrapAngle(camera.angle + wrapAngle(world.heading - camera.angle) * angAlpha);

  // WOW #1: Horizon roll — drift pushes horizon up/down creating bank sensation
  camera.horizon = BASE_HORIZON + world.drift * DRIFT_K;

  // WOW #2: FOV breathing — FOV widens at speed for tunnel-rush feel
  camera.fov = BASE_FOV + (world.speed / TOP_SPEED) * FOV_EXTRA;
}
