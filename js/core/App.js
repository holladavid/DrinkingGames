import AtariRenderer from '../render/AtariRenderer.js';
import GameLoop from './GameLoop.js';
import UnifiedInput from '../input/UnifiedInput.js';

/**
 * Main Application Controller
 */
class App {
    constructor() {
        // Initialize Atari ST Hardware Renderer
        this.renderer = new AtariRenderer('atari-canvas');
        
        // Initialize Unified Input Controller
        this.input = new UnifiedInput();

        // Counter for triggers
        this.confirmCount = 0;

        // Initialize Engine Game Loop
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );

        console.log(" Atari ST Input System & Engine Ready!");
        this.loop.start();
    }

    /**
     * Logic Update Step
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // 1. MUST UPDATE INPUT CONTROLLER EVERY FRAME
        this.input.update();

        // Test Edge-Detection (Just Pressed)
        if (this.input.isJustPressed('START')) {
            this.confirmCount++;
        }
    }

    /**
     * Graphics Render Step
     */
    render() {
        // 1. Clear offscreen frame buffer
        this.renderer.clear('#050508');

        // 2. Render Copperbars background
        this.renderer.updateAndRenderCopperbars();

        // 3. Render Status Header Bar
        this.renderer.renderStatusHeader(
            "INPUT TEST MODE",
            "UNIFIED CONTROLLER"
        );

        const ctx = this.renderer.ctx;

        // 4. Draw Input Status Indicators (Atari ST Style Boxes)
        
        // --- BUTTON A INDICATOR ---
        ctx.fillStyle = this.input.isPressed('BUTTON_A') ? this.renderer.atari9BitToRgb([7, 0, 0]) : '#222222';
        ctx.fillRect(30, 80, 70, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = "8px monospace";
        ctx.fillText("BUTTON A", 40, 98);

        // --- BUTTON B INDICATOR ---
        ctx.fillStyle = this.input.isPressed('BUTTON_B') ? this.renderer.atari9BitToRgb([0, 7, 0]) : '#222222';
        ctx.fillRect(220, 80, 70, 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillText("BUTTON B", 230, 98);

        // --- START INDICATOR ---
        ctx.fillStyle = this.input.isPressed('START') ? this.renderer.atari9BitToRgb([7, 5, 0]) : '#222222';
        ctx.fillRect(110, 125, 100, 25);
        ctx.fillStyle = '#ffffff';
        ctx.fillText("START / CONFIRM", 118, 140);

        // Counter Info Text
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`START TRIGGER COUNT: ${this.confirmCount}`, 90, 175);
        ctx.fillText("KEYS: A/D/Arrows/Space | TOUCH: Left/Right", 50, 190);

        // 5. Present frame to screen + CRT Scanline Shader
        this.renderer.present();
    }
}

// Boot up app on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});