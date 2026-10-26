/**
 * Warhammer 40k: Space Marine Pixel Survivor
 * Raster Asset Pipeline & Pixel Art Sprite Engine (v0.1.9)
 * Inspired by gamedev-skills raster-pipeline & create-game-assets
 */

import { MarineChapter, MarineSkin, SquadBrotherType, EnemyType } from '../types/game';
import { PxlEngine } from './pxl/claudePxlEngine';
import { SPACE_MARINE_PXL_DEF, decorateSquadRole } from './pxl/spaceMarinePxl';
import {
  HORMAGAUNT_PXL_DEF,
  TERMAGANT_PXL_DEF,
  GENESTEALER_PXL_DEF,
  TYRANID_WARRIOR_PXL_DEF,
  CARNIFEX_PXL_DEF,
  ZOANTHROPE_PXL_DEF,
  BIOVORE_PXL_DEF,
  SPORE_MINE_PXL_DEF,
  TyranidPxlCompiler
} from './pxl/tyranidPxl';
import {
  DREADNOUGHT_PXL_DEF,
  SERVO_SKULL_PXL_DEF,
  SENTRY_TURRET_PXL_DEF,
  DROP_POD_PXL_DEF,
  VehiclePxlCompiler
} from './pxl/vehiclePxl';
import { EnvironmentPxlCompiler } from './pxl/environmentPxl';

export interface PixelColorDef {
  outline: string;
  darkShadow: string;
  base: string;
  highlight: string;
  accent: string;
}

/**
 * Grimdark Warhammer 40,000 Authentic Pixel Color Palettes
 * Enforces strict color discipline & avoids "mixel" visual artifacts
 */
export const WARHAMMER_PALETTES: Record<string, PixelColorDef> = {
  ultramarines: {
    outline: '#090d16',
    darkShadow: '#1e3a8a',
    base: '#2563eb',
    highlight: '#60a5fa',
    accent: '#fbbf24' // Gold trim
  },
  blood_angels: {
    outline: '#0f0507',
    darkShadow: '#881337',
    base: '#dc2626',
    highlight: '#f87171',
    accent: '#fbbf24'
  },
  space_wolves: {
    outline: '#090e15',
    darkShadow: '#334155',
    base: '#64748b',
    highlight: '#94a3b8',
    accent: '#eab308'
  },
  dark_angels: {
    outline: '#05130b',
    darkShadow: '#064e3b',
    base: '#047857',
    highlight: '#34d399',
    accent: '#fde047'
  },
  salamanders: {
    outline: '#051408',
    darkShadow: '#14532d',
    base: '#16a34a',
    highlight: '#4ade80',
    accent: '#f97316'
  },
  imperial_fists: {
    outline: '#170f03',
    darkShadow: '#ca8a04',
    base: '#eab308',
    highlight: '#fde047',
    accent: '#dc2626'
  },
  iron_hands: {
    outline: '#020617',
    darkShadow: '#1e293b',
    base: '#334155',
    highlight: '#94a3b8',
    accent: '#38bdf8'
  },
  raven_guard: {
    outline: '#020617',
    darkShadow: '#0f172a',
    base: '#1e293b',
    highlight: '#64748b',
    accent: '#f1f5f9'
  },
  // Tyranid Hive Fleet Leviathan
  tyranid_chitin: {
    outline: '#0c051a',
    darkShadow: '#2e1065',
    base: '#4c1d95',
    highlight: '#7c3aed',
    accent: '#fde047'
  },
  tyranid_flesh: {
    outline: '#1a050f',
    darkShadow: '#831843',
    base: '#be185d',
    highlight: '#f472b6',
    accent: '#84cc16'
  }
};

export interface MarinePixelPalette {
  outline: string;
  shadow: string;
  base: string;
  highlight: string;
  trim: string;
  trimHighlight: string;
  lens: string;
  lensGlint: string;
  aquila: string;
  gunMetal: string;
  gunDark: string;
  wax: string;
  parchment: string;
}

/**
 * High-Precision True Pixel-Art Sprite Engine for Warhammer 40k Space Marine
 * Native 44x48 integer coordinate canvas, 5-tone indexed shading, and offscreen sprite baking.
 */
export class SpaceMarinePixelArt {
  public static readonly SPRITE_WIDTH = 52;
  public static readonly SPRITE_HEIGHT = 57;

  /**
   * Calculates the exact world coordinates of the Space Marine Bolter muzzle tip.
   * Guarantees 100% mathematical alignment between weapon model and projectile origin.
   */
  public static getMuzzlePosition(
    playerX: number,
    playerY: number,
    facingLeft: boolean,
    aimAngle: number,
    customScale: number = 1.35
  ): { x: number; y: number } {
    const effScale = customScale === 1.6 ? 1.35 : customScale;
    // Pivot at shoulder joint in world space
    const pivotWorldX = playerX + (facingLeft ? -4 : 4) * effScale;
    const pivotWorldY = playerY - 4.5 * effScale;
    const gunLength = 26 * effScale; // 35.1 world pixels

    return {
      x: pivotWorldX + Math.cos(aimAngle) * gunLength,
      y: pivotWorldY + Math.sin(aimAngle) * gunLength
    };
  }

