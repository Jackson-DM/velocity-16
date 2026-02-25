// VELOCITY-16 — Main Game Loop
// Phase 4: title screen, circuit texture, collision, voice boost, energy system.

import { createRenderer }             from './engine/renderer.js';
import { createCamera, updateCamera } from './engine/camera.js';
import { getInput }                   from './engine/input.js';
import { perfStart, perfEnd }         from './utils/perf.js';
import { createWorld }                from './physics/world.js';
import { updateHover, TOP_SPEED }     from './physics/hover.js';
import { buildCarSprite }             from './graphics/sprites.js';
import { drawHUD }                    from './graphics/hud.js';
import { TRACK_01 }                   from './track/track-data.js';
import { createLapState, updateLap }  from './track/lap.js';
import { createAudio }                from './audio/audio.js';
import { buildCircuitTexture }        from './graphics/track-texture.js';
import { checkCollision }             from './physics/collision.js';
import { createVoiceBoost }           from './input/voice.js';
import { drawTitleScreen }            from './graphics/title-screen.js';

// ─── Canvas + HUD overlay setup ───────────────────────────────────────────────
const canvas    = document.getElementById('game');
const hudCanvas = document.getElementById('hud');
const hudCtx    = hudCanvas.getContext('2d');

let currentScale = 1;  // CSS integer scale, updated in resizeCanvas

function resizeCanvas() {
  const scaleX = window.innerWidth  / canvas.width;
  const scaleY = window.innerHeight / canvas.height;
  currentScale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));

  const displayW = canvas.width  * currentScale;
  const displayH = canvas.height * currentScale;

  canvas.style.width  = displayW + 'px';
  canvas.style.height = displayH + 'px';

  // HUD canvas: logical size = CSS display size → text rasterises natively, never blurry
  hudCanvas.width  = displayW;
  hudCanvas.height = displayH;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── Circuit floor texture ─────────────────────────────────────────────────────
const floorTexture = buildCircuitTexture();

// ─── World + Camera ───────────────────────────────────────────────────────────
const world = createWorld();
world.x       = TRACK_01.startX;
world.y       = TRACK_01.startY;
world.heading = TRACK_01.startHeading;

const carSprite = buildCarSprite();
const renderer  = createRenderer(canvas, carSprite);

const camera = createCamera();
camera.x     = world.x;   // snap to start — no spring-lerp sweep on load
camera.y     = world.y;
camera.angle = world.heading;

// ─── Lap + Audio ──────────────────────────────────────────────────────────────
const lapState = createLapState(TRACK_01.totalLaps);
const audio    = createAudio();

// ─── Game state ───────────────────────────────────────────────────────────────
let gameState = 'title'; // 'title' | 'playing'

// ─── Audio gate (browsers block AudioContext until first user gesture) ────────
let audioStarted = false;
function ensureAudio() {
  if (audioStarted) return;
  audioStarted = true;
  audio.start();
}

// ─── Voice boost ──────────────────────────────────────────────────────────────
const voiceBoost = createVoiceBoost(() => {
  audio.onBoost();
  // Physics impulse — forward burst in heading direction
  const BOOST_IMPULSE = 380;
  world.vx += Math.cos(world.heading) * BOOST_IMPULSE;
  world.vy += Math.sin(world.heading) * BOOST_IMPULSE;
  // Clamp to 1.2× TOP_SPEED
  const cap = TOP_SPEED * 1.2;
  const spd = Math.sqrt(world.vx * world.vx + world.vy * world.vy);
  if (spd > cap) { world.vx *= cap / spd; world.vy *= cap / spd; }
});

// ─── Input listeners ──────────────────────────────────────────────────────────
window.addEventListener('keydown', () => {
  ensureAudio();
  if (gameState === 'title') {
    gameState = 'playing';
    voiceBoost.start();
  }
});
window.addEventListener('pointerdown', ensureAudio);

// ─── Loop state ───────────────────────────────────────────────────────────────
let lastTimestamp = 0;
let frameCount    = 0;
let wasBoost      = false;

// ─── Game Loop ────────────────────────────────────────────────────────────────
function loop(timestamp) {
  perfStart();

  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  // ── Title state ─────────────────────────────────────────────────────────────
  if (gameState === 'title') {
    renderer.render(camera, floorTexture, null, frameCount++);
    drawTitleScreen(hudCtx, currentScale, frameCount);
    perfEnd();
    requestAnimationFrame(loop);
    return;
  }

  // ── Playing state ───────────────────────────────────────────────────────────
  const input = getInput();
  const prevX = world.x;
  const prevY = world.y;

  updateHover(world, input, dt);

  // ── Collision check + bounce response ──────────────────────────────────────
  const col = checkCollision(world);
  if (col.hit) {
    const dot = world.vx * col.nx + world.vy * col.ny;
    if (dot < 0) {
      // Only bounce when actually moving INTO the wall (dot < 0).
      // Decompose into normal + tangential, bounce normal with restitution,
      // keep tangential with wall-friction — prevents the "stuck" freeze.
      const RESTITUTION = 0.55; // normal component bounces back at 55%
      const FRICTION    = 0.80; // tangential (slide) component kept at 80%
      const tx = world.vx - dot * col.nx; // tangential velocity
      const ty = world.vy - dot * col.ny;
      world.vx = (-RESTITUTION * dot * col.nx) + (tx * FRICTION);
      world.vy = (-RESTITUTION * dot * col.ny) + (ty * FRICTION);
      world.speed = Math.sqrt(world.vx * world.vx + world.vy * world.vy);
    }

    if (world.wallCooldown <= 0) {
      world.energy = Math.max(0, world.energy - 0.08 * Math.min(1, Math.abs(dot) / TOP_SPEED));
      world.wallCooldown = 20;
      audio.onWallHit();
    }
  }
  if (world.wallCooldown > 0) world.wallCooldown--;

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

  const boostEdge = input.boost && !wasBoost;
  if (boostEdge) audio.onBoost();
  wasBoost = input.boost;

  // ── Render ─────────────────────────────────────────────────────────────────
  renderer.render(camera, floorTexture, world, frameCount++);

  // HUD drawn on overlay canvas at full display resolution (crisp, no upscale blur)
  drawHUD(hudCtx, currentScale, lapState, world);

  perfEnd();
  requestAnimationFrame(loop);
}

requestAnimationFrame((t) => {
  lastTimestamp = t;
  requestAnimationFrame(loop);
});
