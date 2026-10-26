import { MarineChapter, MapTheme, MarineSkin, Projectile, BattleSpeechBubble, MapObstacle } from '../types/game';
import { SpaceMarinePixelArt, TyranidPixelArt, PixelExplosionRenderer } from './pixelPipeline';
import {
  DREADNOUGHT_PXL_DEF,
  SERVO_SKULL_PXL_DEF,
  SENTRY_TURRET_PXL_DEF,
  DROP_POD_PXL_DEF,
  VehiclePxlCompiler
} from './pxl/vehiclePxl';
import { EnvironmentPxlCompiler } from './pxl/environmentPxl';

/**
 * High-Detail Retro Pixel Art Sprite Engine for Warhammer 40k: Space Marine Hive Purge
 * Faithfully designed based on user-provided reference sprites:
 * 1. Chunky arcade Ultramarine with bold black outlines, golden Ultima pauldron, red purity ribbon, and winged Bolter.
 * 2. Tyranid Hormagaunt with pale lilac flesh, dark violet dorsal carapace ridges, and crimson scything talons.
 */

export class PixelRenderer {
  /**
   * Draws the Space Marine protagonist faithfully using the true-pixel 44x48 integer raster engine
   */
  public static drawSpaceMarine(
    ctx: CanvasRenderingContext2D,
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
    SpaceMarinePixelArt.draw(
      ctx,
      x,
      y,
      facingLeft,
      walkTimer,
      isHurt,
      hasIronHalo,
      shieldPercent,
      chapter,
      skin,
      isFiring,
      undefined,
      1.35,
      isMoving,
      elapsedTime,
      isLowHp,
      isDashing,
      aimAngle,
      turnSquashTimer,
      isBraced,
      overheatLevel,
      meleeSlashTimer
    );
  }

  /**
   * Draws Hormagaunt faithfully based on Image 2 reference
   * (Pale lilac flesh, violet segmented dorsal ridges, crimson scything talons)
   */
  public static drawHormagaunt(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean,
    isPouncing: boolean = false,
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    elapsedTime: number = 0
  ) {
    TyranidPixelArt.draw(ctx, "hormagaunt", x, y, facingLeft, walkTimer, isHurt, isPouncing, fleet, 1.35, elapsedTime);
  }

  /**
   * Draws Termagant with Fleshborer bio-cannon
   */
  public static drawTermagant(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean,
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    elapsedTime: number = 0
  ) {
    TyranidPixelArt.draw(ctx, "termagant", x, y, facingLeft, walkTimer, isHurt, false, fleet, 1.35, elapsedTime);
  }

