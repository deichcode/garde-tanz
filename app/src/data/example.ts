/* Beispieltanz für die Vorschau: die Bilder 9–12 aus dem Styleguide, als Bilder 1–4. */
import type { Dance, DancerRef, Formation, FormationParams, Frame, Shape, Track, ActionBlock } from '../domain/types';
import { defaultGroups } from '../domain/factory';
import { assignShortest } from '../domain/assign';
import { newId } from '../domain/ids';

export function exampleDance(teamId: string, by: string, at: string): { dance: Dance; frames: Frame[] } {
  const groups = defaultGroups(); // g1 ● Grenadiere 6, g2 ○ Mariechen 6, g3 ✕ Reserve 4
  const m = (g: string, n: number): DancerRef[] => Array.from({ length: n }, (_, i) => `${g}:${i}`);
  const alt = (a: string, b: string, n: number) => m(a, n).flatMap((x, i) => [x, `${b}:${i}`]);
  const G = m('g1', 6), M = m('g2', 6), R = m('g3', 4);
  const fm = (shape: Shape, p: Partial<FormationParams>, members: DancerRef[]): Formation => ({
    id: newId(), shape, params: { cx: 0.5, cy: 0.5, rotation: 0, ...p }, members, overrides: {},
  });
  const b = (counts: number, term: string, moves = false, detail?: string): ActionBlock => ({ counts, term, moves, ...(detail ? { detail } : {}) });
  const t = (groupIds: string[], blocks: Track['blocks']): Track => ({ groupIds, blocks });
  const fr = (counts: number, formations: Formation[], tracks: Track[], note?: string): Frame => ({
    id: newId(), counts, formations, tracks, pathStyle: [], updatedAt: at, updatedBy: by, ...(note ? { note } : {}),
  });

  const raw = [
    fr(16, [fm('line', { cy: 0.76, length: 0.84 }, alt('g1', 'g2', 6)), fm('line', { cy: 0.32, length: 0.36 }, R)],
      [t(['g1', 'g2'], [b(4, 'Stip'), b(12, 'Marsch', true)]), t(['g3'], [b(4, '1/4 Dreh'), b(12, 'Marsch', true)])]),
    fr(8, [fm('block', { cx: 0.2, cy: 0.46, length: 0.2, rows: 2, depth: 0.22 }, M), fm('block', { cx: 0.8, cy: 0.46, length: 0.2, rows: 2, depth: 0.22 }, G),
      fm('line', { cy: 0.84, length: 0.3 }, R)],
      [t(['g2'], [b(8, 'Hüpf', true)]), t(['g1'], [b(6, 'Präs')]), t(['g3'], [b(4, 'BeinSchw'), b(4, 'Marsch', true)])], 'Hintere Reihe kommt zu spät'),
    fr(16, [fm('circle', { cy: 0.47, radius: 0.31 }, alt('g1', 'g2', 6)), fm('line', { cy: 0.47, length: 0.17 }, R)],
      [t(['g2', 'g3'], [b(4, '1/2 Dreh'), b(4, 'Stip'), b(8, 'Marsch', true)]), t(['g1'], [b(4, 'GewSchw'), b(4, 'Klopf'), b(8, 'Marsch', true)])]),
    fr(8, [fm('line', { cx: 0.47, cy: 0.52, length: 0.86, rotation: 24 }, [...M, ...G]), fm('line', { cx: 0.84, cy: 0.2, length: 0.18 }, R)],
      [t(['g1', 'g2'], [b(2, '1/4 Dreh'), b(6, 'Marsch', true)]), t(['g3'], [b(8, 'Marsch', true)])]),
    fr(16, [fm('line', { cy: 0.22, length: 0.62 }, M), fm('arc', { cy: 0.48, radius: 0.36, spread: 120 }, G), fm('line', { cy: 0.58, length: 0.2 }, R)],
      [t(['g2'], [b(16, 'Schmeiß')]), t(['g1'], [b(8, 'Präs'), b(8, 'Fuß')]), t(['g3'], [b(8, 'Marsch', true), b(8, 'BeinSchw')])]),
  ];
  const frames = [raw[0]];
  for (let i = 1; i < raw.length; i++) frames.push(assignShortest(frames[i - 1], raw[i]));
  const dance: Dance = {
    id: newId(), teamId, title: 'Gardetanz 2026/27 (Beispiel)', stageAspect: 1.5, groups,
    frameOrder: frames.map((f) => f.id), updatedAt: at, updatedBy: by,
  };
  return { dance, frames };
}
