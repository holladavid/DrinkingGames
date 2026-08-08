/**
 * Unified Input Controller
 * Maps Keyboard, Touchscreen, and HTML5 Gamepad inputs into standard virtual actions:
 * - BUTTON_A (Left / Action 1)
 * - BUTTON_B (Right / Action 2)
 * - START (Confirm / Menu)
 */
export default class UnifiedInput {
    constructor() {
        // Virtual Action States (Current Frame)
        this.state = {
            BUTTON_A: false,
            BUTTON_B: false,
            START: false
        };

        // Previous Frame States (For Edge Detection / Single Pressing)
        this.prevState = {
            BUTTON_A: false,
            BUTTON_B: false,
            START: false
        };

        // Raw input tracking
        this.keysDown = {};
        this.touchState = { left: false, right: false };

        this.initKeyboardListeners();
        this.initTouchListeners();
    }

    /**
     * Listens for Physical Keyboard Events
     */
    initKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            this.keysDown[e.code] = true;

            // Prevent default browser scrolling on spacebar and arrow keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keysDown[e.code] = false;
        });
    }

    /**
     * Listens for Mobile Touchscreen Events
     * Splits screen vertically: Left side = BUTTON_A, Right side = BUTTON_B
     */
    initTouchListeners() {
        const handleTouches = (e) => {
            // Reset touch states
            this.touchState.left = false;
            this.touchState.right = false;

            const screenWidth = window.innerWidth;

            // Evaluate all active touch points
            for (let i = 0; i < e.touches.length; i++) {
                const touchX = e.touches[i].clientX;
                if (touchX < screenWidth / 2) {
                    this.touchState.left = true;
                } else {
                    this.touchState.right = true;
                }
            }
        };

        window.addEventListener('touchstart', handleTouches, { passive: true });
        window.addEventListener('touchmove', handleTouches, { passive: true });
        window.addEventListener('touchend', handleTouches, { passive: true });
        window.addEventListener('touchcancel', handleTouches, { passive: true });
    }

    /**
     * Polls HTML5 Gamepad API for active controllers
     */
    pollGamepad() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0]; // Active Controller 1

        if (!gp) return { a: false, b: false, start: false };

        return {
            // D-Pad Left, Button 0 (A/Cross) or Left Stick
            a: gp.buttons[14]?.pressed || gp.buttons[0]?.pressed || gp.axes[0] < -0.5,
            // D-Pad Right, Button 1 (B/Circle) or Right Stick
            b: gp.buttons[15]?.pressed || gp.buttons[1]?.pressed || gp.axes[0] > 0.5,
            // Start / Options (Button 9 or 8)
            start: gp.buttons[9]?.pressed || gp.buttons[8]?.pressed || gp.buttons[2]?.pressed
        };
    }

    /**
     * Must be called once per Frame inside the GameLoop update step!
     * Updates previous vs current state for edge detection.
     */
    update() {
        // Copy current state to previous state
        this.prevState.BUTTON_A = this.state.BUTTON_A;
        this.prevState.BUTTON_B = this.state.BUTTON_B;
        this.prevState.START = this.state.START;

        // Poll Gamepad
        const gp = this.pollGamepad();

        // 1. Evaluate BUTTON_A (Keyboard 'A' / Left Arrow / Touch Left / Gamepad A)
        this.state.BUTTON_A = Boolean(
            this.keysDown['KeyA'] ||
            this.keysDown['ArrowLeft'] ||
            this.touchState.left ||
            gp.a
        );

        // 2. Evaluate BUTTON_B (Keyboard 'D' / Right Arrow / Touch Right / Gamepad B)
        this.state.BUTTON_B = Boolean(
            this.keysDown['KeyD'] ||
            this.keysDown['ArrowRight'] ||
            this.touchState.right ||
            gp.b
        );

        // 3. Evaluate START (Keyboard Enter / Space / Dual-Touch / Gamepad Start)
        this.state.START = Boolean(
            this.keysDown['Enter'] ||
            this.keysDown['Space'] ||
            (this.touchState.left && this.touchState.right) || // Dual-tap for START on mobile
            gp.start
        );
    }

    /**
     * Returns true if action is currently held down
     * @param {string} action - 'BUTTON_A' | 'BUTTON_B' | 'START'
     */
    isPressed(action) {
        return Boolean(this.state[action]);
    }

    /**
     * Edge Detection: Returns true ONLY on the single frame the button was pressed down
     * @param {string} action - 'BUTTON_A' | 'BUTTON_B' | 'START'
     */
    isJustPressed(action) {
        return Boolean(this.state[action] && !this.prevState[action]);
    }
}