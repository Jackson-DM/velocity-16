/**
 * Velocity-16 Audio Engine
 * 
 * Core Technical Plan:
 * 1. Master Clock: 174 BPM
 * 2. Synthesis: FM Synthesis for Growls (Sullivan King style)
 * 3. Synthesis: Vocoder-like processing for Lead Synths (Daft Punk style)
 */

class VelocityAudio {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.bpm = 174;
        this.secondsPerBeat = 60 / this.bpm;
    }

    /**
     * Sullivan King Style Growl
     * Uses FM Synthesis: Modulator -> Carrier -> Distortion -> Filter
     */
    createGrowl(freq = 55) {
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const output = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const shaper = this.ctx.createWaveShaper();

        // FM Setup
        carrier.type = 'sawtooth';
        modulator.type = 'sine';
        modulator.frequency.value = freq * 0.5;
        modGain.gain.value = 1000; // Modulation depth

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);

        // Distortion (Simple Sigmoid)
        shaper.curve = this._makeDistortionCurve(400);
        
        // Filter "Wah" movement
        filter.type = 'lowpass';
        filter.Q.value = 15;
        
        carrier.connect(shaper);
        shaper.connect(filter);
        filter.connect(output);
        output.connect(this.ctx.destination);

        return { carrier, modulator, filter, output };
    }

    /**
     * Daft Punk Style Vocoder Synth
     * Uses parallel filters and PWM-simulated oscillators
     */
    createVocoderLead(freq = 440) {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;

        // Bandpass bank to simulate formants
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 10;

        osc.connect(filter);
        filter.connect(this.ctx.destination);
        
        return { osc, filter };
    }

    _makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0 ; i < n_samples; ++i ) {
            const x = i * 2 / n_samples - 1;
            curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
    }
}

export default VelocityAudio;
