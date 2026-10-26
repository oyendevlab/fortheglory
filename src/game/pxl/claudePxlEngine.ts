/**
 * Claude-PXL Sprite Engine
 * Inspired by crsolver/claude-pxl (ASCII-based pixel art DSL & raster compiler)
 * Provides high-fidelity retro rendering with zero blur, exact palette swaps,
 * dynamic weapon aim-pitch, and micro-integer frame animations.
 */

export interface PxlSpriteDef {
  name: string;
  width: number;
  height: number;
  palette: Record<string, string>;
  swaps?: Record<string, Record<string, string>>;
  matrix: string[];
}

export interface PxlRenderOptions {
  swapKey?: string;
  overrides?: Record<string, string>;
  bobY?: number;
  legShiftLeft?: number;
  legShiftRight?: number;
  pauldronSwayX?: number;
  recoilX?: number;
  aimPitch?: number; // radians (-0.6 to +0.6)
  firePhase?: number; // 0 = idle, 1 = initial blast, 2 = smoke & heat
  isFiring?: boolean;
  hasIronHalo?: boolean;
  shieldPercent?: number;
  isHurt?: boolean;
  isLowHp?: boolean;
  isDashing?: boolean;
  isBraced?: boolean;
  overheatLevel?: number; // 0.0 to 1.0 (sustained fire reactor thermal glow)
  meleeSlashTimer?: number; // active melee swing arc
  idlePulse?: number; // 0.0 to 1.0 breathing & reactor pulse
  role?: string;
  postDecorate?: (ctx: CanvasRenderingContext2D, options: PxlRenderOptions, palette: Record<string, string>) => void;
}

export class PxlEngine {
  private static canvasCache: Map<string, HTMLCanvasElement> = new Map();

  /**
   * Clears the compiled sprite cache
   */
  public static clearCache(): void {
    this.canvasCache.clear();
  }

  /**
   * Checks if a matrix coordinate belongs to the Bolter / weapon group
   */
  private static isBolterPixel(r: number, c: number, tok: string): boolean {
    if (r >= 22 && r <= 32 && c >= 19) {
      if (tok === 'r' || tok === 'R' || tok === 'K' || tok === 'm' || tok === 's' || tok === 'S' || tok === '#') {
        return true;
      }
      if (r >= 24 && r <= 26 && c >= 30 && (tok === 'L' || tok === 'B' || tok === 'b')) {
        return true; // Right hand trigger gauntlet
      }
    }
    return false;
  }

  /**
   * Compiles and renders a PXL definition into an offscreen HTMLCanvasElement
   */
  public static renderToCanvas(
    def: PxlSpriteDef,
    options: PxlRenderOptions = {}
  ): HTMLCanvasElement {
    const {
      swapKey = 'default',
      overrides = {},
      bobY = 0,
      legShiftLeft = 0,
      legShiftRight = 0,
      pauldronSwayX = 0,
      recoilX = 0,
      aimPitch = 0,
      firePhase = 0,
      isFiring = false,
      hasIronHalo = false,
      shieldPercent = 0,
      isHurt = false,
      isLowHp = false,
      isDashing = false,
      isBraced = false,
      overheatLevel = 0,
      meleeSlashTimer = 0,
      idlePulse = 0,
      role = ''
    } = options;

    // Discretize aimPitch to 0.08 rad intervals (~4.5 deg steps) for lightning-fast cache hits
    const pitchStep = Math.round((aimPitch || 0) * 12);
    const heatStep = Math.round(overheatLevel * 4);

    const cacheKey = `${def.name}_${swapKey}_r_${role}_b${bobY}_lL${legShiftLeft}_lR${legShiftRight}_sw${pauldronSwayX}_rc${recoilX}_p${pitchStep}_fp${firePhase}_f${isFiring ? 1 : 0}_h${hasIronHalo ? 1 : 0}_s${Math.round(shieldPercent)}_hurt${isHurt ? 1 : 0}_low${isLowHp ? 1 : 0}_dash${isDashing ? 1 : 0}_brc${isBraced ? 1 : 0}_heat${heatStep}_ml${meleeSlashTimer > 0 ? 1 : 0}_id${Math.round(idlePulse * 2)}_${JSON.stringify(overrides)}`;

    const existing = this.canvasCache.get(cacheKey);
    if (existing) {
      return existing;
    }

    // Build effective color table
    const effectivePalette: Record<string, string> = { ...def.palette };

    // Apply Chapter/Skin swap
    if (def.swaps && def.swaps[swapKey]) {
      Object.assign(effectivePalette, def.swaps[swapKey]);
    }

    // Apply manual runtime overrides
    Object.assign(effectivePalette, overrides);

    // Apply Hurt flash
    if (isHurt) {
      effectivePalette['#'] = '#ffffff';
      effectivePalette['d'] = '#991b1b';
      effectivePalette['b'] = '#b91c1c';
      effectivePalette['B'] = '#ef4444';
      effectivePalette['L'] = '#fca5a5';
      effectivePalette['H'] = '#fecaca';
      effectivePalette['W'] = '#ffffff';
    }

    // Canvas size accommodates sprite + recoil / weapon rotation / muzzle space
    const canvas = document.createElement('canvas');
    canvas.width = def.width + 16;
    canvas.height = def.height + 12;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) {
      return canvas;
    }

