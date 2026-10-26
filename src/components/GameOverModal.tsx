import React from 'react';
import { RotateCcw, Home, Skull, Clock, ShieldAlert, Award, BarChart3, Trophy, Sparkles } from 'lucide-react';
import { WeaponId, WeaponStatRecord } from '../types/game';
import { INITIAL_WEAPONS } from '../game/upgrades';

interface GameOverModalProps {
  stats: {
    time: number;
    kills: number;
    level: number;
    bossesKilled: number;
    puritySealsEarned?: number;
    weaponStats?: Record<WeaponId, WeaponStatRecord>;
    victory?: boolean;
    evolvedWeapons?: string[];
    chapterXpEarned?: number;
    chapterRankTitle?: string;
    dailyDirectiveBonus?: number;
  };
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onHome
}) => {
  const minutes = Math.floor(stats.time / 60);
  const seconds = stats.time % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const baseKillSeals = Math.floor(stats.kills * 0.5);
  const baseTimeSeals = Math.floor(stats.time / 10);
  const baseBossSeals = stats.bossesKilled * 35;
  const seals = stats.puritySealsEarned || Math.floor(stats.kills + stats.time / 10 + stats.bossesKilled * 25);
  const bonusSeals = Math.max(0, seals - (baseKillSeals + baseTimeSeals + baseBossSeals));
  const isVictory = !!stats.victory;

  let honorRank = 'Neophyte Astartes';
  if (isVictory || stats.bossesKilled >= 2 || stats.time >= 360) {
    honorRank = 'Scourge of Hive Fleet (Master of Sanctity)';
  } else if (stats.bossesKilled >= 1 || stats.time >= 200) {
    honorRank = 'Champion of Macragge (Veteran)';
  } else if (stats.time >= 100 || stats.kills >= 120) {
    honorRank = 'Battle-Brother (Imperial Purger)';
  }

  const weaponEntries = stats.weaponStats
    ? (Object.entries(stats.weaponStats) as [WeaponId, WeaponStatRecord][])
        .filter(([, rec]) => rec.damage > 0)
        .map(([wId, rec]) => ({
          id: wId,
          name: INITIAL_WEAPONS[wId]?.name || wId,
          damage: rec.damage,
          kills: rec.kills
        }))
        .sort((a, b) => b.damage - a.damage)
    : [];

  const totalDamage = Math.max(1, weaponEntries.reduce((sum, item) => sum + item.damage, 0));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center safe-p sm:p-4 overflow-y-auto">
      <div
        className={`max-w-lg w-full bg-slate-900 border-2 ${
          isVictory
            ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
            : 'border-rose-600/80'
        } rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-3.5 text-center animate-in fade-in zoom-in-95 duration-150 my-auto`}
      >
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
              isVictory
                ? 'bg-emerald-950/70 border-emerald-400 text-emerald-400'
                : 'bg-rose-950/60 border-rose-500/80 text-rose-500'
            }`}
          >
            {isVictory ? <Trophy className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
          </div>
          <h2
            className={`font-gothic text-xl sm:text-2xl font-black tracking-wider uppercase ${
              isVictory ? 'text-emerald-400' : 'text-rose-500'
            }`}
          >
            {isVictory ? 'Misi Berjaya! (Thunderhawk Extraction)' : 'Perisai Telah Tumpas'}
          </h2>
          <div className="text-xs font-gothic font-bold text-amber-300">
            Gelaran: {honorRank}
          </div>
        </div>

        {/* Purity Seals Breakdown Card */}
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-3 text-left font-mono">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>GANJARAN PURITY SEALS</span>
            </span>
            <span className="text-sm text-emerald-300 font-black">+{seals} SEALS</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-300 bg-slate-950/60 rounded-lg p-1.5 text-center">
            <div>
              <span className="text-slate-500 block">KILLS</span>
              <span className="font-bold">+{baseKillSeals}</span>
            </div>
            <div>
              <span className="text-slate-500 block">MASA</span>
              <span className="font-bold">+{baseTimeSeals}</span>
            </div>
            <div>
              <span className="text-slate-500 block">BOS</span>
              <span className="font-bold">+{baseBossSeals}</span>
            </div>
            <div>
              <span className="text-slate-500 block">BONUS/OATH</span>
              <span className="font-bold text-emerald-400">+{bonusSeals}</span>
            </div>
          </div>
          {(stats.chapterXpEarned || stats.dailyDirectiveBonus) && (
            <div className="mt-2 pt-2 border-t border-amber-500/25 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              {stats.chapterXpEarned ? (
                <span className="text-cyan-300 font-bold">
                  🎖️ Veterancy Chapter: +{stats.chapterXpEarned} XP {stats.chapterRankTitle ? `(${stats.chapterRankTitle})` : ''}
                </span>
              ) : null}
              {stats.dailyDirectiveBonus ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold">
                  📅 Direktif Harian Selesai: +{stats.dailyDirectiveBonus} SEALS!
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Compact 4-Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <Clock className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
            <div className="text-[9px] text-slate-500">MASA</div>
            <div className="text-xs font-bold text-slate-200 tabular-nums">{timeFormatted}</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <Skull className="w-4 h-4 text-purple-400 mx-auto mb-0.5" />
            <div className="text-[9px] text-slate-500">XENOS</div>
            <div className="text-xs font-bold text-purple-300 tabular-nums">{stats.kills}</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <Award className="w-4 h-4 text-cyan-400 mx-auto mb-0.5" />
            <div className="text-[9px] text-slate-500">TAHAP</div>
            <div className="text-xs font-bold text-cyan-300 tabular-nums">LVL {stats.level}</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 mx-auto mb-0.5" />
            <div className="text-[9px] text-slate-500">BOS</div>
            <div className="text-xs font-bold text-rose-300 tabular-nums">{stats.bossesKilled}</div>
          </div>
        </div>

        {/* Evolved Weapons Badges */}
        {stats.evolvedWeapons && stats.evolvedWeapons.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-2.5 text-left">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-yellow-400 uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Senjata Evolusi Legenda Dicapai</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stats.evolvedWeapons.map((name, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-400/50 rounded text-[10px] font-mono font-bold text-yellow-200"
                >
                  ★ {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weapon Damage Breakdown */}
        {weaponEntries.length > 0 && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-left">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-400 uppercase mb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Laporan Kerosakan Senjata (DPS)</span>
              </div>
              <span className="text-[10px] text-slate-500">DMG / KILLS</span>
            </div>
            <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1">
              {weaponEntries.map((w) => {
                const pct = Math.round((w.damage / totalDamage) * 100);
                return (
                  <div key={w.id} className="flex flex-col gap-0.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 truncate">{w.name}</span>
                      <span className="text-slate-300 tabular-nums">
                        {w.damage.toLocaleString()} ({pct}%) · {w.kills}💀
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                        style={{ width: `${Math.max(3, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-1">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-gothic font-bold text-sm tracking-wider uppercase transition-all duration-150 shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Main Semula</span>
          </button>

          <button
            onClick={onHome}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-mono text-xs transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Skrin Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
