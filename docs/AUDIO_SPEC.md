# AUDIO_SPEC.md - Project: Velocity-16 Sonic Direction

## 1. Overview
Project: Velocity-16 is a high-octane racing experience. The audio must evoke speed, aggression, and futuristic precision. The soundtrack is a hybrid of aggressive electronic metal, French house, and high-speed breakbeats.

## 2. Genre Fusion
- **Aggressive EDM/Metal (Kayzo / Sullivan King):** Distorted bass, aggressive FM synthesis growls, and heavy rhythmic impact. Used for high-intensity sections and crashes.
- **French House/Synth (Daft Punk):** Clean, rhythmic synth stabs, vocoder-like textures, and funky basslines. Used for menus, cruising speeds, and UI feedback.
- **Drum & Bass / Jungle:** High-speed breakbeats (174 BPM) for the core gameplay loop. Provides the constant rhythmic drive required for a racing game.

## 3. Core Tempo
- **Main Racing Loop:** 174 BPM (Standard DnB tempo).
- All rhythmic elements, including engine pulses and UI transitions, should sync to this master clock.

## 4. Technical Implementation (Web Audio API)
### Growl Synthesis (Sullivan King Style)
- **FM Synthesis:** Carrier-Modulator setups where the modulator frequency and gain are heavily automated via LFOs or Envelopes.
- **Distortion:** Using `WaveShaperNode` to apply non-linear gain and clipping to FM output.
- **Filtering:** Resonant `BiquadFilterNode` (High-Q Lowpass/Bandpass) with rapid frequency sweeps to create "vowel" movements.

### Vocoder Effects (Daft Punk Style)
- **Carrier/Modulator Simulation:** Using multiple narrow bandpass filters in parallel to simulate formants.
- **Pulse-Width Modulation (PWM):** Mimicking analog synth warmths using oscillating pulse waves.
- **Bitcrushing:** Subtle `scriptProcessor` or `AudioWorklet` to add digital grit.

## 5. File Structure
- `src/audio/audio.js`: Main audio engine and synthesizer definitions.
