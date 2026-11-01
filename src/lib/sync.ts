import { db } from './db';
import type { SyncMutation } from '@/types';
import { createClient } from '@supabase/supabase-js';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  hasCloudConfig: boolean;
  cloudSyncError: string | null;
}

type SyncListener = (status: SyncStatus) => void;

const tableNameMap: Record<string, string> = {
  orders: 'orders',
  tables: 'tables',
  diningTables: 'tables',
  stock: 'stock',
  employees: 'employees',
  shifts: 'shifts',
  settings: 'settings',
  menuItems: 'menu_items',
  categories: 'categories',
};

class SyncManager {
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private lastSyncTime: string | null = null;
  private cloudSyncError: string | null = null;
  private hasCloudConfig: boolean = false;
  private listeners: Set<SyncListener> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      
      // Heartbeat connectivity check every 20 seconds
      this.checkInterval = setInterval(() => {
        this.verifyRealConnectivity();
      }, 20000);

      // Initial sync check
      setTimeout(() => this.processQueue(), 1500);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.emitStatus();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async emitStatus() {
    let pendingCount = 0;
    try {
      pendingCount = await db.syncQueue.where('synced').equals(0 as any).count();
      const settings = await db.settings.get('default');
      this.hasCloudConfig = !!(settings?.supabaseUrl && settings?.supabaseAnonKey);
    } catch {
      // db might be initializing
    }

    const status: SyncStatus = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount,
      lastSyncTime: this.lastSyncTime,
      hasCloudConfig: this.hasCloudConfig,
      cloudSyncError: this.cloudSyncError,
    };

    this.listeners.forEach(fn => fn(status));
  }

  private async verifyRealConnectivity() {
    if (typeof window === 'undefined') return;
    if (!navigator.onLine) {
      this.handleNetworkChange(false);
      return;
    }

    try {
      // Lightweight ping to check actual internet accessibility
      const res = await fetch('/api/health', { method: 'HEAD', cache: 'no-store' });
      const online = res.ok;
      if (online !== this.isOnline) {
        this.handleNetworkChange(online);
      }
    } catch {
      this.handleNetworkChange(false);
    }
  }

  private handleNetworkChange(online: boolean) {
    const wasOffline = !this.isOnline;
    this.isOnline = online;
    this.emitStatus();

    // Reconnected: trigger immediate sync
    if (online && wasOffline) {
      this.processQueue();
    }
  }

  // Queue a change (Order created, table updated, stock deducted)
  public async queueMutation(
    entity: SyncMutation['entity'],
    action: SyncMutation['action'],
    data: any
  ): Promise<void> {
    const mutation: SyncMutation = {
      id: crypto.randomUUID(),
      entity,
      action,
      data,
      clientTimestamp: Date.now(),
      synced: false
    };

    await db.syncQueue.put(mutation);
    await this.emitStatus();

    // If online, immediately try to sync
    if (this.isOnline && !this.isSyncing) {
      this.processQueue();
    }
  }

  // Drain the pending mutations
  public async processQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;

    try {
      this.isSyncing = true;
      await this.emitStatus();

      const pending = await db.syncQueue.where('synced').equals(0 as any).toArray();
      if (pending.length === 0) {
        this.isSyncing = false;
        await this.emitStatus();
        return;
      }

      // 1. Check if Supabase credentials are configured in Settings
      const settings = await db.settings.get('default');
      this.hasCloudConfig = !!(settings?.supabaseUrl && settings?.supabaseAnonKey);
      let syncSucceeded = false;

      if (this.hasCloudConfig) {
        try {
          const supabase = createClient(settings!.supabaseUrl!, settings!.supabaseAnonKey!);
          
          for (const item of pending) {
            const table = tableNameMap[item.entity] || item.entity;
            if (item.action === 'CREATE' || item.action === 'UPDATE') {
              await supabase.from(table).upsert({ ...item.data, updated_at: new Date().toISOString() });
            } else if (item.action === 'DELETE') {
              await supabase.from(table).delete().match({ id: item.data.id });
            }
          }
          syncSucceeded = true;
          this.cloudSyncError = null;
        } catch (supabaseErr: any) {
          this.cloudSyncError = supabaseErr?.message || 'Supabase sync failed';
          console.warn('Supabase sync attempt failed:', supabaseErr);
        }
      } else {
        // Cloud backup not configured yet - keep mutations in queue so they sync when credentials are entered
        this.cloudSyncError = null;
      }

      if (syncSucceeded) {
        // Mark all processed as synced
        const ids = pending.map(p => p.id);
        await db.syncQueue.where('id').anyOf(ids).modify({ synced: true });
        this.lastSyncTime = new Date().toLocaleTimeString();
      }
    } catch (err) {
      console.error('Sync queue drainage error:', err);
    } finally {
      this.isSyncing = false;
      await this.emitStatus();
    }
  }
}

export const syncManager = new SyncManager();
