/* Gruppensymbole als SVG. Gruppen unterscheiden sich über die Form, nicht über Farbe.
   Referenz: symbol/symbolIcon in design-system/stage.js. */
import type { SymbolShape } from '../domain/types';
import { R } from '../domain/geometry';

export function DancerSymbol({ shape, x, y, r = R }: { shape: SymbolShape; x: number; y: number; r?: number }) {
  if (typeof shape === 'object') {
    return <text className="gm-dancer--letter" x={x} y={y} textAnchor="middle" dominantBaseline="central">{shape.letter || '?'}</text>;
  }
  const t = `translate(${x} ${y})`;
  switch (shape) {
    case 'dot':
      return <circle className="gm-dancer--dot" cx={x} cy={y} r={r} />;
    case 'ring':
      return <circle className="gm-dancer--ring" cx={x} cy={y} r={r - 1.1} />;
    case 'cross': {
      const c = r * 0.82;
      return <path className="gm-dancer--cross" transform={t} d={`M${-c} ${-c}L${c} ${c}M${c} ${-c}L${-c} ${c}`} />;
    }
    case 'triangle':
      return <path className="gm-dancer--triangle" transform={t} d={`M0 ${-r * 1.15}L${r * 1.05} ${r * 0.8}H${-r * 1.05}Z`} />;
    case 'square': {
      const s = r * 0.88;
      return <rect className="gm-dancer--square" x={x - s} y={y - s} width={2 * s} height={2 * s} />;
    }
    case 'diamond': {
      const d = r * 1.25;
      return <path className="gm-dancer--diamond" transform={t} d={`M0 ${-d}L${d} 0L0 ${d}L${-d} 0Z`} />;
    }
  }
}

/** Kleines Symbol für Aktionszeilen, Legenden und Listen. */
export function SymbolIcon({ shape, label }: { shape: SymbolShape; label?: string }) {
  return (
    <svg viewBox="-6 -6 12 12" role="img" aria-label={label ?? ''} className="gm-symbol">
      <DancerSymbol shape={shape} x={0} y={0} />
    </svg>
  );
}
