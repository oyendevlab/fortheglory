/**
 * Warhammer 40k: Space Marine Pixel Survivor
 * Main React Entrypoint
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { LevelUpModal } from './components/LevelUpModal';
import { RelicChestModal } from './components/RelicChestModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { CodexModal } from './components/CodexModal';
import { ChapterSelectModal } from './components/ChapterSelectModal';
import { ArmoryModal } from './components/ArmoryModal';
import { AchievementsModal } from './components/AchievementsModal';
import { VirtualJoystick } from './components/VirtualJoystick';
import { UpgradeOption, HighScoreRecord, MarineChapter, MapTheme, ArmoryUpgrades, GameMode, MarineSkin, AimMode, WeaponId, WeaponStatRecord, GameFeelSettings, RunHistoryEntry, CombatTrial, DynamicHiveEvent, MinimapBlip, OathId, ActiveBossInfo, ExtractionZoneInfo, WargearRelicId, ServoSkullMode, SquadBrotherType, ChapterMasteryMap, CareerStatsRecord, GameLanguage, HiveMutatorInfo } from './types/game';
import { generateUpgradeChoices } from './game/upgrades';
import {
  calculateRunChapterXp,
  getChapterMasteryInfo,
  getDailyDirective,
  isDailyDirectiveCompleted,
  loadCareerStats,
  loadChapterMastery,
  markDailyDirectiveCompleted,
  saveCareerStats,
  saveChapterMastery
} from './game/metaProgression';
import { sounds } from './services/audio';
import { loadSavedLanguage, saveLanguage } from './game/i18n';

const STORAGE_KEY = 'wh40k_sm_highscore_v1';
const SEALS_KEY = 'wh40k_sm_purity_seals_v1';
const ARMORY_KEY = 'wh40k_sm_armory_v1';
const AIM_MODE_KEY = 'wh40k_sm_aim_mode_v1';
const GAME_FEEL_KEY = 'wh40k_sm_game_feel_v1';
const RUN_HISTORY_KEY = 'wh40k_sm_run_history_v1';
const ACHIEVEMENTS_KEY = 'wh40k_sm_achievements_v1';

function unlockAchievementsInStorage(ids: string[]): void {
  if (ids.length === 0) return;
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    const map: Record<string, boolean> = raw ? JSON.parse(raw) : { first_blood: true };
    let changed = false;
    for (const id of ids) {
      if (!map[id]) {
        map[id] = true;
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore storage errors
  }
}

const DEFAULT_ARMORY: ArmoryUpgrades = {
  healthBonus: 0,
  speedBonus: 0,
  magnetBonus: 0,
  critBonus: 0,
  rerollBonus: 0,
  servoSkullLevel: 0,
  servoSkullMode: 'laser',
  preferredBrother: 'auto'
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const isDailyRunRef = useRef<boolean>(false);

  // High score state
  const [highScore, setHighScore] = useState<HighScoreRecord>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { survivalTime: 0, killCount: 0, highestLevel: 1, bossesKilled: 0, puritySeals: 0 };
  });

  // Purity Seals & Imperial Armory state
  const [puritySeals, setPuritySeals] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SEALS_KEY);
      if (saved) return parseInt(saved, 10) || 0;
    } catch {
      // ignore
    }
    return 0;
  });

  const [armory, setArmory] = useState<ArmoryUpgrades>(() => {
    try {
      const saved = localStorage.getItem(ARMORY_KEY);
      if (saved) return { ...DEFAULT_ARMORY, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_ARMORY;
  });

  // Selected Chapter, Skin, Map Theme, Game Mode, and Oaths of Moment
  const [selectedChapter, setSelectedChapter] = useState<MarineChapter>('ultramarines');
  const [selectedSkin, setSelectedSkin] = useState<MarineSkin>('standard');
  const [selectedMap, setSelectedMap] = useState<MapTheme>('hive_city');
  const [selectedMode, setSelectedMode] = useState<GameMode>('standard');
  const [selectedOaths, setSelectedOaths] = useState<OathId[]>([]);
  const [language, setLanguage] = useState<GameLanguage>(() => loadSavedLanguage());

  const handleToggleLanguage = (lang: GameLanguage) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  // Modal & Engine State mirrors
  const [gameState, setGameState] = useState<'TITLE' | 'PLAYING' | 'PAUSED' | 'LEVEL_UP' | 'GAME_OVER' | 'CHEST_REWARD'>('TITLE');
  const [levelUpChoices, setLevelUpChoices] = useState<UpgradeOption[]>([]);
  const [chestRewards, setChestRewards] = useState<UpgradeOption[]>([]);
  const [jackpotCount, setJackpotCount] = useState<1 | 3 | 5>(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [rerollsLeft, setRerollsLeft] = useState(2);
  const [banishesLeft, setBanishesLeft] = useState(2);
  const [lockedUpgrade, setLockedUpgrade] = useState<UpgradeOption | null>(null);
  const [showCodex, setShowCodex] = useState(false);
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [showArmory, setShowArmory] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementsInitialTab, setAchievementsInitialTab] = useState<'achievements' | 'career' | 'backup'>('achievements');
  const [isMuted, setIsMuted] = useState(() => sounds.getMuted());
  const [isBgmActive, setIsBgmActive] = useState(() => sounds.isBgmRunning());
  const [aimMode, setAimMode] = useState<AimMode>(() => {
    try {
      const saved = localStorage.getItem(AIM_MODE_KEY);
      if (saved === 'auto' || saved === 'hybrid' || saved === 'manual') return saved;
    } catch {
      // fallback
    }
    return 'hybrid';
  });

  const [gameFeel, setGameFeel] = useState<GameFeelSettings>(() => {
    try {
      const saved = localStorage.getItem(GAME_FEEL_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { damageNumbers: 'all', screenShake: 'high' };
  });

  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(RUN_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [chapterMastery, setChapterMastery] = useState<ChapterMasteryMap>(() => loadChapterMastery());
  const [careerStats, setCareerStats] = useState<CareerStatsRecord>(() => loadCareerStats(runHistory, highScore));
  const [dailyCompleted, setDailyCompleted] = useState<boolean>(() => isDailyDirectiveCompleted());

  const handleChangeGameFeel = (next: GameFeelSettings) => {
    setGameFeel(next);
    if (engineRef.current) {
      engineRef.current.gameFeel = next;
    }
    try {
      localStorage.setItem(GAME_FEEL_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleToggleScreenShake = () => {
    const isCurrentlyOn = gameFeel.screenShake !== 'off';
    const nextFeel: GameFeelSettings = {
      ...gameFeel,
      screenShake: isCurrentlyOn ? 'off' : 'high'
    };
    handleChangeGameFeel(nextFeel);
  };

  const handleSelectAimMode = (mode: AimMode) => {
    setAimMode(mode);
    if (engineRef.current) {
      engineRef.current.aimMode = mode;
    }
    try {
      localStorage.setItem(AIM_MODE_KEY, mode);
    } catch {
      // ignore
    }
  };

  const handleCycleAimMode = () => {
    const nextMode: AimMode = aimMode === 'auto' ? 'hybrid' : aimMode === 'hybrid' ? 'manual' : 'auto';
    handleSelectAimMode(nextMode);
  };

  // Realtime HUD stats
  const [hudStats, setHudStats] = useState<{
    hp: number;
    maxHp: number;
    shield: number;
    maxShield: number;
    xp: number;
    xpNeeded: number;
    level: number;
    time: number;
    remainingTime: number;
    maxGameTime: number;
    kills: number;
    streakCount: number;
    streakTimerPct: number;
    isZealActive: boolean;
    dashCooldownPct: number;
    dreadnoughtTimerPct: number;
    ultimateCooldownPct: number;
    furyPct?: number;
    overdrivePct?: number;
    activeTrial?: CombatTrial | null;
    activeHiveEvent?: DynamicHiveEvent | null;
    minimapBlips?: MinimapBlip[];
    activeBosses?: ActiveBossInfo[];
    extractionZone?: ExtractionZoneInfo | null;
    activeRelics?: WargearRelicId[];
    activeOaths?: OathId[];
    activeMutator?: HiveMutatorInfo | null;
  }>({
    hp: 130,
    maxHp: 130,
    shield: 0,
    maxShield: 0,
    xp: 0,
    xpNeeded: 8,
    level: 1,
    time: 0,
    remainingTime: 360,
    maxGameTime: 360,
    kills: 0,
    streakCount: 0,
    streakTimerPct: 0,
    isZealActive: false,
    dashCooldownPct: 0,
    dreadnoughtTimerPct: 0,
    ultimateCooldownPct: 0,
    furyPct: 0,
    overdrivePct: 0,
    activeTrial: null,
    activeHiveEvent: null,
    minimapBlips: [],
    activeBosses: [],
    extractionZone: null,
    activeRelics: [],
    activeOaths: []
  });

  // Game over stats
  const [gameOverStats, setGameOverStats] = useState<{
    time: number;
    kills: number;
    level: number;
    bossesKilled: number;
    puritySealsEarned: number;
    weaponStats?: Record<WeaponId, WeaponStatRecord>;
    victory?: boolean;
    evolvedWeapons?: string[];
    chapterXpEarned?: number;
    chapterRankTitle?: string;
    dailyDirectiveBonus?: number;
  }>({
    time: 0,
    kills: 0,
    level: 1,
    bossesKilled: 0,
    puritySealsEarned: 0
  });

  // Initialize GameEngine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onLevelUp: (choices, level) => {
        setLevelUpChoices(choices);
        setCurrentLevel(level);
        setGameState('LEVEL_UP');
      },
      onRelicChest: (rewards, jCount) => {
        setChestRewards(rewards);
        setJackpotCount(jCount || 1);
        setGameState('CHEST_REWARD');
      },
      onGameOver: (stats) => {
        const isSandbox = engine.gameMode === 'firing_range';
        const baseEarned = isSandbox
          ? 0
          : (stats.puritySealsEarned ?? Math.floor(stats.kills + stats.time / 10 + stats.bossesKilled * 25));

        let dailyDirectiveBonus = 0;
        if (!isSandbox && isDailyRunRef.current && stats.victory && !isDailyDirectiveCompleted()) {
          dailyDirectiveBonus = 100;
          markDailyDirectiveCompleted();
          setDailyCompleted(true);
        }

        const totalEarned = baseEarned + dailyDirectiveBonus;
        const chapterXpEarned = isSandbox ? 0 : calculateRunChapterXp(stats);
        const latestMastery = loadChapterMastery();
        const nextChapterXp = (latestMastery[engine.chapter] || 0) + chapterXpEarned;
        if (!isSandbox && chapterXpEarned > 0) {
          latestMastery[engine.chapter] = nextChapterXp;
          saveChapterMastery(latestMastery);
          setChapterMastery(latestMastery);
        }
        const chapterRankTitle = getChapterMasteryInfo(nextChapterXp).rankTitle;

        if (!isSandbox) {
          const unlockedIds: string[] = [];
          if (stats.kills >= 50) unlockedIds.push('first_blood');
          if (stats.bossesKilled >= 1) unlockedIds.push('carnifex_bane');
          if (stats.bossesKilled >= 2) unlockedIds.push('trygon_hunter');
          if (stats.victory) unlockedIds.push('tyrant_slayer');
          if ((stats.evolvedWeapons?.length || 0) > 0) unlockedIds.push('godhammer_ascendant');
          if (stats.victory || stats.time >= 360) unlockedIds.push('endless_survivor');
          unlockAchievementsInStorage(unlockedIds);

          setCareerStats((prev) => {
            const nextCareer: CareerStatsRecord = {
              totalRuns: prev.totalRuns + 1,
              totalVictories: prev.totalVictories + (stats.victory ? 1 : 0),
              totalKills: prev.totalKills + stats.kills,
              totalBosses: prev.totalBosses + stats.bossesKilled,
              totalSealsEarned: prev.totalSealsEarned + totalEarned,
              totalPlayTime: prev.totalPlayTime + stats.time
            };
            saveCareerStats(nextCareer);
            return nextCareer;
          });
        }

        setGameOverStats({
          ...stats,
          puritySealsEarned: totalEarned,
          chapterXpEarned,
          chapterRankTitle,
          dailyDirectiveBonus
        });
        setGameState('GAME_OVER');
        sounds.stopBgm();
        setIsBgmActive(false);

        if (!isSandbox) {
          // Save to Hall of Heroes (last 5 runs)
          const newEntry: RunHistoryEntry = {
            id: `${Date.now()}`,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            chapter: engine.chapter,
            mode: engine.gameMode,
            survivalTime: stats.time,
            kills: stats.kills,
            level: stats.level,
            bossesKilled: stats.bossesKilled,
            puritySeals: totalEarned,
            victory: !!stats.victory,
            evolvedWeapons: stats.evolvedWeapons || []
          };
          setRunHistory((prev) => {
            const next = [newEntry, ...prev].slice(0, 5);
            try {
              localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(next));
            } catch {
              // ignore
            }
            return next;
          });

          // Add earned Purity Seals
          setPuritySeals((prev) => {
            const nextVal = prev + totalEarned;
            try {
              localStorage.setItem(SEALS_KEY, String(nextVal));
            } catch {
              // ignore
            }
            return nextVal;
          });

          // Update High Score if beaten
          setHighScore((prev) => {
            const newRecord: HighScoreRecord = {
              survivalTime: Math.max(prev.survivalTime, stats.time),
              killCount: Math.max(prev.killCount, stats.kills),
              highestLevel: Math.max(prev.highestLevel, stats.level),
              bossesKilled: Math.max(prev.bossesKilled, stats.bossesKilled),
              puritySeals: Math.max(prev.puritySeals || 0, totalEarned)
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecord));
            } catch {
              // ignore
            }
            return newRecord;
          });
        }
      },
      onStatsUpdate: (stats) => {
        if (engine.gameMode !== 'firing_range') {
          const liveUnlocks: string[] = [];
          if ((stats.dreadnoughtTimerPct || 0) > 0) liveUnlocks.push('dreadnought_pilot');
          if (engine.orbitalStrikes.length > 0) liveUnlocks.push('orbital_commander');
          if (engine.squadBrothers.length > 0) liveUnlocks.push('squad_brotherhood');
          if (liveUnlocks.length > 0) unlockAchievementsInStorage(liveUnlocks);
        }
        setHudStats({
          ...stats,
          dreadnoughtTimerPct: stats.dreadnoughtTimerPct || 0,
          furyPct: stats.furyPct || 0,
          overdrivePct: stats.overdrivePct || 0
        });
      }
    });

    engine.aimMode = aimMode;
    engine.gameFeel = gameFeel;
    engineRef.current = engine;

    return () => {
      engine.destroy();
      sounds.stopBgm();
    };
  }, []);

  // Auto-pause when tab is hidden or PWA is minimized
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && gameState === 'PLAYING' && engineRef.current) {
        engineRef.current.pauseGame();
        setGameState('PAUSED');
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [gameState]);

  // Handlers
  const handleOpenChapterSelect = () => {
    setShowChapterSelect(true);
  };

  const launchBattle = (
    chapter: MarineChapter,
    mapTheme: MapTheme,
    mode: GameMode,
    skin: MarineSkin,
    oaths: OathId[] = [],
    isDaily: boolean = false
  ) => {
    if (!engineRef.current) return;
    isDailyRunRef.current = isDaily;
    setSelectedChapter(chapter);
    setSelectedMap(mapTheme);
    setSelectedMode(mode);
    setSelectedSkin(skin);
    setSelectedOaths(oaths);
    setShowChapterSelect(false);
    setRerollsLeft(2 + armory.rerollBonus + (chapter === 'ultramarines' ? 1 : 0));
    setBanishesLeft(2);
    setLockedUpgrade(null);
    engineRef.current.startNewGame(chapter, mapTheme, armory, mode, skin, oaths);
    setGameState('PLAYING');
    sounds.startBgm();
    setIsBgmActive(true);
  };

  const handleStartBattle = (chapter: MarineChapter, mapTheme: MapTheme, mode: GameMode, skin: MarineSkin, oaths: OathId[] = []) => {
    launchBattle(chapter, mapTheme, mode, skin, oaths, false);
  };

  const handleStartDailyDirective = () => {
    const dir = getDailyDirective();
    launchBattle(dir.chapter, dir.mapTheme, 'standard', selectedSkin, [dir.oath], true);
  };

  const handlePause = () => {
    if (!engineRef.current) return;
    engineRef.current.pauseGame();
    setGameState('PAUSED');
  };

  const handleResume = () => {
    if (!engineRef.current) return;
    engineRef.current.resumeGame();
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    if (!engineRef.current) return;
    setRerollsLeft(2 + armory.rerollBonus + (selectedChapter === 'ultramarines' ? 1 : 0));
    setBanishesLeft(2);
    setLockedUpgrade(null);
    engineRef.current.startNewGame(selectedChapter, selectedMap, armory, selectedMode, selectedSkin, selectedOaths);
    setGameState('PLAYING');
    sounds.startBgm();
    setIsBgmActive(true);
  };

  const handleHome = () => {
    if (!engineRef.current) return;
    engineRef.current.state = 'TITLE';
    setGameState('TITLE');
    sounds.stopBgm();
    setIsBgmActive(false);
  };

  const handleSelectUpgrade = (option: UpgradeOption) => {
    if (!engineRef.current) return;
    if (lockedUpgrade && lockedUpgrade.id === option.id && lockedUpgrade.category === option.category) {
      setLockedUpgrade(null);
    }
    engineRef.current.applyUpgrade(option);
    setGameState('PLAYING');
  };

  const handleToggleLockUpgrade = (option: UpgradeOption) => {
    if (!engineRef.current) return;
    const isSame = lockedUpgrade && lockedUpgrade.id === option.id && lockedUpgrade.category === option.category;
    const nextLock = isSame ? null : option;
    setLockedUpgrade(nextLock);
    engineRef.current.lockedUpgrade = nextLock;
    sounds.playPurchase();
  };

  const handleChooseBossReward = (option: UpgradeOption) => {
    if (!engineRef.current) return;
    engineRef.current.claimBossReward(option);
    setGameState('PLAYING');
  };

  const handleClaimRelicChest = () => {
    if (!engineRef.current) return;
    engineRef.current.applyMultipleUpgrades(chestRewards);
    setGameState('PLAYING');
  };

  const handleDash = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerDash();
    }
  }, []);

  const handleTriggerUltimate = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerUltimate();
    }
  }, []);

  const handleTriggerOverdrive = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerOverdrive();
    }
  }, []);

  const handleFiringRangeLevelUp = () => {
    if (engineRef.current) {
      engineRef.current.triggerFiringRangeLevelUp();
    }
  };

  const handleFiringRangeWave = () => {
    if (engineRef.current) {
      engineRef.current.spawnFiringRangeWave();
    }
  };

  const handleReroll = () => {
    if (!engineRef.current || rerollsLeft <= 0) return;
    setRerollsLeft((prev) => Math.max(0, prev - 1));
    const maxWep = selectedOaths.includes('oath_penance') ? 4 : 6;
    const newChoices = generateUpgradeChoices(
      engineRef.current.weapons,
      engineRef.current.passives,
      lockedUpgrade,
      engineRef.current.banishedIds,
      3,
      maxWep
    );
    setLevelUpChoices(newChoices);
    sounds.playLevelUp();
  };

  const handleBanishUpgrade = (option: UpgradeOption) => {
    if (!engineRef.current || banishesLeft <= 0) return;
    setBanishesLeft((prev) => Math.max(0, prev - 1));
    if (lockedUpgrade && lockedUpgrade.id === option.id && lockedUpgrade.category === option.category) {
      setLockedUpgrade(null);
      engineRef.current.lockedUpgrade = null;
    }
    engineRef.current.banishedIds.add(option.id);
    const maxWep = selectedOaths.includes('oath_penance') ? 4 : 6;
    const newChoices = generateUpgradeChoices(
      engineRef.current.weapons,
      engineRef.current.passives,
      lockedUpgrade,
      engineRef.current.banishedIds,
      3,
      maxWep
    );
    setLevelUpChoices(newChoices);
    sounds.playPurchase();
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleBgm = () => {
    const active = sounds.toggleBgm();
    setIsBgmActive(active);
  };

  const handleUpgradeArmory = (key: keyof ArmoryUpgrades, cost: number) => {
    if (puritySeals < cost) return;
    setPuritySeals((prev) => {
      const nextSeals = prev - cost;
      try {
        localStorage.setItem(SEALS_KEY, String(nextSeals));
      } catch {
        // ignore
      }
      return nextSeals;
    });

    setArmory((prev) => {
      const currentVal = typeof prev[key] === 'number' ? (prev[key] as number) : 0;
      const nextArmory = {
        ...prev,
        [key]: currentVal + 1
      };
      try {
        localStorage.setItem(ARMORY_KEY, JSON.stringify(nextArmory));
      } catch {
        // ignore
      }
      return nextArmory;
    });
  };

  const handleSelectServoMode = (mode: ServoSkullMode) => {
    setArmory((prev) => {
      const nextArmory: ArmoryUpgrades = {
        ...prev,
        servoSkullMode: mode
      };
      try {
        localStorage.setItem(ARMORY_KEY, JSON.stringify(nextArmory));
      } catch {
        // ignore
      }
      return nextArmory;
    });
  };

  const handleSelectPreferredBrother = (brother: 'auto' | SquadBrotherType) => {
    setArmory((prev) => {
      const nextArmory: ArmoryUpgrades = {
        ...prev,
        preferredBrother: brother
      };
      try {
        localStorage.setItem(ARMORY_KEY, JSON.stringify(nextArmory));
      } catch {
        // ignore
      }
      return nextArmory;
    });
  };

  const handleImportSave = () => {
    let nextHighScore: HighScoreRecord = { survivalTime: 0, killCount: 0, highestLevel: 1, bossesKilled: 0, puritySeals: 0 };
    let nextHistory: RunHistoryEntry[] = [];
    try {
      const hsRaw = localStorage.getItem(STORAGE_KEY);
      if (hsRaw) nextHighScore = JSON.parse(hsRaw);
    } catch {
      // ignore
    }
    try {
      const sealsRaw = localStorage.getItem(SEALS_KEY);
      setPuritySeals(sealsRaw ? parseInt(sealsRaw, 10) || 0 : 0);
    } catch {
      // ignore
    }
    try {
      const armoryRaw = localStorage.getItem(ARMORY_KEY);
      setArmory(armoryRaw ? { ...DEFAULT_ARMORY, ...JSON.parse(armoryRaw) } : DEFAULT_ARMORY);
    } catch {
      // ignore
    }
    try {
      const histRaw = localStorage.getItem(RUN_HISTORY_KEY);
      if (histRaw) nextHistory = JSON.parse(histRaw);
    } catch {
      // ignore
    }
    try {
      const aimRaw = localStorage.getItem(AIM_MODE_KEY);
      if (aimRaw === 'auto' || aimRaw === 'hybrid' || aimRaw === 'manual') {
        setAimMode(aimRaw);
        if (engineRef.current) engineRef.current.aimMode = aimRaw;
      }
    } catch {
      // ignore
    }
    try {
      const feelRaw = localStorage.getItem(GAME_FEEL_KEY);
      if (feelRaw) {
        const parsedFeel = JSON.parse(feelRaw);
        setGameFeel(parsedFeel);
        if (engineRef.current) engineRef.current.gameFeel = parsedFeel;
      }
    } catch {
      // ignore
    }

    setHighScore(nextHighScore);
    setRunHistory(nextHistory);
    setChapterMastery(loadChapterMastery());
    setCareerStats(loadCareerStats(nextHistory, nextHighScore));
    setDailyCompleted(isDailyDirectiveCompleted());
  };

  const handleClaimAchievementReward = (amount: number) => {
    setPuritySeals((prev) => {
      const nextVal = prev + amount;
      try {
        localStorage.setItem(SEALS_KEY, String(nextVal));
      } catch {
        // ignore
      }
      return nextVal;
    });
  };

  const handleJoystickMove = useCallback((dir: { x: number; y: number }) => {
    if (engineRef.current) {
      engineRef.current.inputDir = dir;
    }
  }, []);

  const isScreenShakeOn = gameFeel.screenShake !== 'off';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 2D HTML5 Canvas for Pixel Art Game Engine */}
      <canvas
        ref={canvasRef}
        className="pixelated absolute inset-0 block w-full h-full cursor-crosshair"
      />

      {/* Title Screen View */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStart={handleOpenChapterSelect}
          onOpenCodex={() => setShowCodex(true)}
          onOpenArmory={() => setShowArmory(true)}
          onOpenAchievements={() => {
            setAchievementsInitialTab('achievements');
            setShowAchievements(true);
          }}
          onOpenBackup={() => {
            setAchievementsInitialTab('backup');
            setShowAchievements(true);
          }}
          onStartDailyDirective={handleStartDailyDirective}
          dailyDirectiveCompleted={dailyCompleted}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isBgmActive={isBgmActive}
          onToggleBgm={handleToggleBgm}
          puritySeals={puritySeals}
          highScore={highScore}
          aimMode={aimMode}
          onSelectAimMode={handleSelectAimMode}
          runHistory={runHistory}
          screenShakeOn={isScreenShakeOn}
          onToggleScreenShake={handleToggleScreenShake}
          language={language}
          onToggleLanguage={handleToggleLanguage}
        />
      )}

      {/* Chapter & Map Selection Modal */}
      {showChapterSelect && (
        <ChapterSelectModal
          onStartBattle={handleStartBattle}
          onBack={() => setShowChapterSelect(false)}
          aimMode={aimMode}
          onSelectAimMode={handleSelectAimMode}
          screenShakeOn={isScreenShakeOn}
          onToggleScreenShake={handleToggleScreenShake}
          chapterMastery={chapterMastery}
          onStartDailyDirective={handleStartDailyDirective}
          dailyDirectiveCompleted={dailyCompleted}
        />
      )}

      {/* Imperial Armory Modal */}
      {showArmory && (
        <ArmoryModal
          puritySeals={puritySeals}
          armory={armory}
          onUpgrade={handleUpgradeArmory}
          onSelectServoMode={handleSelectServoMode}
          onSelectPreferredBrother={handleSelectPreferredBrother}
          onPuritySealsChange={(newBalance) => {
            setPuritySeals(newBalance);
            localStorage.setItem(SEALS_KEY, String(newBalance));
          }}
          onClose={() => setShowArmory(false)}
        />
      )}

      {/* Achievements & Imperial Honors Modal */}
      {showAchievements && (
        <AchievementsModal
          initialTab={achievementsInitialTab}
          careerStats={careerStats}
          chapterMastery={chapterMastery}
          onImportSave={handleImportSave}
          onClaimReward={handleClaimAchievementReward}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* In-Game Heads-Up Display (HUD) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'LEVEL_UP' || gameState === 'CHEST_REWARD') && engineRef.current && (
        <>
          <HUD
            hp={hudStats.hp}
            maxHp={hudStats.maxHp}
            shield={hudStats.shield}
            maxShield={hudStats.maxShield}
            xp={hudStats.xp}
            xpNeeded={hudStats.xpNeeded}
            level={hudStats.level}
            time={hudStats.time}
            remainingTime={hudStats.remainingTime}
            maxGameTime={hudStats.maxGameTime}
            kills={hudStats.kills}
            weapons={engineRef.current.weapons}
            passives={engineRef.current.passives}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
            streakCount={hudStats.streakCount}
            streakTimerPct={hudStats.streakTimerPct}
            isZealActive={hudStats.isZealActive}
            dashCooldownPct={hudStats.dashCooldownPct}
            dreadnoughtTimerPct={hudStats.dreadnoughtTimerPct}
            ultimateCooldownPct={hudStats.ultimateCooldownPct}
            furyPct={hudStats.furyPct}
            overdrivePct={hudStats.overdrivePct}
            onTriggerOverdrive={handleTriggerOverdrive}
            chapter={selectedChapter}
            onTriggerUltimate={handleTriggerUltimate}
            activeTrial={hudStats.activeTrial}
            activeHiveEvent={hudStats.activeHiveEvent}
            minimapBlips={hudStats.minimapBlips}
            isBgmActive={isBgmActive}
            onToggleBgm={handleToggleBgm}
            aimMode={aimMode}
            onCycleAimMode={handleCycleAimMode}
            activeBosses={hudStats.activeBosses}
            extractionZone={hudStats.extractionZone}
            activeRelics={hudStats.activeRelics}
            activeOaths={hudStats.activeOaths}
            activeMutator={hudStats.activeMutator}
            gameMode={selectedMode}
            onFiringRangeLevelUp={handleFiringRangeLevelUp}
            onFiringRangeWave={handleFiringRangeWave}
            screenShakeOn={isScreenShakeOn}
            onToggleScreenShake={handleToggleScreenShake}
          />

          {/* Virtual Joystick & Mobile Right-Thumb Action Cluster */}
          <VirtualJoystick 
            onMove={handleJoystickMove} 
            onDash={handleDash}
            dashCooldownPct={hudStats.dashCooldownPct}
            onTriggerUltimate={handleTriggerUltimate}
            ultimateCooldownPct={hudStats.ultimateCooldownPct}
            onTriggerOverdrive={handleTriggerOverdrive}
            furyPct={hudStats.furyPct}
            overdrivePct={hudStats.overdrivePct}
          />
        </>
      )}

      {/* Level Up Selection Modal */}
      {gameState === 'LEVEL_UP' && (
        <LevelUpModal
          level={currentLevel}
          choices={levelUpChoices}
          onSelect={handleSelectUpgrade}
          onReroll={handleReroll}
          rerollsLeft={rerollsLeft}
          lockedUpgrade={lockedUpgrade}
          onToggleLock={handleToggleLockUpgrade}
          banishesLeft={banishesLeft}
          onBanish={handleBanishUpgrade}
        />
      )}

      {/* Relic Drop Pod Chest Modal */}
      {gameState === 'CHEST_REWARD' && (
        <RelicChestModal
          rewards={chestRewards}
          onClaim={handleClaimRelicChest}
          onChoose={handleChooseBossReward}
          source={engineRef.current?.getRewardSource()}
          jackpotCount={jackpotCount}
        />
      )}

      {/* Pause Menu Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenCodex={() => setShowCodex(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          weapons={engineRef.current!.weapons}
          passives={engineRef.current!.passives}
          weaponStats={engineRef.current!.weaponStats}
          aimMode={aimMode}
          onSelectAimMode={handleSelectAimMode}
          gameFeel={gameFeel}
          onChangeGameFeel={handleChangeGameFeel}
          language={language}
          onToggleLanguage={handleToggleLanguage}
        />
      )}

      {/* Game Over View */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={gameOverStats}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* Codex Encyclopedia Modal */}
      {showCodex && (
        <CodexModal onClose={() => setShowCodex(false)} />
      )}
    </div>
  );
}
