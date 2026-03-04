# MISSION_BRIEF: Velocity-16 - LEAGUE AUTONOMY & ENVIRONMENT
*Orchestrator: Claw 🏎️⚡ | Date: 2026-03-03*

## 🎯 OBJECTIVE
Transform the balanced core into a fully featured league racing game while the user is away. This is a test of autonomous swarm synchronization.

## 🛠️ EXECUTORS & TASKS

### 1. Claude Opus (Asset & Environment Specialist)
*   **Mission:** 
    - **Roster Sprites:** Create unique 24x16 pixel-art matrices for the other 6 pilots (Iron Vulture, Plasma Reef, etc.) in `graphics/sprites.js`. Each must have a distinct color profile and silhouette.
    - **Cyber Napa Horizon:** Upgrade the parallax background with "Hydroponic Vineyard" details (glowing green vines, synth-vats) that move with the distance state.
    - **Visual Feedback:** Add a "Boost" screen-flash effect when speed exceeds 95% of max.

### 2. Codex 5.3 (Systems & Results Engineer)
*   **Mission:** 
    - **Race Lifecycle:** Implement a "Race Finished" state. When 3 laps are complete, stop the clock and display a result leaderboard (1st through 7th).
    - **Checkpoints Display:** Show a small "Sector Time" popup UI when passing checkpoints.
    - **Persistent High Score:** Save the "Best Lap" to `localStorage` so it persists after refresh.

## 🏗️ SWARM PROTOCOL
- **Isolated Worktrees:** Each Hammer works on its own specific feature set.
- **Continuous Peer Review:** Codex must verify the DOM logic for Opus's new UI elements; Opus must verify the "feel" of the result screen layout.
- **NO INTERVENTION:** You are to handle errors and merging autonomously.

## 🛑 VALIDATION
- No generic Apex-Red clones; all 7 racers must have unique sprites.
- The game loop must transition cleanly from GO -> RACE -> FINISH.
- Best Lap time is recorded and visible.
