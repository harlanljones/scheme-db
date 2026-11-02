// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LitePlay, LiteTrack } from '../../lib/field';
import PlayCompare, { type CompareProp } from '../PlayCompare';
import PlayViewer from '../PlayViewer';
import { setPlayState } from '../playState';

const track = (id: string, side: LiteTrack['side'], w: LiteTrack['w']): LiteTrack => ({ id, side, role: side === 'offense' ? 'wr' : 'db', w });
const still = (id: string, side: LiteTrack['side'], x: number, y: number): LiteTrack => track(id, side, [[0, x, y], [2, x, y]]);

const motion: LiteTrack['w'] = [[-1.6, 46, -1.5]];
for (let t = -1.4; t <= 1e-9; t += 0.2) motion.push([Math.round(t * 10) / 10, 46 - 6 * (t + 1.6), -1.5]);
motion.push([2, 28, -1.5]);

const play = (leadIn: number, z: LiteTrack['w']): LitePlay => ({
  id: leadIn ? 'with-lead' : 'no-lead',
  name: leadIn ? 'With lead' : 'No lead',
  duration: 2,
  leadIn,
  level: 'nfl',
  spot: 'middle',
  scored: 'offense',
  tracks: [track('Z', 'offense', z), still('X', 'offense', 7, -0.5), still('FS', 'defense', 26.67, 12)],
});
const withLead = play(1.6, motion);
const noLead = play(0, [[0, 46, -1.5], [2, 28, -1.5]]);
const win = { yLo: -5, yHi: 20 };
const beats = [{ t: 0.4, title: '1. First', text: 'A beat.', focus: ['Z'] }];

const viewer = (p: LitePlay) => <PlayViewer play={JSON.stringify(p)} win={win} beats={beats} duration={p.duration} />;
const input = (container: HTMLElement, id: string) => container.querySelector<HTMLInputElement>(`#${id}`)!;
const live = (container: HTMLElement) => container.querySelector('[aria-live="polite"]')!.textContent;

beforeEach(() => act(() => setPlayState({ t: 1.2, playing: false, compareId: null })));
afterEach(cleanup);

describe('PlayViewer with a lead in', () => {
  it('runs the scrubber from the start of the lead in to the end of the play', () => {
    const { container } = render(viewer(withLead));
    const range = input(container, 'scrub-t');
    expect(range.min).toBe('-16');
    expect(range.max).toBe('20');
  });

  it('says "before the snap" in the live line, the readout and the scrubber text', () => {
    const { container } = render(viewer(withLead));
    act(() => setPlayState({ t: -1, playing: false }));
    expect(live(container)).toBe('1.0 s before the snap. Z is in motion.');
    expect(container.querySelector('.transport')!.textContent).toContain('1.0 s before the snap');
    expect(input(container, 'scrub-t').getAttribute('aria-valuetext')).toBe('1.0 seconds before the snap');
    expect(container.querySelector('.fld')!.getAttribute('aria-label')).toContain('1.0 seconds before the snap');
  });

  it('labels SET, MOTION and SNAP under the scrubber, and offers a button to jump to the snap', () => {
    const { container } = render(viewer({ ...withLead, tracks: withLead.tracks.map((t) => (t.id === 'Z' ? track('Z', 'offense', [[-2, 46, -1.5], ...withLead.tracks[0].w]) : t)), leadIn: 2 }));
    const labels = [...container.querySelectorAll('.phase')].map((node) => node.textContent);
    expect(labels).toEqual(['SET', 'MOTION', 'SNAP']);
    const snap = [...container.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Jump to the snap')!;
    act(() => setPlayState({ t: -1, playing: false }));
    act(() => snap.click());
    expect(input(container, 'scrub-t').value).toBe('0');
  });

  it('starts the first press of Play at the beginning of the lead in', () => {
    const { container } = render(viewer(withLead));
    // The page opens on a still frame; a first press, or a press at the end of the play, starts from the beginning.
    act(() => setPlayState({ t: withLead.duration, playing: false }));
    const playButton = container.querySelector<HTMLButtonElement>('button[aria-label="Play"]')!;
    act(() => playButton.click());
    expect(Number(input(container, 'scrub-t').value)).toBeLessThanOrEqual(-15);
    act(() => setPlayState({ playing: false }));
  });

  it('steps through the start, the snap and the beats with previous and next', () => {
    const { container } = render(viewer(withLead));
    const next = container.querySelector<HTMLButtonElement>('button[aria-label="Next beat"]')!;
    const prev = container.querySelector<HTMLButtonElement>('button[aria-label="Previous beat"]')!;
    act(() => setPlayState({ t: -1.6, playing: false }));
    act(() => next.click());
    expect(input(container, 'scrub-t').value).toBe('0');
    act(() => next.click());
    expect(input(container, 'scrub-t').value).toBe('4');
    act(() => prev.click());
    expect(input(container, 'scrub-t').value).toBe('0');
    act(() => prev.click());
    expect(input(container, 'scrub-t').value).toBe('-16');
  });
});

describe('PlayViewer with no lead in', () => {
  it('looks exactly as it did: scrubber from 0, no phases, no Snap button, "after the snap" text', () => {
    const { container } = render(viewer(noLead));
    const range = input(container, 'scrub-t');
    expect(range.min).toBe('0');
    expect(range.max).toBe('20');
    expect(container.querySelector('.phases')).toBeNull();
    expect(container.querySelector('.scrub')!.className).toBe('scrub js-only');
    expect(container.querySelector('button[aria-label="Jump to the snap"]')).toBeNull();
    expect(range.getAttribute('aria-valuetext')).toBe('1.2 seconds after the snap');
    expect(container.querySelector('label[for="scrub-t"]')!.textContent).toBe('Time after the snap in tenths of a second');
    expect(live(container)).toBe('Beat 1 of 1: First, 0.4 seconds after the snap.');
  });

  it('starts the first press of Play at the snap', () => {
    const { container } = render(viewer(noLead));
    act(() => setPlayState({ t: noLead.duration, playing: false }));
    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="Play"]')!.click());
    expect(Number(input(container, 'scrub-t').value)).toBeGreaterThanOrEqual(0);
    act(() => setPlayState({ playing: false }));
  });
});

