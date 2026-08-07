# Drinking Games: Pixel-Art- und Grafik-Spezifikation (Atari ST Style)

Dieses Dokument definiert die verbindlichen Grafik- und Pixel-Art-Spezifikationen für das Retro-Partyspiel. Ziel ist es, die technische Ästhetik des **Atari ST (Shifter-Videocodec)** originalgetreu nachzubilden und gleichzeitig eine saubere, hochperformante Implementierung über das HTML5 Canvas API zu ermöglichen.

---

## 1. Technische Hardware-Einschränkungen (Atari ST Shifter)

Um das authentische visuelle Gefühl der späten 1980er Jahre zu erreichen, muss das Grafikdesign streng innerhalb der Grenzen der originalen Atari ST Hardware arbeiten:

### 1.1 Auflösung & Aspect Ratio
*   **Aktives Spielfeld (Low-Res):** **320 x 200 Pixel**. Das Canvas wird im Browser ohne Weichzeichnung (CSS: `image-rendering: pixelated;`) auf ein 16:9- oder 4:3-Verhältnis gestreckt.
*   **Statusleiste & Menüs (Medium-Res):** **640 x 200 Pixel** (simuliert durch Verdopplung der horizontalen Pixelauflösung). Dies wird für gestochen scharfe Texte verwendet.
*   **Virtueller Bildwiederholungs-Takt:** Das Rendering is auf **50 Hz (PAL)** synchronisiert, um butterweiches Scrolling und flackerfreie Animationen zu garantieren.

### 1.2 Die 9-Bit Farbpalette (Master Palette)
Der Atari ST Shifter verfügt über einen Farbraum von **512 Farben**.
*   Jeder Farbkanal (Rot, Grün, Blau) besitzt **3 Bit** Tiefe (Wertebereich von `0` bis `7`).
*   **Maximale gleichzeitige Farben:** Streng **16 Farben** auf dem Bildschirm im Low-Res-Modus.
*   Die Farbpalette im Code wird als Array von 16 Elementen im Format `[R, G, B]` (0-7) deklariert.

```javascript
// Beispiel für eine Atari ST Master-Farbpalette (Low-Res)
const masterPalette = [
    [0, 0, 0], // Index 0: Transparent / Hintergrund-Schwarz
    [7, 7, 7], // Index 1: Weiß (Text, Glanzlichter)
    [3, 3, 3], // Index 2: Dunkelgrau (Schatten, Konturen)
    [5, 5, 5], // Index 3: Hellgrau (Metall, Details)
    [7, 5, 3], // Index 4: Hautton Hell (Judges / Spieler)
    [5, 3, 1], // Index 5: Hautton Dunkel / Holz (Tisch)
    [7, 0, 0], // Index 6: Knallrot (Sponsoren-Details, Clara-Jubel)
    [4, 0, 0], // Index 7: Dunkelrot (Schatten Rot)
    [0, 7, 0], // Index 8: Hellgrün (Bierflaschen, Heineklon-Branding)
    [0, 4, 0], // Index 9: Dunkelgrün (Schatten Grün)
    [0, 0, 7], // Index 10: Hellblau (Wassereffekte, Grinness-Logo)
    [0, 0, 4], // Index 11: Dunkelblau (Schatten Blau)
    [7, 7, 0], // Index 12: Goldgelb (Bier, Messing, Lorbeerkranz)
    [5, 5, 0], // Index 13: Dunkelgelb (Schatten Gelb)
    [7, 4, 0], // Index 14: Orange (Flüssigkeiten, Jägerkleister-Branding)
    [3, 1, 0]  // Index 15: Dunkelbraun (Möbel, Haare)
];
```

### 1.3 Scanline Palette-Splits (Raster-Interrupts)
Um die 16-Farben-Grenze pro Bildschirm zu sprengen, nutzen wir die historische Demoszene-Technik der **Raster-Interrupts**:
*   Der Bildschirm wird horizontal in vertikale Segmente unterteilt.
*   **Obere Statuszeile (Pixel-Zeile 0–24):** Verwendet eine kontrastreiche Palette für Text (Blau, Weiß, Schwarz).
*   **Spielfeld & Judges (Pixel-Zeile 25–170):** Schaltet die Palette auf die Master-Spielfeldpalette um (Hauttöne, Holz, Sponsor-Farben).
*   **Podest- & Siegerehrung (Pixel-Zeile 171–200):** Schaltet dynamisch auf die Nationalfarben des Sieger-Sponsors um, um dessen Flagge prachtvoll darzustellen.

