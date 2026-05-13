/**
 * Velocity-16 Audio Engine (Polished by Claw)
 * 16-bit FM / Oscillator Synthesis with SNES Texture
 */

class AudioEngine {
  constructor() {
    // Do NOT create AudioContext here — browsers block it before a user gesture.
    // ctx is created lazily in start(), which is always called after the first keydown.
    this.ctx = null;
    this.masterGain = null;
    this.filter = null;
    this.bitcrusher = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.fmMod = null;
    this.fmDepth = null;
    this.isStarted = false;
  }

  init() {
    if (this.isStarted) return;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

    // Filter - SNES Warmth
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(2500, this.ctx.currentTime);

    // Bitcrusher - 16-bit grit
    const bufferSize = 4096;
    this.bitcrusher = this.ctx.createScriptProcessor(bufferSize, 1, 1);
    this.bitcrusher.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const output = e.outputBuffer.getChannelData(0);
      const bits = 4; 
      const steps = Math.pow(2, bits);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.round(input[i] * steps) / steps;
      }
    };

    // Engine Osc - Square Wave
    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();
    this.engineOsc.type = 'square';
    this.engineOsc.frequency.setValueAtTime(60, this.ctx.currentTime);
    this.engineGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    // FM Modulator: sine at 0.5× carrier, modulates carrier ±20Hz for growl
    this.fmMod   = this.ctx.createOscillator();
    this.fmDepth = this.ctx.createGain();
    this.fmMod.type = 'sine';
    this.fmMod.frequency.setValueAtTime(30, this.ctx.currentTime);   // 0.5× carrier base 60Hz
    this.fmDepth.gain.setValueAtTime(20, this.ctx.currentTime);      // ±20Hz modulation depth
    this.fmMod.connect(this.fmDepth);
    this.fmDepth.connect(this.engineOsc.frequency);  // modulate carrier frequency

    // Chain: Osc -> Gain -> Filter -> Bitcrusher -> Master -> Destination
    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.filter);
    this.filter.connect(this.bitcrusher);
    this.bitcrusher.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.fmMod.start();
    this.engineOsc.start();
    this.isStarted = true;
  }

  start() {
    // Create context on first call (guaranteed post-gesture) then init the graph.
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.init();
  }

  stop() {
    if (this.ctx && this.ctx.state !== 'closed') this.ctx.suspend();
  }

  update(speed, dt) {
    if (!this.isStarted || this.ctx.state === 'suspended') return;
    const freq = 60 + (speed * 0.4);
    this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    // FM modulator tracks 0.5× carrier for consistent growl at all speeds
    this.fmMod.frequency.setTargetAtTime(freq * 0.5, this.ctx.currentTime, 0.05);
  }

  onCheckpoint(index) {
    if (!this.isStarted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + (index * 100), this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  onLapComplete(ms, isNewBest) {
    if (!this.isStarted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  onRaceFinish() {
    if (!this.isStarted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); 
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2.0);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 2.0);
  }

  onWallHit() {
    if (!this.isStarted) return;
    const t = this.ctx.currentTime;

    // White noise burst (80ms impact thud)
    const buf = this.ctx.createBuffer(1, (this.ctx.sampleRate * 0.08) | 0, this.ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = this.ctx.createBufferSource();
    const ng = this.ctx.createGain();
    ns.buffer = buf;
    ng.gain.setValueAtTime(0.25, t);
    ng.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    ns.connect(ng); ng.connect(this.masterGain); ns.start();

    // Metallic clang: sawtooth pitch-drop 200→55Hz
    const osc = this.ctx.createOscillator();
    const og  = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.15);
    og.gain.setValueAtTime(0.18, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(og); og.connect(this.masterGain);
    osc.start(); osc.stop(t + 0.15);
  }

  onMachineLost() {
    if (!this.isStarted) return;
    const t = this.ctx.currentTime;

    const buf = this.ctx.createBuffer(1, (this.ctx.sampleRate * 0.45) | 0, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const fade = 1 - i / d.length;
      d[i] = (Math.random() * 2 - 1) * fade;
    }

    const noise = this.ctx.createBufferSource();
    const ng = this.ctx.createGain();
    const nf = this.ctx.createBiquadFilter();
    noise.buffer = buf;
    nf.type = 'lowpass';
    nf.frequency.setValueAtTime(1200, t);
    nf.frequency.exponentialRampToValueAtTime(180, t + 0.45);
    ng.gain.setValueAtTime(0.36, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    noise.connect(nf); nf.connect(ng); ng.connect(this.masterGain);
    noise.start(t);

    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.5);
    og.gain.setValueAtTime(0.26, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(og); og.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.5);
  }

  onBoost() {
    if (!this.isStarted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  // ── Countdown beeps ────────────────────────────────────────────────────────
  // '3'=180Hz, '2'=200Hz, '1'=240Hz square wave 120ms each.
  // 'go'=220→880Hz sawtooth sweep 300ms.
  onCountdownBeep(phase) {
    if (!this.isStarted) return;
    const t = this.ctx.currentTime;
    const osc  = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (phase === 'go') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.3);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(); osc.stop(t + 0.3);
    } else {
      const freqMap = { '3': 180, '2': 200, '1': 240 };
      const freq    = freqMap[phase] || 180;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(); osc.stop(t + 0.12);
    }
  }

  // ── Race start jingle ─────────────────────────────────────────────────────
  // 4-note ascending triangle: 440→554→659→880Hz.
  // Scheduled precisely via Web Audio time offsets.
  onRaceStart() {
    if (!this.isStarted) return;
    const t     = this.ctx.currentTime;
    const freqs = [440, 554, 659, 880];
    const durs  = [0.08, 0.08, 0.08, 0.16];

    freqs.forEach((freq, i) => {
      const start = t + i * 0.08;
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + durs[i]);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(start); osc.stop(start + durs[i]);
    });
  }

  // ── Podium fanfare ────────────────────────────────────────────────────────
  // 6-note layered sweep over 2s.
  // Lead sawtooth: C5→E5→G5→C6 (523→659→784→1047Hz).
  // Harmony triangle at 0.6× gain: G4→B4→D5→G5 (392→494→587→784Hz).
  onPodiumFanfare() {
    if (!this.isStarted) return;
    const t = this.ctx.currentTime;

    const leadFreqs = [523, 659, 784, 1047];
    const harmFreqs = [392, 494, 587, 784];
    const times     = [0, 0.35, 0.70, 1.05];
    const noteDur   = 0.55;

    leadFreqs.forEach((freq, i) => {
      const st   = t + times[i];
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.18, st);
      gain.gain.linearRampToValueAtTime(0, st + noteDur);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(st); osc.stop(st + noteDur);
    });

    harmFreqs.forEach((freq, i) => {
      const st   = t + times[i];
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.11, st);
      gain.gain.linearRampToValueAtTime(0, st + noteDur);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(st); osc.stop(st + noteDur);
    });
  }
}

const engine = new AudioEngine();

// Export as the contract expects
export function createAudio() {
  return engine;
}
