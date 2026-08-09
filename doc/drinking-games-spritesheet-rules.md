# Retro Sprite Sheet & Animation Specification (Atari ST 320x200)

This document establishes the binding technical specification for loading, parsing, and animating retro 2D assets (characters, props, and UI items) in the Atari ST-themed Party WebApp [cite: 39]. To guarantee absolute compatibility, all sprite sheets must be accompanied by a JSON definition file matching the industry-standard **Aseprite JSON (Hash) export format** [cite: 16].

---

## 1. Gitter- und Koordinaten-Regeln (Grid & Pivot Rules)

Atari ST low-res screen space is extremely limited (**320 x 200 pixels**) [cite: 16, 39]. To preserve visual proportions and prevent render bugs, we enforce strict bounding box and anchor rules.

### 1.1. Standardisierte Frame-Größen
*   **Haupt-Charaktere (Athleten, Schiedsrichter):** **48 x 48 Pixel** (maximal 64 x 64 für extreme Posen).
    *   *Hinweis:* Ein 48-Pixel hoher Charakter nimmt fast ein Viertel des Bildschirms ein – die perfekte retro-lesbare Größe!
*   **Items & Props (Gläser, Flaschen, Kronkorken):** **16 x 16 Pixel** oder **24 x 24 Pixel**.
*   **UI-Elemente & Symbole:** **8 x 8 Pixel** oder **16 x 16 Pixel** (z. B. Flaggen: 48 x 24 [cite: 1457]).

### 1.2. Dreh- und Angelpunkte (Pivot / Anchor Points)
Um Versatz beim Abspielen unterschiedlicher Animationen zu vermeiden, nutzen wir vordefinierte Ankerpunkte:
*   **Charaktere:** Der Pivot liegt immer mittig am Fußende des Frames (`X = 24`, `Y = 47` bei einem 48x48-Frame). Das erleichtert das Platzieren auf dem Boden, Plattformen oder dem Siegerpodest.
*   **Rotierende Items (z. B. fliegende Kronkorken, rotierende Flaschen):** Der Pivot liegt exakt im geometrischen Zentrum (`X = width/2`, `Y = height/2`), um unsauberes Eiern bei mathematischen Rotationen zu verhindern.

---

## 2. Aseprite JSON Standard (Hash Format)

Jedes Sprite-Sheet benötigt eine gleichnamige `.json`-Datei im selben Verzeichnis (z. B. `bavarian_athlete.png` und `bavarian_athlete.json`). Wir nutzen das **Aseprite Hash-Format**, da es namentliche Keys für Frames besitzt und das Parsen extrem vereinfacht.

### Beispiel: `bavarian_athlete.json`
```json
{
  "frames": {
    "bavarian_athlete_run_0.png": {
      "frame": { "x": 0, "y": 0, "w": 48, "h": 48 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 48, "h": 48 },
      "sourceSize": { "w": 48, "h": 48 },
      "duration": 120
    },
    "bavarian_athlete_run_1.png": {
      "frame": { "x": 48, "y": 0, "w": 48, "h": 48 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 48, "h": 48 },
      "sourceSize": { "w": 48, "h": 48 },
      "duration": 120
    },
    "bavarian_athlete_strike_0.png": {
      "frame": { "x": 0, "y": 48, "w": 48, "h": 48 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 48, "h": 48 },
      "sourceSize": { "w": 48, "h": 48 },
      "duration": 80
    },
    "bavarian_athlete_strike_1.png": {
      "frame": { "x": 48, "y": 48, "w": 48, "h": 48 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 48, "h": 48 },
      "sourceSize": { "w": 48, "h": 48 },
      "duration": 80
    }
  },
  "meta": {
    "app": "Aseprite",
    "version": "1.3",
    "image": "bavarian_athlete.png",
    "format": "I8",
    "size": { "w": 288, "h": 192 },
    "scale": "1",
    "frameTags": [
      { "name": "run", "from": 0, "to": 1, "direction": "forward" },
      { "name": "strike", "from": 2, "to": 3, "direction": "forward" }
    ]
  }
}
```

