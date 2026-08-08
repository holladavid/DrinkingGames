/**
 * Summer Games Torch Lighting Parody ("Lighting of the Holy Keg")
 * Uses AssetLoader for retro backgrounds and sprite blitting.
 */
export default class IntroAnimation {
    constructor(renderer, synth, assetLoader) {
        this.renderer = renderer;
        this.synth = synth;
        this.assetLoader = assetLoader;

        this.isFinished = false;
        this.timer = 0;
        this.particles = [];
        this.fanfarePlayed = false;

        this.runnerX = -30;
        this.runnerY = 142;
    }

    reset(introMusicAsset) {
        this.timer = 0;
        this.isFinished = false;
        this.fanfarePlayed = false;
        this.runnerX = -30;
        this.runnerY = 132;
        this.particles = [];

        // Play preloaded Intro Track JSON Asset!
        if (introMusicAsset) {
            this.musicPlayer.playTrack(introMusicAsset, 0.0);
        }
    }

    update(dt, input) {
        this.timer += dt;

        if (input.isJustPressed('START') || input.isJustPressed('BUTTON_A')) {
            this.isFinished = true;
            return;
        }

        // Runner Movement
        if (this.timer < 4.0) {
            this.runnerX += dt * 55;
            this.spawnFlameParticle(this.runnerX + 16, this.runnerY - 12);
        } else if (this.timer < 6.0) {
            this.runnerX += dt * 20;
            this.runnerY -= dt * 25;
            this.spawnFlameParticle(this.runnerX + 16, this.runnerY - 12);
        } else if (this.timer >= 6.0) {
            if (!this.fanfarePlayed) {
                this.playOlympicFanfare();
                this.fanfarePlayed = true;
            }
            this.spawnKegFoamParticle(220, 80);
        }

        // Update Particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        if (this.timer > 10.0) {
            this.isFinished = true;
        }
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
        this.synth.resume();
        const now = this.synth.ctx.currentTime;
        this.synth.playTone(392, now, 0.2, 0.3);        // G4
        this.synth.playTone(523.25, now + 0.25, 0.2, 0.3); // C5
        this.synth.playTone(659.25, now + 0.5, 0.2, 0.3);  // E5
        this.synth.playTone(783.99, now + 0.75, 0.6, 0.4); // G5
    }

    render() {
        const ctx = this.renderer.ctx;

        // 1. Draw Preloaded Pixel Art Stadium Background from AssetLoader!
        const bgImg = this.assetLoader.get('stadium_bg');
        if (bgImg) {
            ctx.drawImage(bgImg, 0, 0);
        } else {
            this.renderer.clear('#020208');
        }

        // 2. Draw Stairs to the Holy Keg
        ctx.fillStyle = '#333344';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(160 + (i * 10), 142 - (i * 12), 60, 12);
        }

        // 3. Draw Giant Holy Beer Keg (Cauldron)
        ctx.fillStyle = this.renderer.atari9BitToRgb([5, 3, 1]);
        ctx.fillRect(210, 72, 30, 25);
        ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
        ctx.fillRect(208, 74, 34, 3);
        ctx.fillRect(208, 90, 34, 3);

        // 4. Draw Flame & Foam Particles
        this.particles.forEach(p => {
            ctx.fillStyle = this.renderer.atari9BitToRgb(p.color);
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3);
        });

        // 5. Draw Runner
        if (this.timer < 6.0) {
            const legOffset = Math.sin(this.timer * 20) * 4;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(Math.floor(this.runnerX), Math.floor(this.runnerY), 8, 14);
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 3]);
            ctx.fillRect(Math.floor(this.runnerX + 1), Math.floor(this.runnerY - 6), 6, 6);
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(Math.floor(this.runnerX + 1 + legOffset), Math.floor(this.runnerY + 14), 3, 6);
            ctx.fillRect(Math.floor(this.runnerX + 4 - legOffset), Math.floor(this.runnerY + 14), 3, 6);

            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
            ctx.fillRect(Math.floor(this.runnerX + 10), Math.floor(this.runnerY - 8), 6, 8);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(195, 67, 8, 14);
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 3]);
            ctx.fillRect(196, 61, 6, 6);
        }

        // 6. Text Overlays
        ctx.font = "bold 9px monospace";
        if (this.timer >= 6.0) {
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
            ctx.fillText("THE HOLY KEG IS LIT!", 95, 25);
            ctx.fillStyle = '#ffffff';
            ctx.fillText("LET THE GAMES BEGIN!", 90, 40);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillText("DRINKING GAMES 1988", 95, 25);
        }

        ctx.fillStyle = '#888888';
        ctx.font = "8px monospace";
        ctx.fillText("PRESS START TO SKIP INTRO", 85, 192);
    }
}