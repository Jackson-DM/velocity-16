// Camera state. Updated by updateCamera() each frame.
// This object is the single source of truth for the Mode 7 renderer.

import { wrapAngle } from '../utils/math.js';
import { TOP_SPEED } from '../physics/hover.js';

const POS_SPRING = 8;
const ANG_SPRING = 4;
const BASE_HORIZON = 52;
const DRIFT_K = 0.014;
const BASE_FOV = 0.74;
const FOV_EXTRA = 0.06;

export function createCamera() {
  return {
    x: 512,
    y: 512,
    angle: 0,
    height: 2800,
    fov: BASE_FOV,
    horizon: BASE_HORIZON,
  };
}

export function updateCamera(camera, world, dt) {
  const posAlpha = 1 - Math.exp(-POS_SPRING * dt);
  camera.x += (world.x - camera.x) * posAlpha;
  camera.y += (world.y - camera.y) * posAlpha;

  const angAlpha = 1 - Math.exp(-ANG_SPRING * dt);
  camera.angle = wrapAngle(camera.angle + wrapAngle(world.heading - camera.angle) * angAlpha);

  camera.horizon = BASE_HORIZON + world.drift * DRIFT_K;
  camera.fov = BASE_FOV + (world.speed / TOP_SPEED) * FOV_EXTRA;
}
