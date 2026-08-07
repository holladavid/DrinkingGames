# Drinking Games – Verzeichnisstruktur & Projekt-Template

Dieses Dokument definiert das standardisierte Dateisystem und die Verzeichnisstruktur für das Atari ST-inspirierte Trinkspiel-Projekt. Es stellt sicher, dass die Applikation modular, leicht erweiterbar (durch neue Drink-Sponsoren und Spieldisziplinen) und optimal für die Entwicklung in **Visual Studio Code** vorbereitet ist.

---

## 1. Verzeichnisbaum (Directory Tree)

Die WebApp wird als rein clientseitige Anwendung (Single Page Application - SPA) strukturiert, die ohne aufwendige Build-Pipelines auskommt, indem sie **native ES6-Module** verwendet.

```text
drinking-games/
├── .git/                        # Git-Versionsverwaltung
├── .github/                     # GitHub-spezifische Konfigurationen
│   └── workflows/
│       └── ci.yml               # Einfache CI/CD Pipeline (z.B. GitHub Pages Deployment)
├── .husky/                      # Git-Hooks (z.B. pre-commit zur Prüfung von Commit-Messages)
│   ├── _/
│   └── commit-msg               # Hook-Skript zur Validierung der Conventional Commits
├── assets/                      # Statische Grafik- und Audio-Assets
│   ├── fonts/
│   │   └── atari-classic.woff2  # Atari ST Systemfont (8x8 Monospace-Pixel-Schriftart)
│   └── gfx/                     # Bild-Assets im indizierten Atari ST Farbraum (max. 16 Farben)
│       ├── background/
│       │   ├── intro.png        # Startbildschirm (320x200 Pixel)
│       │   └── podium.png       # Siegerehrungs-Podest (320x200 Pixel)
│       ├── judges/
│       │   └── judges_sheet.png # Spritesheet der Schiedsrichter (Clara, Dieter, Svetlana)
│       └── sprites/
│           ├── athletes_sheet.png # Spritesheet der Athleten (Animationsphasen)
│           └── ui_sheet.png     # UI-Elemente, Flaggen-Muster, Ladebalken
├── css/                         # Stylesheets
│   └── retro.css                # CRT-Scanline-Simulation, Pixelated Rendering, CSS Grid
├── data/                        # JSON-Konfigurationsdateien (Datenschicht)
│   └── sponsors.json            # Marken-Parodien, 9-Bit-Paletten und Chiptune-Noten-Arrays
├── js/                          # JavaScript-Quellcode (ES6 Module)
│   ├── audio/
│   │   ├── ChiptuneSynth.js     # Yamaha YM2149 Soundchip-Emulator (Web Audio API)
│   │   └── MusicPlayer.js       # Sequencer für prozedurale sponsors.json Hymnen & SFX
│   ├── core/
│   │   ├── App.js               # Einstiegspunkt & Initialisierung (bootstrap)
│   │   ├── AssetLoader.js       # Asynchroner Preloader für Grafiken und Fonts
│   │   ├── GameLoop.js          # Präzises Delta-Time-Timing (Atari ST 50Hz/60Hz V-Sync)
│   │   └── StateMachine.js      # Globaler Zustands-Manager (Lobby -> Spieldurchlauf)
│   ├── disciplines/
│   │   ├── BaseDiscipline.js    # Abstrakte Klasse / IDiscipline Interface-Definition
│   │   ├── BottleFlip.js        # Disziplin: Kronkorken-Schnippen (Winkel & Kraft-Timing)
│   │   ├── ChugSiphon.js        # Disziplin: Trichter-Exen (Rhythmisches Button-Mashing)
│   │   ├── BalanceHold.js       # Disziplin: Masskrug-Stemmen (Analoges links/rechts Balancieren)
│   │   └── StumbleRun.js        # Disziplin: Schlangenlinien-Lauf (Input-Lag & Alkohol-Pegel)
│   ├── input/
│   │   └── UnifiedInput.js      # Tastatur-, Touchscreen-Zweizonen- & HTML5-Gamepad-Mapper
│   ├── render/
│   │   └── AtariRenderer.js     # Canvas-Renderer mit Scanline-Rasterung & Palette-Splits
│   └── ui/
│       ├── LobbyManager.js      # Spieler-Registrierung, Sponsoren-Auswahl & sample-Trigger
│       ├── ScoringScreen.js     # Visualisierung der Schiedsrichter-Noten & Animationen
│       └── VictoryPodium.js     # Siegerehrungs-Ablauf, Flaggen-Hissen & verlangsamtes Audio
├── docs/                        # Technische Spezifikationen (Markdown)
│   ├── drinking-games-architecture.md
│   ├── drinking-games-asset-workflow.md
│   ├── drinking-games-disciplines.md
│   ├── drinking-games-judges.md
│   ├── drinking-games-pixel-art-specifications.md
│   ├── drinking-games-programming-conventions.md
│   ├── drinking-games-sponsors-audio.md
│   └── drinking-games-ui-lobby.md
├── .gitignore                   # Git-Ausschlussregeln
├── index.html                   # HTML-Grundgerüst mit `<canvas>`
├── package.json                 # Node-Konfiguration (ausschließlich für lokale Dev-Server & Linter)
└── README.md                    # Projekt-Dokumentation für GitHub
```

