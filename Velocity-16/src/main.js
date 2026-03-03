// Velocity-16 Main Engine Loop and Physics Implementation
// This engine loop supports basic input and physics with collision detection.
// It includes special handling for the 'Napa Hairpin' zone with high-friction drift logic.

// Import graphics components
console.log('Starting Velocity-16 engine...');
import { COLORS } from './graphics/palette.js';
console.log('Palette loaded');
import { SpriteRenderer, SPRITES, PILOTS } from './graphics/sprites.js';
console.log('Sprites loaded');
// Fallback audio if module fails to load
const audio = {
    start: function() { console.log('Audio initialized'); },
    speak: function(text) { console.log('Voice: ' + text); },
    updateEngine: function() {},
    onCheckpoint: function() {},
    onLapComplete: function() {}
};

// Try to import audio properly
try {
    import('./audio/audio.js').then(module => {
        Object.assign(audio, module.audio);
        console.log('Audio module loaded successfully');
    }).catch(e => {
        console.error('Failed to load audio module:', e);
    });
} catch(e) {
    console.error('Audio import error:', e);
}

// Setup canvas
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const spriteRenderer = new SpriteRenderer(context);

// UI Elements
const statusLed = document.getElementById('statusLed');
const statusText = document.getElementById('statusText');
const speedometer = document.getElementById('speedometer');
const startButton = document.getElementById('startBtn');

// Track layout constants
const TRACK_LENGTH = 5000; // Total track length in units
const CHECKPOINT_COUNT = 12; // Number of checkpoints around the track
const LAPS_TO_WIN = 3; // Number of laps required to win the race

// Define AI pilot vehicles
const aiPilots = [];
for (let i = 1; i < PILOTS.length; i++) { // Start at 1 to skip player (Apex Red)
    aiPilots.push({
        pilot: PILOTS[i],
        // Start position (distance along track)
        trackPosition: Math.random() * 200, // Randomize start positions slightly
        // Speed factors vary by AI style
        speedFactor: 0.85 + (Math.random() * 0.25), // Between 85% and 110% speed
        // Unique lateral offset to spread across track width
        lateralPosition: -0.5 + Math.random(), // -0.5 to 0.5 across track
        // Current position in race (updated during game)
        racePosition: i + 1
    });
}

// Global Game State
let gameState = {
    isRunning: false,
    gridOffset: { x: 0, y: 0 },
    car: {
        // Starting position
        position: { x: 120, y: 80 },
        // Velocity vector
        velocity: { x: 0, y: 0 },
        // Orientation in radians
        angle: 0,
        // Normal friction coefficient
        friction: 0.98,
        // Shear level for banking effect (-4 to 4)
        shearLevel: 0,
        // Speed for display
        speed: 0,
        // Pulsation effect for neon glow
        glowPulse: 0,
        // Car type
        type: 'APEX_RED_NEUTRAL',
        // Race position
        position: 1,
        // Track position (distance along track)
        trackPosition: 0,
        // Current lap (1-based)
        lap: 1,
        // Last checkpoint passed
        lastCheckpoint: 0
    },
    // Track state
    track: {
        // Track spline parameters
        segments: [], // Will store track segment data
        // Track width at different points
        width: 250,
        // Distance along the track 
        distance: 0,
        // Race timer
        raceTime: 0,
        // Race state
        raceStarted: false,
        // Lap times
        lapTimes: []
    },
    trackProgression: { distance: 0, lateralOffset: 0 }
};

// Generate a simple oval track with some curves
function generateTrack() {
    const segmentCount = 60; // Number of track segments
    const segmentLength = TRACK_LENGTH / segmentCount;
    
    for (let i = 0; i < segmentCount; i++) {
        const angle = (i / segmentCount) * Math.PI * 2;
        // Create some track curvature - positive values curve right, negative curve left
        let curvature = 0;
        
        // Add some interesting curves - simple oval with two hairpins
        if (i > 5 && i < 10) curvature = 0.3; // Right curve
        else if (i > 20 && i < 25) curvature = -0.4; // Sharp left hairpin (Napa Hairpin)
        else if (i > 35 && i < 40) curvature = 0.25; // Right curve
        else if (i > 45 && i < 50) curvature = -0.25; // Left curve
        
        // Vary track width slightly for more visual interest
        const trackWidth = gameState.track.width * (0.9 + 0.2 * Math.sin(angle * 3));
        
        // Track segment data
        gameState.track.segments.push({
            index: i,
            length: segmentLength,
            curvature: curvature,
            width: trackWidth,
            // Track environment features
            features: {
                hasCheckpoint: i % (segmentCount / CHECKPOINT_COUNT) === 0,
                checkpointIndex: Math.floor(i / (segmentCount / CHECKPOINT_COUNT)),
                hasBoostPad: i % 15 === 7 // Boost pads every 15 segments
            },
            // Visual styling (color variation, etc.)
            style: {
                roadColor: i % 5 === 0 ? '#100010' : '#050505', // Slightly different color every 5 segments
                lineColor: i % 10 === 0 ? '#ff00ff' : '#ff0000' // Alternate line colors
            }
        });
    }
}

// Background grid configuration - F-Zero Mode 7 style
const gridConfig = {
    cellSize: 16,
    horizonY: 50,  // Lower horizon for more dramatic Mode 7 perspective
    cellRows: 30,  // More rows for smoother perspective 
    cellCols: 40,  // More columns for wider track
    vanishingPointX: canvas.width / 2,
    parallaxFactor: 2.0,  // Higher factor for increased speed effect
    fov: 220,      // Wider field of view angle (determines perspective intensity)
    trackWidth: 320, // How wide the track appears at the bottom (wider for better F-Zero feel)
    roadWidth: 280, // Width of actual road surface on top of the grid
    groundColorTop: '#200030', // Track color at horizon (purple glow)
    groundColorBottom: '#050505', // Track color at bottom (matte black)
    gridLineColorH: '#ff0000', // Horizontal grid line color (red)
    gridLineColorV: '#ff00ff',  // Vertical grid line color (magenta)
    roadColorTop: '#110011', // Road surface at horizon
    roadColorBottom: '#330033', // Road surface at bottom
    perspective: 2.5,  // Perspective strength for proper tapering
    roadTaper: 0.92    // How quickly the road narrows to the vanishing point
};

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function isKeyPressed(key) {
    return keys[key];
}

// Determine if the car is in the Napa Hairpin zone
function isInNapaHairpin() {
    // Check track position to determine if in the Napa Hairpin segment
    const currentSegmentIndex = Math.floor(gameState.car.trackPosition / (TRACK_LENGTH / gameState.track.segments.length)) % gameState.track.segments.length;
    return (currentSegmentIndex > 20 && currentSegmentIndex < 25);
}

// Find track segment at a specific distance
function getSegmentAtDistance(distance) {
    const segmentLength = TRACK_LENGTH / gameState.track.segments.length;
    const segmentIndex = Math.floor(distance / segmentLength) % gameState.track.segments.length;
    return gameState.track.segments[segmentIndex];
}

