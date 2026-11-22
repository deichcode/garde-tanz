import { describe, expect, it } from 'vitest';
import { defaultGroups, firstFrame, newDance, nextFrame, seedRoleActions, seedRoles } from './factory';
import { warnings } from './warnings';
import { normalizeTerm, roleActionId } from './terms';
import { eights } from './counting';
import { isAll, trackDancers } from './tracks';
import { positions } from './geometry';
import { assignShortest } from './assign';
import { hungarian, permute } from './assign';

describe('Anlegen', () => {
  it('Vorgabe der Gruppen: ● Grenadiere, ○ Mariechen, ✕ Reserve', () => {
    expect(defaultGroups().map((g) => [g.symbol, g.name, g.roleId])).toEqual([
      ['dot', 'Grenadiere', 'grenadiere'], ['ring', 'Mariechen', 'mariechen'], ['cross', 'Reserve', 'reserve'],
    ]);
  });

  it('erstes Bild: eine Spur pro Gruppe, jeder Tänzer genau einmal aufgestellt', () => {
    const groups = defaultGroups();
    const f = firstFrame(groups, 'u1', '2026-11-22T10:00:00Z');
    expect(f.tracks.map((t) => t.groupIds)).toEqual(groups.map((g) => [g.id]));
    const keys = Object.keys(positions(f));
    expect(keys).toHaveLength(groups.reduce((s, g) => s + g.size, 0));
    expect(warnings(f, null, groups).map((w) => w.kind)).toEqual(['empty', 'empty', 'empty']);
  });

  it('neues Bild übernimmt Aufstellung und Spuraufteilung, Spuren sind leer', () => {
    const groups = defaultGroups();
    const f1 = firstFrame(groups, 'u1', 'jetzt');
    f1.tracks = [
      { groupIds: ['g1'], members: ['g1:0', 'g1:1', 'g1:2'], label: 'linke Reihe', blocks: [{ counts: 8, term: 'Präs', moves: false }] },
      { groupIds: ['g1'], members: ['g1:3', 'g1:4', 'g1:5'], label: 'rechte Reihe', blocks: [{ counts: 8, term: 'Fuß', moves: false }] },
      { groupIds: ['g2', 'g3'], blocks: [{ counts: 8, term: 'Stip', moves: false }] },
    ];
    f1.note = 'nur im ersten Bild';
    const f2 = nextFrame(f1, 'u2', 'später');
    expect(f2.id).not.toBe(f1.id);
    expect(f2.counts).toBe(8);
    expect(f2.note).toBeUndefined();
    expect(f2.tracks).toEqual([
      { groupIds: ['g1'], members: ['g1:0', 'g1:1', 'g1:2'], label: 'linke Reihe', blocks: [] },
      { groupIds: ['g1'], members: ['g1:3', 'g1:4', 'g1:5'], label: 'rechte Reihe', blocks: [] },
      { groupIds: ['g2', 'g3'], blocks: [] },
    ]);
    expect(positions(f2)).toEqual(positions(f1));
    expect(f2.formations.map((x) => x.id)).not.toEqual(f1.formations.map((x) => x.id));
  });

  it('neuer Tanz beginnt mit einem Bild', () => {
    const { dance, frame } = newDance({ teamId: 't1', title: ' Gardetanz 2026/27 ', groups: defaultGroups(), by: 'u1', now: 'jetzt' });
    expect(dance.title).toBe('Gardetanz 2026/27');
    expect(dance.frameOrder).toEqual([frame.id]);
    expect(dance.stageAspect).toBe(1.5);
  });

  it('Start-Kataloge: Schlüssel pro Rolle eindeutig', () => {
    const ids = seedRoleActions().map((a) => roleActionId(a.roleId, a.label));
    expect(new Set(ids).size).toBe(ids.length);
    expect(seedRoles().map((r) => r.id).sort()).toEqual(['grenadiere', 'mariechen', 'reserve']);
    expect(seedRoleActions().find((a) => a.label === 'MrschSt')).toMatchObject({ roleId: '*', moves: false, key: 'mrschst' });
  });
});

