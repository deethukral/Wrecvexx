/**
 * Pixel Striker: Retro Galaxy
 * Main Application Component
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  DifficultyLevel,
  ShipSkin,
  GameplayBooster,
  GameStats,
  Player,
  Boss,
  GameState,
} from './game/types';
import { GameEngine } from './game/engine';
import { soundManager } from './game/audio';
import {
  loadSkins,
  saveUnlockedSkin,
  loadEquippedSkin,
  saveEquippedSkin,
  loadBoosters,
  saveBoosterLevel,
  loadUserCredits,
  saveUserCredits,
  IAPPack,
} from './game/shopData';
import { getPersonalBest } from './game/leaderboardData';
import { usePWAInstall } from './hooks/usePWAInstall';

import { TitleMenu } from './components/TitleMenu';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { StoreModal } from './components/StoreModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GooglePlayLaunchKitModal } from './components/GooglePlayLaunchKitModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  // PWA Install hook
  const { isInstallable: isPWAInstallable, isInstalled: isPWAInstalled, install: installPWA } = usePWAInstall();

  // Shop & Player Inventory
  const [skins, setSkins] = useState<ShipSkin[]>(loadSkins());
  const [equippedSkinId, setEquippedSkinId] = useState<string>(loadEquippedSkin());
  const [boosters, setBoosters] = useState<GameplayBooster[]>(loadBoosters());
  const [credits, setCredits] = useState<number>(loadUserCredits());

  // Game Configuration
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('ACE');
  const [graphicsMode, setGraphicsMode] = useState<'HD' | 'RETRO'>('HD');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(false); // default crisp HD
  const [screenShake, setScreenShake] = useState<number>(1.0);
  const [useVirtualStick, setUseVirtualStick] = useState<boolean>(false);
  const [autoFire, setAutoFire] = useState<boolean>(true);

  // High score tracking
  const [highScore, setHighScore] = useState<number>(getPersonalBest('ACE'));

  // App & Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  // Modal Dialogs
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isLaunchKitOpen, setIsLaunchKitOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);

  // Runtime HUD stats
  const [currentStats, setCurrentStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    stage: 1,
    wave: 1,
    enemiesDestroyed: 0,
    bossesDefeated: 0,
    shotsFired: 0,
    shotsHit: 0,
    creditsEarned: 0,
    timeSurvivedSeconds: 0,
    combo: 0,
    maxCombo: 0,
  });

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentBoss, setCurrentBoss] = useState<Boss | null>(null);

  // Engine Reference
  const engineRef = useRef<GameEngine | null>(null);

  const equippedSkin = skins.find(s => s.id === equippedSkinId) || skins[0];

  // Refresh personal best when difficulty changes
  useEffect(() => {
    setHighScore(getPersonalBest(difficulty));
  }, [difficulty]);

  // Start a new game run
  const handleStartGame = () => {
    setGameState('PLAYING');
    setIsGameOverOpen(false);
    setIsVictoryOpen(false);
    setIsPaused(false);

    // Give browser time to mount Canvas if transitioning from Menu
    setTimeout(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return;

      const engine = new GameEngine(canvas, equippedSkin, difficulty, boosters);
      engine.graphicsMode = graphicsMode;
      engine.crtEnabled = crtEnabled;
      engine.screenShakeIntensity = screenShake;
      engine.useVirtualStick = useVirtualStick;
      engine.autoFire = autoFire;
      engine.stats.highScore = highScore;

      engine.onStatsUpdate = (stats, player, boss) => {
        setCurrentStats({ ...stats });
        setCurrentPlayer({ ...player });
        setCurrentBoss(boss ? { ...boss } : null);
      };

      engine.onGameOver = stats => {
        // Award earned credits
        const totalCredits = credits + stats.creditsEarned;
        setCredits(totalCredits);
        saveUserCredits(totalCredits);

        if (stats.score > highScore) {
          setHighScore(stats.score);
        }

        setIsGameOverOpen(true);
      };

      engine.onVictory = stats => {
        const bonusCredits = stats.creditsEarned + 500;
        const totalCredits = credits + bonusCredits;
        setCredits(totalCredits);
        saveUserCredits(totalCredits);

        if (stats.score + 25000 > highScore) {
          setHighScore(stats.score + 25000);
        }

        setIsVictoryOpen(true);
      };

      engineRef.current = engine;
      engine.start();
    }, 50);
  };

  const handleRestartGame = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    handleStartGame();
  };

  const handleReturnToHome = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
    setGameState('MENU');
    setIsGameOverOpen(false);
    setIsVictoryOpen(false);
    setIsPaused(false);
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    engineRef.current.setPaused(nextPaused);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleTriggerDash = () => {
    engineRef.current?.triggerDash();
  };

  const handleTriggerBomb = () => {
    engineRef.current?.triggerBomb();
  };

  // Inventory & Store Actions
  const handleEquipSkin = (skinId: string) => {
    setEquippedSkinId(skinId);
    saveEquippedSkin(skinId);
    soundManager.playUiClick();
  };

  const handleUnlockSkinWithCredits = (skinId: string, cost: number) => {
    if (credits < cost) return;
    const newCredits = credits - cost;
    setCredits(newCredits);
    saveUserCredits(newCredits);

    saveUnlockedSkin(skinId);
    setSkins(loadSkins());
    setEquippedSkinId(skinId);
    saveEquippedSkin(skinId);
    soundManager.playPowerUp();
  };

  const handleUnlockSkinWithIAP = (skinId: string, price: string) => {
    saveUnlockedSkin(skinId);
    setSkins(loadSkins());
    setEquippedSkinId(skinId);
    saveEquippedSkin(skinId);
    soundManager.playPowerUp();
  };

  const handleUpgradeBooster = (boosterId: string, cost: number) => {
    if (credits < cost) return;
    const current = boosters.find(b => b.id === boosterId);
    if (!current || current.level >= current.maxLevel) return;

    const newCredits = credits - cost;
    setCredits(newCredits);
    saveUserCredits(newCredits);

    const nextLevel = current.level + 1;
    saveBoosterLevel(boosterId, nextLevel);
    setBoosters(loadBoosters());
    soundManager.playPowerUp();
  };

  const handleBuyCreditPack = (pack: IAPPack) => {
    const newCredits = credits + pack.credits;
    setCredits(newCredits);
    saveUserCredits(newCredits);
    soundManager.playPowerUp();
  };

  return (
    <div className={`w-full h-screen ${gameState === 'MENU' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'} bg-[#02040a] relative`}>
      {/* View 1: Title & Hangar Menu */}
      {gameState === 'MENU' && (
        <TitleMenu
          difficulty={difficulty}
          onChangeDifficulty={diff => setDifficulty(diff)}
          onStartGame={handleStartGame}
          onOpenStore={() => setIsStoreOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenLaunchKit={() => setIsLaunchKitOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          equippedSkin={equippedSkin}
          boosters={boosters}
          credits={credits}
          highScore={highScore}
          isPWAInstallable={isPWAInstallable}
          onInstallPWA={installPWA}
        />
      )}

      {/* View 2: Active Combat Flight View */}
      {gameState === 'PLAYING' && (
        <div className="relative w-full h-full flex flex-col">
          {/* Game Canvas */}
          <GameCanvas
            engine={engineRef.current}
            crtEnabled={crtEnabled}
            isPaused={isPaused}
            onResume={handleTogglePause}
            onRestart={handleRestartGame}
            onExit={handleReturnToHome}
          />

          {/* Retro Arcade HUD */}
          {currentPlayer && (
            <GameHUD
              stats={currentStats}
              player={currentPlayer}
              boss={currentBoss}
              difficulty={difficulty}
              isPaused={isPaused}
              isMuted={isMuted}
              onTogglePause={handleTogglePause}
              onToggleMute={handleToggleMute}
              onExit={handleReturnToHome}
              onTriggerBomb={handleTriggerBomb}
              onTriggerDash={handleTriggerDash}
            />
          )}

          {/* Touch Controls (Mobile Ergonomics) */}
          {currentPlayer && (
            <TouchControls
              player={currentPlayer}
              autoFire={autoFire}
              onToggleAutoFire={() => {
                const next = !autoFire;
                setAutoFire(next);
                if (engineRef.current) engineRef.current.autoFire = next;
              }}
              onTriggerDash={handleTriggerDash}
              onTriggerBomb={handleTriggerBomb}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <StoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        skins={skins}
        equippedSkinId={equippedSkinId}
        boosters={boosters}
        credits={credits}
        onEquipSkin={handleEquipSkin}
        onUnlockSkinWithCredits={handleUnlockSkinWithCredits}
        onUnlockSkinWithIAP={handleUnlockSkinWithIAP}
        onUpgradeBooster={handleUpgradeBooster}
        onBuyCreditPack={handleBuyCreditPack}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentDifficulty={difficulty}
      />

      <GooglePlayLaunchKitModal
        isOpen={isLaunchKitOpen}
        onClose={() => setIsLaunchKitOpen(false)}
        isPWAInstallable={isPWAInstallable}
        isPWAInstalled={isPWAInstalled}
        onInstallPWA={installPWA}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        graphicsMode={graphicsMode}
        onToggleGraphicsMode={mode => {
          setGraphicsMode(mode);
          if (engineRef.current) engineRef.current.graphicsMode = mode;
        }}
        crtEnabled={crtEnabled}
        onToggleCRT={enabled => {
          setCrtEnabled(enabled);
          if (engineRef.current) engineRef.current.crtEnabled = enabled;
        }}
        screenShake={screenShake}
        onChangeScreenShake={amount => {
          setScreenShake(amount);
          if (engineRef.current) engineRef.current.screenShakeIntensity = amount;
        }}
        useVirtualStick={useVirtualStick}
        onToggleVirtualStick={enabled => {
          setUseVirtualStick(enabled);
          if (engineRef.current) engineRef.current.useVirtualStick = enabled;
        }}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOverOpen}
        stats={currentStats}
        difficulty={difficulty}
        skinId={equippedSkinId}
        onRestart={handleRestartGame}
        onHome={handleReturnToHome}
        onOpenLeaderboard={() => {
          setIsGameOverOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />

      {/* Campaign Victory Modal */}
      <VictoryModal
        isOpen={isVictoryOpen}
        stats={currentStats}
        difficulty={difficulty}
        skinId={equippedSkinId}
        onRestart={handleRestartGame}
        onHome={handleReturnToHome}
        onOpenLeaderboard={() => {
          setIsVictoryOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />
    </div>
  );
}