// Update the positions of AI racers with improved F-Zero style behavior
function updateAIRacers() {
    // Get current segment for player for AI responsiveness
    const currentPlayerSegment = getSegmentAtDistance(gameState.car.trackPosition);
    
    // Update all AI pilots with enhanced F-Zero style behavior
    for (let pilot of aiPilots) {
        // Get current AI segment for track-aware behavior
        const aiSegment = getSegmentAtDistance(pilot.trackPosition);
        
        // Base speed influenced by racing line and style
        let baseSpeed = 0;
        
        // Apply different AI styles based on pilot type
        switch (pilot.pilot.aiStyle) {
            case 'aggressive':
                // Faster on straights, slightly slower in curves
                baseSpeed = aiSegment && Math.abs(aiSegment.curvature) > 0.2 
                    ? 1.6 * pilot.speedFactor 
                    : 1.8 * pilot.speedFactor;
                // More aggressive position changing
                if (Math.random() < 0.05) {
                    pilot.lateralPosition = Math.max(-0.6, Math.min(0.6, pilot.lateralPosition + (Math.random() - 0.5) * 0.3));
                }
                break;
                
            case 'technical':
                // Better in curves, takes ideal racing lines
                baseSpeed = aiSegment && Math.abs(aiSegment.curvature) > 0.2 
                    ? 1.75 * pilot.speedFactor 
                    : 1.6 * pilot.speedFactor;
                // Smoother racing line in curves
                if (aiSegment && Math.abs(aiSegment.curvature) > 0.1) {
                    // Move to inside of curve (ideal racing line)
                    const targetLateral = aiSegment.curvature > 0 ? -0.3 : 0.3;
                    pilot.lateralPosition += (targetLateral - pilot.lateralPosition) * 0.05;
                }
                break;
                
            case 'defensive':
                // Consistent speed, defends position
                baseSpeed = 1.65 * pilot.speedFactor;
                // Block if player is close behind
                const playerDistance = (gameState.car.trackPosition - pilot.trackPosition + TRACK_LENGTH) % TRACK_LENGTH;
                if (playerDistance < 100 && playerDistance > 0) {
                    // Check if player is in same lap and close behind
                    const playerLateral = (gameState.car.position.x - gridConfig.vanishingPointX) / gridConfig.trackWidth;
                    // Move to block player's line
                    pilot.lateralPosition += (playerLateral - pilot.lateralPosition) * 0.03;
                } else {
                    // Return to normal racing line
                    pilot.lateralPosition *= 0.98;
                }
                break;
                
            case 'tactical':
                // Varies speed based on race position
                if (pilot.racePosition > 3) {
                    // Push harder when behind
                    baseSpeed = 1.75 * pilot.speedFactor;
                } else {
                    // Maintain when in good position
                    baseSpeed = 1.6 * pilot.speedFactor;
                }
                // Tactical racing line changes
                if (Math.random() < 0.02) {
                    pilot.lateralPosition = Math.max(-0.5, Math.min(0.5, pilot.lateralPosition + (Math.random() - 0.5) * 0.2));
                }
                break;
                
            case 'reckless':
                // Highly variable speed, erratic movements
                baseSpeed = (1.5 + Math.random() * 0.4) * pilot.speedFactor;
                // Random lateral movements
                if (Math.random() < 0.08) {
                    pilot.lateralPosition = Math.max(-0.7, Math.min(0.7, pilot.lateralPosition + (Math.random() - 0.5) * 0.4));
                }
                break;
                
            case 'precise':
                // Very consistent speed and line
                baseSpeed = 1.65 * pilot.speedFactor;
                // Gradual return to center line
                pilot.lateralPosition *= 0.97;
                break;
                
            default: // balanced
                baseSpeed = 1.6 * pilot.speedFactor;
                // Occasional lane changes
                if (Math.random() < 0.03) {
                    pilot.lateralPosition = Math.max(-0.5, Math.min(0.5, pilot.lateralPosition + (Math.random() - 0.5) * 0.2));
                }
        }
        
        // Add track-specific speed variations
        const trackVariation = aiSegment ? 0.1 * (1 - Math.abs(aiSegment.curvature)) : 0.1;
        
        // Add rhythmic speed oscillation for more natural feel
        const speedOscillation = 0.1 * Math.sin(gameState.track.raceTime * 0.002 + pilot.pilot.name.length);
        
        // Add small random variation for unpredictability
        const randomVariation = (Math.random() - 0.5) * 0.05;
        
        // Combine all factors for final speed
        const finalSpeed = baseSpeed + trackVariation + speedOscillation + randomVariation;
        
        // Update track position
        pilot.trackPosition += finalSpeed;
        
        // Handle lap counting for AI
        if (pilot.trackPosition >= TRACK_LENGTH) {
            pilot.trackPosition %= TRACK_LENGTH;
            // Count laps properly
            pilot.lap = (pilot.lap || 1) + 1;
        }
    }
    
    // Calculate race positions including player with proper lap tracking
    const allRacers = [
        { 
            pilot: PILOTS[0], // Player
            trackPosition: gameState.car.trackPosition,
            lap: gameState.car.lap
        },
        ...aiPilots.map(ai => ({
            pilot: ai.pilot,
            trackPosition: ai.trackPosition,
            lap: ai.lap || 1 // Make sure lap is defined
        }))
    ];
    
    // Sort by lap and track position
    allRacers.sort((a, b) => {
        if (b.lap !== a.lap) return b.lap - a.lap;
        return b.trackPosition - a.trackPosition;
    });
    
    // Assign positions with F-Zero style rubberbanding for more exciting races
    for (let i = 0; i < allRacers.length; i++) {
        const racer = allRacers[i];
        if (racer.pilot === PILOTS[0]) { // Player
            gameState.car.position = i + 1;
            
            // Apply subtle rubberbanding to keep race competitive
            if (i === 0 && gameState.car.lap > 1) {
                // If player is far ahead, slightly boost AI
                for (let ai of aiPilots) {
                    ai.speedFactor *= 1.001; // Very subtle boost
                }
            } else if (i >= 5) {
                // If player is far behind, slightly reduce AI speed
                for (let ai of aiPilots) {
                    ai.speedFactor *= 0.999; // Very subtle reduction
                }
            }
        } else {
            // Find and update the corresponding AI pilot
            const aiPilot = aiPilots.find(ai => ai.pilot === racer.pilot);
            if (aiPilot) {
                aiPilot.racePosition = i + 1;
                
                // Keep AI speed factors in reasonable bounds
                aiPilot.speedFactor = Math.max(0.85, Math.min(1.1, aiPilot.speedFactor));
            }
        }
    }
}

