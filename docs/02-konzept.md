# Produktkonzept: Garde-Tanz (MVP)

> Eine PWA, mit der ein Trainerteam Gardetänze **so schreibt wie auf Papier**, mit der Musik verbindet und im Training **am Handy synchron mitlaufen lässt**.

Grundlage ist das [Interview-Protokoll](01-interview.md). Gestaltungsregeln stehen im [Design-System](03-design-system.md).

---

## 1. Ausgangslage

Heute schreiben Trainer Tänze mit Stift und Papier:

- **4 Bilder pro Seite**, A4 quer, 2 × 2. Unter jedem Bild stehen die Aktionen.
- Jedes Bild hat **Nummer und Anzahl Zeiten** (meist 8 oder 16).
- Gruppen werden mit **Symbolen** gekennzeichnet: gefüllter Kreis, leerer Kreis, „R“ (für die Gruppe *Reserve*, die voll mittanzt).
- Aktionen werden als **Anzahl + Kürzel** notiert: „2 drehen, 6 M“.
- Ein Tanz hat **30–50 Bilder**, also 8–13 Seiten.

Was Papier nicht kann: die Musik synchron mitlaufen lassen, im Training direkt zu einem Bild springen, Änderungen im Team verteilen, Laufwege sauber und wiederholbar zeichnen.

## 2. Produktziel und Leitsätze

**Ziel:** Ein Trainerteam erfasst einen kompletten Gardetanz mindestens so schnell wie auf Papier. Im Training hat es ihn jederzeit verlässlich am Handy, mit Musik und an der richtigen Stelle.

| Leitsatz | Bedeutung |
|---|---|
| **Papier-Parität** | Die Seitenansicht *ist* das Papierblatt: 2 × 2, A4 quer, gleiche Symbole, gleiche Notation. Seite 3 in der App ist Seite 3 im Ausdruck. |
| **Training vor Technik** | Im Training gehört die Aufmerksamkeit den Tänzern. Die App muss mit einem Blick und einem Daumen bedienbar sein. |
| **Nichts geht kaputt** | Training ist schreibgeschützt. Ändern geht nur im ausdrücklichen Bearbeiten-Modus. Offline-Fähigkeit ist ein sichtbarer Status. |
| **Vorschlagen statt Bevormunden** | Hinweise (z. B. „6 von 8 Zeiten“) blockieren nie. KI-Vorschläge werden nie ungefragt übernommen. |
| **Form zuerst** | Gruppen werden durch die Symbolform unterschieden, nicht durch Farbe. Das funktioniert im Schwarz-Weiß-Druck und bei Farbsehschwäche. |

## 3. Nutzer und Nutzungskontexte

**Primäre Nutzer:** das Trainerteam einer Garde (2–3 Personen) in **einem** Verein. Der Verein kann mehrere Garden haben (z. B. Jugend, Junioren, Aktive). Tänzer haben im MVP keinen Zugang.

| Kontext | Gerät | Situation | Anforderungen |
|---|---|---|---|
| **Schreiben** | Desktop, Tablet quer | Ruhig, zu Hause, mit Musik. Längere Sitzungen. | Seitenansicht 2 × 2, präzises Platzieren, Tastatur, Musik-Raster bearbeiten, KI-Assistent |
| **Training** | Handy hochkant, in der Hand oder am Rand abgelegt, an Box/Hallenanlage | Laut, unter Zeitdruck, Blick auf die Gruppe, oft nur ein freier Daumen | Bild und Aktionen groß, Zählzeit lesbar auf ~1,5 m, Start ab beliebigem Bild mit Vorlauf, Bildschirm bleibt an, offline |
| **Kurz anpassen** | Handy, Trainingspause | Kurze Korrektur nach einem Durchgang | Getrennter Bearbeiten-Modus: Aktion, Zeiten, Position, Notiz |
| **Papier** | Ausdruck | Ordner, Notizen im Training, Backup | Druck 1:1 wie die Seitenansicht, schwarz-weiß-tauglich |

## 4. Fachbegriffe (Sprache der App)

Die Oberfläche spricht die Sprache der Trainer. Diese Begriffe sind verbindlich, in der UI und im Code-Glossar.

| Begriff | Bedeutung | Code |
|---|---|---|
| **Tanz** | Eine Choreografie einer Garde für eine Saison | `Dance` |
| **Gruppe** | Feste Teilmenge der Tänzer mit eigenem Symbol (● ○ ✕). Meist 2–3 Gruppen mit je 4–10 Tänzern | `Group` |
| **Rolle** | Was eine Gruppe ist, z. B. *Mariechen* oder *Grenadiere*. Bestimmt, welche Aktionen es gibt (Grenadiere schwenken, klopfen, präsentieren das Gewehr). Gilt vereinsweit, mehrere Gruppen können dieselbe Rolle haben | `Role` |
| **Gruppenverbund** | Zwei oder mehr Gruppen, die sich in einem Bild wie eine verhalten (z. B. eine Linie ●○●○) | `Track.groupIds` |
| **Bild** | Eine Aufstellung mit einer festen Anzahl Zeiten. Zeigt die Startaufstellung und die Laufwege ins nächste Bild | `Frame` |
| **Zeit** | Ein Schlag. Kleinste Einheit, nur ganze Zeiten | `count` |
| **Achter** | 8 Zeiten. Ein Bild mit 16 Zeiten hat 2 Achter | – |
| **Formation** | Form, in der Tänzer stehen: Linie, Block, Kreis, Bogen, Keil, frei | `Formation` |
| **Aktion** | Baustein mit Anzahl Zeiten, z. B. `2 Dreh`, `6 M`. Bausteine kommen aus dem **Katalog der Rolle**, der sich beim Schreiben selbst füllt | `ActionBlock` |
| **Laufweg** | Weg von der Aufstellung in Bild *n* zur Aufstellung in Bild *n+1* | `Path` |
| **Raster** | Die Schlagzeitpunkte der Musik | `BeatGrid` |
| **Vorlauf** | Zeiten, die die Musik vor dem gewählten Startbild anläuft | `preRoll` |

