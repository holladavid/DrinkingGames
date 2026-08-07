# Drinking Games - Sponsors & Audio Specification (Version 3)
## Legally Safe Brand Parodies & Procedural Chiptune Audio Engine

This document defines the data structures and emulation engines for the game's **Drink Sponsors** and its real-time **Chiptune Audio Engine** [cite: 39]. To protect intellectual property while retaining maximum retro humor and recognizability, all real-world brands are represented through legally safe **Verballhornungen (parodies/spoonerisms)**, altered logos, and modified flag designs [cite: 14]. 

Music and sound effects are fully synthesized in real time via the browser's **Web Audio API**, simulating the legendary **Yamaha YM2149 sound chip** of the Atari ST without loading external audio assets [cite: 26, 39].

---

## 1. Legally Safe Brand Parodies (Verballhornungen)

To prevent trademark and copyright violations, the game employs the following parodied sponsors. Each is designed to be instantly recognizable to players through color associations and beverage types, while remaining completely distinct on a legal level [cite: 14, 40].

### A. grinness (Parody of *Guinness*)
*   **Beverage Sorte:** Irish Dry Stout [cite: 4].
*   **Visual Associations:** Deep ruby-black body, creamy ivory head, antique gold accents [cite: 4].
*   **Logo Parody:** An asymmetrical wooden lute (or stylized bagpipe) instead of the copyrighted Celtic Harp.
*   **Flag Design:** Solid obsidian-black with a golden-yellow border.
*   **Atari ST 9-bit Palette Map:**
    *   `Color 0 (Background):` `#000` (RGB: 0, 0, 0)
    *   `Color 1 (Cream):` `#776` (Atari ST 9-bit: R:7, G:7, B:6)
    *   `Color 2 (Antique Gold):` `#651` (Atari ST 9-bit: R:6, G:5, B:1)

### B. Heineklon (Parody of *Heineken*)
*   **Beverage Sorte:** Dutch Premium Lager [cite: 3].
*   **Visual Associations:** Smaragd-green, polar white, and cherry red.
*   **Logo Parody:** A bold red asterisk (`*`) or a red bottle cap instead of the trademarked red five-pointed star.
*   **Flag Design:** Deep emerald green with a polar-white horizontal stripe across the middle.
*   **Atari ST 9-bit Palette Map:**
    *   `Color 0 (Background):` `#030` (Atari ST 9-bit: R:0, G:3, B:0)
    *   `Color 1 (Red Accent):` `#700` (Atari ST 9-bit: R:7, G:0, B:0)
    *   `Color 2 (Green):` `#070` (Atari ST 9-bit: R:0, G:7, B:0)

### C. Jägerkleister (Parody of *Jägermeister*)
*   **Beverage Sorte:** Alpine Herbal Liqueur (Kräuterlikör) [cite: 11].
*   **Visual Associations:** Dark forest green, warm amber orange, golden brown.
*   **Logo Parody:** A comically cross-eyed, derpy moose head with a foaming beer mug floating between its antlers, instead of the copyrighted stag head with the glowing Christian cross.
*   **Flag Design:** Diagonally split from top-left to bottom-right in dark forest green and deep amber orange.
*   **Atari ST 9-bit Palette Map:**
    *   `Color 0 (Background):` `#010` (Atari ST 9-bit: R:0, G:1, B:0)
    *   `Color 1 (Amber):` `#740` (Atari ST 9-bit: R:7, G:4, B:0)
    *   `Color 2 (Gold Brown):` `#531` (Atari ST 9-bit: R:5, G:3, B:1)

### D. Mack Damion’s Old No. 8 (Parody of *Jack Daniel's Old No. 7*)
*   **Beverage Sorte:** Charcoal Mellowed Tennessee Whiskey [cite: 129].
*   **Visual Associations:** Coal-black and silver-white filigree.
*   **Logo Parody:** A tilted, cartoonish wooden barrel with "Old No. 8 Sour Mash Whiskey" printed in an over-stylized gothic font, without the signature Jack Daniel's scrollwork frame.
*   **Flag Design:** Vertical split of coal-black and slate-grey with a white dotted border.
*   **Atari ST 9-bit Palette Map:**
    *   `Color 0 (Background):` `#000` (RGB: 0, 0, 0)
    *   `Color 1 (Silver):` `#666` (Atari ST 9-bit: R:6, G:6, B:6)
    *   `Color 2 (Slate Grey):` `#334` (Atari ST 9-bit: R:3, G:3, B:4)