---

## 2. Brand Parodies & Flaggen-Spezifikation (Rechtssicher)

Alle Sponsoren-Brands sind als humorvolle Verballhornungen realer Marken angelegt. Sie müssen sofort wiedererkennbar sein (über Farben und Getränketyp), dürfen jedoch keine Markenrechte verletzen.

| Originalmarke | Parodie-Name | Primärfarben (Atari ST 9-Bit RGB) | Logo-Motiv (Pixel-Art) | Flaggen-Layout (Low-Res 48x24) |
| :--- | :--- | :--- | :--- | :--- |
| **Guinness** | *Grinness* | `[0,0,0]` (Schwarz), `[7,5,1]` (Gold) | Eine krakelige, asymmetrische **Laute** (statt der keltischen Harfe). | Tiefschwarz mit goldgelber Umrandung und Laute im Zentrum. |
| **Heineken** | *Heineklon* | `[0,5,0]` (Grün), `[7,0,0]` (Rot), `[7,7,7]` (Weiß) | Ein rotes **Sternchen (Asterisk `*`)** anstelle des fünfzackigen Sterns. | Smaragdgrün mit einem horizontalen weißen Balken und rotem Asterisk. |
| **Jägermeister** | *Jägerkleister* | `[7,3,0]` (Orange), `[0,4,0]` (Dunkelgrün) | Ein stark **schielender Elchkopf**, der einen Bierkrug im Geweih balanciert. | Waldgrün mit orangefarbenem Kreis-Inlay und Elch-Silhouette. |
| **Jack Daniel's** | *Mack Damion’s* | `[0,0,0]` (Schwarz), `[7,7,7]` (Weiß) | Ein verbeultes **Holzfass** mit der krakeligen Aufschrift *"Old No. 8"*. | Schwarz-Weiß gestreift mit einem zentralen Holzfass-Wappen. |
| **Corona Extra** | *Caronas Extra* | `[0,4,7]` (Blau), `[7,7,0]` (Gelb), `[7,7,7]` (Weiß) | Eine wackelige, gefaltete **Geburtstags-Papierkrone** mit Limettenscheibe. | Weiß mit einer markanten, hellblauen Meereswelle im unteren Drittel. |
| **Budweiser** | *Budweicher* | `[7,0,0]` (Rot), `[0,0,5]` (Blau), `[7,7,7]` (Weiß) | Eine riesige, schlaff nach unten hängende **Halsfliege** (Bow-Tie). | Diagonal rot-weiß geteilt mit blauer Halsfliege im Zentrum. |
| **Smirnoff** | *Schmirnoffski* | `[7,0,0]` (Rot), `[7,7,7]` (Weiß), `[5,5,5]` (Silber) | Ein flachgedrückter **Zylinder-Hut** über einem runden Schild. | Reines Signalrot mit einem weißen Kreis, der den Zylinder einrahmt. |

### Technische Vorgaben für Sponsoren-Logos:
*   **Größe in Menüs / Lobby:** Exakt **32 x 32 Pixel**.
*   **Größe auf der Flagge (Podest):** Maximal **16 x 16 Pixel** im Zentrum der **48 x 24 Pixel** großen Nationalflagge.
*   **Transparenz-Index:** Farbindex `0` (`[0,0,0]`) wird beim Zeichnen als transparent interpretiert und übersprungen.

---

## 3. Die 3 Schiedsrichter (Drinking Judges)

Das Schiedsrichter-Panel sitzt erhöht auf einer hölzernen Tribüne im Hintergrund des Spielfelds. Sie bewerten die Performance der Spieler nach jeder Disziplin.

