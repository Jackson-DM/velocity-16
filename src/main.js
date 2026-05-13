// VELOCITY-16 main loop.
// Recovery baseline: stable solo HD Mode 7 driving, with Phase 5 systems gated.

import { getGameConfig } from './config/game-config.js';
import { createRenderer } from './engine/renderer.js';
import { createCamera, updateCamera } from './engine/camera.js';
import { getInput } from './engine/input.js';
import { perfStart, perfEnd } from './utils/perf.js';
import { createWorld } from './physics/world.js';
import { updateHover, TOP_SPEED } from './physics/hover.js';
import { buildCarSprite } from './graphics/sprites.js';
import { drawCrashOverlay, drawHUD } from './graphics/hud.js';
import { getTrackByMode } from './track/track-data.js';
import { createLapState, updateLap } from './track/lap.js';
import { createAudio } from './audio/audio.js';
import { buildCircuitTexture } from './graphics/track-texture.js';
import { checkCollision } from './physics/collision.js';
import { createVoiceBoost } from './input/voice.js';
import { drawTitleScreen } from './graphics/title-screen.js';
import { buildStarfield } from './graphics/starfield.js';
import { createAiWorld } from './ai/ai-world.js';
import { updateAiDriver, updateAiHover } from './ai/ai-driver.js';
import { updateExhaustTrail, createExhaustTrail } from './graphics/exhaust-trail.js';
import { drawCountdown } from './graphics/countdown-overlay.js';
import { drawPodiumScreen } from './graphics/podium-screen.js';

const config = getGameConfig();
const track = getTrackByMode(config.trackMode);

const canvas = document.getElementById('game');
const hudCanvas = document.getElementById('hud');
const hudCtx = hudCanvas.getContext('2d');

let currentScale = 1;

function resizeCanvas() {
  const scaleX = window.innerWidth / canvas.width;
  const scaleY = window.innerHeight / canvas.height;
  currentScale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));

  const displayW = canvas.width * currentScale;
  const displayH = canvas.height * currentScale;
  canvas.style.width = displayW + 'px';
  canvas.style.height = displayH + 'px';
  hudCanvas.width = displayW;
  hudCanvas.height = displayH;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const floorTexture = buildCircuitTexture(track);
const starfield = config.enableEffects ? buildStarfield(80) : null;
const carSprite = buildCarSprite();
const renderer = createRenderer(canvas, carSprite);
const audio = createAudio();
const camera = createCamera();

const AI_CONFIGS = [
  {
    name: 'JUGGERNAUT-7',
    pilot: 'BARON VON STRYKER',
    thrust: 440,
    topSpeed: 520,
    handling: 0.55,
    weight: 1.8,
    aggression: 0.88,
    primaryColor: '#FF4500',
    accentColor: '#FFFF00',
    _startOffset: 40,
  },
  {
    name: 'MANTIS-RAY',
    pilot: 'XYLAR THE EXILED',
    thrust: 560,
    topSpeed: 464,
    handling: 0.80,
    weight: 1.0,
    aggression: 0.95,
    primaryColor: '#FF00FF',
    accentColor: '#00FFFF',
    zeroDragDrift: true,
    _startOffset: 80,
  },
];

function makePlayerWorld() {
  const w = createWorld();
  w.x = track.startX;
  w.y = track.startY;
  w.heading = track.startHeading;
  return w;
}

function makeAiWorlds() {
  if (!config.enableAi) return [];
  return AI_CONFIGS.map((aiConfig) => createAiWorld(track, aiConfig));
}

function snapCameraToStart() {
  camera.x = track.startX;
  camera.y = track.startY;
  camera.angle = track.startHeading;
  camera.horizon = 52;
}

let world = makePlayerWorld();
let lapState = createLapState(track.totalLaps);
let aiWorlds = makeAiWorlds();
let playerTrail = createExhaustTrail('#00FFFF');
let gameState = 'title';
let countdownState = { phase: 'pilot_card', elapsed: 0, pilotIndex: 0, beepFired: false };
let podiumState = null;
let crashState = null;
let finishPositions = [];
let raceStartMs = 0;
let audioStarted = false;
let lastTimestamp = 0;
let frameCount = 0;
let wasBoost = false;
let lastSafeState = null;

