/**
 * Pixel Art Procedural Drawing & Rendering Engine
 * Renders authentic 16-bit retro arcade sprites with pixel scaling.
 */

import { ShipSkin } from './types';

// Helper to draw a pixel grid from string map
export function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  pixelMap: string[],
  colorPalette: Record<string, string>,
  x: number,
  y: number,
  pixelSize: number = 3,
  flipX: boolean = false
) {
  const height = pixelMap.length;
  const width = pixelMap[0].length;
  const startX = x - (width * pixelSize) / 2;
  const startY = y - (height * pixelSize) / 2;

  for (let r = 0; r < height; r++) {
    const row = pixelMap[r];
    for (let c = 0; c < width; c++) {
      const colIndex = flipX ? width - 1 - c : c;
      const char = row[colIndex];
      if (char !== '.' && colorPalette[char]) {
        ctx.fillStyle = colorPalette[char];
        ctx.fillRect(
          Math.floor(startX + c * pixelSize),
          Math.floor(startY + r * pixelSize),
          pixelSize,
          pixelSize
        );
      }
    }
  }
}

// Draw player starfighter based on current skin and bank direction
export function drawPlayerShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bank: -1 | 0 | 1,
  skin: ShipSkin,
  isInvincible: boolean,
  dashAngle: number = 0,
  speedY: number = 0
) {
  if (isInvincible && Math.floor(Date.now() / 60) % 2 === 0) {
    // Flashing iframes
    return;
  }

  ctx.save();
  ctx.translate(x, y);

  if (dashAngle !== 0) {
    ctx.rotate(dashAngle);
  }

  const p = skin.primaryColor;
  const a = skin.accentColor;
  const c = skin.bulletColor;

  const palette: Record<string, string> = {
    '#': '#0f172a', // Outline
    'P': p,         // Primary hull
    'p': '#1e293b', // Dark hull shading
    'A': a,         // Accent trim
    'C': '#e2e8f0', // Cockpit glass
    'c': c,         // Energy glow
    'W': '#ffffff', // Highlight
    'G': '#475569', // Metal mechanical
  };

  // Neutral Frame
  const neutralMap = [
    "....#W#....",
    "...#CCC#...",
    "...#CcC#...",
    "..#PGGGP#..",
    "..#PPAAPP#.",
    ".#PPPAAPPP#",
    ".#PAAPAPAAP",
    "#PPcPPPcPPP",
    "#PPP###PPP#",
    "#AA#...#AA#",
    "#p#.....#p#",
  ];

  // Bank Left Frame
  const bankLeftMap = [
    "....#W#....",
    "...#CCC#...",
    "...#CcC#...",
    "..#pGGGP#..",
    "..#pPAAPP#.",
    ".#pPAAPPP#.",
    ".#pAPAPAAP#",
    "#pcPPPcPPP#",
    "#pP###PPP#.",
    "#A#...#AA#.",
    "##.....#p#.",
  ];

  // Bank Right Frame (mirror bankLeftMap)
  const isBankLeft = bank === -1;
  const isBankRight = bank === 1;

  if (isBankRight) {
    drawPixelGrid(ctx, bankLeftMap, palette, 0, 0, 3, true);
  } else if (isBankLeft) {
    drawPixelGrid(ctx, bankLeftMap, palette, 0, 0, 3, false);
  } else {
    drawPixelGrid(ctx, neutralMap, palette, 0, 0, 3, false);
  }

  // Reactive Thruster Exhaust Flames
  const thrusterLength = 8 + (speedY < 0 ? 8 : 2) + Math.random() * 4;
  const thrusterColor = skin.trailColor;

  // Dual Thruster Jets
  const jetOffsets = [-9, 9];
  jetOffsets.forEach(offsetX => {
    ctx.fillStyle = thrusterColor;
    ctx.fillRect(offsetX - 2, 16, 4, thrusterLength);

    // Inner hot core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(offsetX - 1, 16, 2, thrusterLength * 0.5);
  });

  // If skin has tri-engine
  if (skin.engineStyle === 'tri' || skin.engineStyle === 'hyper') {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-2, 18, 4, thrusterLength * 1.2);
  }

  ctx.restore();
}

