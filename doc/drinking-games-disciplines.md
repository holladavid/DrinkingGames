# Detail-Spezifikation: Die Trink-Disziplinen (Minispiele)

Dieses Dokument definiert die spielmechanischen Details, die Eingabesteuerung und die softwareseitige Implementierung der einzelnen Trink-Disziplinen unseres Retro-Partyhits im Stil von *Summer Games* [36] und *World Games*.

## 1. Das modulare Disziplinen-Interface (`IDiscipline`)

Um eine saubere Software-Architektur zu gewährleisten, wird jede Disziplin als eigenständiges Software-Modul implementiert, das eine standardisierte Schnittstelle bedient. Dies entspricht dem **Strategy Pattern** [1565] und erlaubt es dem globalen `TournamentManager`, Minispiele dynamisch zu laden, zu initialisieren und zu steuern.

```typescript
/**
 * Einheitliches Interface für alle Spieldisziplinen.
 * Ermöglicht die einfache Erweiterung des Turniers um neue Minispiele.
 */
interface IDiscipline {
    id: string;                  // Eindeutige Kennung (z.B. "masskrug_stemmen")
    name: string;                // Anzeigename für Menüs und Schiedsrichter
    description: string;         // Kurze Anleitung für den Ladebildschirm
    
    // Lebenszyklus-Methoden
    init(players: Player[], currentActivePlayerIndex: number): void;
    update(deltaTime: number, input: VirtualInputState): void;
    render(ctx: CanvasRenderingContext2D): void;
    
    // Status-Abfragen für den TournamentManager
    isFinished(): boolean;
    getScores(): Record<string, number>; // Spieler-ID -> Score (0.0 - 10.0)
    getDrunkennessDelta(): number;        // Erhöhung des Promillewerts des Spielers
}
```

---

## 2. Spezifikation der 4 Haupt-Disziplinen

Jede Disziplin ist nach dem Prinzip **„Easy to Learn, Hard to Master“** entworfen. Die Steuerung ist auf genau **zwei Tasten** (bzw. Touch-Zonen / Gamepad-Buttons) reduziert, erfordert jedoch präzises Timing, Rhythmusgefühl oder Ausdauer.

### Disziplin 1: „Trichter-Exen“ (Siphon-Sprinting)
*Inspiriert vom 100m-Sprint in Summer Games [231, 36]. Ein reiner Schnelligkeits- und Rhythmustest.*

*   **Szenario:** Der Charakter steht vor einem gefüllten Biertrichter. Sobald das Startsignal ertönt, läuft die Zeit.
*   **Eingabemechanik (Rhythmisches Button-Mashing):**
    *   Der Spieler muss abwechselnd die Tasten **BUTTON_A** und **BUTTON_B** drücken.
    *   **Der Rhythmus-Faktor:** Einfaches, unkontrolliertes Hämmern führt zum „Verschlucken“ (kurze Lähmungsanimation von 1,5 Sekunden, in der keine Eingaben registriert werden). Der Spieler muss einen gleichmäßigen, schnellen Rhythmus finden, um das Getränk optimal herabzuschlucken.
    *   Die Durchflussgeschwindigkeit erhöht sich proportional zur Frequenz der fehlerfreien Tastenwechsel.
*   **Siegerehrungs-Relevanz:** Gewertet wird die Gesamtzeit bis zum vollständigen Leeren des Trichters. Eine Zeit unter 4,5 Sekunden führt zu einer Richterwertung nahe 10.0.
*   **Alkohol-Auswirkung:** Erhöht den Promillewert des Charakters um **0,4 ‰**.

### Disziplin 2: „Masskrug-Stemmen“ (Masskrug-Holding)
*Ein Balance- und Ausdauertest, ähnlich dem Stabhochsprung oder Gewichtheben in klassischen Sportspielen [36].*

*   **Szenario:** Der Charakter hält einen schweren 1-Liter-Bierkrug mit ausgestrecktem Arm. Ein horizontaler Balken zeigt den „Zittern-Bereich“ und eine Nadel den aktuellen Schwerpunkt des Arms.
*   **Eingabemechanik (Feinfühliges Gegensteuern):**
    *   Der Arm sinkt durch die Schwerkraft kontinuierlich nach unten. Gleichzeitig zittert der Arm zufällig (simuliert durch Rauschen / Perlin-Noise).
    *   Durch kurzes Antippen von **BUTTON_A** steigt der Arm leicht nach oben. Durch Antippen von **BUTTON_B** sinkt er kontrolliert (falls er zu hoch gerät).
    *   **Der Erschwerungs-Faktor:** Mit fortschreitender Zeit (Sekunden) wird der Arm „schwerer“ (die Abwärtskraft steigt) und das Zittern nimmt unregelmäßig zu. Der grüne Toleranzbereich auf der Anzeige schrumpft.