// Update physics and game state with optimized F-Zero style timings
function updatePhysics() {
    // Start race timer when the game is running
    if (gameState.isRunning && gameState.track.raceStarted) {
        // More precise timer calculation based on accurate frame timing
        const frameTime = 16.67; // Target 60fps (in ms)
        gameState.track.raceTime += frameTime;
    }
    
    // Calculate current speed for acceleration damping (F-Zero style handling)
    const currentSpeed = Math.sqrt(
        gameState.car.velocity.x * gameState.car.velocity.x + 
        gameState.car.velocity.y * gameState.car.velocity.y
    );
    
    // Progressive acceleration/deceleration curves for better F-Zero feel
    const maxSpeed = 6.0;
    const accelerationFactor = Math.max(0.1, 0.3 - (currentSpeed / maxSpeed) * 0.15);
    const driftFactor = 1.02 - (currentSpeed / maxSpeed) * 0.05;
    
    // Basic input: accelerate with F-Zero style progressive curve
    if (isKeyPressed('ArrowUp')) {
        // Accelerate in the current facing direction with progressive curve
        const accelX = Math.cos(gameState.car.angle) * accelerationFactor;
        const accelY = Math.sin(gameState.car.angle) * accelerationFactor;
        
        gameState.car.velocity.x += accelX;
        gameState.car.velocity.y += accelY;
        
        // Add visual boost effect at high speeds
        if (currentSpeed > maxSpeed * 0.8) {
            gameState.car.glowPulse = (gameState.car.glowPulse + 0.1) % (Math.PI * 2);
        }
    }
    
    // Enhanced braking system
    if (isKeyPressed('ArrowDown')) {
        // Progressive braking - stronger at higher speeds
        const brakeFactor = 0.93 + (currentSpeed / maxSpeed) * 0.04;
        gameState.car.velocity.x *= brakeFactor;
        gameState.car.velocity.y *= brakeFactor;
    }
    
    // Enhanced F-Zero style turning with drift physics
    if (isKeyPressed('ArrowLeft')) {
        // Turn rate increases at higher speeds for better drift feel
        const turnRate = 0.04 + (currentSpeed / maxSpeed) * 0.02;
        gameState.car.angle -= turnRate;
        
        // Enhanced banking physics with smoother transitions
        const bankRate = 0.3 + (currentSpeed / maxSpeed) * 0.2;
        gameState.car.shearLevel = Math.max(-4, gameState.car.shearLevel - bankRate);
        
        // Add drift physics - slight velocity adjustment in turn direction
        if (currentSpeed > 2.0) {
            // Lateral drift force based on current speed and turning angle
            const driftX = Math.sin(gameState.car.angle) * currentSpeed * 0.01;
            const driftY = -Math.cos(gameState.car.angle) * currentSpeed * 0.01;
            
            // Apply drift force (subtle effect)
            gameState.car.velocity.x += driftX * driftFactor;
            gameState.car.velocity.y += driftY * driftFactor;
        }
    } else if (isKeyPressed('ArrowRight')) {
        // Turn rate increases at higher speeds for better drift feel
        const turnRate = 0.04 + (currentSpeed / maxSpeed) * 0.02;
        gameState.car.angle += turnRate;
        
        // Enhanced banking physics with smoother transitions
        const bankRate = 0.3 + (currentSpeed / maxSpeed) * 0.2;
        gameState.car.shearLevel = Math.min(4, gameState.car.shearLevel + bankRate);
        
        // Add drift physics - slight velocity adjustment in turn direction
        if (currentSpeed > 2.0) {
            // Lateral drift force based on current speed and turning angle
            const driftX = -Math.sin(gameState.car.angle) * currentSpeed * 0.01;
            const driftY = Math.cos(gameState.car.angle) * currentSpeed * 0.01;
            
            // Apply drift force (subtle effect)
            gameState.car.velocity.x += driftX * driftFactor;
            gameState.car.velocity.y += driftY * driftFactor;
        }
    } else {
        // Return to neutral banking with rate proportional to current bank angle
        // This creates a smooth, progressive return to neutral
        if (gameState.car.shearLevel > 0) {
            const returnRate = 0.08 + (gameState.car.shearLevel / 8);
            gameState.car.shearLevel = Math.max(0, gameState.car.shearLevel - returnRate);
        } else if (gameState.car.shearLevel < 0) {
            const returnRate = 0.08 + (Math.abs(gameState.car.shearLevel) / 8);
            gameState.car.shearLevel = Math.min(0, gameState.car.shearLevel + returnRate);
        }
    }

    // Apply friction based on current zone with speed-dependent factor
    if (isInNapaHairpin()) {
        // High friction zone: more damping simulating the drift dynamics at the hairpin
        // Lower friction at lower speeds for better control
        const hairpinFriction = Math.min(0.92, 0.85 + (1 - currentSpeed/maxSpeed) * 0.07);
        gameState.car.velocity.x *= hairpinFriction;
        gameState.car.velocity.y *= hairpinFriction;
    } else {
        // Normal friction with F-Zero style handling (less friction at higher speeds)
        const dynamicFriction = gameState.car.friction + (1 - currentSpeed/maxSpeed) * 0.01;
        gameState.car.velocity.x *= dynamicFriction;
        gameState.car.velocity.y *= dynamicFriction;
    }
    
    // Speed limiter for maximum speed cap (F-Zero style)
    if (currentSpeed > maxSpeed) {
        const scaleFactor = maxSpeed / currentSpeed;
        gameState.car.velocity.x *= scaleFactor;
        gameState.car.velocity.y *= scaleFactor;
    }

    // Update position based on velocity
    gameState.car.position.x += gameState.car.velocity.x;
    gameState.car.position.y += gameState.car.velocity.y;

    // Update track progression metrics with improved speed calculation
    let rawSpeed = Math.sqrt(gameState.car.velocity.x * gameState.car.velocity.x + gameState.car.velocity.y * gameState.car.velocity.y);
    gameState.car.trackPosition += rawSpeed * 1.2; // Slightly increased progression rate
    gameState.trackProgression.lateralOffset = gameState.car.position.x - gridConfig.vanishingPointX;

    // Check for lap completion with improved detection
    if (gameState.car.trackPosition >= TRACK_LENGTH) {
        // Record lap time
        const lapTime = gameState.track.raceTime;
        gameState.track.lapTimes.push(lapTime);
        
        // Check if it's a new best lap
        let isNewBest = false;
        if (gameState.track.lapTimes.length > 1) {
            isNewBest = lapTime < Math.min(...gameState.track.lapTimes.slice(0, -1));
        }
        
        // Play lap completion sound/voice
        audio.onLapComplete(lapTime, isNewBest);
        
        // Reset track position for new lap
        gameState.car.trackPosition %= TRACK_LENGTH;
        gameState.car.lap++;
        
        // Check if race is complete
        if (gameState.car.lap > LAPS_TO_WIN) {
            audio.onRaceFinish(gameState.car.position, gameState.track.raceTime);
            // Could add race completion logic here
        }
    }

    // Check for checkpoint crossings with improved detection
    const currentSegment = getSegmentAtDistance(gameState.car.trackPosition);
    if (currentSegment && currentSegment.features.hasCheckpoint) {
        const checkpointIndex = currentSegment.features.checkpointIndex;
        if (checkpointIndex !== gameState.car.lastCheckpoint) {
            audio.onCheckpoint(checkpointIndex);
            gameState.car.lastCheckpoint = checkpointIndex;
        }
    }

    // Enhanced collision detection with F-Zero style bouncing
    if (gameState.car.position.x < 0 || gameState.car.position.x > canvas.width) {
        // F-Zero style bounce with speed-dependent energy loss
        const bounceFactor = 0.4 + (1 - currentSpeed/maxSpeed) * 0.2;
        gameState.car.velocity.x = -gameState.car.velocity.x * bounceFactor;
        
        // Add slight rotation on impact for more dramatic effect
        gameState.car.angle += (gameState.car.velocity.x > 0 ? -0.1 : 0.1) * (currentSpeed / maxSpeed);
        
        // Ensure the car stays within bounds
        gameState.car.position.x = Math.max(5, Math.min(canvas.width - 5, gameState.car.position.x));
    }
    
    if (gameState.car.position.y < 0 || gameState.car.position.y > canvas.height) {
        // F-Zero style bounce with speed-dependent energy loss
        const bounceFactor = 0.4 + (1 - currentSpeed/maxSpeed) * 0.2;
        gameState.car.velocity.y = -gameState.car.velocity.y * bounceFactor;
        
        // Add slight rotation on impact for more dramatic effect
        gameState.car.angle += (gameState.car.velocity.y > 0 ? 0.1 : -0.1) * (currentSpeed / maxSpeed);
        
        // Ensure the car stays within bounds
        gameState.car.position.y = Math.max(5, Math.min(canvas.height - 5, gameState.car.position.y));
    }

    // Calculate speed for display with smoother transitions
    const displaySpeed = Math.sqrt(
        gameState.car.velocity.x * gameState.car.velocity.x + 
        gameState.car.velocity.y * gameState.car.velocity.y
    ) * 28; // Adjusted multiplier for more impressive speed display
    
    // Smooth the speed display changes
    gameState.car.speed = gameState.car.speed * 0.9 + displaySpeed * 0.1;
    
    // Update speedometer display
    speedometer.textContent = `SPEED: ${Math.round(gameState.car.speed)} KM/H`;
    
    // Update audio engine sound based on speed with proper scaling
    if (gameState.isRunning) {
        audio.updateEngine(gameState.car.speed);
    }
    
    // Enhanced parallax grid offset based on car movement
    // Higher parallax factor at higher speeds for more dramatic effect
    const dynamicParallax = gridConfig.parallaxFactor * (0.8 + currentSpeed/maxSpeed * 0.6);
    gameState.gridOffset.x += gameState.car.velocity.x * dynamicParallax;
    gameState.gridOffset.y += gameState.car.velocity.y * dynamicParallax;
    
    // Keep grid offset within bounds for seamless tiling
    gameState.gridOffset.x %= gridConfig.cellSize;
    gameState.gridOffset.y %= gridConfig.cellSize;
    
    // Update glow pulse for neon effects - speed-dependent pulsation
    const pulseFactor = 0.04 + (currentSpeed/maxSpeed) * 0.03;
    gameState.car.glowPulse = (gameState.car.glowPulse + pulseFactor) % (Math.PI * 2);
    
    // Update AI racers
    updateAIRacers();
}