// Draw Drone / Satellite Wingman
export function drawDrone(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6, -6, 12, 12);

  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(-4, -4, 8, 8);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-2, -2, 4, 4);

  // Tiny thruster
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-1, 5, 2, 4);

  ctx.restore();
}

// Enemy Sprites
export function drawEnemyScout(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  const palette: Record<string, string> = {
    '#': '#0f172a',
    'G': '#10b981',
    'g': '#047857',
    'Y': '#facc15',
    'W': '#ffffff',
  };

  const map = [
    "..#YY#..",
    ".#GGGG#.",
    "#GGWWGG#",
    "#ggGGgg#",
    ".#gYYg#.",
    "..####..",
  ];

  const bob = Math.sin(tick * 0.1) * 2;
  drawPixelGrid(ctx, map, palette, x, y + bob, 3);
}

export function drawEnemyInterceptor(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  const palette: Record<string, string> = {
    '#': '#0f172a',
    'R': '#ef4444',
    'r': '#991b1b',
    'O': '#f97316',
    'W': '#ffffff',
  };

  const map = [
    "...##...",
    "..#RR#..",
    ".#ROOR#.",
    "#RRWWRR#",
    "#rRRRRr#",
    "#r#..#r#",
    "##....##",
  ];

  const bob = Math.cos(tick * 0.08) * 2;
  drawPixelGrid(ctx, map, palette, x, y + bob, 3);
}

export function drawEnemyDreadnought(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  const palette: Record<string, string> = {
    '#': '#0f172a',
    'P': '#8b5cf6',
    'p': '#5b21b6',
    'C': '#06b6d4',
    'M': '#64748b',
    'W': '#ffffff',
  };

  const map = [
    "....##MM##....",
    "..#MPPPPPM#...",
    ".#MPPPCPPPPM#.",
    "#MMWWPCPPWWMM#",
    "#MPPPPPPPM####",
    "#ppMPPPMpp#...",
    ".##MM##MM##...",
  ];

  drawPixelGrid(ctx, map, palette, x, y, 3);
}

// Asteroid
export function drawAsteroid(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(-radius * 0.2, -radius * 0.2, radius * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  // craters
  ctx.beginPath();
  ctx.arc(radius * 0.3, radius * 0.3, radius * 0.25, 0, Math.PI * 2);
  ctx.arc(-radius * 0.4, radius * 0.1, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// --- Multi-Phase Stage Bosses ---

/** Stage 1 Boss: GIGA CYCLOPS */
export function drawBossCyclops(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  healthPercent: number,
  tick: number,
  isFiringLaser: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  const isEnraged = healthPercent < 0.4;
  const hullColor = isEnraged ? '#dc2626' : '#6366f1';
  const darkHull = isEnraged ? '#7f1d1d' : '#312e81';
  const eyeCoreColor = isEnraged ? '#ef4444' : '#06b6d4';

  // Base Boss Chassis
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-70, -35, 140, 70);

  ctx.fillStyle = darkHull;
  ctx.fillRect(-65, -30, 130, 60);

  ctx.fillStyle = hullColor;
  ctx.fillRect(-55, -25, 110, 50);

  // Twin Heavy Turret Pods
  const turretBob = Math.sin(tick * 0.05) * 4;
  ctx.fillStyle = '#334155';
  ctx.fillRect(-85, -20 + turretBob, 25, 45);
  ctx.fillRect(60, -20 - turretBob, 25, 45);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-78, 22 + turretBob, 10, 8);
  ctx.fillRect(68, 22 - turretBob, 10, 8);

  // Center Animated Cyclops Eye
  const eyeSize = 22;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, 0, eyeSize + 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = eyeCoreColor;
  ctx.beginPath();
  ctx.arc(0, 0, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupil tracking
  const pupilOffset = Math.sin(tick * 0.04) * 5;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pupilOffset, 0, eyeSize * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Eye laser telegraph or beam
  if (isFiringLaser) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.fillRect(-12, eyeSize + 4, 24, 700);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, eyeSize + 4, 8, 700);
  }

  ctx.restore();
}

