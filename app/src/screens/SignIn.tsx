/* Anmeldung: nur mit Microsoft über den Vereins-Tenant (Konzept 6.1). */
import { useState } from 'react';
import { useApp, useRepo } from '../state';
import { Button } from '../ui/controls';

/** Microsoft-Logo nach den Markenvorgaben: die einzige Ausnahme von der Token-Regel. */
function MicrosoftLogo() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export function SignIn() {
  const repo = useRepo();
  const session = useApp((s) => s.session);
  const [busy, setBusy] = useState(false);
  const error = session.state === 'signedOut' ? session.error : undefined;
  const go = async () => {
    setBusy(true);
    try {
      await repo.signIn();
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="app-center">
      <div className="app-signin">
        <h1 className="app-signin__title">Garde-Tanz</h1>
        <p className="app-signin__lead">Gardetänze schreiben, drucken und trainieren.</p>
        {repo.mode === 'firebase' ? (
          <>
            <button type="button" className="app-ms-btn" onClick={go} disabled={busy}>
              <MicrosoftLogo />
              Mit Microsoft anmelden
            </button>
            <p className="app-hint">Mit deinem Vereinskonto oder als Gast im Verein. Danach bleibst du auf diesem Gerät angemeldet, auch ohne Internet.</p>
          </>
        ) : (
          <>
            <Button variant="primary" size="l" onClick={go} disabled={busy}>Vorschau öffnen</Button>
            <p className="app-hint">
              Die Anmeldung mit Microsoft ist noch nicht eingerichtet. In der Vorschau bleiben alle Daten nur auf diesem Gerät.
            </p>
          </>
        )}
        {error && <p className="app-error" role="alert">{error}</p>}
      </div>
    </main>
  );
}

export function NoAccess({ message }: { message: string }) {
  return (
    <main className="app-center">
      <div className="app-signin">
        <h1 className="app-signin__title">Kein Zugang</h1>
        <p className="app-error" role="alert">{message}</p>
        <Button variant="secondary" onClick={() => location.reload()}>Mit anderem Konto anmelden</Button>
      </div>
    </main>
  );
}
