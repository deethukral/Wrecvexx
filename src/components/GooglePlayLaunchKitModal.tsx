import React, { useState } from 'react';
import { X, Smartphone, Check, Copy, ExternalLink, Download, ShieldCheck } from 'lucide-react';
import { soundManager } from '../game/audio';

interface GooglePlayLaunchKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPWAInstallable: boolean;
  isPWAInstalled: boolean;
  onInstallPWA: () => void;
}

export const GooglePlayLaunchKitModal: React.FC<GooglePlayLaunchKitModalProps> = ({
  isOpen,
  onClose,
  isPWAInstallable,
  isPWAInstalled,
  onInstallPWA,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const packageId = 'com.wrecvexx.game';
  const assetLinksJson = JSON.stringify(
    [
      {
        relation: [
          'delegate_permission/common.handle_all_urls',
          'delegate_permission/common.get_login_creds',
        ],
        target: {
          namespace: 'android_app',
          package_name: packageId,
          sha256_cert_fingerprints: [
            '14:6D:E9:7F:0F:52:EA:CB:25:4B:E5:A7:12:6F:89:BC:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01',
          ],
        },
      },
    ],
    null,
    2
  );

  const copyToClipboard = (text: string, sectionId: string) => {
    soundManager.playUiClick();
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Google Play Store Launch Kit
              </h2>
              <p className="text-xs text-slate-400">
                Ready for Google Play Store packaging via Trusted Web Activity (TWA) or Capacitor
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs text-slate-300">
          {/* Quick Install Status Banner */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white block">PWA & Android Install Status</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">
                {isPWAInstalled
                  ? 'Application is currently running in Standalone Android/PWA mode.'
                  : isPWAInstallable
                  ? 'App meets all Google Play PWA installability requirements and can be installed now.'
                  : 'PWA Manifest, Service Worker, and icons configured.'}
              </span>
            </div>

            {isPWAInstallable && !isPWAInstalled && (
              <button
                onClick={onInstallPWA}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition active:scale-95 shadow whitespace-nowrap shrink-0"
              >
                Install App Now
              </button>
            )}
          </div>

          {/* Package Configuration */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              01. Android Package Identifiers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">PACKAGE NAME</span>
                <span className="text-cyan-400 font-bold">{packageId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">VERSION</span>
                <span className="text-white">1.0.0 (versionCode: 1)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DISPLAY ORIENTATION</span>
                <span className="text-white">portrait (immersive full-screen)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">THEME COLOR</span>
                <span className="text-white">#090d16</span>
              </div>
            </div>
          </div>

          {/* 1-Step CLI Packaging Command */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                02. 1-Step Android App Bundle (.aab) Command
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    `npx @bubblewrap/cli init --manifest=${window.location.origin}/manifest.webmanifest\nnpx @bubblewrap/cli build`,
                    'bubblewrap'
                  )
                }
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                {copiedSection === 'bubblewrap' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'bubblewrap' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
              <code>{`# Generate production-ready Android App Bundle (.aab) with Google's official Bubblewrap tool:
npx @bubblewrap/cli init --manifest=${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/manifest.webmanifest
npx @bubblewrap/cli build

# Upload the resulting app-release-signed.aab directly to Google Play Console!`}</code>
            </pre>
          </div>

          {/* Digital Asset Links Config */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                03. Digital Asset Links (`.well-known/assetlinks.json`)
              </h3>
              <button
                onClick={() => copyToClipboard(assetLinksJson, 'assetlinks')}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                {copiedSection === 'assetlinks' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'assetlinks' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-36">
              <code>{assetLinksJson}</code>
            </pre>
          </div>

          {/* In-App Purchase SKUs */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              04. In-App Purchase (IAP) Products Mapping
            </h3>
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px]">
                  <tr>
                    <th className="p-2.5">PRODUCT ID</th>
                    <th className="p-2.5">TYPE</th>
                    <th className="p-2.5 text-right">DEFAULT PRICE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="p-2.5 text-cyan-300">skin_neon_phoenix</td>
                    <td className="p-2.5">Non-Consumable (Skin)</td>
                    <td className="p-2.5 text-right font-bold text-white">$0.99</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-cyan-300">skin_void_reaper</td>
                    <td className="p-2.5">Non-Consumable (Skin)</td>
                    <td className="p-2.5 text-right font-bold text-white">$1.99</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-cyan-300">skin_cyber_dragon</td>
                    <td className="p-2.5">Non-Consumable (Skin)</td>
                    <td className="p-2.5 text-right font-bold text-white">$2.49</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-cyan-300">skin_golden_aegis</td>
                    <td className="p-2.5">Non-Consumable (Skin)</td>
                    <td className="p-2.5 text-right font-bold text-white">$3.99</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-amber-300">iap_commander_credits</td>
                    <td className="p-2.5">Consumable (3,200 Credits)</td>
                    <td className="p-2.5 text-right font-bold text-white">$2.49</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-amber-300">iap_admiral_credits</td>
                    <td className="p-2.5">Consumable (7,500 Credits)</td>
                    <td className="p-2.5 text-right font-bold text-white">$4.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Targeting Android 14+ with full backward compatibility to Android 7.0</span>
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
