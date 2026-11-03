import Dexie, { type Table as DexieTable } from 'dexie';
import type { 
  Order, 
  Table, 
  MenuItem, 
  Category, 
  StockItem, 
  Employee, 
  Shift, 
  RestaurantSettings, 
  SyncMutation 
} from '@/types';
import { HFC_CATEGORIES, HFC_MENU_ITEMS } from '@/lib/initialCatalog';

export class HFCDatabase extends Dexie {
  orders!: DexieTable<Order, string>;
  diningTables!: DexieTable<Table, string>;
  menuItems!: DexieTable<MenuItem, string>;
  categories!: DexieTable<Category, string>;
  stock!: DexieTable<StockItem, string>;
  employees!: DexieTable<Employee, string>;
  shifts!: DexieTable<Shift, string>;
  settings!: DexieTable<RestaurantSettings, string>;
  syncQueue!: DexieTable<SyncMutation, string>;

  constructor() {
    super('HFCOrderManagementDB');
    this.version(1).stores({
      orders: 'id, token, type, status, tableNumber, paymentStatus, createdAt',
      diningTables: 'id, number, zone, status',
      menuItems: 'id, categoryId, name, isAvailable',
      categories: 'id, name, order',
      stock: 'id, name, category, currentStock, minThreshold',
      employees: 'id, role, pin, isActive',
      shifts: 'id, employeeId, clockIn',
      settings: 'id',
      syncQueue: 'id, entity, action, clientTimestamp, synced'
    });
  }
}

export const db = new HFCDatabase();

