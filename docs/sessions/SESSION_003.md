# SESSION 003 — Phase 3: Track + Lap + HUD + Audio Hooks
**Date:** 2026-02-24
**Status:** ✅ Complete
**Commits:** `faa11f4`, `de22c95`, `07f80e4`

---

## Objective
Wire real track geometry, lap detection, a crisp HUD, and audio hooks. Claw (Audio Engineer sub-agent) owns `src/audio/` — this session prepares the interface contract and all call sites.

---

## Decisions Made

### Track Geometry: Parametric oval
MUTE CITY I defined as an ellipse: center (512,512), semi-axis A=300 (E-W), B=262 (N-S).
8 checkpoints at -90°,-45°,0°,45°,90°,135°,180°,-135° — forward-normal = normalised clockwise tangent at each point. Gate segment endpoints **pre-computed and stored** (no per-frame trig). half-width=100 WU.

Car spawns at CP0 (512,250) facing east. `nextCp` starts at 1 to skip the start/finish line on init — prevents the car immediately registering a lap by sitting on the line.

### Lap Logic: Strict segment-crossing test
Used signed-area triangle test (not radius proximity) for precision.
Direction guard: `dot(movement, gate_normal) > 0` — rejects reverse crossings.
Strict inequality: collinear/grazing touches return false — no ghost triggers.
Anti-tunneling analysis: max displacement at TOP_SPEED = 10 WU/frame; gate hw=100 WU → can never skip a gate.

### HUD: Overlay canvas at display resolution
Root cause of blurry text: `ctx.fillText` draws at 320px logical canvas resolution, then CSS upscales 4×. Text rasterises small then gets stretched.

Fix: separate `<canvas id="hud">` overlay (position:absolute over game canvas). Its `width`/`height` attributes = CSS display size (e.g. 1280×896 at 4× scale). Text rasterises natively at full pixel density.

Layout: top-left = LAP X/N + M:SS.mm + BEST (neon green when set), top-right = SPD NNN.

### Audio: User-gesture gate
Web browsers block `AudioContext` creation until a user gesture (Web Audio autoplay policy).
`audio.start()` at module init would silently create a suspended context.

Fix: `ensureAudio()` with `{ once: true }` on `keydown` + `pointerdown`. `audioStarted` flag prevents double-fire. Claw's `audio.js` implementation will work correctly from these call sites.

### Speed lines redesign (bugfix: `07f80e4`)
Original problem: `maxLen=16px`, `tick%range` scattered 8 lines randomly → looked like floating pixel artifacts.
Fix: 6 fixed fractional Y positions, max 80px, perspective-correct (15% near horizon → 100% near bottom), gentle ±8% sine pulse. At SPD 551: bottom streak ≈44px from each edge.

---

## Audio Hook Contract (for Claw)
```js
createAudio() → {
  start()                           // call on first user gesture
  stop()                            // teardown
  update(speed, dt)                 // every frame — engine pitch
  onCheckpoint(index)               // checkpoint crossed
  onLapComplete(lapTimeMs, isNewBest) // lap complete
  onRaceFinish()                    // all laps done
  onBoost()                         // Space key, rising edge only
}
```

---

## Files Created
```
src/track/track-data.js   ← MUTE CITY I: 8 checkpoints, oval geometry
src/track/lap.js          ← createLapState() + updateLap() + crossing math
src/graphics/hud.js       ← drawHUD(hudCtx, scale, lapState, world)
src/audio/audio.js        ← hook interface stub (Claw fills in)
```

## Files Modified
```
src/engine/renderer.js    ← stripped to pixel-buffer only; removed HUD pass
src/main.js               ← full wiring: lap + audio + boost edge trigger + HUD overlay
index.html                ← <div id="game-wrap"> + <canvas id="hud"> overlay
```

---

## Milestone Verification

| Check | Result |
|---|---|
| Lap counter increments after completing the oval | ✅ |
| Reverse crossing rejected | ✅ (direction guard) |
| HUD text crisp at all CSS scale factors | ✅ (overlay canvas) |
| Audio hooks fire at correct call sites | ✅ (stubs confirmed) |
| Audio starts on first keypress, not on page load | ✅ |
| Speed lines look like intentional F-Zero streaks | ✅ (post-redesign) |
| 60fps budget: perf.js silent | ✅ |
