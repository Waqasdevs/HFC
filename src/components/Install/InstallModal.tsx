'use client';

import React from 'react';
import { 
  Download, 
  X, 
  Monitor, 
  CheckCircle2, 
  Sparkles, 
  WifiOff, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface InstallModalProps {
  onClose: () => void;
  deferredPrompt: any;
  onTriggerInstall: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  onClose,
  deferredPrompt,
  onTriggerInstall,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-apple-modal border border-black/10 dark:border-white/10 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white font-extrabold text-base flex items-center justify-center shadow-apple-sm shadow-orange-500/20 tracking-tight shrink-0">
              HFC
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Install HFC POS on Vendor Laptop
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Run as a standalone desktop app with 100% offline access
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 dark:text-emerald-200">
            <p className="font-bold">Zero-Internet Offline Guarantee</p>
            <p className="text-[11px] opacity-80 mt-0.5">
              Once installed, the app opens instantly from your Windows Desktop without browser tabs or internet, saving all orders to local IndexedDB.
            </p>
          </div>
        </div>

        {/* 1-Click Install Button if Chrome triggered the prompt */}
        {deferredPrompt && (
          <button
            onClick={() => {
              sound.playSuccess();
              onTriggerInstall();
            }}
            className="w-full apple-button py-3.5 rounded-2xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-sm shadow-apple-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Click Here to 1-Click Install App</span>
          </button>
        )}

        {/* Step-by-Step Browser Instructions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            How to Install in Google Chrome / Microsoft Edge
          </h4>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="w-6 h-6 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div className="text-xs">
                <p className="font-bold text-neutral-900 dark:text-neutral-100">
                  Open Chrome's 3-Dot Menu (⋮)
                </p>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Click the <strong>three vertical dots (⋮)</strong> in the top-right corner of your Chrome browser window (next to your profile picture).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="w-6 h-6 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div className="text-xs">
                <p className="font-bold text-neutral-900 dark:text-neutral-100">
                  Select "Save and share" → "Install page as app..."
                </p>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Hover over <strong>Save and share</strong> (or <strong>More tools</strong>), then click <strong>Install page as app...</strong> (or <strong>Install HFC POS...</strong>).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="w-6 h-6 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div className="text-xs">
                <p className="font-bold text-neutral-900 dark:text-neutral-100">
                  Click "Install"
                </p>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  A pop-up will ask <em>"Install app?"</em>. Click <strong>Install</strong>. An HFC POS icon will appear on your Windows Desktop and Taskbar!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">
            Works on Windows, macOS, iPad, and Android
          </span>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="apple-button px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