    ctx.imageSmoothingEnabled = false;

    // 0. Contact Shadow on ground (dynamic based on leg stance)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    const shadowWidth = (legShiftLeft !== 0 || legShiftRight !== 0) ? def.width - 20 : def.width - 24;
    ctx.fillRect(16, def.height + bobY + 3, shadowWidth, 3);
    ctx.fillRect(18, def.height + bobY + 2, shadowWidth - 4, 1);
    ctx.fillRect(18, def.height + bobY + 6, shadowWidth - 4, 1);

    // Dashing speedlines behind heels
    if (isDashing) {
      ctx.fillStyle = effectivePalette['H'] || '#38bdf8';
      ctx.fillRect(4, def.height + bobY - 2, 8, 2);
      ctx.fillRect(6, def.height + bobY - 6, 6, 2);
      ctx.fillRect(2, def.height + bobY - 12, 10, 1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(8, def.height + bobY - 1, 6, 1);
    }

    // 1. Draw Iron Halo if active
    if (hasIronHalo && shieldPercent > 0) {
      const haloGlow = (idlePulse > 0.5) ? '#ffffff' : (effectivePalette['Y'] || '#ffd15c');
      ctx.fillStyle = haloGlow;
      ctx.fillRect(25 + pauldronSwayX, 2 + bobY, 6, 2);
      ctx.fillRect(22 + pauldronSwayX, 4 + bobY, 3, 2);
      ctx.fillRect(31 + pauldronSwayX, 4 + bobY, 3, 2);
      ctx.fillRect(20 + pauldronSwayX, 6 + bobY, 2, 3);
      ctx.fillRect(34 + pauldronSwayX, 6 + bobY, 2, 3);
      // Halo radiant spikes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(27 + pauldronSwayX, 1 + bobY, 2, 1);
      ctx.fillRect(21 + pauldronSwayX, 3 + bobY, 1, 1);
      ctx.fillRect(34 + pauldronSwayX, 3 + bobY, 1, 1);
      ctx.fillRect(19 + pauldronSwayX, 6 + bobY, 1, 2);
      ctx.fillRect(36 + pauldronSwayX, 6 + bobY, 1, 2);
    }

    // Visor pitch offset (Space Marine head tracking aim angle)
    const visorDy = aimPitch < -0.15 ? -1 : (aimPitch > 0.15 ? 1 : 0);

    // 2. Pass 1: Rasterize Body Pixels (excluding Bolter)
    const matrix = def.matrix;
    const numRows = matrix.length;
    const bolterPixelList: { c: number; r: number; token: string }[] = [];

    for (let r = 0; r < numRows; r++) {
      const rowStr = matrix[r];

      for (let c = 0; c < rowStr.length; c++) {
        const token = rowStr[c];
        if (token === '.' || token === ' ') {
          continue; // Transparent
        }

        // Collect weapon pixels for isolated aim-pitch rotation
        if (this.isBolterPixel(r, c, token)) {
          bolterPixelList.push({ c, r, token });
          continue;
        }

        const color = effectivePalette[token];
        if (!color || color === 'transparent') {
          continue;
        }

        let py = r + bobY + 4;
        let px = c + 6;

        // Visor target tracking pitch
        if (r >= 8 && r <= 11 && c >= 20 && c <= 31) {
          py += visorDy;
        }

        // Apply Pauldron & Torso sway during stride
        if (r >= 8 && r <= 22) {
          px += pauldronSwayX;
        }

        // Apply discrete leg shifts
        if (r >= 40) {
          if (c < 25) {
            // Left Leg
            py += legShiftLeft;
          } else if (c >= 31) {
            // Right Leg
            py += legShiftRight;
          }
        }

        // Tabard / Loincloth sway between legs
        if (r >= 38 && r <= 46 && c >= 25 && c < 31) {
          const tabardSway = (legShiftLeft - legShiftRight) > 0 ? 1 : (legShiftLeft - legShiftRight) < 0 ? -1 : 0;
          px += tabardSway;
        }

        ctx.fillStyle = color;
        ctx.fillRect(px, py, 1, 1);
      }
    }

    // 3. Pass 2: Rasterize Godwyn Bolter & Gauntlets with Dynamic Aim Pitch & Directional Recoil
    const pivotCol = 24;
    const pivotRow = 26;
    const pivotX = pivotCol + 6;
    const pivotY = pivotRow + bobY + 4;
    const gunLength = 26; // Distance from pivot to barrel muzzle

    ctx.save();
    // Directional recoil vector pushes backward opposite to aim pitch
    const recoilDist = recoilX !== 0 ? -Math.abs(recoilX) : (isFiring ? -2.5 : 0);
    const rx = recoilDist * Math.cos(aimPitch);
    const ry = recoilDist * Math.sin(aimPitch);

    ctx.translate(pivotX + rx, pivotY + ry);
    ctx.rotate(aimPitch);

    // Draw all Bolter & gauntlet pixels relative to weapon pivot (pivotCol, pivotRow)
    for (let i = 0; i < bolterPixelList.length; i++) {
      const bp = bolterPixelList[i];
      const color = effectivePalette[bp.token];
      if (!color || color === 'transparent') continue;

      const lx = bp.c - pivotCol;
      const ly = bp.r - pivotRow;
      ctx.fillStyle = color;
      ctx.fillRect(lx, ly, 1, 1);
    }

    // Render Muzzle Flash Burst directly at barrel muzzle tip (gunLength, 0)
    if (isFiring || firePhase > 0) {
      const mx = gunLength;
      const my = 0;

      if (firePhase === 2) {
        // Phase 2: Dissipating orange bloom & smoke puff
        ctx.fillStyle = '#f97316';
        ctx.fillRect(mx + 1, my - 2, 4, 4);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(mx + 2, my - 1, 2, 2);
        // Expanding grey smoke puff rising
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(mx + 4, my - 5, 3, 3);
        ctx.fillRect(mx + 6, my - 7, 2, 2);
      } else {
        // Phase 1 (Initial Blast): High impact directional starburst
        // Piercing forward white core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mx, my - 1, 6, 3);
        ctx.fillRect(mx - 1, my, 8, 1);

        // Radiant golden petal spikes
        ctx.fillStyle = '#fde047';
        ctx.fillRect(mx + 4, my - 2, 3, 1);
        ctx.fillRect(mx + 4, my + 2, 3, 1);
        ctx.fillRect(mx + 6, my - 1, 4, 3);

        // Fiery outer bloom
        ctx.fillStyle = '#f97316';
        ctx.fillRect(mx + 5, my - 3, 2, 1);
        ctx.fillRect(mx + 5, my + 3, 2, 1);
        ctx.fillRect(mx + 9, my, 3, 1);

        // Flying brass bolt shell casing arcing back from ejection port (col 32 -> lx=8, ly=-3)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(8, -6, 2, 1);
        ctx.fillRect(9, -7, 1, 1);
      }
    }

    ctx.restore();

    // 4. Low HP Battle Damage (Smoke puffs & sparks from power pack vents)
    if (isLowHp) {
      // Black smoke puff
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(14, 2 + bobY, 3, 2);
      ctx.fillRect(15, 1 + bobY, 2, 2);
      // Hot spark
      ctx.fillStyle = '#f97316';
      ctx.fillRect(38, 2 + bobY, 1, 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(39, 3 + bobY, 1, 1);
    }

    // 5. Reactor Thermal Overheat Glow (Sustained Bolter barrage)
    if (overheatLevel > 0.35) {
      const heatColor = overheatLevel > 0.75 ? '#ffffff' : '#fef08a';
      ctx.fillStyle = heatColor;
      ctx.fillRect(13, 5 + bobY, 3, 3);
      ctx.fillRect(39, 5 + bobY, 3, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(13, 2 + bobY, 2, 2);
      ctx.fillRect(40, 2 + bobY, 2, 2);
    }

    // 6. Heavy Weapon Braced Anchor Sparks
    if (isBraced) {
      ctx.fillStyle = '#fde047';
      ctx.fillRect(12, def.height + bobY + 1, 2, 2);
      ctx.fillRect(def.width - 6, def.height + bobY + 1, 2, 2);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(11, def.height + bobY + 2, 2, 1);
      ctx.fillRect(def.width - 5, def.height + bobY + 2, 2, 1);
    }

    // 7. Close-Quarter Energized Melee Slash Arc
    if (meleeSlashTimer > 0) {
      const arcProgress = Math.min(1, meleeSlashTimer / 0.16);
      const arcRadius = 26;
      const startAngle = -Math.PI * 0.45 + (1 - arcProgress) * Math.PI * 0.25;
      const endAngle = Math.PI * 0.45;

      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(aimPitch);
      ctx.strokeStyle = effectivePalette['H'] || '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(4, 0, arcRadius, startAngle, endAngle);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(4, 0, arcRadius - 1, startAngle + 0.08, endAngle - 0.08);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(arcRadius * Math.cos(endAngle) + 4, arcRadius * Math.sin(endAngle), 2, 2);
      ctx.fillRect(arcRadius * Math.cos(startAngle) + 4, arcRadius * Math.sin(startAngle), 2, 2);
      ctx.restore();
    }

    // 8. Role-specific accessories / post-decoration
    if (options.postDecorate) {
      options.postDecorate(ctx, options, effectivePalette);
    }

    this.canvasCache.set(cacheKey, canvas);
    return canvas;
  }
}
