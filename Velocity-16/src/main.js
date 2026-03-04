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
    intro: false,
    introIndex: 0,
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
    particles: [],
    storm: {
        lightning: 0,
        nextFlash: 100,
        intensity: 0
    }
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
    totalLaps: 3,
    currentTrack: 1 // 1: Cyber Napa, 2: Crystalline Mesa
};

const tracks = {
    1: {
        name: 'Cyber Napa',
        segments: [
            { curve: 0, length: 500 },
            { curve: 0.2, length: 300 },
            { curve: 0.4, length: 150 },
            { curve: -0.4, length: 150 },
            { curve: 0, length: 400 },
            { curve: -0.5, length: 400 },
            { curve: 0, length: 600 }
        ],
        hazards: [],
        sky: '#050520',
        ground1: '#110022',
        ground2: '#050505',
        road: '#220033',
        edge: '#ff0000'
    },
    2: {
        name: 'Crystalline Mesa',
        segments: [
            { curve: 0, length: 400 },
            { curve: -0.3, length: 400 },
            { curve: 0.5, length: 200 },
            { curve: 0, length: 500 },
            { curve: 0.8, length: 300 }, // Sharp Mesa Bend
            { curve: -0.2, length: 400 },
            { curve: 0, length: 600 }
        ],
        hazards: [
            { type: 'static_pool', pos: 800, offset: -20, radius: 25 },
            { type: 'static_pool', pos: 1500, offset: 30, radius: 20 },
            { type: 'static_pool', pos: 2200, offset: 0, radius: 30 }
        ],
        sky: '#002626', // Deep Teal
        ground1: '#004d4d', // Dark Teal
        ground2: '#003333',
        road: '#006666', // Teal Road
        edge: '#FFD700'  // Gold Edge
    }
};

function getCurrentTrack() {
    return tracks[config.currentTrack];
}

function getTotalTrackLength() {
    return getCurrentTrack().segments.reduce((s, t) => s + t.length, 0);
}

function getCurvature(dist) {
    const trackData = getCurrentTrack();
    const totalLen = getTotalTrackLength();
    let d = dist % totalLen;
    for (let t of trackData.segments) {
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
    targetSpeed: 3.2 + Math.random() * 0.5,
    boostCooldown: 0
}));

// Off-road penalty factor (if offset exceeds road width)
const OFFROAD_PENALTY = 0.7;

function updatePlayer() {
    // Movement for player
    const MAX_SPEED = 5;
    if (keys['ArrowUp']) state.speed = Math.min(state.speed + (0.02 / (PILOTS.find(p => p.aiStyle === 'player').mass || 1.0)), MAX_SPEED);
    else state.speed = Math.max(state.speed - 0.02, 0);

    // High velocity sparks - simple effect at bottom of machine
    if (state.speed > MAX_SPEED * 0.8 && Math.random() > 0.7) {
        addSpark(config.width/2 - 20 + Math.random()*20, 140, (Math.random()-0.5)*2, Math.random()*2);
        addSpark(config.width/2 + 20 - Math.random()*20, 140, (Math.random()-0.5)*2, Math.random()*2);
    }

    if (keys['ArrowLeft']) {
        state.offset -= (2.5 / (PILOTS.find(p => p.aiStyle === 'player').mass || 1.0));
        state.bank = Math.max(-12, state.bank - 1.8);
    } else if (keys['ArrowRight']) {
        state.offset += (2.5 / (PILOTS.find(p => p.aiStyle === 'player').mass || 1.0));
        state.bank = Math.min(12, state.bank + 1.8);
    } else {
        state.bank *= 0.82; // Slightly more fluid drift damping
    }

    // Apply track curvature with drift physics
    let curve = getCurvature(state.distance);
    state.offset -= (curve * state.speed * 2.5); // Drift force
    state.bank -= (curve * 6); // Lean into the centripetal force

    // Off-road penalty for player
    const weightFactor = (PILOTS.find(p => p.aiStyle === 'player').mass || 1.0);
    if (Math.abs(state.offset) > config.roadWidth) {
        state.speed *= (OFFROAD_PENALTY / weightFactor);
        // Off-road dust/sparks
        if (state.speed > 0.5 && Math.random() > 0.5) {
             addSpark(config.width/2 + (Math.random()-0.5)*30, 140, (Math.random()-0.5)*4, -Math.random()*4);
        }
    }

    state.distance += state.speed;
    state.time += 1;

    // Lap and checkpoint handling
    const totalLen = getTotalTrackLength();
    let currentLap = Math.floor(state.distance / totalLen) + 1;
    if (currentLap > state.lastNotifiedLap && currentLap <= config.totalLaps) {
        state.lastNotifiedLap = currentLap;
        audio.onCheckpoint && audio.onCheckpoint(currentLap);
    }

    // Boundary check
    if (Math.abs(state.offset) > 100) {
        state.speed *= 0.95;
    }

    // Ozone Storm Logic
    if (config.currentTrack === 2) {
        if (--state.storm.nextFlash <= 0) {
            state.storm.lightning = 15; // Set flash duration in frames
            state.storm.nextFlash = 300 + Math.random() * 500;
            audio.playEffect && audio.playEffect('thunder');
        }
        if (state.storm.lightning > 0) state.storm.lightning--;
        
        // Static Pool Hazards
        const currentTrack = getCurrentTrack();
        const totalLen = getTotalTrackLength();
        const normDist = state.distance % totalLen;
        
        currentTrack.hazards.forEach(hazard => {
            if (hazard.type === 'static_pool') {
                const distToHazard = Math.abs(normDist - hazard.pos);
                if (distToHazard < hazard.radius && Math.abs(state.offset - hazard.offset) < hazard.radius) {
                    // Impact physics
                    state.speed *= 0.92;
                    state.bank += (Math.random() - 0.5) * 10;
                    if (Math.random() > 0.5) {
                        addSpark(config.width/2, 140, (Math.random()-0.5)*10, -Math.random()*10);
                        state.particles[state.particles.length-1].color = COLORS.NEON_CYAN;
                    }
                }
            }
        });
    }

    speedometer.textContent = `SPEED: ${Math.round(state.speed * 60)} KM/H`;
    audio.updateEngine(state.speed * 60);
    updateParticles();
}

