import { HASHES, LEVEL_LABELS, ballX, spotOffset, type BallSpot } from '../../src/engine/field';
import { describeField } from '../lib/describe';
import { FIELD_WIDTH_YARDS, gapsAt, pos, type FieldWindow, type LitePlay } from '../lib/field';

interface FieldProps {
  play: LitePlay;
  /** When given, players more than 1 yard from where they stand in this play get a red ring. */
  against?: LitePlay;
  /** Only this side gets rings: the side the score counts. Both sides when left out. */
  ringSide?: 'offense' | 'defense';
  /** Seconds after the snap. */
  t: number;
  win: FieldWindow;
  /** Largest marker diameter in pixels. Markers shrink with the field, down to about two thirds of this. */
  dot?: number;
  /** Width in pixels the field is usually drawn at, which sets how fast markers shrink on small screens. */
  refWidth?: number;
  /** Player ids to label. */
  focus?: string[];
  /** Draw the play at this ball spot instead of its own, so two plays compared side by side stand on the same hash. */
  spot?: BallSpot;
  /** Name of the other play, for the text alternative. */
  againstName?: string;
}

const pct = (value: number): string => `${Math.max(0, Math.min(100, value)).toFixed(2)}%`;

/** A player label is about this big, in yards, on a phone sized field. Labels that would touch move to the other side of their mark. */
const TAG_W = 4.4;
const TAG_H = 2.4;

interface Placed {
  x: number;
  y: number;
  up: boolean;
}

function placeTags(items: Array<{ id: string; x: number; y: number; defaultUp: boolean }>): Map<string, Placed> {
  const placed: Placed[] = [];
  const out = new Map<string, Placed>();
  const touches = (c: Placed): boolean => placed.some((p) => Math.abs(p.x - c.x) < TAG_W && Math.abs(p.y - c.y) < TAG_H);
  for (const item of items) {
    const candidates: Array<[boolean, number]> = [
      [item.defaultUp, 0],
      [!item.defaultUp, 0],
      [item.defaultUp, TAG_W],
      [item.defaultUp, -TAG_W],
      [!item.defaultUp, TAG_W],
      [!item.defaultUp, -TAG_W],
    ];
    let chosen: Placed | undefined;
    for (const [up, shift] of candidates) {
      const candidate = { x: item.x + shift, y: item.y + (up ? TAG_H : -TAG_H) / 2, up };
      if (!touches(candidate)) {
        chosen = candidate;
        break;
      }
    }
    chosen ??= { x: item.x, y: item.y + (item.defaultUp ? TAG_H : -TAG_H) / 2, up: item.defaultUp };
    placed.push(chosen);
    out.set(item.id, chosen);
  }
  return out;
}

export function Field({ play, against, againstName, ringSide, t, win, dot = 14, refWidth = 700, focus = [], spot }: FieldProps) {
  const height = win.yHi - win.yLo;
  const top = (y: number): string => pct(((win.yHi - y) / height) * 100);
  const left = (x: number): string => pct((x / FIELD_WIDTH_YARDS) * 100);
  const where: BallSpot = spot ?? play.spot;
  const ox = spotOffset(play.level, where);
  const hot = new Set(against ? gapsAt(play, against, t, 1, ringSide) : []);

  const lines: number[] = [];
  for (let y = Math.ceil(win.yLo / 5) * 5; y <= win.yHi; y += 5) lines.push(y);

  const marks = play.tracks.map((track) => {
    const p = pos(track, t);
    return { track, x: p.x + ox, y: p.y, topValue: ((win.yHi - p.y) / height) * 100, left: left(p.x + ox), top: top(p.y) };
  });
  const labelled = marks.filter((m) => focus.includes(m.track.id) || hot.has(m.track.id));
  const tagPlaces = placeTags(
    labelled.map((m) => ({ id: m.track.id, x: m.x, y: m.y, defaultUp: !(m.track.side === 'offense' || m.topValue < 10) })),
  );
  const dotSize = `clamp(${Math.max(8, Math.round(dot * 0.65))}px, ${((dot / refWidth) * 100).toFixed(2)}%, ${dot}px)`;
  const hashStyle = {
    background: `repeating-linear-gradient(to bottom, var(--rule2) 0, var(--rule2) 1px, transparent 1px, transparent ${(100 / height).toFixed(4)}%)`,
  };
  const hashes = HASHES[play.level];
  const ball = ballX(play.level, where);

  return (
    <div className="fieldwrap">
      <div
        className="fld"
        role="img"
        aria-label={describeField({ play, against, againstName, ringSide, t, focus, spot: where })}
        style={{ aspectRatio: `${FIELD_WIDTH_YARDS} / ${height}` }}
      >
        <div className="hash" aria-hidden="true" style={{ ...hashStyle, left: left(hashes.left) }} />
        <div className="hash" aria-hidden="true" style={{ ...hashStyle, left: left(hashes.right) }} />
        {lines.map((y) => (y === 0 ? <div key={y} className="los" style={{ top: top(0) }} /> : <div key={y} className="yl" style={{ top: top(y) }} />))}
        <div className="ball" aria-hidden="true" style={{ left: left(ball), top: top(0) }} />
        {marks.map(({ track, left: l, top: tp }) => (
          <div
            key={track.id}
            className={`dot ${track.side === 'offense' ? 'o' : 'd'}${hot.has(track.id) ? ' x' : ''}`}
            style={{ left: l, top: tp, width: dotSize, aspectRatio: '1' }}
          />
        ))}
        {labelled.map(({ track, left: l, top: tp }) => {
          const place = tagPlaces.get(track.id)!;
          const shift = place.x - marks.find((m) => m.track.id === track.id)!.x;
          return (
            <span
              key={track.id}
              className={`tag${place.up ? ' up' : ''}`}
              aria-hidden="true"
              style={{
                left: shift === 0 ? l : left(place.x),
                top: tp,
                marginTop: place.up ? -(dot / 2 + 3) : dot / 2 + 3,
              }}
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
  /** Which hash marks the field shows, when the legend should say so. */
  level?: keyof typeof LEVEL_LABELS;
}

export function FieldLegend({ against = false, time, pause, level }: LegendProps) {
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
      {level ? (
        <span className="k">
          <span className="mk mkb" aria-hidden="true" style={{ width: 12, height: 8 }} />
          Ball and {LEVEL_LABELS[level]} hash marks
        </span>
      ) : null}
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
