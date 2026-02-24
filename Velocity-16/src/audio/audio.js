/**
 * Velocity-16 Audio Engine
 * 16-bit FM / Oscillator Synthesis
 */

class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.engineOsc = null;
        this.engineGain = null;
        this.isStarted = false;
    }

    init() {
        if (this.isStarted) return;
        
        // Master Gain for overall volume control
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

        // Bitcrusher Effect (16-bit simulation)
        const bufferSize = 4096;
        this.bitcrusher = this.ctx.createScriptProcessor(bufferSize, 1, 1);
        this.bitcrusher.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const output = e.outputBuffer.getChannelData(0);
            const bits = 4; // 16-bit depth feel on a 0-1 scale
            const steps = Math.pow(2, bits);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.round(input[i] * steps) / steps;
            }
        };

        // Low-pass Filter for that muffled SNES warmth
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(3000, this.ctx.currentTime);
        
        // Engine Hum Setup (Square wave for grit)
        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();
        
        this.engineOsc.type = 'square';
        this.engineOsc.frequency.setValueAtTime(50, this.ctx.currentTime);
        this.engineGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        
        // Routing: Osc -> Gain -> Filter -> Bitcrusher -> Master -> Destination
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.filter);
        this.filter.connect(this.bitcrusher);
        this.bitcrusher.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
        
        this.engineOsc.start();
        this.isStarted = true;
    }

    start() { this.init(); }
    
    update(speed, dt) {
        this.updateEngine(speed);
    }

    onCheckpoint(index) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880 + (index * 110), this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    onLapComplete(ms, isNewBest) {
        this.playLapChime();
        if (isNewBest) {
            // Add a little extra flair for new best
            setTimeout(() => this.playLapChime(), 150);
        }
    }

    onRaceFinish() {
        // Simple victory "hold" note
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 2);
    }

    onBoost() {
        this.playBoost();
    }

    playBoost() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
}

const audioInstance = new AudioEngine();
export const audio = audioInstance;
