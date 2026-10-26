import React, { useState } from 'react';
import {
  Award,
  Check,
  Sparkles,
  X,
  Shield,
  Skull,
  Zap,
  Flame,
  Crown,
  BarChart3,
  Database,
  Copy,
  Download,
  Upload,
  Trophy,
  Clock
} from 'lucide-react';
import { sounds } from '../services/audio';
import { CareerStatsRecord, ChapterMasteryMap } from '../types/game';
import {
  ALL_CHAPTERS,
  CHAPTER_DISPLAY_NAMES,
  exportCodexSaveJson,
  getChapterMasteryInfo,
  importCodexSaveJson,
  loadCareerStats,
  loadChapterMastery
} from '../game/metaProgression';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  rewardSeals: number;
  iconName: 'skull' | 'shield' | 'zap' | 'flame' | 'award' | 'crown';
}

const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_blood',
    title: 'Pembersihan Pertama',
    desc: 'Hapuskan sekurang-kurangnya 50 Tyranid dalam satu perlawanan.',
    rewardSeals: 30,
    iconName: 'skull'
  },
  {
    id: 'carnifex_bane',
    title: 'Penakluk Carnifex',
    desc: 'Tewaskan raksasa Carnifex dan selamatkan barisan hadapan.',
    rewardSeals: 60,
    iconName: 'shield'
  },
  {
    id: 'trygon_hunter',
    title: 'Pemburu Trygon Bawah Tanah',
    desc: 'Tewaskan bos bawah tanah Trygon Prime atau capai 2+ pembunuhan bos dalam satu misi.',
    rewardSeals: 90,
    iconName: 'zap'
  },
  {
    id: 'tyrant_slayer',
    title: 'Hive Tyrant Slayer',
    desc: 'Tewaskan Hive Tyrant agung dengan pukulan maut sinematik.',
    rewardSeals: 150,
    iconName: 'crown'
  },
  {
    id: 'godhammer_ascendant',
    title: 'Evolusi Senjata Legenda',
    desc: 'Capai evolusi senjata legenda Tahap 6 pertama anda.',
    rewardSeals: 80,
    iconName: 'zap'
  },
  {
    id: 'dreadnought_pilot',
    title: 'Kebangkitan Dreadnought',
    desc: 'Kutip Drop Pod dan pandu Castraferrum Dreadnought di medan tempur.',
    rewardSeals: 60,
    iconName: 'award'
  },
  {
    id: 'orbital_commander',
    title: 'Perintah Orbital Bombardment',
    desc: 'Aktifkan suar tembakan armada laser suci dari orbit.',
    rewardSeals: 50,
    iconName: 'flame'
  },
  {
    id: 'squad_brotherhood',
    title: 'Persaudaraan Astartes',
    desc: 'Panggil sokongan skuad AI Battle-Brothers ke sisi anda.',
    rewardSeals: 50,
    iconName: 'shield'
  },
  {
    id: 'endless_survivor',
    title: 'Veteran Hive City',
    desc: 'Bertahan melepasi 6 minit ekstraksi atau 10 minit pertempuran sengit.',
    rewardSeals: 120,
    iconName: 'award'
  }
];

const STORAGE_KEY = 'wh40k_sm_achievements_v1';

