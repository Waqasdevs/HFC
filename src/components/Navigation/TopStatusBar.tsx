'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Search, 
  PlusCircle, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX,
  Clock,
  Download,
  AlertTriangle,
  X
} from 'lucide-react';
import { syncManager, type SyncStatus } from '@/lib/sync';
import { sound } from '@/lib/sound';

interface TopStatusBarProps {
  onNewOrder: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenInstall: () => void;
  onOpenSettings?: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  onNewOrder,
  searchQuery,
  onSearchChange,
  darkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  onOpenInstall,
  onOpenSettings,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    hasCloudConfig: false,
    cloudSyncError: null,
  });

  const [currentTime, setCurrentTime] = useState<string>('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((status) => {
      setSyncStatus(status);
    });

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const handleManualSync = async () => {
    if (soundEnabled) sound.playTap();
    if (!syncStatus.hasCloudConfig) {
      if (onOpenSettings) onOpenSettings();
      return;
    }

    if (syncStatus.cloudSyncError) {
      setShowErrorModal(syncStatus.cloudSyncError);
      return;
    }

    setSyncFeedback('Syncing with Supabase...');
    const result = await syncManager.forceSync();
    if (result.success) {
      if (soundEnabled) sound.playSuccess();
      setSyncFeedback('✓ Synced with Supabase');
      setTimeout(() => setSyncFeedback(null), 3000);
    } else {
      if (soundEnabled) sound.playAlert();
      setShowErrorModal(result.error || 'Cloud synchronization failed');
      setSyncFeedback(null);
    }
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-4 lg:px-6 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#18181b]/70 backdrop-blur-2xl z-20 select-none min-w-0">
      {/* Left Search / Filter */}
      <div className="flex items-center gap-3 flex-1 max-w-xs sm:max-w-sm lg:max-w-md min-w-0">
        <div className="relative w-full min-w-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search burgers, broast (⌘K)..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 transition-all truncate"
          />
        </div>
      </div>

      {/* Center Apple-Style Sync Capsule */}
      <div className="flex items-center gap-2 shrink-0 px-2">
        <div 
          onClick={() => {
            if (!syncStatus.hasCloudConfig && onOpenSettings) {
              sound.playTap();
              onOpenSettings();
            } else {
              handleManualSync();
            }
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer border ${
            !syncStatus.isOnline
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
              : !syncStatus.hasCloudConfig
              ? 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 hover:border-apple-blue/50'
              : syncStatus.cloudSyncError
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
              : syncStatus.isSyncing
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
              : syncStatus.pendingCount > 0
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
          }`}
          title={!syncStatus.hasCloudConfig ? 'Click to configure Supabase cloud backup' : 'Click to force cloud sync'}
        >
          {/* Animated Status Dot */}
          <span className="relative flex h-2 w-2">
            {!syncStatus.isOnline || syncStatus.cloudSyncError ? (
              <span className="h-2 w-2 rounded-full bg-apple-red"></span>
            ) : !syncStatus.hasCloudConfig ? (
              <span className="h-2 w-2 rounded-full bg-neutral-400"></span>
            ) : syncStatus.isSyncing || syncStatus.pendingCount > 0 ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-apple-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-apple-orange"></span>
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-apple-green opacity-50"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-apple-green"></span>
              </>
            )}
          </span>

          <span>
            {syncFeedback
              ? syncFeedback
              : !syncStatus.isOnline
              ? `Offline (${syncStatus.pendingCount} queued)`
              : !syncStatus.hasCloudConfig
              ? 'Local Only (Cloud Not Configured • Click to Setup)'
              : syncStatus.cloudSyncError
              ? `Sync Error: Click for Details (${syncStatus.pendingCount} queued)`
              : syncStatus.isSyncing
              ? `Syncing to Supabase... (${syncStatus.pendingCount})`
              : syncStatus.pendingCount > 0
              ? `${syncStatus.pendingCount} pending cloud sync`
              : 'Cloud Synced (Supabase)'}
          </span>

          <RefreshCw className={`w-3 h-3 ml-1 ${syncStatus.isSyncing ? 'animate-spin' : 'opacity-60'}`} />
        </div>

        {/* Live Local Digital Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Install Desktop App Button */}
        <button
          onClick={() => {
            if (soundEnabled) sound.playTap();
            onOpenInstall();
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-bold border border-black/5 dark:border-white/5 transition-all shadow-apple-sm"
          title="Download & Install POS on this Laptop"
        >
          <Download className="w-3.5 h-3.5 text-apple-blue" />
          <span>Install App</span>
        </button>

        {/* New Order Button */}
        <button
          onClick={() => {
            if (soundEnabled) sound.playTap();
            onNewOrder();
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-xl text-xs font-semibold shadow-apple-sm transition-all active:scale-[0.97]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Order</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            onToggleSound();
            if (!soundEnabled) sound.playSuccess();
          }}
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
          title={soundEnabled ? 'Mute Sounds' : 'Enable Audio Feedback'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
          title="Toggle Light/Dark Theme"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* --- SUPABASE SYNC DIAGNOSTIC MODAL --- */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/10 dark:border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-red-50 dark:bg-red-950/40">
              <div className="flex items-center gap-2 text-apple-red">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Cloud Sync Diagnostic
                </h3>
              </div>
              <button
                onClick={() => setShowErrorModal(null)}
                className="w-8 h-8 rounded-full bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-red-50/80 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-apple-red">
                  Supabase Response Message:
                </span>
                <p className="font-mono text-xs text-red-800 dark:text-red-300 break-words">
                  {showErrorModal}
                </p>
              </div>

              <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100">How to Resolve:</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-neutral-600 dark:text-neutral-400">
                  <li>
                    <strong>Run SQL Schema:</strong> If the error mentions table or relation does not exist, open your Supabase Dashboard &rarr; <em>SQL Editor</em> &rarr; Paste &amp; Run the database schema.
                  </li>
                  <li>
                    <strong>Verify Anon Key:</strong> In Supabase Settings &rarr; <em>API Keys</em>, copy the public <em>anon</em> key into Restaurant Settings.
                  </li>
                  <li>
                    <strong>Vercel Env Variables:</strong> Set <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel settings so every laptop connects automatically.
                  </li>
                </ol>
              </div>

              <div className="pt-2 flex items-center gap-2">
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setShowErrorModal(null);
                      onOpenSettings();
                    }}
                    className="flex-1 apple-button py-2.5 px-4 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm transition-all"
                  >
                    Open Settings &amp; Setup Guide
                  </button>
                )}
                <button
                  onClick={async () => {
                    setShowErrorModal(null);
                    await handleManualSync();
                  }}
                  className="apple-button py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                >
                  Retry Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
