# Spike M0.1: Schlagerkennung auf echter Vereinsmusik

**Stand:** 21.11.2026 · **Status:** Hörtest abgeschlossen. Offen ist nur noch der Test eines neuronalen Verfahrens.
**Risiko:** Konzept, Abschnitt 10, Nr. 1 („Schlagerkennung versagt bei Garde-Medleys mit Tempowechseln“). Erfolgskriterium: ≥ 90 % der Schläge korrekt, Korrektur < 5 Min. pro Musik.
**Musik:** 4 Tänze des Vereins. Die Musik liegt **nicht** im Repository.

## Kurz gesagt

- **Das Erfolgskriterium ist erreicht.** Ohne Korrektur liegen **rund 90 %** der Klicks auf den gezählten Schritten. Mit **höchstens 2 Korrekturen pro Tanz** stimmt das Raster überall. Dazu kommt in jedem Tanz „Bild 1 beginnt hier“.
- **Tempowechsel und Musikteile werden zuverlässig gefunden.**
- **Es gibt zwei Fehlerarten, beide mit einem Tipp korrigierbar:**
  - **Tempo-Ebene:** Viva Colonia im Gardetanz ist doppelt so schnell erkannt. Manchmal sind beide Ebenen richtig, je nach Tanz (Piccolos 2025 ab 1:37). Die Ebene ist also auch eine **choreografische Entscheidung**.
  - **Gegenschlag:** Piccolos 2025 von 0:19 bis 1:06 und von 1:22 bis 1:37. Für den Trainer klingt das „irgendwie falsch“, ohne dass er sagen kann, warum. Diese Stellen beginnen **nicht** an Tempowechseln.
- **Die „1“** stimmt nur in manchen Abschnitten. Der Trainer setzt den Zählbeginn selbst.
- **Den Gegenschlag mit einfachen Regeln automatisch zu korrigieren, funktioniert nicht zuverlässig.** Das ist getestet und verworfen. Ein neuronales Verfahren sollte das besser können.

## Gesamtergebnis

| Musik | Hörtest | Klicks auf gezählten Schritten, ohne Korrektur | Nötige Korrekturen |
|---|---|---|---|
| Gardetanz 2027 | 4 von 5 Abschnitten passen, Viva Colonia doppelt so schnell | 92 % | 1 × „halb so schnell“ |
| Piccolotanz 2027 | passt komplett | 100 % | keine |
| Piccolos 2026 (Rohschnitt) | passt komplett | 100 % | keine |
| Piccolos 2025 | passt, außer 0:19–1:06 und 1:22–1:37 (Gegenschlag) | ca. 70 % (geschätzt aus den Zeitbereichen) | 2 × „auf den Gegenschlag“ |
| **Gesamt** | | **ca. 90 %** | **3 Korrekturen in 4 Tänzen** |

Außerdem fiel im Hörtest auf: **Trainer orientieren sich an den Liedern im Medley** („im Übergang zu Viva Colonia“).

## Vorgehen

Zwei unabhängige Verfahren, ohne Modell-Download:

| Verfahren | Rolle im Spike |
|---|---|
| **Essentia** `RhythmExtractor2013` (multifeature) | Hauptverfahren: Schläge, Tempo, Konfidenz. Seine Klicks wurden angehört |
| **librosa** Beat-Tracking mit zeitlich veränderlichem Tempo | Gegenprobe |

Dazu der **Hörtest**: Der Trainer hat pro Musik eine Klick-Spur angehört (Musik leiser, Klick auf jedem erkannten Schlag) und je Abschnitt beurteilt, ob die Klicks auf den gezählten Schritten liegen. Seine Zeitangaben sind grob.

Ein neuronales Verfahren (*beat_this*, erkennt auch Taktanfänge) ließ sich hier nicht testen. Das Netzwerk dieser Umgebung sperrt den Modell-Download (`cloud.cp.jku.at`) und das PyTorch-Paketverzeichnis.

## Analyse vor dem Hörtest

![Tempoverlauf aller vier Musiken](grafiken/uebersicht.png)

*Oben: Schläge pro Minute über die Zeit (blau Essentia, violett librosa), gestrichelt die erkannten Tempowechsel. Unten: grün = beide Verfahren liegen auf demselben Raster, rot = nicht, gelb = Tempo-Ebene uneinig.*

