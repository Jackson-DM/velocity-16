// Phase 2: Hover car dynamics — F-Zero Brutal physics.
// Master relation: THRUST = TOP_SPEED * DRAG_FWD (equilibrium at top speed)
import { wrapAngle } from '../utils/math.js';

export const THRUST     = 720;   // = TOP_SPEED * DRAG_FWD
export const DRAG_FWD   = 1.2;   // forward drag decay constant — 0.58s to 50% top speed
export const TOP_SPEED  = 600;   // WU/s target top speed
export const GRIP       = 3.5;   // lateral decay — ~30% drift ratio at equilibrium
export const TURN_BASE  = 2.8;   // rad/s — must exceed v/r_min (600/229≈2.62) to navigate tightest oval curve
export const BRAKE_DRAG = 3.07;  // full stop in ~1.57s

// updateHover — 12-step drift algorithm (order matters: turn BEFORE velocity reproject = drift source)
export function updateHover(world, input, dt) {
  // 1. Cache heading trig BEFORE any turning
  const cosH = Math.cos(world.heading);
  const sinH = Math.sin(world.heading);

  // 2–3. Decompose velocity into forward/lateral components (orthogonal rotation)
  let fwd =  world.vx * cosH + world.vy * sinH;
  let lat = -world.vx * sinH + world.vy * cosH;

  // 4. Speed-sensitive turn.
  // Floor at 0.20 so the car steers even from a standstill — prevents the
  // "no response at low speed" freeze that felt like broken input.
  // At top speed turnFactor=1.0, giving the full TURN_BASE rate needed to
  // navigate the tightest oval curves (r≈229 WU requires ≥2.62 rad/s at 600 WU/s).
  const normSpeed  = world.speed / TOP_SPEED;
  const turnFactor = 0.20 + 0.80 * normSpeed;
  if (input.left)  world.heading = wrapAngle(world.heading - TURN_BASE * turnFactor * dt);
  if (input.right) world.heading = wrapAngle(world.heading + TURN_BASE * turnFactor * dt);
  // fwd/lat NOT recalculated after heading change — this mismatch IS the drift source

  // 5. Thrust
  if (input.up)   fwd += THRUST * dt;

  // 6. Brake
  if (input.down) fwd *= Math.exp(-BRAKE_DRAG * dt);

  // 7–8. Drag decay
  fwd *= Math.exp(-DRAG_FWD * dt);
  lat *= Math.exp(-GRIP * dt);

  // 9. New heading trig (post-turn)
  const cosH2 = Math.cos(world.heading);
  const sinH2 = Math.sin(world.heading);

  // 10. Reproject back to world-space velocity
  const vx = fwd * cosH2 - lat * sinH2;
  const vy = fwd * sinH2 + lat * cosH2;
  world.vx = vx;
  world.vy = vy;

  // 11. Integrate position
  world.x += vx * dt;
  world.y += vy * dt;

  // 12. Scalar outputs
  world.speed = Math.sqrt(vx * vx + vy * vy);
  world.drift = lat;  // signed: +right, -left
}
