# Drinking Games - Technical & Programming Conventions (v4)

This document establishes the official programming conventions, hardware limitations, and workflow guidelines for the 'Drinking Games' WebApp development. All developers must adhere to these standards to ensure a cohesive retro experience and a clean, maintainable codebase.

---

## 1. Documentation & Specification Policy (NEW v4)
*   **Continuous Documentation:** All newly established rules, technical discoveries, design conventions, or architectural decisions must be documented in detail within the appropriate existing Markdown files or in new dedicated Markdown files.
*   **Updating Specifications:** When specifications or features change, the corresponding documentation must be updated immediately to prevent outdated documentation. Do not let code and specifications drift apart.
*   **Version Control for Docs:** Changes to documentation must be committed using clear commit messages (e.g., `docs(specs): update audio engine pitch bending specifications`).

---

## 2. Retro-Style Capabilities & Simulation Standards

### 2.1 Atari ST Video Hardware Simulation (Shifter & Glue)
To faithfully recreate the late 1980s aesthetic, the rendering engine must emulate the hardware limitations of the Atari ST:
*   **Resolutions:**
    *   *Active Gameplay / Minisports:* Low-Resolution Mode (320 × 200 pixels) with a maximum of 16 concurrent colors from a 512-color hardware palette [cite: 16].
    *   *Menus, Selection Screens & Leaderboards:* Medium-Resolution Mode (640 × 200 pixels) with a maximum of 4 concurrent colors [cite: 39].
*   **9-Bit Hardware Palette Emulation:**
    *   All colors must be mapped to 9-bit RGB space (values 0–7 for Red, Green, and Blue) [cite: 39].
    *   No modern true-color gradients are permitted [cite: 16]. Gradients must be simulated using dither patterns or hardware raster tricks [cite: 39].
*   **Raster-Interrupts (Scanline Palette-Splits):**
    *   To display more than 16 colors on a single screen, implement scanline-based palette swapping [cite: 39].
    *   The `AtariSTRenderer` will swap palettes on horizontal interrupts (simulated via horizontal scanline rendering with `ImageData` in HTML5 Canvas) [cite: 16, 39].
*   **Flicker Masking via Pillarbox:**
    *   Flicker during palette switching must be hidden in the black side margins (Pillarbox-margins) [cite: 39]. Register 0 of the active palette must be set to black during the border refresh so that hardware color transitions are invisible [cite: 39].

### 2.2 Chiptunes Sound-Engine (YM2149 Emulation)
*   **Native Procedural Synthesis:** No external audio formats (like `.mp3`, `.wav`, or tracker files like `.mod` / `.xm`) may be loaded over the network. All sounds must be dynamically synthesized in real-time using the Web Audio API [cite: 26].
*   **Hardware Emulation Constraints (Yamaha YM2149):**
    *   Simulate 3 independent square-wave oscillator channels (`OscillatorNode`, `type: "square"`).
    *   Include 1 pseudo-random noise generator channel for percussion and sound effects (synthesized via an `AudioBuffer` filled with random white noise).
    *   Include volume envelopes modeled after the 16-level (4-bit) logarithmic DAC of the original chip.
*   **"Drunken" Audio Effects (Pitch & Speed Bending):**
    *   To represent a character's in-game intoxication (Promille value), the audio engine must modulate pitch and tempo in real-time.
    *   Apply a low-frequency oscillator (LFO) to the master pitch to simulate a "wobbly", detuned tape-like pitch bending (lallender Sound).
    *   Dynamically scale the note sequencer speed (tempo bending) proportional to the active character's sobriety.

### 2.3 Pixel-Art & Spritesheet Guidelines
*   **Retro Sprite Blitting:** All animations must be packed into unified spritesheets [cite: 16]. Frame rendering must be done using a custom blitter that reads coordinates from a sheet and writes pixels directly to the Canvas to ensure retro-accurate transparency masking and rendering speeds [cite: 16].
*   **CRT Scanline Filter:** A post-processing shader or software filter must scan the viewport and darken every second horizontal line of pixels to simulate a CRT monitor [cite: 16].

---

## 3. UI, Texts & Localization
*   **English Language Requirement:** All in-game text, dialogue, instructions, and user interfaces must be exclusively in **English** to match the classic international release style of the 1980s.
*   **Brand Parody & Copyright Safety:**
    *   All drinks, sponsors, logos, and national flags must be parodied to avoid copyright infringement [cite: 14].
    *   Use phonetically similar but legally distinct names (e.g., *Grinness* for Guinness [cite: 4], *Heineklon* for Heineken [cite: 3], *Jägerkleister* for Jägermeister [cite: 11], *Mack Damion's Old No. 8* for Jack Daniel's [cite: 129]).
    *   Modify logos humorously (e.g., a squinting elk balancing a beer glass on its antlers instead of a majestic stag with a cross) [cite: 11, 14].

---

## 4. Software Architecture & Clean Code
*   **State-Machine Architecture:** The global application flow must be driven by a rigid, deterministic State-Machine (e.g., `BOOT` -> `INTRO` -> `LOBBY` -> `DISCIPLINE_SELECT` -> `PLAYING` -> `JUDGES_SCORING` -> `LEADERBOARD` -> `PODIUM`) [cite: 42]. Direct jumps or loosely coupled states are prohibited.
*   **Strategy Pattern (`IDiscipline`):**
    *   Each sport event (discipline) must implement the `IDiscipline` interface.
    *   Minigames must be fully decoupled from the core framework, making it trivial to drop in a new discipline (e.g., a new sport event) by registering its class.

---

## 5. GitHub Workflow & Conventional Commits
To keep the repository history clean and support automated changelog generation, **every commit** must follow the **Conventional Commits** specification:

```
<type>(<scope>): <description>
```

### Allowed Types:
*   `feat`: A new feature (e.g., `feat(disciplines): add Schlangenlinien-Lauf mini-game`)
*   `fix`: A bug fix (e.g., `fix(audio): resolve WebAudio scheduler sync lag`)
*   `docs`: Documentation changes (e.g., `docs(specs): document new documentation guidelines in v4`)
*   `style`: Formatting, missing semi-colons, etc. (no production code change)
*   `refactor`: Refactoring production code without behavior change
*   `perf`: Performance improvement (e.g., `perf(renderer): optimize scanline pixel blitter`)
*   `test`: Adding missing tests or correcting existing tests
*   `chore`: Maintainance tasks, package updates, etc.

*Developers must verify their commit messages before pushing. Non-conforming commits will be rejected by the pre-commit hooks.*
