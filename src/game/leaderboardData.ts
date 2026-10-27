/**
 * Global and Local High Score Leaderboard System
 * Supports competitive rankings, difficulty filtering, and persistent player submissions.
 */

import { LeaderboardEntry, DifficultyLevel } from './types';

const INITIAL_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'global-1',
    rank: 1,
    playerName: 'ViperNova_JP',
    score: 845200,
    stage: 4,
    difficulty: 'MASTER',
    accuracy: 94.2,
    date: '2026-10-25',
    shipSkinId: 'golden_aegis',
  },
  {
    id: 'global-2',
    rank: 2,
    playerName: 'CyberValkyrie',
    score: 721500,
    stage: 3,
    difficulty: 'MASTER',
    accuracy: 91.5,
    date: '2026-10-26',
    shipSkinId: 'void_reaper',
  },
  {
    id: 'global-3',
    rank: 3,
    playerName: 'RetroGunner88',
    score: 618900,
    stage: 3,
    difficulty: 'ACE',
    accuracy: 88.7,
    date: '2026-10-24',
    shipSkinId: 'cyber_dragon',
  },
  {
    id: 'global-4',
    rank: 4,
    playerName: 'AstraPilot',
    score: 542000,
    stage: 3,
    difficulty: 'MASTER',
    accuracy: 86.4,
    date: '2026-10-26',
    shipSkinId: 'neon_phoenix',
  },
  {
    id: 'global-5',
    rank: 5,
    playerName: 'GhostStriker',
    score: 489300,
    stage: 3,
    difficulty: 'ACE',
    accuracy: 89.1,
    date: '2026-10-25',
    shipSkinId: 'classic_ace',
  },
  {
    id: 'global-6',
    rank: 6,
    playerName: 'QuantumCore',
    score: 395000,
    stage: 2,
    difficulty: 'ACE',
    accuracy: 84.8,
    date: '2026-10-27',
    shipSkinId: 'void_reaper',
  },
  {
    id: 'global-7',
    rank: 7,
    playerName: 'PixelCadet_07',
    score: 320400,
    stage: 2,
    difficulty: 'CADET',
    accuracy: 81.3,
    date: '2026-10-26',
    shipSkinId: 'classic_ace',
  },
  {
    id: 'global-8',
    rank: 8,
    playerName: 'SolarFlare',
    score: 284100,
    stage: 2,
    difficulty: 'CADET',
    accuracy: 79.5,
    date: '2026-10-25',
    shipSkinId: 'neon_phoenix',
  },
];

const LOCAL_STORAGE_LEADERBOARD_KEY = 'pixel_striker_global_leaderboard_v1';
const LOCAL_STORAGE_PLAYER_NAME_KEY = 'pixel_striker_player_callsign_v1';

export function getPlayerCallsign(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_PLAYER_NAME_KEY) || 'PilotAce';
  } catch {
    return 'PilotAce';
  }
}

export function savePlayerCallsign(name: string) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PLAYER_NAME_KEY, name.trim().slice(0, 15) || 'PilotAce');
  } catch (err) {
    console.error('Failed to save callsign', err);
  }
}

export function getLeaderboard(difficultyFilter?: DifficultyLevel | 'ALL'): LeaderboardEntry[] {
  let list = INITIAL_GLOBAL_LEADERBOARD;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LEADERBOARD_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as LeaderboardEntry[];
      // Merge unique
      const existingIds = new Set(stored.map(s => s.id));
      const combined = [...stored];
      INITIAL_GLOBAL_LEADERBOARD.forEach(initial => {
        if (!existingIds.has(initial.id)) {
          combined.push(initial);
        }
      });
      list = combined;
    }
  } catch {
    list = INITIAL_GLOBAL_LEADERBOARD;
  }

  // Sort by score descending
  list.sort((a, b) => b.score - a.score);

  // Recalculate ranks
  const ranked = list.map((item, idx) => ({ ...item, rank: idx + 1 }));

  if (!difficultyFilter || difficultyFilter === 'ALL') {
    return ranked;
  }
  return ranked.filter(item => item.difficulty === difficultyFilter);
}

export function submitLeaderboardScore(entry: Omit<LeaderboardEntry, 'id' | 'rank'>): LeaderboardEntry {
  const all = getLeaderboard('ALL');
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'player-' + Date.now(),
    rank: 0,
    isPlayer: true,
  };

  all.push(newEntry);
  all.sort((a, b) => b.score - a.score);

  const updated = all.slice(0, 50).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  try {
    localStorage.setItem(LOCAL_STORAGE_LEADERBOARD_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to persist score', err);
  }

  return updated.find(u => u.id === newEntry.id) || newEntry;
}

export function getPersonalBest(difficulty: DifficultyLevel): number {
  const all = getLeaderboard(difficulty);
  const playerRun = all.find(r => r.isPlayer);
  return playerRun ? playerRun.score : 0;
}
