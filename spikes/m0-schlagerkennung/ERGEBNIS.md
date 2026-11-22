# Spike M0.1: Schlagerkennung auf echter Vereinsmusik

**Stand:** 22.11.2026 · **Status:** abgeschlossen. Hörtest mit allen vier Musiken, dazu ein KI-Verfahren getestet und seine „1“ im Piccolotanz direkt per Hörtest bestätigt.
**Risiko:** Konzept, Abschnitt 10, Nr. 1 („Schlagerkennung versagt bei Garde-Medleys mit Tempowechseln“). Erfolgskriterium: ≥ 90 % der Schläge korrekt, Korrektur < 5 Min. pro Musik.
**Musik:** 4 Tänze des Vereins. Die Musik liegt **nicht** im Repository.

## Kurz gesagt

- **Das Erfolgskriterium ist erreicht.** Ohne Korrektur liegen **rund 90 %** der Klicks auf den gezählten Schritten. Mit **höchstens 2 Korrekturen pro Tanz** stimmt das Raster überall. Dazu kommt in jedem Tanz „Bild 1 beginnt hier“.
- **Tempowechsel und Musikteile werden zuverlässig gefunden.**
- **Es gibt zwei Fehlerarten, beide mit einem Tipp korrigierbar:**
  - **Tempo-Ebene:** Viva Colonia im Gardetanz ist doppelt so schnell erkannt. Manchmal sind beide Ebenen richtig, je nach Tanz (Piccolos 2025 ab 1:37). Die Ebene ist also auch eine **choreografische Entscheidung**.
  - **Gegenschlag:** Piccolos 2025 von 0:19 bis 1:06 und von 1:22 bis 1:37. Für den Trainer klingt das „irgendwie falsch“, ohne dass er sagen kann, warum. Diese Stellen beginnen **nicht** an Tempowechseln.
- **Die „1“** stimmt nur in manchen Abschnitten. Der Trainer setzt den Zählbeginn selbst.
- **Den Gegenschlag mit einfachen Regeln automatisch zu korrigieren, funktioniert nicht zuverlässig.** Das ist getestet und verworfen.
- **Das KI-Verfahren (beat_this)** erkennt die **„1“ zu 82–97 %** und trifft den Gegenschlag in Piccolos 2025 zu 93 %. Dafür liegt es an anderen Stellen daneben, wo Essentia passt. Bei Viva Colonia zählen beide doppelt.
- **Empfehlung: beide Verfahren kombinieren.** Das Raster kommt von Essentia, die „1“ von der KI. Wo sich beide um einen halben Schlag uneinig sind, bietet die App beide Varianten zum Anhören an. In den vier Tänzen hätte das beide echten Fehler gefunden, bei 3 bis 4 zusätzlichen kurzen Prüfstellen.

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

Danach wurde das neuronale Verfahren *beat_this* (CPJKU, Modell `final0`, CPU, ohne DBN-Nachbearbeitung) direkt am Hörtest gemessen. Dafür wurden in der Entwicklungsumgebung drei Hosts freigeschaltet: `cloud.cp.jku.at`, `download.pytorch.org` und `download-r2.pytorch.org`.

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

Die Regel hat **keinen nötigen Fall übersehen** und keinen falschen Vorschlag gemacht. Weil die Tempo-Ebene auch eine Frage der Choreografie ist, zeigt die App das als **Vorschlag**, nicht als Fehler. Die alten Prüf-Hinweise aus der librosa-Gegenprobe markierten 10 Abschnitte, davon war 1 nötig und 1 optional. Sie werden ersetzt.

## KI-Verfahren (beat_this) gegen den Hörtest

Die Wahrheit kommt aus dem Hörtest (Skript [`ki_verfahren.py`](ki_verfahren.py), Werte in [`ki_verfahren.json`](ki_verfahren.json)):
- **Schläge:** In den Abschnitten, die laut Trainer passen, sind es die Essentia-Klicks. An den Gegenschlag-Stellen liegen sie einen halben Schlag daneben. Viva Colonia ist ausgenommen, dort zählen beide Verfahren doppelt (Essentia 157, KI 158, richtig ~81).
- **„1“:** Aus der Angabe, auf welcher Zählzeit die hohen Klicks lagen (z. B. „auf 3 und 7“ heißt: die echte 1 liegt 2 Schläge daneben).

| Musik | Schläge richtig: KI | Schläge richtig: Essentia | „1“ richtig: KI | „1“ richtig: Essentia |
|---|---|---|---|---|
| Gardetanz 2027 | 84 % | 100 %* | **82 %** | 0 % (auf 3/7, 4/8) |
| Piccolotanz 2027 | 87 % | 100 %* | **95 %**† | nur im 1. Teil |
| Piccolos 2026 | 97 % | 100 %* | **97 %** | 0 % (auf 3/7) |
| Piccolos 2025 | **93 %** | 70 % | **96 %** | in 3 von 6 Teilen |

\* Essentia hat hier 100 %, weil der Trainer diese Klicks als passend gehört hat. Die Wahrheit ist also an Essentia ausgerichtet. Abweichungen der KI können deshalb auch mehrdeutige Stellen sein.

† **Direkt per Hörtest bestätigt (22.11.2026):** Der Trainer hat die KI-Klick-Spur angehört. Die erkannten „1“ liegen in allen drei Liedern dort, wo er sie zählt: 30/30, 27/29 und 34/37, zusammen 95 %. Aus dem Essentia-Hörtest abgeleitet waren es nur 84 %, weil dessen grobe Angabe („ab dem 2. Teil“) das dritte Lied nicht unterschied.

