# Einrichtung im Verein und Geräte-Prüfung (M1)

Diese Anleitung macht aus der Vorschau die Vereins-App: Anmeldung mit Microsoft, Daten in der EU, Abgleich zwischen allen Geräten. Danach folgen die Prüfungen auf echten Geräten (Risiko 3 und 6, Konzept 10).

**Wer macht was?**

| Schritt | Wer | Dauer |
|---|---|---|
| 1 Firebase-Projekt | wer die App betreut | 15 Min. |
| 2 App in Entra ID registrieren | M365-Admin des Vereins | 15 Min. |
| 3 Microsoft-Anmeldung in Firebase | wer die App betreut | 5 Min. |
| 4 Server-Funktionen | wer die App betreut | 10 Min. |
| 5 App veröffentlichen | wer die App betreut | 10 Min. |
| 6 Erster Start, Gäste einladen | Trainerleitung, M365-Admin | 10 Min. |
| 7 Geräte-Prüfung | Trainerteam | über 30 Tage |

Tenant-ID, Client-ID und Gruppen-ID sind **keine Geheimnisse**. Das **Client-Geheimnis** aus Schritt 2 ist eins: Es kommt nur in Firebase (Schritt 3) und in den Secret Manager (Schritt 4), nie in eine Datei im Repository oder in einen Chat.

Ohne die Konfiguration aus Schritt 5 startet die App als **Vorschau**: ohne Anmeldung, Daten nur auf dem Gerät. So lässt sie sich schon vorher ausprobieren.

## 1. Firebase-Projekt anlegen

