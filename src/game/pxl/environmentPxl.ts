/**
 * Warhammer 40,000: Battlefield Collectibles & Interactive Hazards in Claude-PXL DSL
 * 
 * Provides pixel-perfect 16-bit raster definitions for:
 * - Munitorum Relic Chest (36x30): Imperial Aquila crate with gold trim & beacon
 * - Promethium Hazard Barrel (24x32): Fuel canister with skull hazard stripe & pressure gauge
 * - Biomass Spores Tier 1, 2, 3: Shimmering biological XP cores
 */

import { PxlSpriteDef } from './claudePxlEngine';

// 1. MUNITORUM RELIC CHEST (36x30)
export const RELIC_CHEST_PXL_DEF: PxlSpriteDef = {
  name: 'munitorum-relic-chest',
  width: 36,
  height: 30,
  palette: {
    '.': 'transparent',
    '#': '#090d16',
    's': '#1e293b',
    'S': '#334155',
    'h': '#64748b',
    'g': '#78350f',
    'G': '#b45309',
    'Y': '#f59e0b',       // Imperial Gold
    'y': '#fde047',
    'w': '#f8fafc',       // Skull white
    'e': '#22c55e',       // Beacon green (ready)
    'r': '#dc2626'        // Beacon red
  },
  matrix: [
    "....................................",
    "....................................",
    "...............######...............",
    "..............#eYYYYe#..............",  // Top Aquila Crest & Beacon
    ".............#eYyyyyYe#.............",
    ".............#GYYYYYYG#.............",
    "............#sSSSSSSSSs#............",
    "...........#sShhhhhhhhSs#...........",
    "..........#sShhhhhSShhhSs#..........",
    ".........#sShhhhh#ee#hhhSs#.........",
    "........#sSSSSSSSSSSSSSSSSs#........",
    ".......#sShhhhhhhhhhhhhhhhSs#.......",
    "......#sSSSSSSSSSSSSSSSSSSSSs#......",
    ".....#sShhhhhhhhhhhhhhhhhhhhSs#.....",
    "....#sSSSSSSSSSSSSSSSSSSSSSSSSs#....",
    "...#sShhhhhhhhhhhhhhhhhhhhhhhhSs#...",
    "..#sSSSSSSSSSSSSSSSSSSSSSSSSSSSSs#..",
    "..#sShhhhhhhhhhhhhhhhhhhhhhhhhhSs#..",
    "..#sShhhYYYYhhhhhhhhhhhhYYYYhhhSs#..",  // Gold Corner Clasps
    "..#sShhhYyyYhhhhwwwwhhhhYyyYhhhSs#..",  // Center Aquila Skull
    "..#sShhhYyyYhhhww##wwhhhYyyYhhhSs#..",
    "..#sShhhYYYYhhhwwwwwwhhhYYYYhhhSs#..",
    "..#sShhhhhhhhhhwwwwwwhhhhhhhhhhSs#..",
    "..#sShhhhhhhhhhhwwwwhhhhhhhhhhhSs#..",
    "..#sSSSSSSSSSSSSSSSSSSSSSSSSSSSSs#..",
    "..#ssssssssssssssssssssssssssssss#..",
    "...##############################...",
    "....................................",
    "....................................",
    "...................................."
  ]
};

// 2. PROMETHIUM HAZARD BARREL (24x32)
export const PROMETHIUM_BARREL_PXL_DEF: PxlSpriteDef = {
  name: 'promethium-barrel',
  width: 24,
  height: 32,
  palette: {
    '.': 'transparent',
    '#': '#090d16',
    'd': '#450a0a',
    'r': '#991b1b',       // Crimson Hazard Red
    'R': '#dc2626',
    'h': '#f87171',
    's': '#334155',
    'S': '#64748b',
    'w': '#f8fafc',       // Skull hazard stencil
    'e': '#f97316',       // Flame warning
    'Y': '#eab308'        // Warning stripe yellow
  },
  matrix: [
    "........................",
    ".........######.........",
    ".......##sSSSSs##.......",
    "......#sSSSSSSSSs#......",  // Metal cap & pressure valve
    "......#sS######Ss#......",
    ".....#ddrrrrrrrrdd#.....",
    "....#ddrRRRRRRRRrdd#....",
    "...#ddrRRRRRRRRRRrdd#...",
    "...#ddrRRRRRRRRRRrdd#...",
    "...#ddrYYYYYYYYYYrdd#...",  // Hazard yellow stripe
    "...#ddrYY####YY##rdd#...",  // Skull hazard stencil
    "...#ddrY#wwww##wwrdd#...",
    "...#ddrY#wwww##wwrdd#...",
    "...#ddrY#wwwwwwwwrdd#...",
    "...#ddrYY#wwwwww#rdd#...",
    "...#ddrYYY#wwww#Yrdd#...",
    "...#ddrYYYY####YYrdd#...",
    "...#ddrYYYYYYYYYYrdd#...",
    "...#ddrRRRRRRRRRRrdd#...",
    "...#ddrRRRRRRRRRRrdd#...",
    "...#ddrRRRRRRRRRRrdd#...",
    "...#ddrRRRRRRRRRRrdd#...",
    "...#ddrRRRRRRRRRRrdd#...",
    "...#ddrRRRRRRRRRRrdd#...",
    "...#ddrRRRRRRRRRRrdd#...",
    "....#ddrRRRRRRRRrdd#....",
    ".....#ddrrrrrrrrdd#.....",
    "......#sSSSSSSSSs#......",  // Bottom metal rim
    ".......##sSSSSs##.......",
    ".........######.........",
    "........................",
    "........................"
  ]
};

