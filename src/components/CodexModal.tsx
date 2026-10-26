import React, { useState } from 'react';
import { X, Sword, Shield, Bug, Zap, Sparkles, ArrowRight, Skull, Award } from 'lucide-react';
import { INITIAL_WEAPONS, INITIAL_PASSIVES, WEAPON_EVOLUTIONS } from '../game/upgrades';
import { WeaponId, EnemyType } from '../types/game';
import { BESTIARY_MILESTONES, loadBestiaryKills } from '../game/metaProgression';

interface CodexModalProps {
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'evolutions' | 'weapons' | 'passives' | 'tyranids'>('evolutions');
  const [bestiaryKills] = useState(() => loadBestiaryKills());

  const tyranids = [
    {
      name: 'Hormagaunt',
      threat: 'RENDAH · GEROMBOLAN PANTAS',
      desc: 'Makhluk bio-serangga pantas berkaki empat dengan sepasang Scything Talons tajam. Menyerbu dalam jumlah yang sangat ramai.',
      tactic: 'Gunakan Boltgun, Chainsword atau Heavy Flamer untuk menghalang mereka mendekat.',
      color: 'text-purple-400'
    },
    {
      name: 'Termagant',
      threat: 'SEDERHANA · PENEMBAK ASID',
      desc: 'Tyranid berjarak yang membawa Fleshborer organik. Menembak peluru asid bio-korosif dari jauh.',
      tactic: 'Kekal bergerak atau berlindung di sebalik struktur batu gothic untuk mengelak tembakan asid.',
      color: 'text-emerald-400'
    },
    {
      name: 'Genestealer & Broodlord (MINI-BOS)',
      threat: 'TINGGI · PENYUSUP KUKU TAJAM',
      desc: 'Pemangsa empat lengan yang sangat lincah. Broodlord muncul pada minit 1:30 & 3:20 mengetuai serbuan hendap.',
      tactic: 'Simpan Dash [SPACE] atau Ultimate [Q] apabila Broodlord menyerbu.',
      color: 'text-indigo-400'
    },
    {
      name: 'Biovore & Spore Mine',
      threat: 'TINGGI · ARTILERI BIO-SPORA',
      desc: 'Artileri hidup Tyranid yang melontar periuk api Spore Mine terapung ke arah Space Marine.',
      tactic: 'Musnahkan Spore Mine dari jauh sebelum ia merapati perisai anda.',
      color: 'text-lime-400'
    },
    {
      name: 'Zoanthrope & Lictor',
      threat: 'BERBAHAYA · PSIKIK & HALIMUNAN',
      desc: 'Zoanthrope melepaskan bebola tenaga Warp berpandu, manakala Lictor menyamar halimunan sebelum menerkam.',
      tactic: 'Gunakan Lascannon atau Plasma Cannon untuk menembusi perisai psikik mereka.',
      color: 'text-cyan-400'
    },
    {
      name: 'Toxicrene (ELIT BIO-TOKSIK)',
      threat: 'TINGGI · AURA SPORA PERLAHAN',
      desc: 'Raksasa sesungut beracun yang muncul selepas minit 1:45. Memancarkan kabus spora toksik yang memperlahankan pergerakan Space Marine.',
      tactic: 'Tembak dari jarak selamat menggunakan Cyclone Missile atau Assault Cannon, atau gunakan Dash untuk keluar dari gegelung hijau.',
      color: 'text-lime-300'
    },
    {
      name: 'Trygon Prime (BOS BAWAH TANAH)',
      threat: 'MAKSIMA · SERANGAN SEISMIK',
      desc: 'Bio-titan ular gergasi bawah tanah (muncul minit 2:30). Menggali ke bawah tanah dan menandakan bulatan gegaran merah sebelum meletus keluar!',
      tactic: 'Perhatikan amaran SEISMIC ERUPTION dan segera Dash keluar dari bulatan merah sebelum ia timbul.',
      color: 'text-sky-400'
    },
    {
      name: 'Carnifex & Hive Tyrant (BOS UTAMA)',
      threat: 'MAKSIMA · PEMIMPIN HIVE FLEET',
      desc: 'Raksasa bio-perisai tebal yang memasuki fasa ENRAGED di bawah 40% HP. Menjatuhkan Wargear Relic & Peti Evolusi.',
      tactic: 'Perhatikan garisan merah amaran rempuhan dan aktifkan Plasma Core di peta untuk memukau (Stun) mereka.',
      color: 'text-rose-400'
    }
  ];

