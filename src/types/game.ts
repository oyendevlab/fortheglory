/**
 * Game Types for Warhammer 40k: Space Marine Pixel Survivor
 */

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'LEVEL_UP' | 'CHEST_REWARD' | 'GAME_OVER' | 'VICTORY';

export type MarineChapter =
  | 'ultramarines'
  | 'blood_angels'
  | 'space_wolves'
  | 'dark_angels'
  | 'salamanders'
  | 'imperial_fists'
  | 'iron_hands'
  | 'raven_guard';

export type MapTheme = 'hive_city' | 'space_hulk' | 'bio_chasm' | 'mechanicus_forge' | 'strike_cruiser';

export type GameLanguage = 'ms' | 'en';

export type WeaponId = 
  | 'bolter'
  | 'heavy_bolter'
  | 'lascannon'
  | 'orbiting_shield'
  | 'vortex_grenade'
  | 'thunder_hammer'
  | 'plasma_cannon'
  | 'chainsword_orbit'
  | 'frag_grenade'
  | 'heavy_flamer'
  | 'melta_lance'
  | 'power_sword'
  | 'assault_cannon'
  | 'cyclone_missile';

export type PassiveId =
  | 'iron_halo'
  | 'purity_seals'
  | 'auspex_scanner'
  | 'tactical_doctrine'
  | 'adamantine_plate'
  | 'emperor_wrath';

export type UpgradeCategory = 'WEAPON' | 'PASSIVE' | 'STORE_HEALTH' | 'SQUAD';

export interface WeaponConfig {
  id: WeaponId;
  name: string;
  shortDesc: string;
  icon: string; // pixel icon key
  level: number;
  maxLevel: number;
  cooldown: number; // in seconds
  timer: number;
  damage: number;
  descriptionByLevel: string[];
  isEvolved?: boolean;
  evolutionName?: string;
  evolutionDesc?: string;
}

export interface PassiveConfig {
  id: PassiveId;
  name: string;
  shortDesc: string;
  icon: string;
  level: number;
  maxLevel: number;
  descriptionByLevel: string[];
}

export type AimMode = 'auto' | 'hybrid' | 'manual';

export interface UpgradeOption {
  id: string;
  category: UpgradeCategory;
  name: string;
  description: string;
  level: number;
  isNew: boolean;
  icon: string;
  rarity: 'standard' | 'blessed' | 'relic' | 'evolution';
  healAmount?: number;
  maxHpBonus?: number;
  evoPassiveReq?: {
    id: PassiveId;
    name: string;
    hasPassive: boolean;
  };
  evoWeaponReq?: {
    id: WeaponId;
    name: string;
    weaponLevel: number;
    isEvolved: boolean;
  };
}

export interface WeaponStatRecord {
  damage: number;
  kills: number;
}

export type EnemyType = 
  | 'hormagaunt'
  | 'termagant'
  | 'genestealer'
  | 'tyranid_warrior'
  | 'zoanthrope'
  | 'lictor'
  | 'biovore'
  | 'spore_mine'
  | 'toxicrene'
  | 'broodlord'
  | 'trygon_prime'
  | 'carnifex_boss'
  | 'hive_tyrant';

export type ServoSkullMode = 'laser' | 'cryo' | 'collector';

export type SquadBrotherType = 'apothecary' | 'devastator' | 'librarian' | 'techmarine';

export type OathId = 'oath_fury' | 'oath_vanguard' | 'oath_penance';

export type WargearRelicId = 'relic_macragge' | 'chalice_sanguinius' | 'pelt_fenris' | 'vulkan_sigil';

export interface WargearRelic {
  id: WargearRelicId;
  name: string;
  desc: string;
  icon: string;
}

export interface InteractiveObject {
  id: number;
  type: 'barrel' | 'turret' | 'dreadnought_pod' | 'orbital_beacon' | 'squad_beacon' | 'xp_magnet' | 'risk_supply';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  activeTimer?: number; // active shooting time left for turret
  shootTimer?: number;
  isTriggered?: boolean;
}