// 3. BIOMASS SPORES (18x18)
export const BIOMASS_SPORE_PXL_DEF: PxlSpriteDef = {
  name: 'biomass-spore',
  width: 18,
  height: 18,
  palette: {
    '.': 'transparent',
    '#': '#051b11',
    'g': '#15803d',
    'G': '#22c55e',       // Bio-plasma Green
    'l': '#4ade80',
    'w': '#bbf7d0',
    'c': '#0284c7',       // Tier 2 Cyan
    'C': '#38bdf8',
    'y': '#d97706',       // Tier 3 Gold
    'Y': '#facc15'
  },
  matrix: [
    "..................",
    "......######......",
    "....##gGGGGg##....",
    "...#gGGllllGGg#...",
    "..#gGGllllllGGg#..",
    ".#gGGllwwwwllGGg#.",
    ".#gGGllwwwwllGGg#.",
    "#gGGlllwwwwlllGGg#",
    "#gGGllllllllllGGg#",
    "#gGGllllllllllGGg#",
    "#gGGlllGGGGlllGGg#",
    ".#gGGllGGGGllGGg#.",
    ".#gGGllGGGGllGGg#.",
    "..#gGGg####gGGg#..",
    "...#gG#....#Gg#...",
    "....##......##....",
    "..................",
    ".................."
  ]
};

/**
 * High-performance offscreen compilation engine for Environment & Collectibles
 */
export class EnvironmentPxlCompiler {
  private static canvasCache: Map<string, HTMLCanvasElement> = new Map();

  public static clearCache(): void {
    this.canvasCache.clear();
  }

  public static renderChest(beaconTimer: number = 0): HTMLCanvasElement {
    const isReady = Math.sin(beaconTimer * 6) > 0;
    const cacheKey = `relic_chest_${isReady ? 1 : 0}`;
    const cached = this.canvasCache.get(cacheKey);
    if (cached) return cached;

    const def = RELIC_CHEST_PXL_DEF;
    const effectivePal = { ...def.palette };
    effectivePal['e'] = isReady ? '#22c55e' : '#eab308';

    const canvas = document.createElement('canvas');
    canvas.width = def.width + 6;
    canvas.height = def.height + 4;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return canvas;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(Math.floor(def.width / 2) + 3, def.height + 1, Math.floor(def.width * 0.44), 3, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let r = 0; r < def.matrix.length; r++) {
      const rowStr = def.matrix[r];
      for (let c = 0; c < rowStr.length; c++) {
        const tok = rowStr[c];
        if (tok === '.') continue;
        const color = effectivePal[tok];
        if (!color || color === 'transparent') continue;
        ctx.fillStyle = color;
        ctx.fillRect(c + 3, r + 2, 1, 1);
      }
    }

    this.canvasCache.set(cacheKey, canvas);
    return canvas;
  }

  public static renderBarrel(damageRatio: number = 1.0, isTriggered: boolean = false): HTMLCanvasElement {
    const stateKey = isTriggered ? 'trig' : Math.round(damageRatio * 4);
    const cacheKey = `prom_barrel_${stateKey}`;
    const cached = this.canvasCache.get(cacheKey);
    if (cached) return cached;

    const def = PROMETHIUM_BARREL_PXL_DEF;
    const effectivePal = { ...def.palette };
    if (isTriggered) {
      effectivePal['r'] = '#ea580c';
      effectivePal['R'] = '#f97316';
      effectivePal['Y'] = '#ffffff';
    }

    const canvas = document.createElement('canvas');
    canvas.width = def.width + 6;
    canvas.height = def.height + 4;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return canvas;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(Math.floor(def.width / 2) + 3, def.height + 1, Math.floor(def.width * 0.38), 3, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let r = 0; r < def.matrix.length; r++) {
      const rowStr = def.matrix[r];
      for (let c = 0; c < rowStr.length; c++) {
        const tok = rowStr[c];
        if (tok === '.') continue;
        const color = effectivePal[tok];
        if (!color || color === 'transparent') continue;
        ctx.fillStyle = color;
        ctx.fillRect(c + 3, r + 2, 1, 1);
      }
    }

    this.canvasCache.set(cacheKey, canvas);
    return canvas;
  }

  public static renderSpore(tier: 1 | 2 | 3 = 1, pulse: number = 0): HTMLCanvasElement {
    const pulseStep = Math.round(pulse * 3);
    const cacheKey = `spore_t${tier}_p${pulseStep}`;
    const cached = this.canvasCache.get(cacheKey);
    if (cached) return cached;

    const def = BIOMASS_SPORE_PXL_DEF;
    const effectivePal = { ...def.palette };

    if (tier === 2) {
      effectivePal['#'] = '#031726';
      effectivePal['g'] = '#0284c7';
      effectivePal['G'] = '#0ea5e9';
      effectivePal['l'] = '#38bdf8';
      effectivePal['w'] = '#bae6fd';
    } else if (tier === 3) {
      effectivePal['#'] = '#211202';
      effectivePal['g'] = '#b45309';
      effectivePal['G'] = '#f59e0b';
      effectivePal['l'] = '#fbbf24';
      effectivePal['w'] = '#fef08a';
    }

    const canvas = document.createElement('canvas');
    canvas.width = def.width + 4;
    canvas.height = def.height + 4;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return canvas;

    ctx.imageSmoothingEnabled = false;

    for (let r = 0; r < def.matrix.length; r++) {
      const rowStr = def.matrix[r];
      for (let c = 0; c < rowStr.length; c++) {
        const tok = rowStr[c];
        if (tok === '.') continue;
        const color = effectivePal[tok];
        if (!color || color === 'transparent') continue;
        ctx.fillStyle = color;
        ctx.fillRect(c + 2, r + 2, 1, 1);
      }
    }

    this.canvasCache.set(cacheKey, canvas);
    return canvas;
  }
}
