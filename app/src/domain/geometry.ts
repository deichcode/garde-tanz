/* Formen → Einzelpositionen, Drehung und Schwenk.
   Referenz: layoutFormation, positions, rotateFormation in design-system/stage.js.
   Gerechnet wird in Bühneneinheiten (Bühne 3:2 = 300 × 200), gespeichert normiert 0..1. */
import type { DancerRef, Formation, Frame, Pivot, Point } from './types';

export const W = 300;
export const H = 200;
/** Symbolradius ≈ 3 % der Bühnenbreite. */
export const R = 4.6;
/** Kleinere Bewegungen bekommen keinen Pfeil und zählen nicht als „läuft“. */
export const MIN_MOVE = 6;

export interface Pos {
  x: number;
  y: number;
}
export interface Slot extends Pos {
  key: DancerRef;
}
export interface Placed extends Pos {
  fi: number; // Index der Formation im Bild
}

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Einzelpositionen einer Formation in Bühneneinheiten, in der Reihenfolge der Mitglieder. */
export function layoutFormation(fm: Formation): Slot[] {
  const p = fm.params;
  const n = fm.members.length;
  const pts: [number, number][] = [];
  const cx = p.cx * W;
  const cy = p.cy * H;
  switch (fm.shape) {
    case 'line': {
      const L = (p.length || 0.6) * W;
      for (let i = 0; i < n; i++) pts.push([n === 1 ? 0 : (i / (n - 1) - 0.5) * L, 0]);
      break;
    }
    case 'block': {
      const rows = p.rows || 2;
      const cols = Math.ceil(n / rows);
      const BW = (p.length || 0.3) * W;
      const gy = (p.depth || 0.14) * H;
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols);
        const k = i % cols;
        const inRow = Math.min(cols, n - r * cols);
        const sx = cols > 1 ? BW / (cols - 1) : 0;
        pts.push([(k - (inRow - 1) / 2) * sx, (r - (rows - 1) / 2) * gy]);
      }
      break;
    }
    case 'circle': {
      const ra = (p.radius || 0.3) * H;
      for (let i = 0; i < n; i++) {
        const a = rad(-90 + (360 * i) / n);
        pts.push([Math.cos(a) * ra, Math.sin(a) * ra]);
      }
      break;
    }
    case 'arc': {
      // Bogen, Mitte zeigt zum Publikum
      const ra = (p.radius || 0.3) * H;
      const sp = p.spread || 120;
      for (let i = 0; i < n; i++) {
        const b = rad(90 - sp / 2 + (n === 1 ? sp / 2 : (sp * i) / (n - 1)));
        pts.push([Math.cos(b) * ra, Math.sin(b) * ra]);
      }
      break;
    }
    case 'wedge': {
      // Keil, Spitze zeigt zum Publikum
      const half = rad((p.spread || 70) / 2);
      const step = (p.spacing || 0.07) * W;
      for (let i = 0; i < n; i++) {
        const arm = Math.ceil(i / 2);
        const side = i % 2 ? -1 : 1;
        pts.push([side * Math.sin(half) * arm * step, -Math.cos(half) * arm * step]);
      }
      break;
    }
    case 'star': {
      // Stern: Strahlen aus der Mitte, Tänzer reihum auf die Strahlen verteilt
      const rays = p.rays || 4;
      const outer = (p.radius || 0.3) * H;
      const inner = (p.inner || 0.08) * H;
      const levels = Math.ceil(n / rays);
      for (let i = 0; i < n; i++) {
        const ray = i % rays;
        const lv = Math.floor(i / rays);
        const dist = levels > 1 ? inner + (lv * (outer - inner)) / (levels - 1) : outer;
        const a = rad(-90 + (360 * ray) / rays);
        pts.push([Math.cos(a) * dist, Math.sin(a) * dist]);
      }
      break;
    }
    case 'free':
      return fm.members.map((key, j) => {
        const q = p.points?.[j] ?? { x: p.cx, y: p.cy };
        return { key, x: q.x * W, y: q.y * H };
      });
  }
  const r = rad(p.rotation || 0);
  const cs = Math.cos(r);
  const sn = Math.sin(r);
  return pts.map(([x, y], j) => ({ key: fm.members[j], x: cx + x * cs - y * sn, y: cy + x * sn + y * cs }));
}

/** Position jedes Tänzers im Bild (Bühneneinheiten), einzeln verschobene Positionen gewinnen. */
export function positions(frame: Pick<Frame, 'formations'>): Record<DancerRef, Placed> {
  const map: Record<DancerRef, Placed> = {};
  frame.formations.forEach((fm, fi) => {
    for (const s of layoutFormation(fm)) {
      const o = fm.overrides?.[s.key];
      map[s.key] = { x: o ? o.x * W : s.x, y: o ? o.y * H : s.y, fi };
    }
  });
  return map;
}

export function centroid(list: Pos[]): Pos {
  let x = 0;
  let y = 0;
  for (const p of list) {
    x += p.x;
    y += p.y;
  }
  return { x: x / list.length, y: y / list.length };
}

/* --- Drehung und Schwenk ----------------------------------------------------
   Die ganze Formation dreht sich um den Drehpunkt: Jeder Tänzer läuft auf einem
   Kreisbogen um denselben Winkel mit. Nach einer halben Stern-Drehung steht jeder
   gegenüber, auch wenn das Bild danach gleich aussieht. */

export function pivotPoint(fm: Formation, pivot: Pivot | undefined): Pos {
  if (pivot && typeof pivot === 'object') return { x: pivot.x * W, y: pivot.y * H };
  const pts = layoutFormation(fm);
  if (pivot === 'start') return { x: pts[0].x, y: pts[0].y };
  if (pivot === 'end') return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y };
  return { x: fm.params.cx * W, y: fm.params.cy * H };
}

export function rotatePoint(p: Pos, c: Pos, deg: number): Pos {
  const a = rad(deg);
  const cs = Math.cos(a);
  const sn = Math.sin(a);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * cs - dy * sn, y: c.y + dx * sn + dy * cs };
}

const toNorm = (p: Pos): Point => ({ x: p.x / W, y: p.y / H });
const fromNorm = (p: Point): Pos => ({ x: p.x * W, y: p.y * H });

/** Formation nach der Drehung: dieselben Tänzer in derselben Reihenfolge, Lage und Winkel gedreht. */
export function rotateFormation(fm: Formation, angle: number, pivot: Pivot): Formation {
  const c = pivotPoint(fm, pivot);
  const out: Formation = structuredClone(fm);
  const m = toNorm(rotatePoint({ x: fm.params.cx * W, y: fm.params.cy * H }, c, angle));
  out.params.cx = m.x;
  out.params.cy = m.y;
  out.params.rotation = (fm.params.rotation || 0) + angle;
  if (fm.params.points) out.params.points = fm.params.points.map((q) => toNorm(rotatePoint(fromNorm(q), c, angle)));
  for (const k of Object.keys(fm.overrides || {})) out.overrides[k] = toNorm(rotatePoint(fromNorm(fm.overrides[k]), c, angle));
  return out;
}

/** Winkelangabe am Bogenpfeil: ¼, ½, ¾, 1, sonst Grad. */
export function angleLabel(deg: number): string {
  const a = Math.abs(deg);
  return ({ 90: '¼', 180: '½', 270: '¾', 360: '1' } as Record<number, string>)[a] ?? `${a}°`;
}
