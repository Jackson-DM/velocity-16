// Analytical oval boundary collision.
// The selected track owns bounds so the same collision contract works for the
// feel-lab track and the first official course.

import { TRACK_01 } from '../track/track-data.js';

export function checkCollision(world, track = TRACK_01) {
  const {
    cx, cy,
    a, b,
    dOuter,
    dInner,
  } = track.bounds;

  const dx = world.x - cx;
  const dy = world.y - cy;

  const gx = dx / (a * a);
  const gy = dy / (b * b);
  const gLen = Math.sqrt(gx * gx + gy * gy);

  if (gLen < 1e-10) return { hit: false, nx: 0, ny: 0 };

  const outNx = gx / gLen;
  const outNy = gy / gLen;
  const d = Math.sqrt((dx / a) * (dx / a) + (dy / b) * (dy / b));

  if (d > dOuter) {
    world.x = cx + outNx * a * dOuter * 0.97;
    world.y = cy + outNy * b * dOuter * 0.97;
    return { hit: true, nx: -outNx, ny: -outNy };
  }

  if (d < dInner) {
    world.x = cx + outNx * a * dInner * 1.03;
    world.y = cy + outNy * b * dInner * 1.03;
    return { hit: true, nx: outNx, ny: outNy };
  }

  return { hit: false, nx: 0, ny: 0 };
}
