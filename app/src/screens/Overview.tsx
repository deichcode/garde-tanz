/* Übersicht: Garden → Tänze, mit Offline-Status pro Tanz (Konzept 6.1, 7). */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Dance, Group, Id, Role, Team, Trainer } from '../domain/types';
import { defaultGroups, seedRoles } from '../domain/factory';
import { useApp, useRepo, useWatch } from '../state';
import { Link, navigate } from '../router';
import { Badge, Button, Stepper } from '../ui/controls';
import { SymbolIcon } from '../ui/Symbol';
import { ago } from '../util';

export function Overview() {
  const session = useApp((s) => s.session);
  const admin = session.state === 'signedIn' && session.user.admin;
  const teams = useWatch<Team[]>((r, cb) => r.watchTeams(cb), []);
  const dances = useWatch<Dance[]>((r, cb) => r.watchDances(cb), []);
  const counts = useWatch<Record<Id, number>>((r, cb) => r.watchFrameCounts(cb), []);
  const trainers = useWatch<Record<Id, Trainer>>((r, cb) => r.watchTrainers(cb), []);
  const [newDanceFor, setNewDanceFor] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState(false);

  if (!teams || !dances) return <p className="app-loading">Lädt …</p>;

  return (
    <div className="app-page">
      <div className="app-pagehead">
        <h1>Übersicht</h1>
        {admin && <Button icon="plus" onClick={() => setNewTeam(true)}>Garde anlegen</Button>}
      </div>
      {!teams.length && (
        <p className="app-empty">
          {admin ? 'Noch keine Garde. Leg die erste an.' : 'Noch keine Garde. Die Garden legt die Trainerleitung an (Besitzer der Gruppe „Garde-Tanz“).'}
        </p>
      )}
      {teams.map((team) => {
        const own = dances.filter((d) => d.teamId === team.id).sort((a, b) => a.title.localeCompare(b.title, 'de'));
        return (
          <section key={team.id} className="app-team" aria-labelledby={`team-${team.id}`}>
            <div className="app-team__head">
              <h2 id={`team-${team.id}`}>{team.name}</h2>
              <Button variant="ghost" icon="plus" onClick={() => setNewDanceFor(team)}>Tanz anlegen</Button>
            </div>
            {own.length ? (
              <ul className="app-cards">
                {own.map((d) => (
                  <li key={d.id}>
                    <DanceCard dance={d} cached={counts?.[d.id] ?? 0} trainer={trainers?.[d.updatedBy]} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="app-empty">Noch kein Tanz.</p>
            )}
          </section>
        );
      })}
      {newTeam && <NewTeamDialog onClose={() => setNewTeam(false)} />}
      {newDanceFor && teams && <NewDanceDialog teams={teams} team={newDanceFor} onClose={() => setNewDanceFor(null)} />}
    </div>
  );
}

function DanceCard({ dance, cached, trainer }: { dance: Dance; cached: number; trainer?: Trainer }) {
  const n = dance.frameOrder.length;
  const ready = n > 0 && cached >= n;
  return (
    <Link to={`/tanz/${dance.id}`} className="app-card">
      <span className="app-card__title">{dance.title}</span>
      <span className="app-card__groups">
        {dance.groups.map((g) => (
          <span key={g.id} className="app-card__group"><SymbolIcon shape={g.symbol} label={g.name} />{g.size}</span>
        ))}
        <span className="app-card__meta">{n} {n === 1 ? 'Bild' : 'Bilder'}</span>
      </span>
      <span className="app-card__foot">
        {ready ? <Badge tone="ok" icon="check">Bilder auf dem Gerät</Badge> : <Badge tone="neutral" icon="sync">Bilder werden geladen</Badge>}
        <span className="app-card__meta">
          geändert {ago(dance.updatedAt)}{trainer ? ` von ${trainer.name.split(' ')[0]}` : ''}
        </span>
      </span>
    </Link>
  );
}

function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    const close = () => onClose();
    d?.addEventListener('close', close);
    return () => d?.removeEventListener('close', close);
  }, [onClose]);
  return ref;
}

function NewTeamDialog({ onClose }: { onClose: () => void }) {
  const repo = useRepo();
  const ref = useDialog(onClose);
  const [name, setName] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    repo.createTeam(name);
    ref.current?.close();
  };
  return (
    <dialog ref={ref} className="app-dialog" aria-labelledby="new-team-title">
      <form onSubmit={submit} className="app-form">
        <h2 id="new-team-title">Garde anlegen</h2>
        <label className="app-field">
          <span>Name der Garde</span>
          <input className="gm-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Junioren" required autoFocus />
        </label>
        <div className="app-form__actions">
          <Button variant="ghost" onClick={() => ref.current?.close()}>Abbrechen</Button>
          <Button variant="primary" type="submit">Garde anlegen</Button>
        </div>
      </form>
    </dialog>
  );
}

function NewDanceDialog({ teams, team, onClose }: { teams: Team[]; team: Team; onClose: () => void }) {
  const repo = useRepo();
  const ref = useDialog(onClose);
  const catalog = useWatch<{ roles: Role[] }>((r, cb) => r.watchCatalog(cb), []);
  const roles = catalog?.roles.length ? catalog.roles : seedRoles();
  const [title, setTitle] = useState('');
  const [teamId, setTeamId] = useState(team.id);
  const [groups, setGroups] = useState<Group[]>(defaultGroups);
  const setGroup = (i: number, patch: Partial<Group>) => setGroups((gs) => gs.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const id = repo.createDance({ teamId, title, groups });
    ref.current?.close();
    navigate(`/tanz/${id}`);
  };
  return (
    <dialog ref={ref} className="app-dialog" aria-labelledby="new-dance-title">
      <form onSubmit={submit} className="app-form">
        <h2 id="new-dance-title">Tanz anlegen</h2>
        <label className="app-field">
          <span>Name des Tanzes</span>
          <input className="gm-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Gardetanz 2026/27" required autoFocus />
        </label>
        <label className="app-field">
          <span>Garde</span>
          <select className="gm-field" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <fieldset className="app-groups">
          <legend>Gruppen, ihre Rolle und Anzahl Tänzer</legend>
          {groups.map((g, i) => (
            <div key={g.id} className="app-groups__row">
              <SymbolIcon shape={g.symbol} label={g.name} />
              <select className="gm-field" aria-label={`Rolle der Gruppe ${i + 1}`} value={g.roleId}
                onChange={(e) => setGroup(i, { roleId: e.target.value, name: roles.find((r) => r.id === e.target.value)?.name ?? g.name })}>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <Stepper label={`Anzahl Tänzer ${g.name}`} unit="Tänzer" value={g.size} min={1} max={30} onChange={(size) => setGroup(i, { size })} />
            </div>
          ))}
          <p className="app-hint">Vorgabe: ● Grenadiere, ○ Mariechen, ✕ Reserve. Jeder Tanz kann das ändern.</p>
        </fieldset>
        <div className="app-form__actions">
          <Button variant="ghost" onClick={() => ref.current?.close()}>Abbrechen</Button>
          <Button variant="primary" type="submit">Tanz anlegen</Button>
        </div>
      </form>
    </dialog>
  );
}
