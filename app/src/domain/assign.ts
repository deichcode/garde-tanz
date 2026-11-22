/* Zuordnung: Wer läuft wohin? Referenz: assignShortest in design-system/stage.js.
   Ordnet die Tänzer jeder Gruppe den Plätzen im nächsten Bild so zu, dass die Summe der
   Wege minimal ist. Minimale Summe gerader Wege heißt auch: keine Kreuzungen innerhalb
   der Gruppe. Bis 8 Tänzer pro Gruppe Durchprobieren wie im Referenz-Code (gleiches Ergebnis
   auch bei Gleichstand), darüber die Ungarische Methode (Gruppen bis 12 und mehr).
   Ausnahme Drehung/Schwenk: Gedrehte Formationen behalten ihre Reihenfolge, sonst würde
   eine halbe Stern-Drehung als „niemand läuft“ abgebildet. */
import type { DancerRef, Frame } from './types';
import { layoutFormation, positions } from './geometry';
import { styleFor } from './paths';

type Layout = Pick<Frame, 'formations' | 'pathStyle'>;

export function assignShortest<T extends Pick<Frame, 'formations'>>(prev: Layout, next: T): T {
  const P = positions(prev);
  const out: T = structuredClone(next);
  const locked = new Set<DancerRef>();
  for (const fm of prev.formations) if (styleFor(prev, fm)?.turn) fm.members.forEach((m) => locked.add(m));

  const slotsByGroup = new Map<string, { fi: number; si: number; x: number; y: number; key: DancerRef }[]>();
  out.formations.forEach((fm, fi) => {
    layoutFormation(fm).forEach((p, si) => {
      const g = fm.members[si].split(':')[0];
      slotsByGroup.set(g, [...(slotsByGroup.get(g) ?? []), { fi, si, x: p.x, y: p.y, key: fm.members[si] }]);
    });
  });
  for (const all of slotsByGroup.values()) {
    const slots = all.filter((s) => !locked.has(s.key));
    const dancers = slots.map((s) => s.key).filter((k) => P[k]);
    if (dancers.length !== slots.length) continue;
    if (slots.length > 8) {
      const cost = dancers.map((d) => slots.map((s) => Math.hypot(P[d].x - s.x, P[d].y - s.y)));
      const slotOf = hungarian(cost); // Tänzer i → Platz slotOf[i]
      slotOf.forEach((si, di) => {
        out.formations[slots[si].fi].members[slots[si].si] = dancers[di];
      });
      continue;
    }
    let best = dancers;
    let bestCost = Infinity;
    permute(dancers, (perm) => {
      let c = 0;
      for (let i = 0; i < perm.length; i++) {
        c += Math.hypot(P[perm[i]].x - slots[i].x, P[perm[i]].y - slots[i].y);
        if (c >= bestCost) return;
      }
      bestCost = c;
      best = perm.slice();
    });
    slots.forEach((s, i) => {
      out.formations[s.fi].members[s.si] = best[i];
    });
  }
  return out;
}

/** Heap-Algorithmus: ruft cb mit jeder Permutation auf (dasselbe Array, nicht verändern). */
export function permute<T>(arr: T[], cb: (perm: T[]) => void): void {
  const a = arr.slice();
  const n = a.length;
  const c = new Array<number>(n).fill(0);
  cb(a);
  let i = 0;
  while (i < n) {
    if (c[i] < i) {
      const j = i % 2 ? c[i] : 0;
      [a[j], a[i]] = [a[i], a[j]];
      cb(a);
      c[i]++;
      i = 0;
    } else {
      c[i] = 0;
      i++;
    }
  }
}

/**
 * Ungarische Methode (Kuhn-Munkres mit Potentialen, O(n³)) für eine quadratische Kostenmatrix.
 * Liefert für jede Zeile die Spalte, sodass die Summe der Kosten minimal ist.
 */
export function hungarian(cost: number[][]): number[] {
  const n = cost.length;
  const INF = Number.POSITIVE_INFINITY;
  const u = new Array<number>(n + 1).fill(0);
  const v = new Array<number>(n + 1).fill(0);
  const p = new Array<number>(n + 1).fill(0); // Spalte j → Zeile p[j] (1-basiert)
  const way = new Array<number>(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array<number>(n + 1).fill(INF);
    const used = new Array<boolean>(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = INF;
      let j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }
        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }
  const rowToCol = new Array<number>(n).fill(-1);
  for (let j = 1; j <= n; j++) if (p[j]) rowToCol[p[j] - 1] = j - 1;
  return rowToCol;
}
