# Asset-Workflow & KI-Pixel-Art-Spezifikation
## für das Atari ST-inspirierte Trinkspiel-Turnier

Dieses Dokument definiert den standardisierten Workflow für die Erstellung, Vorbereitung, Strukturierung und Einbindung von grafischen Assets in unsere WebApp. Es dient als verbindlicher Leitfaden für Designer, Entwickler und Prompt-Engineers, um den authentischen Charme der späten 1980er Jahre (Atari ST Shifter-Eigenschaften) mit modernen Web-Technologien und KI-Generierungstools zu vereinen.

---

## 1. Verzeichnis- und Ablagestruktur

Um eine saubere Trennung zwischen Logik-Code und Grafikdaten zu gewährleisten, werden alle Bild- und Musik-Assets in einem dedizierten `assets/`-Verzeichnis im Root-Ordner der WebApp abgelegt.

```
/project-root/
├── index.html                     # Hauptseite mit Canvas-Viewport
├── js/
│   ├── main.js                    # Game Loop & State Machine
│   ├── input.js                   # Unified Input Controller
│   ├── audio.js                   # Prozedurale YM2149 Synthesizer-Engine
│   └── renderer.js                # Atari ST Canvas-Renderer & CRT-Shader
├── data/
│   └── sponsors.json              # Datenbasierte Sponsor-Paletten und Melodien
└── assets/
    ├── gfx/
    │   ├── backgrounds/
    │   │   ├── intro_title.png    # Startbildschirm (320x200, Raster-Palette)
    │   │   └── podium_scene.png   # Siegerehrungs-Hintergrund (320x200)
    │   └── sprites/
    │       ├── judges.png         # Spritesheet der 3 Schiedsrichter (Clara, Dieter, Svetlana)
    │       ├── athletes.png       # Animations-Frames der Athleten-Sprites
    │       └── ui_symbols.png     # Parodierte Sponsoren-Flaggen (48x24), Icons und Fonts
```

---

## 2. Das Spritesheet-Konzept (Performance & Retro-Blitting)

Im klassischen Spieldesign werden einzelne Animationsphasen (Frames) niemals als separate Dateien geladen. Stattdessen nutzen wir **Spritesheets** (Sammelgrafiken), die alle Bewegungsabläufe eines Charakters oder Objekts in einem festeren Pixel-Raster (Grid) bündeln.

### Vorteile von Spritesheets
1. **Reduktion von HTTP-Anfragen:** Es muss nur ein einziges Bild geladen werden, was Ladezeiten minimiert und asynchrone Grafikfehler verhindert.
2. **Speichereffizienz:** Browser können eine große Textur wesentlich performanter im Grafikspeicher (VRAM) vorhalten als Hunderte winziger Einzelbilder.
3. **Synchronisiertes Zeichnen:** Der Renderer schneidet präzise den benötigten Frame aus dem Sheet aus.

### Technisches Rendering im HTML5 Canvas

Mithilfe der 9-Parameter-Überladung der Canvas-Methode `drawImage()` schneiden wir das gewünschte Sprite in Echtzeit aus dem geladenen Spritesheet aus:

$$\text{context.drawImage}(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)$$

* **$s$-Parameter (Source):** Position und Dimension des Frames innerhalb des Spritesheets.
* **$d$-Parameter (Destination):** Position und Dimension des gerenderten Pixels auf dem Bildschirm.

#### Code-Beispiel: Der Sprite-Blitter

```javascript
class RetroSprite {
    constructor(imagePath, frameWidth, frameHeight) {
        this.img = new Image();
        this.img.src = imagePath;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.isLoaded = false;
        this.img.onload = () => { this.isLoaded = true; };
    }

    /**
     * Zeichnet einen spezifischen Frame aus dem Spritesheet.
     * @param {CanvasRenderingContext2D} ctx - Der Rendering-Context
     * @param {number} frameX - Spalten-Index im Sheet (0-basiert)
     * @param {number} frameY - Zeilen-Index im Sheet (0-basiert)
     * @param {number} destX - X-Koordinate auf dem Canvas
     * @param {number} destY - Y-Koordinate auf dem Canvas
     */
    drawFrame(ctx, frameX, frameY, destX, destY) {
        if (!this.isLoaded) return;

        ctx.drawImage(
            this.img,
            frameX * this.frameWidth,  // Start-X im Spritesheet
            frameY * this.frameHeight, // Start-Y im Spritesheet
            this.frameWidth,           // Breite des Ausschnitts
            this.frameHeight,          // Höhe des Ausschnitts
            Math.floor(destX),         // Ziel-X (Integer-Verrundung verhindert Subpixel-Unschärfe)
            Math.floor(destY),         // Ziel-Y
            this.frameWidth,           // Ziel-Breite (1:1 Skalierung)
            this.frameHeight           // Ziel-Höhe (1:1 Skalierung)
        );
    }
}
```

