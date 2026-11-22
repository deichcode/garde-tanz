/* Laufweg-Automatik ins nächste Bild. Referenz: paths/turnPaths in design-system/stage.js.
   Stufe 1: ein Pfeil pro Formation bzw. Gruppenverbund und Ziel-Formation.
   Stufe 2: Verbund trennt sich → ein Pfeil pro Gruppe.
   Stufe 3: Gruppe formiert sich am Platz um → Einzelwege.
   Drehung/Schwenk: Bogenpfeil um den Drehpunkt statt gerader Wege. */
import type { DancerRef, Formation, Frame, PathStyle, Turn } from './types';
import { centroid, H, MIN_MOVE, pivotPoint, positions, R, W, type Placed, type Pos } from './geometry';
import { angleLabel } from './geometry';

export type PathShape =
  | { kind: 'path'; d: string; individual: boolean }
  | { kind: 'label'; x: number; y: number; text: string }
  | { kind: 'pivot'; x: number; y: number };

/** Zahlen wie im Referenz-Renderer auf eine Nachkommastelle. */
export const f = (n: number) => Math.round(n * 10) / 10;

export function styleFor(frame: Pick<Frame, 'pathStyle'>, fm: Formation): PathStyle | undefined {
  return frame.pathStyle?.find((s) => s.formationId === fm.id);
}

function trim(p: Pos, toward: Pos, d: number): Pos {
  const dx = toward.x - p.x;
  const dy = toward.y - p.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / l) * d, y: p.y + (dy / l) * d };
}

function arrow(a: Pos, b: Pos, bend: PathStyle['bend'], individual: boolean, o: number): PathShape[] {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  if (len < MIN_MOVE) return [];
  const mx = (a.x + b.x) / 2 + (bend ? bend.dx * W : 0);
  const my = (a.y + b.y) / 2 + (bend ? bend.dy * H : 0);
  const s = trim(a, { x: mx, y: my }, R + 3);
  const e = trim(b, { x: mx, y: my }, R + 4);
  const d = `M${f(s.x + o)} ${f(s.y + o)}Q${f(mx + o)} ${f(my + o)} ${f(e.x + o)} ${f(e.y + o)}`;
  return [{ kind: 'path', d, individual }];
}

/** Kreisbogen um c mit Radius r von Winkel a0 nach a1 (Grad), in Stücken ≤ 179°. */
function arcD(c: Pos, r: number, a0: number, a1: number, o: number): string {
  const steps = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 179));
  let d = '';
  for (let s = 0; s <= steps; s++) {
    const a = ((a0 + ((a1 - a0) * s) / steps) * Math.PI) / 180;
    const x = f(c.x + Math.cos(a) * r + o);
    const y = f(c.y + Math.sin(a) * r + o);
    d += s === 0 ? `M${x} ${y}` : `A${f(r)} ${f(r)} 0 0 ${a1 > a0 ? 1 : 0} ${x} ${y}`;
  }
  return d;
}

