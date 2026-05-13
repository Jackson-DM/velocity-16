// starfield.js — Fixed skybox star layer for VELOCITY-16.
// Stars are screen-space, not world-space — pure aesthetic skybox.
// ~320 pixel writes/frame, negligible cost.

const W = 320;
const SKY_H = 90; // rough sky area height

// ─── buildStarfield ────────────────────────────────────────────────────────
// Bakes n stars at startup. Returns array for renderStarfield().
export function buildStarfield(n = 80) {
  const stars = [];
  for (let i = 0; i < n; i++) {
    stars.push({
      x:            Math.floor(Math.random() * W),
      y:            Math.floor(Math.random() * SKY_H),
      brightness:   0.4 + Math.random() * 0.6,   // base luminance 0.4–1.0
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.03 + Math.random() * 0.07,  // slow-to-medium pulse
      size:         Math.random() < 0.15 ? 2 : 1,  // 15% double-pixel stars
    });
  }
  return stars;
}

// ─── renderStarfield ───────────────────────────────────────────────────────
// Overwrites individual sky pixels. Called from renderSky() AFTER gradient
// fill but BEFORE the horizon scanline, so stars sit behind the glow.
export function renderStarfield(buffer, screenW, horizonI, stars, frame) {
  for (const s of stars) {
    // Only draw if star is above the horizon
    if (s.y >= horizonI) continue;

    const pulse = 0.7 + 0.3 * Math.sin(frame * s.twinkleSpeed + s.twinklePhase);
    const lum   = Math.round(s.brightness * pulse * 255) | 0;

    // White-to-pale-blue tint: reduce R slightly for colder stars
    const r = Math.min(255, lum);
    const g = Math.min(255, lum);
    const b = Math.min(255, lum + Math.round((1 - s.brightness) * 40));

    const color = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
    const idx   = s.y * screenW + s.x;

    buffer[idx] = color;
    if (s.size === 2 && s.x + 1 < screenW) buffer[idx + 1] = color;
  }
}