  public static getPalette(
    chapter: MarineChapter = 'ultramarines',
    skin: MarineSkin = 'standard',
    isHurt: boolean = false,
    role?: SquadBrotherType
  ): MarinePixelPalette {
    // 1. Chapter Base
    let p: MarinePixelPalette = {
      outline: '#090d16',
      shadow: '#1e3a8a',
      base: '#2563eb',
      highlight: '#60a5fa',
      trim: '#f59e0b',
      trimHighlight: '#fbbf24',
      lens: '#ef4444',
      lensGlint: '#fecdd3',
      aquila: '#f59e0b',
      gunMetal: '#94a3b8',
      gunDark: '#1e293b',
      wax: '#dc2626',
      parchment: '#fef3c7'
    };

    if (chapter === 'blood_angels') {
      p.outline = '#0f0507';
      p.shadow = '#881337';
      p.base = '#dc2626';
      p.highlight = '#f87171';
      p.trim = '#f59e0b';
      p.trimHighlight = '#fbbf24';
      p.lens = '#10b981'; // Emerald lens
      p.lensGlint = '#a7f3d0';
      p.aquila = '#f59e0b';
      p.wax = '#991b1b';
    } else if (chapter === 'space_wolves') {
      p.outline = '#090e15';
      p.shadow = '#334155';
      p.base = '#64748b';
      p.highlight = '#94a3b8';
      p.trim = '#eab308';
      p.trimHighlight = '#fef08a';
      p.lens = '#06b6d4'; // Frost cyan lens
      p.lensGlint = '#cffafe';
      p.aquila = '#eab308';
    } else if (chapter === 'dark_angels') {
      p.outline = '#05130b';
      p.shadow = '#064e3b';
      p.base = '#047857';
      p.highlight = '#34d399';
      p.trim = '#fef3c7'; // Bone white trim
      p.trimHighlight = '#ffffff';
      p.lens = '#ef4444';
      p.aquila = '#fef3c7';
    } else if (chapter === 'salamanders') {
      p.outline = '#051408';
      p.shadow = '#14532d';
      p.base = '#16a34a';
      p.highlight = '#4ade80';
      p.trim = '#f97316'; // Drake orange
      p.trimHighlight = '#fdba74';
      p.lens = '#facc15'; // Glowing gold lens
      p.lensGlint = '#fef9c3';
      p.aquila = '#f97316';
    } else if (chapter === 'imperial_fists') {
      p.outline = '#170f03';
      p.shadow = '#ca8a04';
      p.base = '#eab308';
      p.highlight = '#fde047';
      p.trim = '#dc2626'; // Crimson trim
      p.trimHighlight = '#f87171';
      p.lens = '#38bdf8';
      p.lensGlint = '#e0f2fe';
      p.aquila = '#dc2626';
    } else if (chapter === 'iron_hands') {
      p.outline = '#05080f';
      p.shadow = '#1e293b';
      p.base = '#334155';
      p.highlight = '#94a3b8';
      p.trim = '#e2e8f0'; // Bionic silver trim
      p.trimHighlight = '#ffffff';
      p.lens = '#ef4444';
      p.aquila = '#e2e8f0';
    } else if (chapter === 'raven_guard') {
      p.outline = '#020408';
      p.shadow = '#0f172a';
      p.base = '#1e293b';
      p.highlight = '#64748b';
      p.trim = '#f8fafc'; // Corax ghost white trim
      p.trimHighlight = '#ffffff';
      p.lens = '#ef4444';
      p.aquila = '#f8fafc';
    }

    // 2. Skin Overrides
    if (skin === 'deathwatch') {
      p.shadow = '#020617';
      p.base = '#0f172a';
      p.highlight = '#475569';
      p.trim = '#cbd5e1';
      p.trimHighlight = '#f8fafc';
      p.aquila = '#cbd5e1';
      p.lens = '#ef4444';
    } else if (skin === 'veteran_gold') {
      p.shadow = '#a16207';
      p.base = '#eab308';
      p.highlight = '#fef08a';
      p.trim = '#f59e0b';
      p.trimHighlight = '#ffffff';
      p.aquila = '#ffffff';
    } else if (skin === 'sanguinary_guard') {
      p.shadow = '#b45309';
      p.base = '#f59e0b';
      p.highlight = '#fde047';
      p.trim = '#fef08a';
      p.trimHighlight = '#ffffff';
      p.lens = '#38bdf8';
      p.lensGlint = '#e0f2fe';
      p.aquila = '#ffffff';
    }

    // 3. Squad Brother Overrides
    if (role === 'apothecary') {
      p.base = '#f8fafc'; // Pristine white
      p.shadow = '#cbd5e1';
      p.highlight = '#ffffff';
      p.trim = '#dc2626'; // Red Prime Helix
      p.trimHighlight = '#f87171';
      p.lens = '#22c55e'; // Emerald medical visor
      p.lensGlint = '#86efac';
      p.aquila = '#dc2626';
    } else if (role === 'librarian') {
      p.base = '#1d4ed8'; // Deep warp blue
      p.shadow = '#1e1b4b';
      p.highlight = '#60a5fa';
      p.trim = '#f59e0b';
      p.trimHighlight = '#fde047';
      p.lens = '#38bdf8';
      p.lensGlint = '#bae6fd';
      p.aquila = '#f59e0b';
    } else if (role === 'techmarine') {
      p.base = '#dc2626'; // Mars red
      p.shadow = '#991b1b';
      p.highlight = '#f87171';
      p.trim = '#0f172a'; // Black cog trim
      p.trimHighlight = '#e2e8f0';
      p.lens = '#38bdf8';
      p.lensGlint = '#bae6fd';
      p.aquila = '#e2e8f0';
    }

    // 4. Hit Flash
    if (isHurt) {
      p.outline = '#ffffff';
      p.base = '#ef4444';
      p.shadow = '#991b1b';
      p.highlight = '#fca5a5';
    }

    return p;
  }

