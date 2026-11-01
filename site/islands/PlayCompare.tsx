import { useMemo } from 'react';
import { fieldWindow, parsePlay, type LitePlay } from '../lib/field';
import { Field, FieldLegend } from './Field';
import { setPlayState, tenth, usePlayState } from './playState';

export interface CompareProp {
  id: string;
  sheet: string;
  name: string;
  score: number;
  atEnd: number;
  breakSeconds: number | null;
  profile: number[];
  paired: number;
  total: number;
  tellName: string;
  tell: string;
  /** The other play, as JSON. */
  play: string;
}

interface Props {
  base: string;
  baseSheet: string;
  baseName: string;
  duration: number;
  comparisons: CompareProp[];
  /** Similarity below this value counts as the plays no longer looking alike. */
  holdPercent: number;
  /** Frames 0 to this value are scored. */
  windowSeconds: number;
}

/** The comparison with the plays this one mirrors: two fields on the shared clock, the score by tenth of a second, and the tell. */
export default function PlayCompare({ base: baseJson, baseSheet, baseName, duration, comparisons, holdPercent, windowSeconds }: Props) {
  const base = useMemo(() => parsePlay(baseJson), [baseJson]);
  const state = usePlayState();
  const t = tenth(state.t);
  const cmp = comparisons.find((c) => c.id === state.compareId) ?? comparisons[0];
  const other: LitePlay = useMemo(() => parsePlay(cmp.play), [cmp.play]);
  // Frame the players from the snap to the current time, but never tighter than the first 1.2 s: the figures zoom out as the play runs away from the line.
  const reach = Math.max(windowSeconds, Math.ceil(state.t * 2) / 2);
  const win = useMemo(() => fieldWindow([base, other], reach), [base, other, reach]);

  const inWindow = t <= windowSeconds + 0.0001;
  const frame = Math.min(cmp.profile.length - 1, Math.round(t * 10));
  const sim = inWindow ? cmp.profile[frame] : null;
  const last = cmp.profile[cmp.profile.length - 1];

  const readout = inWindow
    ? `At ${t.toFixed(1)} s the two plays score ${sim}% alike.`
    : `The ${windowSeconds.toFixed(1)} s window has ended. The last score was ${last}%.`;
  const verdict =
    cmp.breakSeconds === null
      ? `It stays above the ${holdPercent}% line for the whole window.`
      : `It drops below the ${holdPercent}% line at ${cmp.breakSeconds.toFixed(1)} s.`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div role="group" aria-label="Compare against" className="group">
        {comparisons.map((c) => (
          <button key={c.id} className="pill" type="button" aria-pressed={c.id === cmp.id} onClick={() => setPlayState({ compareId: c.id })}>
            <span className="type" style={{ fontWeight: 700 }}>
              {c.sheet}
            </span>{' '}
            {c.name} <span className="type">{c.score}%</span>
          </button>
        ))}
      </div>

      <div className="compare">
        <div className="pair">
          <figure className="sheet">
            <div className="strip">
              <p>{baseSheet}</p>
              <p>t = {t.toFixed(1)} s</p>
            </div>
            <div style={{ padding: '12px 12px 6px' }}>
              <Field play={base} t={state.t} win={win} dot={10} refWidth={250} />
            </div>
            <figcaption className="small" style={{ padding: '4px 14px 12px' }}>
              {baseName}.
            </figcaption>
          </figure>
          <figure className="sheet">
            <div className="strip">
              <p>{cmp.sheet}</p>
              <p>t = {t.toFixed(1)} s</p>
            </div>
            <div style={{ padding: '12px 12px 6px' }}>
              <Field play={other} against={base} againstName={baseName} t={state.t} win={win} dot={10} refWidth={250} />
            </div>
            <figcaption className="small" style={{ padding: '4px 14px 12px' }}>
              {cmp.name}. Red rings mark players more than 1 yard from where they stand in {baseName}.
            </figcaption>
          </figure>
          <div className="span">
            <FieldLegend against />
            <label htmlFor="scrub-t2" className="mono-small">
              Time after the snap: <span style={{ fontWeight: 700, color: 'var(--fg)' }}>{t.toFixed(1)} s</span>
            </label>
            <input
              id="scrub-t2"
              type="range"
              min={0}
              max={Math.round(duration * 10)}
              step={1}
              value={Math.round(state.t * 10)}
              aria-valuetext={`${t.toFixed(1)} seconds after the snap`}
              onChange={(e) => setPlayState({ t: Number(e.target.value) / 10, playing: false })}
            />
          </div>
        </div>

        <div className="sheet score">
          <div className="strip">
            <p>How alike the two plays are, 0.0 to {windowSeconds.toFixed(1)} s</p>
          </div>
          <div className="inner">
            <p aria-live="polite" className="type" style={{ fontSize: 14, lineHeight: '20px', color: 'var(--fg)' }}>
              {readout}
            </p>
            <div
              className="chart"
              role="img"
              aria-label={`Similarity between ${baseName} and ${cmp.name} by tenth of a second: ${cmp.profile.join(', ')} percent.`}
            >
              <div className="cut" style={{ bottom: Math.round(holdPercent * 0.96) }} />
              <span className="cut-label" aria-hidden="true" style={{ bottom: Math.round(holdPercent * 0.96) - 6 }}>
                {holdPercent}%
              </span>
              {cmp.profile.map((v, i) => (
                <div key={i} className={`bar${v < holdPercent ? ' bad' : ''}${inWindow && i === frame ? ' cur' : ''}`} style={{ height: Math.round(v * 0.96) }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <p className="type" style={{ fontSize: 11, lineHeight: '16px', color: 'var(--fg2)' }}>
                0.0 s, {cmp.profile[0]}%
              </p>
              <p className="type" style={{ fontSize: 11, lineHeight: '16px', color: 'var(--fg2)' }}>
                {windowSeconds.toFixed(1)} s, {last}%
              </p>
            </div>
            <p style={{ fontSize: 15, lineHeight: '22px', color: 'var(--fg)' }}>
              {cmp.score}% on average. {verdict}
            </p>
            {cmp.paired < cmp.total ? (
              <p className="small" style={{ fontSize: 13, lineHeight: '19px' }}>
                Scored on the {cmp.paired} of {cmp.total} players who appear in both plays.
              </p>
            ) : null}
            <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p className="lab">The tell</p>
              <p className="small" style={{ fontSize: 14, lineHeight: '21px' }}>
                <span style={{ color: 'var(--fg)' }}>{cmp.tellName}:</span> {cmp.tell}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
