/* Gleiches Verhalten wie der Referenz-Code design-system/stage.js (CLAUDE.md: „gleiches Verhalten
   beibehalten oder die Abweichung im Konzept dokumentieren“). Die Beispielbilder sind die des Styleguides. */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import type { ActionBlock, Block, DancerRef, Formation, FormationParams, Frame, Group, PathStyle, Shape, Track } from './types';
import { positions, rotateFormation } from './geometry';
import { assignShortest } from './assign';
import { framePaths, type PathShape } from './paths';
import { countLabel, countSegments } from './counting';
import { isRepeat, trackText } from './tracks';
import { warnings } from './warnings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const code = readFileSync(new URL('../../../design-system/stage.js', import.meta.url), 'utf8');
const ctx: Any = { window: {} };
vm.runInNewContext(code, ctx);
const GM = ctx.window.GM;
const PAD = 6;

/* --- Beispieldaten wie im Styleguide ---------------------------------------- */
const groups: Group[] = [
  { id: 'b', name: 'Grenadiere', symbol: 'dot', size: 6, roleId: 'grenadiere' },
  { id: 'a', name: 'Mariechen', symbol: 'ring', size: 6, roleId: 'mariechen' },
  { id: 'c', name: 'Reserve', symbol: 'cross', size: 4, roleId: 'reserve' },
];
const refDance = { groups: groups.map((g) => ({ id: g.id, name: g.name, role: g.name, symbol: g.symbol })) };
const members = (g: string, n: number): DancerRef[] => Array.from({ length: n }, (_, i) => `${g}:${i}`);
const alternate = (g1: string, g2: string, n: number): DancerRef[] => members(g1, n).flatMap((m, i) => [m, `${g2}:${i}`]);
const A = members('a', 6), B = members('b', 6), C = members('c', 4);

let uid = 0;
const fm = (shape: Shape, params: Partial<FormationParams>, ms: DancerRef[]): Formation => ({
  id: `fm${++uid}`, shape, params: { cx: 0.5, cy: 0.5, rotation: 0, ...params }, members: [...ms], overrides: {},
});
const blk = (counts: number, term: string, moves = false, detail?: string): ActionBlock => ({ counts, term, moves, ...(detail ? { detail } : {}) });
const tr = (groupIds: string[], blocks: Block[], extra: Partial<Track> = {}): Track => ({ groupIds, blocks, ...extra });
const frame = (counts: number, formations: Formation[], tracks: Track[], pathStyle: PathStyle[] = []): Frame => ({
  id: `f${++uid}`, counts, formations, tracks, pathStyle, updatedAt: '', updatedBy: '',
});

const F9 = frame(16, [fm('line', { cx: 0.5, cy: 0.76, length: 0.84 }, alternate('b', 'a', 6)), fm('line', { cx: 0.5, cy: 0.32, length: 0.36 }, C)],
  [tr(['b', 'a'], [blk(4, 'Stip'), blk(12, 'Marsch', true)]), tr(['c'], [blk(4, '1/4 Dreh'), blk(12, 'Marsch', true)])]);
const F10raw = frame(8, [
  fm('block', { cx: 0.2, cy: 0.46, length: 0.2, rows: 2, depth: 0.22 }, A),
  fm('block', { cx: 0.8, cy: 0.46, length: 0.2, rows: 2, depth: 0.22 }, B),
  fm('line', { cx: 0.5, cy: 0.84, length: 0.3 }, C)],
  [tr(['a'], [blk(8, 'Hüpf', true)]), tr(['b'], [blk(6, 'Präs')]), tr(['c'], [blk(4, 'BeinSchw'), blk(4, 'Marsch', true)])]);
const F11raw = frame(16, [fm('circle', { cx: 0.5, cy: 0.47, radius: 0.31 }, alternate('b', 'a', 6)), fm('line', { cx: 0.5, cy: 0.47, length: 0.17 }, C)],
  [tr(['a', 'c'], [blk(4, '1/2 Dreh'), blk(4, 'Stip'), blk(8, 'Marsch', true)]), tr(['b'], [blk(4, 'GewSchw'), blk(4, 'Klopf'), blk(8, 'Marsch', true)])]);
const F12raw = frame(8, [fm('line', { cx: 0.47, cy: 0.52, length: 0.86, rotation: 24 }, [...A, ...B]), fm('line', { cx: 0.84, cy: 0.2, length: 0.18 }, C)],
  [tr(['b', 'a'], [blk(2, '1/4 Dreh'), blk(6, 'Marsch', true)]), tr(['c'], [blk(8, 'Marsch', true)])]);
const F13raw = frame(16, [
  fm('line', { cx: 0.5, cy: 0.22, length: 0.62 }, A),
  fm('arc', { cx: 0.5, cy: 0.48, radius: 0.36, spread: 120 }, B),
  fm('line', { cx: 0.5, cy: 0.58, length: 0.2 }, C)],
  [tr(['a'], [blk(16, 'Schmeiß')]), tr(['b'], [blk(8, 'Präs'), blk(8, 'Fuß')]), tr(['c'], [blk(8, 'Marsch', true), blk(8, 'BeinSchw')])]);

