import React, { useState } from 'react';
import { LeaderboardEntry, DifficultyLevel } from '../game/types';
import { getLeaderboard } from '../game/leaderboardData';
import { soundManager } from '../game/audio';
import { X, Trophy, Medal, Search, Flame } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: DifficultyLevel;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentDifficulty,
}) => {
  const [activeFilter, setActiveFilter] = useState<DifficultyLevel | 'ALL'>(currentDifficulty);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const entries = getLeaderboard(activeFilter);
  const filtered = entries.filter(e =>
    e.playerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Global Leaderboard</h2>
              <p className="text-xs text-slate-400">
                Verified high scores across the galaxy · Ranked by skill multiplier
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Tabs & Search Bar */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            {(['ALL', 'MASTER', 'ACE', 'CADET'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => {
                  soundManager.playUiClick();
                  setActiveFilter(diff);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition whitespace-nowrap ${
                  activeFilter === diff
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff === 'ALL' ? 'All Classes' : diff}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search callsign..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2.5 pl-2 font-medium">RANK</th>
                <th className="pb-2.5 font-medium">PILOT</th>
                <th className="pb-2.5 font-medium text-right">SCORE</th>
                <th className="pb-2.5 font-medium text-center">CLASS</th>
                <th className="pb-2.5 font-medium text-right">STAGE</th>
                <th className="pb-2.5 pr-2 font-medium text-right">ACCURACY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {filtered.map(entry => {
                const isGold = entry.rank === 1;
                const isSilver = entry.rank === 2;
                const isBronze = entry.rank === 3;

                return (
                  <tr
                    key={entry.id}
                    className={`transition ${
                      entry.isPlayer
                        ? 'bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-400 font-bold'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-2.5 pl-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isGold ? (
                          <Medal className="w-4 h-4 text-amber-400" />
                        ) : isSilver ? (
                          <Medal className="w-4 h-4 text-slate-300" />
                        ) : isBronze ? (
                          <Medal className="w-4 h-4 text-amber-700" />
                        ) : (
                          <span className="text-slate-500 font-semibold w-4 text-center">
                            #{entry.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pilot Callsign */}
                    <td className="py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-sans font-bold">
                        <span className={entry.isPlayer ? 'text-cyan-400' : 'text-white'}>
                          {entry.playerName}
                        </span>
                        {entry.isPlayer && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 rounded font-pixel">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-2.5 text-right font-bold text-white whitespace-nowrap">
                      {entry.score.toLocaleString()}
                    </td>

                    {/* Difficulty Badge */}
                    <td className="py-2.5 text-center whitespace-nowrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-pixel ${
                        entry.difficulty === 'MASTER' ? 'text-rose-400 bg-rose-950/60 border border-rose-800/40' :
                        entry.difficulty === 'ACE' ? 'text-amber-400 bg-amber-950/60 border border-amber-800/40' :
                        'text-cyan-400 bg-cyan-950/60 border border-cyan-800/40'
                      }`}>
                        {entry.difficulty}
                      </span>
                    </td>

                    {/* Stage */}
                    <td className="py-2.5 text-right text-slate-300 whitespace-nowrap">
                      ST.{entry.stage}
                    </td>

                    {/* Accuracy */}
                    <td className="py-2.5 pr-2 text-right text-slate-400 whitespace-nowrap">
                      {entry.accuracy.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs font-sans">
                    No pilot records found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Master difficulty earns a 2.5x score multiplier for highest world rankings.</span>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
