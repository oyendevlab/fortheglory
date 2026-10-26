/**
 * Warhammer 40,000: Space Marine Vehicles, Support Tech & War Gear in Claude-PXL DSL
 * 
 * Provides pixel-perfect 16-bit raster definitions for:
 * - Castraferrum Dreadnought (64x64): Walking Sarcophagus with Assault Cannon & Power Fist
 * - Support Servo-Skull (28x28): Optical skull with scanning laser lens & purity seal
 * - Orbital Drop Pod (56x68): Atmospheric re-entry capsule with 5 ramp doors
 * - Tarantula Sentry Turret (36x36): Twin-linked automated heavy bolters on tripod mount
 */

import { PxlSpriteDef } from './claudePxlEngine';
import { MarineChapter } from '../../types/game';

export interface VehiclePxlOptions {
  chapter?: MarineChapter;
  isFiring?: boolean;
  isHurt?: boolean;
  rotAngle?: number;
  walkTimer?: number;
  shootTimer?: number;
  elapsedTime?: number;
}

const BASE_DREADNOUGHT_PALETTE: Record<string, string> = {
  '.': 'transparent',
  '#': '#0c0d14',       // Deep grimdark outline
  'd': '#0f1b35',       // Ceramite deep shadow
  'b': '#1a2b67',       // Ceramite shadow
  'B': '#232e93',       // Ultramarine Blue mid
  'L': '#3b4cbc',       // Armor highlight blue
  'H': '#6182cd',       // Specular glint
  'g': '#784b13',       // Bronze gold shadow
  'G': '#a26e19',       // Gold trim mid
  'Y': '#e0af24',       // Gold highlight
  's': '#2d3748',       // Gunmetal steel
  'S': '#718096',       // Steel highlight
  'w': '#f8fafc',       // Skull pure white
  'v': '#22c55e',       // Emerald optic slit
  'e': '#f97316',       // Exhaust flame / amber
  'r': '#b91c1c'        // Crimson purity wax
};

const CHAPTER_SWAPS: Record<string, Record<string, string>> = {
  blood_angels: {
    'd': '#450a0a',
    'b': '#7f1d1d',
    'B': '#b91c1c',
    'L': '#dc2626',
    'H': '#f87171',
    'v': '#38bdf8'
  },
  dark_angels: {
    'd': '#021a0c',
    'b': '#052e16',
    'B': '#14532d',
    'L': '#16a34a',
    'H': '#4ade80',
    'v': '#ef4444'
  },
  space_wolves: {
    'd': '#1e293b',
    'b': '#334155',
    'B': '#475569',
    'L': '#64748b',
    'H': '#94a3b8',
    'G': '#eab308',
    'v': '#facc15'
  },
  imperial_fists: {
    'd': '#78350f',
    'b': '#b45309',
    'B': '#d97706',
    'L': '#f59e0b',
    'H': '#fde047',
    'G': '#475569',
    'v': '#38bdf8'
  },
  salamanders: {
    'd': '#064e3b',
    'b': '#047857',
    'B': '#059669',
    'L': '#10b981',
    'H': '#6ee7b7',
    'v': '#f97316'
  },
  iron_hands: {
    'd': '#020617',
    'b': '#0f172a',
    'B': '#1e293b',
    'L': '#334155',
    'H': '#64748b',
    'v': '#38bdf8'
  },
  raven_guard: {
    'd': '#000000',
    'b': '#090d16',
    'B': '#111827',
    'L': '#1f2937',
    'H': '#374151',
    'v': '#ef4444'
  }
};

