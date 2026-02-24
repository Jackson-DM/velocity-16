# SESSION 002 — Phase 2: Racer Dynamics
**Date:** 2026-02-24
**Status:** ✅ Complete
**Commit:** `4c1ef3f`

---

## Objective
Replace the Phase 1 keyboard-camera control with a full hover physics system, a procedural pixel-art car sprite with tilt frames, and three WOW visual effects.

---

## Decisions Made

### Physics: F-Zero Brutal (12-step drift algorithm)
The key insight: heading turns **before** velocity is reprojected onto the new heading. That one-frame mismatch between old velocity decomposition and new heading IS the drift source — no extra code needed, it emerges from the order of operations.

Constants derived from the equilibrium condition `THRUST = TOP_SPEED × DRAG_FWD`:
- TOP_SPEED=600 WU/s, THRUST=720, DRAG_FWD=1.2, GRIP=3.5, TURN_BASE=1.4, BRAKE_DRAG=3.07
- Simulated drift ratio at equilibrium: fwd≈452, lat≈146 → ratio≈0.307 ✓

### Sprite: Pure math, no OffscreenCanvas
24×16 pixel-art neutral frame encoded as a `Uint32Array` of ABGR Uint32 values.
9 tilt frames baked at startup via horizontal shear: row `y` shifts by `round((frame-4) * y / 15)` px.
Total: 24×16×9 = 3456 pixels, allocated once, zero per-frame GC.

Tilt-to-drift mapping: `tiltFrame = clamp(4 + round(drift/150 * 4), 0, 8)`.

### Camera: Exponential spring
Used `1 - exp(-k*dt)` instead of linear lerp — this is frame-rate independent and self-damping.
- POS_SPRING=8: position tracks car in ~0.25s
- ANG_SPRING=4: angle lags 2× more → natural "look-ahead" feel

### WOW Effects
1. **Horizon roll** — `camera.horizon = 90 + drift * 0.04` — ±5.8px at equilibrium drift. Creates bank sensation without any tilt geometry.
2. **FOV breathing** — `camera.fov = 0.66 + (speed/600) * 0.14` — widening FOV at speed creates a tunnel-rush feel for free.
3. **Speed lines** — 8 edge streaks triggered at 480 WU/s. Later redesigned in Phase 3 bugfix.

---

## Files Modified
```
src/physics/world.js    ← added drift: 0 field
src/physics/hover.js    ← full 12-step physics + exported constants
src/engine/camera.js    ← added updateCamera() with spring + WOW effects
src/graphics/sprites.js ← buildCarSprite() + blitCarSprite()
src/engine/renderer.js  ← extended render() with sprite + speed lines passes
src/main.js             ← wired world/hover/camera/sprite; removed TURN_SPEED/MOVE_SPEED
```

---

## Milestone Verification

| Check | Result |
|---|---|
| Physics equilibrium: 600 frames → speed≈475, drift/speed≈0.30 | ✅ |
| Camera spring: smooth decel on throttle release, no overshoot | ✅ |
| Sprite: neutral = centered, hard turn = sprite banks + horizon rolls | ✅ |
| Speed lines: edge streaks appear past 480 WU/s | ✅ |
| 60fps budget: perf.js silent | ✅ |
| Nintendo Standard: satisfying drift, GRIP auto-straightens | ✅ User confirmed |
