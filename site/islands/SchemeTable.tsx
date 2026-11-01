import { useEffect, useState } from 'react';

export interface SchemeRow {
  id: string;
  no: string;
  name: string;
  coach: string;
  team: string;
  side: 'offense' | 'defense';
  era: string;
  eraLabel: string;
  href: string;
  /** Plays of the scheme, for search. `hay` is the lower case text a search looks through. */
  plays: Array<{ id: string; name: string; sheet: string; hay: string }>;
}

interface Props {
  rows: SchemeRow[];
  eras: Array<{ id: string; label: string }>;
  /** On phones, show only this many rows until the reader asks for the rest. */
  collapseAt?: number;
  /** Where "Show all" goes for readers without scripts. */
  allHref?: string;
  idPrefix?: string;
}

type SideFilter = 'all' | 'offense' | 'defense';

export default function SchemeTable({ rows, eras, collapseAt, allHref = '/schemes/', idPrefix = 'schemes' }: Props) {
  const [q, setQ] = useState('');
  const [side, setSide] = useState<SideFilter>('all');
  const [era, setEra] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);

  // The search and filters live in the address, so Back returns to the same list and a link can share it.
  useEffect(() => {
    // Read after hydration, so the server and the first client render match.
    const params = new URLSearchParams(window.location.search);
    setQ(params.get('q') ?? '');
    const sideParam = params.get('side');
    if (sideParam === 'offense' || sideParam === 'defense') setSide(sideParam);
    const eraParam = params.get('era');
    if (eraParam && eras.some((e) => e.id === eraParam)) setEra(eraParam);
    setReady(true);
  }, [eras]);
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (side !== 'all') params.set('side', side);
    if (era !== 'all') params.set('era', era);
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(null, '', next);
  }, [ready, q, side, era]);

  const needle = q.trim().toLowerCase();
  const schemeText = (r: SchemeRow) => `${r.name} ${r.coach} ${r.team}`.toLowerCase();
  const playHits = (r: SchemeRow) => (needle ? r.plays.filter((p) => p.hay.includes(needle)) : []);
  const match = (r: SchemeRow) => !needle || schemeText(r).includes(needle) || playHits(r).length > 0;
  const bySide = (r: SchemeRow) => side === 'all' || r.side === side;
  const byEra = (r: SchemeRow) => era === 'all' || r.era === era;

  const pool = rows.filter(match);
  const list = pool.filter((r) => bySide(r) && byEra(r));

  const filtered = !!needle || side !== 'all' || era !== 'all';
  const collapsible = !!collapseAt && !filtered && !expanded && rows.length > collapseAt;
  const clear = () => {
    setQ('');
    setSide('all');
    setEra('all');
    setExpanded(false);
  };

  const sides: Array<[SideFilter, string, number]> = [
    ['all', 'All', pool.filter(byEra).length],
    ['offense', 'Offense', pool.filter((r) => byEra(r) && r.side === 'offense').length],
    ['defense', 'Defense', pool.filter((r) => byEra(r) && r.side === 'defense').length],
  ];
  const eraPills: Array<[string, string, number]> = [
    ['all', 'All eras', pool.filter(bySide).length],
    ...eras.map((e): [string, string, number] => [e.id, e.label, pool.filter((r) => bySide(r) && r.era === e.id).length]),
  ];

  const hitCount = needle ? list.reduce((n, r) => n + (schemeText(r).includes(needle) ? 0 : playHits(r).length), 0) : 0;
  const status =
    list.length === 0
      ? 'No schemes match'
      : filtered
        ? `${list.length} of ${rows.length} schemes match${hitCount ? `, ${hitCount} by play` : ''}`
        : `All ${rows.length} schemes`;

  return (
    <div>
      <div className="filters js-only">
        <div className="search">
          <label htmlFor={`${idPrefix}-q`} className="lab">
            Find a scheme, coach, team or play
          </label>
          <input id={`${idPrefix}-q`} className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        </div>
        <div role="group" aria-label="Side of the ball" className="group">
          {sides.map(([id, label, n]) => (
            <button key={id} className="pill" type="button" aria-pressed={side === id} onClick={() => setSide(id)}>
              {label} <span className="type">{n}</span>
            </button>
          ))}
        </div>
        <div role="group" aria-label="Era" className="group">
          {eraPills.map(([id, label, n]) => (
            <button key={id} className="pill" type="button" aria-pressed={era === id} onClick={() => setEra(id)}>
              {label} <span className="type">{n}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="status-row">
        <p className="mono-small" role="status" aria-live="polite">
          {status}
        </p>
        {filtered && list.length > 0 ? (
          <button className="pill" type="button" onClick={clear}>
            Clear filters
          </button>
        ) : null}
      </div>

      <div className={`toc-table${collapsible ? ' toc-collapsible' : ''}`}>
        <div className="thead" aria-hidden="true">
          <p>No.</p>
          <p>Scheme</p>
          <p>Coach</p>
          <p>Team</p>
          <p>Side</p>
          <p>Era</p>
        </div>
        {list.length > 0 ? (
          <ol className="toc" data-collapsed={collapsible ? 'true' : undefined}>
            {list.map((r) => {
              const hits = schemeText(r).includes(needle) ? [] : playHits(r);
              return (
              <li key={r.id} className="row">
                <a href={r.href}>
                  <span className="no">{r.no}</span>
                  <span className="nm">{r.name}</span>
                  <span className="ct">
                    <span className="coach">{r.coach}</span>
                    <span className="sep-ct">, </span>
                    <span className="team">{r.team}</span>
                  </span>
                  <span className="se">
                    <span className="side">
                      <span className={`mk ${r.side === 'offense' ? 'mko' : 'mkd'}`} aria-hidden="true" />
                      <span className="sidelab">{r.side === 'offense' ? 'Offense' : 'Defense'}</span>
                    </span>
                    <span className="sep-se"> · </span>
                    <span className="era">{r.eraLabel}</span>
                  </span>
                </a>
                {hits.length > 0 ? (
                  <ul className="hits" aria-label={`Plays in ${r.name} that match`}>
                    {hits.slice(0, 4).map((p) => (
                      <li key={p.id}>
                        <a href={`${r.href}${p.id}/`}>
                          {p.name} <span className="type">{p.sheet}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
              );
            })}
          </ol>
        ) : (
          <div className="empty">
            <h3 className="slab" style={{ fontSize: 22, lineHeight: '28px', fontWeight: 600 }}>
              {needle ? `No scheme matches “${q.trim()}”` : 'No schemes in this combination'}
            </h3>
            <p className="prose" style={{ fontSize: 15, lineHeight: '24px' }}>
              Try a coach&rsquo;s last name, a team, a play name or a shorter word. You can also clear the side and era filters.
            </p>
            <button className="pill" type="button" onClick={clear}>
              Clear filters
            </button>
          </div>
        )}
        {collapseAt ? (
          <div className="more-row">
            <a
              className="pill"
              href={allHref}
              onClick={(e) => {
                e.preventDefault();
                setExpanded(true);
              }}
            >
              Show all {rows.length} schemes
            </a>
            <p className="mono-small" style={{ fontSize: 12, lineHeight: '18px' }}>
              The first {collapseAt} are listed above.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
