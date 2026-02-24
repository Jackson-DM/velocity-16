// src/audio/audio.js — Phase 3 Audio Hook Interface
// =============================================================
// OWNERSHIP: Claw (Audio Engineer sub-agent)
// This file defines the contract between the game loop and the audio engine.
// All methods are safe no-ops until Claw fills in the implementation.
// main.js calls these unconditionally — never guard the call sites.
// Do NOT import synth.js here; Claw will wire that internally.
// =============================================================
//
// Hook call sites in main.js:
//   audio.start()                      — once, on game init
//   audio.stop()                       — on tab visibility change / teardown
//   audio.update(speed, dt)            — every frame; speed in WU/s [0..600], dt in seconds
//   audio.onCheckpoint(index)          — when checkpoint `index` (0-7) gate is crossed
//   audio.onLapComplete(ms, isNewBest) — lap finished; ms = lap time, isNewBest = boolean
//   audio.onRaceFinish()               — all laps complete
//   audio.onBoost()                    — Space key pressed (rising edge only, not held)

export function createAudio() {
  return {
    /** Begin engine drone / music. Called once before first frame. */
    start() {},

    /** Silence all audio. Called on game teardown or tab hide. */
    stop() {},

    /**
     * Per-frame update for continuous audio (engine pitch, etc.).
     * @param {number} speed  Current car speed in WU/s [0 – 600]
     * @param {number} dt     Frame delta-time in seconds
     */
    update(speed, dt) {},

    /**
     * Player crossed checkpoint gate `index` in the correct direction.
     * @param {number} index  Checkpoint index [1–7] (0 = start/finish, handled via onLapComplete)
     */
    onCheckpoint(index) {},

    /**
     * A lap was completed (start/finish line crossed with all checkpoints cleared).
     * @param {number}  lapTimeMs   Lap duration in milliseconds
     * @param {boolean} isNewBest   True if this lap beats the previous best
     */
    onLapComplete(lapTimeMs, isNewBest) {},

    /** All laps complete — race finished. */
    onRaceFinish() {},

    /** Boost key pressed (Space). Rising edge only — fires once per key press, not per frame. */
    onBoost() {},
  };
}