## 5. Fachliches Kernmodell

### 5.1 Wie ein Bild funktioniert

```
Bild 7 · 16 Zeiten                          Bild 8 · 8 Zeiten
┌─────────────────────────┐                 ┌─────────────────────────┐
│   ● ○ ● ○ ● ○ ● ○       │   ──Laufweg──▶  │  ●  ●  ●  ●             │
│        ✕ ✕ ✕ ✕          │                 │  ○  ○  ○  ○    ✕ ✕ ✕ ✕  │
└──────── Publikum ───────┘                 └──────── Publikum ───────┘
●○  8 Wurf · 8 M  (16/16)                    …
✕   2 Schw · 6 Präs · 8 M  (16/16)
```

- Ein Bild beschreibt die **Startaufstellung** und was jede Gruppe in den Zeiten des Bildes tut.
- Die **Laufwege** führen zur Aufstellung des nächsten Bildes. Sie liegen **innerhalb** der Zeiten des Bildes, und zwar in den Aktionen, die als *bewegend* markiert sind (z. B. `8 M`).
- **Bewegung läuft nur während bewegender Aktionen.** Beispiel `4 M · 2 Dreh · 2 M`: Die Gruppe läuft 4 Zeiten, dreht 2 Zeiten am Platz und läuft 2 Zeiten weiter. Die Vorschau-Animation bildet das genau so ab.
- Beim Anlegen ist ein neues Bild eine **Kopie des vorherigen**. Verschiebt der Trainer im neuen Bild Formationen, entstehen die Laufwege im vorherigen Bild automatisch.

### 5.2 Datenmodell (vereinfacht)

```ts
type Id = string;

interface Dance {
  id: Id;
  teamId: Id;                 // Garde, z. B. "Junioren"
  title: string;              // "Gardetanz 2026/27"
  stageAspect: 1.5;           // fest 3:2, Publikum unten
  groups: Group[];            // geordnet, i. d. R. 2–3
  frameOrder: Id[];           // Reihenfolge der Bilder
  music?: Music;
  updatedAt: string; updatedBy: Id;
}

interface Group {
  id: Id;
  name: string;               // frei, z. B. "Mariechen", "Reserve"
  symbol: 'dot' | 'ring' | 'cross' | 'triangle' | 'square' | 'diamond' | { letter: string };
  size: number;               // Anzahl Tänzer, 4–10 typisch
  roleId: Id;                 // Rolle, z. B. "Grenadiere" → bestimmt den Baustein-Katalog
}

// Tänzer sind anonym. Intern: (groupId, index 0..size-1).
// Der Index sorgt nur dafür, dass Laufwege von Bild zu Bild stimmen.
type DancerRef = { groupId: Id; index: number };

interface Frame {
  id: Id;
  counts: number;             // ganze Zeiten, meist 8 oder 16
  formations: Formation[];    // Startaufstellung; jeder Tänzer genau 1×
  tracks: Track[];            // Aktionen; jede Gruppe in genau 1 Track
  pathStyle: PathStyle[];     // Darstellung der Laufwege ins nächste Bild
  note?: string;              // Trainer-Notiz
  updatedAt: string; updatedBy: Id;
}

interface Formation {
  id: Id;
  shape: 'line' | 'block' | 'circle' | 'arc' | 'wedge' | 'free';
  params: {                   // normierte Bühnenkoordinaten 0..1 (y=1 = vorne/Publikum)
    cx: number; cy: number; rotation: number;
    length?: number; rows?: number; radius?: number; spread?: number;
  };
  members: DancerRef[];       // Reihenfolge entlang der Form; gemischte Gruppen erlaubt
  pattern?: 'alternate' | 'blocks' | 'custom';
  overrides: Record<string, { x: number; y: number }>; // einzeln verschobene Positionen
}

interface Track {
  groupIds: Id[];             // ["g1"] oder Gruppenverbund ["g1","g2"]
  blocks: ActionBlock[];
}

interface ActionBlock {
  term: string;               // Begriff wie geschrieben: "Präs" (Schlüssel normalisiert: "präs")
  counts: number;             // ganze Zeiten
  moves: boolean;             // Laufweg in diesen Zeiten (Vorgabe aus RoleAction, pro Block änderbar)
}

// --- Rollen und Kataloge: vereinsweit, pflegen sich beim Schreiben selbst (siehe 6.5)
interface Role {
  id: Id;
  name: string;               // "Mariechen", "Grenadiere", "Fahnenträger"
}

interface RoleAction {        // Eintrag im Katalog einer Rolle
  roleId: Id;
  key: string;                // normalisierter Begriff ("präs"); Rolle + key → offline keine Doppelten
  label: string;              // Kürzel wie auf Papier: "Präs"
  longName?: string;          // "Gewehr präsentieren"; pro Rolle, "Wurf" darf je Rolle etwas anderes sein
  aliases: string[];          // Suchwörter, Tippvarianten
  state: 'candidate' | 'learned' | 'pinned' | 'hidden'; // candidate = 1× benutzt (Freitext)
  defaultCounts: number;      // häufigste benutzte Zeitenanzahl in dieser Rolle
  moves: boolean;             // geschätzt, dann aus Korrekturen gelernt
  uses: number; lastUsedAt: string; // Reihenfolge der Vorschläge
}

interface PathStyle {
  formationId: Id;
  mode: 'group' | 'individual';     // ein Pfeil pro Gruppe oder Einzelwege
  bend?: { dx: number; dy: number };  // Krümmung (ein Kontrollpunkt)
}

interface Music {
  fileId: Id; fileName: string; durationSec: number; version: number;
  beats: number[];            // Schlagzeitpunkte in Sekunden – die Wahrheit
  sections: { startBeat: number; bpm: number }[]; // nur für die Bearbeitung
  firstCountBeat: number;     // Index des Schlags, auf dem Bild 1 / Zeit 1 liegt
}
```

