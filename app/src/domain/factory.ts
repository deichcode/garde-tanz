/* Anlegen von Tanz und Bild (Konzept 5.1, 6.2) und die Start-Kataloge (seed/start-katalog.json). */
import seed from '../../../seed/start-katalog.json';
import type { Dance, Frame, Group, Id, Role, RoleAction, SymbolShape, Team } from './types';
import { newId } from './ids';
import { normalizeTerm } from './terms';

/** Gruppengrößen beim Anlegen, im Dialog änderbar (Annahme, kein Vereinswert). */
const DEFAULT_SIZES: Record<string, number> = { grenadiere: 6, mariechen: 6, reserve: 4 };

/** Vorgabe für einen neuen Tanz: ● Grenadiere, ○ Mariechen, ✕ Reserve. */
export function defaultGroups(): Group[] {
  return seed.groupsDefault.map((g, i) => ({
    id: `g${i + 1}`,
    name: g.name,
    symbol: g.symbol as SymbolShape,
    size: DEFAULT_SIZES[g.roleId] ?? 6,
    roleId: g.roleId,
  }));
}

export function seedRoles(): Role[] {
  return seed.roles.map((r) => ({ ...r }));
}

export function seedRoleActions(): RoleAction[] {
  return seed.roleActions.map((a) => ({
    roleId: a.roleId,
    key: normalizeTerm(a.label),
    label: a.label,
    longName: a.longName,
    aliases: [],
    state: 'learned',
    defaultCounts: a.defaultCounts,
    moves: a.moves,
    uses: 0,
    lastUsedAt: null,
  }));
}

/** Erstes Bild: eine Linie pro Gruppe von hinten nach vorne, eine Spur pro Gruppe. */
export function firstFrame(groups: Group[], by: Id, now: string): Frame {
  const n = groups.length;
  return {
    id: newId(),
    counts: 8,
    formations: groups.map((g, i) => ({
      id: newId(),
      shape: 'line',
      params: {
        cx: 0.5,
        cy: n === 1 ? 0.5 : 0.25 + (i * 0.55) / (n - 1),
        rotation: 0,
        length: Math.min(0.84, Math.max(0.1, (g.size - 1) * 0.075)),
      },
      members: Array.from({ length: g.size }, (_, k) => `${g.id}:${k}`),
      overrides: {},
    })),
    tracks: groups.map((g) => ({ groupIds: [g.id], blocks: [] })),
    pathStyle: [],
    updatedAt: now,
    updatedBy: by,
  };
}

/** Neues Bild = Kopie des vorherigen: Aufstellung und Spuraufteilung, die Spuren sind leer. */
export function nextFrame(prev: Frame, by: Id, now: string): Frame {
  return {
    id: newId(),
    counts: prev.counts,
    formations: prev.formations.map((fm) => ({ ...structuredClone(fm), id: newId() })),
    tracks: prev.tracks.map((t) => ({
      groupIds: [...t.groupIds],
      ...(t.members ? { members: [...t.members] } : {}),
      ...(t.label ? { label: t.label } : {}),
      blocks: [],
    })),
    pathStyle: [],
    updatedAt: now,
    updatedBy: by,
  };
}

export function newDance(input: { teamId: Id; title: string; groups: Group[]; by: Id; now: string }): { dance: Dance; frame: Frame } {
  const frame = firstFrame(input.groups, input.by, input.now);
  const dance: Dance = {
    id: newId(),
    teamId: input.teamId,
    title: input.title.trim(),
    stageAspect: 1.5,
    groups: input.groups,
    frameOrder: [frame.id],
    updatedAt: input.now,
    updatedBy: input.by,
  };
  return { dance, frame };
}

export function newTeam(name: string, order: number): Team {
  return { id: newId(), name: name.trim(), order };
}