---

## 2. Essenzielle Konfigurationsdateien

### 2.1 `.gitignore`
Diese Datei verhindert das Committen von unnötigen VS Code Workspace-Caches, Node-Paketen oder temporären Dateien.

```ini
# .gitignore

# Dependencies
node_modules/
package-lock.json

# IDEs and Editors
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.swp

# OS-specific files
.DS_Store
Thumbs.db

# Build/Dist (Falls später hinzugefügt)
dist/
build/
```

### 2.2 `package.json`
Verwendet ausschließlich moderne, ressourcenschonende Tools für die lokale Entwicklung. Als lokaler Web-Server wird **Vite** empfohlen, da er native ES6-Module direkt unterstützt, ohne das Projekt in eine unlesbare Bundle-Datei (wie Webpack) umzuwandeln.

```json
{
  "name": "retro-drinking-games",
  "version": "1.0.0",
  "description": "Atari ST-style rundenbasiertes Drinking Game im Retro-Look",
  "main": "index.html",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint js/**/*.js",
    "prepare": "husky install"
  },
  "keywords": [
    "atari-st",
    "chiptune",
    "web-audio-api",
    "pixel-art",
    "retro-game",
    "drinking-game"
  ],
  "author": "Gemini Notebook Developer Team",
  "license": "MIT",
  "devDependencies": {
    "vite": "^5.0.0",
    "eslint": "^8.50.0",
    "husky": "^8.0.3"
  }
}
```

### 2.3 Husky Commit-Msg Hook (`.husky/commit-msg`)
Dieser Git-Hook erzwingt, dass jedes Teammitglied die *Conventional Commit*-Konventionen einhält. Falls eine Commit-Nachricht nicht den Regeln entspricht, bricht der Commit mit einer Fehlermeldung ab.

Erstelle die Datei `.husky/commit-msg` mit folgendem Inhalt:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Regex zur Validierung der Conventional Commits
commit_message="$(cat "$1")"
pattern="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9\-]+\))?: .+"

if ! echo "$commit_message" | grep -iqE "$pattern"; then
  echo "\n\033[31m[ERROR] Ungültiges Commit-Nachrichten-Format!\033[0m"
  echo "Erwartet wird ein Format wie:"
  echo "  \033[32mfeat(audio): implement native square wave synth\033[0m"
  echo "  \033[32mfix(sponsors): correct 9-bit palette for Grinness\033[0m"
  echo "  \033[32mdocs(specs): update disciplines documentation\033[0m"
  echo "Bitte lies 'docs/drinking-games-programming-conventions.md' für Details.\n"
  exit 1
fi
```

---

## 3. Einbindung in Visual Studio Code (VS Code)

Damit das Team optimal in VS Code arbeiten kann, wird die Erstellung einer `.vscode/settings.json` empfohlen. **Diese Datei sollte nicht global ignoriert, sondern ins Repository eingecheckt werden**, um einheitliche Editor-Einstellungen zu garantieren:

Erstelle `.vscode/settings.json`:
```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "eslint.workingDirectories": [
    "./"
  ]
}
```

---

## 4. Workflows zur Sponsoren- und Disziplinen-Erweiterung

*   **Neuen Sponsor hinzufügen:**
    1. Trage die Parodie-Marke in `data/sponsors.json` ein (Name, 9-Bit-Atari-Farbpalette, Symbole, Chiptune-Akkorde).
    2. Füge das neue Flaggen-Icon in das Spritesheet `assets/gfx/sprites/ui_sheet.png` ein.
    3. Committe die Anpassung mit: `feat(sponsors): add Caronas Extra parody brand`
*   **Neue Disziplin hinzufügen:**
    1. Erstelle die neue Klasse (z.B. `MyNewGame.js`) im Ordner `js/disciplines/` und implementiere das `IDiscipline`-Interface.
    2. Registriere die Klasse in der globalen Spiel-Ladeliste in `js/core/StateMachine.js`.
    3. Committe die Anpassung mit: `feat(disciplines): implement MyNewGame physics and controls`
