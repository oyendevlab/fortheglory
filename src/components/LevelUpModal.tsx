import React, { useEffect } from 'react';
import { UpgradeOption } from '../types/game';
import { Sparkles, Sword, ShieldCheck, Zap, Heart, Lock, Unlock, Ban, ArrowRight } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  choices: UpgradeOption[];
  onSelect: (option: UpgradeOption) => void;
  onReroll: () => void;
  rerollsLeft: number;
  lockedUpgrade: UpgradeOption | null;
  onToggleLock: (option: UpgradeOption) => void;
  banishesLeft?: number;
  onBanish?: (option: UpgradeOption) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  choices,
  onSelect,
  onReroll,
  rerollsLeft,
  lockedUpgrade,
  onToggleLock,
  banishesLeft = 0,
  onBanish
}) => {
  // Listen for 1, 2, 3 or R key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' && choices[0]) onSelect(choices[0]);
      if (e.key === '2' && choices[1]) onSelect(choices[1]);
      if (e.key === '3' && choices[2]) onSelect(choices[2]);
      if ((e.key === 'r' || e.key === 'R') && rerollsLeft > 0) onReroll();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choices, onSelect, onReroll, rerollsLeft]);

  const isStoreHealth = choices.every((c) => c.category === 'STORE_HEALTH');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center safe-p sm:p-4 overflow-y-auto">
      <div
        className={`max-w-3xl w-full bg-slate-900 border-2 ${
          isStoreHealth
            ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
            : 'border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
        } rounded-2xl p-4 sm:p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 my-auto`}
      >
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            <h2 className="font-gothic text-lg sm:text-2xl font-black tracking-widest uppercase">
              {isStoreHealth ? 'Bekalan Perubatan Apothecary' : `Kurniaan Maharaja · Tahap ${level}`}
            </h2>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <p className="text-slate-400 text-xs font-mono">
            {isStoreHealth
              ? 'Semua senjata & pasif mencapai tahap maksimum! Pilih pemulihan HP:'
              : 'Pilih satu augmentasi persenjataan atau kunci kad untuk pusingan seterusnya:'}
          </p>
        </div>

        {/* Upgrade Cards Grid (Compact Stack on Mobile, 3 Columns on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {choices.map((option, idx) => {
            const isWeapon = option.category === 'WEAPON';
            const isHealth = option.category === 'STORE_HEALTH';
            const isLocked = lockedUpgrade?.id === option.id && lockedUpgrade?.category === option.category;
            const borderColors = {
              standard: 'border-slate-700 hover:border-amber-400',
              blessed: 'border-cyan-600 hover:border-cyan-300',
              relic: isHealth
                ? 'border-emerald-500 hover:border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'border-amber-500 hover:border-yellow-200',
              evolution:
                'border-amber-400 hover:border-yellow-100 shadow-[0_0_25px_rgba(245,158,11,0.5)] bg-gradient-to-b from-amber-950/40 to-slate-950/90'
            };

            return (
              <div
                key={option.id + idx}
                onClick={() => onSelect(option)}
                className={`group relative text-left p-3 sm:p-4 rounded-xl bg-slate-950/90 border-2 ${
                  isLocked ? 'border-cyan-400 ring-2 ring-cyan-400/40' : borderColors[option.rarity] || 'border-slate-700'
                } transition-all duration-150 hover:scale-[1.02] hover:bg-slate-900 cursor-pointer flex flex-col justify-between gap-2`}
              >
                <div className="flex flex-col gap-1.5">
                  {/* Top Row: Category, Level Progression & Hotkey Badge */}
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      {isHealth ? (
                        <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                      ) : isWeapon ? (
                        <Sword className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">
                        {isHealth ? 'MEDIKAL' : isWeapon ? 'SENJATA' : 'PASIF'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Level Progression Pill */}
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold flex items-center gap-1 ${
                          option.rarity === 'evolution'
                            ? 'bg-amber-500 text-slate-950 animate-pulse'
                            : isHealth
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            : option.isNew
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {option.rarity === 'evolution' ? (
                          '★ EVOLUSI ★'
                        ) : isHealth ? (
                          'PEMULIHAN'
                        ) : option.isNew ? (
                          'BAHARU (LV 1)'
                        ) : (
                          <>
                            <span>LV {option.level - 1}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                            <span>LV {option.level}</span>
                          </>
                        )}
                      </span>

                      <span className="hidden md:flex w-5 h-5 rounded bg-slate-800 border border-slate-600 text-slate-300 items-center justify-center text-[10px] font-mono font-bold">
                        {idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Title & Stars */}
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-gothic font-bold text-sm sm:text-base ${
                        option.rarity === 'evolution'
                          ? 'text-amber-300'
                          : isHealth
                          ? 'text-emerald-200'
                          : 'text-slate-100'
                      } group-hover:text-amber-300 transition-colors leading-snug`}
                    >
                      {option.name}
                    </h3>
                    {!isHealth && (
                      <span className="text-[10px] font-mono text-amber-400 shrink-0">
                        {'★'.repeat(option.level)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-snug">
                    {option.description}
                  </p>

                  {/* EVO Requirement Badge on Weapon Cards */}
                  {option.evoPassiveReq && (
                    <div
                      className={`mt-1 flex items-center gap-1.5 p-1.5 rounded-lg border text-[10px] font-mono ${
                        option.evoPassiveReq.hasPassive
                          ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-300'
                          : 'bg-slate-900 border-amber-500/40 text-amber-300/80'
                      }`}
                    >
                      <span className="font-bold">EVO:</span>
                      <span className="truncate">{option.evoPassiveReq.name}</span>
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/40 shrink-0">
                        {option.evoPassiveReq.hasPassive ? '✓ MILIKI' : 'PERLU PASIF'}
                      </span>
                    </div>
                  )}

                  {/* EVO Synergy Badge on Passive Cards */}
                  {option.evoWeaponReq && (
                    <div
                      className={`mt-1 flex items-center justify-between gap-1 p-1.5 rounded-lg border text-[10px] font-mono ${
                        option.evoWeaponReq.weaponLevel > 0
                          ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-200'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className="truncate">🔗 EVO: {option.evoWeaponReq.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-black/40 text-[9px] font-bold shrink-0">
                        {option.evoWeaponReq.weaponLevel > 0 ? `✓ LV ${option.evoWeaponReq.weaponLevel}` : 'BELUM MILIKI'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Touch-Friendly Footer Actions (Lock, Banish & Select) */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {!isHealth && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(option);
                        }}
                        title={isLocked ? 'Buka Kunci Kad' : 'Kunci Kad untuk Level-Up seterusnya'}
                        className={`px-2 py-1 rounded-md border flex items-center gap-1 text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                          isLocked
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500'
                        }`}
                      >
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{isLocked ? 'DIKUNCI' : 'KUNCI'}</span>
                      </button>
                    )}

                    {!isHealth && onBanish && banishesLeft > 0 && option.rarity !== 'evolution' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBanish(option);
                        }}
                        title="Singkirkan (Banish) kad ini sepanjang pertempuran"
                        className="px-2 py-1 rounded-md border bg-rose-950/80 border-rose-500/60 text-rose-300 hover:bg-rose-800 hover:text-white flex items-center gap-1 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                      >
                        <Ban className="w-3 h-3" />
                        <span>SINGKIR</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 group-hover:text-amber-300">
                    <span>PILIH</span>
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & Reroll Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 text-center sm:text-left">
            [1-3] Pilih · [KUNCI] Simpan kad · [SINGKIR] Buang ({banishesLeft} baki)
          </div>

          <button
            onClick={onReroll}
            disabled={rerollsLeft <= 0}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-colors ${
              rerollsLeft > 0
                ? 'bg-slate-800 hover:bg-slate-700 border-amber-500/60 text-amber-300 hover:text-amber-200 cursor-pointer'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Reroll Pilihan [R] ({rerollsLeft} Baki)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
