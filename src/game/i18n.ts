import { GameLanguage, MarineChapter, MapTheme, OathId } from '../types/game';

export const LANGUAGE_KEY = 'wh40k_sm_language_v1';

export function loadSavedLanguage(): GameLanguage {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'ms') return saved;
  } catch {
    // ignore
  }
  return 'ms'; // Default to Bahasa Melayu
}

export function saveLanguage(lang: GameLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export const TRANSLATIONS: Record<GameLanguage, Record<string, string>> = {
  ms: {
    // Navigation / Common
    back: 'Kembali',
    close: 'Tutup',
    start: 'Lancarkan Operasi [MULA]',
    resume: 'Sambung',
    pause: 'Jeda',
    restart: 'Mula Semula',
    home: 'Pangkalan',
    confirm: 'Sahkan',
    cancel: 'Batal',
    settings: 'Tetapan',
    armory: 'Armory',
    codex: 'Codex',
    achievements: 'Pingat',
    backup: 'Sandaran',
    career: 'Kerjaya',
    language: 'Bahasa',
    
    // Title Screen
    subtitle: 'Tyranid Hive Purge',
    heroDesc: 'Pilih daripada 8 Chapter Space Marine, gabungkan evolusi senjata legenda, musnahkan struktur sarang Xenos, dan bertahan sehingga Thunderhawk tiba!',
    controlsPC: '💻 PC: WASD + [SPACE] Dash + [Q] Ultimate + [F] Overdrive',
    controlsMobile: '📱 Mobile: Kayu Ria Sentuh + Butang Aksi Kanan (Fury/Ult/Dash)',
    
    // Operation Select
    prepTitle: 'Persiapan Operasi',
    step1: '1. Pilih Chapter & Perisai',
    step2: '2. Misi, Peta & Kontrak',
    launchAttack: 'Lancar Serangan',
    dailyOperation: 'Operasi Harian',
    dailyCompleted: '✓ Selesai Hari Ini',
    dailyBonus: '+100 Bonus Seals!',

    // HUD
    level: 'TAHAP',
    extraction: 'EKSTRAKSI',
    furyReady: 'FURY SEDIA [F]!',
    overdriveActive: 'TACTICAL OVERDRIVE',
    dreadnought: 'DREADNOUGHT',
    streak: 'STREAK',
    emperorZeal: "EMPEROR'S ZEAL",

    // Talents
    sacredTalents: 'Pohon Bakat Astartes',
    talentsDesc: 'Gunakan Purity Seals untuk membuka doktrin tempur purba.',
    doctrineMacragge: 'Doktrin Macragge (Pertahanan)',
    doctrineBaal: 'Doktrin Baal (Kelajuan & Serangan)',
    doctrineNocturne: 'Doktrin Nocturne (Kawasan & Api)',
    keystonePerk: 'Bakat Mercu Tanda',

    // Overclocks
    overclockTitle: 'Archeotech Overclock',
    overclockDesc: 'Suntik pengubahsuaian Archeotech ke atas senjata legenda.',

    // Mutators
    mutatorAlert: 'AMARAN MUTASI SARANG',
    hardenedChitin: 'Hardened Chitin (+35% Perisai Fizikal Musuh)',
    adrenalSurge: 'Adrenal Surge (+25% Kelajuan Kawanan Musuh)',
    sporeEclipse: 'Spore Eclipse (Kabus Gelap - Lampu Suluh Diaktifkan)',

    // Bestiary
    bestiaryTitle: 'Bedah Siasat & Anatomi Xenos',
    bestiarySubtitle: 'Kaji corak biologi Tyranid untuk membuka titik kelemahan.',
    weaknessUnlocked: 'Titik Kelemahan Terbuka (+3% Kerosakan)',
    killsNeeded: 'Bunuhan diperlukan:'
  },
  en: {
    // Navigation / Common
    back: 'Back',
    close: 'Close',
    start: 'Launch Operation [START]',
    resume: 'Resume',
    pause: 'Pause',
    restart: 'Restart',
    home: 'Home Base',
    confirm: 'Confirm',
    cancel: 'Cancel',
    settings: 'Settings',
    armory: 'Armory',
    codex: 'Codex',
    achievements: 'Honours',
    backup: 'Backup',
    career: 'Career',
    language: 'Language',

    // Title Screen
    subtitle: 'Tyranid Hive Purge',
    heroDesc: 'Select from 8 Space Marine Chapters, forge legendary weapon evolutions, purge the Xenos hive, and hold until Thunderhawk extraction arrives!',
    controlsPC: '💻 PC: WASD + [SPACE] Dash + [Q] Ultimate + [F] Overdrive',
    controlsMobile: '📱 Mobile: Touch Joystick + Right Action Cluster (Fury/Ult/Dash)',

    // Operation Select
    prepTitle: 'Operation Briefing',
    step1: '1. Chapter & Armor',
    step2: '2. Mission, Map & Oaths',
    launchAttack: 'Deploy Squad',
    dailyOperation: 'Daily Directive',
    dailyCompleted: '✓ Completed Today',
    dailyBonus: '+100 Bonus Seals!',

    // HUD
    level: 'LEVEL',
    extraction: 'EXTRACTION',
    furyReady: 'FURY READY [F]!',
    overdriveActive: 'TACTICAL OVERDRIVE',
    dreadnought: 'DREADNOUGHT',
    streak: 'PURGE STREAK',
    emperorZeal: "EMPEROR'S ZEAL",

    // Talents
    sacredTalents: 'Sacred Codex Talents',
    talentsDesc: 'Invest Purity Seals into ancestral combat doctrines of the Legions.',
    doctrineMacragge: 'Macragge Doctrine (Defense)',
    doctrineBaal: 'Baal Doctrine (Speed & Crit)',
    doctrineNocturne: 'Nocturne Doctrine (AoE & Flame)',
    keystonePerk: 'Keystone Mastery',

    // Overclocks
    overclockTitle: 'Archeotech Overclocks',
    overclockDesc: 'Socket Archeotech augmentations into evolved weaponry.',

    // Mutators
    mutatorAlert: 'HIVE MUTATION DETECTED',
    hardenedChitin: 'Hardened Chitin (+35% Physical Armor)',
    adrenalSurge: 'Adrenal Surge (+25% Swarm Movement Speed)',
    sporeEclipse: 'Spore Eclipse (Darkness Zone - Armor Searchlight Engaged)',

    // Bestiary
    bestiaryTitle: 'Xenos Autopsy & Lore',
    bestiarySubtitle: 'Study Tyranid biology to exploit critical biomorph weaknesses.',
    weaknessUnlocked: 'Weakness Exploited (+3% Damage)',
    killsNeeded: 'Purges required:'
  }
};

export function t(key: string, lang: GameLanguage = 'ms'): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['ms'][key] || key;
}

export const MAP_NAMES_EN: Record<MapTheme, string> = {
  hive_city: 'Imperial Hive Ruin',
  space_hulk: 'Derelict Space Hulk',
  bio_chasm: 'Tyranid Bio-Chasm',
  mechanicus_forge: 'Mechanicus Forge Complex',
  strike_cruiser: 'Space Marine Strike Cruiser'
};

export const MAP_NAMES_MS: Record<MapTheme, string> = {
  hive_city: 'Imperial Hive City',
  space_hulk: 'Space Hulk Derelict',
  bio_chasm: 'Tyranid Bio-Chasm',
  mechanicus_forge: 'Mechanicus Forge Complex',
  strike_cruiser: 'Kapal Tempur Strike Cruiser'
};
