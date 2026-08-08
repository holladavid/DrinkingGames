/**
 * Atari ST Shifter Video Chip Emulator
 * Handles 320x200 low-resolution double-buffering, 9-bit hardware palette conversions,
 * demoscene raster copperbars, and CRT scanline post-processing.
 */
export default class AtariRenderer {
    constructor(canvasId) {
        this.targetCanvas = document.getElementById(canvasId);
        this.targetCtx = this.targetCanvas.getContext('2d');

        // Target Canvas Resolution bounds
        this.width = 320;
        this.height = 200;

        // Offscreen Canvas Buffer for flicker-free double buffering
        this.offscreen = document.createElement('canvas');
        this.offscreen.width = this.width;
        this.offscreen.height = this.height;
        this.ctx = this.offscreen.getContext('2d');

        // Scanline intensity for CRT filter (0.0 to 1.0)
        this.scanlineIntensity = 0.22;

        // Dynamic Copperbars (Raster interrupt color sweeps)
        this.copperBars = [
            { y: 40, speed: 1.2, height: 18, direction: 1, color: [7, 0, 0] },   // Retro Red
            { y: 110, speed: -1.5, height: 24, direction: -1, color: [0, 5, 7] }, // Atari Blue
            { y: 160, speed: 0.9, height: 14, direction: 1, color: [7, 5, 0] }   // Gold/Amber
        ];

        // Disable browser image smoothing for razor-sharp pixel art
        this.targetCtx.imageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * Converts an Atari ST 9-Bit RGB triplet [R,G,B] (0-7 per channel)
     * into a standard CSS rgb() string.
     * @param {number[]} triplet - e.g. [7, 0, 0] for bright red
     * @returns {string} - e.g. "rgb(255, 0, 0)"
     */
    atari9BitToRgb(triplet) {
        const [r, g, b] = triplet;
        const r255 = Math.round((r / 7) * 255);
        const g255 = Math.round((g / 7) * 255);
        const b255 = Math.round((b / 7) * 255);
        return `rgb(${r255}, ${g255}, ${b255})`;
    }

    /**
     * Clears the offscreen buffer with a background color
     * @param {string} colorCss - Background color
     */
    clear(colorCss = '#000000') {
        this.ctx.fillStyle = colorCss;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Animates and renders horizontal raster copperbars (Atari ST Demo Effect)
     */
    updateAndRenderCopperbars() {
        this.copperBars.forEach((bar) => {
            // Update raster positions
            bar.y += bar.speed * bar.direction;
            if (bar.y < 32 || bar.y > 165) {
                bar.direction *= -1;
            }

            // Create smooth vertical gradient sweep for each bar
            const grad = this.ctx.createLinearGradient(0, bar.y, 0, bar.y + bar.height);
            const mainColor = this.atari9BitToRgb(bar.color);
            
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(0.3, mainColor);
            grad.addColorStop(0.5, "#ffffff"); // White hot center core
            grad.addColorStop(0.7, mainColor);
            grad.addColorStop(1, "rgba(0,0,0,0)");

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, bar.y, this.width, bar.height);
        });
    }

    /**
     * Renders high-contrast Atari ST Medium-Res top status header
     */
    renderStatusHeader(titleText, systemText) {
        // Dark top panel
        this.ctx.fillStyle = "#0a0a0a";
        this.ctx.fillRect(0, 0, this.width, 24);

        // Gold divider line
        this.ctx.fillStyle = this.atari9BitToRgb([7, 5, 0]);
        this.ctx.fillRect(0, 23, this.width, 1);

        // Header Text
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "8px 'Courier New', monospace";
        this.ctx.fillText(titleText, 8, 14);

        this.ctx.fillStyle = this.atari9BitToRgb([0, 7, 2]); // Atari Emerald Green
        this.ctx.fillText(systemText, 190, 14);
    }

    /**
     * Applies physical CRT monitor beam scanline darkening
     */
    applyScanlineFilter() {
        this.targetCtx.fillStyle = `rgba(0, 0, 0, ${this.scanlineIntensity})`;
        for (let y = 0; y < this.height; y += 2) {
            this.targetCtx.fillRect(0, y, this.width, 1);
        }
    }

    /**
     * Blits offscreen buffer to visible Canvas and applies CRT filter
     */
    present() {
        // 1. Copy offscreen pixel buffer to the main target canvas
        this.targetCtx.drawImage(this.offscreen, 0, 0, this.width, this.height);

        // 2. Post-process CRT scanlines overlay
        this.applyScanlineFilter();
    }
}