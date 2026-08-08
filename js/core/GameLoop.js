/**
 * Game Loop Engine
 * Provides deterministic 50Hz/60Hz frame timing for turn-based sports updates and rendering.
 */
export default class GameLoop {
    constructor(updateCallback, renderCallback) {
        this.update = updateCallback;
        this.render = renderCallback;
        
        this.lastTime = 0;
        this.isRunning = false;
        this.requestId = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    stop() {
        this.isRunning = false;
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        // Game State Update & Render Cycle
        this.update(deltaTime);
        this.render();

        this.requestId = requestAnimationFrame((time) => this.loop(time));
    }
}