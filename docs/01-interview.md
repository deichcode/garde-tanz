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
| *Wie wird gezählt? – „Hängt immer davon ab. Bei 16 Zeiten Marsch wird 1, 2, 3, 4, …, 16 gezählt. Häufig bis 8. Selten aufgeteilt, z. B. 1, 2, 3, 4, 1, 2, 3, 4, …, 12 für 16 Zeiten. Das sind dann markante Stellen, wo auf eine bestimmte Aktion hin gezählt wird.“* | Jedes Bild hat eine **Zählweise**: Achter, durchgezählt oder eigene Aufteilung. Automatisch gilt Achter. Lange Bausteine (> 8 Zeiten) werden ab ihrem Beginn durchgezählt. Die Zählweise lässt sich in place ändern, steht im Bild-Kopf und im Druck und steuert die Zählanzeige im Training. Konzept 5.4. |
| *Dürfen alle Trainer alle Tänze bearbeiten? – „Erstmal alle alles, später ggf. komplexer.“* | Keine Rechte pro Garde im MVP. Konzept 6.1, 8. |
| *Einmarsch und Ausmarsch als eigene Bilder? – „Nein, werden nicht beachtet.“* | Nicht erfasst. Bild 1 beginnt nach dem Einmarsch, Musik davor ist Intro bzw. Vorlauf. |
| *Bildtitel? – „Nein.“* | Keine Titel. Der Bild-Kopf zeigt Nummer, Zeiten und gegebenenfalls die Zählweise. |
| *„Microsoft 365 Gruppe ist erstellt.“* | Einrichtungsschritt „Gruppe anlegen“ erledigt. Offen bis M1: App-Registrierung, Mitglieder und Besitzer, Gäste, Admin-Zustimmung. Konzept 6.1. |

## Runde 9: Abgleich mit einem echten Papier-Tanz (22.11.2026)

**Grundlage:** Garde-Tanz der Session 2026/27, Motto „Vom Dunkel ins Licht“. 8 Seiten (TA_SCHAB.XLS), 29 Bilder (das letzte ist der Platzhalter „Rest 16/16/8“), Medley aus 5 Liedern, 4:00 Min. Drei Gruppen: **●** 6 Tänzer mit Gewehr, **○** 2 Tänzer (hüpfen), **R** 10–12 Tänzer (marschieren, Beine schmeißen). ○ und R treten fast immer zusammen als „O+R“ auf. Gelesen werden die Bilder zeilenweise: oben links, oben rechts, unten links, unten rechts.

**Beobachtungen**

| Beobachtung | Beispiel aus dem Tanz |
|---|---|
| Die Lieder und ihre Teile geben die Bilder vor. Die Summe der Zeiten der Bilder eines Lieds stimmt genau. | „Lied 4: Toi, toi, toi · 1:44 (1:05) · Instr. 16/16/12 · Strophe 16/16 · Refr. 16/16/16/16/12“ = Bilder 11–21 = 152 Zeiten |
| Langsame Zählweise: eine Zeit kann zwei Schlägen der Musik entsprechen | Lied 1 (Trauermarsch): 28 Zeiten in 42 s ≈ 40 pro Minute. Lied 2 „Viva Colonia“: 32 Zeiten in 27 s ≈ 71 pro Minute, die anderen Lieder ≈ 128–148. Eine Schlagerkennung findet dort doppelt so viele Schläge, wie gezählt wird (im Spike M0.1 für Viva Colonia bestätigt) |
| Bildlängen sind oft keine 8 oder 16 | 12 Zeiten (4×), 20, 24, 32, 40 |
| Spuren folgen selten genau den Gruppen | Von 28 Bildern: 12 × „● \| O+R“, 7 × „Alle“, 3 × „Alle“ plus eine Teilgruppe, 4 × Teile nach Ort (linke/rechte Reihe, 1./2. Reihe, Hälfte), nur 2 × eine Spur pro Gruppe |
| Drehungen und Schwenks ganzer Formationen | „Stern halbe Drehung“, „Platzwechsel der Reihen“, „1/4 Drehung (Päckchen)“, „Vorwärtsschwenk zur Mitte“ |
| Hin und zurück innerhalb eines Bildes | Bilder 18 und 20: „6 Marsch nach außen \| 2 drehen \| 6 Marsch nach innen“ (↔) |
| Die Blickrichtung kommt ständig vor | „Alle stehen abgewandt“, „2 nach vorne drehen“, „hintere Reihe nach außen drehen“, „Blick zum Publikum“ |
| Wiederholungszeichen | „\|\|: 1,2 Gewehr schlagen \| 3,4 stehen \| 5–8 Gewehr schlagen :\|\|“, „8 \|\|: :\|\| mit rechts beginnen“ |
| Eine Aktion ist ein Begriff plus Richtung oder Ziel | „Marsch rückwärts zum Elferrat“, „Marsch zur Mitte (auf Lücke)“, „Marsch auf der Stelle“ |
| Ein gemeinsamer Weg, zwei Arten sich zu bewegen | „14 O hüpfen / R marschieren → nach vorne“ |
| Aktion ohne Zahl = das ganze Bild | „Alle Vorwärtsschwenk zu den Seiten“ (8 Zeiten) |
| Abfolgen wiederholen sich | „14 Marsch \| 2 drehen“ etwa 8× |