| Musik | Dauer | Erkannte Abschnitte (Schläge/min) |
|---|---|---|
| Gardetanz 2027 | 2:57 | 108 (freies Intro) → 88 → 162 → 144 → 126 |
| Piccolotanz 2027 | 2:50 | 129 → 144 → 136 |
| Piccolos 2026 (Rohschnitt) | 3:35 | 136 → 129 → 136 |
| Piccolos 2025 | 3:14 | 132 → 129 → 132 → 167 → 140 → 132 |

Innerhalb der Abschnitte kommen die Schläge gleichmäßig wie ein Metronom (Schwankung 0–12 ms, das ist die Messauflösung).

**Die Gegenprobe mit librosa taugt nicht als Prüf-Hinweis.** librosa wechselt oft auf halbes oder doppeltes Tempo. Wo es Essentia widersprach, hatte laut Hörtest fast immer Essentia recht. Einzelwerte stehen in [`zusammenfassung.json`](zusammenfassung.json).

## Hörtest je Musik

### Gardetanz 2027

| Zeit laut Trainer (grob) | Erkannt | Urteil |
|---|---|---|
| 0:00–0:43 | 108 (Intro) und 88 | ✔ passt gut |
| 0:43–1:05, Übergang zu **Viva Colonia** | 162 | ⏩ doppelt so schnell wie gezählt, richtig wären ~81 |
| 1:05–1:44 | 144 | ✔ passt |
| 1:44–Ende | 126 | ✔ passt |

Die erkannten Grenzen (0:40, 1:05, 1:44) decken sich mit den gehörten Musikteilen. Im Viva-Colonia-Abschnitt liegt jeder zweite Klick auf einem gezählten Schritt, es fehlt keiner.

### Piccolotanz 2027

Passt komplett, in allen drei Abschnitten.

### Piccolos 2026 (Rohschnitt)

Passt komplett, von Anfang an. Ab 2:20 hatte librosa widersprochen, recht hatte Essentia.

### Piccolos 2025

| Zeit laut Trainer (grob) | Urteil |
|---|---|
| 0:00–0:19 | ✔ passt, sogar die „1“ |
| 0:19–1:06 | ✘ „passt irgendwie nicht, kann aber nicht sagen warum“ |
| 1:06–1:22 | ✔ passt |
| 1:22–1:37 (Ende des Lieds) | ✘ passt nicht |
| 1:37–2:25 | ✔ passt, einschließlich der „1“. Je nach Tanz könnte man auch halb so schnell zählen |
| 2:25–Ende (letztes Lied) | ✔ passt, einschließlich der „1“ |

**Diagnose der beiden „passt nicht“-Stellen:** Für jedes 6-Sekunden-Fenster wurde gemessen, ob die Einsätze (Onsets) auf den Klicks stärker sind als auf den Mittelpunkten dazwischen. Außerdem, um welchen Bruchteil eines Schlags man das Raster verschieben müsste, damit es am besten passt (Skript [`diagnose_gegenschlag.py`](diagnose_gegenschlag.py)):

| Zeit | Urteil Trainer | Einsätze Klick : Mitte | Beste Verschiebung |
|---|---|---|---|
| 0:00–0:18 | passt | 2,4–2,5 : 1 | 0 |
| 0:18–1:06 | passt nicht | meist 0,8 : 1 | **½ Schlag** |
| 1:06–1:18 | passt | 1,6–2,1 : 1 | 0 |
| 1:18–1:36 | passt nicht | 0,6–0,8 : 1 | **½ Schlag** |
| 1:36–2:24 | passt | 1,4–2,5 : 1 | 0 |
| 2:24–Ende | passt | 1,0–2,8 : 1 | meist 0 |

Ergebnis: In beiden Stellen liegt das Raster **auf dem Gegenschlag**, genau einen halben Schlag daneben. Das erklärt das „passt irgendwie nicht“: Die Klicks kommen gleichmäßig, aber zwischen den Schritten.

## Versuch: Gegenschlag automatisch korrigieren (verworfen)

Regel (Skript [`gegenschlag.py`](gegenschlag.py)): Sind die Einsätze über etwa 8 Sekunden auf den Mittelpunkten stärker als auf den Klicks, verschiebt die Korrektur das Raster dort um einen halben Schlag.

| Variante | Piccolos 2025 (soll: 0:19–1:06 und 1:22–1:37) | Fehlkorrekturen in Musiken, die passen |
|---|---|---|
| Einsätze + Bass | 0:19–1:04 ✔, 1:19–1:49 zu lang, dazu 3 kurze falsche Stellen | Gardetanz 0:00–0:32, Piccolotanz 1:44–2:09 |
| nur Einsätze | nur Teile gefunden (0:21–0:29, 0:37–0:40, 1:22–1:33) | Gardetanz 24 %, Piccolos 2026 30 % der Schläge |

