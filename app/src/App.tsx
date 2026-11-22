import { useApp } from './state';
import { Link, matchRoute, usePath } from './router';
import { IconSprite } from './ui/Icon';
import { Icon } from './ui/Icon';
import { SyncStatus } from './ui/SyncStatus';
import { NoAccess, SignIn } from './screens/SignIn';
import { Overview } from './screens/Overview';
import { DanceView } from './screens/DanceView';
import { Settings } from './screens/Settings';

export function App() {
  const session = useApp((s) => s.session);
  return (
    <>
      <IconSprite />
      {session.state === 'loading' && <p className="app-loading">Garde-Tanz wird geladen …</p>}
      {session.state === 'signedOut' && <SignIn />}
      {session.state === 'noAccess' && <NoAccess message={session.message} />}
      {session.state === 'signedIn' && <Shell />}
    </>
  );
}

function Shell() {
  const path = usePath();
  const route = matchRoute(path);
  const sync = useApp((s) => s.sync);
  const repo = useApp((s) => s.repo);
  return (
    <div className="app">
      <header className="app-bar">
        <Link to="/" className="app-bar__brand" aria-current={route.name === 'overview' ? 'page' : undefined}>Garde-Tanz</Link>
        {repo?.mode === 'preview' && <span className="gm-badge gm-badge--neutral app-bar__mode">Vorschau</span>}
        <span className="app-bar__spacer" />
        <SyncStatus sync={sync} />
        <Link to="/einstellungen" className="gm-btn gm-btn--ghost" aria-current={route.name === 'settings' ? 'page' : undefined}>
          <Icon name="grid" />Einstellungen
        </Link>
      </header>
      <main className="app-main">
        {route.name === 'overview' && <Overview />}
        {route.name === 'dance' && <DanceView id={route.id} />}
        {route.name === 'settings' && <Settings />}
        {route.name === 'notFound' && (
          <div className="app-page"><p className="app-empty">Diese Seite gibt es nicht. <Link to="/">Zur Übersicht</Link></p></div>
        )}
      </main>
    </div>
  );
}
