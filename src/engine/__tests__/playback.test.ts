import { describe, it, expect } from 'vitest';
import { formatTimecode } from '../playback';

describe('playback and timeline formatting', () => {
  it('formats timecode correctly to mm:ss.cc format', () => {
    expect(formatTimecode(0)).toBe('00:00.00');
    expect(formatTimecode(1.2)).toBe('00:01.20');
    expect(formatTimecode(3.45)).toBe('00:03.45');
    expect(formatTimecode(4)).toBe('00:04.00');
    expect(formatTimecode(65.15)).toBe('01:05.15');
  });

  it('handles negative or NaN values safely', () => {
    expect(formatTimecode(-1.5)).toBe('00:00.00');
    expect(formatTimecode(NaN)).toBe('00:00.00');
  });
});
