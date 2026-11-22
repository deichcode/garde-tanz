/* Tanz: Seitenansicht 2 × 2 wie auf Papier, schmal als Liste. M1: Bilder anfügen, Zeiten und
   Notiz ändern (für den Sync-Test). Formationen und Aktionen schreiben folgt mit M2. */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dance, Frame, Id, Trainer } from '../domain/types';
import { warnings } from '../domain/warnings';
import { useRepo, useWatch } from '../state';
import { Link } from '../router';
import { Button, Stepper } from '../ui/controls';
import { FrameCard, Sheet, TrackWho } from '../ui/FrameCard';
import { Icon } from '../ui/Icon';
import { ago, dateDE } from '../util';

const PER_PAGE = 4;

function useWide(min = 880) {
  const q = `(min-width: ${min}px)`;
  const [wide, setWide] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [q]);
  return wide;
}

export function DanceView({ id }: { id: Id }) {
  const dances = useWatch<Dance[]>((r, cb) => r.watchDances(cb), []);
  const frameMap = useWatch<Record<Id, Frame>>((r, cb) => r.watchFrames(id, cb), [id]);
  const trainers = useWatch<Record<Id, Trainer>>((r, cb) => r.watchTrainers(cb), []);
  const dance = dances?.find((d) => d.id === id);

  if (!dances || !frameMap) return <p className="app-loading">Lädt …</p>;
  if (!dance) {
    return (
      <div className="app-page">
        <p className="app-empty">Diesen Tanz gibt es nicht (mehr). <Link to="/">Zur Übersicht</Link></p>
      </div>
    );
  }
  return <DanceEditor dance={dance} frameMap={frameMap} trainers={trainers ?? {}} />;
}

function DanceEditor({ dance, frameMap, trainers }: { dance: Dance; frameMap: Record<Id, Frame>; trainers: Record<Id, Trainer> }) {
  const repo = useRepo();
  const wide = useWide();
  // Reihenfolge aus dem Tanz; Bilder, die (noch) nicht auf dem Gerät sind, fehlen kurz
  const frames = useMemo(() => dance.frameOrder.map((fid) => frameMap[fid]).filter(Boolean), [dance.frameOrder, frameMap]);
  const numOf = (f: Frame) => dance.frameOrder.indexOf(f.id) + 1;
  const nextOf = (f: Frame) => frameMap[dance.frameOrder[dance.frameOrder.indexOf(f.id) + 1]] ?? null;
  const pages = Math.max(1, Math.ceil(frames.length / PER_PAGE));
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<Id | null>(null);
  const active = (activeId && frameMap[activeId]) || null;
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const shown = frames.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const last = frames[frames.length - 1];
  const append = () => {
    if (!last) return;
    const nid = repo.appendFrame(dance, last);
    setActiveId(nid);
    setPage(Math.ceil((frames.length + 1) / PER_PAGE));
  };
  const select = (fid: Id) => setActiveId((cur) => (cur === fid ? null : fid));

  return (
    <div className="app-editor">
      <div className="app-toolbar">
        <Link to="/" className="gm-btn gm-btn--ghost"><Icon name="prev" />Übersicht</Link>
        <h1 className="app-toolbar__title">{dance.title}</h1>
        <div className="app-toolbar__tools">
          {wide && pages > 1 && (
            <div className="app-pager" role="group" aria-label="Seiten">
              {page > 1 && <Button variant="ghost" icon="prev" onClick={() => setPage(page - 1)}>Seite {page - 1}</Button>}
              <span className="app-pager__now" aria-current="page">Seite {page} / {pages}</span>
              {page < pages && <Button variant="ghost" onClick={() => setPage(page + 1)}>Seite {page + 1}<Icon name="next" /></Button>}
            </div>
          )}
          <Button variant="secondary" icon="print" onClick={() => window.print()}>Drucken</Button>
          <Button variant="primary" icon="plus" onClick={append} disabled={!last}>Neues Bild</Button>
        </div>
      </div>
      <div className={'app-editor__body' + (active ? ' has-inspector' : '')}>
        <div className="app-editor__pages">
          {wide ? (
            <div className="app-sheetbox">
              <Sheet dance={dance} frames={shown} nums={shown.map(numOf)} nextOf={nextOf} page={page} pages={pages}
                activeId={activeId} onSelect={select} stand={dateDE(dance.updatedAt)} />
            </div>
          ) : (
            <div className="app-framelist">
              {frames.map((f) => (
                <FrameCard key={f.id} dance={dance} frame={f} next={nextOf(f)} num={numOf(f)} active={f.id === activeId} onSelect={() => select(f.id)} />
              ))}
            </div>
          )}
          {/* Druck: alle Seiten, unabhängig von der Ansicht */}
          <div className="app-print" aria-hidden="true">
            {Array.from({ length: pages }, (_, p) => {
              const fs = frames.slice(p * PER_PAGE, (p + 1) * PER_PAGE);
              return <Sheet key={p} dance={dance} frames={fs} nums={fs.map(numOf)} nextOf={nextOf} page={p + 1} pages={pages} stand={dateDE(dance.updatedAt)} />;
            })}
          </div>
        </div>
        {active && (
          <Inspector key={active.id} dance={dance} frame={active} next={nextOf(active)} num={numOf(active)} trainers={trainers} onClose={() => setActiveId(null)} />
        )}
      </div>
    </div>
  );
}

