import React, { useEffect } from 'react';
import { UpgradeOption } from '../types/game';
import { Sparkles, Gift, Check, ShieldCheck, Sword } from 'lucide-react';
import { sounds } from '../services/audio';

interface RelicChestModalProps {
  rewards: UpgradeOption[];
  onClaim: () => void;
  onChoose?: (option: UpgradeOption) => void;
  source?: 'elite' | 'boss' | 'supply';
  jackpotCount?: 1 | 3 | 5;
}

export const RelicChestModal: React.FC<RelicChestModalProps> = ({
  rewards,
  onClaim,
  onChoose,
  source = 'elite',
  jackpotCount = 3
}) => {
  useEffect(() => {
    sounds.playChestOpen();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (source === 'boss') {
        const index = Number(e.key) - 1;
        if (index >= 0 && index < rewards.length) onChoose?.(rewards[index]);
      } else if (e.key === 'Enter' || e.key === ' ') onClaim();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClaim, onChoose, source, rewards]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-200">
        
        {/* Chest Aura Icon */}
        <div className="relative">
          <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-amber-500 to-yellow-700 border-2 border-yellow-300 flex items-center justify-center shadow-lg relative">
            <Gift className="w-10 h-10 text-slate-950" />
          </div>
        </div>

        {/* Title & Jackpot Roulette Tier */}
        <div className="flex flex-col items-center gap-1.5">
          {source !== 'boss' && (
            <div className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-black tracking-widest uppercase border ${
              jackpotCount === 5
                ? 'bg-amber-400 text-slate-950 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-bounce'
                : jackpotCount === 3
                ? 'bg-cyan-950 text-cyan-300 border-cyan-400'
                : 'bg-slate-800 text-slate-300 border-slate-600'
            }`}>
              {jackpotCount === 5 ? '🎰 5x EMPEROR MIRACLE JACKPOT!' : jackpotCount === 3 ? '✨ 3x TRIPLE RELIC BLESSING!' : '📦 1x STANDARD DROP POD'}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h2 className="font-gothic text-2xl font-black tracking-widest uppercase">
              {source === 'boss' ? 'Kurniaan Boss' : source === 'supply' ? 'Bekalan Dirampas' : 'Peti Kurniaan Imperial'}
            </h2>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <p className="text-slate-400 text-xs font-mono">
            {source === 'boss' ? 'Pilih satu ganjaran kuat selepas menewaskan boss:' : `Peti dibuka! Anda menerima ${rewards.length} augmentasi segera:`}
          </p>
        </div>

        {/* Rewards Cards */}
        <div className={`grid grid-cols-1 ${rewards.length === 1 ? 'sm:grid-cols-1 max-w-xs' : rewards.length >= 4 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-3'} gap-3 w-full`}>
          {rewards.map((item, idx) => {
            const isWeapon = item.category === 'WEAPON';
            return (
              <div
                onClick={source === 'boss' ? () => onChoose?.(item) : undefined}
                key={item.id + idx}
                className={`bg-slate-950/90 border border-amber-500/80 rounded-xl p-3.5 flex flex-col items-center text-center justify-between shadow-md ${source === 'boss' ? 'cursor-pointer hover:bg-amber-950/40' : ''}`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
                    {isWeapon ? (
                      <Sword className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">
                    {source === 'boss' ? `PILIH [${idx + 1}]` : item.rarity === 'evolution' ? 'LEGENDARY' : item.isNew ? 'SENJATA BARU' : `TAHAP +1 (LVL ${item.level})`}
                  </span>

                  <h3 className="font-gothic font-bold text-xs text-slate-100">
                    {item.name}
                  </h3>

                  <div className="text-[10px] font-mono text-amber-400">
                    {'★'.repeat(item.level)}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-sans mt-2 line-clamp-3">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Claim Action Button */}
        {source !== 'boss' && <button
          onClick={onClaim}
          className="w-full max-w-xs flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-gothic font-bold text-sm tracking-wider uppercase transition-all duration-150 shadow-lg hover:shadow-amber-500/25 cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Terima Kurniaan [ENTER]</span>
        </button>}
      </div>
    </div>
  );
};