  /**
   * Draws Genestealer with Quad Rending Claws
   */
  public static drawGenestealer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean,
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    elapsedTime: number = 0
  ) {
    TyranidPixelArt.draw(ctx, "genestealer", x, y, facingLeft, walkTimer, isHurt, false, fleet, 1.35, elapsedTime);
  }

  /**
   * Draws Tyranid Warrior Bio-Commander
   */
  public static drawTyranidWarrior(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean,
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    elapsedTime: number = 0
  ) {
    TyranidPixelArt.draw(ctx, "tyranid_warrior", x, y, facingLeft, walkTimer, isHurt, false, fleet, 1.35, elapsedTime);
  }

  /**
   * Draws High-Impact Multi-Stage Retro Pixel Explosion
   */
  public static drawPixelExplosion(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    lifeRatio: number,
    color?: string
  ) {
    PixelExplosionRenderer.draw(ctx, x, y, radius, lifeRatio, color);
  }

  /**
   * Draws Carnifex Boss (Giant Living Tank Behemoth)
   */
  public static drawCarnifex(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean,
    isCharging: boolean = false,
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    elapsedTime: number = 0
  ) {
    TyranidPixelArt.draw(ctx, "carnifex", x, y, facingLeft, walkTimer * (isCharging ? 2 : 1), isHurt, isCharging, fleet, 2.1, elapsedTime);
  }

  /**
   * Draws Hive City procedural gothic ground tile
   */
  public static drawGothicTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number,
    tileX: number,
    tileY: number
  ) {
    const hash = Math.abs((tileX * 73856093) ^ (tileY * 19349663)) % 100;

    // Base dark industrial floor
    ctx.fillStyle = '#0f141f';
    ctx.fillRect(x, y, tileSize, tileSize);

    // Heavy metal joints
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);

    // Tile variations
    if (hash < 25) {
      // Gothic pavement stones with cross motif
      ctx.fillStyle = '#161e2e';
      ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
      ctx.strokeStyle = '#0b0f19';
      ctx.strokeRect(x + 8, y + 8, tileSize - 16, tileSize - 16);
    } else if (hash < 40) {
      // Industrial vent grating
      ctx.fillStyle = '#141b29';
      ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
      ctx.fillStyle = '#090d16';
      for (let i = 8; i < tileSize - 8; i += 6) {
        ctx.fillRect(x + i, y + 8, 2, tileSize - 16);
      }
    } else if (hash < 55) {
      // Hazard diagonal yellow/black stripe plate
      ctx.fillStyle = '#182030';
      ctx.fillRect(x + 6, y + 6, tileSize - 12, tileSize - 12);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 20);
      ctx.lineTo(x + 20, y + 6);
      ctx.moveTo(x + 6, y + 36);
      ctx.lineTo(x + 36, y + 6);
      ctx.stroke();
    } else if (hash === 99) {
      // Imperial Skull Relic embedded in floor
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.beginPath();
      ctx.arc(x + tileSize / 2, y + tileSize / 2 - 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + tileSize / 2 - 4, y + tileSize / 2 + 3, 8, 5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + tileSize / 2 - 3, y + tileSize / 2 - 3, 2, 2);
      ctx.fillRect(x + tileSize / 2 + 1, y + tileSize / 2 - 3, 2, 2);
    }
  }

  /**
   * Draws Tyranid Biomass Spore drops in Claude-PXL
   */
  public static drawBiomassSpore(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tier: 1 | 2 | 3,
    timer: number
  ) {
    const pulse = (Math.sin(timer * 8) + 1) * 0.5;
    const cached = EnvironmentPxlCompiler.renderSpore(tier, pulse);
    const bob = Math.sin(timer * 6 + x) * 2;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cached, Math.floor(x) - Math.round(cached.width / 2), Math.floor(y + bob) - Math.round(cached.height / 2));
    ctx.restore();
  }

  /**
   * Draws Imperial Relic Chest in Claude-PXL with beacon beam
   */
  public static drawRelicChest(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    timer: number
  ) {
    const pulse = Math.sin(timer * 6) * 2;
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Vertical Golden Beacon Beam to the sky
    const beamGrad = ctx.createLinearGradient(0, 0, 0, -320);
    beamGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
    beamGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.15)');
    beamGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(-8 - pulse * 0.5, -320, 16 + pulse, 320);

    // Glowing core line
    ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
    ctx.fillRect(-2, -320, 4, 320);
    ctx.restore();

    // Render Claude-PXL Casket
    const cached = EnvironmentPxlCompiler.renderChest(timer);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cached, Math.floor(x) - Math.round(cached.width / 2), Math.floor(y) - Math.round(cached.height / 2));
    ctx.restore();
  }

  /**
   * Draws Support Servo-Skull Companion in Claude-PXL
   */
  public static drawServoSkull(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    hoverAngle: number,
    isZapping: boolean
  ) {
    const cached = VehiclePxlCompiler.renderVehicle(SERVO_SKULL_PXL_DEF, {
      isFiring: isZapping
    });

    const bob = Math.sin(hoverAngle * 6) * 3;
    const px = Math.floor(x);
    const py = Math.floor(y + bob);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cached, px - Math.round(cached.width / 2), py - Math.round(cached.height / 2));

    // Target laser designator beam
    if (isZapping) {
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + 4, py);
      ctx.lineTo(px + 120, py + 25);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Draws persistent blood splatter decal on the floor
   */
  public static drawBloodDecal(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(Math.floor(x), Math.floor(y), size, size * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    // Splat satellite dots
    ctx.fillRect(Math.floor(x + size * 0.7), Math.floor(y - size * 0.4), 2, 2);
    ctx.fillRect(Math.floor(x - size * 0.8), Math.floor(y + size * 0.3), 2.5, 2.5);
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  /**
   * Draws tumbling sharp chitin fragments
   */
  public static drawChitinFragment(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rot: number,
    size: number,
    color: string,
    alpha: number
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.rotate(rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-size / 2 - 1, -size / 2 - 1, size + 2, size + 2);
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  /**
   * Zoanthrope: Floating psychic brain beast with warp distortion shield in Claude-PXL
   */
  public static drawZoanthrope(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    animTimer: number,
    isHurt: boolean,
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    elapsedTime: number = 0
  ) {
    const floatY = Math.sin(animTimer * 5) * 4;
    TyranidPixelArt.draw(ctx, "zoanthrope", x, y + floatY, facingLeft, animTimer, isHurt, false, fleet, 1.45, elapsedTime);

    // Dynamic Warp Shield
    ctx.save();
    ctx.strokeStyle = `rgba(34, 211, 238, ${0.45 + Math.sin(animTimer * 10) * 0.25})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(Math.floor(x), Math.floor(y + floatY), 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Hive Tyrant: Supreme Tyranid warlord with crown crest, Venom Cannon & twin Boneswords
   */
  public static drawHiveTyrant(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    animTimer: number,
    isHurt: boolean
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (facingLeft) ctx.scale(-1, 1);

    const p = 2.4; // Colossal boss scale
    const breath = Math.sin(animTimer * 4) * 2;
    const tailSwing = Math.sin(animTimer * 6) * 6;

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 22 * p, 28 * p, 8 * p, 0, 0, Math.PI * 2);
    ctx.fill();

    const black = '#090d16';
    const tyrantLilac = isHurt ? '#ef4444' : '#f3e8ff';
    const darkPurple = isHurt ? '#991b1b' : '#3b0764';
    const boneRed = '#dc2626';
    const venomGreen = '#22c55e';

    // Thick Spiked Tail
    ctx.fillStyle = black;
    ctx.fillRect((-22 + tailSwing) * p, 6 * p, 18 * p, 8 * p);
    ctx.fillStyle = darkPurple;
    ctx.fillRect((-21 + tailSwing) * p, 7 * p, 16 * p, 6 * p);

    // Heavy Hoofed Legs
    ctx.fillStyle = black;
    ctx.fillRect(-16 * p, 8 * p, 11 * p, 16 * p);
    ctx.fillRect(4 * p, 8 * p, 11 * p, 16 * p);
    ctx.fillStyle = darkPurple;
    ctx.fillRect(-14 * p, 10 * p, 8 * p, 13 * p);
    ctx.fillRect(6 * p, 10 * p, 8 * p, 13 * p);

    // Massive Muscular Torso with Chitin Carapace
    ctx.fillStyle = black;
    ctx.fillRect(-15 * p, (-10 + breath) * p, 30 * p, 20 * p);
    ctx.fillStyle = tyrantLilac;
    ctx.fillRect(-13 * p, (-8 + breath) * p, 26 * p, 16 * p);

    // Serrated Carapace Plating
    ctx.fillStyle = darkPurple;
    ctx.fillRect(-12 * p, (-14 + breath) * p, 22 * p, 6 * p);
    ctx.fillRect(-10 * p, (-18 + breath) * p, 18 * p, 5 * p);

    // Spore Chimneys on Back
    ctx.fillStyle = black;
    ctx.fillRect(-14 * p, (-24 + breath) * p, 5 * p, 12 * p);
    ctx.fillRect(-8 * p, (-26 + breath) * p, 5 * p, 14 * p);
    ctx.fillStyle = venomGreen;
    ctx.fillRect(-13 * p, (-25 + breath) * p, 3 * p, 3 * p);
    ctx.fillRect(-7 * p, (-27 + breath) * p, 3 * p, 3 * p);

    // Head with Crowned Horn Crest
    ctx.fillStyle = black;
    ctx.fillRect(-2 * p, (-26 + breath) * p, 20 * p, 16 * p);
    ctx.fillStyle = darkPurple;
    ctx.fillRect(0, (-25 + breath) * p, 16 * p, 13 * p);
    // Horn Crown spikes
    ctx.fillRect(10 * p, (-32 + breath) * p, 6 * p, 8 * p);
    ctx.fillRect(3 * p, (-30 + breath) * p, 5 * p, 6 * p);
    // Glowing red eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(10 * p, (-21 + breath) * p, 4 * p, 3 * p);

    // Upper Left Arm: Heavy Venom Cannon
    ctx.fillStyle = black;
    ctx.fillRect(6 * p, (-4 + breath) * p, 22 * p, 8 * p);
    ctx.fillStyle = darkPurple;
    ctx.fillRect(8 * p, (-3 + breath) * p, 18 * p, 6 * p);
    // Glowing Venom Cannon nozzle
    ctx.fillStyle = venomGreen;
    ctx.fillRect(24 * p, (-4 + breath) * p, 6 * p, 8 * p);

    // Lower Arms: Twin Glowing Boneswords
    ctx.fillStyle = black;
    ctx.fillRect(14 * p, (6 + breath) * p, 18 * p, 4 * p);
    ctx.fillRect(-14 * p, (4 + breath) * p, 16 * p, 4 * p);
    ctx.fillStyle = boneRed;
    ctx.fillRect(15 * p, (7 + breath) * p, 16 * p, 2.5 * p);
    ctx.fillRect(-13 * p, (5 + breath) * p, 14 * p, 2.5 * p);

    ctx.restore();
  }

  /**
   * Promethium Fuel Barrel: Explodes into huge fireball when shot in Claude-PXL
   */
  public static drawPromethiumBarrel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    hpRatio: number,
    isTriggered: boolean
  ) {
    const cached = EnvironmentPxlCompiler.renderBarrel(hpRatio, isTriggered);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cached, Math.floor(x) - Math.round(cached.width / 2), Math.floor(y) - Math.round(cached.height / 2));
    ctx.restore();
  }

  /**
   * Tarantula Automated Sentry Turret in Claude-PXL
   */
  public static drawSentryTurret(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isActive: boolean,
    targetAngle: number,
    shootTimer: number
  ) {
    const cached = VehiclePxlCompiler.renderVehicle(SENTRY_TURRET_PXL_DEF, {
      isFiring: shootTimer > 0
    });

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cached, Math.floor(x) - Math.round(cached.width / 2), Math.floor(y) - Math.round(cached.height / 2));

    // Muzzle flash on active fire
    if (isActive && shootTimer < 0.05) {
      ctx.save();
      ctx.fillStyle = '#fde047';
      const fx = Math.floor(x + Math.cos(targetAngle) * 20);
      const fy = Math.floor(y + Math.sin(targetAngle) * 20);
      ctx.fillRect(fx - 3, fy - 3, 6, 6);
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Draws tactical battlefield beacons: Dreadnought Drop Pod, Orbital Uplink, and Squad Distress Beacon
   */
  public static drawTacticalBeacon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: 'dreadnought_pod' | 'orbital_beacon' | 'squad_beacon',
    time: number
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    const p = 1.6;

    if (type === 'dreadnought_pod') {
      // Castraferrum Drop Pod with burning landing thrusters and open assault ramp
      const pulse = Math.sin(time * 6) * 3;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 12 * p, 24 * p, 8 * p, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-18 * p, -24 * p, 36 * p, 34 * p);
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-16 * p, -22 * p, 32 * p, 30 * p);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-14 * p, -20 * p, 28 * p, 3 * p);
      ctx.fillRect(-4 * p, -14 * p, 8 * p, 6 * p);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(-6 * p, -4 * p, 12 * p, 14 * p);

      ctx.font = 'bold 12px "VT323", monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText('[NAIKI DREADNOUGHT]', 0, -30 * p + pulse);
    } else if (type === 'orbital_beacon') {
      const beamAlpha = 0.5 + Math.sin(time * 8) * 0.3;
      ctx.strokeStyle = `rgba(239, 68, 68, ${beamAlpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -600);
      ctx.stroke();

      ctx.fillStyle = '#090d16';
      ctx.fillRect(-8 * p, -6 * p, 16 * p, 14 * p);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-6 * p, -4 * p, 12 * p, 10 * p);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-2 * p, -2 * p, 4 * p, 4 * p);

      ctx.font = 'bold 12px "VT323", monospace';
      ctx.fillStyle = '#f87171';
      ctx.textAlign = 'center';
      ctx.fillText('[ORBITAL STRIKE]', 0, -18 * p);
    } else if (type === 'squad_beacon') {
      const pulse = Math.sin(time * 5) * 4;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-8 * p, -8 * p, 16 * p, 16 * p);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-6 * p, -6 * p, 12 * p, 12 * p);
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(0, 0, 4 + pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 12px "VT323", monospace';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.fillText('[PANGGIL SKUAD AI]', 0, -18 * p);
    }

    ctx.restore();
  }

  /**
   * Draws dynamic tile patterns for the 3 Map Themes:
   * 1. hive_city (Gothic flagstones and ruined pavement)
   * 2. space_hulk (Steel grating deck, warning lines, coolant pipes)
   * 3. bio_chasm (Alien pulsating creep floor, toxic veins, acid seepage)
   */
  public static drawMapFloor(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    width: number,
    height: number,
    theme: MapTheme = 'hive_city'
  ) {
    const tileSize = 64;
    const startX = Math.floor((camX - width / 2) / tileSize) * tileSize;
    const endX = Math.ceil((camX + width / 2) / tileSize) * tileSize;
    const startY = Math.floor((camY - height / 2) / tileSize) * tileSize;
    const endY = Math.ceil((camY + height / 2) / tileSize) * tileSize;

    for (let x = startX; x <= endX; x += tileSize) {
      for (let y = startY; y <= endY; y += tileSize) {
        const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
        const variant = Math.floor(hash * 10) % 4;

        if (theme === 'space_hulk') {
          // Metal deck plates with rivets
          ctx.fillStyle = variant === 0 ? '#0f172a' : '#1e293b';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, tileSize, tileSize);
          // Rivets in corners
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x + 3, y + 3, 3, 3);
          ctx.fillRect(x + tileSize - 6, y + 3, 3, 3);
          ctx.fillRect(x + 3, y + tileSize - 6, 3, 3);
          ctx.fillRect(x + tileSize - 6, y + tileSize - 6, 3, 3);
          if (variant === 3) {
            // Hazard stripe warning line
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(x + 8, y + 28, 48, 6);
          }
        } else if (theme === 'bio_chasm') {
          // Alien creep & acid veins
          ctx.fillStyle = variant === 0 ? '#2e1065' : (variant === 1 ? '#3b0764' : '#1e1b4b');
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#581c87';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);
          if (variant === 2) {
            ctx.fillStyle = '#84cc16';
            ctx.beginPath();
            ctx.arc(x + 32, y + 32, 7, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (theme === 'mechanicus_forge') {
          // Adeptus Mechanicus Crimson Mars Iron Plating & Promethium Conduits
          ctx.fillStyle = variant === 0 ? '#240c11' : variant === 1 ? '#1b0b10' : '#160d14';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#4c1d24';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(x, y, tileSize, tileSize);
          // Brass corner bolts
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x + 3, y + 3, 2.5, 2.5);
          ctx.fillRect(x + tileSize - 5.5, y + tileSize - 5.5, 2.5, 2.5);
          if (variant === 2) {
            // Glowing promethium magma trench grate
            ctx.fillStyle = '#431407';
            ctx.fillRect(x + 10, y + 26, 44, 12);
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(x + 13, y + 29, 38, 6);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(x + 18, y + 31, 28, 2);
          } else if (variant === 3) {
            // Subtle Cog Mechanicum floor stamp
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.28)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + 32, y + 32, 10, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else if (theme === 'strike_cruiser') {
          // Space Marine Strike Cruiser Interior: Steel Deck Plates & Warning Chevrons
          ctx.fillStyle = variant === 0 ? '#0b1329' : variant === 1 ? '#091024' : '#0e172e';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(x, y, tileSize, tileSize);
          // Rivets on corners
          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 4, y + 4, 2, 2);
          ctx.fillRect(x + tileSize - 6, y + tileSize - 6, 2, 2);
          if (variant === 2) {
            // Yellow Hazard Caution Striping
            ctx.fillStyle = '#713f12';
            ctx.fillRect(x + 6, y + 28, 52, 8);
            ctx.fillStyle = '#eab308';
            ctx.fillRect(x + 8, y + 29, 10, 6);
            ctx.fillRect(x + 24, y + 29, 10, 6);
            ctx.fillRect(x + 40, y + 29, 10, 6);
          } else if (variant === 3) {
            // Blue energy conduit line
            ctx.fillStyle = '#0369a1';
            ctx.fillRect(x + 30, y + 4, 4, 56);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(x + 31, y + 10, 2, 44);
          }
        } else {
          // Default: Imperial Hive City Gothic Stone
          ctx.fillStyle = variant === 0 ? '#090d16' : (variant === 1 ? '#0c121e' : '#0f172a');
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);
          if (variant === 2) {
            // Sewer drain grate
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x + 22, y + 22, 20, 20);
            ctx.fillStyle = '#090d16';
            ctx.fillRect(x + 25, y + 25, 14, 14);
          }
        }
      }
    }
  }

  /**
   * Draws battlefield structures & cover obstacles matching the active map theme
   */
  public static drawMapObstacle(
    ctx: CanvasRenderingContext2D,
    obs: MapObstacle,
    time: number
  ) {
    ctx.save();
    ctx.translate(Math.floor(obs.x), Math.floor(obs.y));
    const r = obs.radius;

    if (obs.variant === 'crater') {
      // Blasted Artillery Crater (non-blocking ground structure)
      ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(249, 115, 22, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 2, r * 0.45, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (obs.variant === 'acid_pool') {
      // Tyranid Bio-Acid Pool
      const pulse = Math.sin(time * 4 + obs.x) * 3;
      ctx.fillStyle = 'rgba(132, 204, 22, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 0, r + pulse, (r + pulse) * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Shadow for solid structures
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.65, r * 1.05, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    if (obs.variant === 'pillar') {
      // Gothic Cathedral Ruined Pillar
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-r, -r * 1.15, r * 2, r * 1.85);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-r + 3, -r * 1.1, r * 2 - 6, r * 1.75);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-r + 6, -r * 1.05, r * 2 - 12, r * 0.45);
      // Golden Imperial Aquila trim
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-r + 5, -r * 0.35, r * 2 - 10, 5);
      ctx.fillRect(-4, -r * 0.5, 8, 12);
    } else if (obs.variant === 'barricade') {
      // Imperial Aegis Ferrocrete Barricade Wall (Tactical Cover)
      const w = r * 1.35;
      const h = r * 0.85;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-w, -h, w * 2, h * 1.7);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-w + 3, -h + 3, w * 2 - 6, h * 1.7 - 6);
      // Hazard yellow/black chevron strip
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-w + 6, -h + 6, w * 2 - 12, 6);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-w * 0.6, -2, w * 1.2, 8);
    } else if (obs.variant === 'statue') {
      // Imperial Sanctum Brazier / Monolith Pedestal (Interactive Shrine)
      const shrinePct = obs.shrineProgress || 0;
      const isBlessed = !!obs.blessed;
      ctx.strokeStyle = isBlessed ? 'rgba(16, 185, 129, 0.5)' : 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (shrinePct > 0 && !isBlessed) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, r + 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, shrinePct));
        ctx.stroke();
      }

      ctx.fillStyle = '#090d16';
      ctx.fillRect(-r * 0.9, -r * 1.2, r * 1.8, r * 1.9);
      ctx.fillStyle = isBlessed ? '#065f46' : '#1e3a8a';
      ctx.fillRect(-r * 0.8, -r * 1.1, r * 1.6, r * 1.7);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-r * 0.55, -r * 0.9, r * 1.1, r * 0.5);
      // Burning holy brazier flame on top
      const flicker = Math.sin(time * 12 + obs.y) * 3;
      ctx.fillStyle = isBlessed ? '#34d399' : '#f97316';
      ctx.beginPath();
      ctx.arc(0, -r * 1.05, 8 + flicker * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -r * 1.05, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.variant === 'bulkhead') {
      // Space Hulk Armored Steel Column
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-r, -r, r * 2, r * 1.7);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-r + 3, -r + 3, r * 2 - 6, r * 1.7 - 6);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-r + 6, -r + 6, r * 2 - 12, r * 1.7 - 12);
    } else if (obs.variant === 'plasma_core') {
      // Space Hulk Glowing Plasma Pylon (Destructible EMP Core)
      const glow = 0.65 + Math.sin(time * 8) * 0.25;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = `rgba(56, 189, 248, ${glow})`;
      ctx.beginPath();
      ctx.arc(0, -4, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.variant === 'spore_tower') {
      // Tyranid Capillary Spore Chimney (Destructible Bio-Tower)
      const pulse = Math.sin(time * 6 + obs.x) * 2;
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.arc(0, 0, r + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(-6, -6, r * 0.32, 0, Math.PI * 2);
      ctx.arc(7, 4, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.variant === 'tech_shrine') {
      // Mars Tech-Shrine (Omnissiah Weapon Forge Altar)
      const shrinePct = obs.shrineProgress || 0;
      const isBlessed = !!obs.blessed;
      ctx.strokeStyle = isBlessed ? 'rgba(16, 185, 129, 0.55)' : 'rgba(239, 68, 68, 0.65)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (shrinePct > 0 && !isBlessed) {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, r + 36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, shrinePct));
        ctx.stroke();
      }

      // Crimson Mechanicus Anvil Base
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-r, -r * 1.1, r * 2, r * 1.8);
      ctx.fillStyle = isBlessed ? '#065f46' : '#991b1b';
      ctx.fillRect(-r + 3, -r * 1.05, r * 2 - 6, r * 1.7);
      // Brass Trim
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-r + 4, -r * 0.95, r * 2 - 8, 5);
      ctx.fillRect(-r + 4, r * 0.45, r * 2 - 8, 5);

      // Rotating Cog-Mechanicum Halo
      ctx.save();
      ctx.translate(0, -r * 0.25);
      ctx.rotate(time * (isBlessed ? 0.6 : 1.8));
      ctx.strokeStyle = isBlessed ? '#34d399' : '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
      ctx.stroke();
      for (let c = 0; c < 8; c++) {
        const a = (c * Math.PI) / 4;
        ctx.fillStyle = isBlessed ? '#34d399' : '#fbbf24';
        ctx.fillRect(Math.cos(a) * r * 0.55 - 2.5, Math.sin(a) * r * 0.55 - 2.5, 5, 5);
      }
      ctx.restore();

      // Omnissiah Core Spark
      ctx.fillStyle = isBlessed ? '#6ee7b7' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -r * 0.25, 5 + Math.sin(time * 10) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.variant === 'cruiser_console') {
      PixelRenderer.drawCruiserConsole(ctx, 0, 0, obs.hp, obs.maxHp, obs.shrineProgress || 0);
    } else if (obs.variant === 'tech_priest') {
      PixelRenderer.drawTechPriest(ctx, 0, 0, false, time);
    }

    // Draw HP bar if destructible obstacle was damaged
    if (obs.hp !== undefined && obs.maxHp && obs.hp < obs.maxHp) {
      const bw = r * 1.8;
      const pct = Math.max(0, obs.hp / obs.maxHp);
      ctx.fillStyle = '#020617';
      ctx.fillRect(-bw / 2 - 1, -r - 12, bw + 2, 5);
      ctx.fillStyle = obs.variant === 'plasma_core' ? '#38bdf8' : '#a855f7';
      ctx.fillRect(-bw / 2, -r - 11, bw * pct, 3);
    }

    ctx.restore();
  }

  public static drawBiovore(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean,
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    elapsedTime: number = 0
  ) {
    TyranidPixelArt.draw(ctx, "biovore", x, y, facingLeft, walkTimer, isHurt, false, fleet, 1.35, elapsedTime);
  }

  public static drawSporeMine(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    walkTimer: number,
    isHurt: boolean,
    fleet: 'leviathan' | 'kraken' | 'behemoth' = 'leviathan',
    elapsedTime: number = 0
  ) {
    const bob = Math.sin(walkTimer * 8) * 3;
    TyranidPixelArt.draw(ctx, "spore_mine", x, y + bob, false, walkTimer, isHurt, false, fleet, 1.25, elapsedTime);
  }

  public static drawAfterimage(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.45));
    ctx.translate(x, y);
    if (facingLeft) ctx.scale(-1, 1);
    const p = 1.6;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-12 * p, -28 * p, 24 * p, 20 * p);
    ctx.fillRect(-8 * p, -8 * p, 16 * p, 24 * p);
    ctx.restore();
  }

  /**
   * Castraferrum Pattern Dreadnought Combat Walker in Claude-PXL
   */
  public static drawDreadnought(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isFiring: boolean,
    chapter: MarineChapter = 'ultramarines',
    elapsedTime: number = 0
  ) {
    const cached = VehiclePxlCompiler.renderVehicle(DREADNOUGHT_PXL_DEF, {
      chapter,
      isFiring,
      walkTimer,
      elapsedTime
    });

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const effScale = 1.35;
    const drawW = Math.round(cached.width * effScale);
    const drawH = Math.round(cached.height * effScale);
    const px = Math.floor(x);
    const py = Math.floor(y);

    if (facingLeft) {
      ctx.translate(px, py);
      ctx.scale(-1, 1);
      ctx.drawImage(cached, -Math.round(drawW / 2), -Math.round(drawH / 2), drawW, drawH);
    } else {
      ctx.drawImage(cached, px - Math.round(drawW / 2), py - Math.round(drawH / 2), drawW, drawH);
    }
    ctx.restore();
  }

  /**
   * Apothecary Battle-Brother (Medic Space Marine Companion)
   * Pristine white ceramite power armour, Red Prime Helix pauldron, Narthecium reductor, and healing aura
   */
  public static drawApothecary(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    auraPulse: number
  ) {
    // 1. Nanite Healing Aura on Ground
    ctx.save();
    ctx.strokeStyle = "rgba(34, 197, 94, 0.65)";
    ctx.fillStyle = "rgba(34, 197, 94, 0.12)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(x, y, 70 + Math.sin(auraPulse * 4) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    SpaceMarinePixelArt.draw(
      ctx,
      x,
      y,
      facingLeft,
      walkTimer,
      false,
      false,
      0,
      "ultramarines",
      "standard",
      false,
      "apothecary",
      1.6
    );
  }

  /**
   * Devastator Battle-Brother (Heavy Weapon Support Marine)
   * Heavy Bolter with reinforced ceramite, ammunition feed belt, and heavy recoil stance
   */
  public static drawDevastator(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isShooting: boolean
  ) {
    SpaceMarinePixelArt.draw(
      ctx,
      x,
      y,
      facingLeft,
      walkTimer,
      false,
      false,
      0,
      "ultramarines",
      "standard",
      isShooting,
      "devastator",
      1.6
    );
  }

  /**
   * Librarian Battle-Brother (Psyker Space Marine Companion)
   * Warp-blue ceramite, Psychic Hood, Force Staff, and ground warp aura
   */
  public static drawLibrarian(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number
  ) {
    // Warp aura glow on ground
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
    ctx.fillStyle = "rgba(56, 189, 248, 0.14)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, 65 + Math.sin(walkTimer * 5) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    SpaceMarinePixelArt.draw(
      ctx,
      x,
      y,
      facingLeft,
      walkTimer,
      false,
      false,
      0,
      "ultramarines",
      "standard",
      false,
      "librarian",
      1.6
    );
  }

  /**
   * Techmarine Battle-Brother (Mechanicus Space Marine Companion)
   * Mars red ceramite, Cog-Mechanicum insignia, articulated hydraulic Servo-Arm
   */
  public static drawTechmarine(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number
  ) {
    SpaceMarinePixelArt.draw(
      ctx,
      x,
      y,
      facingLeft,
      walkTimer,
      false,
      false,
      0,
      "ultramarines",
      "standard",
      false,
      "techmarine",
      1.6
    );
  }

  /**
   * Toxicrene Elite Bio-Monster (Choking Spore Aura & Whipping Feeder-Tentacles)
   */
  public static drawToxicrene(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean
  ) {
    // Choking Toxic Spore Aura Circle
    ctx.save();
    const miasmaPulse = Math.sin(walkTimer * 5) * 5;
    ctx.fillStyle = 'rgba(132, 204, 22, 0.11)';
    ctx.strokeStyle = 'rgba(163, 230, 53, 0.42)';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(x, y, 78 + miasmaPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (facingLeft) ctx.scale(-1, 1);

    const p = 1.7;
    const black = '#090d16';
    const carapace = isHurt ? '#ffffff' : '#3b0764';
    const flesh = isHurt ? '#fca5a5' : '#65a30d';
    const venom = '#bef264';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 16 * p, 20 * p, 7 * p, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 Whipping Hypertrophied Lash Tentacles Extending Forward
    ctx.strokeStyle = isHurt ? '#ffffff' : '#84cc16';
    ctx.lineWidth = 3.5;
    for (let t = -1.5; t <= 1.5; t += 1) {
      const wave = Math.sin(walkTimer * 9 + t * 1.4) * 7;
      ctx.beginPath();
      ctx.moveTo(8 * p, t * 4 * p);
      ctx.quadraticCurveTo(20 * p, (t * 6 + wave * 0.4) * p, 30 * p, (t * 8 + wave * 0.6) * p);
      ctx.stroke();
    }

    // Hulking Carapace & Dorsal Spore Chimneys
    ctx.fillStyle = black;
    ctx.fillRect(-18 * p, -12 * p, 34 * p, 24 * p);
    ctx.fillStyle = carapace;
    ctx.fillRect(-16 * p, -10 * p, 30 * p, 20 * p);
    ctx.fillStyle = flesh;
    ctx.fillRect(-12 * p, 2 * p, 24 * p, 7 * p);

    // Glowing Venom Sacs on Back
    ctx.fillStyle = venom;
    ctx.beginPath();
    ctx.arc(-8 * p, -12 * p, 5 * p, 0, Math.PI * 2);
    ctx.arc(2 * p, -13 * p, 6 * p, 0, Math.PI * 2);
    ctx.arc(11 * p, -11 * p, 4.5 * p, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Trygon Prime Subterranean Bio-Titan Boss
   */
  public static drawTrygonPrime(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean,
    isEnraged: boolean,
    burrowState: 'surface' | 'burrowed' = 'surface',
    burrowTargetX?: number,
    burrowTargetY?: number
  ) {
    if (burrowState === 'burrowed') {
      // Subterranean Rumbling Dust Mound at current burrow origin + Red Seismic Telegraph at Target!
      const tx = burrowTargetX ?? x;
      const ty = burrowTargetY ?? y;
      ctx.save();
      const pulse = 0.55 + Math.sin(walkTimer * 18) * 0.35;
      ctx.fillStyle = `rgba(239, 68, 68, ${0.16 * pulse})`;
      ctx.strokeStyle = `rgba(248, 113, 113, ${0.9 * pulse})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(tx, ty, 92, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tx, ty, 52 + Math.sin(walkTimer * 14) * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#fecaca';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ SEISMIC ERUPTION!', tx, ty - 6);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (facingLeft) ctx.scale(-1, 1);

    const p = 2.05;
    const slither = Math.sin(walkTimer * 8) * 3;
    const black = '#090d16';
    const chitin = isHurt ? '#ffffff' : isEnraged ? '#991b1b' : '#4c1d95';
    const chitinLight = isHurt ? '#fecaca' : isEnraged ? '#ef4444' : '#7e22ce';
    const flesh = isHurt ? '#ffffff' : '#c084fc';
    const bioVolt = isEnraged ? '#fbbf24' : '#38bdf8';

    // Ground fissure shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 18 * p, 24 * p, 9 * p, 0, 0, Math.PI * 2);
    ctx.fill();

    // Coiled Serpentine Tail
    ctx.fillStyle = black;
    ctx.fillRect(-24 * p, (4 + slither * 0.4) * p, 22 * p, 12 * p);
    ctx.fillStyle = flesh;
    ctx.fillRect(-22 * p, (6 + slither * 0.4) * p, 18 * p, 8 * p);
    // Tail rattle spike
    ctx.fillStyle = bioVolt;
    ctx.fillRect(-29 * p, (6 + slither * 0.5) * p, 6 * p, 5 * p);

    // Towering Serpentine Thorax
    ctx.fillStyle = black;
    ctx.fillRect(-12 * p, -22 * p, 24 * p, 34 * p);
    ctx.fillStyle = chitin;
    ctx.fillRect(-10 * p, -20 * p, 20 * p, 30 * p);
    ctx.fillStyle = chitinLight;
    ctx.fillRect(-8 * p, -18 * p, 10 * p, 24 * p);

    // 6 Massive Scything Talons (3 pairs)
    for (let row = -1; row <= 1; row++) {
      const yOff = row * 7 - 4;
      const swing = Math.sin(walkTimer * 10 + row) * 2;
      ctx.fillStyle = black;
      ctx.fillRect(8 * p, (yOff + swing) * p, 16 * p, 5 * p);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(9 * p, (yOff + 1 + swing) * p, 14 * p, 3 * p);
    }

    // Crowned Bio-Electric Crest & Mandibles
    ctx.fillStyle = black;
    ctx.fillRect(-9 * p, -30 * p, 22 * p, 11 * p);
    ctx.fillStyle = chitinLight;
    ctx.fillRect(-7 * p, -28 * p, 18 * p, 8 * p);
    ctx.fillStyle = bioVolt;
    ctx.fillRect(5 * p, -25 * p, 5 * p, 3 * p); // glowing bio-plasma eyes

    // Crackling Bio-Electric Arcs around Thorax
    ctx.strokeStyle = bioVolt;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6 * p, -24 * p);
    ctx.lineTo(12 * p, (-12 + slither) * p);
    ctx.lineTo(-4 * p, 4 * p);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Orbital Astartes Drop Pod Insertion Sequence at Start of Mission
   */
  public static drawDropPodIntro(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    timer: number
  ) {
    ctx.save();
    // timer counts down from 1.1 -> 0
    const isDescending = timer > 0.45;
    const alpha = timer < 0.25 ? Math.max(0, timer / 0.25) : 1;
    ctx.globalAlpha = alpha;

    if (isDescending) {
      const progress = 1 - (timer - 0.45) / 0.65; // 0 -> 1
      const altitude = (1 - progress) * 620;

      // Ground Drop Zone Beacon Ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.arc(x, y + 10, 56 * (1.2 - progress * 0.35), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Descending Drop Pod Hull in Claude-PXL
      const py = y - altitude;
      // Retro-burner flame plume underneath & entry plasma trail above
      const grad = ctx.createLinearGradient(x, py - 150, x, py + 45);
      grad.addColorStop(0, 'rgba(249, 115, 22, 0)');
      grad.addColorStop(0.6, 'rgba(251, 191, 36, 0.75)');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
      ctx.fillRect(x - 18, py - 150, 36, 185);

      const cached = VehiclePxlCompiler.renderVehicle(DROP_POD_PXL_DEF);
      ctx.drawImage(cached, Math.floor(x) - Math.round(cached.width / 2), Math.floor(py) - Math.round(cached.height / 2));
    } else {
      // Landed Drop Pod with Open Assault Ramps & Expanding Shockwave!
      const landAge = (0.45 - timer) / 0.45; // 0 -> 1
      ctx.strokeStyle = `rgba(251, 191, 36, ${Math.max(0, 1 - landAge)})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y + 8, 35 + landAge * 135, 0, Math.PI * 2);
      ctx.stroke();

      // Open Pod Petals on Ground behind Marine
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 54, y - 8, 28, 14);
      ctx.fillRect(x + 26, y - 8, 28, 14);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x - 50, y - 5, 20, 4);
      ctx.fillRect(x + 30, y - 5, 20, 4);
    }

    ctx.restore();
  }

  /**
   * Orbital Bombardment: Celestial Holy Lance Reticle & Divine Beam
   */
  public static drawOrbitalStrike(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    timer: number,
    maxTimer: number,
    radius: number
  ) {
    ctx.save();

    // Phase 1: Targeting Holographic Reticle Countdown
    if (timer > 0.35) {
      const progress = (maxTimer - timer) / (maxTimer - 0.35);
      const ringRadius = radius * (1 - progress * 0.3);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Outer dashed spinning ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Crosshairs
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - radius - 15, y);
      ctx.lineTo(x + radius + 15, y);
      ctx.moveTo(x, y - radius - 15);
      ctx.lineTo(x, y + radius + 15);
      ctx.stroke();

      // Skull Warning Text in Center
      ctx.font = 'bold 13px "Cinzel", serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('ORBITAL LOCK', x, y - 8);
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`${(timer - 0.35).toFixed(1)}s`, x, y + 10);
    } 
    // Phase 2: Blinding Solar Lance Beam Strikes Down!
    else {
      const beamAlpha = Math.min(1.0, timer / 0.35);

      // Expanding ground shockwave ring
      const shockwave = (1 - timer / 0.35) * radius * 1.35;
      ctx.strokeStyle = `rgba(254, 240, 138, ${beamAlpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, shockwave, 0, Math.PI * 2);
      ctx.stroke();

      // Divine Beam Column descending from above
      const beamWidth = radius * 1.4;
      const grad = ctx.createLinearGradient(x - beamWidth / 2, 0, x + beamWidth / 2, 0);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0)');
      grad.addColorStop(0.2, `rgba(245, 158, 11, ${0.85 * beamAlpha})`);
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.98 * beamAlpha})`);
      grad.addColorStop(0.8, `rgba(245, 158, 11, ${0.85 * beamAlpha})`);
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(x - beamWidth / 2, y - 1000, beamWidth, 1020);

      // Core white-hot laser
      ctx.fillStyle = `rgba(255, 255, 255, ${beamAlpha})`;
      ctx.fillRect(x - beamWidth * 0.2, y - 1000, beamWidth * 0.4, 1020);

      // Crackling lightning arcs along beam
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2.5;
      for (let l = 0; l < 3; l++) {
        const offX = (Math.random() - 0.5) * beamWidth;
        ctx.beginPath();
        ctx.moveTo(x + offX, y - 400);
        ctx.lineTo(x + offX + (Math.random() - 0.5) * 40, y - 200);
        ctx.lineTo(x + offX + (Math.random() - 0.5) * 40, y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Realistic Bullet Flight with True Direction, Rotation, and Tracers
   */
  public static drawRealisticProjectile(
    ctx: CanvasRenderingContext2D,
    proj: Projectile,
    elapsedTime: number
  ) {
    const angle = proj.rotAngle ?? Math.atan2(proj.vy, proj.vx);

    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.rotate(angle);

    if (proj.type === 'bolter') {
      // 1. Rocket Tracer Smoke & Fire Tail behind
      const grad = ctx.createLinearGradient(-14, 0, 0, 0);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0)');
      grad.addColorStop(0.4, 'rgba(239, 68, 68, 0.6)');
      grad.addColorStop(1, '#fde047');
      ctx.fillStyle = grad;
      ctx.fillRect(-14, -1.5, 14, 3);

      // 2. Heavy Ceramo-Steel Shell Casing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, -2.5, 9, 5);
      ctx.fillStyle = '#d97706'; // brass casing
      ctx.fillRect(-3, -2, 6, 4);

      // 3. Pointed Explosive Warhead Tip
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(3, -2);
      ctx.lineTo(7, 0);
      ctx.lineTo(3, 2);
      ctx.closePath();
      ctx.fill();

      // Gleam highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -1, 3, 1);
    } 
    else if (proj.type === 'heavy_bolter') {
      // Larger Calibre Heavy Bolter Round
      const grad = ctx.createLinearGradient(-20, 0, 0, 0);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.7)');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -2.5, 20, 5);

      ctx.fillStyle = '#020617';
      ctx.fillRect(-6, -3.5, 14, 7);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-5, -3, 9, 6);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(4, -3);
      ctx.lineTo(9, 0);
      ctx.lineTo(4, 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -1.5, 5, 2);
    } 
    else if (proj.type === 'dreadnought_assault_cannon') {
      // Supersonic Gatling Tracer Streak
      const grad = ctx.createLinearGradient(-26, 0, 4, 0);
      grad.addColorStop(0, 'rgba(250, 204, 21, 0)');
      grad.addColorStop(0.6, 'rgba(251, 191, 36, 0.85)');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
      ctx.fillRect(-26, -1.5, 30, 3);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -1, 5, 2);
    } 
    else if (proj.type === 'devastator_missile') {
      // Heavy Fin-Stabilized Rocket Missile
      const grad = ctx.createLinearGradient(-22, 0, -6, 0);
      grad.addColorStop(0, 'rgba(100, 116, 139, 0)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.8)');
      grad.addColorStop(1, '#fde047');
      ctx.fillStyle = grad;
      ctx.fillRect(-22, -2.5, 16, 5);

      // Rocket body
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -3, 16, 6);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-7, -2.5, 12, 5);
      // Nose cone
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(5, -2.5);
      ctx.lineTo(10, 0);
      ctx.lineTo(5, 2.5);
      ctx.closePath();
      ctx.fill();
      // Tail fins
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, -5, 3, 10);
    } 
    else if (proj.type === 'turret_bullet') {
      // Sentry Turret Tracer Line
      ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.fillRect(-12, -1, 14, 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-4, -1.5, 8, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -1, 3, 2);
    } 
    else if (proj.type === 'plasma_cannon') {
      // Swirling Plasma Sphere
      ctx.rotate(elapsedTime * 8);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -2, 4, 4);
    } 
    else if (proj.type === 'frag_grenade') {
      // Spinning Cast-Iron Grenade
      ctx.rotate(elapsedTime * 12);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5, -5, 10, 10);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-1, -1, 2, 2);
    } 
    else if (proj.type === 'enemy_acid') {
      // Bio-Acid Slime Globule
      ctx.fillStyle = 'rgba(132, 204, 22, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -1, 2, 2);
    } 
    else if (proj.type === 'enemy_warp') {
      // Zoanthrope Warp Blast
      ctx.rotate(-elapsedTime * 6);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(-2, -2, 4, 4);
    } 
    else if (proj.type === 'power_sword') {
      // Crescent Power-Field / Burning Blade Slash Wave
      const isBurning = proj.color === '#f97316' || proj.color === '#fb923c';
      const r = Math.max(18, proj.radius * 1.15);
      ctx.strokeStyle = isBurning ? 'rgba(249, 115, 22, 0.95)' : 'rgba(56, 189, 248, 0.95)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(-r * 0.35, 0, r, -0.78, 0.78);
      ctx.stroke();

      ctx.strokeStyle = isBurning ? '#fef08a' : '#e0f2fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-r * 0.35, 0, r + 1, -0.68, 0.68);
      ctx.stroke();
    }
    else if (proj.type === 'assault_cannon') {
      // High-Velocity Twin Rotary Gatling Round
      const grad = ctx.createLinearGradient(-22, 0, 5, 0);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.55, proj.color === '#fbbf24' ? 'rgba(251, 191, 36, 0.9)' : 'rgba(125, 211, 252, 0.9)');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
      ctx.fillRect(-22, -2, 27, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -1.2, 6, 2.4);
    }
    else if (proj.type === 'cyclone_missile') {
      // Shoulder-Launched Homing Krak-Frag Seeker Missile
      const grad = ctx.createLinearGradient(-24, 0, -5, 0);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.85)');
      grad.addColorStop(1, '#fef08a');
      ctx.fillStyle = grad;
      ctx.fillRect(-24, -2.5, 19, 5);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, -3, 15, 6);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-6, -2, 11, 4);
      ctx.fillStyle = proj.color === '#facc15' ? '#f59e0b' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(5, -3);
      ctx.lineTo(11, 0);
      ctx.lineTo(5, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-7, -5, 3, 10);
    }
    else if (proj.type === 'bonesword_wave') {
      PixelRenderer.drawBoneswordWave(ctx, 0, 0, 0, elapsedTime);
    }
    else {
      // Default projectile fallback
      ctx.fillStyle = proj.color;
      ctx.fillRect(-proj.radius, -proj.radius / 2, proj.radius * 2, proj.radius);
    }

    ctx.restore();
  }

  /**
   * Retro Pixel Comic Speech Bubble for Battle Cries
   */
  public static drawBattleSpeechBubble(
    ctx: CanvasRenderingContext2D,
    bubble: BattleSpeechBubble
  ) {
    ctx.save();
    ctx.font = 'bold 12px "VT323", monospace';
    const textWidth = ctx.measureText(bubble.text).width;
    const paddingX = 7;
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = 18;
    const bx = Math.floor(bubble.x - boxWidth / 2);
    const by = Math.floor(bubble.y - 48);

    const alpha = Math.min(1.0, bubble.life / (bubble.maxLife * 0.3));
    ctx.globalAlpha = alpha;

    // Outer Black Outline
    ctx.fillStyle = '#020617';
    ctx.fillRect(bx - 1, by - 1, boxWidth + 2, boxHeight + 2);
    // Dark Charcoal Fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx, by, boxWidth, boxHeight);
    // Gold/Yellow Accent border
    ctx.strokeStyle = bubble.color || '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, boxWidth, boxHeight);

    // Speech Tail pointing downwards
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(bubble.x - 3, by + boxHeight);
    ctx.lineTo(bubble.x, by + boxHeight + 5);
    ctx.lineTo(bubble.x + 3, by + boxHeight);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = bubble.color || '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(bubble.x - 3, by + boxHeight);
    ctx.lineTo(bubble.x, by + boxHeight + 5);
    ctx.lineTo(bubble.x + 3, by + boxHeight);
    ctx.stroke();

    // Text
    ctx.fillStyle = bubble.color || '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText(bubble.text, bubble.x, by + 13);

    ctx.restore();
  }

  /**
   * Lictor Tyranid Stealth Stalker
   * Chameleonic cloaked predator with feeder tendrils and razor mantis-scythe talons
   */
  public static drawLictor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    walkTimer: number,
    isHurt: boolean,
    stealthAlpha: number = 1.0
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (facingLeft) ctx.scale(-1, 1);

    // Apply chameleonic stealth opacity
    ctx.globalAlpha = Math.max(0.18, Math.min(1.0, stealthAlpha));

    const p = 1.5;
    const cycle = Math.sin(walkTimer * 12);
    const black = '#090d16';
    const chitin = isHurt ? '#ffffff' : '#4c1d95'; // Dark Tyranid royal purple
    const flesh = isHurt ? '#fca5a5' : '#831843'; // Deep mauve flesh
    const scytheBone = '#fef08a';
    const eyes = '#facc15';

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16 * p, 15 * p, 4 * p, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Spindly Hind Legs
    ctx.fillStyle = black;
    ctx.fillRect(-10 * p, (6 + cycle * 2) * p, 5 * p, 11 * p);
    ctx.fillRect(4 * p, (6 - cycle * 2) * p, 5 * p, 11 * p);
    ctx.fillStyle = flesh;
    ctx.fillRect(-9 * p, (7 + cycle * 2) * p, 3 * p, 9 * p);
    ctx.fillRect(5 * p, (7 - cycle * 2) * p, 3 * p, 9 * p);

    // 2. Slender Carapace Torso
    ctx.fillStyle = black;
    ctx.fillRect(-8 * p, -8 * p, 16 * p, 16 * p);
    ctx.fillStyle = chitin;
    ctx.fillRect(-7 * p, -7 * p, 14 * p, 14 * p);
    // Dorsal rib ridges
    ctx.fillStyle = '#6b21a8';
    ctx.fillRect(-5 * p, -5 * p, 10 * p, 2 * p);
    ctx.fillRect(-5 * p, -1 * p, 10 * p, 2 * p);
    ctx.fillRect(-5 * p, 3 * p, 10 * p, 2 * p);

    // 3. Predatory Head & Feeder Tendrils
    ctx.fillStyle = black;
    ctx.fillRect(2 * p, -17 * p, 12 * p, 10 * p);
    ctx.fillStyle = chitin;
    ctx.fillRect(3 * p, -16 * p, 10 * p, 8 * p);
    // Multifaceted insectoid eyes
    ctx.fillStyle = eyes;
    ctx.fillRect(9 * p, -14 * p, 3 * p, 2 * p);
    // Feeder tendrils hanging from jaw
    ctx.strokeStyle = flesh;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const wave = Math.sin(walkTimer * 8 + i) * 2;
      ctx.beginPath();
      ctx.moveTo((10 + i * 2) * p, -8 * p);
      ctx.lineTo((9 + i * 2 + wave) * p, -2 * p);
      ctx.stroke();
    }

    // 4. Massive Praying-Mantis Scythe Talons (Folded over chest then striking)
    ctx.fillStyle = black;
    ctx.fillRect(-2 * p, -13 * p, 6 * p, 14 * p);
    ctx.fillStyle = scytheBone;
    ctx.beginPath();
    ctx.moveTo(4 * p, -12 * p);
    ctx.lineTo(18 * p, (-6 + cycle * 3) * p);
    ctx.lineTo(14 * p, (8 + cycle * 2) * p);
    ctx.lineTo(8 * p, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = black;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Secondary Scythe Blade
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(-1 * p, -8 * p);
    ctx.lineTo(12 * p, 0);
    ctx.lineTo(10 * p, 10 * p);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Bonesword Crescent Wave (Hive Tyrant Phase 2 Ranged Attack)
   */
  public static drawBoneswordWave(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotAngle: number,
    timer: number
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.rotate(rotAngle);

    const pulse = Math.sin(timer * 20) * 2;

    // Glowing electric violet crescent
    ctx.strokeStyle = '#c026d3';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 18 + pulse, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    ctx.strokeStyle = '#f0abfc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 18 + pulse, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Ship Point-Defense Console / Bulkhead Terminal (Strike Cruiser Map)
   */
  public static drawCruiserConsole(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    hp: number = 100,
    maxHp: number = 100,
    activeTimer: number = 0
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    const p = 1.6;
    const isReady = activeTimer <= 0;

    // Metal Base Pedestal
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12 * p, 4 * p, 24 * p, 8 * p);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-10 * p, 5 * p, 20 * p, 6 * p);

    // Terminal Column & Display Screen
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8 * p, -14 * p, 16 * p, 18 * p);
    ctx.fillStyle = isReady ? '#0284c7' : '#22c55e';
    ctx.fillRect(-6 * p, -12 * p, 12 * p, 10 * p);

    // Hololithic Tactical Radar Grid on Screen
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -7 * p, 3 * p, 0, Math.PI * 2);
    ctx.stroke();

    // Status Indicator Light
    ctx.fillStyle = isReady ? '#38bdf8' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -18 * p, 2.5 * p, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Roving Mars Tech-Priest Enginseer (Battlefield Merchant NPC)
   */
  public static drawTechPriest(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingLeft: boolean,
    animTimer: number
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (facingLeft) ctx.scale(-1, 1);

    const p = 1.5;
    const bob = Math.sin(animTimer * 4) * 2;
    const redRobe = '#991b1b';
    const darkRobe = '#450a0a';
    const brass = '#f59e0b';
    const steel = '#94a3b8';

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16 * p, 14 * p, 4 * p, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flowing Crimson Mars Robes
    ctx.fillStyle = '#020617';
    ctx.fillRect(-9 * p, -8 * p, 18 * p, 24 * p);
    ctx.fillStyle = darkRobe;
    ctx.fillRect(-8 * p, -7 * p, 16 * p, 22 * p);
    ctx.fillStyle = redRobe;
    ctx.fillRect(-6 * p, -5 * p, 12 * p, 18 * p);

    // Cowl & Mech-Hood
    ctx.fillStyle = redRobe;
    ctx.fillRect(-6 * p, -20 * p, 12 * p, 13 * p);
    // Shadow inside hood with glowing bionic eye
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-4 * p, -17 * p, 8 * p, 8 * p);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-1 * p, -14 * p, 3 * p, 2.5 * p);

    // Cog-Axe of the Omnissiah in Hand
    ctx.fillStyle = '#78350f';
    ctx.fillRect(8 * p, -26 * p, 2.5 * p, 42 * p);
    // Halberd Blade (Half Cog, Half Axe)
    ctx.fillStyle = brass;
    ctx.fillRect(5 * p, -30 * p, 9 * p, 7 * p);
    ctx.fillStyle = steel;
    ctx.fillRect(10 * p, -33 * p, 3 * p, 13 * p);

    // Smoking Incense Censer floating on Servo-Arm
    ctx.strokeStyle = steel;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6 * p, -12 * p);
    ctx.lineTo(-14 * p, (-22 + bob) * p);
    ctx.stroke();

    ctx.fillStyle = brass;
    ctx.beginPath();
    ctx.arc(-14 * p, (-24 + bob) * p, 4 * p, 0, Math.PI * 2);
    ctx.fill();

    // Incense Smoke particles
    ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
    ctx.beginPath();
    ctx.arc(-14 * p, (-28 + bob) * p, 2 * p, 0, Math.PI * 2);
    ctx.arc(-16 * p, (-32 + bob) * p, 3 * p, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