  /**
   * Renders the true pixel art Space Marine on an exact 44x48 integer buffer
   */
  public static drawMarinePixelBuffer(
    ctx: CanvasRenderingContext2D,
    palette: MarinePixelPalette,
    animFrame: number,
    isFiring: boolean,
    hasIronHalo: boolean,
    shieldPercent: number,
    chapter: MarineChapter,
    role?: SquadBrotherType
  ) {
    ctx.imageSmoothingEnabled = false;

    // Discrete integer animation shifts
    const bob = animFrame === 1 || animFrame === 3 ? 1 : 0;
    const legA = animFrame === 1 ? -2 : animFrame === 3 ? 2 : 0;
    const legB = animFrame === 1 ? 2 : animFrame === 3 ? -2 : 0;
    const ribbonShift = animFrame === 1 ? 1 : animFrame === 3 ? -1 : 0;

    // 0. Contact Shadow on ground (pixel-dithered oval)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(14, 43, 16, 3);
    ctx.fillRect(12, 44, 20, 2);
    ctx.fillRect(16, 42, 12, 1);

    // 1. Iron Halo (if active)
    if (hasIronHalo && shieldPercent > 0) {
      ctx.fillStyle = palette.trimHighlight;
      ctx.fillRect(19, 1, 6, 2);
      ctx.fillRect(16, 3, 3, 2);
      ctx.fillRect(25, 3, 3, 2);
      ctx.fillRect(14, 5, 2, 3);
      ctx.fillRect(28, 5, 2, 3);
      // Halo radiant spikes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(21, 0, 2, 1);
      ctx.fillRect(15, 2, 1, 1);
      ctx.fillRect(28, 2, 1, 1);
      ctx.fillRect(13, 5, 1, 2);
      ctx.fillRect(30, 5, 1, 2);
    }

    // 2. Backpack Power Plant (Mk X Power Pack)
    // Left Thruster Ball
    ctx.fillStyle = palette.outline;
    ctx.fillRect(7, 5 + bob, 5, 6);
    ctx.fillRect(8, 4 + bob, 3, 8);
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(8, 6 + bob, 3, 4);
    ctx.fillStyle = palette.highlight;
    ctx.fillRect(8, 5 + bob, 2, 1);
    ctx.fillStyle = '#f97316'; // thermal vent glow
    ctx.fillRect(9, 7 + bob, 1, 2);

    // Right Thruster Ball
    ctx.fillStyle = palette.outline;
    ctx.fillRect(32, 5 + bob, 5, 6);
    ctx.fillRect(33, 4 + bob, 3, 8);
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(33, 6 + bob, 3, 4);
    ctx.fillStyle = palette.highlight;
    ctx.fillRect(34, 5 + bob, 2, 1);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(34, 7 + bob, 1, 2);

    // Central Reactor Housing
    ctx.fillStyle = palette.outline;
    ctx.fillRect(16, 7 + bob, 12, 8);
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(17, 8 + bob, 10, 6);
    ctx.fillStyle = palette.gunMetal;
    ctx.fillRect(19, 9 + bob, 6, 4);
    ctx.fillStyle = palette.outline;
    ctx.fillRect(20, 10 + bob, 1, 2);
    ctx.fillRect(22, 10 + bob, 1, 2);

    // Role-specific Backpack Additions
    if (role === 'apothecary') {
      // Medicae Scanner Lamp & Helix Vials
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 1 + bob, 4, 3);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(11, 2 + bob, 2, 1);
    } else if (role === 'techmarine') {
      // Articulated Hydraulic Servo-Arm with Claw
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(11, 1 + bob, 3, 5);
      ctx.fillRect(13, 0 + bob, 8, 3);
      ctx.fillRect(19, 2 + bob, 3, 4);
      ctx.fillStyle = palette.gunMetal;
      ctx.fillRect(20, 5 + bob, 4, 3); // Claw base
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(24, 4 + bob, 2, 2); // Pincer top
      ctx.fillRect(24, 7 + bob, 2, 2); // Pincer bottom
    } else if (role === 'librarian') {
      // Psychic Hood Arch
      ctx.fillStyle = palette.trim;
      ctx.fillRect(16, 3 + bob, 12, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(17, 4 + bob, 2, 1);
      ctx.fillRect(25, 4 + bob, 2, 1);
    }

    // 3. Legs & Armored Greaves
    // Left Leg (Back)
    const leftY = 27 + bob + legA;
    ctx.fillStyle = palette.outline;
    ctx.fillRect(13, leftY, 6, 6);
    ctx.fillRect(12, leftY + 5, 7, 5);
    ctx.fillRect(11, leftY + 9, 8, 4);
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(14, leftY + 1, 4, 4);
    ctx.fillRect(13, leftY + 6, 5, 3);
    ctx.fillRect(12, leftY + 10, 6, 2);
    ctx.fillStyle = palette.base;
    ctx.fillRect(14, leftY + 2, 2, 3);
    ctx.fillRect(13, leftY + 6, 3, 2);
    ctx.fillStyle = palette.highlight;
    ctx.fillRect(13, leftY + 5, 2, 1);

    // Right Leg (Front)
    const rightY = 27 + bob + legB;
    ctx.fillStyle = palette.outline;
    ctx.fillRect(25, rightY, 6, 6);
    ctx.fillRect(25, rightY + 5, 7, 5);
    ctx.fillRect(25, rightY + 9, 8, 4);
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(26, rightY + 1, 4, 4);
    ctx.fillRect(26, rightY + 6, 5, 3);
    ctx.fillRect(26, rightY + 10, 6, 2);
    ctx.fillStyle = palette.base;
    ctx.fillRect(26, rightY + 2, 3, 3);
    ctx.fillRect(27, rightY + 6, 3, 2);
    ctx.fillStyle = palette.highlight;
    ctx.fillRect(26, rightY + 5, 2, 1);

    // Purity Seal (pinned to left greave)
    ctx.fillStyle = palette.wax;
    ctx.fillRect(10, 26 + bob, 3, 3);
    ctx.fillStyle = palette.outline;
    ctx.fillRect(11, 27 + bob, 1, 1);
    ctx.fillStyle = palette.parchment;
    ctx.fillRect(10 + ribbonShift, 29 + bob, 2, 4);
    ctx.fillRect(11 + ribbonShift, 33 + bob, 2, 3);
    ctx.fillStyle = '#78350f'; // Holy script runes
    ctx.fillRect(10 + ribbonShift, 30 + bob, 1, 1);
    ctx.fillRect(11 + ribbonShift, 32 + bob, 1, 1);
    ctx.fillRect(11 + ribbonShift, 34 + bob, 1, 1);

    // Loincloth / Tabard (between legs)
    ctx.fillStyle = palette.outline;
    ctx.fillRect(19, 25 + bob, 6, 8);
    ctx.fillStyle = palette.wax;
    ctx.fillRect(20, 26 + bob, 4, 6);
    ctx.fillStyle = palette.parchment;
    ctx.fillRect(21, 27 + bob, 2, 4);

    // 4. Armored Belt & Faulds
    ctx.fillStyle = palette.outline;
    ctx.fillRect(16, 23 + bob, 12, 4);
    ctx.fillStyle = palette.gunDark;
    ctx.fillRect(17, 24 + bob, 10, 2);
    // Buckle (Golden eagle skull)
    ctx.fillStyle = palette.trimHighlight;
    ctx.fillRect(21, 23 + bob, 2, 3);
    // Combat pouches
    ctx.fillStyle = '#451a03';
    ctx.fillRect(14, 23 + bob, 3, 3);
    ctx.fillRect(27, 23 + bob, 3, 3);
    ctx.fillStyle = palette.outline;
    ctx.fillRect(15, 24 + bob, 1, 1);
    ctx.fillRect(28, 24 + bob, 1, 1);

    // 5. Torso & Gorget (Breastplate with Imperialis)
    ctx.fillStyle = palette.outline;
    ctx.fillRect(15, 14 + bob, 14, 10);
    ctx.fillRect(16, 13 + bob, 12, 11);
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(17, 15 + bob, 10, 8);
    ctx.fillStyle = palette.base;
    ctx.fillRect(18, 15 + bob, 8, 5);
    ctx.fillStyle = palette.highlight;
    ctx.fillRect(19, 14 + bob, 6, 1);

    // Golden Imperialis / Aquila (Winged skull crest)
    ctx.fillStyle = palette.aquila;
    ctx.fillRect(16, 16 + bob, 12, 2);
    ctx.fillRect(17, 17 + bob, 10, 2);
    ctx.fillRect(18, 18 + bob, 8, 1);
    ctx.fillStyle = palette.trimHighlight;
    ctx.fillRect(21, 16 + bob, 2, 3);
    ctx.fillStyle = palette.outline;
    ctx.fillRect(21, 17 + bob, 1, 1);
    ctx.fillRect(22, 17 + bob, 1, 1);

    // Flexible power cables at waist
    ctx.fillStyle = palette.gunMetal;
    ctx.fillRect(18, 21 + bob, 8, 2);
    ctx.fillStyle = palette.outline;
    ctx.fillRect(19, 21 + bob, 1, 2);
    ctx.fillRect(21, 21 + bob, 1, 2);
    ctx.fillRect(23, 21 + bob, 1, 2);
    ctx.fillRect(25, 21 + bob, 1, 2);

    // 6. Left Pauldron (Massive curved shoulder guard)
    ctx.fillStyle = palette.outline;
    ctx.fillRect(7, 12 + bob, 10, 11);
    ctx.fillRect(8, 11 + bob, 8, 13);
    ctx.fillStyle = palette.trim;
    ctx.fillRect(8, 12 + bob, 8, 2);
    ctx.fillRect(7, 14 + bob, 2, 7);
    ctx.fillRect(14, 14 + bob, 2, 7);
    ctx.fillRect(8, 20 + bob, 8, 2);
    ctx.fillStyle = palette.trimHighlight;
    ctx.fillRect(9, 12 + bob, 6, 1);
    ctx.fillRect(7, 14 + bob, 1, 4);
    // Inner Chapter field
    ctx.fillStyle = palette.base;
    ctx.fillRect(9, 14 + bob, 5, 6);
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(11, 16 + bob, 3, 4);

    // Chapter Heraldry
    ctx.fillStyle = palette.trimHighlight;
    if (role === 'apothecary') {
      // Red Prime Helix
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(11, 14 + bob, 2, 5);
      ctx.fillRect(10, 15 + bob, 4, 1);
      ctx.fillRect(10, 17 + bob, 4, 1);
    } else if (chapter === 'ultramarines') {
      // Golden Ultima "U"
      ctx.fillRect(10, 15 + bob, 1, 3);
      ctx.fillRect(12, 15 + bob, 1, 3);
      ctx.fillRect(10, 18 + bob, 3, 1);
    } else if (chapter === 'blood_angels') {
      // Blood Drop
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(11, 15 + bob, 2, 1);
      ctx.fillRect(10, 16 + bob, 4, 2);
      ctx.fillRect(11, 18 + bob, 2, 1);
    } else {
      // Tactical skull
      ctx.fillRect(11, 15 + bob, 2, 2);
      ctx.fillRect(11, 17 + bob, 2, 1);
    }

    // 7. Mk X / Mk VII Helmet
    ctx.fillStyle = palette.outline;
    ctx.fillRect(18, 6 + bob, 8, 8);
    ctx.fillRect(19, 5 + bob, 6, 10);
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(19, 7 + bob, 6, 6);
    ctx.fillStyle = palette.base;
    ctx.fillRect(19, 7 + bob, 5, 4);
    ctx.fillStyle = palette.highlight;
    ctx.fillRect(21, 5 + bob, 2, 4);

    // Triangular Vox-Grille
    ctx.fillStyle = palette.gunMetal;
    ctx.fillRect(20, 12 + bob, 4, 1);
    ctx.fillRect(21, 13 + bob, 2, 1);
    ctx.fillStyle = palette.outline;
    ctx.fillRect(20, 12 + bob, 1, 1);
    ctx.fillRect(22, 12 + bob, 1, 1);
    ctx.fillRect(21, 14 + bob, 2, 1);

    // Angular Slanted Visor Lenses
    ctx.fillStyle = palette.lens;
    ctx.fillRect(19, 10 + bob, 2, 1);
    ctx.fillRect(20, 11 + bob, 1, 1);
    ctx.fillRect(23, 10 + bob, 2, 1);
    ctx.fillRect(23, 11 + bob, 1, 1);
    // Lens Glint
    ctx.fillStyle = palette.lensGlint;
    ctx.fillRect(19, 10 + bob, 1, 1);
    ctx.fillRect(24, 10 + bob, 1, 1);

    // Side Auspex Ear Sensor & LED
    ctx.fillStyle = palette.outline;
    ctx.fillRect(26, 8 + bob, 2, 4);
    ctx.fillStyle = palette.gunMetal;
    ctx.fillRect(26, 9 + bob, 1, 2);
    ctx.fillStyle = '#2dd4bf'; // comms active teal LED
    ctx.fillRect(26, 8 + bob, 1, 1);

    // 8. Right Pauldron (Front shoulder guard)
    ctx.fillStyle = palette.outline;
    ctx.fillRect(27, 12 + bob, 10, 11);
    ctx.fillRect(28, 11 + bob, 8, 13);
    ctx.fillStyle = palette.trim;
    ctx.fillRect(28, 12 + bob, 8, 2);
    ctx.fillRect(27, 14 + bob, 2, 7);
    ctx.fillRect(34, 14 + bob, 2, 7);
    ctx.fillRect(28, 20 + bob, 8, 2);
    ctx.fillStyle = palette.trimHighlight;
    ctx.fillRect(29, 12 + bob, 6, 1);
    ctx.fillStyle = palette.base;
    ctx.fillRect(29, 14 + bob, 5, 6);
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(31, 16 + bob, 3, 4);
    // Tactical Arrow Mark
    ctx.fillStyle = palette.trimHighlight;
    ctx.fillRect(31, 15 + bob, 1, 1);
    ctx.fillRect(30, 16 + bob, 3, 1);
    ctx.fillRect(31, 17 + bob, 1, 2);

    // 9. Weapon & Gauntlets
    const gunY = 17 + bob;

    if (role === 'librarian') {
      // Force Staff in Hand
      ctx.fillStyle = '#78350f';
      ctx.fillRect(30, gunY - 14, 3, 26);
      // Eagle Skull Staff Crown
      ctx.fillStyle = palette.trimHighlight;
      ctx.fillRect(28, gunY - 17, 7, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(30, gunY - 18, 3, 2); // warp crystal
      // Gauntlet
      ctx.fillStyle = palette.base;
      ctx.fillRect(29, gunY + 4, 4, 4);
    } else if (role === 'apothecary') {
      // Narthecium Wrist Unit with Reductor Drill
      ctx.fillStyle = palette.gunDark;
      ctx.fillRect(27, gunY + 2, 9, 6);
      ctx.fillStyle = palette.gunMetal;
      ctx.fillRect(36, gunY + 4, 6, 2); // reductor needle drill
      ctx.fillStyle = '#22c55e'; // emerald nanite canister
      ctx.fillRect(29, gunY - 1, 3, 3);
      // Gauntlet
      ctx.fillStyle = palette.base;
      ctx.fillRect(26, gunY + 3, 4, 4);
    } else if (role === 'devastator') {
      // Heavy Bolter (Enlarged chassis with ammo feed)
      ctx.fillStyle = palette.outline;
      ctx.fillRect(21, gunY - 1, 20, 10);
      ctx.fillStyle = palette.gunDark;
      ctx.fillRect(22, gunY, 18, 8);
      ctx.fillStyle = palette.base;
      ctx.fillRect(24, gunY + 1, 10, 5);
      ctx.fillStyle = palette.gunMetal;
      ctx.fillRect(39, gunY + 1, 3, 6); // heavy twin vents
      ctx.fillStyle = palette.outline;
      ctx.fillRect(40, gunY + 2, 1, 1);
      ctx.fillRect(40, gunY + 4, 1, 1);
      // Heavy ammo feed belt
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(22, gunY + 8, 3, 2);
      ctx.fillRect(19, gunY + 9, 3, 2);
      ctx.fillRect(16, gunY + 8, 3, 2);
      // Gauntlets
      ctx.fillStyle = palette.base;
      ctx.fillRect(23, gunY + 5, 4, 4);
      ctx.fillRect(33, gunY + 5, 4, 4);
    } else {
      // Standard Godwyn-pattern Bolter
      ctx.fillStyle = palette.outline;
      ctx.fillRect(23, gunY, 15, 8);
      ctx.fillRect(24, gunY - 1, 12, 10);
      ctx.fillStyle = palette.gunDark;
      ctx.fillRect(24, gunY, 13, 6);
      // Picatinny Rail
      ctx.fillStyle = palette.gunMetal;
      ctx.fillRect(24, gunY - 1, 10, 1);
      ctx.fillStyle = palette.outline;
      ctx.fillRect(25, gunY - 1, 1, 1);
      ctx.fillRect(27, gunY - 1, 1, 1);
      ctx.fillRect(29, gunY - 1, 1, 1);
      ctx.fillRect(31, gunY - 1, 1, 1);

      // Blue Casing in Center with Gold Aquila
      ctx.fillStyle = palette.base;
      ctx.fillRect(26, gunY + 1, 8, 4);
      ctx.fillStyle = palette.aquila;
      ctx.fillRect(27, gunY + 2, 6, 2);
      ctx.fillStyle = palette.trimHighlight;
      ctx.fillRect(29, gunY + 2, 2, 1);

      // Box Magazine
      ctx.fillStyle = palette.outline;
      ctx.fillRect(29, gunY + 6, 5, 5);
      ctx.fillStyle = palette.gunDark;
      ctx.fillRect(30, gunY + 6, 3, 4);

      // Muzzle Brake
      ctx.fillStyle = palette.outline;
      ctx.fillRect(37, gunY + 1, 4, 5);
      ctx.fillStyle = palette.gunMetal;
      ctx.fillRect(38, gunY + 2, 2, 3);
      ctx.fillStyle = palette.outline;
      ctx.fillRect(39, gunY + 3, 1, 1);

      // Armored Gauntlets
      ctx.fillStyle = palette.outline;
      ctx.fillRect(25, gunY + 4, 4, 4);
      ctx.fillRect(33, gunY + 4, 4, 4);
      ctx.fillStyle = palette.base;
      ctx.fillRect(26, gunY + 5, 2, 2);
      ctx.fillRect(34, gunY + 5, 2, 2);
    }

    // Muzzle Flash Burst
    if (isFiring && role !== 'apothecary' && role !== 'librarian') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, gunY + 2, 2, 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(39, gunY + 1, 4, 4);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(42, gunY, 2, 1);
      ctx.fillRect(43, gunY + 2, 1, 2);
      ctx.fillRect(42, gunY + 5, 2, 1);
      // Spent brass casing
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(28, gunY - 3, 2, 1);
    }
  }

