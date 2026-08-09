# Integration und Animation des Bayerischen Athleten-Spritesheets
## Technische Spezifikation für HTML5 Canvas (Atari ST 320 x 200 Low-Res)

Dieses Dokument beschreibt die technische Integration, das Post-Processing in externen Werkzeugen (wie Affinity) und die programmtechnische Steuerung des bayerischen Athleten-Spritesheets (`bavarian_athlete_spritesheet_v2`) für ein flüssiges Retro-Spielerlebnis.

---

## 1. Post-Processing & Herunterskalierung in Affinity
Da moderne KIs Bilder in hoher Auflösung ausgeben, muss die Grafik für den echten Atari ST Low-Res-Look heruntergerechnet werden.

### Workflow in Affinity (Designer / Photo):
1. **Dokumenten-Setup**: Öffnet das generierte Bild (`bavarian_athlete_spritesheet_v2.jpg`) in Affinity.
2. **Raster-Ausrichtung**: Aktiviert das Grid (Gitter) und stellt es auf die gewünschte Zielgröße pro Frame ein. Für die Atari ST-Auflösung von **320 x 200 Pixeln** empfehlen wir eine Standard-Sprite-Größe von **32 x 48 Pixeln** pro Frame.
3. **Downsampling (Herunterskalieren)**:
   * Wählt *Dokument ändern* -> *Dokumentskalierung* (Resize Document).
   * Ändert das Resampling-Verfahren zwingend auf **Nächster Nachbar (Nearest Neighbor)**. Dies verhindert ein Weichzeichnen der Kanten und erhält die harten Pixelgrenzen.
   * Skaliert die Gesamtbreite des Sheets so herunter, dass das Raster exakt aufgeht (z. B. bei einer Spaltenbreite von 32 Pixeln und einer Zeilenhöhe von 48 Pixeln).
4. **Farbreduktion (Atari ST Palette)**:
   * Exportiert das Bild als `.png` (8-Bit indizierte Farben).
   * Reduziert die Farbanzahl auf **maximal 16 Farben**.
   * Die Palette sollte ausschließlich aus 9-Bit-kompatiblen Farbwerten bestehen (RGB-Kanäle jeweils im Raster von `0` bis `7` / Abstufungen von `32` in modernen RGB-Werten: z. B. `#000000`, `#00E000`, `#E0E000` etc.).
5. **Transparenz**: Definiert den reinen schwarzen Hintergrund (`#000000`) im Code als transparenten Farbwert (Farbe-Index 0) oder schneidet ihn in Affinity direkt als Alpha-Kanal aus.

---

## 2. Frame-Aufteilung (Layout des Sheets)
Das verfeinerte v2-Spritesheet enthält **18 flüssige Animationsphasen** in einem sauberen Gitter-Layout (z. B. 6 Spalten x 3 Zeilen):

| Reihe (Zeile) | Frames | Beschreibung | Einsatzzweck |
| :--- | :--- | :--- | :--- |
| **Zeile 0 (Y = 0)** | 0 - 5 | Vorwärtslaufen (6 Frames) | Laufphasen, Annäherung ans Fass |
| **Zeile 1 (Y = 48)** | 6 - 9 | Treppensteigen / Leiter (4 Frames) | Höhenüberwindung / Podestaufstieg |
| **Zeile 2 (Y = 96)** | 10 - 13 | Holzschlegel-Schlag (4 Frames) | Aktiver Fassanstich (Button-Mashing) |
| **Zeile 3 (Y = 144)** | 14 - 17 | Sieger-Triumph (4 Frames) | Siegerehrung auf dem Podest |

---

## 3. JavaScript/HTML5 Canvas Steuerungs-Modul

Um die Animationen flüssig und unabhängig von der Monitor-Bildwiederholrate (Hz) abzuspielen, wird ein zeitbasierter Delta-Timer eingesetzt.

### Implementierungs-Code (`js/render/athlete-animator.js`):

