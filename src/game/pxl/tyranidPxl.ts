/**
 * Warhammer 40k: Tyranid Swarm Sprite Definitions in Claude-PXL DSL
 * 
 * Provides pixel-perfect 16-bit raster matrix definitions for:
 * - Hormagaunt: Agile bounding predator with elongated scything talons and whip tail
 * - Termagant: Swarm creature carrying a living Fleshborer bio-gun
 * - Genestealer: 4-armed apex infiltrator with diamond-hard rending claws
 * - Tyranid Warrior: Towering Synapse commander with dual energized Boneswords
 * 
 * Includes palette swaps for iconic Hive Fleets:
 * - Leviathan (Ivory flesh + Deep purple carapace + Crimson talons)
 * - Kraken (Warm bone flesh + Blood red carapace + Obsidian talons)
 * - Behemoth (Angry crimson flesh + Abyssal blue carapace + Cyan feathering)
 */

import { PxlSpriteDef } from './claudePxlEngine';

export interface TyranidPxlOptions {
  fleet?: 'leviathan' | 'kraken' | 'behemoth';
  frame?: number;           // 0..3 walk cycle
  isPouncing?: boolean;      // Hormagaunt leap attack
  isFiring?: boolean;        // Termagant fleshborer shot
  isSlashing?: boolean;      // Genestealer / Warrior claw slash
  isHurt?: boolean;
  isSynapseActive?: boolean; // Warrior synapse web aura
  elapsedTime?: number;
}

const BASE_TYRANID_PALETTE: Record<string, string> = {
  '.': 'transparent',
  '#': '#0c051a',       // Deep grimdark outline
  // Flesh / Skin (corpse bone / bleached ivory with lavender shading)
  'f': '#f3e8ff',       // Bone flesh highlight
  'F': '#decdeb',       // Bone flesh mid
  's': '#b4a0c8',       // Flesh shadow (lavender-grey)
  'S': '#78648c',       // Deep fleshy crevice
  // Carapace (Naggaroth Night -> Xereus Purple -> Slaanesh feathering)
  'c': '#1e0830',       // Carapace darkest shadow
  'C': '#411262',       // Carapace deep purple
  'p': '#7323a5',       // Carapace purple mid
  'P': '#af5fe1',       // Feathered edge highlight
  'l': '#dcaffc',       // Extreme ridge specular glint
  // Talons / Hooves (Obsidian / Crimson bio-blades)
  't': '#140f19',       // Obsidian dark
  'T': '#a0142d',       // Crimson blade base
  'b': '#e11e46',       // Bright blood talon edge
  // Eyes / Acid / Glands
  'e': '#facc15',       // Predatory yellow eye
  'g': '#22c55e',       // Toxic venom green
  'G': '#4ade80',       // Bright acid highlight
  'w': '#ffffff'        // Needle teeth / glint
};

const KRAKEN_SWAP: Record<string, string> = {
  '#': '#120806',
  'f': '#fef3c7',
  'F': '#f5d7a0',
  's': '#c8a069',
  'S': '#8c643c',
  'c': '#410a0f',
  'C': '#8c1419',
  'p': '#c81e23',
  'P': '#f0463c',
  'l': '#ff8c6e',
  't': '#0f0c0c',
  'T': '#281e1e',
  'b': '#503c3c',
  'e': '#22c55e',
  'g': '#eab308',
  'G': '#facc15',
  'w': '#ffffff'
};

const BEHEMOTH_SWAP: Record<string, string> = {
  '#': '#080c12',
  'f': '#f87171',
  'F': '#dc2626',
  's': '#991b1b',
  'S': '#580f0f',
  'c': '#0a1423',
  'C': '#0f2d50',
  'p': '#0e7490',
  'P': '#06b6d4',
  'l': '#67e8f9',
  't': '#0a0f14',
  'T': '#191e28',
  'b': '#324155',
  'e': '#facc15',
  'g': '#a855f7',
  'G': '#c084fc',
  'w': '#ffffff'
};

