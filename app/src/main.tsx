import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '../../design-system/tokens.css';
import '../../design-system/components.css';
import './styles/app.css';
import { firebaseEnv } from './data/config';
import type { Repo } from './data/repo';
import { applyTheme, useApp } from './state';
import { requestPersist } from './util';
import { App } from './App';

applyTheme(useApp.getState().theme);
registerSW({ immediate: true });

async function start() {
  const env = firebaseEnv();
  // Ohne Konfiguration: Vorschau. Firebase wird dann gar nicht erst geladen.
  const repo: Repo = env ? (await import('./data/firebaseRepo')).createFirebaseRepo(env) : (await import('./data/previewRepo')).createPreviewRepo();
  useApp.setState({ repo });
  repo.onSync((sync) => useApp.setState({ sync }));
  repo.onSession((session) => {
    useApp.setState({ session });
    if (session.state === 'signedIn') {
      void requestPersist(); // Risiko 3: Offline-Daten vor dem Aufräumen des Browsers schützen
      repo.ensureCatalogs().catch((e) => console.error('Start-Kataloge nicht angelegt', e));
    }
  });
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