```javascript
/**
 * Klasse zur Steuerung und Animation des bayerischen Athleten-Spritesheets
 */
export class AthleteAnimator {
    constructor(canvasContext, spritesheetImage) {
        this.ctx = canvasContext;
        this.image = spritesheetImage;

        // Sprite-Gitter-Konstanten (Atari ST 320x200 Standard)
        this.spriteWidth = 32;
        this.spriteHeight = 48;

        // Animations-Definitionen: [Zeile im Sheet, Frame-Anzahl, Abspielgeschwindigkeit (ms)]
        this.animations = {
            'run':      { row: 0, frameCount: 6, speed: 100 }, // 100ms pro Frame für flüssiges Laufen
            'climb':    { row: 1, frameCount: 4, speed: 120 },
            'swing':    { row: 2, frameCount: 4, speed: 80  }, // Schneller Schlag
            'triumph':  { row: 3, frameCount: 4, speed: 150 }  // Stolzes Jubeln
        };

        this.currentAnim = 'run';
        this.currentFrame = 0;
        this.timer = 0;
    }

    /**
     * Setzt die aktive Animation zurück
     * @param {string} animName 
     */
    setAnimation(animName) {
        if (this.animations[animName] && this.currentAnim !== animName) {
            this.currentAnim = animName;
            this.currentFrame = 0;
            this.timer = 0;
        }
    }

    /**
     * Aktualisiert den Animations-Frame basierend auf der vergangenen Zeit (Delta-Time)
     * @param {number} deltaTime - Vergangene Millisekunden seit dem letzten Frame
     */
    update(deltaTime) {
        const anim = this.animations[this.currentAnim];
        this.timer += deltaTime;

        if (this.timer >= anim.speed) {
            this.timer = 0;
            // Frame weiterschalten (Endlosschleife)
            this.currentFrame = (this.currentFrame + 1) % anim.frameCount;
        }
    }

    /**
     * Blittet (zeichnet) das aktive Sprite auf den Canvas
     * @param {number} x - X-Koordinate auf dem 320x200 Bildschirm
     * @param {number} y - Y-Koordinate auf dem 320x200 Bildschirm
     * @param {boolean} flipX - Wenn true, wird der Charakter horizontal gespiegelt
     */
    draw(x, y, flipX = false) {
        const anim = this.animations[this.currentAnim];
        
        // Quell-Koordinaten auf dem Spritesheet berechnen
        const sourceX = this.currentFrame * this.spriteWidth;
        const sourceY = anim.row * this.spriteHeight;

        this.ctx.save();

        if (flipX) {
            // Horizontal spiegeln für die Bewegung nach links
            this.ctx.translate(x + this.spriteWidth, y);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                this.image,
                sourceX, sourceY, this.spriteWidth, this.spriteHeight,
                0, 0, this.spriteWidth, this.spriteHeight
            );
        } else {
            // Normal zeichnen
            this.ctx.drawImage(
                this.image,
                sourceX, sourceY, this.spriteWidth, this.spriteHeight,
                Math.floor(x), Math.floor(y), this.spriteWidth, this.spriteHeight
            );
        }

        this.ctx.restore();
    }
}
```

---

## 4. Einbindung im Game Loop

Nutzt die folgende Render-Schleife innerhalb eures Hauptprogramms, um die Animationen zeitabhängig durchzuschalten:

```javascript
import { AthleteAnimator } from './render/athlete-animator.js';

const canvas = document.getElementById('gameViewport');
const ctx = canvas.getContext('2d');

const spritesheet = new Image();
spritesheet.src = 'assets/gfx/sprites/bavarian_athlete_spritesheet_v2.png';

let animator;
spritesheet.onload = () => {
    animator = new AthleteAnimator(ctx, spritesheet);
    animator.setAnimation('run'); // Start-Animation
    requestAnimationFrame(gameLoop);
};

let lastTime = 0;
function gameLoop(currentTime) {
    // Delta-Time in Millisekunden berechnen
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // 1. Clear Screen (Atari ST typisches Schwarz oder Hintergrund blitten)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Zustand aktualisieren & blitten
    if (animator) {
        animator.update(deltaTime);
        animator.draw(144, 100); // Zentriert im 320x200 Raster
    }

    requestAnimationFrame(gameLoop);
}
```
