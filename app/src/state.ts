/* App-Zustand (Zustand-Store): Sitzung, Abgleich, Darstellung. Daten selbst kommen über useWatch. */
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import type { Repo, Session, SyncInfo, Unsub } from './data/repo';

export type Theme = 'auto' | 'light' | 'dark';

interface AppState {
  repo: Repo | null;
  session: Session;
  sync: SyncInfo;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const THEME_KEY = 'gm-theme';

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'auto';
  } catch {
    return 'auto';
  }
}

export function applyTheme(t: Theme) {
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}

export const useApp = create<AppState>()((set) => ({
  repo: null,
  session: { state: 'loading' },
  sync: { state: 'synced', lastSyncedAt: null, pending: 0 },
  theme: readTheme(),
  setTheme: (theme) => {
    try {
      if (theme === 'auto') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* egal */
    }
    applyTheme(theme);
    set({ theme });
  },
}));

export function useRepo(): Repo {
  const repo = useApp((s) => s.repo);
  if (!repo) throw new Error('Repo fehlt');
  return repo;
}

/** Abo auf Daten des Repos; liefert undefined, bis die ersten Daten da sind. */
export function useWatch<T>(subscribe: (repo: Repo, cb: (v: T) => void) => Unsub, deps: unknown[]): T | undefined {
  const repo = useRepo();
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    setValue(undefined);
    return subscribe(repo, setValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, ...deps]);
  return value;
}
