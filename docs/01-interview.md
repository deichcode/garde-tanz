# Interview-Protokoll

**Datum:** 19.11.2026
**Format:** Experten-Interview in 8 Runden. Die Fragen hatten Antwortvorschläge, frei formulierte Antworten sind wörtlich übernommen.
**Ziel:** Verstehen, wie das Tool im Alltag eines Trainerteams genutzt wird, bevor Konzept und Design-System festgelegt werden.

Jede Antwort hat eine Spalte **Konsequenz**. Sie zeigt, was die Antwort für das Produkt bedeutet. Die Konsequenzen sind im [Produktkonzept](02-konzept.md) ausgearbeitet.

---

## Runde 1: Nutzung & Rahmen

| Frage | Antwort | Konsequenz |
|---|---|---|
| Wer arbeitet im MVP an einem Tanz? | **Trainerteam gemeinsam:** 2–3 Trainer schreiben und ändern denselben Tanz, auch abwechselnd. | Konten, Team-Sync, konfliktarme Speicherung (ein Dokument pro Bild), „zuletzt geändert von“. |
| Wie kommt ein am Desktop geschriebener Tanz aufs Handy? | **Automatisch per Konto:** Login auf allen Geräten, offline nutzbar, Abgleich sobald Netz da ist. | Local-first-Architektur mit Cloud-Sync. Ob ein Tanz offline bereitsteht, ist sichtbarer Status. |
| Welche Tanzarten im MVP? | **Garde-/Marschtanz** | Schautanz, Solo und Paartanz kommen nicht ins MVP. Das Modell „Gruppen + Bilder“ reicht aus. |
| Für wen bauen wir das Produkt? | **Nur unser Verein** | Ein Vereins-Arbeitsbereich, keine Mandanten, kein Abo-Modell. Neue Trainer kommen per Einladung dazu. |

## Runde 2: Das Bild & die Darstellung

| Frage | Antwort | Konsequenz |
|---|---|---|
| Wie werden Positionen eingezeichnet? | **Form → Einzelpositionen:** Gruppe als Form setzen (z. B. Linie), die App verteilt die Tänzer darauf, einzeln nachjustierbar. | Werkzeuge für Formen (Linie, Block, Kreis, Bogen, Keil, frei). Jede Einzelposition lässt sich überschreiben. |
| Wie viele Tänzer hat eine Formation? | *„Ca. 4–10 pro Gruppe“* | Bei 2–3 Gruppen stehen 8–30 Symbole in einem Bild. Symbolgröße und Touch-Bedienung sind darauf ausgelegt. |
| Wie unterscheidet ihr Gruppen auf dem Papier? | *„Konkret ausgefüllter Kreis, leerer Kreis und R. R durch Symbol zu ersetzen wäre aber okay.“* | Gruppen werden über die **Form des Symbols** unterschieden, nicht über Farbe. Standard: ● ○ ✕ |
| Aus welcher Perspektive wird gezeichnet? | **Publikum/Jury unten** | Die Bühnenvorderkante liegt immer unten. Keine Umschaltung im MVP. |

## Runde 3: Bühne & Gruppen

| Frage | Antwort | Konsequenz |
|---|---|---|
| Wofür steht das „R“? | **Dritte Gruppe, nur Kürzel** | Die dritte Gruppe bekommt ein Symbol (Standard ✕). „R“ bleibt als Buchstaben-Option wählbar. |
| Welche Bühnen-Referenzen braucht ein Bild? | **Freie Fläche reicht** | Keine Maße und kein Raster. Ausrichtungshilfen erscheinen nur kurz beim Ziehen. |
| Bleiben Tänzer in derselben Gruppe? | *„Meistens fix, allerdings gibt es die Möglichkeit, dass zwei Gruppen sich wie eine verhalten, aber trotzdem unterschiedlich gekennzeichnet werden. Also eine Linie/Block aus zwei Gruppen, es muss aber ersichtlich sein, wer in der Linie welche Gruppe ist.“* | Eine Formation kann Mitglieder **mehrerer Gruppen** enthalten (abwechselnd oder blockweise). Aktionen können für einen **Gruppenverbund** gelten (● + ○). Die Symbole bleiben trotzdem einzeln sichtbar. |
| Sollen Tänzer namentlich erfasst werden? | **Keine Personen** | Tänzer sind anonym, es gibt keine personenbezogenen Daten von (oft minderjährigen) Tänzern. Intern bekommt jede Position nur einen Index, damit die Laufwege berechnet werden können. |

