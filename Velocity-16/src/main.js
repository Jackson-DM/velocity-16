import { COLORS, getColor } from './graphics/palette.js';
import { SpriteRenderer, SPRITES, PILOTS } from './graphics/sprites.js';
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
    starting: false,
    countdown: 0,
    countdownText: '',
    distance: 0,
    offset: 0,
    speed: 0,
    angle: 0,
    bank: 0,
    time: 0,
    lap: 1,
    lastNotifiedLap: 0,
    particles: []
};

function addSpark(x, y, vx, vy) {
    state.particles.push({
        x, y, vx, vy,
        life: 1.0,
        color: Math.random() > 0.5 ? '#fff' : '#ffff00'
    });
}

function updateParticles() {
    state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        return p.life > 0;
    });
}

function renderParticles() {
    state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
    });
    ctx.globalAlpha = 1.0;
}

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
    { curve: 0.4, length: 150 },
    { curve: -0.4, length: 150 },
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

const aiPilots = PILOTS.filter(p => p.aiStyle !== 'player').map(p => ({
    ...p,
    distance: Math.random() * -100,
    offset: (Math.random() - 0.5) * 40,
    speed: 3,
    targetSpeed: 3.2 + Math.random() * 0.5
}));

// Off-road penalty factor (if offset exceeds road width)
const OFFROAD_PENALTY = 0.7;

