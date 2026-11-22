/* Firebase: Anmeldung mit Microsoft über den Vereins-Tenant, Firestore mit Offline-Speicher.
   Konzept 6.1 und 9. Die Gruppenprüfung macht der Server (functions/: beforeUserSignedIn),
   das Ergebnis steht als Claims im Token: member, admin (= Besitzer der M365-Gruppe). */
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getRedirectResult,
  indexedDBLocalPersistence,
  initializeAuth,
  OAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  clearIndexedDbPersistence,
  collection,
  collectionGroup,
  deleteField,
  doc,
  getDocsFromServer,
  initializeFirestore,
  limit,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  setDoc,
  terminate,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
  type SnapshotMetadata,
} from 'firebase/firestore';
import type { Dance, Frame, Id, Role, RoleAction, Team, Trainer } from '../domain/types';
import { newDance, newTeam, nextFrame, seedRoleActions, seedRoles } from '../domain/factory';
import { roleActionId } from '../domain/terms';
import type { FirebaseEnv } from './config';
import { now, type FramePatch, type NewDanceInput, type Repo, type Session, type SessionUser, type SyncInfo } from './repo';

const CLAIMS_KEY = 'garde-tanz:zugang'; // zuletzt bestätigter Zugang, für den Start ohne Netz
const SYNC_KEY = 'garde-tanz:abgleich';

/** Fehler, bei denen die Sitzung endgültig ungültig ist (Zugang entzogen, Konto gelöscht). */
const REVOKED = ['auth/user-token-expired', 'auth/user-disabled', 'auth/user-not-found', 'auth/invalid-user-token'];

const NOT_MEMBER =
  'Dein Konto ist nicht in der Gruppe „Garde-Tanz“ des Vereins. Bitte die Trainerleitung, dich aufzunehmen, und melde dich dann noch einmal an.';
const REMOVED = 'Dein Zugang wurde beendet. Die Daten der App auf diesem Gerät sind gelöscht.';

interface Access {
  uid: Id;
  member: boolean;
  admin: boolean;
}

function readAccess(uid: Id): Access | null {
  try {
    const a = JSON.parse(localStorage.getItem(CLAIMS_KEY) || 'null') as Access | null;
    return a && a.uid === uid ? a : null;
  } catch {
    return null;
  }
}

function errCode(e: unknown): string {
  return (e as { code?: string })?.code ?? '';
}

