import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Volume2, VolumeX, Shield, Skull, Clock, Award, Crosshair, Keyboard, MousePointer, History, Download, Maximize2, Minimize2, Sparkles, Calendar, Database, Globe } from 'lucide-react';
import { HighScoreRecord, AimMode, RunHistoryEntry, GameLanguage } from '../types/game';
import { CHAPTER_DISPLAY_NAMES, MAP_DISPLAY_NAMES, getDailyDirective } from '../game/metaProgression';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface TitleScreenProps {
  onStart: () => void;
  onOpenCodex: () => void;
  onOpenArmory: () => void;
  onOpenAchievements: () => void;
  onOpenBackup?: () => void;
  onStartDailyDirective?: () => void;
  dailyDirectiveCompleted?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isBgmActive: boolean;
  onToggleBgm: () => void;
  puritySeals: number;
  highScore: HighScoreRecord;
  aimMode: AimMode;
  onSelectAimMode: (mode: AimMode) => void;
  runHistory?: RunHistoryEntry[];
  screenShakeOn?: boolean;
  onToggleScreenShake?: () => void;
  language?: GameLanguage;
  onToggleLanguage?: (lang: GameLanguage) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenCodex,
  onOpenArmory,
  onOpenAchievements,
  onOpenBackup,
  onStartDailyDirective,
  dailyDirectiveCompleted = false,
  isMuted,
  onToggleMute,
  isBgmActive,
  onToggleBgm,
  puritySeals,
  highScore,
  aimMode,
  onSelectAimMode,
  runHistory = [],
  screenShakeOn = true,
  onToggleScreenShake,
  language = 'ms',
  onToggleLanguage
}) => {
  const [activeStatsTab, setActiveStatsTab] = useState<'records' | 'history'>('records');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);
  const dailyDirective = getDailyDirective();

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    } else {
      setShowInstallHint((prev) => !prev);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const bestMinutes = Math.floor(highScore.survivalTime / 60);
  const bestSeconds = highScore.survivalTime % 60;
  const bestTimeStr = `${String(bestMinutes).padStart(2, '0')}:${String(bestSeconds).padStart(2, '0')}`;
  const canAffordArmory = puritySeals >= 20;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-between safe-p sm:p-6 select-none overflow-y-auto">
      {/* Top Tactical Header */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-900/80 border border-amber-400/70 flex items-center justify-center text-amber-300 font-gothic font-bold text-xs">
            Ω
          </div>
          <span className="font-bold tracking-wider text-slate-300 hidden sm:inline">
            ADEPTUS ASTARTES · v0.1.8 PWA
          </span>
          <span className="font-bold tracking-wider text-slate-300 sm:hidden">
            WH40K · v0.1.8
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Language Toggle */}
          {onToggleLanguage && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => onToggleLanguage('ms')}
                className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  language === 'ms' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Tukar ke Bahasa Melayu"
              >
                MY
              </button>
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  language === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>
          )}
          {/* Purity Seals Balance */}
          <button
            onClick={onOpenArmory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/15 border border-amber-500/50 rounded-lg text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer font-bold"
            title="Buka Imperial Armory"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{puritySeals} SEALS</span>
          </button>

          {/* Install PWA Button */}
          <button
            onClick={handleInstallPwa}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/50 rounded-lg text-cyan-200 transition-colors cursor-pointer"
            title="Pasang sebagai Aplikasi (PWA) di Telefon atau Desktop"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">PASANG APP</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Skrin Penuh' : 'Skrin Penuh (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-300" />}
          </button>

          {/* Screen Shake Toggle */}
          {onToggleScreenShake && (
            <button
              onClick={onToggleScreenShake}
              className={`px-2.5 py-1.5 border rounded-lg transition-colors cursor-pointer ${
                screenShakeOn
                  ? 'bg-purple-950/50 border-purple-500/60 text-purple-200 hover:bg-purple-900/50'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Hidupkan atau matikan Gegaran Skrin"
            >
              <span>{screenShakeOn ? '💥 GEGARAN: ON' : '🚫 GEGARAN: OFF'}</span>
            </button>
          )}

          {/* BGM Toggle */}
          <button
            onClick={onToggleBgm}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Muzik Latar (BGM)"
          >
            <span>{isBgmActive ? '🎵 BGM' : '🔇 BGM'}</span>
          </button>

          {/* SFX Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Kesan Bunyi (SFX)"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'SFX: OFF' : 'SFX: ON'}</span>
          </button>
        </div>
      </div>

      {/* PWA Install Guide Banner (if clicked when native prompt isn't available) */}
      {showInstallHint && (
        <div className="w-full max-w-xl mt-2 bg-cyan-950/90 border border-cyan-400/70 rounded-xl p-3 text-xs font-mono text-cyan-100 flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-cyan-300 block">📲 Cara Pasang Aplikasi (PWA):</span>
            <span>
              • <strong>iOS (Safari):</strong> Tekan ikon <em>Share</em> ➔ <strong>Add to Home Screen</strong>.<br />
              • <strong>Android / Chrome Desktop:</strong> Klik ikon <em>Install App</em> pada bar alamat pelayar.
            </span>
          </div>
          <button
            onClick={() => setShowInstallHint(false)}
            className="px-2.5 py-1 rounded bg-cyan-800/70 hover:bg-cyan-700 text-white font-bold shrink-0 cursor-pointer"
          >
            FAHAM
          </button>
        </div>
      )}

      {/* Main Hero Command Deck */}
      <div className="w-full max-w-2xl flex flex-col items-center text-center my-auto py-3">
        {/* Emblem + Title */}
        <div className="relative mb-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-blue-700 via-blue-900 to-slate-950 border-2 border-amber-400 shadow-[0_0_28px_rgba(245,158,11,0.35)] flex items-center justify-center">
            <span className="font-gothic text-3xl sm:text-4xl font-black text-amber-400 drop-shadow">
              Ω
            </span>
          </div>
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-[9px] tracking-widest uppercase shadow">
            8 CHAPTERS
          </span>
        </div>

        <h1 className="font-gothic text-3xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 uppercase leading-tight">
          Space Marine
        </h1>
        <h2 className="font-gothic text-base sm:text-xl font-bold tracking-widest text-rose-500 uppercase mb-2">
          Tyranid Hive Purge
        </h2>

        <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed mb-4">
          Pilih daripada 8 Chapter Space Marine, gabungkan evolusi senjata legenda, musnahkan struktur sarang Xenos, dan bertahan sehingga Thunderhawk tiba!
        </p>

        {/* Primary Launch CTA */}
        <button
          onClick={onStart}
          className="w-full max-w-md flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-gothic font-black text-base sm:text-lg tracking-wider uppercase transition-all duration-150 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:scale-[1.02] active:scale-[0.99] cursor-pointer mb-2.5"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>Lancarkan Operasi [MULA]</span>
        </button>

        {/* Daily Imperial Directive Quick-Launch Strip */}
        {onStartDailyDirective && (
          <button
            onClick={onStartDailyDirective}
            className="w-full max-w-md flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-950/75 via-slate-900/95 to-rose-950/70 hover:from-amber-900/80 hover:to-rose-900/80 border border-amber-500/50 text-left transition-all cursor-pointer shadow-md mb-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="font-gothic font-bold text-xs text-amber-200 truncate">
                  {dailyDirective.codeName}
                </div>
                <div className="text-[10px] font-mono text-slate-300 truncate">
                  {CHAPTER_DISPLAY_NAMES[dailyDirective.chapter]} · {MAP_DISPLAY_NAMES[dailyDirective.mapTheme]}
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded-lg font-mono text-[10px] font-bold shrink-0 ${
                dailyDirectiveCompleted
                  ? 'bg-emerald-500/20 border border-emerald-400/60 text-emerald-300'
                  : 'bg-amber-500/25 border border-amber-300 text-yellow-200 animate-pulse'
              }`}
            >
              {dailyDirectiveCompleted ? '✓ SELESAI' : '+100 SEALS'}
            </span>
          </button>
        )}

        {/* 4 Secondary Hub Cards (Armory, Achievements/Career, Codex, Save Backup) */}
        <div className="w-full max-w-md grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <button
            onClick={onOpenArmory}
            className="relative flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/50 text-amber-300 transition-all cursor-pointer shadow-md"
          >
            {canAffordArmory && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
            {canAffordArmory && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            )}
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="font-gothic font-bold text-xs text-slate-100">Armory</span>
            <span className="text-[10px] font-mono text-amber-400/90">Naik Taraf</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 text-purple-200 transition-all cursor-pointer shadow-md"
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span className="font-gothic font-bold text-xs text-slate-100">Pingat</span>
            <span className="text-[10px] font-mono text-purple-300/90">Kerjaya</span>
          </button>

          <button
            onClick={onOpenCodex}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-200 transition-all cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="font-gothic font-bold text-xs text-slate-100">Codex</span>
            <span className="text-[10px] font-mono text-cyan-300/90">14 EVO</span>
          </button>

          <button
            onClick={onOpenBackup || onOpenAchievements}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-emerald-200 transition-all cursor-pointer shadow-md"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-gothic font-bold text-xs text-slate-100">Sandaran</span>
            <span className="text-[10px] font-mono text-emerald-300/90">Simpan JSON</span>
          </button>
        </div>

        {/* Clean Control Scheme & Screen Shake Selector */}
        <div className="w-full max-w-xl bg-slate-900/85 border border-slate-800 rounded-xl p-3 mb-3 text-left shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400 uppercase">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>Mod Sasaran & Kawalan</span>
            </div>
            {onToggleScreenShake && (
              <button
                onClick={onToggleScreenShake}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  screenShakeOn
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {screenShakeOn ? '💥 Gegaran Skrin: ON' : '🚫 Gegaran Skrin: OFF'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onSelectAimMode('auto')}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                aimMode === 'auto'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
                <Keyboard className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">Auto-Aim</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5 leading-tight">
                WASD / Sentuh sahaja
              </span>
            </button>

            <button
              onClick={() => onSelectAimMode('hybrid')}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                aimMode === 'hybrid'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
                <MousePointer className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">Hybrid</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5 leading-tight">
                WASD + Mouse Utama
              </span>
            </button>

            <button
              onClick={() => onSelectAimMode('manual')}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                aimMode === 'manual'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
                <Crosshair className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate">Pointer Penuh</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5 leading-tight">
                Semua ikut kursor
              </span>
            </button>
          </div>
        </div>

        {/* Clean Tabbed Stats Card: Best Records vs Hall of Heroes */}
        <div className="w-full max-w-xl bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveStatsTab('records')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeStatsTab === 'records'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Rekod Terbaik</span>
              </button>
              <button
                onClick={() => setActiveStatsTab('history')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeStatsTab === 'history'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3 h-3" />
                <span>Hall of Heroes ({runHistory.length})</span>
              </button>
            </div>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              ARKIB CHAPTER
            </span>
          </div>

          {activeStatsTab === 'records' ? (
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>MASA TERBAIK</span>
                </div>
                <div className="text-sm font-bold text-slate-100 mt-0.5">{bestTimeStr}</div>
              </div>
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <Skull className="w-3 h-3 text-purple-400" />
                  <span>REKOD KILL</span>
                </div>
                <div className="text-sm font-bold text-purple-300 mt-0.5">{highScore.killCount}</div>
              </div>
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <Award className="w-3 h-3 text-cyan-400" />
                  <span>TAHAP TERTINGGI</span>
                </div>
                <div className="text-sm font-bold text-cyan-300 mt-0.5">LVL {highScore.highestLevel}</div>
              </div>
            </div>
          ) : runHistory.length === 0 ? (
            <div className="text-center py-3 text-xs font-mono text-slate-500">
              Tiada rekod pertempuran lagi. Mulakan operasi pertama anda!
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1">
              {runHistory.slice(0, 5).map((run) => {
                const m = Math.floor(run.survivalTime / 60);
                const s = run.survivalTime % 60;
                const tStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                const chMap: Record<string, string> = {
                  ultramarines: 'Ω Ultramarines',
                  blood_angels: '🩸 Blood Angels',
                  space_wolves: '🐺 Space Wolves',
                  dark_angels: '⚔️ Dark Angels',
                  salamanders: '🔥 Salamanders',
                  imperial_fists: '✊ Imperial Fists',
                  iron_hands: '⚙️ Iron Hands',
                  raven_guard: '🦅 Raven Guard'
                };
                const chLabel = chMap[run.chapter] || run.chapter;
                return (
                  <div
                    key={run.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-950/80 border border-slate-800/90 text-[11px] font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={run.victory ? 'text-emerald-400 font-bold' : 'text-slate-300 font-bold'}>
                        {run.victory ? '🏆 MENANG' : '💀 GUGUR'}
                      </span>
                      <span className="text-amber-300">{chLabel}</span>
                      {run.evolvedWeapons.length > 0 && (
                        <span className="text-[10px] text-yellow-300 truncate hidden sm:inline">
                          ★{run.evolvedWeapons[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 shrink-0 tabular-nums">
                      <span>{tStr}</span>
                      <span className="text-purple-300">{run.kills}💀</span>
                      <span className="text-cyan-300">Lv{run.level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls Hint */}
      <div className="w-full max-w-4xl border-t border-slate-800/80 pt-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
        <span>💻 PC: WASD + [SPACE] Dash + [Q] Ultimate + [F] Overdrive</span>
        <span>📱 Mobile: Kayu Ria Sentuh + Butang Aksi Kanan (Fury/Ult/Dash)</span>
      </div>
    </div>
  );
};
