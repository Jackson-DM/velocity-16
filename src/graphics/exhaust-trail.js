// exhaust-trail.js — Neon exhaust particle trail in world coordinates.
// Ring buffer of 32 particles, spawned at ship nacelles, projected to screen via Mode 7.

// ─── hexToABGR ───────────────────────────────────────────────────────────────
function hexToABGR(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// ─── createExhaustTrail ───────────────────────────────────────────────────────
// baseColor: '#RRGGBB' hex string
export function createExhaustTrail(baseColor) {
  const rgb = hexToABGR(baseColor);
  const particles = [];
  for (let i = 0; i < 32; i++) {
    particles.push({ x: 0, y: 0, life: 0 });
  }
  return { particles, writeHead: 0, rgb };
}

// ─── updateExhaustTrail ───────────────────────────────────────────────────────
// Spawns 2 particles/frame at twin nacelle positions, decays existing ones.
export function updateExhaustTrail(trail, world, dt) {
  const { particles } = trail;

  // Decay all live particles
  for (const p of particles) {
    if (p.life > 0) p.life -= dt * 2.5;
  }

  // Only spawn when moving (avoid static blob)
  if (world.speed < 10) return;

  const cosH = Math.cos(world.heading);
  const sinH = Math.sin(world.heading);

  // Two nacelles: ±4 WU lateral offset from rear (-18 WU along heading)
  const REAR_DIST  = -18;
  const NACEL_LAT  =  4;

  const rearX = world.x + cosH * REAR_DIST;
  const rearY = world.y + sinH * REAR_DIST;

  // Lateral offset directions (perpendicular to heading)
  const latX = -sinH;
  const latY =  cosH;

  for (let n = 0; n < 2; n++) {
    const side = n === 0 ? -NACEL_LAT : NACEL_LAT;
    const p    = particles[trail.writeHead % 32];
    trail.writeHead++;
    p.x    = rearX + latX * side;
    p.y    = rearY + latY * side;
    p.life = 1.0;
  }
}

// ─── renderExhaustTrail ───────────────────────────────────────────────────────
// Projects world-space particles to screen using Mode 7 camera math.
// Rendered BEFORE car sprites so trails sit on floor, ships occlude them.
export function renderExhaustTrail(buffer, W, H, trail, camera) {
  const { particles, rgb } = trail;
  const horizonI  = Math.round(camera.horizon);
  const camHeight = camera.height;
  const cosA      = Math.cos(camera.angle);
  const sinA      = Math.sin(camera.angle);

  for (const p of particles) {
    if (p.life <= 0) continue;

    // Translate to camera-relative world coords
    const dx = p.x - camera.x;
    const dy = p.y - camera.y;

    // Rotate into camera space (forward/right components)
    const camFwd = dx * cosA + dy * sinA;
    const camSide = -dx * sinA + dy * cosA;

    // Behind camera → skip
    if (camFwd <= 0) continue;

    // Mode 7 projection: same math as renderFloor
    const screenY = horizonI + Math.round(camHeight / camFwd);
    if (screenY < horizonI || screenY >= H) continue;

    const screenX = Math.round(W / 2 + (camSide / camFwd) * W * 0.5);
    if (screenX < 0 || screenX >= W) continue;

    // Fade by life
    const alpha = p.life;
    const r     = Math.round(rgb.r * alpha) | 0;
    const g     = Math.round(rgb.g * alpha) | 0;
    const b     = Math.round(rgb.b * alpha) | 0;
    const color = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;

    const idx = screenY * W + screenX;
    buffer[idx] = color;
    // Draw a small 2×2 blob for visibility
    if (screenX + 1 < W)  buffer[idx + 1] = color;
    if (screenY + 1 < H) {
      buffer[idx + W]     = color;
      if (screenX + 1 < W) buffer[idx + W + 1] = color;
    }
  }
}