function updateAIPilots() {
    aiPilots.forEach(pilot => {
        // AI Personality & Mass
        let baseAccel = 0.02 / (pilot.mass || 1.0);
        let personalityFactor = 1.0;
        
        switch(pilot.aiStyle) {
            case 'heavy': // Baron
                if (Math.abs(pilot.distance - state.distance) < 50) {
                    pilot.offset += (state.offset - pilot.offset) * 0.03; // Brute force blocking
                    personalityFactor = 1.15; // Juggernaut-7 higher top speed
                }
                break;
            case 'light': // Lyra
                personalityFactor = 0.95; // Vapor-Skimmer lower top speed, agile
                pilot.offset += (Math.sin(pilot.distance * 0.02) * 30 - pilot.offset) * 0.08; // High twitch
                break;
            case 'erratic': // Master-Remix
                if (pilot.boostCooldown > 0) pilot.boostCooldown--;
                if (pilot.boostCooldown === 0 && Math.random() > 0.99) {
                    pilot.speed += 2;
                    pilot.boostCooldown = 300;
                }
                break;
        }

        pilot.speed += (pilot.targetSpeed * personalityFactor - pilot.speed) * baseAccel;
        
        // Rubber-banding
        let distanceDelta = state.distance - pilot.distance;
        if (distanceDelta > 150) pilot.speed *= 1.05;
        else if (distanceDelta < -150) pilot.speed *= 0.95;
        
        let idealOffset = (Math.sin(pilot.distance * 0.01) * 20);
        pilot.offset += (idealOffset - pilot.offset) * 0.02;

        let aiCurve = getCurvature(pilot.distance);
        pilot.offset -= aiCurve * pilot.speed * 2 * 0.8;

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

function renderMesaHorizon(offsetX) {
    ctx.save();
    ctx.translate(offsetX, 0);
    for (let i = 0; i < 3; i++) {
        const x = i * config.width;
        // Mesa Plateaus
        ctx.fillStyle = COLORS.MESA_DARK_TEAL;
        ctx.beginPath();
        ctx.moveTo(x, config.horizon);
        ctx.lineTo(x + 50, config.horizon - 40);
        ctx.lineTo(x + 150, config.horizon - 40);
        ctx.lineTo(x + 200, config.horizon);
        ctx.fill();

        // Crystal Glow
        ctx.fillStyle = COLORS.MESA_GOLD;
        ctx.globalAlpha = 0.4;
        for (let j = 0; j < 5; j++) {
            ctx.fillRect(x + 60 + (j * 20), config.horizon - 45, 5, 5);
        }
        ctx.globalAlpha = 1.0;
    }
    ctx.restore();
}

function renderIntro() {
    const pilot = PILOTS[state.introIndex];
    if (!pilot) return;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, config.width, config.height);

    // Retro scanline flickering background 
    ctx.globalAlpha = 0.05 + Math.random() * 0.05;
    ctx.fillStyle = COLORS.NEON_CYAN;
    for(let i=0; i<config.height; i+=2) {
        ctx.fillRect(0, i, config.width, 1);
    }
    ctx.globalAlpha = 1.0;

    // Header Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = pilot.color;

    // Big Machine Render
    const jitter = Math.sin(Date.now() * 0.01) * 2;
    renderer.renderSprite(SPRITES[pilot.sprite], config.width/2, 60 + jitter, 0, 3); // Large scale

    ctx.shadowBlur = 0;

    // Pilot Name
    ctx.fillStyle = pilot.color;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(pilot.name.toUpperCase(), config.width/2, 110);
    
    // Machine & Specs
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.fillText(`${pilot.machine} // ${pilot.specs}`, config.width/2, 125);
    
    // Bio (retro scanline text effect)
    ctx.globalAlpha = 0.8 + Math.random() * 0.2;
    ctx.font = '6px monospace';
    ctx.fillText(pilot.bio, config.width/2, 140);
    ctx.globalAlpha = 1.0;

    ctx.textAlign = 'left';
}

function update() {
    if (state.intro) return;
    if (!state.running) return;
    updatePlayer();
    updateAIPilots();
}

function renderHazards(centerX, roadWidth, scanlineY) {
    if (config.currentTrack !== 2) return;
    const trackData = getCurrentTrack();
    const totalLen = getTotalTrackLength();
    
    // Draw Static Pools on road
    trackData.hazards.forEach(hazard => {
        const hDist = hazard.pos - (state.distance % totalLen);
        if (hDist < 200 && hDist > -50) {
            const hZ = (200 - hDist) / 250;
            const hY = config.horizon + (hZ * (config.height - config.horizon));
            
            if (Math.abs(scanlineY - hY) < 2) {
                const hOffX = centerX + (hazard.offset * (scanlineY - config.horizon) / (config.height - config.horizon));
                ctx.fillStyle = (Math.random() > 0.5) ? COLORS.NEON_CYAN : COLORS.PLASMA_BLUE;
                ctx.globalAlpha = 0.6;
                ctx.fillRect(hOffX - 10, scanlineY, 20, 1);
                ctx.globalAlpha = 1.0;
            }
        }
    });
}

function render() {
    if (state.intro) {
        renderIntro();
        return;
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, config.width, config.height);

    const trackData = getCurrentTrack();

    // Sky
    ctx.fillStyle = trackData.sky;
    ctx.fillRect(0, 0, config.width, config.horizon);

    // Ozone Storm Flash
    if (state.storm.lightning > 0) {
        ctx.fillStyle = `rgba(180, 255, 255, ${state.storm.lightning / 20})`; 
        ctx.fillRect(0, 0, config.width, config.height);
    }

    // Cyber Napa Parallax Horizon
    if (config.currentTrack === 1) {
        const parallaxX = -(state.distance * 0.1) % config.width;
        renderCyberNapaHorizon(parallaxX);
    } else {
        // Crystalline Mesa Parallax
        renderMesaHorizon(-(state.distance * 0.05) % config.width);
    }

    // Mode 7 Road rendering
    const totalLen = getTotalTrackLength();
    for (let y = 0; y < config.height - config.horizon; y++) {
        const perspective = y / (config.height - config.horizon);
        const scanlineY = config.horizon + y;
        const roadWidth = 20 + (perspective * 180); // Fanning out
        const curveOffset = Math.sin((state.distance + y) * 0.01) * perspective * 20;

        const centerX = (config.width / 2) + curveOffset - (state.offset * perspective);

        // Ground
        ctx.fillStyle = (Math.floor((state.distance * 0.1 + y * 0.5)) % 2 === 0) ? trackData.ground1 : trackData.ground2;
        ctx.fillRect(0, scanlineY, config.width, 1);

        // Road
        ctx.fillStyle = trackData.road;
        ctx.fillRect(centerX - roadWidth/2, scanlineY, roadWidth, 1);

        // Edges
        ctx.fillStyle = trackData.edge;
        ctx.fillRect(centerX - roadWidth/2 - 2, scanlineY, 2, 1);
        ctx.fillRect(centerX + roadWidth/2, scanlineY, 2, 1);

        // Center line
        if (Math.floor((state.distance * 0.05 + y * 0.2)) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(centerX - 1, scanlineY, 2, 1);
        }

        renderHazards(centerX, roadWidth, scanlineY);
    }

    // Render AI pilots
    aiPilots.forEach(pilot => {
        let delta = pilot.distance - state.distance;
        if (delta > -50 && delta < 250) {
            let zScale = 1 - (delta / 250); 
            let perspective = 0.2 + (zScale * 0.8);
            let spriteY = 130 - (delta * 0.4);
            let spriteX = (config.width / 2) + ((pilot.offset - state.offset) * perspective);
            
            let isAIAccelerating = pilot.speed < pilot.targetSpeed;
            renderer.renderSprite(SPRITES[pilot.sprite], spriteX, spriteY, Math.round(state.bank), perspective, isAIAccelerating);
            
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
    const isPlayerAccelerating = keys['ArrowUp'] && state.speed < 5;
    renderer.renderSprite(SPRITES.APEX_RED_NEUTRAL, config.width/2, 130 + jitter, state.bank, 1, isPlayerAccelerating);
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
    let currentLap = Math.min(Math.floor(state.distance / getTotalTrackLength()) + 1, config.totalLaps);
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
    if (state.running || state.starting || state.intro) return;
    config.currentTrack = (config.currentTrack === 1) ? 2 : 1; // Swap for demo
    startButton.style.display = 'none';
    audio.start();
    loop();

    const showPilotIntro = (index) => {
        if (index < PILOTS.length) {
            state.intro = true;
            state.introIndex = index;
            audio.speak && audio.speak(`Pilot: ${PILOTS[index].name}. Machine: ${PILOTS[index].machine}.`);
            
            setTimeout(() => {
                showPilotIntro(index + 1);
            }, 2500); // 2.5 seconds per pilot
        } else {
            state.intro = false;
            startCountdown();
        }
    };

    const startCountdown = () => {
        state.starting = true;
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
        runCountdown();
    };

    showPilotIntro(0);
};

// Initial draw
render();
