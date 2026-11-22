/* Prüfregeln (Konzept 5.3): Hinweise, nie Sperren. Referenz für „sum“ und „move“:
   warnings in design-system/stage.js. Kreuzende Laufwege folgen mit dem Editor (M2). */
import type { DancerRef, Frame, Group } from './types';
import { MIN_MOVE, positions } from './geometry';
import { flat, trackDancers, trackSum } from './tracks';

export type WarningKind = 'empty' | 'sum' | 'move' | 'still' | 'unassigned' | 'double';

export interface Warning {
  track: number | null; // Index der Spur, null = ganzes Bild
  kind: WarningKind;
  text: string;
}

export function warnings(frame: Pick<Frame, 'counts' | 'formations' | 'tracks'>, next: Pick<Frame, 'formations'> | null | undefined, groups: Group[]): Warning[] {
  const list: Warning[] = [];
  const P = positions(frame);
  const Q = next ? positions(next) : null;
  const seen = new Map<DancerRef, number>();

  frame.tracks.forEach((t, ti) => {
    const who = trackDancers(t, { groups });
    who.forEach((k) => seen.set(k, (seen.get(k) ?? 0) + 1));
    if (!t.blocks.length) {
      list.push({ track: ti, kind: 'empty', text: 'noch keine Aktion' });
      return;
    }
    const sum = trackSum(t);
    if (sum !== frame.counts) {
      const diff = Math.abs(frame.counts - sum);
      list.push({ track: ti, kind: 'sum', text: `${sum} von ${frame.counts} Zeiten · ${diff} ${sum < frame.counts ? 'fehlen' : 'zu viel'}` });
    }
    if (Q) {
      const moved = who.some((k) => P[k] && Q[k] && Math.hypot(P[k].x - Q[k].x, P[k].y - Q[k].y) >= MIN_MOVE);
      const moving = flat(t.blocks).find((b) => b.moves);
      if (moved && !moving) list.push({ track: ti, kind: 'move', text: 'läuft ins nächste Bild, aber keine Lauf-Aktion' });
      if (!moved && moving) list.push({ track: ti, kind: 'still', text: `${moving.counts} ${moving.term}, aber kein Laufweg. Bild teilen?` });
    }
  });

  for (const g of groups) {
    const keys = Array.from({ length: g.size }, (_, i) => `${g.id}:${i}`);
    const none = keys.filter((k) => !seen.has(k)).length;
    const twice = keys.filter((k) => (seen.get(k) ?? 0) > 1).length;
    if (none) list.push({ track: null, kind: 'unassigned', text: `${none} Tänzer von ${g.name} ${none === 1 ? 'hat' : 'haben'} keine Spur` });
    if (twice) list.push({ track: null, kind: 'double', text: `${twice} Tänzer von ${g.name} ${twice === 1 ? 'ist' : 'sind'} in zwei Spuren` });
  }
  return list;
}