1. In der [Firebase-Konsole](https://console.firebase.google.com) ein Projekt anlegen, z. B. `garde-tanz`. Google Analytics ist nicht nötig.
2. Auf den Tarif **Blaze** umstellen. Er ist nötig für die Server-Funktionen und für Identity Platform. Für einen Verein liegen die Kosten im Kleinstbereich. Unter *Usage and billing* einen **Budget-Alarm** setzen, z. B. 5 €.
3. **Firestore Database** → *Create database* → Standort **`europe-west3` (Frankfurt)**, Produktionsmodus. Der Standort lässt sich später nicht ändern.
4. **Authentication** → *Get started*. Danach unter *Settings* auf **Firebase Authentication with Identity Platform** upgraden. Das braucht die Prüfung der Gruppe bei der Anmeldung (Blocking Function).
5. **Projektübersicht** → Web-App hinzufügen (`</>`), Name „Garde-Tanz“, Hosting aktivieren. Die angezeigten Werte `apiKey`, `projectId` und `appId` notieren (Schritt 5).

## 2. App in Entra ID registrieren (M365-Admin)

Im [Microsoft Entra Admin Center](https://entra.microsoft.com):

1. **App-Registrierungen** → *Neue Registrierung*
   - Name: `Garde-Tanz`
   - Unterstützte Kontotypen: **Nur Konten in diesem Organisationsverzeichnis** (Einzelmandant)
   - Umleitungs-URI, Plattform **Web**: `https://<projekt-id>.firebaseapp.com/__/auth/handler`
2. Unter **Authentifizierung** eine zweite Umleitungs-URI ergänzen: `https://<projekt-id>.web.app/__/auth/handler`. Unter dieser Adresse läuft die App. Die Anmeldung über dieselbe Adresse ist nötig, damit sie in der installierten App auf dem iPhone funktioniert.
3. **Zertifikate & Geheimnisse** → *Neuer geheimer Clientschlüssel*, Ablauf 24 Monate. Den **Wert** sofort kopieren, er wird nur einmal angezeigt. Das Ablaufdatum in den Vereinskalender eintragen, mit Erinnerung einen Monat vorher.
4. **API-Berechtigungen** → *Berechtigung hinzufügen* → Microsoft Graph → **Anwendungsberechtigungen** → `GroupMember.Read.All` → hinzufügen → **Administratorzustimmung für <Verein> erteilen**. `User.Read` (delegiert) ist schon eingetragen und bleibt.
5. Notieren:
   - **Anwendungs-ID (Client-ID)** und **Verzeichnis-ID (Tenant-ID)** aus der *Übersicht* der App
   - **Objekt-ID** der Gruppe „Garde-Tanz“: *Gruppen* → Garde-Tanz → *Übersicht*

Zugang hat, wer **Mitglied** der Gruppe ist. Die **Besitzer** der Gruppe sind die Trainerleitung: Sie dürfen zusätzlich Garden anlegen und Rollen löschen.

## 3. Microsoft-Anmeldung in Firebase

1. **Authentication** → *Sign-in method* → *Add new provider* → **Microsoft**
2. *Application ID* = Client-ID, *Application secret* = Client-Geheimnis aus Schritt 2
3. **Authentication** → *Settings* → *Authorized domains*: `<projekt-id>.web.app` und `<projekt-id>.firebaseapp.com` müssen eingetragen sein (Standard). Eine eigene Domain kommt hier und in Schritt 2 dazu.

Die App schickt bei der Anmeldung die Tenant-ID mit. Dadurch melden sich nur Konten des Vereins an, Gäste eingeschlossen.

## 4. Server-Funktionen

Voraussetzung: Node.js 22 und die Firebase CLI (`npx firebase-tools@15`, Anmeldung mit `npx firebase-tools@15 login`).

```bash
cp .firebaserc.example .firebaserc           # Projekt-ID eintragen
cp functions/.env.example functions/.env     # MS_TENANT_ID, MS_CLIENT_ID, MS_GROUP_ID eintragen
npx firebase-tools@15 functions:secrets:set MS_CLIENT_SECRET   # Client-Geheimnis eingeben
npm --prefix functions ci
npx firebase-tools@15 deploy --only functions,firestore
```

Das legt an:

- **`zugangPruefen`**: läuft vor jeder Anmeldung. Sie fragt Microsoft Graph, ob das Konto Mitglied oder Besitzer der Gruppe ist. Wenn nicht, wird die Anmeldung abgelehnt. Sie speichert nur Name, E-Mail-Adresse und Microsoft-Konto-ID.
- **`zugangAbgleichen`**: läuft täglich um 4:17 Uhr. Wer aus der Gruppe entfernt wurde, verliert die Sitzung. Die App löscht dann beim nächsten Start mit Netz ihre Daten auf dem Gerät.
- die **Sicherheitsregeln** (`firestore.rules`): Lesen und Schreiben nur für Mitglieder.

Danach unter **Authentication** → *Settings* → *Blocking functions* prüfen, dass bei *Before sign in* `zugangPruefen` eingetragen ist.

## 5. App veröffentlichen

```bash
cp app/.env.example app/.env.local   # Werte aus Schritt 1 und 2 eintragen
```

| Variable | Wert |
|---|---|
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` | aus Schritt 1.5 |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<projekt-id>.web.app` (dieselbe Adresse, unter der die App läuft) |
| `VITE_MS_TENANT_ID` | Verzeichnis-ID aus Schritt 2 |

```bash
npx firebase-tools@15 deploy --only hosting
```

Die App läuft dann unter `https://<projekt-id>.web.app`.

## 6. Erster Start

1. Die Trainerleitung (Besitzer der Gruppe) meldet sich an. Beim ersten Start legt die App die **Start-Kataloge** an (`seed/start-katalog.json`).
2. In der Übersicht die Garden anlegen, z. B. „Junioren“.
3. **Gäste** ohne Vereinskonto: Im Entra Admin Center unter *Benutzer* → *Externen Benutzer einladen* mit dem privaten Microsoft-Konto einladen und zur Gruppe „Garde-Tanz“ hinzufügen. Nach dem Annehmen der Einladung meldet sich der Gast ganz normal mit „Mit Microsoft anmelden“ an.

## 7. Geräte-Prüfung (Risiko 3 und 6)

Die Werte stehen in der App unter **Einstellungen → Geräte-Prüfung**. Vor jedem Test die App auf dem Gerät **installieren**:

- iPhone: in Safari **Teilen** → *Zum Home-Bildschirm*
- Android: in Chrome das Menü → *App installieren*

Danach in der Geräte-Prüfung auf *Daten dauerhaft speichern* → *Erlauben* tippen, falls dort „Nicht erlaubt“ steht.

### Risiko 6: Anmeldung

| # | Prüfung | Gerät | Erwartet | Ergebnis |
|---|---|---|---|---|
| 6.1 | Anmeldung mit Vereinskonto | iPhone (installiert) | Übersicht erscheint | |
| 6.2 | Anmeldung mit Vereinskonto | Android (installiert) | Übersicht erscheint | |
| 6.3 | Anmeldung mit Vereinskonto | Desktop-Browser | Übersicht erscheint | |
| 6.4 | Anmeldung als Gast mit privatem Microsoft-Konto | iPhone und Desktop | Übersicht erscheint | |
| 6.5 | Anmeldung mit einem Konto, das **nicht** in der Gruppe ist | beliebig | „Kein Zugang …“, keine Daten sichtbar | |
| 6.6 | Sitzung hält: App über 30 Tage nutzen, zwischendurch Tage ohne Netz | iPhone | keine erneute Anmeldung nötig; „Auf diesem Gerät angemeldet seit“ ≥ 30 Tage | |
| 6.7 | Aus der Gruppe entfernen, nächtlichen Abgleich abwarten (oder in der Google Cloud Console unter *Cloud Scheduler* den Job von `zugangAbgleichen` mit *Jetzt ausführen* starten), dann App mit Netz öffnen | iPhone | „Dein Zugang wurde beendet …“, Daten auf dem Gerät gelöscht (Geräte-Prüfung: 0 Tänze) | |

### Risiko 3: Offline auf dem iPhone

| # | Prüfung | Erwartet | Ergebnis |
|---|---|---|---|
| 3.1 | Installierte App, angemeldet, alle Tänze einmal in der Übersicht gesehen | jede Karte zeigt „Bilder auf dem Gerät“ | |
| 3.2 | Flugmodus, App schließen und neu öffnen | Übersicht und Tänze da, Status „Offline – Änderungen sind auf dem Gerät gespeichert“ | |
| 3.3 | Offline eine Notiz an einem Bild ändern, dann wieder online | Status wechselt auf „Synchronisiert“, die Notiz ist am Desktop da | |
| 3.4 | App 7 Tage nicht öffnen, dann im Flugmodus öffnen | Tänze vollständig da | |
| 3.5 | wie 3.4 nach 14 Tagen | Tänze vollständig da | |

Die Musik kommt mit M3 dazu. Dann wird 3.4/3.5 mit Musik wiederholt.

### Abgleich zwischen Geräten (Erfolgskriterium 4)

| # | Prüfung | Erwartet | Ergebnis |
|---|---|---|---|
| S.1 | Am Desktop „Neues Bild“, Zeiten ändern, Notiz schreiben | nach dem Öffnen am Handy sichtbar, „Geändert … von <Name>“ | |
| S.2 | Zwei Geräte offline, beide hängen ein Bild an, dann beide online | beide Bilder sind da | |
| S.3 | Zwei Geräte ändern gleichzeitig die Notiz desselben Bildes | die letzte Änderung gewinnt, nichts geht kaputt | |

## Entwickeln

```bash
cd app
npm ci
npm run dev          # Vorschau ohne Anmeldung (ohne .env.local)
npm test             # Fachlogik, Vergleich mit design-system/stage.js, Komponenten
npm run test:rules   # Sicherheitsregeln im Firestore-Emulator (braucht Java)
cd ../functions && npm ci && npm test
```
