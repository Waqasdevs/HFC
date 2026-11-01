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
  Download
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

  const handleManualSync = () => {
    if (soundEnabled) sound.playTap();
    syncManager.processQueue();
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-6 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#18181b]/70 backdrop-blur-2xl z-20 select-none">
      {/* Left Search / Filter */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search burgers, broast, drinks (⌘K)..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 transition-all"
          />
        </div>
      </div>

      {/* Center Apple-Style Sync Capsule */}
      <div className="flex items-center gap-2">
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
            {!syncStatus.isOnline
              ? `Offline (${syncStatus.pendingCount} queued)`
              : !syncStatus.hasCloudConfig
              ? 'Local Only (Cloud Not Configured • Click to Setup)'
              : syncStatus.cloudSyncError
              ? `Sync Error (${syncStatus.pendingCount} queued)`
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
    </header>
  );
};