snapCameraToStart();
lastSafeState = { x: world.x, y: world.y, heading: world.heading };

const extras = { starfield: null, aiWorlds: [], playerTrail: null, track: null };

function ensureAudio() {
  if (audioStarted) return;
  audioStarted = true;
  audio.start();
}

function applyBoost(targetWorld) {
  const boostImpulse = 380;
  targetWorld.vx += Math.cos(targetWorld.heading) * boostImpulse;
  targetWorld.vy += Math.sin(targetWorld.heading) * boostImpulse;

  const cap = TOP_SPEED * 1.2;
  const spd = Math.sqrt(targetWorld.vx * targetWorld.vx + targetWorld.vy * targetWorld.vy);
  if (spd > cap) {
    targetWorld.vx *= cap / spd;
    targetWorld.vy *= cap / spd;
  }
  targetWorld.speed = Math.sqrt(targetWorld.vx * targetWorld.vx + targetWorld.vy * targetWorld.vy);
}

const voiceBoost = createVoiceBoost(() => {
  if (!config.enableVoiceBoost || gameState !== 'playing') return;
  applyBoost(world);
  audio.onBoost();
});

function resetRace(toTitle = true) {
  world = makePlayerWorld();
  lastSafeState = { x: world.x, y: world.y, heading: world.heading };
  lapState = createLapState(track.totalLaps);
  aiWorlds = makeAiWorlds();
  playerTrail = createExhaustTrail('#00FFFF');
  finishPositions = [];
  podiumState = null;
  crashState = null;
  countdownState = { phase: 'pilot_card', elapsed: 0, pilotIndex: 0, beepFired: false };
  wasBoost = false;
  raceStartMs = 0;
  gameState = toTitle ? 'title' : 'playing';
  snapCameraToStart();
}

function startRace() {
  raceStartMs = performance.now();
  lapState.lapStart = raceStartMs;
  for (const ai of aiWorlds) ai.lapState.lapStart = raceStartMs;
  gameState = 'playing';
  wasBoost = getInput().boost;
  if (config.enableVoiceBoost) voiceBoost.start();
  audio.onRaceStart();
}

window.addEventListener('keydown', (event) => {
  ensureAudio();
  if (event.repeat && (gameState === 'title' || gameState === 'podium' || gameState === 'crashed')) return;

  if (gameState === 'title') {
    if (config.enableCountdown) {
      gameState = 'countdown';
      countdownState = { phase: 'pilot_card', elapsed: 0, pilotIndex: 0, beepFired: false };
    } else {
      startRace();
    }
  } else if (gameState === 'podium') {
    resetRace(true);
  }
});
window.addEventListener('pointerdown', ensureAudio);

const PILOT_CARD_DURATION = 2.0;
const PILOT_BLANK = 0.5;
const DIGIT_DURATION = 0.85;
const GO_DURATION = 0.60;

function updateCountdownPhase(state, dt) {
  state.elapsed += dt;

  if (state.phase === 'pilot_card') {
    const totalCards = config.enableAi ? 3 : 1;
    const allCardsEnd = totalCards * PILOT_CARD_DURATION + PILOT_BLANK;

    if (state.elapsed >= allCardsEnd) {
      state.phase = '3';
      state.elapsed = 0;
      state.beepFired = false;
    } else if (state.elapsed >= totalCards * PILOT_CARD_DURATION) {
      state.pilotIndex = 99;
    } else if (state.elapsed >= (Math.min(state.pilotIndex, totalCards - 1) + 1) * PILOT_CARD_DURATION) {
      state.pilotIndex = Math.min(state.pilotIndex + 1, totalCards - 1);
    }
  } else if (state.phase === '3' || state.phase === '2' || state.phase === '1') {
    if (!state.beepFired) {
      audio.onCountdownBeep(state.phase);
      state.beepFired = true;
    }
    if (state.elapsed >= DIGIT_DURATION) {
      const nextMap = { '3': '2', '2': '1', '1': 'go' };
      state.phase = nextMap[state.phase];
      state.elapsed = 0;
      state.beepFired = false;
    }
  } else if (state.phase === 'go') {
    if (!state.beepFired) {
      audio.onCountdownBeep('go');
      state.beepFired = true;
    }
    if (state.elapsed >= GO_DURATION) {
      state.phase = 'done';
    }
  }
}

