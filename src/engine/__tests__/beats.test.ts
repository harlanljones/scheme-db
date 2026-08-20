import { describe, it, expect } from 'vitest';
import { activeBeatIndex, isFocused } from '../beats';
import type { Beat } from '../types';

describe('beats engine', () => {
  const beats: Beat[] = [
    { t: 0.5, title: 'The Reach Step', text: 'Playside tackle reaches.', focus: ['LT', 'LG'] },
    { t: 1.2, title: 'The Mike Commits', text: 'Mike flows hard left.', focus: ['MIKE', 'RB'] },
    { t: 2.5, title: 'Cutback Decision', text: 'Back presses the edge.', focus: ['RB'] },
  ];

  it('returns -1 when t is before the first beat or beats list is empty', () => {
    expect(activeBeatIndex(beats, 0.0)).toBe(-1);
    expect(activeBeatIndex(beats, 0.49)).toBe(-1);
    expect(activeBeatIndex([], 1.0)).toBe(-1);
  });

  it('returns exact index at beat boundaries', () => {
    expect(activeBeatIndex(beats, 0.5)).toBe(0);
    expect(activeBeatIndex(beats, 1.2)).toBe(1);
    expect(activeBeatIndex(beats, 2.5)).toBe(2);
  });

  it('returns appropriate active beat between timestamps and after the last beat', () => {
    expect(activeBeatIndex(beats, 0.8)).toBe(0);
    expect(activeBeatIndex(beats, 1.5)).toBe(1);
    expect(activeBeatIndex(beats, 3.5)).toBe(2);
  });

  it('isFocused correctly identifies focused player IDs', () => {
    const beat = beats[1]; // focus: ['MIKE', 'RB']
    expect(isFocused(beat, 'MIKE')).toBe(true);
    expect(isFocused(beat, 'RB')).toBe(true);
    expect(isFocused(beat, 'LT')).toBe(false);
    expect(isFocused(undefined, 'MIKE')).toBe(false);

    const beatNoFocus: Beat = { t: 0, title: 'Snap', text: 'Ball snapped' };
    expect(isFocused(beatNoFocus, 'MIKE')).toBe(false);
  });
});
