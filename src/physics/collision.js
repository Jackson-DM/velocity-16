// collision.js — Analytical oval boundary collision for MUTE CITY I.
// MUTE CITY I oval: center (512, 512), semi-axes A=300 (X), B=262 (Y).
//
// Normalized ellipse distance:
//   d = sqrt( ((x-512)/300)² + ((y-512)/262)² )
//
// D_OUTER = 1.35 → outer wall threshold
// D_INNER = 0.65 → inner wall threshold
//
// Returns { hit: bool, nx: number, ny: number }
//   nx/ny = bounce normal (points away from the wall, toward driveable surface)

const CX = 512, CY = 512;
const A  = 300,  B  = 262;
const D_OUTER = 1.35;
const D_INNER = 0.65;

export function checkCollision(world) {
  const dx = world.x - CX;
  const dy = world.y - CY;

  // Ellipse gradient (outward normal direction — unnormalized)
  const gx   = dx / (A * A);
  const gy   = dy / (B * B);
  const gLen = Math.sqrt(gx * gx + gy * gy);

  // Degenerate: car exactly at center — no normal can be computed
  if (gLen < 1e-10) return { hit: false, nx: 0, ny: 0 };

  const outNx = gx / gLen;  // outward ellipse normal (unit vector)
  const outNy = gy / gLen;

  // Normalized distance on the ellipse
  const d = Math.sqrt((dx / A) * (dx / A) + (dy / B) * (dy / B));

  if (d > D_OUTER) {
    // ── Outer wall hit — push car inward ────────────────────────────────────
    // Position correction: put car just inside the outer wall
    world.x = CX + outNx * A * D_OUTER * 0.97;
    world.y = CY + outNy * B * D_OUTER * 0.97;
    // Bounce normal points inward (toward driveable surface)
    return { hit: true, nx: -outNx, ny: -outNy };
  }

  if (d < D_INNER) {
    // ── Inner wall hit — push car outward ───────────────────────────────────
    // Position correction: put car just outside the inner wall
    world.x = CX + outNx * A * D_INNER * 1.03;
    world.y = CY + outNy * B * D_INNER * 1.03;
    // Bounce normal points outward (toward driveable surface)
    return { hit: true, nx: outNx, ny: outNy };
  }

  return { hit: false, nx: 0, ny: 0 };
}
