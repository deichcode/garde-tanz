# Design-System „Gardemaß“

> Für Trainer in der Halle: lesbar mit einem Blick, bedienbar mit einem Daumen, druckbar wie das Papierblatt.

| Datei | Inhalt |
|---|---|
| [`design-system/tokens.css`](../design-system/tokens.css) | **Quelle der Wahrheit:** Farben (hell, dunkel, Druck), Schrift, Abstände, Größen, Bewegung |
| [`design-system/components.css`](../design-system/components.css) | Referenz-Komponenten: Tasten, Bausteine, Bildkarte, Blatt, Zählzeit, Bühne … |
| [`design-system/stage.js`](../design-system/stage.js) | Referenz-Renderer: Formen → Einzelpositionen, Zuordnung auf kürzeste Wege, Laufweg-Automatik |
| [`design-system/index.html`](../design-system/index.html) | Lebender Styleguide mit allen Komponenten und Screen-Entwürfen (im Browser öffnen) |

---

## 1. Prinzipien

| Prinzip | Regel | Prüffrage |
|---|---|---|
| **Papier-Parität** | Die Seitenansicht ist das Papierblatt: A4 quer, 2 × 2, Aktionen unter der Bühne, Notation „2 1/4 Dreh · 6 Marsch“. | Würde ein Trainer das ausgedruckte Blatt sofort lesen können? |
| **Auf einen Blick** | Bild und Zählzeit sind auf 1,5 m lesbar. Text im Training hat ≥ 7:1 Kontrast. „Jetzt“ ist gefüllt, alles andere umrandet oder gedimmt. | Erkenne ich in 1 Sekunde, wo wir sind? |
| **Daumen statt Präzision** | Treffflächen 48 / 64 / 88 px, Steuerung im Daumenbereich, ≥ 12 px Abstand im Training. | Geht das mit einer Hand und ohne genau hinzusehen? |
| **Form vor Farbe** | Gruppen werden über die Symbolform unterschieden. Hinweise haben immer Icon + Text. | Funktioniert es in Schwarz-Weiß? |
| **Jeder Modus ist sichtbar** | Training ist schreibgeschützt. Bearbeiten hat Farbe, Rahmen und ein Band. Sync- und Offline-Status sind immer sichtbar. | Kann man versehentlich etwas ändern? |
| **Ruhe statt Deko** | Keine Verläufe, keine dekorative Animation. Bewegung nur für Bedeutung, mit `prefers-reduced-motion` abschaltbar. | Lenkt das von den Tänzern ab? |

## 2. Farben

**Tinte auf Papier** plus wenige Farben mit **genau einer Bedeutung**. Gruppen haben bewusst **keine Farbe**: So bleibt das Bild ruhig, druckt sauber und kollidiert nicht mit Statusfarben.

| Rolle | Token | Hell | Dunkel | Kontrast (hell, auf Papier) |
|---|---|---|---|---|
| Papier (Blatt, Bühne, Karten) | `--gm-paper` | `#FFFFFF` | `#171B22` | – |
| Leinwand (App-Hintergrund) | `--gm-canvas` | `#EEF0F3` | `#0C0F14` | – |
| Vertieft (Leisten, Stepper) | `--gm-sunken` | `#E4E7EC` | `#222833` | – |
| Tinte (Text, Symbole, Primärtaste) | `--gm-ink` | `#11151C` | `#F1F4F8` | **18,3:1** |
| Tinte 2 (Sekundärtext) | `--gm-ink-2` | `#3A4250` | `#C5CCD6` | 10,1:1 |
| Tinte 3 (Hilfstext) | `--gm-ink-3` | `#596272` | `#9AA4B2` | 6,2:1 |
| Linie stark (Rahmen von Bedienelementen) | `--gm-line-strong` | `#7A8392` | `#737D8E` | 3,8:1 |
| **Signal**: aktiv, ausgewählt, jetzt | `--gm-signal` | `#1846C7` | `#8EAEFF` | 7,7:1 |
| **Hinweis**: Zeiten gehen nicht auf | `--gm-warn` auf `--gm-warn-tint` | `#8A4600` / `#FFF0D1` | `#FFC56B` / `#3A2A0E` | 6,3:1 |
| **Fehler**: Löschen, echte Fehler | `--gm-danger` | `#B0241B` | `#FF8E86` | 6,7:1 |
| **Erledigt**: synchronisiert, offline bereit | `--gm-ok` | `#17663A` | `#74D99A` | 7,0:1 |
| **Bearbeiten-Modus** (nur dafür) | `--gm-edit` | `#9C1487` | `#F49BE4` | 7,3:1 |

**Regeln**