export interface ArmoryUpgrades {
  healthBonus: number; // rank 0-5 (+12 Max HP per rank)
  speedBonus: number;  // rank 0-5 (+4% Move Speed per rank)
  magnetBonus: number; // rank 0-5 (+20 Magnet range per rank)
  critBonus: number;   // rank 0-5 (+3% Crit chance per rank)
  rerollBonus: number; // rank 0-3 (+1 Reroll per rank)
  servoSkullMode?: ServoSkullMode;
  servoSkullLevel?: number; // rank 0-5 (+25% Servo-Skull power & rate)
  preferredBrother?: 'auto' | SquadBrotherType;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpValue: number;
  shootCooldown?: number;
  chargeTimer?: number;
  isCharging?: boolean;
  facingLeft: boolean;
  animFrame: number;
  color: string;
  isMutated?: boolean;
  hitFlashTimer: number;
  isElite?: boolean;
  burningTimer?: number;
  burningTick?: number;
  vortexMarkedTimer?: number;
  shreddedTimer?: number;
  stunTimer?: number;
  slowTimer?: number;
  isEnraged?: boolean;
  isDummy?: boolean;
  burrowState?: 'surface' | 'burrowed';
  burrowTimer?: number;
  burrowTargetX?: number;
  burrowTargetY?: number;
  stealthAlpha?: number;
  pounceTimer?: number;
  isPouncing?: boolean;
  warpShieldHp?: number;
  squashX?: number;
  squashY?: number;
  maxWarpShieldHp?: number;
  boneswordTimer?: number;
}

export type GameMode = 'standard' | 'endless' | 'boss_rush' | 'firing_range';

export type MarineSkin = 'standard' | 'veteran_gold' | 'deathwatch' | 'sanguinary_guard';

export type ProjectileType = 
  | WeaponId 
  | 'enemy_acid' 
  | 'enemy_warp' 
  | 'bonesword_wave'
  | 'turret_bullet' 
  | 'dreadnought_assault_cannon' 
  | 'devastator_missile';

export interface Projectile {
  id: number;
  type: ProjectileType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  duration: number; // lifetime left in seconds
  maxDuration: number;
  pierce: number; // remaining pierces
  piercedEnemyIds: Set<number>;
  color: string;
  trailParticles?: boolean;
  aoeRadius?: number; // for plasma / grenade detonation
  rotAngle?: number;
  knockback?: number;
  isClusterChild?: boolean;
  homing?: boolean;
}

export interface SquadBrother {
  id: number;
  type: SquadBrotherType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  healCooldown?: number;
  shootCooldown?: number;
  turretCooldown?: number;
  facingLeft: boolean;
  animFrame: number;
}

export interface DreadnoughtState {
  isActive: boolean;
  timer: number;
  maxTimer: number;
  shootTimer: number;
  slamTimer: number;
  facingLeft: boolean;
}

export interface OrbitalStrike {
  id: number;
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  radius: number;
  hasDamaged: boolean;
}

export interface BattleSpeechBubble {
  id: number;
  x: number;
  y: number;
  text: string;
  speaker: string;
  life: number;
  maxLife: number;
  color: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  rewardSeals: number;
  unlocked: boolean;
}

export interface BiomassOrb {
  id: number;
  x: number;
  y: number;
  value: number;
  tier: 1 | 2 | 3; // 1: small green, 2: medium blue, 3: large red-gold
  magnetized: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape?: 'square' | 'circle' | 'spark';
}

export interface PixelExplosion {
  id: number;
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  color?: string;
  secondaryPops?: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  isCrit?: boolean;
}

export interface PlayerStats {
  maxHp: number;
  hp: number;
  shield: number;
  maxShield: number;
  shieldRegenRate: number; // shield per sec
  shieldDelayTimer: number; // cooldown before shield recovers
  moveSpeed: number;
  damageMult: number;
  cooldownMult: number;
  magnetRange: number;
  critChance: number;
}

export interface HighScoreRecord {
  survivalTime: number;
  killCount: number;
  highestLevel: number;
  bossesKilled: number;
  puritySeals: number;
}

export interface RelicChest {
  id: number;
  x: number;
  y: number;
  beaconTimer: number;
  source?: 'elite' | 'boss' | 'supply';
}

