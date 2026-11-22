# CLAUDE.md – Garde-Tanz

PWA zum Choreografieren von Gardetänzen (Karneval) für das Trainerteam eines Vereins.
Vor jeder Arbeit lesen: `docs/02-konzept.md` (fachliches Modell, MVP-Umfang) und `docs/03-design-system.md`.

## Fachsprache (verbindlich in UI und Code-Kommentaren)

Bild (`Frame`), Zeiten (`counts`, nur ganze), Achter (8 Zeiten), Gruppe (`Group`, Symbol ● ○ ✕),
Gruppenverbund (`Track.groupIds` mit mehreren Gruppen), Rolle (`Role`, z. B. Mariechen, Grenadiere)
mit Katalog (`RoleAction`, Schlüssel = Rolle + normalisierter Begriff), Formation, Aktion/Baustein (`ActionBlock`),
Laufweg, Raster (`beats[]`), Vorlauf (`preRoll`), Spur (`Track`, Auswahl von Tänzern: „Alle“, Verbund, Gruppe oder Teil),
Zusatz (`ActionBlock.detail`), Wiederholung (`RepeatBlock`), Blickrichtung (`facing`), Drehung/Schwenk (`PathStyle.turn`),
Lied/Teil (`Song`, `SongPart`), Zusammenfassung (`summary`, Zeiten eines Lieds in 16ern, z. B. 16/16/12; gezählt wird trotzdem bis 8). In der UI nie „Frame“, „Count“, „Pre-Roll“, „Track“.

## Fachregeln

- Ein Bild zeigt die **Startaufstellung**. Laufwege führen ins nächste Bild und liegen **innerhalb** der Zeiten des Bildes, während der Bausteine mit `moves: true`.
- Ein Bild hat **genau eine** Startaufstellung, keine Zwischenaufstellungen. „Hin und zurück“ = Bild teilen.
- Jeder Tänzer ist in genau einer Spur. Ein neues Bild übernimmt die Spuraufteilung des vorherigen, das erste Bild beginnt mit einer Spur pro Gruppe.
- Wer beim Formationswechsel auf welchen Platz läuft, bestimmt die App so, dass die Wege insgesamt am kürzesten sind (`assignShortest`). **Ausnahme Drehung/Schwenk** (`turn`): Dort behält jeder seinen Platz in der Form und läuft auf einem Kreisbogen, sonst würde z. B. bei „Stern halbe Drehung“ niemand laufen.
- Prüfregeln (Summe der Zeiten ≠ Bild, fehlende Lauf-Aktion …) sind **Hinweise, nie Sperren**.
- Tänzer sind **anonym** (`groupId:index`). Keine Personendaten speichern.
- Bühne fest 3:2, normierte Koordinaten 0..1, **y = 1 ist vorne (Publikum unten)**.
- Musik-Raster = Liste von Schlagzeitpunkten (Tempowechsel möglich), nicht ein globales BPM.
- Kataloge pflegen sich selbst: Freitext wird beim **zweiten Gebrauch in derselben Rolle** automatisch Baustein. Übliche Zeiten und „bewegt sich“ werden aus der Nutzung gelernt. Pflege nur in place am Baustein, nie als Pflicht-Schritt vorab.
- Rollen ordnet **jeder Tanz** seinen Gruppen selbst zu. Vorgabe (Seed): **● Grenadiere, ○ Mariechen, ✕ Reserve**.
- Gemeinsame Bausteine (`roleId: '*'`) gelten für alle Rollen. Start-Kataloge: `seed/start-katalog.json`.
- Gruppenverbünde: beliebige Gruppen-Kombinationen, auch über Bildbereiche. Neue Bilder übernehmen die Verbünde des vorherigen.
- Begriffe können Zahlen enthalten (`1/4 Dreh`): Die erste Zahl ist immer die Anzahl Zeiten, angezeigt fett in Mono.
- Zählweise pro Bild (`countSplit`): automatisch Achter, Bausteine > 8 Zeiten werden durchgezählt (Referenz `countSegments`). Steuert die Zählanzeige im Training.
- Keine Bildtitel, kein Einmarsch/Ausmarsch, keine Rechte pro Garde (alle Trainer dürfen alles).
- Anmeldung **nur mit Microsoft über den Vereins-Tenant** (Einzelmandant, Gäste mit privatem Konto über Entra B2B). Zugang = Mitglied einer M365-Gruppe, keine eigene Benutzerverwaltung. Die Sitzung muss offline erhalten bleiben.

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
**Noch nicht enthalten:** Drehung/Schwenk (`turn`) und Blickrichtung (`facing`), siehe Konzept 6.4, 6.6 und 14.