**Entscheidungen**

| Frage | Antwort | Konsequenz |
|---|---|---|
| Wie bekommen Teile einer Gruppe eigene Aktionen? | **Spur = Auswahl.** Prüfen, ob eine Spur pro Gruppe als Standard taugt. | Eine Spur gilt für eine beliebige Auswahl von Tänzern (Gruppen, Formation, Reihe, Einzelne) und hat optional einen Namen. Eine Spur pro Gruppe ist **kein** guter Standard (2 von 28 Bildern). Stattdessen übernimmt ein neues Bild die Spuraufteilung des vorherigen Bildes, das erste Bild beginnt mit einer Spur pro Gruppe (Vorgabe nach Nachfrage). Konzept 5.2, 6.5. |
| Wie entstehen Drehungen und Schwenks? | **Formation drehen** | Wer eine Formation am Drehgriff dreht, legt Drehpunkt und Winkel fest. Die Zuordnung folgt der Drehung statt dem kürzesten Weg, die Laufwege sind Kreisbögen, und auch Drehungen über 180° sind möglich. Konzept 6.4, 6.6. |
| Wie wird „hin und zurück“ innerhalb eines Bildes abgebildet? | **In zwei Bilder teilen** | Keine Zwischenaufstellungen. Ein Bild hat genau eine Startaufstellung, für „hin und zurück“ braucht es zwei Bilder. Die Bildnummern weichen dann vom alten Papier ab. Konzept 5.1. |
| Wie weit soll die Musikstruktur in die App? | **Lieder + Teile** | Das Raster bekommt benannte Abschnitte (Lied, Teil) mit ihren Zeiten in 16ern. Langsameres Zählen regelt das Raster selbst („doppelt / halb so schnell“, Spike M0.1). Konzept 6.7, präzisiert in Runde 10. |
| Soll die App die Blickrichtung kennen? | **Pro Formation** | Jede Formation hat eine Blickrichtung (Standard: vorne), einzelne Tänzer können abweichen. Die Symbole zeigen sie mit einer Kerbe. Ändert sie sich, gibt es einen Hinweis mit dem Angebot „2 drehen“. Konzept 6.4, 5.3. |
| Wie werden Wiederholungen geschrieben? | **Klammer ×n** | Markierte Bausteine werden wiederholt: „\|\|: … :\|\| ×2“, optional gespiegelt. Konzept 6.5. |
| Wie geht der Katalog mit „Marsch zur Mitte“ um? | **Begriff + Zusatz** | Gelernt wird nur der Begriff („Marsch“). Der Zusatz („zur Mitte“) ist freier Text mit eigenen Vorschlägen. „auf der Stelle“ schaltet „bewegt sich“ aus. Konzept 6.5. |
| Wie schreibt ein Verbund „O hüpft, R marschiert“? | **Baustein „Lauf“** | Im Verbund steht „Lauf“ für die übliche Fortbewegung jeder Rolle. Angezeigt wird zum Beispiel „14 Hüpf/Marsch nach vorne“. Konzept 6.5. |

**Nachtrag zu Runde 9**

| Frage | Antwort | Konsequenz |
|---|---|---|
| Was sind ○ und R? | *„Kreis und R sind unterschiedliche Gruppen, nur dieses Jahr aufgrund von kleiner Gruppengröße zusammengelegt.“* | Zwei Gruppen mit eigener Rolle. „O+R“ ist in diesem Tanz der übliche Gruppenverbund, „Lauf“ wird zu Hüpf bzw. Marsch. |
| Braucht die Bühne eine Marke für den Elferrat? | *„Nein, nur umgangssprachlich für hinten auf der Bühne.“* | Keine Bühnenmarke. „zum Elferrat“ bleibt ein Zusatz als Text. |
| Abfolgen wie „14 Marsch \| 2 drehen“ ins MVP? | Nachfrage, wie weit das Konzept das schon abdeckt | Tippen, Baustein-Leiste mit Rest-Logik und Blickrichtungs-Hinweis decken es ab. Bleibt „nicht im MVP“ (Konzept 8). |

