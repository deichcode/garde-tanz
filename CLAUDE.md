# CLAUDE.md – Garde-Tanz

PWA zum Choreografieren von Gardetänzen (Karneval) für das Trainerteam eines Vereins.
Vor jeder Arbeit lesen: `docs/02-konzept.md` (fachliches Modell, MVP-Umfang) und `docs/03-design-system.md`.

## Fachsprache (verbindlich in UI und Code-Kommentaren)

Bild (`Frame`), Zeiten (`counts`, nur ganze), Achter (8 Zeiten), Gruppe (`Group`, Symbol ● ○ ✕),
Gruppenverbund (`Track.groupIds` mit mehreren Gruppen), Formation, Aktion/Baustein (`ActionBlock`),
Laufweg, Raster (`beats[]`), Vorlauf (`preRoll`). In der UI nie „Frame“, „Count“, „Pre-Roll“.

## Fachregeln

- Ein Bild zeigt die **Startaufstellung**. Laufwege führen ins nächste Bild und liegen **innerhalb** der Zeiten des Bildes, während der Bausteine mit `moves: true`.
- Prüfregeln (Summe der Zeiten ≠ Bild, fehlende Lauf-Aktion …) sind **Hinweise, nie Sperren**.
- Tänzer sind **anonym** (`groupId:index`). Keine Personendaten speichern.
- Bühne fest 3:2, normierte Koordinaten 0..1, **y = 1 ist vorne (Publikum unten)**.
- Musik-Raster = Liste von Schlagzeitpunkten (Tempowechsel möglich), nicht ein globales BPM.
- Anmeldung **nur mit Microsoft** (Office-365-/Arbeitskonten und private Microsoft-Konten). Zugang nur per Einladung. Die Sitzung muss offline erhalten bleiben.

## Design-Regeln

- Farben, Größen und Schrift **nur über Tokens** aus `design-system/tokens.css`. Keine literalen Farben.
- Gruppen unterscheiden sich über die **Symbolform**, nicht über Farbe. Symbole immer als SVG.
- Signal-Blau = aktiv/jetzt. Magenta (`--gm-edit`) **nur** im Bearbeiten-Modus. Primärtasten sind Tinte.
- Treffflächen ≥ 48 px, im Training ≥ 64 px. Training ist schreibgeschützt.
- Seitenansicht = Druckbild: A4 quer, 2 × 2, Aktionen unter der Bühne.
- UI-Sprache Deutsch, duzen, Tasten sagen, was passiert.

## Referenz-Code

`design-system/stage.js` enthält die Referenz für Formen → Einzelpositionen (`layoutFormation`),
die Zuordnung auf kürzeste Wege (`assignShortest`), die Laufweg-Automatik und die Prüfregeln (`warnings`).
Bei der App-Umsetzung gleiches Verhalten beibehalten oder die Abweichung im Konzept dokumentieren.