  /**
   * Fast Blit with Claude-PXL Matrix Engine, Offscreen Canvas Caching & Nearest-Neighbor Integer Scaling
   */
  public static draw(
    targetCtx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean,
    hasIronHalo: boolean,
    shieldPercent: number,
    chapter: MarineChapter = 'ultramarines',
    skin: MarineSkin = 'standard',
    isFiring: boolean = false,
    role?: SquadBrotherType,
    customScale: number = 1.35,
    isMoving: boolean = true,
    elapsedTime: number = 0,
    isLowHp: boolean = false,
    isDashing: boolean = false,
    aimAngle: number = 0,
    turnSquashTimer: number = 0,
    isBraced: boolean = false,
    overheatLevel: number = 0,
    meleeSlashTimer: number = 0
  ) {
    // 1. Calculate Walk Cycle or Idle Stance
    let bobY = 0;
    let legShiftLeft = 0;
    let legShiftRight = 0;
    let pauldronSwayX = 0;

    if (isMoving) {
      // 4-frame walk cycle at 9 steps/sec
      const animFrame = Math.floor(Math.abs(walkTimer * 9)) % 4;
      if (animFrame === 1) {
        bobY = 1; // weight impact
        legShiftLeft = 2; // left foot contact & stride
        legShiftRight = -2; // right foot trailing
        pauldronSwayX = 1;
      } else if (animFrame === 2) {
        bobY = -1; // passing stride rise
        legShiftLeft = 0;
        legShiftRight = 0;
        pauldronSwayX = 0;
      } else if (animFrame === 3) {
        bobY = 1; // weight impact
        legShiftLeft = -2; // left foot trailing
        legShiftRight = 2; // right foot contact & stride
        pauldronSwayX = -1;
      } else {
        // animFrame === 0: neutral stride
        bobY = 0;
        legShiftLeft = 0;
        legShiftRight = 0;
        pauldronSwayX = 0;
      }
    } else {
      // Idle Breathing Stance (subtle 1px chest rise every ~2.5s)
      const breathe = Math.sin(elapsedTime * 2.8);
      bobY = breathe > 0.4 ? 1 : 0;
      legShiftLeft = 0;
      legShiftRight = 0;
      pauldronSwayX = 0;
    }

    // 2. Weapon Recoil & Directional Muzzle Aim Pitch
    const recoilX = isFiring ? -2.5 : 0;
    const firePhase = isFiring ? 1 : 0;

    // Calculate aimPitch relative to facing orientation
    let aimPitch = 0;
    if (aimAngle !== undefined) {
      if (facingLeft) {
        let diff = aimAngle - Math.PI;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        aimPitch = -diff;
      } else {
        let diff = aimAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        aimPitch = diff;
      }
      // Ergonomic clamp for Power Armour two-handed Bolter: [-35 deg, +35 deg]
      aimPitch = Math.max(-0.62, Math.min(0.62, aimPitch));
    }

    // 3. Reactor Vent Idle Pulse (0.0 to 1.0)
    const idlePulse = (Math.sin(elapsedTime * 4.0) + 1) * 0.5;

    let swapKey: string = chapter;
    if (role) {
      swapKey = role;
    } else if (skin && skin !== 'standard') {
      swapKey = skin;
    }

    const cached = PxlEngine.renderToCanvas(SPACE_MARINE_PXL_DEF, {
      swapKey,
      bobY,
      legShiftLeft,
      legShiftRight,
      pauldronSwayX,
      recoilX,
      aimPitch,
      firePhase,
      isFiring,
      hasIronHalo,
      shieldPercent,
      isHurt,
      isLowHp,
      isDashing,
      isBraced,
      overheatLevel,
      meleeSlashTimer,
      idlePulse,
      role,
      postDecorate: decorateSquadRole
    });

    targetCtx.save();
    targetCtx.imageSmoothingEnabled = false;

    // Normalizing scale factor: if 1.6 was passed by legacy callers, adapt to 1.35
    const effScale = customScale === 1.6 ? 1.35 : customScale;
    const w = Math.round(cached.width * effScale);
    const h = Math.round(cached.height * effScale);

    // Apply Hurt Jitter
    let px = Math.floor(x);
    let py = Math.floor(y);
    if (isHurt) {
      px += Math.round((Math.random() - 0.5) * 4);
      py += Math.round((Math.random() - 0.5) * 4);
    }

    // Organic turn transition squash & stretch
    let squashX = 1.0;
    let squashY = 1.0;
    if (turnSquashTimer > 0) {
      const turnProgress = Math.min(1, turnSquashTimer / 0.08);
      squashX = 0.72 + (1 - turnProgress) * 0.28;
      squashY = 1.06 - (1 - turnProgress) * 0.06;
    }

    targetCtx.translate(px, py);
    targetCtx.scale(facingLeft ? -squashX : squashX, squashY);
    targetCtx.drawImage(cached, -Math.round(w / 2), -Math.round(h / 2), w, h);

    targetCtx.restore();
  }
}