// Render the F-Zero style Mode 7 perspective grid background with road surface on top
function renderGrid() {
    const { cellSize, horizonY, cellRows, cellCols, vanishingPointX, fov, trackWidth, roadWidth,
            groundColorTop, groundColorBottom, gridLineColorH, gridLineColorV, 
            roadColorTop, roadColorBottom } = gridConfig;
    const { gridOffset, car } = gameState;
    
    // Calculate speed-based effects
    const speedFactor = Math.min(1, car.speed / 200);
    const horizonShift = car.shearLevel * 15; // Horizon shifts based on turning
    
    // Draw night sky gradient with stars
    const skyGradient = context.createLinearGradient(0, 0, 0, horizonY);
    skyGradient.addColorStop(0, '#000000');
    skyGradient.addColorStop(0.5, '#050520');
    skyGradient.addColorStop(1, '#200030');
    
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add stars to the night sky
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 0.1 + gridOffset.x * 0.001) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 0.37) * 0.5 + 0.5) * horizonY * 0.8;
        const size = (Math.sin(i + gridOffset.y * 0.01) * 0.5 + 0.5) * 1.5 + 0.5;
        context.fillRect(x, y, size, size);
    }
    
    // Draw horizon with city silhouette
    const cityGradient = context.createLinearGradient(0, horizonY - 20, 0, horizonY);
    cityGradient.addColorStop(0, 'rgba(20, 0, 40, 0)');
    cityGradient.addColorStop(1, 'rgba(40, 0, 80, 0.6)');
    
    context.fillStyle = cityGradient;
    context.beginPath();
    context.moveTo(0, horizonY);
    
    // Create jagged city silhouette
    for (let x = 0; x < canvas.width; x += 10) {
        const buildingHeight = 5 + Math.abs(Math.sin((x + gridOffset.x * 0.1) * 0.05) * 15);
        context.lineTo(x, horizonY - buildingHeight);
    }
    
    context.lineTo(canvas.width, horizonY);
    context.closePath();
    context.fill();
    
    // Draw city lights on the horizon
    for (let x = 0; x < canvas.width; x += 15) {
        if (Math.random() > 0.7) {
            const y = horizonY - Math.random() * 10 - 2;
            const size = Math.random() * 2 + 1;
            const alpha = Math.random() * 0.5 + 0.3;
            
            context.fillStyle = Math.random() > 0.5 ? 
                `rgba(255, 0, 255, ${alpha})` : 
                `rgba(255, 0, 0, ${alpha})`;
            
            context.fillRect(x, y, size, size);
        }
    }
    
    // Draw F-Zero style ground with strong perspective gradient
    const groundGradient = context.createLinearGradient(0, horizonY, 0, canvas.height);
    groundGradient.addColorStop(0, groundColorTop);    // Purple at horizon
    groundGradient.addColorStop(0.3, '#100010');       // Dark purple transition
    groundGradient.addColorStop(0.7, '#050505');       // Almost black
    groundGradient.addColorStop(1, groundColorBottom); // Matte black at bottom
    
    context.fillStyle = groundGradient;
    context.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);
    
    // Calculate the grid perspective transformation
    const drawMode7Grid = () => {
        // Enhanced Mode 7 perspective with proper vanishing point and tapering
        const { perspective, roadTaper } = gridConfig;
        
        // Calculate left and right track boundaries with enhanced perspective for the underlying grid
        const leftEdgeBottom = vanishingPointX - trackWidth/2;
        const rightEdgeBottom = vanishingPointX + trackWidth/2;
        const leftEdgeHorizon = vanishingPointX - 5; // Very narrow at horizon (proper F-Zero vanishing)
        const rightEdgeHorizon = vanishingPointX + 5;
        
        // Draw track outline (underlying grid) with proper perspective curve
        context.beginPath();
        context.strokeStyle = 'rgba(255, 0, 255, 0.5)';
        context.lineWidth = 3;
        
        // Draw left edge with bezier curve for authentic Mode 7 perspective
        context.moveTo(leftEdgeHorizon + horizonShift, horizonY);
        context.bezierCurveTo(
            leftEdgeHorizon + horizonShift + (leftEdgeBottom - leftEdgeHorizon) * 0.2, horizonY + (canvas.height - horizonY) * 0.3,
            leftEdgeBottom + horizonShift * 2, canvas.height - (canvas.height - horizonY) * 0.3,
            leftEdgeBottom + horizonShift * 3, canvas.height
        );
        
        // Draw bottom edge
        context.lineTo(rightEdgeBottom + horizonShift * 3, canvas.height);
        
        // Draw right edge with bezier curve for authentic Mode 7 perspective
        context.bezierCurveTo(
            rightEdgeBottom + horizonShift * 2, canvas.height - (canvas.height - horizonY) * 0.3,
            rightEdgeHorizon + horizonShift + (rightEdgeBottom - rightEdgeHorizon) * 0.2, horizonY + (canvas.height - horizonY) * 0.3,
            rightEdgeHorizon + horizonShift, horizonY
        );
        
        context.closePath();
        context.stroke();
        
        // Add a subtle glow to the track edges
        const trackGlow = context.createLinearGradient(0, horizonY, 0, canvas.height);
        trackGlow.addColorStop(0, 'rgba(255, 0, 255, 0.3)');
        trackGlow.addColorStop(0.5, 'rgba(255, 0, 128, 0.15)');
        trackGlow.addColorStop(1, 'rgba(255, 0, 0, 0.07)');
        context.fillStyle = trackGlow;
        context.fill();
        
        // Draw horizontal grid lines with enhanced Mode 7 perspective
        context.lineWidth = 1;
        
        // Calculate the perspective y-coordinates for each row (horizontal lines)
        // Using a non-linear scaling to create the authentic Mode 7 feel
        const perspectiveYs = [];
        for (let row = 0; row <= cellRows; row++) {
            // F-Zero style exponential scaling - stronger at horizon
            const t = row / cellRows;
            const scaledT = Math.pow(t, perspective); // Higher perspective value for stronger effect
            
            // Apply y-perspective and add movement offset for parallax
            const y = horizonY + scaledT * (canvas.height - horizonY);
            perspectiveYs.push(y);
        }
        
        // Draw horizontal track lines with precise Mode 7 perspective
        for (let row = 0; row <= cellRows; row++) {
            const y = perspectiveYs[row];
            
            // Calculate perspective width at this row - using exponential scaling for proper tapering
            const perspectiveFactor = row / cellRows;
            const taperFactor = Math.pow(perspectiveFactor, perspective);
            const lineWidth = trackWidth * taperFactor;
            
            // Shift based on turning (F-Zero effect) - stronger near bottom
            const xShift = horizonShift * taperFactor * 3;
            
            // Speed-dependent shift for forward motion (parallax)
            const speedShift = (gridOffset.y % (cellSize * 2)) * taperFactor * 4;
            
            // Fade in from horizon with F-Zero style bright lines
            const alpha = 0.2 + taperFactor * 0.7; 
            context.strokeStyle = `rgba(${parseInt(gridLineColorH.slice(1,3), 16)}, ${parseInt(gridLineColorH.slice(3,5), 16)}, ${parseInt(gridLineColorH.slice(5,7), 16)}, ${alpha})`;
            
            context.beginPath();
            context.moveTo(vanishingPointX - lineWidth/2 + xShift, y + speedShift);
            context.lineTo(vanishingPointX + lineWidth/2 + xShift, y + speedShift);
            context.stroke();
        }
        
        // Draw vertical track lines with enhanced F-Zero perspective
        // More lines at higher speeds for dynamic feel
        const numVerticals = 15 + Math.floor(speedFactor * 15); // More vertical lines
        
        for (let col = -Math.floor(numVerticals/2); col <= Math.floor(numVerticals/2); col++) {
            // Create properly receding lines from bottom to horizon
            const leftRatio = col / Math.floor(numVerticals/2);
            
            // Calculate lateral movement offset based on turning (more pronounced)
            const turnOffset = horizonShift * 4;
            
            // Speed-dependent x-shift for side motion effect
            const xSpeedShift = (gridOffset.x % (cellSize * 2)) * leftRatio * 1.5;
            
            // Starting position at the bottom (wide)
            const bottomX = vanishingPointX + (leftRatio * trackWidth/2) + turnOffset + xSpeedShift;
            
            // The line converges to the vanishing point at the horizon (narrow)
            const horizonX = vanishingPointX + (leftRatio * 5) + (horizonShift * 0.2); // More dramatic convergence
            
            // Bright magenta with proper fading for F-Zero feel
            const alpha = 0.95 - Math.abs(leftRatio) * 0.3;
            context.strokeStyle = `rgba(${parseInt(gridLineColorV.slice(1,3), 16)}, ${parseInt(gridLineColorV.slice(3,5), 16)}, ${parseInt(gridLineColorV.slice(5,7), 16)}, ${alpha})`;
            
            // Draw curved vertical lines for proper Mode 7 ground plane perspective
            context.beginPath();
            
            // Use bezier curve for vertical lines to create proper Mode 7 ground plane effect
            context.moveTo(horizonX, horizonY);
            context.bezierCurveTo(
                horizonX + (bottomX - horizonX) * 0.3, horizonY + (canvas.height - horizonY) * 0.25,
                bottomX - (bottomX - horizonX) * 0.3, canvas.height - (canvas.height - horizonY) * 0.25,
                bottomX, canvas.height
            );
            
            context.stroke();
        }
    };
    
    // Draw Mode 7 grid base
    drawMode7Grid();
    
    // Draw the actual road surface on top of the grid with enhanced Mode 7 perspective
    const drawRoadSurface = () => {
        const { perspective, roadTaper } = gridConfig;
        
        // Calculate road edges with proper F-Zero perspective tapering
        const roadLeftEdgeBottom = vanishingPointX - roadWidth/2;
        const roadRightEdgeBottom = vanishingPointX + roadWidth/2;
        const roadLeftEdgeHorizon = vanishingPointX - 3; // Narrower convergence at horizon for F-Zero feel
        const roadRightEdgeHorizon = vanishingPointX + 3;
        
        // Fill road surface with bezier curves for authentic Mode 7 tapering
        context.beginPath();
        
        // Draw left edge with bezier curve
        context.moveTo(roadLeftEdgeHorizon + horizonShift, horizonY);
        context.bezierCurveTo(
            roadLeftEdgeHorizon + horizonShift + (roadLeftEdgeBottom - roadLeftEdgeHorizon) * 0.2, horizonY + (canvas.height - horizonY) * 0.3,
            roadLeftEdgeBottom + horizonShift * 2, canvas.height - (canvas.height - horizonY) * 0.3,
            roadLeftEdgeBottom + horizonShift * 3, canvas.height
        );
        
        // Draw bottom edge
        context.lineTo(roadRightEdgeBottom + horizonShift * 3, canvas.height);
        
        // Draw right edge with bezier curve
        context.bezierCurveTo(
            roadRightEdgeBottom + horizonShift * 2, canvas.height - (canvas.height - horizonY) * 0.3,
            roadRightEdgeHorizon + horizonShift + (roadRightEdgeBottom - roadRightEdgeHorizon) * 0.2, horizonY + (canvas.height - horizonY) * 0.3,
            roadRightEdgeHorizon + horizonShift, horizonY
        );
        
        context.closePath();
        
        // Enhanced road surface gradient with F-Zero style reflective surface
        const roadGradient = context.createLinearGradient(0, horizonY, 0, canvas.height);
        roadGradient.addColorStop(0, roadColorTop);
        roadGradient.addColorStop(0.3, '#1a0022');  // Mid-purple transition
        roadGradient.addColorStop(0.7, '#220033');  // Deep purple
        roadGradient.addColorStop(1, roadColorBottom);
        context.fillStyle = roadGradient;
        context.fill();
        
        // Add center line and edge lines with enhanced perspective
        const centerWidth = 6;  // Slightly wider for visibility
        const edgeWidth = 4;    // Slightly wider for visibility
        
        // Center line with segments (dashed line effect with enhanced perspective)
        const segmentCount = 24;  // More segments for smoother appearance
        for (let i = 0; i < segmentCount; i++) {
            // Skip every other segment for dashed effect
            if (i % 2 === 0) continue;
            
            // Calculate segment y positions with enhanced perspective
            const segmentStart = i / segmentCount;
            const segmentEnd = (i + 1) / segmentCount;
            
            // Apply F-Zero style perspective transformation to y positions
            const startY = horizonY + Math.pow(segmentStart, perspective) * (canvas.height - horizonY);
            const endY = horizonY + Math.pow(segmentEnd, perspective) * (canvas.height - horizonY);
            
            // Enhanced center line perspective width scaling using roadTaper
            const startTaper = Math.pow(segmentStart, roadTaper);
            const endTaper = Math.pow(segmentEnd, roadTaper);
            const startWidth = centerWidth * startTaper * 2;
            const endWidth = centerWidth * endTaper * 2;
            
            // Center line x-coordinates with enhanced turning adjustment
            const turnShiftStart = horizonShift * startTaper * 3;
            const turnShiftEnd = horizonShift * endTaper * 3;
            
            // Draw center line segment with enhanced perspective
            context.fillStyle = '#ffff00'; // Yellow center line
            context.beginPath();
            context.moveTo(vanishingPointX - startWidth/2 + turnShiftStart, startY);
            context.lineTo(vanishingPointX - endWidth/2 + turnShiftEnd, endY);
            context.lineTo(vanishingPointX + endWidth/2 + turnShiftEnd, endY);
            context.lineTo(vanishingPointX + startWidth/2 + turnShiftStart, startY);
            context.closePath();
            context.fill();
            
            // Add glow effect to center line for F-Zero feel
            const glowIntensity = 0.1 + 0.05 * Math.sin(gameState.car.glowPulse);
            context.strokeStyle = `rgba(255, 255, 0, ${glowIntensity})`;
            context.lineWidth = 1;
            context.stroke();
        }
        
        // Edge lines with enhanced bezier curve perspective (F-Zero style)
        context.lineWidth = edgeWidth;
        
        // Left edge with glow
        context.beginPath();
        context.moveTo(roadLeftEdgeHorizon + horizonShift, horizonY);
        context.bezierCurveTo(
            roadLeftEdgeHorizon + horizonShift + (roadLeftEdgeBottom - roadLeftEdgeHorizon) * 0.2, horizonY + (canvas.height - horizonY) * 0.3,
            roadLeftEdgeBottom + horizonShift * 2, canvas.height - (canvas.height - horizonY) * 0.3,
            roadLeftEdgeBottom + horizonShift * 3, canvas.height
        );
        context.strokeStyle = '#ff0000'; // Red edge lines
        context.stroke();
        
        // Add glow to left edge
        context.lineWidth = edgeWidth + 2;
        context.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        context.stroke();
        
        // Right edge with glow
        context.beginPath();
        context.moveTo(roadRightEdgeHorizon + horizonShift, horizonY);
        context.bezierCurveTo(
            roadRightEdgeHorizon + horizonShift + (roadRightEdgeBottom - roadRightEdgeHorizon) * 0.2, horizonY + (canvas.height - horizonY) * 0.3,
            roadRightEdgeBottom + horizonShift * 2, canvas.height - (canvas.height - horizonY) * 0.3,
            roadRightEdgeBottom + horizonShift * 3, canvas.height
        );
        context.lineWidth = edgeWidth;
        context.strokeStyle = '#ff0000';
        context.stroke();
        
        // Add glow to right edge
        context.lineWidth = edgeWidth + 2;
        context.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        context.stroke();
        
        // Checkpoint markings with proper perspective
        const currentSegment = getSegmentAtDistance(gameState.car.trackPosition);
        if (currentSegment && currentSegment.features.hasCheckpoint) {
            // Calculate proper position with perspective
            const checkpointDistance = 0.4; // 40% down the screen
            const checkpointY = horizonY + Math.pow(checkpointDistance, perspective) * (canvas.height - horizonY);
            const checkpointTaper = Math.pow(checkpointDistance, roadTaper);
            const checkpointWidth = roadWidth * checkpointTaper * 0.7; // Properly scaled width
            
            // Add checkpoint with proper turning adjustment
            const turnShift = horizonShift * checkpointTaper * 3;
            
            // F-Zero style checkpoint
            context.fillStyle = '#00ffff'; // Cyan for checkpoints
            context.fillRect(
                vanishingPointX - checkpointWidth/2 + turnShift,
                checkpointY - 5,
                checkpointWidth,
                10
            );
            
            // Add glow to checkpoint
            context.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            context.lineWidth = 2;
            context.strokeRect(
                vanishingPointX - checkpointWidth/2 + turnShift,
                checkpointY - 5,
                checkpointWidth,
                10
            );
        }
    };
    
    // Draw the road surface on top of grid
    drawRoadSurface();
    
    // Add F-Zero style speed lines effect at high speeds
    if (speedFactor > 0.5) {
        context.strokeStyle = `rgba(255, 255, 255, ${(speedFactor - 0.5) * 2 * 0.5})`;
        const numLines = Math.floor((speedFactor - 0.5) * 30); // More lines at high speed
        
        for (let i = 0; i < numLines; i++) {
            const lineLength = 25 + Math.random() * 40 * speedFactor;
            const x1 = Math.random() * canvas.width;
            const y1 = horizonY + Math.random() * (canvas.height - horizonY);
            
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x1 - lineLength, y1 + lineLength * 0.2);
            context.stroke();
        }
    }
    
    // Add pulsing track glow (F-Zero style)
    const glowIntensity = 0.1 + 0.05 * Math.sin(gameState.car.glowPulse * 2);
    const trackGlow = context.createLinearGradient(0, horizonY, 0, canvas.height);
    trackGlow.addColorStop(0, `rgba(255, 0, 255, ${glowIntensity * 0.7})`);
    trackGlow.addColorStop(0.7, `rgba(255, 0, 0, ${glowIntensity * 0.3})`);
    trackGlow.addColorStop(1, `rgba(255, 0, 0, 0)`);
    
    context.fillStyle = trackGlow;
    context.beginPath();
    context.moveTo(vanishingPointX - 10 + horizonShift, horizonY);
    context.lineTo(vanishingPointX - trackWidth * 0.4 + horizonShift * 2, canvas.height - 50);
    context.lineTo(vanishingPointX + trackWidth * 0.4 + horizonShift * 2, canvas.height - 50);
    context.lineTo(vanishingPointX + 10 + horizonShift, horizonY);
    context.closePath();
    context.fill();
    
    // Draw scan lines for CRT effect
    context.fillStyle = COLORS.SCANLINE_COLOR;
    for (let y = 0; y < canvas.height; y += 3) {
        context.fillRect(0, y, canvas.width, 1);
    }
}

