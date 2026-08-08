/**
 * Global Tournament State Machine
 * Manages game transitions: BOOT -> INTRO -> START_SCREEN -> LOBBY -> PLAYING
 */
export const STATES = {
    BOOT: 'BOOT',
    INTRO: 'INTRO',
    START_SCREEN: 'START_SCREEN',
    LOBBY: 'LOBBY',
    PLAYING: 'PLAYING'
};

export default class StateMachine {
    constructor() {
        this.currentState = STATES.BOOT;
        this.handlers = {};
    }

    registerState(stateName, handlerObject) {
        this.handlers[stateName] = handlerObject;
    }

    transitionTo(newState) {
        console.log(` State Machine Transition: ${this.currentState} -> ${newState}`);
        this.currentState = newState;
        
        if (this.handlers[newState] && this.handlers[newState].onEnter) {
            this.handlers[newState].onEnter();
        }
    }

    update(dt, input) {
        const handler = this.handlers[this.currentState];
        if (handler && handler.update) {
            handler.update(dt, input);
        }
    }

    render() {
        const handler = this.handlers[this.currentState];
        if (handler && handler.render) {
            handler.render();
        }
    }
}