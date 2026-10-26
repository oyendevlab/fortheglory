import React, { useState } from 'react';
import { WeaponConfig, PassiveConfig, WeaponId, PassiveId, AimMode, WeaponStatRecord, GameFeelSettings, GameLanguage, WeaponOverclockId, WeaponOverclocksMap } from '../types/game';
import { WEAPON_EVOLUTIONS, INITIAL_WEAPONS, INITIAL_PASSIVES } from '../game/upgrades';
import { Play, RotateCcw, Home, Volume2, VolumeX, BookOpen, BarChart3, Keyboard, MousePointer, Crosshair, Sliders, Sparkles, Cpu, Globe } from 'lucide-react';
import { WEAPON_OVERCLOCK_DEFS, loadWeaponOverclocks, saveWeaponOverclocks } from '../game/metaProgression';
import { t } from '../game/i18n';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenCodex: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  weapons: Record<WeaponId, WeaponConfig>;
  passives: Record<PassiveId, PassiveConfig>;
  weaponStats?: Record<WeaponId, WeaponStatRecord>;
  aimMode: AimMode;
  onSelectAimMode: (mode: AimMode) => void;
  gameFeel: GameFeelSettings;
  onChangeGameFeel: (next: GameFeelSettings) => void;
  language?: GameLanguage;
  onToggleLanguage?: (lang: GameLanguage) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenCodex,
  isMuted,
  onToggleMute,
  weapons,
  passives,
  weaponStats,
  aimMode,
  onSelectAimMode,
  gameFeel,
  onChangeGameFeel,
  language = 'ms',
  onToggleLanguage
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'dps' | 'evo' | 'overclocks'>('settings');
  const [overclocks, setOverclocks] = useState<WeaponOverclocksMap>(() => loadWeaponOverclocks());

  const evolvedWeapons = (Object.entries(weapons) as [WeaponId, WeaponConfig][])
    .filter(([_, w]) => w.isEvolved);

  const handleSelectOverclock = (wId: WeaponId, ocId: WeaponOverclockId) => {
    const next = { ...overclocks, [wId]: ocId };
    setOverclocks(next);
    saveWeaponOverclocks(next);
  };

  const activeWeaponEntries = (Object.entries(weapons) as [WeaponId, WeaponConfig][])
    .filter(([wId, w]) => w.level > 0 || (weaponStats && weaponStats[wId]?.damage > 0))
    .map(([wId, w]) => ({
      id: wId,
      name: w.isEvolved ? (WEAPON_EVOLUTIONS[wId]?.name || w.name) : w.name,
      level: w.level,
      isEvolved: !!w.isEvolved,
      damage: weaponStats?.[wId]?.damage || 0,
      kills: weaponStats?.[wId]?.kills || 0
    }))
    .sort((a, b) => b.damage - a.damage);

  const totalDamage = Math.max(1, activeWeaponEntries.reduce((sum, item) => sum + item.damage, 0));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center safe-p sm:p-4 overflow-y-auto">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3 text-center animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div>
          <h2 className="font-gothic text-xl sm:text-2xl font-black text-amber-400 tracking-wider uppercase">
            Pertempuran Dijeda
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">
            Tekan [P] atau [ESC] untuk menyambung semula pertempuran.
          </p>
        </div>

        {/* 4-Tab Switcher (Settings, Live DPS, Evolution Recipes, Archeotech Overclocks) */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Tetapan</span>
          </button>
          <button
            onClick={() => setActiveTab('dps')}
            className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'dps'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>DPS</span>
          </button>
          <button
            onClick={() => setActiveTab('evo')}
            className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'evo'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Resipi</span>
          </button>
          <button
            onClick={() => setActiveTab('overclocks')}
            className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'overclocks'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Overclock</span>
          </button>
        </div>

        {/* Tab 1: Control & Game Feel Settings */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-2.5">
            {/* Language Toggle */}
            {onToggleLanguage && (
              <div className="bg-slate-950/75 border border-slate-800 p-2.5 rounded-xl text-left flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Bahasa (Language)</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    onClick={() => onToggleLanguage('ms')}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                      language === 'ms'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    MY (Melayu)
                  </button>
                  <button
                    onClick={() => onToggleLanguage('en')}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                      language === 'en'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    EN (English)
                  </button>
                </div>
              </div>
            )}
            <div className="bg-slate-950/75 border border-slate-800 p-3 rounded-xl text-left">
              <div className="text-amber-400 font-bold text-xs uppercase mb-2 flex items-center gap-1.5 font-mono">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Mod Kawalan (Control Scheme)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => onSelectAimMode('auto')}
                  className={`py-2 px-2 rounded-lg font-mono font-bold transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                    aimMode === 'auto'
                      ? 'bg-amber-500 text-slate-950 border border-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Auto-Aim</span>
                </button>
                <button
                  onClick={() => onSelectAimMode('hybrid')}
                  className={`py-2 px-2 rounded-lg font-mono font-bold transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                    aimMode === 'hybrid'
                      ? 'bg-amber-500 text-slate-950 border border-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Hybrid</span>
                </button>
                <button
                  onClick={() => onSelectAimMode('manual')}
                  className={`py-2 px-2 rounded-lg font-mono font-bold transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                    aimMode === 'manual'
                      ? 'bg-amber-500 text-slate-950 border border-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Pointer Penuh</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950/75 border border-slate-800 p-3 rounded-xl text-left">
              <div className="text-purple-300 font-bold text-xs uppercase mb-2 flex items-center gap-1.5 font-mono">
                <Sliders className="w-3.5 h-3.5" />
                <span>Keselesaan Visual & Gegaran Skrin</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <div className="text-slate-400 text-[10px] mb-1">Nombor Kerosakan</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['all', 'crits', 'off'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => onChangeGameFeel({ ...gameFeel, damageNumbers: mode })}
                        className={`py-1 rounded font-bold uppercase cursor-pointer ${
                          gameFeel.damageNumbers === mode
                            ? 'bg-purple-600 text-white border border-purple-400'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {mode === 'all' ? 'Semua' : mode === 'crits' ? 'Crit' : 'Off'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] mb-1">Gegaran Skrin</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['high', 'low', 'off'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => onChangeGameFeel({ ...gameFeel, screenShake: lvl })}
                        className={`py-1 rounded font-bold uppercase cursor-pointer ${
                          gameFeel.screenShake === lvl
                            ? 'bg-purple-600 text-white border border-purple-400'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {lvl === 'high' ? 'ON' : lvl === 'low' ? 'Rendah' : 'OFF'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Weapon Damage Breakdown */}
        {activeTab === 'dps' && (
          <div className="bg-slate-950/75 border border-slate-800 p-3 rounded-xl text-left">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400 uppercase mb-2">
              <span>Prestasi Kerosakan Senjata Semasa</span>
              <span className="text-[10px] text-slate-400">DMG / KILLS</span>
            </div>
            {activeWeaponEntries.length === 0 ? (
              <div className="text-center py-6 text-xs font-mono text-slate-500">
                Belum ada rekod kerosakan senjata.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {activeWeaponEntries.map((item) => {
                  const pct = Math.round((item.damage / totalDamage) * 100);
                  return (
                    <div key={item.id} className="flex flex-col gap-0.5 text-[11px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className={item.isEvolved ? 'text-yellow-300 font-bold' : 'text-slate-200'}>
                          {item.name} {item.isEvolved ? '★EVO' : `(Lv${item.level})`}
                        </span>
                        <span className="text-slate-300 tabular-nums">
                          {item.damage.toLocaleString()} ({pct}%) · {item.kills}💀
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                        <div
                          className={`h-full ${item.isEvolved ? 'bg-yellow-400' : 'bg-amber-500'}`}
                          style={{ width: `${Math.max(3, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Interactive Evolution Recipe Checklist */}
        {activeTab === 'evo' && (
          <div className="bg-slate-950/75 border border-slate-800 p-3 rounded-xl text-left">
            <div className="text-xs font-mono font-bold text-yellow-400 uppercase mb-2">
              Senarai Semak Resipi Evolusi (Senjata Lv 5 + Pasif)
            </div>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 text-[11px] font-mono">
              {(Object.keys(INITIAL_WEAPONS) as WeaponId[]).map((wId) => {
                const evo = WEAPON_EVOLUTIONS[wId];
                if (!evo) return null;
                const wState = weapons[wId];
                const pState = passives[evo.passive];
                const hasWep = wState && wState.level > 0;
                const hasPas = pState && pState.level > 0;
                const isDone = wState?.isEvolved;
                return (
                  <div
                    key={wId}
                    className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                      isDone
                        ? 'bg-amber-950/50 border-yellow-400/70'
                        : hasWep && hasPas
                        ? 'bg-emerald-950/40 border-emerald-500/60'
                        : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold text-yellow-300 truncate">★ {evo.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className={hasWep ? 'text-amber-300 font-bold' : ''}>
                          {INITIAL_WEAPONS[wId].name} {hasWep ? `(Lv${wState.level})` : ''}
                        </span>
                        <span>+</span>
                        <span className={hasPas ? 'text-cyan-300 font-bold' : ''}>
                          {INITIAL_PASSIVES[evo.passive].name} {hasPas ? `(Lv${pState.level})` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 font-bold shrink-0">
                      {isDone ? '★ EVOLVED' : hasWep && hasPas ? '✓ LENGKAP' : 'BELUM'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Archeotech Weapon Overclocks */}
        {activeTab === 'overclocks' && (
          <div className="flex flex-col gap-2.5 text-left max-h-[46vh] overflow-y-auto pr-1">
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs font-mono text-amber-200">
              <span className="font-bold">⚡ PENGUBAHSUAIAN ARCHEOTECH (LV6 EVOLVED):</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Pasang soket Archeotech Overclock ke atas senjata Lv.6 Evolved untuk menambah sifat kuasa khas!
              </p>
            </div>

            {evolvedWeapons.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500 border border-slate-800 rounded-xl bg-slate-950/60">
                Tiada senjata Evolved (Lv.6) dalam inventori semasa. Buka senjata Evolved untuk memasang soket Overclock!
              </div>
            ) : (
              evolvedWeapons.map(([wId, wConfig]) => {
                const selectedOc = overclocks[wId];
                const evoName = WEAPON_EVOLUTIONS[wId]?.name || wConfig.name;

                return (
                  <div key={wId} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-gothic font-bold text-amber-300 text-sm">★ {evoName}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800">
                        {selectedOc ? `SOKET: ${selectedOc}` : 'SOKET KOSONG'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                      {WEAPON_OVERCLOCK_DEFS.map(oc => {
                        const isChosen = selectedOc === oc.id;
                        return (
                          <button
                            key={oc.id}
                            onClick={() => handleSelectOverclock(wId, oc.id)}
                            className={`p-2 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                              isChosen
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <span>{oc.icon}</span>
                              <span>{oc.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{oc.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-gothic font-bold text-sm uppercase transition-all cursor-pointer shadow-lg"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Sambung Pertempuran</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleMute}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMuted ? 'SFX: OFF' : 'SFX: ON'}</span>
            </button>

            <button
              onClick={onOpenCodex}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Codex Penuh</span>
            </button>

            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Mula Semula</span>
            </button>

            <button
              onClick={onHome}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/80 text-rose-200 text-xs font-mono transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-rose-400" />
              <span>Menu Utama</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
