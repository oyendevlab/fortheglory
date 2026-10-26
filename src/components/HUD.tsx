import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Shield, Heart, Skull, Clock, Flame, Zap, Crosshair, Radar, Target, Maximize2, Minimize2, Bolt } from 'lucide-react';
import { WeaponConfig, PassiveConfig, WeaponId, PassiveId, AimMode, CombatTrial, DynamicHiveEvent, MinimapBlip, MarineChapter, ActiveBossInfo, ExtractionZoneInfo, WargearRelicId, OathId, GameMode, HiveMutatorInfo } from '../types/game';
import { WEAPON_EVOLUTIONS, WARGEAR_RELICS } from '../game/upgrades';

interface HUDProps {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  xp: number;
  xpNeeded: number;
  level: number;
  time: number;
  remainingTime?: number;
  maxGameTime?: number;
  kills: number;
  weapons: Record<WeaponId, WeaponConfig>;
  passives: Record<PassiveId, PassiveConfig>;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  streakCount?: number;
  streakTimerPct?: number;
  isZealActive?: boolean;
  dashCooldownPct?: number;
  ultimateCooldownPct?: number;
  onTriggerUltimate?: () => void;
  furyPct?: number;
  overdrivePct?: number;
  onTriggerOverdrive?: () => void;
  chapter?: MarineChapter;
  dreadnoughtTimerPct?: number;
  activeTrial?: CombatTrial | null;
  activeHiveEvent?: DynamicHiveEvent | null;
  minimapBlips?: MinimapBlip[];
  isBgmActive?: boolean;
  onToggleBgm?: () => void;
  aimMode?: AimMode;
  onCycleAimMode?: () => void;
  activeBosses?: ActiveBossInfo[];
  extractionZone?: ExtractionZoneInfo | null;
  activeRelics?: WargearRelicId[];
  activeOaths?: OathId[];
  gameMode?: GameMode;
  onFiringRangeLevelUp?: () => void;
  onFiringRangeWave?: () => void;
  screenShakeOn?: boolean;
  onToggleScreenShake?: () => void;
  activeMutator?: HiveMutatorInfo | null;
}

