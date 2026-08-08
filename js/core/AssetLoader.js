/**
 * Asynchronous Asset Loader & Sprite Blitter Engine
 * Handles image preloading, progress tracking, sprite sheet slicing,
 * and procedural 8-bit fallbacks.
 */
export default class AssetLoader {
    constructor() {
        this.images = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    /**
     * Loads a single Image Asset
     */
    loadImage(key, src) {
        return new Promise((resolve) => {
            this.totalAssets++;
            const img = new Image();
            img.src = src;

            img.onload = () => {
                this.loadedAssets++;
                this.images[key] = img;
                console.log(`[AssetLoader] Loaded: ${key} (${src})`);
                resolve(img);
            };

            img.onerror = () => {
                console.warn(`[AssetLoader] ${src} not found. Generating 8-Bit Fallback Texture for '${key}'...`);
                const fallbackImg = this.createFallbackTexture(key);
                this.loadedAssets++;
                this.images[key] = fallbackImg;
                resolve(fallbackImg);
            };
        });
    }

    /**
     * Loads a full manifest object { key: src }
     */
    async loadManifest(manifest) {
        const promises = Object.entries(manifest).map(([key, src]) => this.loadImage(key, src));
        await Promise.all(promises);
    }

    /**
     * Returns loading progress ratio (0.0 to 1.0)
     */
    getProgress() {
        return this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 1.0;
    }

    /**
     * Retrieves loaded Image
     */
    get(key) {
        return this.images[key];
    }

    /**
     * Slices and blits a frame from a Spritesheet onto Canvas
     */
    drawSprite(ctx, key, frameX, frameY, frameWidth, frameHeight, destX, destY) {
        const img = this.get(key);
        if (!img) return;

        ctx.drawImage(
            img,
            frameX * frameWidth,
            frameY * frameHeight,
            frameWidth,
            frameHeight,
            Math.floor(destX),
            Math.floor(destY),
            frameWidth,
            frameHeight
        );
    }

    /**
     * Generates a procedural 8-Bit Pixel Art texture fallback if PNG files are missing
     */
    createFallbackTexture(key) {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 200;
        const ctx = c.getContext('2d');

        if (key === 'stadium_bg') {
            // Procedural Retro Stadium Background
            ctx.fillStyle = '#0a0a18';
            ctx.fillRect(0, 0, 320, 200);

            // Crowd Silhouettes
            for (let i = 0; i < 320; i += 8) {
                ctx.fillStyle = (i / 8) % 2 === 0 ? '#1a1a38' : '#2a2a48';
                ctx.fillRect(i, 110, 8, 40);
                // Cheering pixel heads
                ctx.fillStyle = '#ffcc99';
                ctx.fillRect(i + 2, 105, 4, 4);
            }

            // Track & Ground
            ctx.fillStyle = '#883311'; // Clay track
            ctx.fillRect(0, 150, 320, 50);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 150, 320, 2); // White lane line
        } else {
            // Standard Grid Texture
            ctx.fillStyle = '#222222';
            ctx.fillRect(0, 0, 320, 200);
            ctx.fillStyle = '#00ff00';
            ctx.font = '8px monospace';
            ctx.fillText(`TEXTURE: ${key}`, 10, 20);
        }

        const img = new Image();
        img.src = c.toDataURL();
        return img;
    }
}