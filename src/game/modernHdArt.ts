/**
 * Modern HD Sci-Fi Vector & Shader Rendering Engine
 * Renders anti-aliased, multi-layered, gradient-shaded aerospace starfighters,
 * volumetric ion thrusters, hexagonal forcefields, and cinematic bosses.
 */

import { ShipSkin } from './types';

/** Helper to draw a glowing radial light / bloom */
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number = 0.5
) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Modern HD Player Starfighter */
export function drawModernPlayerShip(
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
    return;
  }

  ctx.save();
  ctx.translate(x, y);

  if (dashAngle !== 0) {
    ctx.rotate(dashAngle);
  }

  // Perspective banking tilt: scale width slightly based on bank
  const bankSkew = bank * 0.18;
  const leftWingScale = bank === -1 ? 0.72 : bank === 1 ? 1.15 : 1.0;
  const rightWingScale = bank === 1 ? 0.72 : bank === -1 ? 1.15 : 1.0;

  // 1. Modern Volumetric Ion Thruster Plumes
    // === ULTRA PHONE POSTER BLUE THRUSTER ===
  const thrustLength = 38 + (speedY < 0 ? 22 : 8) + Math.random() * 8;
  const thrustColor = "#00e5ff";
  const enginePositions = [-11, 11];
  enginePositions.forEach((ex) => {
    const len = thrustLength;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    drawGlow(ctx, ex, 20, 32, "#00ffff", 0.9);
    const plumeGrad = ctx.createLinearGradient(ex, 14, ex, 14 + len);
    plumeGrad.addColorStop(0, '#ffffff');
    plumeGrad.addColorStop(0.15, '#a0ffff');
    plumeGrad.addColorStop(0.4, thrustColor);
    plumeGrad.addColorStop(0.85, '#0066ff');
    plumeGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = plumeGrad;
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#00ffff";
    ctx.beginPath();
    ctx.moveTo(ex - 5, 14);
    ctx.quadraticCurveTo(ex - 7, 14 + len * 0.5, ex, 14 + len);
    ctx.quadraticCurveTo(ex + 7, 14 + len * 0.5, ex + 5, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(ex, 16, 2.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  // 2. Main Wings (Left and Right with dynamic perspective)
  // Left Wing
  ctx.save();
  ctx.scale(leftWingScale, 1);
  const leftGrad = ctx.createLinearGradient(-30, -5, 0, 15);
  leftGrad.addColorStop(0, skin.primaryColor);
  leftGrad.addColorStop(0.7, '#1e293b');
  leftGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = leftGrad;
  ctx.strokeStyle = skin.accentColor;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-12, -2);
  ctx.lineTo(-28, 8);
  ctx.lineTo(-30, 16);
  ctx.lineTo(-16, 14);
  ctx.lineTo(-8, 18);
  ctx.lineTo(0, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing weapon pod & accent stripe
  ctx.fillStyle = skin.accentColor;
  ctx.fillRect(-27, 4, 3, 10);
  ctx.fillStyle = skin.bulletColor;
  ctx.fillRect(-28, 2, 4, 4); // muzzle glow
  ctx.restore();

  // Right Wing
  ctx.save();
  ctx.scale(rightWingScale, 1);
  const rightGrad = ctx.createLinearGradient(30, -5, 0, 15);
  rightGrad.addColorStop(0, skin.primaryColor);
  rightGrad.addColorStop(0.7, '#1e293b');
  rightGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = rightGrad;
  ctx.strokeStyle = skin.accentColor;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(12, -2);
  ctx.lineTo(28, 8);
  ctx.lineTo(30, 16);
  ctx.lineTo(16, 14);
  ctx.lineTo(8, 18);
  ctx.lineTo(0, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing weapon pod & accent stripe
  ctx.fillStyle = skin.accentColor;
  ctx.fillRect(24, 4, 3, 10);
  ctx.fillStyle = skin.bulletColor;
  ctx.fillRect(24, 2, 4, 4); // muzzle glow
  ctx.restore();

  // 3. Central Fuselage / Cockpit Hull
  const hullGrad = ctx.createLinearGradient(0, -26, 0, 18);
  hullGrad.addColorStop(0, '#ffffff');
  hullGrad.addColorStop(0.15, skin.primaryColor);
  hullGrad.addColorStop(0.8, '#1e293b');
  hullGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = hullGrad;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(0, -25); // Nose cone
  ctx.lineTo(6, -14);
  ctx.lineTo(9, 6);
  ctx.lineTo(7, 18);
  ctx.lineTo(-7, 18);
  ctx.lineTo(-9, 6);
  ctx.lineTo(-6, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Specular Center Spine Ridge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, 12);
  ctx.stroke();

  // 4. Illuminated Glass Canopy with Specular Glare
  const canopyGrad = ctx.createLinearGradient(0, -16, 0, 2);
  canopyGrad.addColorStop(0, '#e0f2fe');
  canopyGrad.addColorStop(0.4, '#38bdf8');
  canopyGrad.addColorStop(1, '#0369a1');

  ctx.fillStyle = canopyGrad;
  ctx.beginPath();
  ctx.moveTo(0, -17);
  ctx.lineTo(4, -9);
  ctx.lineTo(3, 1);
  ctx.lineTo(-3, 1);
  ctx.lineTo(-4, -9);
  ctx.closePath();
  ctx.fill();

  // Canopy glare highlight line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-1, -15);
  ctx.lineTo(-2, -6);
  ctx.stroke();

  // Subtle ship ambient glow
  drawGlow(ctx, 0, 0, 32, skin.bulletColor, 0.15);

  ctx.restore();
}

/** Modern HD Combat Satellite Drone */
export function drawModernDrone(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Drone Chassis
  const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 10);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, '#06b6d4');
  grad.addColorStop(0.8, '#0f172a');
  grad.addColorStop(1, '#0284c7');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // Rotating energy ring
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 1.5);
  ctx.stroke();

  // Mini plasma jet
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(-1.5, 7, 3, 5);

  drawGlow(ctx, 0, 0, 15, '#06b6d4', 0.3);

  ctx.restore();
}

/** Modern HD Enemies */
export function drawModernScout(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  ctx.save();
  ctx.translate(x, y);

  const bob = Math.sin(tick * 0.1) * 3;
  ctx.translate(0, bob);

  // Aerodynamic Dart Body
  const grad = ctx.createLinearGradient(0, -14, 0, 14);
  grad.addColorStop(0, '#10b981');
  grad.addColorStop(0.6, '#065f46');
  grad.addColorStop(1, '#022c22');

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.lineTo(12, -4);
  ctx.lineTo(14, -10);
  ctx.lineTo(0, -14);
  ctx.lineTo(-14, -10);
  ctx.lineTo(-12, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing Optic Visor
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.ellipse(0, 4, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  drawGlow(ctx, 0, 4, 8, '#facc15', 0.5);

  // Twin emerald thrusters
  ctx.fillStyle = '#34d399';
  ctx.fillRect(-7, -15, 3, 4);
  ctx.fillRect(4, -15, 3, 4);

  ctx.restore();
}

export function drawModernInterceptor(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  ctx.save();
  ctx.translate(x, y);

  const bob = Math.cos(tick * 0.08) * 3;
  ctx.translate(0, bob);

  // Aggressive Swept Delta Wing
  const grad = ctx.createLinearGradient(0, -18, 0, 18);
  grad.addColorStop(0, '#f43f5e');
  grad.addColorStop(0.6, '#9f1239');
  grad.addColorStop(1, '#4c0519');

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#fb7185';
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(18, -6);
  ctx.lineTo(20, -14);
  ctx.lineTo(6, -10);
  ctx.lineTo(0, -16);
  ctx.lineTo(-6, -10);
  ctx.lineTo(-20, -14);
  ctx.lineTo(-18, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red cockpit visor
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, 2, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  drawGlow(ctx, 0, 2, 10, '#f43f5e', 0.6);

  ctx.restore();
}

export function drawModernDreadnought(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  ctx.save();
  ctx.translate(x, y);

  // Heavy Armored Cruiser Hull
  const hullGrad = ctx.createLinearGradient(0, -25, 0, 25);
  hullGrad.addColorStop(0, '#8b5cf6');
  hullGrad.addColorStop(0.5, '#4c1d95');
  hullGrad.addColorStop(1, '#1e1b4b');

  ctx.fillStyle = hullGrad;
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, 26);
  ctx.lineTo(26, 12);
  ctx.lineTo(34, -8);
  ctx.lineTo(18, -24);
  ctx.lineTo(-18, -24);
  ctx.lineTo(-34, -8);
  ctx.lineTo(-26, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dual Heavy Plasma Pods
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(-22, 0, 6, 16);
  ctx.fillRect(16, 0, 6, 16);

  // Central Power Core
  const corePulse = Math.sin(tick * 0.1) * 2;
  const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 9 + corePulse);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.5, '#c084fc');
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 9 + corePulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawModernAsteroid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rot: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Irregular rock silhouette with shadow
  const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
  grad.addColorStop(0, '#64748b');
  grad.addColorStop(0.6, '#334155');
  grad.addColorStop(1, '#0f172a');

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  const points = 8;
  for (let i = 0; i < points; i++) {
    const angle = (i * Math.PI * 2) / points;
    const offset = Math.sin(angle * 3) * (radius * 0.15);
    const r = radius + offset;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Craters with depth shading
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(-radius * 0.25, -radius * 0.2, radius * 0.22, 0, Math.PI * 2);
  ctx.arc(radius * 0.3, radius * 0.25, radius * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// --- Modern HD Stage Bosses ---

/** Stage 1 Boss: GIGA CYCLOPS (HD Biomechanical Dreadnought) */
export function drawModernBossCyclops(
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
  const hullPrimary = isEnraged ? '#dc2626' : '#4f46e5';
  const hullSecondary = isEnraged ? '#7f1d1d' : '#1e1b4b';
  const coreGlow = isEnraged ? '#ef4444' : '#06b6d4';

  // 1. Armored Heavy Chassis Base
  const baseGrad = ctx.createLinearGradient(0, -45, 0, 45);
  baseGrad.addColorStop(0, hullSecondary);
  baseGrad.addColorStop(0.5, hullPrimary);
  baseGrad.addColorStop(1, '#090d16');

  ctx.fillStyle = baseGrad;
  ctx.strokeStyle = isEnraged ? '#f87171' : '#818cf8';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, -45);
  ctx.lineTo(85, -25);
  ctx.lineTo(105, 10);
  ctx.lineTo(75, 45);
  ctx.lineTo(35, 40);
  ctx.lineTo(0, 50);
  ctx.lineTo(-35, 40);
  ctx.lineTo(-75, 45);
  ctx.lineTo(-105, 10);
  ctx.lineTo(-85, -25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. Articulated Rotary Turret Pods
  const turretSway = Math.sin(tick * 0.06) * 5;
  [-90, 90].forEach(tx => {
    ctx.fillStyle = '#334155';
    ctx.fillRect(tx - 12, -15 + turretSway, 24, 42);

    // Muzzle glow
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(tx, 30 + turretSway, 6, 0, Math.PI * 2);
    ctx.fill();
    drawGlow(ctx, tx, 30 + turretSway, 14, '#f59e0b', 0.5);
  });

  // 3. Central Cyclops Optic Core
  const eyeRadius = 26;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, eyeRadius + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isEnraged ? '#ef4444' : '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Eye Iris aperture
  const eyeGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, eyeRadius);
  eyeGrad.addColorStop(0, '#ffffff');
  eyeGrad.addColorStop(0.4, coreGlow);
  eyeGrad.addColorStop(1, '#0284c7');

  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.arc(0, 0, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pupil tracking
  const pupilX = Math.sin(tick * 0.04) * 6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pupilX, 0, eyeRadius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  drawGlow(ctx, 0, 0, 48, coreGlow, 0.4);

  // 4. Optic Death Ray Beam
  if (isFiringLaser) {
    const beamGrad = ctx.createLinearGradient(-18, 0, 18, 0);
    beamGrad.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
    beamGrad.addColorStop(0.5, '#ffffff');
    beamGrad.addColorStop(1, 'rgba(239, 68, 68, 0.2)');

    ctx.fillStyle = beamGrad;
    ctx.fillRect(-22, eyeRadius + 4, 44, 900);

    // Inner hyper core beam
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, eyeRadius + 4, 14, 900);

    drawGlow(ctx, 0, eyeRadius + 10, 40, '#ef4444', 0.8);
  }

  ctx.restore();
}

/** Stage 2 Boss: TITAN SCORPION (HD Mecha Assault Cruiser) */
export function drawModernBossScorpion(
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
  const hull = isEnraged ? '#ea580c' : '#0d9488';
  const trim = isEnraged ? '#7c2d12' : '#115e59';

  // Hydraulic Pincer Claws
  const pincerAngle = pincerOpen * 0.42;

  // Left Hydraulic Claw
  ctx.save();
  ctx.translate(-58, -12);
  ctx.rotate(-pincerAngle);
  const leftClawGrad = ctx.createLinearGradient(-40, 0, 0, 20);
  leftClawGrad.addColorStop(0, '#334155');
  leftClawGrad.addColorStop(1, hull);
  ctx.fillStyle = leftClawGrad;
  ctx.strokeStyle = '#5eead4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-45, -18);
  ctx.lineTo(-55, 12);
  ctx.lineTo(-20, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right Hydraulic Claw
  ctx.save();
  ctx.translate(58, -12);
  ctx.rotate(pincerAngle);
  const rightClawGrad = ctx.createLinearGradient(40, 0, 0, 20);
  rightClawGrad.addColorStop(0, '#334155');
  rightClawGrad.addColorStop(1, hull);
  ctx.fillStyle = rightClawGrad;
  ctx.strokeStyle = '#5eead4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(45, -18);
  ctx.lineTo(55, 12);
  ctx.lineTo(20, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Main Carapace Body
  const bodyGrad = ctx.createLinearGradient(0, -35, 0, 35);
  bodyGrad.addColorStop(0, trim);
  bodyGrad.addColorStop(0.5, hull);
  bodyGrad.addColorStop(1, '#090d16');

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#2dd4bf';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 55, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Curving Plasma Stinger Coil
  const stingerSway = Math.sin(tick * 0.08) * 18;
  ctx.save();
  ctx.translate(stingerSway, -55);
  const stingerGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
  stingerGrad.addColorStop(0, '#ffffff');
  stingerGrad.addColorStop(0.4, '#f59e0b');
  stingerGrad.addColorStop(1, '#78350f');

  ctx.fillStyle = stingerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawGlow(ctx, 0, 0, 26, '#f59e0b', 0.6);
  ctx.restore();

  ctx.restore();
}

/** Stage 3 Boss: VOID LEVIATHAN (HD Cosmic Flagship) */
export function drawModernBossLeviathan(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  healthPercent: number,
  tick: number
) {
  ctx.save();
  ctx.translate(x, y);

  const isPhase2 = healthPercent < 0.5;

  // 1. Sweeping Holographic Energy Wings
  const wingGrad = ctx.createLinearGradient(0, -60, 0, 50);
  wingGrad.addColorStop(0, '#312e81');
  wingGrad.addColorStop(0.5, isPhase2 ? '#831843' : '#4c1d95');
  wingGrad.addColorStop(1, '#090d16');

  ctx.fillStyle = wingGrad;
  ctx.strokeStyle = isPhase2 ? '#f43f5e' : '#a855f7';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(0, -55);
  ctx.lineTo(110, -15);
  ctx.lineTo(85, 45);
  ctx.lineTo(35, 30);
  ctx.lineTo(0, 40);
  ctx.lineTo(-35, 30);
  ctx.lineTo(-85, 45);
  ctx.lineTo(-110, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing Neon Tracer Lines
  ctx.strokeStyle = isPhase2 ? '#fb7185' : '#c084fc';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-100, -10);
  ctx.lineTo(0, -40);
  ctx.lineTo(100, -10);
  ctx.stroke();

  // 2. Central Gravitational Singularity Core
  const coreRadius = 24 + Math.sin(tick * 0.12) * 5;
  const coreGrad = ctx.createRadialGradient(0, 5, 2, 0, 5, coreRadius);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.3, isPhase2 ? '#f43f5e' : '#c084fc');
  coreGrad.addColorStop(0.7, '#1e1b4b');
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 5, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting Rift Shards in Phase 2
  if (isPhase2) {
    for (let i = 0; i < 5; i++) {
      const angle = tick * 0.05 + (i * Math.PI * 2) / 5;
      const ox = Math.cos(angle) * 70;
      const oy = Math.sin(angle) * 45;

      drawGlow(ctx, ox, oy, 16, '#f43f5e', 0.5);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawGlow(ctx, 0, 5, 55, isPhase2 ? '#f43f5e' : '#a855f7', 0.4);

  ctx.restore();
}

/** Stage 4 Boss: SOLAR COLOSSUS (Colossal Sun Fortress Cruiser) */
export function drawModernBossColossus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  healthPercent: number,
  tick: number
) {
  ctx.save();
  ctx.translate(x, y);

  const isEnraged = healthPercent < 0.4;
  const armor = isEnraged ? '#ea580c' : '#d97706';
  const trim = isEnraged ? '#7c2d12' : '#78350f';
  const coreGlow = isEnraged ? '#ef4444' : '#f59e0b';

  // 1. Heavy Outrigger Armor Wings
  const wingGrad = ctx.createLinearGradient(0, -50, 0, 50);
  wingGrad.addColorStop(0, '#1e293b');
  wingGrad.addColorStop(0.5, armor);
  wingGrad.addColorStop(1, '#090d16');

  ctx.fillStyle = wingGrad;
  ctx.strokeStyle = coreGlow;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(0, -50);
  ctx.lineTo(115, -20);
  ctx.lineTo(125, 25);
  ctx.lineTo(85, 50);
  ctx.lineTo(40, 35);
  ctx.lineTo(0, 45);
  ctx.lineTo(-40, 35);
  ctx.lineTo(-85, 50);
  ctx.lineTo(-125, 25);
  ctx.lineTo(-115, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. Twin Rotating Solar Induction Rings
  ctx.save();
  ctx.rotate(tick * 0.04);
  ctx.strokeStyle = coreGlow;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.rotate(-tick * 0.03);
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([12, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3. Flank Rotary Gatling Cannons
  [-95, 95].forEach(gx => {
    ctx.fillStyle = '#334155';
    ctx.fillRect(gx - 10, -10, 20, 45);

    // Muzzle charging flares
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(gx, 35, 6, 0, Math.PI * 2);
    ctx.fill();
    drawGlow(ctx, gx, 35, 16, coreGlow, 0.6);
  });

  // 4. Central Molten Solar Fusion Core
  const corePulse = Math.sin(tick * 0.15) * 4;
  const coreRad = 20 + corePulse;
  const sunGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, coreRad);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.35, '#fef08a');
  sunGrad.addColorStop(0.7, coreGlow);
  sunGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coreRad, 0, Math.PI * 2);
  ctx.fill();

  drawGlow(ctx, 0, 0, 60, coreGlow, 0.5);

  ctx.restore();
}

/** Stage 5 Boss: NEO CHIMERA (Hyper Mecha Dragon Leviathan) */
export function drawModernBossChimera(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  healthPercent: number,
  tick: number
) {
  ctx.save();
  ctx.translate(x, y);

  const isEnraged = healthPercent < 0.45;
  const primaryColor = isEnraged ? '#059669' : '#10b981';
  const neonCyan = isEnraged ? '#f43f5e' : '#06b6d4';

  // 1. Serpentine Articulated Body Segment Undulation
  const segments = 4;
  for (let i = segments; i >= 1; i--) {
    const waveX = Math.sin(tick * 0.09 + i * 0.8) * (i * 12);
    const segY = -25 - i * 18;
    const segWidth = 70 - i * 9;
    const segHeight = 22;

    const segGrad = ctx.createLinearGradient(waveX - segWidth, segY, waveX + segWidth, segY);
    segGrad.addColorStop(0, '#064e3b');
    segGrad.addColorStop(0.5, primaryColor);
    segGrad.addColorStop(1, '#064e3b');

    ctx.fillStyle = segGrad;
    ctx.strokeStyle = neonCyan;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(waveX, segY, segWidth, segHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spines / energy vents
    ctx.fillStyle = neonCyan;
    ctx.fillRect(waveX - 4, segY - 12, 8, 5);
  }

  // 2. Colossal Forward Dragon Swept Wings
  const wingSweep = Math.sin(tick * 0.06) * 6;
  const wingGrad = ctx.createLinearGradient(0, -30, 0, 45);
  wingGrad.addColorStop(0, '#064e3b');
  wingGrad.addColorStop(0.5, '#0f766e');
  wingGrad.addColorStop(1, '#090d16');

  ctx.fillStyle = wingGrad;
  ctx.strokeStyle = neonCyan;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(0, -35);
  ctx.lineTo(130, -10 + wingSweep);
  ctx.lineTo(95, 45 + wingSweep);
  ctx.lineTo(40, 25);
  ctx.lineTo(0, 35);
  ctx.lineTo(-40, 25);
  ctx.lineTo(-95, 45 - wingSweep);
  ctx.lineTo(-130, -10 - wingSweep);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing plasma conductors
  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-115, -5 - wingSweep);
  ctx.lineTo(-20, 5);
  ctx.moveTo(115, -5 + wingSweep);
  ctx.lineTo(20, 5);
  ctx.stroke();

  // 3. Central Mecha Dragon Head & Maw
  const headGrad = ctx.createLinearGradient(0, -20, 0, 40);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.3, primaryColor);
  headGrad.addColorStop(1, '#064e3b');

  ctx.fillStyle = headGrad;
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 45); // Snout
  ctx.lineTo(24, 15);
  ctx.lineTo(30, -15);
  ctx.lineTo(0, -25);
  ctx.lineTo(-30, -15);
  ctx.lineTo(-24, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing Dragon Eyes
  [-12, 12].forEach(ex => {
    ctx.fillStyle = isEnraged ? '#ef4444' : '#facc15';
    ctx.beginPath();
    ctx.ellipse(ex, 0, 4, 7, ex > 0 ? 0.3 : -0.3, 0, Math.PI * 2);
    ctx.fill();
    drawGlow(ctx, ex, 0, 12, isEnraged ? '#ef4444' : '#facc15', 0.6);
  });

  // Snout Plasma Cannon Maw Glow
  const mawGlow = ctx.createRadialGradient(0, 38, 1, 0, 38, 16);
  mawGlow.addColorStop(0, '#ffffff');
  mawGlow.addColorStop(0.5, neonCyan);
  mawGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = mawGlow;
  ctx.beginPath();
  ctx.arc(0, 38, 16, 0, Math.PI * 2);
  ctx.fill();

  drawGlow(ctx, 0, 10, 65, neonCyan, 0.4);

  ctx.restore();
}

/** Modern HD Shimmering Hexagonal Forcefield */
export function drawModernShield(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  tick: number
) {
  ctx.save();
  ctx.translate(x, y);

  const pulse = Math.sin(tick * 0.1) * 2;
  const r = radius + pulse;

  // Hexagonal tessellation outline
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const hx = Math.cos(angle) * r;
    const hy = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner energy wash
  const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
  grad.addColorStop(0.8, 'rgba(6, 182, 212, 0.22)');
  grad.addColorStop(1, 'rgba(14, 165, 233, 0.4)');

  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
}

/** Modern HD Power-Up Badge */
export function drawModernPowerUp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: string,
  tick: number
) {
  ctx.save();
  ctx.translate(x, y);

  const bob = Math.sin(tick * 0.1) * 4;
  ctx.translate(0, bob);

  let bg = '#06b6d4';
  let label = 'P';

  switch (type) {
    case 'UPGRADE': bg = '#f59e0b'; label = 'P'; break;
    case 'SHIELD': bg = '#06b6d4'; label = 'S'; break;
    case 'BOMB': bg = '#ef4444'; label = 'B'; break;
    case 'MISSILES': bg = '#f97316'; label = 'M'; break;
    case 'DRONE': bg = '#a855f7'; label = 'D'; break;
    case 'HYPER': bg = '#ec4899'; label = 'H'; break;
    case 'REPAIR': bg = '#10b981'; label = '+'; break;
  }

  // Glowing orb container
  drawGlow(ctx, 0, 0, 22, bg, 0.4);

  const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, bg);
  grad.addColorStop(1, '#0f172a');

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Modern clean label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);

  ctx.restore();
}

/** Modern HD Energy Crystal */
export function drawModernGem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tick: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tick * 0.06);

  drawGlow(ctx, 0, 0, 12, '#38bdf8', 0.4);

  const grad = ctx.createLinearGradient(-6, -6, 6, 6);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#38bdf8');
  grad.addColorStop(1, '#0284c7');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(6, 0);
  ctx.lineTo(0, 8);
  ctx.lineTo(-6, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