### Bedeutung der Felder:
1.  **`frames`**: Ein Objekt, das jeden Frame einzeln deklariert. Der Name (`bavarian_athlete_run_0.png`) dient dem Code zur Sortierung.
2.  **`frame`**: Beschreibt die exakten Textur-Ausschneidekoordinaten (Clipping-Box) innerhalb der `.png`-Datei.
3.  **`meta.frameTags`**: Gruppiert die Frame-Indizes in namentliche Animationen (`run`, `strike`, `triumph`). Das ermöglicht das dynamische Umschalten im JS-Code mit lesbaren Strings anstelle von Zahlenkolonnen.
4.  **`duration`**: Bestimmt die individuelle Verweildauer des Frames in Millisekunden [cite: 36].

---

## 3. Asynchroner Asset-Loader & Animator

Die Programmierung erfolgt streng modular. Wir trennen das **asynchrone Laden** (Datenhaltung) vom **Rendern** (Controller/View).

### 3.1. Klasse: `SpriteSheet` (Daten-Modell)
Diese Klasse lädt die JSON-Datei und die Bilddatei parallel und stellt die Metadaten bereit.

```javascript
class SpriteSheet {
  constructor(imagePath, jsonPath) {
    this.imagePath = imagePath;
    this.jsonPath = jsonPath;
    this.image = null;
    this.data = null;
    this.isLoaded = false;
  }

  async load() {
    try {
      // 1. Lade JSON Metadaten
      const response = await fetch(this.jsonPath);
      this.data = await response.json();

      // 2. Lade PNG Bild-Datei
      return new Promise((resolve, reject) => {
        this.image = new Image();
        this.image.onload = () => {
          this.isLoaded = true;
          resolve(this);
        };
        this.image.onerror = (err) => reject(new Error(`Failed to load sprite texture: ${this.imagePath}`));
        this.image.src = this.imagePath;
      });
    } catch (err) {
      console.error(`Asset initialization error:`, err);
      throw err;
    }
  }

  getFrameInfo(index) {
    const keys = Object.keys(this.data.frames);
    if (index < 0 || index >= keys.length) return null;
    return this.data.frames[keys[index]];
  }

  getAnimationRange(tagName) {
    const tag = this.data.meta.frameTags.find(t => t.name === tagName);
    if (!tag) return null;
    return { from: tag.from, to: tag.to };
  }
}
```

### 3.2. Klasse: `SpriteAnimator` (Controller/Rendering)
Diese Klasse verwaltet den aktiven Animationszustand, berechnet die vergangenen Millisekunden (Delta-Timing) und zeichnet den passenden Frame auf den Bildschirm.

