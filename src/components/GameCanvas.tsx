import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { Play, RotateCcw, LogOut } from 'lucide-react';

interface GameCanvasProps {
  engine: GameEngine | null;
  crtEnabled: boolean;
  isPaused: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  crtEnabled,
  isPaused,
  onResume,
  onRestart,
  onExit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Resize and Fullscreen canvas scaling
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !engine) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      engine.resize(w, h);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [engine]);

  // Touch and pointer tracking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;

    const getCanvasCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    // Touch handlers
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const coords = getCanvasCoords(touch.clientX, touch.clientY);
      engine.pointer.x = coords.x;
      engine.pointer.y = coords.y;
      engine.pointer.isDown = true;
      engine.pointer.isMoving = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const coords = getCanvasCoords(touch.clientX, touch.clientY);
      engine.pointer.x = coords.x;
      engine.pointer.y = coords.y;
      engine.pointer.isDown = true;
      engine.pointer.isMoving = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 0) {
        engine.pointer.isDown = false;
        engine.pointer.isMoving = false;
      }
    };

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      engine.pointer.x = coords.x;
      engine.pointer.y = coords.y;
      engine.pointer.isDown = true;
      engine.pointer.isMoving = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!engine.pointer.isDown) return;
      const coords = getCanvasCoords(e.clientX, e.clientY);
      engine.pointer.x = coords.x;
      engine.pointer.y = coords.y;
      engine.pointer.isMoving = true;
    };

    const onMouseUp = () => {
      engine.pointer.isDown = false;
      engine.pointer.isMoving = false;
    };

    // Keyboard handlers
    const onKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      engine.keys[e.code] = true;

      // Space = Shoot / Shift = Dash / B = Bomb
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        engine.triggerDash();
      }
      if (e.code === 'KeyB') {
        engine.triggerBomb();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [engine]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain block bg-[#080c14] cursor-crosshair"
      />

      {/* CRT Scanline & Curved Arcade Screen Overlay */}
      {crtEnabled && <div className="crt-overlay crt-flicker pointer-events-none" />}

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center z-40 p-6 text-center select-none">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xs w-full shadow-2xl flex flex-col items-center gap-4">
            <span className="text-sm font-pixel text-amber-400 tracking-wider">GAME PAUSED</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Take a breath, Commander. Your fighters are holding position in sector orbit.
            </p>
            <div className="flex flex-col gap-2 w-full pt-1">
              <button
                onClick={onResume}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>RESUME FLIGHT</span>
              </button>

              <button
                onClick={onRestart}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restart Mission</span>
              </button>

              <button
                onClick={onExit}
                className="w-full py-2 px-4 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Exit to Main Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
