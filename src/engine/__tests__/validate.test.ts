import { describe, it, expect } from 'vitest';
import { validatePlay, validateLibrary } from '../validate';
import type { Play, PlayerTrack } from '../types';
import { playById } from './fixtures';

function createDummyTrack(id: string, side: 'offense' | 'defense'): PlayerTrack {
  return {
    id,
    label: id,
    side,
    role: side === 'offense' ? 'ol' : 'dl',
    trail: 'none',
    waypoints: [
      { t: 0, x: 26.67, y: side === 'offense' ? -1 : 1 },
      { t: 3.0, x: 26.67, y: side === 'offense' ? 0 : 0 },
    ],
  };
}

function createValidPlay(): Play {
  const offenseIds = ['LT', 'LG', 'C', 'RG', 'RT', 'TE', 'QB', 'FB', 'RB', 'X', 'Z'];
  const defenseIds = ['WDE', 'NT', '3T', 'SDE', 'WILL', 'MIKE', 'SAM', 'LCB', 'RCB', 'SS', 'FS'];

  return {
    id: 'valid-play',
    name: 'Valid Play',
    coach: 'shanahan',
    family: 'wide-zone',
    personnel: '21',
    formation: 'Offset I',
    situation: '1st & 10',
    coverage: 'Cover 3',
    frontName: 'Over',
    duration: 3.0,
    offense: offenseIds.map((id) => createDummyTrack(id, 'offense')),
    defense: defenseIds.map((id) => createDummyTrack(id, 'defense')),
    beats: [
      { t: 1.0, title: 'Beat 1', text: 'Text 1', focus: ['QB', 'RB'] },
      { t: 2.0, title: 'Beat 2', text: 'Text 2', focus: ['MIKE'] },
    ],
    summary: {
      motive: 'Gain yards',
      keyDefender: 'MIKE',
      whyItWorks: 'Stretches front',
      failureMode: 'Penetration',
    },
    sequence: {
      setsUp: [],
      playsOff: [],
      tell: 'None',
    },
  };
}

describe('validate engine', () => {
  it('passes on a fully valid play', () => {
    const play = createValidPlay();
    const problems = validatePlay(play);
    expect(problems).toEqual([]);
  });

  it('validates an authored play from data/ with 0 errors or warnings', () => {
    expect(validatePlay(playById('outside-zone'))).toEqual([]);
  });

  it('fails if offense or defense does not have exactly 11 players', () => {
    const play = createValidPlay();
    play.offense.pop(); // 10 offense
    play.defense.push(createDummyTrack('EXTRA_DEF', 'defense')); // 12 defense

    const problems = validatePlay(play);
    expect(problems.some((p) => p.includes('Offense must have exactly 11 players'))).toBe(true);
    expect(problems.some((p) => p.includes('Defense must have exactly 11 players'))).toBe(true);
  });

  it('fails if duplicate player id exists', () => {
    const play = createValidPlay();
    play.defense[0].id = 'LT'; // LT already in offense

    const problems = validatePlay(play);
    expect(problems.some((p) => p.includes('Duplicate player id "LT"'))).toBe(true);
  });

  it('fails if first waypoint is not t=0', () => {
    const play = createValidPlay();
    play.offense[0].waypoints[0].t = 0.5;

    const problems = validatePlay(play);
    expect(problems.some((p) => p.includes('first waypoint must have t === 0'))).toBe(true);
  });

  it('fails if waypoints are not in chronological ascending order', () => {
    const play = createValidPlay();
    play.offense[0].waypoints = [
      { t: 0, x: 26, y: 0 },
      { t: 2.0, x: 26, y: 1 },
      { t: 1.5, x: 26, y: 2 },
    ];

    const problems = validatePlay(play);
    expect(problems.some((p) => p.includes('waypoints not sorted ascending by t'))).toBe(true);
  });

  it('fails if waypoint time exceeds play duration', () => {
    const play = createValidPlay();
    play.offense[0].waypoints.push({ t: 4.5, x: 26, y: 3 }); // play duration is 3.0

    const problems = validatePlay(play);
    expect(problems.some((p) => p.includes('exceeds play duration'))).toBe(true);
  });

  it('warns if player coordinate x is outside the numbered field [0, 53.33]', () => {
    const play = createValidPlay();
    play.offense[0].waypoints[1].x = 55.0;

    const problems = validatePlay(play);
    expect(problems.some((p) => p.includes('warn: x=55 outside numbered field'))).toBe(true);
  });

  it('fails if beat time exceeds duration or beats not sorted', () => {
    const play = createValidPlay();
    play.beats = [
      { t: 2.5, title: 'Late Beat', text: '' },
      { t: 1.0, title: 'Early Beat', text: '' },
      { t: 4.0, title: 'Exceeding Beat', text: '' },
    ];

    const problems = validatePlay(play);
    expect(problems.some((p) => p.includes('Beats not sorted ascending by t'))).toBe(true);
    expect(problems.some((p) => p.includes('exceeds play duration'))).toBe(true);
  });

  it('fails if beat focus references a non-existent player', () => {
    const play = createValidPlay();
    play.beats[0].focus = ['NON_EXISTENT_PLAYER'];

    const problems = validatePlay(play);
    expect(problems.some((p) => p.includes('focus id "NON_EXISTENT_PLAYER" does not exist'))).toBe(true);
  });

  it('validateLibrary detects broken cross-play references in sequence', () => {
    const play1 = createValidPlay();
    play1.id = 'play-1';
    play1.sequence.setsUp = ['play-2', 'missing-play'];
    play1.sequence.playsOff = ['play-3'];

    const play2 = createValidPlay();
    play2.id = 'play-2';

    const libResults = validateLibrary([play1, play2]);
    expect(libResults['play-1'].some((p) => p.includes('references non-existent play id "missing-play"'))).toBe(true);
    expect(libResults['play-1'].some((p) => p.includes('references non-existent play id "play-3"'))).toBe(true);
    expect(libResults['play-2']).toEqual([]);
  });
});
