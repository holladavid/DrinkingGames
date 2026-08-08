import AtariRenderer from '../render/AtariRenderer.js';
import GameLoop from './GameLoop.js';
import UnifiedInput from '../input/UnifiedInput.js';
import ChiptuneSynth from '../audio/ChiptuneSynth.js';
import MusicPlayer from '../audio/MusicPlayer.js';

/**
 * Main Application Controller
 */
class App {
    constructor() {
        this.renderer = new AtariRenderer('atari-canvas');
        this.input = new UnifiedInput();
        
        // Initialize Audio Engine
        this.synth = new ChiptuneSynth();
        this.musicPlayer = new MusicPlayer(this.synth);

        // Sponsor & Game State
        this.sponsors = [];
        this.currentSponsorIndex = 0;
        this.bac = 0.0; // Promillewert (BAC)
        this.isAudioStarted = false;

        this.loadSponsorsData();

        // Engine Game Loop
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );

        this.loop.start();
    }

    async loadSponsorsData() {
        try {
            const res = await fetch('./data/sponsors.json');
            const data = await res.json();
            this.sponsors = data.sponsors;
            console.log(" Loaded Sponsors Data:", this.sponsors);
        } catch (err) {
            console.error("Failed to load sponsors.json", err);
        }
    }

    update(dt) {
        this.input.update();

        // 1. CYCLE SPONSOR (BUTTON A / Left)
        if (this.input.isJustPressed('BUTTON_A') && this.sponsors.length > 0) {
            this.currentSponsorIndex = (this.currentSponsorIndex - 1 + this.sponsors.length) % this.sponsors.length;
            this.synth.playSelectSFX();
            this.playActiveSponsorMusic();
        }

        // 2. CYCLE SPONSOR (BUTTON B / Right)
        if (this.input.isJustPressed('BUTTON_B') && this.sponsors.length > 0) {
            this.currentSponsorIndex = (this.currentSponsorIndex + 1) % this.sponsors.length;
            this.synth.playSelectSFX();
            this.playActiveSponsorMusic();
        }

        // 3. TOGGLE DRUNK MODE / PLAY ANTHEM (START / Space)
        if (this.input.isJustPressed('START')) {
            this.isAudioStarted = true;
            this.synth.playConfirmSFX();
            
            // Toggle Promille (0.0‰ <-> 2.5‰)
            this.bac = this.bac === 0.0 ? 2.5 : 0.0;
            this.playActiveSponsorMusic();
        }
    }

    playActiveSponsorMusic() {
        if (this.sponsors.length === 0) return;
        const activeSponsor = this.sponsors[this.currentSponsorIndex];
        this.musicPlayer.playSponsorAnthem(activeSponsor, this.bac);
    }

    render() {
        const activeSponsor = this.sponsors[this.currentSponsorIndex];

        // Clear screen with sponsor theme color or dark default
        this.renderer.clear(activeSponsor ? activeSponsor.theme_color : '#050508');

        // Render Copperbars
        this.renderer.updateAndRenderCopperbars();

        // Render Status Header
        this.renderer.renderStatusHeader(
            "YAMAHAYM2149 SOUND ENGINE",
            `BAC: ${this.bac.toFixed(1)}‰`
        );

        const ctx = this.renderer.ctx;

        if (activeSponsor) {
            // Draw Sponsor Branding Card
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(40, 50, 240, 90);
            ctx.fillStyle = '#000000';
            ctx.fillRect(42, 52, 236, 86);

            // Flag Color Box
            ctx.fillStyle = activeSponsor.flag.primary_color;
            ctx.fillRect(52, 62, 48, 28);
            ctx.strokeStyle = activeSponsor.flag.secondary_color || '#ffffff';
            ctx.strokeRect(52, 62, 48, 28);

            // Card Text
            ctx.fillStyle = '#ffffff';
            ctx.font = "bold 10px monospace";
            ctx.fillText(activeSponsor.name.toUpperCase(), 110, 75);

            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
            ctx.font = "8px monospace";
            ctx.fillText(`TYPE:   ${activeSponsor.drink_type}`, 110, 92);
            ctx.fillText(`SYMBOL: ${activeSponsor.flag.logo_symbol}`, 110, 107);
            
            ctx.fillStyle = this.bac > 0 ? this.renderer.atari9BitToRgb([7, 0, 0]) : this.renderer.atari9BitToRgb([0, 7, 0]);
            ctx.fillText(`MODE:   ${this.bac > 0 ? 'DRUNKEN LALL-EFFEKT' : 'SOBER ANTHEM'}`, 110, 122);
        }

        // Control Footer
        ctx.fillStyle = '#00ff00';
        ctx.font = "8px monospace";
        ctx.fillText("PRESS A / D TO SWITCH SPONSOR & ANTHEM", 25, 165);
        ctx.fillText("PRESS SPACE / START TO TOGGLE DRUNK MODE", 18, 180);

        this.renderer.present();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});