const star = fm('star', { cx: 0.5, cy: 0.5, radius: 0.3, rays: 4 }, alternate('b', 'a', 6));
const starTurn = frame(16, [star], [tr(['b', 'a'], [blk(16, 'Stip')])], [{ formationId: star.id, turn: { pivot: 'center', angle: 180 } }]);
const starNextRaw = frame(8, [{ ...rotateFormation(star, 180, 'center'), id: 'star-next' }], []);
const swingLine = fm('line', { cx: 0.5, cy: 0.28, length: 0.42 }, C);
const swing = frame(8, [swingLine], [tr(['c'], [blk(8, 'Marsch', true)])], [{ formationId: swingLine.id, turn: { pivot: 'start', angle: 90 } }]);
const swingNext = frame(8, [rotateFormation(swingLine, 90, 'start')], []);
const wedgeMembers = [...alternate('a', 'c', 4), 'a:4', 'a:5'];
const S14 = frame(16, [
  fm('line', { cx: 0.14, cy: 0.5, length: 0.4, rotation: 90 }, ['b:0', 'b:1', 'b:2']),
  fm('line', { cx: 0.86, cy: 0.5, length: 0.4, rotation: 90 }, ['b:3', 'b:4', 'b:5']),
  fm('wedge', { cx: 0.5, cy: 0.46, spacing: 0.06 }, wedgeMembers)],
  [tr(['b'], [{ repeat: 2, blocks: [blk(2, 'GewSchw'), blk(2, 'Klopf')] }, blk(8, 'Marsch', true, 'zur Mitte')], { members: ['b:0', 'b:1', 'b:2'], label: 'linke Reihe' }),
    tr(['b'], [blk(8, 'Präs'), blk(8, 'Marsch', true, 'zur Mitte')], { members: ['b:3', 'b:4', 'b:5'], label: 'rechte Reihe' }),
    tr(['a', 'c'], [blk(8, 'Marsch', true, 'nach vorne'), blk(8, 'Stip')])]);
const S15raw = frame(16, [fm('line', { cx: 0.5, cy: 0.24, length: 0.5 }, B), fm('wedge', { cx: 0.5, cy: 0.84, spacing: 0.06 }, wedgeMembers)],
  [tr(['b', 'a', 'c'], [blk(2, '1/4 Dreh'), blk(14, 'MrschSt')])]);

/* --- Umwandlung ins Format des Referenz-Codes -------------------------------- */
const refBlock = (b: ActionBlock) => [b.counts, b.term, b.moves ? 1 : 0, b.detail];
function toRef(f: Frame) {
  const turn: Any = {}, pathMode: Any = {};
  f.formations.forEach((x, fi) => {
    const s = f.pathStyle.find((p) => p.formationId === x.id);
    if (s?.turn) turn[fi] = s.turn;
    if (s?.mode) pathMode[fi] = s.mode;
  });
  return {
    num: 1, counts: f.counts, countSplit: f.countSplit, turn, pathMode,
    formations: f.formations.map((x) => ({
      shape: x.shape, ...x.params, members: [...x.members],
      overrides: Object.fromEntries(Object.entries(x.overrides).map(([k, p]) => [k, [p.x, p.y]])),
      points: x.params.points?.map((p) => [p.x, p.y]),
    })),
    tracks: f.tracks.map((t) => ({
      groups: t.groupIds, members: t.members, label: t.label,
      blocks: t.blocks.map((b) => (isRepeat(b) ? { repeat: b.repeat, mirrored: b.mirrored, blocks: b.blocks.map(refBlock) } : refBlock(b))),
    })),
  };
}

/** Laufwege aus dem SVG des Referenz-Renderers, in derselben Form wie framePaths. */
function refPaths(svg: string): PathShape[] {
  const out: PathShape[] = [];
  const re = /<path class="gm-path( gm-path--individual)? ?" [^>]*?d="([^"]+)"\/>|<text class="gm-path__label" x="([^"]+)" y="([^"]+)"[^>]*>([^<]*)<\/text>|<circle class="gm-path__pivot" cx="([^"]+)" cy="([^"]+)"/g;
  for (const m of svg.matchAll(re)) {
    if (m[2]) out.push({ kind: 'path', d: m[2], individual: !!m[1] });
    else if (m[5] !== undefined) out.push({ kind: 'label', x: +m[3], y: +m[4], text: m[5] });
    else out.push({ kind: 'pivot', x: +m[6], y: +m[7] });
  }
  return out;
}

