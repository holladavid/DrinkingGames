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
        this.version = "v1.0.0";
        this.renderer = new AtariRenderer('atari-canvas');
        this.input = new UnifiedInput();
        this.synth = new ChiptuneSynth();
        this.musicPlayer = new MusicPlayer(this.synth);
        this.assetLoader = new AssetLoader();

        this.sponsors = [];
        this.musicAssets = {};
        this.stateMachine = new StateMachine();

        // Boot & Loading State Variables
        this.isLoaded = false;
        this.blinkTimer = 0;

        // Register BOOT State (Shows System Info, Revision Number, Progress & Keypress Prompt)
        this.stateMachine.registerState(STATES.BOOT, {
            update: (dt, input) => {
                this.blinkTimer += dt;

                // Wait for explicit user input once loading hits 100%
                if (this.isLoaded) {
                    if (input.isJustPressed('START') || input.isJustPressed('BUTTON_A')) {
                        this.synth.resume();
                        this.synth.playConfirmSFX();
                        this.stateMachine.transitionTo(STATES.INTRO);
                    }
                }
            },
            render: () => {
                this.renderer.clear('#000000');
                const ctx = this.renderer.ctx;

                // Header Title & Version Number
                ctx.fillStyle = '#ffffff';
                ctx.font = "bold 10px monospace";
                ctx.fillText("ATARI ST DRINKING GAMES", 80, 48);

                ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]); // Amber Gold
                ctx.font = "8px monospace";
                ctx.fillText(`SYSTEM REVISION ${this.version}`, 92, 65);

                // Progress Bar Frame
                ctx.strokeStyle = '#ffffff';
                ctx.strokeRect(40, 95, 240, 16);

                const progress = this.assetLoader.getProgress();
                ctx.fillStyle = this.renderer.atari9BitToRgb([0, 7, 0]); // Emerald Green
                ctx.fillRect(42, 97, Math.floor(236 * progress), 12);

                if (!this.isLoaded) {
                    ctx.fillStyle = '#888888';
                    ctx.font = "8px monospace";
                    ctx.fillText(`LOADING ASSETS: ${Math.floor(progress * 100)}%`, 105, 128);
                } else {
                    // Blinking "PRESS START" Prompt once loaded
                    if (Math.floor(this.blinkTimer * 3) % 2 === 0) {
                        ctx.fillStyle = '#00ff00';
                        ctx.font = "bold 9px monospace";
                        ctx.fillText("PRESS SPACE / START TO BEGIN", 70, 138);
                    }
                    ctx.fillStyle = '#666666';
                    ctx.font = "8px monospace";
                    ctx.fillText("(C) 1988 GEMINI SOFT - ATARI ST", 75, 180);
                }
            }
        });

        // Start Game Loop IMMEDIATELY in BOOT state
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();

        this.init();
    }

    async init() {
// 1. Load Graphic Assets Manifest
        await this.assetLoader.loadManifest({
            'stadium_bg': 'assets/gfx/background/stadium_intro.png',
            'podium_bg': 'assets/gfx/background/podium_scene.png',
            'judges_sheet': 'assets/gfx/judges/judges_sheet.png',
            'bavarian_athlete': 'assets/gfx/sprites/bavarian_athlete_spritesheet.png'
        });

        // 2. Load Sponsors & Music Assets
        await this.loadSponsorsData();
        await this.loadMusicAssets();

        // Instantiate Component Managers
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

        this.stateMachine.registerState(STATES.START_SCREEN, {
            update: (dt, input) => {
                if (input.isJustPressed('START')) {
                    this.synth.playConfirmSFX();
                    this.stateMachine.transitionTo(STATES.LOBBY);
                }
            },
            render: () => this.renderStartScreen()
        });

        this.stateMachine.registerState(STATES.LOBBY, {
            update: (dt, input) => this.lobby.update(input),
            render: () => this.lobby.render()
        });

        // Assets & System Ready! Activate Press Start Prompt on BOOT Screen
        this.isLoaded = true;
    }

    async loadSponsorsData() {
        try {
            const res = await fetch('./data/sponsors.json');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            this.sponsors = data.sponsors;
        } catch (err) {
            console.error("Error loading sponsors.json", err);
        }
    }

    async loadMusicAssets() {
        try {
            const res = await fetch('./data/music/intro_theme.json');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            this.musicAssets['intro_theme'] = data;
            console.log(" Loaded Music Asset: intro_theme.json");
        } catch (err) {
            console.error("Error loading intro_theme.json", err);
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