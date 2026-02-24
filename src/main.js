// VELOCITY-16 — Main Game Loop
// Entry point. Wires: input → camera update → render.
// Phase 1: camera driven directly by keyboard (no physics yet).

import { createRenderer } from './engine/renderer.js';
import { createCamera }   from './engine/camera.js';
import { getInput }       from './engine/input.js';
import { wrapAngle }      from './utils/math.js';
import { perfStart, perfEnd } from './utils/perf.js';

// ─── Canvas setup ────────────────────────────────────────────────────────────
const canvas = document.getElementById('game');

// Scale canvas to fill viewport while preserving 320:224 aspect ratio.
function resizeCanvas() {
  const scaleX = window.innerWidth  / canvas.width;
  const scaleY = window.innerHeight / canvas.height;
  const scale  = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));  // integer scale, min 1x
  canvas.style.width  = (canvas.width  * scale) + 'px';
  canvas.style.height = (canvas.height * scale) + 'px';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── Procedural floor texture (256×256 neon checkerboard) ───────────────────
// Generated once at startup — no external asset required for Phase 1.
const TEX_SIZE = 256;
const TEX_MASK = TEX_SIZE - 1;
const TILE     = 32;   // checker tile size in world units

function buildCheckerTexture() {
  const pixels = new Uint32Array(TEX_SIZE * TEX_SIZE);
  // ABGR Uint32: (A<<24)|(B<<16)|(G<<8)|R
  const COLOR_A = (0xFF000000 | (160 << 16) | (0   << 8) | 80)  >>> 0;  // deep purple
  const COLOR_B = (0xFF000000 | (220 << 16) | (240 << 8) | 0)   >>> 0;  // neon cyan

  for (let ty = 0; ty < TEX_SIZE; ty++) {
    for (let tx = 0; tx < TEX_SIZE; tx++) {
      const tileX = (tx / TILE) | 0;
      const tileY = (ty / TILE) | 0;
      pixels[ty * TEX_SIZE + tx] = (tileX + tileY) % 2 === 0 ? COLOR_A : COLOR_B;
    }
  }
  // scale: 4 means each world unit = 4 texture pixels → effective tile = TILE/4 = 8 world units.
  // With camH=1000, bottom-row rowZ ≈ 7.5 WU → spans ~10 WU → ~1.25 tiles visible at bottom.
  return { pixels, width: TEX_SIZE, height: TEX_SIZE, scale: 4 };
}

const floorTexture = buildCheckerTexture();

// ─── State ────────────────────────────────────────────────────────────────────
const renderer = createRenderer(canvas);
const camera   = createCamera();

// Camera movement speeds
const TURN_SPEED    = 1.8;   // radians/sec
const MOVE_SPEED    = 140;   // world units/sec

let lastTimestamp = 0;

// ─── Game Loop ────────────────────────────────────────────────────────────────
function loop(timestamp) {
  perfStart();

  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);  // seconds, capped at 50ms
  lastTimestamp = timestamp;

  // ── Input ──
  const input = getInput();

  // ── Camera update (Phase 1: direct keyboard control) ──
  if (input.left)  camera.angle = wrapAngle(camera.angle - TURN_SPEED * dt);
  if (input.right) camera.angle = wrapAngle(camera.angle + TURN_SPEED * dt);
  if (input.up) {
    camera.x += Math.cos(camera.angle) * MOVE_SPEED * dt;
    camera.y += Math.sin(camera.angle) * MOVE_SPEED * dt;
  }
  if (input.down) {
    camera.x -= Math.cos(camera.angle) * MOVE_SPEED * dt;
    camera.y -= Math.sin(camera.angle) * MOVE_SPEED * dt;
  }

  // ── Render ──
  renderer.render(camera, floorTexture);

  perfEnd();
  requestAnimationFrame(loop);
}

requestAnimationFrame((t) => {
  lastTimestamp = t;
  requestAnimationFrame(loop);
});