*   **Siegerehrungs-Relevanz:** Gewertet wird die gehaltene Zeit in Sekunden, bis der Krug den Toleranzbereich verlässt oder verschüttet wird.
*   **Alkohol-Auswirkung:** Erhöht den Promillewert des Charakters um **0,1 ‰** (durch gelegentliches Verschütten/Nippen).

### Disziplin 3: „Kronkorken-Flippen“ (Bottlecap-Skeet)
*Ein zweistufiger Präzisionstest mit physikalischen Hindernissen, ähnlich dem Tontaubenschießen [231, 36].*

*   **Szenario:** Der Charakter muss einen Kronkorken über einen langen Kneipentisch schnippen. Auf dem Tisch befinden sich zufällig platzierte Hindernisse (Bierpfützen, leere Gläser, Erdnussschalen). Am Ende des Tisches befindet sich eine Zielzone mit unterschiedlichen Punktebereichen (Sektoren von 1 bis 10).
*   **Eingabemechanik (Zweistufiges Timing):**
    *   **Schritt 1 (Winkel):** Ein Zeiger schwenkt auf einem Halbkreis hin und her. Der Spieler drückt **BUTTON_A**, um den Winkel des Schusses festzulegen.
    *   **Schritt 2 (Kraft):** Ein vertikaler Balken füllt und leert sich rasant. Der Spieler drückt **BUTTON_A** ein zweites Mal, um die Schnipp-Stärke festzulegen.
    *   **Physik-Engine:** Der Korken gleitet über das Canvas-Spielfeld. Bierpfützen bremsen ihn stark ab (Reibungskoeffizient erhöht), Gläser lassen ihn abprallen (elastischer Stoß).
*   **Siegerehrungs-Relevanz:** Gewertet wird der Sektor, in dem der Kronkorken liegen bleibt. Rutscht er über den Tisch hinaus, gibt es 0 Punkte.
*   **Alkohol-Auswirkung:** Erhöht den Promillewert um **0,0 ‰** (Präzisionsspiel vor dem Trinken).

### Disziplin 4: „Der Schlangenlinien-Lauf“ (The Drunken Walk)
*Ein Geschicklichkeits- und Reaktionstest, der die physische Beeinträchtigung durch Alkohol direkt spürbar macht [236].*

*   **Szenario:** Der Charakter schwankt im Zickzack-Kurs über eine kurvige, schmale Kneipengasse voller Hindernisse (Barhocker, schlafende Gäste, Pfützen).
*   **Eingabemechanik (Gegenlenken mit simuliertem Input-Lag):**
    *   Der Charakter läuft automatisch vorwärts und driftet ständig sinusförmig nach links oder rechts ab.
    *   Der Spieler muss mit **BUTTON_A** (Gegensteuern nach links) und **BUTTON_B** (Gegensteuern nach rechts) die Balance halten.
    *   **Der Alkohol-Effekt:** Je höher der aktuelle Promillewert des Spielers ist, desto größer ist das **Eingabe-Lag (Input-Lag)**. Ein Tastendruck wird bei 1,5 ‰ erst mit einer Verzögerung von z.B. 400 Millisekunden im Spiel registriert! Dies simuliert eindrucksvoll die verzögerte Reaktionszeit im betrunkenen Zustand [238].
*   **Siegerehrungs-Relevanz:** Gewertet wird die zurückgelegte Distanz, bis der Charakter stolpert oder den Gehweg verlässt.
*   **Alkohol-Auswirkung:** Erhöht den Promillewert des Charakters um **0,3 ‰** am Ziel (Strafbier).

---

## 3. Datenstrukturen für Disziplinen

Für das Speichern und Laden von Turnierzuständen deklariert die Spieldisziplin ihre Ergebnisse in folgender JSON-Struktur, die an das Haupt-Framework zurückgegeben wird:

```json
{
  "discipline_id": "masskrug_stemmen",
  "player_results": [
    {
      "player_id": "p1",
      "raw_value": 45.8,
      "unit": "seconds",
      "calculated_score": 9.2,
      "promille_added": 0.1
    },
    {
      "player_id": "p2",
      "raw_value": 22.1,
      "unit": "seconds",
      "calculated_score": 4.5,
      "promille_added": 0.1
    }
  ]
}
```
