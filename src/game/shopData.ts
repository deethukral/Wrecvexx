/**
 * Cosmetic Skins, Gameplay Boosters & In-App Purchase Catalog
 */

import { ShipSkin, GameplayBooster } from './types';

export const INITIAL_SKINS: ShipSkin[] = [
  {
    id: 'classic_ace',
    name: 'Classic Ace',
    rarity: 'COMMON',
    priceCredits: 0,
    priceIAP: 'FREE',
    description: 'The legendary standard galactic interceptor. Agile, balanced, and battle-tested.',
    primaryColor: '#0284c7', // Sky Blue
    accentColor: '#f97316',  // Amber
    trailColor: '#38bdf8',
    bulletColor: '#38bdf8',
    engineStyle: 'twin',
    unlocked: true,
  },
  {
    id: 'neon_phoenix',
    name: 'Neon Phoenix',
    rarity: 'RARE',
    priceCredits: 1200,
    priceIAP: '$0.99',
    description: 'Equipped with synthetic quantum thrusters and vibrant neon hyper-lasers.',
    primaryColor: '#ec4899', // Pink
    accentColor: '#06b6d4',  // Cyan
    trailColor: '#f43f5e',
    bulletColor: '#06b6d4',
    engineStyle: 'tri',
    unlocked: false,
  },
  {
    id: 'void_reaper',
    name: 'Void Reaper',
    rarity: 'EPIC',
    priceCredits: 2800,
    priceIAP: '$1.99',
    description: 'Forged from dark carbon asteroid composite. Features blood-crimson thrusters.',
    primaryColor: '#334155', // Slate Dark
    accentColor: '#ef4444',  // Red
    trailColor: '#dc2626',
    bulletColor: '#ef4444',
    engineStyle: 'twin',
    unlocked: false,
  },
  {
    id: 'cyber_dragon',
    name: 'Cyber Dragon',
    rarity: 'EPIC',
    priceCredits: 3500,
    priceIAP: '$2.49',
    description: 'Bio-mechanical dragon starcraft with emerald plasma cannons and jade trail.',
    primaryColor: '#10b981', // Emerald
    accentColor: '#eab308',  // Gold
    trailColor: '#059669',
    bulletColor: '#34d399',
    engineStyle: 'tri',
    unlocked: false,
  },
  {
    id: 'golden_aegis',
    name: 'Golden Aegis',
    rarity: 'LEGENDARY',
    priceCredits: 6000,
    priceIAP: '$3.99',
    description: 'Prestige imperial flagship clad in 24k auric plating with diamond engine wake.',
    primaryColor: '#eab308', // Gold
    accentColor: '#ffffff',  // Diamond White
    trailColor: '#fbbf24',
    bulletColor: '#fef08a',
    engineStyle: 'hyper',
    unlocked: false,
  },
];

export const INITIAL_BOOSTERS: GameplayBooster[] = [
  {
    id: 'booster_magnet',
    name: 'Magnetic Harvester',
    description: 'Draws score crystals and power-up capsules magnetically toward your ship.',
    priceCredits: 800,
    priceIAP: '$0.99',
    level: 0,
    maxLevel: 3,
    bonusText: '+35% Pickup Radius per level',
  },
  {
    id: 'booster_shield',
    name: 'Aegis Shield Buffer',
    description: 'Start every run with an auxiliary energy barrier absorbing extra damage.',
    priceCredits: 1200,
    priceIAP: '$0.99',
    level: 0,
    maxLevel: 2,
    bonusText: '+25 Auxiliary Shield per level',
  },
  {
    id: 'booster_bombs',
    name: 'EMP Bomb Stockpile',
    description: 'Enlarges starting EMP bomb inventory so you can clear the screen when cornered.',
    priceCredits: 1000,
    priceIAP: '$0.99',
    level: 0,
    maxLevel: 2,
    bonusText: '+1 Starting EMP Bomb per level',
  },
  {
    id: 'booster_hyper_start',
    name: 'Overdrive Hyper Start',
    description: 'Begin stage 1 already equipped with Level 2 weapons and 1 attack drone.',
    priceCredits: 2000,
    priceIAP: '$1.49',
    level: 0,
    maxLevel: 1,
    bonusText: 'Instant Weapon Lv.2 + Satellite Drone',
  },
];