- Alle Textpaare erfüllen WCAG 2.2 AA. Im Training (Tinte, Signal) liegt der Kontrast bei ≥ 7:1 (AAA).
- **Signal-Blau** = aktiv/jetzt: laufende Aktion, Abspielkopf, Auswahl, Fokus, die eine Hauptaktion (Abspielen, Übernehmen).
- **Primärtasten sind Tinte**, nicht Farbe. Farbe ist für Bedeutung reserviert.
- **Magenta** erscheint ausschließlich im Bearbeiten-Modus.
- **Druck** ist immer Schwarz auf Weiß. Hinweisflächen und Auswahl werden nicht gedruckt.
- **Theme-Logik:** ohne `data-theme` folgt die App dem System. `data-theme="light"` oder `"dark"` erzwingt den Modus. Standard ist **hell**, weil Trainingshallen hell sind und Papier-Anmutung gewünscht ist.

## 3. Schrift

- **Atkinson Hyperlegible Next** für alles. Sie wurde für maximale Unterscheidbarkeit entworfen (1 l I, 0 O, 6 8) und bleibt auch unter Stress und auf Abstand lesbar.
- **Atkinson Hyperlegible Mono** für Zahlen in Spalten: Summen (`16/16`), Zeitangaben (`01:42`), Stepper.
- Beide stehen unter der SIL Open Font License. Die App **hostet sie selbst**, damit sie offline funktionieren.
- Gewichte nur **400 / 700 / 800**. Keine dünnen Schnitte, kein Kursiv als Bedeutungsträger, Großbuchstaben nur für kurze Etiketten mit Sperrung.

| Token | Größe | Einsatz |
|---|---|---|
| `--gm-text-count` | 96 px / 800 | Zählzeit im Training |
| `--gm-text-display` | 48 px / 800 | Vorlauf-Zähler |
| `--gm-text-2xl` | 36 px / 800 | Bildnummer im Training |
| `--gm-text-xl` | 28 px / 800 | Überschriften, Bildnummer im Editor |
| `--gm-text-lg` | 22 px / 700 | Aktionen im Training |
| `--gm-text-md` | 18 px | Standard am Handy |
| `--gm-text-sm` | 16 px | Standard am Desktop, **Mindestgröße für Bedienelemente** |
| `--gm-text-xs` | 14 px / 700 | Fußzeilen, Legenden. **Nie für Tasten** |

Im **Blatt** skaliert die Schrift mit der Blattbreite (Container-Einheiten). Aktionstext fällt dort nie unter 13 px. Ist das Blatt schmaler als 880 px, wechselt der Editor auf 2 Bilder untereinander.

## 4. Gruppensymbole

| Gruppe | Symbol | Papier heute |
|---|---|---|
| 1 | ● gefüllter Kreis | gefüllter Kreis |
| 2 | ○ leerer Kreis | leerer Kreis |
| 3 (Reserve) | ✕ Kreuz | „R“ für Reserve |
| 4, 5 oder als Ersatz | ▲ Dreieck, ■ Quadrat, ◆ Raute, Buchstabe | – |

- Das **Kreuz** unterscheidet sich von beiden Kreisen in **Form und Füllung** (offene Striche statt Fläche oder Ring). Darum ist es die beste dritte Wahl. „R“ bleibt als Buchstaben-Option.
- **Größe:** Durchmesser ≈ 3 % der Bühnenbreite, nie unter 10 px am Bildschirm.
- **Strich:** Ring und Kreuz ≈ 24 % des Durchmessers, damit alle drei gleich schwer wirken.
- **Immer SVG**, nie Schriftzeichen, damit es auf jedem Gerät gleich aussieht.
- **Blickrichtung:** eine kleine Kerbe am Symbolrand in Blickrichtung (Tinte, Länge ≈ 35 % des Durchmessers). Bei „nach vorne“ zeigt sie nach unten, zum Publikum. Beim Buchstaben-Symbol sitzt sie außerhalb des Buchstabens.
- **Gruppenverbund:** In gemischten Formationen behält jede Position ihr Symbol (abwechselnd ●○●○ oder blockweise ●●●○○○).
- Aktionszeilen beginnen mit denselben Symbolen. Gruppen werden nie nur über ihren Namen genannt.

## 5. Bühne