// Render the player car and AI vehicles
function renderVehicles() {
    // Render player car
    spriteRenderer.renderSprite(
        SPRITES[gameState.car.type],
        gameState.car.position.x,
        gameState.car.position.y,
        Math.round(gameState.car.shearLevel)
    );
    
    // Calculate glow intensity for neon effect
    const glowIntensity = 0.7 + 0.3 * Math.sin(gameState.car.glowPulse);
    
    // Add a subtle glow under the player car
    context.fillStyle = `rgba(0, 242, 255, ${glowIntensity * 0.15})`;
    context.beginPath();
    context.ellipse(
        gameState.car.position.x, 
        gameState.car.position.y + 8, 
        16, 
        8, 
        0, 
        0, 
        Math.PI * 2
    );
    context.fill();
    
    // Render AI vehicles at their appropriate positions
    for (let ai of aiPilots) {
        // Calculate distance ahead/behind player
        const relativePosition = (ai.trackPosition - gameState.car.trackPosition + TRACK_LENGTH) % TRACK_LENGTH;
        
        // Only render vehicles that are in view range (ahead of player or slightly behind)
        // 1/3 of track ahead and 1/10 behind
        if (relativePosition < TRACK_LENGTH/3 || relativePosition > TRACK_LENGTH * 0.9) {
            // Calculate screen position based on relative position
            // Convert track position to screen position using perspective
            let screenY, screenX;
            
            if (relativePosition < TRACK_LENGTH/3) {
                // Ahead of player (further = higher on screen, closer to horizon)
                const distanceFactor = 1 - (relativePosition / (TRACK_LENGTH/3));
                // Position higher on screen as distance increases
                screenY = canvas.height - 50 - (distanceFactor * (canvas.height - 50 - gridConfig.horizonY));
                
                // Lateral position
                const lateralWidth = gridConfig.roadWidth * (1 - distanceFactor * 0.9); // Narrower with distance
                screenX = gridConfig.vanishingPointX + (ai.lateralPosition * lateralWidth);
                
                // Add turning offset for more dynamic visuals
                screenX += gameState.car.shearLevel * 10 * (1 - distanceFactor);
            } else {
                // Behind player (visible in rear-view)
                screenY = canvas.height - 20; // Bottom of screen
                
                // Lateral position is wider (they're behind, so perspective is less extreme)
                screenX = gridConfig.vanishingPointX + (ai.lateralPosition * gridConfig.roadWidth * 0.8);
            }
            
            // Scale AI vehicles based on distance for perspective (smaller when far away)
            const scaleFactor = relativePosition < TRACK_LENGTH/3 
                ? 1 - (relativePosition / (TRACK_LENGTH/3)) * 0.6 // Ahead (smaller with distance)
                : 0.7; // Behind (slightly smaller)
            
            // Calculate shear level for banking effect (simplified)
            let aiShear = 0;
            // If we have track segment data, use that for banking
            const aiSegment = getSegmentAtDistance(ai.trackPosition);
            if (aiSegment) {
                // Bank based on track curvature, range -4 to 4
                aiShear = Math.max(-4, Math.min(4, aiSegment.curvature * 10));
            }
            
            // Render AI vehicle with appropriate perspective scaling
            spriteRenderer.renderSprite(
                SPRITES[ai.pilot.sprite],
                screenX,
                screenY,
                Math.round(aiShear)
            );
            
            // Add glow under AI vehicles
            context.fillStyle = `rgba(${parseInt(ai.pilot.color.slice(1,3), 16)}, ${parseInt(ai.pilot.color.slice(3,5), 16)}, ${parseInt(ai.pilot.color.slice(5,7), 16)}, ${glowIntensity * 0.15})`;
            context.beginPath();
            context.ellipse(
                screenX, 
                screenY + 8, 
                16 * scaleFactor, 
                8 * scaleFactor, 
                0, 
                0, 
                Math.PI * 2
            );
            context.fill();
        }
    }
}

