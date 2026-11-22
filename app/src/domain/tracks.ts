/* Spuren und Bausteine. Referenz: trackSum/trackText/flat in design-system/stage.js. */
import type { ActionBlock, Block, Dance, DancerRef, Group, RepeatBlock, Track } from './types';

export const isRepeat = (b: Block): b is RepeatBlock => 'repeat' in b;

export function blockCounts(b: Block): number {
  return isRepeat(b) ? b.repeat * b.blocks.reduce((s, x) => s + x.counts, 0) : b.counts;
}

/** Bausteine mit ausgeschriebenen Wiederholungen. */
export function flat(blocks: Block[]): ActionBlock[] {
  const out: ActionBlock[] = [];
  for (const b of blocks) {
    if (!isRepeat(b)) out.push(b);
    else for (let i = 0; i < b.repeat; i++) out.push(...b.blocks);
  }
  return out;
}

export function trackSum(t: Pick<Track, 'blocks'>): number {
  return t.blocks.reduce((s, b) => s + blockCounts(b), 0);
}

const one = (b: ActionBlock) => `${b.counts} ${b.term}${b.detail ? ' ' + b.detail : ''}`;

/** „‖: 2 GewSchw · 2 Klopf :‖ ×2 · 8 Marsch zur Mitte“ */
export function trackText(t: Pick<Track, 'blocks'>): string {
  return t.blocks
    .map((b) => (isRepeat(b) ? `‖: ${b.blocks.map(one).join(' · ')} :‖ ×${b.repeat}${b.mirrored ? ' gespiegelt' : ''}` : one(b)))
    .join(' · ');
}

/** Alle Gruppen und kein Teil = „Alle“. */
export function isAll(t: Track, groups: Group[]): boolean {
  return !t.members && groups.length > 1 && groups.every((g) => t.groupIds.includes(g.id));
}

export function dancerKeys(g: Pick<Group, 'id' | 'size'>): DancerRef[] {
  return Array.from({ length: g.size }, (_, i) => `${g.id}:${i}`);
}

/** Wer in der Spur tanzt. */
export function trackDancers(t: Track, dance: Pick<Dance, 'groups'>): DancerRef[] {
  if (t.members) return t.members;
  return dance.groups.filter((g) => t.groupIds.includes(g.id)).flatMap(dancerKeys);
}
