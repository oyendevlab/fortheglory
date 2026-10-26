import { 
  GameState, 
  WeaponConfig, 
  PassiveConfig, 
  Enemy, 
  Projectile, 
  BiomassOrb, 
  Particle, 
  FloatingText, 
  PlayerStats, 
  WeaponId, 
  PassiveId,
  UpgradeOption,
  RelicChest,
  BloodSplat,
  ChitinFragment,
  Afterimage,
  ServoSkullCompanion,
  MarineChapter,
  MapTheme,
  InteractiveObject,
  ArmoryUpgrades,
  GameMode,
  MarineSkin,
  SquadBrother,
  SquadBrotherType,
  AimMode,
  DreadnoughtState,
  OrbitalStrike,
  BattleSpeechBubble,
  WeaponStatRecord,
  MapObstacle,
  MapObstacleVariant,
  CombatTrial,
  DynamicHiveEvent,
  GameFeelSettings,
  MinimapBlip,
  OathId,
  WargearRelicId,
  ActiveBossInfo,
  ExtractionZoneInfo,
  HiveMutatorInfo,
  EnemyType,
  TalentRanksMap,
  WeaponOverclocksMap,
  PixelExplosion
} from '../types/game';
import { INITIAL_WEAPONS, INITIAL_PASSIVES, WEAPON_EVOLUTIONS, WARGEAR_RELICS, generateUpgradeChoices } from './upgrades';
import { getChapterMasteryInfo, loadChapterMastery, loadTalents, loadWeaponOverclocks, incrementBestiaryKill, BESTIARY_MILESTONES } from './metaProgression';
import { PixelRenderer } from './pixelSprites';
import { sounds } from '../services/audio';
import { SpaceMarinePixelArt, SpatialHashGrid } from './pixelPipeline';

export interface GameEngineCallbacks {
  onLevelUp: (choices: UpgradeOption[], currentLevel: number) => void;
  onRelicChest: (rewards: UpgradeOption[], jackpotCount?: 1 | 3 | 5) => void;
  onGameOver: (stats: {
    time: number;
    kills: number;
    level: number;
    bossesKilled: number;
    puritySealsEarned: number;
    weaponStats: Record<WeaponId, WeaponStatRecord>;
    victory?: boolean;
    evolvedWeapons?: string[];
  }) => void;
  onStatsUpdate: (stats: { 
    hp: number; 
    maxHp: number; 
    shield: number; 
    maxShield: number; 
    xp: number; 
    xpNeeded: number; 
    level: number; 
    time: number; 
    remainingTime: number;
    maxGameTime: number;
    kills: number;
    streakCount: number;
    streakTimerPct: number;
    isZealActive: boolean;
    dashCooldownPct: number;
    ultimateCooldownPct: number;
    dreadnoughtTimerPct?: number;
    activeTrial?: CombatTrial | null;
    activeHiveEvent?: DynamicHiveEvent | null;
    minimapBlips?: MinimapBlip[];
    activeBosses?: ActiveBossInfo[];
    activeRelics?: WargearRelicId[];
    activeOaths?: OathId[];
    extractionZone?: ExtractionZoneInfo | null;
    gameMode?: GameMode;
    furyPct?: number;
    overdrivePct?: number;
    activeMutator?: HiveMutatorInfo | null;
  }) => void;
}

interface GroundHazardEntity {
  id: number;
  x: number;
  y: number;
  radius: number;
  duration: number;
  maxDuration: number;
  damagePerTick: number;
  type: 'plasma_pool' | 'promethium_fire' | 'static_field';
  tickTimer: number;
  weaponId: WeaponId;
}

interface VortexEntity {
  id: number;
  x: number;
  y: number;
  radius: number;
  duration: number;
  maxDuration: number;
  damage: number;
  pulseTimer: number;
}

interface ShockwaveEntity {
  id: number;
  x: number;
  y: number;
  currentRadius: number;
  maxRadius: number;
  damage: number;
  hitEnemyIds: Set<number>;
  color: string;
}

interface LaserBeamEntity {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
}

interface LightningArcEntity {
  points: { x: number; y: number }[];
  life: number;
  maxLife: number;
  color: string;
}