// 1. CASTRAFERRUM DREADNOUGHT (64x64)
export const DREADNOUGHT_PXL_DEF: PxlSpriteDef = {
  name: 'castraferrum-dreadnought',
  width: 64,
  height: 64,
  palette: BASE_DREADNOUGHT_PALETTE,
  swaps: CHAPTER_SWAPS,
  matrix: [
    "................................................................",
    "................................................................",
    "...................##########################...................",
    "..................#ssssssssssssssssssssssssss#..................",
    "........#####....#sSSSSSSSSSSSSSSSSSSSSSSSSSSs#....#####........",
    ".......#ssSSs#..#sSSSSSSSSssssssssssssSSSSSSSSs#..#sSSss#.......",
    ".......#sS##Ss#.#sSSSSssssssssssssssssssssSSSSs#.#sS##Ss#.......",
    ".......#ssSSs#..#sSSSS####################SSSSs#..#ssSSs#.......",
    "........#####...#sSSSS#bbbbbbbbbbbbbbbbbb#SSSSs#...#####........",
    "...............#sSSSS#bBBBBBBBBBBBBBBBBBBb#SSSSs#...............",
    "......#######..#sSSSS#bBBBLYYYYYYYYYYLBBBb#SSSSs#..#######......",
    ".....#ssssss#.#sSSSS#bBBBLYwwwwwwwwwwYLBBBb#SSSSs#.#ssssss#.....",
    "....#sSSSSSSs##sSSSS#bBBBLYwww#vv#wwwYLBBBb#SSSSs##sSSSSSSs#....",
    "...#sSSs##sSSs#sSSSS#bBBBLYwwwwwwwwwwYLBBBb#SSSSs#sSSs##sSSs#...",
    "..#sSSs#..#sSSsSSSS#bBBBBLYYYYYYYYYYLBBBBb#SSSSsSSSS#..#sSSs#...",
    "..#sSSs#..#sSSsSSSS#bBBBBBBBBBBBBBBBBBBBBb#SSSSsSSSS#..#sSSs#...",
    "..#sSSs#..#sSSsSSSS#bBBBBLYYYYYYYYYYLBBBBb#SSSSsSSSS#..#sSSs#...",
    "..#sSSs#..#sSSsSSSS#bBBBLYwwwwwwwwwwYLBBBb#SSSSsSSSS#..#sSSs#...",
    "..#sSSs#..#sSSsSSSS#bBBBLYwww#ww#wwwYLBBBb#SSSSsSSSS#..#sSSs#...",
    "..#sSSs#..#sSSsSSSS#bBBBLYwwwwwwwwwwYLBBBb#SSSSsSSSS#..#sSSs#...",
    "..#sSSs#..#sSSsSSSS#bBBBLYYYYYYYYYYLBBBBb#SSSSsSSSS#..#sSSs#....",
    "..#sSSs#..#sSSsSSSS#bbbbbbbbbbbbbbbbbbbbbb#SSSSsSSSS#..#sSSs#...",
    "..#sSSs#..#sSSsSSSS#dddddddddddddddddddddd#SSSSsSSSS#..#sSSs#...",
    "..#sSSs#..#sSSsSSSS########################SSSSsSSSS#..#sSSs#...",
    "...#sSSs##sSSs#ssssssssssssssssssssssssssssssss#sSSs##sSSs#.....",
    "....#sSSSSSSs##ssssssssssssssssssssssssssssssss##sSSSSSSs#......",
    ".....#ssssss#..#ssssssssssssssssssssssssssssss#..#ssssss#.......",
    "......######....#ssssssssssssssssssssssssssss#....######........",
    ".................############################...................",
    "..................#bbbbbbbbbb####bbbbbbbbbb#....................",
    ".................#bBBBBBBBBBb####bBBBBBBBBBb#...................",
    "................#bBBBBBBBBBBb####bBBBBBBBBBBb#..................",
    "...............#bBBBLYYYYLBBb####bBBLYYYYLBBBb#.................",
    "..............#bBBBLYwwwwYLBb####bBLYwwwwYLBBBb#................",
    ".............#bBBBLYww##wwYLb####bLYww##wwYLBBBb#...............",
    ".............#bBBBBLYYYYLBBBb####bBBLYYYYLBBBBBb#...............",
    ".............#bBBBBBBBBBBBBBb####bBBBBBBBBBBBBBb#...............",
    ".............#bBBBBBBBBBBBBBb####bBBBBBBBBBBBBBb#...............",
    ".............#bbbbbbbbbbbbbbb####bbbbbbbbbbbbbbb#...............",
    "..............#ddddddddddddd######ddddddddddddd#................",
    "...............#############......#############.................",
    "...............#sssssssssss#......#sssssssssss#.................",
    "..............#sSSSSSSSSSSSs#....#sSSSSSSSSSSSs#................",
    ".............#sSSSSssssSSSSs#....#sSSSSssssSSSSs#...............",
    ".............#sSSSSs##sSSSSs#....#sSSSSs##sSSSSs#...............",
    ".............#sSSSSssssSSSSs#....#sSSSSssssSSSSs#...............",
    ".............#sSSSSSSSSSSSSs#....#sSSSSSSSSSSSSs#...............",
    "..............#ssssssssssss#......#ssssssssssss#................",
    "...............############........############.................",
    "..............#bbbbbbbbbbbb#......#bbbbbbbbbbbb#................",
    ".............#bBBBBBBBBBBBBb#....#bBBBBBBBBBBBBb#...............",
    "............#bBBBLYYYYYYLBBBb#..#bBBBLYYYYYYLBBBb#..............",
    "...........#bBBBLYwwwwwwYLBBBb##bBBBLYwwwwwwYLBBBb#.............",
    "..........#bBBBLYwwwwwwwwYLBBBBbBBBLYwwwwwwwwYLBBBb#............",
    "..........#bBBBBLYYYYYYYYLBBBBBBBBBLYYYYYYYYLBBBBBb#............",
    "..........#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#.............",
    "..........#sssssssssssssssssssssssssssssssssssssss#.............",
    "..........#sSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSs#.............",
    "..........#sSSSSsssssssssssssssssssssssssssssSSSSs#.............",
    "..........#sssss#############################sssss#.............",
    "...........#####.............................#####..............",
    "................................................................",
    "................................................................",
    "................................................................"
  ]
};