// Pre-seeded Initial Database Data
export async function seedInitialData() {
  const existingSettings = await db.settings.get('default');
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (existingSettings) {
    if ((!existingSettings.supabaseUrl || !existingSettings.supabaseAnonKey) && envUrl && envKey) {
      await db.settings.update('default', {
        supabaseUrl: envUrl,
        supabaseAnonKey: envKey,
      });
    }

    // Migration: Update restaurant catalog to full Haseeb's Foods Café menu
    const hasDeal1 = await db.menuItems.get('deal-1');
    if (!hasDeal1) {
      await db.categories.clear();
      await db.categories.bulkPut(HFC_CATEGORIES);
      await db.menuItems.clear();
      await db.menuItems.bulkPut(HFC_MENU_ITEMS);
      await db.settings.update('default', {
        restaurantName: "Haseeb's Foods Café (HFC)",
        tagline: 'Freshly Fried, Crispy & Delicious',
        address: 'Gole Masjid Ghousia Town, Chitti Mitti, Bhimber Road, Samahni, Azad Kashmir',
        phone: '0343-5140308 / 0310-1879930 / 0342-5158128',
        receiptHeader: '*** HASEEB.S FOODS CAFÉ (HFC) ***',
        receiptFooter: 'For Home Delivery Call: 0343-5140308 / 0310-1879930 / 0342-5158128\nGole Masjid Ghousia Town, Samahni AJK',
      });
      try {
        const { syncManager } = await import('@/lib/sync');
        await syncManager.pushCatalog(HFC_CATEGORIES, HFC_MENU_ITEMS);
      } catch (err) {
        console.warn('Catalog cloud sync notice:', err);
      }
    }

    // Migration: Ensure the 3 brothers (Haseeb, Aliyan, Shaban) are the employee profiles
    const currentEmps = await db.employees.toArray();
    const hasBrothers = currentEmps.some(e => e.id === 'emp-haseeb');
    if (!hasBrothers || currentEmps.length === 0 || currentEmps.some(e => e.id === 'emp-1' || e.name.includes('Ayesha'))) {
      const brothers: Employee[] = [
        { id: 'emp-haseeb', name: 'Haseeb', role: 'manager', pin: '', phone: '+92 300 1111111', isActive: true, avatarColor: '#007AFF' },
        { id: 'emp-aliyan', name: 'Aliyan', role: 'manager', pin: '', phone: '+92 300 2222222', isActive: true, avatarColor: '#34C759' },
        { id: 'emp-shaban', name: 'Shaban', role: 'manager', pin: '', phone: '+92 300 3333333', isActive: true, avatarColor: '#FF9500' },
      ];
      await db.employees.clear();
      await db.employees.bulkPut(brothers);
      await db.shifts.put({
        id: 'shift-current',
        employeeId: 'emp-haseeb',
        employeeName: 'Haseeb',
        role: 'manager',
        clockIn: new Date().toISOString(),
        openingCash: 5000,
        expectedCash: 5000,
        notes: 'Haseeb shift active'
      });
    }
    return; // already initialized
  }

  // 1. Settings
  await db.settings.put({
    id: 'default',
    restaurantName: "Haseeb's Foods Café (HFC)",
    tagline: 'Freshly Fried, Crispy & Delicious',
    address: 'Gole Masjid Ghousia Town, Chitti Mitti, Bhimber Road, Samahni, Azad Kashmir',
    phone: '0343-5140308 / 0310-1879930 / 0342-5158128',
    currency: 'Rs.',
    taxRate: 0, // PKR without standard 16% sales tax as requested
    defaultDeliveryFee: 150,
    receiptHeader: '*** HASEEB.S FOODS CAFÉ (HFC) ***',
    receiptFooter: 'For Home Delivery Call: 0343-5140308 / 0310-1879930 / 0342-5158128\nGole Masjid Ghousia Town, Samahni AJK',
    soundEnabled: true,
    autoPrintReceipt: true,
    supabaseUrl: envUrl || '',
    supabaseAnonKey: envKey || '',
  });

  // 2. Categories
  await db.categories.bulkPut(HFC_CATEGORIES);

  // 3. Stock Items
  const initialStock: StockItem[] = [
    { id: 'stk-chicken-fillet', name: 'Chicken Breast Fillet', category: 'Meat', unit: 'kg', currentStock: 45, minThreshold: 15, costPerUnit: 850, lastRestocked: new Date().toISOString() },
    { id: 'stk-broast-chicken', name: 'Bone-In Broast Chicken', category: 'Meat', unit: 'kg', currentStock: 60, minThreshold: 20, costPerUnit: 720, lastRestocked: new Date().toISOString() },
    { id: 'stk-burger-buns', name: 'Brioche Sesame Buns', category: 'Bakery', unit: 'pieces', currentStock: 120, minThreshold: 30, costPerUnit: 35, lastRestocked: new Date().toISOString() },
    { id: 'stk-fries', name: 'Crinkle Cut French Fries', category: 'Frozen', unit: 'kg', currentStock: 38, minThreshold: 10, costPerUnit: 420, lastRestocked: new Date().toISOString() },
    { id: 'stk-cheese', name: 'Cheddar Cheese Slices', category: 'Dairy', unit: 'packets', currentStock: 25, minThreshold: 8, costPerUnit: 650, lastRestocked: new Date().toISOString() },
    { id: 'stk-garlic-sauce', name: 'Signature Garlic Mayo', category: 'Sauces', unit: 'liters', currentStock: 14, minThreshold: 4, costPerUnit: 550, lastRestocked: new Date().toISOString() },
    { id: 'stk-cooking-oil', name: 'Premium Frying Oil', category: 'Groceries', unit: 'liters', currentStock: 75, minThreshold: 20, costPerUnit: 480, lastRestocked: new Date().toISOString() },
    { id: 'stk-drink-cans', name: 'Cold Drink Cans 330ml', category: 'Beverages', unit: 'cans', currentStock: 96, minThreshold: 24, costPerUnit: 90, lastRestocked: new Date().toISOString() },
  ];
  await db.stock.bulkPut(initialStock);

  // 4. Menu Items (Full HFC Official Catalog)
  await db.menuItems.bulkPut(HFC_MENU_ITEMS);

  // 5. Tables
  const initialTables: Table[] = [
    { id: 'tbl-1', number: 'T-01', zone: 'indoor', capacity: 4, status: 'available' },
    { id: 'tbl-2', number: 'T-02', zone: 'indoor', capacity: 4, status: 'available' },
    { id: 'tbl-3', number: 'T-03', zone: 'indoor', capacity: 2, status: 'available' },
    { id: 'tbl-4', number: 'T-04', zone: 'indoor', capacity: 6, status: 'available' },
    { id: 'tbl-5', number: 'T-05', zone: 'indoor', capacity: 4, status: 'available' },
    { id: 'tbl-6', number: 'T-06', zone: 'terrace', capacity: 4, status: 'available' },
    { id: 'tbl-7', number: 'T-07', zone: 'terrace', capacity: 4, status: 'available' },
    { id: 'tbl-8', number: 'T-08', zone: 'terrace', capacity: 2, status: 'available' },
    { id: 'tbl-9', number: 'VIP-01', zone: 'vip_family', capacity: 8, status: 'available' },
    { id: 'tbl-10', number: 'VIP-02', zone: 'vip_family', capacity: 10, status: 'available' },
  ];
  await db.diningTables.bulkPut(initialTables);

  // 6. Employees: The 3 Brothers Managing HFC
  const initialBrothers: Employee[] = [
    { id: 'emp-haseeb', name: 'Haseeb', role: 'manager', pin: '', phone: '+92 300 1111111', isActive: true, avatarColor: '#007AFF' },
    { id: 'emp-aliyan', name: 'Aliyan', role: 'manager', pin: '', phone: '+92 300 2222222', isActive: true, avatarColor: '#34C759' },
    { id: 'emp-shaban', name: 'Shaban', role: 'manager', pin: '', phone: '+92 300 3333333', isActive: true, avatarColor: '#FF9500' },
  ];
  await db.employees.bulkPut(initialBrothers);

  // 7. Seed initial shift
  await db.shifts.put({
    id: 'shift-current',
    employeeId: 'emp-haseeb',
    employeeName: 'Haseeb',
    role: 'manager',
    clockIn: new Date().toISOString(),
    openingCash: 5000,
    expectedCash: 5000,
    notes: 'Haseeb shift active'
  });
}
