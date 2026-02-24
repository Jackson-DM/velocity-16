/**
 * Velocity-16 Audio Engine (Polished by Claw)
 * 16-bit FM / Oscillator Synthesis with SNES Texture
 */

class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = null;
    this.filter = null;
    this.bitcrusher = null;
    this.engineOsc = null;
    this.engineGain = null;
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

    // Chain: Osc -> Gain -> Filter -> Bitcrusher -> Master -> Destination
    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.filter);
    this.filter.connect(this.bitcrusher);
    this.bitcrusher.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.engineOsc.start();
    this.isStarted = true;
  }

  start() {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.init();
  }

  stop() {
    if (this.ctx.state !== 'closed') this.ctx.suspend();
  }

  update(speed, dt) {
    if (!this.isStarted || this.ctx.state === 'suspended') return;
    const freq = 60 + (speed * 0.4);
    this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
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
}

const engine = new AudioEngine();

// Export as the contract expects
export function createAudio() {
  return engine;
}
