import React, { useState } from 'react';
import { MarineChapter, MapTheme, GameMode, MarineSkin, AimMode, OathId, ChapterMasteryMap } from '../types/game';
import { Shield, MapPin, Check, Play, ArrowLeft, Flame, Crosshair, Skull, ChevronRight, Award, Calendar } from 'lucide-react';
import { sounds } from '../services/audio';
import {
  CHAPTER_DISPLAY_NAMES,
  MAP_DISPLAY_NAMES,
  OATH_DISPLAY_NAMES,
  getChapterMasteryInfo,
  getDailyDirective
} from '../game/metaProgression';

interface ChapterSelectModalProps {
  onStartBattle: (chapter: MarineChapter, mapTheme: MapTheme, mode: GameMode, skin: MarineSkin, oaths: OathId[]) => void;
  onBack: () => void;
  aimMode: AimMode;
  onSelectAimMode: (mode: AimMode) => void;
  screenShakeOn?: boolean;
  onToggleScreenShake?: () => void;
  chapterMastery?: ChapterMasteryMap;
  onStartDailyDirective?: () => void;
  dailyDirectiveCompleted?: boolean;
}

export const ChapterSelectModal: React.FC<ChapterSelectModalProps> = ({
  onStartBattle,
  onBack,
  aimMode,
  onSelectAimMode,
  screenShakeOn = true,
  onToggleScreenShake,
  chapterMastery,
  onStartDailyDirective,
  dailyDirectiveCompleted = false
}) => {
  const [activeTab, setActiveTab] = useState<'chapter' | 'mission'>('chapter');
  const [selectedChapter, setSelectedChapter] = useState<MarineChapter>('ultramarines');
  const [selectedSkin, setSelectedSkin] = useState<MarineSkin>('standard');
  const [selectedMap, setSelectedMap] = useState<MapTheme>('hive_city');
  const [selectedMode, setSelectedMode] = useState<GameMode>('standard');
  const [selectedOaths, setSelectedOaths] = useState<OathId[]>([]);
  const dailyDirective = getDailyDirective();

  const toggleOath = (id: OathId) => {
    sounds.playPurchase();
    setSelectedOaths((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const chapters: {
    id: MarineChapter;
    name: string;
    subname: string;
    color: string;
    borderColor: string;
    badge: string;
    trait: string;
    ultimate: string;
    starterWeapon: string;
    description: string;
    stats: { armor: number; speed: number; firepower: number };
  }[] = [
    {
      id: 'ultramarines',
      name: 'Ultramarines',
      subname: 'Scions of Guilliman',
      color: 'from-blue-600 to-blue-900',
      borderColor: 'border-blue-500',
      badge: 'Ω',
      trait: '+20 HP, -10% Cooldown & +1 Reroll',
      ultimate: '[Q] Orbital Barrage (6 Letupan Orbit)',
      starterWeapon: 'Godwyn Boltgun',
      description: 'Seimbang, tahan lasak, dan mempunyai kuasa tembakan taktikal Codex.',
      stats: { armor: 4, speed: 3, firepower: 4 }
    },
    {
      id: 'blood_angels',
      name: 'Blood Angels',
      subname: 'Sons of Sanguinius',
      color: 'from-red-600 to-red-950',
      borderColor: 'border-red-500',
      badge: '🩸',
      trait: 'Pulih +8 HP / 20 Kill & -30% Dash CD',
      ultimate: '[Q] Sanguinary Slam (Hentaman + Pulih HP)',
      starterWeapon: 'Chainsword Cyclone',
      description: 'Pakar jarak dekat pantas yang menyembuhkan diri setiap kali menghiris Xenos.',
      stats: { armor: 3, speed: 5, firepower: 4 }
    },
    {
      id: 'space_wolves',
      name: 'Space Wolves',
      subname: 'Vlka Fenryka',
      color: 'from-slate-600 to-slate-900',
      borderColor: 'border-amber-500',
      badge: '🐺',
      trait: '+12% Crit, Crit Stun & +50% Ganjaran Elite',
      ultimate: '[Q] Blizzard Howl (Beku 4s + Zeal)',
      starterWeapon: 'Thunder Hammer Smash',
      description: 'Pemburu ganas Fenris dengan serangan kritikal yang memukau gerombolan.',
      stats: { armor: 4, speed: 4, firepower: 4 }
    },
    {
      id: 'dark_angels',
      name: 'Dark Angels',
      subname: 'The First Legion',
      color: 'from-emerald-700 to-green-950',
      borderColor: 'border-emerald-500',
      badge: '⚔️',
      trait: '+25% Saiz & Kerosakan Senjata Plasma',
      ultimate: '[Q] Stasis Rift (Lembah Plasma + Slow)',
      starterWeapon: 'Plasma Cannon',
      description: 'Pakar senjata tenaga purba dengan letupan kawasan (AoE) paling luas.',
      stats: { armor: 4, speed: 3, firepower: 5 }
    },
    {
      id: 'salamanders',
      name: 'Salamanders',
      subname: 'Sons of Vulkan',
      color: 'from-green-600 to-emerald-950',
      borderColor: 'border-orange-500',
      badge: '🔥',
      trait: '+30% DMG Api/Melta & Kebal Asid',
      ultimate: '[Q] Firestorm Eruption (360° Api + Perisai)',
      starterWeapon: 'Heavy Promethium Flamer',
      description: 'Penempa api Nocturne yang membakar gerombolan dan kebal kolam asid.',
      stats: { armor: 5, speed: 3, firepower: 4 }
    },
    {
      id: 'imperial_fists',
      name: 'Imperial Fists',
      subname: 'Praetorians of Dorn',
      color: 'from-amber-400 to-amber-700',
      borderColor: 'border-yellow-400',
      badge: '✊',
      trait: '+35% Kadar Tembakan Bolter & Perisai Awal',
      ultimate: '[Q] Aegis Bastion (Kubu Tenaga + Bolter)',
      starterWeapon: 'Heavy Bolter',
      description: 'Kubu bergerak yang menghujani medan perang dengan peluru Heavy Bolter.',
      stats: { armor: 5, speed: 2, firepower: 5 }
    },
    {
      id: 'iron_hands',
      name: 'Iron Hands',
      subname: 'The Flesh is Weak',
      color: 'from-zinc-700 to-zinc-950',
      borderColor: 'border-cyan-400',
      badge: '⚙️',
      trait: 'Auto-Pulih +3 HP/s & +25 HP Maksimum',
      ultimate: '[Q] Omnissiah EMP (Stun + Pulih +35 HP)',
      starterWeapon: 'Multi-Melta Lance',
      description: 'Pahlawan bionik berteknologi tinggi yang menjana semula HP secara berterusan.',
      stats: { armor: 5, speed: 3, firepower: 4 }
    },
    {
      id: 'raven_guard',
      name: 'Raven Guard',
      subname: 'Sons of Corax',
      color: 'from-slate-800 to-black',
      borderColor: 'border-purple-400',
      badge: '🦅',
      trait: '+20% Kelajuan, +20% Crit & -40% Dash CD',
      ultimate: '[Q] Shadow Strike (Serangan Hendap Kritikal)',
      starterWeapon: 'Lascannon Beam',
      description: 'Pembunuh bayang-bayang paling tangkas dengan pancaran penembus Lascannon.',
      stats: { armor: 2, speed: 5, firepower: 5 }
    }
  ];

  const skins: {
    id: MarineSkin;
    name: string;
    desc: string;
    accent: string;
  }[] = [
    {
      id: 'standard',
      name: 'Standard Armor',
      desc: 'Warna rasmi kebanggaan Chapter',
      accent: 'border-blue-500'
    },
    {
      id: 'veteran_gold',
      name: 'Veteran Macragge',
      desc: 'Hiasan emas laurel kemenangan Imperial',
      accent: 'border-yellow-400'
    },
    {
      id: 'deathwatch',
      name: 'Inquisitorial Deathwatch',
      desc: 'Perisai hitam legam & lengan perak xenos-hunter',
      accent: 'border-slate-300'
    },
    {
      id: 'sanguinary_guard',
      name: 'Sanguinary Relic Armor',
      desc: 'Perisai emas peninggalan suci berkilau',
      accent: 'border-amber-400'
    }
  ];

  const modes: {
    id: GameMode;
    name: string;
    desc: string;
    badge: string;
  }[] = [
    {
      id: 'standard',
      name: 'Standard Crusade (06:00)',
      desc: 'Countdown 6 minit padat! Hadapi Carnifex & Hive Tyrant sebelum Thunderhawk tiba.',
      badge: '🛡️ COUNTDOWN 6M'
    },
    {
      id: 'endless',
      name: 'Endless Hive Purge',
      desc: 'Tiada had masa! Tyranid berganda tanpa henti dengan varian Mutated Elite.',
      badge: '⚡ ENDLESS'
    },
    {
      id: 'boss_rush',
      name: 'Boss Rush Arena (04:00)',
      desc: 'Countdown 4 minit! Lawan Carnifex, Zoanthrope Coven & Hive Tyrant bertubi-tubi (3x Seals).',
      badge: '💀 BOSS RUSH 4M'
    },
    {
      id: 'firing_range',
      name: 'Tactical Firing Range',
      desc: 'Mod latihan bebas! Uji semua senjata, evolusi & DPS ke atas Carnifex Dummy.',
      badge: '🎯 SANDBOX'
    }
  ];

  const oathsList: {
    id: OathId;
    name: string;
    desc: string;
    bonus: string;
    pct: number;
  }[] = [
    {
      id: 'oath_fury',
      name: 'Oath of Fury',
      desc: 'Kelajuan & Kerosakan Musuh +35%',
      bonus: '+40% Seals',
      pct: 40
    },
    {
      id: 'oath_vanguard',
      name: 'Oath of the Vanguard',
      desc: 'Tiada Perisai Iron Halo (HP Sahaja)',
      bonus: '+50% Seals',
      pct: 50
    },
    {
      id: 'oath_penance',
      name: 'Oath of Penance',
      desc: 'Had Maksimum 4 Slot Senjata Sahaja',
      bonus: '+60% Seals',
      pct: 60
    }
  ];

  const maps: {
    id: MapTheme;
    name: string;
    desc: string;
    accent: string;
  }[] = [
    {
      id: 'hive_city',
      name: 'Imperial Hive City',
      desc: 'Jalanan batu gothic runtuh dan sisa katedral purba Imperium.',
      accent: 'border-amber-500/70'
    },
    {
      id: 'space_hulk',
      name: 'Space Hulk Derelict',
      desc: 'Koridor besi berkarat dengan plat geladak logam dan laluan sempit.',
      accent: 'border-cyan-500/70'
    },
    {
      id: 'bio_chasm',
      name: 'Tyranid Bio-Chasm',
      desc: 'Medan alien berlendir asid ungu di mana musuh bergerak lebih agresif.',
      accent: 'border-purple-500/70'
    },
    {
      id: 'mechanicus_forge',
      name: 'Mechanicus Forge Complex',
      desc: 'Kompleks tempaan Mars merah menyala dengan parit magma promethium, Pylon EMP & banyak Mars Tech-Shrine.',
      accent: 'border-rose-500/70'
    },
    {
      id: 'strike_cruiser',
      name: 'Space Marine Strike Cruiser',
      desc: 'Geladak kapal tempur Astartes dengan kubu bulkhead perisai berat & konsol pertahanan Point-Defense Turret.',
      accent: 'border-indigo-500/70'
    }
  ];

  const activeChapterObj = chapters.find((c) => c.id === selectedChapter) || chapters[0];
  const activeModeObj = modes.find((m) => m.id === selectedMode) || modes[0];
  const activeMapObj = maps.find((m) => m.id === selectedMap) || maps[0];
  const totalOathBonusPct = oathsList
    .filter((o) => selectedOaths.includes(o.id))
    .reduce((acc, o) => acc + o.pct, 0);

  const handleStart = () => {
    sounds.playBolter();
    onStartBattle(selectedChapter, selectedMap, selectedMode, selectedSkin, selectedOaths);
  };

  const renderStatDots = (value: number, colorClass: string) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`w-2 h-1.5 rounded-xs ${n <= value ? colorClass : 'bg-slate-800'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between safe-p sm:p-5 select-none overflow-hidden">
      {/* Top Header & Step Tabs */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <div className="text-center">
            <h2 className="font-gothic text-lg sm:text-2xl font-black text-amber-400 uppercase tracking-widest">
              Persiapan Operasi
            </h2>
          </div>

          <div className="w-20 hidden sm:block" />
        </div>

        {/* 2-Tab Stepper Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('chapter');
              sounds.playPurchase();
            }}
            className={`py-2 px-3 rounded-lg font-gothic font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'chapter'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>1. Pilih Chapter & Perisai</span>
            <span className="px-1.5 py-0.5 rounded bg-black/20 font-mono text-[10px]">
              {activeChapterObj.badge} {activeChapterObj.name}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('mission');
              sounds.playPurchase();
            }}
            className={`py-2 px-3 rounded-lg font-gothic font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'mission'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>2. Misi, Peta & Kontrak</span>
            <span className="px-1.5 py-0.5 rounded bg-black/20 font-mono text-[10px] hidden sm:inline">
              {activeModeObj.name.split(' ')[0]} · {activeMapObj.name.split(' ')[1]}
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable Main Content Area */}
      <div className="w-full max-w-5xl mx-auto flex-1 overflow-y-auto my-3 pr-1 space-y-3">
        {/* Daily Imperial Directive Quick-Launch Banner */}
        {onStartDailyDirective && (
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900/95 to-rose-950/70 border border-amber-500/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-md">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/70 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-gothic font-black text-xs sm:text-sm text-amber-300 tracking-wider uppercase">
                    {dailyDirective.codeName} ({dailyDirective.dateKey})
                  </span>
                  {dailyDirectiveCompleted ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/70 text-[10px] font-mono font-bold text-emerald-300">
                      ✓ Selesai Hari Ini
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-300 text-[10px] font-mono font-bold text-yellow-200 animate-pulse">
                      +{dailyDirective.bonusSeals} Bonus Seals!
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] font-mono text-slate-300 mt-0.5">
                  Chapter: <strong className="text-amber-200">{CHAPTER_DISPLAY_NAMES[dailyDirective.chapter]}</strong> · Peta:{' '}
                  <strong className="text-cyan-300">{MAP_DISPLAY_NAMES[dailyDirective.mapTheme]}</strong> · Kontrak:{' '}
                  <strong className="text-rose-300">{OATH_DISPLAY_NAMES[dailyDirective.oath]}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playBolter();
                onStartDailyDirective();
              }}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-gothic font-black text-xs tracking-wider uppercase transition-all cursor-pointer shrink-0 shadow-[0_0_14px_rgba(245,158,11,0.35)] flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{dailyDirectiveCompleted ? 'Main Semula Harian' : 'Mula Operasi Harian'}</span>
            </button>
          </div>
        )}

        {activeTab === 'chapter' ? (
          <>
            {/* 8 Chapters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {chapters.map((ch) => {
                const isSelected = selectedChapter === ch.id;
                const mastery = getChapterMasteryInfo(chapterMastery?.[ch.id] || 0);
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setSelectedChapter(ch.id);
                      sounds.playPurchase();
                    }}
                    className={`rounded-xl p-3 border-2 transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${ch.borderColor} bg-slate-900 shadow-[0_0_18px_rgba(245,158,11,0.25)]`
                        : 'border-slate-800 bg-slate-950/75 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-b ${ch.color} border border-white/20 flex items-center justify-center text-lg font-gothic font-bold text-white shadow-md shrink-0`}>
                            {ch.badge}
                          </div>
                          <div>
                            <h3 className="font-gothic font-bold text-sm text-slate-100 leading-tight">
                              {ch.name}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {ch.subname}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 stroke-[3] shrink-0" />}
                      </div>

                      {/* Chapter Mastery Rank Badge & XP Bar */}
                      <div className="bg-slate-950/90 border border-amber-500/30 rounded-lg px-2 py-1.5 mb-2">
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className="text-amber-300 font-bold flex items-center gap-1">
                            <Award className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>{mastery.rankTitle}</span>
                          </span>
                          <span className="text-slate-400 tabular-nums">
                            {mastery.nextThreshold ? `${mastery.xp}/${mastery.nextThreshold} XP` : `${mastery.xp} XP (MAX)`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all"
                            style={{ width: `${mastery.progressPct}%` }}
                          />
                        </div>
                        {mastery.rankIndex > 0 && (
                          <div className="text-[8px] font-mono text-emerald-300 mt-1 truncate">
                            Bonus Pangkat: +{mastery.bonuses.hpBonus} HP · +{mastery.bonuses.damageBonusPct}% DMG · +{Math.round(mastery.bonuses.critBonus * 100)}% Crit
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug mb-2">
                        {ch.description}
                      </p>

                      {/* Mini Stat Bars */}
                      <div className="grid grid-cols-3 gap-1 bg-slate-950/80 border border-slate-800/80 rounded-lg p-1.5 mb-2 text-[9px] font-mono text-slate-400">
                        <div className="flex flex-col gap-0.5">
                          <span>KEBAL</span>
                          {renderStatDots(ch.stats.armor, 'bg-cyan-400')}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span>PANTAS</span>
                          {renderStatDots(ch.stats.speed, 'bg-emerald-400')}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span>KUASA</span>
                          {renderStatDots(ch.stats.firepower, 'bg-amber-400')}
                        </div>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800/90 flex flex-col gap-0.5 text-[10px] font-mono">
                      <div className="text-amber-300 font-bold truncate" title={ch.trait}>
                        ⚡ {ch.trait}
                      </div>
                      <div className="text-purple-300 font-bold truncate" title={ch.ultimate}>
                        🔥 {ch.ultimate}
                      </div>
                      <div className="text-cyan-400 truncate">
                        🎯 Mula: {ch.starterWeapon}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Armor Cosmetic Skin Selector */}
            <div className="bg-slate-900/85 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="font-bold tracking-wider uppercase">Gaya Perisai (Cosmetic Skin)</span>
                </div>
                <button
                  onClick={() => setActiveTab('mission')}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold"
                >
                  <span>Langkah 2: Misi & Peta</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {skins.map((sk) => {
                  const isSkinSelected = selectedSkin === sk.id;
                  return (
                    <button
                      key={sk.id}
                      onClick={() => {
                        setSelectedSkin(sk.id);
                        sounds.playPurchase();
                      }}
                      className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSkinSelected
                          ? `${sk.accent} bg-slate-850 ring-1 ring-amber-400/50 shadow-md`
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-gothic font-bold text-slate-200">
                        <span className="truncate">{sk.name}</span>
                        {isSkinSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">
                        {sk.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Game Mode Selection */}
            <div className="bg-slate-900/85 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Flame className="w-4 h-4 text-rose-500" />
                <span className="font-bold tracking-wider uppercase">Mod Permainan (Game Mode)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {modes.map((md) => {
                  const isModeSelected = selectedMode === md.id;
                  return (
                    <button
                      key={md.id}
                      onClick={() => {
                        setSelectedMode(md.id);
                        sounds.playPurchase();
                      }}
                      className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                        isModeSelected
                          ? 'border-rose-500 bg-slate-850 ring-1 ring-rose-400/50 shadow-md'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-[9px] font-mono font-bold text-rose-400 mb-0.5">
                          {md.badge}
                        </div>
                        <div className="font-gothic font-bold text-xs text-slate-100">
                          {md.name}
                        </div>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 leading-snug">
                        {md.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map Theme Selection */}
            <div className="bg-slate-900/85 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="font-bold tracking-wider uppercase">Zon Operasi Medan Tempur (Peta)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {maps.map((m) => {
                  const isMapSelected = selectedMap === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMap(m.id);
                        sounds.playPurchase();
                      }}
                      className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isMapSelected
                          ? `${m.accent} bg-slate-850 shadow-md ring-1 ring-amber-400/40`
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-gothic font-bold text-xs text-slate-200">
                          {m.name}
                        </span>
                        {isMapSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 leading-normal">
                        {m.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Oaths of Moment (Challenge Contracts) */}
            <div className="bg-slate-900/85 border border-amber-500/40 rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                  <Skull className="w-4 h-4 text-amber-400" />
                  <span className="font-bold tracking-wider uppercase">Oaths of Moment (Kontrak Cabaran Pilihan)</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  Bonus Seals: +{totalOathBonusPct}%
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {oathsList.map((oath) => {
                  const isActive = selectedOaths.includes(oath.id);
                  return (
                    <button
                      key={oath.id}
                      onClick={() => toggleOath(oath.id)}
                      className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'border-amber-400 bg-amber-950/50 ring-1 ring-amber-400/50 shadow-md'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-gothic font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <span>{oath.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">({oath.bonus})</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{oath.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isActive ? 'bg-amber-400 border-amber-300 text-slate-950' : 'border-slate-600'}`}>
                        {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control Scheme & Screen Shake Selection */}
            <div className="bg-slate-900/85 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Crosshair className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold tracking-wider uppercase block">Mod Kawalan & Gegaran Skrin</span>
                  <span className="text-[10px] text-slate-400">Sesuaikan kawalan dan kesan gegaran sebelum berlepas</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => {
                    onSelectAimMode('auto');
                    sounds.playPurchase();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                    aimMode === 'auto'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  ⌨️ Auto-Aim
                </button>
                <button
                  onClick={() => {
                    onSelectAimMode('hybrid');
                    sounds.playPurchase();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                    aimMode === 'hybrid'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🖱️ Hybrid
                </button>
                <button
                  onClick={() => {
                    onSelectAimMode('manual');
                    sounds.playPurchase();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                    aimMode === 'manual'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🎯 Pointer Penuh
                </button>
                {onToggleScreenShake && (
                  <button
                    onClick={() => {
                      onToggleScreenShake();
                      sounds.playPurchase();
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      screenShakeOn
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                        : 'border-slate-700 bg-slate-950/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {screenShakeOn ? '💥 Gegaran: ON' : '🚫 Gegaran: OFF'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Summary & Launch Bar */}
      <div className="w-full max-w-5xl mx-auto pt-2.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold">
            {activeChapterObj.badge} {activeChapterObj.name}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-rose-300">
            {activeModeObj.name}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 hidden md:inline">
            {activeMapObj.name}
          </span>
          {selectedOaths.length > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/60 text-emerald-300 font-bold">
              💀 {selectedOaths.length} Oath (+{totalOathBonusPct}% Seals)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'chapter' && (
            <button
              onClick={() => {
                setActiveTab('mission');
                sounds.playPurchase();
              }}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Tetapan Misi ➔
            </button>
          )}
          <button
            onClick={handleStart}
            className="flex-1 sm:w-64 flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-gothic font-black text-sm sm:text-base tracking-wider uppercase transition-all duration-150 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Lancar Serangan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
