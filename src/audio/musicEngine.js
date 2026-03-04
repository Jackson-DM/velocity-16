/*
 * Procedural 174 BPM Music Engine
 * 
 * Implements a dynamic music engine that adapts drum and bass layers based on vehicle speed.
 * The engine runs at a fixed 174 BPM clock, and adjusts volume and intensity of layers
 * according to the input speed value. Faster speeds increase the energy and drive the music.
 * 
 * Core features:
 *  - Master clock set at 174 BPM
 *  - Drum layer: triggers per beat with intensity scaling with speed
 *  - Bass layer: sustained notes with filtering and amplitude modulation based on speed
 * 
 * Usage:
 *   const engine = new ProceduralMusicEngine({ speed: initialSpeed });
 *   engine.start();
 *   // Update speed dynamically:
 *   engine.updateSpeed(newSpeed);
 *   // Stop the engine:
 *   engine.stop();
 */

class ProceduralMusicEngine {
  constructor({ speed = 0 } = {}) {
    // Create the Audio Context
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.bpm = 174;
    this.secondsPerBeat = 60 / this.bpm;
    this.speed = speed; // speed will scale the intensity of audio layers

    // Internal state for scheduling
    this._isPlaying = false;
    this._nextBeatTime = 0;
    this._schedulerTimer = null;

    // Setup drum and bass gain nodes for dynamic amplitude control
    this.drumGain = this.ctx.createGain();
    this.bassGain = this.ctx.createGain();
    this.drumGain.gain.value = 0; // start with 0; updated by speed
    this.bassGain.gain.value = 0;

    // Connect gain nodes to destination
    this.drumGain.connect(this.ctx.destination);
    this.bassGain.connect(this.ctx.destination);

    // For bass synthesis, create an oscillator (sawtooth) and keep it running
    this.bassOsc = this.ctx.createOscillator();
    this.bassOsc.type = 'sawtooth';
    // Bass filter to mellow the sound
    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowpass';
    this.bassFilter.frequency.value = 200;

    // Bass envelope via bassGain (already created)
    this.bassOsc.connect(this.bassFilter);
    this.bassFilter.connect(this.bassGain);

    // Start the bass oscillator immediately (it is silent until gain is increased)
    this.bassOsc.start();
  }

  updateSpeed(newSpeed) {
    // Update speed which is a positive number used to scale intensity
    this.speed = newSpeed;
    // Map speed to gain values (example mapping; can be tuned)
    // We'll assume a speed range of 0 to 100 m/s for scaling
    const normSpeed = Math.min(Math.max(newSpeed / 100, 0), 1);
    // Drum gain scales with speed: from 0.2 to 1.0
    this.drumGain.gain.value = 0.2 + 0.8 * normSpeed;
    // Bass gain scales with speed: from 0.1 to 0.8
    this.bassGain.gain.value = 0.1 + 0.7 * normSpeed;
    // Optionally, adjust bass filter frequency based on speed
    this.bassFilter.frequency.value = 200 + 800 * normSpeed;
  }

  start() {
    if (this._isPlaying) return;
    this._isPlaying = true;
    this._nextBeatTime = this.ctx.currentTime;
    this._schedule();
  }

  stop() {
    this._isPlaying = false;
    if (this._schedulerTimer) {
      clearTimeout(this._schedulerTimer);
      this._schedulerTimer = null;
    }
  }

  _schedule() {
    // Schedule events up to 0.1 seconds in the future
    while (this._nextBeatTime < this.ctx.currentTime + 0.1) {
      // Schedule drum hit on every beat
      this._scheduleDrum(this._nextBeatTime);
      // For bass, we let it run continuously, but we can schedule subtle modulation if needed
      // For example, a short pulse at every 4 beats for rhythmic effect
      if (Math.floor((this._nextBeatTime - this.ctx.currentTime) / this.secondsPerBeat) % 4 === 0) {
        this._scheduleBassPulse(this._nextBeatTime);
      }
      this._nextBeatTime += this.secondsPerBeat;
    }
    if (this._isPlaying) {
      this._schedulerTimer = setTimeout(() => this._schedule(), 25);
    }
  }

  _scheduleDrum(time) {
    // Create a short white noise burst as a drum hit
    const bufferSize = this.ctx.sampleRate * 0.05; // 50ms noise burst
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Simple envelope for the drum hit
    const envelope = this.ctx.createGain();
    envelope.gain.setValueAtTime(1, time);
    envelope.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noise.connect(envelope);
    envelope.connect(this.drumGain);
    noise.start(time);
  }

  _scheduleBassPulse(time) {
    // Create a brief pulse to emphasize the bass line 
    const pulseGain = this.ctx.createGain();
    pulseGain.gain.setValueAtTime(1.5, time);
    pulseGain.gain.exponentialRampToValueAtTime(1, time + 0.1);

    // Duplicate the bass signal through pulseGain for a subtle effect
    // In a more detailed engine, you'd create additional voices or modulate the oscillator
    this.bassFilter.disconnect();
    this.bassFilter.connect(pulseGain);
    pulseGain.connect(this.bassGain);
    // Reconnect after pulse duration
    setTimeout(() => {
      pulseGain.disconnect();
      this.bassFilter.disconnect();
      this.bassFilter.connect(this.bassGain);
    }, 150);
  }
}

// Export the module for Node/CommonJS or attach to window for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProceduralMusicEngine;
} else {
  window.ProceduralMusicEngine = ProceduralMusicEngine;
}