interface AshParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number = 0;
  private lastTime: number = 0;
  private callbacks: GameEngineCallbacks;

  // Game Status
  public state: GameState = 'TITLE';
  public elapsedGameTime: number = 0;
  public maxGameTime: number = 360; // 6-minute standard crusade countdown (360s)
  public remainingTime: number = 360;
  public killCount: number = 0;
  public bossesKilled: number = 0;
  public playerLevel: number = 1;
  public playerXp: number = 0;
  public xpToNextLevel: number = 8;
  public ultimateCooldown: number = 0;
  public maxUltimateCooldown: number = 26;
  public banishedIds: Set<string> = new Set();
  public gameFeel: GameFeelSettings = { damageNumbers: 'all', screenShake: 'high' };

  // Player
  public playerX: number = 0;
  public playerY: number = 0;
  public playerFacingLeft: boolean = false;
  public playerWalkTimer: number = 0;
  public playerTurnSquashTimer: number = 0;
  public playerHurtTimer: number = 0;
  public playerInvulnTimer: number = 0;
  public playerShootTimer: number = 0;
  public playerOverheatHeat: number = 0;
  public playerMeleeSlashTimer: number = 0;
  public playerIsBraced: boolean = false;
  private bracedTimer: number = 0;
  private prevMoveDirX: number = 0;
  private prevMoveDirY: number = 0;
  public playerStats: PlayerStats = {
    maxHp: 130,
    hp: 130,
    shield: 0,
    maxShield: 0,
    shieldRegenRate: 18,
    shieldDelayTimer: 0,
    moveSpeed: 185,
    damageMult: 1.0,
    cooldownMult: 1.0,
    magnetRange: 165,
    critChance: 0.10
  };

  // Tactical Combat Dash
  public isDashing: boolean = false;
  public dashTimer: number = 0;
  public dashCooldown: number = 0;
  private maxDashCooldown: number = 3.2;
  private afterimages: Afterimage[] = [];

  // Chapter, Map Theme, Game Mode & Skin
  public chapter: MarineChapter = 'ultramarines';
  public mapTheme: MapTheme = 'hive_city';
  public armory: ArmoryUpgrades = { healthBonus: 0, speedBonus: 0, magnetBonus: 0, critBonus: 0, rerollBonus: 0 };
  public gameMode: GameMode = 'standard';
  public marineSkin: MarineSkin = 'standard';
  public puritySealsEarned: number = 0;

  public getHiveFleet(): 'leviathan' | 'kraken' | 'behemoth' {
    if (this.mapTheme === 'space_hulk' || this.mapTheme === 'mechanicus_forge') return 'kraken';
    if (this.mapTheme === 'bio_chasm') return 'behemoth';
    return 'leviathan';
  }

  private barrelSpawnTimer: number = 20.0;
  private stimpackTimer: number = 0;

  // Dreadnought Walker State
  public dreadnought: DreadnoughtState = {
    isActive: false,
    timer: 0,
    maxTimer: 25,
    shootTimer: 0,
    slamTimer: 0,
    facingLeft: false
  };

  // Squad Battle-Brothers & Orbital Strikes
  public squadBrothers: SquadBrother[] = [];
  public orbitalStrikes: OrbitalStrike[] = [];
  public battleSpeechBubbles: BattleSpeechBubble[] = [];
  private slowMoTimer: number = 0;
  private dreadnoughtDropTimer: number = 95.0;
  private orbitalBeaconTimer: number = 60.0;
  private squadBeaconTimer: number = 35.0;
  private magnetTimer = 42;
  private riskSupplyTimer = 48;
  private relicPodCooldown: number = 0;
  private activeTrial: CombatTrial | null = null;
  private trialSpawnTimer: number = 25;
  private activeHiveEvent: DynamicHiveEvent | null = null;
  private hiveEventSpawnTimer: number = 50;
  private obstacles: MapObstacle[] = [];
  private generatedChunks: Set<string> = new Set();
  private lastJackpotCount: 1 | 3 | 5 = 3;
  public activeOaths: OathId[] = [];
  public activeRelics: WargearRelicId[] = [];
  public extractionZone: ExtractionZoneInfo | null = null;
  private relicMacraggeTimer: number = 4.0;
  private shrineBuffTimer: number = 0;
  private broodlordSpawned90: boolean = false;
  private broodlordSpawned200: boolean = false;
  private trygonSpawned: boolean = false;
  public furyMeter: number = 0;
  public overdriveTimer: number = 0;
  private readonly maxOverdriveTimer: number = 6.0;
  public dropPodIntroTimer: number = 0;
  private dropPodImpactDone: boolean = false;
  private playerToxicSlowTimer: number = 0;
  private toxicAuraDamageTick: number = 0;
  public chapterMasteryXp: number = 0;
  public activeMutator: HiveMutatorInfo | null = null;
  private mutatorCycleTimer: number = 65;
  private techPriestSpawned: boolean = false;
  private talents: TalentRanksMap = {};
  private weaponOverclocks: WeaponOverclocksMap = {};
  private riskZone: { x: number; y: number; radius: number; timer: number; progress: number; needed: number } | null = null;
  private nextSpecialWave = 45;
  private specialWave: 'swarm' | 'ranged' | 'elite' | null = null;
  private specialWaveTimer = 0;
  private orbitalRelayTimer = 0;
  private orbitalRelayFlash = 0;
  private orbitalRelayTargets: number[] = [];
  private rewardSource: 'elite' | 'boss' | 'supply' = 'elite';

  // Purge Streak Combo & Emperor's Zeal
  public streakCount: number = 0;
  public streakTimer: number = 0;
  private readonly maxStreakTimer: number = 2.8;
  public isZealActive: boolean = false;

  // Support Servo-Skull Companion
  private servoSkull: ServoSkullCompanion = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    laserCooldown: 0.3,
    hoverAngle: 0
  };

  // Weapons & Passives
  public weapons: Record<WeaponId, WeaponConfig> = JSON.parse(JSON.stringify(INITIAL_WEAPONS));
  public passives: Record<PassiveId, PassiveConfig> = JSON.parse(JSON.stringify(INITIAL_PASSIVES));
  public weaponStats: Record<WeaponId, WeaponStatRecord> = this.createEmptyWeaponStats();
  public lockedUpgrade: UpgradeOption | null = null;
  private lastDamageWeapon: WeaponId | null = null;

  // Entities
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  public interactiveObjects: InteractiveObject[] = [];
  private biomassOrbs: BiomassOrb[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private vortices: VortexEntity[] = [];
  private shockwaves: ShockwaveEntity[] = [];
  private groundHazards: GroundHazardEntity[] = [];
  private laserBeams: LaserBeamEntity[] = [];
  private lightningArcs: LightningArcEntity[] = [];
  private relicChests: RelicChest[] = [];
  private bloodSplats: BloodSplat[] = [];
  private chitinFragments: ChitinFragment[] = [];
  private ashParticles: AshParticle[] = [];

  // Gamedev Skills: Pixel Explosions, Decal Buffer, Glitch, Gamepad
  public pixelExplosions: PixelExplosion[] = [];
  public chromaticAberrationTimer: number = 0;
  public chromaticAberrationIntensity: number = 0;
  private decalCanvas: HTMLCanvasElement | null = null;
  private decalCtx: CanvasRenderingContext2D | null = null;

  // Weapon Orbit Angles & Timers
  private chainswordAngle: number = 0;
  private stormShieldAngle: number = 0;
  private shieldShockCooldown: number = 0;
  private dashHitEnemyIds: Set<number> = new Set();

  // Environmental, Trauma-Based Screen Shake & Hit-Stop
  private screenShakeAmount: number = 0;
  private shakeTrauma: number = 0; // 0.0 to 1.0 (Trauma^2 algorithm)
  private enemySpatialGrid = new SpatialHashGrid<Enemy>(128);
  private hitStopTimer: number = 0;
  private ambientLightningFlash: number = 0;
  private ambientLightningTimer: number = 8.0;

  public addTrauma(amount: number) {
    this.shakeTrauma = Math.min(1.0, this.shakeTrauma + amount);
    this.screenShakeAmount = Math.max(this.screenShakeAmount, amount * 24);
  }

  // Low HP Heartbeat sound timer
  private heartbeatSoundTimer: number = 0;

  // Spawning & IDs
  private spawnTimer: number = 0;
  private enemyIdCounter: number = 1;
  private projIdCounter: number = 1;
  private orbIdCounter: number = 1;
  private textIdCounter: number = 1;
  private effectIdCounter: number = 1;
  private objIdCounter: number = 1;

  // Input & Aiming Modes
  public aimMode: AimMode = 'hybrid';
  public inputDir: { x: number; y: number } = { x: 0, y: 0 };
  public mouseWorldX: number = 0;
  public mouseWorldY: number = 0;
  public mouseScreenX: number = 0;
  public mouseScreenY: number = 0;
  public isMouseDown: boolean = false;
  private keysPressed: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;

    this.setupKeyboardListeners();
    this.setupMouseListeners();
    this.resizeCanvas();
    this.initAtmosphericAsh();
    this.initDecalCanvas();
  }

  private initDecalCanvas() {
    this.decalCanvas = document.createElement('canvas');
    this.decalCanvas.width = 4000;
    this.decalCanvas.height = 4000;
    this.decalCtx = this.decalCanvas.getContext('2d');
    if (this.decalCtx) {
      this.decalCtx.imageSmoothingEnabled = false;
      this.decalCtx.clearRect(0, 0, 4000, 4000);
    }
  }

  public stampDecal(worldX: number, worldY: number, size: number, type: 'blood' | 'scorch' | 'acid' = 'blood', color: string = '#7e22ce') {
    if (!this.decalCtx) return;
    const dx = Math.floor(worldX + 2000);
    const dy = Math.floor(worldY + 2000);
    if (dx < 0 || dx >= 4000 || dy < 0 || dy >= 4000) return;

    this.decalCtx.save();
    if (type === 'blood') {
      this.decalCtx.fillStyle = color;
      this.decalCtx.globalAlpha = 0.65;
      this.decalCtx.fillRect(dx - Math.floor(size / 2), dy - Math.floor(size / 2), size, size);
      this.decalCtx.fillRect(dx - Math.floor(size * 0.7), dy + Math.floor(size * 0.3), Math.floor(size * 0.4), Math.floor(size * 0.4));
      this.decalCtx.fillRect(dx + Math.floor(size * 0.6), dy - Math.floor(size * 0.5), Math.floor(size * 0.35), Math.floor(size * 0.35));
    } else if (type === 'scorch') {
      this.decalCtx.fillStyle = '#090d16';
      this.decalCtx.globalAlpha = 0.75;
      this.decalCtx.fillRect(dx - Math.floor(size / 2), dy - Math.floor(size / 2), size, size);
      this.decalCtx.fillStyle = '#1e293b';
      this.decalCtx.fillRect(dx - Math.floor(size * 0.6), dy - Math.floor(size * 0.3), Math.floor(size * 0.3), Math.floor(size * 0.6));
      this.decalCtx.fillRect(dx + Math.floor(size * 0.4), dy + Math.floor(size * 0.2), Math.floor(size * 0.3), Math.floor(size * 0.5));
    } else if (type === 'acid') {
      this.decalCtx.fillStyle = '#84cc16';
      this.decalCtx.globalAlpha = 0.55;
      this.decalCtx.fillRect(dx - Math.floor(size / 2), dy - Math.floor(size / 2), size, size);
    }
    this.decalCtx.restore();
  }

  public triggerGlitch(duration: number = 0.10, intensity: number = 3) {
    this.chromaticAberrationTimer = duration;
    this.chromaticAberrationIntensity = intensity;
  }

  public spawnPixelExplosion(x: number, y: number, radius: number, color: string = '#f97316', secondaryCount: number = 2) {
    this.pixelExplosions.push({
      id: this.effectIdCounter++,
      x,
      y,
      radius,
      life: 0.45,
      maxLife: 0.45,
      color,
      secondaryPops: secondaryCount
    });

    this.addTrauma(Math.min(0.55, radius / 80));
    this.triggerGlitch(0.09, Math.min(6, Math.floor(radius / 15)));
    this.stampDecal(x, y, Math.round(radius * 0.75), 'scorch');

    const pan = (x - this.playerX) / 450;
    sounds.playExplosion(pan);
    this.triggerGamepadRumble(160, 0.4, 0.75);
  }

  private pollGamepad() {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;
    const gp = gamepads[0];
    if (!gp) return;

    const deadzone = 0.22;
    let lx = gp.axes[0] || 0;
    let ly = gp.axes[1] || 0;
    if (Math.abs(lx) < deadzone) lx = 0;
    if (Math.abs(ly) < deadzone) ly = 0;

    if (lx !== 0 || ly !== 0) {
      if (lx < -deadzone) this.setPlayerFacing(true);
      else if (lx > deadzone) this.setPlayerFacing(false);
      this.keysPressed.add(lx < 0 ? 'KeyA' : 'KeyD');
      this.keysPressed.add(ly < 0 ? 'KeyW' : 'KeyS');
    }

    // Right Stick: Twin-Stick Aiming
    let rx = gp.axes[2] || 0;
    let ry = gp.axes[3] || 0;
    if (Math.abs(rx) < deadzone) rx = 0;
    if (Math.abs(ry) < deadzone) ry = 0;

    if (rx !== 0 || ry !== 0) {
      this.mouseWorldX = this.playerX + rx * 220;
      this.mouseWorldY = this.playerY + ry * 220;
      this.aimMode = 'manual';
    }

    // Button 0 (A / Cross): Dash
    if (gp.buttons[0]?.pressed) {
      this.triggerDash();
    }

    // Button 1 (B / Circle): Ultimate
    if (gp.buttons[1]?.pressed) {
      this.triggerUltimate();
    }

    // Button 7 (R2 Trigger): Overdrive
    if (gp.buttons[7]?.pressed) {
      this.triggerOverdrive();
    }
  }

  public triggerGamepadRumble(duration: number = 150, weak: number = 0.4, strong: number = 0.7) {
    if (!navigator.getGamepads) return;
    const gp = navigator.getGamepads()[0];
    if (gp && (gp as any).vibrationActuator) {
      (gp as any).vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration,
        weakMagnitude: weak,
        strongMagnitude: strong
      }).catch(() => {});
    }
  }

  private initAtmosphericAsh() {
    this.ashParticles = [];
    for (let i = 0; i < 40; i++) {
      this.ashParticles.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1200,
        vx: -20 - Math.random() * 25,
        vy: 10 + Math.random() * 20,
        size: 1.5 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.4
      });
    }
  }

  public resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed.add(e.code);

      // Dash trigger via Spacebar
      if (e.code === 'Space') {
        this.triggerDash();
      }

      // Chapter Tactical Ultimate via Q or E
      if (e.code === 'KeyQ' || e.code === 'KeyE') {
        this.triggerUltimate();
      }

      // Tactical Overdrive (Fury of the Astartes) via F
      if (e.code === 'KeyF') {
        this.triggerOverdrive();
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'PLAYING') {
          this.state = 'PAUSED';
        } else if (this.state === 'PAUSED') {
          this.state = 'PLAYING';
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed.delete(e.code);
    });

    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  private setupMouseListeners() {
    window.addEventListener('mousemove', (e) => {
      this.mouseScreenX = e.clientX;
      this.mouseScreenY = e.clientY;
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.mouseWorldX = this.playerX + (e.clientX - w / 2);
      this.mouseWorldY = this.playerY + (e.clientY - h / 2);

      // In manual/hybrid mode, face towards mouse cursor
      if (this.aimMode !== 'auto' && this.state === 'PLAYING') {
        if (Math.abs(this.mouseWorldX - this.playerX) > 15) {
          this.setPlayerFacing(this.mouseWorldX < this.playerX);
        }
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isMouseDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDown = false;
      }
    });
  }

  private createEmptyWeaponStats(): Record<WeaponId, WeaponStatRecord> {
    return {
      bolter: { damage: 0, kills: 0 },
      heavy_bolter: { damage: 0, kills: 0 },
      lascannon: { damage: 0, kills: 0 },
      orbiting_shield: { damage: 0, kills: 0 },
      vortex_grenade: { damage: 0, kills: 0 },
      thunder_hammer: { damage: 0, kills: 0 },
      plasma_cannon: { damage: 0, kills: 0 },
      chainsword_orbit: { damage: 0, kills: 0 },
      frag_grenade: { damage: 0, kills: 0 },
      heavy_flamer: { damage: 0, kills: 0 },
      melta_lance: { damage: 0, kills: 0 },
      power_sword: { damage: 0, kills: 0 },
      assault_cannon: { damage: 0, kills: 0 },
      cyclone_missile: { damage: 0, kills: 0 }
    };
  }

  public triggerHaptic(pattern: number | number[]) {
    if (this.gameFeel.screenShake === 'off') return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore unsupported browser haptic errors
      }
    }
  }

  public triggerOverdrive() {
    if (this.state !== 'PLAYING' || this.overdriveTimer > 0 || this.furyMeter < 100) return;

    this.furyMeter = 0;
    this.overdriveTimer = this.maxOverdriveTimer;
    this.playerInvulnTimer = Math.max(this.playerInvulnTimer, 0.9);
    this.screenShakeAmount = 14;
    sounds.playEvolution();
    sounds.playBattleCry('overdrive');
    this.triggerHaptic([30, 25, 45, 25, 65]);

    this.addBattleSpeechBubble(this.playerX, this.playerY, '⚡ FURY OF THE ASTARTES: OVERDRIVE!', '#fbbf24');
    this.shockwaves.push({
      id: this.effectIdCounter++,
      x: this.playerX,
      y: this.playerY,
      currentRadius: 18,
      maxRadius: 220,
      damage: 230 * this.playerStats.damageMult,
      hitEnemyIds: new Set(),
      color: '#fbbf24'
    });
  }

  public triggerDash() {
    if (this.dashCooldown > 0 || this.isDashing || this.state !== 'PLAYING' || this.dropPodIntroTimer > 0.45) return;

    sounds.playDash();
    this.triggerHaptic(18);
    this.isDashing = true;
    this.dashTimer = 0.24;
    this.dashCooldown = this.maxDashCooldown;
    this.playerInvulnTimer = 0.30; // Invulnerable while dashing
    this.screenShakeAmount = 5;
    this.dashHitEnemyIds.clear();

    if (this.activeTrial && this.activeTrial.type === 'dash') {
      this.activeTrial.progress += 1;
      if (this.activeTrial.progress >= this.activeTrial.target) {
        this.completeCombatTrial();
      }
    }

    // Check for Perfect Dodge (Auspex Step): close enemy projectile or close charging enemy
    const dangerProj = this.projectiles.some(
      p => (p.type === 'enemy_acid' || p.type === 'enemy_warp') && Math.hypot(p.x - this.playerX, p.y - this.playerY) < 75
    );
    const dangerEnemy = this.enemies.some(
      e => Math.hypot(e.x - this.playerX, e.y - this.playerY) < e.radius + 42 && (e.isCharging || e.type === 'carnifex_boss' || e.type === 'hive_tyrant' || e.type === 'lictor')
    );

    if (dangerProj || dangerEnemy) {
      this.slowMoTimer = 0.38;
      // Cut all active weapon cooldown timers in half
      for (const w of Object.values(this.weapons)) {
        if (w.level > 0 && w.timer > 0) w.timer *= 0.45;
      }
      if (this.playerStats.maxShield > 0) {
        this.playerStats.shield = Math.min(this.playerStats.maxShield, this.playerStats.shield + 20);
      }
      this.floatingTexts.push({
        id: this.textIdCounter++,
        x: this.playerX,
        y: this.playerY - 32,
        text: '⚡ AUSPEX STEP! [COOLDOWN -55%]',
        color: '#67e8f9',
        life: 0.9,
        maxLife: 0.9,
        isCrit: true
      });
    }

    // Initial Astartes Jump-Pack Shockwave to push back surrounding swarm
    for (const enemy of this.enemies) {
      const dx = enemy.x - this.playerX;
      const dy = enemy.y - this.playerY;
      const dist = Math.hypot(dx, dy);
      if (dist < 75 + enemy.radius && dist > 0) {
        const push = (enemy.type === 'carnifex_boss' || enemy.type === 'hive_tyrant') ? 14 : 42;
        enemy.x += (dx / dist) * push;
        enemy.y += (dy / dist) * push;
      }
    }

    // Thruster smoke particles behind feet
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: this.playerX + (this.playerFacingLeft ? 15 : -15),
        y: this.playerY + 10,
        vx: (this.playerFacingLeft ? 50 : -50) + (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 45,
        life: 0.25,
        maxLife: 0.25,
        color: this.chapter === 'blood_angels' ? '#f97316' : '#38bdf8',
        size: 4 + Math.random() * 3
      });
    }
  }

  public triggerUltimate() {
    if (this.ultimateCooldown > 0 || this.state !== 'PLAYING' || this.dropPodIntroTimer > 0.45) return;

    this.ultimateCooldown = this.maxUltimateCooldown;
    this.screenShakeAmount = 16;
    sounds.playBattleCry('ultimate');
    this.triggerHaptic([35, 30, 55]);

    if (this.chapter === 'ultramarines') {
      // MACRAGGE ORBITAL BARRAGE: 6 Orbital Lance Strikes + 6s Tactical Stimpack
      sounds.playOrbitalSiren();
      this.stimpackTimer = Math.max(this.stimpackTimer, 6.0);
      this.addBattleSpeechBubble(this.playerX, this.playerY, '⚡ MACRAGGE ORBITAL BARRAGE!', '#38bdf8');
      const targets = this.getClosestEnemies(6);
      for (let i = 0; i < 6; i++) {
        const t = targets[i];
        const ang = (i * Math.PI * 2) / 6;
        const sx = t ? t.x : this.playerX + Math.cos(ang) * 190;
        const sy = t ? t.y : this.playerY + Math.sin(ang) * 190;
        this.orbitalStrikes.push({
          id: this.effectIdCounter++,
          x: sx,
          y: sy,
          timer: 0.7 + i * 0.12,
          maxTimer: 1.2,
          radius: 110,
          hasDamaged: false
        });
      }
    } else if (this.chapter === 'blood_angels') {
      // SANGUINARY JUMP SLAM: Massive AoE impact + 25% Max HP Lifesteal
      sounds.playThunderHammer();
      this.playerInvulnTimer = 1.2;
      const healAmt = Math.round(this.playerStats.maxHp * 0.25);
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + healAmt);
      this.addBattleSpeechBubble(this.playerX, this.playerY, `🩸 SANGUINARY SLAM! (+${healAmt} HP)`, '#f43f5e');
      this.shockwaves.push({
        id: this.effectIdCounter++,
        x: this.playerX,
        y: this.playerY,
        currentRadius: 20,
        maxRadius: 260,
        damage: 380 * this.playerStats.damageMult,
        hitEnemyIds: new Set(),
        color: '#f43f5e'
      });
    } else if (this.chapter === 'space_wolves') {
      // FENRISIAN BLIZZARD HOWL: Freeze all nearby enemies for 4.0s + 8 Frost Lightning Chains
      sounds.playThunderHammer();
      this.addBattleSpeechBubble(this.playerX, this.playerY, '🐺 FENRISIAN BLIZZARD HOWL!', '#67e8f9');
      for (const enemy of this.enemies) {
        if (Math.hypot(enemy.x - this.playerX, enemy.y - this.playerY) < 480) {
          enemy.stunTimer = Math.max(enemy.stunTimer || 0, 4.0);
        }
      }
      this.triggerChainLightning(this.playerX, this.playerY, 8, 260 * this.playerStats.damageMult, 'thunder_hammer');
      this.shockwaves.push({
        id: this.effectIdCounter++,
        x: this.playerX,
        y: this.playerY,
        currentRadius: 20,
        maxRadius: 320,
        damage: 210 * this.playerStats.damageMult,
        hitEnemyIds: new Set(),
        color: '#67e8f9'
      });
    } else if (this.chapter === 'salamanders') {
      // VULKAN'S MAGMA ERUPTION: 6 Promethium Fire Pools + AoE Flame Nova
      sounds.playFlamer();
      this.addBattleSpeechBubble(this.playerX, this.playerY, '🔥 VULKAN LIVES! MAGMA ERUPTION!', '#f97316');
      this.shockwaves.push({
        id: this.effectIdCounter++,
        x: this.playerX,
        y: this.playerY,
        currentRadius: 20,
        maxRadius: 290,
        damage: 320 * this.playerStats.damageMult,
        hitEnemyIds: new Set(),
        color: '#f97316'
      });
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI * 2) / 6;
        this.groundHazards.push({
          id: this.effectIdCounter++,
          x: this.playerX + Math.cos(ang) * 95,
          y: this.playerY + Math.sin(ang) * 95,
          radius: 68,
          duration: 5.0,
          maxDuration: 5.0,
          damagePerTick: 60 * this.playerStats.damageMult,
          type: 'promethium_fire',
          tickTimer: 0,
          weaponId: 'heavy_flamer'
        });
      }
    } else if (this.chapter === 'imperial_fists') {
      // DORN'S FORTRESS ARRAY: Deploy 2 Active Tarantula Turrets + +60 Shield
      sounds.playShieldBash();
      this.playerStats.maxShield = Math.max(this.playerStats.maxShield, 60);
      this.playerStats.shield = Math.min(this.playerStats.maxShield, this.playerStats.shield + 60);
      this.addBattleSpeechBubble(this.playerX, this.playerY, '🏰 DORN\'S FORTRESS TURRETS DEPLOYED!', '#facc15');
      for (const side of [-1, 1]) {
        this.interactiveObjects.push({
          id: this.objIdCounter++,
          type: 'turret',
          x: this.playerX + side * 75,
          y: this.playerY - 20,
          hp: 350,
          maxHp: 350,
          radius: 24,
          activeTimer: 22.0,
          shootTimer: 0
        });
      }
    } else if (this.chapter === 'iron_hands') {
      // OMNISSIAH OVERCHARGE: 6s Stimpack Overdrive + 10-target Arc Lightning
      sounds.playThunderHammer();
      this.stimpackTimer = Math.max(this.stimpackTimer, 8.0);
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 25);
      this.addBattleSpeechBubble(this.playerX, this.playerY, '⚙️ THE FLESH IS WEAK! OMNISSIAH OVERCHARGE!', '#38bdf8');
      this.triggerChainLightning(this.playerX, this.playerY, 10, 290 * this.playerStats.damageMult, 'melta_lance');
    } else if (this.chapter === 'raven_guard') {
      // CORAX SHADOW WALK: 3.5s Invulnerability + 4 Precision Orbital Lance Strikes
      sounds.playDash();
      this.playerInvulnTimer = 3.5;
      this.isZealActive = true;
      this.streakTimer = this.maxStreakTimer;
      this.addBattleSpeechBubble(this.playerX, this.playerY, '🐦‍⬛ VICTORUS AUT MORTIS! SHADOW STRIKE!', '#e2e8f0');
      const targets = this.getClosestEnemies(4);
      for (let i = 0; i < 4; i++) {
        const t = targets[i];
        const sx = t ? t.x : this.playerX + Math.cos((i * Math.PI) / 2) * 140;
        const sy = t ? t.y : this.playerY + Math.sin((i * Math.PI) / 2) * 140;
        this.orbitalStrikes.push({
          id: this.effectIdCounter++,
          x: sx,
          y: sy,
          timer: 0.45,
          maxTimer: 0.45,
          radius: 105,
          hasDamaged: false
        });
      }
    } else {
      // DARK ANGELS: DARK TALON STASIS ANOMALY (Giant Singularity Vortex + 3 Plasma Pools)
      sounds.playVortex();
      this.addBattleSpeechBubble(this.playerX, this.playerY, '⚔️ DARK TALON STASIS RIFT!', '#34d399');
      const targetX = this.aimMode !== 'auto' ? this.mouseWorldX : this.playerX + (this.playerFacingLeft ? -140 : 140);
      const targetY = this.aimMode !== 'auto' ? this.mouseWorldY : this.playerY;
      this.vortices.push({
        id: this.effectIdCounter++,
        x: targetX,
        y: targetY,
        radius: 220,
        duration: 4.0,
        maxDuration: 4.0,
        damage: 260 * this.playerStats.damageMult,
        pulseTimer: 0
      });
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3;
        this.groundHazards.push({
          id: this.effectIdCounter++,
          x: targetX + Math.cos(ang) * 75,
          y: targetY + Math.sin(ang) * 75,
          radius: 75,
          duration: 4.5,
          maxDuration: 4.5,
          damagePerTick: 65 * this.playerStats.damageMult,
          type: 'plasma_pool',
          tickTimer: 0,
          weaponId: 'plasma_cannon'
        });
      }
    }
  }

  private ensureObstaclesAroundPlayer() {
    const chunkSize = 420;
    const pChunkX = Math.floor(this.playerX / chunkSize);
    const pChunkY = Math.floor(this.playerY / chunkSize);

    for (let cx = pChunkX - 2; cx <= pChunkX + 2; cx++) {
      for (let cy = pChunkY - 2; cy <= pChunkY + 2; cy++) {
        const key = `${cx},${cy}`;
        if (this.generatedChunks.has(key)) continue;
        this.generatedChunks.add(key);

        // Deterministic pseudo-random per chunk
        const seed = Math.abs(Math.sin(cx * 127.1 + cy * 311.7) * 43758.5453);
        const count = 1 + (Math.floor(seed * 10) % 2); // 1 to 2 structures per 420x420 sector

        for (let i = 0; i < count; i++) {
          const h1 = Math.abs(Math.sin((cx + i * 17) * 43.13 + (cy - i * 11) * 91.7) * 19384.23);
          const h2 = Math.abs(Math.cos((cx - i * 23) * 71.3 + (cy + i * 19) * 53.9) * 28471.91);
          const ox = cx * chunkSize + 70 + (h1 % (chunkSize - 140));
          const oy = cy * chunkSize + 70 + (h2 % (chunkSize - 140));

          // Keep immediate player starting area clear
          if (Math.hypot(ox, oy) < 190) continue;

          let variant: MapObstacleVariant = 'pillar';
          let radius = 28;
          let blocksMovement = true;
          let blocksProjectiles = true;

          const pick = Math.floor((h1 * 100) % 4);
          const isForgeShrineChunk =
            i === 0 &&
            (this.mapTheme === 'mechanicus_forge'
              ? Math.abs(cx * 3 + cy * 5) % 3 === 0
              : Math.abs(cx * 7 + cy * 11) % 6 === 0);

          if (isForgeShrineChunk) {
            variant = 'tech_shrine';
            radius = 30;
          } else if (this.mapTheme === 'mechanicus_forge') {
            if (pick === 0) { variant = 'plasma_core'; radius = 26; }
            else if (pick === 1) { variant = 'bulkhead'; radius = 30; }
            else if (pick === 2) { variant = 'barricade'; radius = 28; }
            else { variant = 'crater'; radius = 34; blocksMovement = false; blocksProjectiles = false; }
          } else if (this.mapTheme === 'strike_cruiser') {
            if (pick === 0) { variant = 'cruiser_console'; radius = 28; }
            else if (pick === 1) { variant = 'bulkhead'; radius = 32; }
            else if (pick === 2) { variant = 'barricade'; radius = 28; }
            else { variant = 'plasma_core'; radius = 26; }
          } else if (this.mapTheme === 'space_hulk') {
            if (pick === 0) { variant = 'bulkhead'; radius = 30; }
            else if (pick === 1) { variant = 'plasma_core'; radius = 26; }
            else if (pick === 2) { variant = 'barricade'; radius = 28; }
            else { variant = 'crater'; radius = 34; blocksMovement = false; blocksProjectiles = false; }
          } else if (this.mapTheme === 'bio_chasm') {
            if (pick === 0 || pick === 1) { variant = 'spore_tower'; radius = 28; }
            else if (pick === 2) { variant = 'pillar'; radius = 26; }
            else { variant = 'acid_pool'; radius = 38; blocksMovement = false; blocksProjectiles = false; }
          } else {
            if (pick === 0) { variant = 'pillar'; radius = 28; }
            else if (pick === 1) { variant = 'barricade'; radius = 30; }
            else if (pick === 2) { variant = 'statue'; radius = 28; }
            else { variant = 'crater'; radius = 36; blocksMovement = false; blocksProjectiles = false; }
          }

          const hp = variant === 'spore_tower' ? 160 : (variant === 'plasma_core' ? 140 : undefined);
          this.obstacles.push({
            id: `${key}_${i}`,
            x: ox,
            y: oy,
            radius,
            variant,
            blocksMovement,
            blocksProjectiles,
            hp,
            maxHp: hp,
            shrineProgress: variant === 'statue' || variant === 'tech_shrine' ? 0 : undefined,
            blessed: false
          });
        }
      }
    }
  }

  public startNewGame(
    chapter: MarineChapter = 'ultramarines',
    mapTheme: MapTheme = 'hive_city',
    armory?: ArmoryUpgrades,
    gameMode: GameMode = 'standard',
    skin: MarineSkin = 'standard',
    oaths: OathId[] = []
  ) {
    this.chapter = chapter;
    this.mapTheme = mapTheme;
    this.armory = armory || { healthBonus: 0, speedBonus: 0, magnetBonus: 0, critBonus: 0, rerollBonus: 0 };
    this.gameMode = gameMode;
    this.marineSkin = skin;
    this.activeOaths = oaths;
    this.activeRelics = [];
    this.extractionZone = null;
    this.relicMacraggeTimer = 4.0;
    this.shrineBuffTimer = 0;
    this.broodlordSpawned90 = false;
    this.broodlordSpawned200 = false;
    this.trygonSpawned = false;
    this.furyMeter = 0;
    this.overdriveTimer = 0;
    this.playerToxicSlowTimer = 0;
    this.toxicAuraDamageTick = 0;
    this.dropPodIntroTimer = gameMode === 'firing_range' ? 0 : 1.1;
    this.dropPodImpactDone = gameMode === 'firing_range';
    const masteryMap = loadChapterMastery();
    this.chapterMasteryXp = masteryMap[chapter] || 0;
    this.talents = loadTalents();
    this.weaponOverclocks = loadWeaponOverclocks();
    this.activeMutator = null;
    this.mutatorCycleTimer = 65;
    this.techPriestSpawned = false;
    this.maxGameTime = gameMode === 'standard' ? 360 : (gameMode === 'boss_rush' ? 240 : 0);
    this.remainingTime = this.maxGameTime;
    this.ultimateCooldown = 0;
    this.maxUltimateCooldown = chapter === 'ultramarines' ? 24 : 26;
    this.banishedIds.clear();
    this.relicPodCooldown = 0;
    this.activeTrial = null;
    this.trialSpawnTimer = 22;
    this.activeHiveEvent = null;
    this.hiveEventSpawnTimer = 48;
    this.obstacles = [];
    this.generatedChunks.clear();
    this.puritySealsEarned = 0;
    this.stimpackTimer = 0;
    this.barrelSpawnTimer = 14.0;
    this.dreadnoughtDropTimer = 95.0;
    this.orbitalBeaconTimer = 60.0;
    this.squadBeaconTimer = 35.0;
    this.magnetTimer = 42;
    this.riskSupplyTimer = 48;
    this.riskZone = null;
    this.nextSpecialWave = 45;
    this.specialWave = null;
    this.specialWaveTimer = 0;
    this.orbitalRelayTimer = 0;
    this.orbitalRelayFlash = 0;
    this.orbitalRelayTargets = [];
    this.slowMoTimer = 0;
    this.pixelExplosions = [];
    this.chromaticAberrationTimer = 0;
    this.chromaticAberrationIntensity = 0;
    this.initDecalCanvas();

    this.dreadnought = {
      isActive: false,
      timer: 0,
      maxTimer: 25,
      shootTimer: 0,
      slamTimer: 0,
      facingLeft: false
    };
    this.squadBrothers = [];
    this.orbitalStrikes = [];
    this.battleSpeechBubbles = [];

    this.weapons = JSON.parse(JSON.stringify(INITIAL_WEAPONS));
    this.passives = JSON.parse(JSON.stringify(INITIAL_PASSIVES));
    this.weaponStats = this.createEmptyWeaponStats();
    this.lockedUpgrade = null;
    this.lastDamageWeapon = null;
    this.groundHazards = [];
    this.shieldShockCooldown = 0;
    this.dashHitEnemyIds.clear();

    // Chapter Starter Weapon & Dash Cooldown
    if (chapter === 'blood_angels') {
      this.weapons.bolter.level = 0;
      this.weapons.chainsword_orbit.level = 1;
      this.maxDashCooldown = 2.2;
    } else if (chapter === 'space_wolves') {
      this.weapons.bolter.level = 0;
      this.weapons.thunder_hammer.level = 1;
      this.maxDashCooldown = 3.2;
    } else if (chapter === 'dark_angels') {
      this.weapons.bolter.level = 0;
      this.weapons.plasma_cannon.level = 1;
      this.maxDashCooldown = 3.2;
    } else if (chapter === 'salamanders') {
      this.weapons.bolter.level = 0;
      this.weapons.heavy_flamer.level = 1;
      this.maxDashCooldown = 3.2;
    } else if (chapter === 'imperial_fists') {
      this.weapons.bolter.level = 0;
      this.weapons.heavy_bolter.level = 1;
      this.maxDashCooldown = 3.2;
    } else if (chapter === 'iron_hands') {
      this.weapons.bolter.level = 0;
      this.weapons.melta_lance.level = 1;
      this.maxDashCooldown = 3.2;
    } else if (chapter === 'raven_guard') {
      this.weapons.bolter.level = 0;
      this.weapons.lascannon.level = 1;
      this.maxDashCooldown = 2.0;
    } else {
      this.weapons.bolter.level = 1;
      this.maxDashCooldown = 3.2;
    }

    this.playerLevel = 1;
    this.playerXp = 0;
    this.xpToNextLevel = 8;
    this.elapsedGameTime = 0;
    this.killCount = 0;
    this.bossesKilled = 0;

    this.playerX = 0;
    this.playerY = 0;
    this.playerFacingLeft = false;
    this.playerWalkTimer = 0;
    this.playerHurtTimer = 0;
    this.playerInvulnTimer = gameMode === 'firing_range' ? 0 : 1.4;

    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.afterimages = [];

    this.streakCount = 0;
    this.streakTimer = 0;
    this.isZealActive = false;

    this.servoSkull = {
      x: -40,
      y: -30,
      vx: 0,
      vy: 0,
      laserCooldown: 0.3,
      hoverAngle: 0
    };

    let baseHp = 130 + (this.armory.healthBonus * 12);
    if (chapter === 'ultramarines') baseHp += 20;

    let baseSpeed = 185 * (1 + this.armory.speedBonus * 0.04);
    if (chapter === 'blood_angels') baseSpeed *= 1.15;

    let baseCrit = 0.10 + (this.armory.critBonus * 0.03);
    if (chapter === 'space_wolves') baseCrit += 0.12;

    let baseMagnet = 165 + (this.armory.magnetBonus * 20);

    this.playerStats = {
      maxHp: baseHp,
      hp: baseHp,
      shield: 0,
      maxShield: 0,
      shieldRegenRate: chapter === 'ultramarines' ? 22 : 18,
      shieldDelayTimer: 0,
      moveSpeed: baseSpeed,
      damageMult: chapter === 'dark_angels' ? 1.15 : 1.0,
      cooldownMult: 1.0,
      magnetRange: baseMagnet,
      critChance: baseCrit
    };

    this.enemies = [];
    this.projectiles = [];
    this.biomassOrbs = [];
    this.particles = [];
    this.floatingTexts = [];
    this.vortices = [];
    this.shockwaves = [];
    this.laserBeams = [];
    this.lightningArcs = [];
    this.relicChests = [];
    this.bloodSplats = [];
    this.chitinFragments = [];
    this.interactiveObjects = [];
    this.spawnTimer = 0;
    this.screenShakeAmount = 0;
    this.hitStopTimer = 0;
    this.ambientLightningFlash = 0;

    // Initial interactive objects: 3 Promethium barrels + 1 Tarantula turret
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      this.interactiveObjects.push({
        id: this.objIdCounter++,
        type: 'barrel',
        x: Math.cos(ang) * 280,
        y: Math.sin(ang) * 280,
        hp: 40,
        maxHp: 40,
        radius: 18
      });
    }

    this.interactiveObjects.push({
      id: this.objIdCounter++,
      type: 'turret',
      x: 180,
      y: -140,
      hp: 300,
      maxHp: 300,
      radius: 24,
      activeTimer: 0,
      shootTimer: 0
    });

    this.recalculatePassives();

    if (this.gameMode === 'firing_range') {
      this.spawnFiringRangeDummies();
    }

    this.state = 'PLAYING';
    this.lastTime = performance.now();

    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
    this.animId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  public spawnFiringRangeDummies() {
    // Spawn a high-HP Carnifex Target Dummy + 3 Warrior Dummies
    this.enemies = this.enemies.filter(e => !e.isDummy);
    this.enemies.push({
      id: this.enemyIdCounter++,
      type: 'carnifex_boss',
      x: this.playerX + 185,
      y: this.playerY - 20,
      vx: 0,
      vy: 0,
      radius: 46,
      hp: 50000,
      maxHp: 50000,
      speed: 0,
      damage: 0,
      xpValue: 0,
      facingLeft: true,
      animFrame: 0,
      color: '#581c87',
      hitFlashTimer: 0,
      isDummy: true
    });
    for (let i = -1; i <= 1; i++) {
      this.enemies.push({
        id: this.enemyIdCounter++,
        type: 'tyranid_warrior',
        x: this.playerX - 165,
        y: this.playerY + i * 70,
        vx: 0,
        vy: 0,
        radius: 24,
        hp: 15000,
        maxHp: 15000,
        speed: 0,
        damage: 0,
        xpValue: 0,
        facingLeft: false,
        animFrame: 0,
        color: '#7e22ce',
        hitFlashTimer: 0,
        isDummy: true
      });
    }
  }

  public triggerFiringRangeLevelUp() {
    if (this.state !== 'PLAYING') return;
    this.triggerLevelUp();
  }

  public spawnFiringRangeWave() {
    for (let i = 0; i < 18; i++) {
      this.spawnSingleEnemy();
    }
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED' || this.state === 'CHEST_REWARD') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      this.animId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  public applyUpgrade(option: UpgradeOption) {
    if (this.lockedUpgrade && this.lockedUpgrade.id === option.id && this.lockedUpgrade.category === option.category) {
      this.lockedUpgrade = null;
    }
    if (option.category === 'STORE_HEALTH') {
      if (option.id === 'store_health_heal') {
        const healAmt = this.playerStats.maxHp * (option.healAmount || 0.65);
        this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + healAmt);
        sounds.playHeal();
        this.floatingTexts.push({
          id: this.textIdCounter++,
          x: this.playerX,
          y: this.playerY - 25,
          text: `+${Math.round(healAmt)} HP`,
          color: '#10b981',
          life: 0.8,
          maxLife: 0.8,
          isCrit: true
        });
      } else if (option.id === 'store_health_max') {
        const bonus = option.maxHpBonus || 35;
        this.playerStats.maxHp += bonus;
        this.playerStats.hp += bonus;
        sounds.playHeal();
        this.floatingTexts.push({
          id: this.textIdCounter++,
          x: this.playerX,
          y: this.playerY - 25,
          text: `+${bonus} MAX HP`,
          color: '#facc15',
          life: 0.8,
          maxLife: 0.8,
          isCrit: true
        });
      } else if (option.id === 'store_health_shield') {
        this.playerStats.maxShield = Math.max(this.playerStats.maxShield, 40) + 40;
        this.playerStats.shield = this.playerStats.maxShield;
        this.playerInvulnTimer = 3.0;
        sounds.playShieldBash();
        this.floatingTexts.push({
          id: this.textIdCounter++,
          x: this.playerX,
          y: this.playerY - 25,
          text: 'AEGIS BARRIER!',
          color: '#38bdf8',
          life: 0.8,
          maxLife: 0.8,
          isCrit: true
        });
      } else if (option.id === 'store_health_stimpack') {
        this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + this.playerStats.maxHp * 0.40);
        this.stimpackTimer = 20.0;
        sounds.playHeal();
        this.floatingTexts.push({
          id: this.textIdCounter++,
          x: this.playerX,
          y: this.playerY - 25,
          text: 'STIMPACK FRENZY!',
          color: '#f43f5e',
          life: 0.8,
          maxLife: 0.8,
          isCrit: true
        });
      }
    } else if (option.category === 'WEAPON') {
      const w = this.weapons[option.id as WeaponId];
      if (w) {
        w.level = option.level;
        if (option.rarity === 'evolution') {
          w.isEvolved = true;
          w.damage = Math.round(w.damage * 1.85);
          w.cooldown *= 0.65;
          sounds.playEvolution();
          this.floatingTexts.push({
            id: this.textIdCounter++,
            x: this.playerX,
            y: this.playerY - 30,
            text: 'WEAPON EVOLVED!',
            color: '#fbbf24',
            life: 1.0,
            maxLife: 1.0,
            isCrit: true
          });
        } else {
          sounds.playLevelUp();
        }
      }
    } else {
      const p = this.passives[option.id as PassiveId];
      if (p) {
        p.level = option.level;
        this.recalculatePassives();
        sounds.playLevelUp();
      }
    }

    this.state = 'PLAYING';
    this.lastTime = performance.now();
    this.animId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  public applyMultipleUpgrades(options: UpgradeOption[]) {
    options.forEach((opt) => {
      if (opt.category === 'STORE_HEALTH') {
        if (opt.id === 'store_health_heal') {
          this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + this.playerStats.maxHp * 0.65);
        } else if (opt.id === 'store_health_max') {
          const bonus = opt.maxHpBonus || 35;
          this.playerStats.maxHp += bonus;
          this.playerStats.hp += bonus;
        } else if (opt.id === 'store_health_shield') {
          this.playerStats.maxShield = Math.max(this.playerStats.maxShield, 40) + 40;
          this.playerStats.shield = this.playerStats.maxShield;
        } else if (opt.id === 'store_health_stimpack') {
          this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + this.playerStats.maxHp * 0.40);
          this.stimpackTimer = 20.0;
        }
      } else if (opt.category === 'WEAPON') {
        const w = this.weapons[opt.id as WeaponId];
        if (w) {
          w.level = opt.level;
          if (opt.rarity === 'evolution') {
            w.isEvolved = true;
            w.damage = Math.round(w.damage * 1.85);
            w.cooldown *= 0.65;
          }
        }
      } else {
        const p = this.passives[opt.id as PassiveId];
        if (p) p.level = opt.level;
      }
    });
    this.recalculatePassives();
    this.rewardSource = 'elite';
    this.state = 'PLAYING';
    this.lastTime = performance.now();
    this.animId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  private spawnReinforcementSquad() {
    const pref = this.armory.preferredBrother || 'auto';
    let leftType: SquadBrotherType = 'apothecary';
    let rightType: SquadBrotherType = 'devastator';

    if (pref === 'auto') {
      const pairs: [SquadBrotherType, SquadBrotherType][] = [
        ['apothecary', 'devastator'],
        ['librarian', 'techmarine'],
        ['apothecary', 'librarian'],
        ['techmarine', 'devastator']
      ];
      const chosen = pairs[Math.floor(Math.random() * pairs.length)];
      leftType = chosen[0];
      rightType = chosen[1];
    } else if (pref === 'librarian') {
      leftType = 'librarian';
      rightType = 'techmarine';
    } else if (pref === 'techmarine') {
      leftType = 'techmarine';
      rightType = 'librarian';
    } else if (pref === 'apothecary') {
      leftType = 'apothecary';
      rightType = 'devastator';
    } else {
      leftType = 'apothecary';
      rightType = 'devastator';
    }

    this.squadBrothers = [
      {
        id: 1,
        type: leftType,
        x: this.playerX - 42,
        y: this.playerY + 18,
        vx: 0,
        vy: 0,
        hp: 220,
        maxHp: 220,
        healCooldown: 1.5,
        shootCooldown: 1.8,
        turretCooldown: 8.0,
        facingLeft: false,
        animFrame: 0
      },
      {
        id: 2,
        type: rightType,
        x: this.playerX + 42,
        y: this.playerY + 18,
        vx: 0,
        vy: 0,
        hp: 250,
        maxHp: 250,
        healCooldown: 1.8,
        shootCooldown: 2.0,
        turretCooldown: 10.0,
        facingLeft: false,
        animFrame: 0.4
      }
    ];
  }

  public claimBossReward(option: UpgradeOption) {
    this.rewardSource = 'elite';
    if (option.category === 'SQUAD') {
      this.spawnReinforcementSquad();
      sounds.playPurchase();
      this.addBattleSpeechBubble(this.playerX, this.playerY, 'BATTLE-BROTHERS HAVE ARRIVED!', '#4ade80');
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      this.animId = requestAnimationFrame(this.gameLoop.bind(this));
      return;
    }
    this.applyUpgrade(option);
  }

  public getRewardSource() { return this.rewardSource; }

  private recalculatePassives() {
    const mastery = getChapterMasteryInfo(this.chapterMasteryXp);
    let maxHp = 130 + (this.armory.healthBonus * 12) + mastery.bonuses.hpBonus;
    if (this.chapter === 'ultramarines' || this.chapter === 'salamanders') maxHp += 20;

    let speed = 185 * (1 + this.armory.speedBonus * 0.04);
    if (this.chapter === 'blood_angels') speed *= 1.15;
    if (this.chapter === 'raven_guard') speed *= 1.20;

    let magnet = 165 + (this.armory.magnetBonus * 20);
    if (this.armory.servoSkullMode === 'collector') {
      magnet += 80 + (this.armory.servoSkullLevel || 0) * 25;
    }
    let cdMult = ((this.chapter === 'ultramarines' || this.chapter === 'iron_hands') ? 0.88 : 1.0) * (1 - mastery.bonuses.cooldownReductionPct);
    let dmgMult = ((this.chapter === 'dark_angels' || this.chapter === 'salamanders') ? 1.18 : 1.0) * (1 + mastery.bonuses.damageBonusPct / 100);
    if (this.activeOaths.includes('oath_vanguard')) dmgMult *= 1.25;
    if (this.activeRelics.includes('vulkan_sigil')) dmgMult *= 1.20;
    if (this.shrineBuffTimer > 0) dmgMult *= 1.25;

    let maxShield = this.chapter === 'imperial_fists' ? 50 : 0;
    let crit = 0.10 + (this.armory.critBonus * 0.03) + mastery.bonuses.critBonus;
    if (this.chapter === 'space_wolves') crit += 0.12;
    if (this.chapter === 'raven_guard') crit += 0.18;
    if (this.activeRelics.includes('pelt_fenris')) crit += 0.15;

    // Apply Sacred Codex Doctrine Talents
    if (this.talents) {
      const bastionRank = this.talents['macragge_bastion'] || 0;
      maxHp += bastionRank * 16;
      const shieldRank = this.talents['macragge_shield'] || 0;
      maxShield += shieldRank * 20;
      const speedRank = this.talents['baal_swiftness'] || 0;
      speed *= (1 + speedRank * 0.04);
      const critRank = this.talents['baal_fury'] || 0;
      crit += critRank * 0.03;
      const nocturneDmgRank = (this.talents['nocturne_promethium'] || 0) + (this.talents['nocturne_archeotech'] || 0);
      dmgMult *= (1 + nocturneDmgRank * 0.05);
    }

    const plateLvl = this.passives.adamantine_plate.level;
    if (plateLvl > 0) {
      const hpBonus = [0, 40, 80, 130, 180, 300][plateLvl] || 0;
      maxHp += hpBonus;
    }

    const sealsLvl = this.passives.purity_seals.level;
    if (sealsLvl > 0) {
      const speedMult = 1 + [0, 0.15, 0.27, 0.39, 0.50, 0.65][sealsLvl];
      speed *= speedMult;
    }

    const auspexLvl = this.passives.auspex_scanner.level;
    if (auspexLvl > 0) {
      const magnetMult = 1 + [0, 0.50, 0.90, 1.30, 1.80, 2.80][auspexLvl];
      magnet *= magnetMult;
    }

    const doctrineLvl = this.passives.tactical_doctrine.level;
    if (doctrineLvl > 0) {
      cdMult *= 1 - [0, 0.10, 0.18, 0.26, 0.33, 0.42][doctrineLvl];
    }

    const zealLvl = this.passives.emperor_wrath.level;
    if (zealLvl > 0) {
      dmgMult *= 1 + [0, 0.20, 0.40, 0.60, 0.80, 1.15][zealLvl];
      if (zealLvl >= 4) crit += 0.12;
    }

    const haloLvl = this.passives.iron_halo.level;
    if (haloLvl > 0) {
      maxShield = [0, 40, 70, 110, 150, 200][haloLvl];
      if (this.playerStats.shield === 0) {
        this.playerStats.shield = maxShield;
      }
    }

    const hpRatio = this.playerStats.hp / this.playerStats.maxHp;
    this.playerStats.maxHp = maxHp;
    this.playerStats.hp = Math.min(maxHp, Math.round(maxHp * Math.max(0.4, hpRatio)));
    this.playerStats.maxShield = maxShield;
    this.playerStats.moveSpeed = speed;
    this.playerStats.magnetRange = magnet;
    this.playerStats.cooldownMult = cdMult;
    this.playerStats.damageMult = dmgMult;
    this.playerStats.critChance = crit;
  }

  // --- Core Game Loop ---
  private gameLoop(timestamp: number) {
    if (this.state !== 'PLAYING') {
      return;
    }

    let dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    // Cinematic Boss Finisher Slow-Motion
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= dt;
      dt *= 0.18;
    }

    // Hit-Stop Micro-Freeze (gives immense crunch to boss hits)
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      this.render();
      this.animId = requestAnimationFrame(this.gameLoop.bind(this));
      return;
    }

    this.update(dt);
    this.render();

    this.animId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(dt: number) {
    this.elapsedGameTime += dt;
    if (this.maxGameTime > 0) {
      this.remainingTime = Math.max(0, this.maxGameTime - this.elapsedGameTime);
      if (this.remainingTime <= 0) {
        this.triggerGameOver(true);
        return;
      }
    }

    // 1. Process Dash & Ultimate Cooldowns
    if (this.dashCooldown > 0) {
      this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    }

    // Process Roving Tech-Priest / Munitorum Drop Pod at 180s (3:00)
    if (this.elapsedGameTime >= 180 && !this.techPriestSpawned && this.gameMode !== 'firing_range') {
      this.techPriestSpawned = true;
      sounds.playProximityKlaxon();
      this.obstacles.push({
        id: `roving_tech_priest_${Date.now()}`,
        x: this.playerX + (Math.random() < 0.5 ? -180 : 180),
        y: this.playerY + (Math.random() < 0.5 ? -180 : 180),
        radius: 30,
        variant: 'tech_priest',
        blocksMovement: false,
        blocksProjectiles: false,
        shrineProgress: 0,
        blessed: false
      });
      this.addBattleSpeechBubble(this.playerX, this.playerY, '⚙️ MUNITORUM TECH-PRIEST DROP POD ARRIVED!', '#eab308');
    }

    // Process Hive Fleet Leviathan Wave Mutators
    this.mutatorCycleTimer -= dt;
    if (this.mutatorCycleTimer <= 0 && this.gameMode !== 'firing_range') {
      this.mutatorCycleTimer = 65;
      const mutators: Array<HiveMutatorInfo> = [
        {
          id: 'hardened_chitin',
          name: '🛡️ HARDENED CHITIN',
          desc: 'Musuh menyerap +30% kerosakan peluru kinetik!',
          active: true,
          color: '#a855f7',
          duration: 30
        },
        {
          id: 'adrenal_surge',
          name: '⚡ ADRENAL SURGE',
          desc: 'Kawanan Xenos meluru laju (+25% Move Speed)!',
          active: true,
          color: '#ef4444',
          duration: 25
        },
        {
          id: 'spore_eclipse',
          name: '🌑 SPORE ECLIPSE',
          desc: 'Gerhana spora menyelubungi medan perang. Lampu suluh diaktifkan!',
          active: true,
          color: '#10b981',
          duration: 25
        }
      ];
      const chosen = mutators[Math.floor(Math.random() * mutators.length)];
      this.activeMutator = chosen;
      sounds.playProximityKlaxon();
      this.addBattleSpeechBubble(this.playerX, this.playerY, `⚠️ LEVIATHAN MUTATION: ${chosen.name}`, chosen.color);
    }
    if (this.activeMutator) {
      this.activeMutator.duration -= dt;
      if (this.activeMutator.duration <= 0) {
        this.activeMutator = null;
      }
    }
    if (this.ultimateCooldown > 0) {
      this.ultimateCooldown = Math.max(0, this.ultimateCooldown - dt);
    }
    if (this.relicPodCooldown > 0) {
      this.relicPodCooldown = Math.max(0, this.relicPodCooldown - dt);
    }
    if (this.overdriveTimer > 0) {
      this.overdriveTimer = Math.max(0, this.overdriveTimer - dt);
    }
    if (this.playerToxicSlowTimer > 0) {
      this.playerToxicSlowTimer = Math.max(0, this.playerToxicSlowTimer - dt);
    }
    if (this.toxicAuraDamageTick > 0) {
      this.toxicAuraDamageTick = Math.max(0, this.toxicAuraDamageTick - dt);
    }
    if (this.dropPodIntroTimer > 0) {
      this.dropPodIntroTimer = Math.max(0, this.dropPodIntroTimer - dt);
      if (this.dropPodIntroTimer <= 0.45 && !this.dropPodImpactDone) {
        this.dropPodImpactDone = true;
        sounds.playDreadnoughtStomp();
        this.addTrauma(0.70);
        this.screenShakeAmount = 16;
        this.triggerHaptic([45, 25, 70]);
        this.addBattleSpeechBubble(this.playerX, this.playerY, '🚀 DROP POD LANDED: PURGE THE HIVE!', '#fbbf24');
        for (let p = 0; p < 20; p++) {
          const ang = (p * Math.PI * 2) / 20;
          const spd = 70 + Math.random() * 120;
          this.particles.push({
            x: this.playerX,
            y: this.playerY + 8,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 0.4,
            maxLife: 0.4,
            color: p % 2 === 0 ? '#fbbf24' : '#94a3b8',
            size: 5 + Math.random() * 3
          });
        }
      }
    }

    this.ensureObstaclesAroundPlayer();

    let moveX = this.inputDir.x;
    let moveY = this.inputDir.y;

    if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) moveY -= 1;
    if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) moveY += 1;
    if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) moveX -= 1;
    if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) moveX += 1;

    if (this.dropPodIntroTimer > 0.45) {
      moveX = 0;
      moveY = 0;
    }

    let len = Math.hypot(moveX, moveY);
    let normX = len > 0 ? moveX / len : (this.playerFacingLeft ? -1 : 1);
    let normY = len > 0 ? moveY / len : 0;

    let currentSpeed = this.playerStats.moveSpeed;
    // Blood Angels Red Thirst: up to +25% bonus speed when HP is low
    if (this.chapter === 'blood_angels' && this.playerStats.hp < this.playerStats.maxHp) {
      const missingRatio = 1 - Math.max(0, this.playerStats.hp / this.playerStats.maxHp);
      currentSpeed *= 1 + missingRatio * 0.25;
    }
    if (this.isZealActive) currentSpeed *= 1.20; // +20% move speed during Emperor's Zeal
    if (this.overdriveTimer > 0) currentSpeed *= 1.20; // +20% move speed during Tactical Overdrive
    if (this.playerToxicSlowTimer > 0 && !this.isDashing) currentSpeed *= 0.85; // Toxicrene spore aura slow
    if (this.stimpackTimer > 0) {
      this.stimpackTimer -= dt;
      currentSpeed *= 1.25; // +25% stimpack burst
    }

    // Keep mouse world position updated as camera moves with player
    if (this.aimMode !== 'auto') {
      this.mouseWorldX = this.playerX + (this.mouseScreenX - this.canvas.width / 2);
      this.mouseWorldY = this.playerY + (this.mouseScreenY - this.canvas.height / 2);
    }

    if (this.isDashing) {
      this.dashTimer -= dt;
      currentSpeed *= 2.8; // Burst speed
      this.playerX += normX * currentSpeed * dt;
      this.playerY += normY * currentSpeed * dt;

      // Offensive Astartes Charge: knockback and damage enemies collided during dash
      for (const enemy of [...this.enemies]) {
        const dx = enemy.x - this.playerX;
        const dy = enemy.y - this.playerY;
        const dist = Math.hypot(dx, dy);
        if (dist < enemy.radius + 26) {
          const kLen = dist || 1;
          const pushDist = (enemy.type === 'carnifex_boss' || enemy.type === 'hive_tyrant') ? 10 : 34;
          enemy.x += (dx / kLen) * pushDist;
          enemy.y += (dy / kLen) * pushDist;
          if (!this.dashHitEnemyIds.has(enemy.id)) {
            this.dashHitEnemyIds.add(enemy.id);
            this.damageEnemy(enemy, 38 * this.playerStats.damageMult, false, '#38bdf8');
          }
        }
      }

      // Spawn afterimage ghost
      if (Math.random() < 0.6) {
        this.afterimages.push({
          x: this.playerX,
          y: this.playerY,
          facingLeft: this.playerFacingLeft,
          alpha: 0.55
        });
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    } else if (len > 0) {
      const curDirX = moveX / len;
      const curDirY = moveY / len;

      // Heavy Power Armour skidding dust when reversing horizontal/vertical movement
      const dot = this.prevMoveDirX * curDirX + this.prevMoveDirY * curDirY;
      if (dot < -0.35 && (Math.abs(this.prevMoveDirX) > 0.1 || Math.abs(this.prevMoveDirY) > 0.1)) {
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            x: this.playerX + (Math.random() - 0.5) * 16,
            y: this.playerY + 26,
            vx: -curDirX * (45 + Math.random() * 35) + (Math.random() - 0.5) * 20,
            vy: -8 - Math.random() * 12,
            life: 0.28,
            maxLife: 0.28,
            color: '#94a3b8',
            size: 3.5
          });
        }
      }
      this.prevMoveDirX = curDirX;
      this.prevMoveDirY = curDirY;

      this.playerX += curDirX * currentSpeed * dt;
      this.playerY += curDirY * currentSpeed * dt;
      
      const prevStep = Math.floor(this.playerWalkTimer * 4.5);
      this.playerWalkTimer += dt;
      const currStep = Math.floor(this.playerWalkTimer * 4.5);
      
      // Spawn tactical footstep dust puff on boot impact
      if (currStep > prevStep) {
        const isLeftFoot = currStep % 2 === 0;
        const footOffsetX = (isLeftFoot ? -10 : 10) * (this.playerFacingLeft ? -1 : 1);
        this.particles.push({
          x: this.playerX + footOffsetX,
          y: this.playerY + 26,
          vx: (Math.random() - 0.5) * 18,
          vy: -6 - Math.random() * 8,
          life: 0.22,
          maxLife: 0.22,
          color: '#64748b',
          size: 3
        });
      }

      if (this.aimMode === 'auto') {
        if (moveX < -0.1) this.setPlayerFacing(true);
        else if (moveX > 0.1) this.setPlayerFacing(false);
      }
    } else {
      this.prevMoveDirX = 0;
      this.prevMoveDirY = 0;
    }

    // Resolve Player vs Battlefield Obstacles collision & Interactive Shrines
    for (const obs of this.obstacles) {
      const dx = this.playerX - obs.x;
      const dy = this.playerY - obs.y;
      const dist = Math.hypot(dx, dy);

      if (obs.variant === 'statue' && !obs.blessed) {
        if (dist < obs.radius + 36) {
          obs.shrineProgress = Math.min(1, (obs.shrineProgress || 0) + dt / 2.2);
          if (obs.shrineProgress >= 1) {
            obs.blessed = true;
            this.shrineBuffTimer = 30.0;
            this.puritySealsEarned += 15;
            this.playerStats.maxShield = Math.max(this.playerStats.maxShield, 40);
            this.playerStats.shield = this.playerStats.maxShield;
            this.recalculatePassives();
            sounds.playEvolution();
            this.addBattleSpeechBubble(this.playerX, this.playerY, '✨ EMPEROR\'S BENEDICTION! (+25% DMG & +15 SEALS)', '#fbbf24');
          }
        } else if (obs.shrineProgress && obs.shrineProgress > 0) {
          obs.shrineProgress = Math.max(0, obs.shrineProgress - dt * 0.3);
        }
      } else if (obs.variant === 'tech_shrine' && !obs.blessed) {
        if (dist < obs.radius + 36) {
          obs.shrineProgress = Math.min(1, (obs.shrineProgress || 0) + dt / 2.5);
          if (obs.shrineProgress >= 1) {
            obs.blessed = true;
            this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 30);
            this.playerStats.maxShield = Math.max(this.playerStats.maxShield, 45);
            this.playerStats.shield = this.playerStats.maxShield;
            sounds.playEvolution();
            this.triggerHaptic([25, 20, 45]);

            const upgradableOwned = Object.values(this.weapons).filter(w => w.level > 0 && w.level < w.maxLevel);
            const evolvableOwned = Object.values(this.weapons).filter(w => {
              if (w.level < 5 || w.isEvolved) return false;
              const evo = WEAPON_EVOLUTIONS[w.id];
              return !!(evo && this.passives[evo.passive]?.level > 0);
            });

            if (upgradableOwned.length > 0) {
              const chosen = upgradableOwned[Math.floor(Math.random() * upgradableOwned.length)];
              chosen.level += 1;
              this.addBattleSpeechBubble(
                this.playerX,
                this.playerY,
                `⚙️ FORGE SHRINE: ${chosen.name.toUpperCase()} LV${chosen.level}!`,
                '#fb923c'
              );
            } else if (evolvableOwned.length > 0) {
              const chosen = evolvableOwned[0];
              chosen.isEvolved = true;
              chosen.damage = Math.round(chosen.damage * 1.85);
              chosen.cooldown *= 0.65;
              const evoName = WEAPON_EVOLUTIONS[chosen.id]?.name || chosen.name;
              this.addBattleSpeechBubble(
                this.playerX,
                this.playerY,
                `⚙️ OMNISSIAH MIRACLE: ${evoName.toUpperCase()} ★EVO★!`,
                '#fbbf24'
              );
            } else {
              this.puritySealsEarned += 20;
              this.stimpackTimer = Math.max(this.stimpackTimer, 12.0);
              this.addBattleSpeechBubble(
                this.playerX,
                this.playerY,
                '⚙️ FORGE BLESSING: +20 SEALS & STIMPACK!',
                '#fb923c'
              );
            }
          }
        } else if (obs.shrineProgress && obs.shrineProgress > 0) {
          obs.shrineProgress = Math.max(0, obs.shrineProgress - dt * 0.3);
        }
      } else if (obs.variant === 'tech_priest' && !obs.blessed) {
        if (dist < obs.radius + 38) {
          obs.shrineProgress = Math.min(1, (obs.shrineProgress || 0) + dt / 1.8);
          if (obs.shrineProgress >= 1) {
            obs.blessed = true;
            this.playerStats.hp = this.playerStats.maxHp;
            this.playerStats.shield = this.playerStats.maxShield;
            this.puritySealsEarned += 25;
            sounds.playEvolution();
            this.triggerHaptic([30, 25, 45]);
            this.addBattleSpeechBubble(
              this.playerX,
              this.playerY,
              '⚙️ TECH-PRIEST: MUNITORUM DROP POD CLAIMED! (+25 SEALS & FULL REPAIR)',
              '#eab308'
            );
          }
        } else if (obs.shrineProgress && obs.shrineProgress > 0) {
          obs.shrineProgress = Math.max(0, obs.shrineProgress - dt * 0.3);
        }
      } else if (obs.variant === 'cruiser_console') {
        if (dist < obs.radius + 36) {
          obs.shrineProgress = Math.min(1, (obs.shrineProgress || 0) + dt / 2.0);
          if (obs.shrineProgress >= 1) {
            obs.shrineProgress = 0; // reset for next barrage
            sounds.playOrbitalSiren();
            this.screenShakeAmount = 14;
            this.addBattleSpeechBubble(this.playerX, this.playerY, '⚡ POINT-DEFENSE TURRET BARRAGE!', '#38bdf8');
            // Fire defensive barrage at nearby enemies
            const nearby = this.enemies.filter(e => Math.hypot(e.x - obs.x, e.y - obs.y) < 420);
            for (const ne of nearby) {
              this.projectiles.push({
                id: this.projIdCounter++,
                type: 'bolter',
                x: obs.x,
                y: obs.y,
                vx: (ne.x - obs.x) * 2.5,
                vy: (ne.y - obs.y) * 2.5,
                radius: 6,
                damage: 85 * this.playerStats.damageMult,
                duration: 0.8,
                maxDuration: 0.8,
                pierce: 2,
                piercedEnemyIds: new Set(),
                color: '#38bdf8'
              });
            }
          }
        } else if (obs.shrineProgress && obs.shrineProgress > 0) {
          obs.shrineProgress = Math.max(0, obs.shrineProgress - dt * 0.3);
        }
      }

      if (!obs.blocksMovement) continue;
      const minDist = obs.radius + 15;
      if (dist < minDist && dist > 0.001) {
        this.playerX = obs.x + (dx / dist) * minDist;
        this.playerY = obs.y + (dy / dist) * minDist;
      }
    }

    if (this.shrineBuffTimer > 0) {
      this.shrineBuffTimer -= dt;
      if (this.shrineBuffTimer <= 0) {
        this.recalculatePassives();
      }
    }

    // Iron Hands Bionic Auto-Repair (+3.5 HP/s)
    if (this.chapter === 'iron_hands' && this.playerStats.hp < this.playerStats.maxHp) {
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 3.5 * dt);
    }

    // Wargear Relic: Standard of Macragge (Orbital lightning every 4s + +8 Shield)
    if (this.activeRelics.includes('relic_macragge')) {
      this.relicMacraggeTimer -= dt;
      if (this.relicMacraggeTimer <= 0) {
        this.relicMacraggeTimer = 4.0;
        this.triggerChainLightning(this.playerX, this.playerY, 4, 145 * this.playerStats.damageMult, 'thunder_hammer');
        if (this.playerStats.maxShield > 0) {
          this.playerStats.shield = Math.min(this.playerStats.maxShield, this.playerStats.shield + 8);
        }
      }
    }

    // Thunderhawk Gunship Extraction Zone (Final 30 Seconds of Countdown)
    if (this.maxGameTime > 0 && this.remainingTime <= 30 && this.remainingTime > 0) {
      if (!this.extractionZone) {
        const ang = Math.random() * Math.PI * 2;
        this.extractionZone = {
          x: this.playerX + Math.cos(ang) * 180,
          y: this.playerY + Math.sin(ang) * 180,
          radius: 135,
          inside: false,
          airstrikeTimer: 1.2
        };
        sounds.playLevelUp();
        this.addBattleSpeechBubble(this.playerX, this.playerY, '🚁 THUNDERHAWK INBOUND! HOLD EXTRACTION ZONE!', '#34d399');
      }
      const dExt = Math.hypot(this.playerX - this.extractionZone.x, this.playerY - this.extractionZone.y);
      this.extractionZone.inside = dExt <= this.extractionZone.radius;
      if (this.extractionZone.inside) {
        // Holding the extraction zone grants shield & HP sustain + Thunderhawk aerial gunship support!
        this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 6 * dt);
        if (this.playerStats.maxShield > 0) {
          this.playerStats.shield = Math.min(this.playerStats.maxShield, this.playerStats.shield + 12 * dt);
        }
        this.extractionZone.airstrikeTimer -= dt;
        if (this.extractionZone.airstrikeTimer <= 0) {
          this.extractionZone.airstrikeTimer = 1.6;
          const target = this.getClosestEnemies(1)[0];
          if (target) {
            this.orbitalStrikes.push({
              id: this.effectIdCounter++,
              x: target.x,
              y: target.y,
              timer: 0.4,
              maxTimer: 0.4,
              radius: 95,
              hasDamaged: false
            });
          }
        }
      }
    }

    // 2. Update Afterimages
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      const img = this.afterimages[i];
      img.alpha -= dt * 2.8;
      if (img.alpha <= 0) {
        this.afterimages.splice(i, 1);
      }
    }

    // 3. Purge Streak & Emperor's Zeal Timer
    if (this.streakTimer > 0) {
      this.streakTimer -= dt;
      if (this.streakTimer <= 0) {
        this.streakCount = 0;
        this.isZealActive = false;
      }
    }

    // 4. Low HP Heartbeat Audio & Warning
    if (this.playerStats.hp / this.playerStats.maxHp <= 0.3) {
      this.heartbeatSoundTimer -= dt;
      if (this.heartbeatSoundTimer <= 0) {
        sounds.playHeartbeat();
        this.heartbeatSoundTimer = 0.85;
      }
    }

    // 5. Ambient Lightning & Ash
    this.ambientLightningTimer -= dt;
    if (this.ambientLightningTimer <= 0) {
      this.ambientLightningTimer = 6.0 + Math.random() * 8.0;
      this.ambientLightningFlash = 0.28;
    }
    if (this.ambientLightningFlash > 0) {
      this.ambientLightningFlash = Math.max(0, this.ambientLightningFlash - dt * 2.5);
    }

    // Drift atmospheric ash
    for (const ash of this.ashParticles) {
      ash.x += ash.vx * dt;
      ash.y += ash.vy * dt;
      if (ash.x < this.playerX - 900) ash.x = this.playerX + 900;
      if (ash.y > this.playerY + 700) ash.y = this.playerY - 700;
    }

    // 6. Shield & Invulnerability recovery
    if (this.playerInvulnTimer > 0) this.playerInvulnTimer -= dt;
    if (this.playerHurtTimer > 0) this.playerHurtTimer -= dt;
    if (this.playerShootTimer > 0) this.playerShootTimer -= dt;
    if (this.playerTurnSquashTimer > 0) this.playerTurnSquashTimer -= dt;
    if (this.playerMeleeSlashTimer > 0) this.playerMeleeSlashTimer -= dt;
    if (this.bracedTimer > 0) {
      this.bracedTimer -= dt;
      this.playerIsBraced = this.bracedTimer > 0;
    } else {
      this.playerIsBraced = false;
    }
    if (this.playerOverheatHeat > 0) {
      this.playerOverheatHeat = Math.max(0, this.playerOverheatHeat - dt * 0.28);
    }

    if (this.playerStats.maxShield > 0) {
      if (this.playerStats.shieldDelayTimer > 0) {
        this.playerStats.shieldDelayTimer -= dt;
      } else if (this.playerStats.shield < this.playerStats.maxShield) {
        this.playerStats.shield = Math.min(
          this.playerStats.maxShield,
          this.playerStats.shield + this.playerStats.shieldRegenRate * dt
        );
      }
    }

    // 6.5 Audio Ducking during low HP crisis or dramatic Slow-Mo execution
    const isLowHp = this.playerStats.hp / this.playerStats.maxHp < 0.25;
    sounds.setDucking(isLowHp || this.slowMoTimer > 0);

    // Gamepad controller input polling
    this.pollGamepad();

    // Glitch & Chromatic Aberration decay
    if (this.chromaticAberrationTimer > 0) {
      this.chromaticAberrationTimer -= dt;
    }

    // Dynamic music combat intensity based on swarm threat
    const hasBoss = this.enemies.some(e => e.type === 'carnifex_boss' || e.type === 'hive_tyrant' || e.type === 'trygon_prime');
    const threatLevel = Math.min(1.0, this.enemies.length / 55 + (hasBoss ? 0.45 : 0) + (this.isZealActive ? 0.3 : 0));
    sounds.setCombatIntensity(threatLevel);

    // Update Pixel Explosions
    for (let i = this.pixelExplosions.length - 1; i >= 0; i--) {
      const exp = this.pixelExplosions[i];
      exp.life -= dt;

      // Secondary micro-bursts for heavy ordnance
      if (exp.life <= 0.22 && (exp.secondaryPops || 0) > 0) {
        exp.secondaryPops = (exp.secondaryPops || 0) - 1;
        const subX = exp.x + (Math.random() - 0.5) * exp.radius * 0.9;
        const subY = exp.y + (Math.random() - 0.5) * exp.radius * 0.9;
        this.pixelExplosions.push({
          id: this.effectIdCounter++,
          x: subX,
          y: subY,
          radius: Math.max(12, Math.floor(exp.radius * 0.45)),
          life: 0.26,
          maxLife: 0.26,
          color: exp.color,
          secondaryPops: 0
        });
      }

      if (exp.life <= 0) {
        this.pixelExplosions.splice(i, 1);
      }
    }

    // 7. Trauma-based Screen shake decay
    if (this.shakeTrauma > 0) {
      this.shakeTrauma = Math.max(0, this.shakeTrauma - dt * 1.5);
    }
    if (this.screenShakeAmount > 0) {
      this.screenShakeAmount = Math.max(0, this.screenShakeAmount - dt * 25);
    }

    // 8. Update Weapons
    this.updateWeapons(dt);

    // 9. Update Support Servo-Skull Companion
    this.updateServoSkull(dt);

    // 9.5 Update Dreadnought Combat
    this.updateDreadnought(dt);

    // 9.6 Update Squad Battle-Brothers AI
    this.updateSquadBrothers(dt);

    // Battlefield powerups, missions and wave director.
    this.updateBattlefieldEvents(dt);

    // 9.7 Update Orbital Strikes
    this.updateOrbitalStrikes(dt);

    // 9.8 Update Comic Speech Bubbles
    this.updateBattleSpeechBubbles(dt);

    // 10. Update Interactive Objects (Promethium Barrels & Tarantula Sentry Turrets)
    this.updateInteractiveObjects(dt);

    // 11. Update Special Systems (Vortices, Shockwaves, Ground Hazards, Beams)
    this.updateVortices(dt);
    this.updateShockwaves(dt);
    this.updateGroundHazards(dt);
    this.updateBeamVisuals(dt);

    // 12. Spawn Director
    this.spawnDirector(dt);

    // Burning enemies take regular damage; vortex marks & shredded carapace timers decay.
    for (const enemy of [...this.enemies]) {
      if (enemy.vortexMarkedTimer) enemy.vortexMarkedTimer = Math.max(0, enemy.vortexMarkedTimer - dt);
      if (enemy.shreddedTimer) enemy.shreddedTimer = Math.max(0, enemy.shreddedTimer - dt);
      if (enemy.stunTimer) enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
      if (enemy.burningTimer && enemy.burningTimer > 0) {
        enemy.burningTimer -= dt;
        enemy.burningTick = (enemy.burningTick || 0) + dt;
        if (enemy.burningTick >= 0.5) {
          enemy.burningTick = 0;
          const isEvolvedFlamer = !!this.weapons.heavy_flamer?.isEvolved;
          this.lastDamageWeapon = 'heavy_flamer';
          this.damageEnemy(enemy, (isEvolvedFlamer ? 18 : 9) * this.playerStats.damageMult, false, isEvolvedFlamer ? '#38bdf8' : '#fb923c');
        }
      }
    }

    // 13. Update Enemies
    this.updateEnemies(dt);

    // 13.5 Rebuild 2D Spatial Hash Grid for O(1) collision lookups
    this.enemySpatialGrid.clear();
    for (let ei = 0; ei < this.enemies.length; ei++) {
      const e = this.enemies[ei];
      if (e.burrowState !== 'burrowed') {
        this.enemySpatialGrid.insert(e);
      }
    }

    // 14. Update Projectiles
    this.updateProjectiles(dt);

    // 15. Check Relic Chests Proximity
    this.updateRelicChests(dt);

    // 15. Update Biomass Orbs
    this.updateBiomass(dt);

    // 16. Update Particles, Blood Splatters, Chitin Shards & Floating Text
    this.updateParticles(dt);

    // 17. HUD Callback
    const streakTimerPct = this.streakTimer > 0 ? this.streakTimer / this.maxStreakTimer : 0;
    const dashCooldownPct = this.dashCooldown > 0 ? this.dashCooldown / this.maxDashCooldown : 0;
    const ultimateCooldownPct = this.ultimateCooldown > 0 ? this.ultimateCooldown / this.maxUltimateCooldown : 0;
    const dreadnoughtTimerPct = this.dreadnought.isActive ? this.dreadnought.timer / this.dreadnought.maxTimer : 0;

    // Build Auspex Minimap Radar Blips (within 650px radar range)
    const radarRange = 650;
    const minimapBlips: MinimapBlip[] = [];
    for (const chest of this.relicChests) {
      const dx = (chest.x - this.playerX) / radarRange;
      const dy = (chest.y - this.playerY) / radarRange;
      if (Math.hypot(dx, dy) <= 1) minimapBlips.push({ dx, dy, kind: 'chest' });
    }
    for (const obj of this.interactiveObjects) {
      if (obj.type === 'barrel') continue;
      const dx = (obj.x - this.playerX) / radarRange;
      const dy = (obj.y - this.playerY) / radarRange;
      if (Math.hypot(dx, dy) <= 1) minimapBlips.push({ dx, dy, kind: 'beacon' });
    }
    for (const obs of this.obstacles) {
      if (!obs.blocksMovement) continue;
      const dx = (obs.x - this.playerX) / radarRange;
      const dy = (obs.y - this.playerY) / radarRange;
      if (Math.hypot(dx, dy) <= 0.95) minimapBlips.push({ dx, dy, kind: 'obstacle' });
    }
    let enemyBlipCount = 0;
    const activeBosses: ActiveBossInfo[] = [];
    for (const enemy of this.enemies) {
      if (
        enemy.type === 'carnifex_boss' ||
        enemy.type === 'hive_tyrant' ||
        enemy.type === 'trygon_prime' ||
        enemy.type === 'broodlord'
      ) {
        activeBosses.push({
          id: enemy.id,
          name: enemy.isDummy
            ? 'CARNIFEX TARGET DUMMY'
            : enemy.type === 'hive_tyrant'
            ? 'HIVE TYRANT SUPREME WARLORD'
            : enemy.type === 'trygon_prime'
            ? 'TRYGON PRIME SUBTERRANEAN TITAN'
            : enemy.type === 'broodlord'
            ? 'GENESTEALER BROODLORD ALPHA'
            : 'CARNIFEX HIVE BEHEMOTH',
          type: enemy.type,
          hp: Math.ceil(enemy.hp),
          maxHp: Math.ceil(enemy.maxHp),
          isEnraged: !!enemy.isEnraged
        });
      }
      const dx = (enemy.x - this.playerX) / radarRange;
      const dy = (enemy.y - this.playerY) / radarRange;
      if (Math.hypot(dx, dy) <= 1) {
        if (
          enemy.type === 'carnifex_boss' ||
          enemy.type === 'hive_tyrant' ||
          enemy.type === 'trygon_prime' ||
          enemy.type === 'broodlord'
        ) {
          minimapBlips.push({ dx, dy, kind: 'boss' });
        } else if (enemyBlipCount < 30) {
          minimapBlips.push({ dx, dy, kind: 'enemy' });
          enemyBlipCount++;
        }
      }
    }

    const furyPct = Math.min(1, Math.max(0, this.furyMeter / 100));
    const overdrivePct = this.overdriveTimer > 0 ? this.overdriveTimer / this.maxOverdriveTimer : 0;

    this.callbacks.onStatsUpdate({
      hp: Math.ceil(this.playerStats.hp),
      maxHp: this.playerStats.maxHp,
      shield: Math.ceil(this.playerStats.shield),
      maxShield: this.playerStats.maxShield,
      xp: Math.floor(this.playerXp),
      xpNeeded: this.xpToNextLevel,
      level: this.playerLevel,
      time: Math.floor(this.elapsedGameTime),
      remainingTime: Math.ceil(this.remainingTime),
      maxGameTime: this.maxGameTime,
      kills: this.killCount,
      streakCount: this.streakCount,
      streakTimerPct,
      isZealActive: this.isZealActive,
      dashCooldownPct,
      ultimateCooldownPct,
      dreadnoughtTimerPct,
      activeTrial: this.activeTrial ? { ...this.activeTrial } : null,
      activeHiveEvent: this.activeHiveEvent ? { ...this.activeHiveEvent } : null,
      minimapBlips,
      activeBosses,
      activeRelics: [...this.activeRelics],
      activeOaths: [...this.activeOaths],
      extractionZone: this.extractionZone ? { ...this.extractionZone } : null,
      gameMode: this.gameMode,
      furyPct,
      overdrivePct,
      activeMutator: this.activeMutator ? { ...this.activeMutator } : null
    });
  }

  // --- Support Servo-Skull Companion ---
  private updateServoSkull(dt: number) {
    this.servoSkull.hoverAngle += dt * 3.5;

    // Follow offset: hover ~32px behind and 24px above player
    const targetX = this.playerX + (this.playerFacingLeft ? 34 : -34);
    const targetY = this.playerY - 26;

    this.servoSkull.x += (targetX - this.servoSkull.x) * dt * 5;
    this.servoSkull.y += (targetY - this.servoSkull.y) * dt * 5;

    const skullLvl = this.armory.servoSkullLevel || 0;
    const skullMode = this.armory.servoSkullMode || 'laser';

    // Laser / Cryo attack on closest enemy within 250px
    this.servoSkull.laserCooldown -= dt;
    if (this.servoSkull.laserCooldown <= 0) {
      const closest = this.getClosestEnemiesTo(this.servoSkull.x, this.servoSkull.y, 1)[0];
      if (closest && Math.hypot(closest.x - this.servoSkull.x, closest.y - this.servoSkull.y) < 250) {
        this.servoSkull.laserCooldown = Math.max(0.18, 0.38 - skullLvl * 0.035);
        sounds.playServoZap();

        const beamColor = skullMode === 'cryo' ? '#38bdf8' : (skullMode === 'collector' ? '#fbbf24' : '#ef4444');
        this.laserBeams.push({
          x1: this.servoSkull.x,
          y1: this.servoSkull.y,
          x2: closest.x,
          y2: closest.y,
          life: 0.12,
          maxLife: 0.12,
          color: beamColor,
          width: 3.5
        });

        if (skullMode === 'cryo') {
          closest.stunTimer = Math.max(closest.stunTimer || 0, 1.2 + skullLvl * 0.25);
        }

        const dmg = Math.round((25 + skullLvl * 8) * this.playerStats.damageMult);
        this.damageEnemy(closest, dmg, false, beamColor);
      }
    }
  }

  private getClosestEnemiesTo(x: number, y: number, count: number): Enemy[] {
    return this.enemies
      .filter(e => e.burrowState !== 'burrowed')
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
      .slice(0, count);
  }

  // --- Relic Chests (Imperial Drop Pods) ---
  private updateRelicChests(dt: number) {
    for (let i = this.relicChests.length - 1; i >= 0; i--) {
      const chest = this.relicChests[i];
      chest.beaconTimer += dt;

      const dist = Math.hypot(this.playerX - chest.x, this.playerY - chest.y);
      if (dist < 32) {
        // Collect chest!
        this.relicChests.splice(i, 1);
        this.triggerRelicChest(chest.source || 'elite');
        break;
      }
    }
  }

  private triggerRelicChest(source: 'elite' | 'boss' | 'supply') {
    this.rewardSource = source;
    this.state = 'CHEST_REWARD';
    sounds.playChestOpen();
    this.triggerHaptic([25, 20, 40]);

    // Jackpot Roulette: Boss lets you pick 1 of 3; Elite/Supply rolls 1x (45%), 3x (40%), or 5x Jackpot (15% / 35%)!
    let jackpotCount: 1 | 3 | 5 = 3;
    if (source !== 'boss') {
      const r = Math.random();
      if (source === 'supply') {
        jackpotCount = r < 0.35 ? 5 : (r < 0.85 ? 3 : 1);
      } else {
        jackpotCount = r < 0.16 ? 5 : (r < 0.55 ? 3 : 1);
      }
    }
    this.lastJackpotCount = jackpotCount;

    const maxW = this.activeOaths.includes('oath_penance') ? 4 : 6;
    const options = generateUpgradeChoices(this.weapons, this.passives, null, this.banishedIds, jackpotCount, maxW);
    if (source !== 'boss') {
      this.callbacks.onRelicChest(options, jackpotCount);
      return;
    }
    // A boss chest always presents three distinct paths: weapon, gear, and squad.
    const weapon = options.find(o => o.category === 'WEAPON') ||
      Object.values(this.weapons).filter(w => w.level > 0 && w.level < w.maxLevel).map(w => ({
        id: w.id, category: 'WEAPON' as const, name: w.name,
        description: w.descriptionByLevel[w.level], level: w.level + 1,
        isNew: false, icon: w.icon, rarity: 'relic' as const
      }))[0];
    const gear = options.find(o => o.category === 'PASSIVE') ||
      Object.values(this.passives).filter(passive => passive.level < passive.maxLevel).map(passive => ({
        id: passive.id, category: 'PASSIVE' as const, name: passive.name,
        description: passive.descriptionByLevel[passive.level], level: passive.level + 1,
        isNew: passive.level === 0, icon: passive.icon, rarity: 'relic' as const
      }))[0];
    const squad: UpgradeOption = {
      id: 'boss_squad', category: 'SQUAD', name: 'Bantuan Battle-Brothers',
      description: 'Panggil skuad Battle-Brothers pilihan anda (Apothecary / Devastator / Librarian / Techmarine).',
      level: 1, isNew: true, icon: 'squad_beacon', rarity: 'relic'
    };
    this.callbacks.onRelicChest([weapon, gear, squad].filter((reward): reward is UpgradeOption => Boolean(reward)), jackpotCount);
  }

  public getLastJackpotCount(): 1 | 3 | 5 {
    return this.lastJackpotCount;
  }

  // --- Interactive Objects (Promethium Barrels & Tarantula Sentry Turrets) ---
  private updateInteractiveObjects(dt: number) {
    this.barrelSpawnTimer -= dt;
    if (this.barrelSpawnTimer <= 0) {
      this.barrelSpawnTimer = 25.0;
      const barrelCount = this.interactiveObjects.filter(o => o.type === 'barrel').length;
      if (barrelCount < 4) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 320 + Math.random() * 220;
        this.interactiveObjects.push({
          id: this.objIdCounter++,
          type: 'barrel',
          x: this.playerX + Math.cos(ang) * dist,
          y: this.playerY + Math.sin(ang) * dist,
          hp: 40,
          maxHp: 40,
          radius: 18
        });
      }
    }

    for (let i = this.interactiveObjects.length - 1; i >= 0; i--) {
      const obj = this.interactiveObjects[i];

      if (obj.type === 'turret') {
        const distToPlayer = Math.hypot(this.playerX - obj.x, this.playerY - obj.y);
        if (distToPlayer < 36 && (!obj.activeTimer || obj.activeTimer <= 0)) {
          obj.isTriggered = true;
          obj.activeTimer = 25.0;
          sounds.playPurchase();
          this.floatingTexts.push({
            id: this.textIdCounter++,
            x: obj.x,
            y: obj.y - 20,
            text: 'TARANTULA TURRET ONLINE!',
            color: '#f59e0b',
            life: 1.0,
            maxLife: 1.0,
            isCrit: true
          });
        }

        if (obj.activeTimer && obj.activeTimer > 0) {
          obj.activeTimer -= dt;
          obj.shootTimer = (obj.shootTimer || 0) - dt;

          const closest = this.getClosestEnemiesTo(obj.x, obj.y, 1)[0];
          if (closest && Math.hypot(closest.x - obj.x, closest.y - obj.y) < 380) {
            if ((obj.shootTimer || 0) <= 0) {
              obj.shootTimer = 0.14;
              sounds.playTurretShot();
              const targetAngle = Math.atan2(closest.y - obj.y, closest.x - obj.x);
              const speed = 720;
              this.projectiles.push({
                id: this.projIdCounter++,
                type: 'turret_bullet',
                x: obj.x,
                y: obj.y,
                vx: Math.cos(targetAngle) * speed,
                vy: Math.sin(targetAngle) * speed,
                radius: 4,
                damage: 35 * this.playerStats.damageMult,
                duration: 0.7,
                maxDuration: 0.7,
                pierce: 1,
                piercedEnemyIds: new Set(),
                color: '#facc15',
                rotAngle: targetAngle,
                knockback: 14
              });
            }
          }
        }
      } else if (obj.type === 'dreadnought_pod') {
        const dist = Math.hypot(this.playerX - obj.x, this.playerY - obj.y);
        if (dist < 40) {
          this.interactiveObjects.splice(i, 1);
          this.dreadnought.isActive = true;
          this.dreadnought.timer = this.dreadnought.maxTimer;
          this.dreadnought.shootTimer = 0;
          this.dreadnought.slamTimer = 0;
          sounds.playDreadnoughtStomp();
          this.screenShakeAmount = 18;
          this.addBattleSpeechBubble(this.playerX, this.playerY, 'EVEN IN DEATH I STILL SERVE!', '#fbbf24');
          continue;
        }
      } else if (obj.type === 'orbital_beacon') {
        const dist = Math.hypot(this.playerX - obj.x, this.playerY - obj.y);
        if (dist < 36) {
          this.interactiveObjects.splice(i, 1);
          this.armOrbitalRelay();
          this.addBattleSpeechBubble(this.playerX, this.playerY, 'ORBITAL RELAY: PURGE THE SCREEN!', '#fef08a');
          continue;
        }
      } else if (obj.type === 'xp_magnet') {
        if (Math.hypot(this.playerX - obj.x, this.playerY - obj.y) < 38) {
          this.interactiveObjects.splice(i, 1);
          // Servo-Skull Vacuum: Magnetize ALL XP spores across the entire map!
          for (const orb of this.biomassOrbs) {
            orb.magnetized = true;
          }
          this.puritySealsEarned += 10;
          sounds.playPurchase();
          this.addBattleSpeechBubble(this.playerX, this.playerY, '🧲 SERVO-VACUUM: SEMUA XP DISEDUT! (+10 SEALS)', '#67e8f9');
          continue;
        }
      } else if (obj.type === 'squad_beacon') {
        const dist = Math.hypot(this.playerX - obj.x, this.playerY - obj.y);
        if (dist < 36) {
          this.interactiveObjects.splice(i, 1);
          sounds.playPurchase();
          this.spawnReinforcementSquad();
          this.addBattleSpeechBubble(this.playerX, this.playerY, 'REINFORCEMENTS HAVE ARRIVED!', '#4ade80');
          continue;
        }
      }
    }

    // Spawn Dreadnought Drop Pod (adjusted for 6-minute run)
    this.dreadnoughtDropTimer -= dt;
    if (this.dreadnoughtDropTimer <= 0 && !this.dreadnought.isActive) {
      this.dreadnoughtDropTimer = 110.0;
      if (!this.interactiveObjects.some(o => o.type === 'dreadnought_pod')) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 180 + Math.random() * 80;
        this.interactiveObjects.push({
          id: this.objIdCounter++,
          type: 'dreadnought_pod',
          x: this.playerX + Math.cos(ang) * dist,
          y: this.playerY + Math.sin(ang) * dist,
          hp: 1,
          maxHp: 1,
          radius: 32
        });
        sounds.playChestDrop();
        this.screenShakeAmount = 14;
        this.addBattleSpeechBubble(this.playerX, this.playerY, 'DREADNOUGHT DROP POD INBOUND!', '#fbbf24');
      }
    }

    // Spawn Orbital Strike Beacon
    this.orbitalBeaconTimer -= dt;
    if (this.orbitalBeaconTimer <= 0) {
      this.orbitalBeaconTimer = 85.0;
      if (!this.interactiveObjects.some(o => o.type === 'orbital_beacon')) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 200 + Math.random() * 90;
        this.interactiveObjects.push({
          id: this.objIdCounter++,
          type: 'orbital_beacon',
          x: this.playerX + Math.cos(ang) * dist,
          y: this.playerY + Math.sin(ang) * dist,
          hp: 1,
          maxHp: 1,
          radius: 24
        });
      }
    }

    // Spawn Squad Distress Beacon
    this.squadBeaconTimer -= dt;
    if (this.squadBeaconTimer <= 0 && this.squadBrothers.length === 0) {
      this.squadBeaconTimer = 90.0;
      if (!this.interactiveObjects.some(o => o.type === 'squad_beacon')) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 180 + Math.random() * 90;
        this.interactiveObjects.push({
          id: this.objIdCounter++,
          type: 'squad_beacon',
          x: this.playerX + Math.cos(ang) * dist,
          y: this.playerY + Math.sin(ang) * dist,
          hp: 1,
          maxHp: 1,
          radius: 24
        });
      }
    }
  }

  // --- Dreadnought Combat Loop ---
  private updateDreadnought(dt: number) {
    if (!this.dreadnought.isActive) return;

    this.dreadnought.timer -= dt;
    this.playerInvulnTimer = 0.5; // Invulnerable in Dreadnought!

    // Rotary 6-barrel Assault Cannon: 20 shots per second
    this.dreadnought.shootTimer -= dt;
    if (this.dreadnought.shootTimer <= 0) {
      this.dreadnought.shootTimer = 0.05;
      const target = this.getClosestEnemiesTo(this.playerX, this.playerY, 1)[0];
      if (target) {
        const dx = target.x - this.playerX;
        const dy = target.y - this.playerY;
        const ang = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.12;
        const spd = 640;
        this.projectiles.push({
          id: this.projIdCounter++,
          type: 'dreadnought_assault_cannon',
          x: this.playerX + (this.playerFacingLeft ? -28 : 28),
          y: this.playerY - 8,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: 4,
          damage: 45 * this.playerStats.damageMult,
          duration: 1.0,
          maxDuration: 1.0,
          pierce: 2,
          piercedEnemyIds: new Set(),
          color: '#facc15',
          rotAngle: ang,
          knockback: 22
        });
        sounds.playDreadnoughtAssaultCannon();
        if (Math.random() < 0.2) this.screenShakeAmount = 2.5;
      }
    }

    // Power Fist Ground Slam Shockwave every 3.5s
    this.dreadnought.slamTimer -= dt;
    if (this.dreadnought.slamTimer <= 0) {
      this.dreadnought.slamTimer = 3.5;
      sounds.playDreadnoughtStomp();
      this.screenShakeAmount = 14;
      this.detonateAoE(this.playerX, this.playerY, 160, 260, 'thunder_hammer');
    }

    if (this.dreadnought.timer <= 0) {
      this.dreadnought.isActive = false;
      this.detonateAoE(this.playerX, this.playerY, 140, 300, 'plasma_cannon');
      this.addBattleSpeechBubble(this.playerX, this.playerY, 'DREADNOUGHT POWER CYCLE COMPLETE!', '#f59e0b');
    }
  }

  // --- Squad Battle-Brothers AI ---
  private updateSquadBrothers(dt: number) {
    for (let idx = 0; idx < this.squadBrothers.length; idx++) {
      const brother = this.squadBrothers[idx];
      brother.animFrame += dt;

      const targetX = this.playerX + (idx === 0 ? -48 : 48);
      const targetY = this.playerY + 14;
      const dx = targetX - brother.x;
      const dy = targetY - brother.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        const spd = Math.min(235, dist * 3.6);
        brother.x += (dx / dist) * spd * dt;
        brother.y += (dy / dist) * spd * dt;
        brother.facingLeft = dx < 0;
      }

      if (brother.type === 'apothecary') {
        brother.healCooldown = (brother.healCooldown || 1.5) - dt;
        if (brother.healCooldown <= 0) {
          brother.healCooldown = 1.5;
          const pDist = Math.hypot(brother.x - this.playerX, brother.y - this.playerY);
          if (pDist < 76 && this.playerStats.hp < this.playerStats.maxHp) {
            this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 14);
            sounds.playHeal();
            this.floatingTexts.push({
              id: this.textIdCounter++,
              x: this.playerX,
              y: this.playerY - 26,
              text: '+14 HP [MEDIC]',
              color: '#4ade80',
              life: 0.8,
              maxLife: 0.8
            });
          }
        }
      } else if (brother.type === 'devastator') {
        brother.shootCooldown = (brother.shootCooldown || 2.4) - dt;
        if (brother.shootCooldown <= 0) {
          brother.shootCooldown = 2.4;
          const target = this.getClosestEnemiesTo(brother.x, brother.y, 1)[0];
          if (target) {
            const mdx = target.x - brother.x;
            const mdy = target.y - brother.y;
            const mang = Math.atan2(mdy, mdx);
            const mspd = 390;
            this.projectiles.push({
              id: this.projIdCounter++,
              type: 'devastator_missile',
              x: brother.x + 12,
              y: brother.y - 14,
              vx: Math.cos(mang) * mspd,
              vy: Math.sin(mang) * mspd,
              radius: 6,
              damage: 140 * this.playerStats.damageMult,
              duration: 2.0,
              maxDuration: 2.0,
              pierce: 1,
              piercedEnemyIds: new Set(),
              color: '#ef4444',
              aoeRadius: 85,
              rotAngle: mang,
              knockback: 40
            });
            sounds.playExplosion();
          }
        }
      } else if (brother.type === 'librarian') {
        brother.shootCooldown = (brother.shootCooldown || 2.1) - dt;
        if (brother.shootCooldown <= 0) {
          brother.shootCooldown = 2.1;
          const target = this.getClosestEnemiesTo(brother.x, brother.y, 1)[0];
          if (target && Math.hypot(target.x - brother.x, target.y - brother.y) < 360) {
            sounds.playPsykerBlast();
            target.stunTimer = Math.max(target.stunTimer || 0, 1.5);
            this.damageEnemy(target, 95 * this.playerStats.damageMult, true, '#38bdf8');
            this.triggerChainLightning(target.x, target.y, 5, 110 * this.playerStats.damageMult, 'lascannon');
          }
        }
      } else if (brother.type === 'techmarine') {
        brother.healCooldown = (brother.healCooldown || 3.2) - dt;
        if (brother.healCooldown <= 0) {
          brother.healCooldown = 3.2;
          this.playerStats.maxShield = Math.max(this.playerStats.maxShield, 45);
          if (this.playerStats.shield < this.playerStats.maxShield) {
            this.playerStats.shield = Math.min(this.playerStats.maxShield, this.playerStats.shield + 18);
            this.floatingTexts.push({
              id: this.textIdCounter++,
              x: this.playerX,
              y: this.playerY - 26,
              text: '+18 SHIELD [OMNISSIAH]',
              color: '#38bdf8',
              life: 0.8,
              maxLife: 0.8
            });
          }
        }
        brother.turretCooldown = (brother.turretCooldown || 16.0) - dt;
        if (brother.turretCooldown <= 0) {
          brother.turretCooldown = 18.0;
          const activeTurrets = this.interactiveObjects.filter(o => o.type === 'turret' && (o.activeTimer || 0) > 0).length;
          if (activeTurrets < 3) {
            sounds.playPurchase();
            this.interactiveObjects.push({
              id: this.objIdCounter++,
              type: 'turret',
              x: brother.x + (brother.facingLeft ? -28 : 28),
              y: brother.y + 8,
              hp: 300,
              maxHp: 300,
              radius: 24,
              activeTimer: 16.0,
              shootTimer: 0
            });
            this.floatingTexts.push({
              id: this.textIdCounter++,
              x: brother.x,
              y: brother.y - 24,
              text: '⚙️ SENTRY DEPLOYED!',
              color: '#f59e0b',
              life: 0.9,
              maxLife: 0.9,
              isCrit: true
            });
          }
        }
      }
    }
  }

  private completeCombatTrial() {
    if (!this.activeTrial) return;
    const trial = this.activeTrial;
    this.puritySealsEarned += trial.rewardSeals;
    const heal = Math.round(this.playerStats.maxHp * 0.25);
    this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + heal);
    this.ultimateCooldown = Math.max(0, this.ultimateCooldown - 8);
    sounds.playEvolution();
    this.addBattleSpeechBubble(this.playerX, this.playerY, `🎖️ MISI SELESAI! +${trial.rewardSeals} SEALS & +${heal} HP`, '#fbbf24');
    this.activeTrial = null;
    this.trialSpawnTimer = 38;
  }

  // Battlefield events use world positions, while the relay locks a screen snapshot.
  private updateBattlefieldEvents(dt: number) {
    this.magnetTimer -= dt;
    this.riskSupplyTimer -= dt;
    this.orbitalRelayFlash = Math.max(0, this.orbitalRelayFlash - dt * 2);

    // 1. Imperial Directives / Combat Trials
    if (this.activeTrial) {
      this.activeTrial.timeLeft -= dt;
      if (this.activeTrial.type === 'streak') {
        this.activeTrial.progress = Math.max(this.activeTrial.progress, this.streakCount);
        if (this.activeTrial.progress >= this.activeTrial.target) {
          this.completeCombatTrial();
        }
      }
      if (this.activeTrial && this.activeTrial.timeLeft <= 0) {
        this.activeTrial = null;
        this.trialSpawnTimer = 35;
      }
    } else {
      this.trialSpawnTimer -= dt;
      if (this.trialSpawnTimer <= 0) {
        const pick = Math.floor(Math.random() * 3);
        if (pick === 0) {
          this.activeTrial = {
            id: `trial_${Date.now()}`,
            title: 'Hapuskan 28 Xenos Pantas',
            progress: 0,
            target: 28,
            timeLeft: 24,
            maxTime: 24,
            rewardSeals: 20,
            rewardDesc: '+20 Seals & +25% HP',
            type: 'kills'
          };
        } else if (pick === 1) {
          this.activeTrial = {
            id: `trial_${Date.now()}`,
            title: 'Capai 30x Purge Streak',
            progress: this.streakCount,
            target: 30,
            timeLeft: 25,
            maxTime: 25,
            rewardSeals: 25,
            rewardDesc: '+25 Seals & +25% HP',
            type: 'streak'
          };
        } else {
          this.activeTrial = {
            id: `trial_${Date.now()}`,
            title: 'Gunakan 3x Combat Dash',
            progress: 0,
            target: 3,
            timeLeft: 22,
            maxTime: 22,
            rewardSeals: 18,
            rewardDesc: '+18 Seals & +25% HP',
            type: 'dash'
          };
        }
      }
    }

    // 2. Dynamic Hive Events (Spore Fog, Hormagaunt Stampede, Munitorum Airdrop)
    if (this.activeHiveEvent) {
      this.activeHiveEvent.timer -= dt;
      if (this.activeHiveEvent.timer <= 0) {
        this.activeHiveEvent = null;
        this.hiveEventSpawnTimer = 52;
      }
    } else {
      this.hiveEventSpawnTimer -= dt;
      if (this.hiveEventSpawnTimer <= 0) {
        const pick = Math.floor(Math.random() * 3);
        if (pick === 0) {
          this.activeHiveEvent = {
            type: 'spore_fog',
            title: '🟢 RIBUT SPORA XENOS',
            desc: 'Semua Biomas XP bernilai 2x Ganda!',
            timer: 22,
            maxTimer: 22
          };
          this.addBattleSpeechBubble(this.playerX, this.playerY, '🟢 RIBUT SPORA: 2x XP BIOMASS!', '#4ade80');
        } else if (pick === 1) {
          this.activeHiveEvent = {
            type: 'hormagaunt_stampede',
            title: '🔴 SERBUAN HORMAGAUNT',
            desc: 'Kawanan penyerbu pantas meluru dari rusuk!',
            timer: 14,
            maxTimer: 14
          };
          this.addBattleSpeechBubble(this.playerX, this.playerY, '🔴 AMARAN: SERBUAN HORMAGAUNT!', '#fb7185');
          const flankAngle = Math.random() * Math.PI * 2;
          for (let s = 0; s < 10; s++) {
            const sx = this.playerX + Math.cos(flankAngle) * 520 + (Math.random() - 0.5) * 140;
            const sy = this.playerY + Math.sin(flankAngle) * 520 + (Math.random() - 0.5) * 140;
            this.enemies.push({
              id: this.enemyIdCounter++,
              type: 'hormagaunt',
              x: sx,
              y: sy,
              vx: 0,
              vy: 0,
              radius: 13,
              hp: 40 + this.elapsedGameTime * 0.4,
              maxHp: 40 + this.elapsedGameTime * 0.4,
              speed: 165,
              damage: 14,
              xpValue: 5,
              facingLeft: false,
              animFrame: Math.random() * 10,
              color: '#e11d48',
              hitFlashTimer: 0
            });
          }
        } else {
          this.activeHiveEvent = {
            type: 'munitorum_airdrop',
            title: '🟡 BEKALAN MUNITORUM TIBA',
            desc: 'Servo-Vacuum Magnet & Tong Promethium dijatuhkan!',
            timer: 12,
            maxTimer: 12
          };
          this.interactiveObjects.push({
            id: this.objIdCounter++,
            type: 'xp_magnet',
            x: this.playerX + (Math.random() - 0.5) * 220,
            y: this.playerY + (Math.random() - 0.5) * 180,
            hp: 1,
            maxHp: 1,
            radius: 22
          });
          this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 30);
          this.addBattleSpeechBubble(this.playerX, this.playerY, '🟡 MUNITORUM AIRDROP (+30 HP & MAGNET)!', '#facc15');
        }
      }
    }

    if (this.magnetTimer <= 0) {
      this.magnetTimer = 55;
      if (!this.interactiveObjects.some(o => o.type === 'xp_magnet')) {
        this.interactiveObjects.push({ id: this.objIdCounter++, type: 'xp_magnet',
          x: this.playerX + (Math.random() - 0.5) * 340, y: this.playerY + (Math.random() - 0.5) * 280,
          hp: 1, maxHp: 1, radius: 22 });
        this.addBattleSpeechBubble(this.playerX, this.playerY, '🧲 SERVO-VACUUM DI MEDAN!', '#67e8f9');
      }
    }
    if (this.riskSupplyTimer <= 0 && !this.riskZone) {
      this.riskSupplyTimer = 80;
      this.riskZone = { x: this.playerX + (Math.random() - 0.5) * 300,
        y: this.playerY + (Math.random() - 0.5) * 260, radius: 74, timer: 24, progress: 0, needed: 6 };
      this.addBattleSpeechBubble(this.playerX, this.playerY, 'BEKALAN BERISIKO: TAHAN ZON!', '#fbbf24');
    }

    if (this.riskZone) {
      const zone = this.riskZone;
      zone.timer -= dt;
      const inside = Math.hypot(this.playerX - zone.x, this.playerY - zone.y) <= zone.radius;
      if (inside) zone.progress += dt;
      if (inside && Math.random() < dt * 2) this.spawnSingleEnemy();
      if (zone.progress >= zone.needed) {
        this.relicChests.push({ id: this.effectIdCounter++, x: zone.x, y: zone.y, beaconTimer: 0, source: 'supply' });
        this.puritySealsEarned += 25;
        this.addBattleSpeechBubble(this.playerX, this.playerY, 'BEKALAN DITAWAN! +25 SEALS', '#fbbf24');
        this.riskZone = null;
      } else if (zone.timer <= 0) this.riskZone = null;
    }
    if (this.elapsedGameTime >= this.nextSpecialWave) {
      const cycle = Math.floor(this.nextSpecialWave / 45) % 3;
      this.specialWave = cycle === 0 ? 'swarm' : cycle === 1 ? 'ranged' : 'elite';
      this.specialWaveTimer = 12;
      this.nextSpecialWave += 45;
      const label = this.specialWave === 'swarm' ? 'KAWANAN PANTAS' : this.specialWave === 'ranged' ? 'TEMBAKAN ASID' : 'ELITE BERPERISAI';
      this.addBattleSpeechBubble(this.playerX, this.playerY, `AMARAN: ${label}`, '#fb7185');
    }
    if (this.specialWaveTimer > 0) {
      this.specialWaveTimer -= dt;
      if (this.specialWaveTimer <= 0) this.specialWave = null;
    }
    if (this.orbitalRelayTimer > 0) {
      this.orbitalRelayTimer -= dt;
      if (this.orbitalRelayTimer <= 0) this.fireOrbitalRelay();
    }
  }

  private armOrbitalRelay() {
    this.orbitalRelayTimer = 1.3;
    const halfW = this.canvas.width / 2, halfH = this.canvas.height / 2;
    this.orbitalRelayTargets = this.enemies.filter(e =>
      Math.abs(e.x - this.playerX) <= halfW + e.radius && Math.abs(e.y - this.playerY) <= halfH + e.radius
    ).map(e => e.id);
    sounds.playOrbitalSiren();
  }

  private fireOrbitalRelay() {
    this.orbitalRelayFlash = 0.6;
    this.screenShakeAmount = 24;
    sounds.playOrbitalBeam();
    for (const id of this.orbitalRelayTargets) {
      const enemy = this.enemies.find(e => e.id === id);
      if (!enemy) continue;
      if (enemy.type === 'carnifex_boss' || enemy.type === 'hive_tyrant' || enemy.type === 'trygon_prime') {
        this.damageEnemy(enemy, enemy.maxHp * 0.3, false, '#fef08a');
      } else this.damageEnemy(enemy, enemy.hp, false, '#fef08a');
    }
    this.orbitalRelayTargets = [];
  }

  // --- Orbital Strikes ---
  private updateOrbitalStrikes(dt: number) {
    for (let i = this.orbitalStrikes.length - 1; i >= 0; i--) {
      const strike = this.orbitalStrikes[i];
      strike.timer -= dt;

      if (strike.timer <= 0.35 && !strike.hasDamaged) {
        strike.hasDamaged = true;
        sounds.playOrbitalBeam();
        this.screenShakeAmount = 26;

        for (const enemy of this.enemies) {
          const d = Math.hypot(enemy.x - strike.x, enemy.y - strike.y);
          if (d <= strike.radius + enemy.radius) {
            this.damageEnemy(enemy, 1500 * this.playerStats.damageMult, true, '#fef08a');
          }
        }
      }

      if (strike.timer <= 0) {
        this.orbitalStrikes.splice(i, 1);
      }
    }
  }

  // --- Comic Speech Bubbles ---
  public addBattleSpeechBubble(x: number, y: number, text: string, color: string = '#fef08a') {
    this.battleSpeechBubbles.push({
      id: this.textIdCounter++,
      x,
      y,
      text,
      speaker: 'Space Marine',
      life: 2.2,
      maxLife: 2.2,
      color
    });
    sounds.playBattleCry();
  }

  private updateBattleSpeechBubbles(dt: number) {
    for (let i = this.battleSpeechBubbles.length - 1; i >= 0; i--) {
      const b = this.battleSpeechBubbles[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.battleSpeechBubbles.splice(i, 1);
      }
    }
  }

  public detonateBarrel(barrel: InteractiveObject) {
    if (barrel.isTriggered) return;
    barrel.isTriggered = true;
    sounds.playBarrelExplode();
    this.screenShakeAmount = 15;

    const blastRadius = 150;
    const dmg = 240 * this.playerStats.damageMult;
    this.spawnPixelExplosion(barrel.x, barrel.y, blastRadius * 0.85, '#f97316', 3);

    // Damage all Tyranids in radius
    for (const enemy of this.enemies) {
      const dist = Math.hypot(enemy.x - barrel.x, enemy.y - barrel.y);
      if (dist < blastRadius + enemy.radius) {
        this.damageEnemy(enemy, dmg, true, '#f97316');
      }
    }

    // Fiery blast particles
    for (let p = 0; p < 24; p++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 140;
      this.particles.push({
        x: barrel.x,
        y: barrel.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.45,
        maxLife: 0.45,
        color: Math.random() < 0.6 ? '#f97316' : '#ef4444',
        size: 8 + Math.random() * 6
      });
    }

    // Remove barrel
    const idx = this.interactiveObjects.indexOf(barrel);
    if (idx !== -1) {
      this.interactiveObjects.splice(idx, 1);
    }
  }

  // --- Weapon Ticking & Firing ---
  private updateWeapons(dt: number) {
    if (this.dropPodIntroTimer > 0.45) return;

    let cdMult = this.playerStats.cooldownMult;
    if (this.isZealActive) cdMult *= 0.8; // +25% faster firing speed during Emperor's Zeal
    if (this.overdriveTimer > 0) cdMult *= 0.5; // 2x fire rate during Tactical Overdrive!

    // 1. Bolter
    const bolter = this.weapons.bolter;
    if (bolter.level > 0) {
      bolter.timer -= dt;
      if (bolter.timer <= 0) {
        const fireCd = Math.max(0.12, (bolter.cooldown - (bolter.level - 1) * 0.06) * cdMult);
        bolter.timer = fireCd;
        this.fireBolter(bolter.level);
      }
    }

    // 2. Heavy Bolter
    const heavyBolter = this.weapons.heavy_bolter;
    if (heavyBolter && heavyBolter.level > 0) {
      heavyBolter.timer -= dt;
      if (heavyBolter.timer <= 0) {
        const fireCd = Math.max(0.07, (heavyBolter.cooldown - (heavyBolter.level - 1) * 0.015) * cdMult);
        heavyBolter.timer = fireCd;
        this.fireHeavyBolter(heavyBolter.level);
      }
    }

    // 3. Lascannon
    const lascannon = this.weapons.lascannon;
    if (lascannon && lascannon.level > 0) {
      lascannon.timer -= dt;
      if (lascannon.timer <= 0) {
        const fireCd = Math.max(0.8, (lascannon.cooldown - (lascannon.level - 1) * 0.18) * cdMult);
        lascannon.timer = fireCd;
        this.fireLascannon(lascannon.level);
      }
    }

    // 4. Orbiting Storm Shields
    const shieldOrbit = this.weapons.orbiting_shield;
    if (shieldOrbit && shieldOrbit.level > 0) {
      this.updateStormShields(dt, shieldOrbit.level);
    }

    // 5. Warp Vortex Grenade
    const vortex = this.weapons.vortex_grenade;
    if (vortex && vortex.level > 0) {
      vortex.timer -= dt;
      if (vortex.timer <= 0) {
        const fireCd = Math.max(1.8, (vortex.cooldown - (vortex.level - 1) * 0.35) * cdMult);
        vortex.timer = fireCd;
        this.fireVortexGrenade(vortex.level);
      }
    }

    // 6. Thunder Hammer Smash
    const hammer = this.weapons.thunder_hammer;
    if (hammer && hammer.level > 0) {
      hammer.timer -= dt;
      if (hammer.timer <= 0) {
        const fireCd = Math.max(1.2, (hammer.cooldown - (hammer.level - 1) * 0.25) * cdMult);
        hammer.timer = fireCd;
        this.fireThunderHammer(hammer.level);
      }
    }

    // 7. Plasma Cannon
    const plasma = this.weapons.plasma_cannon;
    if (plasma.level > 0) {
      plasma.timer -= dt;
      if (plasma.timer <= 0) {
        plasma.timer = Math.max(0.85, (plasma.cooldown - (plasma.level - 1) * 0.2) * cdMult);
        this.firePlasma(plasma.level);
      }
    }

    // 8. Chainswords
    const chain = this.weapons.chainsword_orbit;
    if (chain.level > 0) {
      this.updateChainswords(dt, chain.level);
    }

    // 9. Frag Grenades
    const grenade = this.weapons.frag_grenade;
    if (grenade.level > 0) {
      grenade.timer -= dt;
      if (grenade.timer <= 0) {
        grenade.timer = Math.max(1.1, (grenade.cooldown - (grenade.level - 1) * 0.25) * cdMult);
        this.fireGrenades(grenade.level);
      }
    }

    // 10. Heavy Flamer
    const flamer = this.weapons.heavy_flamer;
    if (flamer.level > 0) {
      flamer.timer -= dt;
      if (flamer.timer <= 0) {
        flamer.timer = Math.max(0.7, (flamer.cooldown - (flamer.level - 1) * 0.15) * cdMult);
        this.fireFlamer(flamer.level);
      }
    }

    // 11. Multi-Melta
    const melta = this.weapons.melta_lance;
    if (melta.level > 0) {
      melta.timer -= dt;
      if (melta.timer <= 0) {
        melta.timer = Math.max(1.3, (melta.cooldown - (melta.level - 1) * 0.3) * cdMult);
        this.fireMelta(melta.level);
      }
    }

    // 12. Power Sword
    const powerSword = this.weapons.power_sword;
    if (powerSword && powerSword.level > 0) {
      powerSword.timer -= dt;
      if (powerSword.timer <= 0) {
        powerSword.timer = Math.max(0.32, (powerSword.cooldown - (powerSword.level - 1) * 0.11) * cdMult);
        this.firePowerSword(powerSword.level);
      }
    }

    // 13. Assault Cannon
    const assaultCannon = this.weapons.assault_cannon;
    if (assaultCannon && assaultCannon.level > 0) {
      assaultCannon.timer -= dt;
      if (assaultCannon.timer <= 0) {
        assaultCannon.timer = Math.max(0.055, (assaultCannon.cooldown - (assaultCannon.level - 1) * 0.015) * cdMult);
        this.fireAssaultCannon(assaultCannon.level);
      }
    }

    // 14. Cyclone Missile Launcher
    const cyclone = this.weapons.cyclone_missile;
    if (cyclone && cyclone.level > 0) {
      cyclone.timer -= dt;
      if (cyclone.timer <= 0) {
        cyclone.timer = Math.max(0.95, (cyclone.cooldown - (cyclone.level - 1) * 0.22) * cdMult);
        this.fireCycloneMissiles(cyclone.level);
      }
    }
  }

  private getClosestEnemies(count: number): Enemy[] {
    return this.enemies
      .filter(e => e.burrowState !== 'burrowed')
      .sort((a, b) => {
        const da = Math.hypot(a.x - this.playerX, a.y - this.playerY);
        const db = Math.hypot(b.x - this.playerX, b.y - this.playerY);
        return da - db;
      })
      .slice(0, count);
  }

  private getAimAngle(fallbackTarget?: Enemy, isPrimaryWeapon: boolean = false): number {
    const shouldUseMouse = this.aimMode === 'manual' || (this.aimMode === 'hybrid' && isPrimaryWeapon);
    if (shouldUseMouse) {
      return Math.atan2(this.mouseWorldY - this.playerY, this.mouseWorldX - this.playerX);
    }
    if (fallbackTarget) {
      return Math.atan2(fallbackTarget.y - this.playerY, fallbackTarget.x - this.playerX);
    }
    return this.playerFacingLeft ? Math.PI : 0;
  }

  public setPlayerFacing(facingLeft: boolean) {
    if (this.playerFacingLeft !== facingLeft) {
      this.playerFacingLeft = facingLeft;
      this.playerTurnSquashTimer = 0.08;
    }
  }

  /**
   * Calculates the exact world position where bullets exit from the Space Marine weapon muzzle.
   * Guarantees 100% visual alignment with the animated Godwyn Bolter barrel.
   */
  public getPlayerMuzzlePosition(aimAngle: number): { x: number; y: number } {
    return SpaceMarinePixelArt.getMuzzlePosition(
      this.playerX,
      this.playerY,
      this.playerFacingLeft,
      aimAngle
    );
  }

  // --- WEAPONS FIRING IMPLEMENTATION ---
  private fireBolter(level: number) {
    const isEvo = !!this.weapons.bolter.isEvolved;
    const targets = this.getClosestEnemies(level >= 3 ? 2 : 1);
    const hasTarget = targets.length > 0;
    const isMouseAim = this.aimMode === 'manual' || this.aimMode === 'hybrid';
    if (!hasTarget && !isMouseAim) return;

    sounds.playBolter();
    this.playerShootTimer = 0.08;
    this.playerOverheatHeat = Math.min(1.0, this.playerOverheatHeat + 0.04);
    const rounds = isEvo ? 4 : (level >= 5 ? 3 : (level >= 3 ? 2 : 1));

    for (let r = 0; r < rounds; r++) {
      const target = targets[r % Math.max(1, targets.length)];
      const baseAim = this.getAimAngle(target, true);
      const angle = baseAim + (Math.random() - 0.5) * (isEvo ? 0.16 : 0.12);
      const speed = isEvo ? 650 : 560;
      const baseDmg = (28 + (level - 1) * 10) * (isEvo ? 1.45 : 1.0);
      const damage = Math.round(baseDmg * this.playerStats.damageMult);

      const muzzle = this.getPlayerMuzzlePosition(angle);

      this.projectiles.push({
        id: this.projIdCounter++,
        type: 'bolter',
        x: muzzle.x,
        y: muzzle.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: isEvo ? 5.5 : 4,
        damage,
        duration: 1.2,
        maxDuration: 1.2,
        pierce: isEvo ? 3 : (level >= 4 ? 2 : 1),
        piercedEnemyIds: new Set(),
        color: isEvo ? '#fbbf24' : '#f59e0b',
        trailParticles: true,
        rotAngle: angle,
        knockback: isEvo ? 26 : 18
      });

      // Directional muzzle flash spark at exact barrel exit
      this.particles.push({
        x: muzzle.x,
        y: muzzle.y,
        vx: Math.cos(angle) * 45 + (Math.random() - 0.5) * 20,
        vy: Math.sin(angle) * 45 + (Math.random() - 0.5) * 20,
        life: 0.1,
        maxLife: 0.1,
        color: '#fbbf24',
        size: 5
      });

      // Ejected brass bolt shell casing flying perpendicular to gun angle with retro arcade arc
      const ejectAngle = angle - (this.playerFacingLeft ? -Math.PI / 2 : Math.PI / 2);
      this.particles.push({
        x: this.playerX + (this.playerFacingLeft ? 4 : -4),
        y: this.playerY - 8,
        vx: Math.cos(ejectAngle) * 35 + (Math.random() - 0.5) * 15,
        vy: Math.sin(ejectAngle) * 35 - 35 - Math.random() * 20,
        life: 0.35,
        maxLife: 0.35,
        color: '#f59e0b',
        size: 3
      });
    }
  }

  private fireHeavyBolter(level: number) {
    const isEvo = !!this.weapons.heavy_bolter.isEvolved;
    const targets = this.getClosestEnemies(2);
    const hasTarget = targets.length > 0;
    const isMouseAim = this.aimMode === 'manual' || this.aimMode === 'hybrid';
    if (!hasTarget && !isMouseAim) return;

    sounds.playHeavyBolter();
    this.playerShootTimer = 0.08;
    this.playerIsBraced = true;
    this.bracedTimer = 0.22;
    this.playerOverheatHeat = Math.min(1.0, this.playerOverheatHeat + 0.07);
    const streamCount = isEvo ? 5 : (level >= 5 ? 4 : (level >= 3 ? 2 : 1));
    const baseDmg = (18 + level * 6) * (isEvo ? 1.45 : 1.0) * this.playerStats.damageMult;

    for (let s = 0; s < streamCount; s++) {
      const target = targets[s % Math.max(1, targets.length)];
      const spread = (Math.random() - 0.5) * (level >= 5 ? 0.35 : 0.18);
      const baseAim = this.getAimAngle(target, true);
      const angle = baseAim + spread;
      const speed = 640 + Math.random() * 80;

      const muzzle = this.getPlayerMuzzlePosition(angle);

      this.projectiles.push({
        id: this.projIdCounter++,
        type: 'heavy_bolter',
        x: muzzle.x,
        y: muzzle.y + (s - (streamCount - 1) / 2) * 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: isEvo ? 5.5 : 4.5,
        damage: baseDmg,
        duration: 0.9,
        maxDuration: 0.9,
        pierce: isEvo ? 3 : (level >= 4 ? 2 : 1),
        piercedEnemyIds: new Set(),
        color: isEvo ? '#ef4444' : (level >= 5 ? '#f97316' : '#facc15'),
        trailParticles: true,
        rotAngle: angle,
        knockback: isEvo ? 34 : 26,
        aoeRadius: isEvo ? 36 : undefined
      });

      this.particles.push({
        x: this.playerX + (this.playerFacingLeft ? 8 : -8),
        y: this.playerY - 8,
        vx: (this.playerFacingLeft ? 70 : -70) + (Math.random() - 0.5) * 30,
        vy: -90 - Math.random() * 50,
        life: 0.35,
        maxLife: 0.35,
        color: '#eab308',
        size: 2.5
      });
    }
  }

  private fireLascannon(level: number) {
    const isEvo = !!this.weapons.lascannon.isEvolved;
    const darkAngelsMult = this.chapter === 'dark_angels' ? 1.25 : 1.0;
    const beamCount = isEvo ? 3 : (level >= 5 ? 3 : (level >= 2 ? 2 : 1));
    const targets = this.getClosestEnemies(beamCount);
    if (targets.length === 0 && this.aimMode !== 'manual') return;

    sounds.playLascannon();
    this.playerShootTimer = 0.12;
    this.playerIsBraced = true;
    this.bracedTimer = 0.35;
    this.playerOverheatHeat = Math.min(1.0, this.playerOverheatHeat + 0.18);
    this.screenShakeAmount = isEvo ? 10 : 6;
    const baseDmg = (110 + (level - 1) * 35) * (isEvo ? 1.55 : 1.0) * darkAngelsMult * this.playerStats.damageMult;
    this.lastDamageWeapon = 'lascannon';

    const shots = Math.max(beamCount, targets.length);
    for (let i = 0; i < shots; i++) {
      const target = targets[i % Math.max(1, targets.length)];
      const angle = this.aimMode === 'manual'
        ? this.getAimAngle(target, true) + (i - (shots - 1) / 2) * 0.16
        : (target ? Math.atan2(target.y - this.playerY, target.x - this.playerX) : this.getAimAngle(undefined, true));
      const muzzle = this.getPlayerMuzzlePosition(angle);
      const startX = muzzle.x;
      const startY = muzzle.y;
      const beamLen = 950;
      const endX = startX + Math.cos(angle) * beamLen;
      const endY = startY + Math.sin(angle) * beamLen;

      this.laserBeams.push({
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        life: isEvo ? 0.28 : 0.22,
        maxLife: isEvo ? 0.28 : 0.22,
        color: isEvo ? '#fbbf24' : (level >= 5 ? '#f43f5e' : '#38bdf8'),
        width: (12 + level * 2.5) * darkAngelsMult * (isEvo ? 1.3 : 1.0)
      });

      // Evolved Lascannon: Orbital Lance Strike detonation at primary target/cursor
      if (isEvo && i === 0) {
        const strikeX = this.aimMode === 'manual' ? this.mouseWorldX : (target ? target.x : startX + Math.cos(angle) * 260);
        const strikeY = this.aimMode === 'manual' ? this.mouseWorldY : (target ? target.y : startY + Math.sin(angle) * 260);
        this.detonateAoE(strikeX, strikeY, 95 * darkAngelsMult, baseDmg * 0.85, 'lascannon');
      }

      for (const enemy of [...this.enemies]) {
        const dx = enemy.x - startX;
        const dy = enemy.y - startY;
        const distAlong = dx * Math.cos(angle) + dy * Math.sin(angle);
        const distPerp = Math.abs(-dx * Math.sin(angle) + dy * Math.cos(angle));

        if (distAlong > 0 && distAlong < beamLen && distPerp < 22 * darkAngelsMult + enemy.radius) {
          // Synergy: Conductive Swarm (+75% damage to vortex-trapped enemies)
          const conductiveMult = (enemy.vortexMarkedTimer || 0) > 0 ? 1.75 : 1.0;
          this.lastDamageWeapon = 'lascannon';
          this.damageEnemy(enemy, baseDmg * conductiveMult, true, conductiveMult > 1 ? '#e879f9' : '#38bdf8');
          if (level >= 3 || isEvo) {
            this.triggerChainLightning(enemy.x, enemy.y, isEvo ? 6 : 3, baseDmg * 0.6, 'lascannon');
          }
        }
      }
    }
  }

  private triggerChainLightning(fromX: number, fromY: number, maxChains: number, damage: number, sourceWeapon: WeaponId = 'lascannon') {
    let currentX = fromX;
    let currentY = fromY;
    const hitIds = new Set<number>();

    for (let c = 0; c < maxChains; c++) {
      const nearby = this.enemies
        .filter(e => !hitIds.has(e.id))
        .map(e => ({ enemy: e, dist: Math.hypot(e.x - currentX, e.y - currentY) }))
        .filter(item => item.dist < 200 && item.dist > 10)
        .sort((a, b) => a.dist - b.dist)[0];

      if (!nearby) break;

      hitIds.add(nearby.enemy.id);
      this.lastDamageWeapon = sourceWeapon;
      this.damageEnemy(nearby.enemy, damage, false, '#38bdf8');

      const points = [{ x: currentX, y: currentY }];
      const segments = 4;
      for (let s = 1; s < segments; s++) {
        const ratio = s / segments;
        const midX = currentX + (nearby.enemy.x - currentX) * ratio + (Math.random() - 0.5) * 25;
        const midY = currentY + (nearby.enemy.y - currentY) * ratio + (Math.random() - 0.5) * 25;
        points.push({ x: midX, y: midY });
      }
      points.push({ x: nearby.enemy.x, y: nearby.enemy.y });

      this.lightningArcs.push({
        points,
        life: 0.16,
        maxLife: 0.16,
        color: '#67e8f9'
      });

      currentX = nearby.enemy.x;
      currentY = nearby.enemy.y;
    }
  }

  private updateStormShields(dt: number, level: number) {
    const isEvo = !!this.weapons.orbiting_shield.isEvolved;
    const darkAngelsMult = this.chapter === 'dark_angels' ? 1.25 : 1.0;
    const shieldCount = isEvo ? 4 : (level >= 4 ? 4 : (level >= 2 ? 3 : 2));
    const rotSpeed = (3.2 + level * 0.4) * (isEvo ? 1.35 : 1.0);
    this.stormShieldAngle = (this.stormShieldAngle + rotSpeed * dt) % (Math.PI * 2);
    if (this.shieldShockCooldown > 0) this.shieldShockCooldown -= dt;

    const orbitRadius = 75 + level * 4;
    const baseDmg = (24 + level * 8) * (isEvo ? 1.6 : 1.0) * darkAngelsMult * this.playerStats.damageMult;

    for (let i = 0; i < shieldCount; i++) {
      const angle = this.stormShieldAngle + (i * Math.PI * 2) / shieldCount;
      const sx = this.playerX + Math.cos(angle) * orbitRadius;
      const sy = this.playerY + Math.sin(angle) * orbitRadius;

      // Block enemy acid & warp projectiles
      for (let p = this.projectiles.length - 1; p >= 0; p--) {
        const proj = this.projectiles[p];
        if (proj.type === 'enemy_acid' || proj.type === 'enemy_warp') {
          const dist = Math.hypot(proj.x - sx, proj.y - sy);
          if (dist < 24 * darkAngelsMult) {
            sounds.playShieldBash();
            for (let s = 0; s < 6; s++) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 140,
                vy: (Math.random() - 0.5) * 140,
                life: 0.2,
                maxLife: 0.2,
                color: '#38bdf8',
                size: 3,
                shape: 'spark'
              });
            }
            if (isEvo) {
              this.triggerChainLightning(sx, sy, 3, baseDmg * 1.4, 'orbiting_shield');
            }
            this.projectiles.splice(p, 1);
          }
        }
      }

      // Knockback enemies & Aegis of Terra electric shockwave
      for (const enemy of [...this.enemies]) {
        const dist = Math.hypot(enemy.x - sx, enemy.y - sy);
        if (dist < enemy.radius + 18 * darkAngelsMult) {
          this.lastDamageWeapon = 'orbiting_shield';
          this.damageEnemy(enemy, baseDmg * dt * 4, false, '#38bdf8');
          const kx = enemy.x - this.playerX;
          const ky = enemy.y - this.playerY;
          const klen = Math.hypot(kx, ky) || 1;
          enemy.x += (kx / klen) * (180 + level * 25) * dt;
          enemy.y += (ky / klen) * (180 + level * 25) * dt;

          // Evolved Aegis of Terra: Electric shockwave + chain lightning on collision
          if (isEvo && this.shieldShockCooldown <= 0) {
            this.shieldShockCooldown = 0.45;
            this.shockwaves.push({
              id: this.effectIdCounter++,
              x: sx,
              y: sy,
              currentRadius: 8,
              maxRadius: 85,
              damage: baseDmg * 1.3,
              hitEnemyIds: new Set(),
              color: '#67e8f9'
            });
            this.triggerChainLightning(sx, sy, 3, baseDmg, 'orbiting_shield');
          }

          if (Math.random() < 0.25) {
            sounds.playShieldBash();
            this.particles.push({
              x: sx,
              y: sy,
              vx: (Math.random() - 0.5) * 80,
              vy: (Math.random() - 0.5) * 80,
              life: 0.15,
              maxLife: 0.15,
              color: '#38bdf8',
              size: 4,
              shape: 'spark'
            });
          }
        }
      }
    }
  }

  private fireVortexGrenade(level: number) {
    const isEvo = !!this.weapons.vortex_grenade.isEvolved;
    const targets = this.getClosestEnemies(level >= 4 ? 2 : 1);
    if (targets.length === 0 && this.aimMode !== 'manual') return;

    sounds.playVortex();
    const count = level >= 4 ? 2 : 1;

    for (let i = 0; i < count; i++) {
      const target = targets[i % Math.max(1, targets.length)];
      const baseX = (this.aimMode === 'manual' && i === 0) ? this.mouseWorldX : (target ? target.x : this.mouseWorldX);
      const baseY = (this.aimMode === 'manual' && i === 0) ? this.mouseWorldY : (target ? target.y : this.mouseWorldY);
      const targetX = baseX + (Math.random() - 0.5) * (this.aimMode === 'manual' && i === 0 ? 15 : 40);
      const targetY = baseY + (Math.random() - 0.5) * (this.aimMode === 'manual' && i === 0 ? 15 : 40);
      const duration = (2.2 + (level - 1) * 0.4) * (isEvo ? 1.25 : 1.0);
      const radius = (130 + (level - 1) * 25) * (isEvo ? 1.45 : 1.0);
      const damage = (90 + (level - 1) * 35) * (isEvo ? 1.65 : 1.0) * this.playerStats.damageMult;

      this.vortices.push({
        id: this.effectIdCounter++,
        x: targetX,
        y: targetY,
        radius,
        duration,
        maxDuration: duration,
        damage,
        pulseTimer: 0
      });
    }
  }

  private updateVortices(dt: number) {
    const isEvo = !!this.weapons.vortex_grenade.isEvolved;
    for (let i = this.vortices.length - 1; i >= 0; i--) {
      const v = this.vortices[i];
      v.duration -= dt;
      v.pulseTimer += dt;

      for (const enemy of [...this.enemies]) {
        const dx = v.x - enemy.x;
        const dy = v.y - enemy.y;
        const dist = Math.hypot(dx, dy);

        if (dist < v.radius) {
          const pullForce = Math.max(isEvo ? 240 : 160, (isEvo ? 620 : 480) - dist * 1.5);
          enemy.x += (dx / Math.max(1, dist)) * pullForce * dt;
          enemy.y += (dy / Math.max(1, dist)) * pullForce * dt;
          enemy.vortexMarkedTimer = 0.6;

          if (dist < (isEvo ? 75 : 45) && v.pulseTimer >= 0.25) {
            this.lastDamageWeapon = 'vortex_grenade';
            this.damageEnemy(enemy, v.damage * (isEvo ? 0.2 : 0.12), false, '#a855f7');
          }
        }
      }

      if (v.pulseTimer >= 0.25) v.pulseTimer = 0;

      if (v.duration <= 0) {
        sounds.playExplosion();
        this.screenShakeAmount = isEvo ? 16 : 9;
        this.lastDamageWeapon = 'vortex_grenade';
        this.detonateAoE(v.x, v.y, v.radius * (isEvo ? 1.05 : 0.85), v.damage, 'vortex_grenade');
        if (isEvo) {
          this.triggerChainLightning(v.x, v.y, 6, v.damage * 0.5, 'vortex_grenade');
        }

        for (let p = 0; p < (isEvo ? 36 : 24); p++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 80 + Math.random() * 180;
          this.particles.push({
            x: v.x,
            y: v.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 0.45,
            maxLife: 0.45,
            color: Math.random() < 0.5 ? '#7e22ce' : '#38bdf8',
            size: 5 + Math.random() * 4
          });
        }
        this.vortices.splice(i, 1);
      }
    }
  }

  private fireThunderHammer(level: number) {
    const isEvo = !!this.weapons.thunder_hammer.isEvolved;
    sounds.playThunderHammer();
    this.addTrauma(isEvo ? 0.65 : 0.40);
    this.screenShakeAmount = isEvo ? 13 : 8;
    const baseDmg = (85 + (level - 1) * 30) * (isEvo ? 1.55 : 1.0) * this.playerStats.damageMult;
    const maxRadius = (140 + (level - 1) * 25) * (isEvo ? 1.25 : 1.0);

    this.shockwaves.push({
      id: this.effectIdCounter++,
      x: this.playerX,
      y: this.playerY,
      currentRadius: 15,
      maxRadius,
      damage: baseDmg,
      hitEnemyIds: new Set(),
      color: isEvo ? '#fbbf24' : '#38bdf8'
    });

    // Evolved Thunder God Storm: 10-target chain lightning + persistent static field
    if (isEvo) {
      this.triggerChainLightning(this.playerX, this.playerY, 10, baseDmg * 0.75, 'thunder_hammer');
      this.groundHazards.push({
        id: this.effectIdCounter++,
        x: this.playerX,
        y: this.playerY,
        radius: maxRadius * 0.65,
        duration: 3.5,
        maxDuration: 3.5,
        damagePerTick: baseDmg * 0.22,
        type: 'static_field',
        tickTimer: 0,
        weaponId: 'thunder_hammer'
      });
    }

    if (level >= 4 || isEvo) {
      setTimeout(() => {
        if (this.state === 'PLAYING') {
          this.shockwaves.push({
            id: this.effectIdCounter++,
            x: this.playerX,
            y: this.playerY,
            currentRadius: 15,
            maxRadius: maxRadius * 1.25,
            damage: baseDmg * 0.85,
            hitEnemyIds: new Set(),
            color: '#67e8f9'
          });
        }
      }, 180);
    }
  }

  private updateShockwaves(dt: number) {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.currentRadius += 380 * dt;

      for (const enemy of [...this.enemies]) {
        if (sw.hitEnemyIds.has(enemy.id)) continue;
        const dist = Math.hypot(enemy.x - sw.x, enemy.y - sw.y);
        if (Math.abs(dist - sw.currentRadius) < 32 + enemy.radius) {
          sw.hitEnemyIds.add(enemy.id);
          // Conductive Swarm synergy: +75% damage to vortex-marked enemies
          const conductiveMult = (enemy.vortexMarkedTimer || 0) > 0 ? 1.75 : 1.0;
          if (this.weapons.thunder_hammer.level >= 3) {
            enemy.stunTimer = Math.max(enemy.stunTimer || 0, 0.85);
          }
          this.lastDamageWeapon = 'thunder_hammer';
          this.damageEnemy(enemy, sw.damage * conductiveMult, Math.random() < this.playerStats.critChance, conductiveMult > 1 ? '#e879f9' : '#38bdf8');
          const kx = enemy.x - sw.x;
          const ky = enemy.y - sw.y;
          const klen = Math.hypot(kx, ky) || 1;
          enemy.x += (kx / klen) * 28;
          enemy.y += (ky / klen) * 28;
        }
      }

      if (sw.currentRadius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  private updateGroundHazards(dt: number) {
    for (let i = this.groundHazards.length - 1; i >= 0; i--) {
      const hz = this.groundHazards[i];
      hz.duration -= dt;
      hz.tickTimer += dt;

      if (hz.tickTimer >= 0.35) {
        hz.tickTimer = 0;
        for (const enemy of [...this.enemies]) {
          const dist = Math.hypot(enemy.x - hz.x, enemy.y - hz.y);
          if (dist < hz.radius + enemy.radius) {
            this.lastDamageWeapon = hz.weaponId;
            const color = hz.type === 'plasma_pool' ? '#10b981' : (hz.type === 'promethium_fire' ? '#38bdf8' : '#67e8f9');
            this.damageEnemy(enemy, hz.damagePerTick, false, color);
            if (hz.type === 'promethium_fire') {
              enemy.burningTimer = Math.max(enemy.burningTimer || 0, 2.5);
            } else if (hz.type === 'static_field') {
              enemy.stunTimer = Math.max(enemy.stunTimer || 0, 0.25);
            }
          }
        }
      }

      if (hz.duration <= 0) {
        this.groundHazards.splice(i, 1);
      }
    }
  }

  private updateBeamVisuals(dt: number) {
    for (let i = this.laserBeams.length - 1; i >= 0; i--) {
      const beam = this.laserBeams[i];
      beam.life -= dt;
      if (beam.life <= 0) this.laserBeams.splice(i, 1);
    }

    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      const arc = this.lightningArcs[i];
      arc.life -= dt;
      if (arc.life <= 0) this.lightningArcs.splice(i, 1);
    }
  }

  private firePlasma(level: number) {
    const isEvo = !!this.weapons.plasma_cannon.isEvolved;
    const darkAngelsMult = this.chapter === 'dark_angels' ? 1.25 : 1.0;
    const shotCount = isEvo ? 2 : (level >= 5 ? 2 : 1);
    const targets = this.getClosestEnemies(shotCount);
    const isMouseAim = this.aimMode === 'manual' || this.aimMode === 'hybrid';
    if (targets.length === 0 && !isMouseAim) return;

    sounds.playPlasmaShot();
    this.playerShootTimer = 0.12;
    this.playerIsBraced = true;
    this.bracedTimer = 0.30;
    this.playerOverheatHeat = Math.min(1.0, this.playerOverheatHeat + 0.20);
    for (let i = 0; i < shotCount; i++) {
      const target = targets[i % Math.max(1, targets.length)];
      const angle = (this.aimMode === 'manual' || (this.aimMode === 'hybrid' && i === 0))
        ? this.getAimAngle(target, true) + (shotCount > 1 ? (i - 0.5) * 0.18 : 0)
        : (target ? Math.atan2(target.y - this.playerY, target.x - this.playerX) : this.getAimAngle(undefined, true));
      const speed = isEvo ? 360 : 320;
      const baseDmg = (75 + (level - 1) * 30) * (isEvo ? 1.55 : 1.0) * darkAngelsMult;
      const damage = Math.round(baseDmg * this.playerStats.damageMult);

      const muzzle = this.getPlayerMuzzlePosition(angle);

      this.projectiles.push({
        id: this.projIdCounter++,
        type: 'plasma_cannon',
        x: muzzle.x,
        y: muzzle.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: (8 + (level - 1) * 1.5) * darkAngelsMult * (isEvo ? 1.3 : 1.0),
        damage,
        duration: 1.8,
        maxDuration: 1.8,
        pierce: 1,
        piercedEnemyIds: new Set(),
        color: isEvo ? '#34d399' : '#10b981',
        trailParticles: true,
        aoeRadius: (75 + (level - 1) * 18) * darkAngelsMult * (isEvo ? 1.25 : 1.0)
      });
    }
  }

  private updateChainswords(dt: number, level: number) {
    const isEvo = !!this.weapons.chainsword_orbit.isEvolved;
    const swordCount = Math.min(4, isEvo ? 4 : (level >= 5 ? 4 : (level >= 4 ? 3 : (level >= 2 ? 2 : 1))));
    const rotSpeed = (3.8 + level * 0.4) * (isEvo ? 1.45 : 1.0);
    this.chainswordAngle = (this.chainswordAngle + rotSpeed * dt) % (Math.PI * 2);

    const orbitRadius = 60 + level * 4;
    const baseDmg = (22 + level * 8) * (isEvo ? 1.65 : 1.0) * this.playerStats.damageMult;

    for (let i = 0; i < swordCount; i++) {
      const angle = this.chainswordAngle + (i * Math.PI * 2) / swordCount;
      const sx = this.playerX + Math.cos(angle) * orbitRadius;
      const sy = this.playerY + Math.sin(angle) * orbitRadius;

      for (const enemy of [...this.enemies]) {
        const dist = Math.hypot(enemy.x - sx, enemy.y - sy);
        if (dist < enemy.radius + (isEvo ? 20 : 15)) {
          // Synergy: Shredded Carapace (+25% ballistic damage taken for 3.5s)
          enemy.shreddedTimer = 3.5;
          if (isEvo) {
            enemy.burningTimer = Math.max(enemy.burningTimer || 0, 1.5);
          }
          this.lastDamageWeapon = 'chainsword_orbit';
          this.damageEnemy(enemy, baseDmg * dt * 4, false, isEvo ? '#fbbf24' : '#f43f5e');

          if (Math.random() < 0.35) {
            sounds.playChainsword();
            this.particles.push({
              x: sx,
              y: sy,
              vx: (Math.random() - 0.5) * 130,
              vy: (Math.random() - 0.5) * 130,
              life: 0.18,
              maxLife: 0.18,
              color: isEvo ? '#ef4444' : '#facc15',
              size: 3,
              shape: 'spark'
            });
          }
        }
      }
    }
  }

  private fireGrenades(level: number) {
    const isEvo = !!this.weapons.frag_grenade.isEvolved;
    const targets = this.getClosestEnemies(3);
    if (targets.length === 0 && this.aimMode !== 'manual') return;

    sounds.playExplosion();
    const count = isEvo ? 5 : (level >= 4 ? 3 : (level >= 2 ? 2 : 1));

    for (let i = 0; i < count; i++) {
      const target = targets[i % Math.max(1, targets.length)];
      const baseX = this.aimMode === 'manual' ? this.mouseWorldX : (target ? target.x : this.mouseWorldX);
      const baseY = this.aimMode === 'manual' ? this.mouseWorldY : (target ? target.y : this.mouseWorldY);
      const spreadRange = isEvo ? 95 : 60;
      const targetX = baseX + (Math.random() - 0.5) * spreadRange;
      const targetY = baseY + (Math.random() - 0.5) * spreadRange;
      const angle = Math.atan2(targetY - this.playerY, targetX - this.playerX);
      const dist = Math.hypot(targetX - this.playerX, targetY - this.playerY);
      const flightDuration = Math.min(0.85, Math.max(0.35, dist / 420));

      const baseDmg = (95 + (level - 1) * 35) * (isEvo ? 1.45 : 1.0);
      const damage = Math.round(baseDmg * this.playerStats.damageMult);

      this.projectiles.push({
        id: this.projIdCounter++,
        type: 'frag_grenade',
        x: this.playerX,
        y: this.playerY,
        vx: Math.cos(angle) * (dist / flightDuration),
        vy: Math.sin(angle) * (dist / flightDuration),
        radius: isEvo ? 7.5 : 6,
        damage,
        duration: flightDuration,
        maxDuration: flightDuration,
        pierce: 999,
        piercedEnemyIds: new Set(),
        color: isEvo ? '#f59e0b' : '#dc2626',
        aoeRadius: (85 + (level - 1) * 20) * (isEvo ? 1.2 : 1.0)
      });
    }
  }

  private fireFlamer(level: number) {
    const isEvo = !!this.weapons.heavy_flamer.isEvolved;
    sounds.playFlamer();
    const facingAngle = this.aimMode === 'manual' || this.aimMode === 'hybrid'
      ? this.getAimAngle(undefined, true)
      : (this.playerFacingLeft ? Math.PI : 0);
    const coneSpread = (0.60 + (level - 1) * 0.1) * (isEvo ? 1.25 : 1.0);
    const baseDmg = (18 + level * 7) * (isEvo ? 1.55 : 1.0) * this.playerStats.damageMult;
    const particleCount = 16 + level * 4;

    // Evolved Promethium Inferno: Spawn persistent blue fire pool along the flame cone
    if (isEvo) {
      const poolDist = 115 + Math.random() * 65;
      this.groundHazards.push({
        id: this.effectIdCounter++,
        x: this.playerX + Math.cos(facingAngle) * poolDist,
        y: this.playerY + Math.sin(facingAngle) * poolDist,
        radius: 58,
        duration: 3.5,
        maxDuration: 3.5,
        damagePerTick: baseDmg * 0.55,
        type: 'promethium_fire',
        tickTimer: 0,
        weaponId: 'heavy_flamer'
      });
    }

    for (let i = 0; i < particleCount; i++) {
      const angle = facingAngle + (Math.random() - 0.5) * coneSpread;
      const speed = 260 + Math.random() * 160;

      this.projectiles.push({
        id: this.projIdCounter++,
        type: 'heavy_flamer',
        x: this.playerX + (this.playerFacingLeft ? -15 : 15),
        y: this.playerY - 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 9 + Math.random() * 8,
        damage: baseDmg,
        duration: isEvo ? 0.58 : 0.48,
        maxDuration: isEvo ? 0.58 : 0.48,
        pierce: 999,
        piercedEnemyIds: new Set(),
        color: isEvo ? '#38bdf8' : (level >= 5 ? '#38bdf8' : (Math.random() < 0.5 ? '#f97316' : '#ef4444'))
      });
    }
  }

  private fireMelta(level: number) {
    const isEvo = !!this.weapons.melta_lance.isEvolved;
    const darkAngelsMult = this.chapter === 'dark_angels' ? 1.25 : 1.0;
    sounds.playMelta();
    this.screenShakeAmount = isEvo ? 11 : 6;
    const facingAngle = this.aimMode === 'manual' || this.aimMode === 'hybrid'
      ? this.getAimAngle(undefined, true)
      : (this.playerFacingLeft ? Math.PI : 0);
    const angles = (level >= 5 || isEvo) ? [facingAngle, facingAngle + Math.PI] : [facingAngle];
    const baseDmg = (160 + (level - 1) * 50) * (isEvo ? 1.6 : 1.0) * darkAngelsMult * this.playerStats.damageMult;

    for (const ang of angles) {
      const beamLength = 680;
      const beamWidth = (26 + level * 6) * darkAngelsMult * (isEvo ? 1.3 : 1.0);

      this.laserBeams.push({
        x1: this.playerX,
        y1: this.playerY - 6,
        x2: this.playerX + Math.cos(ang) * beamLength,
        y2: this.playerY - 6 + Math.sin(ang) * beamLength,
        life: 0.24,
        maxLife: 0.24,
        color: isEvo ? '#f97316' : '#38bdf8',
        width: beamWidth * 0.65
      });

      for (const enemy of [...this.enemies]) {
        const dx = enemy.x - this.playerX;
        const dy = enemy.y - this.playerY;
        const distAlongBeam = dx * Math.cos(ang) + dy * Math.sin(ang);
        const distPerpBeam = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang));

        if (distAlongBeam > 0 && distAlongBeam < beamLength && distPerpBeam < beamWidth + enemy.radius) {
          // Evolved Multi-Melta Annihilator: Shreds Boss/Elite armor (+6% Max HP bonus damage)
          const armorShredBonus = isEvo && (enemy.type === 'carnifex_boss' || enemy.type === 'hive_tyrant' || enemy.isElite)
            ? enemy.maxHp * 0.06
            : 0;
          // Synergy: Thermal Detonation on burning enemies
          if ((enemy.burningTimer || 0) > 0) {
            this.lastDamageWeapon = 'melta_lance';
            this.detonateAoE(enemy.x, enemy.y, 75, baseDmg * 0.5, 'melta_lance');
          }
          this.lastDamageWeapon = 'melta_lance';
          this.damageEnemy(enemy, baseDmg + armorShredBonus, true, isEvo ? '#fb923c' : '#38bdf8');
        }
      }

      for (let d = 0; d < beamLength; d += 22) {
        this.particles.push({
          x: this.playerX + Math.cos(ang) * d,
          y: this.playerY + Math.sin(ang) * d,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          life: 0.22,
          maxLife: 0.22,
          color: isEvo ? '#fb923c' : '#38bdf8',
          size: 7 + Math.random() * 4
        });
      }
    }
  }

  private firePowerSword(level: number) {
    const isEvo = !!this.weapons.power_sword.isEvolved;
    const targets = this.getClosestEnemies(2);
    sounds.playChainsword();
    this.playerMeleeSlashTimer = 0.16;

    const slashCount = isEvo ? 3 : (level >= 3 ? 2 : 1);
    const baseDmg = (46 + (level - 1) * 18) * (isEvo ? 1.65 : 1.0) * this.playerStats.damageMult;

    for (let s = 0; s < slashCount; s++) {
      const target = targets[s % Math.max(1, targets.length)];
      let angle = this.getAimAngle(target, true);
      if (s === 1) angle += isEvo ? 0.28 : Math.PI * 0.65;
      else if (s === 2) angle -= 0.28;

      const speed = isEvo ? 540 : 410;
      const duration = isEvo ? 1.15 : 0.42 + level * 0.04;
      const radius = (20 + level * 3.5) * (isEvo ? 1.35 : 1.0);

      this.projectiles.push({
        id: this.projIdCounter++,
        type: 'power_sword',
        x: this.playerX + Math.cos(angle) * 18,
        y: this.playerY - 4 + Math.sin(angle) * 18,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        damage: Math.round(baseDmg),
        duration,
        maxDuration: duration,
        pierce: isEvo ? 999 : (level >= 5 ? 8 : 4 + level),
        piercedEnemyIds: new Set(),
        color: isEvo ? '#f97316' : '#38bdf8',
        rotAngle: angle,
        knockback: isEvo ? 36 : 28
      });
    }
  }

  private fireAssaultCannon(level: number) {
    const isEvo = !!this.weapons.assault_cannon.isEvolved;
    const targets = this.getClosestEnemies(2);
    const isMouseAim = this.aimMode === 'manual' || this.aimMode === 'hybrid';
    if (targets.length === 0 && !isMouseAim) return;

    sounds.playHeavyBolter();
    this.playerShootTimer = 0.08;
    this.playerIsBraced = true;
    this.bracedTimer = 0.22;
    this.playerOverheatHeat = Math.min(1.0, this.playerOverheatHeat + 0.07);
    const streamCount = isEvo ? 3 : (level >= 4 ? 2 : 1);
    const baseDmg = (19 + (level - 1) * 6) * (isEvo ? 1.45 : 1.0) * this.playerStats.damageMult;

    for (let s = 0; s < streamCount; s++) {
      const target = targets[s % Math.max(1, targets.length)];
      const baseAim = this.getAimAngle(target, true);
      const spread = (Math.random() - 0.5) * (isEvo ? 0.24 : 0.14) + (s - (streamCount - 1) / 2) * 0.08;
      const angle = baseAim + spread;
      const speed = 760 + Math.random() * 60;

      const muzzle = this.getPlayerMuzzlePosition(angle);

      this.projectiles.push({
        id: this.projIdCounter++,
        type: 'assault_cannon',
        x: muzzle.x,
        y: muzzle.y + (s - (streamCount - 1) / 2) * 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: isEvo ? 5 : 4,
        damage: Math.round(baseDmg),
        duration: 0.85,
        maxDuration: 0.85,
        pierce: isEvo ? 3 : (level >= 2 ? 2 : 1),
        piercedEnemyIds: new Set(),
        color: isEvo ? '#fbbf24' : '#38bdf8',
        rotAngle: angle,
        knockback: 20,
        aoeRadius: isEvo ? 40 : undefined
      });
    }
  }

  private fireCycloneMissiles(level: number) {
    const isEvo = !!this.weapons.cyclone_missile.isEvolved;
    const visibleEnemies = this.enemies.filter(e => e.burrowState !== 'burrowed');
    if (visibleEnemies.length === 0 && this.aimMode !== 'manual') return;

    sounds.playExplosion();
    const missileCount = isEvo ? 8 : (level >= 5 ? 5 : (level >= 4 ? 4 : (level >= 2 ? 3 : 2)));
    const baseDmg = (68 + (level - 1) * 24) * (isEvo ? 1.5 : 1.0) * this.playerStats.damageMult;
    const aoeRadius = (68 + level * 10) * (isEvo ? 1.25 : 1.0);

    // Prioritize Bosses & Elites, then closest enemies
    const prioritized = [...visibleEnemies].sort((a, b) => {
      const aScore = (a.type === 'hive_tyrant' || a.type === 'carnifex_boss' || a.type === 'trygon_prime' ? 1000 : a.isElite || a.type === 'broodlord' || a.type === 'toxicrene' ? 500 : 0) - Math.hypot(a.x - this.playerX, a.y - this.playerY) * 0.4;
      const bScore = (b.type === 'hive_tyrant' || b.type === 'carnifex_boss' || b.type === 'trygon_prime' ? 1000 : b.isElite || b.type === 'broodlord' || b.type === 'toxicrene' ? 500 : 0) - Math.hypot(b.x - this.playerX, b.y - this.playerY) * 0.4;
      return bScore - aScore;
    });

    for (let m = 0; m < missileCount; m++) {
      const target = prioritized[m % Math.max(1, prioritized.length)];
      const baseAngle = target
        ? Math.atan2(target.y - this.playerY, target.x - this.playerX)
        : this.getAimAngle(undefined, true);
      const launchAngle = baseAngle + ((m - (missileCount - 1) / 2) * 0.24);
      const speed = isEvo ? 470 : 410;

      this.projectiles.push({
        id: this.projIdCounter++,
        type: 'cyclone_missile',
        x: this.playerX + (m % 2 === 0 ? -12 : 12),
        y: this.playerY - 18,
        vx: Math.cos(launchAngle) * speed,
        vy: Math.sin(launchAngle) * speed,
        radius: isEvo ? 7 : 6,
        damage: Math.round(baseDmg),
        duration: 2.3,
        maxDuration: 2.3,
        pierce: 1,
        piercedEnemyIds: new Set(),
        color: isEvo ? '#facc15' : '#ef4444',
        aoeRadius,
        rotAngle: launchAngle,
        knockback: 34,
        homing: true
      });
    }
  }

  // --- Horde Director (Tuned for 6-Minute Countdown & Boss Rush) ---
  private spawnDirector(dt: number) {
    if (this.gameMode === 'firing_range') {
      // In Firing Range mode, keep target dummies alive or respawn if killed
      if (!this.enemies.some(e => e.isDummy)) {
        this.spawnFiringRangeDummies();
      }
      return;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;

    const t = this.elapsedGameTime;
    const spawnInterval = Math.max(0.32, 1.5 - Math.min(1.15, t / 110));
    this.spawnTimer = spawnInterval;

    const waveSize = Math.min(26, Math.floor(5 + t / 12)) + (this.specialWave === 'swarm' ? 5 : 0);
    for (let i = 0; i < waveSize; i++) {
      this.spawnSingleEnemy();
    }

    // Broodlord Alpha Ambush at 90s and 200s
    if (t >= 90 && !this.broodlordSpawned90) {
      this.broodlordSpawned90 = true;
      this.spawnBroodlordAmbush();
    }
    if (t >= 200 && !this.broodlordSpawned200) {
      this.broodlordSpawned200 = true;
      this.spawnBroodlordAmbush();
    }

    if (this.gameMode === 'boss_rush') {
      if (t >= 20 && !this.enemies.some(e => e.type === 'carnifex_boss')) {
        const bossCountTrigger = Math.floor((t - 20) / 70);
        if (this.bossesKilled <= bossCountTrigger) {
          this.spawnCarnifexBoss();
        }
      }
      if (t >= 80 && !this.trygonSpawned) {
        this.trygonSpawned = true;
        this.spawnTrygonPrimeBoss();
      }
      if (t >= 140 && !this.enemies.some(e => e.type === 'hive_tyrant')) {
        this.spawnHiveTyrantBoss();
      }
    } else {
      // Standard 6-Minute Crusade (360s) or Endless
      if (t >= 120 && !this.enemies.some(e => e.type === 'carnifex_boss')) {
        const bossCountTrigger = Math.floor((t - 120) / 100);
        if (this.bossesKilled <= bossCountTrigger) {
          this.spawnCarnifexBoss();
        }
      }

      if (t >= 150 && !this.trygonSpawned) {
        this.trygonSpawned = true;
        this.spawnTrygonPrimeBoss();
      }

      if (t >= 280 && !this.enemies.some(e => e.type === 'hive_tyrant')) {
        this.spawnHiveTyrantBoss();
      }
    }
  }

  private spawnBroodlordAmbush() {
    sounds.playCarnifexRoar();
    this.screenShakeAmount = 14;
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 560;
    const bx = this.playerX + Math.cos(angle) * spawnDist;
    const by = this.playerY + Math.sin(angle) * spawnDist;

    this.addBattleSpeechBubble(this.playerX, this.playerY, '⚠️ BROODLORD GENESTEALER AMBUSH!', '#f43f5e');
    const hp = 1650 + this.elapsedGameTime * 8;
    this.enemies.push({
      id: this.enemyIdCounter++,
      type: 'broodlord',
      x: bx,
      y: by,
      vx: 0,
      vy: 0,
      radius: 30,
      hp,
      maxHp: hp,
      speed: 145,
      damage: 38,
      xpValue: 90,
      facingLeft: false,
      animFrame: 0,
      color: '#a855f7',
      hitFlashTimer: 0,
      isElite: true
    });
    for (let i = 0; i < 6; i++) {
      const a = angle + (i - 2.5) * 0.14;
      this.enemies.push({
        id: this.enemyIdCounter++,
        type: 'genestealer',
        x: this.playerX + Math.cos(a) * (spawnDist + 45),
        y: this.playerY + Math.sin(a) * (spawnDist + 45),
        vx: 0,
        vy: 0,
        radius: 16,
        hp: 95 + this.elapsedGameTime,
        maxHp: 95 + this.elapsedGameTime,
        speed: 150,
        damage: 20,
        xpValue: 9,
        facingLeft: false,
        animFrame: i,
        color: '#7e22ce',
        hitFlashTimer: 0
      });
    }
  }

  private spawnSingleEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(this.canvas.width, this.canvas.height) * 0.65 + 50;
    const x = this.playerX + Math.cos(angle) * spawnDist;
    const y = this.playerY + Math.sin(angle) * spawnDist;

    const t = this.elapsedGameTime;
    let type: Enemy['type'] = 'hormagaunt';
    const rand = Math.random();

    if (this.specialWave === 'ranged' && rand < 0.6) type = 'termagant';
    else if (this.specialWave === 'elite' && rand < 0.45) type = 'tyranid_warrior';
    else if (this.specialWave === 'swarm' && rand < 0.6) type = 'genestealer';
    else if (t > 105 && rand < 0.08) {
      type = 'toxicrene';
    } else if (t > 140 && rand < 0.14) {
      type = 'lictor';
    } else if (t > 70 && rand < 0.16) {
      type = 'biovore';
    } else if (t > 60 && rand < 0.22) {
      type = 'zoanthrope';
    } else if (t > 85 && rand < 0.20) {
      type = 'tyranid_warrior';
    } else if (t > 35 && rand < 0.28) {
      type = 'genestealer';
    } else if (t > 15 && rand < 0.35) {
      type = 'termagant';
    }

    let hp = 32 + t * 0.55;
    let speed = 95 + Math.random() * 20;
    let damage = 12;
    let radius = 13;
    let xpValue = 3;

    if (type === 'termagant') {
      hp = 48 + t * 0.65;
      speed = 75;
      radius = 14;
      damage = 10;
      xpValue = 4;
    } else if (type === 'genestealer') {
      hp = 75 + t * 0.95;
      speed = 135 + Math.random() * 25;
      radius = 16;
      damage = 18;
      xpValue = 7;
    } else if (type === 'tyranid_warrior') {
      hp = 220 + t * 1.8;
      speed = 70;
      radius = 24;
      damage = 28;
      xpValue = 18;
    } else if (type === 'zoanthrope') {
      hp = 155 + t * 1.2;
      speed = 65;
      radius = 18;
      damage = 22;
      xpValue = 16;
    } else if (type === 'biovore') {
      hp = 195 + t * 1.4;
      speed = 52;
      radius = 22;
      damage = 24;
      xpValue = 22;
    } else if (type === 'lictor') {
      hp = 205 + t * 1.5;
      speed = 150;
      radius = 20;
      damage = 34;
      xpValue = 25;
    } else if (type === 'toxicrene') {
      hp = 380 + t * 2.4;
      speed = 64;
      radius = 25;
      damage = 30;
      xpValue = 32;
    }

    if (this.activeOaths.includes('oath_fury')) {
      speed *= 1.20;
    }

    const isElite = type === 'toxicrene' || (this.specialWave === 'elite' && type === 'tyranid_warrior' && Math.random() < 0.35);
    if (isElite) { hp *= 2.5; damage *= 1.4; xpValue *= 2; }
    this.enemies.push({
      id: this.enemyIdCounter++,
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      radius,
      hp,
      maxHp: hp,
      speed,
      damage,
      xpValue,
      shootCooldown: type === 'termagant' ? 2.5 + Math.random() * 1.5 : (type === 'zoanthrope' ? 3.0 + Math.random() * 1.5 : (type === 'biovore' ? 4.2 : undefined)),
      facingLeft: false,
      animFrame: Math.random() * 10,
      color: type === 'zoanthrope' ? '#7c3aed' : (type === 'lictor' ? '#a855f7' : (type === 'biovore' ? '#65a30d' : '#7e22ce')),
      hitFlashTimer: 0,
      isElite
    });
  }

  private spawnHiveTyrantBoss() {
    sounds.playHiveTyrantRoar();
    this.screenShakeAmount = 24;

    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 680;
    const x = this.playerX + Math.cos(angle) * spawnDist;
    const y = this.playerY + Math.sin(angle) * spawnDist;

    const hp = 7000 + this.elapsedGameTime * 20;

    this.enemies.push({
      id: this.enemyIdCounter++,
      type: 'hive_tyrant',
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 56,
      hp,
      maxHp: hp,
      speed: 85,
      damage: 55,
      xpValue: 350,
      shootCooldown: 3.5,
      chargeTimer: 5.0,
      isCharging: false,
      facingLeft: false,
      animFrame: 0,
      color: '#3b0764',
      hitFlashTimer: 0
    });
  }

  private spawnCarnifexBoss() {
    sounds.playCarnifexRoar();
    this.screenShakeAmount = 16;

    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 650;
    const x = this.playerX + Math.cos(angle) * spawnDist;
    const y = this.playerY + Math.sin(angle) * spawnDist;

    const hp = 2600 + this.elapsedGameTime * 10;

    this.enemies.push({
      id: this.enemyIdCounter++,
      type: 'carnifex_boss',
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 46,
      hp,
      maxHp: hp,
      speed: 80,
      damage: 44,
      xpValue: 100,
      chargeTimer: 4.0,
      isCharging: false,
      facingLeft: false,
      animFrame: 0,
      color: '#581c87',
      hitFlashTimer: 0
    });
  }

  private spawnTrygonPrimeBoss() {
    sounds.playHiveTyrantRoar();
    this.screenShakeAmount = 20;
    this.triggerHaptic([40, 30, 60]);

    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 580;
    const x = this.playerX + Math.cos(angle) * spawnDist;
    const y = this.playerY + Math.sin(angle) * spawnDist;
    const hp = 4200 + this.elapsedGameTime * 15;

    this.addBattleSpeechBubble(this.playerX, this.playerY, '⚠️ SEISMIC ALERT: TRYGON PRIME SURFACING!', '#38bdf8');
    this.enemies.push({
      id: this.enemyIdCounter++,
      type: 'trygon_prime',
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 48,
      hp,
      maxHp: hp,
      speed: 92,
      damage: 48,
      xpValue: 220,
      facingLeft: false,
      animFrame: 0,
      color: '#4c1d95',
      hitFlashTimer: 0,
      burrowState: 'surface',
      burrowTimer: 5.2,
      burrowTargetX: this.playerX,
      burrowTargetY: this.playerY
    });
  }

  // --- Entity Updates ---
  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.animFrame += dt;
      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;

      // Smoothly recover Squash & Stretch back to 1.0
      if (enemy.squashX !== undefined && enemy.squashX !== 1.0) {
        enemy.squashX += (1.0 - enemy.squashX) * Math.min(1.0, dt * 10);
        if (Math.abs(enemy.squashX - 1.0) < 0.02) enemy.squashX = 1.0;
      }
      if (enemy.squashY !== undefined && enemy.squashY !== 1.0) {
        enemy.squashY += (1.0 - enemy.squashY) * Math.min(1.0, dt * 10);
        if (Math.abs(enemy.squashY - 1.0) < 0.02) enemy.squashY = 1.0;
      }

      const dx = this.playerX - enemy.x;
      const dy = this.playerY - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (dx < -2) enemy.facingLeft = true;
      else if (dx > 2) enemy.facingLeft = false;

      // Boss Enrage Phase (<40% HP)
      if (
        (enemy.type === 'carnifex_boss' || enemy.type === 'hive_tyrant' || enemy.type === 'trygon_prime') &&
        !enemy.isEnraged &&
        enemy.hp / enemy.maxHp <= 0.40
      ) {
        enemy.isEnraged = true;
        enemy.speed *= 1.3;
        sounds.playHiveTyrantRoar();
        this.screenShakeAmount = 14;
        this.floatingTexts.push({
          id: this.textIdCounter++,
          x: enemy.x,
          y: enemy.y - enemy.radius - 16,
          text: '🔥 BOSS ENRAGED!',
          color: '#f43f5e',
          life: 1.1,
          maxLife: 1.1,
          isCrit: true
        });
      }

      // Trygon Prime Subterranean Burrow & Seismic Eruption
      if (enemy.type === 'trygon_prime') {
        enemy.burrowTimer = (enemy.burrowTimer ?? 5.5) - dt;
        if (enemy.burrowState === 'burrowed') {
          // Track player during early tremor, then lock seismic circle for final 0.85s so player can dodge!
          if (enemy.burrowTimer > 0.85) {
            enemy.burrowTargetX = this.playerX;
            enemy.burrowTargetY = this.playerY;
          }
          if (enemy.burrowTimer <= 0) {
            enemy.x = enemy.burrowTargetX ?? this.playerX;
            enemy.y = enemy.burrowTargetY ?? this.playerY;
            enemy.burrowState = 'surface';
            enemy.burrowTimer = enemy.isEnraged ? 4.4 : 6.0;
            sounds.playCarnifexRoar();
            this.screenShakeAmount = 18;
            this.triggerHaptic([40, 20, 55]);

            for (let p = 0; p < 24; p++) {
              const ang = (p * Math.PI * 2) / 24;
              const spd = 80 + Math.random() * 140;
              this.particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                life: 0.45,
                maxLife: 0.45,
                color: p % 2 === 0 ? '#38bdf8' : '#ef4444',
                size: 5 + Math.random() * 4
              });
            }

            if (Math.hypot(this.playerX - enemy.x, this.playerY - enemy.y) < 92) {
              this.hitPlayer(42);
            }
          }
          continue;
        } else if (enemy.burrowTimer <= 0) {
          enemy.burrowState = 'burrowed';
          enemy.burrowTimer = 1.65;
          enemy.burrowTargetX = this.playerX;
          enemy.burrowTargetY = this.playerY;
          this.screenShakeAmount = 8;
          continue;
        }
      }

      // Toxicrene Choking Spore Aura (slows player & deals light bio-toxin tick)
      if (enemy.type === 'toxicrene' && dist < 84) {
        this.playerToxicSlowTimer = 0.35;
        if (this.toxicAuraDamageTick <= 0) {
          this.toxicAuraDamageTick = 0.95;
          this.hitPlayer(8);
        }
      }

      // Carnifex boss charge
      if (enemy.type === 'carnifex_boss' && enemy.chargeTimer !== undefined) {
        enemy.chargeTimer -= dt;
        if (enemy.chargeTimer <= 0) {
          if (!enemy.isCharging) {
            enemy.isCharging = true;
            enemy.speed = 220;
            enemy.chargeTimer = 1.8;
            sounds.playCarnifexRoar();
            this.screenShakeAmount = 8;
          } else {
            enemy.isCharging = false;
            enemy.speed = 80;
            enemy.chargeTimer = 4.2;
          }
        }
      }

      // Termagant ranged acid spit
      if (enemy.type === 'termagant' && enemy.shootCooldown !== undefined) {
        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0 && dist < 420 && dist > 100) {
          enemy.shootCooldown = 3.0 + Math.random() * 1.5;
          const acidAngle = Math.atan2(dy, dx);
          this.projectiles.push({
            id: this.projIdCounter++,
            type: 'enemy_acid',
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(acidAngle) * 230,
            vy: Math.sin(acidAngle) * 230,
            radius: 5,
            damage: 14,
            duration: 2.2,
            maxDuration: 2.2,
            pierce: 1,
            piercedEnemyIds: new Set(),
            color: '#84cc16'
          });
        }
      }

      // Zoanthrope psychic warp blast
      if (enemy.type === 'zoanthrope' && enemy.shootCooldown !== undefined) {
        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0 && dist < 450) {
          enemy.shootCooldown = 3.2 + Math.random() * 1.5;
          sounds.playPsykerBlast();
          const warpAngle = Math.atan2(dy, dx);
          this.projectiles.push({
            id: this.projIdCounter++,
            type: 'enemy_warp',
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(warpAngle) * 210,
            vy: Math.sin(warpAngle) * 210,
            radius: 8,
            damage: 22,
            duration: 3.5,
            maxDuration: 3.5,
            pierce: 1,
            piercedEnemyIds: new Set(),
            color: '#22d3ee'
          });
        }
      }

      // Hormagaunt Pounce Leap Mechanic
      if (enemy.type === 'hormagaunt') {
        enemy.pounceTimer = (enemy.pounceTimer ?? 3.0) - dt;
        if (enemy.isPouncing) {
          if (enemy.pounceTimer <= 0) {
            enemy.isPouncing = false;
            enemy.pounceTimer = 3.2 + Math.random() * 1.5;
          }
        } else if (enemy.pounceTimer <= 0 && dist >= 85 && dist <= 240) {
          enemy.isPouncing = true;
          enemy.pounceTimer = 0.38;
          enemy.squashX = 0.74;
          enemy.squashY = 1.36;
          sounds.playDash();
        }
      }

      // Lictor Chameleonic Stealth Stalker
      if (enemy.type === 'lictor') {
        const targetAlpha = (dist < 170 || enemy.hitFlashTimer > 0) ? 1.0 : 0.22;
        enemy.stealthAlpha = (enemy.stealthAlpha ?? 0.22) + (targetAlpha - (enemy.stealthAlpha ?? 0.22)) * Math.min(1, dt * 5.0);
      }

      // Hive Tyrant multi-venom cannon
      if (enemy.type === 'hive_tyrant' && enemy.shootCooldown !== undefined) {
        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0 && dist < 520) {
          enemy.shootCooldown = 3.8;
          sounds.playCarnifexRoar();
          const baseAngle = Math.atan2(dy, dx);
          for (const off of [-0.25, 0, 0.25]) {
            this.projectiles.push({
              id: this.projIdCounter++,
              type: 'enemy_acid',
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(baseAngle + off) * 250,
              vy: Math.sin(baseAngle + off) * 250,
              radius: 9,
              damage: 26,
              duration: 2.4,
              maxDuration: 2.4,
              pierce: 1,
              piercedEnemyIds: new Set(),
              color: '#22c55e'
            });
          }
        }
      }

      // Hive Tyrant Phase 2: Bonesword Psychic Waves (<50% HP)
      if (enemy.type === 'hive_tyrant' && enemy.hp / enemy.maxHp <= 0.50) {
        enemy.boneswordTimer = (enemy.boneswordTimer ?? 3.0) - dt;
        if (enemy.boneswordTimer <= 0 && dist < 520) {
          enemy.boneswordTimer = 3.2;
          sounds.playPsykerBlast();
          this.screenShakeAmount = 10;
          const baseAngle = Math.atan2(dy, dx);
          for (const arc of [-0.3, 0, 0.3]) {
            this.projectiles.push({
              id: this.projIdCounter++,
              type: 'bonesword_wave',
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(baseAngle + arc) * 310,
              vy: Math.sin(baseAngle + arc) * 310,
              radius: 14,
              damage: 32,
              duration: 2.5,
              maxDuration: 2.5,
              pierce: 1,
              piercedEnemyIds: new Set(),
              color: '#c084fc'
            });
          }
        }
      }

      // Biovore launches floating Spore Mines
      if (enemy.type === 'biovore' && enemy.shootCooldown !== undefined) {
        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0 && dist < 540) {
          enemy.shootCooldown = 4.6;
          this.enemies.push({
            id: this.enemyIdCounter++,
            type: 'spore_mine',
            x: enemy.x + (enemy.facingLeft ? -16 : 16),
            y: enemy.y - 12,
            vx: 0,
            vy: 0,
            radius: 12,
            hp: 25,
            maxHp: 25,
            speed: 105,
            damage: 32,
            xpValue: 3,
            facingLeft: false,
            animFrame: 0,
            color: '#84cc16',
            hitFlashTimer: 0
          });
        }
      }

      if (dist > 5 && !enemy.isDummy) {
        let spd = enemy.speed;
        if (enemy.isPouncing) {
          spd *= 2.6;
        }
        if (this.activeMutator?.id === 'adrenal_surge') {
          spd *= 1.25;
        }
        if ((enemy.stunTimer || 0) > 0) {
          spd *= (enemy.type === 'carnifex_boss' || enemy.type === 'hive_tyrant') ? 0.5 : 0.15;
        } else if ((enemy.burningTimer || 0) > 0 && this.weapons.heavy_flamer?.isEvolved) {
          spd *= 0.65; // Promethium Inferno slows burning enemies by 35%
        }
        // Frost Pelt of Fenris Relic slows enemies within 165px by 30%
        if (this.activeRelics.includes('pelt_fenris') && dist < 165) {
          spd *= 0.70;
        }

        let moveX = (dx / dist);
        let moveY = (dy / dist);

        // Boids Flocking Swarm Steering Vectors for Hormagaunts & Termagants
        if ((enemy.type === 'hormagaunt' || enemy.type === 'termagant') && !enemy.isPouncing && dist > 55) {
          const neighbors = this.enemySpatialGrid.query(enemy.x, enemy.y, 42);
          let sepX = 0;
          let sepY = 0;
          let count = 0;
          for (let n = 0; n < neighbors.length; n++) {
            const other = neighbors[n];
            if (other.id !== enemy.id) {
              const ndx = enemy.x - other.x;
              const ndy = enemy.y - other.y;
              const nDistSq = ndx * ndx + ndy * ndy;
              if (nDistSq > 1 && nDistSq < 1600) {
                const nDist = Math.sqrt(nDistSq);
                sepX += (ndx / nDist) * (1.0 - nDist / 40);
                sepY += (ndy / nDist) * (1.0 - nDist / 40);
                count++;
              }
            }
          }
          if (count > 0) {
            moveX = moveX * 0.70 + (sepX / count) * 0.45;
            moveY = moveY * 0.70 + (sepY / count) * 0.45;
            const mLen = Math.hypot(moveX, moveY);
            if (mLen > 0) {
              moveX /= mLen;
              moveY /= mLen;
            }
          }
        }

        enemy.vx = moveX * spd;
        enemy.vy = moveY * spd;
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;

        // Resolve Enemy vs Battlefield Obstacles collision (except flying Zoanthropes, Spore Mines, or charging Bosses)
        if (enemy.type !== 'zoanthrope' && enemy.type !== 'spore_mine' && !enemy.isCharging) {
          for (const obs of this.obstacles) {
            if (!obs.blocksMovement) continue;
            const odx = enemy.x - obs.x;
            const ody = enemy.y - obs.y;
            const odist = Math.hypot(odx, ody);
            const minD = obs.radius + enemy.radius * 0.85;
            if (odist < minD && odist > 0.001) {
              enemy.x = obs.x + (odx / odist) * minD;
              enemy.y = obs.y + (ody / odist) * minD;
            }
          }
        }
      }

      // Collision with Space Marine
      if (!enemy.isDummy && dist < enemy.radius + 14) {
        if (enemy.type === 'spore_mine') {
          this.hitPlayer(enemy.damage);
          enemy.hp = 0;
          this.killEnemy(enemy);
        } else {
          this.hitPlayer(enemy.damage * dt * 2.2);
        }
      }
    }
  }

  private hitPlayer(amount: number) {
    if (this.playerInvulnTimer > 0 || this.isDashing) return;

    sounds.playPlayerHit();
    this.screenShakeAmount = 6;
    this.playerHurtTimer = 0.15;
    this.playerInvulnTimer = 0.28;

    if (this.playerStats.shield > 0) {
      this.playerStats.shieldDelayTimer = 3.2;
      if (this.playerStats.shield >= amount) {
        this.playerStats.shield -= amount;
        return;
      } else {
        amount -= this.playerStats.shield;
        this.playerStats.shield = 0;
      }
    }

    this.playerStats.hp -= amount;

    if (this.playerStats.hp <= 0) {
      this.playerStats.hp = 0;
      this.triggerGameOver();
    }
  }

  private triggerGameOver(victory: boolean = false) {
    this.state = victory ? 'VICTORY' : 'GAME_OVER';
    if (victory) {
      sounds.playEvolution();
      this.puritySealsEarned += 75;
    } else {
      sounds.playPlayerHit();
    }
    const evolvedWeapons = Object.values(this.weapons)
      .filter(w => w.isEvolved)
      .map(w => WEAPON_EVOLUTIONS[w.id]?.name || w.name);

    this.callbacks.onGameOver({
      time: Math.floor(this.elapsedGameTime),
      kills: this.killCount,
      level: this.playerLevel,
      bossesKilled: this.bossesKilled,
      puritySealsEarned: this.puritySealsEarned,
      weaponStats: JSON.parse(JSON.stringify(this.weaponStats)),
      victory,
      evolvedWeapons
    });
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.duration -= dt;

      // Homing steering for Cyclone Missiles
      if (proj.homing) {
        const candidates = this.enemies.filter(e => e.burrowState !== 'burrowed' && !proj.piercedEnemyIds.has(e.id));
        if (candidates.length > 0) {
          let bestTarget = candidates[0];
          let bestDist = Math.hypot(bestTarget.x - proj.x, bestTarget.y - proj.y);
          for (const c of candidates) {
            const d = Math.hypot(c.x - proj.x, c.y - proj.y);
            const priorityOffset = (c.type === 'hive_tyrant' || c.type === 'carnifex_boss' || c.type === 'trygon_prime') ? -120 : (c.isElite || c.type === 'toxicrene' || c.type === 'broodlord' ? -60 : 0);
            if (d + priorityOffset < bestDist) {
              bestDist = d + priorityOffset;
              bestTarget = c;
            }
          }
          if (Math.hypot(bestTarget.x - proj.x, bestTarget.y - proj.y) < 560) {
            const spd = Math.hypot(proj.vx, proj.vy) || 420;
            const curAng = Math.atan2(proj.vy, proj.vx);
            const desAng = Math.atan2(bestTarget.y - proj.y, bestTarget.x - proj.x);
            let diff = desAng - curAng;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const maxTurn = 6.2 * dt;
            const nextAng = curAng + Math.max(-maxTurn, Math.min(maxTurn, diff));
            proj.vx = Math.cos(nextAng) * spd;
            proj.vy = Math.sin(nextAng) * spd;
            proj.rotAngle = nextAng;
          }
        }
      }

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      if (proj.type === 'enemy_acid' || proj.type === 'enemy_warp') {
        // Enemy acid blocked by solid cover obstacles!
        if (proj.type === 'enemy_acid') {
          let blockedByCover = false;
          for (const obs of this.obstacles) {
            if (!obs.blocksProjectiles) continue;
            if (Math.hypot(proj.x - obs.x, proj.y - obs.y) < obs.radius + proj.radius) {
              this.projectiles.splice(i, 1);
              blockedByCover = true;
              break;
            }
          }
          if (blockedByCover) continue;
        }
        const dist = Math.hypot(proj.x - this.playerX, proj.y - this.playerY);
        if (dist < proj.radius + 14) {
          this.hitPlayer(proj.damage);
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Check destructible obstacles (Spore Tower & Plasma Core) + Ballistic cover
        let hitObstacle = false;
        for (let oi = this.obstacles.length - 1; oi >= 0; oi--) {
          const obs = this.obstacles[oi];
          if (!obs.blocksProjectiles && obs.hp === undefined) continue;
          if (Math.hypot(proj.x - obs.x, proj.y - obs.y) < obs.radius * 0.9) {
            if (obs.hp !== undefined) {
              obs.hp -= proj.damage;
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 110,
                vy: (Math.random() - 0.5) * 110,
                life: 0.16,
                maxLife: 0.16,
                color: obs.variant === 'plasma_core' ? '#38bdf8' : '#84cc16',
                size: 4
              });
              if (obs.hp <= 0) {
                this.obstacles.splice(oi, 1);
                sounds.playExplosion();
                this.screenShakeAmount = 12;
                if (obs.variant === 'spore_tower') {
                  // Spore Tower Bio-Explosion damages all nearby Tyranids + drops 4 XP orbs!
                  this.detonateAoE(obs.x, obs.y, 165, 240 * this.playerStats.damageMult, 'plasma_cannon');
                  this.floatingTexts.push({
                    id: this.textIdCounter++,
                    x: obs.x,
                    y: obs.y - 20,
                    text: '☣️ SPORE TOWER RUPTURED!',
                    color: '#84cc16',
                    life: 0.9,
                    maxLife: 0.9,
                    isCrit: true
                  });
                  for (let k = 0; k < 4; k++) {
                    this.biomassOrbs.push({
                      id: this.orbIdCounter++,
                      x: obs.x + (Math.random() - 0.5) * 40,
                      y: obs.y + (Math.random() - 0.5) * 40,
                      value: 15,
                      tier: 2,
                      magnetized: true
                    });
                  }
                } else if (obs.variant === 'plasma_core') {
                  // Plasma Core EMP Shockwave stuns all nearby Tyranids for 3.5s!
                  this.shockwaves.push({
                    id: this.effectIdCounter++,
                    x: obs.x,
                    y: obs.y,
                    currentRadius: 15,
                    maxRadius: 230,
                    damage: 190 * this.playerStats.damageMult,
                    hitEnemyIds: new Set(),
                    color: '#38bdf8'
                  });
                  for (const e of this.enemies) {
                    if (Math.hypot(e.x - obs.x, e.y - obs.y) < 230) {
                      e.stunTimer = Math.max(e.stunTimer || 0, 3.5);
                    }
                  }
                  this.floatingTexts.push({
                    id: this.textIdCounter++,
                    x: obs.x,
                    y: obs.y - 20,
                    text: '⚡ PLASMA CORE EMP BLAST!',
                    color: '#38bdf8',
                    life: 0.9,
                    maxLife: 0.9,
                    isCrit: true
                  });
                }
              }
              this.projectiles.splice(i, 1);
              hitObstacle = true;
              break;
            } else if (
              proj.type === 'bolter' ||
              proj.type === 'heavy_bolter' ||
              proj.type === 'assault_cannon' ||
              proj.type === 'turret_bullet'
            ) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 90,
                vy: (Math.random() - 0.5) * 90,
                life: 0.14,
                maxLife: 0.14,
                color: '#fde047',
                size: 3
              });
              this.projectiles.splice(i, 1);
              hitObstacle = true;
              break;
            }
          }
        }
        if (hitObstacle) continue;
        // Check collision with Promethium Barrels
        let hitBarrel = false;
        for (const obj of this.interactiveObjects) {
          if (obj.type === 'barrel') {
            const dist = Math.hypot(proj.x - obj.x, proj.y - obj.y);
            if (dist < proj.radius + obj.radius) {
              obj.hp -= proj.damage;
              if (obj.hp <= 0) {
                this.detonateBarrel(obj);
              }
              proj.pierce--;
              if (proj.pierce <= 0) {
                this.projectiles.splice(i, 1);
                hitBarrel = true;
                break;
              }
            }
          }
        }
        if (hitBarrel) continue;

        // Check collision with Tyranids using 2D Spatial Hash Grid
        const nearbyEnemies = this.enemySpatialGrid.query(proj.x, proj.y, proj.radius + 40);
        for (let ei = 0; ei < nearbyEnemies.length; ei++) {
          const enemy = nearbyEnemies[ei];
          if (enemy.burrowState === 'burrowed') continue;
          if (proj.piercedEnemyIds.has(enemy.id)) continue;
          const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
          if (dist < proj.radius + enemy.radius) {
            proj.piercedEnemyIds.add(enemy.id);
            proj.pierce--;

            // Realistic Ballistic Hit Effects
            sounds.playBulletImpact();

            // 1. Directional Knockback Impulse
            const projSpeed = Math.hypot(proj.vx, proj.vy) || 1;
            const dirX = proj.vx / projSpeed;
            const dirY = proj.vy / projSpeed;
            const knockbackDist = proj.knockback ?? (proj.type === 'heavy_bolter' ? 24 : (proj.type === 'dreadnought_assault_cannon' ? 18 : 12));
            enemy.x += dirX * knockbackDist;
            enemy.y += dirY * knockbackDist;

            // 2. Directional Blood Splatter Cone (fountain along bullet trajectory)
            const impactAngle = Math.atan2(proj.vy, proj.vx);
            const isCritHit = Math.random() < this.playerStats.critChance;
            const sprayCount = isCritHit ? 8 : 4;
            for (let s = 0; s < sprayCount; s++) {
              const sprayAngle = impactAngle + (Math.random() - 0.5) * 0.9;
              const spraySpeed = 80 + Math.random() * 160;
              this.particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(sprayAngle) * spraySpeed,
                vy: Math.sin(sprayAngle) * spraySpeed,
                life: 0.22,
                maxLife: 0.22,
                color: Math.random() < 0.65 ? '#a855f7' : (Math.random() < 0.5 ? '#7e22ce' : '#84cc16'),
                size: 3 + Math.random() * 3
              });
            }

            // 3. Chitin Spark Fragments (ricochet reflections)
            const sparkCount = isCritHit ? 5 : 3;
            for (let sp = 0; sp < sparkCount; sp++) {
              const sparkAngle = impactAngle + Math.PI + (Math.random() - 0.5) * 1.6;
              const sparkSpeed = 90 + Math.random() * 140;
              this.particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(sparkAngle) * sparkSpeed,
                vy: Math.sin(sparkAngle) * sparkSpeed,
                life: 0.16,
                maxLife: 0.16,
                color: Math.random() < 0.5 ? '#fef08a' : '#f59e0b',
                size: 2 + Math.random() * 2
              });
            }

            // 4. Bolter Micro-Explosion puff
            if (proj.type === 'bolter' || proj.type === 'heavy_bolter' || proj.type === 'dreadnought_assault_cannon') {
              for (let m = 0; m < 3; m++) {
                this.particles.push({
                  x: enemy.x + (Math.random() - 0.5) * 8,
                  y: enemy.y + (Math.random() - 0.5) * 8,
                  vx: (Math.random() - 0.5) * 40,
                  vy: (Math.random() - 0.5) * 40,
                  life: 0.2,
                  maxLife: 0.2,
                  color: '#475569',
                  size: 4 + Math.random() * 3
                });
              }
            }

            // 5. Directional Ground Blood Decal
            this.bloodSplats.push({
              x: enemy.x + dirX * (8 + Math.random() * 12),
              y: enemy.y + dirY * (8 + Math.random() * 12),
              size: (enemy.type === 'hive_tyrant' || enemy.type === 'carnifex_boss') ? 18 : 6 + Math.random() * 7,
              color: Math.random() < 0.6 ? '#6b21a8' : '#84cc16',
              life: 6.0,
              maxLife: 6.0
            });

            const isWeaponId = (t: Projectile['type']): t is WeaponId =>
              t in this.weapons;
            if (isWeaponId(proj.type)) {
              this.lastDamageWeapon = proj.type;
            } else {
              this.lastDamageWeapon = null;
            }

            if (proj.type === 'bolter' && this.weapons.bolter.isEvolved && !proj.aoeRadius) {
              this.detonateAoE(proj.x, proj.y, 52, proj.damage * 0.55, 'bolter');
            }
            if (proj.type === 'power_sword') {
              enemy.shreddedTimer = 3.5;
              if (this.weapons.power_sword.isEvolved) {
                enemy.burningTimer = Math.max(enemy.burningTimer || 0, 3.5);
              }
            }
            if (proj.type === 'heavy_flamer' && this.weapons.heavy_flamer.isEvolved) enemy.burningTimer = 4;
            if (proj.type === 'heavy_flamer') enemy.burningTimer = Math.max(enemy.burningTimer || 0, 2.5);

            // Synergy 1: Shredded Carapace (+25% damage from ballistic projectiles)
            const shredMult = (enemy.shreddedTimer || 0) > 0 && (proj.type === 'bolter' || proj.type === 'heavy_bolter' || proj.type === 'assault_cannon' || proj.type === 'turret_bullet' || proj.type === 'dreadnought_assault_cannon')
              ? 1.25
              : 1.0;

            // Synergy 2: Incendiary Rounds on burning targets
            if ((proj.type === 'bolter' || proj.type === 'heavy_bolter' || proj.type === 'assault_cannon') && enemy.burningTimer && enemy.burningTimer > 0) {
              this.damageEnemy(enemy, proj.damage * 0.4, false, '#fb923c');
            }

            // Synergy 3: Thermal Detonation when Plasma hits a burning enemy
            if (proj.type === 'plasma_cannon' && (enemy.burningTimer || 0) > 0) {
              this.detonateAoE(enemy.x, enemy.y, 90, proj.damage * 0.65, 'plasma_cannon');
              this.floatingTexts.push({
                id: this.textIdCounter++,
                x: enemy.x,
                y: enemy.y - 24,
                text: '🔥 THERMAL DETONATION!',
                color: '#34d399',
                life: 0.65,
                maxLife: 0.65,
                isCrit: true
              });
            }

            if (proj.aoeRadius) {
              this.detonateAoE(proj.x, proj.y, proj.aoeRadius, proj.damage * shredMult, proj.type, proj.isClusterChild);
              proj.pierce = 0;
            } else {
              this.damageEnemy(enemy, proj.damage * shredMult, isCritHit, shredMult > 1 ? '#fca5a5' : undefined);
            }

            if (proj.pierce <= 0) {
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      }

      if (proj.duration <= 0) {
        if (proj.aoeRadius && (proj.type === 'frag_grenade' || proj.type === 'cyclone_missile')) {
          this.lastDamageWeapon = proj.type;
          this.detonateAoE(proj.x, proj.y, proj.aoeRadius, proj.damage, proj.type, proj.isClusterChild);
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  private detonateAoE(x: number, y: number, radius: number, damage: number, type: Projectile['type'], isClusterChild?: boolean) {
    const explosionColor = type === 'plasma_cannon' ? '#38bdf8' : (type === 'vortex_grenade' ? '#a855f7' : '#f97316');
    this.spawnPixelExplosion(x, y, radius, explosionColor, isClusterChild ? 0 : 2);
    this.screenShakeAmount = type === 'plasma_cannon' ? 7 : 9;

    const isWeaponId = (t: Projectile['type']): t is WeaponId => t in this.weapons;
    if (isWeaponId(type)) {
      this.lastDamageWeapon = type;
    }

    // Evolved Sunfury Plasma Decimator (or Lv 4+ Plasma): Spawn persistent radiation pool
    if (type === 'plasma_cannon' && this.weapons.plasma_cannon.level >= 4) {
      const isEvoPlasma = !!this.weapons.plasma_cannon.isEvolved;
      this.groundHazards.push({
        id: this.effectIdCounter++,
        x,
        y,
        radius: radius * (isEvoPlasma ? 0.85 : 0.6),
        duration: isEvoPlasma ? 4.0 : 1.6,
        maxDuration: isEvoPlasma ? 4.0 : 1.6,
        damagePerTick: damage * (isEvoPlasma ? 0.25 : 0.15),
        type: 'plasma_pool',
        tickTimer: 0,
        weaponId: 'plasma_cannon'
      });
    }

    // Evolved Krak Cluster Carpet: Primary grenade splits into 4 cluster sub-munitions!
    if (type === 'frag_grenade' && this.weapons.frag_grenade.isEvolved && !isClusterChild) {
      for (let c = 0; c < 4; c++) {
        const ang = (c * Math.PI) / 2 + (Math.random() - 0.5) * 0.4;
        const spd = 150 + Math.random() * 50;
        this.projectiles.push({
          id: this.projIdCounter++,
          type: 'frag_grenade',
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: 4.5,
          damage: damage * 0.55,
          duration: 0.35,
          maxDuration: 0.35,
          pierce: 999,
          piercedEnemyIds: new Set(),
          color: '#fbbf24',
          aoeRadius: radius * 0.65,
          isClusterChild: true
        });
      }
    }

    const particleColor = type === 'plasma_cannon' ? '#10b981' : '#f97316';
    for (let p = 0; p < 22; p++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.35,
        maxLife: 0.35,
        color: particleColor,
        size: 5 + Math.random() * 4
      });
    }

    for (const enemy of [...this.enemies]) {
      const dist = Math.hypot(enemy.x - x, enemy.y - y);
      if (dist < radius + enemy.radius) {
        const falloff = 1 - (dist / (radius + enemy.radius)) * 0.35;
        const combo = type === 'plasma_cannon' && (enemy.vortexMarkedTimer || 0) > 0 ? 1.5 : 1;
        if (isWeaponId(type)) this.lastDamageWeapon = type;
        this.damageEnemy(enemy, damage * falloff * combo, Math.random() < this.playerStats.critChance, combo > 1 ? '#a78bfa' : undefined);
      }
    }
  }

  private damageEnemy(enemy: Enemy, amount: number, isCrit: boolean = false, customColor?: string) {
    if (!this.enemies.includes(enemy)) return;

    // Mutator: Hardened Chitin (-30% kinetic damage absorption)
    if (this.activeMutator?.id === 'hardened_chitin') {
      amount *= 0.70;
    }

    // Zoanthrope Psychic Warp Shield Deflection
    if (enemy.type === 'zoanthrope' && (enemy.warpShieldHp ?? 0) > 0) {
      const isKinetic = !customColor || customColor === '#ffffff' || customColor === '#facc15' || customColor === '#94a3b8';
      if (isKinetic) {
        enemy.warpShieldHp = Math.max(0, enemy.warpShieldHp! - amount);
        amount = Math.max(1, Math.round(amount * 0.30)); // 70% absorbed
        this.floatingTexts.push({
          id: this.textIdCounter++,
          x: enemy.x,
          y: enemy.y - enemy.radius - 12,
          text: '🛡️ WARP DEFLECT!',
          color: '#38bdf8',
          life: 0.45,
          maxLife: 0.45
        });
      } else {
        // Energy or flame shatters warp shield!
        enemy.warpShieldHp = 0;
        this.floatingTexts.push({
          id: this.textIdCounter++,
          x: enemy.x,
          y: enemy.y - enemy.radius - 12,
          text: '💥 WARP SHATTERED!',
          color: '#e879f9',
          life: 0.65,
          maxLife: 0.65,
          isCrit: true
        });
      }
    }

    const finalDmg = Math.max(1, Math.round(isCrit ? amount * 1.8 : amount));
    enemy.hp -= finalDmg;
    enemy.hitFlashTimer = 0.08;

    // Record weapon damage stat
    if (this.lastDamageWeapon && this.weaponStats[this.lastDamageWeapon]) {
      this.weaponStats[this.lastDamageWeapon].damage += finalDmg;
    }

    // Wargear Relic: Anvil Sigil of Vulkan (35% chance to ignite enemies)
    if (this.activeRelics.includes('vulkan_sigil') && Math.random() < 0.35) {
      enemy.burningTimer = Math.max(enemy.burningTimer || 0, 2.5);
    }

    // Space Wolves Fenrisian Hunter: Critical hits briefly frost-stun enemies
    if (isCrit && this.chapter === 'space_wolves') {
      enemy.stunTimer = Math.max(enemy.stunTimer || 0, 0.55);
    }

    // Firing Range Dummies auto-restore HP instead of dying
    if (enemy.isDummy && enemy.hp <= 100) {
      enemy.hp = enemy.maxHp;
      this.floatingTexts.push({
        id: this.textIdCounter++,
        x: enemy.x,
        y: enemy.y - enemy.radius - 16,
        text: '♻️ DUMMY RESET!',
        color: '#34d399',
        life: 0.7,
        maxLife: 0.7,
        isCrit: true
      });
      return;
    }

    // Hit-stop on massive critical hit
    if (isCrit && finalDmg > 100) {
      this.hitStopTimer = 0.025;
    }

    // Squash & stretch on impact
    enemy.squashX = 1.34;
    enemy.squashY = 0.72;

    // Stamp persistent blood decal on ground occasionally
    if (Math.random() < 0.45) {
      this.stampDecal(enemy.x, enemy.y, Math.round(enemy.radius * 0.9), 'blood', Math.random() < 0.7 ? '#6b21a8' : '#e11d48');
    }

    if (Math.random() < 0.35) {
      this.bloodSplats.push({
        x: enemy.x + (Math.random() - 0.5) * 14,
        y: enemy.y + (Math.random() - 0.5) * 14,
        size: 5 + Math.random() * 5,
        color: Math.random() < 0.7 ? '#6b21a8' : '#e11d48',
        life: 5.0,
        maxLife: 5.0
      });
    }

    if (
      this.gameFeel.damageNumbers === 'all' ||
      (this.gameFeel.damageNumbers === 'crits' && isCrit)
    ) {
      this.floatingTexts.push({
        id: this.textIdCounter++,
        x: enemy.x + (Math.random() - 0.5) * 16,
        y: enemy.y - enemy.radius - 8,
        text: String(finalDmg),
        color: customColor || (isCrit ? '#facc15' : '#ffffff'),
        life: 0.45,
        maxLife: 0.45,
        isCrit
      });
    }

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: Enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx === -1) return;
    this.enemies.splice(idx, 1);

    sounds.playTyranidSquish();
    this.killCount++;
    incrementBestiaryKill(enemy.type);
    this.stampDecal(enemy.x, enemy.y, Math.round(enemy.radius * 1.4), 'blood', enemy.color || '#6b21a8');

    if (enemy.type === 'hive_tyrant' || enemy.type === 'carnifex_boss' || enemy.type === 'trygon_prime') {
      sounds.playBattleCry('boss_kill');
    }

    // Charge Tactical Overdrive (Fury of the Astartes)
    if (this.overdriveTimer <= 0) {
      const furyGain =
        enemy.type === 'hive_tyrant' || enemy.type === 'carnifex_boss' || enemy.type === 'trygon_prime'
          ? 25
          : enemy.type === 'broodlord' || enemy.type === 'toxicrene' || enemy.isElite
          ? 8
          : 2.2;
      this.furyMeter = Math.min(100, this.furyMeter + furyGain);
    }

    if (this.activeTrial && this.activeTrial.type === 'kills') {
      this.activeTrial.progress += 1;
      if (this.activeTrial.progress >= this.activeTrial.target) {
        this.completeCombatTrial();
      }
    }

    if (this.lastDamageWeapon && this.weaponStats[this.lastDamageWeapon]) {
      this.weaponStats[this.lastDamageWeapon].kills += 1;
    }

    // Blood Angels Red Thirst: Heal +8 HP every 20 kills
    if (this.chapter === 'blood_angels' && this.killCount % 20 === 0 && this.playerStats.hp < this.playerStats.maxHp) {
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 8);
      this.floatingTexts.push({
        id: this.textIdCounter++,
        x: this.playerX,
        y: this.playerY - 28,
        text: '🩸 RED THIRST +8 HP',
        color: '#f43f5e',
        life: 0.85,
        maxLife: 0.85,
        isCrit: true
      });
    }

    // Purge Streak increment & Emperor's Zeal activation
    const wasZealActive = this.isZealActive;
    this.streakCount++;
    this.streakTimer = this.maxStreakTimer;
    if (this.streakCount >= 20) {
      this.isZealActive = true;
      if (!wasZealActive) {
        const cries = [
          'SUFFER NOT THE ALIEN TO LIVE!',
          'FOR THE EMPEROR! NO MERCY!',
          'PURGE THE XENOS SWARM!'
        ];
        this.addBattleSpeechBubble(this.playerX, this.playerY, cries[Math.floor(Math.random() * cries.length)], '#fbbf24');
        for (let p = 0; p < 18; p++) {
          const ang = (p * Math.PI * 2) / 18;
          this.particles.push({
            x: this.playerX,
            y: this.playerY,
            vx: Math.cos(ang) * 140,
            vy: Math.sin(ang) * 140,
            life: 0.35,
            maxLife: 0.35,
            color: '#fbbf24',
            size: 4
          });
        }
      }
    }

    // Wargear Relic: Red Grail of Sanguinius (Every 15 kills triggers crimson AoE & heals +6 HP)
    if (this.activeRelics.includes('chalice_sanguinius') && this.killCount % 15 === 0) {
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 6);
      this.shockwaves.push({
        id: this.effectIdCounter++,
        x: this.playerX,
        y: this.playerY,
        currentRadius: 15,
        maxRadius: 170,
        damage: 140 * this.playerStats.damageMult,
        hitEnemyIds: new Set(),
        color: '#f43f5e'
      });
    }

    // Award Purity Seals based on enemy rank (Space Wolves get +50% bonus on elites/bosses)
    let seals = 1;
    if (enemy.type === 'hive_tyrant') seals = 50;
    else if (enemy.type === 'trygon_prime') seals = 35;
    else if (enemy.type === 'carnifex_boss' || enemy.type === 'broodlord') seals = 25;
    else if (enemy.type === 'toxicrene') seals = 8;
    else if (enemy.type === 'lictor' || enemy.type === 'biovore') seals = 6;
    else if (enemy.type === 'zoanthrope' || enemy.type === 'tyranid_warrior') seals = 4;
    if (this.chapter === 'space_wolves' && (seals > 1 || enemy.isElite)) {
      seals = Math.ceil(seals * 1.5);
    }
    let oathSealMult = 1.0;
    if (this.activeOaths.includes('oath_fury')) oathSealMult += 0.40;
    if (this.activeOaths.includes('oath_vanguard')) oathSealMult += 0.50;
    if (this.activeOaths.includes('oath_penance')) oathSealMult += 0.60;
    this.puritySealsEarned += Math.ceil(seals * oathSealMult);

    // Grant Wargear Relic when killing a Boss!
    if (
      enemy.type === 'hive_tyrant' ||
      enemy.type === 'carnifex_boss' ||
      enemy.type === 'trygon_prime' ||
      enemy.type === 'broodlord'
    ) {
      const allRelics: WargearRelicId[] = ['relic_macragge', 'chalice_sanguinius', 'pelt_fenris', 'vulkan_sigil'];
      const unowned = allRelics.filter(r => !this.activeRelics.includes(r));
      if (unowned.length > 0) {
        const picked = unowned[Math.floor(Math.random() * unowned.length)];
        this.activeRelics.push(picked);
        this.recalculatePassives();
        const relicInfo = WARGEAR_RELICS[picked];
        this.addBattleSpeechBubble(this.playerX, this.playerY, `${relicInfo.icon} RELIC UNLOCKED: ${relicInfo.name.toUpperCase()}!`, '#fbbf24');
      }
    }

    // Boss or Elite specific mechanics
    if (enemy.type === 'hive_tyrant') {
      this.bossesKilled++;
      this.screenShakeAmount = 26;
      this.hitStopTimer = 0.08;
      this.slowMoTimer = 0.60; // Slow-Mo Boss Execution!
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 80);
      sounds.playHiveTyrantRoar();
      this.triggerHaptic([60, 40, 90]);

      // Guaranteed Imperial Relic Drop Pod!
      this.relicChests.push({
        id: this.effectIdCounter++,
        x: enemy.x,
        y: enemy.y,
        beaconTimer: 0, source: 'boss'
      });
    } else if (enemy.type === 'carnifex_boss' || enemy.type === 'trygon_prime') {
      this.bossesKilled++;
      this.screenShakeAmount = 20;
      this.hitStopTimer = 0.05; // 50ms dramatic freeze!
      this.slowMoTimer = 0.50; // Slow-Mo Boss Execution!
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 45);
      this.triggerHaptic([55, 35, 80]);

      // Always drop an Imperial Relic Drop Pod!
      this.relicChests.push({
        id: this.effectIdCounter++,
        x: enemy.x,
        y: enemy.y,
        beaconTimer: 0, source: 'boss'
      });
    } else if (
      this.relicChests.length < 2 &&
      this.relicPodCooldown <= 0 &&
      ((enemy.isElite && Math.random() < 0.25) || (enemy.type === 'tyranid_warrior' && Math.random() < 0.08))
    ) {
      // Controlled Relic Pod drop rate: Max 2 active on map + 38s cooldown between non-boss drops!
      this.relicPodCooldown = 38.0;
      this.relicChests.push({
        id: this.effectIdCounter++,
        x: enemy.x,
        y: enemy.y,
        beaconTimer: 0, source: 'elite'
      });
    }

    // Blood splat decal on ground
    this.bloodSplats.push({
      x: enemy.x,
      y: enemy.y,
      size: (enemy.type === 'hive_tyrant' || enemy.type === 'carnifex_boss') ? 22 : 10 + Math.random() * 8,
      color: Math.random() < 0.6 ? '#581c87' : '#9f1239',
      life: 6.0,
      maxLife: 6.0
    });

    // Tumbling Chitin Fragments
    const fragCount = (enemy.type === 'hive_tyrant' || enemy.type === 'carnifex_boss') ? 12 : 5;
    for (let c = 0; c < fragCount; c++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.chitinFragments.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 60,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 12,
        size: 3 + Math.random() * 4,
        color: Math.random() < 0.5 ? '#6b21a8' : '#e11d48',
        life: 1.2,
        maxLife: 1.2
      });
    }

    // Biomass Spore Drop
    let tier: 1 | 2 | 3 = 1;
    if (enemy.type === 'hive_tyrant' || enemy.type === 'carnifex_boss' || enemy.type === 'trygon_prime') tier = 3;
    else if (enemy.type === 'tyranid_warrior' || enemy.type === 'genestealer' || enemy.type === 'zoanthrope' || enemy.type === 'lictor' || enemy.type === 'toxicrene') tier = 2;

    const wolvesEliteBonus = (this.chapter === 'space_wolves' && (tier >= 2 || enemy.isElite)) ? 1.5 : 1.0;
    const sporeFogBonus = this.activeHiveEvent?.type === 'spore_fog' ? 2.0 : 1.0;

    this.biomassOrbs.push({
      id: this.orbIdCounter++,
      x: enemy.x,
      y: enemy.y,
      value: Math.round(enemy.xpValue * wolvesEliteBonus * sporeFogBonus * (this.isZealActive ? 2 : 1)),
      tier,
      magnetized: false
    });
  }

  private updateBiomass(dt: number) {
    const magnetRadius = this.playerStats.magnetRange;

    for (let i = this.biomassOrbs.length - 1; i >= 0; i--) {
      const orb = this.biomassOrbs[i];
      const dx = this.playerX - orb.x;
      const dy = this.playerY - orb.y;
      const dist = Math.hypot(dx, dy);

      // Magnetized by player or by Servo-Skull
      const distServo = Math.hypot(this.servoSkull.x - orb.x, this.servoSkull.y - orb.y);
      if (dist < magnetRadius || distServo < 210) {
        orb.magnetized = true;
      }

      if (orb.magnetized) {
        const speed = Math.max(450, 1050 - dist * 1.5);
        orb.x += (dx / Math.max(1, dist)) * speed * dt;
        orb.y += (dy / Math.max(1, dist)) * speed * dt;

        if (dist < 26) {
          sounds.playBiomass();
          this.playerXp += orb.value;
          if (this.overdriveTimer <= 0) {
            this.furyMeter = Math.min(100, this.furyMeter + 0.8);
          }
          this.biomassOrbs.splice(i, 1);

          if (this.playerXp >= this.xpToNextLevel && this.state === 'PLAYING') {
            this.triggerLevelUp();
            break;
          }
        }
      }
    }
  }

  private triggerLevelUp() {
    this.playerLevel++;
    this.playerXp = Math.max(0, this.playerXp - this.xpToNextLevel);
    this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.18 + 3);
    sounds.playLevelUp();

    this.state = 'LEVEL_UP';
    const maxW = this.activeOaths.includes('oath_penance') ? 4 : 6;
    const choices = generateUpgradeChoices(this.weapons, this.passives, this.lockedUpgrade, this.banishedIds, 3, maxW);
    this.callbacks.onLevelUp(choices, this.playerLevel);
  }

  private updateParticles(dt: number) {
    // Blood splats
    for (let i = this.bloodSplats.length - 1; i >= 0; i--) {
      const b = this.bloodSplats[i];
      b.life -= dt;
      if (b.life <= 0) this.bloodSplats.splice(i, 1);
    }

    // Chitin fragments with gravity
    for (let i = this.chitinFragments.length - 1; i >= 0; i--) {
      const cf = this.chitinFragments[i];
      cf.life -= dt;
      cf.x += cf.vx * dt;
      cf.y += cf.vy * dt;
      cf.vy += 260 * dt; // gravity
      cf.rot += cf.rotSpeed * dt;
      if (cf.life <= 0) this.chitinFragments.splice(i, 1);
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      t.y -= 42 * dt;
      if (t.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  // --- Rendering Pipeline ---
  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // Trauma-Based Screen Shake (T^2 Power Curve from Game-Feel Discipline)
    const shakeMult = this.gameFeel.screenShake === 'off' ? 0 : (this.gameFeel.screenShake === 'low' ? 0.38 : 1.0);
    const traumaShake = this.shakeTrauma * this.shakeTrauma;
    const totalShake = (traumaShake * 24 + this.screenShakeAmount * 0.45) * shakeMult;
    if (totalShake > 0.05) {
      const sx = (Math.random() - 0.5) * totalShake * 1.6;
      const sy = (Math.random() - 0.5) * totalShake * 1.6;
      const rot = (Math.random() - 0.5) * 0.02 * traumaShake * shakeMult;
      ctx.translate(w / 2, h / 2);
      ctx.rotate(rot);
      ctx.translate(-w / 2 + sx, -h / 2 + sy);
    }

    // Camera Center
    const camX = Math.floor(w / 2 - this.playerX);
    const camY = Math.floor(h / 2 - this.playerY);
    ctx.translate(camX, camY);

    // 1. Dynamic Map Floor according to selected theme
    PixelRenderer.drawMapFloor(ctx, this.playerX, this.playerY, w, h, this.mapTheme);

    // 1.2 Persistent Battlefield Decal Layer (permanent xenos blood & blast scorch marks)
    if (this.decalCanvas) {
      ctx.drawImage(this.decalCanvas, -2000, -2000);
    }

    // 1.5 Battlefield Structures & Tactical Cover Obstacles
    for (const obs of this.obstacles) {
      if (Math.abs(obs.x - this.playerX) < w * 0.75 && Math.abs(obs.y - this.playerY) < h * 0.75) {
        PixelRenderer.drawMapObstacle(ctx, obs, this.elapsedGameTime);
      }
    }

    if (this.extractionZone) {
      const ez = this.extractionZone;
      const pulse = Math.sin(this.elapsedGameTime * 8) * 6;
      ctx.save();
      ctx.fillStyle = ez.inside ? 'rgba(16, 185, 129, 0.16)' : 'rgba(251, 191, 36, 0.12)';
      ctx.strokeStyle = ez.inside ? '#10b981' : '#fbbf24';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(ez.x, ez.y, ez.radius + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = ez.inside ? '#6ee7b7' : '#fef08a';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        ez.inside ? '🚁 THUNDERHAWK EXTRACTION [ZONA AKTIF]' : '🚁 MASUK ZON EKSTRAKSI THUNDERHAWK!',
        ez.x,
        ez.y - ez.radius - 14
      );
      ctx.restore();
    }

    if (this.riskZone) {
      const zone = this.riskZone;
      ctx.save(); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#fef08a'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`BEKALAN ${Math.ceil(zone.needed - zone.progress)}s`, zone.x, zone.y - zone.radius - 12); ctx.restore();
    }

    // 2. Persistent Blood Decals on ground
    for (const splat of this.bloodSplats) {
      PixelRenderer.drawBloodDecal(ctx, splat.x, splat.y, splat.size, splat.color, splat.life / splat.maxLife);
    }

    // 3. Vortices & Ground Hazards
    for (const hz of this.groundHazards) {
      this.drawGroundHazard(ctx, hz);
    }
    for (const v of this.vortices) {
      this.drawVortex(ctx, v);
    }

    // 4. Shockwaves
    for (const sw of this.shockwaves) {
      this.drawShockwave(ctx, sw);
    }

    // 5. Imperial Relic Drop Pods / Chests
    for (const chest of this.relicChests) {
      PixelRenderer.drawRelicChest(ctx, chest.x, chest.y, chest.beaconTimer);
    }

    // 5.2 Orbital Strikes
    for (const strike of this.orbitalStrikes) {
      PixelRenderer.drawOrbitalStrike(ctx, strike.x, strike.y, strike.timer, strike.maxTimer, strike.radius);
    }

    // 5.5 Interactive Battlefield Objects (Barrels, Turrets & Beacons)
    for (const obj of this.interactiveObjects) {
      if (obj.type === 'barrel') {
        PixelRenderer.drawPromethiumBarrel(ctx, obj.x, obj.y, obj.hp / obj.maxHp, !!obj.isTriggered);
      } else if (obj.type === 'turret') {
        const closest = this.getClosestEnemiesTo(obj.x, obj.y, 1)[0];
        const ang = closest ? Math.atan2(closest.y - obj.y, closest.x - obj.x) : 0;
        PixelRenderer.drawSentryTurret(ctx, obj.x, obj.y, !!(obj.activeTimer && obj.activeTimer > 0), ang, obj.shootTimer || 0);
      } else if (obj.type === 'xp_magnet') {
        ctx.save(); ctx.fillStyle = '#67e8f9'; ctx.font = 'bold 30px monospace'; ctx.textAlign = 'center';
        ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 18; ctx.fillText('✦', obj.x, obj.y); ctx.restore();
      } else if (obj.type === 'dreadnought_pod' || obj.type === 'orbital_beacon' || obj.type === 'squad_beacon') {
        PixelRenderer.drawTacticalBeacon(ctx, obj.x, obj.y, obj.type, this.elapsedGameTime);
      }
    }

    // 5.8 Squad Battle-Brothers AI
    for (const brother of this.squadBrothers) {
      if (brother.type === 'apothecary') {
        PixelRenderer.drawApothecary(ctx, brother.x, brother.y, brother.facingLeft, brother.animFrame, this.elapsedGameTime);
      } else if (brother.type === 'devastator') {
        PixelRenderer.drawDevastator(ctx, brother.x, brother.y, brother.facingLeft, brother.animFrame, (brother.shootCooldown || 0) > 2.2);
      } else if (brother.type === 'librarian') {
        PixelRenderer.drawLibrarian(ctx, brother.x, brother.y, brother.facingLeft, brother.animFrame);
      } else if (brother.type === 'techmarine') {
        PixelRenderer.drawTechmarine(ctx, brother.x, brother.y, brother.facingLeft, brother.animFrame);
      }
    }

    // 6. Biomass Spores
    for (const orb of this.biomassOrbs) {
      PixelRenderer.drawBiomassSpore(ctx, orb.x, orb.y, orb.tier, this.elapsedGameTime);
    }

    // 7. Tumbling Chitin Fragments
    for (const cf of this.chitinFragments) {
      PixelRenderer.drawChitinFragment(ctx, cf.x, cf.y, cf.rot, cf.size, cf.color, cf.life / cf.maxLife);
    }

    // 8. Laser Beams & Lightning Arcs
    this.drawLaserBeams(ctx);

    // 9. Enemies
    for (const enemy of this.enemies) {
      const isHurt = enemy.hitFlashTimer > 0;
      const sx = enemy.squashX ?? 1.0;
      const sy = enemy.squashY ?? 1.0;
      const hasSquash = sx !== 1.0 || sy !== 1.0;
      if (hasSquash) {
        ctx.save();
        ctx.translate(Math.floor(enemy.x), Math.floor(enemy.y));
        ctx.scale(sx, sy);
        ctx.translate(-Math.floor(enemy.x), -Math.floor(enemy.y));
      }
      const fleet = this.getHiveFleet();
      switch (enemy.type) {
        case 'hormagaunt':
          PixelRenderer.drawHormagaunt(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt, !!enemy.isPouncing, fleet, this.elapsedGameTime);
          break;
        case 'termagant':
          PixelRenderer.drawTermagant(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt, fleet, this.elapsedGameTime);
          break;
        case 'genestealer':
          PixelRenderer.drawGenestealer(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt, fleet, this.elapsedGameTime);
          break;
        case 'tyranid_warrior':
          PixelRenderer.drawTyranidWarrior(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt, fleet, this.elapsedGameTime);
          break;
        case 'zoanthrope':
          PixelRenderer.drawZoanthrope(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt, fleet, this.elapsedGameTime);
          if ((enemy.warpShieldHp ?? 0) > 0) {
            ctx.save();
            ctx.strokeStyle = '#38bdf8';
            ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y - 10, enemy.radius + 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
          break;
        case 'biovore':
          PixelRenderer.drawBiovore(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt, fleet, this.elapsedGameTime);
          break;
        case 'spore_mine':
          PixelRenderer.drawSporeMine(ctx, enemy.x, enemy.y, enemy.animFrame, isHurt, fleet, this.elapsedGameTime);
          break;
        case 'toxicrene':
          PixelRenderer.drawToxicrene(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt);
          break;
        case 'trygon_prime':
          PixelRenderer.drawTrygonPrime(
            ctx,
            enemy.x,
            enemy.y,
            enemy.facingLeft,
            enemy.animFrame,
            isHurt,
            !!enemy.isEnraged,
            enemy.burrowState || 'surface',
            enemy.burrowTargetX,
            enemy.burrowTargetY
          );
          if (enemy.burrowState !== 'burrowed') {
            this.drawBossHpBar(ctx, enemy);
          }
          break;
        case 'broodlord':
          PixelRenderer.drawLictor(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt, 1.0);
          this.drawBossHpBar(ctx, enemy);
          break;
        case 'lictor':
          PixelRenderer.drawLictor(
            ctx,
            enemy.x,
            enemy.y,
            enemy.facingLeft,
            enemy.animFrame,
            isHurt,
            enemy.stealthAlpha ?? 0.22
          );
          break;
        case 'carnifex_boss':
          PixelRenderer.drawCarnifex(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt, !!enemy.isCharging, fleet, this.elapsedGameTime);
          this.drawBossHpBar(ctx, enemy);
          break;
        case 'hive_tyrant':
          PixelRenderer.drawHiveTyrant(ctx, enemy.x, enemy.y, enemy.facingLeft, enemy.animFrame, isHurt);
          this.drawHiveTyrantHpBar(ctx, enemy);
          break;
      }
      if (hasSquash) {
        ctx.restore();
      }
    }

    // 10. Orbiting Chainswords
    const chain = this.weapons.chainsword_orbit;
    if (chain.level > 0) {
      this.drawChainswords(ctx, chain.level);
    }

    // 11. Orbiting Storm Shields
    const stormShield = this.weapons.orbiting_shield;
    if (stormShield && stormShield.level > 0) {
      this.drawStormShields(ctx, stormShield.level);
    }

    // 12. Dash Afterimages
    for (const img of this.afterimages) {
      PixelRenderer.drawAfterimage(ctx, img.x, img.y, img.facingLeft, img.alpha);
    }

    // 13. Space Marine Player
    const hasHalo = this.playerStats.maxShield > 0;
    const shieldPct = hasHalo ? this.playerStats.shield / this.playerStats.maxShield : 0;

    // Emperor's Zeal / Tactical Overdrive Golden Aura
    if (this.isZealActive || this.overdriveTimer > 0) {
      ctx.save();
      const pulse = Math.sin(this.elapsedGameTime * 14) * 5;
      ctx.strokeStyle = this.overdriveTimer > 0 ? 'rgba(250, 204, 21, 0.9)' : 'rgba(245, 158, 11, 0.65)';
      ctx.lineWidth = this.overdriveTimer > 0 ? 4 : 3;
      ctx.beginPath();
      ctx.ellipse(this.playerX, this.playerY + 2, 26 + pulse, 32 + pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (this.overdriveTimer > 0) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.playerX, this.playerY, 36 - pulse * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (this.dropPodIntroTimer > 0 && this.dropPodIntroTimer <= 0.45) {
      PixelRenderer.drawDropPodIntro(ctx, this.playerX, this.playerY, this.dropPodIntroTimer);
    }

    if (this.dropPodIntroTimer > 0.45) {
      PixelRenderer.drawDropPodIntro(ctx, this.playerX, this.playerY, this.dropPodIntroTimer);
    } else if (this.dreadnought.isActive) {
      PixelRenderer.drawDreadnought(
        ctx,
        this.playerX,
        this.playerY,
        this.playerFacingLeft,
        this.playerWalkTimer,
        this.dreadnought.shootTimer < 0.03,
        this.chapter,
        this.elapsedGameTime
      );
    } else {
      const isMoving = (
        this.keysPressed.has('KeyW') || this.keysPressed.has('KeyS') ||
        this.keysPressed.has('KeyA') || this.keysPressed.has('KeyD') ||
        this.keysPressed.has('ArrowUp') || this.keysPressed.has('ArrowDown') ||
        this.keysPressed.has('ArrowLeft') || this.keysPressed.has('ArrowRight') ||
        Math.hypot(this.inputDir.x, this.inputDir.y) > 0.1 ||
        this.isDashing
      );
      const isLowHp = this.playerStats.hp < this.playerStats.maxHp * 0.25;

      const currentAimAngle = this.getAimAngle(undefined, true);

      PixelRenderer.drawSpaceMarine(
        ctx,
        this.playerX,
        this.playerY,
        this.playerFacingLeft,
        this.playerWalkTimer,
        this.playerHurtTimer > 0,
        hasHalo,
        shieldPct,
        this.chapter,
        this.marineSkin,
        this.playerShootTimer > 0,
        isMoving,
        this.elapsedGameTime,
        isLowHp,
        this.isDashing,
        currentAimAngle,
        this.playerTurnSquashTimer,
        this.playerIsBraced,
        this.playerOverheatHeat,
        this.playerMeleeSlashTimer
      );
    }

    // 14. Support Servo-Skull Companion
    PixelRenderer.drawServoSkull(
      ctx,
      this.servoSkull.x,
      this.servoSkull.y,
      this.servoSkull.hoverAngle,
      this.servoSkull.laserCooldown > 0.3
    );

    // 15. Projectiles
    this.drawProjectiles(ctx);

    // 15.6 Multi-Stage Retro Pixel Explosions
    for (const exp of this.pixelExplosions) {
      PixelRenderer.drawPixelExplosion(ctx, exp.x, exp.y, exp.radius, exp.life / exp.maxLife, exp.color);
    }

    // 15.5 Battle Speech Bubbles
    for (const bubble of this.battleSpeechBubbles) {
      PixelRenderer.drawBattleSpeechBubble(ctx, bubble);
    }

    // 16. Particles
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(Math.floor(p.x - p.size / 2), Math.floor(p.y - p.size / 2), p.size, p.size);
    }
    ctx.globalAlpha = 1.0;

    // 17. Drifting Atmospheric Ash Particles
    for (const ash of this.ashParticles) {
      ctx.fillStyle = '#64748b';
      ctx.globalAlpha = ash.alpha;
      ctx.fillRect(Math.floor(ash.x), Math.floor(ash.y), ash.size, ash.size);
    }
    ctx.globalAlpha = 1.0;

    // 18. Floating Damage Numbers
    ctx.font = 'bold 15px "VT323", monospace';
    ctx.textAlign = 'center';
    for (const text of this.floatingTexts) {
      const alpha = Math.max(0, text.life / text.maxLife);
      ctx.fillStyle = text.color;
      ctx.globalAlpha = alpha;
      ctx.fillText(text.text, Math.floor(text.x), Math.floor(text.y));
    }
    ctx.globalAlpha = 1.0;

    // 19. Ambient Lightning Flash
    if (this.ambientLightningFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = this.ambientLightningFlash;
      ctx.fillRect(this.playerX - w, this.playerY - h, w * 2, h * 2);
      ctx.globalAlpha = 1.0;
    }

    // 20. Tactical Targeting Reticle (Hybrid & Manual Aiming Modes)
    if (this.aimMode !== 'auto' && this.state === 'PLAYING') {
      const mx = this.mouseWorldX;
      const my = this.mouseWorldY;
      ctx.save();
      ctx.strokeStyle = this.aimMode === 'manual' ? 'rgba(239, 68, 68, 0.75)' : 'rgba(245, 158, 11, 0.75)';
      ctx.lineWidth = 1.5;

      // Circle
      ctx.beginPath();
      ctx.arc(mx, my, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(mx - 14, my);
      ctx.lineTo(mx - 4, my);
      ctx.moveTo(mx + 4, my);
      ctx.lineTo(mx + 14, my);
      ctx.moveTo(mx, my - 14);
      ctx.lineTo(mx, my - 4);
      ctx.moveTo(mx, my + 4);
      ctx.lineTo(mx, my + 14);
      ctx.stroke();

      // Dotted trajectory line from marine to crosshair
      ctx.strokeStyle = this.aimMode === 'manual' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.2)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(this.playerX, this.playerY - 8);
      ctx.lineTo(mx, my);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // 21. Off-Screen Tactical Waypoints (Relic Chests, Beacons, Bosses, Risk Zone)
    if (this.state === 'PLAYING') {
      this.drawOffScreenWaypoints(ctx, w, h);
    }

    if (this.activeHiveEvent?.type === 'spore_fog') {
      ctx.save();
      ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    if (this.activeMutator?.id === 'spore_eclipse') {
      ctx.save();
      const cx = w / 2;
      const cy = h / 2;
      const lightGrad = ctx.createRadialGradient(cx, cy, 35, cx, cy, 210);
      lightGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      lightGrad.addColorStop(0.65, 'rgba(6, 18, 11, 0.45)');
      lightGrad.addColorStop(1, 'rgba(2, 6, 4, 0.88)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    if (this.orbitalRelayTimer > 0 || this.orbitalRelayFlash > 0) {
      ctx.save(); ctx.fillStyle = this.orbitalRelayTimer > 0 ? 'rgba(254,240,138,0.1)' : `rgba(255,255,240,${Math.min(0.8, this.orbitalRelayFlash)})`;
      ctx.fillRect(0, 0, w, h);
      if (this.orbitalRelayTimer > 0) {
        ctx.fillStyle = '#fef08a'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center';
        ctx.fillText('ORBITAL RELAY LOCKED', w / 2, h / 2 - 100);
      }
      ctx.restore();
    }

    // 22. Chromatic Aberration RGB Glitch on major detonations
    if (this.chromaticAberrationTimer > 0 && this.chromaticAberrationIntensity > 0) {
      const shift = Math.round((Math.random() > 0.5 ? 1 : -1) * this.chromaticAberrationIntensity);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(this.canvas, shift, 0);
      ctx.restore();
    }
  }

  private drawGroundHazard(ctx: CanvasRenderingContext2D, hz: GroundHazardEntity) {
    const alpha = Math.min(0.65, (hz.duration / hz.maxDuration) * 0.7);
    const pulse = Math.sin(this.elapsedGameTime * 10 + hz.id) * 4;
    ctx.save();
    ctx.translate(Math.floor(hz.x), Math.floor(hz.y));
    ctx.globalAlpha = Math.max(0.1, alpha);

    if (hz.type === 'plasma_pool') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.strokeStyle = '#34d399';
    } else if (hz.type === 'promethium_fire') {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.38)';
      ctx.strokeStyle = '#67e8f9';
    } else {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.strokeStyle = '#facc15';
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(8, hz.radius + pulse), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawOffScreenWaypoints(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const targets: { x: number; y: number; label: string; color: string }[] = [];

    for (const chest of this.relicChests) {
      targets.push({ x: chest.x, y: chest.y, label: 'RELIC POD', color: '#fbbf24' });
    }
    if (this.extractionZone) {
      targets.push({ x: this.extractionZone.x, y: this.extractionZone.y, label: 'THUNDERHAWK LZ', color: '#10b981' });
    }

    if (this.riskZone) {
      targets.push({ x: this.riskZone.x, y: this.riskZone.y, label: 'ZONA BEKALAN', color: '#fde047' });
    }
    for (const obj of this.interactiveObjects) {
      if (obj.type === 'dreadnought_pod') {
        targets.push({ x: obj.x, y: obj.y, label: 'DREADNOUGHT', color: '#f59e0b' });
      } else if (obj.type === 'orbital_beacon') {
        targets.push({ x: obj.x, y: obj.y, label: 'ORBITAL BEACON', color: '#38bdf8' });
      } else if (obj.type === 'squad_beacon') {
        targets.push({ x: obj.x, y: obj.y, label: 'SQUAD BEACON', color: '#4ade80' });
      } else if (obj.type === 'turret' && (!obj.activeTimer || obj.activeTimer <= 0)) {
        targets.push({ x: obj.x, y: obj.y, label: 'TURRET', color: '#cbd5e1' });
      }
    }
    for (const enemy of this.enemies) {
      if (
        enemy.type === 'carnifex_boss' ||
        enemy.type === 'hive_tyrant' ||
        enemy.type === 'trygon_prime' ||
        enemy.type === 'broodlord'
      ) {
        targets.push({
          x: enemy.x,
          y: enemy.y,
          label:
            enemy.type === 'hive_tyrant'
              ? 'HIVE TYRANT'
              : enemy.type === 'trygon_prime'
              ? 'TRYGON PRIME'
              : enemy.type === 'broodlord'
              ? 'BROODLORD'
              : 'CARNIFEX',
          color: '#f43f5e'
        });
      }
    }
    for (const obs of this.obstacles) {
      if (obs.variant === 'statue' && !obs.blessed && Math.hypot(obs.x - this.playerX, obs.y - this.playerY) < 900) {
        targets.push({
          x: obs.x,
          y: obs.y,
          label: 'SHRINE AQUILA',
          color: '#fde047'
        });
      } else if (obs.variant === 'tech_shrine' && !obs.blessed && Math.hypot(obs.x - this.playerX, obs.y - this.playerY) < 900) {
        targets.push({
          x: obs.x,
          y: obs.y,
          label: 'FORGE SHRINE',
          color: '#fb923c'
        });
      }
    }

    const halfW = w / 2 - 48;
    const halfH = h / 2 - 58;

    ctx.save();
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';

    for (const t of targets) {
      const dx = t.x - this.playerX;
      const dy = t.y - this.playerY;
      // Only render waypoint if outside visible screen bounds
      if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) continue;

      const angle = Math.atan2(dy, dx);
      const scaleX = halfW / Math.max(1, Math.abs(Math.cos(angle)));
      const scaleY = halfH / Math.max(1, Math.abs(Math.sin(angle)));
      const edgeDist = Math.min(scaleX, scaleY);

      const ix = w / 2 + Math.cos(angle) * edgeDist;
      const iy = h / 2 + Math.sin(angle) * edgeDist;
      const meters = Math.max(1, Math.round(Math.hypot(dx, dy) / 10));

      ctx.save();
      ctx.translate(ix, iy);

      // Directional Pointer Triangle outside the pill
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.moveTo(52, 0);
      ctx.lineTo(42, -6);
      ctx.lineTo(42, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Badge background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-44, -14, 88, 26, 6);
      ctx.fill();
      ctx.stroke();

      // Label & distance
      ctx.fillStyle = t.color;
      ctx.fillText(t.label, 0, -2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`${meters}m`, 0, 9);
      ctx.restore();
    }

    ctx.restore();
  }

  private drawVortex(ctx: CanvasRenderingContext2D, v: VortexEntity) {
    const pulse = Math.sin(this.elapsedGameTime * 14) * 6;
    const angle = this.elapsedGameTime * 4;

    ctx.save();
    ctx.translate(Math.floor(v.x), Math.floor(v.y));

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, v.radius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    for (let arm = 0; arm < 4; arm++) {
      const startAngle = angle + (arm * Math.PI) / 2;
      ctx.strokeStyle = arm % 2 === 0 ? '#a855f7' : '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let r = 10; r < v.radius; r += 8) {
        const curA = startAngle + (r / v.radius) * Math.PI * 1.5;
        const px = Math.cos(curA) * r;
        const py = Math.sin(curA) * r;
        if (r === 10) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#090514';
    ctx.beginPath();
    ctx.arc(0, 0, 18 + pulse * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  private drawShockwave(ctx: CanvasRenderingContext2D, sw: ShockwaveEntity) {
    const alpha = 1 - sw.currentRadius / sw.maxRadius;
    ctx.save();
    ctx.strokeStyle = sw.color;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.currentRadius, 0, Math.PI * 2);
    ctx.stroke();

    const spikes = 12;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    for (let s = 0; s < spikes; s++) {
      const ang = (s * Math.PI * 2) / spikes + this.elapsedGameTime * 5;
      const innerR = sw.currentRadius - 6;
      const outerR = sw.currentRadius + 8;
      ctx.moveTo(sw.x + Math.cos(ang) * innerR, sw.y + Math.sin(ang) * innerR);
      ctx.lineTo(sw.x + Math.cos(ang) * outerR, sw.y + Math.sin(ang) * outerR);
    }
    ctx.stroke();

    ctx.globalAlpha = 1.0;
    ctx.restore();

  }

  private drawLaserBeams(ctx: CanvasRenderingContext2D) {
    for (const beam of this.laserBeams) {
      const alpha = Math.max(0, beam.life / beam.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.strokeStyle = beam.color;
      ctx.lineWidth = beam.width;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = beam.width * 0.45;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();

      ctx.globalAlpha = 1.0;
      ctx.restore();
    }

    for (const arc of this.lightningArcs) {
      const alpha = Math.max(0, arc.life / arc.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      arc.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      ctx.globalAlpha = 1.0;
      ctx.restore();
    }
  }

  private drawStormShields(ctx: CanvasRenderingContext2D, level: number) {
    const shieldCount = level >= 4 ? 4 : (level >= 2 ? 3 : 2);
    const orbitRadius = 75 + level * 4;

    for (let i = 0; i < shieldCount; i++) {
      const angle = this.stormShieldAngle + (i * Math.PI * 2) / shieldCount;
      const sx = this.playerX + Math.cos(angle) * orbitRadius;
      const sy = this.playerY + Math.sin(angle) * orbitRadius;

      ctx.save();
      ctx.translate(Math.floor(sx), Math.floor(sy));
      ctx.rotate(angle + Math.PI / 2);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-10, -14, 20, 28);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -14, 20, 28);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-2, -8, 4, 16);
      ctx.fillRect(-6, -4, 12, 4);

      if (level >= 5 && Math.random() < 0.4) {
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-8, -12);
        ctx.lineTo(-12, -4);
        ctx.lineTo(-6, 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private drawChainswords(ctx: CanvasRenderingContext2D, level: number) {
    const swordCount = Math.min(4, level >= 5 ? 4 : (level >= 4 ? 3 : (level >= 2 ? 2 : 1)));
    const orbitRadius = 60 + level * 4;

    for (let i = 0; i < swordCount; i++) {
      const angle = this.chainswordAngle + (i * Math.PI * 2) / swordCount;
      const sx = this.playerX + Math.cos(angle) * orbitRadius;
      const sy = this.playerY + Math.sin(angle) * orbitRadius;

      ctx.save();
      ctx.translate(Math.floor(sx), Math.floor(sy));
      ctx.rotate(angle + Math.PI / 2);

      const isRelic = level >= 5;
      ctx.fillStyle = isRelic ? '#eab308' : '#cbd5e1';
      ctx.fillRect(-3, -16, 6, 26);
      ctx.fillStyle = isRelic ? '#ef4444' : '#b91c1c';
      ctx.fillRect(-5, 4, 10, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, 12, 4, 8);

      ctx.fillStyle = isRelic ? '#fbbf24' : '#64748b';
      for (let t = -14; t < 2; t += 4) {
        ctx.fillRect(-5, t, 2, 2);
        ctx.fillRect(3, t, 2, 2);
      }

      ctx.restore();
    }
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D) {
    for (const proj of this.projectiles) {
      if (proj.type === 'heavy_flamer') {
        const alpha = Math.max(0, proj.duration / proj.maxDuration);
        ctx.fillStyle = proj.color;
        ctx.globalAlpha = alpha * 0.75;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      } else {
        PixelRenderer.drawRealisticProjectile(ctx, proj, this.elapsedGameTime);
      }
    }
  }

  private drawBossHpBar(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    if (enemy.isEnraged) {
      ctx.save();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 8 + Math.sin(this.elapsedGameTime * 15) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    const barW = 120;
    const barH = 8;
    const bx = enemy.x - barW / 2;
    const by = enemy.y - enemy.radius - 22;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);

    const pct = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = enemy.isEnraged ? '#f43f5e' : '#ef4444';
    ctx.fillRect(bx, by, barW * pct, barH);

    ctx.fillStyle = enemy.isEnraged ? '#fda4af' : '#f8fafc';
    ctx.font = 'bold 12px "VT323", monospace';
    ctx.textAlign = 'center';
    const baseName =
      enemy.type === 'trygon_prime'
        ? 'TRYGON PRIME'
        : enemy.type === 'broodlord'
        ? 'BROODLORD ALPHA'
        : 'CARNIFEX HIVE BEHEMOTH';
    ctx.fillText(enemy.isEnraged ? `🔥 ${baseName} [ENRAGED]` : baseName, enemy.x, by - 4);
  }

  private drawHiveTyrantHpBar(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    if (enemy.isEnraged) {
      ctx.save();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 10 + Math.sin(this.elapsedGameTime * 15) * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    const barW = 160;
    const barH = 10;
    const bx = enemy.x - barW / 2;
    const by = enemy.y - enemy.radius - 28;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);

    const pct = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = enemy.isEnraged ? '#f43f5e' : '#a855f7';
    ctx.fillRect(bx, by, barW * pct, barH);

    ctx.fillStyle = enemy.isEnraged ? '#fda4af' : '#f8fafc';
    ctx.font = 'bold 13px "VT323", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.isEnraged ? '🔥 HIVE TYRANT [ENRAGED]' : 'HIVE TYRANT SUPREME WARLORD', enemy.x, by - 5);
  }

  public destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }
}
