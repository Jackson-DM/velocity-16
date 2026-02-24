# VELOCITY-16 — Project Overview

> "Build a futuristic racer that captures the F-Zero speed and style, using modern AI to enhance the world."

---

## What We're Building

A 16-bit SNES-style futuristic racing game inspired by **F-Zero** (1990), running entirely in the browser with zero dependencies. The game uses the SNES **Mode 7** technique — per-scanline affine transformations that create a rotating, perspective-correct floor plane — combined with modern JavaScript and HTML5 Canvas.

**No engines. No frameworks. No bundler. Open `index.html`, see the track.**

---

## Core Experience Goals

| Pillar | Description |
|---|---|
| **Speed** | The "oh damn" feeling when you hit full throttle. Exponential drag curve, not linear. |
| **Weight** | Hover cars don't drive — they *drift*. High-speed lateral friction, float bounce on jumps. |
| **Vibe** | Vibrant neon palette. Deep-space sky. Neon cyan horizon. Pure 16-bit aesthetic. |
| **Polish** | 60fps locked. Zero-latency input. Pixel-perfect 320×224 rendering. Every pixel intentional. |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| **Runtime** | Vanilla JS (ES2022 Modules) | Zero overhead — Mode 7 needs direct pixel access |
| **Renderer** | HTML5 Canvas 2D + `ImageData` | Per-scanline pixel writes, single `putImageData` flush per frame |
| **HUD** | Separate overlay `<canvas>` | Draws at CSS display resolution → crisp text, never blurry from upscaling |
| **Loop** | `requestAnimationFrame` | Hardware-locked 60fps, no abstraction jitter |
| **Physics** | Hand-rolled modules | Hover feel requires precise tuning — no library matches it |
| **Audio** | Web Audio API (Claw sub-agent) | Native FM synthesis, no library |
| **Dev Server** | `python -m http.server 8080` | One command, zero config |

---

## Architecture

```
Velocity-16/
├── index.html                  ← Entry point. game + hud canvas pair, ES module script.
├── src/
│   ├── main.js                 ← RAF game loop: input → physics → lap → audio → render → HUD
│   ├── engine/
│   │   ├── mode7.js            ← THE CORE. Lode-style floor raycasting. Pure math.
│   │   ├── renderer.js         ← Canvas context owner. ImageData buffer. putImageData.
│   │   ├── camera.js           ← Camera state + updateCamera() spring-follow + WOW effects
│   │   └── input.js            ← Keydown/keyup Set → getInput() — zero-latency polling
│   ├── physics/
│   │   ├── hover.js            ← F-Zero Brutal: thrust/drag/drift. Exports TOP_SPEED=600.
│   │   ├── collision.js        ← Bitmask track boundary checks (Phase 4 stub)
│   │   └── world.js            ← World state: x, y, vx, vy, heading, speed, drift
│   ├── graphics/
│   │   ├── palette.js          ← 16-color neon ABGR palette
│   │   ├── sprites.js          ← buildCarSprite() 24×16px, 9 tilt frames + blitCarSprite()
│   │   └── hud.js              ← drawHUD() on overlay canvas at display resolution
│   ├── audio/
│   │   ├── synth.js            ← Web Audio FM engine (Claw sub-agent — Phase 4)
│   │   └── audio.js            ← Hook interface: start/stop/update/onCheckpoint/onLap/onBoost
│   ├── track/
│   │   ├── track-data.js       ← MUTE CITY I: 8-checkpoint oval, pre-computed gate segments
│   │   └── lap.js              ← Lap state machine: segment crossing, timer, events
│   └── utils/
│       ├── math.js             ← lerp, clamp, wrapAngle, fastFloor
│       └── perf.js             ← Frame timer — warns if frame > 16.67ms
├── assets/
│   └── textures/               ← Track surface PNGs (power-of-2, Phase 4)
├── docs/
│   ├── PROJECT_OVERVIEW.md     ← This file
│   └── sessions/               ← Per-session engineering logs
└── tasks/
    └── todo.md                 ← Live task roadmap
```

---

## Mode 7 Math (The Heart)

The floor renderer casts rays per scanline. For each screen row `y` below the horizon:

```
rowZ    = camHeight / (y - horizon)         // perspective depth
leftRay = dir - plane                        // world dir at screen-left edge
rightRay= dir + plane                        // world dir at screen-right edge
step    = (rightRay - leftRay) * rowZ / W   // world step per pixel

// Walk across pixels, sample texture (power-of-2 bitwise wrap)
tx = Math.floor(floorX * texScale) & (texW - 1)
ty = Math.floor(floorY * texScale) & (texH - 1)
```

Key parameters: `camHeight=1000`, `BASE_HORIZON=90`, `texScale=4`.

---

## Physics Constants (hover.js)

| Constant | Value | Notes |
|---|---|---|
| `TOP_SPEED` | 600 WU/s | Target equilibrium speed |
| `THRUST` | 720 | = TOP_SPEED × DRAG_FWD |
| `DRAG_FWD` | 1.2 | 0.58s to 50% speed — punchy |
| `GRIP` | 3.5 | Lateral decay — ~30% drift ratio |
| `TURN_BASE` | 1.4 rad/s | Speed-sensitive; barely turns when slow |
| `BRAKE_DRAG` | 3.07 | Full stop in ~1.57s |

Drift source: heading turns **before** velocity is reprojected onto the new heading. That one-frame mismatch between the old velocity decomposition and the new heading is the entire source of natural drift.

---

## Phase Roadmap

### Phase 1: Bootstrap ✅ COMPLETE
- Canvas-Native tech stack, Mode 7 scanline floor renderer
- Procedural neon checkerboard, zero-latency input, 60fps RAF loop
- *Milestone: "Hello, Track"*

### Phase 2: Racer Dynamics ✅ COMPLETE
- F-Zero Brutal hover physics (12-step drift algorithm)
- 24×16 pixel-art car sprite, 9 horizontal-shear tilt frames
- Spring-follow camera (POS_SPRING=8, ANG_SPRING=4)
- WOW #1 horizon roll, WOW #2 FOV breathing, WOW #3 speed lines

### Phase 3: Track + Lap + HUD ✅ COMPLETE
- MUTE CITY I oval: 8 checkpoints, pre-computed gate segments
- Lap logic: strict 2D segment-crossing, direction guard, lap timer
- HUD overlay canvas at full display resolution (crisp text, no upscale blur)
- Audio hook interface for Claw sub-agent; user-gesture gate for AudioContext

### Phase 4: The Full Game Layer 🚧 NEXT
- Track surface texture (replace checkerboard with painted circuit)
- Energy/shield bar — F-Zero health depleted by wall contact
- Collision bitmask — track boundaries → wall bounce + energy drain
- Voice-command Turbo boost — Web Speech API "BOOST"
- Title screen — VELOCITY-16 splash, PRESS START

---

## The Nintendo Standard

> "Every change must feel finished. If a pixel is out of place or the acceleration curve feels floaty, it's not done."

Non-negotiables before any milestone is marked complete:
1. No frames over 16.67ms (`perf.js` stays silent)
2. Input response is same-frame
3. Canvas renders at native 320×224, CSS-scaled with `image-rendering: pixelated`
4. Color palette constrained to neon SNES-era values