### E. Caronas Extra (Parody of *Corona Extra*)
*   **Beverage Sorte:** Mexican Beach Cerveza (Lager with lime) [cite: 3].
*   **Visual Associations:** Sky blue, sand yellow, neon green (lime), white.
*   **Logo Parody:** A crooked, hand-drawn paper party crown with a neon-green lime wedge speared on its peak, replacing the majestic Spanish Crown.
*   **Flag Design:** White background with a single, thick, horizontal sky-blue wave across the center.
*   **Atari ST 9-bit Palette Map:**
    *   `Color 0 (Background):` `#047` (Atari ST 9-bit: R:0, G:4, B:7)
    *   `Color 1 (Sand Yellow):` `#773` (Atari ST 9-bit: R:7, G:7, B:3)
    *   `Color 2 (Lime Green):` `#370` (Atari ST 9-bit: R:3, G:7, B:0)

### F. Budweicher (Parody of *Budweiser*)
*   **Beverage Sorte:** American Adjunct Lager [cite: 3].
*   **Visual Associations:** Crimson red, navy blue, antique silver.
*   **Logo Parody:** A giant, floppy, slightly deflated bowtie with a tiny wheat grain illustration in its center, instead of the red Budweiser bow-tie label.
*   **Flag Design:** Horizontal red and white stripes with a dark blue square in the canton containing a golden beer mug.
*   **Atari ST 9-bit Palette Map:**
    *   `Color 0 (Background):` `#700` (Atari ST 9-bit: R:7, G:0, B:0)
    *   `Color 1 (Navy Blue):` `#014` (Atari ST 9-bit: R:0, G:1, B:4)
    *   `Color 2 (Silver):` `#555` (Atari ST 9-bit: R:5, G:5, B:5)

---

## 2. Dynamic JSON Configuration (`Sponsors.json`)

To enable seamless extensibility without editing game code, sponsors are loaded from a standard JSON configuration. Note that color values utilize hexadecimal syntax but represent exact retro 9-bit palettes (mapped to Atari ST hardware colors `0-7` per channel) [cite: 1457]:

```json
{
  "sponsors": [
    {
      "id": "grinness",
      "name": "grinness",
      "sorte": "Irish Stout",
      "flagColors": ["#000000", "#777766", "#665511"],
      "logoSpriteId": "logo_grinness_lute",
      "anthem": [
        {"note": "A4", "duration": 0.4},
        {"note": "D4", "duration": 0.4},
        {"note": "F4", "duration": 0.2},
        {"note": "A4", "duration": 0.8}
      ]
    },
    {
      "id": "heineklon",
      "name": "Heineklon",
      "sorte": "Dutch Lager",
      "flagColors": ["#003300", "#770000", "#007700"],
      "logoSpriteId": "logo_heineklon_asterisk",
      "anthem": [
        {"note": "C4", "duration": 0.3},
        {"note": "E4", "duration": 0.3},
        {"note": "G4", "duration": 0.3},
        {"note": "C5", "duration": 0.6}
      ]
    },
    {
      "id": "jaegerkleister",
      "name": "Jägerkleister",
      "sorte": "Kräuterlikör",
      "flagColors": ["#001100", "#774400", "#553311"],
      "logoSpriteId": "logo_jaegerkleister_moose",
      "anthem": [
        {"note": "E4", "duration": 0.5},
        {"note": "B3", "duration": 0.25},
        {"note": "E4", "duration": 0.25},
        {"note": "G4", "duration": 0.5}
      ]
    }
  ]
}
```

---

## 3. Emulated Atari ST (Yamaha YM2149) Chiptune Sound Engine

This JavaScript class implements native emulation of the Atari ST's YM2149 Programmable Sound Generator (PSG). It generates audio dynamically utilizing the **Web Audio API** [cite: 26, 39].

