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

// Helper to sanitize and clean Supabase URL (strips accidental /rest/v1 or trailing slashes)
export function cleanSupabaseUrl(url?: string): string {
  if (!url) return '';
  return url.trim().replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

// Helper to convert camelCase object keys to snake_case for PostgreSQL
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key] === undefined ? null : obj[key];
  }
  return result;
}

// Helper to sanitize entity payload before PostgreSQL upsert
export function sanitizeEntityData(entity: string, data: Record<string, any>): Record<string, any> {
  const snake = toSnakeCase(data);
  if (entity === 'settings') {
    delete snake.supabase_url;
    delete snake.supabase_anon_key;
  }
  if (entity === 'orders') {
    if (snake.table_number === undefined) snake.table_number = null;
    if (snake.customer === undefined) snake.customer = null;
    if (snake.notes === undefined) snake.notes = null;
    if (snake.assigned_rider_id === undefined) snake.assigned_rider_id = null;
    if (snake.assigned_rider_name === undefined) snake.assigned_rider_name = null;
  }
  // PostgreSQL schema does not have updated_at on stock or shifts
  if (entity === 'stock' || entity === 'shifts') {
    delete snake.updated_at;
  }
  // PostgreSQL schema has stock_tracking as NOT NULL DEFAULT false
  if (entity === 'menuItems' || entity === 'menu_items') {
    if (snake.stock_tracking === undefined || snake.stock_tracking === null) {
      snake.stock_tracking = false;
    }
  }
  return snake;
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

// Helper to guarantee required columns have safe fallback values for PostgreSQL
export function ensureEntityDefaults(entity: string, data: Record<string, any>): void {
  if (!data) return;

  if (entity === 'tables' || entity === 'diningTables') {
    if (!data.number) {
      if (typeof data.id === 'string' && data.id.startsWith('tbl-')) {
        const numPart = data.id.replace('tbl-', '');
        data.number = `T-${numPart.padStart(2, '0')}`;
      } else {
        data.number = data.id || 'T-01';
      }
    }
    if (!data.zone) data.zone = 'indoor';
    if (data.capacity === undefined || data.capacity === null) data.capacity = 4;
    if (!data.status) data.status = 'available';
  } else if (entity === 'orders') {
    if (!data.token) data.token = 'HFC-001';
    if (!data.type) data.type = 'dine_in';
    if (!data.items) data.items = [];
    if (data.total === undefined || data.total === null) data.total = 0;
    if (!data.payment_status) data.payment_status = 'paid';
    if (!data.payment_method) data.payment_method = 'cash';
  } else if (entity === 'stock') {
    if (!data.name) data.name = data.id || 'Stock Item';
    if (!data.category) data.category = 'Meat';
    if (!data.unit) data.unit = 'kg';
  } else if (entity === 'employees') {
    if (!data.name) data.name = 'Manager';
    if (!data.role) data.role = 'manager';
    if (data.pin === undefined) data.pin = '';
  } else if (entity === 'categories') {
    if (!data.name) data.name = data.id || 'Category';
    if (!data.icon) data.icon = 'UtensilsCrossed';
  } else if (entity === 'menuItems' || entity === 'menu_items') {
    if (!data.name) data.name = 'Menu Item';
    if (!data.category_name) data.category_name = 'Burgers & Sandwiches';
    if (data.stock_tracking === undefined || data.stock_tracking === null) {
      data.stock_tracking = false;
    }
    if (data.is_available === undefined || data.is_available === null) {
      data.is_available = true;
    }
  } else if (entity === 'stock') {
    if (!data.name) data.name = data.id || 'Stock Item';
    if (!data.category) data.category = 'Meat';
    if (!data.unit) data.unit = 'kg';
    if (data.current_stock === undefined || data.current_stock === null) data.current_stock = 0;
    if (data.min_threshold === undefined || data.min_threshold === null) data.min_threshold = 0;
    if (data.cost_per_unit === undefined || data.cost_per_unit === null) data.cost_per_unit = 0;
    delete data.updated_at;
  }
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
  private activeUrl: string | null = null;
  private activeKey: string | null = null;

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
      const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const envKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

      let rawUrl = settings?.supabaseUrl || envUrl;
      let rawKey = settings?.supabaseAnonKey?.trim() || envKey;

      // Auto-heal: If local settings contain the opaque 'sb_publishable_' key and env has the valid JWT anon key, auto-migrate!
      if (rawKey.startsWith('sb_publishable_') && envKey.startsWith('eyJ')) {
        rawKey = envKey;
        await db.settings.update('default', { supabaseAnonKey: envKey }).catch(() => {});
      } else if (!rawKey && envKey) {
        rawKey = envKey;
        await db.settings.update('default', { supabaseAnonKey: envKey }).catch(() => {});
      }

      if (!rawUrl && envUrl) {
        rawUrl = envUrl;
        await db.settings.update('default', { supabaseUrl: envUrl }).catch(() => {});
      }

      const url = cleanSupabaseUrl(rawUrl);
      const key = rawKey.trim();
      if (url && key) return { url, key };
    } catch {
      const envUrl = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
      const envKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
      if (envUrl && envKey) return { url: envUrl, key: envKey };
    }
    return null;
  }

  public async getClient(): Promise<SupabaseClient | null> {
    const creds = await this.getCredentials();
    if (!creds?.url || !creds?.key) return null;
    
    // Invalidate client if credentials changed
    if (!this.supabaseClient || this.activeUrl !== creds.url || this.activeKey !== creds.key) {
      this.activeUrl = creds.url;
      this.activeKey = creds.key;
      this.supabaseClient = createClient(creds.url, creds.key);
    }
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
      } else {
        const localTables = await db.diningTables.toArray();
        if (localTables.length > 0) {
          const snakeTables = localTables.map(t => {
            const s = sanitizeEntityData('tables', t);
            ensureEntityDefaults('tables', s);
            s.updated_at = new Date().toISOString();
            return s;
          });
          await supabase.from('tables').upsert(snakeTables);
        }
      }

      // Pull categories
      const { data: cloudCats } = await supabase.from('categories').select('*');
      const hasHfcDeals = cloudCats?.some(c => c.id === 'cat-deals');
      if (cloudCats && cloudCats.length >= 10 && hasHfcDeals) {
        const camelCats = cloudCats.map(toCamelCase);
        await db.categories.bulkPut(camelCats as any);
      } else {
        const localCats = await db.categories.toArray();
        if (localCats.length > 0) {
          const snakeCats = localCats.map(c => {
            const s = sanitizeEntityData('categories', c);
            ensureEntityDefaults('categories', s);
            s.updated_at = new Date().toISOString();
            return s;
          });
          await supabase.from('categories').upsert(snakeCats);
        }
      }

      // Pull menu items
      const { data: cloudItems } = await supabase.from('menu_items').select('*');
      const hasHfcDeal1 = cloudItems?.some(i => i.id === 'deal-1');
      if (cloudItems && cloudItems.length >= 20 && hasHfcDeal1) {
        const { HFC_MENU_ITEMS } = await import('@/lib/initialCatalog');
        const catalogNumMap = new Map<string, number>();
        HFC_MENU_ITEMS.forEach(m => {
          if (m.itemNumber) catalogNumMap.set(m.id, m.itemNumber);
        });

        let nextNum = 126;
        const camelItems = cloudItems.map(ci => {
          const item: any = toCamelCase(ci);
          if (!item.itemNumber && catalogNumMap.has(item.id)) {
            item.itemNumber = catalogNumMap.get(item.id);
          } else if (!item.itemNumber) {
            item.itemNumber = nextNum++;
          }
          return item;
        });
        await db.menuItems.bulkPut(camelItems as any);
      } else {
        const localItems = await db.menuItems.toArray();
        if (localItems.length > 0) {
          const snakeItems = localItems.map(m => {
            const s = sanitizeEntityData('menuItems', m);
            ensureEntityDefaults('menuItems', s);
            s.updated_at = new Date().toISOString();
            return s;
          });
          for (let i = 0; i < snakeItems.length; i += 40) {
            await supabase.from('menu_items').upsert(snakeItems.slice(i, i + 40));
          }
        }
      }

      // Pull stock
      const { data: cloudStock } = await supabase.from('stock').select('*');
      if (cloudStock && cloudStock.length > 0) {
        const camelStock = cloudStock.map(toCamelCase);
        await db.stock.bulkPut(camelStock as any);
      } else {
        const localStock = await db.stock.toArray();
        if (localStock.length > 0) {
          const snakeStock = localStock.map(s => {
            const sn = sanitizeEntityData('stock', s);
            ensureEntityDefaults('stock', sn);
            return sn;
          });
          await supabase.from('stock').upsert(snakeStock);
        }
      }

      this.lastSyncTime = new Date().toLocaleTimeString();
      this.cloudSyncError = null;
      await this.emitStatus();
    } catch (err: any) {
      console.warn('Supabase cloud pull note:', err?.message || err);
    }
  }

  public async pushCatalog(categories: any[], items: any[]): Promise<void> {
    const supabase = await this.getClient();
    if (!supabase) return;
    try {
      const snakeCats = categories.map(c => {
        const s = sanitizeEntityData('categories', c);
        ensureEntityDefaults('categories', s);
        s.updated_at = new Date().toISOString();
        return s;
      });
      await supabase.from('categories').upsert(snakeCats);

      const snakeItems = items.map(m => {
        const s = sanitizeEntityData('menuItems', m);
        ensureEntityDefaults('menuItems', s);
        s.updated_at = new Date().toISOString();
        return s;
      });
      for (let i = 0; i < snakeItems.length; i += 40) {
        await supabase.from('menu_items').upsert(snakeItems.slice(i, i + 40));
      }
    } catch (err) {
      console.warn('Error pushing catalog to Supabase:', err);
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
      pendingCount = await db.syncQueue.filter(m => !m.synced).count();
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

      const pending = await db.syncQueue.filter(m => !m.synced).toArray();
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
          if (!supabase) throw new Error('Supabase client failed to initialize with provided credentials');

          const dexieEntityMap: Record<string, string> = {
            orders: 'orders',
            tables: 'diningTables',
            diningTables: 'diningTables',
            stock: 'stock',
            employees: 'employees',
            shifts: 'shifts',
            settings: 'settings',
            menuItems: 'menuItems',
            categories: 'categories',
          };

          const processedIds: string[] = [];
          for (const item of pending) {
            const table = tableNameMap[item.entity] || item.entity;
            if (item.action === 'CREATE' || item.action === 'UPDATE') {
              // 1. Fetch full record from local Dexie database if available to prevent partial updates from violating NOT NULL constraints
              const dexieTable = dexieEntityMap[item.entity];
              let localRecord: any = null;
              if (dexieTable && item.data?.id && (db as any)[dexieTable]) {
                try {
                  localRecord = await (db as any)[dexieTable].get(item.data.id);
                } catch {
                  // Ignore
                }
              }

              // 2. If it's an UPDATE and target has an id, try direct column-level update on Supabase first
              if (item.action === 'UPDATE' && item.data?.id) {
                const partialSnake = sanitizeEntityData(item.entity, item.data);
                if (item.entity !== 'stock' && item.entity !== 'shifts') {
                  partialSnake.updated_at = new Date().toISOString();
                }
                
                const { data: updatedRows, error: updateErr } = await supabase
                  .from(table)
                  .update(partialSnake)
                  .match({ id: item.data.id })
                  .select('id');

                if (!updateErr && updatedRows && updatedRows.length > 0) {
                  processedIds.push(item.id);
                  continue;
                }
              }

              // 3. Fallback to UPSERT with full merged payload and guaranteed column defaults
              const merged = localRecord ? { ...localRecord, ...item.data } : item.data;
              const snakeData = sanitizeEntityData(item.entity, merged);
              if (item.entity !== 'stock' && item.entity !== 'shifts') {
                snakeData.updated_at = new Date().toISOString();
              }
              ensureEntityDefaults(item.entity, snakeData);

              const { error } = await supabase.from(table).upsert(snakeData);
              if (error) {
                console.error(`Supabase upsert error on table "${table}":`, error);
                throw new Error(`Table "${table}" sync failed: ${error.message || error.details || 'Check if schema.sql was run in Supabase'}`);
              }
            } else if (item.action === 'DELETE') {
              const { error } = await supabase.from(table).delete().match({ id: item.data.id });
              if (error) {
                console.error(`Supabase delete error on table "${table}":`, error);
                throw new Error(`Table "${table}" delete failed: ${error.message || 'Check database permissions'}`);
              }
            }
            processedIds.push(item.id);
          }

          if (processedIds.length > 0) {
            await db.syncQueue.where('id').anyOf(processedIds).delete();
          }

          syncSucceeded = true;
          this.cloudSyncError = null;
        } catch (supabaseErr: any) {
          const errMsg = supabaseErr?.message || String(supabaseErr);
          this.cloudSyncError = errMsg;
          console.warn('Supabase sync attempt error:', errMsg, supabaseErr);
        }
      } else {
        this.cloudSyncError = null;
      }

      if (syncSucceeded) {
        this.lastSyncTime = new Date().toLocaleTimeString();
      }
    } catch (err) {
      console.error('Sync queue drainage error:', err);
    } finally {
      this.isSyncing = false;
      await this.emitStatus();
    }
  }

  // User-initiated or triggerable full sync (Push local queue + Pull cloud updates)
  public async forceSync(): Promise<{ success: boolean; error?: string }> {
    await this.processQueue();
    if (this.cloudSyncError) {
      return { success: false, error: this.cloudSyncError };
    }
    await this.pullFromCloud();
    return { success: !this.cloudSyncError, error: this.cloudSyncError || undefined };
  }

  // Clear stuck offline mutations from the local sync queue
  public async clearQueue(): Promise<void> {
    await db.syncQueue.clear();
    this.cloudSyncError = null;
    await this.emitStatus();
  }
}

export const syncManager = new SyncManager();
