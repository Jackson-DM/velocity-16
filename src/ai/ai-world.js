// ai-world.js — Creates a full world + lap state for an AI racer.
// Shape matches createWorld() + createLapState() + extra AI fields.

import { TRACK_01 }                  from '../track/track-data.js';
import { createLapState }            from '../track/lap.js';
import { createAiDriver }            from './ai-driver.js';
import { buildAiSprite }             from '../graphics/ai-sprites.js';
import { createExhaustTrail }        from '../graphics/exhaust-trail.js';

// ─── createAiWorld ────────────────────────────────────────────────────────────
// track  — track definition (same shape as TRACK_01)
// config — { name, pilot, thrust, topSpeed, handling, weight, aggression,
//            primaryColor, accentColor, zeroDragDrift? }
export function createAiWorld(track, config) {
  const world = {
    x:           track.startX,
    y:           track.startY,
    vx:          0,
    vy:          0,
    heading:     track.startHeading,
    speed:       0,
    drift:       0,
    energy:      1.0,
    wallCooldown: 0,
  };

  // Stagger starting positions slightly so cars don't overlap at race start
  // (offset along the track's start heading direction)
  const offsetDist = config._startOffset || 0;
  world.x += Math.cos(track.startHeading + Math.PI) * offsetDist;
  world.y += Math.sin(track.startHeading + Math.PI) * offsetDist;

  const lapState = createLapState(track.totalLaps);
  const driver   = createAiDriver(track, config);
  const sprite   = buildAiSprite(config.primaryColor, config.accentColor);
  const trail    = createExhaustTrail(config.primaryColor);

  return {
    world,
    lapState,
    driver,
    sprite,
    trail,
    finishPosition: null, // set when race completed
    config,
  };
}