// 2. SUPPORT SERVO-SKULL (28x28)
export const SERVO_SKULL_PXL_DEF: PxlSpriteDef = {
  name: 'servo-skull',
  width: 28,
  height: 28,
  palette: {
    '.': 'transparent',
    '#': '#090d16',
    's': '#475569',
    'S': '#94a3b8',
    'w': '#f8fafc',
    'W': '#ffffff',
    'v': '#ef4444',       // Laser targeting lens (Ruby Red)
    'V': '#f87171',
    'r': '#991b1b',       // Purity seal wax
    'p': '#fef3c7',       // Parchment paper
    'P': '#fde68a'
  },
  matrix: [
    "............................",
    "...........######...........",
    ".........##sSWWww##.........",
    "........#sSWWWWWwww#........",
    ".......#sSWWWWWWWwww#.......",
    ".......#sSWWvvWWWWww#.......",  // ruby eye lens at x=10-11
    "......#sSWWvVVvWWWwww#......",
    "......#sSWWWvvWWWWwww#......",
    "......#sSWWWWW#s#Wwww#......",
    "......#sSWWWWW#s#Wwww#......",
    ".......#sSWWWWWWWwww#.......",
    "........#sSWWwwWwww#........",
    "........#sS#w##w#ww#........",  // upper jaw & teeth
    ".........#sSwwwwww#.........",
    "..........########..........",
    ".........#ssssssss#.........",  // cranial anti-grav unit
    "........#sSSSSSSSSs#........",
    ".........#sSSSSSSs#.........",
    "..........#sSSSSs#..........",
    "...........#rss#............",  // red wax seal
    "...........#rrp#............",
    "............#pp#............",  // dangling waving parchment
    "............#Pp#............",
    ".............#p#............",
    ".............#P#............",
    "..............##............",
    "............................",
    "............................"
  ]
};

