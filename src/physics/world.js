// World state (car position, velocity, heading, energy).
export function createWorld() {
  return {
    x: 512, y: 512, vx: 0, vy: 0,
    heading: 0, speed: 0, drift: 0,
    energy: 1.0,      // 0.0 (dead) → 1.0 (full)
    wallCooldown: 0,  // frames of drain immunity post-hit
  };
}
