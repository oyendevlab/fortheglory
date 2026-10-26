import {
  CareerStatsRecord,
  ChapterMasteryMap,
  ChapterMasteryRankInfo,
  DailyDirectiveInfo,
  HighScoreRecord,
  MapTheme,
  MarineChapter,
  OathId,
  RunHistoryEntry,
  TalentNodeDef,
  TalentRanksMap,
  WeaponOverclockDef,
  WeaponOverclocksMap,
  BestiaryMilestone,
  BestiaryKillsMap,
  EnemyType
} from '../types/game';

export const CHAPTER_MASTERY_KEY = 'wh40k_sm_chapter_mastery_v1';
export const DAILY_COMPLETED_KEY = 'wh40k_sm_daily_completed_v1';
export const CAREER_STATS_KEY = 'wh40k_sm_career_stats_v1';
export const TALENTS_KEY = 'wh40k_sm_talents_v1';
export const OVERCLOCKS_KEY = 'wh40k_sm_overclocks_v1';
export const BESTIARY_KILLS_KEY = 'wh40k_sm_bestiary_kills_v1';

export const ALL_CHAPTERS: MarineChapter[] = [
  'ultramarines',
  'blood_angels',
  'space_wolves',
  'dark_angels',
  'salamanders',
  'imperial_fists',
  'iron_hands',
  'raven_guard'
];

export const CHAPTER_DISPLAY_NAMES: Record<MarineChapter, string> = {
  ultramarines: 'Ultramarines',
  blood_angels: 'Blood Angels',
  space_wolves: 'Space Wolves',
  dark_angels: 'Dark Angels',
  salamanders: 'Salamanders',
  imperial_fists: 'Imperial Fists',
  iron_hands: 'Iron Hands',
  raven_guard: 'Raven Guard'
};

export const MAP_DISPLAY_NAMES: Record<MapTheme, string> = {
  hive_city: 'Imperial Hive Ruin',
  space_hulk: 'Derelict Space Hulk',
  bio_chasm: 'Tyranid Bio-Chasm',
  mechanicus_forge: 'Mechanicus Forge Complex',
  strike_cruiser: 'Space Marine Strike Cruiser'
};

export const OATH_DISPLAY_NAMES: Record<OathId, string> = {
  oath_fury: 'Sumpah Kemurkaan',
  oath_vanguard: 'Sumpah Vanguard',
  oath_penance: 'Sumpah Penebusan (+25% Seals)'
};

interface MasteryTierDef {
  title: string;
  minXp: number;
  hpBonus: number;
  damageBonusPct: number;
  critBonus: number;
  cooldownReductionPct: number;
}

export const MASTERY_TIERS: MasteryTierDef[] = [
  { title: 'Neophyte', minXp: 0, hpBonus: 0, damageBonusPct: 0, critBonus: 0, cooldownReductionPct: 0 },
  { title: 'Battle-Brother', minXp: 250, hpBonus: 8, damageBonusPct: 4, critBonus: 0.02, cooldownReductionPct: 0.02 },
  { title: 'Veteran', minXp: 750, hpBonus: 18, damageBonusPct: 8, critBonus: 0.04, cooldownReductionPct: 0.04 },
  { title: 'Captain', minXp: 1600, hpBonus: 30, damageBonusPct: 13, critBonus: 0.06, cooldownReductionPct: 0.06 },
  { title: 'Chapter Master', minXp: 3000, hpBonus: 45, damageBonusPct: 18, critBonus: 0.08, cooldownReductionPct: 0.09 }
];

export function createEmptyChapterMastery(): ChapterMasteryMap {
  return {
    ultramarines: 0,
    blood_angels: 0,
    space_wolves: 0,
    dark_angels: 0,
    salamanders: 0,
    imperial_fists: 0,
    iron_hands: 0,
    raven_guard: 0
  };
}

export function loadChapterMastery(): ChapterMasteryMap {
  const base = createEmptyChapterMastery();
  try {
    const raw = localStorage.getItem(CHAPTER_MASTERY_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      for (const ch of ALL_CHAPTERS) {
        const val = Number(parsed[ch]);
        if (Number.isFinite(val) && val >= 0) {
          base[ch] = Math.floor(val);
        }
      }
    }
  } catch {
    // ignore storage errors
  }
  return base;
}

