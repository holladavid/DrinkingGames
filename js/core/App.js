import AtariRenderer from '../render/AtariRenderer.js';
import GameLoop from './GameLoop.js';
import UnifiedInput from '../input/UnifiedInput.js';
import ChiptuneSynth from '../audio/ChiptuneSynth.js';
import MusicPlayer from '../audio/MusicPlayer.js';
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

        this.sponsors = [];
        this.stateMachine = new StateMachine();

        // Register BOOT State (Shows instant retro loading screen)
        this.stateMachine.registerState(STATES.BOOT, {
            render: () => {
                this.renderer.clear('#000000');
                const ctx = this.renderer.ctx;
                ctx.fillStyle = '#00ff00';
                ctx.font = "8px monospace";
                ctx.fillText("LOADING ATARI ST SYSTEM DATA...", 80, 100);
            }
        });

        // Start Game Loop IMMEDIATELY in BOOT state
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();

        // Initialize App & Load Data asynchronously
        this.init();
    }

    async init() {
        await this.loadSponsorsData();

        // Instantiate Component Managers
        this.intro = new IntroAnimation(this.renderer, this.synth);
        this.lobby = new LobbyManager(this.renderer, this.synth, this.musicPlayer, this.sponsors);

        // Register State Machine Handlers
        this.stateMachine.registerState(STATES.INTRO, {
            onEnter: () => this.intro.reset(),
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

        // Data ready -> Transition to INTRO
        this.stateMachine.transitionTo(STATES.INTRO);
    }

    async loadSponsorsData() {
        try {
            const res = await fetch('./data/sponsors.json');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            this.sponsors = data.sponsors;
            console.log(" Sponsors Loaded Successfully:", this.sponsors);
        } catch (err) {
            console.error("Error loading sponsors.json, using fallback", err);
            // Fallback default sponsor
            this.sponsors = [{
                id: "grinness",
                name: "Grinness",
                drink_type: "Irish Stout",
                theme_color: "#111111",
                flag: { primary_color: "#111", secondary_color: "#760", logo_symbol: "lute" }
            }];
        }
    }

    update(dt) {
        this.input.update();
        this.stateMachine.update(dt, this.input);
    }

    render() {
        // 1. Let current active state draw onto offscreen buffer
        this.stateMachine.render();

        // 2. CENTRALLY PRESENT OFFSCREEN BUFFER TO CANVAS + CRT SCANLINES
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