import { describe, it, expect } from 'vitest';
import { validatePlay, validateLibrary } from '../validate';
import type { Play, PlayerTrack } from '../types';
import { outsideZone } from '../../data/schemes/shanahan/outside-zone';
import { SHANAHAN_WIDE_ZONE_PLAYS } from '../../data/schemes/shanahan/index';
import { KUBIAK_SPLIT_ZONE_PLAYS } from '../../data/schemes/kubiak/index';
import { SALEH_WIDE9_PLAYS } from '../../data/schemes/saleh/index';
import { MACDONALD_HYBRID_PLAYS } from '../../data/schemes/macdonald/index';
import { FANGIO_TWO_HIGH_PLAYS } from '../../data/schemes/fangio/index';
import { REID_SPREAD_RPO_PLAYS } from '../../data/schemes/reid/index';
import { FLORES_PSYCHO_PLAYS } from '../../data/schemes/flores/index';
import { MCVAY_DUO_PLAYS } from '../../data/schemes/mcvay/index';
import { MCDANIEL_SPEED_PLAYS } from '../../data/schemes/mcdaniel/index';
import { STEFANSKI_GAP_PLAYS } from '../../data/schemes/stefanski/index';
import { STEICHEN_RPO_PLAYS } from '../../data/schemes/steichen/index';
import { LAFLEUR_ILLUSION_PLAYS } from '../../data/schemes/lafleur/index';
import { SIRIANNI_POWER_PLAYS } from '../../data/schemes/sirianni/index';
import { JOHNSON_DECEPTION_PLAYS } from '../../data/schemes/johnson/index';
import { MINTER_AMOEBA_PLAYS } from '../../data/schemes/minter/index';
import { RYANS_ATTACK_PLAYS } from '../../data/schemes/ryans/index';
import { SHULA_MATCH_PLAYS } from '../../data/schemes/shula/index';
import { SPAGNUOLO_BLITZ_PLAYS } from '../../data/schemes/spagnuolo/index';
import { QUINN_PRESS_PLAYS } from '../../data/schemes/quinn/index';
import { BOWLES_CREEPER_PLAYS } from '../../data/schemes/bowles/index';
import { ALL_PLAYS, ALL_SCHEME_FAMILIES } from '../../data/schemes/index';

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

  it('validates authored outsideZone play with 0 errors', () => {
    const problems = validatePlay(outsideZone);
    expect(problems).toEqual([]);
  });

  it('validates the entire Shanahan wide zone play library with 0 errors or warnings', () => {
    expect(SHANAHAN_WIDE_ZONE_PLAYS.length).toBe(4);
    const libResults = validateLibrary(SHANAHAN_WIDE_ZONE_PLAYS);
    for (const play of SHANAHAN_WIDE_ZONE_PLAYS) {
      expect(libResults[play.id], `Validation failed for play "${play.id}"`).toEqual([]);
    }
  });

  it('validates the entire Klint Kubiak play library with 0 errors or warnings', () => {
    expect(KUBIAK_SPLIT_ZONE_PLAYS.length).toBe(4);
    const libResults = validateLibrary(KUBIAK_SPLIT_ZONE_PLAYS);
    for (const play of KUBIAK_SPLIT_ZONE_PLAYS) {
      expect(libResults[play.id], `Validation failed for Kubiak play "${play.id}"`).toEqual([]);
    }
  });

  it('validates the entire Robert Saleh 4-3 Wide-9 play library with 0 errors or warnings', () => {
    expect(SALEH_WIDE9_PLAYS.length).toBe(4);
    const libResults = validateLibrary(SALEH_WIDE9_PLAYS);
    for (const play of SALEH_WIDE9_PLAYS) {
      expect(libResults[play.id], `Validation failed for Saleh play "${play.id}"`).toEqual([]);
    }
  });

  it('validates the entire Mike Macdonald hybrid disguise play library with 0 errors or warnings', () => {
    expect(MACDONALD_HYBRID_PLAYS.length).toBe(4);
    const libResults = validateLibrary(MACDONALD_HYBRID_PLAYS);
    for (const play of MACDONALD_HYBRID_PLAYS) {
      expect(libResults[play.id], `Validation failed for Macdonald play "${play.id}"`).toEqual([]);
    }
  });

  it('validates the entire Vic Fangio two-high shell play library with 0 errors or warnings', () => {
    expect(FANGIO_TWO_HIGH_PLAYS.length).toBe(4);
    const libResults = validateLibrary(FANGIO_TWO_HIGH_PLAYS);
    for (const play of FANGIO_TWO_HIGH_PLAYS) {
      expect(libResults[play.id], `Validation failed for Fangio play "${play.id}"`).toEqual([]);
    }
  });

  it('validates the entire Andy Reid Spread-RPO & Mesh play library with 0 errors or warnings', () => {
    expect(REID_SPREAD_RPO_PLAYS.length).toBe(4);
    const libResults = validateLibrary(REID_SPREAD_RPO_PLAYS);
    for (const play of REID_SPREAD_RPO_PLAYS) {
      expect(libResults[play.id], `Validation failed for Reid play "${play.id}"`).toEqual([]);
    }
  });

  it('validates the entire Brian Flores psycho front & Cover 0 play library with 0 errors or warnings', () => {
    expect(FLORES_PSYCHO_PLAYS.length).toBe(4);
    const libResults = validateLibrary(FLORES_PSYCHO_PLAYS);
    for (const play of FLORES_PSYCHO_PLAYS) {
      expect(libResults[play.id], `Validation failed for Flores play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Sean McVay Duo play library with 0 errors or warnings', () => {
    expect(MCVAY_DUO_PLAYS.length).toBe(4);
    const libResults = validateLibrary(MCVAY_DUO_PLAYS);
    for (const play of MCVAY_DUO_PLAYS) {
      expect(libResults[play.id], `Validation failed for McVay play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Mike McDaniel Speed Cheat-Motion play library with 0 errors or warnings', () => {
    expect(MCDANIEL_SPEED_PLAYS.length).toBe(4);
    const libResults = validateLibrary(MCDANIEL_SPEED_PLAYS);
    for (const play of MCDANIEL_SPEED_PLAYS) {
      expect(libResults[play.id], `Validation failed for McDaniel play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Kevin Stefanski Multi-TE Gap play library with 0 errors or warnings', () => {
    expect(STEFANSKI_GAP_PLAYS.length).toBe(4);
    const libResults = validateLibrary(STEFANSKI_GAP_PLAYS);
    for (const play of STEFANSKI_GAP_PLAYS) {
      expect(libResults[play.id], `Validation failed for Stefanski play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Shane Steichen QB Mesh & RPO play library with 0 errors or warnings', () => {
    expect(STEICHEN_RPO_PLAYS.length).toBe(4);
    const libResults = validateLibrary(STEICHEN_RPO_PLAYS);
    for (const play of STEICHEN_RPO_PLAYS) {
      expect(libResults[play.id], `Validation failed for Steichen play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Matt LaFleur Illusion of Complexity play library with 0 errors or warnings', () => {
    expect(LAFLEUR_ILLUSION_PLAYS.length).toBe(4);
    const libResults = validateLibrary(LAFLEUR_ILLUSION_PLAYS);
    for (const play of LAFLEUR_ILLUSION_PLAYS) {
      expect(libResults[play.id], `Validation failed for LaFleur play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Nick Sirianni Power RPO play library with 0 errors or warnings', () => {
    expect(SIRIANNI_POWER_PLAYS.length).toBe(4);
    const libResults = validateLibrary(SIRIANNI_POWER_PLAYS);
    for (const play of SIRIANNI_POWER_PLAYS) {
      expect(libResults[play.id], `Validation failed for Sirianni play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Ben Johnson Counter Deception play library with 0 errors or warnings', () => {
    expect(JOHNSON_DECEPTION_PLAYS.length).toBe(4);
    const libResults = validateLibrary(JOHNSON_DECEPTION_PLAYS);
    for (const play of JOHNSON_DECEPTION_PLAYS) {
      expect(libResults[play.id], `Validation failed for Johnson play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Jesse Minter Amoeba & Creeper play library with 0 errors or warnings', () => {
    expect(MINTER_AMOEBA_PLAYS.length).toBe(4);
    const libResults = validateLibrary(MINTER_AMOEBA_PLAYS);
    for (const play of MINTER_AMOEBA_PLAYS) {
      expect(libResults[play.id], `Validation failed for Minter play "${play.id}"`).toEqual([]);
    }
  });

  it('validates DeMeco Ryans Wide-9 Attack play library with 0 errors or warnings', () => {
    expect(RYANS_ATTACK_PLAYS.length).toBe(4);
    const libResults = validateLibrary(RYANS_ATTACK_PLAYS);
    for (const play of RYANS_ATTACK_PLAYS) {
      expect(libResults[play.id], `Validation failed for Ryans play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Chris Shula Match Quarters play library with 0 errors or warnings', () => {
    expect(SHULA_MATCH_PLAYS.length).toBe(4);
    const libResults = validateLibrary(SHULA_MATCH_PLAYS);
    for (const play of SHULA_MATCH_PLAYS) {
      expect(libResults[play.id], `Validation failed for Shula play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Steve Spagnuolo Exotic Blitz play library with 0 errors or warnings', () => {
    expect(SPAGNUOLO_BLITZ_PLAYS.length).toBe(4);
    const libResults = validateLibrary(SPAGNUOLO_BLITZ_PLAYS);
    for (const play of SPAGNUOLO_BLITZ_PLAYS) {
      expect(libResults[play.id], `Validation failed for Spagnuolo play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Dan Quinn Cover 3 Press play library with 0 errors or warnings', () => {
    expect(QUINN_PRESS_PLAYS.length).toBe(4);
    const libResults = validateLibrary(QUINN_PRESS_PLAYS);
    for (const play of QUINN_PRESS_PLAYS) {
      expect(libResults[play.id], `Validation failed for Quinn play "${play.id}"`).toEqual([]);
    }
  });

  it('validates Todd Bowles Creeper Blitz play library with 0 errors or warnings', () => {
    expect(BOWLES_CREEPER_PLAYS.length).toBe(4);
    const libResults = validateLibrary(BOWLES_CREEPER_PLAYS);
    for (const play of BOWLES_CREEPER_PLAYS) {
      expect(libResults[play.id], `Validation failed for Bowles play "${play.id}"`).toEqual([]);
    }
  });

  it('validates all 25 scheme families are registered (15 Offense, 10 Defense)', () => {
    expect(ALL_SCHEME_FAMILIES.length).toBe(25);
    const offenseFamilies = ALL_SCHEME_FAMILIES.filter((f) => f.category === 'offense');
    const defenseFamilies = ALL_SCHEME_FAMILIES.filter((f) => f.category === 'defense');
    expect(offenseFamilies.length).toBe(15);
    expect(defenseFamilies.length).toBe(10);
  });

  it('validates the entire visualizer library of 100 plays with 0 errors or warnings', () => {
    expect(ALL_PLAYS.length).toBe(100);
    const libResults = validateLibrary(ALL_PLAYS);

    for (const play of ALL_PLAYS) {
      expect(libResults[play.id], `Whole-library validation failed for play "${play.id}"`).toEqual([]);
    }
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