**Zeitberechnung:** Bild *i* beginnt bei der globalen Zeit `C_i = Σ counts(Bild 1 … i−1)`. Seine Startzeit in der Musik ist `beats[firstCountBeat + C_i]`. Ändert sich die Zeitenanzahl eines Bildes, verschieben sich alle folgenden Bilder automatisch.

### 5.3 Prüfregeln (Hinweise, nie Sperren)

| Regel | Hinweis-Text (Beispiel) |
|---|---|
| Summe der Aktionen einer Spur ≠ Zeiten des Bildes | „○ – 6 von 8 Zeiten belegt, 2 fehlen“ |
| Gruppe hat keine Aktion | „✕ – noch keine Aktion“ |
| Positionen ändern sich zum nächsten Bild, aber keine bewegende Aktion | „● – läuft ins nächste Bild, aber keine Lauf-Aktion“ |
| Laufwege verschiedener Gruppen kreuzen sich zur selben Zeit | „● und ✕ kreuzen sich in Zeit 5–8. Abstand prüfen.“ (Hinweis, kein Fehler: Durchmärsche sind gewollt) |

Hinweise erscheinen an der Spur, als Symbol am Bildkopf und gesammelt in einer Liste „Offene Hinweise (3)“. Auch ein Bild mit Hinweisen kann gespeichert, gedruckt und trainiert werden.

## 6. Funktionsumfang MVP

### 6.1 Verein, Konten, Sync

- **Anmeldung über das Microsoft 365 des Vereins:** „Mit Microsoft anmelden“ läuft über den eigenen Microsoft-365-Tenant des Vereins. Trainer nutzen ihr **Vereinskonto**. Wer keins hat, wird mit seinem **privaten Microsoft-Konto als Gast** in den Tenant eingeladen oder bekommt ein Vereinskonto. Es gibt keine eigenen Passwörter in der App und keine anderen Anmeldearten.
- **Einmal anmelden, dann dauerhaft:** Microsoft wird nur bei der ersten Anmeldung auf einem Gerät gebraucht. Danach hält die App die Sitzung selbst. Training und Bearbeiten funktionieren offline, ohne erneute Anmeldung.
- **Zugang = Mitglied der M365-Gruppe „Garde-Tanz“.** Die Gruppe wird für die App neu angelegt. Wer Zugang bekommt oder verliert, pflegt der Verein dort, wo er seine Konten ohnehin verwaltet. Die App hat **keine eigene Benutzerverwaltung** und keine Einladungslinks.
- **Admins** (Garden anlegen, Rollen zusammenführen oder löschen) sind die **Besitzer** dieser Gruppe. Eine zweite Gruppe ist nicht nötig.
- **Prüfung:** Bei jeder Anmeldung und einmal täglich prüft der Server die Gruppenmitgliedschaft. Wer aus der Gruppe entfernt wird, verliert den Zugang beim nächsten Online-Abgleich. Die Daten auf seinem Gerät werden dann gelöscht.
- **Gespeichert wird nur** Name, E-Mail-Adresse und die Microsoft-Konto-ID des Trainers.
- **Einrichtung (einmalig durch den M365-Admin, ca. 15 Minuten):** App in Entra ID registrieren, Gruppe „Garde-Tanz“ anlegen, Trainer als Mitglieder und die Trainerleitung als Besitzer eintragen, Externe als Gäste einladen, der Graph-Berechtigung einmal zustimmen. Eine Schritt-für-Schritt-Anleitung entsteht in M1.
- **Ein Vereins-Arbeitsbereich** mit Garden (Teams). Alle Trainer dürfen alle Tänze des Vereins lesen und bearbeiten.
- **Local-first:** Alle Daten liegen zusätzlich auf dem Gerät. Bearbeiten und Training funktionieren offline, der Abgleich passiert automatisch.
- **Konflikte:** Jedes Bild ist ein eigenes Dokument, gespeichert wird feldweise. Gleichzeitige Änderungen am selben Feld: die letzte gewinnt. Am Bild steht „zuletzt geändert von Anna, vor 5 Min.“.
- **Stände sichern:** benannte Versionen (z. B. „vor Turnier Köln“), wiederherstellbar als Kopie. Rückgängig/Wiederholen gilt pro Sitzung.
- **Offline-Bereitschaft** pro Tanz sichtbar: `Bilder ✓ · Musik ✓ – bereit fürs Training`.

### 6.2 Tanz anlegen

- Titel, Garde, Saison.
- **Gruppen:** Standard 3 Gruppen (● ○ ✕), jeweils mit **Rolle** (z. B. ● Mariechen mit Rolle *Mariechen*, ○ Grenadiere mit Rolle *Grenadiere*, ✕ Reserve mit Rolle *Mariechen*, weil sie dieselben Aktionen tanzt) und Anzahl Tänzer (4–10). Der Name ist optional, Standard ist der Name der Rolle. Gruppen lassen sich hinzufügen oder entfernen. Die UX ist auf 2–3 ausgelegt, 4–5 funktionieren.
- Ein neuer Tanz übernimmt Gruppen und Rollen vom letzten Tanz derselben Garde. Optional: aus einem anderen Tanz kopieren.

### 6.3 Seitenansicht und Bild-Editor (Desktop, Tablet)

**Standard ist die Seitenansicht:** ein A4-Blatt quer mit 2 × 2 Bildern, Aktionen unter der Bühne. Sie sieht genauso aus wie der Ausdruck.

