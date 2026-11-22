# Garde-Tanz

Eine PWA zum Choreografieren von Gardetänzen. Das Trainerteam schreibt den Tanz am Desktop oder Tablet **wie auf Papier** (4 Bilder pro A4-Seite) und verbindet ihn mit der Musik. Im Training läuft er am Handy synchron mit.

**Stand:** M1 (Fundament) ist programmiert: App-Gerüst, Datenmodell, Komponenten, Anmeldung mit Microsoft und Abgleich. Als Nächstes kommen die Einrichtung im Verein und die Prüfung auf echten Geräten ([docs/04-einrichtung.md](docs/04-einrichtung.md)), danach M2 (Schreiben und Drucken).

## Dokumente

| Dokument | Inhalt |
|---|---|
| [docs/01-interview.md](docs/01-interview.md) | Experten-Interview: alle Fragen, Antworten und ihre Konsequenzen |
| [docs/02-konzept.md](docs/02-konzept.md) | Produktkonzept MVP: Nutzer, Fachmodell, Funktionen, Screens, Technik, Risiken, Meilensteine |
| [docs/03-design-system.md](docs/03-design-system.md) | Design-System „Gardemaß“: Prinzipien, Farben, Schrift, Symbole, Komponenten, Sprache |
| [docs/04-einrichtung.md](docs/04-einrichtung.md) | Einrichtung im Verein (Firebase, Entra ID) und Prüfprotokoll für echte Geräte |

## App starten

```bash
cd app
npm ci
npm run dev    # http://localhost:5173
```

Ohne Konfiguration läuft die App als **Vorschau**: ohne Anmeldung, mit einem Beispieltanz, Daten nur auf dem Gerät. Für den Vereinsbetrieb mit Microsoft-Anmeldung und Abgleich: [docs/04-einrichtung.md](docs/04-einrichtung.md).

| Ordner | Inhalt |
|---|---|
| `app/` | PWA (React, TypeScript, Vite). Fachlogik in `src/domain`, Komponenten in `src/ui`, Datenhaltung in `src/data` |
| `functions/` | Server-Funktionen: Gruppenprüfung bei der Anmeldung, täglicher Abgleich |
| `design-system/` | Tokens, Komponenten-CSS (nutzt auch die App), Styleguide, Referenz-Code `stage.js` |
| `firestore.rules` | Sicherheitsregeln: nur Mitglieder der Gruppe „Garde-Tanz“ |

## Design-System ansehen

Der lebende Styleguide liegt in `design-system/index.html`. Er zeigt Komponenten mit echten Tanzbeispielen und Screen-Entwürfe für Desktop, Training und Bearbeiten-Modus.

```bash
npx serve design-system   # dann http://localhost:3000 öffnen
```

Die Datei lässt sich auch direkt im Browser öffnen.

## MVP auf einen Blick

- **Gruppen** mit Symbolen ● ○ ✕, 2–3 Gruppen mit je 2–12 Tänzern. Jeder Tanz ordnet ihnen Rollen zu (Vorgabe: ● Grenadiere, ○ Mariechen, ✕ Reserve).
- **Bilder** mit fester Anzahl Zeiten (meist 8 oder 16). Formationen als Formen, die die App in Einzelpositionen auflöst.
- **Aktionen** pro Gruppe als Bausteine („2 1/4 Dreh · 6 Marsch“). Ein Hinweis erscheint, wenn die Zeiten nicht aufgehen.
- **Rollen mit eigenen Katalogen** plus gemeinsame Bausteine (alle: Marsch, 1/4 Dreh, 1/2 Dreh, Stip …; Mariechen: Hüpf, Schmeiß; Grenadiere: GewSchw, Präs, Fuß, Klopf; Reserve: BeinSchw). Die Kataloge lernen beim Schreiben und werden direkt am Baustein gepflegt. Start-Kataloge: `seed/start-katalog.json`.
- **Gruppen beliebig zusammenfassen**, auch für Abschnitte des Tanzes.
- **Laufwege** automatisch zwischen den Bildern, mit Zuordnung auf kürzeste Wege.
- **Musik** mit automatischer Schlagerkennung, Korrektur per Mittippen, Tempowechsel möglich.
- **Training** am Handy: Start ab jedem Bild mit Vorlauf, Zählzeit und laufende Aktion groß, offline.
- **Drucken** im Papierformat: A4 quer, 2 × 2.
- **KI-Assistent:** ein Bild beschreiben, die KI fragt bei Unklarheiten nach und schlägt ein Bild vor.
- **Anmeldung mit Microsoft** über das Microsoft 365 des Vereins. Zugang über eine M365-Gruppe, Externe als Gast.