// 1. HORMAGAUNT (44x32)
export const HORMAGAUNT_PXL_DEF: PxlSpriteDef = {
  name: 'tyranid-hormagaunt',
  width: 44,
  height: 32,
  palette: BASE_TYRANID_PALETTE,
  swaps: {
    kraken: KRAKEN_SWAP,
    behemoth: BEHEMOTH_SWAP
  },
  matrix: [
    "............................................",
    "............................................",
    "............................#####...........",
    "..........................##lPppC##.........",
    "........................##lPppppppC##.......",
    "......................##lPpppppppppC#.......",
    "....................##lPppppppppppppC#......",
    "........###........#lPpppppppppppppC##......",
    ".......#lPC##.....#lPpppppppppppppC##.......",
    "......#lPppC##...#lPppppppffFFFFS##.........",
    ".....#lPppppC#..#lPpppffFFFffffSS#..........",
    "...##cCppppPC#.#lPppffffffffFFFS#e#.........",
    "..#cCCppppppC##lPfffffffffffffFS#e#.........",
    ".#cCCppppppC#lPfffssssffFfffFFFS#w#.........",
    "#cCCfffffffClPffsssSSSffffFFFS##w##.........",
    "#CffffffffClPffssSSSSffffFFF##...#..........",
    ".#fffffSS#CPffsSS##ffffFFS##..#b##..........",
    "..#fffS##.#PfsS##..#ffFS##...#bbbT#.........",
    "...#fS#....###......#FS#....#bbbbTT#........",
    "....##...###..###....##....#bbbbbbTT#.......",
    "........#fsS##fsS#........#bbbbbbbbTT#......",
    ".......#fffS#fffS#.......#bbbbbbbbbbTT#.....",
    ".......#fffS#fffS#......#bbbbbbbbbbbbTT#....",
    ".......#ffSS#ffSS#.....#bbbbbbbbbbbbbbTT#...",
    "........#fS#.#fS#.....#bbbbbbbbbbbbbbbbTT#..",
    "........#sS#.#sS#.....#TTTTTTTTTTTTTTTTTt#..",
    "........#tT#.#tT#......#ttttttttttttttttt#..",
    "........#tT#.#tT#.......#################...",
    "........#tt#.#tt#...........................",
    "........#tt#.#tt#...........................",
    ".........##...##............................",
    "............................................"
  ]
};

// 2. TERMAGANT (44x32 with Fleshborer)
export const TERMAGANT_PXL_DEF: PxlSpriteDef = {
  name: 'tyranid-termagant',
  width: 44,
  height: 32,
  palette: BASE_TYRANID_PALETTE,
  swaps: {
    kraken: KRAKEN_SWAP,
    behemoth: BEHEMOTH_SWAP
  },
  matrix: [
    "............................................",
    "............................................",
    "............................#####...........",
    "..........................##lPppC##.........",
    "........................##lPppppppC##.......",
    "......................##lPpppppppppC#.......",
    "....................##lPppppppppppppC#......",
    "........###........#lPpppppppppppppC##......",
    ".......#lPC##.....#lPpppppppppppppC##.......",
    "......#lPppC##...#lPppppppffFFFFS##.........",
    ".....#lPppppC#..#lPpppffFFFffffSS#..........",
    "...##cCppppPC#.#lPppffffffffFFFS#e#.........",
    "..#cCCppppppC##lPfffffffffffffFS#e#.........",
    ".#cCCppppppC#lPfffssssffFfffFFFS#w#.........",
    "#cCCfffffffClPffsssSSSffffFFFS##w##.........",
    "#CffffffffClPffssSSSSffffFFF##...#..........",
    ".#fffffSS#CPffsSS##ffffFFS##................",
    "..#fffS##.#PfsS##..#ffFS##...#####..........",
    "...#fS#....###......#FS#...##cCCCp##........",
    "....##...###..###....##...#cCCCpppPp#.......",
    "........#fsS##fsS#.......#cCpggGppPpP#......",
    ".......#fffS#fffS#......#cCpggGpppPpP#......",
    ".......#fffS#fffS#......#CCpggGppPpPp#......",
    ".......#ffSS#ffSS#.......#CCppppPpPp#.......",
    "........#fS#.#fS#.........#CCCCCCCp#..##g#..",
    "........#sS#.#sS#..........#######...#Ggg#..",
    "........#tT#.#tT#.....................##g#..",
    "........#tT#.#tT#...........................",
    "........#tt#.#tt#...........................",
    "........#tt#.#tt#...........................",
    ".........##...##............................",
    "............................................"
  ]
};

