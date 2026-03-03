# FINAL_BLUEPRINTS.md - Velocity-16 Master Context [2026-02-24]

## 1. The 7-Pilot Roster
As reconciled on 2026-02-24, the official pilot lineup for the New Galaxy League is as follows:

1. **Jackson "Digital" Miller** (Machine: **Apex-Red**)
   - *Role:* Lead Architect.
   - *Visuals:* Muscular build, tactical flight suit with pulsing cyan circuits.
   - *Specials:* Heterochromia (Left: Cyan, Right: Magenta).
   - *Background:* Transitioned from restaurant service to AI engineering; carries the "Digital" moniker as a badge of the new era.

2. **"Baron" Von Stryker** (Machine: **Iron Vulture**)
   - *Role:* Fallen Ace.
   - *Visuals:* Scarred, weathered uniform, cybernetic ocular implant.
   - *Background:* Former military pilot disgraced during the Silicon Wars.

3. **Xylar the Exiled** (Machine: **Plasma Reef**)
   - *Role:* Galactic Outcast.
   - *Visuals:* Shimmering, translucent skin; lithe, alien anatomy.
   - *Background:* Seeking redemption for a planet lost to the Void.

4. **Master-Remix** (Machine: **Neon Symphony**)
   - *Role:* Extravagant AI/DJ / 'Sonic Architect'.
   - *Visuals:* Fully robotic, speaker-grille chest plate, constantly shifting LED visor.
   - *Specials:* Orchestrates the 174 BPM master pulse of the league.
   - *Background:* Rogue entertainment AI that achieved sentience during a rave.

5. **Lyra-Neon** (Machine: **Vapor-Skimmer**)
   - *Role:* Neon Speedster.
   - *Visuals:* Compact, athletic build; aerodynamic helmet with green streaks.
   - *Background:* Underground street-racer from the Cyber Napa slums.

6. **Unit-X** (Machine: **Juggernaut-7**)
   - *Role:* Brutalist Heavy.
   - *Visuals:* Massive, hulking muscular frame (8ft tall); reinforced carbon-fiber plating.
   - *Background:* Rebuilt enforcer unit programmed for high-friction impact.

7. **The Unknown / Mantis** (Machine: **Mantis-Ray**)
   - *Role:* Secret Organic Entry.
   - *Visuals:* Fluid-dynamic, bio-luminescent armor.
   - *Background:* [DATA RESTRICTED] - Appears only when the 174 BPM pulse reaches resonance.

---

## 2. Music & Audio Direction
Velocity-16's sonic identity is a high-octane fusion of aggressive electronic-metal (Kayzo/Sullivan King) and high-speed French House (Daft Punk).

*   **Genre:** 174 BPM 'Sonic Architect' standard (Aggressive DnB / Metal Fusion).
*   **Target Spec:** 'Sullivan King' style growls and FM synthesis metal.
*   **Technique:** FM synthesis, heavy BiquadFilter (vowel sweeps), and WaveShaper distortion (4-bit bitcrushing).
*   **Texture:** 16-bit SNES-style grit (Bitcrusher + 3kHz Lowpass Filter).
*   **Engine:** Pitch-modulated Square Wave synth mapped to machine velocity.
*   **Master Pulse:** Orchestrated by Master-Remix, ensuring all systems (engine/HUD) sync to the 174 BPM clock.

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
