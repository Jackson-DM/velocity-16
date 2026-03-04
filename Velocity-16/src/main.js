import { COLORS } from './graphics/palette.js';
import { SpriteRenderer, SPRITES } from './graphics/sprites.js';
import { audio } from './audio/audio.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const renderer = new SpriteRenderer(ctx);

const statusLed = document.getElementById('statusLed');
const statusText = document.getElementById('statusText');
const speedometer = document.getElementById('speedometer');
const startButton = document.getElementById('startBtn');

let state = {
    running: false,
    distance: 0,
    offset: 0,
    speed: 0,
    angle: 0,
    bank: 0,
    time: 0,
    lap: 1,
    lastNotifiedLap: 0
};

const config = {
    horizon: 50,
    width: 240,
    height: 160,
    roadWidth: 80,
    segLength: 200,
    totalLaps: 3
};

// Simple track geometry: curves defined by curvature (-1 to 1)
const track = [
    { curve: 0, length: 500 },
    { curve: 0.2, length: 300 },
    { curve: 0, length: 400 },
    { curve: -0.5, length: 400 }, // Napa Hairpin
    { curve: 0, length: 600 }
];
const totalTrackLength = track.reduce((s, t) => s + t.length, 0);

function getCurvature(dist) {
    let d = dist % totalTrackLength;
    for (let t of track) {
        if (d < t.length) return t.curve * (d / t.length);
        d -= t.length;
    }
    return 0;
}

// ----- AI Pilots Integration -----
// Create 6 AI pilots with initial properties
const aiPilots = [
    { name: 'Baron', distance: 0, offset: 5, speed: 3, targetSpeed: 3.5 },
    { name: 'Lyra', distance: -20, offset: -10, speed: 3, targetSpeed: 3.4 },
    { name: 'Racer-X', distance: -40, offset: 8, speed: 3, targetSpeed: 3.3 },
    { name: 'Viper', distance: -60, offset: -7, speed: 3, targetSpeed: 3.6 },
    { name: 'Nova', distance: -80, offset: 12, speed: 3, targetSpeed: 3.5 },
    { name: 'Phantom', distance: -100, offset: -15, speed: 3, targetSpeed: 3.2 }
];

// Off-road penalty factor (if offset exceeds road width)
const OFFROAD_PENALTY = 0.7;

function updatePlayer() {
    // Movement for player
    if (keys['ArrowUp']) state.speed = Math.min(state.speed + 0.05, 5);
    else state.speed = Math.max(state.speed - 0.02, 0);

    if (keys['ArrowLeft']) {
        state.offset -= 2;
        state.bank = Math.max(-4, state.bank - 0.5);
    } else if (keys['ArrowRight']) {
        state.offset += 2;
        state.bank = Math.min(4, state.bank + 0.5);
    } else {
        state.bank *= 0.8;
    }

    // Apply track curvature
    let curve = getCurvature(state.distance);
    state.offset -= curve * state.speed * 2;

    // Off-road penalty for player
    if (Math.abs(state.offset) > config.roadWidth) {
        state.speed *= OFFROAD_PENALTY;
    }

    state.distance += state.speed;
    state.time += 1;

    // Lap and checkpoint handling
    let currentLap = Math.floor(state.distance / totalTrackLength) + 1;
    if (currentLap > state.lastNotifiedLap && currentLap <= config.totalLaps) {
        state.lastNotifiedLap = currentLap;
        audio.onCheckpoint && audio.onCheckpoint(currentLap);
    }

    // Boundary check
    if (Math.abs(state.offset) > 100) {
        state.speed *= 0.95;
    }

    speedometer.textContent = `SPEED: ${Math.round(state.speed * 60)} KM/H`;
    audio.updateEngine(state.speed * 60);
}

