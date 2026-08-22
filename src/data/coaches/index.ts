import type { CoachProfile, CoachingTree } from '../../engine/types';

export const COACH_PROFILES: Record<string, CoachProfile> = {
  // ==========================================
  // HISTORIC PATRIARCHS & FOUNDATIONAL ARCHITECTS
  // ==========================================
  'bill-walsh': {
    id: 'bill-walsh',
    name: 'Bill Walsh',
    role2026: 'Pro Football Hall of Fame Patriarch',
    team: 'San Francisco 49ers (Patriarch)',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'paul-brown',
    disciples: ['mike-shanahan', 'andy-reid', 'mike-holmgren', 'george-seifert'],
    category: 'offense',
    philosophy:
      'The architect of the West Coast Offense: short, horizontal rhythm passing as a controlled extension of the run game, utilizing spacing, timed drops, and run-after-catch geometry to manipulate defensive leverage.',
    keyConcepts: ['West Coast Pass Rhythm', 'Horizontal Field Stretch', 'Sprint Right Option', 'Scripted Openers'],
    schemeFamilyIds: ['shanahan-wide-zone', 'walsh-classic-wco'],
    isHeadCoach2026: false,
    notableAchievements: ['3x Super Bowl Champion HC', 'Pro Football Hall of Fame (1993)', 'Architect of Modern Passing Geometry'],
  },

  'mike-shanahan': {
    id: 'mike-shanahan',
    name: 'Mike Shanahan',
    role2026: '2x Super Bowl Champion HC / Wide Zone Pioneer',
    team: 'Denver Broncos / SF 49ers (Patriarch)',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'bill-walsh',
    disciples: ['kyle-shanahan', 'sean-mcvay', 'gary-kubiak', 'matt-lafleur'],
    category: 'offense',
    philosophy:
      'Pioneered the outside zone stretch run married to Alex Gibbs blocking mechanics, paired with lethal bootleg rollouts and intermediate crossers that tore apart single-high coverages.',
    keyConcepts: ['Outside Zone Stretch', 'Naked Bootleg Flood', 'Cutback Lanework', 'Play-Action Deep Over'],
    schemeFamilyIds: ['shanahan-wide-zone'],
    isHeadCoach2026: false,
    notableAchievements: ['2x Super Bowl Champion HC (XXXII, XXXIII)', '3x Super Bowl Ring Total', 'Father of the Modern Wide Zone Family'],
  },

  'gary-kubiak': {
    id: 'gary-kubiak',
    name: 'Gary Kubiak',
    role2026: 'Super Bowl 50 Champion HC / Split-Zone Master',
    team: 'Denver Broncos / Houston Texans (Patriarch)',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'mike-shanahan',
    disciples: ['klint-kubiak', 'kevin-stefanski'],
    category: 'offense',
    philosophy:
      'Perfected under-center stretch-zone and split-zone slicing action with the fullback/tight end, unleashing devastating throwback bootlegs, deep dagger shots, and Y-Leaks against over-aggressive front sevens.',
    keyConcepts: ['Split-Zone Slice', 'Under-Center Play-Action', 'Tight-End Y-Leak', 'Condensed Formations'],
    schemeFamilyIds: ['kubiak-split-zone'],
    isHeadCoach2026: false,
    notableAchievements: ['Super Bowl 50 Champion HC', '4x Super Bowl Champion (Player & Coach)', 'Architect of Historic Run-Play-Action Offenses'],
  },

  'pete-carroll': {
    id: 'pete-carroll',
    name: 'Pete Carroll',
    role2026: 'Super Bowl XLVIII Champion HC / Cover 3 Patriarch',
    team: 'Seattle Seahawks (Patriarch)',
    treeBranch: 'carroll-saleh-wide9',
    mentorId: 'monte-kiffin',
    disciples: ['robert-saleh', 'demeco-ryans', 'dan-quinn', 'gus-bradley'],
    category: 'defense',
    philosophy:
      'Architect of the "Legion of Boom" single-high Cover 3 match system: physical press-bail corners, disciplined deep-third integrity, and relentless 4-man front pressure.',
    keyConcepts: ['Cover 3 Match (Rip/Liz)', '4-3 Under Front', 'Wide-9 Speed Edge Rush', 'Physical Alley Tackling'],
    schemeFamilyIds: ['saleh-43-wide9'],
    isHeadCoach2026: false,
    notableAchievements: ['Super Bowl XLVIII Champion', '2x NCAA National Champion', 'Pioneered Modern Single-High Cover 3 Era'],
  },

  'bill-belichick': {
    id: 'bill-belichick',
    name: 'Bill Belichick',
    role2026: '6x Super Bowl Champion HC / Defensive Patriarch',
    team: 'New England Patriots (Patriarch)',
    treeBranch: 'belichick-flores',
    mentorId: 'bill-parcells',
    disciples: ['brian-flores'],
    category: 'defense',
    philosophy:
      'Chameleon defensive football: gameplan-specific odd/even fronts, taking away the opposing offense’s #1 weapon, and Cover 0 psycho overload blitzes.',
    keyConcepts: ['Chameleon Gameplanning', 'Cover 0 House Blitz', 'Hybrid 3-4 / 4-3 Multiplicity', 'Bracket / Double #1 Option'],
    schemeFamilyIds: ['belichick-flores-psycho'],
    isHeadCoach2026: false,
    notableAchievements: ['6x Super Bowl Champion HC', '8x Super Bowl Champion Total', 'Greatest Defensive Tactician in NFL History'],
  },

  // ==========================================
  // SHANAHAN / KUBIAK LINEAGE
  // ==========================================
  'kyle-shanahan': {
    id: 'kyle-shanahan',
    name: 'Kyle Shanahan',
    role2026: 'Head Coach, San Francisco 49ers',
    team: 'San Francisco 49ers',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'mike-shanahan',
    disciples: ['klint-kubiak', 'mike-lafleur', 'mike-mcdaniel', 'matt-lafleur', 'bobby-slowik'],
    category: 'offense',
    philosophy:
      'Mastery of offensive sequencing: running outside zone to stretch defensive flow horizontally, then attacking with play-action overs and naked bootlegs that look identical for the first 1.2 seconds.',
    keyConcepts: ['Outside Zone', 'Play-Action Over', 'Naked Bootleg', 'Pre-Snap Jet Motion', '21 Personnel Iso'],
    schemeFamilyIds: ['shanahan-wide-zone'],
    isHeadCoach2026: true,
    notableAchievements: ['2x Super Bowl HC Appearance', 'Architect of Modern Wide Zone Sequencing'],
  },

  'klint-kubiak': {
    id: 'klint-kubiak',
    name: 'Klint Kubiak',
    role2026: 'Head Coach, Las Vegas Raiders',
    team: 'Las Vegas Raiders',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'kyle-shanahan',
    disciples: [],
    category: 'offense',
    philosophy:
      'Combining Gary Kubiak’s under-center split-zone fundamentals with Kyle Shanahan’s condensed formations and pre-snap glide/orbit motion to isolate linebackers on devastating Y-Leaks and Dagger shots.',
    keyConcepts: ['Split-Zone Slice', 'PA Dagger Shot', 'Boot Throwback Y-Leak', 'Orbit Motion Perimeter Toss'],
    schemeFamilyIds: ['kubiak-split-zone'],
    isHeadCoach2026: true,
    notableAchievements: ['2026 Raiders HC Hiring', 'Orchestrated Top-5 Explosive Play Rates with Saints/49ers'],
  },

  'sean-mcvay': {
    id: 'sean-mcvay',
    name: 'Sean McVay',
    role2026: 'Head Coach, Los Angeles Rams',
    team: 'Los Angeles Rams',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'mike-shanahan',
    disciples: ['matt-lafleur', 'kevin-stefanski', 'kevin-oconnell', 'liam-coen'],
    category: 'offense',
    philosophy:
      'Marrying condensed 11 and 13 personnel groupings with Duo and Mid-Zone runs, feeding boundary crossers, Sail concepts, and illusionary play-action reads off condensed bunch sets.',
    keyConcepts: ['13 Personnel Heavy Spread', 'Mid-Zone & Duo', 'Sail Concept', 'Choice Routes'],
    schemeFamilyIds: ['mcvay-duo-playaction'],
    isHeadCoach2026: true,
    notableAchievements: ['Super Bowl LVI Champion', '2x NFC Champion'],
  },

  'mike-lafleur': {
    id: 'mike-lafleur',
    name: 'Mike LaFleur',
    role2026: 'Head Coach, Arizona Cardinals',
    team: 'Arizona Cardinals',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'kyle-shanahan',
    disciples: [],
    category: 'offense',
    philosophy:
      'High-tempo horizontal stretch concepts leveraging dual-threat quarterback mobility, pistol wide-zone reads, and perimeter screens that punish aggressive edge rushers.',
    keyConcepts: ['Pistol Zone Read', 'Naked Boot Flood', 'Tunnel Screens', 'Quick Perimeter Motion'],
    schemeFamilyIds: ['shanahan-wide-zone'],
    isHeadCoach2026: true,
    notableAchievements: ['2026 Cardinals HC Hiring', 'Former Rams & 49ers Passing Game Coordinator'],
  },

  'mike-mcdaniel': {
    id: 'mike-mcdaniel',
    name: 'Mike McDaniel',
    role2026: 'Offensive Coordinator, Los Angeles Chargers',
    team: 'Los Angeles Chargers',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'kyle-shanahan',
    disciples: [],
    category: 'offense',
    philosophy:
      'Pioneered sprint-speed cheat motion (glide/wham motion) to give receivers a running start into intermediate voids, maximizing space creation and explosive YAC.',
    keyConcepts: ['Cheat/Glide Motion', 'Inside-Out Slant/Wheel', 'Pistol Toss Crack', 'Speed Option'],
    schemeFamilyIds: ['mcdaniel-cheat-motion'],
    isHeadCoach2026: false,
    notableAchievements: ['Architect of 2023-2024 Historic Dolphins Passing Attack'],
  },

  'matt-lafleur': {
    id: 'matt-lafleur',
    name: 'Matt LaFleur',
    role2026: 'Head Coach, Green Bay Packers',
    team: 'Green Bay Packers',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'kyle-shanahan',
    disciples: [],
    category: 'offense',
    philosophy:
      'Integrates Shanahan outside-zone mechanics with spread RPOs and deep vertical shot plays from under center and pistol formations.',
    keyConcepts: ['Under-Center Play-Action', 'Cross-Country Deep Posts', 'RPO Glances', 'Pony Personnel (2 RB)'],
    schemeFamilyIds: ['lafleur-illusion-packers'],
    isHeadCoach2026: true,
    notableAchievements: ['3x NFC North Division Champion'],
  },

  'kevin-stefanski': {
    id: 'kevin-stefanski',
    name: 'Kevin Stefanski',
    role2026: 'Head Coach, Atlanta Falcons',
    team: 'Atlanta Falcons',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'gary-kubiak',
    disciples: [],
    category: 'offense',
    philosophy:
      'Heavy 12/13 multi-tight end sets, under-center bootlegs, pin-and-pull gap schemes, and intermediate boundary comebacks.',
    keyConcepts: ['12/13 Personnel Heavy', 'Bootleg Flood', 'Pin & Pull', 'Play-Action Seam Shot'],
    schemeFamilyIds: ['stefanski-multi-te-gap'],
    isHeadCoach2026: true,
    notableAchievements: ['2x NFL Coach of the Year (2020, 2023)', '2026 Falcons HC Hiring'],
  },

  // ==========================================
  // ANDY REID / WEST COAST - SPREAD LINEAGE
  // ==========================================
  'andy-reid': {
    id: 'andy-reid',
    name: 'Andy Reid',
    role2026: 'Head Coach, Kansas City Chiefs',
    team: 'Kansas City Chiefs',
    treeBranch: 'reid-west-coast',
    mentorId: 'bill-walsh',
    disciples: ['john-harbaugh', 'shane-steichen', 'nick-sirianni', 'sean-payton', 'chip-kelly'],
    category: 'offense',
    philosophy:
      'Master of spacing, motion, and vertical stretch. Melds traditional West Coast timing with Spread-RPO concepts, Mesh shallow crosses, and tight-end Iso matchups.',
    keyConcepts: ['Mesh Shallow Cross', 'Sprintout Hi-Lo', 'Shovel Pass Screen', '3x1 Iso Backside Choice'],
    schemeFamilyIds: ['reid-spread-rpo'],
    isHeadCoach2026: true,
    notableAchievements: ['3x Super Bowl Champion HC', '250+ Career NFL Wins'],
  },

  'john-harbaugh': {
    id: 'john-harbaugh',
    name: 'John Harbaugh',
    role2026: 'Head Coach, New York Giants',
    team: 'New York Giants',
    treeBranch: 'reid-west-coast',
    mentorId: 'andy-reid',
    disciples: ['mike-macdonald', 'jesse-minter'],
    category: 'offense',
    philosophy:
      'Physical, situational football that harmonizes power gap runs, heavy play-action passing, and suffocating defensive pressure packages.',
    keyConcepts: ['Heavy Personnel Play-Action', 'Situational 4th-Down Aggression', 'Gap-Power Run Game'],
    schemeFamilyIds: ['reid-spread-rpo'],
    isHeadCoach2026: true,
    notableAchievements: ['Super Bowl XLVII Champion', '2026 Giants HC Hiring'],
  },

  'shane-steichen': {
    id: 'shane-steichen',
    name: 'Shane Steichen',
    role2026: 'Head Coach, Indianapolis Colts',
    team: 'Indianapolis Colts',
    treeBranch: 'reid-west-coast',
    mentorId: 'nick-sirianni',
    disciples: [],
    category: 'offense',
    philosophy:
      'Quarterback run-threat maximization, Mesh crossers, RPO bubble/glance combinations, and vertical boundary shots off zone-read fakes.',
    keyConcepts: ['Zone Read + Bubble RPO', 'Mesh Rail', '4-Verticals Switch', 'Power Read'],
    schemeFamilyIds: ['steichen-qb-mesh-rpo'],
    isHeadCoach2026: true,
    notableAchievements: ['Orchestrated Top-5 Scoring Offenses in Philly & Indy'],
  },

  'nick-sirianni': {
    id: 'nick-sirianni',
    name: 'Nick Sirianni',
    role2026: 'Head Coach, Philadelphia Eagles',
    team: 'Philadelphia Eagles',
    treeBranch: 'reid-west-coast',
    mentorId: 'andy-reid',
    disciples: ['shane-steichen'],
    category: 'offense',
    philosophy:
      'Power running with RPO perimeter access, boundary isolation for elite wideouts, and high-percentage short-yardage conversions.',
    keyConcepts: ['RPO Glance / Slant', 'Duo Power', 'Slot Fade Isolation', 'Brotherly Shove'],
    schemeFamilyIds: ['sirianni-power-rpo'],
    isHeadCoach2026: true,
    notableAchievements: ['Super Bowl LVII Appearance', '2x NFC East Champion'],
  },

  // ==========================================
  // MIKE MACDONALD / PRESSURE & DISGUISE LINEAGE
  // ==========================================
  'mike-macdonald': {
    id: 'mike-macdonald',
    name: 'Mike Macdonald',
    role2026: 'Head Coach, Seattle Seahawks',
    team: 'Seattle Seahawks',
    treeBranch: 'macdonald-pressure',
    mentorId: 'john-harbaugh',
    disciples: ['jesse-minter'],
    category: 'defense',
    philosophy:
      'Pre-snap illusion of pressure with 4-man Simulated Pressures (Creepers), dropping interior linemen into passing windows while sending DBs, backed by post-snap safety rotation and trap coverages.',
    keyConcepts: ['Simulated Pressures (Creepers)', 'Double-A Mug Buzz', 'Split-Field Trap', 'Cover 0 Peel Blitz'],
    schemeFamilyIds: ['macdonald-hybrid-disguise'],
    isHeadCoach2026: true,
    notableAchievements: ['#1 Scoring Defense in NFL (Ravens)', '2024 Seahawks HC Hiring'],
  },

  'jesse-minter': {
    id: 'jesse-minter',
    name: 'Jesse Minter',
    role2026: 'Head Coach, Baltimore Ravens',
    team: 'Baltimore Ravens',
    treeBranch: 'macdonald-pressure',
    mentorId: 'mike-macdonald',
    disciples: [],
    category: 'defense',
    philosophy:
      'Exotic 5- and 6-man pressure packages mixed with amoeba fronts, baiting quarterbacks into pre-snap hot reads that rotate directly into post-snap traps.',
    keyConcepts: ['Amoeba Overload', 'Fire Zone 3', 'Cover 1 Lurk / Robber', 'Slot Blitz Creepers'],
    schemeFamilyIds: ['minter-amoeba-creeper'],
    isHeadCoach2026: true,
    notableAchievements: ['2026 Ravens HC Hiring', 'Architect of #1 Total Defense (Chargers/Michigan)'],
  },

  // ==========================================
  // VIC FANGIO TWO-HIGH SHELL & QUARTERS LINEAGE
  // ==========================================
  'vic-fangio': {
    id: 'vic-fangio',
    name: 'Vic Fangio',
    role2026: 'Defensive Coordinator / Strategic Advisor',
    team: 'Philadelphia Eagles',
    treeBranch: 'fangio-two-high',
    mentorId: 'jim-mora',
    disciples: ['chris-shula'],
    category: 'defense',
    philosophy:
      'Presenting an impenetrable two-high safety shell pre-snap to disguise Cover 6, Cover 8, and Quarters, paired with light 3-man Tite/Penny fronts to eliminate explosive crossers.',
    keyConcepts: ['2-High Shell Pre-Snap', 'Cover 6 (Quarter-Quarter-Half)', 'Penny Front (5-1-5)', 'Late Safety Robber'],
    schemeFamilyIds: ['fangio-two-high-shell'],
    isHeadCoach2026: false,
    notableAchievements: ['Patriarch of modern 2-High Quarters revolution in NFL'],
  },

  'chris-shula': {
    id: 'chris-shula',
    name: 'Chris Shula',
    role2026: 'Defensive Coordinator, Los Angeles Rams',
    team: 'Los Angeles Rams',
    treeBranch: 'fangio-two-high',
    mentorId: 'vic-fangio',
    disciples: [],
    category: 'defense',
    philosophy:
      'Light-box run fits utilizing interior stunts, quarters match coverage against condensed bunch formations, and late safety robber disguises.',
    keyConcepts: ['Match Quarters', 'Tite Front B-Gap Pinch', 'Cover 8 Split-Field', 'Safety Down Robber'],
    schemeFamilyIds: ['shula-match-quarters'],
    isHeadCoach2026: false,
    notableAchievements: ['Rams Defensive Coordinator'],
  },

  // ==========================================
  // ROBERT SALEH / PETE CARROLL WIDE-9 LINEAGE
  // ==========================================
  'robert-saleh': {
    id: 'robert-saleh',
    name: 'Robert Saleh',
    role2026: 'Defensive Strategist / Head Coach',
    team: 'San Francisco 49ers / NY Jets',
    treeBranch: 'carroll-saleh-wide9',
    mentorId: 'pete-carroll',
    disciples: ['demeco-ryans'],
    category: 'defense',
    philosophy:
      'Penetrating 4-man rush with Wide-9 defensive end alignments and disruptive 3-techniques, backed by pattern-matching Cover 3 Rip/Liz and split-field Cover 6 bracket coverages.',
    keyConcepts: ['Wide-9 Defensive Front', 'Cover 3 Match (Rip/Liz)', 'Cross-Dog Fire Zone', 'Cover 6 Bracket'],
    schemeFamilyIds: ['saleh-43-wide9'],
    isHeadCoach2026: true,
    notableAchievements: ['2x #1 Defense Coordinator/HC', 'Super Bowl LIV Appearance'],
  },

  'demeco-ryans': {
    id: 'demeco-ryans',
    name: 'DeMeco Ryans',
    role2026: 'Head Coach, Houston Texans',
    team: 'Houston Texans',
    treeBranch: 'carroll-saleh-wide9',
    mentorId: 'robert-saleh',
    disciples: [],
    category: 'defense',
    philosophy:
      'Relentless downhill linebacker flow, penetrating defensive line pass-rush games, aggressive press quarters, and Cover 1 robber calls on key downs.',
    keyConcepts: ['Wide-9 Front Rush', 'Cover 1 Hole / Robber', 'Split-Safety Palms (2-Read)', 'Linebacker A-Gap Mug'],
    schemeFamilyIds: ['ryans-wide9-attack'],
    isHeadCoach2026: true,
    notableAchievements: ['2023 AP Coach of the Year Runner-Up', 'AFC South Champion'],
  },

  // ==========================================
  // BRIAN FLORES / PSYCHO BLITZ LINEAGE
  // ==========================================
  'brian-flores': {
    id: 'brian-flores',
    name: 'Brian Flores',
    role2026: 'Defensive Coordinator, Minnesota Vikings',
    team: 'Minnesota Vikings',
    treeBranch: 'belichick-flores',
    mentorId: 'bill-belichick',
    disciples: [],
    category: 'defense',
    philosophy:
      'Extreme binary defense: either 6-7 defenders threatening the line of scrimmage in Cover 0 all-out house blitzes, or dropping 8 into layered zone disguises that force turnovers.',
    keyConcepts: ['Cover 0 House Blitz', 'Drop-8 Psycho Front', 'Hot Coverage 2-Under 3-Deep', 'Simulated Edge Rush'],
    schemeFamilyIds: ['belichick-flores-psycho'],
    isHeadCoach2026: false,
    notableAchievements: ['Created NFL\'s #1 Blitz-Rate Defense with Vikings'],
  },

  // ==========================================
  // BEN JOHNSON — DETROIT COUNTER DECEPTION LINEAGE
  // ==========================================
  'ben-johnson': {
    id: 'ben-johnson',
    name: 'Ben Johnson',
    role2026: 'Head Coach, Chicago Bears',
    team: 'Chicago Bears',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'kyle-shanahan',
    disciples: [],
    category: 'offense',
    philosophy:
      'A masterclass in pre-snap deception: counter step misdirection, orbit motion setups, hook-ladder mesh rubs, and throwback bootlegs that exploit every linebacker\'s gap assignment while creating explosive play opportunities from seemingly ordinary run formations.',
    keyConcepts: ['Counter Trey Lead', 'PA TE Throwback', 'Hook-Ladder Mesh', 'Orbit Motion Screen'],
    schemeFamilyIds: ['johnson-counter-deception'],
    isHeadCoach2026: true,
    notableAchievements: ['Top-5 Scoring Offense Detroit Lions (2023-2024)', '2025 Bears HC Hiring'],
  },

  // ==========================================
  // STEVE SPAGNUOLO — KANSAS CITY EXOTIC BLITZ LINEAGE
  // ==========================================
  'steve-spagnuolo': {
    id: 'steve-spagnuolo',
    name: 'Steve Spagnuolo',
    role2026: 'Defensive Coordinator, Kansas City Chiefs',
    team: 'Kansas City Chiefs',
    treeBranch: 'belichick-flores',
    mentorId: 'bill-belichick',
    disciples: ['dan-quinn'],
    category: 'defense',
    philosophy:
      'Exotic blitz packages designed to create mental confusion rather than just physical pressure. Spagnuolo deploys corner blitzes, cross creepers, split-safety inversions, and Cover 0 max-heat looks that render pre-snap identification impossible for quarterbacks.',
    keyConcepts: ['Corndog Corner Blitz', 'Cross Creeper Drop', 'Cover 0 Max Heat', 'Split Safety Invert-2'],
    schemeFamilyIds: ['spagnuolo-exotic-blitz'],
    isHeadCoach2026: false,
    notableAchievements: ['3x Super Bowl Champion DC (LIV, LVII, LVIII)', 'NFL\'s Premier Exotic Blitz Architect'],
  },

  // ==========================================
  // DAN QUINN — COVER 3 PRESS & UNDER FRONT LINEAGE
  // ==========================================
  'dan-quinn': {
    id: 'dan-quinn',
    name: 'Dan Quinn',
    role2026: 'Head Coach, Washington Commanders',
    team: 'Washington Commanders',
    treeBranch: 'carroll-saleh-wide9',
    mentorId: 'pete-carroll',
    disciples: [],
    category: 'defense',
    philosophy:
      'Relentless physical press coverage, Under front gap control, and disciplined three-deep zone integrity. Quinn\'s defenses suffocate offenses with press-bail corners, 4-man rush games from Under front alignments, and safety sky fire zones that create explosive turnover opportunities.',
    keyConcepts: ['Cover 3 Press-Bail', 'Under Front Overload', 'Cover 1 Rat-in-Hole', 'Safety Sky Fire Zone'],
    schemeFamilyIds: ['quinn-cover3-press'],
    isHeadCoach2026: true,
    notableAchievements: ['Super Bowl LI Appearance', 'Legion of Boom DC', '2024 NFC Champions HC'],
  },

  // ==========================================
  // TODD BOWLES — TAMPA BAY CREEPER BLITZ LINEAGE
  // ==========================================
  'todd-bowles': {
    id: 'todd-bowles',
    name: 'Todd Bowles',
    role2026: 'Head Coach, Tampa Bay Buccaneers',
    team: 'Tampa Bay Buccaneers',
    treeBranch: 'belichick-flores',
    mentorId: 'bill-belichick',
    disciples: [],
    category: 'defense',
    philosophy:
      'Pressure through deception: disguise base coverages as exotic blitzes, then shift post-snap into drop-8 Tampa 2 lurk patterns or unleash delayed cross blitzes from unexpected angles. Bowles makes offenses prepare for 10 different looks and then shows them an 11th.',
    keyConcepts: ['Dual A-Gap Cross Blitz', 'Overload Boundary Fire', 'Drop-8 Tampa 2 Lurk', 'Peel Zone Sim Pressure'],
    schemeFamilyIds: ['bowles-creeper-blitz'],
    isHeadCoach2026: true,
    notableAchievements: ['Super Bowl LV Champion DC', 'Tampa Bay Buccaneers HC'],
  },

  // ==========================================
  // SEAN PAYTON — QUICK GAME & SCREEN LINEAGE
  // ==========================================
  'sean-payton': {
    id: 'sean-payton',
    name: 'Sean Payton',
    role2026: 'Head Coach, Denver Broncos',
    team: 'Denver Broncos',
    treeBranch: 'reid-west-coast',
    mentorId: 'bill-parcells',
    disciples: [],
    category: 'offense',
    philosophy:
      'The fastest pre-snap to post-snap pitch clock in football: quick-game rhythm throws (slant/flat, speed out), packaged with tunnel and fast screens, jet sweep run action, and lethal play-action shot plays that punish defenses for creeping up on the quick game.',
    keyConcepts: ['Quick Game Rhythm (Slant-Flat)', 'Fast/Tunnel Screen Convoy', 'Jet Sweep Run Action', 'PA Deep Shot off Screen'],
    schemeFamilyIds: ['payton-quick-game-screens'],
    isHeadCoach2026: true,
    notableAchievements: ['Super Bowl XLIV Champion HC', 'Highest Quick-Game Usage Rate of His Era'],
  },

  // ==========================================
  // GREG ROMAN — POWER READ & QB RUN LINEAGE
  // ==========================================
  'greg-roman': {
    id: 'greg-roman',
    name: 'Greg Roman',
    role2026: 'Offensive Coordinator, Los Angeles Chargers',
    team: 'Los Angeles Chargers',
    treeBranch: 'power-gap-duo',
    mentorId: 'john-harbaugh',
    disciples: [],
    category: 'offense',
    philosophy:
      'Downhill gap-scheme football weaponized through quarterback run threat: power-read pulls, QB power/counter runs from heavy personnel, pin-and-pull leverage, and massive play-action shots built entirely off the run-game picture.',
    keyConcepts: ['Power Read Pull', 'QB Power / Counter Run', 'Pin & Pull Leverage', 'Heavy Personnel PA Shot'],
    schemeFamilyIds: ['roman-power-read'],
    isHeadCoach2026: false,
    notableAchievements: ['Architect of Lamar Jackson MVP Run Offense (Ravens)', 'NCAA-record Option Offenses at Stanford/Nevada'],
  },

  // ==========================================
  // KEVIN O'CONNELL — BOOT & DAGGER LINEAGE
  // ==========================================
  'kevin-oconnell': {
    id: 'kevin-oconnell',
    name: "Kevin O'Connell",
    role2026: 'Head Coach, Minnesota Vikings',
    team: 'Minnesota Vikings',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'sean-mcvay',
    disciples: [],
    category: 'offense',
    philosophy:
      'A play-action passing machine: wide-zone and Duo fakes feeding bootleg flood rollouts, Dagger (seam/curl-flat) intermediate shots, and condensed formations that force light boxes into unblockable run-pass conflicts.',
    keyConcepts: ['Wide-Zone Boot Flood', 'Dagger Seam/Curl-Flat', 'Play-Action Rate Leadership', 'Condensed Light-Box Attacks'],
    schemeFamilyIds: ['oconnell-boot-dagger'],
    isHeadCoach2026: true,
    notableAchievements: ['Top-3 Play-Action Offense (Vikings)', 'Super Bowl LVI OC (Rams)'],
  },

  // ==========================================
  // LIAM COEN — HYBRID WIDE-ZONE RPO LINEAGE
  // ==========================================
  'liam-coen': {
    id: 'liam-coen',
    name: 'Liam Coen',
    role2026: 'Head Coach, Jacksonville Jaguars',
    team: 'Jacksonville Jaguars',
    treeBranch: 'shanahan-kubiak',
    mentorId: 'sean-mcvay',
    disciples: [],
    category: 'offense',
    philosophy:
      'The modern evolution of the Shanahan-McVay tree: wide-zone runs packaged directly with RPOs (glance, bubble, slant-flat), heavy pre-snap motion declaring defensive fits, and space attacks that turn every zone-stretch call into a triple-option math problem for the defense.',
    keyConcepts: ['Wide-Zone + Glance RPO Package', 'Bubble-Slant Flat Triangle', 'Motion-to-Fit Declaration', 'Perimeter Crack-Toss'],
    schemeFamilyIds: ['coen-wide-zone-rpo'],
    isHeadCoach2026: true,
    notableAchievements: ['Top-5 Total Offense with Buccaneers (2024)', 'Rams & Kentucky Offensive Architect'],
  },

  // ==========================================
  // CHIP KELLY — TEMPO SPREAD AIR RAID LINEAGE
  // ==========================================
  'chip-kelly': {
    id: 'chip-kelly',
    name: 'Chip Kelly',
    role2026: 'Offensive Coordinator, Las Vegas Raiders',
    team: 'Las Vegas Raiders',
    treeBranch: 'reid-west-coast',
    mentorId: 'jack-elway',
    disciples: [],
    category: 'offense',
    philosophy:
      'Tempo as a weapon: snap-rate stress, spread-option run game with RB-draw and zone-read elements, Air Raid mesh/spot spacing concepts, and vertical four-verts takes that force defenses to communicate at a pace they cannot sustain.',
    keyConcepts: ['Snap-Rate Tempo Stress', 'Mesh & Spot Spacing', 'Zone-Read / RB Draw Mix', 'Four-Verts Takeovers'],
    schemeFamilyIds: ['kelly-tempo-spread'],
    isHeadCoach2026: false,
    notableAchievements: ['Pioneered NFL Tempo Spread (Eagles 2013-2015)', 'Record-Setting Oregon Fast-Break Offense'],
  },

  // ==========================================
  // HISTORICAL NFL & COLLEGE EXPANSION — OFFENSE
  // ==========================================
  'don-coryell': {
    id: 'don-coryell',
    name: 'Don Coryell',
    role2026: 'Pro Football Hall of Fame Patriarch',
    team: 'San Diego Chargers (1978-1986) / St. Louis Cardinals',
    treeBranch: 'coryell-vertical',
    category: 'offense',
    philosophy:
      'Father of the modern vertical passing game: one-back sets, full route trees for every receiver, deep shots downfield off a power run game, and quarterback progressions that attacked every level of the field.',
    keyConcepts: ['Vertical Route Tree', 'One-Back Z-Snap Sets', 'Deep Ball Geometry', 'Seam & Post Strokes'],
    schemeFamilyIds: ['coryell-vertical'],
    isHeadCoach2026: false,
    notableAchievements: ['Pro Football Hall of Fame (2023)', '5x Division Champion', 'Air Coryell Ancestor of Modern Passing Trees'],
  },
  'june-jones': {
    id: 'june-jones',
    name: 'June Jones',
    role2026: 'Run and Shoot Pioneer',
    team: 'Houston Oilers / Atlanta Falcons / Hawaii / SMU',
    treeBranch: 'coryell-vertical',
    category: 'offense',
    philosophy:
      'Four-wide read-route passing: receivers convert their routes on the fly against coverage leverage, with no huddle tempo and QB reads that attack grass the defense refuses to cover.',
    keyConcepts: ['Read-Route Adjustments', 'Four-Wide Spacing', 'No-Huddle Tempo', 'Switch & Mesh Conversions'],
    schemeFamilyIds: ['run-and-shoot'],
    isHeadCoach2026: false,
    notableAchievements: ['Revolutionized NFL Passing with Oilers Run and Shoot', 'Hawaii Warrior Record Offenses'],
  },
  'hal-mumme': {
    id: 'hal-mumme',
    name: 'Hal Mumme',
    role2026: 'Air Raid Co-Inventor',
    team: 'Kentucky / Valdosta State / Iowa Wesleyan',
    treeBranch: 'air-raid',
    category: 'offense',
    philosophy:
      'Co-invented the Air Raid at Iowa Wesleyan and Kentucky: mesh, shallow, and stick spacing concepts thrown from empty looks, practicing only a handful of plays thousands of times.',
    keyConcepts: ['Mesh Concept', 'Shallow Cross', 'Stick Spacing', 'Empty Formations'],
    schemeFamilyIds: ['air-raid'],
    isHeadCoach2026: false,
    notableAchievements: ['Invented the Air Raid Offense', 'Tim Couch Record Passing Seasons at Kentucky'],
  },
  'mike-leach': {
    id: 'mike-leach',
    name: 'Mike Leach',
    role2026: 'Air Raid Patriarch',
    team: 'Texas Tech / Washington State / Mississippi State',
    treeBranch: 'air-raid',
    mentorId: 'hal-mumme',
    category: 'offense',
    philosophy:
      'Distributed the Air Raid to the mainstream: five-receiver spacing, swing-screen constraint rules, and relentless Y-cross and mesh volume that turns any coverage into a numbers problem.',
    keyConcepts: ['Y-Cross', 'Swing Screen Constraint', 'Five-Open Spacing', 'Scat Distribution'],
    schemeFamilyIds: ['air-raid'],
    isHeadCoach2026: false,
    notableAchievements: ['All-Time Passing Offense Records (Texas Tech/WSU)', 'Guru of the Modern College Passing Game'],
  },
  'paul-johnson': {
    id: 'paul-johnson',
    name: 'Paul Johnson',
    role2026: 'Flexbone Triple Option Architect',
    team: 'Georgia Tech (2008-2018) / Navy',
    treeBranch: 'option-spread',
    category: 'offense',
    philosophy:
      'Modern flexbone triple option: midline, veer, and rocket pitch series out of two-back slotback sets, mathematically forcing defenders into wrong answers on every snap.',
    keyConcepts: ['Midline Triple', 'Rocket Toss', 'Veer Pitch Key', 'Slotback Pitch Geometry'],
    schemeFamilyIds: ['flexbone-triple-option'],
    isHeadCoach2026: false,
    notableAchievements: ['2x National Coach of the Year (I-AA)', 'ACC Champion Georgia Tech Offenses'],
  },
  'urban-meyer': {
    id: 'urban-meyer',
    name: 'Urban Meyer',
    role2026: 'Spread Option Patriarch',
    team: 'Florida / Ohio State (2001-2018)',
    treeBranch: 'option-spread',
    category: 'offense',
    philosophy:
      'Married spread-option zone-read runs with perimeter speed: inverted veer, inside-zone read, and snag-spacing RPOs built around an athletic quarterback as a true ball carrier.',
    keyConcepts: ['Inside Zone Read', 'Inverted Veer', 'Snag Triangle', 'Perimeter Speed Sweep'],
    schemeFamilyIds: ['meyer-spread-option'],
    isHeadCoach2026: false,
    notableAchievements: ['3x National Champion HC', 'Pioneered College Spread-Option Era'],
  },
  'chris-ault': {
    id: 'chris-ault',
    name: 'Chris Ault',
    role2026: 'Pistol Offense Inventor',
    team: 'Nevada Wolf Pack (multiple tenures)',
    treeBranch: 'option-spread',
    category: 'offense',
    philosophy:
      'Invented the Pistol at Nevada: quarterback in a short gun at 4 yards with the back directly behind, blending downhill zone-run physics with modern read-option threat.',
    keyConcepts: ['Pistol Alignment', 'Zone Read from Pistol', 'Downhill Run Physics', 'Play-Action Off Gun Run'],
    schemeFamilyIds: ['pistol-read-option'],
    isHeadCoach2026: false,
    notableAchievements: ['Invented the Pistol Formation', 'Colin Kaepernick Nevada Record Offenses'],
  },
  'art-briles': {
    id: 'art-briles',
    name: 'Art Briles',
    role2026: 'Baylor Vertical Spread Architect',
    team: 'Baylor Bears (2008-2015)',
    treeBranch: 'option-spread',
    category: 'offense',
    philosophy:
      'Vertical choice spread: outside receivers get single-word shot calls ("choice") off inside-zone run action, forcing safeties to defend the entire deep field on every snap.',
    keyConcepts: ['Slot Choice Shots', 'Vertical Stretch off Run Action', 'One-Word Shot Calls', 'Explosive Play Hunting'],
    schemeFamilyIds: ['baylor-choice'],
    isHeadCoach2026: false,
    notableAchievements: ['2x Big 12 Champion Baylor', 'Record-Breaking Explosive Play Offenses'],
  },
  'tubby-raymond': {
    id: 'tubby-raymond',
    name: 'Tubby Raymond',
    role2026: 'Delaware Wing-T Patriarch',
    team: 'Delaware Fightin Blue Hens (1966-2001)',
    treeBranch: 'delaware-wing-t',
    category: 'offense',
    philosophy:
      'Guard-pull buck sweep series with counter-crisscross fakes, wingback motion, and ball-handling deception that made three plays look like nine.',
    keyConcepts: ['Buck Sweep Series', 'Guard Pull Mechanics', 'Counter Crisscross', 'Wingback Motion Deception'],
    schemeFamilyIds: ['delaware-wing-t'],
    isHeadCoach2026: false,
    notableAchievements: ['300 Career Wins at Delaware', '2x Division I-AA National Champion'],
  },
  'vince-lombardi': {
    id: 'vince-lombardi',
    name: 'Vince Lombardi',
    role2026: 'Pro Football Hall of Fame Patriarch',
    team: 'Green Bay Packers (1959-1967)',
    treeBranch: 'power-gap-duo',
    category: 'offense',
    philosophy:
      'Won five championships with essentially one play: the power sweep. Downhill gap blocking, pulling guards, and relentless rep perfection turned simplicity into inevitability.',
    keyConcepts: ['Power Sweep', 'Pulling Guard Gap Scheme', 'Downhill Physicality', 'Rep Perfection'],
    schemeFamilyIds: ['t-formation-power-sweep'],
    isHeadCoach2026: false,
    notableAchievements: ['5x NFL Champion', 'Super Bowl I & II Winner', "Super Bowl Trophy Named in His Honor"],
  },

  // ==========================================
  // HISTORICAL NFL & COLLEGE EXPANSION — DEFENSE
  // ==========================================
  'buddy-ryan': {
    id: 'buddy-ryan',
    name: 'Buddy Ryan',
    role2026: '46 Defense Inventor',
    team: 'Chicago Bears DC (1978-1985) / Philadelphia Eagles HC',
    treeBranch: 'buddy-46',
    category: 'defense',
    philosophy:
      'Eight-man box with zero deep-middle help: walk both safeties up, isolate corners on man islands outside, and overload protection rules with unblockable edge combinations.',
    keyConcepts: ['46 Eight-Man Box', 'Man-Free Isolation Corners', 'Edge Overload Combos', 'Okie Slant Games'],
    schemeFamilyIds: ['buddy-46-defense'],
    isHeadCoach2026: false,
    notableAchievements: ['Super Bowl XX Champion DC', '85 Bears Historic Scoring Defense'],
  },
  'dick-lebeau': {
    id: 'dick-lebeau',
    name: 'Dick LeBeau',
    role2026: 'Fire Zone Blitz Patriarch',
    team: 'Cincinnati Bengals / Pittsburgh Steelers (DC)',
    treeBranch: 'lebeau-zone-blitz',
    category: 'defense',
    philosophy:
      'Invented the zone blitz: send five while dropping a lineman into coverage behind a fire zone, breaking slide-protection arithmetic without sacrificing zone integrity.',
    keyConcepts: ['Fire Zone 3-Deep 3-Under', 'DL Coverage Drops', 'Slide Protection Conflict', 'Safety Rotation Disguise'],
    schemeFamilyIds: ['lebeau-fire-zone'],
    isHeadCoach2026: false,
    notableAchievements: ['2x Super Bowl Champion DC (XL, XLIII)', 'Pro Football Hall of Fame (2010)', 'Inventor of Zone Blitz'],
  },
  'dom-capers': {
    id: 'dom-capers',
    name: 'Dom Capers',
    role2026: 'Zone Blitz Systemizer',
    team: 'Pittsburgh Steelers DC / Carolina Panthers / Houston Texans HC / Green Bay Packers DC',
    treeBranch: 'lebeau-zone-blitz',
    mentorId: 'dick-lebeau',
    category: 'defense',
    philosophy:
      'Industrialized LeBeau\u2019s zone blitz into a full pressure menu: Blitzburgh 3-4 packages, fire zones from every alignment, and formation-agnostic pressure distribution.',
    keyConcepts: ['Blitzburgh 3-4 Pressure Menu', 'Fire Zone Multiplicity', 'Formation-Agnostic Pressure', 'OL Assignment Confusion'],
    schemeFamilyIds: [],
    isHeadCoach2026: false,
    notableAchievements: ['First Carolina Panthers HC', 'Super Bowl XLV Champion DC'],
  },
  'tony-dungy': {
    id: 'tony-dungy',
    name: 'Tony Dungy',
    role2026: 'Tampa 2 Architect',
    team: 'Tampa Bay Buccaneers (1996-2001) / Indianapolis Colts',
    treeBranch: 'two-deep-shell',
    category: 'defense',
    philosophy:
      'Middle-of-the-field-closed Cover 2 where the Mike linebacker runs the deep hole: trade pressure for takeaways, force tight intermediate windows, and let the front four hunt.',
    keyConcepts: ['Cover 2 Sink', 'Mike Deep-Hole Drop', 'Corner Underneath Squat Technique', 'Takeaway-First Philosophy'],
    schemeFamilyIds: ['tampa-2'],
    isHeadCoach2026: false,
    notableAchievements: ['Super Bowl XLI Champion HC', 'Rebuilt Buccaneers & Colts Defenses'],
  },
  'lovie-smith': {
    id: 'lovie-smith',
    name: 'Lovie Smith',
    role2026: 'Tampa 2 Disciple',
    team: 'Chicago Bears HC (2004-2012, 2022) / Tampa Bay Buccaneers',
    treeBranch: 'two-deep-shell',
    mentorId: 'tony-dungy',
    category: 'defense',
    philosophy:
      'Ran Dungy\u2019s Tampa 2 blueprint to a Super Bowl: four-man rush discipline, Mike-hole depth by linebacker committee, and strip-at-the-ball takeaway drills.',
    keyConcepts: ['Mike Hole Rotation', 'Four-Man Rush Discipline', 'Strip Sack Takeaway Drills', 'Cloud Boundary Variants'],
    schemeFamilyIds: [],
    isHeadCoach2026: false,
    notableAchievements: ['Super Bowl XLI Appearance HC', 'Bears NFC Championship Defense'],
  },
  'marvin-lewis': {
    id: 'marvin-lewis',
    name: 'Marvin Lewis',
    role2026: 'Cover 2 Man-Under Pioneer',
    team: 'Baltimore Ravens DC (1996-2001) / Cincinnati Bengals HC',
    treeBranch: 'two-deep-shell',
    category: 'defense',
    philosophy:
      'Two-deep safeties over pure man-underneath: erase crossers and stacked routes entirely in the red zone and dare fades and back-shoulder throws against trail technique.',
    keyConcepts: ['2-Man Red Zone Shell', 'Trail Press Technique', 'Crossing Route Elimination', 'Double Deep Erase'],
    schemeFamilyIds: ['cover2-man-under'],
    isHeadCoach2026: false,
    notableAchievements: ['Architect of Ravens 2000 Record Defense', 'Super Bowl XXXV Champion DC'],
  },
  'tom-landry': {
    id: 'tom-landry',
    name: 'Tom Landry',
    role2026: 'Flex Defense Inventor',
    team: 'Dallas Cowboys (1960-1988)',
    treeBranch: 'landry-dallas',
    category: 'defense',
    philosophy:
      'Invented the 4-3 and perfected the Flex: staggered one-yard-off tackle alignments, patient gap occupation instead of pursuit, and pre-snap strength-shift linebackers designed to strangle sweeps.',
    keyConcepts: ['Flexed Tackle Alignments', 'Gap-Zone Run Fits', 'Three-Defender Point-of-Attack Convergence', 'Strength Shift Linebackers'],
    schemeFamilyIds: ['landry-flex'],
    isHeadCoach2026: false,
    notableAchievements: ['2x Super Bowl Champion HC', '20 Consecutive Winning Seasons', 'Inventor of the 4-3 Defense'],
  },
  'jimmy-johnson': {
    id: 'jimmy-johnson',
    name: 'Jimmy Johnson',
    role2026: 'Speed 4-3 Template Builder',
    team: 'Miami Hurricanes / Dallas Cowboys (1989-1993)',
    treeBranch: 'landry-dallas',
    mentorId: undefined,
    category: 'defense',
    philosophy:
      'Undersized, hyper-fast linemen slanting upfield at the snap: pure penetration chaos, one-gap attacking fits, and coverage built to survive the resulting one-on-ones.',
    keyConcepts: ['Penetration Slant Loops', 'Speed-over-Size Front', 'Man-Free Blitz Dogs', 'Relentless Pursuit Rules'],
    schemeFamilyIds: ['jj-speed-43'],
    isHeadCoach2026: false,
    notableAchievements: ['2x Super Bowl Champion HC (XXVII, XXVIII)', 'National Champion Miami Hurricanes', 'Template for Modern Speed Fronts'],
  },
  'bum-phillips': {
    id: 'bum-phillips',
    name: 'Bum Phillips',
    role2026: 'Two-Gap 3-4 Revivalist',
    team: 'Houston Oilers (1975-1980) / New Orleans Saints',
    treeBranch: 'phillips-two-gap',
    category: 'defense',
    philosophy:
      'Revived the modern 3-4 to combat Pittsburgh\u2019s power game: zero/one-tech nose two-gapping, stand-up edge linebackers as rush weapons, and second-level speed flowing over the top.',
    keyConcepts: ['Zero-Tech Two-Gap Nose', 'Stand-Up Edge Duo', 'Over-the-Top LB Flow', 'Power Counter-Matches'],
    schemeFamilyIds: ['phillips-two-gap-34'],
    isHeadCoach2026: false,
    notableAchievements: ['Revived the Modern 3-4 Base Defense', 'Oilers Luv Ya Blue Defenses'],
  },
  'dave-aranda': {
    id: 'dave-aranda',
    name: 'Dave Aranda',
    role2026: 'Tite Front / Peso Architect',
    team: 'Baylor Bears HC / LSU DC (2016-2019)',
    treeBranch: 'college-defensive-fronts',
    category: 'defense',
    philosophy:
      'Engineered the tite front (4i-0-4i) to eliminate B-gaps against spread run, played from peso nickel/dime personnel with hybrid DB-linebackers, and layered simulated pressures on top.',
    keyConcepts: ['4i-0-4i Tite Box', 'Peso Hybrid Personnel', 'Apex Linebacker Splits', 'ILB-DL Simulated Exchanges'],
    schemeFamilyIds: ['aranda-tite-peso'],
    isHeadCoach2026: true,
    notableAchievements: ['2019 National Championship DC (LSU)', 'Baylor Big 12 Championship Game Appearances'],
  },
  'rocky-long': {
    id: 'rocky-long',
    name: 'Rocky Long',
    role2026: '3-3-5 Stack Evangelist',
    team: 'San Diego State HC / New Mexico (1998-2019)',
    treeBranch: 'college-defensive-fronts',
    category: 'defense',
    philosophy:
      'Odd-stack defense where every box defender is a potential blitzer: constant slant-exchange games, safety/corner cross-dogs, and total pre-snap ambiguity about who rushes.',
    keyConcepts: ['Stacked Linebacker Exchange', 'Committee Pressure Generation', 'Five-DB Every-Down Structure', 'Slant-Game Chaos'],
    schemeFamilyIds: ['rlong-335-stack'],
    isHeadCoach2026: false,
    notableAchievements: ['Mountain West Dominance at San Diego State', 'Popularized the Modern 3-3-5 Stack'],
  },
};

