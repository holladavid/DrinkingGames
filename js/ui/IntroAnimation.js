/**
 * Summer Games Torch Lighting Parody ("Lighting of the Holy Keg")
 * Features Karaoke-style lyrics display synced to "Drunken Sailor" chiptune track asset.
 */
export default class IntroAnimation {
    constructor(renderer, synth, musicPlayer, assetLoader) {
        this.renderer = renderer;
        this.synth = synth;
        this.musicPlayer = musicPlayer;
        this.assetLoader = assetLoader;

        this.isFinished = false;
        this.timer = 0;
        this.particles = [];
        this.fanfarePlayed = false;
        this.activeMusicAsset = null;

        this.runnerX = -30;
        this.runnerY = 132;
    }

    reset(introMusicAsset) {
        this.timer = 0;
        this.isFinished = false;
        this.fanfarePlayed = false;
        this.runnerX = -30;
        this.runnerY = 132;
        this.particles = [];
        this.activeMusicAsset = introMusicAsset;

        if (this.musicPlayer && introMusicAsset) {
            this.musicPlayer.playTrack(introMusicAsset, 0.0);
        }
    }

    update(dt, input) {
        this.timer += dt;

        if (input.isJustPressed('START') || input.isJustPressed('BUTTON_A')) {
            if (this.musicPlayer) this.musicPlayer.stop();
            this.isFinished = true;
            return;
        }

        // Runner Movement logic
        if (this.timer < 4.0) {
            this.runnerX += dt * 55;
            this.spawnFlameParticle(this.runnerX + 18, this.runnerY - 4);
        } else if (this.timer < 6.0) {
            this.runnerX += dt * 20;
            this.runnerY -= dt * 25;
            this.spawnFlameParticle(this.runnerX + 18, this.runnerY - 4);
        } else if (this.timer >= 6.0) {
            if (!this.fanfarePlayed) {
                this.playOlympicFanfare();
                this.fanfarePlayed = true;
            }
            this.spawnKegFoamParticle(220, 80);
        }

        // Particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    spawnFlameParticle(x, y) {
        this.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: -Math.random() * 20 - 10,
            life: 0.4,
            color: Math.random() > 0.5 ? [7, 5, 0] : [7, 0, 0]
        });
    }

    spawnKegFoamParticle(x, y) {
        this.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 40,
            vy: -Math.random() * 50 - 20,
            life: 0.8,
            color: Math.random() > 0.3 ? [7, 7, 7] : [7, 6, 2]
        });
    }

    playOlympicFanfare() {
        if (!this.synth || !this.synth.ctx) return;
        const now = this.synth.ctx.currentTime;
        this.synth.playTone(392, now, 0.2, 0.3);        // G4
        this.synth.playTone(523.25, now + 0.25, 0.2, 0.3); // C5
        this.synth.playTone(659.25, now + 0.5, 0.2, 0.3);  // E5
        this.synth.playTone(783.99, now + 0.75, 0.6, 0.4); // G5
    }

    render() {
        const ctx = this.renderer.ctx;

        // 1. Preloaded Stadium Background
        const bgImg = this.assetLoader ? this.assetLoader.get('stadium_bg') : null;
        if (bgImg) {
            ctx.drawImage(bgImg, 0, 0);
        } else {
            this.renderer.clear('#020208');
        }

        // 2. Stairs
        ctx.fillStyle = '#333344';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(160 + (i * 10), 142 - (i * 12), 60, 12);
        }

        // 3. Giant Holy Keg
        ctx.fillStyle = this.renderer.atari9BitToRgb([5, 3, 1]);
        ctx.fillRect(210, 72, 30, 25);
        ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
        ctx.fillRect(208, 74, 34, 3);
        ctx.fillRect(208, 90, 34, 3);

        // 4. Particles
        this.particles.forEach(p => {
            ctx.fillStyle = this.renderer.atari9BitToRgb(p.color);
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3);
        });

        // 5. Runner Sprite
        let frameIndex = 0;
        if (this.timer < 4.0) {
            frameIndex = Math.floor((this.timer * 8) % 4);
        } else if (this.timer < 6.0) {
            frameIndex = 4;
        } else {
            frameIndex = 5;
        }

        if (this.assetLoader) {
            this.assetLoader.drawSprite(
                ctx,
                'runner_sheet',
                frameIndex, 0,
                24, 32,
                this.runnerX, this.runnerY
            );
        }

        // 6. Title Text
        ctx.font = "bold 9px monospace";
        if (this.timer >= 6.0) {
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
            ctx.fillText("THE HOLY KEG IS LIT!", 95, 20);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillText("DRINKING GAMES 1988", 95, 20);
        }

        // 7. KARAOKE LYRICS DISPLAY (Synced to Song Loop)
        this.renderKaraokeBox(ctx);

        // Footer Prompt
        if (Math.floor(this.timer * 3) % 2 === 0) {
            ctx.fillStyle = '#00ff00';
            ctx.font = "8px monospace";
            ctx.fillText("PRESS SPACE / START TO CONTINUE", 75, 192);
        }
    }

    /**
     * Renders synchronized 8-bit Karaoke Lyrics Overlay
     */
    /**
     * Renders mathematically synchronized 8-bit Karaoke Lyrics Overlay
     */
    renderKaraokeBox(ctx) {
        if (!this.activeMusicAsset || !this.activeMusicAsset.lyrics) return;

        // FETCH EXACT BEAT FROM HARDWARE CLOCK! (100% Sync)
        const currentBeat = this.musicPlayer ? this.musicPlayer.getCurrentBeat() : 0;
        
        const currentLyric = this.activeMusicAsset.lyrics.find(
            l => currentBeat >= l.startBeat && currentBeat < l.endBeat
        );

        if (currentLyric) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(10, 145, 300, 32);
            ctx.strokeStyle = this.renderer.atari9BitToRgb([7, 5, 0]); // Gold Frame
            ctx.strokeRect(10, 145, 300, 32);

            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
            ctx.font = "7px monospace";
            // Make the karaoke header pulse to the beat!
            const beatPulse = (currentBeat % 1.0 < 0.2) ? ">>>" : "🎤 ";
            ctx.fillText(`${beatPulse} PUB SING-ALONG KARAOKE:`, 15, 154);

            ctx.fillStyle = '#ffffff';
            ctx.font = "bold 8px monospace";
            ctx.fillText(currentLyric.line1, 15, 165);

            ctx.fillStyle = '#00ff00';
            ctx.fillText(currentLyric.line2, 15, 173);
        }
    }
}