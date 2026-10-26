/**
 * Warhammer 40k: Space Marine Sprite Definition in Claude-PXL DSL
 * Exact 52x57 pixel matrix extracted from reference sprite:
 * - Wide combat A-frame stance
 * - Massive curved pauldrons with gold trim and white Ultima icon
 * - Dual glowing emerald green visor with central rebreather
 * - Two-handed Godwyn Bolter with deep maroon casing and steel barrel
 * - Full Chapter swaps & Support Brother variants
 */

import { PxlSpriteDef, PxlRenderOptions } from './claudePxlEngine';
import { SquadBrotherType } from '../../types/game';

export const SPACE_MARINE_PXL_DEF: PxlSpriteDef = {
  name: 'space-marine',
  width: 52,
  height: 57,
  palette: {
    '.': 'transparent',
    '#': '#0d0d13', // Deep grimdark outline
    'd': '#0f1b35', // Deep ceramite shadow
    'b': '#1a2b67', // Ceramite base shadow
    'B': '#232e93', // Ultramarine Blue mid
    'L': '#3b4cbc', // Armor highlight blue
    'H': '#6182cd', // Armor specular glint
    'g': '#784b13', // Dark bronze shadow
    'G': '#a26e19', // Gold trim mid
    'Y': '#e0af24', // Gold highlight
    'v': '#098f08', // Emerald visor dark
    'V': '#2ae048', // Emerald visor neon bright
    'r': '#360710', // Bolter casing dark maroon
    'R': '#540a13', // Bolter casing deep crimson
    'K': '#840a13', // Bolter casing bright red
    'm': '#1f2a2f', // Gunmetal dark
    's': '#40515c', // Steel mechanical
    'S': '#718096', // Steel highlight
    'W': '#ffffff'  // Pure white insignia (Ultima symbol / skull)
  },
  swaps: {
    blood_angels: {
      'd': '#450a0a',
      'b': '#7f1d1d',
      'B': '#b91c1c',
      'L': '#dc2626',
      'H': '#f87171',
      'G': '#fbbf24',
      'Y': '#fef08a',
      'g': '#b45309',
      'v': '#0284c7', // Cyan visor
      'V': '#38bdf8',
      'r': '#0f172a', // Black bolter casing
      'R': '#1e293b',
      'K': '#334155'
    },
    dark_angels: {
      'd': '#021a0c',
      'b': '#052e16',
      'B': '#14532d',
      'L': '#16a34a',
      'H': '#4ade80',
      'G': '#fef3c7', // Bone white trim
      'Y': '#ffffff',
      'g': '#d4d4d8',
      'v': '#991b1b', // Blood red visor
      'V': '#ef4444',
      'r': '#450a0a',
      'R': '#7f1d1d',
      'K': '#dc2626'
    },
    space_wolves: {
      'd': '#1e293b',
      'b': '#334155',
      'B': '#475569',
      'L': '#64748b',
      'H': '#94a3b8',
      'G': '#eab308', // Wolf gold
      'Y': '#fef08a',
      'g': '#a16207',
      'v': '#0891b2', // Frost cyan visor
      'V': '#06b6d4',
      'r': '#1e293b',
      'R': '#334155',
      'K': '#475569'
    },
    imperial_fists: {
      'd': '#713f12',
      'b': '#a16207',
      'B': '#ca8a04',
      'L': '#eab308',
      'H': '#fde047',
      'G': '#dc2626', // Crimson trim
      'Y': '#ef4444',
      'g': '#991b1b',
      'v': '#0284c7', // Azure visor
      'V': '#38bdf8',
      'r': '#0f172a',
      'R': '#1e293b',
      'K': '#334155'
    },
    white_scars: {
      'd': '#64748b',
      'b': '#94a3b8',
      'B': '#cbd5e1',
      'L': '#f1f5f9',
      'H': '#ffffff',
      'G': '#dc2626', // Red trim
      'Y': '#ef4444',
      'g': '#991b1b',
      'v': '#ca8a04', // Amber visor
      'V': '#facc15',
      'r': '#7f1d1d',
      'R': '#b91c1c',
      'K': '#dc2626'
    },
    salamanders: {
      'd': '#14532d',
      'b': '#166534',
      'B': '#15803d',
      'L': '#22c55e',
      'H': '#4ade80',
      'G': '#f97316', // Drake flame orange
      'Y': '#fb923c',
      'g': '#c2410c',
      'v': '#ca8a04', // Blazing gold visor
      'V': '#facc15',
      'r': '#0f172a',
      'R': '#1e293b',
      'K': '#334155'
    },
    iron_hands: {
      'd': '#090d16',
      'b': '#1e293b',
      'B': '#334155',
      'L': '#475569',
      'H': '#94a3b8',
      'G': '#cbd5e1', // Bionic silver trim
      'Y': '#ffffff',
      'g': '#64748b',
      'v': '#991b1b', // Red visor
      'V': '#ef4444',
      'r': '#1e293b',
      'R': '#334155',
      'K': '#475569'
    },
    raven_guard: {
      'd': '#020617',
      'b': '#0f172a',
      'B': '#1e293b',
      'L': '#334155',
      'H': '#64748b',
      'G': '#f8fafc', // Corax white trim
      'Y': '#ffffff',
      'g': '#94a3b8',
      'v': '#991b1b',
      'V': '#ef4444',
      'r': '#020617',
      'R': '#0f172a',
      'K': '#1e293b'
    },
    deathwatch: {
      'd': '#020617',
      'b': '#0f172a',
      'B': '#18181b',
      'L': '#27272a',
      'H': '#52525b',
      'G': '#cbd5e1', // Inquisitorial silver
      'Y': '#ffffff',
      'g': '#64748b',
      'v': '#991b1b', // Red visor
      'V': '#ef4444',
      'r': '#7f1d1d',
      'R': '#b91c1c',
      'K': '#dc2626'
    },
    veteran_gold: {
      'd': '#78350f',
      'b': '#a16207',
      'B': '#ca8a04',
      'L': '#eab308',
      'H': '#fef08a',
      'G': '#ffffff', // White trim on gold
      'Y': '#ffffff',
      'g': '#d4d4d8',
      'v': '#0284c7',
      'V': '#38bdf8',
      'r': '#450a0a',
      'R': '#7f1d1d',
      'K': '#b91c1c'
    },
    sanguinary_guard: {
      'd': '#78350f',
      'b': '#b45309',
      'B': '#d97706',
      'L': '#f59e0b',
      'H': '#fde047',
      'G': '#fef08a',
      'Y': '#ffffff',
      'g': '#92400e',
      'v': '#0284c7',
      'V': '#38bdf8',
      'r': '#450a0a',
      'R': '#7f1d1d',
      'K': '#b91c1c'
    },
    apothecary: {
      'd': '#64748b',
      'b': '#94a3b8',
      'B': '#cbd5e1',
      'L': '#f8fafc',
      'H': '#ffffff',
      'G': '#dc2626', // Red prime helix trim
      'Y': '#ef4444',
      'g': '#991b1b',
      'v': '#15803d', // Medical emerald visor
      'V': '#22c55e',
      'r': '#1e293b',
      'R': '#334155',
      'K': '#475569'
    },
    techmarine: {
      'd': '#450a0a',
      'b': '#7f1d1d',
      'B': '#991b1b',
      'L': '#dc2626',
      'H': '#f87171',
      'G': '#ffffff', // Cog-mechanicus white/black
      'Y': '#f8fafc',
      'g': '#94a3b8',
      'v': '#0891b2', // Bionic cyan ocular
      'V': '#06b6d4',
      'r': '#0f172a',
      'R': '#1e293b',
      'K': '#334155'
    },
    librarian: {
      'd': '#1e1b4b',
      'b': '#1e3a8a',
      'B': '#1d4ed8',
      'L': '#3b82f6',
      'H': '#93c5fd',
      'G': '#eab308', // Psychic gold hood
      'Y': '#fef08a',
      'g': '#a16207',
      'v': '#0284c7', // Warp blue visor
      'V': '#38bdf8',
      'r': '#0f172a',
      'R': '#1e293b',
      'K': '#334155'
    },
    devastator: {
      'd': '#0f1b35',
      'b': '#1a2b67',
      'B': '#232e93',
      'L': '#3b4cbc',
      'H': '#6182cd',
      'G': '#a26e19',
      'Y': '#e0af24',
      'g': '#784b13',
      'v': '#098f08',
      'V': '#2ae048',
      'r': '#1f2937', // Heavy gunmetal Bolter
      'R': '#374151',
      'K': '#4b5563'
    }
  },
  matrix: [
    "....................bbbbbbb.........................",
    "..................bbLHHLLLBbB.......................",
    "...............WW.bbLHHLLLBbBW......................",
    "...............bbbLLHHLLLLLBBb......................",
    "....Lbbb.....BbBbLHHLLLLLLLBBBbbbb..................",
    "...bBHLBbb..bBBbbLbBLLLLLLBBBbbLBbb.................",
    "..BLLLBBbbBBBBBbLLBBBLLLBBBBBbbbbbbB................",
    "..bHLLBBbbbbBBbbHLBBbLLBBBBbbbbbbbbb................",
    "..bLLBbbYYYGbbbHLBBBBbbbbbbbbbbLbBLb................",
    "..bBBbHHLLLLGsbHLBLLBVvBBbbVVvbLbBBLb...............",
    "...bLHLLLLLLGsbLLbLLLBBLLLBBBBbBbgGBLbB.............",
    "..bBLHHLLLLL##sBLbLLLBBLLBBBBBbBb#gBLbBb............",
    "..bHLLWLLLLLL#GbLbLLLLLLLbbBBBbsbbbGBLBb............",
    "..bHHWLLWWWLB#GbLsbbLLLBbLBbbBbsbbbGBBBBb...........",
    ".bHHHLLLWWLWB#GbbbssbLLLLbbBBbsbbbbGBBBBb...........",
    ".bLHHLLLWWLLB#GbHBbbsbLBBLBbbsbbbbbGBBBBBbW.........",
    ".bLHHLLLWWLLB#GbHBbbsbLBbLBbbsbbbbbGBBBBBbb.........",
    ".bLHWWLWLLLBB#GbLHBBbbLLLLBBBbbBbbbbGBBBBbb.........",
    "bYLLHWWWLLBBB#gbBLBBLLbbbLBbBLbBbbbbGBBBbb..........",
    "bYBLLLLLBBBBGsbLHYBBBLLLLbbLLBBYbbbbGBBBbgdb........",
    "Lg##BBBBBBBBGsbLHY##BLLLLbdBBBBGbbbbGBBB#sbb........",
    ".bYG#BBBBBBBgsbLLYYYbBBLL##bBLBGbbbbgbbbgbbb........",
    "..bbgYGBBBbGgsbbLLGKK####Bb#KKKKbbbbKgggb...........",
    "....LbbYGGggbBBbLL###KKKKKsss######bbbbbb....##.....",
    "....LbbbbbbbBbbb##LLLKRrrrKRRRRRRRR##########s#.....",
    "....LbbbbbbbBbbdssLLBKRrrrKRRRrrrrrmmmmmss###s#.....",
    "....LbHBbbbbbbb#LBBbbRrrrrrrrr#####RRsssBBbbss#.....",
    "...bBHLLLLLLLb#LBLsssrrrrrrrrr#######sssssssssB####.",
    "...bBHLLHHLLLb#bss##s##sbsrrrrrrRRR####sssssssLBBBB#",
    "...bBHLLLLHHLLL##ssssssss#srrrrrrrrKKssssssssssLLLL#",
    "...bBHLLLLHHLLL##ssssssss#srrrrrrrrKKssssssssssLLLL#",
    "...bBLLLLLLHHLLLL####sssss#########rrssssssssssssss#",
    "....LbLLLLLLHHHLbHLLB####s#sssB#sss#####sssssss####.",
    "......bbLLLLLHHbHLLLBb#GY#sss##ssss#ssss#######.....",
    "........bbbLLbbHLLBBbb#gGg#sssss###s#ss#sssssBB##...",
    "........bbbLLbbHLLBBbb#gGg#sssss###s#ss#sssssBB##...",
    "...........bbLHLLBbbb#BBBb#ssbs#BBb#####s#sssss##...",
    ".........bbBHBbBBbbb#bbbbb#ssbsb#bB##LB########.....",
    "........bbbbbbb#####bbbbbbb##sbsbs#b#bs#L#BL###.....",
    "........bbHLLLLbbbbbbbbbbbb#ssss###L##sBBLBBs##.....",
    "........bbHHHHHbBBbbb.....b#sbsb###H##sLbHBBb#......",
    ".......bHHLHHLLHbbbb.......bd#b#HLBBBBb######.......",
    ".......bLLLHHLLBbb..........###HLBBBBBBb............",
    "......bBLLHHLLLBbb............bHLLLBBBBb............",
    "......bBLLHHLLLBbb............bLLLLBBBBbb...........",
    "......bLLLHHLLLBbb............bbLLLBBBBBb...........",
    "....LbBLHHHLLLLBb..............bBLLBBBBBb...........",
    "....LbLLHHHLLLLBb..............bBLLLBBBBb...........",
    "...bbBLHHHLLLLLBb..............bBLLLBBBBBb..........",
    "...bbBLHHHLLLLLBb..............bBLLLBBBBBb..........",
    "...bBLLHHHLLLBBBb..............bBBBLLBBBBbb.........",
    "..bBBLLbbbbbBBBBb..............bBLHLLLBbbbbb........",
    "..bLLLbHLLLLbBBBb..............bHLLBLbBHLLLLb.......",
    "..bLBBLLLLLBBBBBb..............bLLLBBLLLLLBBbB......",
    "..bLBbHLLLLBBBbBb..............bLLLLbHHLLLBBBb......",
    "..bbBHLLBBBBBBBbb..............bbBLbHLLLLBBBBb......",
    "..bbbbbbbbbbbbbbb..............bbbbbbbbbbbbbbb......"
  ]
};

