/**
 * Precision Chiptune Tracker Engine
 * Parses JSON tracks, applies instruments, and provides exact Beat-Sync for UI Karaoke.
 */
export default class MusicPlayer {
    constructor(synth) {
        this.synth = synth;
        this.isPlaying = false;
        this.isLooping = false;
        this.activeTimeouts = [];
        
        // Timing sync variables
        this.startTime = 0;
        this.secondsPerBeat = 0;
        this.totalLoopBeats = 32;
    }

    stop() {
        this.isPlaying = false;
        this.isLooping = false;
        this.activeTimeouts.forEach(t => clearTimeout(t));
        this.activeTimeouts = [];
    }

    /**
     * Returns the exact current beat float (e.g. 14.25) based on WebAudio Hardware Clock
     */
    getCurrentBeat() {
        if (!this.isPlaying || !this.synth.ctx) return 0;
        const elapsedSeconds = this.synth.ctx.currentTime - this.startTime;
        return (elapsedSeconds / this.secondsPerBeat) % this.totalLoopBeats;
    }

    playTrack(trackData, bac = 0.0) {
        this.stop();
        if (!trackData || !trackData.ym2149_channels) return;

        this.synth.resume();
        this.isPlaying = true;
        this.isLooping = Boolean(trackData.loop);

        const bpm = trackData.tempo_bpm || 140;
        this.secondsPerBeat = 60 / bpm;
        this.totalLoopBeats = trackData.total_beats || 32;
        
        const drunkenness = Math.min(bac / 3.0, 1.0);
        const channels = trackData.ym2149_channels;
        
        this.startTime = this.synth.ctx.currentTime + 0.1;

        const playCycle = () => {
            if (!this.isPlaying) return;
            const now = this.synth.ctx.currentTime;
            
            // Re-sync start time on loop wrapper to prevent drift
            this.startTime = now + 0.05;
            let cycleDurationSeconds = this.totalLoopBeats * this.secondsPerBeat;

            Object.keys(channels).forEach((channelName) => {
                const channel = channels[channelName];
                const track = channel.track;
                const defaultInst = channel.instrument || 'lead';
                const channelVol = channel.volume || 0.2;
                
                let timeOffset = 0.05;

                track.forEach((item, noteIndex) => {
                    let baseDuration = item.duration * this.secondsPerBeat;
                    let tempoStretch = 1.0 + (drunkenness * 0.7);
                    let jitter = drunkenness * 0.12 * Math.sin(noteIndex * 1.7);
                    let actualDuration = Math.max(0.08, (baseDuration * tempoStretch) + jitter);

                    const noteTime = now + timeOffset;
                    const baseFreq = this.synth.noteToFreq(item.note);
                    const inst = item.inst || defaultInst;

                    if (baseFreq > 0) {
                        let detuneHz = 0;
                        if (drunkenness > 0.1) {
                            const maxDetune = baseFreq * 0.10 * drunkenness;
                            detuneHz = maxDetune * Math.sin(noteIndex * 2.5);
                        }
                        this.synth.playTone(baseFreq, noteTime, actualDuration, channelVol, detuneHz, inst);
                    }
                    timeOffset += actualDuration;
                });
            });

            if (this.isLooping) {
                const loopTimeout = setTimeout(() => {
                    if (this.isPlaying && this.isLooping) playCycle();
                }, (cycleDurationSeconds * 1000) - 50); // Fire slightly early to queue seamlessly
                this.activeTimeouts.push(loopTimeout);
            }
        };

        playCycle();
    }
}