/**
 * Pass-and-Play Lobby Registration Manager (1 to 8 Players)
 * Handles player name entry, sponsor selection with real-time palette swapping & audio previews.
 */
export default class LobbyManager {
    constructor(renderer, synth, musicPlayer, sponsorsData) {
        this.renderer = renderer;
        this.synth = synth;
        this.musicPlayer = musicPlayer;
        this.sponsors = sponsorsData;

        this.players = [];
        this.maxPlayers = 8;

        // Current Registration State
        this.inputName = "PLAYER 1";
        this.selectedSponsorIndex = 0;
        this.isTypingName = false;

        this.initKeyboardInput();
    }

    initKeyboardInput() {
        window.addEventListener('keydown', (e) => {
            if (!this.isTypingName) return;

            if (e.key === 'Backspace') {
                this.inputName = this.inputName.slice(0, -1);
            } else if (e.key.length === 1 && this.inputName.length < 8) {
                this.inputName += e.key.toUpperCase();
            }
        });
    }

    update(input) {
        if (this.sponsors.length === 0) return;

        // 1. CYCLE SPONSOR (BUTTON_A / BUTTON_B)
        if (input.isJustPressed('BUTTON_A')) {
            this.selectedSponsorIndex = (this.selectedSponsorIndex - 1 + this.sponsors.length) % this.sponsors.length;
            this.synth.playSelectSFX();
            this.playSponsorAudioPreview();
        }

        if (input.isJustPressed('BUTTON_B')) {
            this.selectedSponsorIndex = (this.selectedSponsorIndex + 1) % this.sponsors.length;
            this.synth.playSelectSFX();
            this.playSponsorAudioPreview();
        }

        // 2. CONFIRM PLAYER REGISTRATION (START / Space)
        if (input.isJustPressed('START')) {
            this.synth.playConfirmSFX();
            
            // Add Player to list
            this.players.push({
                id: `p${this.players.length + 1}`,
                name: this.inputName || `PLAYER ${this.players.length + 1}`,
                sponsor: this.sponsors[this.selectedSponsorIndex],
                promille: 0.0
            });

            // Prepare next player name default
            this.inputName = `PLAYER ${this.players.length + 1}`;
            this.selectedSponsorIndex = (this.selectedSponsorIndex + 1) % this.sponsors.length;
        }
    }

    playSponsorAudioPreview() {
        const activeSponsor = this.sponsors[this.selectedSponsorIndex];
        this.musicPlayer.playSponsorAnthem(activeSponsor, 0.0);
    }

    render() {
        const ctx = this.renderer.ctx;
        const currentSponsor = this.sponsors[this.selectedSponsorIndex];

        // Clear with active sponsor palette color
        this.renderer.clear(currentSponsor ? currentSponsor.theme_color : '#050508');

        // Render Copperbars
        this.renderer.updateAndRenderCopperbars();

        // Status Header
        this.renderer.renderStatusHeader("TOURNAMENT LOBBY", `PLAYERS: ${this.players.length}/${this.maxPlayers}`);

        // Draw Player List Card
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 35, 300, 110);
        ctx.strokeStyle = '#555555';
        ctx.strokeRect(10, 35, 300, 110);

        ctx.fillStyle = '#ffffff';
        ctx.font = "8px monospace";
        ctx.fillText("REGISTERED CHALLENGERS:", 20, 48);

        // Render registered players list
        this.players.forEach((p, idx) => {
            ctx.fillStyle = p.sponsor.flag.primary_color || '#ffffff';
            ctx.fillText(`${idx + 1}. ${p.name} (${p.sponsor.name})`, 25, 62 + (idx * 11));
        });

        if (this.players.length < this.maxPlayers) {
            // Active Registration Prompt
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 5, 0]);
            ctx.fillText(`ADD PLAYER ${this.players.length + 1}: [ ${this.inputName}_ ]`, 20, 125);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`SPONSOR:  < ${currentSponsor?.name} >`, 20, 137);
        }

        // Instructions Footer
        ctx.fillStyle = '#00ff00';
        ctx.fillText("LEFT/RIGHT: SWITCH SPONSOR | SPACE: CONFIRM PLAYER", 12, 160);
        
        if (this.players.length >= 1) {
            ctx.fillStyle = this.renderer.atari9BitToRgb([7, 7, 0]);
            ctx.fillText(`READY TO START TOURNAMENT WITH ${this.players.length} PLAYER(S)!`, 15, 180);
        }
    }
}