/** Stage 2 Boss: TITAN SCORPION */
export function drawBossScorpion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  healthPercent: number,
  tick: number,
  pincerOpen: number
) {
  ctx.save();
  ctx.translate(x, y);

  const isEnraged = healthPercent < 0.45;
  const armor = isEnraged ? '#ea580c' : '#0d9488';
  const trim = isEnraged ? '#7c2d12' : '#115e59';

  // Articulated Pincer Claws
  const pincerAngle = pincerOpen * 0.35;
  
  // Left Claw
  ctx.save();
  ctx.translate(-50, -10);
  ctx.rotate(-pincerAngle);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-35, -15, 40, 20);
  ctx.fillStyle = armor;
  ctx.fillRect(-40, 5, 20, 30);
  ctx.restore();

  // Right Claw
  ctx.save();
  ctx.translate(50, -10);
  ctx.rotate(pincerAngle);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-5, -15, 40, 20);
  ctx.fillStyle = armor;
  ctx.fillRect(20, 5, 20, 30);
  ctx.restore();

  // Main Carapace
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-45, -30, 90, 60);

  ctx.fillStyle = trim;
  ctx.fillRect(-40, -25, 80, 50);

  ctx.fillStyle = armor;
  ctx.fillRect(-30, -20, 60, 40);

  // Glowing Venom Stinger Coil
  const stingerSway = Math.sin(tick * 0.08) * 14;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(stingerSway, -45, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(stingerSway, -45, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Stage 3 Boss: VOID LEVIATHAN */
export function drawBossLeviathan(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  healthPercent: number,
  tick: number
) {
  ctx.save();
  ctx.translate(x, y);

  const isPhase2 = healthPercent < 0.5;

  // Outer Massive Wings
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(0, -50);
  ctx.lineTo(-95, -10);
  ctx.lineTo(-75, 45);
  ctx.lineTo(0, 30);
  ctx.lineTo(75, 45);
  ctx.lineTo(95, -10);
  ctx.closePath();
  ctx.fill();

  // Edge Neon Glow Lines
  ctx.strokeStyle = isPhase2 ? '#ec4899' : '#8b5cf6';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Armored Core
  ctx.fillStyle = '#312e81';
  ctx.fillRect(-45, -20, 90, 50);

  // Central Void Singularity Core
  const coreRadius = 18 + Math.sin(tick * 0.12) * 4;
  const gradient = ctx.createRadialGradient(0, 5, 2, 0, 5, coreRadius);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.5, isPhase2 ? '#f43f5e' : '#a855f7');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 5, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting Energy Shards in Phase 2
  if (isPhase2) {
    for (let i = 0; i < 4; i++) {
      const angle = tick * 0.05 + (i * Math.PI) / 2;
      const ox = Math.cos(angle) * 60;
      const oy = Math.sin(angle) * 40;
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(ox - 5, oy - 5, 10, 10);
    }
  }

  ctx.restore();
}

// Power-Up Drops
export function drawPowerUp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: string,
  tick: number
) {
  ctx.save();
  ctx.translate(x, y);

  const float = Math.sin(tick * 0.1) * 3;
  ctx.translate(0, float);

  let bg = '#38bdf8';
  let label = 'P';

  switch (type) {
    case 'UPGRADE':
      bg = '#eab308'; // Amber
      label = 'P';
      break;
    case 'SHIELD':
      bg = '#06b6d4'; // Cyan
      label = 'S';
      break;
    case 'BOMB':
      bg = '#ef4444'; // Red
      label = 'B';
      break;
    case 'MISSILES':
      bg = '#f97316'; // Orange
      label = 'M';
      break;
    case 'DRONE':
      bg = '#a855f7'; // Purple
      label = 'D';
      break;
    case 'HYPER':
      bg = '#ec4899'; // Pink
      label = 'H';
      break;
    case 'REPAIR':
      bg = '#10b981'; // Green
      label = '+';
      break;
  }

  // Border diamond
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-13, -13, 26, 26);

  ctx.fillStyle = bg;
  ctx.fillRect(-11, -11, 22, 22);

  // Letter label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);

  ctx.restore();
}

// Floating Score Gem
export function drawScoreGem(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  ctx.save();
  ctx.translate(x, y);
  const rot = tick * 0.08;
  ctx.rotate(rot);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6, -6, 12, 12);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-4, -4, 8, 8);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-1, -1, 3, 3);

  ctx.restore();
}
