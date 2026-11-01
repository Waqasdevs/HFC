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
  X,
  Copy,
  Check,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { syncManager, type SyncStatus } from '@/lib/sync';
import { sound } from '@/lib/sound';
import { SUPABASE_SCHEMA_SQL } from '@/lib/schemaSql';

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
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [isClearingQueue, setIsClearingQueue] = useState(false);

  const handleCopySchema = () => {
    sound.playTap();
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  const handleClearSyncQueue = async () => {
    if (confirm(`Are you sure you want to clear ${syncStatus.pendingCount} pending offline changes? This will reset the sync queue and remove the error.`)) {
      setIsClearingQueue(true);
      await syncManager.clearQueue();
      setIsClearingQueue(false);
      setShowErrorModal(null);
      sound.playSuccess();
    }
  };

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

  const handleManualSync = async (force: boolean = false) => {
    if (soundEnabled) sound.playTap();
    if (!syncStatus.hasCloudConfig) {
      if (onOpenSettings) onOpenSettings();
      return;
    }

    if (!force && syncStatus.cloudSyncError) {
      setShowErrorModal(syncStatus.cloudSyncError);
      return;
    }

    setSyncFeedback('Syncing with Supabase...');
    const result = await syncManager.forceSync();
    if (result.success) {
      if (soundEnabled) sound.playSuccess();
      setSyncFeedback('✓ Synced with Supabase');
      setShowErrorModal(null);
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
      {showErrorModal && (() => {
        const isMissingTable = 
          showErrorModal.toLowerCase().includes('relation') || 
          showErrorModal.toLowerCase().includes('does not exist') ||
          showErrorModal.toLowerCase().includes('schema.sql');

        const isInvalidKey = 
          showErrorModal.toLowerCase().includes('api key') ||
          showErrorModal.toLowerCase().includes('jwt') ||
          showErrorModal.toLowerCase().includes('unauthorized') ||
          showErrorModal.toLowerCase().includes('401');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div 
              className="w-full max-w-lg max-h-[88vh] bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/10 dark:border-white/10 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-red-50/80 dark:bg-red-950/40 shrink-0">
                <div className="flex items-center gap-2 text-apple-red">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      Supabase Cloud Sync Diagnostic
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      {syncStatus.pendingCount} offline change(s) waiting to sync
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowErrorModal(null)}
                  className="w-8 h-8 rounded-full bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* 1. Specific Guidance Card if Missing Tables */}
                {isMissingTable && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-700/50 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Database Tables Not Found in Supabase</span>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      Your Supabase PostgreSQL database does not have the <code>orders</code>, <code>tables</code>, or <code>settings</code> tables yet. You need to run the SQL migration script once in your Supabase SQL Editor.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={handleCopySchema}
                        className="apple-button px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        {copiedSchema ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSchema ? 'SQL Schema Copied!' : 'Copy SQL Schema Script'}</span>
                      </button>
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-amber-800 dark:text-amber-300 underline hover:opacity-80 flex items-center gap-1"
                      >
                        <span>Open Supabase Dashboard</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* 2. Specific Guidance Card if Invalid API Key */}
                {isInvalidKey && (
                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-300 dark:border-blue-700/50 space-y-2">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-blue-600" />
                      <span>Invalid API Key / Key Format Issue</span>
                    </div>
                    <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                      If you copied a key starting with <code>sb_publishable_...</code>, Supabase PostgREST requires the standard <strong>anon public</strong> key (a JWT starting with <code>eyJ...</code>).
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <strong>How to get it:</strong> In your Supabase Dashboard &rarr; <em>Project Settings</em> &rarr; <em>API Keys</em> &rarr; Click the tab <strong>&ldquo;Legacy anon, service_role API keys&rdquo;</strong> and copy the <strong>anon public</strong> key.
                    </p>
                  </div>
                )}

                {/* 3. Raw Response Message from Supabase */}
                <div className="p-3 bg-red-50/80 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-apple-red">
                    Exact Supabase Response:
                  </span>
                  <p className="font-mono text-xs text-red-800 dark:text-red-300 break-words leading-relaxed">
                    {showErrorModal}
                  </p>
                </div>

                {/* 4. Action Checklist */}
                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100">Step-by-Step Resolution:</h4>
                  <ol className="list-decimal pl-4 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>
                      <strong>Run SQL Schema:</strong> Click &ldquo;Copy SQL Schema&rdquo; below, go to your Supabase Dashboard &rarr; <em>SQL Editor</em> &rarr; <em>New Query</em>, paste the code, and click <strong>Run</strong>.
                    </li>
                    <li>
                      <strong>Verify Anon Key:</strong> In Supabase Settings &rarr; <em>API Keys</em>, use the <code>anon public</code> key (JWT starting with <code>eyJ...</code>).
                    </li>
                    <li>
                      <strong>Set in Vercel:</strong> Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your Vercel Project Settings so all restaurant laptops connect automatically without local configuration.
                    </li>
                  </ol>
                </div>

                {/* 5. Clear Stale Queue Option */}
                {syncStatus.pendingCount > 0 && (
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      Having issues with {syncStatus.pendingCount} mock test changes?
                    </span>
                    <button
                      type="button"
                      onClick={handleClearSyncQueue}
                      disabled={isClearingQueue}
                      className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-apple-red hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Discard pending offline queue items"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Queue ({syncStatus.pendingCount})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-black/5 dark:border-white/10 bg-neutral-50/90 dark:bg-neutral-900/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="apple-button py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 flex items-center gap-1.5"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-apple-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL'}</span>
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowErrorModal(null);
                        onOpenSettings();
                      }}
                      className="apple-button py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    >
                      Open Settings
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      await handleManualSync(true);
                    }}
                    className="apple-button py-2.5 px-4 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm transition-all"
                  >
                    Retry Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </header>
  );
};