```
┌ Kopfzeile: Tanz · Sync-Status · Drucken · Training ───────────────────────────────┐
│ ┌──────── Seite 3 / 11 (A4 quer) ────────┐ ┌ Inspektor (aktives Bild) ──┐ │
│ │ 9 · 16 Zeiten        10 · 8 Zeiten     │ │ Bild 10 · [ 8 ] Zeiten    │ │
│ │ ┌─────────────┐      ┌─────────────┐   │ │ Formationen               │ │
│ │ │ ● ○ ● ○ ● ○ │      │  ●  ●  ●  ● │   │ │  ▸ Linie ●○ (8)           │ │
│ │ │    ✕ ✕ ✕    │      │ ✕ ✕   ○ ○ ○ │   │ │  ▸ Block ✕ (4)            │ │
│ │ └─────────────┘      └─────────────┘   │ │ Aktionen                  │ │
│ │ ●○ 8 Wurf · 8 M      ●  8 M            │ │  ●○ [8 Wurf][8 M]  16/16  │ │
│ │ ✕  2 Schw · 14 M     ○  6 Wurf ⚠ 6/8   │ │  ✕  [2 Schw][14 M] 16/16  │ │
│ │ 11 · …               12 · …            │ │ Bausteine ✕: M Schw Präs  │ │
│ └────────────────────────────────────────┘ │ Notiz                     │ │
│ ‹ Seite 2   ■■■□□□□□□□□   Seite 4 ›        │ ✦ Mit KI beschreiben      │ │
├ Zeitleiste: Musik-Wellenform + Bilder als Blöcke (Breite = Zeiten) + Abspielkopf ┤
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Direkt im Blatt bearbeiten:** Ein Klick auf ein Bild macht es aktiv (Rahmen in Signalfarbe), rechts öffnet sich der Inspektor. Mit **Fokus** (Doppelklick oder `F`) füllt ein einzelnes Bild das Blatt, für Feinarbeit bei 30 Tänzern.
- **Navigation:** Seiten vor und zurück, Seitenübersicht, Zeitleiste (Klick springt zum Bild), Tastatur (`←` `→` Bild, `Bild↑` `Bild↓` Seite).
- **Bild einfügen:** `+` nach dem aktiven Bild oder `N` legt eine Kopie des vorherigen Bildes an. Alternativ „Mit KI beschreiben“ (siehe 6.8). Bilder lassen sich verschieben, duplizieren und löschen (mit Rückgängig).
- **Zeiten pro Bild:** Schnellwahl `8` `16` `4` `2` `32` und freie Eingabe.
- **Tablet hochkant:** 2 Bilder untereinander statt 2 × 2. Quer gilt das Standard-Blatt.

### 6.4 Formationen und Positionen

- **Formen:** Linie, Block (Reihen × Spalten), Kreis, Bogen, Keil (V), frei.
- **Ablauf:** Gruppe(n) wählen, Form wählen, die Tänzer werden gleichmäßig verteilt. Danach Form ziehen, drehen (rastet bei 15° ein) und Länge oder Radius ändern. Einzelne Tänzer lassen sich nachträglich verschieben.
- **Gemischte Formationen:** Eine Formation kann mehrere Gruppen enthalten. Muster: *abwechselnd* (●○●○), *blockweise* (●●●○○○) oder *eigene Reihenfolge*. Jede Position behält ihr Gruppensymbol.
- **Ausrichtungshilfen:** keine dauerhaften Raster. Beim Ziehen erscheinen kurz Hilfslinien (Bühnenmitte, Kanten anderer Formationen).
- **Zuordnung beim Formationswechsel:** Wer wohin läuft, ordnet die App automatisch so zu, dass die Wege möglichst kurz sind (innerhalb der Gruppe). Positionen lassen sich manuell tauschen.

### 6.5 Aktionen, Rollen und Kataloge

**Ausgangslage:** Welche Aktionen es gibt, hängt davon ab, wer tanzt. Grenadiere haben Gewehre und schwenken, klopfen, präsentieren. Mariechen marschieren oder hüpfen, wenn sie sich bewegen, und werfen die Beine. Eine gemeinsame Liste für alle wäre lang und passt für keinen richtig. Eine Liste, die man getrennt pflegen muss, veraltet.

**Grundidee:** Jede Gruppe hat eine **Rolle**, jede Rolle hat einen eigenen **Katalog**. Der Katalog füllt sich beim Schreiben von selbst. Korrigiert wird er dort, wo man gerade arbeitet. Niemand muss vorab etwas anlegen oder regelmäßig aufräumen.

```
Gruppe ● Mariechen ───┐
Gruppe ✕ Reserve ─────┴─▶ Rolle Mariechen  ─▶ M→  Hüpf→  Wurf  Dreh  Pose  Spagat …
Gruppe ○ Grenadiere ────▶ Rolle Grenadiere ─▶ M→  Schw  Klopf  Präs  Schult  Pose …
                                              (→ = bewegt sich, Reihenfolge = Häufigkeit)