export const ALL_COACHES: CoachProfile[] = Object.values(COACH_PROFILES);

export const COACHING_TREES: CoachingTree[] = [
  {
    id: 'shanahan-kubiak',
    name: 'Shanahan / Kubiak Wide-Zone Tree',
    patriarch: 'Bill Walsh → Mike Shanahan & Gary Kubiak',
    category: 'offense',
    description:
      'The most influential offensive lineage in modern NFL football. Stemming from Bill Walsh’s West Coast spacing and Mike Shanahan & Gary Kubiak’s legendary Denver Broncos zone-stretch run game. Powers today’s elite offenses led by Kyle Shanahan, Sean McVay, Klint Kubiak, Matt LaFleur, and Mike McDaniel through horizontal stretch runs, play-action deep shots, and disguise meshes identical for the first 1.2 seconds.',
    rootNodes: [
      {
        coach: COACH_PROFILES['bill-walsh'],
        children: [
          {
            coach: COACH_PROFILES['mike-shanahan'],
            children: [
              {
                coach: COACH_PROFILES['kyle-shanahan'],
                children: [
                  { coach: COACH_PROFILES['klint-kubiak'], children: [] },
                  { coach: COACH_PROFILES['mike-lafleur'], children: [] },
                  { coach: COACH_PROFILES['mike-mcdaniel'], children: [] },
                  { coach: COACH_PROFILES['matt-lafleur'], children: [] },
                  { coach: COACH_PROFILES['ben-johnson'], children: [] },
                ],
              },
              {
                coach: COACH_PROFILES['sean-mcvay'],
                children: [
                  { coach: COACH_PROFILES['kevin-oconnell'], children: [] },
                  { coach: COACH_PROFILES['liam-coen'], children: [] },
                ],
              },
              {
                coach: COACH_PROFILES['gary-kubiak'],
                children: [
                  { coach: COACH_PROFILES['kevin-stefanski'], children: [] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'reid-west-coast',
    name: 'Andy Reid West Coast / Spread RPO Tree',
    patriarch: 'Bill Walsh → Andy Reid',
    category: 'offense',
    description:
      'A pillar of modern offensive innovation. Blends classic West Coast rhythm and pass spacing with modern college Spread RPOs, empty/bunch formations, Mesh shallow crosses, jet shovel screens, and 13-personnel tight-end power mismatches.',
    rootNodes: [
      {
        coach: COACH_PROFILES['bill-walsh'],
        children: [
          {
            coach: COACH_PROFILES['andy-reid'],
            children: [
              { coach: COACH_PROFILES['john-harbaugh'], children: [] },
              { coach: COACH_PROFILES['shane-steichen'], children: [] },
              { coach: COACH_PROFILES['nick-sirianni'], children: [] },
              { coach: COACH_PROFILES['sean-payton'], children: [] },
              { coach: COACH_PROFILES['chip-kelly'], children: [] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'power-gap-duo',
    name: 'Power Gap & Duo / QB Run-Game Tree',
    patriarch: 'John Harbaugh → Greg Roman',
    category: 'offense',
    description:
      'The downhill gap-scheme lineage: power, duo, counter, and pin-and-pull runs married to genuine quarterback run threat. Built on heavy personnel, play-action off identical run pictures, and forcing light boxes into unblockable run-pass conflicts.',
    rootNodes: [
      {
        coach: COACH_PROFILES['vince-lombardi'],
        children: [],
      },
      {
        coach: COACH_PROFILES['greg-roman'],
        children: [],
      },
    ],
  },
  {
    id: 'carroll-saleh-wide9',
    name: 'Pete Carroll / Robert Saleh Wide-9 & Match Tree',
    patriarch: 'Pete Carroll → Robert Saleh',
    category: 'defense',
    description:
      'A defensive system defined by pure physical dominance and gap-integrity. Employs wide-9 defensive end splits and penetrating 3-techniques to create organic 4-man pressure, backed by disciplined Cover 3 Rip/Liz Match, split-field Cover 6 bracket coverages, and A-gap cross-dog fire zones.',
    rootNodes: [
      {
        coach: COACH_PROFILES['pete-carroll'],
        children: [
          {
            coach: COACH_PROFILES['robert-saleh'],
            children: [
              { coach: COACH_PROFILES['demeco-ryans'], children: [] },
            ],
          },
          {
            coach: COACH_PROFILES['dan-quinn'],
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'macdonald-pressure',
    name: 'Mike Macdonald Sim-Pressure & Hybrid Disguise Tree',
    patriarch: 'John Harbaugh → Mike Macdonald',
    category: 'defense',
    description:
      'The cutting edge of NFL defensive design. Built on pre-snap ambiguity, Double-A mug and Amoeba fronts, 4-man Simulated Pressures (Creepers) dropping interior linemen into throwing windows while sending DBs, post-snap split safety spins, and Cover 0 peel blitzes.',
    rootNodes: [
      {
        coach: COACH_PROFILES['john-harbaugh'],
        children: [
          {
            coach: COACH_PROFILES['mike-macdonald'],
            children: [
              { coach: COACH_PROFILES['jesse-minter'], children: [] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fangio-two-high',
    name: 'Vic Fangio Two-High Shell & Quarters Tree',
    patriarch: 'Vic Fangio',
    category: 'defense',
    description:
      'The defensive system that forced modern offenses to adapt. Shows a static two-high safety shell before the snap to disguise Cover 6, Cover 8, and Quarters match calls, paired with light 3-man Penny fronts to stifle explosive downfield crossers and force long, mistake-prone drives.',
    rootNodes: [
      {
        coach: COACH_PROFILES['vic-fangio'],
        children: [
          { coach: COACH_PROFILES['chris-shula'], children: [] },
        ],
      },
    ],
  },
  {
    id: 'belichick-flores',
    name: 'Bill Belichick / Brian Flores Psycho Blitz Tree',
    patriarch: 'Bill Belichick → Brian Flores',
    category: 'defense',
    description:
      'A radical, highly aggressive defensive philosophy based on extreme binary pressure looks: either sending 6-7 rushers in all-out Cover 0 house blitzes, or bluffing everybody and dropping 8 into muddy coverage zones.',
    rootNodes: [
      {
        coach: COACH_PROFILES['bill-belichick'],
        children: [
          { coach: COACH_PROFILES['brian-flores'], children: [] },
          {
            coach: COACH_PROFILES['steve-spagnuolo'],
            children: [],
          },
          { coach: COACH_PROFILES['todd-bowles'], children: [] },
        ],
      },
    ],
  },

  // ==========================================
  // HISTORICAL NFL & COLLEGE EXPANSION TREES
  // ==========================================
  {
    id: 'coryell-vertical',
    name: 'Air Coryell / Run and Shoot Vertical Passing Tree',
    patriarch: 'Don Coryell → June Jones',
    category: 'offense',
    description:
      'The ancestor of every modern vertical passing attack. Don Coryell\u2019s one-back Air Coryell route tree forced defenses to defend the entire depth of the field for the first time; June Jones\u2019 Run and Shoot made receivers into live read-routes who converted their patterns on the fly against coverage leverage.',
    rootNodes: [
      {
        coach: COACH_PROFILES['don-coryell'],
        children: [
          { coach: COACH_PROFILES['june-jones'], children: [] },
        ],
      },
    ],
  },
  {
    id: 'air-raid',
    name: 'Air Raid Spacing Tree',
    patriarch: 'Hal Mumme → Mike Leach',
    category: 'offense',
    description:
      'The college game\u2019s great equalizer: a handful of mesh, shallow, and stick spacing concepts repped thousands of times from empty and five-open formations, weaponizing distribution over play design and turning any coverage into a numbers problem.',
    rootNodes: [
      {
        coach: COACH_PROFILES['hal-mumme'],
        children: [
          { coach: COACH_PROFILES['mike-leach'], children: [] },
        ],
      },
    ],
  },
  {
    id: 'option-spread',
    name: 'College Option & Spread Revolution Tree',
    patriarch: 'Paul Johnson / Urban Meyer / Chris Ault / Art Briles',
    category: 'offense',
    description:
      'Four parallel college revolutions that reshaped the run-pass interface: the flexbone triple option\u2019s mathematical pitch geometry, Meyer\u2019s spread-option zone read, Ault\u2019s Pistol downhill physics, and Briles\u2019 vertical choice shots off run action.',
    rootNodes: [
      { coach: COACH_PROFILES['paul-johnson'], children: [] },
      { coach: COACH_PROFILES['urban-meyer'], children: [] },
      { coach: COACH_PROFILES['chris-ault'], children: [] },
      { coach: COACH_PROFILES['art-briles'], children: [] },
    ],
  },
  {
    id: 'delaware-wing-t',
    name: 'Delaware Wing-T Deception Tree',
    patriarch: 'Tubby Raymond',
    category: 'offense',
    description:
      'Guard-pull buck sweep series with counter crisscross fakes and wingback motion — the gold standard of ball-handling deception, making three base plays look like nine through backfield choreography alone.',
    rootNodes: [
      { coach: COACH_PROFILES['tubby-raymond'], children: [] },
    ],
  },
  {
    id: 'buddy-46',
    name: 'Buddy Ryan 46 Pressure Tree',
    patriarch: 'Buddy Ryan',
    category: 'defense',
    description:
      'The most radical base defense ever fielded: an eight-man box with zero deep-middle help, isolated press corners, and unblockable edge overload combinations that broke protection rules by arithmetic. Its DNA survives in every modern Bear front and mug pressure.',
    rootNodes: [
      { coach: COACH_PROFILES['buddy-ryan'], children: [] },
    ],
  },
  {
    id: 'lebeau-zone-blitz',
    name: 'LeBeau Zone Blitz Fire Zone Tree',
    patriarch: 'Dick LeBeau → Dom Capers',
    category: 'defense',
    description:
      'The invention that changed defensive math forever: send five while dropping a lineman behind a fire zone, breaking slide-protection assignments without sacrificing zone integrity. The direct ancestor of today\u2019s creeper and sim-pressure worlds.',
    rootNodes: [
      {
        coach: COACH_PROFILES['dick-lebeau'],
        children: [
          { coach: COACH_PROFILES['dom-capers'], children: [] },
        ],
      },
    ],
  },
  {
    id: 'landry-dallas',
    name: 'Landry Flex / Doomsday Front Tree',
    patriarch: 'Tom Landry → Jimmy Johnson',
    category: 'defense',
    description:
      'From the inventor of the 4-3 to its speed evolution: Landry\u2019s staggered Flex alignments strangled sweeps with patient gap-zone convergence; Jimmy Johnson rebuilt Dallas with undersized penetration chaos that prefigured the modern attacking front.',
    rootNodes: [
      {
        coach: COACH_PROFILES['tom-landry'],
        children: [
          { coach: COACH_PROFILES['jimmy-johnson'], children: [] },
        ],
      },
    ],
  },
  {
    id: 'phillips-two-gap',
    name: 'Phillips Two-Gap 3-4 Tree',
    patriarch: 'Bum Phillips',
    category: 'defense',
    description:
      'The revival of the modern 3-4: zero-tech nose two-gapping to free athletic linebackers, stand-up edge rushers as designated weapons, and second-level flow speed built specifically to counter Pittsburgh-style power football.',
    rootNodes: [
      { coach: COACH_PROFILES['bum-phillips'], children: [] },
    ],
  },
  {
    id: 'two-deep-shell',
    name: 'Two-Deep Shell / Tampa 2 Tree',
    patriarch: 'Tony Dungy → Lovie Smith / Marvin Lewis',
    category: 'defense',
    description:
      'Two safeties splitting the deep field as a committed identity: Tampa 2\u2019s zone sink with the Mike running the deep hole, and Marvin Lewis\u2019 red-zone 2-Man with pure man underneath — opposite underneath logic under an identical shell.',
    rootNodes: [
      {
        coach: COACH_PROFILES['tony-dungy'],
        children: [
          { coach: COACH_PROFILES['lovie-smith'], children: [] },
        ],
      },
      { coach: COACH_PROFILES['marvin-lewis'], children: [] },
    ],
  },
  {
    id: 'college-defensive-fronts',
    name: 'Modern College Hybrid Front Tree',
    patriarch: 'Dave Aranda / Rocky Long',
    category: 'defense',
    description:
      'The current college counter-punch to spread offense: Aranda\u2019s tite front (4i-0-4i) played from peso hybrid personnel to erase B-gaps against zone read, and Rocky Long\u2019s 3-3-5 stack where every box defender is a potential blitzer behind total pre-snap ambiguity.',
    rootNodes: [
      { coach: COACH_PROFILES['dave-aranda'], children: [] },
      { coach: COACH_PROFILES['rocky-long'], children: [] },
    ],
  },
];

export function getCoachById(id: string): CoachProfile | undefined {
  return COACH_PROFILES[id];
}

export function getTreeByBranch(branch: string): CoachingTree | undefined {
  return COACHING_TREES.find((t) => t.id === branch);
}
