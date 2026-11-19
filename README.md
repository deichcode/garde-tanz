# Garde-Tanz

Eine PWA zum Choreografieren von Gardetänzen. Das Trainerteam schreibt den Tanz am Desktop oder Tablet **wie auf Papier** (4 Bilder pro A4-Seite) und verbindet ihn mit der Musik. Im Training läuft er am Handy synchron mit.

**Stand:** Konzeptphase. Interview, Produktkonzept und Design-System sind fertig. Als Nächstes kommen die Spikes (M0).

## Dokumente

| Dokument | Inhalt |
|---|---|
| [docs/01-interview.md](docs/01-interview.md) | Experten-Interview: alle Fragen, Antworten und ihre Konsequenzen |
| [docs/02-konzept.md](docs/02-konzept.md) | Produktkonzept MVP: Nutzer, Fachmodell, Funktionen, Screens, Technik, Risiken, Meilensteine |
| [docs/03-design-system.md](docs/03-design-system.md) | Design-System „Gardemaß“: Prinzipien, Farben, Schrift, Symbole, Komponenten, Sprache |

## Design-System ansehen

Der lebende Styleguide liegt in `design-system/index.html`. Er zeigt Komponenten mit echten Tanzbeispielen und Screen-Entwürfe für Desktop, Training und Bearbeiten-Modus.

```bash
npx serve design-system   # dann http://localhost:3000 öffnen
```

Die Datei lässt sich auch direkt im Browser öffnen.

## MVP auf einen Blick

- **Gruppen** mit Symbolen ● ○ ✕, 2–3 Gruppen mit je 4–10 Tänzern.
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
