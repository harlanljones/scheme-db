import { useEffect, useMemo, useState } from 'react';
import { parsePlay, type FieldWindow } from '../lib/field';
import { Field, FieldLegend } from './Field';

interface Props {
  /** The play as JSON, to keep the page small. */
  play: string;
  win: FieldWindow;
  focus: string[];
  dot: number;
}

/** Seconds of the loop: a beat at the snap, the first 1.2 s at one third speed, then a hold on the last frame. */
const CYCLE = 5.4;
const HOLD_START = 0.6;
const RUN_END = 4.2;
const WINDOW = 1.2;

function timeAt(c: number): number {
  if (c < HOLD_START) return 0;
  if (c < RUN_END) return ((c - HOLD_START) / (RUN_END - HOLD_START)) * WINDOW;
  return WINDOW;
}

/**
 * The home page figure. The static HTML shows the first 1.2 s frozen at 1.2 s, which is also what people who
 * ask for reduced motion keep. Everyone else gets the loop and a pause button.
 */
export default function HeroField({ play: json, win, focus, dot }: Props) {
  const play = useMemo(() => parsePlay(json), [json]);
  const [still, setStill] = useState(true);
  const [paused, setPaused] = useState(false);
  const [clock, setClock] = useState(RUN_END + 0.01);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setStill(query.matches);
      if (!query.matches) setClock(0);
    };
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (still || paused) return;
    const id = window.setInterval(() => setClock((c) => (c + 0.06) % CYCLE), 60);
    return () => window.clearInterval(id);
  }, [still, paused]);

  const t = still ? WINDOW : timeAt(clock);
  const time = `t = ${t.toFixed(1)} s${still ? '' : ', one third speed'}`;

  return (
    <div>
      <Field play={play} t={t} win={win} dot={dot} refWidth={640} focus={focus} animated={!still} />
      <FieldLegend time={time} pause={still ? undefined : { paused, onToggle: () => setPaused((p) => !p) }} />
    </div>
  );
}
