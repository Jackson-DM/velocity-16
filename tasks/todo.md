# TASK ROADMAP: Velocity-16
(Initialized: 2026-02-23 | Last updated: 2026-02-24)

## PHASE 1: BOOTSTRAP ✅ COMPLETE
- [x] Create directory structure
- [x] Write CLAUDE.md (The Brain)
- [x] Define Initial Skill Bank (Mode 7 Engine)
- [x] Tech Stack Choice → Canvas-Native (Vanilla JS + ImageData). No bundler, no library.
- [x] "Hello, Track" → Mode 7 scanline renderer, 60fps, zero-latency input
- Commit: `2018411`

## PHASE 2: RACER DYNAMICS ✅ COMPLETE
- [x] Hover physics (hover.js) — F-Zero Brutal: THRUST=720, TOP_SPEED=600, DRAG, GRIP, drift
- [x] Procedural 24×16 pixel-art car sprite — 9 horizontal-shear tilt frames (sprites.js)
- [x] Spring-follow camera — POS_SPRING=8, ANG_SPRING=4 (camera.js)
- [x] WOW #1: Horizon roll (drift shifts horizon ±5.8px)
- [x] WOW #2: FOV breathing (fov 0.66→0.80 at top speed)
- [x] WOW #3: Speed lines — edge streaks trigger at 480 WU/s (renderer.js)
- Commit: `4c1ef3f`

## PHASE 3: TRACK + LAP + HUD ✅ COMPLETE
- [x] MUTE CITY I track data — 8-checkpoint oval, pre-computed gate segments (track-data.js)
- [x] Lap logic — strict 2D segment-crossing + direction guard, lap timer (lap.js)
- [x] HUD overlay canvas — draws at full display resolution, no upscale blur (hud.js)
- [x] Audio hook interface — createAudio() contract for Claw sub-agent (audio.js)
- [x] Audio user-gesture gate — audio.start() fires on first keydown/pointerdown
- [x] Speed lines redesign — fixed Y positions, perspective-correct (15%→100%), 80px max
- [x] HUD font crisp — separate <canvas id="hud"> at CSS display resolution
- Commits: `faa11f4`, `de22c95`, `07f80e4`

## PHASE 4: THE FULL GAME LAYER 🚧 PLANNING
- [ ] Track surface texture — replace checkerboard with painted race circuit
- [ ] Energy / shield bar — F-Zero style health depleted by wall contact (HUD bar)
- [ ] Collision boundaries — bitmask track edges → wall bounce + energy drain (collision.js)
- [ ] Voice-command Turbo boost — Web Speech API "BOOST" fires audio.onBoost() + physics pulse
- [ ] Title screen — VELOCITY-16 splash with PRESS START, neon palette
- [ ] Claw: FM engine drone + SFX integration (audio/audio.js implementation)
