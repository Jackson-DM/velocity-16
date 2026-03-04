# MISSION_BRIEF: Velocity-16 - LEAGUE INTEGRATION (ELVIS-STANDARD)
*Orchestrator: Claw 🏎️⚡ | Date: 2026-03-03*

## 🎯 OBJECTIVE
Transform the current "Solo Bumper" script into a full 7-pilot F-Zero league race. 

## 🏗️ ARCHITECTURE
- **Tier 2 Hammers:** You must use `read` to audit the current simplified `main.js` and `graphics/palette.js`.
- **Peer Review:** REQUIRED. 

## 🛠️ EXECUTORS & TASKS

### 1. Codex 5.3 (Engineer)
*   **Mission:** 
    - Re-integrate the **6 AI Pilots** (Baron, Lyra, etc.) using the logic from our previous successful `aiPilots` loop.
    - Implement **Track Constraint Logic**: If the `state.offset` exceeds the `roadWidth`, apply a 0.7x speed penalty (off-road friction).
    - Ensure `audio.onCheckpoint()` triggers correctly along the `totalTrackLength`.

### 2. Claude Opus (Visual Architect)
*   **Mission:** 
    - **Aesthetic Audit:** Redefine the 'APEX-RED' sprite matrix to match the muscular silhouette (Matte Black/Red/Magenta).
    - **Mode 7 Refinement:** The road shouldn't just be a rectangle; it needs to use `ctx.setTransform` or scanline width scaling to taper aggressively toward the horizon.
    - **UI:** Implement the **Position/Lap** overlays within the `render()` loop.

## 📦 WORKSPACE
- `Velocity-16/src`

## 🛑 VALIDATION
- 7 cars on track.
- Off-road speed penalties.
- Muscular Black/Red/Magenta car.
