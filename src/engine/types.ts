export type Side = 'offense' | 'defense';

export interface Waypoint {
  t: number;          // seconds from snap; t=0 is the snap
  x: number;          // yards across field, 0..53.33
  y: number;          // yards relative to LOS
  note?: string;      // author-facing comment, e.g. "reach step"
}

export interface PlayerTrack {
  id: string;                 // 'LT', 'Z', 'F', 'MIKE', 'FS' — unique within the play
  label: string;              // short text rendered inside the marker, e.g. 'Z'
  side: Side;
  role: 'ol' | 'qb' | 'rb' | 'te' | 'wr' | 'dl' | 'lb' | 'db';
  waypoints: Waypoint[];      // sorted ascending by t; first waypoint MUST have t === 0
  trail: 'route' | 'block' | 'carry' | 'drop' | 'none';
  assignment?: string;        // "reach the 3-tech", "sell the seam, break flat"
}

export interface Beat {
  t: number;                  // when this moment happens, seconds from snap
  title: string;              // "The Mike commits"
  text: string;               // 1-3 sentences of analysis
  focus?: string[];           // PlayerTrack ids to highlight while this beat is active
}

export interface PlaySummary {
  motive: string;             // what the play is trying to accomplish
  keyDefender: string;        // the player the play is designed to put in conflict
  whyItWorks: string;
  failureMode: string;        // how a defense takes it away
}

export interface Play {
  id: string;                   // unique across the whole library, kebab-case
  name: string;                 // display name, e.g. "Outside Zone Left"
  coach:
    | 'shanahan'
    | 'kubiak'
    | 'saleh'
    | 'macdonald'
    | 'reid'
    | 'fangio'
    | 'flores'
    | 'belichick'
    | 'mcvay'
    | 'mcdaniel'
    | 'stefanski'
    | 'steichen'
    | 'lafleur'
    | 'sirianni'
    | 'johnson'
    | 'minter'
    | 'ryans'
    | 'shula'
    | 'spagnuolo'
    | 'quinn'
    | 'bowles';
  family: string;               // 'wide-zone', 'split-zone-leak', 'saleh-43-wide9', 'macdonald-hybrid-disguise'
  personnel: string;            // '21', '12', '11', 'Base 4-3', 'Nickel 4-2-5', etc.
  formation: string;            // 'Offset I, Wing Right', '11P Gun 3x1', etc.
  situation: string;            // '1st & 10, +40, base down'
  coverage: string;             // defense's coverage call, e.g. 'Cover 3 Sky'
  frontName: string;            // 'Over front'
  duration: number;             // total seconds of animation
  offense: PlayerTrack[];       // exactly 11
  defense: PlayerTrack[];       // exactly 11
  beats: Beat[];                // sorted ascending by t
  summary: PlaySummary;
  sequence: {
    setsUp: string[];           // Play ids this call sets up later in a game plan
    playsOff: string[];         // Play ids whose picture this play borrows/mimics
    tell: string;               // the ONE visual cue that separates this play from what it mimics
  };
}

export interface SchemeFamily {
  id: string;
  name: string;
  coach: string;
  coachId?: string;
  team: string;
  category?: 'offense' | 'defense';
  treeBranch?: CoachingTreeBranch;
  description: string;
  plays: Play[];
}

export type CoachingTreeBranch =
  | 'shanahan-kubiak'
  | 'reid-west-coast'
  | 'power-gap-duo'
  | 'macdonald-pressure'
  | 'fangio-two-high'
  | 'carroll-saleh-wide9'
  | 'belichick-flores';

export interface CoachProfile {
  id: string;
  name: string;
  role2026: string;
  team: string;
  treeBranch: CoachingTreeBranch;
  mentorId?: string;
  disciples?: string[];
  category: 'offense' | 'defense';
  philosophy: string;
  keyConcepts: string[];
  schemeFamilyIds: string[];
  isHeadCoach2026?: boolean;
  notableAchievements?: string[];
}

export interface CoachingTreeNode {
  coach: CoachProfile;
  children: CoachingTreeNode[];
}

export interface CoachingTree {
  id: CoachingTreeBranch;
  name: string;
  patriarch: string;
  category: 'offense' | 'defense';
  description: string;
  rootNodes: CoachingTreeNode[];
}

