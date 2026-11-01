import { describeField } from '../lib/describe';
import { FIELD_WIDTH_YARDS, gapsAt, pos, type FieldWindow, type LitePlay } from '../lib/field';

/** NFL hash marks are 70 ft 9 in from each sideline; the ball sits between them. */
const HASH_LEFT = 23.58;
const HASH_RIGHT = 29.75;

interface FieldProps {
  play: LitePlay;
  /** When given, players more than 1 yard from where they stand in this play get a red ring. */
  against?: LitePlay;
  /** Seconds after the snap. */
  t: number;
  win: FieldWindow;
  /** Largest marker diameter in pixels. Markers shrink with the field, down to about two thirds of this. */
  dot?: number;
  /** Width in pixels the field is usually drawn at, which sets how fast markers shrink on small screens. */
  refWidth?: number;
  /** Player ids to label. */
  focus?: string[];
  /** Move markers with a short transition, for playback. */
  animated?: boolean;
  /** Name of the other play, for the text alternative. */
  againstName?: string;
}

const pct = (value: number): string => `${Math.max(0, Math.min(100, value)).toFixed(2)}%`;

export function Field({ play, against, againstName, t, win, dot = 14, refWidth = 700, focus = [], animated = false }: FieldProps) {
  const height = win.yHi - win.yLo;
  const top = (y: number): string => pct(((win.yHi - y) / height) * 100);
  const left = (x: number): string => pct((x / FIELD_WIDTH_YARDS) * 100);
  const hot = new Set(against ? gapsAt(play, against, t) : []);

  const lines: number[] = [];
  for (let y = Math.ceil(win.yLo / 5) * 5; y <= win.yHi; y += 5) lines.push(y);

  const marks = play.tracks.map((track) => {
    const p = pos(track, t);
    return { track, topValue: ((win.yHi - p.y) / height) * 100, left: left(p.x), top: top(p.y) };
  });
  const labelled = marks.filter((m) => focus.includes(m.track.id) || hot.has(m.track.id));
  const cls = animated ? ' anim' : '';
  const dotSize = `clamp(${Math.max(8, Math.round(dot * 0.65))}px, ${((dot / refWidth) * 100).toFixed(2)}%, ${dot}px)`;
  const hashStyle = {
    background: `repeating-linear-gradient(to bottom, var(--rule2) 0, var(--rule2) 1px, transparent 1px, transparent ${(100 / height).toFixed(4)}%)`,
  };

  return (
    <div className="fieldwrap">
      <div className="fld" role="img" aria-label={describeField({ play, against, againstName, t, focus })} style={{ aspectRatio: `${FIELD_WIDTH_YARDS} / ${height}` }}>
        <div className="hash" aria-hidden="true" style={{ ...hashStyle, left: left(HASH_LEFT) }} />
        <div className="hash" aria-hidden="true" style={{ ...hashStyle, left: left(HASH_RIGHT) }} />
        {lines.map((y) => (y === 0 ? <div key={y} className="los" style={{ top: top(0) }} /> : <div key={y} className="yl" style={{ top: top(y) }} />))}
        {marks.map(({ track, left: l, top: tp }) => (
          <div
            key={track.id}
            className={`dot ${track.side === 'offense' ? 'o' : 'd'}${hot.has(track.id) ? ' x' : ''}${cls}`}
            style={{ left: l, top: tp, width: dotSize, aspectRatio: '1' }}
          />
        ))}
        {labelled.map(({ track, left: l, top: tp, topValue }) => {
          const below = track.side === 'offense' || topValue < 10;
          return (
            <span
              key={track.id}
              className={`tag${below ? '' : ' up'}${cls}`}
              aria-hidden="true"
              style={{ left: l, top: tp, marginTop: below ? dot / 2 + 3 : -(dot / 2 + 3) }}
            >
              {track.id}
            </span>
          );
        })}
      </div>
      <div className="gut" aria-hidden="true">
        {lines.map((y) => (
          <span key={y} className="gl" style={{ top: top(y), color: y === 0 ? 'var(--fg)' : undefined }}>
            {y === 0 ? 'LOS' : y > 0 ? `+${y}` : String(y)}
          </span>
        ))}
      </div>
    </div>
  );
}

interface LegendProps {
  against?: boolean;
  /** A time readout shown at the right of the legend. */
  time?: string;
  pause?: { paused: boolean; onToggle: () => void };
}

export function FieldLegend({ against = false, time, pause }: LegendProps) {
  const label = pause ? (pause.paused ? 'Play animation' : 'Pause animation') : '';
  return (
    <div className="legend">
      <span className="k">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20V4M6 10l6-6 6 6" />
        </svg>
        Offense attacks up the page
      </span>
      <span className="k">
        <span className="mk mko" aria-hidden="true" style={{ width: 12, height: 12 }} />
        Offense
      </span>
      <span className="k">
        <span className="mk mkd" aria-hidden="true" style={{ width: 12, height: 12 }} />
        Defense
      </span>
      {against ? (
        <span className="k">
          <span className="mk mkc" aria-hidden="true" style={{ width: 12, height: 12 }} />
          More than 1 yard apart
        </span>
      ) : null}
      <span className="k">LOS is the line of scrimmage. Marks are yards from it.</span>
      {time ? (
        <span className="k type" style={{ marginLeft: 'auto', color: 'var(--fg)' }}>
          {time}
        </span>
      ) : null}
      {pause ? (
        <button className="pbtn" type="button" onClick={pause.onToggle} aria-label={label}>
          {pause.paused ? (
            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          )}
          {label}
        </button>
      ) : null}
    </div>
  );
}