export function decorateSquadRole(
  ctx: CanvasRenderingContext2D,
  options: PxlRenderOptions,
  _palette: Record<string, string>
): void {
  const role = options.role as SquadBrotherType | undefined;
  if (!role) return;

  const bobY = options.bobY || 0;
  const ox = 6;
  const oy = 4;

  if (role === 'techmarine') {
    // Articulated hydraulic Servo-Arm
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(15 + ox, 2 + bobY + oy, 4, 6);
    ctx.fillRect(17 + ox, 0 + bobY + oy, 12, 3);
    ctx.fillRect(26 + ox, 2 + bobY + oy, 4, 5);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(27 + ox, 4 + bobY + oy, 2, 3);
    // Hydraulic Claw pincer
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(29 + ox, 6 + bobY + oy, 3, 2);
    ctx.fillRect(29 + ox, 9 + bobY + oy, 3, 2);
    ctx.fillStyle = '#ef4444'; // Red targeting lens on claw
    ctx.fillRect(28 + ox, 7 + bobY + oy, 1, 2);
  } else if (role === 'librarian') {
    // Force Staff
    ctx.fillStyle = '#451a03';
    ctx.fillRect(8 + ox, 2 + bobY + oy, 3, 44);
    // Radiant Eagle / Skull Staff Head
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(6 + ox, 0 + bobY + oy, 7, 3);
    // Glowing Warp Crystal
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(8 + ox, -2 + bobY + oy, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9 + ox, -1 + bobY + oy, 1, 1);
  } else if (role === 'apothecary') {
    // Medicae shoulder lamp
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13 + ox, 1 + bobY + oy, 4, 3);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(14 + ox, 2 + bobY + oy, 2, 1);
    // Narthecium reductor needle drill on right arm
    ctx.fillStyle = '#64748b';
    ctx.fillRect(40 + ox, 27 + bobY + oy, 5, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(45 + ox, 27 + bobY + oy, 3, 1);
  } else if (role === 'devastator') {
    // Heavy Bolter reinforced barrel & golden ammo belt
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(32 + ox, 28 + bobY + oy, 4, 3);
    ctx.fillRect(28 + ox, 29 + bobY + oy, 4, 3);
    ctx.fillRect(24 + ox, 28 + bobY + oy, 4, 3);
  }
}