// 3. GENESTEALER (48x40 - 4-Armed Predator)
export const GENESTEALER_PXL_DEF: PxlSpriteDef = {
  name: 'tyranid-genestealer',
  width: 48,
  height: 40,
  palette: BASE_TYRANID_PALETTE,
  swaps: {
    kraken: KRAKEN_SWAP,
    behemoth: BEHEMOTH_SWAP
  },
  matrix: [
    "................................................",
    ".............................######.............",
    "..........................###lPppPC###..........",
    ".........................#cClPppppppPC#.........",
    "........................#cClPppppppppPC#........",
    ".......................#cClPppppppppppPC#.......",
    "......................#cClPpppppppppppPC#.......",
    ".....................#cClPpppppppppppppPC#......",
    "....................#cClPppppffffFFFFFSC##......",
    "...................#cClPppffffFfffFFffffS#......",
    "..................#cClPppffFffffffffffFFS#e#....",
    ".................#cClPppffFfffsssssssfffS#e#....",
    ".....####.......#cClPfffffFffsssSSSSsfffS#w##...",
    "...##bTT#......#cCPffffffFffssSSSSSSSfffS##w#...",
    "..#bbTTT#.....#cCPffffffFffssSSSSSSSSfffS.##....",
    ".#bbbTTT#....#cCPffffffFfffssSSSSSSSSffff#......",
    "#bbbbTTT#...#cCPffffffFffffssSSSSSSSSffff#......",
    "#bbbbTTT#..#cCPffffffffffffsssssssssfffff#......",
    "#bbbbTTT#.#cCPfffffffffffffffFFffffffffff#......",
    ".#bbbTTT##cCPfffffffffffffffFFffffffffff#.......",
    "..#bbTTT#CPffffffffffffffffFFffffffffff#........",
    "...#bTT#.#fffffffFFfffffffffFFffffffff#.........",
    "....##....#ffffffFFffffffffffFFffffff#..........",
    "...........#ffffffFfffffffffffFFffff#...####....",
    "............#ffffffFffffffffffFFfff#..##bTT#....",
    "......###....#ffffffFfffffffffFFff#..#bbTTT#....",
    ".....#fsS#....#ffffffFffffffffFFf#..#bbbTTT#....",
    "....#fffS#.....#ffffffFfffffffFF#..#bbbbTTT#....",
    "...#ffffS#......#fffffFffffffFF#...#bbbbTTT#....",
    "...#ffffS#.......#ffffFfffffFF#....#bbbbTTT#....",
    "...#fffffS#.......#ffffFffffF#......#bbbTTT#....",
    "....#fffffS#.......#fffFfffF#........#bbTT#.....",
    ".....#fffffS#.......#ffFffF#..........####......",
    "......#fffffS#.......#fFfF#.....................",
    ".......#tTTTff#.......###.......................",
    "........#ttTTff#................................",
    ".........#ttTTTf#...............................",
    "..........#tttttf#..............................",
    "...........#ttttt#..............................",
    "............#####..............................."
  ]
};

