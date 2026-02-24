# SESSION 001 — Phase 1: Bootstrap & Mode 7 Floor
**Date:** 2026-02-23
**Status:** ✅ Complete
**Branch:** master

---

## Objective
Initialize the project, choose the tech stack, and ship the "Hello, Track" milestone: a working Mode 7 perspective floor at 60fps with zero-latency keyboard control.

---

## Decisions Made

### Tech Stack: Canvas-Native (Vanilla JS + HTML5 Canvas)
**Rejected Phaser.js** — no Mode 7 pipeline; bypassing its renderer defeats the purpose; 200KB overhead with no benefit.
**Rejected Pygame** — Python desktop lib, no real browser path, can't hit 60fps in WebAssembly wrapper.
**Chose Canvas-Native** — per-scanline `ImageData` = same level of control as the SNES PPU. Zero deps, `requestAnimationFrame` locked to display, `image-rendering: pixelated` for authentic pixel art.

### Camera Parameters
After empirical testing: `camHeight=1000`, `horizon=90`, `texScale=4` (effective tile = 8 world units).
- Too-small camHeight (82) made `rowZ` < 1 at the bottom of screen → 141/143 floor rows rendered as a single zoomed-in tile (solid color block).
- `texScale=4` decouples world coordinate system from texture sampling, allowing independent tuning of tile visual size.

### ABGR Color Format
ImageData `Uint32Array` view is little-endian: `R` in bits 0-7, `G` in bits 8-15, `B` in bits 16-23, `A` in bits 24-31.
Correct encoding: `(0xFF000000 | (B<<16) | (G<<8) | R) >>> 0`
`>>> 0` coerces signed Int32 → unsigned Uint32 before array write.

---

## Bugs Fixed

| Bug | Root Cause | Fix |
|---|---|---|
| Solid floor block | `camHeight=82` → `rowZ < 1` at bottom → all rows in one tile | `camHeight=1000` |
| Wrong colors | ABGR byte order misunderstood; `0xFF00FFFF` = yellow, not cyan | Rewrote all colors as `(A<<24)\|(B<<16)\|(G<<8)\|R` |
| No floor checkerboard | Stripe condition (`tileX % 4 === 0`) trapped camera at x=512 → tx=0 forever | Removed stripe, pure 2-color checker |
| Texture wrap glitch | `wx & mask` truncates float (−0.3→0, not 255) | `Math.floor(wx) & mask` — correct for negative coords |
| Wrong Mode 7 ray directions | Custom formula used `sinA * screenH` — not standard | Rewrote with Lode's floor-raycasting: `planeX = -sinA * fov`, `leftRay = dir - plane` |
| Sky gradient inverted | `b = 60 * (1-t)` put blue at top, black at horizon | Flipped `t`: dark at top, neon cyan glow at horizon |

---

## Files Created

```
index.html                    ← 320×224 canvas, module script, pixelated CSS
src/main.js                   ← RAF loop, procedural texture, camera control
src/engine/mode7.js           ← Scanline floor + sky renderer
src/engine/renderer.js        ← ImageData owner, putImageData flush
src/engine/camera.js          ← Camera state with defaults
src/engine/input.js           ← Keydown Set polling, getInput()
src/utils/math.js             ← lerp, clamp, wrapAngle, fastFloor
src/utils/perf.js             ← Frame budget monitor
src/graphics/palette.js       ← ABGR palette (corrected encoding)
src/physics/{hover,collision,world}.js  ← Phase 2 stubs
src/graphics/sprites.js       ← Phase 2 stub
src/audio/synth.js            ← Phase 3 stub
src/track/track-data.js       ← Phase 3 stub
```

---

## Milestone Verification

| Check | Result |
|---|---|
| Static floor renders with perspective | ✅ |
| Left/Right rotates floor correctly | ✅ |
| Up/Down moves camera forward/back | ✅ |
| 60fps (perf.js silent) | ✅ |
| Zero-latency input response | ✅ |
| Movement feel: "fluid, great solid speed, right amount of drift" | ✅ User confirmed |

---

## Repo
- Created: https://github.com/Jackson-DM/velocity-16
- Commit: `feat: Phase 1 — Mode 7 floor renderer (Hello, Track milestone)`
- 19 files, 445 lines

---

## Handed Off To
**SESSION 002 — Phase 2: Racer Dynamics**
Next: hover-car sprite, physics (thrust/drag/drift), camera spring-follow, collision.