describe('PlayCompare with a lead in', () => {
  const other = (p: LitePlay): CompareProp => ({
    id: p.id,
    sheet: 'Sheet 2',
    name: p.name,
    score: 70,
    atEnd: 60,
    breakSeconds: 0.4,
    profile: Array.from({ length: 13 }, (_, i) => 90 - i * 3),
    paired: 11,
    total: 11,
    tellName: 'Tell',
    tell: 'The tell.',
    play: JSON.stringify(p),
  });
  const compare = (base: LitePlay, cmp: LitePlay) => (
    <PlayCompare base={JSON.stringify(base)} side="offense" baseSheet="Sheet 1" baseName={base.name} duration={base.duration} comparisons={[other(cmp)]} holdPercent={80} windowSeconds={1.2} />
  );

  it('shares one clock that runs from the longer lead in of the two plays', () => {
    const { container } = render(compare(noLead, withLead));
    expect(input(container, 'scrub-t2').min).toBe('-16');
    cleanup();
    const both = render(compare(withLead, noLead));
    expect(input(both.container, 'scrub-t2').min).toBe('-16');
  });

  it('says the score starts at the snap, and keeps the chart and the note to 0 to 1.2 s', () => {
    const { container } = render(compare(noLead, withLead));
    act(() => setPlayState({ t: -1, playing: false }));
    expect(container.querySelector('.score [aria-live]')!.textContent).toBe('1.0 s before the snap. The score starts at the snap.');
    expect(container.textContent).toContain('count only the first 1.2 s after the snap');
    expect(container.querySelectorAll('.chart .bar.cur')).toHaveLength(0);
    act(() => setPlayState({ t: 0.5, playing: false }));
    expect(container.querySelector('.score [aria-live]')!.textContent).toBe('At 0.5 s the two plays score 75% alike.');
    expect(container.querySelectorAll('.chart .bar.cur')).toHaveLength(1);
  });

  it('is unchanged when neither play has a lead in: scrubber from 0 and no note', () => {
    const { container } = render(compare(noLead, { ...noLead, id: 'other' }));
    expect(input(container, 'scrub-t2').min).toBe('0');
    expect(container.textContent).not.toContain('count only the first');
    expect(container.querySelector('label[for="scrub-t2"]')!.textContent).toContain('Time after the snap');
  });
});