// 4. TYRANID WARRIOR (54x50 - Synapse Commander)
export const TYRANID_WARRIOR_PXL_DEF: PxlSpriteDef = {
  name: 'tyranid-warrior',
  width: 54,
  height: 50,
  palette: BASE_TYRANID_PALETTE,
  swaps: {
    kraken: KRAKEN_SWAP,
    behemoth: BEHEMOTH_SWAP
  },
  matrix: [
    "......................................................",
    "..............................#####...................",
    "...........................###lPppC###................",
    "..........................#cClPppppppC##..............",
    ".........................#cClPppppppppC##.............",
    ".......................##cClPppppppppppC##............",
    "......................#ccClPppppppppppppC#............",
    ".....................#ccClPppppppppppppppC#...........",
    "....................#ccClPpppppppppppppppC#...........",
    "...................#ccClPppffffFFFFFFFFFSC#...........",
    "..................#ccClPppfffFfffffffffffS#...........",
    ".................#ccClPppfffFffsssssssssfS#e#.........",
    ".....####.......#ccClPppffffFfsssSSSSSSssfS#e#........",
    "...##bTTT#.....#ccClPffffffFfssSSSSSSSSSsfS#w##.......",
    "..#bbTTTT#....#ccClPffffffFfssSSSSSSSSSSsfS##w#.......",
    ".#bbbTTTT#...#ccCPfffffffFffssSSSSSSSSSSsfS.##........",
    "#bbbbTTTT#..#ccCPffffffffFffssSSSSSSSSSSfff#..........",
    "#bbbbTTTT#.#ccCPffffffffFfffssSSSSSSSSSSfff#..........",
    "#bbbbTTTT##ccCPffffffffFffffssSSSSSSSSSSfff#..........",
    ".#bbbTTTT#cCCPffffffffFffffffffFFFFFFFFffff#..........",
    "..#bbTTTT#CPfffffffffffffffffffffFFFFffffff#..........",
    "...#bTTT##ffffffffffffffffffffffffFFffffff#...........",
    "....####..#ffffffffffffffffffffffffFFfffff#...........",
    "...........#ffffffffffffffffffffffffFFffff#...........",
    "............#ffffffFFFFffffffffffffffFFfff#...####....",
    ".............#fffffffFFFFfffffffffffffFFff#..#bTTT#...",
    ".......###....#ffffffffFFFFffffffffffffFFf#.#bbTTTT#..",
    "......#fsS#....#fffffffffFFFFfffffffffffFF##bbbTTTT#..",
    ".....#ffffS#....#fffffffffFFFFffffffffffF##bbbbTTTT#..",
    "....#fffffS#.....#fffffffffFFFFfffffffffF#bbbbbTTTT#..",
    "...#ffffffS#......#fffffffffFFFFfffffffF#bbbbbTTTTT#..",
    "...#ffffffS#.......#fffffffffFFFFfffffF##bbbbTTTTTT#..",
    "...#ffffffS#........#fffffffffFFFFfffF#..#bbbTTTTT#...",
    "....#ffffffS#........#fffffffffFFFFff#...#bbTTTTT#....",
    ".....#ffffffS#........#fffffffffFFFf#.....#bTTTT#.....",
    "......#ffffffS#........#fffffffffFF#.......####.......",
    ".......#tTTTTf#.........#fffffffffF#..................",
    "........#ttTTTf#.........#fffffffff#..................",
    ".........#ttTTTf#.........#########...................",
    "..........#ttTTTf#....................................",
    "...........#ttttt#....................................",
    "............#tttt#....................................",
    ".............####.....................................",
    "......................................................",
    "......................................................",
    "......................................................",
    "......................................................",
    "......................................................",
    "......................................................",
    "......................................................"
  ]
};

