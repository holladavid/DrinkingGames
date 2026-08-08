import AtariRenderer from '../render/AtariRenderer.js';
import GameLoop from './GameLoop.js';

/**
 * Main Application Controller
 */
class App {
    constructor() {
        // Initialize Atari ST Hardware Renderer
        this.renderer = new AtariRenderer('atari-canvas');
        
        // Frame Counter for Retro Animations
        this.frameCounter = 0;

        // Initialize Engine Game Loop
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );

        console.log(" Atari ST Shifter Engine & Game Loop initialized successfully!");
        this.loop.start();
    }

    /**
     * Logic Update Step
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        this.frameCounter++;
    }

    /**
     * Graphics Render Step
     */
    render() {
        // 1. Clear offscreen frame buffer with dark background
        this.renderer.clear('#050508');

        // 2. Render Copperbars background raster interrupts
        this.renderer.updateAndRenderCopperbars();

        // 3. Render Status Header Bar
        this.renderer.renderStatusHeader(
            "DRINKING GAMES V1.0",
            "SHIFTER: 320x200"
        );

        // 4. Center Title Demo Text
        const ctx = this.renderer.ctx;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px 'Courier New', monospace";
        ctx.fillText("ATARI ST ENGINE ACTIVE", 80, 95);

        ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]); // Amber
        ctx.font = "8px 'Courier New', monospace";
        ctx.fillText("PRESS ANY KEY TO START TURN", 75, 115);

        // 5. Present frame to screen + CRT Scanline Shader
        this.renderer.present();
    }
}

// Boot up app on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});