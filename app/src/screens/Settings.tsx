/* Einstellungen: Darstellung, Konto und die Geräte-Prüfung für Risiko 3 (iPhone offline)
   und Risiko 6 (Anmeldung). Die Werte hier sind das Prüfprotokoll auf dem echten Gerät. */
import { useEffect, useState } from 'react';
import type { Dance, Id } from '../domain/types';
import { useApp, useRepo, useWatch, type Theme } from '../state';
import { Badge, Button, Seg } from '../ui/controls';
import { dateDE, daysSince, deviceSince, forgetDevice, isInstalled, mb, requestPersist, storageInfo, timeDE } from '../util';

export function Settings() {
  const repo = useRepo();
  const session = useApp((s) => s.session);
  const sync = useApp((s) => s.sync);
  const theme = useApp((s) => s.theme);
  const setTheme = useApp((s) => s.setTheme);
  const dances = useWatch<Dance[]>((r, cb) => r.watchDances(cb), []);
  const counts = useWatch<Record<Id, number>>((r, cb) => r.watchFrameCounts(cb), []);
  const [store, setStore] = useState<Awaited<ReturnType<typeof storageInfo>> | null>(null);
  const refresh = () => void storageInfo().then(setStore);
  useEffect(refresh, []);
  const user = session.state === 'signedIn' ? session.user : null;
  const since = deviceSince();
  const frames = counts ? Object.values(counts).reduce((s, n) => s + n, 0) : 0;
  const days = (iso?: string | null) => {
    const d = daysSince(iso);
    return d == null ? '' : d === 0 ? ' (heute)' : ` (vor ${d} ${d === 1 ? 'Tag' : 'Tagen'})`;
  };

  return (
    <div className="app-page app-settings">
      <h1>Einstellungen</h1>

      <section className="app-panel" aria-labelledby="s-look">
        <h2 id="s-look">Darstellung</h2>
        <Seg<Theme> label="Darstellung" value={theme} onChange={setTheme}
          options={[{ value: 'auto', label: 'Wie das Gerät' }, { value: 'light', label: 'Hell' }, { value: 'dark', label: 'Dunkel' }]} />
      </section>

      <section className="app-panel" aria-labelledby="s-account">
        <h2 id="s-account">Konto</h2>
        {user && (
          <dl className="app-dl">
            <dt>Name</dt><dd>{user.name}</dd>
            {user.email && (<><dt>E-Mail</dt><dd>{user.email}</dd></>)}
            <dt>Rechte</dt><dd>{user.admin ? 'Trainerleitung (Garden anlegen)' : 'Trainer'}</dd>
          </dl>
        )}
        <p className="app-hint">
          {repo.mode === 'firebase'
            ? 'Zugang hat, wer in der Microsoft-365-Gruppe „Garde-Tanz“ des Vereins ist. Die Trainerleitung pflegt die Gruppe.'
            : 'Vorschau: Die Anmeldung mit Microsoft ist noch nicht eingerichtet.'}
        </p>
        <Button variant="secondary" onClick={() => { forgetDevice(); void repo.signOut(); }}>Abmelden</Button>
      </section>

      <section className="app-panel" aria-labelledby="s-device">
        <h2 id="s-device">Geräte-Prüfung</h2>
        <p className="app-hint">Für den Test auf echten Geräten: Bleiben Tanz und Anmeldung erhalten, auch nach Tagen ohne Netz?</p>
        <dl className="app-dl">
          <dt>Als App installiert</dt>
          <dd>{isInstalled() ? <Badge tone="ok" icon="check">Ja</Badge> : <>Nein <span className="app-hint">– im Browser: Teilen → „Zum Home-Bildschirm“</span></>}</dd>
          <dt>Daten dauerhaft speichern</dt>
          <dd>
            {store?.persisted ? <Badge tone="ok" icon="check">Erlaubt</Badge> : store?.persisted === false ? <Badge tone="warn" icon="warn">Nicht erlaubt</Badge> : '–'}
            {!store?.persisted && <Button variant="ghost" onClick={() => void requestPersist().then(refresh)}>Erlauben</Button>}
          </dd>
          <dt>Belegter Speicher</dt><dd>{mb(store?.usage ?? null)}</dd>
          <dt>Auf dem Gerät</dt><dd>{dances?.length ?? 0} Tänze, {frames} Bilder</dd>
          <dt>Auf diesem Gerät angemeldet seit</dt><dd>{dateDE(since)}{days(since)}</dd>
          {user?.lastSignIn && (<><dt>Letzte Anmeldung bei Microsoft</dt><dd>{dateDE(user.lastSignIn)}{days(user.lastSignIn)}</dd></>)}
          <dt>Letzter Abgleich mit dem Server</dt>
          <dd>{sync.state === 'local' ? 'keiner (Vorschau)' : sync.lastSyncedAt ? `${dateDE(sync.lastSyncedAt)}, ${timeDE(sync.lastSyncedAt)}${days(sync.lastSyncedAt)}` : 'noch keiner'}</dd>
          <dt>Netz</dt><dd>{navigator.onLine ? 'online' : 'offline'}</dd>
        </dl>
      </section>

      <section className="app-panel" aria-labelledby="s-about">
        <h2 id="s-about">Über</h2>
        <p className="app-hint">Garde-Tanz {__APP_VERSION__} · {repo.mode === 'firebase' ? 'Verein' : 'Vorschau'}</p>
      </section>
    </div>
  );
}
