import React, { useState } from 'react';
import { ArmoryUpgrades, ServoSkullMode, SquadBrotherType, TalentNodeDef, TalentRanksMap } from '../types/game';
import { Shield, Zap, Sparkles, Heart, Crosshair, RotateCcw, X, Award, ChevronUp, Cpu, Users, BookOpen, Flame } from 'lucide-react';
import { sounds } from '../services/audio';
import { TALENT_NODES, loadTalents, saveTalents } from '../game/metaProgression';

interface ArmoryModalProps {
  puritySeals: number;
  armory: ArmoryUpgrades;
  onUpgrade: (key: keyof ArmoryUpgrades, cost: number) => void;
  onSelectServoMode?: (mode: ServoSkullMode) => void;
  onSelectPreferredBrother?: (brother: 'auto' | SquadBrotherType) => void;
  onPuritySealsChange?: (newBalance: number) => void;
  onClose: () => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  puritySeals,
  armory,
  onUpgrade,
  onSelectServoMode,
  onSelectPreferredBrother,
  onPuritySealsChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'armory' | 'talents'>('armory');
  const [talents, setTalents] = useState<TalentRanksMap>(() => loadTalents());
  const [filterBranch, setFilterBranch] = useState<'all' | 'macragge' | 'baal' | 'nocturne'>('all');

  const handleUpgradeTalent = (node: TalentNodeDef) => {
    const curRank = talents[node.id] || 0;
    if (curRank >= node.maxRank) return;
    const cost = node.cost * (curRank + 1);
    if (puritySeals < cost) return;

    const nextTalents = { ...talents, [node.id]: curRank + 1 };
    setTalents(nextTalents);
    saveTalents(nextTalents);
    sounds.playPurchase();
    if (onPuritySealsChange) {
      onPuritySealsChange(puritySeals - cost);
    }
  };