export const HUD: React.FC<HUDProps> = ({
  hp,
  maxHp,
  shield,
  maxShield,
  xp,
  xpNeeded,
  level,
  time,
  remainingTime = 360,
  maxGameTime = 360,
  kills,
  weapons,
  passives,
  isMuted,
  onToggleMute,
  onPause,
  streakCount = 0,
  streakTimerPct = 0,
  isZealActive = false,
  dashCooldownPct = 0,
  ultimateCooldownPct = 0,
  onTriggerUltimate,
  furyPct = 0,
  overdrivePct = 0,
  onTriggerOverdrive,
  chapter = 'ultramarines',
  dreadnoughtTimerPct = 0,
  activeTrial = null,
  activeHiveEvent = null,
  minimapBlips = [],
  isBgmActive = false,
  onToggleBgm,
  aimMode = 'hybrid',
  onCycleAimMode,
  activeBosses = [],
  extractionZone = null,
  activeRelics = [],
  activeOaths = [],
  gameMode = 'standard',
  onFiringRangeLevelUp,
  onFiringRangeWave,
  screenShakeOn = true,
  onToggleScreenShake,
  activeMutator = null
}) => {
  const [isRadarExpanded, setIsRadarExpanded] = useState(false);

  const isCountdown = maxGameTime > 0;
  const displaySec = isCountdown ? Math.max(0, remainingTime) : time;
  const minutes = Math.floor(displaySec / 60);
  const seconds = displaySec % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const ultimateNames: Record<MarineChapter, string> = {
    ultramarines: 'ORBITAL BARRAGE',
    blood_angels: 'SANGUINARY SLAM',
    space_wolves: 'BLIZZARD HOWL',
    dark_angels: 'STASIS RIFT',
    salamanders: 'FIRESTORM ERUPTION',
    imperial_fists: 'AEGIS BASTION',
    iron_hands: 'EMP OVERCHARGE',
    raven_guard: 'SHADOW STRIKE'
  };

  const xpPercent = Math.min(100, Math.max(0, (xp / xpNeeded) * 100));
  const hpPercent = Math.min(100, Math.max(0, (hp / maxHp) * 100));
  const shieldPercent = maxShield > 0 ? Math.min(100, Math.max(0, (shield / maxShield) * 100)) : 0;

  const activeWeapons = Object.values(weapons).filter((w) => w.level > 0);
  const activePassives = Object.values(passives).filter((p) => p.level > 0);
  const maxWeaponSlots = activeOaths.includes('oath_penance') ? 4 : 6;
  const emptyWeaponCount = Math.max(0, maxWeaponSlots - activeWeapons.length);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between safe-p select-none">
      {/* Top Section */}
      <div className="w-full flex flex-col gap-1.5">
        {/* XP Progress Bar with Level Badge */}
        <div className="relative w-full h-3.5 bg-slate-950/90 border border-slate-700/80 rounded-full overflow-hidden shadow-md">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 transition-all duration-150 ease-out"
            style={{ width: `${xpPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2.5 text-[9px] font-mono font-bold text-white drop-shadow">
            <span>TAHAP {level}</span>
            <span>XP {xp} / {xpNeeded}</span>
          </div>
        </div>

        {/* Unified Top Tactical Strip */}
        <div className="flex items-start justify-between gap-2">
          {/* Left: Health, Shield & Loadout Slots */}
          <div className="flex flex-col gap-1.5 bg-slate-950/80 border border-slate-800/90 rounded-xl p-2 backdrop-blur-xs shadow-lg">
            {/* Health Bar */}
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
              <div className="w-28 sm:w-36 h-3 bg-slate-900 border border-slate-700 rounded overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-emerald-500 transition-all duration-150"
                  style={{ width: `${hpPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white drop-shadow tabular-nums">
                  {hp}/{maxHp}
                </span>
              </div>
            </div>

            {/* Shield Bar (if active) */}
            {maxShield > 0 && (
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/30 shrink-0" />
                <div className="w-28 sm:w-36 h-2.5 bg-slate-900 border border-cyan-800 rounded overflow-hidden relative">
                  <div
                    className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-150"
                    style={{ width: `${shieldPercent}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-slate-950 tabular-nums">
                    {shield}/{maxShield}
                  </span>
                </div>
              </div>
            )}

            {/* Tactical Overdrive / Fury of the Astartes Meter */}
            <div
              onClick={() => {
                if (furyPct >= 1 && overdrivePct <= 0 && onTriggerOverdrive) {
                  onTriggerOverdrive();
                }
              }}
              className={`flex items-center gap-1.5 ${
                furyPct >= 1 && overdrivePct <= 0 ? 'pointer-events-auto cursor-pointer' : ''
              }`}
              title={
                overdrivePct > 0
                  ? 'Tactical Overdrive Aktif! (2x Kadar Tembakan & +20% Kelajuan)'
                  : furyPct >= 1
                  ? 'Fury Penuh! Tekan [F] atau klik untuk aktifkan Tactical Overdrive'
                  : 'Meter Fury of the Astartes (Penuhkan dengan membunuh Xenos & kutip XP)'
              }
            >
              <Bolt
                className={`w-3.5 h-3.5 shrink-0 ${
                  overdrivePct > 0
                    ? 'text-cyan-300 fill-cyan-300 animate-spin'
                    : furyPct >= 1
                    ? 'text-yellow-300 fill-yellow-300 animate-pulse'
                    : 'text-amber-400/80'
                }`}
              />
              <div
                className={`w-28 sm:w-36 h-2.5 bg-slate-900 rounded overflow-hidden relative border ${
                  overdrivePct > 0
                    ? 'border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.7)]'
                    : furyPct >= 1
                    ? 'border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.65)] animate-pulse'
                    : 'border-amber-800/80'
                }`}
              >
                <div
                  className={`h-full transition-all duration-100 ${
                    overdrivePct > 0
                      ? 'bg-gradient-to-r from-cyan-400 via-amber-300 to-yellow-200'
                      : furyPct >= 1
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-300'
                      : 'bg-gradient-to-r from-amber-700 to-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (overdrivePct > 0 ? overdrivePct : furyPct) * 100))}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-black text-white drop-shadow tabular-nums">
                  {overdrivePct > 0
                    ? `OVERDRIVE ${Math.ceil(overdrivePct * 6)}s`
                    : furyPct >= 1
                    ? 'FURY SEDIA [F]!'
                    : `FURY ${Math.floor(furyPct * 100)}%`}
                </span>
              </div>
            </div>

            {/* Weapon & Passive Visual Slot Grid */}
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {activeWeapons.map((w) => {
                const tagMap: Record<string, string> = {
                  bolter: 'BOL',
                  heavy_bolter: 'HVY',
                  lascannon: 'LAS',
                  orbiting_shield: 'SHD',
                  vortex_grenade: 'VTX',
                  thunder_hammer: 'HAM',
                  plasma_cannon: 'PLA',
                  chainsword_orbit: 'CHN',
                  frag_grenade: 'GRN',
                  heavy_flamer: 'FLM',
                  melta_lance: 'MLT',
                  power_sword: 'SWD',
                  assault_cannon: 'ASC',
                  cyclone_missile: 'CYC'
                };
                const tag = tagMap[w.id] || w.id.slice(0, 3).toUpperCase();
                const evoInfo = WEAPON_EVOLUTIONS[w.id];
                const isEvoReady = !w.isEvolved && w.level >= 5 && evoInfo && (passives[evoInfo.passive]?.level || 0) > 0;

                return (
                  <div
                    key={w.id}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex flex-col items-center justify-center relative shadow-xs ${
                      w.isEvolved
                        ? 'bg-amber-950/95 border-2 border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                        : isEvoReady
                        ? 'bg-emerald-950/90 border-2 border-emerald-400 animate-pulse'
                        : 'bg-slate-900 border border-amber-500/80'
                    }`}
                    title={
                      w.isEvolved
                        ? `${evoInfo?.name || w.name} (EVOLVED)`
                        : isEvoReady
                        ? `${w.name} (SEDIA UNTUK EVOLUSI!)`
                        : `${w.name} (Tahap ${w.level})`
                    }
                  >
                    <span className={`font-mono text-[9px] font-bold uppercase leading-none ${w.isEvolved ? 'text-yellow-200' : 'text-amber-300'}`}>
                      {tag}
                    </span>
                    {w.isEvolved ? (
                      <span className="text-[7px] font-mono font-black text-yellow-300 leading-none mt-0.5">
                        EVO
                      </span>
                    ) : isEvoReady ? (
                      <span className="text-[7px] font-mono font-black text-emerald-300 leading-none mt-0.5">
                        RDY
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono font-bold text-amber-400 leading-none">
                        {'★'.repeat(w.level)}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Empty Weapon Slots */}
              {Array.from({ length: emptyWeaponCount }).map((_, i) => (
                <div
                  key={`empty-w-${i}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-dashed border-slate-700/70 bg-slate-900/40 flex items-center justify-center text-[8px] font-mono text-slate-600"
                  title="Slot Senjata Kosong"
                >
                  +
                </div>
              ))}
            </div>

            {/* Active Passives & Relics Row */}
            {(activePassives.length > 0 || activeRelics.length > 0 || activeOaths.length > 0) && (
              <div className="flex flex-wrap items-center gap-1">
                {activePassives.map((p) => {
                  const tagMap: Record<string, string> = {
                    iron_halo: 'HALO',
                    purity_seals: 'SEAL',
                    auspex_scanner: 'SCAN',
                    tactical_doctrine: 'DOCT',
                    adamantine_plate: 'PLAT',
                    emperor_wrath: 'ZEAL'
                  };
                  const tag = tagMap[p.id] || p.id.slice(0, 4).toUpperCase();
                  return (
                    <div
                      key={p.id}
                      className="px-1.5 py-0.5 bg-slate-900 border border-cyan-500/70 rounded flex items-center gap-1"
                      title={`${p.name} (Tahap ${p.level})`}
                    >
                      <span className="font-mono text-[8px] text-cyan-300 font-bold uppercase leading-none">
                        {tag}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-cyan-400 leading-none">
                        L{p.level}
                      </span>
                    </div>
                  );
                })}
                {activeRelics.map((rid) => {
                  const relic = WARGEAR_RELICS[rid];
                  if (!relic) return null;
                  return (
                    <div
                      key={rid}
                      className="px-1.5 py-0.5 rounded bg-purple-950/90 border border-purple-400 text-[9px] font-mono font-bold text-purple-200"
                      title={`${relic.name}: ${relic.desc}`}
                    >
                      {relic.icon}
                    </div>
                  );
                })}
                {activeOaths.length > 0 && (
                  <div
                    className="px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-400 text-[9px] font-mono font-bold text-rose-200"
                    title={`Oaths of Moment Aktif (${activeOaths.length})`}
                  >
                    💀{activeOaths.length}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center: Countdown Timer & Kills Pill */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-950/85 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-xs">
            <div className="flex flex-col items-center">
              <span className="text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-amber-400/90 leading-none mb-0.5">
                {gameMode === 'firing_range' ? 'MOD UJIAN' : isCountdown ? 'EKSTRAKSI' : 'ENDLESS'}
              </span>
              <div className="flex items-center gap-1">
                <Clock className={`w-3.5 h-3.5 ${isCountdown && displaySec <= 60 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                <span className={`font-mono text-base sm:text-xl font-bold tracking-wider tabular-nums ${isCountdown && displaySec <= 60 ? 'text-rose-300' : 'text-slate-100'}`}>
                  {timeFormatted}
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-purple-400/90 leading-none mb-0.5">
                XENOS
              </span>
              <div className="flex items-center gap-1">
                <Skull className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono text-base sm:text-xl font-bold tracking-wider text-purple-300 tabular-nums">
                  {kills}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Audio, Pause & Tap-to-Expand Auspex Radar */}
          <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-1.5">
              {onToggleScreenShake && (
                <button
                  onClick={onToggleScreenShake}
                  className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    screenShakeOn
                      ? 'bg-slate-900/90 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-900/90 border-slate-700 text-slate-400'
                  }`}
                  title={screenShakeOn ? 'Gegaran Skrin: ON' : 'Gegaran Skrin: OFF'}
                >
                  {screenShakeOn ? '💥' : '🚫'}
                </button>
              )}
              {onToggleBgm && (
                <button
                  onClick={onToggleBgm}
                  className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                  title={isBgmActive ? 'Matikan BGM' : 'Aktifkan BGM'}
                >
                  {isBgmActive ? '🎵' : '🔇'}
                </button>
              )}
              <button
                onClick={onToggleMute}
                className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 transition-colors cursor-pointer"
                title={isMuted ? 'Bunyikan SFX' : 'Senyapkan SFX'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={onPause}
                className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/60 rounded-lg text-slate-200 transition-colors cursor-pointer"
                title="Jeda Permainan (Pause)"
              >
                <Pause className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Tap-to-Expand Auspex Minimap Radar (Works on Mobile & Desktop) */}
            <div
              onClick={() => setIsRadarExpanded((prev) => !prev)}
              className="flex flex-col items-center bg-slate-950/90 border border-emerald-500/60 rounded-xl p-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer transition-all"
              title="Sentuh / Klik untuk besarkan Radar Auspex"
            >
              <div
                className={`relative rounded-full bg-emerald-950/40 border border-emerald-500/50 overflow-hidden transition-all duration-150 ${
                  isRadarExpanded ? 'w-32 h-32 sm:w-36 sm:h-36' : 'w-14 h-14 sm:w-18 sm:h-18'
                }`}
              >
                <div className="absolute inset-2 rounded-full border border-emerald-500/20" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/20" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-500/20" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]" />
                {minimapBlips.map((b, i) => {
                  const leftPct = 50 + b.dx * 46;
                  const topPct = 50 + b.dy * 46;
                  let colorClass = 'w-1 h-1 bg-rose-400/80';
                  if (b.kind === 'boss') colorClass = 'w-2.5 h-2.5 bg-rose-500 border border-white animate-ping';
                  else if (b.kind === 'chest') colorClass = 'w-2 h-2 bg-amber-300 shadow-[0_0_6px_#fbbf24]';
                  else if (b.kind === 'beacon') colorClass = 'w-2 h-2 bg-cyan-400';
                  else if (b.kind === 'obstacle') colorClass = 'w-1.5 h-1.5 bg-slate-400/60';
                  return (
                    <div
                      key={i}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${colorClass}`}
                      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 mt-1">
                <Radar className="w-2.5 h-2.5" />
                <span>AUSPEX</span>
                {isRadarExpanded ? <Minimize2 className="w-2.5 h-2.5" /> : <Maximize2 className="w-2.5 h-2.5" />}
              </div>
              {isRadarExpanded && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] font-mono text-slate-300 mt-1 pt-1 border-t border-emerald-900/70">
                  <span className="text-rose-400">● Boss/Xenos</span>
                  <span className="text-amber-300">● Relic Pod</span>
                  <span className="text-cyan-300">● Beacon</span>
                  <span className="text-slate-400">● Struktur</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Status Stack (Boss HP, Extraction Zone, Sandbox Controls, Trial, Hive Event, Dreadnought, Streak) */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-1 px-1">
          {/* Multi-Layered Cinematic Boss HP Bar */}
          {activeBosses.slice(0, 2).map((boss, idx) => {
            const pct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
            return (
              <div
                key={`${boss.type}-${idx}`}
                className="w-full bg-slate-950/90 border border-rose-500/80 rounded-lg px-3 py-1 shadow-[0_0_20px_rgba(225,29,72,0.35)]"
              >
                <div className="flex items-center justify-between text-[11px] font-gothic font-bold tracking-wider mb-0.5">
                  <span className="text-rose-200 flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-rose-500" />
                    <span>{boss.name}</span>
                    {boss.isEnraged && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-600 text-[8px] font-mono text-white animate-pulse">
                        ENRAGED
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] text-rose-300 tabular-nums">
                    {Math.ceil(boss.hp)} / {Math.ceil(boss.maxHp)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded overflow-hidden border border-rose-900/80">
                  <div
                    className={`h-full transition-all duration-100 ${
                      boss.isEnraged
                        ? 'bg-gradient-to-r from-rose-600 via-orange-500 to-yellow-300'
                        : 'bg-gradient-to-r from-rose-700 to-rose-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Thunderhawk Extraction Zone Banner */}
          {extractionZone && (
            <div className="w-full bg-emerald-950/90 border border-emerald-400 rounded-lg px-3 py-1 flex items-center justify-between text-[11px] font-mono shadow-[0_0_16px_rgba(16,185,129,0.35)]">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-300 animate-bounce shrink-0" />
                <span className="text-emerald-200 font-bold truncate">
                  {extractionZone.inside
                    ? '⚡ ZON THUNDERHAWK AKTIF: BANTUAN MERIAM & PERISAI!'
                    : '🚁 MASUK KE ZON PENDARATAN THUNDERHAWK HIJAU!'}
                </span>
              </div>
              <span className="text-emerald-300 font-bold shrink-0 ml-2">
                {extractionZone.inside ? 'AKTIF' : '30s'}
              </span>
            </div>
          )}

          {/* Firing Range Sandbox Toolbar */}
          {gameMode === 'firing_range' && (
            <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
              <button
                onClick={onFiringRangeLevelUp}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 text-xs font-mono font-bold cursor-pointer shadow-md"
              >
                ⚡ +1 Level Up / Uji Senjata
              </button>
              <button
                onClick={onFiringRangeWave}
                className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400 text-rose-200 text-xs font-mono font-bold cursor-pointer shadow-md"
              >
                👾 Panggil Gelombang (18 Xenos)
              </button>
            </div>
          )}

          {/* Active Combat Trial, Hive Event & Swarm Mutator Row */}
          {(activeTrial || activeHiveEvent || activeMutator) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {activeMutator && (
                <div className="bg-slate-950/90 border border-red-500/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-mono shadow-md animate-pulse">
                  <span className="font-black text-rose-300">{activeMutator.name}:</span>
                  <span className="text-slate-300 hidden sm:inline">{activeMutator.desc}</span>
                  <span className="text-amber-400 font-bold">({Math.ceil(activeMutator.duration)}s)</span>
                </div>
              )}

              {activeTrial && (
                <div className="bg-slate-950/85 border border-amber-400/70 rounded-lg px-2.5 py-1 flex items-center gap-2 text-[11px] font-mono shadow-md">
                  <Target className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                  <span className="text-amber-300 font-bold">
                    {activeTrial.title} ({activeTrial.progress}/{activeTrial.target}) · {Math.ceil(activeTrial.timeLeft)}s
                  </span>
                  <span className="text-[9px] text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-1 py-0.2 rounded">
                    {activeTrial.rewardDesc}
                  </span>
                </div>
              )}

              {activeHiveEvent && (
                <div className="bg-slate-950/85 border border-purple-400/70 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-mono shadow-md">
                  <span className="font-bold text-purple-200">{activeHiveEvent.title}:</span>
                  <span className="text-slate-300 hidden sm:inline">{activeHiveEvent.desc}</span>
                  <span className="text-amber-300 font-bold">({Math.ceil(activeHiveEvent.timer)}s)</span>
                </div>
              )}
            </div>
          )}

          {/* Dreadnought, Tactical Overdrive & Purge Streak Compact Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {dreadnoughtTimerPct > 0 && (
              <div className="px-3 py-0.5 rounded-full border border-yellow-300 bg-amber-500/90 text-slate-950 text-[10px] font-gothic font-black tracking-wider shadow flex items-center gap-1.5">
                <Shield className="w-3 h-3 fill-slate-950" />
                <span>DREADNOUGHT ({Math.ceil(dreadnoughtTimerPct * 15)}s)</span>
              </div>
            )}

            {overdrivePct > 0 && (
              <div className="px-3 py-0.5 rounded-full border border-cyan-200 bg-gradient-to-r from-cyan-400 to-amber-300 text-slate-950 text-[10px] font-gothic font-black tracking-wider shadow-[0_0_12px_rgba(34,211,238,0.65)] flex items-center gap-1.5">
                <Bolt className="w-3 h-3 fill-slate-950" />
                <span>TACTICAL OVERDRIVE ({Math.ceil(overdrivePct * 6)}s)</span>
              </div>
            )}

            {streakCount >= 5 && (
              <div
                className={`px-3 py-0.5 rounded-full border text-[10px] font-gothic font-black tracking-wider shadow flex items-center gap-1.5 ${
                  isZealActive
                    ? 'bg-amber-500/90 border-yellow-200 text-slate-950'
                    : 'bg-rose-950/85 border-rose-500 text-rose-300'
                }`}
              >
                <Flame className="w-3 h-3 fill-current text-amber-300" />
                <span>
                  {streakCount}x {isZealActive ? "EMPEROR'S ZEAL" : 'STREAK'}
                </span>
                <div className="w-10 h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-300"
                    style={{ width: `${streakTimerPct * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low HP Red Pulsing Vignette */}
      {hpPercent <= 30 && (
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_90px_rgba(225,29,72,0.6)] animate-pulse border border-rose-600/40" />
      )}

      {/* Desktop Bottom Control Bar (Hidden on mobile where VirtualJoystick handles thumb buttons) */}
      <div className="hidden md:flex justify-between items-end px-1 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onCycleAimMode}
            className="flex items-center gap-1.5 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors cursor-pointer shadow-md"
            title="Klik untuk menukar Mod Kawalan (WASD Sahaja / WASD + Mouse)"
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span>
              KAWALAN: {aimMode === 'auto' ? '⌨️ AUTO-AIM' : aimMode === 'hybrid' ? '🖱️ HYBRID' : '🎯 POINTER PENUH'}
            </span>
          </button>
          {onToggleScreenShake && (
            <button
              onClick={onToggleScreenShake}
              className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer shadow-md ${
                screenShakeOn
                  ? 'bg-slate-900/85 hover:bg-slate-800 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/80 text-slate-400'
              }`}
              title="Hidupkan atau matikan gegaran skrin (Screen Shake)"
            >
              <span>{screenShakeOn ? '💥 GEGARAN: ON' : '🚫 GEGARAN: OFF'}</span>
            </button>
          )}
        </div>

        {/* Desktop Overdrive, Ultimate & Dash Indicators */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onTriggerOverdrive}
            className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 shadow-md transition-colors cursor-pointer ${
              overdrivePct > 0
                ? 'bg-cyan-950/90 border-cyan-300 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                : furyPct >= 1
                ? 'bg-yellow-950/90 hover:bg-yellow-900 border-yellow-300 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-400'
            }`}
            title="Aktifkan Tactical Overdrive apabila Fury mencapai 100% (Kekunci F)"
          >
            <Bolt className={`w-4 h-4 ${overdrivePct > 0 ? 'text-cyan-300 animate-spin' : 'text-yellow-300'}`} />
            <span className="font-bold">FURY [F]:</span>
            {overdrivePct > 0 ? (
              <span className="text-cyan-200 font-bold animate-pulse">AKTIF ({Math.ceil(overdrivePct * 6)}s)</span>
            ) : furyPct >= 1 ? (
              <span className="text-yellow-300 font-bold animate-pulse">SEDIA!</span>
            ) : (
              <div className="w-16 h-2 bg-slate-950 border border-slate-700 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-100"
                  style={{ width: `${Math.min(100, Math.max(0, furyPct * 100))}%` }}
                />
              </div>
            )}
          </button>

          <button
            onClick={onTriggerUltimate}
            className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 shadow-md transition-colors cursor-pointer ${
              ultimateCooldownPct <= 0
                ? 'bg-amber-950/90 hover:bg-amber-900 border-amber-400 text-amber-200'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-400'
            }`}
            title="Aktifkan Kemahiran Ultimate Chapter (Kekunci Q atau E)"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-bold">{ultimateNames[chapter]} [Q]:</span>
            {ultimateCooldownPct > 0 ? (
              <div className="w-20 h-2 bg-slate-950 border border-slate-700 rounded overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-100"
                  style={{ width: `${(1 - ultimateCooldownPct) * 100}%` }}
                />
              </div>
            ) : (
              <span className="text-amber-300 font-bold animate-pulse">SEDIA!</span>
            )}
          </button>

          <div className="flex items-center gap-2 bg-slate-900/85 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-300 shadow-md">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">DASH [SPACE]:</span>
            {dashCooldownPct > 0 ? (
              <div className="w-20 h-2 bg-slate-950 border border-slate-700 rounded overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-100"
                  style={{ width: `${(1 - dashCooldownPct) * 100}%` }}
                />
              </div>
            ) : (
              <span className="text-cyan-300 font-bold">SEDIA</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
