import { useQueryFilters } from './useQueryFilters';

export interface PlayRow {
  id: string;
  /** Contents number and sheet, such as "39.2". */
  key: string;
  name: string;
  href: string;
  schemeName: string;
  schemeHref: string;
  coach: string;
  sheet: string;
  side: 'offense' | 'defense';
  era: string;
  down: '1st' | '2nd' | '3rd' | '4th' | 'other';
  /** Down and distance, such as "3rd & 6". */
  situation: string;
  personnel: string;
  formation: string;
  /** Lower case text a search looks through. */
  hay: string;
}

interface Props {
  rows: PlayRow[];
  eras: Array<{ id: string; label: string }>;
  idPrefix?: string;
}

const DOWNS: Array<[string, string]> = [
  ['1st', '1st down'],
  ['2nd', '2nd down'],
  ['3rd', '3rd down'],
  ['4th', '4th down'],
];

type Key = 'q' | 'side' | 'era' | 'down' | 'sort';

export default function PlayTable({ rows, eras, idPrefix = 'plays' }: Props) {
  const filters = useQueryFilters<Key>({ q: '', side: 'all', era: 'all', down: 'all', sort: 'contents' }, (key, value) => {
    if (key === 'side') return value === 'offense' || value === 'defense';
    if (key === 'era') return eras.some((e) => e.id === value);
    if (key === 'down') return DOWNS.some(([id]) => id === value);
    if (key === 'sort') return value === 'name';
    return true;
  });
  const { q, side, era, down, sort } = filters.values;

  const needle = q.trim().toLowerCase();
  const match = (r: PlayRow) => !needle || r.hay.includes(needle);
  const bySide = (r: PlayRow) => side === 'all' || r.side === side;
  const byEra = (r: PlayRow) => era === 'all' || r.era === era;
  const byDown = (r: PlayRow) => down === 'all' || r.down === down;

  const pool = rows.filter(match);
  const list = pool.filter((r) => bySide(r) && byEra(r) && byDown(r));
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name) || a.key.localeCompare(b.key));

  const filtered = !!needle || side !== 'all' || era !== 'all' || down !== 'all';
  const sides: Array<[string, string, number]> = [
    ['all', 'All', pool.filter((r) => byEra(r) && byDown(r)).length],
    ['offense', 'Offense', pool.filter((r) => byEra(r) && byDown(r) && r.side === 'offense').length],
    ['defense', 'Defense', pool.filter((r) => byEra(r) && byDown(r) && r.side === 'defense').length],
  ];
  const eraPills: Array<[string, string, number]> = [
    ['all', 'All eras', pool.filter((r) => bySide(r) && byDown(r)).length],
    ...eras.map((e): [string, string, number] => [e.id, e.label, pool.filter((r) => bySide(r) && byDown(r) && r.era === e.id).length]),
  ];
  const downPills: Array<[string, string, number]> = [
    ['all', 'Any down', pool.filter((r) => bySide(r) && byEra(r)).length],
    ...DOWNS.map(([id, label]): [string, string, number] => [id, label, pool.filter((r) => bySide(r) && byEra(r) && r.down === id).length]),
  ];

  const status = list.length === 0 ? 'No plays match' : filtered ? `${list.length} of ${rows.length} plays match` : `All ${rows.length} plays`;

  return (
    <div>
      <div className="filters js-only">
        <div className="search">
          <label htmlFor={`${idPrefix}-q`} className="lab">
            Find a play, formation, coverage or coach
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
        <div role="group" aria-label="Era" className="group">
          {eraPills.map(([id, label, n]) => (
            <button key={id} className="pill" type="button" aria-pressed={era === id} onClick={() => filters.set('era', id)}>
              {label} <span className="type">{n}</span>
            </button>
          ))}
        </div>
        <div role="group" aria-label="Down" className="group">
          {downPills.map(([id, label, n]) => (
            <button key={id} className="pill" type="button" aria-pressed={down === id} onClick={() => filters.set('down', id)}>
              {label} <span className="type">{n}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="status-row">
        <p className="mono-small" role="status" aria-live="polite">
          {status}
        </p>
        <div className="status-tools js-only">
          {filtered && list.length > 0 ? (
            <button className="pill" type="button" onClick={filters.reset}>
              Clear filters
            </button>
          ) : null}
          <div role="group" aria-label="Order" className="group">
            <button className="pill" type="button" aria-pressed={sort === 'contents'} onClick={() => filters.set('sort', 'contents')}>
              By scheme
            </button>
            <button className="pill" type="button" aria-pressed={sort === 'name'} onClick={() => filters.set('sort', 'name')}>
              A to Z
            </button>
          </div>
        </div>
      </div>

      <div className="lib-table plays-table">
        <div className="lib-head" aria-hidden="true">
          <p>No.</p>
          <p>Play</p>
          <p>Scheme</p>
          <p>Side</p>
          <p>Down</p>
          <p>Personnel</p>
        </div>
        {list.length > 0 ? (
          <ol className="lib-rows">
            {list.map((r) => (
              <li key={r.id}>
                <a href={r.href} className="lib-row">
                  <span className="c-no">{r.key}</span>
                  <span className="c-main">
                    <span className="c-name">{r.name}</span>
                    <span className="c-sub">{r.formation}</span>
                  </span>
                  <span className="c-ref">
                    <span className="c-ref-name">{r.schemeName}</span>
                    <span className="c-sub">
                      {r.coach} · {r.sheet}
                    </span>
                  </span>
                  <span className="c-meta">
                    <span className="c-side">
                      <span className={`mk ${r.side === 'offense' ? 'mko' : 'mkd'}`} aria-hidden="true" />
                      <span>{r.side === 'offense' ? 'Offense' : 'Defense'}</span>
                    </span>
                    <span className="c-dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="c-down">{r.situation}</span>
                    <span className="c-dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="c-pers">{r.personnel}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <div className="empty">
            <h3 className="slab" style={{ fontSize: 22, lineHeight: '28px', fontWeight: 600 }}>
              {needle ? `No play matches “${q.trim()}”` : 'No plays in this combination'}
            </h3>
            <p className="prose" style={{ fontSize: 15, lineHeight: '24px' }}>
              Try one word, such as a route, a coverage (“cover 3”), a formation or a coach&rsquo;s last name. You can also clear the side, era and down filters.
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