## Runde 4: Laufwege & Aktionen

| Frage | Antwort | Konsequenz |
|---|---|---|
| Wann passiert ein Laufweg? | **Innerhalb der Zeiten** des Bildes (z. B. 8 Kicks am Platz, dann 8 Zeiten marschieren ins nächste Bild). | Ein Bild zeigt die Startaufstellung. Aktionen, die als „bewegend“ markiert sind, führen ins nächste Bild. |
| Wie werden Laufwege gezeichnet? | **Je nach Bild:** meist ein Pfeil pro Gruppe, bei Kreuzungen/Wechseln einzeln. | Eine Automatik zeigt einen Pfeil pro Gruppe. Trennt sich ein Gruppenverbund, bekommt jede Gruppe einen eigenen Pfeil. Formiert sich eine Gruppe am Platz um, zeigt die App Einzelwege. Pro Formation lässt sich die Darstellung manuell festlegen. |
| Wie werden Aktionen erfasst? | **Bausteine + Freitext:** häufige Aktionen als Tasten mit Standard-Zeiten, Freitext ergänzbar. | Ein Vereinskatalog mit Bausteinen und Kürzeln (z. B. „M“). Freitext wird beim Tippen in Bausteine zerlegt. |
| Werden halbe Zeiten gebraucht? | **Nein, nur ganze Zeiten** | Die kleinste Einheit ist ein Schlag. |

## Runde 5: Musik & Zählzeiten

| Frage | Antwort | Konsequenz |
|---|---|---|
| Wie ist die Musik aufgebaut? | **Mix mit Tempowechseln** | Das Schlag-Raster ist eine Liste einzelner Schlagzeitpunkte, kein globales BPM-Raster. Tempowechsel werden als Abschnitte bearbeitet. |
| Wie werden Zeiten mit der Musik verbunden? | **Automatisch + korrigieren** | Automatische Schlag- und Takterkennung beim Hochladen. Danach Korrektur per Mittippen, Verschieben und Tempo-Abschnitten. |
| Was braucht ihr beim Abspielen im Training? | **Vorlauf vor dem Startbild** | Im MVP gibt es nur den Vorlauf. Langsamer abspielen, Schleife und Metronom kommen später. |
| Wie kommt die Musik in die App? | **Datei hochladen, überall da** | Musik liegt im Cloud-Speicher und wird für das Training auf den Geräten offline zwischengespeichert. |

## Runde 6: Training am Handy

| Frage | Antwort | Konsequenz |
|---|---|---|
| Wie wird das Handy im Training genutzt? | **In der Hand, liegt am Rand, an Box/Anlage.** Zusatz: *„Ob das Handy/Tablet das Papier ersetzt, wird sich noch zeigen. Ausdrucken, Notizen auf Papier machen und später wieder einscannen könnte hilfreich sein.“* | Große Bedienelemente, aus der Entfernung lesbar, Bildschirm bleibt an, Ausgleich der Bluetooth-Latenz. **Papier ist gleichwertig:** Der Druck ist Teil des MVP, Seitennummern in App und Ausdruck sind identisch. |
| Was ist im Trainingsmodus das Wichtigste? | *„Aktuelles Bild und Aktionen der Gruppen.“* | Bühne und Aktionszeilen bekommen den meisten Platz, die Zählzeit steht direkt dazwischen. |
| Welche Änderungen am Handy? | Aktion/Text, Zeiten, Position verschieben, Notiz. *„Sollte in getrenntem Edit-Mode passieren.“* | Training ist immer schreibgeschützt. Ein eigener **Bearbeiten-Modus** wird bewusst betreten und verlassen und ist eindeutig gekennzeichnet. |
| In welcher Ausrichtung? | **Hochformat** | Trainings-Layout im Hochformat für Einhandbedienung, die Steuerung liegt im Daumenbereich. |

## Runde 7: KI, Papier-Workflow & Umfang

