import { db } from './db';
import type { SyncMutation } from '@/types';
import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';

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

// Helper to convert camelCase object keys to snake_case for PostgreSQL
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

// Helper to convert snake_case PostgreSQL rows to camelCase for TypeScript/Dexie
export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

class SyncManager {
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private lastSyncTime: string | null = null;
  private cloudSyncError: string | null = null;
  private hasCloudConfig: boolean = false;
  private listeners: Set<SyncListener> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private supabaseClient: SupabaseClient | null = null;
  private realtimeChannel: RealtimeChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Heartbeat connectivity check every 20 seconds
      this.checkInterval = setInterval(() => {
        this.verifyRealConnectivity();
      }, 20000);

      // Initialize cloud sync and pull after short delay
      setTimeout(() => this.initCloud(), 1500);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.emitStatus();
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getCredentials(): Promise<{ url: string; key: string } | null> {
    try {
      const settings = await db.settings.get('default');
      const url = settings?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = settings?.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      if (url && key) return { url, key };
    } catch {
      const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (envUrl && envKey) return { url: envUrl, key: envKey };
    }
    return null;
  }

  public async getClient(): Promise<SupabaseClient | null> {
    if (this.supabaseClient) return this.supabaseClient;
    const creds = await this.getCredentials();
    if (!creds?.url || !creds?.key) return null;
    this.supabaseClient = createClient(creds.url, creds.key);
    return this.supabaseClient;
  }

  public async reconnectCloud(): Promise<void> {
    this.supabaseClient = null;
    if (this.realtimeChannel) {
      try {
        await this.realtimeChannel.unsubscribe();
      } catch {
        // ignore
      }
      this.realtimeChannel = null;
    }
    await this.initCloud();
  }

  public async initCloud(): Promise<void> {
    const creds = await this.getCredentials();
    this.hasCloudConfig = !!creds;
    await this.emitStatus();

    if (!this.hasCloudConfig) return;

    // 1. Pull down data so any browser opening the site immediately syncs with live cloud
    await this.pullFromCloud();

    // 2. Subscribe to realtime updates
    await this.initRealtime();

    // 3. Process any local offline mutations
    await this.processQueue();
  }

  public async pullFromCloud(): Promise<void> {
    if (!this.isOnline) return;
    const supabase = await this.getClient();
    if (!supabase) return;

    try {
      // Pull recent 200 orders
      const { data: cloudOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (cloudOrders && cloudOrders.length > 0) {
        const camelOrders = cloudOrders.map(toCamelCase);
        await db.orders.bulkPut(camelOrders as any);
      }

      // Pull tables
      const { data: cloudTables } = await supabase.from('tables').select('*');
      if (cloudTables && cloudTables.length > 0) {
        const camelTables = cloudTables.map(toCamelCase);
        await db.diningTables.bulkPut(camelTables as any);
      }

      // Pull menu items
      const { data: cloudItems } = await supabase.from('menu_items').select('*');
      if (cloudItems && cloudItems.length > 0) {
        const camelItems = cloudItems.map(toCamelCase);
        await db.menuItems.bulkPut(camelItems as any);
      }

      // Pull categories
      const { data: cloudCats } = await supabase.from('categories').select('*');
      if (cloudCats && cloudCats.length > 0) {
        const camelCats = cloudCats.map(toCamelCase);
        await db.categories.bulkPut(camelCats as any);
      }

      // Pull stock
      const { data: cloudStock } = await supabase.from('stock').select('*');
      if (cloudStock && cloudStock.length > 0) {
        const camelStock = cloudStock.map(toCamelCase);
        await db.stock.bulkPut(camelStock as any);
      }

      this.lastSyncTime = new Date().toLocaleTimeString();
      this.cloudSyncError = null;
      await this.emitStatus();
    } catch (err: any) {
      console.warn('Supabase cloud pull note:', err?.message || err);
    }
  }

  public async initRealtime(): Promise<void> {
    if (this.realtimeChannel) return;
    const supabase = await this.getClient();
    if (!supabase) return;

    try {
      this.realtimeChannel = supabase
        .channel('hfc-orders-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          async (payload: any) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const camel = toCamelCase(payload.new);
              await db.orders.put(camel as any);
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              await db.orders.delete(payload.old.id);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tables' },
          async (payload: any) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const camel = toCamelCase(payload.new);
              await db.diningTables.put(camel as any);
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              await db.diningTables.delete(payload.old.id);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menu_items' },
          async (payload: any) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const camel = toCamelCase(payload.new);
              await db.menuItems.put(camel as any);
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              await db.menuItems.delete(payload.old.id);
            }
          }
        )
        .subscribe();
    } catch (err: any) {
      console.warn('Supabase realtime init note:', err?.message || err);
    }
  }

  private async emitStatus() {
    let pendingCount = 0;
    try {
      pendingCount = await db.syncQueue.where('synced').equals(0 as any).count();
      const creds = await this.getCredentials();
      this.hasCloudConfig = !!creds;
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
      this.pullFromCloud();
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

      const creds = await this.getCredentials();
      this.hasCloudConfig = !!creds;
      let syncSucceeded = false;

      if (this.hasCloudConfig) {
        try {
          const supabase = await this.getClient();
          if (!supabase) throw new Error('Supabase client failed to initialize');

          for (const item of pending) {
            const table = tableNameMap[item.entity] || item.entity;
            if (item.action === 'CREATE' || item.action === 'UPDATE') {
              const snakeData = toSnakeCase(item.data);
              snakeData.updated_at = new Date().toISOString();
              const { error } = await supabase.from(table).upsert(snakeData);
              if (error) throw error;
            } else if (item.action === 'DELETE') {
              const { error } = await supabase.from(table).delete().match({ id: item.data.id });
              if (error) throw error;
            }
          }
          syncSucceeded = true;
          this.cloudSyncError = null;
        } catch (supabaseErr: any) {
          this.cloudSyncError = supabaseErr?.message || 'Supabase sync failed';
          console.warn('Supabase sync attempt error:', supabaseErr);
        }
      } else {
        this.cloudSyncError = null;
      }

      if (syncSucceeded) {
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