// 5. CARNIFEX (64x64 - Monstrous Bio-Tank)
export const CARNIFEX_PXL_DEF: PxlSpriteDef = {
  name: 'tyranid-carnifex',
  width: 64,
  height: 64,
  palette: BASE_TYRANID_PALETTE,
  swaps: {
    kraken: KRAKEN_SWAP,
    behemoth: BEHEMOTH_SWAP
  },
  matrix: [
    "................................................................",
    "......................#####.....#####...........................",
    ".....................#cCCCp#...#cCCCp#..........................", // 4 Dorsal Spore Chimneys
    "....................#cClPppC#.#cClPppC#.........................",
    "....................#cClPppC#.#cClPppC#.........................",
    ".....................#cCCCp#...#cCCCp#..........................",
    "......................#####.....#####...........................",
    "...........................######...............................",
    "........................###lPppPC###............................",
    ".......................#cClPppppppPC#...........................",
    "......................#cClPppppppppPC#..........................",
    ".....................#cClPppppppppppPC#.........................",
    "....................#ccClPpppppppppppPC#........................",
    "...................#ccClPpppppppppppppPC#.......................",
    "..................#ccClPpppppppppppppppPC#......................",
    ".................#ccClPppffffFFFFFFFFFSC##......................",
    "................#ccClPppffffFfffFFfffffS#.......................",
    "...............#ccClPppffFfffffffffffffS#e#.....................", // Burning yellow eye
    "....####......#ccClPppffFfffssssssssfffS#e#.....................",
    "..##bTTT#....#ccClPfffffFffsssSSSSSSfffS#w##....................", // Massive crushing scythe claw
    ".#bbbTTTT#..#ccCPffffffFffssSSSSSSSSfffS##w#....................",
    "#bbbbTTTT#.#ccCPffffffFffssSSSSSSSSSfffS.##.....................",
    "#bbbbTTTT##ccCPffffffFfffssSSSSSSSSSffff#.......................",
    "#bbbbTTTT#cCCPffffffFffffssSSSSSSSSSffff#.......................",
    ".#bbbTTTT#CCPffffffFfffffffFFFFFFFFfffff#.......................",
    "..#bbTTTT#CPfffffffffffffffffFFFFfffffff#.......................",
    "...#bTTT##fffffffffffffffffffffFFfffffff#.......................",
    "....####..#ffffffffffffffffffffffFFfffff#.......................",
    "...........#ffffffffffffffffffffffFFffff#...........####........", // Lower crushing claw
    "............#ffffffFFFFffffffffffffFFfff#..........#bTTT#.......",
    ".............#fffffffFFFFfffffffffffFFff#.........#bbTTTT#......",
    ".......###....#ffffffffFFFFffffffffffFFf#........#bbbTTTT#......",
    "......#fsS#....#fffffffffFFFFfffffffffFF##......#bbbbTTTT#......",
    ".....#ffffS#....#fffffffffFFFFffffffffF##bb#...#bbbbbTTTT#......",
    "....#fffffS#.....#fffffffffFFFFfffffffffF#bb###bbbbbbTTTT#......",
    "...#ffffffS#......#fffffffffFFFFfffffffF#bbbbbbbbbbbTTTTT#......",
    "...#ffffffS#.......#fffffffffFFFFfffffF##bbbbbbbbbbTTTTTT#......",
    "...#ffffffS#........#fffffffffFFFFfffF#..#bbbbbbbbTTTTTT#.......",
    "....#ffffffS#........#fffffffffFFFFff#....#bbbbbbTTTTTT#........",
    ".....#ffffffS#........#fffffffffFFFf#......#bbbbTTTTTT#.........",
    "......#ffffffS#........#fffffffffFF#........#bbbTTTTT#..........",
    ".......#tTTTTf#.........#fffffffffF#.........#bbTTTT#...........",
    "........#ttTTTf#.........#fffffffff#..........#bTTT#............",
    ".........#ttTTTf#.........#########............####.............",
    "..........#ttTTTf#........#ssssssss#............................",
    "...........#ttttt#.......#sSSSSSSSSs#...........................",
    "............#tttt#.......#sSSSSsssss#...........................",
    ".............####.........#ssssssss#............................",
    "...........................########.............................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................",
    "................................................................"
  ]
};

// 6. ZOANTHROPE (44x48 - Psychic Artillery Brain)
export const ZOANTHROPE_PXL_DEF: PxlSpriteDef = {
  name: 'tyranid-zoanthrope',
  width: 44,
  height: 48,
  palette: BASE_TYRANID_PALETTE,
  swaps: {
    kraken: KRAKEN_SWAP,
    behemoth: BEHEMOTH_SWAP
  },
  matrix: [
    "............................................",
    "..................########..................",
    "...............###lPpppppPC###..............",
    "..............#cClPppppppppppC#.............", // Enormous Psychic Cerebral Brain
    ".............#cClPppppppppppppC#............",
    "............#cClPpppplPppppppppC#...........",
    "............#cClPppplPPppppppppC#...........",
    "...........#ccClPpplPPpppppppppC#...........",
    "...........#ccClPppppppppppppppC#...........",
    "...........#ccClPppppppppppppppC#...........",
    "...........#ccClPppppffffFFFFFSC#...........",
    "............#cClPppfffFffffffffS#...........",
    ".............#cClPffFffffffffffS#e#.........", // Glowing Warp-energy eye
    "..............#clPffFfssssssssfS#e#.........",
    "...............#cPffFffsSSSSSSsfS#..........",
    "................#cPfFffsSSSSSSsfS#..........",
    ".................#PffFfsSSSSSSsfS#..........",
    "..................#ffFfssSSSSssfS#..........",
    "...................#ffffssssssff#...........",
    "....................#fffffffffff#...........",
    ".....................#fffffffff#............", // Atrophied hovering torso
    "......................#fffffff#.............",
    ".......................#fffff#..............",
    "........................#fff#...............",
    ".........................#f#................",
    ".........................#S#................", // Dangling atrophied bio-tail
    "........................#sS#................",
    ".......................#sS#.................",
    "......................#sS#..................",
    ".....................#sS#...................",
    "....................#sS#....................",
    "...................#sS#.....................",
    "....................##......................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................"
  ]
};