| Frage | Antwort | Konsequenz |
|---|---|---|
| Was soll die KI erzeugen? | Positionen/Formation, Laufwege, Aktionen mit Zeiten. *„Nachfragen wenn unklar. Ähnlich Interview Mode in Claude iOS.“* | Die KI liefert **entweder** Rückfragen mit Antwortoptionen **oder** einen vollständigen Bild-Vorschlag. Der Vorschlag erscheint als Vorschau und wird nie automatisch übernommen. |
| Ausdrucken → notieren → einscannen: was ins MVP? | **Nur Drucken** | Der Scan mit KI-Auswertung kommt nach dem MVP. |
| Was passiert, wenn Aktionen nicht aufgehen (6 von 8)? | **Hinweis, Speichern ok** | Ein deutlicher Hinweis an Gruppe und Bild sowie eine Liste offener Hinweise. Entwürfe dürfen unvollständig sein. |
| Wie viele Bilder hat ein Tanz? | **30–50** | Das sind 8–13 Druckseiten. Navigation über Seiten, eine Bildübersicht und die Zeitleiste. |

## Runde 8: Papierformat (Nachfrage)

| Frage | Antwort | Konsequenz |
|---|---|---|
| Wie sind die 4 Bilder angeordnet? | **2 × 2 im Querformat**, Text jeweils unter dem Bild. | Die Seitenansicht ist auf großen Bildschirmen der Standard: A4 quer, 2 × 2, Aktionen unter der Bühne. Druck und Bildschirm sehen gleich aus. |
| Wie werden Zeiten notiert? | **Anzahl:** „2 drehen, 6 M“ | Bausteine werden als „Anzahl + Kürzel“ dargestellt, z. B. `2 Dreh · 6 M`. |
| Was steht im Kopf eines Bildes? | **Bildnummer, Anzahl Zeiten** | Kopf: große Bildnummer und „16 Zeiten“. Ein Titel ist optional und nicht Teil des Standards. |
| Seitenverhältnis der Bühne? | **Breiter als tief, ca. 3:2** | Die Bühne ist fest 3:2. |

## Nachtrag (19.11.2026)

