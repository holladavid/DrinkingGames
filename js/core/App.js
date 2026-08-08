import AtariRenderer from '../render/AtariRenderer.js';
import GameLoop from './GameLoop.js';
import UnifiedInput from '../input/UnifiedInput.js';
import ChiptuneSynth from '../audio/ChiptuneSynth.js';
import MusicPlayer from '../audio/MusicPlayer.js';
import AssetLoader from './AssetLoader.js';
import StateMachine, { STATES } from './StateMachine.js';
import IntroAnimation from '../ui/IntroAnimation.js';
import LobbyManager from '../ui/LobbyManager.js';

/**
 * Main Application Controller
 */
class App {
    constructor() {
        this.renderer = new AtariRenderer('atari-canvas');
        this.input = new UnifiedInput();
        this.synth = new ChiptuneSynth();
        this.musicPlayer = new MusicPlayer(this.synth);
        
        // Initialize Asset Loader
        this.assetLoader = new AssetLoader();

        this.sponsors = [];
        this.stateMachine = new StateMachine();

        // Register BOOT State (Shows Atari ST Retro Loading Screen with Progress Bar)
        this.stateMachine.registerState(STATES.BOOT, {
            render: () => {
                this.renderer.clear('#000000');
                const ctx = this.renderer.ctx;

                ctx.fillStyle = '#ffffff';
                ctx.font = "bold 9px monospace";
                ctx.fillText("ATARI ST SYSTEM LOADING...", 85, 80);

                // Draw Retro Progress Bar Frame
                ctx.strokeStyle = '#ffffff';
                ctx.strokeRect(40, 95, 240, 16);

                // Fill Green Atari Progress Bar
                const progress = this.assetLoader.getProgress();
                ctx.fillStyle = this.renderer.atari9BitToRgb([0, 7, 0]); // Emerald Green
                ctx.fillRect(42, 97, Math.floor(236 * progress), 12);

                ctx.fillStyle = '#888888';
                ctx.font = "8px monospace";
                ctx.fillText(`${Math.floor(progress * 100)}% COMPLETE`, 120, 125);
            }
        });

        // Start Game Loop IMMEDIATELY in BOOT state
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();

        // Load Assets & Data
        this.init();
    }

    async init() {
        // 1. Load Graphic Assets
        await this.assetLoader.loadManifest({
            'stadium_bg': 'assets/gfx/background/stadium_intro.png',
            'podium_bg': 'assets/gfx/background/podium_scene.png',
            'judges_sheet': 'assets/gfx/judges/judges_sheet.png',
            'runner_sheet': 'assets/gfx/sprites/runner_sheet.png'
        });

        // 2. Load Sponsors & Music Assets
        await this.loadSponsorsData();
        await this.loadMusicAssets();

        // Components
        this.intro = new IntroAnimation(this.renderer, this.synth, this.musicPlayer, this.assetLoader);
        this.lobby = new LobbyManager(this.renderer, this.synth, this.musicPlayer, this.sponsors);

        // Register States
        this.stateMachine.registerState(STATES.INTRO, {
            onEnter: () => this.intro.reset(this.musicAssets['intro_theme']),
            update: (dt, input) => {
                this.intro.update(dt, input);
                if (this.intro.isFinished) {
                    this.stateMachine.transitionTo(STATES.START_SCREEN);
                }
            },
            render: () => this.intro.render()
        });

        // ... Rest der State Registrierungen ...
        this.stateMachine.transitionTo(STATES.INTRO);
    }

    async loadMusicAssets() {
        this.musicAssets = {};
        try {
            const res = await fetch('./data/music/intro_theme.json');
            const data = await res.json();
            this.musicAssets['intro_theme'] = data;
            console.log(" Loaded Music Asset: intro_theme.json");
        } catch (err) {
            console.error("Failed to load music asset", err);
        }
    }

    async loadSponsorsData() {
        try {
            const res = await fetch('./data/sponsors.json');
            const data = await res.json();
            this.sponsors = data.sponsors;
        } catch (err) {
            console.error("Error loading sponsors.json", err);
        }
    }

    update(dt) {
        this.input.update();
        this.stateMachine.update(dt, this.input);
    }

    render() {
        this.stateMachine.render();
        this.renderer.present();
    }

    renderStartScreen() {
        this.renderer.clear('#050508');
        this.renderer.updateAndRenderCopperbars();
        this.renderer.renderStatusHeader("DRINKING GAMES 1988", "PRESS START");

        const ctx = this.renderer.ctx;
        ctx.fillStyle = '#ffffff';
        ctx.font = "bold 12px monospace";
        ctx.fillText("DRINKING GAMES", 90, 85);

        ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
        ctx.font = "8px monospace";
        ctx.fillText("ATARI ST PARTY TOURNAMENT", 85, 105);

        ctx.fillStyle = '#00ff00';
        ctx.fillText("PRESS SPACE / START TO REGISTER PLAYERS", 35, 150);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});