/**
 * Offscreen Canvas Sprite Cache
 * Pre-renders and bakes expensive pixel silhouettes into cached image surfaces for 60fps GPU blitting
 */
export class PixelSpriteAtlas {
  private static cache: Map<string, HTMLCanvasElement> = new Map();

  /**
   * Retrieves or creates a cached offscreen canvas sprite
   */
  public static getOrCreate(
    key: string,
    width: number,
    height: number,
    drawRoutine: (ctx: CanvasRenderingContext2D) => void
  ): HTMLCanvasElement {
    const existing = this.cache.get(key);
    if (existing) return existing;

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width);
    canvas.height = Math.ceil(height);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      drawRoutine(ctx);
    }
    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * Blits a cached sprite with high-performance integer coordinates
   */
  public static blit(
    targetCtx: CanvasRenderingContext2D,
    key: string,
    width: number,
    height: number,
    drawRoutine: (ctx: CanvasRenderingContext2D) => void,
    dx: number,
    dy: number,
    scaleX: number = 1,
    scaleY: number = 1
  ) {
    const cached = this.getOrCreate(key, width, height, drawRoutine);
    const w = width * Math.abs(scaleX);
    const h = height * Math.abs(scaleY);
    const destX = Math.floor(dx - w / 2);
    const destY = Math.floor(dy - h / 2);

    targetCtx.save();
    targetCtx.imageSmoothingEnabled = false;
    if (scaleX < 0) {
      targetCtx.translate(Math.floor(dx), Math.floor(dy));
      targetCtx.scale(-1, 1);
      targetCtx.drawImage(cached, -Math.floor(width / 2), -Math.floor(height / 2));
    } else {
      targetCtx.drawImage(cached, destX, destY);
    }
    targetCtx.restore();
  }

  public static clearCache() {
    this.cache.clear();
  }
}

