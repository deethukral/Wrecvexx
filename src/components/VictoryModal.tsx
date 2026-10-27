import React, { useState } from 'react';
import { GameStats, DifficultyLevel } from '../game/types';
import { submitLeaderboardScore, getPlayerCallsign } from '../game/leaderboardData';
import { soundManager } from '../game/audio';
import { Trophy, RotateCcw, Home, Check, Crown, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  stats: GameStats;
  difficulty: DifficultyLevel;
  skinId: string;
  onRestart: () => void;
  onHome: () => void;
  onOpenLeaderboard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  stats,
  difficulty,
  skinId,
  onRestart,
  onHome,
  onOpenLeaderboard,
}) => {
  const [callsign, setCallsign] = useState(getPlayerCallsign());
  const [submitted, setSubmitted] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);

  if (!isOpen) return null;

  const accuracy = stats.shotsFired > 0 ? (stats.shotsHit / stats.shotsFired) * 100 : 0;
  const victoryScore = stats.score + 25000;

  const handleSubmitScore = () => {
    soundManager.playPowerUp();
    const result = submitLeaderboardScore({
      playerName: callsign.trim() || 'PilotAce',
      score: victoryScore,
      stage: 3,
      difficulty,
      accuracy,
      date: new Date().toISOString().split('T')[0],
      shipSkinId: skinId,
    });
    setSubmitted(true);
    setSubmittedRank(result.rank);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-amber-500/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-5 border-b border-amber-500/30 bg-amber-950/20 text-center relative">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
            <Crown className="w-6 h-6" />
          </div>
          <span className="text-xs font-pixel text-amber-400 tracking-widest block">GALAXY CHAMPION</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1 font-mono-numbers text-glow-amber">
            {victoryScore.toLocaleString()} PTS
          </h2>
          <span className="text-xs text-emerald-400 font-semibold mt-1 block">
            +25,000 CAMPAIGN VICTORY BONUS
          </span>
        </div>

        {/* Stats Grid */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-300 text-center leading-relaxed">
            All 5 colossal flagship dreadnoughts and apex leviathans have been dismantled. The entire galaxy is liberated!
          </p>

          <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800 font-mono-numbers">
            <div>
              <span className="text-slate-500 text-[10px] block">ALL BOSSES DEFEATED</span>
              <span className="text-emerald-400 font-bold">5 / 5 Cleared</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">DIFFICULTY RANK</span>
              <span className="text-amber-400 font-bold">{difficulty}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">FINAL ACCURACY</span>
              <span className="text-cyan-400 font-bold">{accuracy.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">TOTAL CREDITS</span>
              <span className="text-amber-300 font-bold">+{stats.creditsEarned + 500} CR</span>
            </div>
          </div>

          {/* Leaderboard Submission */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-white block">Immortalize Your Champion Run</span>
            {submitted ? (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Registered at Rank #{submittedRank}!</span>
                </div>
                <button
                  onClick={onOpenLeaderboard}
                  className="text-[11px] text-cyan-400 underline font-semibold hover:text-cyan-300"
                >
                  View Board
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={15}
                  value={callsign}
                  onChange={e => setCallsign(e.target.value)}
                  placeholder="Champion Callsign..."
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSubmitScore}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition active:scale-95 flex items-center gap-1"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                soundManager.playUiClick();
                onRestart();
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN (NEW GAME+)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playUiClick();
                onHome();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to Hangar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