### 3.1 Sprite-Abmessungen & Layout
*   **Sitzplatz-Box pro Richter:** **48 x 64 Pixel**.
*   **Anzahl der Richter:** 3 (2 Frauen, 1 Mann).
*   **Gesamte Richter-Tribüne:** **144 x 64 Pixel** (wird als statischer Hintergrund gezeichnet, über den die animierten Richter-Körper geblittet werden).

```
   [ Clara (48x64) ]     [ Dieter (48x64) ]     [ Svetlana (48x64) ]
   +---------------+     +---------------+     +---------------+
   |   (Kopf)      |     |    (Kopf)     |     |    (Kopf)     |
   | [Wertungskarte]|     |  [Bierkrug]   |     |  [Notizblock] |
   |   (Oberkörper)|     |  (Oberkörper) |     |  (Oberkörper) |
   +---------------+     +---------------+     +---------------+
   =============================================================
                     Gemeinsamer Richtertisch (Holztextur)
```

### 3.2 Die Richter-Charaktere

#### Richterin 1: Clara (Sportlich-ehrgeizig)
*   **Aussehen:** Rote, hochgesteckte Haare, sportliches Stirnband, Brille auf der Nasenspitze.
*   **Verhalten:** Achtet extrem streng auf den Rhythmus.
*   **Animationen (3 Frames pro Zustand, 50ms Intervall):**
    *   *Idle:* Schaut gelangweilt von links nach rechts, tippt mit dem Bleistift auf den Tisch.
    *   *Jubel:* Springt auf, wirft ihr Klemmbrett in die Luft, klatscht wild (Herzchen-Pixel-Effekt über dem Kopf).
    *   *Enttäuschung:* Schlägt beide Hände vor das Gesicht; eine dicke, animierte Schweißperle tropft an ihrer Schläfe herab.

#### Richter 2: Dieter (Bayerisches Urgestein)
*   **Aussehen:** Grauer Vollbart, Trachtenhemd, massige Statur.
*   **Verhalten:** Liebt pure Ausdauer und Kraft.
*   **Animationen (3 Frames pro Zustand, 75ms Intervall):**
    *   *Idle:* Nimmt gemütlich einen Schluck aus seinem massiven Steinkrug; Schaumreste bleiben im Bart kleben.
    *   *Jubel:* Stemmt beide Arme hoch, schwingt den Bierkrug im Kreis (spritzende Bier-Pixel) und schlägt lachend auf den Tisch.
    *   *Enttäuschung:* Schüttelt langsam den Kopf, schaut traurig in seinen leeren Krug und stellt ihn mit vernehmbarem "Klack" ab.

#### Richterin 3: Svetlana (Eiskalte Kritikerin)
*   **Aussehen:** Streng nach hinten gekämmtes, blondes Haar, kühler Blick, Pelzkragen.
*   **Verhalten:** Vergibt fast nie eine 10.0; sehr schwer zu beeindrucken.
*   **Animationen (3 Frames pro Zustand, 60ms Intervall):**
    *   *Idle:* Schaut überheblich über ihren Brillenrand, blättert langsam in ihren Notizen.
    *   *Jubel:* Ein seltenes, breites Lächeln bricht durch; sie applaudiert elegant und wirft dem Spieler ein pixeliges Küsschen zu.
    *   *Enttäuschung:* Zieht eine Augenbraue hoch, seufzt sichtbar (animierte Atemwolke) und hält emotionslos eine Wertungskarte mit einer eiskalten "1.0" hoch.

---

## 4. Spieler-Charaktere & Animationen

Die Spieler-Sprites stellen die Athleten während der aktiven Minispiele dar.

### 4.1 Technische Spezifikationen
*   **Sprite-Größe (Hauptcharakter):** **48 x 80 Pixel**.
*   **Farbtiefe:** Teilt sich die 16-Farben-Masterpalette mit der Umgebung.
*   **Hauttöne:** Müssen strikt auf die Paletten-Indizes `4` (Hell) und `5` (Schatten/Dunkel) gemappt sein, um eine einfache Farbtransformation (Skin-Color-Swapping) im Code zu ermöglichen.

### 4.2 Animations-Zustände (Disziplin-Spezifisch)