// Render the racing UI overlay with F-Zero inspired high-visibility elements
function renderRacingUI() {
    // Set up common style for UI elements
    context.font = 'bold 20px monospace'; // Larger font
    context.textAlign = 'left';
    context.lineWidth = 2;
    
    // Add a pulsing effect for UI elements based on car glow pulse
    const pulseIntensity = 0.2 + 0.1 * Math.sin(gameState.car.glowPulse * 3);
    
    // Position indicator - High-Visibility CRT style overlay (as required)
    const positionText = `POSITION ${gameState.car.position}/7`;
    
    // Create a more prominent position display with F-Zero styling
    // Background with gradient for F-Zero feel
    const posGradient = context.createLinearGradient(10, 10, 10, 50);
    posGradient.addColorStop(0, 'rgba(40, 0, 60, 0.85)');
    posGradient.addColorStop(1, 'rgba(20, 0, 40, 0.85)');
    
    context.fillStyle = posGradient;
    context.fillRect(10, 10, 200, 40); // Taller box
    
    // Double stroke for F-Zero neon effect
    context.lineWidth = 3;
    context.strokeStyle = '#ff00ff';
    context.strokeRect(10, 10, 200, 40);
    
    context.lineWidth = 1;
    context.strokeStyle = `rgba(255, 0, 255, ${0.5 + pulseIntensity})`;
    context.strokeRect(8, 8, 204, 44);
    
    // Text with high-visibility shadow
    context.fillStyle = '#ffffff'; // White text
    context.shadowColor = '#ff00ff'; // Magenta glow
    context.shadowBlur = 8 + (pulseIntensity * 10);
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.fillText(positionText, 25, 35);
    context.shadowBlur = 0;
    
    // Lap indicator - High-Visibility CRT style overlay (as required)
    const lapText = `LAP ${gameState.car.lap}/3`;
    
    // Create a more prominent lap display with F-Zero styling
    // Background with gradient for F-Zero feel
    const lapGradient = context.createLinearGradient(canvas.width - 150, 10, canvas.width - 150, 50);
    lapGradient.addColorStop(0, 'rgba(40, 0, 60, 0.85)');
    lapGradient.addColorStop(1, 'rgba(20, 0, 40, 0.85)');
    
    context.fillStyle = lapGradient;
    context.fillRect(canvas.width - 150, 10, 140, 40); // Taller box
    
    // Double stroke for F-Zero neon effect
    context.lineWidth = 3;
    context.strokeStyle = '#00ffff';
    context.strokeRect(canvas.width - 150, 10, 140, 40);
    
    context.lineWidth = 1;
    context.strokeStyle = `rgba(0, 255, 255, ${0.5 + pulseIntensity})`;
    context.strokeRect(canvas.width - 152, 8, 144, 44);
    
    // Text with high-visibility shadow
    context.fillStyle = '#ffffff'; // White text
    context.shadowColor = '#00ffff'; // Cyan glow
    context.shadowBlur = 8 + (pulseIntensity * 10);
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.fillText(lapText, canvas.width - 135, 35);
    context.shadowBlur = 0;
    
    // Race time display
    const minutes = Math.floor(gameState.track.raceTime / 60000);
    const seconds = Math.floor((gameState.track.raceTime % 60000) / 1000);
    const milliseconds = Math.floor((gameState.track.raceTime % 1000) / 10);
    
    const timeText = `TIME: ${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    
    // Time display with F-Zero styling
    const timeGradient = context.createLinearGradient(10, 60, 10, 100);
    timeGradient.addColorStop(0, 'rgba(40, 0, 60, 0.85)');
    timeGradient.addColorStop(1, 'rgba(20, 0, 40, 0.85)');
    
    context.fillStyle = timeGradient;
    context.fillRect(10, 60, 210, 40);
    
    // Double stroke for F-Zero neon effect
    context.lineWidth = 3;
    context.strokeStyle = '#ff00ff';
    context.strokeRect(10, 60, 210, 40);
    
    context.lineWidth = 1;
    context.strokeStyle = `rgba(255, 0, 255, ${0.3 + pulseIntensity})`;
    context.strokeRect(8, 58, 214, 44);
    
    // Text with subtle glow
    context.fillStyle = '#ffccff';
    context.shadowColor = '#ff00ff';
    context.shadowBlur = 3 + (pulseIntensity * 5);
    context.fillText(timeText, 20, 85);
    context.shadowBlur = 0;
    
    // Show mini-map / track position indicator (small oval at top center)
    const miniMapWidth = 180; // Larger for better visibility
    const miniMapHeight = 70;
    const miniMapX = (canvas.width - miniMapWidth) / 2;
    const miniMapY = 10;
    
    // Draw mini-map background with F-Zero styling
    const mapGradient = context.createLinearGradient(miniMapX, miniMapY, miniMapX, miniMapY + miniMapHeight);
    mapGradient.addColorStop(0, 'rgba(0, 30, 40, 0.85)');
    mapGradient.addColorStop(1, 'rgba(0, 15, 25, 0.85)');
    
    context.fillStyle = mapGradient;
    context.fillRect(miniMapX, miniMapY, miniMapWidth, miniMapHeight);
    
    // Double stroke for F-Zero neon effect
    context.lineWidth = 2;
    context.strokeStyle = '#00ff66';
    context.strokeRect(miniMapX, miniMapY, miniMapWidth, miniMapHeight);
    
    context.lineWidth = 1;
    context.strokeStyle = `rgba(0, 255, 102, ${0.3 + pulseIntensity})`;
    context.strokeRect(miniMapX - 2, miniMapY - 2, miniMapWidth + 4, miniMapHeight + 4);
    
    // Draw track outline with pulsing effect
    context.beginPath();
    context.ellipse(
        miniMapX + miniMapWidth/2,
        miniMapY + miniMapHeight/2,
        miniMapWidth/2 - 15,
        miniMapHeight/2 - 15,
        0,
        0,
        Math.PI * 2
    );
    context.lineWidth = 2;
    context.strokeStyle = `rgba(0, 255, 102, ${0.7 + pulseIntensity * 0.3})`;
    context.stroke();
    
    // Draw checkpoints on minimap
    for (let i = 0; i < CHECKPOINT_COUNT; i++) {
        const checkpointAngle = (i / CHECKPOINT_COUNT) * Math.PI * 2;
        const checkX = miniMapX + miniMapWidth/2 + Math.cos(checkpointAngle) * (miniMapWidth/2 - 15);
        const checkY = miniMapY + miniMapHeight/2 + Math.sin(checkpointAngle) * (miniMapHeight/2 - 15);
        
        // Highlight current/next checkpoint
        const isNext = (i === (gameState.car.lastCheckpoint + 1) % CHECKPOINT_COUNT);
        const isCurrent = (i === gameState.car.lastCheckpoint);
        
        if (isNext) {
            // Next checkpoint - pulsing cyan
            context.fillStyle = `rgba(0, 255, 255, ${0.5 + pulseIntensity})`;
            context.beginPath();
            context.arc(checkX, checkY, 3, 0, Math.PI * 2);
            context.fill();
        } else if (isCurrent) {
            // Current checkpoint - solid cyan
            context.fillStyle = '#00ffff';
            context.beginPath();
            context.arc(checkX, checkY, 3, 0, Math.PI * 2);
            context.fill();
        } else {
            // Normal checkpoint - small dot
            context.fillStyle = 'rgba(255, 255, 255, 0.4)';
            context.beginPath();
            context.arc(checkX, checkY, 1.5, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    // Draw player position on mini-map with glow
    const playerAngle = (gameState.car.trackPosition / TRACK_LENGTH) * Math.PI * 2;
    const playerMiniX = miniMapX + miniMapWidth/2 + Math.cos(playerAngle) * (miniMapWidth/2 - 15);
    const playerMiniY = miniMapY + miniMapHeight/2 + Math.sin(playerAngle) * (miniMapHeight/2 - 15);
    
    // Glow for player position
    context.fillStyle = 'rgba(255, 0, 0, 0.3)';
    context.beginPath();
    context.arc(playerMiniX, playerMiniY, 6, 0, Math.PI * 2);
    context.fill();
    
    // Player position dot
    context.fillStyle = '#ff0000';
    context.beginPath();
    context.arc(playerMiniX, playerMiniY, 4, 0, Math.PI * 2);
    context.fill();
    
    // Draw AI positions on mini-map with proper colors
    for (let ai of aiPilots) {
        const aiAngle = (ai.trackPosition / TRACK_LENGTH) * Math.PI * 2;
        const aiMiniX = miniMapX + miniMapWidth/2 + Math.cos(aiAngle) * (miniMapWidth/2 - 15);
        const aiMiniY = miniMapY + miniMapHeight/2 + Math.sin(aiAngle) * (miniMapHeight/2 - 15);
        
        context.fillStyle = ai.pilot.color;
        context.beginPath();
        context.arc(aiMiniX, aiMiniY, 3, 0, Math.PI * 2);
        context.fill();
    }
}

// Render the game state to the canvas
function render() {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render the parallax grid background with road
    renderGrid();
    
    // Render vehicles (player and AI)
    renderVehicles();
    
    // Render the racing UI overlay
    renderRacingUI();
}

// Start the game engine
function startGame() {
    if (gameState.isRunning) return;
    
    // Generate the track
    generateTrack();
    
    gameState.isRunning = true;
    gameState.track.raceStarted = true;
    statusLed.classList.remove('standby');
    statusLed.classList.add('active');
    statusText.textContent = 'ENGINE: ACTIVE';
    startButton.textContent = 'Engine Running';
    
    // Initialize audio
    audio.start();
    audio.speak("Velocity-16 Engine Online. Welcome to Cyber Napa. Race beginning in 3... 2... 1... Go!");
    
    // Start the game loop
    gameLoop();
}

// Main engine loop
function gameLoop() {
    try {
        updatePhysics();
        render();
    } catch (error) {
        console.error("Error in game loop:", error);
        // Don't let the game crash - keep trying to render in case of errors
    }
    
    // Ensure we always request the next frame
    requestAnimationFrame(gameLoop);
}

// Initialize event listeners
startButton.addEventListener('click', startGame);

// Audio initialization on any click
window.addEventListener('click', () => {
    // This ensures audio context is initialized on first interaction
    // as browsers require user gesture to start audio context
    audio.start();
});

// Load handler to ensure canvas is properly initialized and prevent black screen
window.addEventListener('load', () => {
    // Generate track on load
    generateTrack();
    
    // Draw initial state even before game starts to prevent black screen
    context.clearRect(0, 0, canvas.width, canvas.height);
    renderGrid();
    
    // Add a pulsing "Start Engine" message if game not running yet
    if (!gameState.isRunning) {
        const pulseRate = Date.now() % 1000 / 1000;
        context.fillStyle = `rgba(255, 0, 0, ${0.5 + pulseRate * 0.5})`;
        context.font = '16px monospace';
        context.textAlign = 'center';
        context.fillText('PRESS START ENGINE TO INITIALIZE', canvas.width / 2, canvas.height / 2);
    }
    
    console.log("Velocity-16 initialized successfully");
});

// Automatically start after 1 second to prevent black screens in demo mode
setTimeout(() => {
    if (!gameState.isRunning) {
        startGame();
    }
}, 1000);

// Optional: Expose gameState for debugging
window.gameState = gameState;

// Emergency fallback render function in case main implementation fails
function emergencyRender() {
    try {
        if (!gameState.isRunning) {
            console.log('Emergency render - game not running yet');
            context.fillStyle = '#111';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw a simple road
            context.fillStyle = '#330033';
            context.beginPath();
            context.moveTo(canvas.width/2 - 50, 0);
            context.lineTo(canvas.width/2 - 100, canvas.height);
            context.lineTo(canvas.width/2 + 100, canvas.height);
            context.lineTo(canvas.width/2 + 50, 0);
            context.fill();
            
            // Draw UI
            context.fillStyle = '#ff00ff';
            context.font = 'bold 12px monospace';
            context.fillText('POSITION: 1 / 7', 10, 20);
            context.fillText('LAP: 1 / 3', canvas.width - 80, 20);
            
            // Draw player car
            context.fillStyle = '#ff0000';
            context.fillRect(canvas.width/2 - 10, canvas.height - 40, 20, 15);
            
            // Draw AI cars
            for (let i = 0; i < 6; i++) {
                const carColors = ['#ffff00', '#00f2ff', '#00ff66', '#9900ff', '#ff7700', '#ffcc00'];
                const distanceBack = (i + 1) * 30;
                context.fillStyle = carColors[i];
                context.fillRect(
                    canvas.width/2 - 8 + (i % 3) * 8 - 8, 
                    canvas.height - 40 - distanceBack, 
                    16, 12
                );
            }
            
            console.log('Emergency render complete');
        }
    } catch (e) {
        console.error('Even emergency render failed:', e);
    }
}

// Add a failsafe timeout to start game
setTimeout(() => {
    console.log('Failsafe timeout activated');
    try {
        if (!gameState.isRunning) {
            console.log('Trying emergency start...');
            startGame();
            emergencyRender();
        }
    } catch (e) {
        console.error('Emergency start failed:', e);
        emergencyRender();
    }
}, 2000);