---

## 3. KI-gestützter Pixel-Art-Workflow

Moderne generative KIs (z. B. Midjourney, Stable Diffusion, DALL-E) können atemberaubende Konzeptzeichnungen im Pixel-Art-Look erstellen. Allerdings erzeugen sie standardmäßig hochauflösende "Bilder von Pixel-Art" mit weichen Übergängen, Subpixel-Artefakten und Tausenden von Mischfarben. 

Um daraus echte, Atari-kompatible Assets zu machen, muss ein **vierstufiger Post-Processing-Workflow** eingehalten werden.

```
[ 1. KI-Generierung ] ──> [ 2. Downscaling ] ──> [ 3. Quantisierung ] ──> [ 4. Clean-Up ]
  (Spezifische Prompts)     (Nearest Neighbor)      (Farb-Reduktion 16)      (Aseprite-Pixeling)
```

### Schritt 1: Generierung & Prompt-Engineering
KIs müssen durch exakt definierte Constraints gezwungen werden, klare Kontraste und einfache Hintergründe auszugeben. 

* **Hintergrund-Constraint:** Immer einen flachen, einfarbigen Hintergrund (z. B. `solid black background` oder `solid chroma-key green`) erzwingen. Das erleichtert das Freistellen und das Setzen von Index-0-Transparenzen massiv.
* **Stil-Vorgaben:** Nutze Schlüsselbegriffe wie `8-bit`, `16-bit`, `Atari ST style`, `limited color palette` und `spritesheet grid`.

#### Optimierte Prompt-Vorlagen:

*   **Für Charaktere & Animationen:**
    > `/imagine prompt: Pixel art spritesheet of a brawny Bavarian referee holding a beer stein, clapping and cheering, Atari ST 16-color palette style, side profile view, multiple sequential animation frames, clean grid arrangement, solid black background, crisp details, no dither --v 6.0`
*   **Für Spielhintergründe (Stadium / Kneipe):**
    > `/imagine prompt: 8-bit retro pixel art background, a crowded German beer tent with cheering spectator silhouettes, low-resolution Atari ST style, limited 16-color palette, 320x200 resolution aspect ratio, flat color blocks, sharp pixel edges --ar 16:10`

---

### Schritt 2: Downscaling (Schrumpfen)
Das von der KI ausgegebene Bild (meist $1024 \times 1024$ Pixel) muss auf die winzige Zielauflösung der WebApp herunterskaliert werden (z. B. $32 \times 48$ Pixel für ein Charakter-Sprite).

* **Das Gesetz der Skalierung:** Beim Herunterskalieren in Editoren wie **Aseprite** oder **Photoshop** muss zwingend die Skalierungsmethode **"Nächster Nachbar" (Nearest Neighbor)** gewählt werden!
* **Warum?** Jede andere Methode (wie *Bilinear* oder *Bikubisch*) versucht, die Pixel weichzuzeichnen, was zu verwaschenen Kanten und unzähligen Mischfarben führt. "Nearest Neighbor" behält die harten, mathematisch exakten Pixelkanten bei.

---

### Schritt 3: Farbquantisierung (Atari-Farbkonformität)
Der Atari ST Shifter kann im Low-Res-Modus maximal 16 Farben gleichzeitig darstellen. Die KI-Generierung verwendet jedoch auch nach dem Downscaling noch Hunderte Farbnuancen durch Kompressionsartefakte.

1. Öffne das herunterskalierte Bild in **Aseprite**.
2. Wandle den Farbmodus von *RGB* auf **Indiziert (Indexed)** um.
3. Begrenze die Farbpalette streng auf **16 Farben** (Farb-Index `0` bis `15`).
4. Ersetze die Farben der indizierten Palette manuell durch die im Turniersystem oder in der `sponsors.json` definierten **9-Bit-Atari-Werte** (RGB-Stufen von 0 bis 7, z. B. `#700` für sattes Retro-Rot).
5. Definiere Farb-Index `0` als transparenten Hintergrund-Chroma-Key.

---

### Schritt 4: Manuelles Pixel-Clean-Up
Eine KI versteht die mathematische Logik hinter Pixel-Linien nicht vollständig. Jedes generierte Asset benötigt daher ein manuelles Finish durch einen Pixel-Artist:

* **Double-Pixels entfernen:** Schräge Linien dürfen keine "Doppelpixel" (Treppenstufen mit 2 Pixeln Breite) aufweisen. Jede Linie sollte idealerweise sauber im 1-Pixel-Rhythmus ($1\times1$, $1\times2$ oder $1\times3$) verlaufen.
* **Outlines säubern:** Charaktere benötigen eine klare, dunkle Außenlinie (1 Pixel dick), um sich flackerfrei vom animierten Hintergrund abzuheben.
* **Symmetrie-Check:** Bei Frontalansichten von Gesichtern oder UI-Elementen unregelmäßige KI-Abweichungen von Hand spiegeln.

---

## 4. Automatisierter Asset-Preloader in JavaScript

Um zu verhindern, dass die State Machine des Turniers startet, bevor alle Grafik-Assets vollständig im Browser geladen sind (was zu unschönen "weißen Kästen" oder Abstürzen führen würde), muss ein asynchroner **Preloader** vorgeschaltet werden.

```javascript
class AssetLoader {
    constructor() {
        this.assets = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    /**
     * Registriert ein Bild-Asset für den Ladevorgang.
     * @param {string} key - Eindeutiger Name für den Zugriff
     * @param {string} src - Pfad zur Bilddatei
     */
    loadImage(key, src) {
        this.totalAssets++;
        const img = new Image();
        img.src = src;
        img.onload = () => {
            this.loadedAssets++;
            this.checkProgress();
        };
        img.onerror = () => {
            console.error(`Fehler beim Laden des Assets: ${src}`);
        };
        this.assets[key] = img;
    }

    checkProgress() {
        const progress = this.loadedAssets / this.totalAssets;
        this.onProgress(progress);
        
        if (this.loadedAssets === this.totalAssets) {
            this.onComplete();
        }
    }

    // Callbacks für den Ladebildschirm
    onProgress(progress) {
        // Kann für einen Retro-Ladebalken auf dem Canvas genutzt werden
        console.log(`Lade Assets: ${Math.floor(progress * 100)}%`);
    }

    onComplete() {
        console.log("Alle Assets erfolgreich geladen!");
    }

    get(key) {
        return this.assets[key];
    }
}

// ANWENDUNGSBEISPIEL IN VS CODE (main.js)
const loader = new AssetLoader();

loader.onProgress = (progress) => {
    // Rendere Retro-Ladebalken auf dem Canvas
    const canvas = document.getElementById("viewport");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 320, 200);
    
    ctx.fillStyle = "#fff";
    ctx.fillRect(10, 90, 300, 20); // Rahmen
    ctx.fillStyle = "#070"; // Grüner Atari-Balken
    ctx.fillRect(12, 92, 296 * progress, 16);
};

loader.onComplete = () => {
    // Starte State Machine
    console.log("Starte das Turnier...");
    // gameStateMachine.transitionTo(STATES.INTRO);
};

// Registrierung aller benötigten Assets
loader.loadImage("title_bg", "assets/gfx/backgrounds/intro_title.png");
loader.loadImage("podium_bg", "assets/gfx/backgrounds/podium_scene.png");
loader.loadImage("judges", "assets/gfx/sprites/judges.png");
loader.loadImage("ui", "assets/gfx/sprites/ui_symbols.png");
```

---

## 5. GitHub Commit-Konventionen für Assets

Änderungen und Ergänzungen an den Grafikdaten müssen den Vorgaben unserer Programmier-Conventions entsprechen und zwingend mittels **Conventional Commits** dokumentiert werden.

| Commit-Typ | Scope | Beschreibung | Beispiel |
| :--- | :--- | :--- | :--- |
| `feat` | `assets` | Hinzufügen eines völlig neuen Sprites oder Hintergrunds. | `feat(assets): add right-aligned crowd silhouettes for stadium bg` |
| `fix` | `assets` | Beheben von Pixelfehlern, Outline-Schnittstellen oder Transparanzfehlern. | `fix(assets): resolve transparency index on Heineklon flag` |
| `perf` | `assets` | Reduktion der Dateigröße durch Farb-Indizierung oder optimalere Spritesheets. | `perf(assets): quantize title_bg to strict 16-color Atari palette` |
| `refactor` | `assets` | Umstrukturierung eines Spritesheets (z. B. Grid-Größe geändert). | `refactor(assets): reorganize athlete spritesheet to 48x48 grid` |