export function saveChapterMastery(map: ChapterMasteryMap): void {
  try {
    localStorage.setItem(CHAPTER_MASTERY_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export function getChapterMasteryInfo(xpRaw: number): ChapterMasteryRankInfo {
  const xp = Math.max(0, Math.floor(xpRaw || 0));
  let rankIndex = 0;
  for (let i = MASTERY_TIERS.length - 1; i >= 0; i--) {
    if (xp >= MASTERY_TIERS[i].minXp) {
      rankIndex = i;
      break;
    }
  }
  const current = MASTERY_TIERS[rankIndex];
  const next = rankIndex < MASTERY_TIERS.length - 1 ? MASTERY_TIERS[rankIndex + 1] : null;
  const progressPct = next
    ? Math.min(100, Math.max(0, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100)))
    : 100;

  return {
    rankIndex,
    rankTitle: current.title,
    xp,
    currentFloor: current.minXp,
    nextThreshold: next ? next.minXp : null,
    progressPct,
    bonuses: {
      hpBonus: current.hpBonus,
      damageBonusPct: current.damageBonusPct,
      critBonus: current.critBonus,
      cooldownReductionPct: current.cooldownReductionPct
    }
  };
}

export function calculateRunChapterXp(stats: {
  kills: number;
  time: number;
  bossesKilled: number;
  victory?: boolean;
}): number {
  if (stats.kills <= 0 && stats.time < 5) return 0;
  return Math.max(
    15,
    Math.round(
      stats.kills * 0.55 +
        stats.time * 0.65 +
        stats.bossesKilled * 45 +
        (stats.victory ? 120 : 0)
    )
  );
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hashDateString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const DIRECTIVE_CODENAMES = [
  'OPERASI IRON TEMPEST',
  'OPERASI CRIMSON AEGIS',
  'OPERASI XENOS PURGATION',
  'OPERASI OMNISSIAH WRATH',
  'OPERASI TERMINUS DECREE',
  'OPERASI SOLAR VANGUARD',
  'OPERASI LEVIATHAN BANE',
  'OPERASI SANCTUS VIGIL'
];

export function getDailyDirective(dateKey: string = getTodayDateKey()): DailyDirectiveInfo {
  const seed = hashDateString(`wh40k_directive_${dateKey}`);
  const maps: MapTheme[] = ['hive_city', 'space_hulk', 'bio_chasm', 'mechanicus_forge'];
  const oaths: OathId[] = ['oath_fury', 'oath_vanguard', 'oath_penance'];

  const chapter = ALL_CHAPTERS[seed % ALL_CHAPTERS.length];
  const mapTheme = maps[(seed >>> 4) % maps.length];
  const oath = oaths[(seed >>> 8) % oaths.length];
  const codeName = DIRECTIVE_CODENAMES[(seed >>> 12) % DIRECTIVE_CODENAMES.length];

  return {
    dateKey,
    codeName,
    chapter,
    mapTheme,
    oath,
    bonusSeals: 100
  };
}

export function isDailyDirectiveCompleted(dateKey: string = getTodayDateKey()): boolean {
  try {
    return localStorage.getItem(DAILY_COMPLETED_KEY) === dateKey;
  } catch {
    return false;
  }
}

export function markDailyDirectiveCompleted(dateKey: string = getTodayDateKey()): void {
  try {
    localStorage.setItem(DAILY_COMPLETED_KEY, dateKey);
  } catch {
    // ignore
  }
}

export function loadCareerStats(
  fallbackHistory: RunHistoryEntry[] = [],
  fallbackHighScore?: HighScoreRecord
): CareerStatsRecord {
  try {
    const raw = localStorage.getItem(CAREER_STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          totalRuns: Math.max(0, Number(parsed.totalRuns) || 0),
          totalVictories: Math.max(0, Number(parsed.totalVictories) || 0),
          totalKills: Math.max(0, Number(parsed.totalKills) || 0),
          totalBosses: Math.max(0, Number(parsed.totalBosses) || 0),
          totalSealsEarned: Math.max(0, Number(parsed.totalSealsEarned) || 0),
          totalPlayTime: Math.max(0, Number(parsed.totalPlayTime) || 0)
        };
      }
    }
  } catch {
    // ignore
  }

  // Bootstrap from existing runHistory / highScore if career stats not yet recorded
  const histRuns = fallbackHistory.length;
  const histVictories = fallbackHistory.filter((r) => r.victory).length;
  const histKills = fallbackHistory.reduce((acc, r) => acc + (r.kills || 0), 0);
  const histBosses = fallbackHistory.reduce((acc, r) => acc + (r.bossesKilled || 0), 0);
  const histSeals = fallbackHistory.reduce((acc, r) => acc + (r.puritySeals || 0), 0);
  const histTime = fallbackHistory.reduce((acc, r) => acc + (r.survivalTime || 0), 0);

  return {
    totalRuns: histRuns > 0 ? histRuns : fallbackHighScore && fallbackHighScore.killCount > 0 ? 1 : 0,
    totalVictories: histVictories,
    totalKills: Math.max(histKills, fallbackHighScore?.killCount || 0),
    totalBosses: Math.max(histBosses, fallbackHighScore?.bossesKilled || 0),
    totalSealsEarned: Math.max(histSeals, fallbackHighScore?.puritySeals || 0),
    totalPlayTime: Math.max(histTime, fallbackHighScore?.survivalTime || 0)
  };
}

export function saveCareerStats(stats: CareerStatsRecord): void {
  try {
    localStorage.setItem(CAREER_STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

// --- SACRED CODEX TALENTS ---
export const TALENT_NODES: TalentNodeDef[] = [
  // Macragge (Defense)
  {
    id: 'macragge_1',
    doctrine: 'macragge',
    tier: 1,
    name: 'Ceramite Bulwark',
    desc: '+12 Kesihatan Maksimum (Max HP) setiap pangkat.',
    cost: 45,
    maxRank: 3,
    bonusType: 'armor',
    bonusPerRank: 12
  },
  {
    id: 'macragge_2',
    doctrine: 'macragge',
    tier: 2,
    name: 'Iron Will Regeneration',
    desc: '+18% Kadar Pemulihan Perisai (Shield Regen) setiap pangkat.',
    cost: 75,
    maxRank: 3,
    bonusType: 'shield_regen',
    bonusPerRank: 0.18
  },
  {
    id: 'macragge_3',
    doctrine: 'macragge',
    tier: 3,
    name: 'Aegis Invulnerability',
    desc: '+0.35s Tempoh Kebal selepas menerima kerosakan.',
    cost: 130,
    maxRank: 2,
    bonusType: 'invuln',
    bonusPerRank: 0.35
  },

  // Baal (Speed & Crit)
  {
    id: 'baal_1',
    doctrine: 'baal',
    tier: 1,
    name: 'Sanguinary Swiftness',
    desc: '+5% Kelajuan Gerak (Move Speed) setiap pangkat.',
    cost: 45,
    maxRank: 3,
    bonusType: 'speed',
    bonusPerRank: 0.05
  },
  {
    id: 'baal_2',
    doctrine: 'baal',
    tier: 2,
    name: 'Red Thirst Fervor',
    desc: '+7% Kadar Serangan & Tembakan (Fire Rate) setiap pangkat.',
    cost: 75,
    maxRank: 3,
    bonusType: 'fire_rate',
    bonusPerRank: 0.07
  },
  {
    id: 'baal_3',
    doctrine: 'baal',
    tier: 3,
    name: 'Death Company Wrath',
    desc: '+25% Pengganda Kerosakan Kritikal (Crit DMG) setiap pangkat.',
    cost: 130,
    maxRank: 2,
    bonusType: 'crit_dmg',
    bonusPerRank: 0.25
  },

  // Nocturne (AoE & Flame)
  {
    id: 'nocturne_1',
    doctrine: 'nocturne',
    tier: 1,
    name: 'Promethium Infusion',
    desc: '+14% Saiz Letupan Kawasan (AoE Radius) setiap pangkat.',
    cost: 45,
    maxRank: 3,
    bonusType: 'aoe',
    bonusPerRank: 0.14
  },
  {
    id: 'nocturne_2',
    doctrine: 'nocturne',
    tier: 2,
    name: 'Dragonfire Pyre',
    desc: '+25% Kerosakan Api Berterusan (Burn DoT) setiap pangkat.',
    cost: 75,
    maxRank: 3,
    bonusType: 'burn_dmg',
    bonusPerRank: 0.25
  },
  {
    id: 'nocturne_3',
    doctrine: 'nocturne',
    tier: 3,
    name: 'Vulkan Multi-Melta Shred',
    desc: '+20% Penembusan Perisai Xenos (Armor Shred) setiap pangkat.',
    cost: 130,
    maxRank: 2,
    bonusType: 'melta_pen',
    bonusPerRank: 0.20
  }
];

export function loadTalents(): TalentRanksMap {
  try {
    const raw = localStorage.getItem(TALENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function saveTalents(map: TalentRanksMap): void {
  try {
    localStorage.setItem(TALENTS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// --- ARCHEOTECH WEAPON OVERCLOCKS ---
export const WEAPON_OVERCLOCK_DEFS: WeaponOverclockDef[] = [
  {
    id: 'overclock_acid',
    name: 'Acid-Etched Munitions',
    desc: 'Menghakis perisai sasaran, menyebabkan musuh menerima +30% kerosakan daripada semua sumber.',
    icon: '🧪',
    compatibleWeapons: ['bolter', 'heavy_bolter', 'assault_cannon', 'cyclone_missile']
  },
  {
    id: 'overclock_incendiary',
    name: 'Incendiary Promethium Core',
    desc: 'Setiap letupan atau peluru ke-4 mencetuskan kobaran api membakar kawasan sekeliling.',
    icon: '🔥',
    compatibleWeapons: ['heavy_flamer', 'frag_grenade', 'plasma_cannon', 'power_sword']
  },
  {
    id: 'overclock_arc',
    name: 'Volkite Chain-Arc',
    desc: 'Tembakan memancarkan arka kilat sekunder ke 3 musuh berhampiran.',
    icon: '⚡',
    compatibleWeapons: ['thunder_hammer', 'lascannon', 'orbiting_shield']
  },
  {
    id: 'overclock_supernova',
    name: 'Singularity Supernova',
    desc: '+40% Radius letupan dan daya tarikan graviti mini menyedut kawanan.',
    icon: '🌌',
    compatibleWeapons: ['vortex_grenade', 'melta_lance', 'plasma_cannon']
  },
  {
    id: 'overclock_hypervelocity',
    name: 'Hypervelocity Stabilizer',
    desc: '+35% Kelajuan projektil & menambah +1 Penembusan (Pierce).',
    icon: '🎯',
    compatibleWeapons: ['bolter', 'lascannon', 'assault_cannon', 'chainsword_orbit']
  }
];

export function loadWeaponOverclocks(): WeaponOverclocksMap {
  try {
    const raw = localStorage.getItem(OVERCLOCKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function saveWeaponOverclocks(map: WeaponOverclocksMap): void {
  try {
    localStorage.setItem(OVERCLOCKS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// --- BESTIARY AUTOPSY & LORE MILESTONES ---
export const BESTIARY_MILESTONES: BestiaryMilestone[] = [
  {
    enemyType: 'hormagaunt',
    name: 'Hormagaunt Swarm',
    subtitle: 'Bio-Troop Scythe Predator',
    lore: 'Organisma barisan hadapan Hive Fleet yang bergerak secara kawanan besar dengan kuku talons tajam.',
    weakness: 'Kelemahan: Senjata kawasan AoE (Flamer & Grenade) mencetuskan panik kawanan.',
    requiredKills: 80,
    damageBonusPct: 3
  },
  {
    enemyType: 'termagant',
    name: 'Termagant Stalker',
    subtitle: 'Ranged Biomorph Weapon-Spitter',
    lore: 'Membawa Fleshborer hidup yang menembak larva kumbang pemakan daging.',
    weakness: 'Kelemahan: Perisai kitin lemah di bahagian rusuk; rentan tembakan Bolter pantas.',
    requiredKills: 50,
    damageBonusPct: 3
  },
  {
    enemyType: 'genestealer',
    name: 'Genestealer Infiltrator',
    subtitle: 'Shock Vanguard Assailant',
    lore: 'Pemotong perisai ceramite dengan empat lengan dan refleks kilat luar biasa.',
    weakness: 'Kelemahan: Serangan berantai kilat (Thunder Hammer / Arc) merencatkan sistem saraf pantasnya.',
    requiredKills: 40,
    damageBonusPct: 3
  },
  {
    enemyType: 'tyranid_warrior',
    name: 'Tyranid Warrior',
    subtitle: 'Synapse Node Medium Organism',
    lore: 'Penyambung rangkaian Synapse kawanan dengan perisai chitin berlapuk tebal.',
    weakness: 'Kelemahan: Senjata plasma dan melta menembus terus ke teras otak Synapse.',
    requiredKills: 30,
    damageBonusPct: 3
  },
  {
    enemyType: 'lictor',
    name: 'Lictor Feeder',
    subtitle: 'Chameleonic Ambush Stalker',
    lore: 'Pemangsa bersendirian yang menyamar halimunan untuk menyusup ke barisan pertahanan.',
    weakness: 'Kelemahan: Terbuka kepada tembakan kritikal apabila dikesan oleh Radar Auspex.',
    requiredKills: 15,
    damageBonusPct: 3
  },
  {
    enemyType: 'zoanthrope',
    name: 'Zoanthrope Coven',
    subtitle: 'Psychic Warp Nexus',
    lore: 'Otak gergasi terapung yang menyalurkan kuasa Warp berbahaya dan menjana kubah perisai psikik.',
    weakness: 'Kelemahan: Libasan fizikal Power Sword / Chainsword memintas perlindungan perisai Warp.',
    requiredKills: 15,
    damageBonusPct: 3
  },
  {
    enemyType: 'toxicrene',
    name: 'Toxicrene Colossus',
    subtitle: 'Choking Spore Beast',
    lore: 'Raksasa penyembur kabus miasma toksik dengan sesungut gergasi cambuk beracun.',
    weakness: 'Kelemahan: Beg spora di belakangnya meletup ganas apabila dibakar api Promethium.',
    requiredKills: 10,
    damageBonusPct: 3
  },
  {
    enemyType: 'trygon_prime',
    name: 'Trygon Prime',
    subtitle: 'Subterranean Bio-Electric Terror',
    lore: 'Cacing gergasi penggali tanah yang menghasilkan cas bio-elektrik sebelum menerjah permukaan.',
    weakness: 'Kelemahan: Perut bawah tidak terlindung semasa keluar dari lubang terowong.',
    requiredKills: 5,
    damageBonusPct: 5
  },
  {
    enemyType: 'carnifex_boss',
    name: 'Carnifex Hive Behemoth',
    subtitle: 'Living Battering Ram',
    lore: 'Kereta kebal biologi berkulit tebal yang mampu merempuh kubu ferrocrete dengan mudah.',
    weakness: 'Kelemahan: Rentan kepada tembakan penembus berat Lascannon & Melta Annihilator.',
    requiredKills: 5,
    damageBonusPct: 5
  },
  {
    enemyType: 'hive_tyrant',
    name: 'Hive Tyrant Supreme',
    subtitle: 'Apex Synapse Commander',
    lore: 'Komander tertinggi Hive Fleet yang menguasai pedang tulang Bonesword dan kemahiran psikik maut.',
    weakness: 'Kelemahan: Serangan berfokus semasa jeda selepas melancarkan libasan Bonesword Wave.',
    requiredKills: 3,
    damageBonusPct: 5
  }
];

export function loadBestiaryKills(): BestiaryKillsMap {
  try {
    const raw = localStorage.getItem(BESTIARY_KILLS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function saveBestiaryKills(map: BestiaryKillsMap): void {
  try {
    localStorage.setItem(BESTIARY_KILLS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function incrementBestiaryKill(enemyType: EnemyType): void {
  const current = loadBestiaryKills();
  current[enemyType] = (current[enemyType] || 0) + 1;
  saveBestiaryKills(current);
}

const BACKUP_STORAGE_KEYS = [
  'wh40k_sm_highscore_v1',
  'wh40k_sm_purity_seals_v1',
  'wh40k_sm_armory_v1',
  'wh40k_sm_aim_mode_v1',
  'wh40k_sm_game_feel_v1',
  'wh40k_sm_run_history_v1',
  'wh40k_sm_achievements_v1',
  'wh40k_sm_achievements_v1_claimed',
  'wh40k_sm_language_v1',
  CHAPTER_MASTERY_KEY,
  DAILY_COMPLETED_KEY,
  CAREER_STATS_KEY,
  TALENTS_KEY,
  OVERCLOCKS_KEY,
  BESTIARY_KILLS_KEY
] as const;

export function exportCodexSaveJson(): string {
  const keys: Record<string, string | null> = {};
  for (const key of BACKUP_STORAGE_KEYS) {
    try {
      keys[key] = localStorage.getItem(key);
    } catch {
      keys[key] = null;
    }
  }
  const payload = {
    game: 'space-marine-tyranid-hive-purge',
    version: '0.1.8',
    exportedAt: new Date().toISOString(),
    keys
  };
  return JSON.stringify(payload, null, 2);
}

export function importCodexSaveJson(rawJson: string): { ok: boolean; error?: string } {
  try {
    const parsed = JSON.parse(rawJson.trim());
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'Format JSON tidak sah.' };
    }
    const keysObj = parsed.keys;
    if (
      parsed.game !== 'space-marine-tyranid-hive-purge' ||
      !keysObj ||
      typeof keysObj !== 'object'
    ) {
      return { ok: false, error: 'Data sandaran Codex Imperialis tidak dikenali.' };
    }

    let restoredCount = 0;
    for (const allowedKey of BACKUP_STORAGE_KEYS) {
      if (Object.prototype.hasOwnProperty.call(keysObj, allowedKey)) {
        const val = keysObj[allowedKey];
        if (typeof val === 'string') {
          localStorage.setItem(allowedKey, val);
          restoredCount++;
        } else if (val === null) {
          localStorage.removeItem(allowedKey);
        }
      }
    }

    if (restoredCount === 0) {
      return { ok: false, error: 'Tiada rekod simpanan sah ditemui dalam JSON tersebut.' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menghurai JSON. Pastikan teks disalin sepenuhnya.' };
  }
}