```javascript
class SpriteAnimator {
  constructor(spriteSheet) {
    this.sheet = spriteSheet;
    this.currentTag = "";
    this.currentFrameIndex = 0;
    this.frameStart = 0;
    this.frameEnd = 0;
    this.accumulatedTime = 0;
    this.isLooping = true;
    this.onCompleteCallback = null;
    this.playbackSpeedFactor = 1.0; // Für Drunken-Effekte / Lall-Bending
  }

  play(tagName, loop = true, onComplete = null) {
    if (this.currentTag === tagName) return; // Bereits aktiv

    const range = this.sheet.getAnimationRange(tagName);
    if (!range) {
      console.warn(`Animation tag "${tagName}" not found in metadata!`);
      return;
    }

    this.currentTag = tagName;
    this.frameStart = range.from;
    this.frameEnd = range.to;
    this.currentFrameIndex = range.from;
    this.accumulatedTime = 0;
    this.isLooping = loop;
    this.onCompleteCallback = onComplete;
  }

  update(deltaTimeMs) {
    if (!this.sheet.isLoaded || !this.currentTag) return;

    // Multipliziere deltaTime mit dem Geschwindigkeitsfaktor (z.B. langsamer bei Betrunkenheit)
    this.accumulatedTime += deltaTimeMs * this.playbackSpeedFactor;

    const currentFrameData = this.sheet.getFrameInfo(this.currentFrameIndex);
    if (!currentFrameData) return;

    const frameDuration = currentFrameData.duration || 100;

    if (this.accumulatedTime >= frameDuration) {
      this.accumulatedTime -= frameDuration;
      this.currentFrameIndex++;

      // Überprüfe Animations-Ende
      if (this.currentFrameIndex > this.frameEnd) {
        if (this.isLooping) {
          this.currentFrameIndex = this.frameStart; // Loop-Neustart
        } else {
          this.currentFrameIndex = this.frameEnd; // Halte beim letzten Frame
          const cb = this.onCompleteCallback;
          this.onCompleteCallback = null; // Verhindere Endlosschleife des Callbacks
          if (cb) cb();
        }
      }
    }
  }

  render(ctx, posX, posY, flipX = false) {
    if (!this.sheet.isLoaded) return;

    const frameData = this.sheet.getFrameInfo(this.currentFrameIndex);
    if (!frameData) return;

    const { x, y, w, h } = frameData.frame;

    ctx.save();

    // Mathematisch exakte Positionierung unter Berücksichtigung des Atari ST Shifters [cite: 39]
    // Wir runden Koordinaten strikt auf Ganzzahlen, um "Pixel-Bleeding" zu verhindern! [cite: 16]
    const renderX = Math.floor(posX);
    const renderY = Math.floor(posY);

    if (flipX) {
      // Für Bewegungen in Gegenrichtung spiegeln wir die Textur horizontal
      ctx.translate(renderX + w, renderY);
      ctx.scale(-1, 1);
      ctx.drawImage(this.sheet.image, x, y, w, h, 0, 0, w, h);
    } else {
      ctx.drawImage(this.sheet.image, x, y, w, h, renderX, renderY, w, h);
    }

    ctx.restore();
  }
}
```

---

## 4. Retro-Rendering & Performance-Optimierung

### 4.1. "Double Pixel-Bleeding" Verhindern
Auf modernen hochauflösenden Bildschirmen führt das Subpixel-Rendering von CSS/Canvas dazu, dass pixelgenaue Kanten verschwimmen [cite: 16]. Um dies zu verhindern, gilt:
1.  Sämtliche `X`- und `Y`-Zielkoordinaten müssen vor dem Aufruf von `drawImage` im Render-Loop mittels `Math.floor()` oder `Math.round()` in Ganzzahlen umgewandelt werden [cite: 16].
2.  Das Canvas muss die CSS-Eigenschaft `image-rendering: pixelated` besitzen [cite: 16].

### 4.2. Index-0 Transparenz (Color Keying)
Sollte euer Grafikteam statt nativer Alpha-Kanäle (die im Atari-Zeitalter unüblich waren und Speicherplatz kosten) mit einem festen Hintergrundfarbwert (z.B. `Color Key #000000` für Schwarz oder `#FF00FF` für Magic Magenta) arbeiten, maskiert der Canvas-Renderer diesen Farbwert zur Laufzeit:
*   Der Farbwert an Index 0 der indizierten Farbpalette wird im Canvas als transparent (`rgba(0,0,0,0)`) interpretiert, bevor die Bilddaten auf den Schirm übertragen werden.

---

## 5. GitHub-Schnittstellen und Commits

Jede Anpassung an diesem Spezifikationsdokument oder den Animationsskripten muss zwingend nach den **Conventional Commits** deklariert werden:

*   `docs(specs): add Aseprite JSON animation rules and grid guide`
*   `feat(renderer): implement SpriteSheet and SpriteAnimator classes`
*   `perf(renderer): optimize coordinate clipping using Math.floor`
