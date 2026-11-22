/* Datenmodell nach Konzept 5.2. Abweichungen sind dort dokumentiert:
   - DancerRef ist ein String "groupId:index" statt eines Objekts (Schlüssel für Maps, kompakt in Firestore).
   - Formation.params.points für die freie Form (Firestore kennt keine Listen in Listen).
   - PathStyle.mode fehlt = Automatik (Konzept 6.6).
   - Track.groupIds mit allen Gruppen und ohne members = „Alle“. */

export type Id = string;

/** Anonymer Tänzer: "groupId:index", z. B. "g1:0". Keine Personendaten. */
export type DancerRef = string;

export type SymbolShape = 'dot' | 'ring' | 'cross' | 'triangle' | 'square' | 'diamond' | { letter: string };

export interface Team {
  id: Id;
  name: string; // Garde, z. B. "Junioren"
  order: number;
}

export interface Dance {
  id: Id;
  teamId: Id;
  title: string; // "Gardetanz 2026/27"
  stageAspect: 1.5; // fest 3:2, Publikum unten
  groups: Group[];
  frameOrder: Id[];
  music?: Music;
  updatedAt: string;
  updatedBy: Id;
}

export interface Group {
  id: Id;
  name: string;
  symbol: SymbolShape;
  size: number;
  roleId: Id;
}

export interface Frame {
  id: Id;
  counts: number; // ganze Zeiten
  formations: Formation[]; // Startaufstellung, jeder Tänzer genau 1×
  tracks: Track[]; // jeder Tänzer in genau 1 Spur
  pathStyle: PathStyle[];
  countSplit?: number[]; // eigene Zählweise, fehlt = automatisch
  note?: string;
  updatedAt: string;
  updatedBy: Id;
}

export type Shape = 'line' | 'block' | 'circle' | 'arc' | 'wedge' | 'star' | 'free';

export interface Point {
  x: number;
  y: number;
}

export interface FormationParams {
  cx: number; // normiert 0..1, y = 1 ist vorne (Publikum)
  cy: number;
  rotation: number; // Grad
  length?: number;
  rows?: number;
  depth?: number; // Block: Reihenabstand
  radius?: number;
  spread?: number; // Bogen/Keil: Öffnungswinkel
  spacing?: number; // Keil: Abstand auf dem Arm
  rays?: number; // Stern: Anzahl Strahlen
  inner?: number; // Stern: innerster Abstand
  points?: Point[]; // freie Form: eine Position pro Mitglied
}

export interface Formation {
  id: Id;
  shape: Shape;
  params: FormationParams;
  members: DancerRef[];
  pattern?: 'alternate' | 'blocks' | 'custom';
  overrides: Record<DancerRef, Point>; // einzeln verschobene Positionen
}

export interface Track {
  groupIds: Id[];
  members?: DancerRef[]; // nur bei Teilen einer Gruppe
  label?: string; // Name des Teils: "linke Reihe"
  blocks: Block[];
}

export interface ActionBlock {
  term: string; // Begriff wie geschrieben: "Präs"
  detail?: string; // Zusatz: "nach vorne"
  counts: number;
  moves: boolean;
}

export interface RepeatBlock {
  repeat: number;
  mirrored?: boolean;
  blocks: ActionBlock[];
}

export type Block = ActionBlock | RepeatBlock;

export interface Role {
  id: Id;
  name: string;
}

export type RoleActionState = 'candidate' | 'learned' | 'pinned' | 'hidden';

export interface RoleAction {
  roleId: Id | '*';
  key: string; // normalisierter Begriff
  label: string;
  longName?: string;
  aliases: string[];
  state: RoleActionState;
  defaultCounts: number | null;
  moves: boolean;
  uses: number;
  lastUsedAt: string | null;
}

export type Pivot = 'center' | 'start' | 'end' | Point;

export interface Turn {
  pivot: Pivot;
  angle: number; // Grad, positiv = im Uhrzeigersinn, auch > 180
}

export interface PathStyle {
  formationId: Id;
  mode?: 'group' | 'individual'; // fehlt = Automatik
  bend?: { dx: number; dy: number }; // Kontrollpunkt relativ zur Mitte, normiert
  turn?: Turn;
}

export interface Music {
  fileId: Id;
  fileName: string;
  durationSec: number;
  version: number;
  beats: number[];
  sections: { startBeat: number; bpm: number }[];
  songs: Song[];
  firstCountBeat: number;
}

export interface Song {
  name: string;
  startBeat: number;
  parts: SongPart[];
  summary: number[];
  summaryEdited: boolean;
}

export interface SongPart {
  name: string;
  startCount: number;
  summary: number[];
}

/** Trainer, wie er gespeichert wird: nur Name, E-Mail und Microsoft-Konto-ID. */
export interface Trainer {
  uid: Id;
  name: string;
  email: string;
  msId?: string;
}