```javascript
/**
 * Emulates the Yamaha YM2149 sound chip with 3 Square Wave channels
 * and a 4-bit Bitcrusher to simulate the retro DAC output.
 */
class YM2149SoundEngine {
    constructor() {
        this.ctx = null;
        this.channels = [];
        this.bitcrusher = null;
        this.isMuted = false;
    }

    init() {
        // Initialize Web Audio Context
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create 3 emulated hardware channels (Square Waves)
        for (let i = 0; i < 3; i++) {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            
            osc.type = 'square'; // YM2149 native voice
            osc.frequency.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            
            osc.connect(gain);
            osc.start();
            
            this.channels.push({ osc, gain });
        }

        // Connect channels to a Custom Bitcrusher Node simulating 4-bit amplitude steps (16 volume levels)
        this.bitcrusher = this.createBitcrusherNode(12500, 4); // 12.5 kHz, 4-bit resolution
        
        this.channels.forEach(ch => ch.gain.connect(this.bitcrusher));
        this.bitcrusher.connect(this.ctx.destination);
    }

    /**
     * Recreates retro hardware limitations using a ScriptProcessorNode (fallback)
     */
    createBitcrusherNode(targetSampleRate, bitDepth) {
        const bufferSize = 4096;
        const node = this.ctx.createScriptProcessor(bufferSize, 1, 1);
        const steps = Math.pow(2, bitDepth); // 4-bit = 16 discrete volume steps
        let lastSample = 0;
        let phaser = 0;

        node.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const output = e.outputBuffer.getChannelData(0);
            const ratio = this.ctx.sampleRate / targetSampleRate;

            for (let i = 0; i < bufferSize; i++) {
                phaser += 1;
                if (phaser >= ratio) {
                    phaser -= ratio;
                    // Quantize amplitude to 4-bit
                    let sample = input[i];
                    lastSample = Math.round(sample * steps) / steps;
                }
                output[i] = lastSample; // Introduces retro hiss and aliasing noise
            }
        };
        return node;
    }

    /**
     * Map note names to frequencies
     */
    getFreq(note) {
        const notes = {
            "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.00, "A3": 220.00, "B3": 246.94,
            "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00, "A4": 440.00, "B4": 493.88,
            "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77
        };
        return notes[note] || 0;
    }
}
```

---

## 4. The Drunken Anthem Engine ("Lall-Effekt")

When the tournament winner climbs the podium, their sponsor's anthem is played. If their character has a high **Promillewert (BAC)**, the audio engine dynamically distorts the sound in real-time, creating an amusingly "slurred" and "pitch-bended" performance [cite: 349].

The Lall-Effekt acts on two distinct physical vectors [cite: 349]:
1.  **Pitch Bending (Schwankende Tonhöhe):** A low-frequency oscillator (LFO) alters the base note frequency, simulating a tape-slipping / motor-failing effect.
2.  **Speed Bending (Lallendes Tempo):** The scheduler intervals are elongated and randomized, simulating a musician losing the rhythm or falling asleep.

```javascript
class DrunkenAnthemScheduler {
    constructor(soundEngine) {
        this.engine = soundEngine;
    }

    /**
     * Plays a sponsor's anthem with real-time drunkenness distortion
     * @param {Array} notes - Array of Note objects {"note": "C4", "duration": 0.4}
     * @param {number} bac - Promillewert of the player (e.g. 0.0 to 3.5)
     */
    playAnthem(notes, bac) {
        if (this.engine.ctx.state === 'suspended') {
            this.engine.ctx.resume();
        }

        let timeOffset = 0.1;
        const now = this.engine.ctx.currentTime;

        // Calculate severity of distortion
        const drunkenness = Math.min(bac / 3.0, 1.0); // Cap at 3.0 Promille

        notes.forEach((item, index) => {
            // 1. Calculate Speed Bending (Lallendes Tempo)
            // Drunk players cause notes to lag and drag out irregularly
            let baseDuration = item.duration;
            let tempoStretch = 1.0 + (drunkenness * 0.8); // Up to 80% slower
            let jitter = drunkenness * 0.15 * Math.sin(index * 1.5); // Rhythmic stumbling
            let duration = (baseDuration * tempoStretch) + jitter;

            // Schedule the note trigger
            const noteTime = now + timeOffset;
            const targetFreq = this.engine.getFreq(item.note);

            if (targetFreq > 0) {
                // Apply note on hardware Channel 0
                this.engine.channels[0].osc.frequency.setValueAtTime(targetFreq, noteTime);
                
                // Set hardware envelope simulation
                this.engine.channels[0].gain.gain.setValueAtTime(0.3, noteTime);
                // Sharp decay mimicking retro ADSR envelope
                this.engine.channels[0].gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration - 0.05);

                // 2. Calculate Pitch Bending (Lall-Frequenzschwankung)
                // Modulate frequency via LFO to simulate an uncoordinated slurring tone
                if (drunkenness > 0.1) {
                    const lfoSpeed = 3.0; // 3 Hz modulation speed
                    const maxDetune = targetFreq * 0.12 * drunkenness; // Up to 10% pitch slurring
                    
                    // Generate fine pitch wobble curve
                    let steps = 10;
                    for (let step = 0; step < steps; step++) {
                        let stepTime = noteTime + (duration * (step / steps));
                        let slurredFreq = targetFreq + (maxDetune * Math.sin(step * lfoSpeed));
                        this.engine.channels[0].osc.frequency.setValueAtTime(slurredFreq, stepTime);
                    }
                }
            }

            // Move pointer forward
            timeOffset += duration;
        });
    }
}
```