**Bewertung:** Eine einfache Regel erkennt den Gegenschlag nicht zuverlässig. Der Bass führt in die Irre, weil er bei „Umpa“-Begleitung oft zwischen den Schlägen liegt. Ohne Bass fehlt das Signal. Weiteres Feintuning an nur vier Musiken würde die Regel bloß an diese anpassen. Deshalb kommt im MVP **keine automatische Gegenschlag-Korrektur**, sondern eine manuelle mit einem Tipp (siehe unten).

## Prüfregel „Schritttempo 75–150 pro Minute“

Gezählt werden bei euch Schritte zwischen etwa 75 und 150 pro Minute (gehört: 81, 88, 108, 126, 129–144). Liegt ein Abschnitt darüber, bietet die App „halb so schnell zählen?“ an, liegt er darunter, „doppelt so schnell zählen?“.

| Musik | Vorschlag nach der Regel | Hörtest |
|---|---|---|
| Gardetanz 2027 | Viva Colonia (162): halb so schnell | ✔ nötig |
| Piccolotanz 2027 | keiner | ✔ richtig |
| Piccolos 2026 | keiner | ✔ richtig |
| Piccolos 2025 | 1:37–2:21 (167): halb so schnell | ◐ möglich, hängt vom Tanz ab |

Die Regel hat **keinen nötigen Fall übersehen** und keinen falschen Vorschlag gemacht. Weil die Tempo-Ebene auch eine Frage der Choreografie ist, zeigt die App das als **Vorschlag**, nicht als Fehler. Die alten Prüf-Hinweise aus der librosa-Gegenprobe markierten 9 Abschnitte, von denen 1 nötig war. Sie werden ersetzt.

## Folgen für das Produkt (ins Konzept übernommen, 6.7)

1. **Die Automatik ist der Start**, Korrigieren gehört fest zum Ablauf. In den vier Tänzen waren es 0 bis 2 Korrekturen pro Tanz.
2. **Doppelt / halb so schnell** pro Tempo-Abschnitt, mit einem Tipp. Über 150 bzw. unter 75 Schläge pro Minute macht die App diesen Vorschlag selbst.
3. **Auf den Gegenschlag** für einen **frei markierten Bereich**, nicht nur für einen ganzen Tempo-Abschnitt, weil diese Stellen nicht an Tempowechseln beginnen.
4. **Den Fehler benennen:** Beim Kontroll-Klick bietet der Raster-Editor die Frage an: „Klingt es hier irgendwie falsch? Dann liegt das Raster meist auf dem Gegenschlag.“ Der Trainer erkennt den Fehler, kann ihn aber nicht benennen (Piccolos 2025).
5. **Kein Verlass auf die automatische „1“.** Der Trainer setzt „Bild 1 beginnt hier“, die App zählt von dort.
6. **Freie Abschnitte** (Intro ohne festen Takt) bekommen kein Raster.
7. **Server-Analyse:** Essentia als Grundlage (Lizenz AGPL-3.0 prüfen). Ein neuronales Verfahren (*beat_this*, MIT) sollte vor der Entscheidung getestet werden, weil es Gegenschlag und „1“ besser erkennen könnte. Dazu müssen in der Entwicklungsumgebung zwei Hosts freigeschaltet werden.
8. **Idee:** Musikteile (Lieder im Medley) in der Zeitleiste benennen, z. B. „Viva Colonia“. Noch nicht entschieden.

## Hörtest: Vorgehen (für neue Musik)

Für jede Musik gibt es eine **Klick-Spur**: die Musik leiser, darüber Klicks auf jedem erkannten Schlag. Die Dateien liegen nicht im Repository.

| Musik | Abschnitt (Zeit) | Klicks liegen … |
|---|---|---|
| … | z. B. 1:35–2:21 | ✔ auf den Schritten · ⏩ doppelt so schnell · ⏪ halb so schnell · ↔ dazwischen / „irgendwie falsch“ (Gegenschlag) |

## Reproduzieren

```bash
python3 -m venv venv && . venv/bin/activate
pip install librosa soundfile matplotlib essentia
python analyse.py <ausgabeordner> "Name=pfad/zur/musik.mp3" …     # Grafik, Kennzahlen, Klick-Spur
python diagnose_gegenschlag.py pfad/zur/musik.mp3                 # Einsätze Klick : Mitte je 6 s
python gegenschlag.py <ausgabeordner> "Name=pfad/zur/musik.mp3" … # verworfener Korrekturversuch
```
