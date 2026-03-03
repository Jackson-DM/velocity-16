# MISSION_BRIEF: Velocity-16 - THE FIRST WORKTREE SPRINT (PHYSICS + VISUAL AUDIT)
*Orchestrator: Claw 🏎️⚡ | Repository: Velocity-16 | Date: 2026-03-03*

## 🎯 OBJECTIVE
Repair the broken `main.js` game loop and perform a final aesthetic audit of the "Apex-Red" vehicle to ensure it meets the muscular, F-Zero SNES standard.

## 🏗️ ARCHITECTURE (See Jackson_AI_Orchestration_Stack.md)
This mission follows the **3-Tier Jackson Loop**. You are a **Tier 2 Hammer**.
- **READ** `C:\Users\Jackson\Desktop\Jackson_AI_Orchestration_Stack.md` to understand your role in the swarm.
- **READ** the full session history and `Velocity-16/src` before writing any code.

## 🛠️ EXECUTORS & TASKS

### 1. Codex 5.3 (The Autonomous Engineer)
*   **Model:** `openrouter/openai/o3-mini` (High-Logic Reasoning Core)
*   **Worktree/Branch:** `feat/engine-recovery`
*   **Mission:** 
    - Fix the `main.js` loop. The game is currently not starting or is blacking out after "Initialize Engine."
    - Ensure the `startGame()` function correctly triggers the `gameLoop()` and that the `Road Spline` and `AI Racers` are properly instantiated. 
    - Maintain the **0.05 engine gain** in `audio.js`.

### 2. Claude Opus (The Precision Builder)
*   **Model:** `openrouter/anthropic/claude-3.7-sonnet` (Opus-tier Precision)
*   **Worktree/Branch:** `feat/visual-audit`
*   **Mission:** 
    - Audit the `APEX-RED` sprite in the manifest. It must be **Matte Black (#050505)** with aggressive **Red (#ff0000)** and **Magenta (#ff00ff)** highlights.
    - Ensure the "muscular/sleek" F-Zero silhouette is correctly rendered in the `main.js` canvas.
    - Verify that the **Mode 7 Perspective** (tapering road) is visually correct and fanning out at the bottom of the screen.

## 🛑 VALIDATION (NO MERGE UNTIL:)
- Codex can confirm the game loop is stable and AI racers are moving.
- Claude can confirm the Apex-Red sprite is visually "correct" and high-fidelity.
- Both agents have **Peer-Reviewed** each other's branches.
