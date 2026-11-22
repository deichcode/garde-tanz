/* Schnittstelle zur Datenhaltung. Zwei Umsetzungen:
   - firebaseRepo: Microsoft-Anmeldung, Firestore mit Offline-Speicher (Konzept 6.1, 9)
   - previewRepo: Vorschau ohne Anmeldung, Daten nur auf diesem Gerät. Nur aktiv, solange
     keine Firebase-Konfiguration hinterlegt ist (vor der Einrichtung im Verein). */
import type { Dance, Frame, Group, Id, RoleAction, Role, Team, Trainer } from '../domain/types';

export type Unsub = () => void;

export interface SessionUser {
  uid: Id;
  name: string;
  email: string;
  admin: boolean; // Besitzer der M365-Gruppe
  firstSignIn?: string; // für die Geräte-Prüfung (Risiko 6)
  lastSignIn?: string;
}

export type NoAccessReason = 'notMember' | 'removed' | 'error';

export type Session =
  | { state: 'loading' }
  | { state: 'signedOut'; error?: string }
  | { state: 'noAccess'; reason: NoAccessReason; message: string }
  | { state: 'signedIn'; user: SessionUser };

/** synced/syncing/offline mit Server, local = Vorschau ohne Server. */
export type SyncState = 'synced' | 'syncing' | 'offline' | 'local';

export interface SyncInfo {
  state: SyncState;
  lastSyncedAt: string | null;
  pending: number; // Änderungen, die noch nicht beim Server sind
}

/** Änderbare Felder eines Bildes, gespeichert feldweise (gleichzeitige Änderungen: die letzte gewinnt). */
export type FramePatch = Partial<Pick<Frame, 'counts' | 'formations' | 'tracks' | 'pathStyle' | 'note'>> & {
  countSplit?: number[] | null; // null = zurück auf automatisch
};

export interface NewDanceInput {
  teamId: Id;
  title: string;
  groups: Group[];
}

export interface Repo {
  readonly mode: 'firebase' | 'preview';

  onSession(cb: (s: Session) => void): Unsub;
  signIn(): Promise<void>;
  signOut(): Promise<void>;

  onSync(cb: (s: SyncInfo) => void): Unsub;

  watchTeams(cb: (teams: Team[]) => void): Unsub;
  watchDances(cb: (dances: Dance[]) => void): Unsub;
  watchFrames(danceId: Id, cb: (frames: Record<Id, Frame>) => void): Unsub;
  /** Alle Bilder aller Tänze: hält sie offline bereit und liefert die Anzahl pro Tanz. */
  watchFrameCounts(cb: (byDance: Record<Id, number>) => void): Unsub;
  watchTrainers(cb: (byUid: Record<Id, Trainer>) => void): Unsub;
  watchCatalog(cb: (c: { roles: Role[]; actions: RoleAction[] }) => void): Unsub;

  /* Schreiben kehrt sofort zurück (offline-fähig), der Abgleich läuft im Hintergrund. */
  createTeam(name: string): Id;
  createDance(input: NewDanceInput): Id;
  appendFrame(dance: Dance, copyOf: Frame): Id;
  updateFrame(danceId: Id, frameId: Id, patch: FramePatch): void;
  deleteFrame(dance: Dance, frameId: Id): void;

  /** Legt die Start-Kataloge an, falls der Verein noch keine hat. */
  ensureCatalogs(): Promise<void>;
}

export function now(): string {
  return new Date().toISOString();
}
