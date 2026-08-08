/**
 * Chiptune Anthem Sequencer & "Lall-Effekt" Engine
 * Plays multi-track anthems from sponsors.json with real-time drunkenness pitch & speed bending.
 */
export default class MusicPlayer {
    constructor(synth) {
        this.synth = synth;
        this.isPlaying = false;
        this.activeTimeouts = [];
    }

    /**
     * Stops current anthem playback immediately
     */
    stop() {
        this.isPlaying = false;
        this.activeTimeouts.forEach(t => clearTimeout(t));
        this.activeTimeouts = [];
    }

    /**
     * Plays a sponsor's anthem from sponsors.json
     * @param {Object} sponsorData - Sponsor JSON configuration
     * @param {number} bac - Promillewert (BAC) of the player (0.0 to 3.5‰)
     */
    playSponsorAnthem(sponsorData, bac = 0.0) {
        this.stop();
        this.synth.resume();
        this.isPlaying = true;

        const anthem = sponsorData.chiptune_anthem || sponsorData.anthem;
        if (!anthem) return;

        const bpm = anthem.tempo_bpm || 110;
        const secondsPerBeat = 60 / bpm;

        // Calculate Drunkenness Intensity (Cap at 3.0 Promille)
        const drunkenness = Math.min(bac / 3.0, 1.0);

        // Normalize single-track vs multi-track channels
        const channels = anthem.ym2149_channels || {
            channel_A: Array.isArray(anthem) ? anthem : []
        };

        const now = this.synth.ctx.currentTime;

        // Schedule playback for each YM2149 channel (A, B, C)
        Object.keys(channels).forEach((channelName, channelIndex) => {
            const track = channels[channelName];
            let timeOffset = 0.1;

            track.forEach((item, noteIndex) => {
                // 1. SPEED BENDING (Stolperndes Tempo)
                // Drunkenness causes beats to drag out and stumble sinusoidally
                let baseDuration = item.duration * secondsPerBeat;
                let tempoStretch = 1.0 + (drunkenness * 0.7); // Up to 70% slower
                let jitter = drunkenness * 0.12 * Math.sin(noteIndex * 1.7);
                let duration = Math.max(0.08, (baseDuration * tempoStretch) + jitter);

                const noteTime = now + timeOffset;
                const baseFreq = this.synth.noteToFreq(item.note);

                if (baseFreq > 0) {
                    // 2. PITCH BENDING (Lallende Frequenzschwankung)
                    // Apply low-frequency oscillator wobble to simulate pitch-slurring
                    let detuneHz = 0;
                    if (drunkenness > 0.1) {
                        const maxDetune = baseFreq * 0.10 * drunkenness; // Up to 10% detune
                        detuneHz = maxDetune * Math.sin(noteIndex * 2.5);
                    }

                    // Assign lower volume to background harmony channels B and C
                    const volume = channelIndex === 0 ? 0.25 : 0.15;
                    this.synth.playTone(baseFreq, noteTime, duration, volume, detuneHz);
                }

                timeOffset += duration;
            });
        });
    }
}