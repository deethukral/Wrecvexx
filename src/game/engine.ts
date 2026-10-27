/**
 * Pixel Striker Core Game Engine
 * 60 FPS Canvas Game Loop, Physics, Entities, Boss AI, and Particle Systems.
 */

import { DifficultyLevel, GameStats, ShipSkin, GameplayBooster, Player, Boss } from './types';
import { soundManager } from './audio';
import {
  drawPlayerShip,
  drawDrone,
  drawEnemyScout,
  drawEnemyInterceptor,
  drawEnemyDreadnought,
  drawAsteroid,
  drawBossCyclops,
  drawBossScorpion,
  drawBossLeviathan,
  drawPowerUp,
  drawScoreGem,
} from './pixelArt';
import {
  drawModernPlayerShip,
  drawModernDrone,
  drawModernScout,
  drawModernInterceptor,
  drawModernDreadnought,
  drawModernAsteroid,
  drawModernBossCyclops,
  drawModernBossScorpion,
  drawModernBossLeviathan,
  drawModernBossColossus,
  drawModernBossChimera,
  drawModernShield,
  drawModernPowerUp,
  drawModernGem,
  drawGlow,
} from './modernHdArt';

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isPlayer: boolean;
  damage: number;
  pierce?: number;
  isLaserBeam?: boolean;
}

export interface Missile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetId: number | null;
  targetType: 'enemy' | 'boss';
  life: number;
}

export interface Enemy {
  id: number;
  type: 'scout' | 'interceptor' | 'dreadnought' | 'asteroid';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  scoreValue: number;
  shootCooldown: number;
  rotation: number;
  rotSpeed: number;
  radius: number;
}


export interface PowerUpItem {
  id: number;
  type: 'UPGRADE' | 'SHIELD' | 'BOMB' | 'MISSILES' | 'DRONE' | 'HYPER' | 'REPAIR';
  x: number;
  y: number;
  vy: number;
}

export interface ScoreGemItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  fade: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  color: string;
  font: string;
}

export interface DashGhost {
  x: number;
  y: number;
  angle: number;
  alpha: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Viewport
  public width: number = 480;
  public height: number = 800;

  // Configuration
  public difficulty: DifficultyLevel = 'ACE';
  public skin: ShipSkin;
  public boosters: GameplayBooster[] = [];
  public screenShakeIntensity: number = 1.0;
  public crtEnabled: boolean = false; // default false for crisp HD clarity!
  public autoFire: boolean = true;
  public graphicsMode: 'HD' | 'RETRO' = 'HD';

  // State
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;
  public stage: number = 1;
  public wave: number = 1;
  public tick: number = 0;
  public shakeAmount: number = 0;

  // Boss alert sequence
  public bossAlertActive: boolean = false;
  public bossAlertTimer: number = 0;

  // Stats
  public stats: GameStats = {
    score: 0,
    highScore: 0,
    stage: 1,
    wave: 1,
    enemiesDestroyed: 0,
    bossesDefeated: 0,
    shotsFired: 0,
    shotsHit: 0,
    creditsEarned: 0,
    timeSurvivedSeconds: 0,
    combo: 0,
    maxCombo: 0,
  };

  // Entities
  public player!: Player;
  public bullets: Bullet[] = [];
  public missiles: Missile[] = [];
  public enemies: Enemy[] = [];
  public boss: Boss | null = null;
  public powerUps: PowerUpItem[] = [];
  public scoreGems: ScoreGemItem[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public dashGhosts: DashGhost[] = [];

  // Starfield
  private stars: Array<{ x: number; y: number; size: number; speed: number; alpha: number; color: string }> = [];

  // Input states
  public keys: Record<string, boolean> = {};
  public pointer = { x: 240, y: 700, isDown: false, isMoving: false };
  public virtualStick = { active: false, dx: 0, dy: 0 };
  public useVirtualStick: boolean = false;

  // Callbacks
  public onStatsUpdate?: (stats: GameStats, player: Player, boss: Boss | null) => void;
  public onGameOver?: (stats: GameStats) => void;
  public onVictory?: (stats: GameStats) => void;

  constructor(
    canvas: HTMLCanvasElement,
    skin: ShipSkin,
    difficulty: DifficultyLevel,
    boosters: GameplayBooster[]
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false;

    this.skin = skin;
    this.difficulty = difficulty;
    this.boosters = boosters;

    this.initStars();
    this.reset();
  }

  private initStars() {
    this.stars = [];
    const count = 90;
    const colors = ['#ffffff', '#bae6fd', '#fef08a', '#c084fc'];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3,
        speed: 0.8 + Math.random() * 2.2,
        alpha: 0.3 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  public reset(difficulty?: DifficultyLevel) {
    if (difficulty) this.difficulty = difficulty;

    const lives = this.difficulty === 'CADET' ? 3 : this.difficulty === 'ACE' ? 2 : 1;
    const baseHealth = this.difficulty === 'CADET' ? 100 : this.difficulty === 'ACE' ? 80 : 50;

    // Boosters calculation
    const shieldBooster = this.boosters.find(b => b.id === 'booster_shield')?.level || 0;
    const bombBooster = this.boosters.find(b => b.id === 'booster_bombs')?.level || 0;
    const hyperBooster = this.boosters.find(b => b.id === 'booster_hyper_start')?.level || 0;

    const extraShield = shieldBooster * 25;
    const startingBombs = 2 + bombBooster;
    const startWpnLvl = hyperBooster > 0 ? 2 : 1;
    const startDrones = hyperBooster > 0 ? 1 : 0;

    this.player = {
      x: this.width / 2,
      y: this.height - 100,
      width: 34,
      height: 34,
      speed: 6.2,
      vx: 0,
      vy: 0,
      bank: 0,
      health: baseHealth,
      maxHealth: baseHealth,
      shield: 50 + extraShield,
      maxShield: 100 + extraShield,
      lives,
      bombs: startingBombs,
      weaponLevel: startWpnLvl,
      weaponType: 'blaster',
      hasMissiles: false,
      missileCooldown: 0,
      dronesCount: startDrones,
      droneAngle: 0,
      invincibleTimer: 60,
      isDashing: false,
      dashTimer: 0,
      dashAngle: 0,
      dashCooldown: 0,
      hyperTimer: 0,
      lastDamageTime: 0,
      shotsFired: 0,
      shotsHit: 0,
    };

    this.bullets = [];
    this.missiles = [];
    this.enemies = [];
    this.boss = null;
    this.powerUps = [];
    this.scoreGems = [];
    this.particles = [];
    this.floatingTexts = [];
    this.dashGhosts = [];

    this.stage = 1;
    this.wave = 1;
    this.tick = 0;
    this.bossAlertActive = false;
    this.bossAlertTimer = 0;
    this.isGameOver = false;
    this.isVictory = false;

    this.stats = {
      score: 0,
      highScore: this.stats.highScore,
      stage: 1,
      wave: 1,
      enemiesDestroyed: 0,
      bossesDefeated: 0,
      shotsFired: 0,
      shotsHit: 0,
      creditsEarned: 0,
      timeSurvivedSeconds: 0,
      combo: 0,
      maxCombo: 0,
    };
  }

  public resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = this.graphicsMode === 'HD';
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    soundManager.startMusic(false);
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    soundManager.stopMusic();
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      soundManager.stopMusic();
    } else {
      soundManager.startMusic(this.boss !== null);
      this.lastTime = performance.now();
    }
  }