**Fehler in der ersten KI-Klick-Spur (behoben):** Die hohen Klicks lagen im festen 4er-Abstand ab der ersten erkannten „1“. Die KI erkennt die „1“ aber nach jedem Tempowechsel neu. Deshalb klang die Spur ab dem zweiten Lied falsch („auf 2 und 6“, „auf 4 und 8“), obwohl die KI richtig lag. Jetzt sitzt der hohe Klick genau auf jeder erkannten „1“. Das zeigt auch, worauf es im Produkt ankommt: Die „1“ wird **pro Musikteil** neu bestimmt, nicht einmal für den ganzen Tanz.

**An den Gegenschlag-Stellen in Piccolos 2025** liegt die KI zu **93 %** richtig, Essentia zu 0 %.

**Wo die KI danebenliegt** (je 10 s unter 80 % Treffer, Skript [`ki_abweichungen.py`](ki_abweichungen.py)):

| Musik | Stelle | Art |
|---|---|---|
| Gardetanz 2027 | 0:00–0:20 | freies Intro, KI zählt anders |
| Gardetanz 2027 | 0:30–0:40 | KI doppelt so schnell |
| Piccolotanz 2027 | 1:40–2:10 | KI einen halben Schlag neben Essentia. Der Trainer hat **beide** Klick-Spuren hier als zählbar gehört, sonst hätte er die KI-„1“ nicht Zählzeiten zuordnen können. Die Stelle ist also **mehrdeutig**, ein typischer Fall für „A · B anhören“ |
| Piccolos 2026 | 2:20–2:30, 3:30–3:40 | teilweise daneben (Übergang, Schluss) |
| Piccolos 2025 | 3:10–Ende | Schluss, keine Schläge |

**Bewertung:** Beim Raster sind beide etwa gleich gut, aber an verschiedenen Stellen. Bei der „1“ ist die KI klar besser. Bei der Tempo-Ebene hilft keins von beiden (Viva Colonia), dafür bleibt die 75–150-Regel.

## Empfehlung: zwei Verfahren kombinieren

| Aufgabe | Quelle |
|---|---|
| Raster (Schläge, Tempo-Abschnitte) | **Essentia**: gleichmäßig wie ein Metronom, im Hörtest meist richtig |
| „1“ (Taktanfang) | **KI**. Die App schlägt „Bild 1 beginnt hier“ auf einer erkannten 1 vor, der Trainer bestätigt |
| Gegenschlag finden | **Zweitmeinung**: Liegt die KI über mindestens 8 s einen halben Schlag neben Essentia, zeigt die App „Zwei Möglichkeiten: A · B anhören“. Ein Tipp übernimmt die bessere |
| Tempo-Ebene | **Regel 75–150 Schritte/min** als Vorschlag |

In den vier Tänzen hätte die Zweitmeinung **beide echten Fehler** gefunden (Piccolos 2025). Dazu kämen 3 bis 4 kurze Prüfstellen, an denen Essentia schon richtig lag. Das ist je ein kurzes A/B-Hören. Kein Fehler bliebe unbemerkt, und der Trainer muss nicht mehr selbst spüren, dass etwas „irgendwie nicht passt“.

**Aufwand auf dem Server:** beide Verfahren laufen auf CPU in wenigen Sekunden pro Musik. PyTorch macht den Analyse-Dienst größer (Container statt kleiner Funktion). **Lizenzen prüfen:** Essentia AGPL-3.0, beat_this-Code MIT, Modellgewichte separat prüfen.

## Folgen für das Produkt (ins Konzept übernommen, 6.7)

1. **Die Automatik ist der Start**, Korrigieren gehört fest zum Ablauf. In den vier Tänzen waren es 0 bis 2 Korrekturen pro Tanz.
2. **Doppelt / halb so schnell** pro Tempo-Abschnitt, mit einem Tipp. Über 150 bzw. unter 75 Schläge pro Minute macht die App diesen Vorschlag selbst.
3. **Auf den Gegenschlag** für einen **frei markierten Bereich**, nicht nur für einen ganzen Tempo-Abschnitt, weil diese Stellen nicht an Tempowechseln beginnen.
4. **Zweitmeinung statt Bauchgefühl:** Wo Essentia und KI sich um einen halben Schlag uneinig sind, zeigt die App „Zwei Möglichkeiten: A · B anhören“. Zusätzlich fragt der Raster-Editor beim Kontroll-Klick: „Klingt es hier irgendwie falsch? Dann liegt das Raster meist auf dem Gegenschlag.“
5. **Die „1“ kommt von der KI** (82–97 % richtig). Die App schlägt „Bild 1 beginnt hier“ auf einer erkannten 1 vor, der Trainer bestätigt oder verschiebt.
6. **Freie Abschnitte** (Intro ohne festen Takt) bekommen kein Raster.
7. **Server-Analyse mit zwei Verfahren:** Essentia für das Raster, beat_this für „1“ und Zweitmeinung (siehe Empfehlung). Lizenzen prüfen.
8. **Entschieden (Interview Runde 10):** Lieder und Teile des Medleys werden benannt und mit ihrer 16er-Zusammenfassung geführt (Konzept 6.7, 6.12).

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
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu && pip install beat_this einops rotary-embedding-torch soxr
python ki_verfahren.py <ausgabeordner> "Name=pfad/zur/musik.mp3" … # KI gegen Hörtest, KI-Klick-Spur
python ki_abweichungen.py "Name=pfad/zur/musik.mp3" …              # wo die KI abweicht
```
