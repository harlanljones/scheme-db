import { capitalize, count, plural } from '../lib/format';
import { useQueryFilters } from './useQueryFilters';

export interface TermRow {
  id: string;
  term: string;
  category: string;
  /** The letter the entry is filed under, or "#". */
  letter: string;
  def: string;
  note: string;
  /** Other names for the term, without repeats of its own name. */
  also: string[];
  /** Other terms whose names appear in this entry. */
  seeAlso: Array<{ id: string; term: string }>;
  /** A page that explains the term at more length than an entry can. */
  link?: { label: string; href: string };
  /** Schemes with a play that names the term, most plays first. */
  schemes: Array<{ name: string; href: string; no: number; plays: number }>;
  /** Plays that name the term, over every scheme. */
  plays: number;
  /** Lower case text a search looks through. */
  hay: string;
}

interface Props {
  rows: TermRow[];
  categories: string[];
  idPrefix?: string;
}

type Key = 'q' | 'cat';

/** Schemes named in the sentence; the rest wait behind "and N more". */
const SHOWN = 4;

function Schemes({ row }: { row: TermRow }) {
  if (row.schemes.length === 0) {
    return <>Not named in a play title, formation, front or coverage.</>;
  }
  const head = row.schemes.slice(0, SHOWN);
  const rest = row.schemes.slice(SHOWN);
  return (
    <>
      Named in {count(row.plays)} {plural(row.plays, 'play')} across {count(row.schemes.length)} {plural(row.schemes.length, 'scheme')}:{' '}
      {head.map((scheme, i) => (
        <span key={scheme.href}>
          {i > 0 ? (i === head.length - 1 && rest.length === 0 ? ' and ' : ', ') : ''}
          <a href={scheme.href}>{scheme.name}</a>
        </span>
      ))}
      {rest.length > 0 ? (
        <details className="gloss-more">
          <summary>
            and {count(rest.length)} more {plural(rest.length, 'scheme')}
          </summary>
          <ul>
            {rest.map((scheme) => (
              <li key={scheme.href}>
                <a href={scheme.href}>{scheme.name}</a>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}

export default function GlossaryList({ rows, categories, idPrefix = 'glossary' }: Props) {
  const filters = useQueryFilters<Key>({ q: '', cat: 'all' }, (key, value) => (key === 'cat' ? categories.includes(value) : true));
  const { q, cat } = filters.values;

  const needle = q.trim().toLowerCase();
  const match = (r: TermRow) => !needle || r.hay.includes(needle);
  const byCat = (r: TermRow) => cat === 'all' || r.category === cat;

  const pool = rows.filter(match);
  const list = pool.filter(byCat);
  const filtered = !!needle || cat !== 'all';

  const catPills: Array<[string, string, number]> = [['all', 'All', pool.length], ...categories.map((id): [string, string, number] => [id, id, pool.filter((r) => r.category === id).length])];

  // Entries arrive A to Z, so each letter's entries are already side by side.
  const letters = [...new Set(list.map((r) => r.letter))];
  const status = list.length === 0 ? 'No terms match' : filtered ? `${list.length} of ${rows.length} terms match` : `All ${rows.length} terms`;

  return (
    <div>
      <div className="filters js-only">
        <div className="search">
          <label htmlFor={`${idPrefix}-q`} className="lab">
            Find a term, or another name for it
          </label>
          <input id={`${idPrefix}-q`} className="input" type="search" value={q} onChange={(e) => filters.set('q', e.target.value)} autoComplete="off" />
        </div>
        <div role="group" aria-label="Kind of term" className="group">
          {catPills.map(([id, label, n]) => (
            <button key={id} className="pill" type="button" aria-pressed={cat === id} onClick={() => filters.set('cat', id)}>
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
          <button className="pill js-only" type="button" onClick={filters.reset}>
            Clear filters
          </button>
        ) : null}
      </div>

      {letters.length > 1 ? (
        <nav className="gloss-letters" aria-label="Jump to a letter">
          {letters.map((letter) => (
            <a key={letter} href={`#letter-${letter === '#' ? 'other' : letter.toLowerCase()}`} aria-label={`Terms starting with ${letter}`}>
              {letter}
            </a>
          ))}
        </nav>
      ) : null}

      {list.length > 0 ? (
        <div className="gloss">
          {letters.map((letter) => {
            const group = list.filter((r) => r.letter === letter);
            const anchor = `letter-${letter === '#' ? 'other' : letter.toLowerCase()}`;
            return (
              <section key={letter} aria-labelledby={anchor}>
                <div className="divider sm">
                  <h2 id={anchor}>{letter}</h2>
                  <p className="aside">
                    {capitalize(count(group.length))} {plural(group.length, 'term')}
                  </p>
                </div>
                <ul className="gloss-list">
                  {group.map((r) => (
                    <li key={r.id}>
                      <article className="gloss-entry" id={r.id}>
                        <header className="gloss-head">
                          <h3 className="slab">
                            <a href={`#${r.id}`}>{r.term}</a>
                          </h3>
                          <p className="gloss-cat">{r.category}</p>
                        </header>
                        <div className="gloss-body">
                          <p className="gloss-def">{r.def}</p>
                          <p className="gloss-note">
                            <span className="lab">Tactical note</span> {r.note}
                          </p>
                          <dl className="gloss-meta">
                            {r.also.length > 0 ? (
                              <div>
                                <dt className="lab">Also called</dt>
                                <dd>{r.also.join(', ')}</dd>
                              </div>
                            ) : null}
                            {r.seeAlso.length > 0 ? (
                              <div>
                                <dt className="lab">See also</dt>
                                <dd>
                                  {r.seeAlso.map((other, i) => (
                                    <span key={other.id}>
                                      {i > 0 ? ', ' : ''}
                                      <a href={`#${other.id}`}>{other.term}</a>
                                    </span>
                                  ))}
                                </dd>
                              </div>
                            ) : null}
                            {r.link ? (
                              <div>
                                <dt className="lab">More</dt>
                                <dd>
                                  <a href={r.link.href}>{r.link.label}</a>
                                </dd>
                              </div>
                            ) : null}
                            <div>
                              <dt className="lab">In the library</dt>
                              <dd>
                                <Schemes row={r} />
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <h3 className="slab" style={{ fontSize: 22, lineHeight: '28px', fontWeight: 600 }}>
            {needle ? `No term matches “${q.trim()}”` : 'No terms in this kind'}
          </h3>
          <p className="prose" style={{ fontSize: 15, lineHeight: '24px' }}>
            Try a shorter word, or another name such as “outside zone” or “man free”. You can also clear the kind of term.
          </p>
          <button className="pill" type="button" onClick={filters.reset}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