// 7. BIOVORE (44x38 - Living Spore Mortar)
export const BIOVORE_PXL_DEF: PxlSpriteDef = {
  name: 'tyranid-biovore',
  width: 44,
  height: 38,
  palette: BASE_TYRANID_PALETTE,
  swaps: {
    kraken: KRAKEN_SWAP,
    behemoth: BEHEMOTH_SWAP
  },
  matrix: [
    "............................................",
    "....................#######.................",
    "..................##gGGGGgg##...............", // Dorsal Spore Mortar Cannon Orifice
    ".................#gGGllllGGgg#..............",
    "................#gGGllwwllGGgg#.............",
    "................#gGGllwwllGGgg#.............",
    "...............#ccClPppgGGgggC#.............",
    "..............#ccClPpppppppppC#.............",
    ".............#ccClPppppppppppC#.............",
    "............#ccClPpppppppppppC#.............",
    "...........#ccClPppffffFFFFFSC#.............",
    "..........#ccClPppffffFfffFFfS#.............",
    ".........#ccClPppffFffffffffFS#e#...........",
    "........#ccClPfffffFffssssssfS#e#...........",
    ".......#cCPffffffFffssSSSSSSfS#w##..........",
    "......#cCPffffffFffssSSSSSSSSfS##w#.........",
    ".....#cCPffffffFfffssSSSSSSSSffff#..........",
    "....#cCPffffffFffffssSSSSSSSSffff#..........",
    "....#cCPffffffffffffsssssssssffff#..........",
    "...#cCPfffffffffffffffFFfffffffff#..........",
    "...#cCPfffffffffffffffFFfffffffff#..........",
    "..#cCPffffffffffffffffFFfffffffff#..........",
    "..#cCPffffffffffffffffFFfffffffff#..........",
    "..#cCPffffffffffffffffFFfffffffff#..........",
    "...#cCPfffffffffffffffFFfffffffff#..........",
    "....#sSSSSSSSSSSSSSSSSSSSSSSSSSSs#..........", // Heavy anchor leg stabilizers
    ".....#sSSSSSSSSSSSSSSSSSSSSSSSSs#...........",
    "......#sSSSSs############sSSSSs#............",
    ".......#sSSs#............#sSSs#.............",
    "........#ss#..............#ss#..............",
    ".........##................##...............",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................",
    "............................................"
  ]
};

// 8. SPORE MINE (22x22 - Floating Bio-Bomb)
export const SPORE_MINE_PXL_DEF: PxlSpriteDef = {
  name: 'tyranid-spore-mine',
  width: 22,
  height: 22,
  palette: BASE_TYRANID_PALETTE,
  swaps: {
    kraken: KRAKEN_SWAP,
    behemoth: BEHEMOTH_SWAP
  },
  matrix: [
    "......................",
    "........######........",
    "......##gGGGGgg##.....", // Gas-filled float bladder
    ".....#gGGllllGGgg#....",
    "....#gGGllwwllGGgg#...",
    "...#gGGlllwwlllGGgg#..",
    "...#gGGllllllllGGgg#..",
    "...#cClPppggpppppC#...", // Chitin dorsal plates
    "...#cClPpppppppppC#...",
    "....#cClPpppppppC#....",
    ".....#ccClPpppC##.....",
    "......###cCCC###......",
    "........#fffff#.......", // Ventral acid sac
    ".......#fsssssf#......",
    ".......#sS###Ss#......",
    "........#s#.#s#.......", // Dangling bio-tendrils
    "........#s#.#s#.......",
    ".........#s#.#s#......",
    "..........#s#.#s#.....",
    "...........##..##.....",
    "......................",
    "......................"
  ]
};

