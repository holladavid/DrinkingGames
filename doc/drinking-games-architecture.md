# Drinking Games - Main Software Architecture Specification (Version 3)
## Master Developer Document for Atari ST-Style WebApp Implementation

This document serves as the **Master Software Architecture Specification** for the retro-inspired, turn-based party game *Drinking Games* [cite: 39, 42]. This design takes direct technical inspiration from the legendary Atari ST home computer and its classic gaming catalogue, particularly Epyx's *Summer Games* and *World Games* [cite: 36, 1421].

---

## 1. System Architecture Overview

The system uses a highly modular **Three-Tier Architecture** implemented entirely in client-side JavaScript (ES6 Modules) to allow file-less operation in VS Code and direct execution in any modern web browser.

```
       +-------------------------------------------------------+
       |                  PRESENTATION LAYER                   |
       |  - HTML5 Canvas Renderer (Atari ST Shifter Emulator) |
       |  - Web Audio API Chiptune Engine (YM2149 Emulation)   |
       +----------------------------+--------------------------+
                                    |
                                    v
       +-------------------------------------------------------+
       |                      LOGIC LAYER                      |
       |  - Tournament State Machine (BOOT -> LOBBY -> PLAY)   |
       |  - Unified Input Controller (Gamepad, Keyboard, Touch)|
       |  - Modular Discipline Loader (Strategy Pattern)       |
       +----------------------------+--------------------------+
                                    |
                                    v
       +-------------------------------------------------------+
       |                      DATA LAYER                       |
       |  - sponsors-parody.json (Trademark-Safe Configurations)|
       |  - GameState / Leaderboard Store (In-Memory / Local)  |
       +-------------------------------------------------------+
```

### Querverweise auf Detail-Spezifikationen
*   **Marken & Sound:** Siehe [drinking-games-sponsors-audio-v3.md](drinking-games-sponsors-audio-v3.md) für Detailangaben zu Sponsorendaten und der Audio-Engine.
*   **Disziplinen:** Siehe [drinking-games-disciplines.md](drinking-games-disciplines.md) für exakte Gameplay-Mechaniken der Mini-Spiele.
*   **Schiedsrichter:** Siehe [drinking-games-judges.md](drinking-games-judges.md) für Details zur Punkteberechnung und den Richter-Animationen.
*   **Bedienung & UI:** Siehe [drinking-games-ui-lobby.md](drinking-games-ui-lobby.md) für den Unified Input Controller (Gamepad, Touch, Tasten) und die Lobby.
*   **Code-Richtlinien:** Siehe [drinking-games-programming-conventions-v2.md](drinking-games-programming-conventions-v2.md) für Coding-Conventions und Git Conventional Commit-Regeln.

---

## 2. Legally Safe Parody System (Verballhornungen)

To guarantee that the game does **not violate any copyrights or trademarks** of famous drink producers, all in-game sponsors are designed as parodies (Verballhornungen) [cite: 14]. This design successfully communicates the brand's aesthetic (through exact colors and beverage types) while protecting the project legally:

1.  **Strict Name Distortion:** Names are altered into humorous, phonetically close parodies (e.g., *Guinness* $\rightarrow$ **Grinness**, *Heineken* $\rightarrow$ **Heineklon**, *Jägermeister* $\rightarrow$ **Jägerkleister**, *Jack Daniel's* $\rightarrow$ **Mack Damion's**, *Corona* $\rightarrow$ **Caronas**, *Budweiser* $\rightarrow$ **Budweicher**, *Smirnoff* $\rightarrow$ **Schmirnoffski**).
2.  **Logo Redesign:** Any trademarked logo symbols are replaced by legally distinct parodies (e.g., replacing the Irish Celtic Harp with a wooden Lute, replacing the Jägermeister holy cross with a foaming beer mug held by a cross-eyed moose) [cite: 14].
3.  **Modified Flags:** Flag color configurations and geometric splits are altered to avoid copying official corporate flags while maintaining the iconic color association.

All brand parameters are decoupled into the external configuration file `sponsors-parody.json` (as described in the Sponsors & Audio Specification).

---

## 3. Emulated Atari ST Video Hardware (Shifter)

The game graphics are rendered to a single HTML5 `<canvas>` element. Rather than using modern high-resolution techniques, the rendering engine software-emulates the limitations of the **Atari ST Shifter video chip** [cite: 1457]:

### A. Resolution Splits & Display Modes
*   **Active Disciplines:** Rendered in **Atari Low-Res Mode (320x200 pixels)**. This mode allows up to 16 simultaneous colors from the global 512-color hardware palette [cite: 1457].
*   **UI, Menus & Tables:** Rendered in **Atari Medium-Res Mode (640x200 pixels)**. This mode limits the display to 4 simultaneous colors, ensuring extremely crisp and readable pixel-art text [cite: 1457, 1460].

### B. Hardware Raster-Interrupt Emulation (Palette-Splits)
To break the 16-color barrier on a single screen without introducing graphical artifacts, the renderer simulates horizontal scanline raster interrupts [cite: 1457, 1458]:
1.  During each frame's redraw loop, the `CanvasRenderingContext2D` pixel buffer (`ImageData`) is compiled row-by-row.
2.  For each individual vertical row (Y-coordinate), the active 16-color lookup table is dynamically swapped (palette-splitting) [cite: 1459, 1460].
3.  This allows smooth color gradients (e.g., copperbars in the background or smooth liquid fills in beer mugs) while strictly keeping only 16 colors active per row [cite: 1459, 1460].

### C. Pillarbox Flicker-Masking
On physical Atari hardware, shifting palette colors in the middle of a scanline causes a visible flicker [cite: 1461].
*   The game emulates this by rendering in a **4:3 aspect-ratio box (Pillarbox)** inside the modern browser window, leaving black side borders [cite: 1461].
*   The virtual electron beam performs the color palette change inside the black border area *before* reaching the active 320px image viewport [cite: 1461].
*   By setting the first color register of every scanline palette to `#000` (black), the hardware color transition remains completely invisible to the player [cite: 1461].

---

## 4. WebAudio YM2149 Chiptune Sound Synthesis

The game completely avoids external audio files. Instead, it utilizes the browser's native **Web Audio API** to emulate the physical sound registers of the **Yamaha YM2149 sound chip** (used in the Atari ST) [cite: 26, 39, 1457].

### A. Hardware Synthesizer Simulation
*   **3 Square Wave Channels:** Implemented via parallel WebAudio `OscillatorNode` instances with `type = "square"` to generate the warm, metallic 8-bit sound [cite: 39, 1431].
*   **Noise Generator:** Synthesized using an audio buffer filled with randomized pseudo-noise to emulate physical drum clicks and beverage fizzing effects [cite: 39].
*   **4-bit Volume DAC Emulation:** A custom digital-to-analog converter is simulated in a WebAudio processor node, limiting gain output to 16 discrete volume steps and a retro 12.5 kHz sampling rate to introduce authentic aliasing and hiss [cite: 39].

### B. Drunken Anthem Engine ("Lall-Effekt")
During the medal ceremony, the player's customized national chiptune anthem is synthesized [cite: 349]. If the winning player's character has a high **Promillewert (BAC)**, two real-time audio distortions are introduced to simulate a drunken performance [cite: 349]:
1.  **Pitch Bending (LFO Frequency Drift):** A slow, asymmetric LFO modulates the oscillators' frequencies, creating an amusingly out-of-tune, slurring tone [cite: 349].
2.  **Speed Bending (Tempo Stumbling):** The scheduler's clock interval is dynamically stretched and slightly randomized, creating a performance that stumbles, hesitates, and drags behind the beat.