#### 1. Trichter-Exen (Siphon-Sprinting)
*   **Idle / Start:** Charakter steht bereit, hält den Trichter fest umklammert.
*   **Schlucken (Loop, 4 Frames):** Der Kopf neigt sich nach hinten, die Kehle bewegt sich rhythmisch auf und ab. Flüssigkeitspegel im Trichter sinkt sichtbar.
*   **Verschlucken (Fehler-Animation, 3 Frames):** Der Charakter hustet wild, sprüht Flüssigkeitspixel nach vorne und hält sich keuchend die Brust (2 Sekunden Eingabesperre).

#### 2. Masskrug-Stemmen (Masskrug-Halten)
*   **Ausbalanciert (3 Frames):** Arm ist waagerecht ausgestreckt, leichter, realistischer Zittern-Effekt (1-Pixel-Verschiebung im Wechsel).
*   **Zittern (Kritischer Bereich, 4 Frames):** Der gesamte Oberkörper zittert heftig. Schweißtropfen spritzen vom Kopf ab, die Knie knicken leicht ein.
*   **Absturz (Fehlgeschlagen, 5 Frames):** Der Arm knickt nach unten weg, der Krug fällt zu Boden und zerspringt in gelbe Bier- und graue Tonscherben-Pixel.

#### 3. Schlangenlinien-Lauf (Drunken Obstacle Run)
*   **Laufen (Loop, 6 Frames):** Klassischer 8-Bit-Laufzyklus mit schwankendem Oberkörper.
*   **Taumeln (Ablenkung, 4 Frames):** Der Charakter stolpert unkontrolliert nach links oder rechts, fängt sich im letzten Moment wieder auf.

---

## 5. Technische Implementierung (HTML5 Canvas & JavaScript)

### 5.1 Sprite-Sheet-Blitting mit Transparenz-Maskierung
Um Sprites ohne Performance-Verlust auf das Canvas zu zeichnen, verwenden wir ein Offscreen-Canvas als Sprite-Sheet-Quelle und nutzen den nativen Alpha-Kanal für die Transparenz.

```javascript
class RetroSprite {
    constructor(imageSrc, spriteWidth, spriteHeight) {
        this.image = new Image();
        this.image.src = imageSrc;
        this.width = spriteWidth;
        this.height = spriteHeight;
    }

    // Blittet einen spezifischen Frame aus dem Sprite-Sheet auf den Ziel-Kontext
    draw(context, frameX, frameY, targetX, targetY) {
        context.drawImage(
            this.image,
            frameX * this.width, // Source X
            frameY * this.height, // Source Y
            this.width,          // Source Breite
            this.height,         // Source Höhe
            targetX,             // Target X
            targetY,             // Target Y
            this.width,          // Target Breite
            this.height          // Target Höhe
        );
    }
}
```

### 5.2 CRT-Scanline & Dither-Filter (Atari ST Look)
Um den typischen Röhrenmonitor-Effekt (CRT) softwareseitig zu simulieren, wird nach dem Haupt-Rendering ein einfacher Scanline-Shader über das Canvas gelegt, der jede zweite Pixelzeile leicht abdunkelt.

```javascript
function applyRetroCRTFilter(context, width, height) {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
        // Jede zweite Zeile (Scanline-Effekt) um 15% abdunkeln
        if (y % 2 === 0) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                data[index]     = Math.max(0, data[index] * 0.85);     // Rot
                data[index + 1] = Math.max(0, data[index + 1] * 0.85); // Grün
                data[index + 2] = Math.max(0, data[index + 2] * 0.85); // Blau
            }
        }
    }
    context.putImageData(imageData, 0, 0);
}
```

---

## 6. Git Commit Richtlinien (Conventional Commits)

Jede grafische Anpassung, jedes neue Sprite-Sheet oder jede Änderung an den Paletten-Registern muss über eine saubere **Conventional Commit Message** auf GitHub dokumentiert werden.

### Erlaubte Typen für Grafik-Assets:
*   `feat(assets): add parodied Caronas Extra flag and party crown logo`
*   `fix(sprites): correct Clara's Outraged animation frame alignment`
*   `perf(renderer): optimize scanline scan-split rendering routine`
*   `style(palette): adjust Jägerkleister orange to match Atari 9-bit RGB bounds`
