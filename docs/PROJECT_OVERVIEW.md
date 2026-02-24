# VELOCITY-16 — Project Overview

> "Build a futuristic racer that captures the F-Zero speed and style, using modern AI to enhance the world."

---

## What We're Building

A 16-bit SNES-style futuristic racing game inspired by **F-Zero** (1990), running entirely in the browser with zero dependencies. The game uses the SNES **Mode 7** technique — per-scanline affine transformations that create a rotating, perspective-correct floor plane — combined with modern AI-driven sound and lore.

**No engines. No frameworks. No bundler. Open `index.html`, see the track.**

---

## Core Experience Goals

| Pillar | Description |
|---|---|
| **Speed** | The "oh damn" feeling when you hit full throttle. Exponential drag curve. |
| **Weight** | Hover cars don't drive — they *drift*. High-speed lateral friction. |
| **Vibe** | **TRON-Hybrid Aesthetic.** Dark asphalt foundations with pulsing neon grids. |
| **Voice** | **AI-Enhanced.** Real-time ElevenLabs announcer + Web Speech command triggers. |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| **Runtime** | Vanilla JS (ES2022 Modules) | Zero overhead — direct pixel access |
| **Renderer** | HTML5 Canvas 2D + `ImageData` | Per-scanline pixel writes |
| **Audio** | Web Audio API + ElevenLabs | 16-bit FM Synthesis engine + AI Pilot Support |
| **Lore** | "Squad" Orchestration | Sub-agents managing character backstories and visual manifests |

---

## Architecture

```
Velocity-16/
├── index.html                  ← Entry point. 
├── src/
│   ├── main.js                 ← RAF game loop
│   ├── engine/                 ← Mode 7 core, renderer, input
│   ├── graphics/               ← Palette, sprites, HUD
│   ├── audio/
│   │   ├── audio.js            ← FM Synthesis + ElevenLabs Hook Interface
│   ├── track/                  ← Lap logic, track-data
├── docs/
│   ├── PROJECT_OVERVIEW.md     ← This file
│   ├── CHARACTERS.md           ← Pilot and Machine Registry
│   ├── SPRITE_MANIFEST.md      ← Visual blueprints for sub-agents
│   └── VOICE_SCRIPT.json       ← Announcer dialogue for ElevenLabs
└── tasks/
    └── todo.md                 ← Live task roadmap
```

---

## Current Roadmap: Phase 4 & 5 (The WOW Update) 🚧

1.  **Visual Overhaul:** Replace checkerboard with dark asphalt + pulsing neon grid.
2.  **System Logic:** Energy/Shield bar + Collision bounce + Damage triggers.
3.  **The "Claw" Layer:** 
    *   **ElevenLabs Announcer:** Tactical pilot support integration.
    *   **Voice Boost:** Web Speech API "BOOST" detection.
4.  **Polish:** Spinning Mode 7 Title Screen + Select Your Pilot profile menu.

---

## The Nintendo Standard

> "Every change must feel finished. If a pixel is out of place or the acceleration curve feels floaty, it's not done."
