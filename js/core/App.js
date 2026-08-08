import AtariRenderer from '../render/AtariRenderer.js';
import GameLoop from './GameLoop.js';
import UnifiedInput from '../input/UnifiedInput.js';
import ChiptuneSynth from '../audio/ChiptuneSynth.js';
import MusicPlayer from '../audio/MusicPlayer.js';
import StateMachine, { STATES } from './StateMachine.js';
import IntroAnimation from '../ui/IntroAnimation.js';
import LobbyManager from '../ui/LobbyManager.js';

class App {
    constructor() {
        this.renderer = new AtariRenderer('atari-canvas');
        this.input = new UnifiedInput();
        this.synth = new ChiptuneSynth();
        this.musicPlayer = new MusicPlayer(this.synth);

        this.sponsors = [];
        this.stateMachine = new StateMachine();

        this.init();
    }

    async init() {
        // Load data
        await this.loadSponsorsData();

        // Instantiate States
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

        // Start Loop and transition to INTRO
        this.loop = new GameLoop((dt) => this.update(dt), () => this.render());
        this.stateMachine.transitionTo(STATES.INTRO);
        this.loop.start();
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

        this.renderer.present();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});