  const weaponList = Object.values(INITIAL_WEAPONS);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center safe-p sm:p-4">
      <div className="max-w-3xl w-full max-h-[88vh] bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="font-gothic font-bold text-base sm:text-lg text-slate-100 tracking-wide uppercase">
              Codex Imperialis · Resipi EVO & Perisikan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-800 bg-slate-950/40 p-2 gap-1.5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('evolutions')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'evolutions'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>RESIPI EVO ({weaponList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('weapons')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'weapons'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sword className="w-3.5 h-3.5" />
            <span>SENJATA ({weaponList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('passives')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'passives'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>PASIF ({Object.keys(INITIAL_PASSIVES).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tyranids')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'tyranids'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>BESTIARY ({tyranids.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 flex flex-col gap-2.5">
          {activeTab === 'evolutions' && (
            <>
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 text-xs font-mono text-amber-200">
                💡 <strong>Cara Mengaktifkan Senjata Evolusi (★EVO★):</strong> Naik taraf mana-mana senjata ke <strong>Tahap 5 (Max)</strong> dan miliki <strong>Pasif Pasangannya (Tahap 1+)</strong>. Seterusnya, buka <em>Relic Drop Pod</em> atau naik tahap untuk membuka senjata legenda!
              </div>
              <div className="grid grid-cols-1 gap-2">
                {weaponList.map((w) => {
                  const evo = WEAPON_EVOLUTIONS[w.id as WeaponId];
                  const passivePair = evo ? INITIAL_PASSIVES[evo.passive] : null;
                  if (!evo || !passivePair) return null;
                  return (
                    <div
                      key={w.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                        <span className="px-2 py-1 rounded bg-amber-950/80 border border-amber-500/60 text-amber-300 font-bold">
                          ⚔️ {w.name} (Lv 5)
                        </span>
                        <span className="text-slate-500 font-bold">+</span>
                        <span className="px-2 py-1 rounded bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-bold">
                          🛡️ {passivePair.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-yellow-400 hidden sm:inline" />
                      </div>
                      <div className="sm:text-right">
                        <div className="font-gothic font-bold text-xs sm:text-sm text-yellow-300">
                          ★ {evo.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {evo.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'weapons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weaponList.map((w) => {
                const evo = WEAPON_EVOLUTIONS[w.id];
                const passivePair = evo ? INITIAL_PASSIVES[evo.passive] : null;
                return (
                  <div key={w.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-gothic font-bold text-amber-300 text-sm">{w.name}</h3>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        MAX TAHAP {w.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{w.shortDesc}</p>
                    {evo && passivePair && (
                      <div className="flex items-center gap-2 p-1.5 rounded bg-amber-950/30 border border-amber-600/30 text-[11px] font-mono text-amber-300">
                        <span className="font-bold text-yellow-400">RESIPI EVO:</span>
                        <span>Lv 5 + {passivePair.name}</span>
                      </div>
                    )}
                    <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                      <span className="text-amber-400/90 font-bold">Evolusi: </span>
                      {evo ? evo.name + ' — ' + evo.desc : w.descriptionByLevel[w.maxLevel - 1]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'passives' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(INITIAL_PASSIVES).map((p) => (
                <div key={p.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-gothic font-bold text-cyan-300 text-sm">{p.name}</h3>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      MAX TAHAP {p.maxLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{p.shortDesc}</p>
                  <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                    <span className="text-cyan-400/90 font-bold">Kesan Penuh: </span>
                    {p.descriptionByLevel[p.maxLevel - 1]}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tyranids' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between text-xs font-mono text-purple-200">
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-purple-400" />
                  <span>Kajian Anatomi & Autopsi Xenos: Bunuh spesimen untuk membuka bonus kerosakan kekal (+3-5% DMG)!</span>
                </div>
              </div>

              {BESTIARY_MILESTONES.map((specimen) => {
                const kills = bestiaryKills[specimen.enemyType] || 0;
                const isUnlocked = kills >= specimen.requiredKills;
                const progressPct = Math.min(100, (kills / specimen.requiredKills) * 100);

                return (
                  <div
                    key={specimen.enemyType}
                    className={`bg-slate-950/70 border rounded-xl p-3.5 flex flex-col gap-2 transition-all ${
                      isUnlocked
                        ? 'border-emerald-500/50 shadow-md shadow-emerald-950/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-gothic font-bold text-sm text-slate-100">{specimen.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {specimen.subtitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            <Award className="w-3 h-3" />
                            <span>PERK AKTIF: +{specimen.damageBonusPct}% DMG</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            SASARAN: {kills}/{specimen.requiredKills} DIBUNUH
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Kill Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${isUnlocked ? 'bg-emerald-500' : 'bg-purple-500'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{specimen.lore}</p>

                    <div className="text-[11px] font-mono text-cyan-300/90 pt-1 border-t border-slate-800/80">
                      <span className="text-slate-500 font-bold">Kelemahan Taktikal: </span>
                      {specimen.weakness}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            Tutup Codex
          </button>
        </div>
      </div>
    </div>
  );
};