describe('Prüfregeln', () => {
  const groups = defaultGroups();
  const base = () => firstFrame(groups, 'u', 'jetzt');

  it('Summe der Zeiten sagt, was fehlt oder zu viel ist', () => {
    const f = base();
    f.tracks[0].blocks = [{ counts: 6, term: 'Präs', moves: false }];
    f.tracks[1].blocks = [{ counts: 10, term: 'Hüpf', moves: true }];
    f.tracks[2].blocks = [{ counts: 8, term: 'BeinSchw', moves: false }];
    expect(warnings(f, null, groups).map((w) => w.text)).toEqual(['6 von 8 Zeiten · 2 fehlen', '10 von 8 Zeiten · 2 zu viel']);
  });

  it('bewegende Aktion ohne Laufweg: Bild teilen?', () => {
    const f = base();
    f.tracks.forEach((t) => (t.blocks = [{ counts: 8, term: 'Marsch', moves: true }]));
    const same = nextFrame(f, 'u', 'jetzt');
    expect(warnings(f, same, groups).map((w) => w.text)).toEqual(Array(3).fill('8 Marsch, aber kein Laufweg. Bild teilen?'));
  });

  it('Tänzer ohne Spur oder in zwei Spuren', () => {
    const f = base();
    f.tracks.forEach((t) => (t.blocks = [{ counts: 8, term: 'Stip', moves: false }]));
    f.tracks[2] = { groupIds: ['g3'], members: ['g3:0', 'g3:1'], blocks: [{ counts: 8, term: 'Stip', moves: false }] };
    f.tracks.push({ groupIds: ['g1'], members: ['g1:0'], blocks: [{ counts: 8, term: 'Präs', moves: false }] });
    expect(warnings(f, null, groups).filter((w) => w.track === null).map((w) => w.text)).toEqual([
      '1 Tänzer von Grenadiere ist in zwei Spuren', '2 Tänzer von Reserve haben keine Spur',
    ]);
  });

  it('halbe Stern-Drehung: jeder läuft, also braucht es eine Lauf-Aktion', () => {
    const f = base();
    f.formations = [{ id: 's', shape: 'star', params: { cx: 0.5, cy: 0.5, rotation: 0, radius: 0.3, rays: 4 }, members: ['g1:0', 'g2:0', 'g1:1', 'g2:1'], overrides: {} }];
    const g = [{ ...groups[0], size: 2 }, { ...groups[1], size: 2 }];
    f.tracks = [{ groupIds: ['g1', 'g2'], blocks: [{ counts: 8, term: 'Stip', moves: false }] }];
    const next = { formations: [{ ...f.formations[0], id: 's2', params: { ...f.formations[0].params, rotation: 180 } }] };
    const turned = { ...f, pathStyle: [{ formationId: 's', turn: { pivot: 'center' as const, angle: 180 } }] };
    expect(warnings(turned, assignShortest(turned, next), g).map((w) => w.kind)).toEqual(['move']);
    // ohne Drehung lässt die Zuordnung jeden stehen
    expect(warnings(f, assignShortest(f, next), g).map((w) => w.kind)).toEqual([]);
  });
});

describe('Hilfen', () => {
  it('Begriffe normalisieren', () => {
    expect(normalizeTerm('  1/4   Dreh ')).toBe('1/4 dreh');
    expect(normalizeTerm('SCHMEISS')).toBe('schmeiss');
    expect(roleActionId('*', '1/4 Dreh')).toBe('*~1%2F4%20dreh');
  });
  it('Achter', () => {
    expect(eights(16)).toEqual([8, 8]);
    expect(eights(12)).toEqual([8, 4]);
    expect(eights(0)).toEqual([]);
  });
  it('„Alle“ und Teile', () => {
    const groups = defaultGroups();
    expect(isAll({ groupIds: ['g1', 'g2', 'g3'], blocks: [] }, groups)).toBe(true);
    expect(isAll({ groupIds: ['g1', 'g2'], blocks: [] }, groups)).toBe(false);
    expect(trackDancers({ groupIds: ['g3'], blocks: [] }, { groups })).toEqual(['g3:0', 'g3:1', 'g3:2', 'g3:3']);
  });
  it('Permutationen vollständig', () => {
    const seen = new Set<string>();
    permute([1, 2, 3, 4], (p) => seen.add(p.join()));
    expect(seen.size).toBe(24);
  });
});

describe('Zuordnung für große Gruppen', () => {
  const total = (cost: number[][], a: number[]) => a.reduce((sum, c, r) => sum + cost[r][c], 0);
  const brute = (cost: number[][]) => {
    let best = Infinity;
    permute(cost.map((_, i) => i), (perm) => (best = Math.min(best, total(cost, perm))));
    return best;
  };
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  it('Ungarische Methode findet das Minimum wie Durchprobieren', () => {
    for (let n = 1; n <= 8; n++) {
      for (let k = 0; k < 5; k++) {
        const cost = Array.from({ length: n }, () => Array.from({ length: n }, () => Math.round(rnd() * 100)));
        const a = hungarian(cost);
        expect(new Set(a).size).toBe(n);
        expect(total(cost, a)).toBeCloseTo(brute(cost), 9);
      }
    }
  });

  it('12 Grenadiere: eine Linie wird zur gespiegelten Linie, keiner läuft quer', () => {
    const members = Array.from({ length: 12 }, (_, i) => `g1:${i}`);
    const prev = { formations: [{ id: 'a', shape: 'line' as const, params: { cx: 0.5, cy: 0.3, rotation: 0, length: 0.8 }, members, overrides: {} }], pathStyle: [] };
    const next = { formations: [{ id: 'b', shape: 'line' as const, params: { cx: 0.5, cy: 0.7, rotation: 0, length: 0.8 }, members: [...members].reverse(), overrides: {} }] };
    // jeder läuft geradeaus nach vorne: gleiche Reihenfolge wie vorher
    expect(assignShortest(prev, next).formations[0].members).toEqual(members);
  });
});
