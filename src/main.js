// VELOCITY-16 — Main Game Loop
// Phase 2: hover physics → camera spring → render pipeline.

import { createRenderer }            from './engine/renderer.js';
import { createCamera, updateCamera } from './engine/camera.js';
import { getInput }                  from './engine/input.js';
import { perfStart, perfEnd }        from './utils/perf.js';
import { createWorld }               from './physics/world.js';
import { updateHover }               from './physics/hover.js';
import { buildCarSprite }            from './graphics/sprites.js';

// ─── Canvas setup ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('game');

function resizeCanvas() {
  const scaleX = window.innerWidth  / canvas.width;
  const scaleY = window.innerHeight / canvas.height;
  const scale  = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));
  canvas.style.width  = (canvas.width  * scale) + 'px';
  canvas.style.height = (canvas.height * scale) + 'px';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── Procedural floor texture (256×256 neon checkerboard) ────────────────────
const TEX_SIZE = 256;
const TILE     = 32;

function buildCheckerTexture() {
  const pixels = new Uint32Array(TEX_SIZE * TEX_SIZE);
  const COLOR_A = (0xFF000000 | (160 << 16) | (0   << 8) | 80)  >>> 0;  // deep purple
  const COLOR_B = (0xFF000000 | (220 << 16) | (240 << 8) | 0)   >>> 0;  // neon cyan

  for (let ty = 0; ty < TEX_SIZE; ty++) {
    for (let tx = 0; tx < TEX_SIZE; tx++) {
      const tileX = (tx / TILE) | 0;
      const tileY = (ty / TILE) | 0;
      pixels[ty * TEX_SIZE + tx] = (tileX + tileY) % 2 === 0 ? COLOR_A : COLOR_B;
    }
  }
  return { pixels, width: TEX_SIZE, height: TEX_SIZE, scale: 4 };
}

const floorTexture = buildCheckerTexture();

// ─── State ────────────────────────────────────────────────────────────────────
const world     = createWorld();
const carSprite = buildCarSprite();
const renderer  = createRenderer(canvas, carSprite);
const camera    = createCamera();

let lastTimestamp = 0;
let frameCount    = 0;

// ─── Game Loop ────────────────────────────────────────────────────────────────
function loop(timestamp) {
  perfStart();

  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  const input = getInput();

  updateHover(world, input, dt);
  updateCamera(camera, world, dt);
  renderer.render(camera, floorTexture, world, frameCount++);

  perfEnd();
  requestAnimationFrame(loop);
}

requestAnimationFrame((t) => {
  lastTimestamp = t;
  requestAnimationFrame(loop);
});