/**
 * High-performance offscreen compilation engine for Tyranid PXL sprites
 */
export class TyranidPxlCompiler {
  private static canvasCache: Map<string, HTMLCanvasElement> = new Map();

  public static clearCache(): void {
    this.canvasCache.clear();
  }

  public static renderTyranid(
    def: PxlSpriteDef,
    options: TyranidPxlOptions = {}
  ): HTMLCanvasElement {
    const {
      fleet = 'leviathan',
      frame = 0,
      isPouncing = false,
      isFiring = false,
      isSlashing = false,
      isHurt = false,
      isSynapseActive = false,
      elapsedTime = 0
    } = options;

    const cacheKey = `${def.name}_${fleet}_f${frame}_p${isPouncing ? 1 : 0}_fir${isFiring ? 1 : 0}_sl${isSlashing ? 1 : 0}_h${isHurt ? 1 : 0}_syn${isSynapseActive ? 1 : 0}`;
    const cached = this.canvasCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Effective palette resolution
    const effectivePal: Record<string, string> = { ...def.palette };
    if (fleet !== 'leviathan' && def.swaps && def.swaps[fleet]) {
      Object.assign(effectivePal, def.swaps[fleet]);
    }

    if (isHurt) {
      effectivePal['#'] = '#ffffff';
      effectivePal['f'] = '#ffffff';
      effectivePal['F'] = '#fca5a5';
      effectivePal['s'] = '#f87171';
      effectivePal['S'] = '#ef4444';
      effectivePal['c'] = '#991b1b';
      effectivePal['C'] = '#b91c1c';
      effectivePal['p'] = '#dc2626';
      effectivePal['P'] = '#ef4444';
      effectivePal['l'] = '#ffffff';
      effectivePal['t'] = '#ffffff';
      effectivePal['T'] = '#f87171';
      effectivePal['b'] = '#ffffff';
    }

    const canvas = document.createElement('canvas');
    canvas.width = def.width + 12;
    canvas.height = def.height + 8;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return canvas;

    ctx.imageSmoothingEnabled = false;

    // Contact Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(Math.floor(def.width / 2) + 2, def.height + 2, Math.floor(def.width * 0.38), 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Micro stride offsets
    const stride = frame % 2 === 0 ? 0 : (frame === 1 ? -1 : 1);
    const bobY = (frame === 1 || frame === 3) ? 1 : 0;
    const pounceShift = isPouncing ? 3 : 0;

    // Draw main matrix pixels
    const offsetX = 4 + pounceShift;
    const offsetY = 3 + bobY;

    for (let r = 0; r < def.matrix.length; r++) {
      const rowStr = def.matrix[r];
      for (let c = 0; c < rowStr.length; c++) {
        const tok = rowStr[c];
        if (tok === '.') continue;
        const color = effectivePal[tok];
        if (!color || color === 'transparent') continue;

        let px = c + offsetX;
        let py = r + offsetY;

        // Animate legs based on stride
        if (r >= def.height - 10 && c <= 20) {
          if (c < 12) px += stride;
          else px -= stride;
        }

        ctx.fillStyle = color;
        ctx.fillRect(px, py, 1, 1);
      }
    }

    // Dynamic Special Overlays
    if (isPouncing) {
      // Crimson lunge slash arc
      ctx.strokeStyle = effectivePal['b'] || '#e11e46';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(def.width - 2, Math.floor(def.height / 2), 12, -0.6, 1.2);
      ctx.stroke();
    }

    if (isFiring) {
      // Fleshborer acid flash
      ctx.fillStyle = effectivePal['G'] || '#4ade80';
      ctx.fillRect(def.width - 2, Math.floor(def.height * 0.72), 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(def.width - 1, Math.floor(def.height * 0.72) - 1, 2, 1);
    }

    if (isSynapseActive) {
      // Warrior Synaptic Web lightning crown
      const pulse = Math.sin(elapsedTime * 8) * 2;
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(def.width * 0.6, 4);
      ctx.lineTo(def.width * 0.65 + pulse, 1);
      ctx.lineTo(def.width * 0.72, 3);
      ctx.stroke();
    }

    this.canvasCache.set(cacheKey, canvas);
    return canvas;
  }
}
