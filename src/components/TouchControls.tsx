import React from 'react';
import { Player } from '../game/types';
import { Zap, Bomb, Crosshair } from 'lucide-react';

interface TouchControlsProps {
  player: Player;
  autoFire: boolean;
  onToggleAutoFire: () => void;
  onTriggerDash: () => void;
  onTriggerBomb: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  player,
  autoFire,
  onToggleAutoFire,
  onTriggerDash,
  onTriggerBomb,
}) => {
  const isDashOnCooldown = player.dashCooldown > 0;
  const dashCooldownPercent = Math.max(0, Math.min(100, (player.dashCooldown / 65) * 100));

  return (
    <div className="absolute inset-x-0 bottom-4 pointer-events-none z-30 px-4 flex items-end justify-between select-none">
      {/* Left Bottom Thumb Zone: Auto Fire Toggle & Status */}
      <div className="flex flex-col items-start gap-2 pointer-events-auto">
        <button
          onClick={onToggleAutoFire}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition active:scale-95 shadow-lg backdrop-blur-xs ${
            autoFire
              ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-900/80 border-slate-700 text-slate-400'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>AUTO-FIRE: {autoFire ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Right Bottom Thumb Zone: Action Buttons */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* EMP Smart Bomb Button */}
        <button
          onClick={onTriggerBomb}
          disabled={player.bombs <= 0}
          aria-label="EMP Smart Bomb"
          className={`relative w-15 h-15 rounded-2xl flex flex-col items-center justify-center border transition shadow-xl active:scale-90 ${
            player.bombs > 0
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 hover:bg-rose-900'
              : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Bomb className="w-6 h-6" />
          <span className="text-[9px] font-pixel mt-0.5">BOMB</span>
          {player.bombs > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 border border-white text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono-numbers shadow">
              {player.bombs}
            </span>
          )}
        </button>

        {/* Dash / Dodge Roll Button */}
        <button
          onClick={onTriggerDash}
          disabled={isDashOnCooldown}
          aria-label="Dodge Roll"
          className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center border transition shadow-xl active:scale-90 overflow-hidden ${
            isDashOnCooldown
              ? 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-sky-950/80 border-sky-400 text-sky-200 hover:bg-sky-900'
          }`}
        >
          {/* Cooldown radial/linear mask */}
          {isDashOnCooldown && (
            <div
              className="absolute inset-x-0 bottom-0 bg-sky-500/20"
              style={{ height: `${dashCooldownPercent}%` }}
            />
          )}
          <Zap className="w-7 h-7" />
          <span className="text-[9px] font-pixel mt-0.5">DODGE</span>
        </button>
      </div>
    </div>
  );
};
