// Look-ahead racing-line AI with per-config hover physics.
// Each AI world carries its own driver state. No shared mutable state.

import { clamp, wrapAngle } from '../utils/math.js';
import {
  DRAG_FWD, GRIP, TURN_BASE, BRAKE_DRAG,
} from '../physics/hover.js';
import {
  findTrackZoneNearCoord,
  getTrackCoord,
  pointFromTrackCoord,
} from '../track/track-zones.js';

function scoreLane(track, world, driver, angle, laneD) {
  const { preferredLane, config } = driver;
  let score = Math.abs(laneD - preferredLane) * 5;

  const hazard = findTrackZoneNearCoord(track, angle, laneD, 'hazard', 0.10, 0.025);
  if (hazard) score += 50;

  const boost = findTrackZoneNearCoord(track, angle, laneD, 'boost', 0.08, 0.018);
  if (boost) score -= 1.2 * (config.aggression ?? 0.8);

  const recharge = findTrackZoneNearCoord(track, angle, laneD, 'recharge', 0.08, 0.018);
  if (recharge && world.energy < 0.72) score -= 2.5;

  return score;
}

function chooseLane(driver, world, lookAngle) {
  const { track, preferredLane } = driver;
  const minLane = track.bounds.dInner + 0.045;
  const maxLane = track.bounds.dOuter - 0.045;
  const centerLane = (minLane + maxLane) * 0.5;
  const candidates = [
    preferredLane,
    centerLane,
    minLane + 0.035,
    maxLane - 0.035,
  ].map((lane) => clamp(lane, minLane, maxLane));

  let bestLane = candidates[0];
  let bestScore = Infinity;
  for (const lane of candidates) {
    const score = scoreLane(track, world, driver, lookAngle, lane);
    if (score < bestScore) {
      bestScore = score;
      bestLane = lane;
    }
  }
  return bestLane;
}

export function createAiDriver(track, config) {
  const preferredLane = config.preferredLane
    ?? (track.bounds.dInner + track.bounds.dOuter) * 0.5;
  return {
    track,
    config,
    laneD: preferredLane,
    targetLaneD: preferredLane,
    preferredLane,
  };
}

// Steer toward a continuous point ahead on the oval instead of checkpoint
// centers. The lane target is selected early enough to avoid abrupt weaving.
export function updateAiDriver(driver, world, dt = 1 / 60) {
  const { track } = driver;
  const coord = getTrackCoord(track, world.x, world.y);
  const speedRatio = clamp(world.speed / Math.max(1, driver.config.topSpeed), 0, 1);
  const lookAhead = 0.16 + speedRatio * 0.12;
  const lookAngle = coord.angle + lookAhead;

  driver.targetLaneD = chooseLane(driver, world, lookAngle);
  const laneStep = (0.14 + (driver.config.handling ?? 1) * 0.10) * dt;
  driver.laneD += clamp(driver.targetLaneD - driver.laneD, -laneStep, laneStep);

  const target = pointFromTrackCoord(track, lookAngle, driver.laneD);
  const targetAngle = Math.atan2(target.y - world.y, target.x - world.x);
  const angleDiff = wrapAngle(targetAngle - world.heading);
  const deadZone = 0.035;

  return {
    left: angleDiff < -deadZone,
    right: angleDiff > deadZone,
    up: true,
    down: Math.abs(angleDiff) > 0.72 && speedRatio > 0.76,
    boost: false,
  };
}

// Hover physics with per-config overrides:
// config.thrust, config.topSpeed, TURN_BASE * config.handling.
export function updateAiHover(world, input, dt, config) {
  const thrustAi = config.thrust;
  const topAi = config.topSpeed;
  const turnAi = TURN_BASE * config.handling;
  const skipGrip = !!config.zeroDragDrift;

  const cosH = Math.cos(world.heading);
  const sinH = Math.sin(world.heading);

  let fwd = world.vx * cosH + world.vy * sinH;
  let lat = -world.vx * sinH + world.vy * cosH;

  const normSpeed = world.speed / topAi;
  const turnFactor = 0.20 + 0.80 * normSpeed;
  if (input.left) world.heading = wrapAngle(world.heading - turnAi * turnFactor * dt);
  if (input.right) world.heading = wrapAngle(world.heading + turnAi * turnFactor * dt);

  if (input.up) fwd += thrustAi * dt;
  if (input.down) fwd *= Math.exp(-BRAKE_DRAG * dt);

  fwd *= Math.exp(-DRAG_FWD * dt);
  if (!skipGrip) lat *= Math.exp(-GRIP * dt);

  const cosH2 = Math.cos(world.heading);
  const sinH2 = Math.sin(world.heading);
  const vx = fwd * cosH2 - lat * sinH2;
  const vy = fwd * sinH2 + lat * cosH2;
  world.vx = vx;
  world.vy = vy;

  world.x += vx * dt;
  world.y += vy * dt;
  world.speed = Math.sqrt(vx * vx + vy * vy);
  world.drift = lat;
}