- Fest **3:2**, **Publikum unten**. Rahmen 1,5 Einheiten, **Vorderkante 5 Einheiten**, damit die Richtung auch ohne Beschriftung klar ist. „PUBLIKUM“ steht nur in großen Ansichten darunter.
- **Kein Raster.** Hilfslinien (Bühnenmitte, Kanten anderer Formationen) erscheinen nur beim Ziehen.
- **Laufwege** sind eine Stufe leiser als Symbole (`--gm-path`), mit Pfeilspitze am Ziel. Einzelwege sind dünner.
- **Laufweg-Automatik** in drei Stufen (Konzept 6.6): Pfeil pro Verbund → Pfeil pro Gruppe, wenn sich der Verbund trennt → Einzelwege, wenn sich eine Gruppe am Platz umformiert.
- **Zuordnung:** Wer wohin läuft, wird auf kürzeste Wege optimiert. Dadurch kreuzen sich die Wege innerhalb einer Gruppe nicht. Ausnahme sind **Drehungen und Schwenks**: Dort bleibt jeder Tänzer auf seinem Platz in der Form und läuft auf einem Kreisbogen. Gezeigt wird ein Bogenpfeil um den Drehpunkt (Punkt, `--gm-path`) mit Winkelangabe (¼, ½, 180°).
- **Auswahl:** gestrichelter Rahmen in Signal-Blau mit Anfassern zum Skalieren und Drehen.
- **KI-Vorschlag:** das aktuelle Bild gedimmt (30 %), der Vorschlag in Signal-Blau mit gestrichelten Wegen.

## 6. Komponenten

| Komponente | Klasse | Kernregeln |
|---|---|---|
| Taste | `.gm-btn` + `--primary` `--secondary` `--ghost` `--signal` `--danger` | 48 px hoch, Text immer dabei. `--l` 64 px, `--stack` (Icon über Text) für Training, `--play` 88 px rund |
| Aktionsbaustein | `.gm-chip` | „Anzahl + Kürzel“. Die Anzahl steht fett in Mono mit Trennstrich (`.gm-chip__n`), weil Begriffe Zahlen enthalten können (**2** │ 1/4 Dreh). `--past` gedimmt, `--now` blau gefüllt mit Fortschritt (`--gm-progress`), Standard umrandet, `--free` gestrichelt (Freitext, noch nicht im Katalog der Rolle; beim zweiten Gebrauch automatisch Baustein), Pfeil-Icon = bewegend. Lange drücken bzw. Rechtsklick öffnet das Pflege-Menü |
| Vorschlagsliste | `.gm-suggest` | Erscheint ab dem ersten Buchstaben unter dem Eingabefeld einer Spur. Zeile: Kürzel (fett), langer Name, übliche Zeiten. Getippter Teil unterstrichen, aktive Zeile mit Signal-Kante. Letzte Zeile: als Freitext übernehmen |
| Pflege-Menü | `.gm-menu` | Am Baustein: Umbenennen (diese Rolle oder alle), langer Name, übliche Zeiten, bewegt sich, anheften, nicht mehr vorschlagen, zusammenführen. Zeilen 48 px, rechts der aktuelle Wert |
| Kurzmeldung | `.gm-toast` | Tinte auf Papier invertiert, eine Zeile + `Rückgängig`. Für automatisch Gelerntes („Neu bei Grenadiere: Salut“). Verschwindet nach 6 s, im Training nie |
| Auswahlliste | `.gm-check` | Für KI-Vorschläge zum Abhaken, z. B. Start-Katalog einer neuen Rolle. Zeile 48 px, Kästchen 22 px in Tinte |
| Bildkarte | `.gm-frame` | Kopf: Nummer + „16 Zeiten“ + Zählweise, wenn nicht Achter („· 4 + 12“) + Hinweis-Badge. Keine Titel. Bühne. Eine Zeile pro Spur, beginnend mit Symbolen und ggf. Teilname („● linke Reihe“, „Alle“), Anzahl Zeiten fett in Mono (`.gm-track__n`). Summe nur bei Abweichung. `.is-active` = Signal-Rahmen. Beginnt ein Lied, steht darüber eine schmale Liedmarke („Lied 4: Toi, toi, toi · 1:44“, `--gm-text-xs`) |
| Lied-Bereich | im Inspektor | Name, Zeitspanne, „140 von 152 Zeiten verplant · 12 frei“ mit Segmentbalken. Teile als Zeilen, die 16er als Stepper-Bausteine in Mono. „Vorschlag der Musik“ als Ghost-Taste |
| Zusatz | im `.gm-chip` | Begriff fett, Zusatz in normaler Stärke dahinter: **14 Marsch** zur Mitte |
| Wiederholung | `.gm-repeat` | Klammert Bausteine mit `‖:` und `:‖` in Tinte, dahinter „×2“ (und „gespiegelt“). Im Training steht darunter „1. / 2. Mal“ |
| Blatt | `.gm-sheet` | A4 quer, 2 × 2, skaliert über Container-Einheiten, druckt 1:1 (`@page A4 landscape`) |
| Zählzeit | `.gm-count` | Große Zahl = Zeit im aktuellen Zählabschnitt (Achter, durchgezählt oder aufgeteilt), daneben dessen Länge („/8“, „/16“, „/12“) und der Abschnitt. Segmente pro Zeit, gegliedert nach Zählabschnitten. `--preroll` für den Vorlauf |
| Stepper | `.gm-stepper` | Für Zeiten. Minus/Plus 48 px (`--l` 64 px). Zahl in Mono |
| Segment-Auswahl | `.gm-seg` | Zwei bis drei Optionen, aktive mit Tinten-Rahmen |
| Hinweis | `.gm-badge--warn` | Icon + Text + Fläche. Sagt, was fehlt: „6 von 8 Zeiten · 2 fehlen“ |
| Sync-Status | `.gm-status` | Immer sichtbar: Synchronisiert / Wird synchronisiert / Offline – auf dem Gerät gespeichert |
| Bearbeiten-Band | `.gm-modebar` + `.gm-editframe` | Magenta-Band „BEARBEITEN · BILD 10“ + „Fertig“, 5 px Rahmen um den Bildschirm |
| KI-Rückfrage | `.gm-ask` | Frage, 2–4 Optionen als Tasten, Freitext. Kopfzeile „RÜCKFRAGE 1 VON 2“ |
| Anmelde-Taste | – | „Mit Microsoft anmelden“ mit Microsoft-Logo, gestaltet nach den Microsoft-Markenvorgaben. Die **einzige Ausnahme** von der Token-Regel. Höhe ≥ 48 px, einzige Taste auf dem Anmeldebildschirm |

