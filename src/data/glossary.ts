export interface GlossaryEntry {
  id: string;
  term: string;
  aliases: string[];
  category: 'Blocking Scheme' | 'Run Concept' | 'Pass Concept' | 'Defensive Front' | 'Coverage & Shell' | 'Read & Assignment' | 'Scheme & Concept';
  shortDef: string;
  tacticalNote: string;
}

export const FOOTBALL_GLOSSARY: GlossaryEntry[] = [
  {
    id: 'wham',
    term: 'Wham',
    aliases: ['Wham Block', 'Wham block', 'wham block', 'Wham trap', 'whamming'],
    category: 'Blocking Scheme',
    shortDef: 'A surprise inside trap block delivered by an off-line tight end, H-back, or fullback against an unblocked interior defensive lineman (typically a 1-tech or 3-tech).',
    tacticalNote: 'Exploits aggressive upfield defensive line penetration by using their forward momentum to create an instant interior cutback lane.',
  },
  {
    id: 'apex-defender',
    term: 'Apex Defender',
    aliases: ['Apex', 'Apex defender', 'apex defender', 'overhang defender', 'overhang'],
    category: 'Read & Assignment',
    shortDef: 'A hybrid second-level defender (nickel DB or outside linebacker) aligned in the intermediate alley midway between the offensive tackle/tight end and the slot receiver.',
    tacticalNote: 'Tasked with a dual conflict: fitting the perimeter C/D-gap run alley vs. expanding into the curl-flat passing zone on RPOs.',
  },
  {
    id: 'tite-front',
    term: 'Tite Front',
    aliases: ['Tite front', 'Tite', 'Mint Front', 'Mint front', '3-4 Tite', 'tite front'],
    category: 'Defensive Front',
    shortDef: 'A three-down interior front featuring a head-up nose tackle (0-tech) flanked by two interior 4i-technique defensive ends positioned on the inside shoulders of the offensive tackles.',
    tacticalNote: 'Clogs both offensive B-gaps and spills inside zone runs laterally toward waiting alley linebackers without requiring safety run support.',
  },
  {
    id: 'mesh-point',
    term: 'Mesh Point',
    aliases: ['Mesh point', 'Mesh Point', 'mesh point', 'QB-RB mesh', 'mesh exchange', 'read mesh', 'mesh'],
    category: 'Read & Assignment',
    shortDef: 'The synchronized handoff exchange pocket where the quarterback rides the ball into the running back\'s belly while reading a designated key defender.',
    tacticalNote: 'Freezes second-level linebackers and edge crashers for 0.4s–0.8s, creating space for keep, pull, or quick-trigger RPO throws.',
  },
  {
    id: 'simulated-pressure',
    term: 'Simulated Pressure',
    aliases: ['Simulated pressure', 'Sim Pressure', 'sim pressure', 'simulated pressure', 'simulated blitz', 'Sim-Pressure'],
    category: 'Defensive Front',
    shortDef: 'A 4-man rush package showing 5 to 7 potential rushers at the line, where only 4 actually rush (including secondary/linebacker blitzers) while defensive linemen drop into coverage.',
    tacticalNote: 'Forces the offensive line into slide protection confusion and hot-throw checks while maintaining 7-man zone coverage integrity.',
  },
  {
    id: 'cloud-coverage',
    term: 'Cloud Coverage',
    aliases: ['Cloud coverage', 'Cover 2 Cloud', 'Cloud support', 'Cloud corner', 'cloud coverage', 'cloud'],
    category: 'Coverage & Shell',
    shortDef: 'A split-safety perimeter coverage structure (often Cover 2) where the cornerback plays aggressive jam-and-squat technique in the flat while the safety covers the deep half above.',
    tacticalNote: 'Reroutes outside receivers to disrupt quick timing routes and forces quarterbacks to test tight windows along the sideline hole.',
  },
  {
    id: 'two-high-shell',
    term: 'Two-High Shell',
    aliases: ['Two-High', 'two-high shell', 'Two-High Shell', '2-high shell', 'two-high', 'split-field shell', 'middle-of-field open'],
    category: 'Coverage & Shell',
    shortDef: 'A pre-snap defensive alignment featuring both safeties stationed 12–15 yards deep, keeping the middle of the field open (MOFO).',
    tacticalNote: 'Disguises whether the post-snap defense will play Quarters (Cover 4), Cover 2, Cover 6, or rotate down into single-high Cover 3 / Cover 1 at the snap.',
  },
  {
    id: 'psycho-front',
    term: 'Psycho Front',
    aliases: ['Psycho front', 'Psycho Blitz', 'Psycho blitz', 'psycho front', 'amoeba psycho', 'sugar front', 'Psycho Front'],
    category: 'Defensive Front',
    shortDef: 'An exotic pass-rush alignment featuring zero defensive linemen with hands in the dirt, standing multiple blitzers roaming and mugging every gap along the line of scrimmage.',
    tacticalNote: 'Causes total center-identification overload for offensive pass protection, preventing the offense from setting clear slide and dual-read calls.',
  },
  {
    id: 'duo',
    term: 'Duo',
    aliases: ['Duo concept', 'Duo run', 'Power without a puller', 'duo'],
    category: 'Run Concept',
    shortDef: 'A downhill gap-style run concept characterized by multiple double-teams at the line of scrimmage, with the running back reading the middle linebacker\'s leverage.',
    tacticalNote: 'Does not pull an offensive lineman; relies on vertical displacement of defensive tackles and forces the safety or unblocked defender to make the 1-on-1 tackle.',
  },
  {
    id: 'zone-read',
    term: 'Zone Read',
    aliases: ['Zone read', 'read option', 'mesh read', 'zone read'],
    category: 'Read & Assignment',
    shortDef: 'A foundational option mechanic where the offensive line leaves the backside defensive end unblocked, and the quarterback reads their hip commitment at the mesh point.',
    tacticalNote: 'If the end crashes down on the running back, the QB pulls and keeps around the edge; if the end widens or hesitates, the QB gives to the running back.',
  },
  {
    id: 'conflict-defender',
    term: 'Conflict Defender',
    aliases: ['Conflict defender', 'conflict read', 'key read defender', 'read key', 'conflict defender', 'Conflict Defender'],
    category: 'Read & Assignment',
    shortDef: 'The specific defensive player placed in a spatial dilemma where their assignment requires defending two mutually exclusive outcomes simultaneously (e.g. run fit vs. slant).',
    tacticalNote: 'Modern offensive schemes and RPOs are engineered specifically to isolate this defender and make them wrong regardless of their reaction.',
  },
  {
    id: 'underneath-dropper',
    term: 'Underneath Dropper',
    aliases: ['Underneath dropper', 'hook dropper', 'curl-flat dropper', 'hole dropper', 'underneath dropper', 'Underneath Dropper'],
    category: 'Coverage & Shell',
    shortDef: 'A defensive second-level defender (LB, nickel, or safety) responsible for dropping into intermediate underneath zones (hook/curl, hole, or seam-flat).',
    tacticalNote: 'Tasked with vision on the quarterback to undercut crossing routes (digs, slants, crossers) and rally down on checkdowns.',
  },
  {
    id: 'split-zone',
    term: 'Split Zone',
    aliases: ['Split zone', 'split-zone', 'split flow', 'Split Zone'],
    category: 'Run Concept',
    shortDef: 'An inside or wide zone run where a tight end, fullback, or H-back crosses against the flow of the offensive line to seal the backside edge defender.',
    tacticalNote: 'Eliminates backside defensive pursuit and sets up play-action bootlegs and tight end slip-screens in modern Shanahan/Kubiak offenses.',
  },
  {
    id: 'wide-zone',
    term: 'Wide Zone',
    aliases: ['Wide zone', 'outside zone', 'stretch run', 'lateral stretch', 'Wide Zone', 'Outside Zone'],
    category: 'Run Concept',
    shortDef: 'A perimeter run concept where the entire offensive line takes synchronized lateral bucket steps to stretch the defense sideline to sideline.',
    tacticalNote: 'Forces defensive linemen into lateral displacement, creating natural vertical cutback lanes (A-gap or B-gap) for patient one-cut runners.',
  },
  {
    id: 'bootleg',
    term: 'Bootleg',
    aliases: ['Naked boot', 'keeper', 'boot action', 'naked bootleg', 'bootleg'],
    category: 'Pass Concept',
    shortDef: 'A play-action pass where the quarterback fakes a zone handoff in one direction and rolls out in the opposite direction without lead protection.',
    tacticalNote: 'Punishes backside defensive ends and linebackers who overcommit to stopping the run, generating clean throwing lanes into the vacated flat.',
  },
  {
    id: 'rpo',
    term: 'RPO',
    aliases: ['Run-Pass Option', 'Run-pass option', 'post-snap RPO', 'pre-snap RPO', 'rpo'],
    category: 'Scheme & Concept',
    shortDef: 'A play design combining a live run-blocking concept with quick passing routes, giving the quarterback real-time decision power based on a key conflict defender.',
    tacticalNote: 'Because linemen block for a run, the throw must come within 1.2–1.6 seconds to avoid an illegal ineligible receiver downfield penalty.',
  },
  {
    id: 'match-quarters',
    term: 'Match Quarters',
    aliases: ['Quarters', 'Cover 4 Match', 'match quarters', 'Palms coverage', 'Mod coverage', 'Match Quarters', 'Cover 4'],
    category: 'Coverage & Shell',
    shortDef: 'A 4-deep split-field zone coverage that converts into man-to-man coverage based on the vertical releases and out-breaks of receivers #1 and #2.',
    tacticalNote: 'Enables 9-man run-box support while retaining deep 4-way bracket coverage against vertical 4-verticals route trees.',
  },
  {
    id: 'cover-3-press',
    term: 'Cover 3 Press',
    aliases: ['Cover 3 press', 'Cover 3 Sky', 'Cover 3 Buzz', 'Single-High Press', 'Cover 3', 'cover 3'],
    category: 'Coverage & Shell',
    shortDef: 'A single-high safety structure dividing the deep field into three equal thirds, paired with physical press technique by outside cornerbacks at the line of scrimmage.',
    tacticalNote: 'Crowds the 8-man box against the run while jamming outside receivers to eliminate rhythm passing in the quick game.',
  },
  {
    id: 'cover-1',
    term: 'Cover 1',
    aliases: ['Cover 1 Man', 'Man-Free', 'man-free coverage', 'cover 1'],
    category: 'Coverage & Shell',
    shortDef: 'A single-high coverage featuring a lone free safety roaming the deep middle with five underneath defenders locked in aggressive man-to-man coverage.',
    tacticalNote: 'Allows aggressive underneath contested catches and extra pass rushers, but remains vulnerable to crossers and deep perimeter fade balls.',
  },
  {
    id: 'cover-0',
    term: 'Cover 0',
    aliases: ['Cover 0 Blitz', 'all-out blitz', 'zero coverage', 'house blitz', 'cover 0'],
    category: 'Coverage & Shell',
    shortDef: 'A maximum all-out pressure scheme featuring pure man coverage with zero deep safety help and six or seven rushers attacking the pocket.',
    tacticalNote: 'Forces an immediate hot throw from the quarterback, daring them to deliver accurately before the unblocked pressure arrives.',
  },
  {
    id: 'creeper-blitz',
    term: 'Creeper Blitz',
    aliases: ['Creeper', 'creeper pressure', 'creeper blitz', 'off-ball pressure', 'Creeper Blitz', 'creeper'],
    category: 'Defensive Front',
    shortDef: 'An off-ball 4-man pressure where a second- or third-level defender blitzes from depth while a defensive lineman drops into underneath zone coverage.',
    tacticalNote: 'Attacks weak points in pass protection without displaying pre-snap blitz tells or giving up standard 7-man coverage spacing.',
  },
  {
    id: 'wide-9',
    term: 'Wide-9',
    aliases: ['Wide-9 front', 'Wide 9', '9-technique', 'wide-9 alignment', 'Wide-9'],
    category: 'Defensive Front',
    shortDef: 'A defensive end alignment stationed extremely wide outside the tight end\'s exterior shoulder (9-technique).',
    tacticalNote: 'Creates steep, unhindered speed-rush angles around the edge and eliminates outside tackle punch reach, forcing the offense to commit extra blockers.',
  },
  {
    id: 'pin-and-pull',
    term: 'Pin & Pull',
    aliases: ['Pin and Pull', 'pin-pull', 'pin and pull concept', 'Pin & Pull'],
    category: 'Blocking Scheme',
    shortDef: 'A perimeter run scheme where offensive linemen with defenders in their gap block down ("pin"), allowing uncovered adjacent linemen to pull around to the edge.',
    tacticalNote: 'Creates superior geometric blocking angles against aggressive penetrating defensive fronts without requiring horizontal reach blocks.',
  },
  {
    id: 'gt-counter',
    term: 'GT Counter',
    aliases: ['Counter', 'Counter Trey', 'GT counter', 'guard-tackle counter', 'Counter Deception'],
    category: 'Run Concept',
    shortDef: 'A misdirection gap run where the backside guard pulls to kick out the play-side edge defender, followed by the backside tackle wrapping through the hole for the linebacker.',
    tacticalNote: 'Fakes initial zone flow to freeze linebackers before hitting back against the grain with overwhelming mass at the point of attack.',
  },
  {
    id: 'sail-concept',
    term: 'Sail Concept',
    aliases: ['Sail concept', 'Flood concept', '3-level flood', 'Sail', 'sail concept'],
    category: 'Pass Concept',
    shortDef: 'A three-level vertical passing combination consisting of a deep clear-out (go/post), an intermediate out/sail route (10–14 yards), and a quick flat route (0–4 yards).',
    tacticalNote: 'Puts boundary zone defenders in an impossible vertical high-low bind, guaranteeing an open window against Cover 3 and Cover 4.',
  },
  {
    id: 'smash-concept',
    term: 'Smash Concept',
    aliases: ['Smash concept', 'Smash', 'hitch-corner', 'smash concept'],
    category: 'Pass Concept',
    shortDef: 'A two-receiver passing concept featuring a quick 5-yard hitch route on the outside and an 8-to-10-yard corner route from the inside slot receiver.',
    tacticalNote: 'A premier Cover 2 beater that forces the boundary cornerback to choose between biting the hitch or retreating under the corner route.',
  },
  {
    id: 'robber-coverage',
    term: 'Robber Coverage',
    aliases: ['Robber', 'robber coverage', 'Cover 1 Robber', 'Safety Robber', 'robber'],
    category: 'Coverage & Shell',
    shortDef: 'A hybrid coverage where a safety drops from a deep two-high alignment down into the intermediate middle "hole" to intercept crossing routes.',
    tacticalNote: 'Baits the quarterback into throwing over-the-middle slants and digs, only for the disguise robber safety to jump the passing lane.',
  },
  {
    id: 'crack-toss',
    term: 'Crack Toss',
    aliases: ['Crack toss', 'crack block', 'crack toss sweep', 'crack toss'],
    category: 'Run Concept',
    shortDef: 'A perimeter sweep run where wide receivers or flexed tight ends block inward ("crack") on edge defenders and linebackers while the running back attacks the sideline.',
    tacticalNote: 'Exploits the blind spot of edge run stoppers with crushing perimeter crack blocks, allowing pulling linemen to lead in open space.',
  },
  {
    id: 'spill-and-lever',
    term: 'Spill & Lever',
    aliases: ['Spill and Lever', 'spill fit', 'lever fit', 'force and spill', 'spill and lever'],
    category: 'Read & Assignment',
    shortDef: 'Defensive run-fit doctrine where interior defenders attack the inside shoulder of pullers to "spill" the ball carrier wide, where the force defender "levers" them back inside.',
    tacticalNote: 'Prevents vertical downhill seams on power and counter runs by bouncing ball carriers into secondary pursuit angles.',
  },
  {
    id: 'disguise-window',
    term: 'Disguise Window',
    aliases: ['Disguise window', '0.0s-1.2s window', 'pre-to-post disguise', 'disguise window', 'mirror window'],
    category: 'Scheme & Concept',
    shortDef: 'The critical first 0.0s to 1.2s interval after the snap where two distinct scheme concepts mimic identical pre-snap pictures and early movement trajectories.',
    tacticalNote: 'Forces opposing defenders and quarterbacks to freeze or misread the play until the ball has already committed to the true tactical path.',
  },
];

/**
 * Find glossary entry by term name or alias (case-insensitive)
 */
export function findGlossaryTerm(name: string): GlossaryEntry | undefined {
  const q = name.trim().toLowerCase();
  return FOOTBALL_GLOSSARY.find(
    (item) =>
      item.term.toLowerCase() === q ||
      item.aliases.some((alias) => alias.toLowerCase() === q)
  );
}
