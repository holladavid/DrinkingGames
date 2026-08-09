/**
 * Bavarian Athlete Spritesheet Animator (32x48 Low-Res Grid)
 * Controls 18 frames across 4 animation states: run, climb, swing, triumph.
 */
export default class AthleteAnimator {
    constructor(canvasContext, spritesheetImage) {
        this.ctx = canvasContext;
        this.image = spritesheetImage;

        // Atari ST 320x200 Standard Sprite Dimensions
        this.spriteWidth = 32;
        this.spriteHeight = 48;

        // Animations: [Row in Sheet, Frame Count, Frame Duration in MS]
        this.animations = {
            'run':     { row: 0, frameCount: 6, speed: 100 }, // Row 0 (Y = 0)
            'climb':   { row: 1, frameCount: 4, speed: 120 }, // Row 1 (Y = 48)
            'swing':   { row: 2, frameCount: 4, speed: 80  }, // Row 2 (Y = 96) - Fast tap
            'triumph': { row: 3, frameCount: 4, speed: 150 }  // Row 3 (Y = 144) - Victory
        };

        this.currentAnim = 'run';
        this.currentFrame = 0;
        this.timer = 0;
    }

    /**
     * Changes active animation state
     */
    setAnimation(animName) {
        if (this.animations[animName] && this.currentAnim !== animName) {
            this.currentAnim = animName;
            this.currentFrame = 0;
            this.timer = 0;
        }
    }

    /**
     * Updates frame index based on delta time in seconds
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        const anim = this.animations[this.currentAnim];
        this.timer += (dt * 1000); // Convert seconds to milliseconds

        if (this.timer >= anim.speed) {
            this.timer = 0;
            this.currentFrame = (this.currentFrame + 1) % anim.frameCount;
        }
    }

    /**
     * Blits active sprite frame onto canvas
     */
    draw(x, y, flipX = false) {
        if (!this.image) return;

        const anim = this.animations[this.currentAnim];
        const sourceX = this.currentFrame * this.spriteWidth;
        const sourceY = anim.row * this.spriteHeight;

        this.ctx.save();

        if (flipX) {
            this.ctx.translate(x + this.spriteWidth, y);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                this.image,
                sourceX, sourceY, this.spriteWidth, this.spriteHeight,
                0, 0, this.spriteWidth, this.spriteHeight
            );
        } else {
            this.ctx.drawImage(
                this.image,
                sourceX, sourceY, this.spriteWidth, this.spriteHeight,
                Math.floor(x), Math.floor(y), this.spriteWidth, this.spriteHeight
            );
        }

        this.ctx.restore();
    }
}