/**
 * High Performance 2D Spatial Hash Grid
 * Reduces collision search from O(N * M) to O(1) per check.
 * Handles 1,000+ Tyranid swarm entities effortlessly.
 */
export class SpatialHashGrid<T extends { id: number; x: number; y: number; radius: number }> {
  private cellSize: number;
  private grid: Map<string, T[]> = new Map();

  constructor(cellSize: number = 128) {
    this.cellSize = cellSize;
  }

  public clear() {
    this.grid.clear();
  }

  public insert(entity: T) {
    const minCx = Math.floor((entity.x - entity.radius) / this.cellSize);
    const maxCx = Math.floor((entity.x + entity.radius) / this.cellSize);
    const minCy = Math.floor((entity.y - entity.radius) / this.cellSize);
    const maxCy = Math.floor((entity.y + entity.radius) / this.cellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = `${cx},${cy}`;
        let cell = this.grid.get(key);
        if (!cell) {
          cell = [];
          this.grid.set(key, cell);
        }
        cell.push(entity);
      }
    }
  }

  public query(x: number, y: number, range: number): T[] {
    const minCx = Math.floor((x - range) / this.cellSize);
    const maxCx = Math.floor((x + range) / this.cellSize);
    const minCy = Math.floor((y - range) / this.cellSize);
    const maxCy = Math.floor((y + range) / this.cellSize);

    const results: T[] = [];
    const seenIds = new Set<number>();

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = `${cx},${cy}`;
        const cell = this.grid.get(key);
        if (!cell) continue;

        for (let i = 0; i < cell.length; i++) {
          const item = cell[i];
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            results.push(item);
          }
        }
      }
    }

    return results;
  }
}

export interface TyranidPixelPalette {
  outline: string;
  shadow: string;
  base: string;
  highlight: string;
  flesh: string;
  fleshShadow: string;
  talon: string;
  talonDark: string;
  eye: string;
}

/**
 * True-Pixel Retro Raster Engine for Tyranid Swarms
 * Native integer grids, 5-tone Hive Fleet color palettes, and offscreen canvas caching
 */
export class TyranidPixelArt {
  public static getPalette(
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    isHurt: boolean = false
  ): TyranidPixelPalette {
    if (isHurt) {
      return {
        outline: '#ffffff',
        shadow: '#991b1b',
        base: '#ef4444',
        highlight: '#fca5a5',
        flesh: '#ffffff',
        fleshShadow: '#fecdd3',
        talon: '#ffffff',
        talonDark: '#f87171',
        eye: '#ffffff'
      };
    }
    if (fleet === 'kraken') {
      return {
        outline: '#170606',
        shadow: '#881337',
        base: '#dc2626',
        highlight: '#f87171',
        flesh: '#fef3c7',
        fleshShadow: '#d97706',
        talon: '#0f172a',
        talonDark: '#020617',
        eye: '#22c55e'
      };
    }
    if (fleet === 'behemoth') {
      return {
        outline: '#05131b',
        shadow: '#0e7490',
        base: '#06b6d4',
        highlight: '#67e8f9',
        flesh: '#dc2626',
        fleshShadow: '#991b1b',
        talon: '#090d16',
        talonDark: '#020617',
        eye: '#fde047'
      };
    }
    // Default: Leviathan
    return {
      outline: '#0c051a',
      shadow: '#3b0764',
      base: '#6b21a8',
      highlight: '#a855f7',
      flesh: '#f3e8ff',
      fleshShadow: '#d8b4e2',
      talon: '#e11d48',
      talonDark: '#9f1239',
      eye: '#facc15'
    };
  }

  // Draw Hormagaunt on native 36x28 integer buffer
  public static drawHormagauntBuffer(
    ctx: CanvasRenderingContext2D,
    pal: TyranidPixelPalette,
    frame: number,
    isPouncing: boolean
  ) {
    ctx.imageSmoothingEnabled = false;
    const stride = frame % 2 === 0 ? -1 : 1;
    const tailWave = frame === 1 ? 2 : frame === 3 ? -2 : 0;
    const pounceShift = isPouncing ? 2 : 0;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(8, 24, 18, 3);

    // Segmented whip-like tail
    ctx.fillStyle = pal.outline;
    ctx.fillRect(1, 14 + tailWave, 6, 3);
    ctx.fillRect(5, 13 + tailWave, 5, 4);
    ctx.fillStyle = pal.fleshShadow;
    ctx.fillRect(2, 15 + tailWave, 4, 1);
    ctx.fillRect(6, 14 + tailWave, 4, 2);

    // Digigrade back legs
    ctx.fillStyle = pal.outline;
    ctx.fillRect(7, 16 + stride, 4, 6);
    ctx.fillRect(6, 21 + stride, 4, 4);
    ctx.fillRect(14, 15 - stride, 4, 6);
    ctx.fillRect(13, 20 - stride, 4, 5);
    ctx.fillStyle = pal.flesh;
    ctx.fillRect(8, 17 + stride, 2, 4);
    ctx.fillRect(15, 16 - stride, 2, 4);
    ctx.fillStyle = pal.base;
    ctx.fillRect(6, 22 + stride, 3, 2);
    ctx.fillRect(13, 22 - stride, 3, 2);

    // Thorax & Carapace
    ctx.fillStyle = pal.outline;
    ctx.fillRect(9, 10, 14, 8);
    ctx.fillStyle = pal.flesh;
    ctx.fillRect(10, 11, 12, 6);
    ctx.fillStyle = pal.fleshShadow;
    ctx.fillRect(12, 14, 8, 2);

    // 3 Serrated Chitin Carapace Crests on dorsal ridge
    ctx.fillStyle = pal.outline;
    ctx.fillRect(9, 6, 4, 5);
    ctx.fillRect(13, 5, 5, 6);
    ctx.fillRect(18, 6, 4, 5);
    ctx.fillStyle = pal.base;
    ctx.fillRect(10, 7, 3, 3);
    ctx.fillRect(14, 6, 3, 4);
    ctx.fillRect(19, 7, 3, 3);
    ctx.fillStyle = pal.highlight;
    ctx.fillRect(10, 6, 2, 1);
    ctx.fillRect(14, 5, 2, 1);
    ctx.fillRect(19, 6, 2, 1);

    // Cranial Head & Razor Jaws
    ctx.fillStyle = pal.outline;
    ctx.fillRect(20 + pounceShift, 7, 10, 8);
    ctx.fillStyle = pal.base;
    ctx.fillRect(21 + pounceShift, 8, 8, 4);
    ctx.fillStyle = pal.highlight;
    ctx.fillRect(22 + pounceShift, 7, 6, 1);
    ctx.fillStyle = pal.flesh;
    ctx.fillRect(23 + pounceShift, 12, 6, 3);
    // Glowing predatory eye
    ctx.fillStyle = pal.eye;
    ctx.fillRect(25 + pounceShift, 9, 2, 1);
    // Sharp lower fangs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(24 + pounceShift, 14, 1, 2);
    ctx.fillRect(27 + pounceShift, 14, 1, 2);

    // Scything Talons (Curved bone blades)
    ctx.fillStyle = pal.outline;
    ctx.fillRect(17, 13, 3, 5);
    ctx.fillRect(18, 17, 3, 7);
    ctx.fillRect(19, 23, 2, 4);
    ctx.fillStyle = pal.talon;
    ctx.fillRect(18, 14, 2, 4);
    ctx.fillRect(19, 18, 2, 6);
    ctx.fillRect(19, 24, 1, 2);
    ctx.fillStyle = pal.talonDark;
    ctx.fillRect(17, 15, 1, 4);
  }

