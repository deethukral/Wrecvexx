import React from 'react';
import { GameStats, Player, Boss, DifficultyLevel } from '../game/types';
import { Volume2, VolumeX, Pause, Play, Shield, Bomb, Zap, LogOut } from 'lucide-react';

interface GameHUDProps {
  stats: GameStats;
  player: Player;
  boss: Boss | null;
  difficulty: DifficultyLevel;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onExit: () => void;
  onTriggerBomb: () => void;
  onTriggerDash: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  player,
  boss,
  difficulty,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onExit,
  onTriggerBomb,
  onTriggerDash,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (player.shield / player.maxShield) * 100));
  const hyperPercent = Math.max(0, Math.min(100, (player.hyperTimer / 360) * 100));

  const diffBadgeColor = 
    difficulty === 'MASTER' ? 'text-rose-400 border-rose-500/50 bg-rose-950/40' :
    difficulty === 'ACE' ? 'text-amber-400 border-amber-500/50 bg-amber-950/40' :
    'text-cyan-400 border-cyan-500/50 bg-cyan-950/40';

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-30 p-3 select-none flex flex-col gap-2">
      {/* Top Header Row */}
      <div className="flex items-center justify-between text-xs font-mono-numbers">
        {/* Score & Combo */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-wider text-slate-400 font-pixel">SCORE</span>
            <span className="text-base font-bold text-white tracking-widest text-glow-cyan">
              {stats.score.toLocaleString().padStart(7, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>STAGE {stats.stage}</span>
            <span>·</span>
            <span>WAVE {stats.wave}</span>
            {stats.combo > 1 && (
              <>
                <span>·</span>
                <span className="text-amber-400 font-bold">x{stats.combo} COMBO</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Difficulty tag & High Score */}
        <div className="flex flex-col items-center">
          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded ${diffBadgeColor} tracking-wider font-pixel`}>
            {difficulty} {difficulty === 'MASTER' ? '2.5x' : difficulty === 'ACE' ? '1.5x' : '1.0x'}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
            CREDITS: {stats.creditsEarned}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="p-1.5 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={onTogglePause}
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
            title={isPaused ? 'Resume mission' : 'Pause mission'}
            className="p-1.5 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>
          <button
            onClick={onExit}
            aria-label="Exit flight to hangar"
            title="Exit to Hangar"
            className="p-1.5 rounded bg-slate-900/80 border border-rose-900/60 hover:border-rose-500/80 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition active:scale-95 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-[9px] font-pixel tracking-wider text-rose-300">EXIT</span>
          </button>
        </div>
      </div>

      {/* Boss Health Bar (Only when Boss is present) */}
      {boss && (
        <div className="w-full max-w-md mx-auto bg-slate-950/90 border border-rose-500/60 rounded p-2 shadow-lg backdrop-blur-xs transition animate-pulse">
          <div className="flex items-center justify-between text-[10px] font-pixel text-rose-400 mb-1">
            <span className="tracking-wider">{boss.name}</span>
            <span>{Math.ceil((boss.health / boss.maxHealth) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-xs overflow-hidden border border-rose-900/60 relative">
            <div
              className={`h-full transition-all duration-150 ${boss.enraged ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-400' : 'bg-gradient-to-r from-indigo-500 to-rose-500'}`}
              style={{ width: `${Math.max(0, (boss.health / boss.maxHealth) * 100)}%` }}
            />
          </div>
          {boss.enraged && (
            <div className="text-[9px] text-rose-400 font-pixel text-center mt-1">
              * ENRAGED PHASE ACTIVE *
            </div>
          )}
        </div>
      )}

      {/* Player Meters Strip */}
      <div className="flex items-center justify-between gap-3 text-xs">
        {/* Left: Hull & Shield Bars */}
        <div className="flex flex-col gap-1 w-36 sm:w-44">
          {/* Shield Bar */}
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-cyan-400 shrink-0" />
            <div className="flex-1 h-2 bg-slate-900/90 rounded-xs overflow-hidden border border-cyan-900/60">
              <div
                className="h-full bg-cyan-400 transition-all duration-150"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
          </div>

          {/* Hull HP Bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-400 w-3 text-center shrink-0">HP</span>
            <div className="flex-1 h-2 bg-slate-900/90 rounded-xs overflow-hidden border border-slate-700/60">
              <div
                className={`h-full transition-all duration-150 ${hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Hyper Overdrive Indicator */}
        {player.hyperTimer > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-pixel text-pink-400 animate-pulse">
            <Zap className="w-3 h-3" />
            <span>HYPER {Math.ceil(player.hyperTimer / 60)}s</span>
          </div>
        )}

        {/* Right: Lives & Bomb Counts */}
        <div className="flex items-center gap-3">
          {/* Lives */}
          <div className="flex items-center gap-1 text-[11px] text-slate-300">
            <span className="text-[10px] font-pixel text-slate-500">LIFE</span>
            <span className="font-bold text-amber-400 font-mono-numbers">{player.lives}</span>
          </div>

          {/* Bombs */}
          <div className="flex items-center gap-1 text-[11px] text-slate-300">
            <Bomb className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold text-rose-400 font-mono-numbers">{player.bombs}</span>
          </div>

          {/* Weapon Level */}
          <div className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-pixel text-cyan-300">
            WPN {player.weaponLevel}
          </div>
        </div>
      </div>
    </div>
  );
};
