/**
 * Chiptune Tracker Music Player
 * Plays polyphonic 3-channel YM2149 tracks from JSON music assets with optional looping and drunkenness pitch/speed bending.
 */
export default class MusicPlayer {
    constructor(synth) {
        this.synth = synth;
        this.isPlaying = false;
        this.isLooping = false;
        this.activeTimeouts = [];
    }

    /**
     * Stops current track playback immediately
     */
    stop() {
        this.isPlaying = false;
        this.isLooping = false;
        this.activeTimeouts.forEach(t => clearTimeout(t));
        this.activeTimeouts = [];
    }

    /**
     * Plays any JSON Music Asset (3-channel YM2149 Track)
     * @param {Object} trackData - Parsed JSON music asset
     * @param {number} bac - Promillewert (0.0 to 3.5‰)
     */
    playTrack(trackData, bac = 0.0) {
        this.stop();
        if (!trackData || !trackData.ym2149_channels) return;

        this.synth.resume();
        this.isPlaying = true;
        this.isLooping = Boolean(trackData.loop);

        const bpm = trackData.tempo_bpm || 120;
        const secondsPerBeat = 60 / bpm;
        const drunkenness = Math.min(bac / 3.0, 1.0); // Cap at 3.0‰
        const channels = trackData.ym2149_channels;

        const playCycle = () => {
            if (!this.isPlaying) return;

            const now = this.synth.ctx.currentTime;
            let maxTrackDuration = 0;

            // Schedule all 3 YM2149 Hardware Channels in parallel
            Object.keys(channels).forEach((channelName, channelIndex) => {
                const track = channels[channelName];
                let timeOffset = 0.05;

                track.forEach((item, noteIndex) => {
                    // 1. SPEED BENDING (Stolperndes Tempo bei Promille)
                    let baseDuration = item.duration * secondsPerBeat;
                    let tempoStretch = 1.0 + (drunkenness * 0.7);
                    let jitter = drunkenness * 0.12 * Math.sin(noteIndex * 1.7);
                    let duration = Math.max(0.08, (baseDuration * tempoStretch) + jitter);

                    const noteTime = now + timeOffset;
                    const baseFreq = this.synth.noteToFreq(item.note);

                    if (baseFreq > 0) {
                        // 2. PITCH BENDING (Lallende Frequenzschwankung)
                        let detuneHz = 0;
                        if (drunkenness > 0.1) {
                            const maxDetune = baseFreq * 0.10 * drunkenness;
                            detuneHz = maxDetune * Math.sin(noteIndex * 2.5);
                        }

                        // Channel Volumes: Lead (A) = 0.25, Harmony/Bass (B/C) = 0.15
                        const volume = channelIndex === 0 ? 0.25 : 0.15;
                        this.synth.playTone(baseFreq, noteTime, duration, volume, detuneHz);
                    }

                    timeOffset += duration;
                });

                if (timeOffset > maxTrackDuration) {
                    maxTrackDuration = timeOffset;
                }
            });

            // Loop logic
            if (this.isLooping) {
                const loopTimeout = setTimeout(() => {
                    if (this.isPlaying && this.isLooping) {
                        playCycle();
                    }
                }, maxTrackDuration * 1000);

                this.activeTimeouts.push(loopTimeout);
            }
        };

        playCycle();
    }
}