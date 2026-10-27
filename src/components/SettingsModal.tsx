import React, { useState } from 'react';
import { soundManager } from '../game/audio';
import { getPlayerCallsign, savePlayerCallsign } from '../game/leaderboardData';
import { X, Sliders, Volume2, Monitor, Gamepad2, User, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphicsMode: 'HD' | 'RETRO';
  onToggleGraphicsMode: (mode: 'HD' | 'RETRO') => void;
  crtEnabled: boolean;
  onToggleCRT: (enabled: boolean) => void;
  screenShake: number;
  onChangeScreenShake: (amount: number) => void;
  useVirtualStick: boolean;
  onToggleVirtualStick: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  graphicsMode,
  onToggleGraphicsMode,
  crtEnabled,
  onToggleCRT,
  screenShake,
  onChangeScreenShake,
  useVirtualStick,
  onToggleVirtualStick,
}) => {
  const [callsign, setCallsign] = useState(getPlayerCallsign());
  const [callsignSaved, setCallsignSaved] = useState(false);
  const [musicVol, setMusicVol] = useState(0.4);
  const [sfxVol, setSfxVol] = useState(0.7);

  if (!isOpen) return null;

  const handleSaveCallsign = () => {
    soundManager.playUiClick();
    savePlayerCallsign(callsign);
    setCallsignSaved(true);
    setTimeout(() => setCallsignSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Game Settings</h2>
              <p className="text-xs text-slate-400">Audio, display shaders, and controls</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Player Callsign */}
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-white uppercase text-[11px] tracking-wider">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Pilot Callsign</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={15}
                value={callsign}
                onChange={e => setCallsign(e.target.value)}
                placeholder="PilotAce"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSaveCallsign}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition active:scale-95 flex items-center gap-1.5"
              >
                {callsignSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <span>Save</span>}
              </button>
            </div>
          </div>

          {/* Audio Sliders */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-white uppercase text-[11px] tracking-wider">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Audio Synthesis</span>
            </div>

            {/* Sound FX */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Sound FX Volume</span>
                <span className="font-mono">{Math.round(sfxVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVol}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setSfxVol(val);
                  soundManager.setSfxVolume(val);
                }}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Chiptune Music */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Chiptune BGM Volume</span>
                <span className="font-mono">{Math.round(musicVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVol}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setMusicVol(val);
                  soundManager.setMusicVolume(val);
                }}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Display & Retro Shaders */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-white uppercase text-[11px] tracking-wider">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Graphics Engine & Shaders</span>
            </div>

            {/* Visual Rendering Engine Mode Toggle */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Visual Engine</span>
                  <span className="text-[11px] text-slate-400">
                    {graphicsMode === 'HD'
                      ? 'Modern HD Vector Art with Glow & Nebulae'
                      : 'Classic 16-Bit Pixel Art Mode'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    soundManager.playUiClick();
                    onToggleGraphicsMode('HD');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    graphicsMode === 'HD'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-300" />
                  <span>Modern HD (Default)</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playUiClick();
                    onToggleGraphicsMode('RETRO');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    graphicsMode === 'RETRO'
                      ? 'bg-amber-600 text-white shadow font-pixel text-[10px]'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 font-pixel text-[10px]'
                  }`}
                >
                  <span>16-Bit Retro</span>
                </button>
              </div>
            </div>

            {/* CRT Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div>
                <span className="font-bold text-white block">CRT Scanline Shader</span>
                <span className="text-[11px] text-slate-400">Authentic 80s arcade monitor phosphor lines</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onToggleCRT(!crtEnabled);
                }}
                className={`w-12 h-6 rounded-full transition-colors p-1 ${
                  crtEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    crtEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Screen Shake Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Explosion Screen Shake</span>
                <span className="font-mono">{Math.round(screenShake * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={screenShake}
                onChange={e => {
                  onChangeScreenShake(parseFloat(e.target.value));
                }}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Controls Preference */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-white uppercase text-[11px] tracking-wider">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>Mobile Touch Navigation</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div>
                <span className="font-bold text-white block">
                  {useVirtualStick ? 'Virtual Analog Joystick' : 'Direct Finger Drag (Recommended)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {useVirtualStick
                    ? 'Fixed thumb stick at bottom-left'
                    : '1:1 finger tracking with ergonomic thumb offset'}
                </span>
              </div>
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onToggleVirtualStick(!useVirtualStick);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Switch
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