function buildPodium() {
  podiumState = {
    results: finishPositions.map((fp, i) => ({
      rank: i + 1,
      name: fp.name,
      pilot: fp.pilot,
      color: fp.color,
      timeMs: fp.timeMs,
    })),
    revealFrame: 0,
  };
  gameState = 'podium';
  audio.onPodiumFanfare();
}

function checkPlayerFinish() {
  if (lapState.lap < lapState.totalLaps) return;
  if (finishPositions.find((f) => f.name === 'APEX-RED')) return;
  finishPositions.push({
    name: 'APEX-RED',
    pilot: "Jackson 'Digital' Miller",
    color: '#FF00FF',
    timeMs: performance.now() - raceStartMs,
  });
}

function checkAiFinish(ai) {
  if (ai.finishPosition !== null || ai.lapState.lap < ai.lapState.totalLaps) return;
  ai.finishPosition = finishPositions.length;
  finishPositions.push({
    name: ai.config.name,
    pilot: ai.config.pilot,
    color: ai.config.primaryColor,
    timeMs: performance.now() - raceStartMs,
  });
}

function triggerPlayerCrash() {
  if (gameState !== 'playing') return;
  const respawn = lastSafeState ?? { x: world.x, y: world.y, heading: world.heading };
  world.energy = 0;
  world.vx = 0;
  world.vy = 0;
  world.speed = 0;
  world.drift = 0;
  crashState = {
    elapsed: 0,
    duration: 1.35,
    respawnAt: 1.7,
    respawn,
    seed: frameCount % 997,
  };
  gameState = 'crashed';
  audio.onMachineLost();
}

function respawnPlayer() {
  const respawn = crashState?.respawn ?? lastSafeState ?? { x: track.startX, y: track.startY, heading: track.startHeading };
  world.x = respawn.x;
  world.y = respawn.y;
  world.heading = respawn.heading;
  world.vx = 0;
  world.vy = 0;
  world.speed = 0;
  world.drift = 0;
  world.energy = 0.35;
  world.wallCooldown = 90;
  lastSafeState = { ...respawn };
  crashState = null;
  gameState = 'playing';
  wasBoost = getInput().boost;
}

function resolveCollision(targetWorld, playAudio) {
  const preVx = targetWorld.vx;
  const preVy = targetWorld.vy;
  const col = checkCollision(targetWorld, track);
  if (!col.hit) return false;

  const impactDot = preVx * col.nx + preVy * col.ny;
  if (impactDot < 0) {
    const restitution = 0.55;
    const friction = 0.80;
    const tx = preVx - impactDot * col.nx;
    const ty = preVy - impactDot * col.ny;
    targetWorld.vx = (-restitution * impactDot * col.nx) + (tx * friction);
    targetWorld.vy = (-restitution * impactDot * col.ny) + (ty * friction);
    targetWorld.speed = Math.sqrt(targetWorld.vx * targetWorld.vx + targetWorld.vy * targetWorld.vy);
  }

  if (!playAudio || targetWorld.wallCooldown > 0) return;
  const damage = 0.08 * Math.min(1, Math.abs(impactDot) / TOP_SPEED);
  targetWorld.energy = Math.max(0, targetWorld.energy - damage);
  targetWorld.wallCooldown = 20;
  audio.onWallHit();
  if (targetWorld === world && targetWorld.energy <= 0) {
    triggerPlayerCrash();
  }
  return true;
}

function prepareExtras(includeWorld) {
  extras.starfield = config.enableEffects ? starfield : null;
  extras.aiWorlds = config.enableAi ? aiWorlds : [];
  extras.playerTrail = includeWorld && config.enableEffects ? playerTrail : null;
  extras.track = track;
  extras.enableSpeedLines = config.enableEffects;
}