// 3. TARANTULA SENTRY TURRET (36x36)
export const SENTRY_TURRET_PXL_DEF: PxlSpriteDef = {
  name: 'tarantula-turret',
  width: 36,
  height: 36,
  palette: {
    '.': 'transparent',
    '#': '#0a0e17',
    's': '#334155',
    'S': '#64748b',
    'h': '#94a3b8',
    'b': '#1e3a8a',       // Ceramite Blue
    'B': '#2563eb',
    'L': '#60a5fa',
    'r': '#b91c1c',       // Muzzle casing
    'R': '#dc2626',
    'g': '#22c55e',       // Sensor optic
    'Y': '#facc15'        // Ammo belt brass
  },
  matrix: [
    "....................................",
    "....................................",
    "..............########..............",
    "............##bBBBLBBb##............",
    "...........#bBBBBBBBBBBb#...........",
    "..........#bBBBLYYYYLBBBb#..........",
    "..........#bBBLwwwwwwLBBb#..........",
    "..........#bBBBLYYYYLBBBb#..........",
    "...........#bBBBBBBBBBBb#...........",
    ".........###sSSSSSSSSSSs###.........",
    "........#sssSSSSSSSSSSSSsss#........",
    ".......#sSSSSssSSSSssSSSSSSs#.......",
    ".......#sSSS#rr#SSSS#rr#SSSs#.......",  // Twin Heavy Bolters
    ".......#sSSS#RR#SSSS#RR#SSSs#.......",
    ".......#sSSS#RR#SSSS#RR#SSSs#.......",
    ".......#sSSS#rr#SSSS#rr#SSSs#.......",
    "........#sssSSSSSSSSSSSSsss#........",
    ".........###sSSSSSSSSSSs###.........",
    "............############............",
    ".............#ssssssss#.............",  // Rotary pivot
    "............#sSSSSSSSSs#............",
    "...........#sSSSSSSSSSSs#...........",
    "..........#sSSSSssssSSSSs#..........",
    ".........#sSSSSs####sSSSSs#.........",  // Armored Tripod legs
    "........#sSSSSs#....#sSSSSs#........",
    ".......#sSSSSs#......#sSSSSs#.......",
    "......#sSSSSs#........#sSSSSs#......",
    ".....#sSSSSs#..........#sSSSSs#.....",
    "....#sSSSSs#............#sSSSSs#....",
    "...#sSSSSs#..............#sSSSSs#...",
    "..#sSSSSs#................#sSSSSs#..",
    ".#sSSSSs#..................#sSSSSs#.",
    "#ssssss#....................#ssssss#",
    "########....................########",
    "....................................",
    "...................................."
  ]
};

// 4. ORBITAL DROP POD (56x68)
export const DROP_POD_PXL_DEF: PxlSpriteDef = {
  name: 'orbital-drop-pod',
  width: 56,
  height: 68,
  palette: {
    '.': 'transparent',
    '#': '#090d16',
    'd': '#1e293b',
    'b': '#334155',
    'B': '#475569',
    'L': '#64748b',
    'H': '#94a3b8',
    'g': '#78350f',
    'G': '#b45309',
    'Y': '#f59e0b',
    'r': '#991b1b',
    'R': '#dc2626',
    'e': '#f97316',       // Heat shield scorch mark
    'w': '#f8fafc'
  },
  matrix: [
    "........................####........................",
    ".......................#eeee#.......................",
    ".......................#eYYe#.......................",
    ".......................#eYYe#.......................",
    "......................##eYYe##......................",
    ".....................#ddbeebdd#.....................",
    "....................#ddbLwwLbdd#....................",
    "...................#ddbLwwwwLbdd#...................",
    "..................#ddbLw####wLbdd#..................",
    ".................#ddbLw#GYYG#wLbdd#.................",
    "................#ddbLw#GYYYYG#wLbdd#................",
    "...............#ddbLw#GYYYYYYG#wLbdd#...............",
    "..............#ddbLw#GYYYYYYYYG#wLbdd#..............",
    ".............#ddbLw#GYYYYYYYYYYG#wLbdd#.............",
    "............#ddbLw#GYYYYYYYYYYYYG#wLbdd#............",
    "...........#ddbLw#GYYYYYYYYYYYYYYG#wLbdd#...........",
    "..........#ddbLw#GYYYYYYYYYYYYYYYYG#wLbdd#..........",
    ".........#ddbLw#GYYYYYYYYYYYYYYYYYYG#wLbdd#.........",
    "........#ddbLw#GYYYYYYYYYYYYYYYYYYYYG#wLbdd#........",
    ".......#ddbLw#GYYYYYYYYYYYYYYYYYYYYYYG#wLbdd#.......",
    "......#ddbLw#GYYYYYYYYYYYYYYYYYYYYYYYYG#wLbdd#......",
    ".....#ddbLw#GYYYYYYYYYYYYYYYYYYYYYYYYYYG#wLbdd#.....",
    "....#ddbLw#GYYYYYYYYYYYYYYYYYYYYYYYYYYYYG#wLbdd#....",
    "...#ddbLw#GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYG#wLbdd#...",
    "..#ddbLw#GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYG#wLbdd#..",
    ".#ddbLw#GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYG#wLbdd#.",
    "#ddbLw#GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYG#wLbdd#",
    "#ddbL#dddddddddddddddddddddddddddddddddddddddd#Lbdd#",
    "#ddb#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb#bdd#",
    "#ddb#bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb#bdd#",
    "#ddb#dddddddddddddddddddddddddddddddddddddddddd#bdd#",
    "####################################################",
    "#eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee#",
    "#eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee#",
    ".##################################################.",
    "....................................................",
    "....................................................",
    "....................................................",
    "....................................................",
    "....................................................",
    "....................................................",
    "...................................................."
  ]
};