function Inspector({ dance, frame, next, num, trainers, onClose }: {
  dance: Dance; frame: Frame; next: Frame | null; num: number; trainers: Record<Id, Trainer>; onClose: () => void;
}) {
  const repo = useRepo();
  const [note, setNote] = useState(frame.note ?? '');
  const ref = useRef<HTMLElement>(null);
  // Schmal steht der Inspektor unter den Bildern: beim Öffnen dorthin scrollen
  useEffect(() => {
    if (!window.matchMedia('(min-width: 1200px)').matches) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  // Änderungen von anderen Geräten übernehmen, solange hier nicht getippt wird
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setNote(frame.note ?? '');
  }, [frame.note, editing]);
  const saveNote = () => {
    setEditing(false);
    if (note.trim() !== (frame.note ?? '')) repo.updateFrame(dance.id, frame.id, { note: note.trim() });
  };
  const warns = warnings(frame, next, dance.groups);
  const who = trainers[frame.updatedBy]?.name;
  const remove = () => {
    if (dance.frameOrder.length <= 1) return;
    if (confirm(`Bild ${num} löschen? Das lässt sich nicht rückgängig machen.`)) {
      repo.deleteFrame(dance, frame.id);
      onClose();
    }
  };
  return (
    <aside ref={ref} className="app-inspector" aria-label={`Bild ${num} bearbeiten`}>
      <div className="app-inspector__head">
        <h2>Bild {num}</h2>
        <Button variant="ghost" onClick={onClose}>Schließen</Button>
      </div>
      <p className="app-hint">Geändert {ago(frame.updatedAt)}{who ? ` von ${who}` : ''}</p>
      <div className="app-field">
        <span>Zeiten</span>
        <Stepper label={`Zeiten von Bild ${num}`} value={frame.counts} min={1} max={64}
          onChange={(counts) => repo.updateFrame(dance.id, frame.id, { counts, ...(frame.countSplit ? { countSplit: null } : {}) })} />
      </div>
      <label className="app-field">
        <span>Notiz</span>
        <textarea className="gm-field" rows={3} value={note} placeholder="z. B. Hintere Reihe kommt zu spät"
          onFocus={() => setEditing(true)} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} />
      </label>
      {warns.length > 0 && (
        <div className="app-field">
          <span>Hinweise</span>
          <ul className="app-warnings">
            {warns.map((w, i) => (
              <li key={i}>
                <Icon name="warn" />
                {w.track != null && <span className="gm-track__who"><TrackWho dance={dance} track={frame.tracks[w.track]} /></span>}
                {w.text}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="app-hint">Formationen und Aktionen schreiben kommt mit dem nächsten Meilenstein.</p>
      <Button variant="danger" icon="trash" onClick={remove} disabled={dance.frameOrder.length <= 1}>Bild {num} löschen</Button>
    </aside>
  );
}