  const handleResetTalents = () => {
    let refund = 0;
    TALENT_NODES.forEach(n => {
      const r = talents[n.id] || 0;
      for (let i = 1; i <= r; i++) {
        refund += n.cost * i;
      }
    });
    if (refund <= 0) return;
    setTalents({});
    saveTalents({});
    sounds.playEvolution();
    if (onPuritySealsChange) {
      onPuritySealsChange(puritySeals + refund);
    }
  };
  const items: {
    key: keyof ArmoryUpgrades;
    name: string;
    desc: string;
    currentRank: number;
    maxRank: number;
    costs: number[];
    effectText: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'healthBonus',
      name: 'Ceramite Body Plating',
      desc: 'Pengukuhan plat perisai menambah Kesihatan Asas (+12 HP setiap pangkat).',
      currentRank: armory.healthBonus,
      maxRank: 5,
      costs: [40, 90, 180, 320, 500],
      effectText: `+${armory.healthBonus * 12} HP Permulaan`,
      icon: <Heart className="w-5 h-5 text-rose-500" />
    },
    {
      key: 'speedBonus',
      name: 'Bionic Leg Augmetics',
      desc: 'Implan hidraulik bionik meningkatkan kelajuan pergerakan (+4% setiap pangkat).',
      currentRank: armory.speedBonus,
      maxRank: 5,
      costs: [45, 100, 200, 350, 550],
      effectText: `+${armory.speedBonus * 4}% Kelajuan Larian`,
      icon: <Zap className="w-5 h-5 text-amber-400" />
    },
    {
      key: 'magnetBonus',
      name: 'Auspex Grav-Sensor',
      desc: 'Sensor auspex menyedut bebola spora biomass dari jarak lebih jauh (+20 jarak setiap pangkat).',
      currentRank: armory.magnetBonus,
      maxRank: 5,
      costs: [35, 80, 160, 280, 450],
      effectText: `+${armory.magnetBonus * 20} Jarak Magnet`,
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />
    },
    {
      key: 'critBonus',
      name: 'Imperial Marksman Doctrine',
      desc: 'Latihan bidikan titik kelemahan musuh meningkatkan peluang serangan kritikal (+3% setiap pangkat).',
      currentRank: armory.critBonus,
      maxRank: 5,
      costs: [50, 120, 240, 400, 650],
      effectText: `+${armory.critBonus * 3}% Peluang Crit`,
      icon: <Crosshair className="w-5 h-5 text-yellow-400" />
    },
    {
      key: 'rerollBonus',
      name: 'Tactical Munition Caches',
      desc: 'Stok persenjataan tambahan memberikan hak merombak pilihan naik taraf (+1 Reroll setiap pangkat).',
      currentRank: armory.rerollBonus,
      maxRank: 3,
      costs: [100, 250, 500],
      effectText: `+${armory.rerollBonus} Percuma Reroll Setiap Perlawanan`,
      icon: <RotateCcw className="w-5 h-5 text-indigo-400" />
    },
    {
      key: 'servoSkullLevel',
      name: 'Omnissiah Servo-Skull Augmetics',
      desc: 'Naik taraf kuasa tembakan laser & kadar frekuensi Servo-Skull Companion (+8 DMG & -10% Cooldown/pangkat).',
      currentRank: armory.servoSkullLevel || 0,
      maxRank: 5,
      costs: [60, 130, 240, 380, 600],
      effectText: `Tahap Servo-Skull Lv.${armory.servoSkullLevel || 0} (+${(armory.servoSkullLevel || 0) * 8} DMG)`,
      icon: <Cpu className="w-5 h-5 text-emerald-400" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-gothic text-2xl font-black text-amber-400 uppercase tracking-widest">
                {activeTab === 'armory' ? 'Imperial Armory' : 'The Sacred Codex'}
              </h2>
              <p className="text-slate-400 text-xs font-mono">
                {activeTab === 'armory' 
                  ? 'Penaiktarafan status kekal Space Marine menggunakan Purity Seals' 
                  : 'Pohon Bakat Suci Doktrin Astartes (Macragge, Baal, Nocturne)'}
              </p>
            </div>
          </div>

          {/* Purity Seals Balance Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-500/50 shadow-inner">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="font-mono text-sm font-bold text-amber-300">
                {puritySeals} <span className="text-[10px] text-slate-400">SEALS</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('armory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'armory'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-lg'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>IMPERIAL ARMORY</span>
            </button>

            <button
              onClick={() => setActiveTab('talents')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'talents'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-lg'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>POHON BAKAT ASTARTES (CODEX)</span>
            </button>
          </div>

          {activeTab === 'talents' && (
            <button
              onClick={handleResetTalents}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold transition-all cursor-pointer"
              title="Refund semua Purity Seals yang dibelanjakan pada Pohon Bakat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Refund</span>
            </button>
          )}
        </div>

        {activeTab === 'talents' ? (
          /* The Sacred Codex Talent Tree View */
          <div className="flex flex-col gap-4">
            {/* Doctrine Branch Filter */}
            <div className="flex items-center gap-2">
              {([
                { id: 'all', label: 'Semua Doktrin' },
                { id: 'macragge', label: '🛡️ Macragge (Pertahanan)' },
                { id: 'baal', label: '⚡ Baal (Kelajuan & Crit)' },
                { id: 'nocturne', label: '🔥 Nocturne (Api & Overclock)' }
              ] as const).map(b => (
                <button
                  key={b.id}
                  onClick={() => setFilterBranch(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    filterBranch === b.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Talent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {TALENT_NODES.filter(n => filterBranch === 'all' || n.doctrine === filterBranch).map(node => {
                const curRank = talents[node.id] || 0;
                const isMax = curRank >= node.maxRank;
                const cost = node.cost * (curRank + 1);
                const canAfford = puritySeals >= cost;
                const branchColor = node.doctrine === 'macragge' ? 'border-sky-500/40 bg-sky-950/20' : node.doctrine === 'baal' ? 'border-rose-500/40 bg-rose-950/20' : 'border-amber-500/40 bg-amber-950/20';
                const tagColor = node.doctrine === 'macragge' ? 'text-sky-400' : node.doctrine === 'baal' ? 'text-rose-400' : 'text-amber-400';
                const doctrineIcon = node.doctrine === 'macragge' ? '🛡️' : node.doctrine === 'baal' ? '⚡' : '🔥';

                return (
                  <div
                    key={node.id}
                    className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 ${branchColor} bg-slate-950/80 hover:border-slate-600 transition-colors`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{doctrineIcon}</span>
                          <div>
                            <h3 className="font-gothic font-bold text-sm text-slate-100">{node.name}</h3>
                            <span className={`text-[10px] font-mono font-bold uppercase ${tagColor}`}>
                              {node.doctrine} Doctrine • Tier {node.tier}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          RANK {curRank}/{node.maxRank}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{node.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-mono text-cyan-300 font-semibold">
                        {curRank > 0 ? `Aktif: Pangkat ${curRank}` : 'Belum Dibuka'}
                      </div>

                      {isMax ? (
                        <span className="px-3 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-mono font-bold text-slate-500 uppercase">
                          MAXED
                        </span>
                      ) : (
                        <button
                          onClick={() => handleUpgradeTalent(node)}
                          disabled={!canAfford}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-md'
                              : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{cost} SEALS</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Original Imperial Armory Tab */
          <>
            <div className="flex flex-col gap-3">
          {items.map((item) => {
            const isMax = item.currentRank >= item.maxRank;
            const cost = item.costs[item.currentRank] || 0;
            const canAfford = puritySeals >= cost;

            return (
              <div
                key={item.key}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-gothic font-bold text-sm text-slate-100">
                        {item.name}
                      </h3>
                      <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                        TAHAP {item.currentRank}/{item.maxRank}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.desc}
                    </p>

                    <div className="text-[11px] font-mono text-cyan-300 mt-1 font-semibold">
                      Kesan: {item.effectText}
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <div className="shrink-0">
                  {isMax ? (
                    <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-500 uppercase">
                      MAKSIMUM
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          sounds.playPurchase();
                          onUpgrade(item.key, cost);
                        }
                      }}
                      disabled={!canAfford}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-md hover:shadow-amber-500/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4 stroke-[3]" />
                      <span>{cost} SEALS</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Servo-Skull Tech-Priest Combat Doctrine Selector */}
        {onSelectServoMode && (
          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
              <Cpu className="w-4 h-4" />
              <span>Doktrin Tempur Servo-Skull Companion (Pilih Mod Aktif)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                { id: 'laser', label: '🔴 Twin-Laser', desc: 'Pancaran laser haba berterusan dengan kerosakan tinggi.' },
                { id: 'cryo', label: '❄️ Cryo-Beam', desc: 'Membekukan & memperlahankan musuh selama 1.5s setiap tembakan.' },
                { id: 'collector', label: '🧲 Bio-Collector', desc: 'Meluaskan medan sedutan XP Magnet sebanyak +80px.' }
              ] as const).map((m) => {
                const isSelected = (armory.servoSkullMode || 'laser') === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      sounds.playPurchase();
                      onSelectServoMode(m.id);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-md'
                        : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{m.label}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 leading-snug">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Squad Reinforcement Doctrine Selector */}
        {onSelectPreferredBrother && (
          <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase">
              <Users className="w-4 h-4" />
              <span>Doktrin Skuad Bantuan Battle-Brothers (Suar Skuad & Ganjaran Bos)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {([
                { id: 'auto', label: '🎲 Auto Skuad', desc: 'Gandingan taktikal rawak setiap panggilan.' },
                { id: 'apothecary', label: '💉 Apothecary', desc: 'Medik Narthecium (+14 HP berkala).' },
                { id: 'devastator', label: '🚀 Devastator', desc: 'Pelancar peluru berpandu Krak AoE.' },
                { id: 'librarian', label: '🔮 Librarian', desc: 'Petir Warp Psychic Smite & Stun.' },
                { id: 'techmarine', label: '⚙️ Techmarine', desc: 'Pulih +18 Shield & pasang Sentry Turret.' }
              ] as const).map((b) => {
                const isSelected = (armory.preferredBrother || 'auto') === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      sounds.playPurchase();
                      onSelectPreferredBrother(b.id);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-md'
                        : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{b.label}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 leading-snug">{b.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </>
    )}

    {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>* Purity Seals dikumpul daripada musuh yang ditewaskan dan tempoh bertahan dalam setiap pertempuran.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
