/**
 * Main Application Bootstrapper
 * Atari ST Style Drinking Games
 */
class App {
    constructor() {
        this.canvas = document.getElementById('atari-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        console.log(" Atari ST Engine Core Initialized [320x200 Mode]");
        this.init();
    }

    init() {
        // Initial Test Screen
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, 320, 200);

        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = "8px monospace";
        this.ctx.fillText("ATARI ST SYSTEM READY.", 10, 20);
        this.ctx.fillText("WAITING FOR STATE MACHINE...", 10, 35);
    }
}

// Boot up when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});