/**
 * High-performance offscreen compilation engine for Vehicles & Support Tech
 */
export class VehiclePxlCompiler {
  private static canvasCache: Map<string, HTMLCanvasElement> = new Map();

  public static clearCache(): void {
    this.canvasCache.clear();
  }

  public static renderVehicle(
    def: PxlSpriteDef,
    options: VehiclePxlOptions = {}
  ): HTMLCanvasElement {
    const {
      chapter = 'ultramarines',
      isFiring = false,
      isHurt = false,
      walkTimer = 0,
      elapsedTime = 0
    } = options;

    const walkStep = Math.floor(Math.abs(walkTimer * 8)) % 4;
    const cacheKey = `${def.name}_${chapter}_f${isFiring ? 1 : 0}_h${isHurt ? 1 : 0}_w${walkStep}`;
    const cached = this.canvasCache.get(cacheKey);
    if (cached) return cached;

    // Palette resolution
    const effectivePal: Record<string, string> = { ...def.palette };
    if (chapter !== 'ultramarines' && def.swaps && def.swaps[chapter]) {
      Object.assign(effectivePal, def.swaps[chapter]);
    }

    if (isHurt) {
      effectivePal['#'] = '#ffffff';
      effectivePal['d'] = '#991b1b';
      effectivePal['b'] = '#b91c1c';
      effectivePal['B'] = '#ef4444';
      effectivePal['L'] = '#fca5a5';
      effectivePal['s'] = '#ffffff';
      effectivePal['S'] = '#fca5a5';
    }

    const canvas = document.createElement('canvas');
    canvas.width = def.width + 12;
    canvas.height = def.height + 8;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return canvas;

    ctx.imageSmoothingEnabled = false;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(Math.floor(def.width / 2) + 6, def.height + 2, Math.floor(def.width * 0.42), 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const bobY = walkStep === 1 || walkStep === 3 ? 1 : 0;
    const offsetX = 6;
    const offsetY = 4 + bobY;

    for (let r = 0; r < def.matrix.length; r++) {
      const rowStr = def.matrix[r];
      for (let c = 0; c < rowStr.length; c++) {
        const tok = rowStr[c];
        if (tok === '.') continue;
        const color = effectivePal[tok];
        if (!color || color === 'transparent') continue;

        ctx.fillStyle = color;
        ctx.fillRect(c + offsetX, r + offsetY, 1, 1);
      }
    }

    // Dynamic Smoke & Overlays
    if (def.name === 'castraferrum-dreadnought') {
      // Exhaust smoke puffs from rear stacks
      const smokePulse = Math.sin(elapsedTime * 6) * 2;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
      ctx.fillRect(18 + smokePulse, 1, 5, 4);
      ctx.fillRect(44 - smokePulse, 1, 5, 4);
    }

    this.canvasCache.set(cacheKey, canvas);
    return canvas;
  }
}