export function createFirebaseRepo(env: FirebaseEnv): Repo {
  const app = initializeApp(env.options);
  const auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
  auth.languageCode = 'de';
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    ignoreUndefinedProperties: true,
  });

  /* --- Abgleich ------------------------------------------------------------ */
  let online = navigator.onLine;
  let pending = 0;
  let lastSyncedAt: string | null = localStorage.getItem(SYNC_KEY);
  const syncListeners = new Set<(s: SyncInfo) => void>();
  const syncInfo = (): SyncInfo => ({ state: !online ? 'offline' : pending ? 'syncing' : 'synced', lastSyncedAt, pending });
  const emitSync = () => syncListeners.forEach((l) => l(syncInfo()));
  const markSynced = () => {
    lastSyncedAt = now();
    try {
      localStorage.setItem(SYNC_KEY, lastSyncedAt);
    } catch {
      /* egal */
    }
  };
  window.addEventListener('online', () => ((online = true), emitSync()));
  window.addEventListener('offline', () => ((online = false), emitSync()));
  let lastServerNote = 0;
  /** Ein Schnappschuss kam frisch vom Server: Stand merken (höchstens alle 20 s melden). */
  const noteServer = (m: SnapshotMetadata) => {
    if (m.fromCache || m.hasPendingWrites) return;
    markSynced();
    if (Date.now() - lastServerNote > 20000) {
      lastServerNote = Date.now();
      emitSync();
    }
  };
  /** Schreiben kehrt sofort zurück. Offline wartet die Änderung auf dem Gerät auf das Netz. */
  const track = (p: Promise<unknown>) => {
    pending++;
    emitSync();
    p.then(markSynced, (e) => console.error('Speichern fehlgeschlagen', e)).finally(() => {
      pending--;
      emitSync();
    });
  };

  let uid: Id = '';
  const stamp = () => ({ updatedAt: now(), updatedBy: uid });
  const list = <T,>(s: QuerySnapshot<DocumentData>) => s.docs.map((d) => ({ ...d.data(), id: d.id }) as T);

  /* --- Zugang verloren: Daten auf dem Gerät löschen (Konzept 6.1) ----------- */
  async function wipe() {
    try {
      localStorage.removeItem(CLAIMS_KEY);
      localStorage.removeItem(SYNC_KEY);
    } catch {
      /* egal */
    }
    await fbSignOut(auth).catch(() => {});
    await terminate(db).catch(() => {});
    await clearIndexedDbPersistence(db).catch((e) => console.error('Offline-Daten nicht gelöscht', e));
  }

  function toUser(user: User, a: Access): SessionUser {
    return {
      uid: user.uid,
      name: user.displayName || user.email || 'Trainer',
      email: user.email || '',
      admin: a.admin,
      firstSignIn: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
    };
  }

  /** Zugang prüfen: offline mit dem zuletzt bestätigten Stand, online mit frischem Token. */
  async function check(user: User, emit: (s: Session) => void) {
    const known = readAccess(user.uid);
    if (known?.member) emit({ state: 'signedIn', user: toUser(user, known) });
    if (!navigator.onLine && known?.member) return;
    try {
      const res = await user.getIdTokenResult(!!known);
      const a: Access = { uid: user.uid, member: res.claims.member === true, admin: res.claims.admin === true };
      if (!a.member) {
        await wipe();
        emit({ state: 'noAccess', reason: known ? 'removed' : 'notMember', message: known ? REMOVED : NOT_MEMBER });
        return;
      }
      localStorage.setItem(CLAIMS_KEY, JSON.stringify(a));
      emit({ state: 'signedIn', user: toUser(user, a) });
    } catch (e) {
      if (REVOKED.includes(errCode(e))) {
        await wipe();
        emit({ state: 'noAccess', reason: 'removed', message: REMOVED });
      } else if (!known) {
        emit({ state: 'signedOut', error: 'Die Anmeldung braucht einmal Internet. Danach geht es auch offline.' });
      } // sonst: offline oder Netzfehler, die Sitzung bleibt
    }
  }

  return {
    mode: 'firebase',

    onSession(cb) {
      const emit = (s: Session) => {
        if (s.state === 'signedIn') uid = s.user.uid;
        cb(s);
      };
      emit({ state: 'loading' });
      // Ergebnis der Weiterleitung von Microsoft. Hier kommen auch Absagen der Gruppenprüfung an.
      let redirectError: Session | null = null;
      const ready = getRedirectResult(auth).catch((e) => {
        const msg = String((e as Error)?.message ?? '');
        if (msg.includes('NOT_MEMBER')) redirectError = { state: 'noAccess', reason: 'notMember', message: NOT_MEMBER };
        else if (msg.includes('WRONG_TENANT'))
          redirectError = { state: 'noAccess', reason: 'notMember', message: 'Bitte melde dich mit deinem Vereinskonto an (bzw. als Gast im Verein).' };
        else if (errCode(e) !== 'auth/redirect-cancelled-by-user')
          redirectError = { state: 'signedOut', error: `Die Anmeldung hat nicht geklappt (${errCode(e) || 'unbekannt'}). Versuch es noch einmal.` };
      });
      return onAuthStateChanged(auth, async (user) => {
        await ready;
        if (!user) emit(redirectError ?? { state: 'signedOut' });
        else await check(user, emit);
      });
    },

    async signIn() {
      const provider = new OAuthProvider('microsoft.com');
      // Einzelmandant: nur der Tenant des Vereins (Gäste per Entra B2B)
      provider.setCustomParameters({ tenant: env.tenantId, prompt: 'select_account' });
      // Weiterleitung statt Pop-up: funktioniert auch in der installierten App auf dem iPhone
      await signInWithRedirect(auth, provider);
    },

    async signOut() {
      await fbSignOut(auth);
      try {
        localStorage.removeItem(CLAIMS_KEY);
      } catch {
        /* egal */
      }
    },

    onSync(cb) {
      syncListeners.add(cb);
      cb(syncInfo());
      return () => syncListeners.delete(cb);
    },

    watchTeams: (cb) =>
      onSnapshot(collection(db, 'teams'), { includeMetadataChanges: true }, (s) => {
        noteServer(s.metadata);
        cb(list<Team>(s).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'de')));
      }),
    watchDances: (cb) =>
      onSnapshot(collection(db, 'dances'), { includeMetadataChanges: true }, (s) => {
        noteServer(s.metadata);
        cb(list<Dance>(s));
      }),
    watchFrames: (danceId, cb) =>
      onSnapshot(collection(db, 'dances', danceId, 'frames'), { includeMetadataChanges: true }, (s) => {
        noteServer(s.metadata);
        cb(Object.fromEntries(s.docs.map((d) => [d.id, { ...d.data(), id: d.id } as Frame])));
      }),
    watchFrameCounts: (cb) =>
      onSnapshot(collectionGroup(db, 'frames'), (s) => {
        const counts: Record<Id, number> = {};
        for (const d of s.docs) {
          const danceId = d.ref.parent.parent?.id;
          if (danceId) counts[danceId] = (counts[danceId] ?? 0) + 1;
        }
        cb(counts);
      }),
    watchTrainers: (cb) =>
      onSnapshot(collection(db, 'users'), (s) => cb(Object.fromEntries(s.docs.map((d) => [d.id, { ...(d.data() as Trainer), uid: d.id }])))),
    watchCatalog(cb) {
      let roles: Role[] = [];
      let actions: RoleAction[] = [];
      const a = onSnapshot(collection(db, 'roles'), (s) => ((roles = list<Role>(s)), cb({ roles, actions })));
      const b = onSnapshot(collection(db, 'roleActions'), (s) => ((actions = s.docs.map((d) => d.data() as RoleAction)), cb({ roles, actions })));
      return () => (a(), b());
    },

    createTeam(name) {
      const team = newTeam(name, Date.now());
      track(setDoc(doc(db, 'teams', team.id), { name: team.name, order: team.order }));
      return team.id;
    },
    createDance(input: NewDanceInput) {
      const { dance, frame } = newDance({ ...input, by: uid, now: now() });
      const b = writeBatch(db);
      const { id, ...danceData } = dance;
      const { id: fid, ...frameData } = frame;
      b.set(doc(db, 'dances', id), danceData);
      b.set(doc(db, 'dances', id, 'frames', fid), frameData);
      track(b.commit());
      return id;
    },
    appendFrame(dance: Dance, copyOf: Frame) {
      const { id, ...data } = nextFrame(copyOf, uid, now());
      const b = writeBatch(db);
      b.set(doc(db, 'dances', dance.id, 'frames', id), data);
      // arrayUnion hängt an, auch wenn zwei Trainer gleichzeitig (offline) ein Bild anfügen
      b.update(doc(db, 'dances', dance.id), { frameOrder: arrayUnion(id), ...stamp() });
      track(b.commit());
      return id;
    },
    updateFrame(danceId, frameId, patch: FramePatch) {
      const data: Record<string, unknown> = { ...patch, ...stamp() };
      if (patch.note === '') data.note = deleteField();
      if (patch.countSplit === null) data.countSplit = deleteField();
      track(updateDoc(doc(db, 'dances', danceId, 'frames', frameId), data));
    },
    deleteFrame(dance, frameId) {
      const b = writeBatch(db);
      b.delete(doc(db, 'dances', dance.id, 'frames', frameId));
      b.update(doc(db, 'dances', dance.id), { frameOrder: arrayRemove(frameId), ...stamp() });
      track(b.commit());
    },

    async ensureCatalogs() {
      if (!navigator.onLine) return;
      const existing = await getDocsFromServer(query(collection(db, 'roles'), limit(1)));
      if (!existing.empty) return;
      const b = writeBatch(db);
      for (const r of seedRoles()) b.set(doc(db, 'roles', r.id), { name: r.name });
      // feste IDs (Rolle + normalisierter Begriff): keine Doppelten, auch wenn zwei Geräte gleichzeitig anlegen
      for (const a of seedRoleActions()) b.set(doc(db, 'roleActions', roleActionId(a.roleId, a.label)), a);
      track(b.commit());
    },
  };
}