## Runde 10: Lied-Zusammenfassung (22.11.2026)

Vorgabe: *„Diese ‚Phrase‘ sind Zusammenfassungen am 1. Bild eines Liedes. In der App würde ich sie als Meta-Informationen zum aktuellen Lied behalten. Die Info ist für den Trainer relevant, um beim Schreiben sicher zu gehen, dass alle Zeiten des Lieds auch verplant sind, und um eine Übersicht über das Lied zu liefern. Grundsätzlich wird immer bis 8 gezählt, diese Zusammenfassung geht aber immer von 16 als Basis aus. Die App soll die Informationen so gut wie möglich automatisch vorbefüllen, aber vom Trainer anpassen lassen. Das Ganze sollte nicht nur eine einfache Notiz sein, sondern sich in die Informationsarchitektur einfügen.“*

| Frage | Antwort | Konsequenz |
|---|---|---|
| Woher kommt der Soll-Wert? | **Musik schlägt vor** | Länge und 16er-Aufteilung kommen aus dem Raster, der Trainer passt an. Ohne Musik keine Lieder. Konzept 6.12. |
| Bedeutet die Reihenfolge („16/16/16/16/20“) etwas? | **Mal so, mal so** | Die App schlägt den Rest am Ende vor, der Trainer darf ihn verschieben. Geprüft wird nur die Summe. |
| Wo erscheint die Lied-Übersicht? | **Lied-Bereich im Editor, Zeitleiste** | Inspektor-Bereich „Lied“ und Band in der Zeitleiste. Nicht im Training. |
| Wie genau wird geprüft? | **Pro Lied** | „140 von 152 Zeiten verplant · 12 frei“. |
| Was steht auf Blatt und Druck? | **Nur kleine Marke** | „Lied 4: Toi, toi, toi · 1:44“ über dem ersten Bild, ohne Zusammenfassung. |
| Teile (Instr., Strophe, Refr.)? | **Teile mit eigener Zusammenfassung** | Ein Lied kann Teile mit eigenen 16ern haben, geprüft wird trotzdem pro Lied. |
| Wie kommen die Liedgrenzen in die App? | **Eine Datei, App schlägt vor** | Die Analyse schlägt Grenzen vor, der Trainer bestätigt und benennt sie im Raster-Editor. |
| Ein Bild ragt über eine Liedgrenze? | **Erlaubt, still** | Kein Hinweis. Das Bild gehört zum Lied, in dem es beginnt. Die frühere Prüfregel „Bilder enden nicht an einer Liedgrenze“ entfällt. |

---

## Eigene Annahmen (nicht abgefragt, bitte prüfen)

Diese Punkte habe ich festgelegt, damit das Konzept vollständig ist. Jeder lässt sich leicht ändern.

1. **Sprache und Ansprache:** Die Oberfläche ist auf Deutsch und duzt. Sie nutzt das Vokabular der Trainer: *Bild, Zeiten, Achter, Gruppe, Laufweg, Aktion*. Begriffe wie *Frame* oder *Count* tauchen nicht auf.
2. ~~**Zählanzeige in Achtern**~~ → ersetzt durch die **Zählweise pro Bild** (siehe Nachtrag, Konzept 5.4).
3. **Standard-Vorlauf: 8 Zeiten.** Pro Gerät auf 0, 4, 8 oder 16 einstellbar.
4. **Heller Modus als Standard** (Papier-Anmutung, helle Hallen). Ein dunkler Modus ist verfügbar.
5. **Drittes Gruppensymbol: ✕.** Es unterscheidet sich von ● und ○ sowohl in der Form als auch in der Füllung. Alternativen: ▲ ■ ◆ oder der Buchstabe „R“ (für Reserve).
6. **KI-Kosten** laufen zentral über einen API-Schlüssel des Vereins auf dem Server, mit Monatslimit. Ein eigener Schlüssel pro Trainer ist nicht nötig.
7. **Backend:** ein verwalteter Dienst mit Rechenzentrum in der EU (Vorschlag Firebase, Alternative Supabase). Siehe Konzept, Abschnitt Technik.
8. **Bewegungs-Vorschau:** In der Vorschau laufen die Tänzer animiert entlang der Laufwege. Im Training ist das abschaltbar, der Standard ist das ruhige Papierbild mit Pfeilen.
