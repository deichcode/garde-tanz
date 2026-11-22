/* Vorschau ohne Anmeldung: alle Daten nur auf diesem Gerät (localStorage).
   Nur aktiv, solange keine Firebase-Konfiguration hinterlegt ist. */
import type { Dance, Frame, Id, Role, RoleAction, Team, Trainer } from '../domain/types';
import { newDance, newTeam, nextFrame, seedRoleActions, seedRoles } from '../domain/factory';
import { exampleDance } from './example';
import { now, type FramePatch, type NewDanceInput, type Repo, type Session, type SyncInfo, type Unsub } from './repo';

const KEY = 'garde-tanz:vorschau';
const USER = { uid: 'vorschau', name: 'Vorschau', email: '', admin: true };

interface Store {
  signedIn: boolean;
  teams: Team[];
  dances: Dance[];
  frames: Record<Id, Record<Id, Frame>>; // Tanz → Bilder
  roles: Role[];
  actions: RoleAction[];
}

function empty(): Store {
  return { signedIn: false, teams: [], dances: [], frames: {}, roles: [], actions: [] };
}

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...(JSON.parse(raw) as Store) };
  } catch {
    /* kaputter oder gesperrter Speicher: neu beginnen */
  }
  return empty();
}

export function createPreviewRepo(): Repo {
  let store = load();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
      /* Speicher voll oder gesperrt: bleibt im Speicher dieser Sitzung */
    }
    emit();
  };
  // Andere Tabs desselben Geräts
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      store = load();
      emit();
    }
  });
  const watch = (fn: () => void): Unsub => {
    listeners.add(fn);
    fn();
    return () => listeners.delete(fn);
  };

  function firstRun() {
    if (store.teams.length) return;
    const team = newTeam('Junioren', 0);
    const ex = exampleDance(team.id, USER.uid, now());
    store.teams = [team];
    store.dances = [ex.dance];
    store.frames = { [ex.dance.id]: Object.fromEntries(ex.frames.map((f) => [f.id, f])) };
  }

  const touchDance = (id: Id) => {
    store.dances = store.dances.map((d) => (d.id === id ? { ...d, updatedAt: now(), updatedBy: USER.uid } : d));
  };

  return {
    mode: 'preview',

    onSession(cb) {
      return watch(() => cb(store.signedIn ? ({ state: 'signedIn', user: USER } as Session) : { state: 'signedOut' }));
    },
    async signIn() {
      store.signedIn = true;
      firstRun();
      save();
    },
    async signOut() {
      store.signedIn = false;
      save();
    },

    onSync(cb: (s: SyncInfo) => void) {
      cb({ state: 'local', lastSyncedAt: null, pending: 0 });
      return () => {};
    },

    watchTeams: (cb) => watch(() => cb([...store.teams].sort((a, b) => a.order - b.order))),
    watchDances: (cb) => watch(() => cb(store.dances)),
    watchFrames: (danceId, cb) => watch(() => cb(store.frames[danceId] ?? {})),
    watchFrameCounts: (cb) => watch(() => cb(Object.fromEntries(Object.entries(store.frames).map(([id, fs]) => [id, Object.keys(fs).length])))),
    watchTrainers: (cb) => watch(() => cb({ [USER.uid]: { uid: USER.uid, name: USER.name, email: '' } as Trainer })),
    watchCatalog: (cb) => watch(() => cb({ roles: store.roles, actions: store.actions })),

    createTeam(name) {
      const team = newTeam(name, store.teams.length);
      store.teams = [...store.teams, team];
      save();
      return team.id;
    },
    createDance(input: NewDanceInput) {
      const { dance, frame } = newDance({ ...input, by: USER.uid, now: now() });
      store.dances = [...store.dances, dance];
      store.frames = { ...store.frames, [dance.id]: { [frame.id]: frame } };
      save();
      return dance.id;
    },
    appendFrame(dance, copyOf) {
      const f = nextFrame(copyOf, USER.uid, now());
      store.frames = { ...store.frames, [dance.id]: { ...store.frames[dance.id], [f.id]: f } };
      store.dances = store.dances.map((d) => (d.id === dance.id ? { ...d, frameOrder: [...d.frameOrder, f.id] } : d));
      touchDance(dance.id);
      save();
      return f.id;
    },
    updateFrame(danceId, frameId, patch: FramePatch) {
      const prev = store.frames[danceId]?.[frameId];
      if (!prev) return;
      const next = { ...prev, ...patch, updatedAt: now(), updatedBy: USER.uid } as Frame & { countSplit?: number[] | null };
      if (patch.note === '') delete next.note;
      if (patch.countSplit === null) delete next.countSplit;
      store.frames = { ...store.frames, [danceId]: { ...store.frames[danceId], [frameId]: next } };
      save();
    },
    deleteFrame(dance, frameId) {
      const rest = { ...store.frames[dance.id] };
      delete rest[frameId];
      store.frames = { ...store.frames, [dance.id]: rest };
      store.dances = store.dances.map((d) => (d.id === dance.id ? { ...d, frameOrder: d.frameOrder.filter((x) => x !== frameId) } : d));
      touchDance(dance.id);
      save();
    },

    async ensureCatalogs() {
      if (store.roles.length) return;
      store.roles = seedRoles();
      store.actions = seedRoleActions();
      save();
    },
  };
}
