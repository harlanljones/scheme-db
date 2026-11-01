import { useEffect, useMemo, useRef, useState } from 'react';
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
 * ask for reduced motion keep. Everyone else gets the loop and a pause button. The loop runs on real elapsed
 * time and stops while the figure is off screen or the tab is hidden.
 */
export default function HeroField({ play: json, win, focus, dot }: Props) {
  const play = useMemo(() => parsePlay(json), [json]);
  const root = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
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
    const node = root.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => setVisible(entries.some((entry) => entry.isIntersecting)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (still || paused || !visible) return;
    let last = performance.now();
    let frame = 0;
    const step = (now: number) => {
      // A hidden tab can hand us a huge gap; never skip more than a tenth of a second.
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setClock((c) => (c + dt) % CYCLE);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [still, paused, visible]);

  const t = still ? WINDOW : timeAt(clock);
  const time = `t = ${t.toFixed(1)} s${still ? '' : ', one third speed'}`;

  return (
    <div ref={root}>
      <Field play={play} t={t} win={win} dot={dot} refWidth={640} focus={focus} />
      <FieldLegend level={play.level} time={time} pause={still ? undefined : { paused, onToggle: () => setPaused((p) => !p) }} />
    </div>
  );
}
