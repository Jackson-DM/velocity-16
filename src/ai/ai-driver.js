// ai-driver.js — Waypoint-following AI with per-config hover physics.
// Each AI world carries its own driver state. No shared mutable state.

import { wrapAngle } from '../utils/math.js';
import {
  DRAG_FWD, GRIP, TURN_BASE, BRAKE_DRAG,
} from '../physics/hover.js';

const WAYPOINT_RADIUS = 80; // WU — advance to next CP when within this distance

// ─── createAiDriver ───────────────────────────────────────────────────────────
// Returns a driver object bound to a track + config.
export function createAiDriver(track, config) {
  return {
    track,
    config,
    targetCpIndex: 1, // start targeting CP1 (same as player lapState.nextCp)
  };
}

// ─── updateAiDriver ──────────────────────────────────────────────────────────
// Synthesizes { left, right, up, down, boost:false } input by steering toward
// the next checkpoint center. Updates driver.targetCpIndex when close enough.
export function updateAiDriver(driver, world) {
  const { track, config } = driver;
  const cp = track.checkpoints[driver.targetCpIndex];

  const dx   = cp.cx - world.x;
  const dy   = cp.cy - world.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Advance to next CP when within radius
  if (dist < WAYPOINT_RADIUS) {
    driver.targetCpIndex = (driver.targetCpIndex + 1) % track.checkpoints.length;
  }

  // Angle to target vs current heading
  const targetAngle = Math.atan2(dy, dx);
  const angleDiff   = wrapAngle(targetAngle - world.heading);

  const DEAD_ZONE = 0.05; // radians

  const input = {
    left:  angleDiff < -DEAD_ZONE,
    right: angleDiff >  DEAD_ZONE,
    up:    true,   // always throttle (aggression handled via thrust constant)
    down:  false,
    boost: false,
  };

  return input;
}

// ─── updateAiHover ────────────────────────────────────────────────────────────
// Copy of hover.js 12-step physics with per-config overrides:
//   config.thrust, config.topSpeed, TURN_BASE * config.handling
//   config.zeroDragDrift:true → skip lateral (lat) decay step (MANTIS special)
export function updateAiHover(world, input, dt, config) {
  const THRUST_AI   = config.thrust;
  const TOP_AI      = config.topSpeed;
  const TURN_AI     = TURN_BASE * config.handling;
  const SKIP_GRIP   = !!config.zeroDragDrift;

  // 1. Cache heading trig BEFORE any turning
  const cosH = Math.cos(world.heading);
  const sinH = Math.sin(world.heading);

  // 2–3. Decompose velocity into forward/lateral components
  let fwd =  world.vx * cosH + world.vy * sinH;
  let lat = -world.vx * sinH + world.vy * cosH;

  // 4. Speed-sensitive turn (floor at 0.20)
  const normSpeed  = world.speed / TOP_AI;
  const turnFactor = 0.20 + 0.80 * normSpeed;
  if (input.left)  world.heading = wrapAngle(world.heading - TURN_AI * turnFactor * dt);
  if (input.right) world.heading = wrapAngle(world.heading + TURN_AI * turnFactor * dt);

  // 5. Thrust (scaled by aggression — already baked into config.thrust)
  if (input.up)   fwd += THRUST_AI * dt;

  // 6. Brake
  if (input.down) fwd *= Math.exp(-BRAKE_DRAG * dt);

  // 7–8. Drag decay
  fwd *= Math.exp(-DRAG_FWD * dt);
  if (!SKIP_GRIP) lat *= Math.exp(-GRIP * dt);
  // MANTIS: zeroDragDrift=true → lat accumulates without decay → loose, drifty feel

  // 9. New heading trig (post-turn)
  const cosH2 = Math.cos(world.heading);
  const sinH2 = Math.sin(world.heading);

  // 10. Reproject to world-space velocity
  const vx = fwd * cosH2 - lat * sinH2;
  const vy = fwd * sinH2 + lat * cosH2;
  world.vx = vx;
  world.vy = vy;

  // 11. Integrate position
  world.x += vx * dt;
  world.y += vy * dt;

  // 12. Scalar outputs
  world.speed = Math.sqrt(vx * vx + vy * vy);
  world.drift = lat;
}
