import React, { useState, useEffect, useRef } from 'react';
import { ShipSkin, GameplayBooster } from '../game/types';
import { IAPPack, IAP_CREDIT_PACKS } from '../game/shopData';
import { drawPlayerShip } from '../game/pixelArt';
import { drawModernPlayerShip, drawGlow } from '../game/modernHdArt';
import { soundManager } from '../game/audio';
import { X, Sparkles, Shield, Zap, ShoppingBag, Check, CreditCard, RotateCcw } from 'lucide-react';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  skins: ShipSkin[];
  equippedSkinId: string;
  boosters: GameplayBooster[];
  credits: number;
  onEquipSkin: (skinId: string) => void;
  onUnlockSkinWithCredits: (skinId: string, cost: number) => void;
  onUnlockSkinWithIAP: (skinId: string, price: string) => void;
  onUpgradeBooster: (boosterId: string, cost: number) => void;
  onBuyCreditPack: (pack: IAPPack) => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  skins,
  equippedSkinId,
  boosters,
  credits,
  onEquipSkin,
  onUnlockSkinWithCredits,
  onUnlockSkinWithIAP,
  onUpgradeBooster,
  onBuyCreditPack,
}) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'boosters' | 'credits'>('skins');
  const [selectedSkinId, setSelectedSkinId] = useState<string>(equippedSkinId);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Simulated Google Play Bottom-Sheet Checkout state
  const [iapSheet, setIapSheet] = useState<{
    isOpen: boolean;
    productTitle: string;
    price: string;
    type: 'skin' | 'booster' | 'pack';
    targetId: string;
    creditsAmount?: number;
    isProcessing: boolean;
    successMessage: string | null;
  }>({
    isOpen: false,
    productTitle: '',
    price: '',
    type: 'skin',
    targetId: '',
    isProcessing: false,
    successMessage: null,
  });

  const [restoreNotification, setRestoreNotification] = useState<string | null>(null);

  const selectedSkin = skins.find(s => s.id === selectedSkinId) || skins[0];

  // Animated Preview on mini-canvas (Modern HD Aerospace Starfighter)
  useEffect(() => {
    let animId: number;
    let tick = 0;

    const renderPreview = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;

      tick++;
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cosmic nebula glow in preview
      drawGlow(ctx, canvas.width / 2, canvas.height / 2, 70, selectedSkin.primaryColor, 0.2);

      // Star particles in preview
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 37 + tick * 0.8) % canvas.width);
        const sy = ((i * 53 + tick * 1.4) % canvas.height);
        ctx.fillStyle = '#38bdf8';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Simulated bank tilt
      const bank = Math.sin(tick * 0.05) > 0.4 ? 1 : Math.sin(tick * 0.05) < -0.4 ? -1 : 0;

      drawModernPlayerShip(ctx, canvas.width / 2, canvas.height / 2 + 10, bank, selectedSkin, false, 0, -2);

      // Modern laser bolts preview
      if (tick % 24 < 12) {
        drawGlow(ctx, canvas.width / 2 - 8, canvas.height / 2 - 25, 8, selectedSkin.bulletColor, 0.4);
        drawGlow(ctx, canvas.width / 2 + 8, canvas.height / 2 - 25, 8, selectedSkin.bulletColor, 0.4);

        ctx.fillStyle = selectedSkin.bulletColor;
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2 - 8, canvas.height / 2 - 25, 2.5, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(canvas.width / 2 + 8, canvas.height / 2 - 25, 2.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(renderPreview);
    };

    if (isOpen) {
      renderPreview();
    }

    return () => cancelAnimationFrame(animId);
  }, [isOpen, selectedSkin]);

  if (!isOpen) return null;

  const handleStartIAP = (title: string, price: string, type: 'skin' | 'booster' | 'pack', targetId: string, creditsAmount?: number) => {
    soundManager.playUiClick();
    setIapSheet({
      isOpen: true,
      productTitle: title,
      price,
      type,
      targetId,
      creditsAmount,
      isProcessing: false,
      successMessage: null,
    });
  };

  const handleConfirmGooglePlayBuy = () => {
    setIapSheet(prev => ({ ...prev, isProcessing: true }));

    // Simulate Google Play In-App Billing network latency
    setTimeout(() => {
      soundManager.playPowerUp();
      setIapSheet(prev => ({
        ...prev,
        isProcessing: false,
        successMessage: 'Payment Authorized · Purchase Complete!',
      }));

      // Deliver purchase
      if (iapSheet.type === 'skin') {
        onUnlockSkinWithIAP(iapSheet.targetId, iapSheet.price);
      } else if (iapSheet.type === 'pack') {
        const pack = IAP_CREDIT_PACKS.find(p => p.id === iapSheet.targetId);
        if (pack) onBuyCreditPack(pack);
      }

      setTimeout(() => {
        setIapSheet(prev => ({ ...prev, isOpen: false, successMessage: null }));
      }, 1400);
    }, 1200);
  };

  const handleRestorePurchases = () => {
    soundManager.playUiClick();
    setRestoreNotification('Querying Google Play Billing API... All purchases are up to date.');
    setTimeout(() => setRestoreNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Hangar & Store</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Google Play In-App Billing Ready</span>
                <span>·</span>
                <span className="text-amber-400 font-bold font-mono">
                  {credits.toLocaleString()} Star Credits
                </span>
              </div>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('skins')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'skins'
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cosmetic Skins ({skins.filter(s => s.unlocked).length}/{skins.length})
          </button>
          <button
            onClick={() => setActiveTab('boosters')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'boosters'
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tactical Boosters
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'credits'
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Credit Vault & IAP
          </button>
        </div>

        {/* Restore Purchases Notification */}
        {restoreNotification && (
          <div className="bg-cyan-950/70 border-b border-cyan-800/60 px-4 py-2 text-xs text-cyan-200 text-center animate-in fade-in">
            {restoreNotification}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: COSMETIC SKINS */}
          {activeTab === 'skins' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Live 16-Bit Interactive Ship Preview */}
              <div className="md:col-span-5 flex flex-col items-center bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-pixel text-slate-500 mb-2">LIVE SHIP PREVIEW</span>
                <canvas
                  ref={previewCanvasRef}
                  width={200}
                  height={170}
                  className="rounded-lg border border-slate-800/80 mb-3"
                />

                <div className="text-center w-full">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm font-bold text-white">{selectedSkin.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-pixel ${
                      selectedSkin.rarity === 'LEGENDARY' ? 'bg-amber-950 text-amber-400 border border-amber-600/40' :
                      selectedSkin.rarity === 'EPIC' ? 'bg-purple-950 text-purple-400 border border-purple-600/40' :
                      selectedSkin.rarity === 'RARE' ? 'bg-sky-950 text-sky-400 border border-sky-600/40' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {selectedSkin.rarity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {selectedSkin.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex flex-col gap-2">
                    {selectedSkin.unlocked ? (
                      equippedSkinId === selectedSkin.id ? (
                        <div className="py-2 px-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>CURRENTLY EQUIPPED</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onEquipSkin(selectedSkin.id)}
                          className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition active:scale-95 shadow"
                        >
                          EQUIP SKIN
                        </button>
                      )
                    ) : (
                      <div className="flex flex-col gap-2">
                        {/* Unlock with Credits */}
                        <button
                          onClick={() => onUnlockSkinWithCredits(selectedSkin.id, selectedSkin.priceCredits)}
                          disabled={credits < selectedSkin.priceCredits}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            credits >= selectedSkin.priceCredits
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <span>Unlock ({selectedSkin.priceCredits} Credits)</span>
                        </button>

                        {/* Direct Google Play In-App Purchase */}
                        <button
                          onClick={() => handleStartIAP(selectedSkin.name, selectedSkin.priceIAP, 'skin', selectedSkin.id)}
                          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Buy with Google Play ({selectedSkin.priceIAP})</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Skin Selection Grid */}
              <div className="md:col-span-7 space-y-2">
                {skins.map(skin => {
                  const isSelected = selectedSkinId === skin.id;
                  const isEquipped = equippedSkinId === skin.id;

                  return (
                    <div
                      key={skin.id}
                      onClick={() => setSelectedSkinId(skin.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500 shadow-md'
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center shrink-0"
                          style={{ backgroundColor: skin.primaryColor }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.accentColor }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{skin.name}</span>
                            {isEquipped && (
                              <span className="text-[9px] text-emerald-400 font-pixel">EQUIPPED</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {skin.engineStyle.toUpperCase()} ENGINE · {skin.rarity}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {skin.unlocked ? (
                          <span className="text-[11px] font-bold text-slate-300">UNLOCKED</span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-amber-400 font-mono-numbers">
                              {skin.priceCredits} CR
                            </span>
                            <span className="text-[10px] text-slate-400">{skin.priceIAP}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TACTICAL BOOSTERS */}
          {activeTab === 'boosters' && (
            <div className="space-y-3">
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 leading-relaxed">
                Tactical boosters provide permanent pre-flight upgrades across all standard and boss runs.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {boosters.map(booster => {
                  const isMax = booster.level >= booster.maxLevel;
                  const canAfford = credits >= booster.priceCredits;

                  return (
                    <div
                      key={booster.id}
                      className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{booster.name}</span>
                          <span className="text-[10px] font-pixel text-slate-400">
                            LVL {booster.level}/{booster.maxLevel}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {booster.description}
                        </p>

                        <div className="mt-3 text-[11px] text-cyan-400 font-mono">
                          {booster.bonusText}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        {isMax ? (
                          <span className="w-full text-center py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 rounded-lg">
                            MAX LEVEL
                          </span>
                        ) : (
                          <button
                            onClick={() => onUpgradeBooster(booster.id, booster.priceCredits)}
                            disabled={!canAfford}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <span>Upgrade ({booster.priceCredits} Credits)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CREDIT VAULT & IAP */}
          {activeTab === 'credits' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Available Star Credits</span>
                  <div className="text-xl font-bold text-amber-400 font-mono-numbers mt-0.5">
                    {credits.toLocaleString()} Credits
                  </div>
                </div>

                <button
                  onClick={handleRestorePurchases}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Purchases</span>
                </button>
              </div>

              <span className="text-xs font-semibold text-slate-300 block">Google Play Credit Bundles</span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {IAP_CREDIT_PACKS.map(pack => (
                  <div
                    key={pack.id}
                    className="p-4 bg-slate-950/50 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between relative overflow-hidden"
                  >
                    {pack.badge && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-pixel">
                        {pack.badge}
                      </span>
                    )}

                    <div>
                      <div className="text-2xl mb-2">{pack.icon}</div>
                      <span className="text-xs font-bold text-white block">{pack.name}</span>
                      <span className="text-sm font-bold text-amber-400 font-mono-numbers mt-1 block">
                        +{pack.credits.toLocaleString()} Credits
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartIAP(pack.name, pack.price, 'pack', pack.id, pack.credits)}
                      className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition active:scale-95 shadow"
                    >
                      {pack.price}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Earn Star Credits automatically by destroying waves & bosses.</span>
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

      {/* Realistic Google Play In-App Purchase Bottom Sheet Modal */}
      {iapSheet.isOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in slide-in-from-bottom duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-900 dark:text-slate-100">
            {/* Google Play Brand Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M3.6 1.8L13.8 12 3.6 22.2z" />
                  <path fill="#FBBC05" d="M17.3 8.5L3.6 1.8l10.2 10.2z" />
                  <path fill="#EA4335" d="M17.3 15.5L13.8 12 3.6 22.2z" />
                  <path fill="#34A853" d="M20.4 12l-3.1-3.5-3.5 3.5 3.5 3.5z" />
                </svg>
                <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
                  Google Play
                </span>
              </div>
              <span className="text-xs text-slate-500">browniebear3110@gmail.com</span>
            </div>

            {/* Product details */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  {iapSheet.productTitle}
                </span>
                <span className="text-xs text-slate-500">Pixel Striker: Retro Galaxy</span>
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white font-mono-numbers">
                {iapSheet.price}
              </span>
            </div>

            {/* Status message */}
            {iapSheet.successMessage ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-600 dark:text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>{iapSheet.successMessage}</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 leading-normal">
                Tax calculated at checkout. One-tap buy simulated for Google Play Store review & testing.
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-1">
              {!iapSheet.successMessage && (
                <button
                  onClick={handleConfirmGooglePlayBuy}
                  disabled={iapSheet.isProcessing}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-75"
                >
                  {iapSheet.isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing with Google Play...</span>
                    </>
                  ) : (
                    <>
                      <span>1-Tap Buy ({iapSheet.price})</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => setIapSheet(prev => ({ ...prev, isOpen: false }))}
                disabled={iapSheet.isProcessing}
                className="w-full py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
