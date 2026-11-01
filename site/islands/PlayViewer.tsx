import { useEffect, useMemo, useRef } from 'react';
import { parsePlay, type FieldWindow } from '../lib/field';
import { ROLE_WORDS } from '../lib/format';
import { Field, FieldLegend } from './Field';
import { setPlayState, tenth, usePlayState } from './playState';

export interface BeatProp {
  t: number;
  title: string;
  text: string;
  focus: string[];
}

interface Props {
  play: string;
  win: FieldWindow;
  beats: BeatProp[];
  duration: number;
}

const stripNumber = (title: string): string => title.replace(/^\d+\.\s*/, '');
const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));

/** The field, transport, scrubber and coaching points of one play, all driven by one clock. */
export default function PlayViewer({ play: json, win, beats, duration }: Props) {
  const play = useMemo(() => parsePlay(json), [json]);
  const { t, playing, speed } = usePlayState();

  const clock = useRef({ t, speed });
  useEffect(() => {
    clock.current = { t, speed };
  });

  // Playback: advance the shared clock with the frame clock, stop at the end of the play.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = Math.min(duration, clock.current.t + dt * clock.current.speed);
      if (next >= duration) {
        setPlayState({ t: duration, playing: false });
        return;
      }
      setPlayState({ t: next });
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);

  let active = -1;
  beats.forEach((b, i) => {
    if (t >= b.t - 0.001) active = i;
  });
  const focus = active >= 0 ? beats[active].focus : [];
  const roleOf = (id: string): string => ROLE_WORDS[play.tracks.find((track) => track.id === id)?.role ?? ''] ?? 'player';
  const goTo = (to: number) => setPlayState({ t: to, playing: false });

  const prevBeat = () => {
    let to = 0;
    beats.forEach((b) => {
      if (b.t < t - 0.05) to = b.t;
    });
    goTo(to);
  };
  const nextBeat = () => {
    const next = beats.find((b) => b.t > t + 0.05);
    goTo(next ? next.t : duration);
  };

  const live =
    active < 0
      ? 'Before the first beat.'
      : `Beat ${active + 1} of ${beats.length}: ${stripNumber(beats[active].title)}.`;

  return (
    <div className="viewer">
    <div className="stage">
      <Field play={play} t={t} win={win} dot={18} refWidth={700} focus={focus} animated={playing} />
      <FieldLegend />

      <div className="transport">
        <button className="ibtn" type="button" aria-label="Previous beat" onClick={prevBeat}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 5h3v14H6zM19 5v14l-9-7z" />
          </svg>
        </button>
        <button
          className="ibtn solid"
          type="button"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => setPlayState(playing ? { playing: false } : { playing: true, t: t >= duration ? 0 : t })}
        >
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button className="ibtn" type="button" aria-label="Next beat" onClick={nextBeat}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M15 5h3v14h-3zM5 5v14l9-7z" />
          </svg>
        </button>
        <p className="type" style={{ fontSize: 15, lineHeight: '20px', fontWeight: 700 }}>
          {t.toFixed(1)} s <span style={{ fontWeight: 400, color: 'var(--fg2)' }}>of {duration.toFixed(1)} s</span>
        </p>
        <div role="group" aria-label="Playback speed" className="speed">
          <button className="pill" type="button" aria-pressed={speed === 0.5} onClick={() => setPlayState({ speed: 0.5 })}>
            0.5x
          </button>
          <button className="pill" type="button" aria-pressed={speed === 1} onClick={() => setPlayState({ speed: 1 })}>
            1x
          </button>
        </div>
      </div>

      <div className="scrub">
        <label htmlFor="scrub-t" className="sr">
          Time after the snap in tenths of a second
        </label>
        <input
          id="scrub-t"
          type="range"
          min={0}
          max={Math.round(duration * 10)}
          step={1}
          value={Math.round(t * 10)}
          aria-valuetext={`${tenth(t).toFixed(1)} seconds after the snap`}
          onChange={(e) => goTo(Number(e.target.value) / 10)}
        />
        {beats.map((b, i) => (
          <span key={b.t} className="tick" aria-hidden="true" style={{ left: `${(b.t / duration) * 100}%` }}>
            {i + 1}
          </span>
        ))}
      </div>

      <p aria-live="polite" style={{ fontSize: 15, lineHeight: '22px', color: 'var(--fg)' }}>
        {live}
      </p>
      <p className="mono-small">
        {active < 0
          ? 'Labels appear at each beat.'
          : `Labeled now: ${focus.map((id) => `${id}, ${roleOf(id)}`).join('; ')}.`}
      </p>

    </div>
      <PointsList beats={beats} active={active} onPick={goTo} />
    </div>
  );
}

function PointsList({ beats, active, onPick }: { beats: BeatProp[]; active: number; onPick: (t: number) => void }) {
  return (
    <div className="points">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '4px 16px' }}>
        <h2 className="slab" style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 700 }}>
          Coaching points
        </h2>
        <p className="mono-small">{beats.length} beats</p>
      </div>
      <p className="small" style={{ fontSize: 14, lineHeight: '20px' }}>
        Pick a beat to jump the field to that moment. The ticks under the scrubber mark the same {beats.length} beats.
      </p>
      <ol className="beats">
        {beats.map((b, i) => (
          <li key={b.t}>
            <button className="beat" type="button" aria-current={i === active ? 'step' : undefined} onClick={() => onPick(b.t)}>
              <span className="n">{pad2(i + 1)}</span>
              <span style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2px 12px', alignItems: 'baseline' }}>
                <span className="slab" style={{ fontSize: 18, lineHeight: '24px', fontWeight: 600 }}>
                  {stripNumber(b.title)}
                </span>
                <span className="type" style={{ fontSize: 13, lineHeight: '24px', color: 'var(--fg2)', whiteSpace: 'nowrap' }}>
                  {b.t.toFixed(1)} s
                </span>
              </span>
              <span style={{ fontSize: 14, lineHeight: '21px', color: 'var(--fg2)' }}>{b.text}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