function renderScene(includeWorld = false) {
  prepareExtras(includeWorld);
  renderer.render(camera, floorTexture, includeWorld ? world : null, frameCount, extras);
}

function updateAi(dt) {
  if (!config.enableAi) return;

  for (const ai of aiWorlds) {
    if (ai.finishPosition !== null) continue;
    const aiInput = updateAiDriver(ai.driver, ai.world);
    const aiPrevX = ai.world.x;
    const aiPrevY = ai.world.y;
    updateAiHover(ai.world, aiInput, dt, ai.config);
    resolveCollision(ai.world, false);
    updateLap(ai.lapState, track, aiPrevX, aiPrevY, ai.world.x, ai.world.y);
    if (config.enableEffects) updateExhaustTrail(ai.trail, ai.world, dt);
    checkAiFinish(ai);
  }
}

function loop(timestamp) {
  perfStart();

  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;
  frameCount++;

  if (gameState === 'title') {
    renderScene(false);
    drawTitleScreen(hudCtx, currentScale, frameCount, track.name);
    perfEnd();
    requestAnimationFrame(loop);
    return;
  }

  if (gameState === 'countdown') {
    updateCountdownPhase(countdownState, dt);
    if (countdownState.phase === 'done') {
      startRace();
    } else {
      renderScene(false);
      drawCountdown(hudCtx, currentScale, countdownState);
      perfEnd();
      requestAnimationFrame(loop);
      return;
    }
  }

  if (gameState === 'podium') {
    podiumState.revealFrame += 2;
    renderScene(false);
    drawPodiumScreen(hudCtx, currentScale, podiumState, frameCount);
    perfEnd();
    requestAnimationFrame(loop);
    return;
  }

  if (gameState === 'crashed') {
    crashState.elapsed += dt;
    audio.update(0, dt);
    if (crashState.elapsed >= crashState.respawnAt) {
      respawnPlayer();
      perfEnd();
      requestAnimationFrame(loop);
      return;
    }
    renderScene(false);
    drawHUD(hudCtx, currentScale, lapState, world, track);
    drawCrashOverlay(hudCtx, currentScale, world, crashState);
    perfEnd();
    requestAnimationFrame(loop);
    return;
  }

  const input = getInput();
  const prevX = world.x;
  const prevY = world.y;

  updateHover(world, input, dt);
  const collided = resolveCollision(world, true);
  if (gameState === 'crashed') {
    updateCamera(camera, world, dt);
    renderScene(false);
    drawHUD(hudCtx, currentScale, lapState, world, track);
    drawCrashOverlay(hudCtx, currentScale, world, crashState);
    perfEnd();
    requestAnimationFrame(loop);
    return;
  }
  if (!collided) {
    lastSafeState = { x: world.x, y: world.y, heading: world.heading };
  }
  if (world.wallCooldown > 0) world.wallCooldown--;
  updateCamera(camera, world, dt);
  updateLap(lapState, track, prevX, prevY, world.x, world.y);
  if (config.enableEffects) updateExhaustTrail(playerTrail, world, dt);

  audio.update(world.speed, dt);
  for (const ev of lapState.events) {
    if (ev.type === 'checkpoint') audio.onCheckpoint(ev.index);
    if (ev.type === 'lap') audio.onLapComplete(ev.time, ev.isNewBest);
    if (ev.type === 'finish') audio.onRaceFinish();
  }

  const boostEdge = input.boost && !wasBoost;
  if (boostEdge) {
    applyBoost(world);
    audio.onBoost();
  }
  wasBoost = input.boost;

  updateAi(dt);
  checkPlayerFinish();

  if (config.enablePodium && finishPositions.length >= (config.enableAi ? aiWorlds.length + 1 : 1)) {
    buildPodium();
    perfEnd();
    requestAnimationFrame(loop);
    return;
  }

  renderScene(true);
  drawHUD(hudCtx, currentScale, lapState, world, track);

  perfEnd();
  requestAnimationFrame(loop);
}

requestAnimationFrame((t) => {
  lastTimestamp = t;
  requestAnimationFrame(loop);
});
