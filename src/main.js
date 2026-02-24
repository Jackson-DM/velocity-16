// VELOCITY-16 — Main Game Loop
// Phase 3: track data + lap logic + HUD + audio hooks wired in.

import { createRenderer }             from './engine/renderer.js';
import { createCamera, updateCamera } from './engine/camera.js';
import { getInput }                   from './engine/input.js';
import { perfStart, perfEnd }         from './utils/perf.js';
import { createWorld }                from './physics/world.js';
import { updateHover }                from './physics/hover.js';
import { buildCarSprite }             from './graphics/sprites.js';
import { TRACK_01 }                   from './track/track-data.js';
import { createLapState, updateLap }  from './track/lap.js';
import { createAudio }                from './audio/audio.js';

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

// ─── Procedural floor texture ─────────────────────────────────────────────────
const TEX_SIZE = 256;
const TILE     = 32;

function buildCheckerTexture() {
  const pixels  = new Uint32Array(TEX_SIZE * TEX_SIZE);
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

// ─── World + Camera ───────────────────────────────────────────────────────────
const world = createWorld();
// Spawn at track start position
world.x       = TRACK_01.startX;
world.y       = TRACK_01.startY;
world.heading = TRACK_01.startHeading;

const carSprite = buildCarSprite();
const renderer  = createRenderer(canvas, carSprite);

const camera = createCamera();
// Snap camera to start — prevents spring-lerp sweep on load
camera.x     = world.x;
camera.y     = world.y;
camera.angle = world.heading;

// ─── Lap + Audio ──────────────────────────────────────────────────────────────
const lapState = createLapState(TRACK_01.totalLaps);
const audio    = createAudio();
audio.start();

// ─── Loop state ───────────────────────────────────────────────────────────────
let lastTimestamp = 0;
let frameCount    = 0;
let wasBoost      = false;  // boost edge-trigger tracking

// ─── Game Loop ────────────────────────────────────────────────────────────────
function loop(timestamp) {
  perfStart();

  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  const input = getInput();

  // ── Physics ────────────────────────────────────────────────────────────────
  // Snapshot position BEFORE update — used for checkpoint crossing test
  const prevX = world.x;
  const prevY = world.y;

  updateHover(world, input, dt);
  updateCamera(camera, world, dt);

  // ── Lap logic ──────────────────────────────────────────────────────────────
  updateLap(lapState, TRACK_01, prevX, prevY, world.x, world.y);

  // ── Audio hooks ────────────────────────────────────────────────────────────
  audio.update(world.speed, dt);

  for (const ev of lapState.events) {
    if (ev.type === 'checkpoint') audio.onCheckpoint(ev.index);
    if (ev.type === 'lap')        audio.onLapComplete(ev.time, ev.isNewBest);
    if (ev.type === 'finish')     audio.onRaceFinish();
  }

  // Boost: rising-edge only — fire once per key press, not every frame it's held
  const boostEdge = input.boost && !wasBoost;
  if (boostEdge) audio.onBoost();
  wasBoost = input.boost;

  // ── Render ─────────────────────────────────────────────────────────────────
  renderer.render(camera, floorTexture, world, frameCount++, lapState);

  perfEnd();
  requestAnimationFrame(loop);
}

requestAnimationFrame((t) => {
  lastTimestamp = t;
  requestAnimationFrame(loop);
});
