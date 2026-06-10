# VELOCITY-16

Velocity-16 is an original browser-based futuristic racer inspired by the speed, readability, and attitude of classic Mode 7 racing games. The project is not a clone: the goal is to build its own ships, pilots, tracks, audio identity, UI language, and 2026 HD art direction while preserving the immediate thrill of high-speed hover racing.

The current build is a recovered and stabilized gameplay baseline: a solo feel lab track, tuned hover handling, readable HD Mode 7 camera, boost pads, hazard fields, recharge strips, energy damage, crash recovery, audio feedback, minimap, and feature flags for experimental race systems.

## Current State

The project is currently in the **Stabilize Feel** milestone.

- Stable title-to-drive flow
- Dedicated mechanics test track: `FEEL LAB 02`
- HD Mode 7 canvas renderer with neon track texture and projected guide rails
- Smooth hover physics with acceleration, braking, drift, wall bounce, boost, and low-speed steering assist
- Clean HUD with lap timer, speed, energy, best lap, and minimap
- Boost pads, hazard zones, recovery strips, and on-screen zone feedback
- Energy damage from wall impacts and hazard fields
- Machine explosion at zero energy
- Automatic respawn near the last safe non-hazard track position
- Retro-future synth audio for engine hum, boost, wall hits, laps, race start, and crash
- Optional F3 debug overlay for tuning speed, energy, zones, checkpoints, camera values, and cooldowns
- Experimental AI, countdown, podium, trails, starfield, and speed-line effects preserved behind flags

## Controls

- `W` or `ArrowUp`: accelerate
- `S` or `ArrowDown`: brake
- `A` or `ArrowLeft`: steer left
- `D` or `ArrowRight`: steer right
- `Space`: boost
- `F3`: toggle the dev tuning overlay
- Say `boost` if voice boost is enabled and supported by the browser

## Dev Setup

Install dependencies:

```powershell
npm install
```

Run the local dev server:

```powershell
npm run dev
```

Build check:

```powershell
npm run build
```

## Feature Flags

The default build keeps the main loop clean and playable. Experimental systems can be enabled with query params:

- `?track=test` or `?track=official`
- `?ai=1`
- `?countdown=1`
- `?podium=1`
- `?effects=1`
- `?voice=0`
- `?debug=1`

Example:

```text
http://127.0.0.1:5174/?effects=1&debug=1
```

## Roadmap

### Phase 0: Stabilization

This phase is now mostly complete. The game has a reliable playable baseline, clean feature flags, strong test-track handling, readable camera framing, energy damage, crash recovery, and passing builds.

### Phase 1: Feel Lab

Current focus: continue tuning the feel lab until every core mechanic is readable, fair, and satisfying.

- Tune boost pads, hazards, recovery strips, braking, drift recovery, wall impacts, and respawn values
- Use the debug overlay for faster handling and zone iteration
- Refine damage and recovery rules for walls, hazards, and future racer contact
- Improve high-speed visual effects without cluttering the screen
- Add checkpoint direction feedback and wrong-way detection

### Phase 2: First Official Track

After the mechanics feel locked, design the first real course with its own identity.

- Track layout and flow
- Surface art, lane language, wall glow, signage, boost pads, hazards, and background staging
- Mood boards and image prompts for the first official track direction

### Phase 3: Ships, Pilots, And Selection

Create the first small roster after the default player ship feels complete.

- Four original ships
- Four original pilots
- Portraits, machine sprites/models, stats, and selection flow

### Phase 4: Race Layer

Re-enable race systems once driving is solid.

- Countdown
- AI opponents
- Race finish logic
- Results/podium
- Announcer-style audio

### Phase 5: HD Wow Layer

Add richer presentation after the core game is dependable.

- Particles, trails, plasma wind, boost lightning, heat shimmer, animated skies, dynamic music layers, and cinematic race feedback
- Consider WebGL or Three.js only if the canvas HD Mode 7 approach reaches a real ceiling

## Design Direction

Velocity-16 should feel like a 2026 HD reinterpretation of the futuristic hover-racer fantasy: vibrant, fast, readable, and stylish. The current visual target is **HD Mode 7**: chunky pixel precision, neon contrast, clean track language, and modern effects used only when they strengthen speed and control.

Built by Jackson and Codex.