export interface BloodSplat {
  x: number;
  y: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface ChitinFragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface Afterimage {
  x: number;
  y: number;
  facingLeft: boolean;
  alpha: number;
}

export interface ServoSkullCompanion {
  x: number;
  y: number;
  vx: number;
  vy: number;
  laserCooldown: number;
  hoverAngle: number;
}

export type MapObstacleVariant =
  | 'pillar'
  | 'barricade'
  | 'statue'
  | 'crater'
  | 'bulkhead'
  | 'plasma_core'
  | 'spore_tower'
  | 'acid_pool'
  | 'tech_shrine'
  | 'cruiser_console'
  | 'tech_priest';

export interface MapObstacle {
  id: string;
  x: number;
  y: number;
  radius: number;
  variant: MapObstacleVariant;
  blocksMovement: boolean;
  blocksProjectiles: boolean;
  hp?: number;
  maxHp?: number;
  shrineProgress?: number;
  blessed?: boolean;
}

export interface ActiveBossInfo {
  id: number;
  name: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  isEnraged: boolean;
}

export interface ExtractionZoneInfo {
  x: number;
  y: number;
  radius: number;
  inside: boolean;
  airstrikeTimer: number;
}

export interface CombatTrial {
  id: string;
  title: string;
  progress: number;
  target: number;
  timeLeft: number;
  maxTime: number;
  rewardSeals: number;
  rewardDesc: string;
  type: 'kills' | 'streak' | 'dash';
}

export type HiveEventType = 'spore_fog' | 'hormagaunt_stampede' | 'munitorum_airdrop';

export interface DynamicHiveEvent {
  type: HiveEventType;
  title: string;
  desc: string;
  timer: number;
  maxTimer: number;
}

export type DamageNumberMode = 'all' | 'crits' | 'off';
export type ScreenShakeLevel = 'high' | 'low' | 'off';

export interface GameFeelSettings {
  damageNumbers: DamageNumberMode;
  screenShake: ScreenShakeLevel;
}

export interface MinimapBlip {
  dx: number;
  dy: number;
  kind: 'enemy' | 'boss' | 'chest' | 'beacon' | 'obstacle';
}

export interface RunHistoryEntry {
  id: string;
  date: string;
  chapter: MarineChapter;
  mode: GameMode;
  victory: boolean;
  survivalTime: number;
  kills: number;
  level: number;
  bossesKilled: number;
  puritySeals: number;
  evolvedWeapons: string[];
}

export type ChapterMasteryMap = Record<MarineChapter, number>;

export interface ChapterMasteryRankInfo {
  rankIndex: number; // 0..4
  rankTitle: string;
  xp: number;
  currentFloor: number;
  nextThreshold: number | null;
  progressPct: number;
  bonuses: {
    hpBonus: number;
    damageBonusPct: number;
    critBonus: number; // e.g. 0.04 for +4%
    cooldownReductionPct: number; // e.g. 0.04 for -4%
  };
}

export interface CareerStatsRecord {
  totalRuns: number;
  totalVictories: number;
  totalKills: number;
  totalBosses: number;
  totalSealsEarned: number;
  totalPlayTime: number;
}

export interface DailyDirectiveInfo {
  dateKey: string;
  codeName: string;
  chapter: MarineChapter;
  mapTheme: MapTheme;
  oath: OathId;
  bonusSeals: number;
}

export type TalentDoctrine = 'macragge' | 'baal' | 'nocturne';

export interface TalentNodeDef {
  id: string;
  doctrine: TalentDoctrine;
  tier: 1 | 2 | 3;
  name: string;
  desc: string;
  cost: number;
  maxRank: number;
  bonusType: 'armor' | 'shield_regen' | 'invuln' | 'fire_rate' | 'speed' | 'crit_dmg' | 'aoe' | 'burn_dmg' | 'melta_pen';
  bonusPerRank: number;
}

export type TalentRanksMap = Record<string, number>;

export type WeaponOverclockId = 
  | 'overclock_acid' 
  | 'overclock_incendiary' 
  | 'overclock_arc' 
  | 'overclock_supernova'
  | 'overclock_hypervelocity';

export interface WeaponOverclockDef {
  id: WeaponOverclockId;
  name: string;
  desc: string;
  icon: string;
  compatibleWeapons: WeaponId[];
}

export type WeaponOverclocksMap = Partial<Record<WeaponId, WeaponOverclockId>>;

export type HiveMutatorId = 'hardened_chitin' | 'adrenal_surge' | 'spore_eclipse';

export interface HiveMutatorInfo {
  id: HiveMutatorId;
  name: string;
  desc: string;
  active: boolean;
  color: string;
  duration: number;
}

export type BestiaryKillsMap = Partial<Record<EnemyType, number>>;

export interface BestiaryMilestone {
  enemyType: EnemyType;
  name: string;
  subtitle: string;
  lore: string;
  weakness: string;
  requiredKills: number;
  damageBonusPct: number;
}
