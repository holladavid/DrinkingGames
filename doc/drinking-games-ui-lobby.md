# Detail-Spezifikation: Start-Bildschirm & Lobby-Registrierung

Dieses Dokument definiert das Benutzeroberflächen-Konzept (UI), den Ladebildschirm, den Start-Bildschirm und das Registrierungssystem (Lobby) für bis zu 8 Spieler unter Einhaltung des klassischen Atari ST 16-Farben-Videomodus [1534].

---

## 1. Der Start-Bildschirm (Start Screen)

Der Start-Bildschirm zieht den Spieler direkt in eine authentische Retro-Atmosphäre der späten 1980er Jahre.

```
+-----------------------------------------------------------+
|  [================== COPPERBARS ACTIVE =================] |
|                                                           |
|             _----_      _                      _          |
|            |      \    (_)                    | |         |
|            |  |--  |    _  _ _- -_ _ _ _- -_  | |  _ _    |
|            |  |--  |   | ||  _ _  | |  _ _  | | | | _ |   |
|            |______/    |_||_|   |_|_|_|   |_|_|_| |___|   |
|                                                           |
|                  -  D R I N K I N G  -                    |
|                      G A M E S                            |
|                                                           |
|  -> PRESS START BUTTON / CLICK TO REGISTER NEW PLAYERS    |
|                                                           |
|                (C) 1988 BY GEMINI SOFT                    |
+-----------------------------------------------------------+
```

### Technische & Visuelle Highlights (Atari ST Style)

*   **Copperbars (Raster-Verläufe):**
    Im Hintergrund des Bildschirms bewegen sich dicke, weich verlaufende horizontale Farbbalken (Copperbars) von oben nach unten. Da der Atari ST standardmäßig nur 16 Farben gleichzeitig darstellen kann, manipulieren wir die Farbpalette direkt pro horizontaler Bildschirmzeile (Scanline) im Frame-Buffer über einen virtuellen **Raster-Interrupt**-Timer [1534].
*   **Chiptune-Intro-Theme:**
    Beim Laden des Start-Bildschirms wird eine eingängige 4-Spur-Intro-Melodie im `.mod`-Format abgespielt, die über die `ChiptuneAudioEngine` (mittels WebAudio API) synthetisiert wird [26, 1486].
*   **Start-Auslöser (Universal Input Trigger):**
    Der Bildschirm wartet auf eine beliebige Eingabe:
    *   **Tastatur:** Drücken der `Leertaste` oder `Enter`
    *   **Touch:** Tippen auf eine beliebige Stelle des Bildschirms (Viewport)
    *   **Gamepad:** Drücken eines beliebigen Action-Buttons (z.B. Button 0)

---

## 2. Spieler-Registrierung & Lobby (Lobby Screen)

Nach dem Start gelangt die Party-Gruppe in die Lobby. Das Spiel ist als **sequentielles Party-Spiel (Pass-and-Play)** für **1 bis maximal 8 Spieler** konzipiert [36, 1522].

```
+-----------------------------------------------------------+
|                    SPIELER-REGISTRIERUNG                  |
+-----------------------------------------------------------+
|                                                           |
|  Spieler 1: [ MAX ]           Sponsor: [ Stout Brewery ]  |
|  Spieler 2: [ ANNA ]          Sponsor: [ Green Garden  ]  |
|  Spieler 3: [ ---- ]          Sponsor: [ ------------- ]  |
|                                                           |
|  -> NAME EINGEBEN: _                                      |
|  -> SPONSOR WÄHLEN (Links/Rechts)                         |
|                                                           |
|  [START]  Um das Turnier mit 2 Spielern zu starten!        |
+-----------------------------------------------------------+
```

### Interaktions- & Animationsablauf

1.  **Namenseingabe:**
    *   Spieler geben nacheinander ihren Namen über eine virtuelle On-Screen-Tastatur (für Touch/Gamepad) oder direkt über die physikalische Tastatur ein (max. 10 Zeichen).
