import { useId, useState, type ReactNode } from 'react';

type Pills = Array<[string, string, number]>;

/**
 * The labels of the filters that are not on "all", in the order given, for the Filters button to say
 * what is applied while the chips are folded away.
 */
export function activeLabels(selected: Array<[string, Pills]>): string[] {
  return selected.flatMap(([current, pills]) => {
    if (current === 'all') return [];
    const label = pills.find(([id]) => id === current)?.[1];
    return label ? [label] : [];
  });
}

/**
 * The filter chips of a list. From 600 px wide they are always shown. On a phone they sit behind one
 * Filters button, so the first screen shows results and not three rows of chips. The search box stays
 * outside, always visible. Without scripts the whole filter bar is hidden and every row shows.
 */
export function FilterGroups({ summary, children }: { summary: string[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`fgroups${open ? ' is-open' : ''}`}>
      <button type="button" className="pill fgroups-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span>Filters</span>
        {summary.length > 0 ? <span className="type fgroups-sum">{summary.join(', ')}</span> : <span className="fgroups-sum" />}
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div id={id} className="fgroups-body">
        {children}
      </div>
    </div>
  );
}