/* Kette wie im Styleguide: Wer wohin läuft, wird auf kürzeste Wege zugeordnet. */
const F10 = assignShortest(F9, F10raw);
const F11 = assignShortest(F10, F11raw);
const F12 = assignShortest(F11, F12raw);
const F13 = assignShortest(F12, F13raw);
const S15 = assignShortest(S14, S15raw);
const starNext = assignShortest(starTurn, starNextRaw);
const starPlain = frame(16, [star], [tr(['b', 'a'], [blk(16, 'Stip')])]);
const F10individual: Frame = { ...F10, pathStyle: [{ formationId: F10.formations[1].id, mode: 'individual' }] };
const starIndividual: Frame = { ...starTurn, pathStyle: [{ formationId: star.id, mode: 'individual', turn: { pivot: 'center', angle: 180 } }] };

const pairs: [string, Frame, Frame | null][] = [
  ['Bild 9 → 10', F9, F10], ['Bild 10 → 11', F10, F11], ['Bild 10 Einzelwege', F10individual, F11], ['Bild 11 → 12', F11, F12],
  ['Bild 12 → 13', F12, F13], ['Bild 13 (letztes)', F13, null], ['Stern, halbe Drehung', starTurn, starNext],
  ['Stern, Einzelbögen', starIndividual, starNext], ['Stern ohne Drehung', starPlain, assignShortest(starPlain, starNext)],
  ['Schwenk ¼', swing, swingNext], ['Bild 14 → 15 (Teile)', S14, S15], ['Bild 15 (Alle)', S15, null],
];

describe('gleiches Verhalten wie design-system/stage.js', () => {
  it.each(pairs)('%s: Positionen', (_, f) => {
    const mine = positions(f), ref = GM.positions(toRef(f));
    expect(Object.keys(mine).sort()).toEqual(Object.keys(ref).sort());
    for (const k of Object.keys(mine)) {
      expect(mine[k].x).toBeCloseTo(ref[k].x, 9);
      expect(mine[k].y).toBeCloseTo(ref[k].y, 9);
      expect(mine[k].fi).toBe(ref[k].fi);
    }
  });

  it.each(pairs.filter((p) => p[2]))('%s: Zuordnung auf kürzeste Wege', (_, f, next) => {
    const raw = { ...next!, formations: next!.formations.map((x) => ({ ...x, members: [...x.members].reverse() })) };
    const mine = assignShortest(f, raw), ref = GM.assignShortest(toRef(f), toRef(raw));
    expect(mine.formations.map((x) => x.members)).toEqual(ref.formations.map((x: Any) => x.members));
  });

  it.each(pairs)('%s: Laufwege', (_, f, next) => {
    const svg = GM.renderStage(refDance, toRef(f), next ? toRef(next) : null, {});
    expect(framePaths(f, next, PAD)).toEqual(refPaths(svg));
  });

  it.each(pairs)('%s: Zählweise und Aktionstext', (_, f) => {
    const ref = toRef(f);
    expect(countSegments(f)).toEqual(GM.countSegments(ref));
    expect(countLabel(f)).toBe(GM.countLabel(ref));
    f.tracks.forEach((t, i) => expect(trackText(t)).toBe(GM.trackText(ref.tracks[i])));
  });

  it.each(pairs)('%s: Prüfregeln Summe und Laufweg', (_, f, next) => {
    const pick = (w: { track: number | null; kind: string }[]) => w.filter((x) => x.kind === 'sum' || x.kind === 'move').map((x) => `${x.track}:${x.kind}`);
    expect(pick(warnings(f, next, groups))).toEqual(pick(GM.warnings(toRef(f), next ? toRef(next) : null)));
  });

  it('Drehung: gleiche Formation nach rotateFormation', () => {
    for (const [x, angle, pivot] of [[star, 180, 'center'], [swingLine, 90, 'start'], [F12.formations[0], -45, 'end'], [F10.formations[2], 30, { x: 0.3, y: 0.6 }]] as const) {
      const mine = rotateFormation(x, angle, pivot);
      const ref = GM.rotateFormation(toRef(frame(8, [x], [])).formations[0], angle, pivot);
      expect(mine.params.cx).toBeCloseTo(ref.cx, 12);
      expect(mine.params.cy).toBeCloseTo(ref.cy, 12);
      expect(mine.params.rotation).toBe(ref.rotation);
    }
  });

  it('die Beispiele decken Drehung, Schwenk, Einzelwege und Wiederholung ab', () => {
    const all = pairs.flatMap(([, f, n]) => framePaths(f, n));
    expect(all.some((p) => p.kind === 'label' && p.text === '½')).toBe(true);
    expect(all.some((p) => p.kind === 'label' && p.text === '¼')).toBe(true);
    expect(all.some((p) => p.kind === 'path' && p.individual)).toBe(true);
    expect(trackText(S14.tracks[0])).toBe('‖: 2 GewSchw · 2 Klopf :‖ ×2 · 8 Marsch zur Mitte');
  });
});