  // Draw Termagant on native 36x28 integer buffer
  public static drawTermagantBuffer(
    ctx: CanvasRenderingContext2D,
    pal: TyranidPixelPalette,
    frame: number
  ) {
    ctx.imageSmoothingEnabled = false;
    const stride = frame % 2 === 0 ? -1 : 1;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(8, 24, 18, 3);

    // Tail
    ctx.fillStyle = pal.outline;
    ctx.fillRect(2, 15, 6, 3);
    ctx.fillStyle = pal.fleshShadow;
    ctx.fillRect(3, 16, 4, 1);

    // Legs
    ctx.fillStyle = pal.outline;
    ctx.fillRect(8, 17 + stride, 4, 7);
    ctx.fillRect(15, 16 - stride, 4, 8);
    ctx.fillStyle = pal.flesh;
    ctx.fillRect(9, 18 + stride, 2, 5);
    ctx.fillRect(16, 17 - stride, 2, 6);

    // Body
    ctx.fillStyle = pal.outline;
    ctx.fillRect(9, 11, 14, 8);
    ctx.fillStyle = pal.flesh;
    ctx.fillRect(10, 12, 12, 6);

    // Chitin crests
    ctx.fillStyle = pal.outline;
    ctx.fillRect(10, 7, 5, 5);
    ctx.fillRect(15, 6, 5, 6);
    ctx.fillStyle = pal.base;
    ctx.fillRect(11, 8, 3, 3);
    ctx.fillRect(16, 7, 3, 4);
    ctx.fillStyle = pal.highlight;
    ctx.fillRect(11, 7, 2, 1);
    ctx.fillRect(16, 6, 2, 1);

    // Head
    ctx.fillStyle = pal.outline;
    ctx.fillRect(20, 8, 9, 8);
    ctx.fillStyle = pal.base;
    ctx.fillRect(21, 9, 7, 4);
    ctx.fillStyle = pal.eye;
    ctx.fillRect(24, 10, 2, 1);

    // Fleshborer Bio-Weapon (Held in lower limbs)
    ctx.fillStyle = pal.outline;
    ctx.fillRect(18, 16, 14, 6);
    ctx.fillRect(22, 21, 6, 4); // brood sac
    ctx.fillStyle = pal.shadow;
    ctx.fillRect(19, 17, 12, 4);
    ctx.fillStyle = '#84cc16'; // venom-green brood orifice
    ctx.fillRect(30, 18, 2, 2);
    ctx.fillStyle = pal.fleshShadow;
    ctx.fillRect(23, 22, 4, 2);
  }

  // Draw Genestealer on native 38x34 integer buffer
  public static drawGenestealerBuffer(
    ctx: CanvasRenderingContext2D,
    pal: TyranidPixelPalette,
    frame: number
  ) {
    ctx.imageSmoothingEnabled = false;
    const bob = frame % 2 === 0 ? 1 : 0;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(8, 30, 22, 3);

    // Powerful crouched legs
    ctx.fillStyle = pal.outline;
    ctx.fillRect(6, 20 + bob, 6, 8);
    ctx.fillRect(5, 27 + bob, 7, 5);
    ctx.fillRect(18, 19 - bob, 6, 9);
    ctx.fillRect(18, 27 - bob, 7, 5);
    ctx.fillStyle = pal.base;
    ctx.fillRect(7, 21 + bob, 4, 6);
    ctx.fillRect(19, 20 - bob, 4, 7);
    ctx.fillStyle = pal.highlight;
    ctx.fillRect(6, 28 + bob, 3, 2);
    ctx.fillRect(19, 28 - bob, 3, 2);

    // Muscular Torso & Ribbed Chitin
    ctx.fillStyle = pal.outline;
    ctx.fillRect(10, 12 + bob, 14, 10);
    ctx.fillStyle = pal.flesh;
    ctx.fillRect(11, 13 + bob, 12, 8);
    ctx.fillStyle = pal.shadow;
    ctx.fillRect(12, 15 + bob, 10, 2);
    ctx.fillRect(12, 18 + bob, 10, 2);

    // Bulbous Cranial Head
    ctx.fillStyle = pal.outline;
    ctx.fillRect(18, 5 + bob, 12, 10);
    ctx.fillStyle = pal.base;
    ctx.fillRect(19, 6 + bob, 10, 7);
    ctx.fillStyle = pal.highlight;
    ctx.fillRect(21, 5 + bob, 6, 2);
    ctx.fillStyle = pal.eye;
    ctx.fillRect(26, 9 + bob, 2, 1);
    // Predatory fangs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(25, 14 + bob, 1, 2);
    ctx.fillRect(27, 14 + bob, 1, 2);

    // Quad Rending Claws (4 arms)
    // Lower Arm Pair
    ctx.fillStyle = pal.outline;
    ctx.fillRect(16, 18 + bob, 8, 4);
    ctx.fillRect(23, 21 + bob, 4, 4);
    ctx.fillStyle = pal.talon;
    ctx.fillRect(24, 22 + bob, 2, 3);
    // Upper Deadly Rending Claws
    ctx.fillStyle = pal.outline;
    ctx.fillRect(12, 8 + bob, 5, 5);
    ctx.fillRect(15, 6 + bob, 10, 3);
    ctx.fillRect(24, 7 + bob, 8, 4);
    ctx.fillRect(31, 10 + bob, 5, 7);
    ctx.fillStyle = pal.talon;
    ctx.fillRect(25, 8 + bob, 6, 2);
    ctx.fillRect(31, 11 + bob, 3, 5);
    ctx.fillStyle = pal.talonDark;
    ctx.fillRect(32, 15 + bob, 2, 2);
  }

  // Draw Tyranid Warrior on native 44x46 integer buffer
  public static drawWarriorBuffer(
    ctx: CanvasRenderingContext2D,
    pal: TyranidPixelPalette,
    frame: number
  ) {
    ctx.imageSmoothingEnabled = false;
    const stride = frame % 2 === 0 ? -1 : 1;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 42, 24, 3);

    // Massive legs
    ctx.fillStyle = pal.outline;
    ctx.fillRect(10, 27 + stride, 7, 9);
    ctx.fillRect(9, 35 + stride, 8, 7);
    ctx.fillRect(23, 27 - stride, 7, 9);
    ctx.fillRect(23, 35 - stride, 8, 7);
    ctx.fillStyle = pal.flesh;
    ctx.fillRect(11, 28 + stride, 5, 7);
    ctx.fillRect(24, 28 - stride, 5, 7);
    ctx.fillStyle = pal.base;
    ctx.fillRect(10, 36 + stride, 6, 5);
    ctx.fillRect(24, 36 - stride, 6, 5);