| Vorgabe | Konsequenz |
|---|---|
| *„Anmeldung soll per Office 365 Account möglich sein. Bzw. Microsoft Account.“* | „Mit Microsoft anmelden“ ist die einzige Anmeldeart im MVP. Sie funktioniert für Office-365-/Arbeitskonten und für private Microsoft-Konten. Zugang gibt es nur per Einladung. Nach der ersten Anmeldung bleibt die Sitzung offline erhalten. Details im Konzept unter 6.1, 9 und Risiko 6. |
| *„Ja, wir haben ein eigenes MS 365.“* | Die App wird im **Vereins-Tenant** registriert. Trainer melden sich mit dem Vereinskonto an, Externe als Gast mit privatem Microsoft-Konto. **Zugang = Mitglied einer M365-Gruppe** statt Einladungslinks, gepflegt dort, wo der Verein seine Konten verwaltet. Konzept 6.1, 9. |
| *„Aktionen hängen von Gruppe ab (bspw. Grenadiere haben Gewehre und machen mit diesen Aktionen (Schwenken, Klopfen, Präsentieren etc.). Mariechen marschieren oder hüpfen bei Bewegung, schmeißen Beine etc. Das sind nur Beispiele, die pro Tanzgruppe anpassbar sein sollen. Pflege sollte nicht aufwändig sein und entweder automatisiert oder in place erfolgen.“* | Jede Gruppe bekommt eine **Rolle** (Mariechen, Grenadiere …) mit eigenem **Baustein-Katalog**. Der Katalog **lernt beim Schreiben**: Beim zweiten Gebrauch wird ein Begriff zum Baustein, übliche Zeiten und Fortbewegung ergeben sich aus der Nutzung. Gepflegt wird **direkt am Baustein** (Umbenennen, Zusammenführen, Ausblenden). Neue Rollen bekommen einen KI-Start-Katalog. Konzept 6.5. |
| *Gibt es schon eine M365-Gruppe mit allen Trainern? – „Nein.“* | Für die App wird eine neue Gruppe „Garde-Tanz“ angelegt. Mitglieder sind die Trainer, Besitzer sind die Admins. Eine zweite Admin-Gruppe ist nicht nötig. Konzept 6.1. |
| *Weitere Rollen? – „Dritte Gruppe heißt ‚Reserve‘ (tanzt aber mit).“* | Das „R“ auf dem Papier steht für **Reserve**. Die Reserve ist eine vollwertige Gruppe in jedem Bild, keine Ersatzbank. Ob sie eigene Aktionen hat oder den Katalog einer anderen Rolle teilt, entscheidet die Rolle der Gruppe. Das Symbol bleibt ✕, „R“ ist wählbar. |
| *Start-Kataloge:* Alle: Marsch, Marsch auf der Stelle (Kürzel *MrschSt*), 1/4 Dreh, 1/2 Dreh, Stip (Stippeföttche). Mariechen: Hüpf, Schmeiß (Beine schmeißen). Grenadiere: GewSchw, Präs, Fuß (Gewehr zum Fuß), Klopf. Reserve: BeinSchw (Beine schwenken). | Neue Ebene **gemeinsame Bausteine** für alle Rollen. Die Listen sind die Start-Kataloge (Konzept 6.5, `seed/start-katalog.json`). Weil Begriffe Zahlen enthalten können (1/4 Dreh), steht die **Anzahl Zeiten immer fett in Mono-Schrift**. Die erste Zahl beim Tippen ist immer die Anzahl Zeiten. |
| *„Reserve ist eigenständige Gruppe.“* | Die Reserve bekommt eine **eigene Rolle** mit eigenem Katalog, sie nutzt nicht die Liste der Mariechen mit. Zuordnung: ● Mariechen, ○ Grenadiere, ✕ Reserve. |
| *„Mehrere Gruppen sollten beliebig zu einer Gruppe zusammengenommen werden können, auch für Teile des Tanzes.“* | **Gruppenverbund** aus beliebigen Gruppen, festgelegt für *nur dieses Bild*, *bis Bild …* oder *bis auf Weiteres*. Neue Bilder übernehmen den Verbund. Trennen ist ab einem Bild möglich, die Zeitleiste zeigt die Abschnitte. Konzept 6.5. |
| *Kürzel für „Marsch auf der Stelle“? – „MrschSt“* | Im gemeinsamen Katalog als `MrschSt` (bewegt sich nicht). |
| *„Microsoft 365 Gruppe ist erstellt.“* | Einrichtungsschritt „Gruppe anlegen“ erledigt. Offen bis M1: App-Registrierung, Mitglieder und Besitzer, Gäste, Admin-Zustimmung. Konzept 6.1. |

---

## Eigene Annahmen (nicht abgefragt, bitte prüfen)

Diese Punkte habe ich festgelegt, damit das Konzept vollständig ist. Jeder lässt sich leicht ändern.

1. **Sprache und Ansprache:** Die Oberfläche ist auf Deutsch und duzt. Sie nutzt das Vokabular der Trainer: *Bild, Zeiten, Achter, Gruppe, Laufweg, Aktion*. Begriffe wie *Frame* oder *Count* tauchen nicht auf.
2. **Zählanzeige in Achtern:** Im Training zeigt die große Zahl die Zeit innerhalb des aktuellen Achters (1–8), daneben steht „2. Achter“. Das passt zum lauten Mitzählen „5, 6, 7, 8“.
3. **Standard-Vorlauf: 8 Zeiten.** Pro Gerät auf 0, 4, 8 oder 16 einstellbar.
4. **Heller Modus als Standard** (Papier-Anmutung, helle Hallen). Ein dunkler Modus ist verfügbar.
5. **Drittes Gruppensymbol: ✕.** Es unterscheidet sich von ● und ○ sowohl in der Form als auch in der Füllung. Alternativen: ▲ ■ ◆ oder der Buchstabe „R“ (für Reserve).
6. **KI-Kosten** laufen zentral über einen API-Schlüssel des Vereins auf dem Server, mit Monatslimit. Ein eigener Schlüssel pro Trainer ist nicht nötig.
7. **Backend:** ein verwalteter Dienst mit Rechenzentrum in der EU (Vorschlag Firebase, Alternative Supabase). Siehe Konzept, Abschnitt Technik.
8. **Bewegungs-Vorschau:** In der Vorschau laufen die Tänzer animiert entlang der Laufwege. Im Training ist das abschaltbar, der Standard ist das ruhige Papierbild mit Pfeilen.