## 7. Layout und Größen

| Breite | Gerät | Ansicht |
|---|---|---|
| < 600 px | Handy hochkant | Übersicht, Training, Bearbeiten-Modus, Lesen (1 Bild) |
| 600–1023 px | Tablet hochkant | Editor mit 2 Bildern untereinander, Inspektor unten |
| ≥ 1024 px | Tablet quer, Laptop | **Seitenansicht 2 × 2** + Inspektor rechts (Standard) |
| ≥ 1440 px | Desktop | wie oben, längere Zeitleiste |

- **Abstände:** 4-px-Raster (`--gm-space-1` … `--gm-space-8` = 4 … 64 px).
- **Treffflächen:** 48 px überall, 64 px im Training, 88 px Play, ≥ 12 px Abstand zwischen Training-Tasten.
- **Training (Hochformat), von oben nach unten:** Kopf (Bild-Nr., Offline-Status) → Bühne in voller Breite → Zählzeit → Aktionszeilen → „Weiter: Bild 12“ → Vorlauf und Bearbeiten → Transport (vorheriges Bild, Play, nächstes Bild) im Daumenbereich.
- **Radien:** 4 px (Bausteine), 8 px (Tasten, Felder), 14 px (schwebende Flächen). Die Bühne ist eckig, wie auf Papier.

## 8. Bewegung

- 120 ms für Zustandswechsel, 200 ms für Panels, Kurve `cubic-bezier(0.2, 0, 0, 1)`. Kein Federn.
- **Bedeutungsträger:** Abspielkopf, Fortschritt im Baustein, Bewegungs-Vorschau der Laufwege.
- `prefers-reduced-motion`: keine Übergänge. Die Bewegungs-Vorschau springt zeitweise statt zu gleiten.

## 9. Sprache

Die App **duzt** und spricht wie ein Trainer. Tasten sagen, was passiert. Hinweise sagen, was fehlt und wie viel.

| Nicht so | Sondern so |
|---|---|
| Frame 12 (16 Counts) | Bild 12 · 16 Zeiten |
| Validierungsfehler: Summe ungültig | Grenadiere – 6 von 8 Zeiten belegt, 2 fehlen |
| Pre-Roll aktiv | Musik startet 8 Zeiten vor Bild 12 |
| Cache synchronisiert | Offline bereit: Bilder und Musik sind auf dem Handy |
| Sind Sie sicher? | Bild 14 löschen? Du kannst es rückgängig machen. |
| OK / Abbrechen | Übernehmen / Verwerfen |
| KI generiert Frame … | Vorschlag für Bild 13. Prüfen und übernehmen. |

## 10. Barrierefreiheit (Mindeststandard)

- WCAG 2.2 AA überall, AAA-Kontrast für Text im Training.
- Fokus immer sichtbar: 3 px Signal-Rahmen mit 3 px Abstand.
- Jede Bühne hat einen Textersatz (`aria-label`, z. B. „Bild 11“). Jedes Symbol-Icon hat den Gruppennamen.
- Zustände nie nur über Farbe: vorbei = gedimmt, jetzt = gefüllt, kommt = umrandet. Hinweise mit Icon und Text.
- Bedienung komplett per Tastatur am Desktop (`←` `→` Bild, `Leertaste` Play, `F` Fokus, `N` neues Bild, `Strg+Z` Rückgängig).