    // Broad Torso & Heavy Carapace
    ctx.fillStyle = pal.outline;
    ctx.fillRect(13, 16, 16, 13);
    ctx.fillStyle = pal.flesh;
    ctx.fillRect(14, 17, 14, 11);
    ctx.fillStyle = pal.shadow;
    ctx.fillRect(15, 20, 12, 2);
    ctx.fillRect(15, 23, 12, 2);
    ctx.fillRect(15, 26, 12, 2);

    // Heavy Dorsal Chitin Plates
    ctx.fillStyle = pal.outline;
    ctx.fillRect(11, 11, 7, 7);
    ctx.fillRect(17, 9, 8, 8);
    ctx.fillStyle = pal.base;
    ctx.fillRect(12, 12, 5, 5);
    ctx.fillRect(18, 10, 6, 6);
    ctx.fillStyle = pal.highlight;
    ctx.fillRect(12, 11, 3, 1);
    ctx.fillRect(18, 9, 4, 1);

    // Horned Crest Head
    ctx.fillStyle = pal.outline;
    ctx.fillRect(22, 6, 14, 12);
    ctx.fillRect(25, 2, 5, 5); // tall horn
    ctx.fillStyle = pal.base;
    ctx.fillRect(23, 7, 12, 8);
    ctx.fillRect(26, 3, 3, 4);
    ctx.fillStyle = pal.highlight;
    ctx.fillRect(27, 2, 1, 3);
    ctx.fillStyle = pal.eye;
    ctx.fillRect(29, 10, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(30, 15, 1, 2);
    ctx.fillRect(32, 15, 1, 2);

    // Paired Boneswords
    ctx.fillStyle = pal.outline;
    ctx.fillRect(28, 17, 4, 5);
    ctx.fillRect(31, 13, 4, 18);
    ctx.fillRect(33, 9, 3, 5);
    ctx.fillStyle = pal.talon;
    ctx.fillRect(32, 14, 2, 16);
    ctx.fillRect(34, 10, 1, 4);
    ctx.fillStyle = pal.talonDark;
    ctx.fillRect(31, 15, 1, 14);
  }

  public static draw(
    targetCtx: CanvasRenderingContext2D,
    type: 'hormagaunt' | 'termagant' | 'genestealer' | 'tyranid_warrior' | 'carnifex' | 'zoanthrope' | 'biovore' | 'spore_mine',
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean = false,
    isPouncing: boolean = false,
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    customScale: number = 1.35,
    elapsedTime: number = 0
  ) {
    const frame = Math.floor(Math.abs(walkTimer * 10)) % 4;

    let def = HORMAGAUNT_PXL_DEF;
    if (type === 'termagant') def = TERMAGANT_PXL_DEF;
    else if (type === 'genestealer') def = GENESTEALER_PXL_DEF;
    else if (type === 'tyranid_warrior') def = TYRANID_WARRIOR_PXL_DEF;
    else if (type === 'carnifex') def = CARNIFEX_PXL_DEF;
    else if (type === 'zoanthrope') def = ZOANTHROPE_PXL_DEF;
    else if (type === 'biovore') def = BIOVORE_PXL_DEF;
    else if (type === 'spore_mine') def = SPORE_MINE_PXL_DEF;

    const cached = TyranidPxlCompiler.renderTyranid(def, {
      fleet,
      frame,
      isPouncing,
      isFiring: (type === 'termagant' || type === 'biovore') && frame === 3,
      isSlashing: (type === 'genestealer' || type === 'tyranid_warrior' || type === 'carnifex') && frame === 2,
      isHurt,
      isSynapseActive: type === 'tyranid_warrior' || type === 'zoanthrope',
      elapsedTime
    });

    targetCtx.save();
    targetCtx.imageSmoothingEnabled = false;

    // Harmonize scale factor with Space Marine (scale 1.6 from legacy calls normalizes to 1.35)
    const effScale = customScale === 1.6 ? 1.35 : customScale;
    const drawW = Math.round(cached.width * effScale);
    const drawH = Math.round(cached.height * effScale);
    const px = Math.floor(x);
    const py = Math.floor(y);

    if (facingLeft) {
      targetCtx.translate(px, py);
      targetCtx.scale(-1, 1);
      targetCtx.drawImage(cached, -Math.round(drawW / 2), -Math.round(drawH / 2), drawW, drawH);
    } else {
      targetCtx.drawImage(
        cached,
        px - Math.round(drawW / 2),
        py - Math.round(drawH / 2),
        drawW,
        drawH
      );
    }
    targetCtx.restore();
  }
}

/**
 * High-Impact Multi-Stage Retro Pixel Explosion Renderer
 * Stage 1: White-hot incandescent ignition
 * Stage 2: 8-point stepped fireball burst petals
 * Stage 3: Expanding shockwave smoke ring & crackle ash
 */
export class PixelExplosionRenderer {
  public static draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    lifeRatio: number,
    color: string = '#f97316'
  ) {
    const p = 1.0 - Math.max(0, Math.min(1, lifeRatio));
    const cx = Math.floor(x);
    const cy = Math.floor(y);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Stage 1: White-hot core & flash (0.0 to 0.25)
    if (p < 0.25) {
      const coreR = Math.max(4, Math.floor(radius * 0.5 * (p / 0.25)));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - coreR, cy - coreR, coreR * 2, coreR * 2);

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - coreR - 3, cy - coreR - 3, (coreR + 3) * 2, (coreR + 3) * 2);
    }

    // Stage 2: Radial 8-point stepped fireball petals (0.10 to 0.85)
    if (p >= 0.10 && p <= 0.85) {
      const expand = Math.sin(p * Math.PI);
      const currentR = Math.floor(radius * expand);
      const stepSize = Math.max(4, Math.floor(radius * 0.22));

      const directions = [
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1]
      ];

      for (let i = 0; i < directions.length; i++) {
        const [dx, dy] = directions[i];
        const dist = Math.floor(currentR * 0.75);
        const petalX = cx + dx * dist;
        const petalY = cy + dy * dist;

        ctx.fillStyle = p < 0.45 ? '#fde047' : p < 0.65 ? '#ea580c' : '#dc2626';
        ctx.fillRect(petalX - stepSize / 2, petalY - stepSize / 2, stepSize, stepSize);

        if (p < 0.6) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(petalX - stepSize / 4, petalY - stepSize / 4, stepSize / 2, stepSize / 2);
        }
      }

      // Expanding Shockwave Smoke Ring
      const shockR = Math.floor(radius * (0.3 + p * 0.8));
      ctx.strokeStyle = p < 0.4 ? '#fbbf24' : '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - shockR, cy - shockR, shockR * 2, shockR * 2);
    }

    // Stage 3: Heavy Billowing Soot Smoke & Ash (0.50 to 1.0)
    if (p >= 0.50) {
      const fade = 1.0 - (p - 0.5) / 0.5;
      const smokeR = Math.floor(radius * 0.85);
      const smokeDrift = Math.floor((p - 0.5) * 16);

      ctx.globalAlpha = Math.max(0, fade * 0.85);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - smokeR / 2, cy - smokeR / 2 - smokeDrift, smokeR, smokeR);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - smokeR / 3, cy - smokeR / 3 - smokeDrift, smokeR * 0.66, smokeR * 0.66);

      // Crackling residual sparks
      if (Math.sin(p * 20) > 0) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx + Math.sin(p * 15) * 12, cy + Math.cos(p * 15) * 12 - smokeDrift, 3, 3);
      }
    }

    ctx.restore();
  }
}