interface AchievementsModalProps {
  onClose: () => void;
  onClaimReward: (amount: number) => void;
  initialTab?: 'achievements' | 'career' | 'backup';
  careerStats?: CareerStatsRecord;
  chapterMastery?: ChapterMasteryMap;
  onImportSave?: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  onClose,
  onClaimReward,
  initialTab = 'achievements',
  careerStats,
  chapterMastery,
  onImportSave
}) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'career' | 'backup'>(initialTab);
  const [backupText, setBackupText] = useState<string>(() => exportCodexSaveJson());
  const [backupStatus, setBackupStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const [unlockedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      first_blood: true
    };
  });

  const [claimedMap, setClaimedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_claimed');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const resolvedCareer = careerStats || loadCareerStats();
  const resolvedMastery = chapterMastery || loadChapterMastery();

  const handleClaim = (ach: Achievement) => {
    if (!unlockedMap[ach.id] || claimedMap[ach.id]) return;

    sounds.playLevelUp();
    onClaimReward(ach.rewardSeals);

    setClaimedMap((prev) => {
      const updated = { ...prev, [ach.id]: true };
      try {
        localStorage.setItem(STORAGE_KEY + '_claimed', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleCopyJson = async () => {
    const fresh = exportCodexSaveJson();
    setBackupText(fresh);
    try {
      await navigator.clipboard.writeText(fresh);
      sounds.playPurchase();
      setBackupStatus({ type: 'ok', msg: 'Data sandaran Codex berjaya disalin ke papan keratan (Clipboard)!' });
    } catch {
      setBackupStatus({ type: 'err', msg: 'Tidak dapat menyalin automatik — sila salin teks di dalam kotak di bawah.' });
    }
  };

  const handleDownloadJson = () => {
    const fresh = exportCodexSaveJson();
    setBackupText(fresh);
    const blob = new Blob([fresh], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wh40k-hive-purge-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playPurchase();
    setBackupStatus({ type: 'ok', msg: 'Fail sandaran .json berjaya dimuat turun!' });
  };

  const handleApplyImport = (raw: string) => {
    const res = importCodexSaveJson(raw);
    if (!res.ok) {
      setBackupStatus({ type: 'err', msg: res.error || 'Gagal mengimport data.' });
      return;
    }
    sounds.playEvolution();
    setBackupStatus({ type: 'ok', msg: 'Rekod Codex Imperialis berjaya dipulihkan sepenuhnya!' });
    onImportSave?.();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const txt = String(reader.result || '');
      setBackupText(txt);
      handleApplyImport(txt);
    };
    reader.readAsText(file);
  };

  const getIcon = (name: Achievement['iconName']) => {
    switch (name) {
      case 'crown':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'skull':
        return <Skull className="w-5 h-5 text-purple-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      default:
        return <Award className="w-5 h-5 text-cyan-400" />;
    }
  };

  const unlockedCount = ACHIEVEMENTS_LIST.filter((a) => unlockedMap[a.id]).length;
  const totalPlayMins = Math.floor(resolvedCareer.totalPlayTime / 60);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-amber-500 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-gothic text-lg sm:text-2xl font-black text-amber-400 uppercase tracking-widest">
                Arkib Penghormatan & Rekod Kerjaya
              </h2>
              <p className="text-slate-400 text-xs font-mono">
                {unlockedCount} / {ACHIEVEMENTS_LIST.length} Pingat · Statistik Sepanjang Hayat & Sandaran JSON
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'achievements'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Pingat ({unlockedCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'career'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Kerjaya</span>
          </button>
          <button
            onClick={() => {
              setBackupText(exportCodexSaveJson());
              setActiveTab('backup');
            }}
            className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'backup'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Sandaran Data</span>
          </button>
        </div>

        {/* TAB 1: ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="flex flex-col gap-2.5">
            {ACHIEVEMENTS_LIST.map((ach) => {
              const isUnlocked = !!unlockedMap[ach.id];
              const isClaimed = !!claimedMap[ach.id];

              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isUnlocked
                      ? 'bg-slate-950/80 border-amber-500/50 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                        isUnlocked ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      {getIcon(ach.iconName)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-gothic font-bold text-sm ${isUnlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                          {ach.title}
                        </h3>
                        {isUnlocked && (
                          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                            SELESAI
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{ach.desc}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {!isUnlocked ? (
                      <span className="text-[11px] font-mono text-slate-500 px-3 py-1 rounded bg-slate-900 border border-slate-800">
                        TERKUNCI
                      </span>
                    ) : isClaimed ? (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 px-3 py-1 rounded bg-emerald-950/40 border border-emerald-800/50">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>DITEBUS</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClaim(ach)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-md cursor-pointer animate-pulse"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+{ach.rewardSeals} SEALS</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: LIFETIME CAREER STATS & CHAPTER MASTERY */}
        {activeTab === 'career' && (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 uppercase">Jumlah Operasi</div>
                <div className="text-lg font-black text-slate-100 mt-0.5">{resolvedCareer.totalRuns}</div>
              </div>
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3">
                <div className="text-[10px] text-emerald-400/80 uppercase flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Kemenangan
                </div>
                <div className="text-lg font-black text-emerald-300 mt-0.5">{resolvedCareer.totalVictories}</div>
              </div>
              <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-3">
                <div className="text-[10px] text-purple-400/80 uppercase flex items-center gap-1">
                  <Skull className="w-3 h-3" /> Xenos Dihapuskan
                </div>
                <div className="text-lg font-black text-purple-300 mt-0.5">
                  {resolvedCareer.totalKills.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-3">
                <div className="text-[10px] text-rose-400/80 uppercase">Bos Ditewaskan</div>
                <div className="text-lg font-black text-rose-300 mt-0.5">{resolvedCareer.totalBosses}</div>
              </div>
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3">
                <div className="text-[10px] text-amber-400/80 uppercase">Jumlah Seals Dikumpul</div>
                <div className="text-lg font-black text-amber-300 mt-0.5">
                  {resolvedCareer.totalSealsEarned.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3">
                <div className="text-[10px] text-cyan-400/80 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Masa Tempur
                </div>
                <div className="text-lg font-black text-cyan-300 mt-0.5">{totalPlayMins} min</div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <div className="text-xs font-mono font-bold text-amber-300 uppercase mb-2.5">
                Pangkat Veterancy Mengikut Chapter Astartes
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_CHAPTERS.map((ch) => {
                  const info = getChapterMasteryInfo(resolvedMastery[ch] || 0);
                  return (
                    <div key={ch} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-200">{CHAPTER_DISPLAY_NAMES[ch]}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold">
                          {info.rankTitle}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-amber-400"
                          style={{ width: `${Math.max(4, info.progressPct)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{info.xp} XP</span>
                        <span>
                          {info.nextThreshold ? `Seterusnya: ${info.nextThreshold} XP` : 'PANGKAT MAKSIMUM'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CODEX SAVE BACKUP (EXPORT / IMPORT JSON) */}
        {activeTab === 'backup' && (
          <div className="flex flex-col gap-3 font-mono">
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-200 leading-relaxed">
              💾 <strong>Sandaran Silang-Peranti (Desktop ⇄ Mobile PWA):</strong> Eksport atau salin JSON di bawah untuk menyimpan kemajuan <em>Purity Seals, Armory, Pangkat Chapter, Pingat & Rekod Kerjaya</em> anda.
            </div>

            {backupStatus && (
              <div
                className={`p-2.5 rounded-lg border text-xs font-bold ${
                  backupStatus.type === 'ok'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500 text-rose-300'
                }`}
              >
                {backupStatus.msg}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyJson}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/50 text-amber-300 text-xs font-bold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin JSON (Export)</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyan-500/50 text-cyan-300 text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Muat Turun .JSON</span>
              </button>

              <label className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-emerald-500/50 text-emerald-300 text-xs font-bold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Muat Naik .JSON</span>
                <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              value={backupText}
              onChange={(e) => setBackupText(e.target.value)}
              rows={7}
              spellCheck={false}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-amber-400"
              placeholder="Tampal (Paste) teks JSON sandaran Codex di sini untuk memulihkan simpanan..."
            />

            <button
              onClick={() => handleApplyImport(backupText)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
            >
              Pulihkan Data Dari Teks JSON Di Atas (Import)
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