```

**Schreiben**

- Pro Bild gibt es **eine Spur je Gruppe oder Gruppenverbund**. Ein Verbund (●○) entsteht, indem man Spuren zusammenzieht oder Gruppen in der Spur-Auswahl kombiniert.
- **Tippen wie auf Papier:** „2 schw 6 präs“ wird zu `2 Schw` `6 Präs`. Ab dem ersten Buchstaben erscheint eine Vorschlagsliste aus dem Katalog der Rolle. Sie sucht in Kürzel, langem Namen und Tippvarianten und verträgt Tippfehler. `Enter` übernimmt.
- **Baustein-Leiste:** die 8 häufigsten Bausteine der Rolle als Tasten. Ein Tipp hängt den Baustein mit seinen üblichen Zeiten an. Fehlen weniger Zeiten, nimmt er genau den Rest (bei `6/8` wird ein Tipp auf `M` zu `2 M`).
- **Gruppenverbund aus verschiedenen Rollen** (Mariechen und Grenadiere in einer Linie): Zuerst kommen Bausteine, die beide Rollen kennen, dann die übrigen mit Kennzeichen der Rolle.
- **Zeiten ändern** per Stepper oder Zahl. Die Summe der Spur steht daneben: `16/16` neutral, `6/8 ⚠` als Hinweis.

**Lernen durch Benutzen (automatisch)**

| Was | Wie |
|---|---|
| Neuer Begriff | Was nicht im Katalog steht, ist sofort als **Freitext** nutzbar (gestrichelter Baustein). Keine Rückfrage, kein Dialog. |
| Zweite Verwendung | Benutzt jemand denselben Begriff ein zweites Mal **in derselben Rolle**, wird er automatisch Baustein dieser Rolle. Ein kurzer Hinweis meldet „Neu bei Grenadiere: Salut“ mit `Rückgängig`. |
| Übliche Zeiten | Die Zeitenanzahl, die in dieser Rolle am häufigsten für den Baustein benutzt wurde. |
| Bewegt sich | Beim ersten Mal geschätzt (Wortstämme wie *marsch, lauf, hüpf, geh, schritt*). Stellt ein Trainer es an einem Baustein um, merkt sich die Rolle das. |
| Reihenfolge | Häufigkeit in dieser Rolle, die letzten Tänze zählen mehr. Angeheftete Bausteine stehen immer vorn. |
| Übliche Fortbewegung | Der häufigste bewegende Baustein der Rolle (Mariechen: `M` oder `Hüpf`, Grenadiere: `M`). Den bietet der Hinweis „läuft ohne Lauf-Aktion“ direkt an: `2 Hüpf ergänzen`. |
| Doppelte vermeiden | Ähnliche Schreibweisen („Schwenkn“) bekommen „Meinst du Schwenken?“. Gleicher Text ist derselbe Begriff, auch wenn zwei Geräte offline arbeiten. |

**Pflegen, wo man gerade ist (in place)**

Lange drücken (Handy) oder Rechtsklick bzw. `…` (Desktop) auf einen Baustein öffnet ein Menü:

- **Umbenennen:** ändert das Kürzel in allen Tänzen, z. B. `Präs` → `Präsent`. Standard: nur in dieser Rolle, wahlweise in allen Rollen
- **Langer Name und Tippvarianten**
- **Übliche Zeiten** für diese Rolle
- **Bewegt sich** ja/nein für diese Rolle
- **Oben anheften** / **Nicht mehr vorschlagen** (bestehende Verwendungen bleiben)
- **Zusammenführen mit …:** für Doppelte und Tippfehler, alle Verwendungen werden umgehängt

Zum gelegentlichen Aufräumen gibt es in den Vereinseinstellungen eine Übersicht pro Rolle (Liste mit Häufigkeit). Im Alltag braucht man sie nicht.

**Rollen**

- Rollen gelten **vereinsweit**, damit z. B. Jugend und Aktive voneinander profitieren. Mehrere Gruppen können dieselbe Rolle haben: Die ✕ Reserve tanzt mit und teilt sich den Katalog mit den ● Mariechen.
- **Jede Rolle hat ihre eigenen Begriffe.** Langer Name, übliche Zeiten und „bewegt sich“ gelten je Rolle. `Wurf` darf bei Mariechen der Beinwurf und bei Fahnenträgern das Fahnenwerfen sein. Gleiche Kürzel (`M`, `Dreh`) gelten im Gruppenverbund als gemeinsamer Baustein.
- **Neue Rolle in Sekunden:** Name eingeben, z. B. „Fahnenträger“. Die KI schlägt einen Start-Katalog mit 8–12 Bausteinen vor (Kürzel, Zeiten, bewegt sich), alle vorausgewählt. Ein Tipp übernimmt. Alternativ: Kopie einer bestehenden Rolle, oder leer starten, dann füllt sich der Katalog beim Schreiben.
- Braucht eine Garde eigene Begriffe, legt sie eine eigene Rolle als Kopie an (z. B. „Mariechen Jugend“).

**Was ein Trainer nie tun muss:** einen Katalog vorab anlegen, übliche Zeiten pflegen oder Listen aufräumen, damit die App funktioniert.

### 6.6 Laufwege

- **Automatisch** aus der Aufstellung von Bild *n* zu Bild *n+1*.
- **Wer läuft wohin:** Die App ordnet die Tänzer jeder Gruppe den neuen Plätzen so zu, dass die Summe der Wege minimal ist (Ungarische Methode). Dadurch kreuzen sich Wege innerhalb einer Gruppe nicht. Plätze lassen sich manuell tauschen.
- **Darstellung, Automatik in drei Stufen:**
  1. **Ein Pfeil pro Formation bzw. Gruppenverbund**, vom Schwerpunkt der Startaufstellung zum Schwerpunkt der Zielaufstellung.
  2. **Trennt sich ein Verbund** (z. B. ●○-Kreis wird zur Diagonale mit ● links, ○ rechts), bekommt jede Gruppe ihren eigenen Pfeil.
  3. **Formiert sich eine Gruppe am Platz um** (ihr Schwerpunkt bewegt sich weniger als 40 % des durchschnittlichen Einzelwegs), sagt ein Pfeil nichts mehr aus. Dann zeigt die App **Einzelwege**.
- **Manuell:** pro Formation fest auf *Pfeil pro Gruppe* oder *Einzelwege* stellen. Die Referenz-Umsetzung steht in `design-system/stage.js`.
- **Form des Weges:** gerade oder gebogen (ein Anfasser in der Pfeilmitte).
- **Zeitlicher Verlauf** über die bewegenden Aktionen (siehe 5.1). **Bewegungs-Vorschau:** Abspielen im Editor animiert die Symbole entlang der Wege.

### 6.7 Musik und Raster

1. **Hochladen** (MP3, M4A, WAV) zum Tanz. Die Datei liegt im Vereinsspeicher und wird auf Trainingsgeräten offline zwischengespeichert.
2. **Automatische Analyse:** Schläge, Taktanfänge („die 1“) und Tempo-Abschnitte werden erkannt. Das dauert einige Sekunden, danach erscheint ein Vorschlag für den Start von Bild 1.
3. **Korrigieren im Raster-Editor:**
   - Wellenform mit Schlagstrichen, jede „1“ eines Achters hervorgehoben.
   - **„Bild 1 beginnt hier“** auf einen Schlag ziehen. Das Intro davor gehört zum Vorlauf.
   - **Mittippen:** Während die Musik läuft, auf die Schläge tippen (Taste oder Fläche). Die App passt das Raster im markierten Abschnitt an.
   - **Tempo-Abschnitt:** „Ab hier neues Tempo“ an einem Schlag setzen, BPM per Mittippen oder Zahl.
   - **Feinjustage:** ganzes Raster oder Abschnitt um ±10 ms verschieben.
   - **Kontroll-Klick:** Beim Abspielen ein Klick auf jeder Zeit (nur zum Prüfen des Rasters).
4. **Zeitleiste:** Bilder liegen als Blöcke über der Wellenform. Die Breite entspricht der Länge in der Musik, jedes Bild zeigt seine Startzeit (mm:ss).
5. **Neue Musikversion:** Datei ersetzen, die Analyse läuft neu, „Bild 1 beginnt hier“ wird geprüft. Bilder und Aktionen bleiben unverändert.

### 6.8 KI-Assistent: Bild beschreiben

**Einstieg:** „Mit KI beschreiben“ im Inspektor oder beim Einfügen eines Bildes. Ein Textfeld nimmt auch Diktat über die Systemtastatur an.

> *„Die Mariechen bilden abwechselnd eine Linie vorne und gehen nach 8 Zeiten nach hinten in einen Keil. Die Grenadiere präsentieren vorne in der Mitte. 16 Zeiten.“*

**Ablauf wie ein Interview:**

1. Die KI prüft, ob die Beschreibung eindeutig genug ist.
2. **Unklar:** 1–3 Rückfragen als Karten mit Antwortoptionen und Freitext, z. B. *„Marschieren oder hüpfen die Mariechen nach hinten?“* → `Marschieren` · `Hüpfen` · *eigene Antwort*. Höchstens 2 Runden, danach ein Vorschlag mit markierten Annahmen.
3. **Vorschlag:** erscheint als **Vorschau im Bild** (halbtransparente Symbole, gestrichelte Laufwege, Aktionen markiert). Darunter stehen die Annahmen der KI im Klartext.
4. **Entscheiden:** `Übernehmen` · `Anders versuchen` · `Verwerfen`. Nach dem Übernehmen ist alles normal bearbeitbar.

**Was die KI erzeugt:** Formationen (als Formen mit Parametern, nicht als lose Koordinaten), Laufwege, Aktionsspuren mit Zeiten aus den Katalogen der beteiligten Rollen, inklusive ihrer üblichen Fortbewegung. Neue Begriffe aus einem Vorschlag werden wie getippter Freitext behandelt (6.5). Die Prüfregeln aus 5.3 werden vor der Anzeige angewendet. Ist ein Vorschlag ungültig, korrigiert die KI ihn automatisch einmal.

**Kontext für die KI:** Gruppen (Symbole, Größen), vorheriges und nächstes Bild, Kataloge der Rollen inkl. Kürzel, Standard-Zeiten und üblicher Fortbewegung, Bühnenkonventionen (3:2, Publikum unten), Zeiten-Standard.

**Technik (Vorschlag):** Eine Server-Funktion ruft die Claude API auf, Modell `claude-opus-5-5`. Weitere Details:

- **Strukturierte Ausgabe** (JSON-Schema über `output_config.format`). Die Antwort ist entweder `{ kind: "questions", … }` oder `{ kind: "frame", … }`.
- **Adaptives Denken**, Effort zunächst `medium` (kurze Wartezeit), wird mit echten Beschreibungen nachjustiert.
- **Serverseitiger Fallback** bei Ablehnungen.
- **Kosten:** grob 0,10–0,20 € pro Vorschlag, also wenige Euro pro Tanz. Ein Monatslimit für den Verein ist einstellbar.
- Der API-Schlüssel liegt nur auf dem Server, nie im Browser.

### 6.9 Trainingsmodus (Handy, Hochformat)

```
┌──────────────────────────────┐
│ ‹ Tänze   Bild 12 / 42 ▾   ⦿ │  ← Bild-Nr. tippen = Übersicht; ⦿ = offline bereit
│ ┌──────────────────────────┐ │
│ │   ● ○ ● ○ ● ○ ● ○        │ │  ← Bühne, volle Breite (3:2)
│ │        ✕ ✕ ✕ ✕   ↘       │ │     Laufwege als Pfeile
│ └──────── Publikum ────────┘ │
│   5  /8     2. Achter        │  ← Zählzeit, riesig
│  ▮▮▮▮▮▯▯▯ ▮▮▮▮▮▮▮▮           │  ← Achter-Segmente
│ ●○ ┃ 8 Wurf ┃ ▌8 M▐          │  ← laufende Aktion invertiert
│ ✕  ┃ 2 Schw ┃ ▌14 M▐         │
│ Weiter: Bild 13 · 8 Zeiten   │
│ [Vorlauf 8 ▾]   [✎ Bearbeiten]│
│  ◀ Bild 11   ( ▶ )  Bild 13 ▶ │  ← Daumenbereich, große Tasten
└──────────────────────────────┘
```

- **Start:** Auf der Tanzkarte „Training“ tippen. Der Tanz öffnet beim zuletzt genutzten Bild.
- **Abspielen ab Bild:** `▶` startet die Musik ab dem aktuellen Bild **mit Vorlauf** (Standard 8 Zeiten, einstellbar 0/4/8/16). Während des Vorlaufs zeigt die App „Gleich: Bild 12“ und zählt die Vorlauf-Zeiten groß herunter.
- **Synchron:** Bild, Zählzeit und laufende Aktion wechseln automatisch mit der Musik. Vergangene Aktionen sind gedimmt, die laufende ist invertiert, kommende sind umrandet.
- **Springen:** Wischen über die Bühne oder `◀` `▶`. Ein Tipp auf die Bildnummer öffnet die **Bildübersicht** (2 Spalten, Nummer + Zeiten), ein Tipp springt hin. Springen während des Abspielens startet das Zielbild neu mit Vorlauf.
- **Bildschirm bleibt an** (Wake Lock), solange Training geöffnet ist.
- **Box/Anlage:** Pro Gerät eine **Audio-Verzögerung** mit Kalibrierung (im Takt tippen), damit die Anzeige trotz Bluetooth-Latenz synchron bleibt. Play/Pause funktioniert auch über die Tasten der Box oder den Sperrbildschirm (Media Session).
- **Fehlertoleranz:** Tasten mindestens 64 px, Play 88 px. Keine Bearbeitungsgesten im Training. Abstand zwischen Tasten mindestens 12 px.

### 6.10 Bearbeiten-Modus (Handy)

- Betreten über `✎ Bearbeiten`, nur wenn die Musik pausiert ist.
- **Eindeutig anders:** Ein farbiger Rahmen um den ganzen Bildschirm, darüber das Band **„BEARBEITEN – Bild 12“** und `Fertig`.
- Möglich: Aktion bzw. Text ändern, Zeiten anpassen (Stepper), Position oder Formation verschieben (mit Lupe beim Ziehen), Notiz zum Bild. Rückgängig ist immer sichtbar.
- `Fertig` speichert und kehrt ins Training zurück. Änderungen synchronisieren wie überall.

### 6.11 Drucken

- **Format:** A4 quer, 2 × 2, identisch mit der Seitenansicht, in Schwarz-Weiß optimiert.
- **Optionen:** alle Seiten oder Bereich, mit/ohne Laufwege, mit/ohne Notizen.
- **Fußzeile:** Tanzname · Legende der Gruppen (● Mariechen · ○ Grenadiere · ✕ Reserve) · Stand (Datum, Version) · Seite x / y.
- **Optional:** eine Schlussseite mit den Kürzeln aller beteiligten Rollen.
- **Umsetzung:** Druck-Stylesheet (`@page A4 landscape`), dieselben SVG-Komponenten wie am Bildschirm. Ausgabe über den Druckdialog bzw. „Als PDF sichern“.
- Gleiche Seitenaufteilung in App und Druck, damit „Seite 4, Bild 14“ im Team auf beiden Wegen dasselbe meint.

## 7. Bildschirme (Informationsarchitektur)

| # | Bildschirm | Desktop/Tablet | Handy |
|---|---|---|---|
| 1 | Anmeldung | ✓ | ✓ |
| 2 | Übersicht: Garden → Tänze (Karten mit Offline-Status) | ✓ | ✓ |
| 3 | Tanz-Editor: Seitenansicht 2 × 2 + Inspektor + Zeitleiste | ✓ | – (nur Lesen: 1 Bild pro Bildschirm) |
| 4 | Raster-Editor (Musik) | ✓ | – |
| 5 | KI-Assistent (Seitenleiste) | ✓ | – |
| 6 | Training | (✓ Tablet) | ✓ |
| 7 | Bearbeiten-Modus | – | ✓ |
| 8 | Druckvorschau | ✓ | ✓ (PDF teilen) |
| 9 | Einstellungen: Gerät (Audio-Verzögerung, Vorlauf, hell/dunkel), Verein (Rollen und Kataloge aufräumen, im Alltag nicht nötig) | ✓ | ✓ |

## 8. Nicht im MVP

| Thema | Warum später |
|---|---|
| Papier-Scan mit KI-Auswertung | Laut Interview erst nach dem MVP. Der Druck ist die Grundlage dafür. |
| Tänzer-Zugang, „Wo stehe ich?“ | Braucht Personenbezug. Bewusst keine Personendaten im MVP. |
| Langsamer abspielen, Schleife, Metronom | Im Interview nicht priorisiert |
| Schautanz, Solo, Paartanz | Fokus Gardetanz |
| Bühnenmaße, Raster, umschaltbare Perspektive | „Freie Fläche reicht“, Publikum immer unten |
| Halbe Zeiten | Nicht benötigt |
| KI räumt Kataloge auf (Synonyme erkennen, z. B. „Gewehr hoch“ = „Präs“) | Erst nötig, wenn Kataloge groß werden. Zusammenführen geht im MVP von Hand am Baustein |
| Reihenfolgen lernen („nach Wurf folgt meist M“) | Häufigkeit reicht für gute Vorschläge zum Start |
| Mehrere Vereine, Abo | Nur der eigene Verein |
| Streaming-Dienste als Musikquelle | Synchronisation braucht die Datei |

## 9. Technik (Vorschlag)

| Bereich | Vorschlag | Begründung |
|---|---|---|
| App | **PWA**, TypeScript, React + Vite, `vite-plugin-pwa` (Workbox) | Ein Code für alle Geräte, installierbar, offline |
| Darstellung | **SVG** für Bühne, Symbole, Pfeile | Scharf auf jedem Bildschirm, identisch im Druck |
| Zustand | Zustand (Store) + Befehls-Historie für Rückgängig | Einfach, gut testbar |
| Daten & Sync | **Firebase** (EU-Region): Firestore mit Offline-Persistenz, Storage für Musik | Offline-Sync ist eingebaut, für einen Verein im Gratis- oder Kleinstkostenbereich. *Alternative:* Supabase (EU), dann mit eigener Offline-Schicht. |
| Anmeldung | **Firebase Auth mit Microsoft-Anbieter** (mit Identity Platform, wegen Blocking Functions). App-Registrierung als **Einzelmandant im Vereins-Tenant** (Entra ID), Gäste über Entra B2B. Eine Blocking Function (`beforeSignIn`) prüft per Microsoft Graph die Gruppenmitgliedschaft, ein täglicher Job prüft erneut. Berechtigung `GroupMember.Read.All` (Anwendung) mit einmaliger Admin-Zustimmung. Anmeldung per Weiterleitung statt Pop-up (installierte PWAs auf iOS). | Eigener Tenant: keine Freigabe-Probleme, keine Herausgeber-Verifizierung, Benutzerpflege in M365. Die Firebase-Sitzung bleibt unabhängig vom Microsoft-Token bestehen, das ist wichtig für Offline-Training. *Alternative:* Supabase mit Azure-Anbieter. |
| Kataloge | Schlüssel eines Bausteins = Rolle + normalisierter Text. Häufigkeit, übliche Zeiten und „bewegt sich“ aktualisiert ein Function-Trigger beim Speichern eines Bildes. Vorschläge berechnet das Gerät aus dem lokal gespeicherten Katalog, auch offline. | Keine Doppelten durch Offline-Arbeit, alle Geräte sehen dieselben Vorschläge. |
| Musik offline | Cache Storage / IndexedDB, `navigator.storage.persist()` | Musik muss ohne Netz in der Halle laufen |
| Audio | **Web Audio API**, Zeit aus `AudioContext.currentTime` minus `outputLatency` minus Geräte-Verzögerung | Genaue Synchronität |
| Schlagerkennung | Server-Analyse beim Hochladen (z. B. Python-Dienst mit einem Beat-/Downbeat-Tracker wie *beat_this* oder *madmom*, Lizenz prüfen). Fallback: Mittippen | Medleys mit Tempowechseln brauchen gute Takterkennung |
| KI | Server-Funktion mit Anthropic SDK, `claude-opus-5-5`, strukturierte Ausgabe | Schlüssel sicher, Antwort schema-valide |
| Tests | Vitest (Logik: Zeiten, Prüfregeln, Formen), Playwright (Abläufe, Druck) | – |

## 10. Risiken und frühe Prüfungen (Spikes)

| # | Risiko | Spike | Erfolgskriterium |
|---|---|---|---|
| 1 | Schlagerkennung versagt bei Garde-Medleys mit Tempowechseln | 5 echte Tanzmusiken des Vereins analysieren | ≥ 90 % der Schläge korrekt, Korrektur < 5 Min. pro Musik |
| 2 | Audio-Latenz Bluetooth / iOS-PWA (Autoplay, Stummschalter, Hintergrund) | iPhone + Android mit Hallen-Box testen | Anzeige nach Kalibrierung ≤ 50 ms versetzt |
| 3 | iOS löscht Offline-Daten von Web-Apps | Installierte PWA, persistenter Speicher, 14 Tage Test | Tanz + Musik nach 14 Tagen offline verfügbar |
| 4 | KI erzeugt räumlich unsinnige Aufstellungen | 20 echte Beschreibungen aus bestehenden Papier-Tänzen | ≥ 70 % ohne oder mit kleiner Nacharbeit übernehmbar |
| 5 | 30 Tänzer auf dem Handy präzise verschieben | Prototyp Bearbeiten-Modus | Formation in < 10 s korrekt verschoben |
| 6 | Microsoft-Anmeldung scheitert in der installierten iOS-PWA (Weiterleitung, Safari trennt den Speicher von Drittanbietern), oder Gastkonten mit privatem Microsoft-Konto verhalten sich anders | Anmeldung mit Vereinskonto und Gastkonto auf iPhone (installiert), Android und Desktop. Entfernen aus der Gruppe testen | Beide Kontoarten melden sich an. Die Sitzung hält ≥ 30 Tage, auch über Offline-Phasen. Wer aus der Gruppe entfernt wurde, ist beim nächsten Online-Start gesperrt |

## 11. Erfolgskriterien für das MVP

1. Ein kompletter Tanz (40 Bilder + Musik) ist am Desktop **nicht langsamer als auf Papier** erfasst.
2. Im Training: **Start ab beliebigem Bild in ≤ 2 Tipps**, Bild und Zählzeit auf **1,5 m** lesbar.
3. Der **Ausdruck** ist für das Team mindestens gleichwertig zum handgeschriebenen Blatt.
4. Eine Änderung am Desktop ist nach dem Öffnen auf dem Handy da. Training läuft **ohne Netz**.
5. Das Trainerteam nutzt die App eine ganze Saison lang parallel zum Papier.

## 12. Umsetzungsreihenfolge

| Meilenstein | Inhalt | Nutzen danach |
|---|---|---|
| **M0 Spikes** | Risiken 1–3 und 6 aus Abschnitt 10 | Technik ist abgesichert |
| **M1 Fundament** | PWA-Gerüst, Design-System als Komponenten, Datenmodell, Konten und Sync | Daten sind auf allen Geräten |
| **M2 Schreiben + Drucken** | Seitenansicht 2 × 2, Formationen, Aktionen, Laufwege, Prüfregeln, Druck | **Ersetzt das Schreiben auf Papier**, der Ausdruck bleibt |
| **M3 Musik** | Hochladen, Analyse, Raster-Editor, Zeitleiste, Bewegungs-Vorschau | Tanz und Musik sind verbunden |
| **M4 Training** | Trainingsmodus, Vorlauf, Audio-Verzögerung, Bearbeiten-Modus, Offline-Status | **Einsatz in der Halle** |
| **M5 KI** | KI-Assistent mit Rückfragen und Vorschau | Schneller neue Bilder |

## 13. Offene Fragen für später

1. Welche Aktionen schreibt ihr heute unter die Bilder, und wie kürzt ihr sie ab (z. B. „M“ für marschieren, „Präs“ für präsentieren)? Am besten getrennt nach Mariechen, Grenadieren und Reserve. Daraus werden die Start-Kataloge. Das ist optional: Ohne Liste schlägt die KI einen vor, und der Rest lernt sich beim Schreiben.
2. Zählt ihr laut „1–8, 2–2–3–…“ oder „1–16“? (Das bestimmt die Zählanzeige, Standard sind Achter.)
3. Sollen alle Trainer des Vereins alle Tänze bearbeiten dürfen oder nur die eigene Garde?
4. Gibt es Einmarsch und Ausmarsch als eigene Bilder oder gehören sie nicht zur Choreografie?
5. Braucht ihr Bildtitel (z. B. „Diagonale“) als optionales Feld, z. B. für die Bildübersicht im Training?
6. Stimmt die Zuordnung ● Mariechen, ○ Grenadiere, ✕ Reserve? Und tanzt die Reserve dieselben Aktionen wie die Mariechen (dann teilen sie sich einen Katalog) oder eigene?
