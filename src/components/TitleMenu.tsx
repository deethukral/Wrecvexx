import React, { useState } from 'react';
import { DifficultyLevel, ShipSkin, GameplayBooster } from '../game/types';
import { soundManager } from '../game/audio';
import { ThreeMainMenuScene } from './ThreeMainMenuScene';
import {
  Play,
  Trophy,
  ShoppingBag,
  Sliders,
  Shield,
  Crown,
  ChevronRight,
  Share2,
  Bookmark,
  MoreVertical,
  Swords,
  Smartphone,
  Eye,
  RotateCcw,
  Sparkles,
  Download,
  Flame,
  Radio,
} from 'lucide-react';

interface TitleMenuProps {
  difficulty: DifficultyLevel;
  onChangeDifficulty: (diff: DifficultyLevel) => void;
  onStartGame: () => void;
  onOpenStore: () => void;
  onOpenLeaderboard: () => void;
  onOpenLaunchKit: () => void;
  onOpenSettings: () => void;
  equippedSkin: ShipSkin;
  boosters: GameplayBooster[];
  credits: number;
  highScore: number;
  isPWAInstallable: boolean;
  onInstallPWA: () => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  difficulty,
  onChangeDifficulty,
  onStartGame,
  onOpenStore,
  onOpenLeaderboard,
  onOpenLaunchKit,
  onOpenSettings,
  equippedSkin,
  boosters,
  credits,
  highScore,
  isPWAInstallable,
  onInstallPWA,
}) => {
  const [show3DHangar, setShow3DHangar] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleShare = async () => {
    soundManager.playUiClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wrecvexx // Royal Cosmic Warfare',
          text: 'Can you defeat the colossal dreadnoughts in Wrecvexx?',
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Mission link copied to clipboard!');
    }
  };

  const getMultiplier = () => {
    if (difficulty === 'MASTER') return '2.5x';
    if (difficulty === 'ACE') return '1.5x';
    return '1.0x';
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col select-none overflow-x-hidden relative font-sans">
      {/* Background Cosmic Battlefield Artwork */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/src/assets/images/royal_battle_backdrop_1793115255307.jpg"
          alt="Royal Cosmic Battlefield"
          className="w-full h-full object-cover object-center opacity-85 scale-100"
        />
        {/* Layered Vignette and Edge Lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02040a]/80 via-transparent to-[#02040a]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#02040a_95%)]" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-amber-950/90 border border-amber-400 text-amber-200 text-xs font-mono shadow-2xl backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Container - Scaled to mobile portrait ratio like reference image */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto min-h-screen flex flex-col justify-between p-3 sm:p-4">
        {/* =========================================================================
            HEADER: Winged Starfighter Logo, PIXEL STRIKER Title & Action Icons
           ========================================================================= */}
        <header className="relative w-full pt-1 pb-2">
          {/* Top Decorative Metallic Frame Border */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-amber-500/30">
            {/* Left: Starfighter Insignia + Stacked Metallic Title */}
            <div className="flex items-center gap-2.5">
              {/* Royal Winged Insignia Emblem */}
              <div className="relative w-11 h-11 shrink-0 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                <svg viewBox="0 0 64 64" className="w-full h-full">
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fffbeb" />
                      <stop offset="40%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e0f2fe" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>
                  {/* Outer Wings */}
                  <path
                    d="M32 4 L42 22 L58 26 L46 38 L50 56 L32 44 L14 56 L18 38 L6 26 L22 22 Z"
                    fill="url(#goldGrad)"
                    stroke="#fef08a"
                    strokeWidth="1.5"
                  />
                  {/* Inner Sleek Cyan Core Interceptor */}
                  <path
                    d="M32 10 L38 28 L48 32 L38 40 L40 50 L32 42 L24 50 L26 40 L16 32 L26 28 Z"
                    fill="#030712"
                    stroke="url(#cyanGrad)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M32 14 L36 30 L32 40 L28 30 Z"
                    fill="url(#cyanGrad)"
                  />
                  {/* Wing Glow Sparks */}
                  <circle cx="32" cy="18" r="2.5" fill="#38bdf8" />
                </svg>
              </div>

              {/* Stacked Metallic Typography */}
              <div className="flex flex-col leading-none">
                <span className="font-pixel text-lg sm:text-xl font-extrabold tracking-wider gold-metallic-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  WREC
                </span>
                <span className="font-pixel text-lg sm:text-xl font-extrabold tracking-wider chrome-cyan-text drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)]">
                  VEXX
                </span>
              </div>
            </div>

            {/* Right: Actions (Share, Bookmark, More, START PLAY) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-1.5 text-amber-300 hover:text-white transition active:scale-95"
                title="Share Mission"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onOpenLeaderboard();
                }}
                className="p-1.5 text-amber-300 hover:text-white transition active:scale-95"
                title="Global Leaderboards"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    soundManager.playUiClick();
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className="p-1.5 text-amber-300 hover:text-white transition active:scale-95"
                  title="More Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 top-8 z-50 w-44 rounded-xl bg-[#050814]/95 border border-amber-500/40 p-2 shadow-2xl backdrop-blur-xl flex flex-col gap-1 text-xs font-mono">
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        onOpenSettings();
                      }}
                      className="p-2 rounded text-left hover:bg-amber-950/60 text-slate-200 flex items-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Audio & Display</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        onOpenLaunchKit();
                      }}
                      className="p-2 rounded text-left hover:bg-emerald-950/60 text-emerald-300 flex items-center gap-2"
                    >
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Play Store Kit</span>
                    </button>
                    {isPWAInstallable && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onInstallPWA();
                        }}
                        className="p-2 rounded text-left hover:bg-cyan-950/60 text-cyan-300 flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Install App</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Hexagonal Beveled "START PLAY" Button */}
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onStartGame();
                }}
                className="relative group active:scale-95 transition-transform"
              >
                <div className="px-3.5 py-1.5 sci-fi-chamfer-xs bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-[1.5px] shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <div className="px-2.5 py-1 sci-fi-chamfer-xs bg-gradient-to-r from-[#031525] via-[#022a45] to-[#031525] border border-cyan-400/80 flex items-center justify-center">
                    <span className="font-pixel text-[11px] font-black text-white tracking-wider chrome-cyan-text drop-shadow-[0_1px_4px_rgba(6,182,212,0.8)]">
                      START PLAY
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* =========================================================================
              THREE FEATURE PILLS: Arcade, Boss Battles, Android Play Store
             ========================================================================= */}
          <div className="grid grid-cols-3 gap-1.5 pt-2.5">
            {/* Pill 1 */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-[#030914]/80 border border-cyan-500/40 backdrop-blur-xs">
              <div className="w-5 h-5 rounded-full bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center shrink-0">
                <Swords className="w-3 h-3 text-cyan-300" />
              </div>
              <span className="text-[9px] font-semibold text-slate-200 leading-tight truncate">
                Retro 16-Bit Arcade
              </span>
            </div>

            {/* Pill 2 */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-[#030914]/80 border border-amber-500/40 backdrop-blur-xs">
              <div className="w-5 h-5 rounded-full bg-amber-950/80 border border-amber-400/60 flex items-center justify-center shrink-0">
                <Crown className="w-3 h-3 text-amber-300" />
              </div>
              <span className="text-[9px] font-semibold text-slate-200 leading-tight truncate">
                Multi-Stage Boss Battles
              </span>
            </div>

            {/* Pill 3 */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenLaunchKit();
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-[#030914]/80 border border-emerald-500/40 hover:border-emerald-400 transition backdrop-blur-xs text-left"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-400/60 flex items-center justify-center shrink-0">
                <Smartphone className="w-3 h-3 text-emerald-300" />
              </div>
              <span className="text-[9px] font-semibold text-emerald-300 leading-tight truncate">
                Android Play Store Ready
              </span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            HERO SECTION: Headline & Tactical Description with Left Blue Accent
           ========================================================================= */}
        <div className="my-auto py-3 flex flex-col gap-2">
          {/* Headline */}
          <div className="space-y-0.5">
            <h1 className="text-[23px] sm:text-[26px] font-black leading-tight tracking-tight">
              <span className="gold-metallic-text drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] block">
                Defend the Solar Belt in Fluid
              </span>
              <span className="chrome-cyan-text drop-shadow-[0_2px_12px_rgba(6,182,212,0.6)] block">
                Retro Combat
              </span>
            </h1>
          </div>

          {/* Tactical Description with blue vertical line */}
          <div className="border-l-2 border-cyan-400 pl-2.5 py-0.5">
            <p className="text-[11.5px] text-slate-300 leading-relaxed font-normal">
              Pilot nimble starfighters with real-time barrel-roll evasions, kinetic weapon upgrades,
              and screen-clearing EMP smart bombs. Face off against colossal multi-phase dreadnoughts
              at every sector stage.
            </p>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM HALF: Mechanical Difficulty Selector, Launch Mission, Hangar & Dock
           ========================================================================= */}
        <div className="flex flex-col gap-3 pb-1">
          {/* 1. SELECT DIFFICULTY MECHANICAL CONTAINER */}
          <div className="relative rounded-2xl bg-[#040713]/90 border border-amber-500/40 p-2.5 sm:p-3 shadow-2xl backdrop-blur-md">
            {/* Corner metallic mechanical cuts */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400" />

            {/* Container Header: Wings + SELECT DIFFICULTY + Multiplier */}
            <div className="flex items-center justify-between pb-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold tracking-wider">
                <span className="text-amber-400 text-sm">🪽</span>
                <span className="gold-metallic-text font-pixel text-[10.5px]">SELECT DIFFICULTY</span>
                <span className="text-amber-400 text-sm">🪽</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold">
                <span>★</span>
                <span>{getMultiplier()} Score Multiplier</span>
              </div>
            </div>

            {/* 3 Holographic Beveled Difficulty Cards */}
            <div className="grid grid-cols-3 gap-2">
              {/* CARD 1: CADET (Cyan Shield) */}
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onChangeDifficulty('CADET');
                }}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-between gap-1.5 transition-all relative overflow-hidden ${
                  difficulty === 'CADET'
                    ? 'bg-gradient-to-b from-cyan-950/90 via-[#031526]/90 to-cyan-950/70 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/80 scale-[1.02]'
                    : 'bg-[#020b18]/60 border-cyan-900/60 text-slate-400 hover:border-cyan-500/50'
                }`}
              >
                {/* Shield Emblem */}
                <div className="w-8 h-8 rounded-full bg-cyan-950/90 border border-cyan-400/70 flex items-center justify-center shadow-inner">
                  <Shield className="w-4 h-4 text-cyan-300 fill-cyan-400/20" />
                </div>
                <div>
                  <span className="font-pixel text-[11px] font-black text-cyan-300 block">
                    CADET
                  </span>
                  <span className="text-[9.5px] text-slate-300 block leading-tight mt-0.5">
                    Auto-Shield · 3 Lives
                  </span>
                </div>
              </button>

              {/* CARD 2: ACE (Royal Amber-Gold Winged Star - Selected Glow State) */}
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onChangeDifficulty('ACE');
                }}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-between gap-1.5 transition-all relative overflow-hidden ${
                  difficulty === 'ACE'
                    ? 'bg-gradient-to-b from-amber-950/95 via-[#1a1205]/95 to-amber-950/80 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] ring-2 ring-amber-300 scale-[1.02]'
                    : 'bg-[#120a02]/60 border-amber-900/60 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                {/* Winged Star Crown Emblem */}
                <div className="w-8 h-8 rounded-full bg-amber-950/90 border border-amber-300 flex items-center justify-center shadow-inner drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-300/30" />
                </div>
                <div>
                  <span className="font-pixel text-[11px] font-black text-amber-300 block gold-metallic-text">
                    ACE
                  </span>
                  <span className="text-[9.5px] text-amber-100 block leading-tight mt-0.5 font-medium">
                    Standard · 2 Lives
                  </span>
                </div>
              </button>

              {/* CARD 3: MASTER (Crimson Winged Skull) */}
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onChangeDifficulty('MASTER');
                }}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-between gap-1.5 transition-all relative overflow-hidden ${
                  difficulty === 'MASTER'
                    ? 'bg-gradient-to-b from-rose-950/90 via-[#18040b]/90 to-rose-950/70 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)] ring-1 ring-rose-400/80 scale-[1.02]'
                    : 'bg-[#180208]/60 border-rose-950/60 text-slate-400 hover:border-rose-500/50'
                }`}
              >
                {/* Skull / Flame Combat Emblem */}
                <div className="w-8 h-8 rounded-full bg-rose-950/90 border border-rose-400/70 flex items-center justify-center shadow-inner">
                  <Flame className="w-4 h-4 text-rose-300 fill-rose-400/20" />
                </div>
                <div>
                  <span className="font-pixel text-[11px] font-black text-rose-400 block rose-metallic-text">
                    MASTER
                  </span>
                  <span className="text-[9.5px] text-slate-300 block leading-tight mt-0.5">
                    Bullet Hell · 1 Life
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. SPECTACULAR ROYAL GOLD & CYAN COMMAND BAR: "LAUNCH MISSION" */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onStartGame();
            }}
            className="w-full relative group active:scale-98 transition-all duration-150 cursor-pointer"
          >
            {/* Outer Chamfered Golden Metallic Frame */}
            <div className="sci-fi-chamfer-md bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 p-[2px] shadow-[0_0_35px_rgba(245,158,11,0.6)]">
              {/* Inner Chassis with Cyan Reactor Rails */}
              <div className="sci-fi-chamfer-md bg-gradient-to-r from-[#031526] via-[#042845] to-[#031526] py-3.5 px-4 flex items-center justify-center gap-3 relative overflow-hidden border border-cyan-400/60">
                {/* Electric Cyan Horizontal Reactor Beams */}
                <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#38bdf8]" />
                <div className="absolute bottom-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#38bdf8]" />

                {/* Circular Glowing Reactor Disc with Golden Play Button */}
                <div className="w-9 h-9 rounded-full bg-[#02182c] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.8)] shrink-0">
                  <Play className="w-4 h-4 fill-amber-300 text-amber-300 translate-x-0.5 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                </div>

                {/* Bold 3D Metallic Golden Text */}
                <span className="font-pixel text-base sm:text-lg font-black tracking-widest gold-metallic-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  LAUNCH MISSION
                </span>
              </div>
            </div>
          </button>

          {/* 3. SECONDARY BAR: Ship Hangar (6010 CR) */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenStore();
            }}
            className="w-full relative group active:scale-98 transition-all"
          >
            <div className="sci-fi-chamfer-sm bg-gradient-to-r from-amber-500/60 via-amber-400/40 to-amber-500/60 p-[1.5px] shadow-lg">
              <div className="sci-fi-chamfer-sm bg-[#040816]/95 hover:bg-[#071026] px-4 py-2.5 flex items-center justify-between text-xs font-mono transition-colors">
                <div className="flex items-center gap-2.5">
                  {/* Cyan Starfighter Silhouette Icon */}
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400 fill-cyan-400/30">
                      <path d="M12 2 L14 8 L22 14 L15 15 L16 21 L12 18 L8 21 L9 15 L2 14 L10 8 Z" />
                    </svg>
                  </div>
                  <span className="text-slate-200 font-bold text-xs">
                    Ship Hangar <span className="text-amber-400">({credits} CR)</span>
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* 4. BOTTOM VIEWPORT: Cinematic Docked Starfighter Hangar / Interactive 3D */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl bg-[#030612]">
            {/* Viewport Frame Header with Toggle */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  setShow3DHangar(!show3DHangar);
                }}
                className="px-2 py-1 rounded-md bg-slate-950/80 border border-amber-500/50 text-[10px] font-mono text-amber-300 hover:text-white flex items-center gap-1 backdrop-blur-md shadow-md"
              >
                {show3DHangar ? (
                  <>
                    <RotateCcw className="w-3 h-3" />
                    <span>Cinematic Dock</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>3D Inspect</span>
                  </>
                )}
              </button>
            </div>

            {/* Hangar Visual */}
            <div className="w-full h-28 sm:h-32 relative">
              {show3DHangar ? (
                <div className="w-full h-full">
                  <ThreeMainMenuScene equippedSkin={equippedSkin} className="w-full h-full" />
                </div>
              ) : (
                <img
                  src="/src/assets/images/royal_docked_hangar_1793115232523.jpg"
                  alt="Docked Cruiser Hangar Bay"
                  className="w-full h-full object-cover object-center"
                />
              )}
              {/* Subtle Blue Headlight & Neon Bevel Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-1.5 left-3 text-[10px] font-mono text-cyan-400/90 font-semibold drop-shadow-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>BAY 07 // {equippedSkin.name.toUpperCase()} READY FOR SORTIE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