function updatePlayer() {
    // Movement for player
    const MAX_SPEED = 5;
    if (keys['ArrowUp']) state.speed = Math.min(state.speed + 0.02, MAX_SPEED);
    else state.speed = Math.max(state.speed - 0.02, 0);

    // High velocity sparks - simple effect at bottom of machine
    if (state.speed > MAX_SPEED * 0.8 && Math.random() > 0.7) {
        addSpark(config.width/2 - 20 + Math.random()*20, 140, (Math.random()-0.5)*2, Math.random()*2);
        addSpark(config.width/2 + 20 - Math.random()*20, 140, (Math.random()-0.5)*2, Math.random()*2);
    }

    if (keys['ArrowLeft']) {
        state.offset -= 2;
        state.bank = Math.max(-10, state.bank - 1.5); // Accelerated tilt
    } else if (keys['ArrowRight']) {
        state.offset += 2;
        state.bank = Math.min(10, state.bank + 1.5); // Accelerated tilt
    } else {
        state.bank *= 0.85; // Damping
    }

    // Apply track curvature
    let curve = getCurvature(state.distance);
    state.offset -= curve * state.speed * 2;
    // Auto-lean into the curve (banking)
    state.bank -= curve * 5;

    // Off-road penalty for player
    if (Math.abs(state.offset) > config.roadWidth) {
        state.speed *= OFFROAD_PENALTY;
        // Off-road dust/sparks
        if (state.speed > 0.5 && Math.random() > 0.5) {
             addSpark(config.width/2 + (Math.random()-0.5)*30, 140, (Math.random()-0.5)*4, -Math.random()*4);
        }
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
    updateParticles();
}

function updateAIPilots() {
    // Update each AI pilot's logic
    aiPilots.forEach(pilot => {
        // Simple acceleration towards target speed
        pilot.speed += (pilot.targetSpeed - pilot.speed) * 0.02;
        // Rubber-banding: adjust speed based on player's relative distance
        let distanceDelta = state.distance - pilot.distance;
        if (distanceDelta > 150) {
            pilot.speed *= 1.05;
        } else if (distanceDelta < -150) {
            pilot.speed *= 0.95;
        }
        
        // Adjust offset: steer gradually toward an ideal line
        let idealOffset = (Math.sin(pilot.distance * 0.01) * 20); // Sway slightly

        // Adjust offset gradually toward ideal
        pilot.offset += (idealOffset - pilot.offset) * 0.02;

        // Apply track curvature to each AI pilot
        let aiCurve = getCurvature(pilot.distance);
        pilot.offset -= aiCurve * pilot.speed * 2 * 0.8;

        // Off-road penalty for AI
        if (Math.abs(pilot.offset) > config.roadWidth) {
            pilot.speed *= OFFROAD_PENALTY;
        }

        pilot.distance += pilot.speed;
    });
}

function renderCyberNapaHorizon(offsetX) {
    ctx.save();
    ctx.translate(offsetX, 0);
    
    for (let i = 0; i < 3; i++) {
        const x = i * config.width;
        // Background Hills
        ctx.fillStyle = '#0a0a2a';
        ctx.beginPath();
        ctx.moveTo(x, config.horizon);
        ctx.lineTo(x + 40, config.horizon - 20);
        ctx.lineTo(x + 80, config.horizon - 10);
        ctx.lineTo(x + 120, config.horizon - 30);
        ctx.lineTo(x + 160, config.horizon - 15);
        ctx.lineTo(x + 200, config.horizon - 25);
        ctx.lineTo(x + 240, config.horizon);
        ctx.fill();

        // Glowing Vine Structures (Hydroponic Vats)
        ctx.fillStyle = COLORS.NEON_GREEN;
        for (let v = 0; v < 4; v++) {
            const vx = x + 20 + (v * 60);
            ctx.globalAlpha = 0.3;
            ctx.fillRect(vx, config.horizon - 15, 10, 15); // The Vat
            ctx.globalAlpha = 0.8;
            ctx.fillRect(vx + 4, config.horizon - 12, 2, 12); // Neon Core
            
            // "Vines" (simple lines)
            ctx.strokeStyle = COLORS.NEON_GREEN;
            ctx.beginPath();
            ctx.moveTo(vx + 5, config.horizon - 15);
            ctx.bezierCurveTo(vx - 5, config.horizon - 25, vx + 15, config.horizon - 25, vx + 5, config.horizon - 35);
            ctx.stroke();
        }
    }
    ctx.restore();
    ctx.globalAlpha = 1.0;
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

    // Cyber Napa Parallax Horizon
    const parallaxX = -(state.distance * 0.1) % config.width;
    renderCyberNapaHorizon(parallaxX);

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
    aiPilots.forEach(pilot => {
        let delta = pilot.distance - state.distance;
        if (delta > -50 && delta < 250) {
            let zScale = 1 - (delta / 250); 
            let perspective = 0.2 + (zScale * 0.8);
            let spriteY = 130 - (delta * 0.4);
            let spriteX = (config.width / 2) + ((pilot.offset - state.offset) * perspective);
            
            renderer.renderSprite(SPRITES[pilot.sprite], spriteX, spriteY, Math.round(state.bank), perspective);
            
            ctx.fillStyle = pilot.color;
            ctx.font = '6px monospace';
            ctx.fillText(pilot.name.toUpperCase(), spriteX - 15, spriteY - 8);
        }
    });

    // Speed blurs - horizontal lines stretching at high speed
    if (state.speed > 4) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const bx = Math.random() * config.width;
            const by = config.horizon + Math.random() * (config.height - config.horizon);
            const blen = state.speed * 10;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + blen, by);
            ctx.stroke();
        }
    }

    // Boost screen-flash effect
    const MAX_SPEED = 5;
    if (state.speed > MAX_SPEED * 0.95) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(0, 0, config.width, config.height);
        
        ctx.fillStyle = COLORS.NEON_CYAN;
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('⚡ BOOST ⚡', config.width / 2, config.height - 40);
        ctx.textAlign = 'left';
    }

    // Render Player
    // Render Player with banking and slight vertical jitter at high velocity
    const jitter = (state.speed > 4.5) ? (Math.random() - 0.5) * 2 : 0;
    renderer.renderSprite(SPRITES.APEX_RED_NEUTRAL, config.width/2, 130 + jitter, state.bank);
    renderParticles();

    // UI Overlays
    if (state.starting) {
        ctx.fillStyle = '#fff';
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(state.countdownText, config.width/2, config.height/2 + 10);
        ctx.textAlign = 'left';
    }

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
    if (state.running || state.starting) return;
    state.starting = true;
    startButton.style.display = 'none';
    audio.start();

    // Countdown process
    const countdownSteps = [
        { text: '3', num: 3 },
        { text: '2', num: 2 },
        { text: '1', num: 1 },
        { text: 'GO!', num: 'GO' }
    ];

    let i = 0;
    const runCountdown = () => {
        if (i < countdownSteps.length) {
            state.countdownText = countdownSteps[i].text;
            audio.playCountdown(countdownSteps[i].num);
            i++;
            setTimeout(runCountdown, 1000);
        } else {
            state.starting = false;
            state.running = true;
            statusLed.className = 'status-led active';
            statusText.textContent = 'ENGINE: ACTIVE';
            audio.speak && audio.speak("Velocity-16 Engine Online. Accelerate now.");
        }
    };

    // Initial start call
    loop();
    runCountdown();
};

// Initial draw
render();
