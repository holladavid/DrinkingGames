/**
 * Yamaha YM2149 Programmable Sound Generator (PSG) Emulator
 * Pure WebAudio API synthesis featuring 3 Square Wave channels,
 * 1 Pseudo-Random Noise generator, and retro SFX routines.
 */
export default class ChiptuneSynth {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isInitialized = false;

        // Noise buffer reference
        this.noiseBuffer = null;
    }

    /**
     * Initializes Audio Context on first user interaction (Browser Security)
     */
    init() {
        if (this.isInitialized) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();

        // Master Gain Control
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Pre-generate 1 second of pseudo-random white noise for drum clicks/fizz
        this.noiseBuffer = this.createNoiseBuffer();

        this.isInitialized = true;
        console.log(" YM2149 Audio Context Activated!");
    }

    /**
     * Unlocks/Resumes suspended AudioContext
     */
    resume() {
        if (!this.isInitialized) {
            this.init();
        } else if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Generates white noise buffer
     */
    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 1.0;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    /**
     * Converts Note String (e.g. "C4", "G#4") or MIDI number to Frequency (Hz)
     * @param {string|number} note 
     * @returns {number} Frequency in Hz
     */
    noteToFreq(note) {
        if (typeof note === 'number') {
            return 440 * Math.pow(2, (note - 69) / 12);
        }
        const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const match = String(note).match(/^([A-G]#?)(-?\d+)$/);
        if (!match) return 0;
        
        const [, key, octave] = match;
        const semitone = NOTES.indexOf(key);
        const midi = (parseInt(octave, 10) + 1) * 12 + semitone;
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    /**
     * Plays a hardware tone on a square wave channel
     */
    playTone(freq, startTime, duration, volume = 0.2, detuneHz = 0) {
        if (!this.isInitialized || freq <= 0) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Native YM2149 Square Wave voice
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq + detuneHz, startTime);

        // Simulated logarithmic 4-bit DAC envelope decay
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    /**
     * Plays 8-bit Noise percussion
     */
    playNoise(startTime, duration, volume = 0.15) {
        if (!this.isInitialized) return;

        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = this.noiseBuffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        noiseSource.connect(gain);
        gain.connect(this.masterGain);

        noiseSource.start(startTime);
        noiseSource.stop(startTime + duration);
    }

    // --- RETRO SOUND EFFECTS (SFX) ---

    playSelectSFX() {
        this.resume();
        const now = this.ctx.currentTime;
        this.playTone(800, now, 0.05, 0.2);
        this.playTone(1200, now + 0.05, 0.08, 0.2);
    }

    playConfirmSFX() {
        this.resume();
        const now = this.ctx.currentTime;
        this.playTone(400, now, 0.06, 0.3);
        this.playTone(600, now + 0.06, 0.06, 0.3);
        this.playTone(1000, now + 0.12, 0.15, 0.3);
    }

    playErrorSFX() {
        this.resume();
        const now = this.ctx.currentTime;
        this.playTone(180, now, 0.12, 0.3);
        this.playTone(130, now + 0.1, 0.2, 0.3);
        this.playNoise(now, 0.2, 0.2);
    }
}