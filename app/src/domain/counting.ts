/* Zählweise (Konzept 5.4). Referenz: countSegments/countLabel in design-system/stage.js. */
import type { Frame } from './types';
import { flat } from './tracks';

export function eights(n: number): number[] {
  const out: number[] = [];
  for (let r = n; r > 0; r -= 8) out.push(Math.min(8, r));
  return out;
}

/**
 * Längen der Zählabschnitte, z. B. [8, 8], [16] oder [4, 12]. Eine eigene Aufteilung
 * (countSplit) gewinnt. Automatisch: Achter. Beginnt in allen Spuren zur selben Zeit ein
 * gleich langer Baustein mit mehr als 8 Zeiten, wird er ab seinem Beginn durchgezählt.
 */
export function countSegments(frame: Pick<Frame, 'counts' | 'tracks' | 'countSplit'>): number[] {
  if (frame.countSplit) return frame.countSplit.slice();
  const longs = frame.tracks.map((t) => {
    let pos = 0;
    let hit: { start: number; len: number } | null = null;
    for (const b of flat(t.blocks)) {
      if (!hit && b.counts > 8) hit = { start: pos, len: b.counts };
      pos += b.counts;
    }
    return hit;
  });
  const l = longs[0];
  const same = !!l && longs.every((x) => x && x.start === l.start && x.len === l.len);
  if (!same || !l) return eights(frame.counts);
  return [...eights(l.start), l.len, ...eights(frame.counts - l.start - l.len)];
}

/** Zählweise für den Bild-Kopf, leer wenn in Achtern gezählt wird: „1–16“, „4 + 12“. */
export function countLabel(frame: Pick<Frame, 'counts' | 'tracks' | 'countSplit'>): string {
  const segs = countSegments(frame);
  if (segs.join() === eights(frame.counts).join()) return '';
  return segs.length === 1 ? `1–${segs[0]}` : segs.join(' + ');
}
