# AUDIO_SPEC.md - Velocity-16 Sonic Direction

## 🏎️ 1. Overview
Project: Velocity-16 is a high-octane racing experience. The audio evokes speed, aggression, and futuristic precision. The soundtrack is a hybrid of electronic metal, French house, and high-speed breakbeats, reinforced by 16-bit FM synthesis and robotic TTS feedback.

## ⚡ 2. Genre Fusion
- **Aggressive EDM/Metal (Kayzo / Sullivan King Style):** Distorted bass, aggressive FM synthesis growls, 0.05 gain engine hum (square wave), and heavy rhythmic impact.
- **French House/Synth (Daft Punk Style):** Clean, rhythmic synth stabs, vocoder-like textures, and funky basslines.
- **Drum & Bass / Jungle:** Core gameplay loop at **174 BPM** for constant rhythmic drive.

## 🕒 3. Master Clock
- **Tempo:** 174 BPM.
- All rhythmic elements, engine pulses, and UI transitions sync to this master tempo.

## 🔊 4. Technical Implementation (Web Audio API)

### 🏎️ Engine Hum (Bitcrushed)
- **Oscillator:** Square wave for grit.
- **Processing:** Low-pass filter (3000Hz) -> 4-bit Bitcrusher simulation -> Master Gain.
- **Dynamic Pitch:** Frequency maps from 50Hz to 200Hz based on machine speed.

### 🎙️ TTS (Text-to-Speech) Pilot Feedback
Velocity-16 uses the `WebSpeech API` for real-time race telemetry:
- **Voices:** Robotic/Clear (Prefers "Google UK English Male" or similar).
- **Pitch:** 1.0 - 1.5 (Slightly higher for AI feel).
- **Rate:** 1.2 - 1.5 (Synced to rapid-fire gameplay).
- **Triggers:**
  - **Countdown:** Verbal "3, 2, 1, GO" synced with square wave osc.
  - **Sector/Checkpoint:** "Sector cleared" notifications.
  - **Lap Completion:** Reading formatted lap times (e.g., "Lap complete. New personal best").
  - **Telemetry Alerts:** "Energy low. Seek boost pads." / "Overdrive engaged."
  - **Race Finish:** Verbal ranking (e.g., "You placed 1st").

### 🎸 Synthesis & Filters
- **FM Synthesis:** Carrier-Modulator setups for growl movements.
- **Bitcrusher:** ScriptProcessorNode simulating 16-bit/4-bit depth for SNES-style digital warmth.
- **Filter:** BiquadFilterNode (Lowpass) to muffle digital harshness.

## 📁 5. File Structure
- `src/audio/audio.js`: Primary WebAudio engine, TTS handlers, and synthesizer definitions.

---
*Last Updated: 2026-03-03 - Documentation Overhaul.*
