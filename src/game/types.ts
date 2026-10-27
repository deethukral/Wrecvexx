/**
 * Core type definitions for Pixel Striker: Retro Galaxy
 */

export type DifficultyLevel = 'CADET' | 'ACE' | 'MASTER';

export interface DifficultyConfig {
  name: string;
  label: string;
  scoreMultiplier: number;
  playerMaxHealth: number;
  playerLives: number;
  enemyBulletSpeedMult: number;
  enemySpawnRateMult: number;
  bossHealthMult: number;
  autoShieldRegen: boolean;
  description: string;
}

export type WeaponType = 'blaster' | 'plasma' | 'laser' | 'spread';

export type PowerUpType = 
  | 'UPGRADE'       // Level up primary weapon
  | 'SHIELD'        // Restore or boost energy shield
  | 'BOMB'          // Add EMP Smart Bomb
  | 'MISSILES'      // Homing micro-missiles
  | 'DRONE'         // Orbiting attack satellite
  | 'HYPER'         // Hyper overdrive mode
  | 'REPAIR';       // Repair hull HP

export interface ShipSkin {
  id: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  priceCredits: number;
  priceIAP: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  trailColor: string;
  bulletColor: string;
  engineStyle: 'twin' | 'tri' | 'hyper' | 'plasma';
  unlocked: boolean;
}

export interface GameplayBooster {
  id: string;
  name: string;
  description: string;
  priceCredits: number;
  priceIAP: string;
  level: number;
  maxLevel: number;
  bonusText: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerName: string;
  score: number;
  stage: number;
  difficulty: DifficultyLevel;
  accuracy: number;
  date: string;
  shipSkinId: string;
  isPlayer?: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  stage: number;
  wave: number;
  enemiesDestroyed: number;
  bossesDefeated: number;
  shotsFired: number;
  shotsHit: number;
  creditsEarned: number;
  timeSurvivedSeconds: number;
  combo: number;
  maxCombo: number;
}

export type GameState = 
  | 'MENU' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'STAGE_CLEAR' 
  | 'GAME_OVER' 
  | 'VICTORY';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  vx: number;
  vy: number;
  bank: -1 | 0 | 1;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  lives: number;
  bombs: number;
  weaponLevel: number;
  weaponType: WeaponType;
  hasMissiles: boolean;
  missileCooldown: number;
  dronesCount: number;
  droneAngle: number;
  invincibleTimer: number;
  isDashing: boolean;
  dashTimer: number;
  dashAngle: number;
  dashCooldown: number;
  hyperTimer: number;
  lastDamageTime: number;
  shotsFired: number;
  shotsHit: number;
}

export interface Boss {
  id: number;
  type: 'cyclops' | 'scorpion' | 'leviathan' | 'colossus' | 'chimera';
  name: string;
  stage: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  phase: number;
  attackTimer: number;
  attackPattern: number;
  isLaserCharging: boolean;
  isLaserFiring: boolean;
  laserTimer: number;
  pincerOpen: number;
  enraged: boolean;
  isMiniBoss?: boolean;
}
