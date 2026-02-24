# TASK ROADMAP: Velocity-16
(Initialized: 2026-02-23)

## PHASE 1: BOOTSTRAP (Current)
- [x] Create directory structure
- [x] Write CLAUDE.md (The Brain)
- [x] Define Initial Skill Bank (Mode 7 Engine)
- [x] **Step 4: The Tech Stack Choice** → Canvas-Native (Vanilla JS + ImageData). No bundler, no library. Open index.html, see the track.
- [x] **Step 5: Hello, Track** → Mode 7 scanline renderer live. Verify: static render, rotation at 30/60/90°, forward travel, 60fps, zero-latency input.

## PHASE 2: RACER DYNAMICS
- [ ] Replace keyboard camera control with `physics/hover.js` (thrust, drag, drift)
- [ ] Implement hover-car sprite (16-bit tilt angles from spritesheet)
- [ ] Acceleration/Braking "Vibe" — exponential drag curve, not linear
- [ ] Camera-follow (Smooth spring lerp from world.js position)
- [ ] Collision bitmask from `track-collision.png` → boundary detection

## PHASE 3: THE "WOW" LAYER
- [ ] Chrome Voice-command "Turbo" boost (Web Speech API — native, free)
- [ ] AI-Generated vibrant track environments (swap `floorTexture` in mode7.js)
- [ ] 16-bit FM sound synth integration (Web Audio API oscillators)
- [ ] HUD: speed readout, lap counter, position (bitmap font rendering)
