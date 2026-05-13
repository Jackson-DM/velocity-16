# VELOCITY-16 Project Overview

## Vision

Velocity-16 is an original futuristic hover-racing game built in the browser. It is heavily inspired by the speed and clarity of classic Mode 7 racers, but the creative direction is ours: original ships, pilots, tracks, audio, UI, lore, and visual identity.

The target is a vibrant 2026 HD Mode 7 racer: fast, readable, stylish, and mechanically satisfying before any larger race features are allowed to take over.

## Current Source Of Truth

The project has been recovered from an unstable state and is now playable again. We are keeping the vanilla JavaScript and canvas-first architecture. The current build is a feel lab, not a finished race game.

Working baseline:

- Title screen into solo driving
- `FEEL LAB 02` mechanics test track
- Stable HD Mode 7 renderer
- Tuned hover movement and camera framing
- Track guide rails and minimap for readability
- Lap timing, best lap, and finish panel
- Energy damage from wall impacts
- Machine explosion and automatic respawn
- Retro-future synth audio foundation
- Feature-gated AI, countdown, podium, starfield, trails, and experimental speed effects

## Architecture

```text
Velocity-16/
  index.html
  src/
    main.js                  Main game loop and state flow
    config/                  Game flags and defaults
    engine/                  Renderer, Mode 7 projection, camera, input
    physics/                 Hover movement, world state, collision
    graphics/                HUD, sprites, track texture, guide rails, overlays
    track/                   Track data and lap/checkpoint logic
    audio/                   Web Audio engine and event sounds
    ai/                      Experimental AI racers
  docs/
    PROJECT_OVERVIEW.md      Current project plan
  tasks/
    todo.md                  Older task notes
```

## Implementation Phases

### Phase 0: Stabilization

Mostly complete.

- Preserve the existing Mode 7 foundation
- Restore reliable title-to-drive flow
- Gate experimental systems
- Fix HUD readability
- Start timers only when driving begins
- Unify keyboard and voice boost behavior
- Use pre-impact collision velocity for damage
- Add zero-energy crash and respawn behavior

### Phase 1: Feel Lab

In progress.

- Keep tuning acceleration, braking, drift, boost, wall bounce, and camera feel
- Add boost pads and hazards to test mechanics
- Refine energy damage and respawn values
- Add optional dev tooling for faster handling iteration
- Replace cluttered speed-line effects with better high-speed effects later

### Phase 2: First Official Track

Upcoming.

- Design the first real course after the feel lab is stable
- Establish track identity through surface art, signage, wall glow, background staging, boost pads, and hazards
- Use image prompts and mood boards for visual direction

### Phase 3: Ships, Pilots, And Selection

Upcoming.

- Create the first four original ships and pilots
- Generate concept art, then convert approved designs into in-game assets
- Add racer selection after the default player ship is polished

### Phase 4: Race Layer

Upcoming.

- Re-enable and harden countdown, AI opponents, race finish, results/podium, and announcer audio
- Test AI on the feel lab before using it on official tracks

### Phase 5: HD Wow Layer

Upcoming.

- Add plasma wind, boost lightning, heat shimmer, trails, richer particles, animated skies, post effects, dynamic music layers, and cinematic race feedback
- Consider WebGL or Three.js only if the canvas HD Mode 7 renderer reaches a real ceiling

## Current Development Rule

Do not let spectacle outrun feel. The game should stay playable, readable, and fun at every checkpoint.