export interface IAPPack {
  id: string;
  name: string;
  credits: number;
  price: string;
  badge?: string;
  icon: string;
}

export const IAP_CREDIT_PACKS: IAPPack[] = [
  {
    id: 'iap_starter_credits',
    name: 'Scout Supply Cache',
    credits: 1000,
    price: '$0.99',
    icon: '⚡',
  },
  {
    id: 'iap_commander_credits',
    name: 'Commander Vault',
    credits: 3200,
    price: '$2.49',
    badge: 'POPULAR',
    icon: '💎',
  },
  {
    id: 'iap_admiral_credits',
    name: 'Fleet Admiral Treasury',
    credits: 7500,
    price: '$4.99',
    badge: 'BEST VALUE',
    icon: '👑',
  },
];

const LOCAL_STORAGE_SKINS_KEY = 'pixel_striker_unlocked_skins_v1';
const LOCAL_STORAGE_BOOSTERS_KEY = 'pixel_striker_boosters_v1';
const LOCAL_STORAGE_EQUIPPED_KEY = 'pixel_striker_equipped_skin_v1';
const LOCAL_STORAGE_CREDITS_KEY = 'pixel_striker_credits_v1';

export function loadSkins(): ShipSkin[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SKINS_KEY);
    if (!raw) return INITIAL_SKINS;
    const parsed = JSON.parse(raw) as string[];
    return INITIAL_SKINS.map(skin => ({
      ...skin,
      unlocked: skin.unlocked || parsed.includes(skin.id),
    }));
  } catch {
    return INITIAL_SKINS;
  }
}

export function saveUnlockedSkin(skinId: string) {
  try {
    const skins = loadSkins();
    const unlockedIds = skins.filter(s => s.unlocked || s.id === skinId).map(s => s.id);
    localStorage.setItem(LOCAL_STORAGE_SKINS_KEY, JSON.stringify(unlockedIds));
  } catch (err) {
    console.error('Failed to save skin unlock', err);
  }
}

export function loadEquippedSkin(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_EQUIPPED_KEY) || 'classic_ace';
  } catch {
    return 'classic_ace';
  }
}

export function saveEquippedSkin(skinId: string) {
  try {
    localStorage.setItem(LOCAL_STORAGE_EQUIPPED_KEY, skinId);
  } catch (err) {
    console.error('Failed to save equipped skin', err);
  }
}

export function loadBoosters(): GameplayBooster[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOSTERS_KEY);
    if (!raw) return INITIAL_BOOSTERS;
    const parsed = JSON.parse(raw) as Record<string, number>;
    return INITIAL_BOOSTERS.map(b => ({
      ...b,
      level: parsed[b.id] !== undefined ? parsed[b.id] : b.level,
    }));
  } catch {
    return INITIAL_BOOSTERS;
  }
}

export function saveBoosterLevel(boosterId: string, level: number) {
  try {
    const current = loadBoosters();
    const map: Record<string, number> = {};
    current.forEach(b => {
      map[b.id] = b.id === boosterId ? level : b.level;
    });
    localStorage.setItem(LOCAL_STORAGE_BOOSTERS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save booster', err);
  }
}

export function loadUserCredits(): number {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CREDITS_KEY);
    return raw ? parseInt(raw, 10) : 500; // 500 starting bonus credits!
  } catch {
    return 500;
  }
}

export function saveUserCredits(credits: number) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CREDITS_KEY, credits.toString());
  } catch (err) {
    console.error('Failed to save credits', err);
  }
}
