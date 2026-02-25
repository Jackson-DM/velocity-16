# VELOCITY-16: Character Selection Logic Blueprint
(Drafted: 2026-02-24)

## 1. UI Structure (`src/ui/SelectionScreen.js`)
- **Background:** Scrolling "Mode 7" starfield or a static neon grid.
- **Display:** 4 distinct "slots" for the racers.
- **The "Focus" State:** The selected racer should "hover" (float up/down) in the center of the screen while in transition.
- **Racer Meta:** Display the name, 16-bit bio, and the "Claw" Stats (Speed, Acceleration, Traction).

## 2. Selection Data Contract
```javascript
export const RACER_STATS = {
    'APEX_RED': {
        name: 'Apex-Red',
        pilot: 'Jackson (AI-Assisted)',
        thrust: 720,
        topSpeed: 600,
        handling: 0.85, // 0-1 (1 is perfect grip)
        weight: 1.0,
        energy: 100,
        primaryColor: '#00FFFF',
        description: 'The prototypical AI-core racer. Balanced for high-level tactical racing.'
    },
    'JUGGERNAUT_7': {
        name: 'Juggernaut-7',
        pilot: 'Unit-X',
        thrust: 550,
        topSpeed: 650, // Highest top speed
        handling: 0.55, // Drifts wildly
        weight: 1.8,   // Harder to push, bigger collision impact
        energy: 150,   // High tankiness
        primaryColor: '#FF4500',
        description: 'A brutalist slabs of industrial yellow metal. Unstoppable once it hits top gear.'
    },
    'VAPOR_SKIMMER': {
        name: 'Vapor-Skimmer',
        pilot: 'Lyra-Neon',
        thrust: 900,   // Insane acceleration
        topSpeed: 520, // Lower top end
        handling: 0.95, // Near-perfect traction
        weight: 0.6,   // Gets pushed around easily
        energy: 80,    // Fragile hull
        primaryColor: '#32CD32',
        description: 'The narrowest profile in the league. Slices through corners with zero resistance.'
    },
    'MANTIS_RAY': {
        name: 'Mantis-Ray',
        pilot: 'Unknown',
        thrust: 700,
        topSpeed: 580,
        handling: 0.80,
        weight: 1.0,
        energy: 110,
        primaryColor: '#FF00FF', // Magenta Static
        special: 'ZERO_DRAG_DRIFT', // Custom physics flag for the alien tech
        description: 'An organic shimmer of magenta static. Its wings swim through the air at high velocities.'
    }
}
```

## 3. Implementation Steps for Claude Code (Home)
- [ ] Implement `src/ui/SelectMenu.js` using `CanvasRenderingContext2D`
- [ ] Add sound effects for "Selection Cycle" (low-blip) and "Confirm" (high-synth chime)
- [ ] Connect selection to `physics.js` state so the chosen stats apply to player 1.
