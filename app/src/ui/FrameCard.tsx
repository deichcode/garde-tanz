/* Bildkarte und Blatt (A4 quer, 2 × 2). Referenz: renderFrame in design-system/stage.js. */
import { Fragment, type ReactNode } from 'react';
import type { ActionBlock, Dance, Frame, Track } from '../domain/types';
import { countLabel } from '../domain/counting';
import { isAll, isRepeat, trackSum } from '../domain/tracks';
import { warnings } from '../domain/warnings';
import { Icon } from './Icon';
import { Stage } from './Stage';
import { SymbolIcon } from './Symbol';

/** Wer die Spur tanzt: „Alle“, Symbole eines Verbunds oder einer Gruppe, ggf. mit Teilname. */
export function TrackWho({ dance, track }: { dance: Pick<Dance, 'groups'>; track: Track }) {
  if (isAll(track, dance.groups)) return <span className="gm-track__label">Alle</span>;
  return (
    <>
      {track.groupIds.map((id) => {
        const g = dance.groups.find((x) => x.id === id);
        return g ? <SymbolIcon key={id} shape={g.symbol} label={g.name} /> : null;
      })}
      {track.label && <span className="gm-track__label">{track.label}</span>}
    </>
  );
}

function One({ b }: { b: ActionBlock }) {
  return (
    <>
      <b className="gm-track__n">{b.counts}</b> {b.term}
      {b.detail && <> <span className="gm-track__detail">{b.detail}</span></>}
    </>
  );
}

/** Aktionen wie auf Papier, die Anzahl Zeiten fett in Mono: „2 1/4 Dreh · 6 Marsch“. */
export function TrackText({ track }: { track: Track }) {
  const parts: ReactNode[] = track.blocks.map((b, i) =>
    isRepeat(b) ? (
      <Fragment key={i}>
        <span className="gm-repeat__mark">‖:</span>{' '}
        {b.blocks.map((x, j) => <Fragment key={j}>{j > 0 && ' · '}<One b={x} /></Fragment>)}{' '}
        <span className="gm-repeat__mark">:‖</span>
        <span className="gm-repeat__times"> ×{b.repeat}{b.mirrored ? ' gespiegelt' : ''}</span>
      </Fragment>
    ) : (
      <One key={i} b={b} />
    ),
  );
  return <>{parts.map((p, i) => <Fragment key={i}>{i > 0 && ' · '}{p}</Fragment>)}</>;
}

interface FrameCardProps {
  dance: Pick<Dance, 'groups'>;
  frame: Frame;
  next?: Frame | null;
  num: number;
  active?: boolean;
  song?: string; // Liedmarke, wenn hier ein Lied beginnt
  onSelect?: () => void;
}

export function FrameCard({ dance, frame, next, num, active, song, onSelect }: FrameCardProps) {
  const warns = warnings(frame, next, dance.groups);
  const label = countLabel(frame);
  return (
    <article className={'gm-frame' + (active ? ' is-active' : '')} aria-label={`Bild ${num}`}>
      {song && <p className="gm-frame__song">{song}</p>}
      <header className="gm-frame__head">
        {onSelect ? (
          <button type="button" className="gm-frame__select gm-frame__num" aria-pressed={!!active} aria-label={`Bild ${num} auswählen`} onClick={onSelect}>{num}</button>
        ) : (
          <span className="gm-frame__num">{num}</span>
        )}
        <span className="gm-frame__counts">{frame.counts} Zeiten{label && ` · ${label}`}</span>
        <span className="gm-frame__flags">
          {warns.length > 0 && (
            <span className="gm-badge gm-badge--warn" title={warns.map((w) => w.text).join('\n')}>
              <Icon name="warn" label="Offene Hinweise" />{warns.length}
            </span>
          )}
          {frame.note && (
            <span className="gm-badge gm-badge--neutral" title={frame.note}>
              <Icon name="note" label="Notiz" />
            </span>
          )}
        </span>
      </header>
      <div className="gm-frame__stage">
        <Stage dance={dance} frame={frame} next={next} title={`Bild ${num}`} />
      </div>
      <ul className="gm-frame__tracks">
        {frame.tracks.map((t, ti) => {
          const bad = warns.some((w) => w.track === ti && (w.kind === 'sum' || w.kind === 'empty'));
          return (
            <li key={ti} className={'gm-track' + (bad ? ' has-warning' : '')}>
              <span className="gm-track__who"><TrackWho dance={dance} track={t} /></span>
              <span className="gm-track__text">{t.blocks.length ? <TrackText track={t} /> : <span className="gm-track__empty">noch keine Aktion</span>}</span>
              <span className="gm-track__sum">{bad && t.blocks.length ? `${trackSum(t)}/${frame.counts}` : ''}</span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

/** Blatt: vier Bilder, Fußzeile mit Tanz, Legende, Stand und Seite. */
export function Sheet({ dance, frames, nums, nextOf, page, pages, activeId, onSelect, stand }: {
  dance: Dance; frames: Frame[]; nums: number[]; nextOf: (f: Frame) => Frame | null; page: number; pages: number;
  activeId?: string | null; onSelect?: (id: string) => void; stand: string;
}) {
  return (
    <div className="gm-sheet" role="region" aria-label={`Seite ${page} mit Bild ${nums[0]} bis ${nums[nums.length - 1]}`}>
      {frames.map((f, i) => (
        <FrameCard key={f.id} dance={dance} frame={f} next={nextOf(f)} num={nums[i]} active={f.id === activeId} onSelect={onSelect && (() => onSelect(f.id))} />
      ))}
      <div className="gm-sheet__foot">
        <span>{dance.title}</span>
        <span className="gm-sheet__legend">
          {dance.groups.map((g) => (
            <span key={g.id}><SymbolIcon shape={g.symbol} />{g.name}</span>
          ))}
        </span>
        <span>Stand {stand} · Seite {page} / {pages}</span>
      </div>
    </div>
  );
}