function turnPaths(fm: Formation, turn: Turn, P: Record<DancerRef, Placed>, Q: Record<DancerRef, Placed>, individual: boolean, o: number): PathShape[] {
  const c = pivotPoint(fm, turn.pivot);
  const ang = turn.angle;
  const sg = ang < 0 ? -1 : 1;
  const out: PathShape[] = [];
  const deg = (p: Pos) => (Math.atan2(p.y - c.y, p.x - c.x) * 180) / Math.PI;
  const ms = fm.members.filter((m) => Q[m]);
  if (individual) {
    // Einzelbögen: jeder Tänzer auf seinem Kreisbogen
    for (const m of ms) {
      const r = Math.hypot(P[m].x - c.x, P[m].y - c.y);
      if (r < MIN_MOVE) continue;
      const tr = (((R + 3) / r) * 180) / Math.PI;
      out.push({ kind: 'path', individual: true, d: arcD(c, r, deg(P[m]) + sg * tr, deg(P[m]) + ang - sg * tr * 1.3, o) });
    }
  } else if (ms.length) {
    // ein Bogenpfeil: außen um die Formation (Drehung) bzw. entlang des freien Endes (Schwenk)
    const far = ms.reduce(
      (best, m) => {
        const r = Math.hypot(P[m].x - c.x, P[m].y - c.y);
        return r > best.r ? { m, r } : best;
      },
      { m: ms[0], r: 0 },
    );
    const centre = !turn.pivot || turn.pivot === 'center';
    const r = centre ? far.r + 11 : far.r;
    const tr = centre ? 3 : (((R + 3) / r) * 180) / Math.PI;
    const a0 = deg(P[far.m]);
    out.push({ kind: 'path', individual: false, d: arcD(c, r, a0 + sg * tr, a0 + ang - sg * tr, o) });
    const mid = ((a0 + ang / 2) * Math.PI) / 180;
    const lr = r + 10;
    out.push({ kind: 'label', x: f(c.x + Math.cos(mid) * lr + o), y: f(c.y + Math.sin(mid) * lr + o), text: angleLabel(ang) });
  }
  out.push({ kind: 'pivot', x: f(c.x + o), y: f(c.y + o) });
  return out;
}

/**
 * Laufwege von frame ins nächste Bild. o = Versatz (Rand der Bühne im SVG),
 * damit die Pfade 1:1 dem Referenz-Renderer entsprechen.
 */
export function framePaths(frame: Pick<Frame, 'formations' | 'pathStyle'>, next: Pick<Frame, 'formations'> | null | undefined, o = 0): PathShape[] {
  if (!next) return [];
  const P = positions(frame);
  const Q = positions(next);
  const out: PathShape[] = [];
  frame.formations.forEach((fm) => {
    const style = styleFor(frame, fm);
    const mode = style?.mode ?? 'auto';
    const bend = style?.bend;
    if (style?.turn) {
      out.push(...turnPaths(fm, style.turn, P, Q, mode === 'individual', o));
      return;
    }
    const single = (ms: DancerRef[]) => {
      for (const m of ms) out.push(...arrow(P[m], Q[m], bend, true, o));
    };
    const moving = fm.members.filter((m) => Q[m]);
    if (mode === 'individual') {
      single(moving);
      return;
    }
    // Sagt ein Pfeil vom Schwerpunkt zum Schwerpunkt etwas aus? Nicht, wenn sich der
    // Schwerpunkt kaum bewegt, die Einzelnen aber deutlich (Umformieren am Platz).
    const test = (ms: DancerRef[]) => {
      const a = centroid(ms.map((m) => P[m]));
      const b = centroid(ms.map((m) => Q[m]));
      const avg = ms.reduce((s, m) => s + Math.hypot(P[m].x - Q[m].x, P[m].y - Q[m].y), 0) / ms.length;
      return { a, b, ok: avg < MIN_MOVE * 2 || Math.hypot(b.x - a.x, b.y - a.y) >= 0.4 * avg };
    };
    const subsets = new Map<number, DancerRef[]>();
    for (const m of moving) {
      const list = subsets.get(Q[m].fi) ?? [];
      list.push(m);
      subsets.set(Q[m].fi, list);
    }
    // Reihenfolge wie im Referenz-Renderer: Ziel-Formationen aufsteigend
    for (const fi of [...subsets.keys()].sort((x, y) => x - y)) {
      const ms = subsets.get(fi)!;
      const r = test(ms);
      if (mode === 'group' || r.ok) {
        out.push(...arrow(r.a, r.b, bend, false, o));
        continue;
      }
      const byGroup = new Map<string, DancerRef[]>();
      for (const m of ms) {
        const g = m.split(':')[0];
        byGroup.set(g, [...(byGroup.get(g) ?? []), m]);
      }
      for (const g of byGroup.keys()) {
        const gm = byGroup.get(g)!;
        const r2 = test(gm);
        if (r2.ok) out.push(...arrow(r2.a, r2.b, bend, false, o));
        else single(gm);
      }
    }
  });
  return out;
}
