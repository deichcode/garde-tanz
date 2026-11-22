/* Bühne als SVG: fest 3:2, Publikum unten, Laufwege ins nächste Bild.
   Referenz: renderStage in design-system/stage.js. */
import { useId } from 'react';
import type { Dance, Frame } from '../domain/types';
import { H, layoutFormation, positions, R, W } from '../domain/geometry';
import { framePaths } from '../domain/paths';
import { DancerSymbol } from './Symbol';

const PAD = 6;

type Layout = Pick<Frame, 'formations' | 'pathStyle'>;

interface StageProps {
  dance: Pick<Dance, 'groups'>;
  frame: Layout;
  next?: Pick<Frame, 'formations'> | null;
  label?: boolean; // „PUBLIKUM“ unter der Vorderkante
  title: string;
  selected?: number; // Index der ausgewählten Formation
}

export function Stage({ dance, frame, next, label, title, selected }: StageProps) {
  const marker = 'gm' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const vbH = label ? 226 : 212;
  const sym = Object.fromEntries(dance.groups.map((g) => [g.id, g.symbol]));
  const P = positions(frame);
  const paths = framePaths(frame, next, PAD);
  return (
    <svg className="gm-stage" viewBox={`0 0 ${W + 2 * PAD} ${vbH}`} role="img" aria-label={title}>
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
          <path className="gm-path__head" d="M0 0L10 5L0 10Z" />
        </marker>
      </defs>
      <rect className="gm-stage__floor" x={PAD} y={PAD} width={W} height={H} />
      <line className="gm-stage__front" x1={PAD} y1={PAD + H} x2={PAD + W} y2={PAD + H} />
      {label && <text className="gm-stage__label" x={PAD + W / 2} y={vbH - 3} textAnchor="middle">PUBLIKUM</text>}
      <g>
        {paths.map((p, i) =>
          p.kind === 'path' ? (
            <path key={i} className={'gm-path' + (p.individual ? ' gm-path--individual' : '')} markerEnd={`url(#${marker})`} d={p.d} />
          ) : p.kind === 'label' ? (
            <text key={i} className="gm-path__label" x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central">{p.text}</text>
          ) : (
            <circle key={i} className="gm-path__pivot" cx={p.x} cy={p.y} r={2.4} />
          ),
        )}
        {Object.entries(P).map(([k, p]) => (
          <DancerSymbol key={k} shape={sym[k.split(':')[0]] ?? 'dot'} x={p.x + PAD} y={p.y + PAD} />
        ))}
      </g>
      {selected != null && frame.formations[selected] && <Selection frame={frame} index={selected} />}
    </svg>
  );
}

/** Ausgewählte Formation: gestrichelter Rahmen in Signal-Blau mit Anfassern. */
function Selection({ frame, index }: { frame: Layout; index: number }) {
  const pts = layoutFormation(frame.formations[index]);
  const m = R + 5;
  const x0 = Math.min(...pts.map((p) => p.x)) + PAD - m;
  const y0 = Math.min(...pts.map((p) => p.y)) + PAD - m;
  const x1 = Math.max(...pts.map((p) => p.x)) + PAD + m;
  const y1 = Math.max(...pts.map((p) => p.y)) + PAD + m;
  const mx = (x0 + x1) / 2;
  const h = (x: number, y: number) => <rect className="gm-sel__handle" x={x - 3.5} y={y - 3.5} width={7} height={7} />;
  return (
    <g>
      <rect className="gm-sel" x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
      <line className="gm-sel" x1={mx} y1={y0} x2={mx} y2={y0 - 12} />
      <circle className="gm-sel__handle" cx={mx} cy={y0 - 14} r={4} />
      {h(x0, y0)}{h(x1, y0)}{h(x0, y1)}{h(x1, y1)}
    </g>
  );
}