function updateAIPilots() {
    // Update each AI pilot's logic
    aiPilots.forEach(pilot => {
        // Simple acceleration towards target speed
        pilot.speed += (pilot.targetSpeed - pilot.speed) * 0.02;

        // Adjust offset: steer gradually toward an ideal line (simulate lane centering)
        // Here, we assume the ideal offset is 0, but each pilot has a slight bias based on their character
        let idealOffset = 0;
        if (pilot.name === 'Baron') idealOffset = 5;
        else if (pilot.name === 'Lyra') idealOffset = -5;
        else if (pilot.name === 'Racer-X') idealOffset = 3;
        else if (pilot.name === 'Viper') idealOffset = -3;
        else if (pilot.name === 'Nova') idealOffset = 7;
        else if (pilot.name === 'Phantom') idealOffset = -7;

        // Adjust offset gradually toward ideal
        pilot.offset += (idealOffset - pilot.offset) * 0.05;

        // Apply track curvature to each AI pilot
        let aiCurve = getCurvature(pilot.distance);
        pilot.offset -= aiCurve * pilot.speed * 2 * 0.8;  // slight reduction factor to differentiate from player

        // Off-road penalty for AI
        if (Math.abs(pilot.offset) > config.roadWidth) {
            pilot.speed *= OFFROAD_PENALTY;
        }
        
        pilot.distance += pilot.speed;
    });
}

function update() {
    if (!state.running) return;
    updatePlayer();
    updateAIPilots();
}

function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, config.width, config.height);

    // Sky
    ctx.fillStyle = '#050520';
    ctx.fillRect(0, 0, config.width, config.horizon);

    // Mode 7 Road rendering
    for (let y = 0; y < config.height - config.horizon; y++) {
        const perspective = y / (config.height - config.horizon);
        const scanlineY = config.horizon + y;
        const roadWidth = 20 + (perspective * 180); // Fanning out
        const curveOffset = Math.sin((state.distance + y) * 0.01) * perspective * 20;
        
        const centerX = (config.width / 2) + curveOffset - (state.offset * perspective);

        // Ground
        ctx.fillStyle = (Math.floor((state.distance * 0.1 + y * 0.5)) % 2 === 0) ? '#110022' : '#050505';
        ctx.fillRect(0, scanlineY, config.width, 1);

        // Road
        ctx.fillStyle = '#220033';
        ctx.fillRect(centerX - roadWidth/2, scanlineY, roadWidth, 1);

        // Edges
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(centerX - roadWidth/2 - 2, scanlineY, 2, 1);
        ctx.fillRect(centerX + roadWidth/2, scanlineY, 2, 1);

        // Center line
        if (Math.floor((state.distance * 0.05 + y * 0.2)) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(centerX - 1, scanlineY, 2, 1);
        }
    }

    // Render AI pilots
    // We'll render them relative to the player's position. Pilots ahead appear slightly lower.
    aiPilots.forEach(pilot => {
        // Compute vertical offset based on distance difference
        let delta = pilot.distance - state.distance;
        // Only render if within a visible range (-200 to 200)
        if (delta > -50 && delta < 150) {
            let perspective = 1 - (delta + 50) / 200; // simple projection
            let spriteY = 130 - (delta * 0.2);
            let spriteX = (config.width / 2) + ((pilot.offset - state.offset) * perspective);
            // Use a different sprite or tint if available; here we reuse APEX_RED_NEUTRAL for simplicity
            // In a full implementation, each pilot would have a unique sprite
            renderer.renderSprite(SPRITES.APEX_RED_NEUTRAL, spriteX, spriteY, Math.round(state.bank));
            // Optionally draw pilot name
            ctx.fillStyle = '#fff';
            ctx.font = '6px monospace';
            ctx.fillText(pilot.name, spriteX - 10, spriteY - 5);
        }
    });

    // Render Player
    renderer.renderSprite(SPRITES.APEX_RED_NEUTRAL, config.width/2, 130, Math.round(state.bank));

    // UI Overlays
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    // Position: determine player ranking by comparing distances
    let rank = 1;
    aiPilots.forEach(pilot => { if (pilot.distance > state.distance) rank++; });
    ctx.fillText(`POS ${rank}/7`, 10, 20);
    let currentLap = Math.min(Math.floor(state.distance / totalTrackLength) + 1, config.totalLaps);
    ctx.fillText(`LAP ${currentLap}/${config.totalLaps}`, 200, 20);
}

const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

startButton.onclick = () => {
    if (state.running) return;
    state.running = true;
    statusLed.className = 'status-led active';
    statusText.textContent = 'ENGINE: ACTIVE';
    startButton.style.display = 'none';
    audio.start();
    audio.speak && audio.speak("Velocity-16 Engine Online. Accelerate now.");
    loop();
};

// Initial draw
render();