  // --- Main Loop ---
  private loop = (time: number) => {
    if (!this.isRunning) return;

    this.animFrameId = requestAnimationFrame(this.loop);
    if (this.isPaused) return;

    this.tick++;
    if (this.tick % 60 === 0) {
      this.stats.timeSurvivedSeconds++;
    }

    this.update();
    this.render();

    if (this.tick % 10 === 0 && this.onStatsUpdate) {
      this.onStatsUpdate(this.stats, this.player, this.boss);
    }
  };

  // --- Action Triggers ---
  public triggerDash() {
    if (this.player.isDashing || this.player.dashCooldown > 0) return;
    this.player.isDashing = true;
    this.player.dashTimer = 22; // ~0.36s
    this.player.dashCooldown = 65; // ~1s cooldown
    this.player.invincibleTimer = 25;
    soundManager.playDash();

    // Dash Shockwave Burst
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6,
        size: 3,
        color: this.skin.trailColor,
        life: 18,
        maxLife: 18,
        fade: true,
      });
    }

    this.addFloatingText('DODGE ROLL!', this.player.x, this.player.y - 20, '#38bdf8');
  }

  public triggerBomb() {
    if (this.player.bombs <= 0) return;
    this.player.bombs--;
    soundManager.playBomb();
    this.shakeAmount = 25;

    // Destroy all enemy bullets
    const bulletCount = this.bullets.filter(b => !b.isPlayer).length;
    this.bullets = this.bullets.filter(b => b.isPlayer);

    // Damage all enemies on screen
    this.enemies.forEach(enemy => {
      enemy.health -= 60;
      for (let i = 0; i < 8; i++) {
        this.particles.push({
          x: enemy.x + (Math.random() - 0.5) * 20,
          y: enemy.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: 4,
          color: '#ef4444',
          life: 25,
          maxLife: 25,
          fade: true,
        });
      }
    });

    // Damage Boss heavily
    if (this.boss) {
      this.boss.health -= 250;
      this.addFloatingText('-250 EMP BOMB', this.boss.x, this.boss.y, '#ef4444');
    }

    this.addFloatingText(`EMP BLAST! (${bulletCount} Bullets Cleared)`, this.player.x, this.player.y - 40, '#f43f5e');
  }

  // --- Update Step ---
  private update() {
    this.updatePlayer();
    this.updateStarfield();
    this.updateSpawns();
    this.updateEnemies();
    if (this.boss) this.updateBoss();
    this.updateBullets();
    this.updateMissiles();
    this.updatePowerUpsAndGems();
    this.updateParticles();
    this.updateCollisions();

    // Screen shake decay
    if (this.shakeAmount > 0) {
      this.shakeAmount *= 0.88;
      if (this.shakeAmount < 0.5) this.shakeAmount = 0;
    }
  }

  private updatePlayer() {
    const p = this.player;

    // Dash timer and rotation
    if (p.isDashing) {
      p.dashTimer--;
      p.dashAngle += (Math.PI * 2) / 22; // Complete 360 spin
      // Leave ghost trails
      if (this.tick % 3 === 0) {
        this.dashGhosts.push({
          x: p.x,
          y: p.y,
          angle: p.dashAngle,
          alpha: 0.6,
        });
      }
      if (p.dashTimer <= 0) {
        p.isDashing = false;
        p.dashAngle = 0;
      }
    }

    if (p.dashCooldown > 0) p.dashCooldown--;
    if (p.invincibleTimer > 0) p.invincibleTimer--;
    if (p.hyperTimer > 0) p.hyperTimer--;

    // Movement calculation
    let moveX = 0;
    let moveY = 0;

    // Keyboard
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) moveY -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) moveY += 1;

    // Virtual Stick (mobile)
    if (this.useVirtualStick && this.virtualStick.active) {
      moveX = this.virtualStick.dx;
      moveY = this.virtualStick.dy;
    } else if (this.pointer.isDown && this.pointer.isMoving) {
      // Touch Direct Drag
      const dx = this.pointer.x - p.x;
      const dy = (this.pointer.y - 40) - p.y; // 40px thumb offset so player sees ship!
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        moveX = dx / dist;
        moveY = dy / dist;
      }
    }

    // Dash gives 2x speed burst
    const currentSpeed = p.isDashing ? p.speed * 2.1 : p.speed;
    p.vx = moveX * currentSpeed;
    p.vy = moveY * currentSpeed;

    p.x += p.vx;
    p.y += p.vy;

    // Boundary clamping
    p.x = Math.max(p.width / 2, Math.min(this.width - p.width / 2, p.x));
    p.y = Math.max(p.height / 2, Math.min(this.height - p.height / 2, p.y));

    // Dynamic ship banking animation based on velocity
    if (p.vx < -1) {
      p.bank = -1;
    } else if (p.vx > 1) {
      p.bank = 1;
    } else {
      p.bank = 0;
    }

    // Auto Shield Recharge (Cadet mode)
    if (this.difficulty === 'CADET' && p.shield < p.maxShield) {
      if (this.tick - p.lastDamageTime > 240) { // 4 seconds without hit
        p.shield = Math.min(p.maxShield, p.shield + 0.3);
      }
    }

    // Drones Orbit
    if (p.dronesCount > 0) {
      p.droneAngle += 0.04;
    }

    // Player Shooting
    const fireInterval = p.hyperTimer > 0 ? 5 : 10;
    const shouldFire = this.autoFire || this.keys['Space'] || this.pointer.isDown;

    if (shouldFire && this.tick % fireInterval === 0) {
      this.firePlayerWeapons();
    }

    // Homing Missiles Fire
    if (p.hasMissiles && this.tick % 45 === 0) {
      this.fireHomingMissiles();
    }

    // Drones Fire
    if (p.dronesCount > 0 && this.tick % 25 === 0) {
      for (let i = 0; i < p.dronesCount; i++) {
        const angle = p.droneAngle + (i * Math.PI * 2) / p.dronesCount;
        const dx = p.x + Math.cos(angle) * 45;
        const dy = p.y + Math.sin(angle) * 45;
        this.bullets.push({
          id: Math.random(),
          x: dx,
          y: dy - 8,
          vx: 0,
          vy: -11,
          radius: 3,
          color: '#38bdf8',
          isPlayer: true,
          damage: 12,
        });
      }
    }

    // Fade dash ghosts
    for (let i = this.dashGhosts.length - 1; i >= 0; i--) {
      this.dashGhosts[i].alpha -= 0.05;
      if (this.dashGhosts[i].alpha <= 0) {
        this.dashGhosts.splice(i, 1);
      }
    }
  }

  private firePlayerWeapons() {
    const p = this.player;
    p.shotsFired++;
    this.stats.shotsFired++;
    const isHyper = p.hyperTimer > 0;
    const color = isHyper ? '#ec4899' : this.skin.bulletColor;

    soundManager.playShoot(isHyper ? 'laser' : p.weaponType);

    switch (p.weaponLevel) {
      case 1:
        // Twin Center Blaster
        this.bullets.push(
          { id: Math.random(), x: p.x - 7, y: p.y - 14, vx: 0, vy: -12, radius: 3, color, isPlayer: true, damage: 20 },
          { id: Math.random(), x: p.x + 7, y: p.y - 14, vx: 0, vy: -12, radius: 3, color, isPlayer: true, damage: 20 }
        );
        break;
      case 2:
        // Quad Blasters
        this.bullets.push(
          { id: Math.random(), x: p.x - 12, y: p.y - 10, vx: -0.6, vy: -12, radius: 3, color, isPlayer: true, damage: 22 },
          { id: Math.random(), x: p.x - 4, y: p.y - 16, vx: 0, vy: -13, radius: 3, color, isPlayer: true, damage: 25 },
          { id: Math.random(), x: p.x + 4, y: p.y - 16, vx: 0, vy: -13, radius: 3, color, isPlayer: true, damage: 25 },
          { id: Math.random(), x: p.x + 12, y: p.y - 10, vx: 0.6, vy: -12, radius: 3, color, isPlayer: true, damage: 22 }
        );
        break;
      case 3:
        // 5-Way Fan Spread
        for (let i = -2; i <= 2; i++) {
          this.bullets.push({
            id: Math.random(),
            x: p.x + i * 4,
            y: p.y - 14,
            vx: i * 2.2,
            vy: -12,
            radius: 3.5,
            color,
            isPlayer: true,
            damage: 26,
          });
        }
        break;
      case 4:
      case 5:
      default:
        // Heavy Plasma Burst + Angled Laser Bolts
        for (let i = -2; i <= 2; i++) {
          this.bullets.push({
            id: Math.random(),
            x: p.x + i * 5,
            y: p.y - 14,
            vx: i * 2.5,
            vy: -13,
            radius: 4,
            color,
            isPlayer: true,
            damage: 32,
          });
        }
        // Center piercing plasma bolt
        this.bullets.push({
          id: Math.random(),
          x: p.x,
          y: p.y - 20,
          vx: 0,
          vy: -14,
          radius: 6,
          color: '#ffffff',
          isPlayer: true,
          damage: 48,
          pierce: 2,
        });
        break;
    }
  }

  private fireHomingMissiles() {
    const p = this.player;
    // Launch 2 micro-missiles (left & right)
    [-1, 1].forEach(side => {
      this.missiles.push({
        id: Math.random(),
        x: p.x + side * 14,
        y: p.y,
        vx: side * 4,
        vy: -3,
        targetId: null,
        targetType: 'enemy',
        life: 120,
      });
    });
  }

  private updateStarfield() {
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = -5;
        star.x = Math.random() * this.width;
      }
    });
  }

  private updateSpawns() {
    // If boss is active or alert active, don't spawn regular waves
    if (this.boss || this.bossAlertActive) {
      if (this.bossAlertActive) {
        this.bossAlertTimer--;
        if (this.bossAlertTimer <= 0) {
          this.bossAlertActive = false;
          this.spawnBoss();
        }
      }
      return;
    }

    // Check if stage is ready for boss
    if (this.wave >= 5) {
      this.triggerBossAlert();
      return;
    }

    // Regular enemy wave timer
    const spawnRate = this.difficulty === 'MASTER' ? 65 : this.difficulty === 'ACE' ? 85 : 110;
    if (this.tick % spawnRate === 0) {
      this.spawnEnemyWave();
    }
  }

  private spawnEnemyWave() {
    const patterns = ['v-formation', 'scout-line', 'dreadnought-escort', 'asteroid-shower'];
    const p = patterns[Math.floor(Math.random() * patterns.length)];

    if (p === 'v-formation') {
      const startX = 60 + Math.random() * (this.width - 120);
      for (let i = 0; i < 5; i++) {
        const offset = Math.abs(i - 2) * 20;
        this.enemies.push({
          id: Math.random(),
          type: 'interceptor',
          x: startX + (i - 2) * 28,
          y: -30 - offset,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2.2 + Math.random() * 0.8,
          width: 26,
          height: 26,
          health: 35,
          maxHealth: 35,
          scoreValue: 150,
          shootCooldown: 40 + Math.floor(Math.random() * 50),
          rotation: 0,
          rotSpeed: 0,
          radius: 13,
        });
      }
    } else if (p === 'dreadnought-escort') {
      // 1 Heavy Dreadnought in middle
      this.enemies.push({
        id: Math.random(),
        type: 'dreadnought',
        x: this.width / 2,
        y: -50,
        vx: 0,
        vy: 1.2,
        width: 48,
        height: 38,
        health: 140,
        maxHealth: 140,
        scoreValue: 500,
        shootCooldown: 60,
        rotation: 0,
        rotSpeed: 0,
        radius: 24,
      });
      // 2 scouts on sides
      [-1, 1].forEach(side => {
        this.enemies.push({
          id: Math.random(),
          type: 'scout',
          x: this.width / 2 + side * 70,
          y: -40,
          vx: side * 0.5,
          vy: 2.5,
          width: 22,
          height: 20,
          health: 25,
          maxHealth: 25,
          scoreValue: 100,
          shootCooldown: 50,
          rotation: 0,
          rotSpeed: 0,
          radius: 11,
        });
      });
    } else if (p === 'asteroid-shower') {
      for (let i = 0; i < 4; i++) {
        const r = 14 + Math.random() * 16;
        this.enemies.push({
          id: Math.random(),
          type: 'asteroid',
          x: 40 + Math.random() * (this.width - 80),
          y: -40 - i * 35,
          vx: (Math.random() - 0.5) * 1.8,
          vy: 1.8 + Math.random() * 1.5,
          width: r * 2,
          height: r * 2,
          health: Math.floor(r * 2.2),
          maxHealth: Math.floor(r * 2.2),
          scoreValue: 80,
          shootCooldown: 9999, // Doesn't shoot
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          radius: r,
        });
      }
    } else {
      // scout line
      for (let i = 0; i < 4; i++) {
        this.enemies.push({
          id: Math.random(),
          type: 'scout',
          x: 40 + i * ((this.width - 80) / 3),
          y: -25,
          vx: Math.sin(i) * 1.2,
          vy: 2.8,
          width: 22,
          height: 20,
          health: 25,
          maxHealth: 25,
          scoreValue: 100,
          shootCooldown: 45,
          rotation: 0,
          rotSpeed: 0,
          radius: 11,
        });
      }
    }

    if (this.tick % 400 === 0) {
      this.wave++;
      this.stats.wave = this.wave;
      this.addFloatingText(`WAVE ${this.wave}`, this.width / 2, this.height * 0.35, '#38bdf8');
    }
  }

  private triggerBossAlert() {
    this.bossAlertActive = true;
    this.bossAlertTimer = 160; // ~2.6s siren
    soundManager.playBossWarning();
    this.shakeAmount = 15;
  }

  private spawnBoss() {
    soundManager.startMusic(true);
    let bossType: 'cyclops' | 'scorpion' | 'leviathan' | 'colossus' | 'chimera' = 'cyclops';
    let bossName = 'GIGA CYCLOPS';
    let maxHp = 1200;
    let width = 140;
    let height = 90;

    if (this.stage === 2) {
      bossType = 'scorpion';
      bossName = 'TITAN SCORPION';
      maxHp = 2200;
      width = 150;
      height = 100;
    } else if (this.stage === 3) {
      bossType = 'leviathan';
      bossName = 'VOID LEVIATHAN';
      maxHp = 3500;
      width = 170;
      height = 110;
    } else if (this.stage === 4) {
      bossType = 'colossus';
      bossName = 'SOLAR COLOSSUS';
      maxHp = 5200;
      width = 185;
      height = 115;
    } else if (this.stage >= 5) {
      bossType = 'chimera';
      bossName = 'NEO CHIMERA';
      maxHp = 7200;
      width = 200;
      height = 125;
    }

    // Difficulty health multiplier
    const mult = this.difficulty === 'MASTER' ? 1.5 : this.difficulty === 'ACE' ? 1.15 : 0.85;
    maxHp = Math.floor(maxHp * mult);

    this.boss = {
      id: Math.random(),
      type: bossType,
      name: bossName,
      stage: this.stage,
      x: this.width / 2,
      y: -120,
      targetX: this.width / 2,
      targetY: 140,
      width,
      height,
      health: maxHp,
      maxHealth: maxHp,
      phase: 1,
      attackTimer: 0,
      attackPattern: 0,
      isLaserCharging: false,
      isLaserFiring: false,
      laserTimer: 0,
      pincerOpen: 0,
      enraged: false,
    };

    this.addFloatingText(`WARNING: ${bossName}`, this.width / 2, this.height * 0.4, '#ef4444');
  }

  private updateEnemies() {
    const bulletSpeed = this.difficulty === 'MASTER' ? 4.8 : this.difficulty === 'ACE' ? 3.8 : 2.9;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.x += e.vx;
      e.y += e.vy;
      e.rotation += e.rotSpeed;

      // Bounce horizontally on edges
      if (e.x < e.radius || e.x > this.width - e.radius) {
        e.vx *= -1;
      }

      // Shoot cooldown
      e.shootCooldown--;
      if (e.shootCooldown <= 0 && e.type !== 'asteroid' && e.y > 20 && e.y < this.height - 100) {
        soundManager.playEnemyShoot();
        if (e.type === 'dreadnought') {
          // Triple fan
          for (let a = -1; a <= 1; a++) {
            this.bullets.push({
              id: Math.random(),
              x: e.x,
              y: e.y + 16,
              vx: a * 1.6,
              vy: bulletSpeed,
              radius: 4,
              color: '#c084fc',
              isPlayer: false,
              damage: 15,
            });
          }
          e.shootCooldown = 90;
        } else {
          // Aim at player
          const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          this.bullets.push({
            id: Math.random(),
            x: e.x,
            y: e.y + 12,
            vx: Math.cos(angle) * bulletSpeed,
            vy: Math.sin(angle) * bulletSpeed,
            radius: 3.5,
            color: '#ef4444',
            isPlayer: false,
            damage: 12,
          });
          e.shootCooldown = 75 + Math.floor(Math.random() * 40);
        }
      }

      // Remove off-screen
      if (e.y > this.height + 50) {
        this.enemies.splice(i, 1);
      }
    }
  }

  private updateBoss() {
    const b = this.boss!;
    const healthPercent = b.health / b.maxHealth;
    b.enraged = healthPercent < 0.45;

    // Smooth entrance movement to targetY
    b.x += (b.targetX - b.x) * 0.05;
    b.y += (b.targetY - b.y) * 0.05;

    // Sway side-to-side
    b.targetX = this.width / 2 + Math.sin(this.tick * 0.03) * (this.width * 0.32);

    b.attackTimer++;
    const speedMult = b.enraged ? 1.4 : 1.0;

    // Boss Attack Patterns
    if (b.type === 'cyclops') {
      // Pattern 1: Spiral Bullet Hell
      if (b.attackTimer % 20 === 0 && !b.isLaserFiring) {
        const bulletsCount = b.enraged ? 12 : 8;
        const baseAngle = this.tick * 0.15;
        for (let i = 0; i < bulletsCount; i++) {
          const angle = baseAngle + (i * Math.PI * 2) / bulletsCount;
          this.bullets.push({
            id: Math.random(),
            x: b.x,
            y: b.y + 20,
            vx: Math.cos(angle) * (3.2 * speedMult),
            vy: Math.sin(angle) * (3.2 * speedMult),
            radius: 4,
            color: b.enraged ? '#ef4444' : '#06b6d4',
            isPlayer: false,
            damage: 15,
          });
        }
      }

      // Pattern 2: Cyclops Death Ray Eye Laser
      if (b.attackTimer % 280 === 0) {
        b.isLaserCharging = true;
        b.laserTimer = 50;
      }

      if (b.isLaserCharging) {
        b.laserTimer--;
        if (b.laserTimer <= 0) {
          b.isLaserCharging = false;
          b.isLaserFiring = true;
          b.laserTimer = 75;
          soundManager.playShoot('laser');
          this.shakeAmount = 14;
        }
      }

      if (b.isLaserFiring) {
        b.laserTimer--;
        if (Math.abs(this.player.x - b.x) < 22 && this.player.y > b.y) {
          this.damagePlayer(2);
        }
        if (b.laserTimer <= 0) {
          b.isLaserFiring = false;
        }
      }
    } else if (b.type === 'scorpion') {
      // Claws opening/closing animation
      b.pincerOpen = (Math.sin(this.tick * 0.08) + 1) / 2;

      // Pincer Arc Bullets
      if (b.attackTimer % 35 === 0) {
        [-50, 50].forEach(ox => {
          for (let a = -1; a <= 1; a++) {
            this.bullets.push({
              id: Math.random(),
              x: b.x + ox,
              y: b.y + 15,
              vx: a * 1.8,
              vy: 3.5 * speedMult,
              radius: 4,
              color: '#f97316',
              isPlayer: false,
              damage: 16,
            });
          }
        });
      }

      // Stinger Aimed Volleys
      if (b.attackTimer % 110 === 0) {
        soundManager.playEnemyShoot();
        for (let i = 0; i < 5; i++) {
          const angle = Math.atan2(this.player.y - b.y, this.player.x - b.x) + (i - 2) * 0.15;
          this.bullets.push({
            id: Math.random(),
            x: b.x,
            y: b.y - 45,
            vx: Math.cos(angle) * (4.2 * speedMult),
            vy: Math.sin(angle) * (4.2 * speedMult),
            radius: 4.5,
            color: '#eab308',
            isPlayer: false,
            damage: 20,
          });
        }
      }
    } else if (b.type === 'leviathan') {
      // Void Leviathan: Bullet Hell Curtains
      if (b.attackTimer % 24 === 0) {
        const ringCount = b.enraged ? 16 : 10;
        for (let i = 0; i < ringCount; i++) {
          const angle = (i * Math.PI * 2) / ringCount + Math.sin(this.tick * 0.05);
          this.bullets.push({
            id: Math.random(),
            x: b.x,
            y: b.y + 5,
            vx: Math.cos(angle) * (3.6 * speedMult),
            vy: Math.sin(angle) * (3.6 * speedMult),
            radius: 4.5,
            color: '#ec4899',
            isPlayer: false,
            damage: 18,
          });
        }
      }

      // Dual Wing Sweeping Lasers
      if (b.attackTimer % 90 === 0) {
        [-75, 75].forEach(ox => {
          this.bullets.push({
            id: Math.random(),
            x: b.x + ox,
            y: b.y + 40,
            vx: (ox > 0 ? -1 : 1) * 0.8,
            vy: 5.2,
            radius: 5,
            color: '#a855f7',
            isPlayer: false,
            damage: 22,
          });
        });
      }
    } else if (b.type === 'colossus') {
      // Stage 4: SOLAR COLOSSUS (Rotating Solar Flare Rings + Flank Gatlings)
      if (b.attackTimer % 22 === 0) {
        const bulletsCount = b.enraged ? 16 : 12;
        const baseAngle = this.tick * 0.08;
        for (let i = 0; i < bulletsCount; i++) {
          const angle = baseAngle + (i * Math.PI * 2) / bulletsCount;
          this.bullets.push({
            id: Math.random(),
            x: b.x,
            y: b.y,
            vx: Math.cos(angle) * (3.8 * speedMult),
            vy: Math.sin(angle) * (3.8 * speedMult),
            radius: 4.5,
            color: '#f59e0b',
            isPlayer: false,
            damage: 19,
          });
        }
      }

      // Flank Heavy Gatling Barrages
      if (b.attackTimer % 18 === 0) {
        [-95, 95].forEach(gx => {
          this.bullets.push({
            id: Math.random(),
            x: b.x + gx,
            y: b.y + 35,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 5.4 * speedMult,
            radius: 4,
            color: '#ea580c',
            isPlayer: false,
            damage: 17,
          });
        });
      }
    } else if (b.type === 'chimera') {
      // Stage 5: NEO CHIMERA (Dragon Maw Lightning Breath + Converging Rail Crossfire)
      if (b.attackTimer % 16 === 0) {
        // High-velocity undulating emerald breath
        const sweepAngle = Math.atan2(this.player.y - (b.y + 35), this.player.x - b.x) + Math.sin(this.tick * 0.15) * 0.25;
        this.bullets.push({
          id: Math.random(),
          x: b.x,
          y: b.y + 35,
          vx: Math.cos(sweepAngle) * (6.0 * speedMult),
          vy: Math.sin(sweepAngle) * (6.0 * speedMult),
          radius: 5,
          color: '#10b981',
          isPlayer: false,
          damage: 24,
        });
      }

      // Outer Wing Railgun Crossfire
      if (b.attackTimer % 40 === 0) {
        soundManager.playEnemyShoot();
        [-110, 110].forEach(wx => {
          const crossVx = wx > 0 ? -2.2 : 2.2;
          this.bullets.push({
            id: Math.random(),
            x: b.x + wx,
            y: b.y + 10,
            vx: crossVx,
            vy: 4.5,
            radius: 4.5,
            color: '#06b6d4',
            isPlayer: false,
            damage: 22,
          });
        });
      }
    }

    // Boss Defeated Check
    if (b.health <= 0) {
      this.defeatBoss();
    }
  }

  private defeatBoss() {
    const b = this.boss!;
    soundManager.playExplosion('boss');
    this.shakeAmount = 30;

    // Massive explosion particles
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x: b.x + (Math.random() - 0.5) * 80,
        y: b.y + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: ['#ef4444', '#f59e0b', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 4)],
        life: 45,
        maxLife: 45,
        fade: true,
      });
    }

    // Huge score reward
    const diffMult = this.difficulty === 'MASTER' ? 2.5 : this.difficulty === 'ACE' ? 1.5 : 1.0;
    const bossScore = Math.floor(10000 * this.stage * diffMult);
    this.stats.score += bossScore;
    this.stats.bossesDefeated++;
    this.stats.creditsEarned += 150 * this.stage;

    // Drop multiple power-ups & score gems
    const drops: Array<'UPGRADE' | 'SHIELD' | 'BOMB' | 'HYPER' | 'REPAIR'> = ['UPGRADE', 'SHIELD', 'BOMB', 'HYPER', 'REPAIR'];
    drops.forEach((type, idx) => {
      this.powerUps.push({
        id: Math.random(),
        type,
        x: b.x + (idx - 2) * 28,
        y: b.y,
        vy: 1.5,
      });
    });

    for (let i = 0; i < 15; i++) {
      this.scoreGems.push({
        id: Math.random(),
        x: b.x + (Math.random() - 0.5) * 60,
        y: b.y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 4,
        vy: -2 + Math.random() * 4,
        value: 100,
      });
    }

    this.addFloatingText(`BOSS SLAIN! +${bossScore}`, this.width / 2, this.height * 0.4, '#eab308');

    this.boss = null;
    soundManager.startMusic(false);

    // Advance Stage or Victory (Conquering Stage 5 NEO CHIMERA)
    if (this.stage >= 5) {
      // Victory / Champion!
      this.isVictory = true;
      if (this.onVictory) this.onVictory(this.stats);
    } else {
      this.stage++;
      this.wave = 1;
      this.stats.stage = this.stage;
      this.stats.wave = 1;
      this.addFloatingText(`STAGE ${this.stage} COMMENCE!`, this.width / 2, this.height * 0.35, '#38bdf8');
    }
  }

  private updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      // Despawn off-screen
      if (b.y < -20 || b.y > this.height + 20 || b.x < -20 || b.x > this.width + 20) {
        this.bullets.splice(i, 1);
      }
    }
  }

  private updateMissiles() {
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.life--;

      // Leave smoke trail
      if (this.tick % 2 === 0) {
        this.particles.push({
          x: m.x,
          y: m.y + 4,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 1.5,
          size: 2.5,
          color: '#94a3b8',
          life: 15,
          maxLife: 15,
          fade: true,
        });
      }

      // Find closest enemy or boss
      let targetX = m.x;
      let targetY = -100;

      if (this.boss) {
        targetX = this.boss.x;
        targetY = this.boss.y;
      } else if (this.enemies.length > 0) {
        const closest = this.enemies[0];
        targetX = closest.x;
        targetY = closest.y;
      }

      // Steer towards target
      const angle = Math.atan2(targetY - m.y, targetX - m.x);
      const speed = 7.5;
      m.vx += (Math.cos(angle) * speed - m.vx) * 0.12;
      m.vy += (Math.sin(angle) * speed - m.vy) * 0.12;

      m.x += m.vx;
      m.y += m.vy;

      // Check collision with enemies or boss
      let hit = false;
      if (this.boss && Math.hypot(this.boss.x - m.x, this.boss.y - m.y) < 55) {
        this.boss.health -= 50;
        hit = true;
      } else {
        for (const e of this.enemies) {
          if (Math.hypot(e.x - m.x, e.y - m.y) < e.radius + 6) {
            e.health -= 50;
            hit = true;
            break;
          }
        }
      }

      if (hit || m.life <= 0) {
        soundManager.playExplosion('small');
        for (let p = 0; p < 8; p++) {
          this.particles.push({
            x: m.x,
            y: m.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            size: 3,
            color: '#f97316',
            life: 14,
            maxLife: 14,
            fade: true,
          });
        }
        this.missiles.splice(i, 1);
      }
    }
  }

  private updatePowerUpsAndGems() {
    const p = this.player;

    // Magnet booster radius
    const magnetLvl = this.boosters.find(b => b.id === 'booster_magnet')?.level || 0;
    const magnetRadius = 60 + magnetLvl * 45;

    // Power-up items
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const item = this.powerUps[i];
      item.y += item.vy;

      // Magnet pull
      const dist = Math.hypot(p.x - item.x, p.y - item.y);
      if (dist < magnetRadius) {
        item.x += (p.x - item.x) * 0.08;
        item.y += (p.y - item.y) * 0.08;
      }

      // Player Pickup
      if (dist < p.width / 2 + 15) {
        this.collectPowerUp(item.type);
        this.powerUps.splice(i, 1);
        continue;
      }

      if (item.y > this.height + 30) {
        this.powerUps.splice(i, 1);
      }
    }

    // Score Gems
    for (let i = this.scoreGems.length - 1; i >= 0; i--) {
      const gem = this.scoreGems[i];
      gem.x += gem.vx;
      gem.y += gem.vy;
      gem.vx *= 0.98;
      gem.vy += 0.08; // gravity

      const dist = Math.hypot(p.x - gem.x, p.y - gem.y);
      if (dist < magnetRadius) {
        gem.x += (p.x - gem.x) * 0.12;
        gem.y += (p.y - gem.y) * 0.12;
      }

      if (dist < p.width / 2 + 12) {
        this.stats.score += gem.value;
        this.stats.creditsEarned += 2;
        this.scoreGems.splice(i, 1);
        continue;
      }

      if (gem.y > this.height + 20) {
        this.scoreGems.splice(i, 1);
      }
    }
  }

  private collectPowerUp(type: string) {
    soundManager.playPowerUp();
    const p = this.player;

    switch (type) {
      case 'UPGRADE':
        p.weaponLevel = Math.min(5, p.weaponLevel + 1);
        this.addFloatingText(`WEAPON LV.${p.weaponLevel}!`, p.x, p.y - 25, '#f59e0b');
        break;
      case 'SHIELD':
        p.shield = p.maxShield;
        this.addFloatingText('SHIELD OVERCHARGED!', p.x, p.y - 25, '#06b6d4');
        break;
      case 'BOMB':
        p.bombs++;
        this.addFloatingText('+1 EMP SMART BOMB', p.x, p.y - 25, '#ef4444');
        break;
      case 'MISSILES':
        p.hasMissiles = true;
        this.addFloatingText('HOMING MISSILES ARMED!', p.x, p.y - 25, '#f97316');
        break;
      case 'DRONE':
        p.dronesCount = Math.min(4, p.dronesCount + 1);
        this.addFloatingText(`+1 COMBAT SATELLITE (${p.dronesCount})`, p.x, p.y - 25, '#a855f7');
        break;
      case 'HYPER':
        p.hyperTimer = 360; // 6 seconds hyper overdrive
        this.addFloatingText('HYPER OVERDRIVE ACTIVE!', p.x, p.y - 25, '#ec4899');
        break;
      case 'REPAIR':
        p.health = Math.min(p.maxHealth, p.health + 30);
        this.addFloatingText('+30 HULL INTEGRITY', p.x, p.y - 25, '#10b981');
        break;
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.life--;
      if (part.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      vy: -1.2,
      life: 50,
      color,
      font: 'bold 12px "Press Start 2P", monospace',
    });
  }

  private updateCollisions() {
    const p = this.player;

    // 1. Player Bullets vs Enemies
    for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = this.bullets[bIdx];
      if (!b.isPlayer) continue;

      let hitTarget = false;

      // Check vs Boss
      if (this.boss && Math.hypot(this.boss.x - b.x, this.boss.y - b.y) < 55) {
        this.boss.health -= b.damage;
        p.shotsHit++;
        this.stats.shotsHit++;
        hitTarget = true;
        this.spawnHitSparks(b.x, b.y, b.color);
      }

      // Check vs Enemies
      if (!hitTarget) {
        for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
          const e = this.enemies[eIdx];
          if (Math.hypot(e.x - b.x, e.y - b.y) < e.radius + b.radius) {
            e.health -= b.damage;
            p.shotsHit++;
            this.stats.shotsHit++;
            hitTarget = true;
            this.spawnHitSparks(b.x, b.y, b.color);

            // Enemy destroyed?
            if (e.health <= 0) {
              this.destroyEnemy(eIdx);
            }
            break;
          }
        }
      }

      if (hitTarget) {
        if (!b.pierce || b.pierce <= 1) {
          this.bullets.splice(bIdx, 1);
        } else {
          b.pierce--;
        }
      }
    }

    // 2. Enemy Bullets vs Player
    if (p.invincibleTimer <= 0 && !p.isDashing) {
      for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
        const b = this.bullets[bIdx];
        if (b.isPlayer) continue;

        if (Math.hypot(p.x - b.x, p.y - b.y) < p.width / 2 + b.radius - 2) {
          this.damagePlayer(b.damage);
          this.bullets.splice(bIdx, 1);
          break;
        }
      }

      // 3. Enemies crashing into Player
      for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
        const e = this.enemies[eIdx];
        if (Math.hypot(p.x - e.x, p.y - e.y) < p.width / 2 + e.radius - 4) {
          this.damagePlayer(35);
          e.health -= 50;
          if (e.health <= 0) {
            this.destroyEnemy(eIdx);
          }
          break;
        }
      }
    }
  }

  private destroyEnemy(idx: number) {
    const e = this.enemies[idx];
    soundManager.playExplosion(e.type === 'dreadnought' ? 'medium' : 'small');
    this.shakeAmount = e.type === 'dreadnought' ? 8 : 4;

    // Combo multiplier
    this.stats.combo++;
    if (this.stats.combo > this.stats.maxCombo) {
      this.stats.maxCombo = this.stats.combo;
    }
    const diffMult = this.difficulty === 'MASTER' ? 2.5 : this.difficulty === 'ACE' ? 1.5 : 1.0;
    const gained = Math.floor(e.scoreValue * diffMult * (1 + this.stats.combo * 0.1));
    this.stats.score += gained;
    this.stats.enemiesDestroyed++;
    this.stats.creditsEarned += e.type === 'dreadnought' ? 15 : 5;

    // Explosion particles
    const pCount = e.type === 'dreadnought' ? 20 : 12;
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3,
        color: e.type === 'asteroid' ? '#64748b' : ['#ef4444', '#f59e0b', '#38bdf8'][Math.floor(Math.random() * 3)],
        life: 25,
        maxLife: 25,
        fade: true,
      });
    }

    // Drop Power-ups or Score gems
    const dropRoll = Math.random();
    if (dropRoll < 0.18) {
      const types: Array<'UPGRADE' | 'SHIELD' | 'BOMB' | 'MISSILES' | 'DRONE' | 'HYPER' | 'REPAIR'> = [
        'UPGRADE', 'SHIELD', 'BOMB', 'MISSILES', 'DRONE', 'REPAIR'
      ];
      this.powerUps.push({
        id: Math.random(),
        type: types[Math.floor(Math.random() * types.length)],
        x: e.x,
        y: e.y,
        vy: 1.4,
      });
    } else {
      this.scoreGems.push({
        id: Math.random(),
        x: e.x,
        y: e.y,
        vx: (Math.random() - 0.5) * 3,
        vy: -2,
        value: 50,
      });
    }

    this.enemies.splice(idx, 1);
  }

  private spawnHitSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 2,
        color,
        life: 10,
        maxLife: 10,
        fade: true,
      });
    }
  }

  private damagePlayer(amount: number) {
    const p = this.player;
    p.lastDamageTime = this.tick;
    this.stats.combo = 0; // reset combo on hit

    if (p.shield > 0) {
      soundManager.playShieldHit();
      p.shield -= amount;
      if (p.shield < 0) {
        p.health += p.shield; // absorb excess into health
        p.shield = 0;
      }
    } else {
      p.health -= amount;
      soundManager.playExplosion('small');
      this.shakeAmount = 12;
    }

    // Hit sparks
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: 3,
        color: '#ef4444',
        life: 18,
        maxLife: 18,
        fade: true,
      });
    }

    // Death check
    if (p.health <= 0) {
      p.lives--;
      if (p.lives > 0) {
        // Respawn with iframes
        p.health = p.maxHealth;
        p.shield = p.maxShield * 0.5;
        p.invincibleTimer = 120; // 2 seconds iframes
        p.x = this.width / 2;
        p.y = this.height - 100;
        this.addFloatingText(`RESPAWNED (${p.lives} LIVES LEFT)`, p.x, p.y - 30, '#facc15');
      } else {
        this.triggerGameOver();
      }
    }
  }

  private triggerGameOver() {
    this.isGameOver = true;
    soundManager.playExplosion('boss');
    this.stop();
    if (this.onGameOver) this.onGameOver(this.stats);
  }

  // --- Render Step ---
  private render() {
    const ctx = this.ctx;
    ctx.save();

    // Screen Shake Offset
    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount * this.screenShakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeAmount * this.screenShakeIntensity;
      ctx.translate(sx, sy);
    }

    // Background Canvas
    ctx.fillStyle = '#070a13';
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.graphicsMode === 'HD') {
      // Modern HD Volumetric Deep Space Cosmic Nebulae
      const neb1 = ctx.createRadialGradient(this.width * 0.3, this.height * 0.35, 20, this.width * 0.3, this.height * 0.35, 300);
      neb1.addColorStop(0, 'rgba(99, 102, 241, 0.22)'); // Deep Indigo
      neb1.addColorStop(0.5, 'rgba(147, 51, 234, 0.12)'); // Violet
      neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, this.width, this.height);

      const neb2 = ctx.createRadialGradient(this.width * 0.75, this.height * 0.7, 20, this.width * 0.75, this.height * 0.7, 280);
      neb2.addColorStop(0, 'rgba(6, 182, 212, 0.18)'); // Cyan
      neb2.addColorStop(0.6, 'rgba(14, 165, 233, 0.08)');
      neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, this.width, this.height);

      // Starfield (HD anti-aliased with subtle diffraction spikes)
      this.stars.forEach(star => {
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.85, 0, Math.PI * 2);
        ctx.fill();

        if (star.size >= 2.5) {
          drawGlow(ctx, star.x, star.y, 6, star.color, 0.35);
        }
      });
      ctx.globalAlpha = 1.0;

      // Score Gems (HD)
      this.scoreGems.forEach(gem => {
        drawModernGem(ctx, gem.x, gem.y, this.tick);
      });

      // Power-up Drops (HD)
      this.powerUps.forEach(item => {
        drawModernPowerUp(ctx, item.x, item.y, item.type, this.tick);
      });

      // Enemies (HD)
      this.enemies.forEach(e => {
        if (e.type === 'scout') {
          drawModernScout(ctx, e.x, e.y, this.tick);
        } else if (e.type === 'interceptor') {
          drawModernInterceptor(ctx, e.x, e.y, this.tick);
        } else if (e.type === 'dreadnought') {
          drawModernDreadnought(ctx, e.x, e.y, this.tick);
        } else if (e.type === 'asteroid') {
          drawModernAsteroid(ctx, e.x, e.y, e.radius, e.rotation);
        }
      });

      // Boss (HD)
      if (this.boss) {
        const b = this.boss;
        const hpPercent = b.health / b.maxHealth;
        if (b.type === 'cyclops') {
          drawModernBossCyclops(ctx, b.x, b.y, hpPercent, this.tick, b.isLaserFiring);
        } else if (b.type === 'scorpion') {
          drawModernBossScorpion(ctx, b.x, b.y, hpPercent, this.tick, b.pincerOpen);
        } else if (b.type === 'colossus') {
          drawModernBossColossus(ctx, b.x, b.y, hpPercent, this.tick);
        } else if (b.type === 'chimera') {
          drawModernBossChimera(ctx, b.x, b.y, hpPercent, this.tick);
        } else {
          drawModernBossLeviathan(ctx, b.x, b.y, hpPercent, this.tick);
        }
      }

      // Dash Ghost Trails (HD)
      this.dashGhosts.forEach(g => {
        ctx.save();
        ctx.globalAlpha = g.alpha;
        drawModernPlayerShip(ctx, g.x, g.y, 0, this.skin, false, g.angle, 0);
        ctx.restore();
      });

      // Player Starfighter (HD)
      drawModernPlayerShip(
        ctx,
        this.player.x,
        this.player.y,
        this.player.bank,
        this.skin,
        this.player.invincibleTimer > 0,
        this.player.dashAngle,
        this.player.vy
      );

      // Satellites / Drones (HD)
      if (this.player.dronesCount > 0) {
        for (let i = 0; i < this.player.dronesCount; i++) {
          const angle = this.player.droneAngle + (i * Math.PI * 2) / this.player.dronesCount;
          const dx = this.player.x + Math.cos(angle) * 45;
          const dy = this.player.y + Math.sin(angle) * 45;
          drawModernDrone(ctx, dx, dy, angle);
        }
      }

      // Hexagonal Energy Shield (HD)
      if (this.player.shield > 0) {
        drawModernShield(ctx, this.player.x, this.player.y, this.player.width / 2 + 10, this.tick);
      }

      // Bullets (HD Anti-Aliased Laser Pulses with Bloom)
      this.bullets.forEach(b => {
        drawGlow(ctx, b.x, b.y, b.radius * 2.8, b.color, 0.45);

        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.radius, b.radius * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.radius * 0.45, b.radius * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Retro 16-Bit Pixel Art Mode
      this.stars.forEach(star => {
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1.0;

      this.scoreGems.forEach(gem => {
        drawScoreGem(ctx, gem.x, gem.y, this.tick);
      });

      this.powerUps.forEach(item => {
        drawPowerUp(ctx, item.x, item.y, item.type, this.tick);
      });

      this.enemies.forEach(e => {
        if (e.type === 'scout') {
          drawEnemyScout(ctx, e.x, e.y, this.tick);
        } else if (e.type === 'interceptor') {
          drawEnemyInterceptor(ctx, e.x, e.y, this.tick);
        } else if (e.type === 'dreadnought') {
          drawEnemyDreadnought(ctx, e.x, e.y, this.tick);
        } else if (e.type === 'asteroid') {
          drawAsteroid(ctx, e.x, e.y, e.radius, e.rotation);
        }
      });

      if (this.boss) {
        const b = this.boss;
        const hpPercent = b.health / b.maxHealth;
        if (b.type === 'cyclops') {
          drawBossCyclops(ctx, b.x, b.y, hpPercent, this.tick, b.isLaserFiring);
        } else if (b.type === 'scorpion') {
          drawBossScorpion(ctx, b.x, b.y, hpPercent, this.tick, b.pincerOpen);
        } else if (b.type === 'colossus') {
          drawModernBossColossus(ctx, b.x, b.y, hpPercent, this.tick);
        } else if (b.type === 'chimera') {
          drawModernBossChimera(ctx, b.x, b.y, hpPercent, this.tick);
        } else {
          drawBossLeviathan(ctx, b.x, b.y, hpPercent, this.tick);
        }
      }

      this.dashGhosts.forEach(g => {
        ctx.save();
        ctx.globalAlpha = g.alpha;
        drawPlayerShip(ctx, g.x, g.y, 0, this.skin, false, g.angle, 0);
        ctx.restore();
      });

      drawPlayerShip(
        ctx,
        this.player.x,
        this.player.y,
        this.player.bank,
        this.skin,
        this.player.invincibleTimer > 0,
        this.player.dashAngle,
        this.player.vy
      );

      if (this.player.dronesCount > 0) {
        for (let i = 0; i < this.player.dronesCount; i++) {
          const angle = this.player.droneAngle + (i * Math.PI * 2) / this.player.dronesCount;
          const dx = this.player.x + Math.cos(angle) * 45;
          const dy = this.player.y + Math.sin(angle) * 45;
          drawDrone(ctx, dx, dy, angle);
        }
      }

      if (this.player.shield > 0) {
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        const shieldPulse = Math.sin(this.tick * 0.1) * 2;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.player.width / 2 + 10 + shieldPulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.fill();
        ctx.restore();
      }

      this.bullets.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(b.x - b.radius * 0.4, b.y - b.radius * 0.4, b.radius * 0.8, b.radius * 0.8);
      });
    }

    // Missiles
    this.missiles.forEach(m => {
      ctx.fillStyle = '#f97316';
      ctx.fillRect(m.x - 3, m.y - 6, 6, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(m.x - 1, m.y - 4, 2, 4);
    });

    // Particles
    this.particles.forEach(p => {
      ctx.save();
      if (p.fade) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      }
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Floating Text Alerts (Modern High-Res typography in HD mode)
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.font = this.graphicsMode === 'HD'
        ? 'bold 13px "Plus Jakarta Sans", system-ui, sans-serif'
        : ft.font;
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, ft.life / 20);
      if (this.graphicsMode === 'HD') {
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
      }
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // Boss Warning Siren Banner Overlay (Modernized Sci-Fi HUD Banner)
    if (this.bossAlertActive) {
      ctx.save();
      const flash = Math.floor(this.tick / 8) % 2 === 0;
      ctx.fillStyle = flash ? 'rgba(239, 68, 68, 0.28)' : 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(0, this.height * 0.35, this.width, 90);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, this.height * 0.35, this.width, 90);

      ctx.font = this.graphicsMode === 'HD'
        ? 'bold 22px "Plus Jakarta Sans", system-ui, sans-serif'
        : 'bold 20px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('CRITICAL ALERT', this.width / 2, this.height * 0.35 + 38);

      ctx.font = this.graphicsMode === 'HD'
        ? '13px "Space Mono", monospace'
        : '12px "Press Start 2P", monospace';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText('COLOSSAL BOSS SIGNATURE APPROACHING', this.width / 2, this.height * 0.35 + 66);
      ctx.restore();
    }

    ctx.restore();
  }
}
