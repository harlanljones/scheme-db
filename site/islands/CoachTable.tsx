import { useQueryFilters } from './useQueryFilters';
import { searchKey } from '../lib/search';

export interface CoachRow {
  id: string;
  no: string;
  name: string;
  role: string;
  side: 'offense' | 'defense';
  lineage: string;
  lineageName: string;
  /** Eras of the coach's schemes; empty when the coach has no scheme yet. */
  eras: string[];
  eraLabel: string;
  href: string;
  /** Lower case text a search looks through. */
  hay: string;
}

interface Props {
  rows: CoachRow[];
  eras: Array<{ id: string; label: string }>;
  lineages: Array<{ id: string; label: string }>;
  idPrefix?: string;
}

type Key = 'q' | 'side' | 'era' | 'tree';

export default function CoachTable({ rows, eras, lineages, idPrefix = 'coaches' }: Props) {
  const filters = useQueryFilters<Key>({ q: '', side: 'all', era: 'all', tree: 'all' }, (key, value) => {
    if (key === 'side') return value === 'offense' || value === 'defense';
    if (key === 'era') return eras.some((e) => e.id === value);
    if (key === 'tree') return lineages.some((l) => l.id === value);
    return true;
  });
  const { q, side, era, tree } = filters.values;

  const needle = searchKey(q);
  const match = (r: CoachRow) => !needle || r.hay.includes(needle);
  const bySide = (r: CoachRow) => side === 'all' || r.side === side;
  const byEra = (r: CoachRow) => era === 'all' || r.eras.includes(era);
  const byTree = (r: CoachRow) => tree === 'all' || r.lineage === tree;

  const pool = rows.filter(match);
  const list = pool.filter((r) => bySide(r) && byEra(r) && byTree(r));
  const filtered = !!needle || side !== 'all' || era !== 'all' || tree !== 'all';

  const sides: Array<[string, string, number]> = [
    ['all', 'All', pool.filter((r) => byEra(r) && byTree(r)).length],
    ['offense', 'Offense', pool.filter((r) => byEra(r) && byTree(r) && r.side === 'offense').length],
    ['defense', 'Defense', pool.filter((r) => byEra(r) && byTree(r) && r.side === 'defense').length],
  ];
  const eraPills: Array<[string, string, number]> = [
    ['all', 'All eras', pool.filter((r) => bySide(r) && byTree(r)).length],
    ...eras.map((e): [string, string, number] => [e.id, e.label, pool.filter((r) => bySide(r) && byTree(r) && r.eras.includes(e.id)).length]),
  ];
  const treeCount = (id: string) => pool.filter((r) => bySide(r) && byEra(r) && r.lineage === id).length;

  const status = list.length === 0 ? 'No coaches match' : filtered ? `${list.length} of ${rows.length} coaches match` : `All ${rows.length} coaches`;

  return (
    <div>
      <div className="filters js-only">
        <div className="search">
          <label htmlFor={`${idPrefix}-q`} className="lab">
            Find a coach, team, scheme or concept
          </label>
          <input id={`${idPrefix}-q`} className="input" type="search" value={q} onChange={(e) => filters.set('q', e.target.value)} autoComplete="off" />
        </div>
        <div role="group" aria-label="Side of the ball" className="group">
          {sides.map(([id, label, n]) => (
            <button key={id} className="pill" type="button" aria-pressed={side === id} onClick={() => filters.set('side', id)}>
              {label} <span className="type">{n}</span>
            </button>
          ))}
        </div>
        <div role="group" aria-label="Era of their scheme" className="group">
          {eraPills.map(([id, label, n]) => (
            <button key={id} className="pill" type="button" aria-pressed={era === id} onClick={() => filters.set('era', id)}>
              {label} <span className="type">{n}</span>
            </button>
          ))}
        </div>
        <div className="select-field">
          <label htmlFor={`${idPrefix}-tree`} className="lab">
            Lineage tree
          </label>
          <select id={`${idPrefix}-tree`} className="input select" value={tree} onChange={(e) => filters.set('tree', e.target.value)}>
            <option value="all">Every tree</option>
            {lineages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label} ({treeCount(l.id)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="status-row">
        <p className="mono-small" role="status" aria-live="polite">
          {status}
        </p>
        {filtered && list.length > 0 ? (
          <button className="pill js-only" type="button" onClick={filters.reset}>
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="lib-table coaches-table">
        <div className="lib-head" aria-hidden="true">
          <p>No.</p>
          <p>Coach</p>
          <p>Role</p>
          <p>Side</p>
          <p>Lineage tree</p>
          <p>Era</p>
        </div>
        {list.length > 0 ? (
          <ol className="lib-rows">
            {list.map((r) => (
              <li key={r.id}>
                <a href={r.href} className="lib-row">
                  <span className="c-no">{r.no}</span>
                  <span className="c-main">
                    <span className="c-name">{r.name}</span>
                  </span>
                  <span className="c-ref">
                    <span className="c-sub c-role">{r.role}</span>
                  </span>
                  <span className="c-meta">
                    <span className="c-side">
                      <span className={`mk ${r.side === 'offense' ? 'mko' : 'mkd'}`} aria-hidden="true" />
                      <span>{r.side === 'offense' ? 'Offense' : 'Defense'}</span>
                    </span>
                    <span className="c-dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="c-down c-tree">{r.lineageName}</span>
                    <span className="c-dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="c-pers">{r.eraLabel}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <div className="empty">
            <h3 className="slab" style={{ fontSize: 22, lineHeight: '28px', fontWeight: 600 }}>
              {needle ? `No coach matches “${q.trim()}”` : 'No coaches in this combination'}
            </h3>
            <p className="prose" style={{ fontSize: 15, lineHeight: '24px' }}>
              Try a last name, a team or a concept such as “wide zone”. You can also clear the side, era and tree filters.
            </p>
            <button className="pill" type="button" onClick={filters.reset}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
