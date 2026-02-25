# FINAL_BLUEPRINTS.md - Velocity-16 Master Context [2026-02-24]

## 1. The 7-Pilot Roster
As reconciled on 2026-02-24, the official pilot lineup for the New Galaxy League is as follows:

1. **Jackson "Digital" Miller** (Machine: **Apex-Red**) - *Lead Architect*
2. **"Baron" Von Stryker** (Machine: **Iron Vulture**) - *Fallen Ace*
3. **Xylar the Exiled** (Machine: **Plasma Reef**) - *Galactic Outcast*
4. **Master-Remix** (Machine: **Neon Symphony**) - *Extravagant AI/DJ*
5. **Lyra-Neon** (Machine: **Vapor-Skimmer**) - *Neon Speedster*
6. **Unit-X** (Machine: **Juggernaut-7**) - *Brutalist Heavy*
7. **The Unknown / Mantis** (Machine: **Mantis-Ray**) - *Secret Organic Entry*

---

## 2. Music & Audio Direction
Velocity-16 sonic identity is a high-octane fusion of aggressive electronic-metal and high-speed breakbeats.

*   **Genre:** 174 BPM Aggressive DnB / Metal Fusion.
*   **Target Spec:** 'Sullivan King' style growls and FM synthesis metal.
*   **Technique:** FM synthesis, heavy BiquadFilter (vowel sweeps), and WaveShaper distortion.
*   **Texture:** 16-bit SNES-style grit (Bitcrusher + 3kHz Lowpass Filter).
*   **Engine:** Pitch-modulated Square Wave synth mapped to machine velocity.

---

## 3. Sprite-Smithing Summary (Core Machines)
The four core machines have been successfully prototyped and manifested in `doc/SPRITE_MANIFEST.md` on a 24x16 grid:

*   **Apex-Red (Jackson):** Balanced AI-core racer. Neon Cyan/Magenta frame. Pulsing circuits.
*   **Juggernaut-7 (Unit-X):** Brutalist heavy slab. Neon Orange/Dark Gray metal. Massive footprint.
*   **Vapor-Skimmer (Lyra-Neon):** Narrow profile speedster. Lime Green/Teal. Focused on minimal drag.
*   **Mantis-Ray (Unknown):** Organic magenta shimmer. Violet/Cyan wings. Fluid-dynamic frame.

*Implementation Note: All machines utilize the Velocity-16 Shearing Standard for dynamic banking animation.*

---

## 4. Systems Status: Voice-Assisted Core
*   **Status:** **DRAFTED / STAGED**
*   **Technology:** WebSpeech API integration.
*   **Current State:** The Voice-Assisted Core logic (pilot feedback via speech) is drafted in the source but **PENDING LIVE TEST** at Jackson's desk. 
*   **Goal:** Real-time pilot-to-vessel AI feedback (Lap times, engine warnings, greeting).

---

## 5. Session 'Truth'
This document serves as the absolute baseline for all future sessions. 
*   **Physics:** Mode 7 Scanline (Zero-dependency JS).
*   **Palette:** NEON_GRID (Jackson Standard).
*   **Context:** This is a Staff Engineer directive. Do not deviate from these specs without explicit instruction.
