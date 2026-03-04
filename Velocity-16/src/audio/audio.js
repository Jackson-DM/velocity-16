/**
 * Velocity-16 Audio Engine
 * 16-bit FM / Oscillator Synthesis
 */

class AudioEngine {
    constructor() {
        console.log('Audio engine constructor called');
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.engineOsc = null;
        this.engineGain = null;
        this.isStarted = false;

        // WebSpeech Synthesis Init
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.synthEnabled = true;

        // Try to find a "tech" sounding voice (Master-Remix style)
        if (this.synth) {
            const setVoice = () => {
                const voices = this.synth.getVoices();
                // Prefer Google UK English Male or similar robotic/clear voices
                this.voice = voices.find(v => v.name.includes('Google UK English Male')) || 
                             voices.find(v => v.lang === 'en-US') || 
                             voices[0];
            };
            setVoice();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = setVoice;
            }
        }
    }

    speak(text, pitch = 1.0, rate = 1.2) {
        if (!this.synthEnabled || !this.synth) return;
        
        // Cancel any ongoing speech to avoid overlap pile-ups
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) {
            utterance.voice = this.voice;
        }
        utterance.pitch = pitch; // Slightly higher for "AI" feel
        utterance.rate = rate;   // Fast-paced like 174 BPM
        utterance.volume = 0.8;
        this.synth.speak(utterance);
    }

    formatLapTime(ms) {
        const totalSeconds = ms / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = (totalSeconds % 60).toFixed(2);
        
        if (minutes > 0) {
            return `${minutes} minutes, ${seconds} seconds`;
        }
        return `${seconds} seconds`;
    }

    playCountdown(num) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = num === 'GO' ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(num === 'GO' ? 880 : 440, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
        this.speak(num.toString(), num === 'GO' ? 1.5 : 1.0, 1.5);
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
        this.engineGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        
        // Routing: Osc -> Gain -> Filter -> Bitcrusher -> Master -> Destination
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.filter);
        this.filter.connect(this.bitcrusher);
        this.bitcrusher.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
        
        this.engineOsc.start();
        this.isStarted = true;
    }

    start() { 
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.init(); 
    }
    
    updateEngine(speed) {
        if (!this.isStarted) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        // Map speed (0-something) to frequency (50Hz - 200Hz)
        const freq = 50 + (speed * 0.5);
        this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    }

    onLapComplete(ms, isNewBest) {
        this.playLapChime();
        if (isNewBest) {
            // Add a little extra flair for new best
            setTimeout(() => this.playLapChime(), 150);
            this.speak(`Lap complete. New personal best: ${this.formatLapTime(ms)}. Excellent drive.`);
        } else {
            this.speak(`Lap time: ${this.formatLapTime(ms)}.`);
        }
    }

    onRaceFinish(position, time) {
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

        const rankSuffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';
        this.speak(`Race finished. You placed ${position}${rankSuffix} with a total time of ${this.formatLapTime(time)}. Good work out there.`);
    }

    onLowEnergy() {
        this.speak("Energy low. Seek boost pads.", 0.8, 1.4);
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
        
        // Use shorter speech feedback periodically or on key sectors
        if (index % 4 === 0) {
            this.speak("Sector cleared.", 1.2, 1.5);
        }
    }

    playLapChime() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1760, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    onBoost() {
        this.playBoost();
        this.speak("Overdrive engaged.", 1.5, 1.8);
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

    // Voice Trigger Handlers
    enableVoiceFeedback(enabled = true) {
        this.synthEnabled = enabled;
        if (enabled) {
            this.speak("Velocity feedback system online.");
        }
    }

    testVoice() {
        this.speak("Testing audio feedback. 174 BPM master pulse check. Velocity 16 initialized.", 1, 1.2);
    }
}

const audioInstance = new AudioEngine();
export const audio = audioInstance;
