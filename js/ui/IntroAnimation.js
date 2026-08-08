/**
 * Summer Games Torch Lighting Parody ("Lighting of the Holy Keg")
 * Features 8-bit runner animation, particle fire, giant foaming keg ignition,
 * flying foam pigeons, and a procedural YM2149 fanfare.
 */
export default class IntroAnimation {
    constructor(renderer, synth) {
        this.renderer = renderer;
        this.synth = synth;
        this.isFinished = false;

        // Animation Timer & State
        this.timer = 0; // In Seconds
        this.particles = [];
        this.fanfarePlayed = false;

        // Runner position
        this.runnerX = -30;
        this.runnerY = 150;
    }

    reset() {
        this.timer = 0;
        this.isFinished = false;
        this.fanfarePlayed = false;
        this.runnerX = -30;
        this.runnerY = 150;
        this.particles = [];
    }

    update(dt, input) {
        this.timer += dt;

        // Allow skipping intro with START / Space / Touch
        if (input.isJustPressed('START') || input.isJustPressed('BUTTON_A')) {
            this.isFinished = true;
            return;
        }

        // --- PHASE 1: RUNNING (0s to 4s) ---
        if (this.timer < 4.0) {
            this.runnerX += dt * 55; // Move right
            // Spawn flame particles from torch
            this.spawnFlameParticle(this.runnerX + 16, this.runnerY - 12);
        }
        // --- PHASE 2: CLIMBING STAIRS (4s to 6s) ---
        else if (this.timer < 6.0) {
            this.runnerX += dt * 20;
            this.runnerY -= dt * 25; // Climb stairs
            this.spawnFlameParticle(this.runnerX + 16, this.runnerY - 12);
        }
        // --- PHASE 3: LIGHTING THE KEG & FANFARE (6s to 10s) ---
        else if (this.timer >= 6.0) {
            if (!this.fanfarePlayed) {
                this.playOlympicFanfare();
                this.fanfarePlayed = true;
            }
            // Spawn massive beer foam & firework particles from the giant keg
            this.spawnKegFoamParticle(220, 80);
        }

        // Update particle physics
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        // Auto transition after 10 seconds
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
            color: Math.random() > 0.5 ? [7, 5, 0] : [7, 0, 0] // Yellow or Red
        });
    }

    spawnKegFoamParticle(x, y) {
        this.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 40,
            vy: -Math.random() * 50 - 20,
            life: 0.8,
            color: Math.random() > 0.3 ? [7, 7, 7] : [7, 6, 2] // White or Gold foam
        });
    }

    playOlympicFanfare() {
        this.synth.resume();
        const now = this.synth.ctx.currentTime;
        // Majestetische 8-Bit Fanfahre
        this.synth.playTone(392, now, 0.2, 0.3);        // G4
        this.synth.playTone(523.25, now + 0.25, 0.2, 0.3); // C5
        this.synth.playTone(659.25, now + 0.5, 0.2, 0.3);  // E5
        this.synth.playTone(783.99, now + 0.75, 0.6, 0.4); // G5 (Hold)
    }

    render() {
        const ctx = this.renderer.ctx;

        // Clear Background (Night Stadium Sky)
        this.renderer.clear('#020208');

        // Draw Stadium Crowd Silhouettes
        ctx.fillStyle = '#111122';
        ctx.fillRect(0, 130, 320, 70);

        // Draw Stairs to the Holy Keg
        ctx.fillStyle = '#333344';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(160 + (i * 10), 150 - (i * 12), 60, 12);
        }

        // Draw The Giant Holy Beer Keg (The Cauldron)
        ctx.fillStyle = this.renderer.atari9BitToRgb([5, 3, 1]); // Wood/Bronze
        ctx.fillRect(210, 80, 30, 25);
        ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]); // Gold Hoops
        ctx.fillRect(208, 82, 34, 3);
        ctx.fillRect(208, 98, 34, 3);

        // Draw Animated Flame Particles
        this.particles.forEach(p => {
            ctx.fillStyle = this.renderer.atari9BitToRgb(p.color);
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3);
        });

        // Draw Runner Sprite (8-Bit Pixel Character)
        if (this.timer < 6.0) {
            const legOffset = Math.sin(this.timer * 20) * 4;
            
            // Body
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(Math.floor(this.runnerX), Math.floor(this.runnerY), 8, 14);
            // Head
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 3]);
            ctx.fillRect(Math.floor(this.runnerX + 1), Math.floor(this.runnerY - 6), 6, 6);
            // Legs
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(Math.floor(this.runnerX + 1 + legOffset), Math.floor(this.runnerY + 14), 3, 6);
            ctx.fillRect(Math.floor(this.runnerX + 4 - legOffset), Math.floor(this.runnerY + 14), 3, 6);

            // Torch Mug in hand
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
            ctx.fillRect(Math.floor(this.runnerX + 10), Math.floor(this.runnerY - 8), 6, 8);
        } else {
            // Runner triumphantly raising torch next to the keg!
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(195, 75, 8, 14);
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 3]);
            ctx.fillRect(196, 69, 6, 6);
        }

        // Title Text Overlays
        ctx.fillStyle = '#ffffff';
        ctx.font = "bold 9px monospace";
        if (this.timer >= 6.0) {
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
            ctx.fillText("THE HOLY KEG IS LIT!", 95, 35);
            ctx.fillStyle = '#ffffff';
            ctx.fillText("LET THE GAMES BEGIN!", 90, 50);
        } else {
            ctx.fillText("DRINKING GAMES 1988", 95, 30);
        }

        // Footer Hint
        ctx.fillStyle = '#666666';
        ctx.font = "8px monospace";
        ctx.fillText("PRESS START TO SKIP INTRO", 85, 190);
    }
}