2.  **Sponsoren-Auswahl & Dynamisches Color-Swapping:**
    *   Beim Scrollen durch die Sponsoren-Liste wird die Farbpalette der UI in Echtzeit ausgetauscht (*Palette-Swapping*). Wählt Spieler 1 *Green Garden*, leuchtet der Bildschirm augenblicklich in saftigen Grüntönen. Wechselt er zu *Stout Brewery*, färbt sich die Oberfläche in dunklem Holz- und Bernstein-Braun [1534].
3.  **Hymnen-Anspielung:**
    *   Sobald ein Spieler auf einem Sponsor verweilt, lädt die Chiptune-Audio-Engine den jeweiligen Song und spielt ein kurzes, prägnantes **5-Sekunden-Intro-Sample** der Nationalhymne des Sponsors ab [26].
4.  **Spieler hinzufügen:**
    *   Nach Bestätigung des Sponsors wird der Spieler in die Liste eingetragen, und Spieler 2 ist an der Reihe. Der gesamte Prozess wird wiederholt, bis alle Spieler registriert sind und das Turnier über den Start-Button freigegeben wird.

---

## 3. Die universelle Eingabeschicht (`UnifiedInputController.js`)

Um eine nahtlose Unterstützung aller Endgeräte (Smartphones, Desktop-PCs, Tablets, Konsolen-Browser) zu gewährleisten, mappt der Controller alle physischen Steuerungssignale auf einheitliche virtuelle Signale.

```javascript
/**
 * UnifiedInputController zur Vereinheitlichung von Touch, Tastatur und Gamepad.
 */
class UnifiedInputController {
    constructor() {
        this.inputState = {
            BUTTON_A: false, // Virtueller Button Links (Mashing 1 / Balance Links / etc.)
            BUTTON_B: false, // Virtueller Button Rechts (Mashing 2 / Balance Rechts / etc.)
            START: false     // Virtueller Start-Button (Lobby / Menü)
        };
        this.initListeners();
    }

    initListeners() {
        // 1. TASTATUR-MAPPING
        window.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.inputState.BUTTON_A = true;
            if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.inputState.BUTTON_B = true;
            if (e.key === "Enter" || e.key === " ") this.inputState.START = true;
        });

        window.addEventListener("keyup", (e) => {
            if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.inputState.BUTTON_A = false;
            if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.inputState.BUTTON_B = false;
            if (e.key === "Enter" || e.key === " ") this.inputState.START = false;
        });

        // 2. TOUCH-MAPPING (Zweiteilung des Bildschirms für bequemes Spielen mit Daumen)
        window.addEventListener("touchstart", (e) => {
            const touchX = e.touches[0].clientX;
            const screenWidth = window.innerWidth;

            if (touchX < screenWidth / 2) {
                this.inputState.BUTTON_A = true;
            } else {
                this.inputState.BUTTON_B = true;
            }
        });

        window.addEventListener("touchend", () => {
            // Vereinfachtes Zurücksetzen aller Buttons bei Touch-Ende
            this.inputState.BUTTON_A = false;
            this.inputState.BUTTON_B = false;
        });

        // 3. GAMEPAD-MAPPING (HTML5 Gamepad API Polling)
        this.startGamepadPolling();
    }

    startGamepadPolling() {
        setInterval(() => {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            const gp = gamepads[0]; // Nutze das erste angeschlossene Gamepad

            if (gp) {
                // Mapping: Steuerkreuz Links oder Button X/A -> BUTTON_A
                this.inputState.BUTTON_A = gp.buttons[14].pressed || gp.buttons[0].pressed;
                // Mapping: Steuerkreuz Rechts oder Button Y/B -> BUTTON_B
                this.inputState.BUTTON_B = gp.buttons[15].pressed || gp.buttons[1].pressed;
                // Mapping: Options/Start -> START
                this.inputState.START = gp.buttons[9].pressed;
            }
        }, 16); // Polling im Takt von 60 FPS
    }

    /**
     * Gibt den aktuellen Eingabezustand zurück
     */
    getState() {
        return { ...this.inputState };
    }
}
```
