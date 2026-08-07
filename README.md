# Drinking Games: Retro-Partyturnier (Atari ST Style)

> **GitHub Description:**
> Retro-Trinkspiel im Atari ST-Stil! Ein rundenbasiertes Partyhit für bis zu 8 Spieler. Basiert auf einer modular erweiterbaren State-Machine mit chiptune-synthetisierten Sponsoren-Hymnen und 3 animierten Pixel-Art-Schiedsrichtern. Universelle Steuerung (Touch/Gamepad/Tasten). Das ultimative Pass-and-Play-Turnier!

Dieses Repository enthält den Quellcode und die vollständige technische Spezifikation für unsere rundenbasierte WebApp im authentischen 16-Farben-Look des Atari ST. Das Spiel bringt den kompetitiven Geist von Klassikern wie *Summer Games* und *World Games* auf moderne Bildschirme – gepaart mit einer humorvollen Trinkspiel-Mechanik.

---

## 🚀 Key Features

*   **Atari ST Hardware-Simulation:** Echter 8-Bit-Look (320x200 Pixel) mit 16-Farben-Paletten, simulierten zeilenweisen Raster-Interrupts (Scanline Color-Splits) und flackerfreiem Double-Buffering im Pillarbox-Format.
*   **WebAudio Chiptune-Engine:** Dynamische Wiedergabe von Amiga-MOD- und XM-Hymnen direkt im Browser. Inklusive Echtzeit-Pitch- und Speed-Verzerrung (**"Lall-Effekt"**), basierend auf dem Promillewert des Gewinner-Charakters bei der Siegerehrung.
*   **"Easy to Learn, Hard to Master"-Disziplinen:** Komplexe und herausfordernde Spielphysik (Siphon-Sprinting, Krug-Balance, Kronkorken-Flugbahnen mit Pfützen-Kollision, betrunkenes Input-Lag) gesteuert über nur zwei Tasten.
*   **Drei Schiedsrichter (2 Frauen, 1 Mann):** Vollständig animierte Pixel-Art-Richter (Clara, Dieter, Svetlana) mit dynamischen, emotionalen Reaktionen und individueller Punktegewichtung (0.0 bis 10.0).
*   **Unified Input Controller:** Nahtlose Steuerung über Tastatur (WASD/Pfeiltasten), geteilten Touchscreen (Links/Rechts-Daumensteuerung für Mobilgeräte) und Gamepads (HTML5 Gamepad API).

---

## 📂 Repository-Struktur & Dokumentation

Unsere Software-Architektur ist streng modular aufgebaut. Vor dem Start der Programmierung haben wir das System in fünf detaillierte Teildokumente zerlegt. Diese dienen als direktes Lastenheft:

*   **[`docs/drinking-games-architecture.md`](./drinking-games-architecture.md):** Die Haupt-Systemarchitektur. Beschreibt das rundenbasierte **State-Machine-Konzept** (Zustandssteuerung), die Dateistruktur und die Emulation der Atari ST-Shifter-Hardware auf dem HTML5 Canvas.
*   **[`docs/drinking-games-disciplines.md`](./drinking-games-disciplines.md):** Detaillierte Spezifikation der 4 Hauptdisziplinen (*Trichter-Exen*, *Masskrug-Stemmen*, *Kronkorken-Flippen*, *Schlangenlinien-Lauf*), deren Interfaces (`IDiscipline`) und physikalischen Formeln.
*   **[`docs/drinking-games-sponsors-audio.md`](./drinking-games-sponsors-audio.md):** JSON-Schema der Sponsorendeklaration (`sponsors.json`), die WebAudio-Synthesizer-Pipeline und die mathematische Umsetzung des akustischen Lall-Effekts.
*   **[`docs/drinking-games-judges.md`](./drinking-games-judges.md):** Spezifikation der 3 Richter (Clara, Dieter, Svetlana), deren Punktegewichtungsmatrix sowie die Frame-by-Frame-Animationsphasen für euphorischen Jubel, Applaus und eiskalten Protest.
*   **[`docs/drinking-games-ui-lobby.md`](./drinking-games-ui-lobby.md):** Design-Spezifikation für den Start-Bildschirm (inkl. animierter *Copperbars*-Hintergrundeffekte), die Pass-and-Play-Registrierungslobby (bis zu 8 Spieler) und den vollständigen Code des `UnifiedInputController`.

---

## 🛠️ Technologie-Stack

*   **Frontend:** HTML5 Canvas, Vanilla ES6 JavaScript (No-Build-Pipeline für maximale Portabilität).
*   **Audio:** WebAudio API (Chiptune-Synthese und Tracker-Player).
*   **Eingabe:** HTML5 Gamepad API, Touch Event-Listener, Standard Keyboard Events.
*   **IDE-Empfehlung:** Visual Studio Code (mit *Live Server* Extension für direktes Testing im Browser).

---

## 🏁 Schnellstart (Lokale Entwicklung)

1.  Klone dieses Repository:
    ```bash
    git clone https://github.com/dein-username/drinking-games.git
    cd drinking-games
    ```
2.  Öffne den Ordner in VS Code:
    ```bash
    code .
    ```
3.  Starte die Extension **Live Server** in VS Code, um die `index.html` lokal zu hosten.
4.  Öffne `http://127.0.0.1:5500` in deinem Browser (Chrome, Firefox oder Safari) und starte das Turnier!

---

## 📝 Lizenz

Dieses Projekt ist unter den Bedingungen eurer vereinbarten Team-Richtlinien lizenziert. Bitte beachtet beim Hinzufügen neuer Drink-Sponsoren die markenrechtlichen Bestimmungen.

---
*Created by Gemini Notebook. Inspired by the golden era of 16-bit home computers.*
