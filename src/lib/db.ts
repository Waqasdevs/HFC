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
  const settingsCount = await db.settings.count();
  if (settingsCount > 0) return; // already initialized

  // 1. Settings
  await db.settings.put({
    id: 'default',
    restaurantName: 'HFC (Hot & Fast Chicken)',
    tagline: 'Freshly Fried, Crispy & Delicious',
    address: 'Main Commercial Avenue, Block 4',
    phone: '+92 300 1234567',
    currency: 'Rs.',
    taxRate: 0, // PKR without standard 16% sales tax as requested
    defaultDeliveryFee: 150,
    receiptHeader: '*** THANK YOU FOR DINING WITH HFC ***',
    receiptFooter: 'For Home Delivery Call: +92 300 1234567\nOrder Online: hfc-orders.vercel.app',
    soundEnabled: true,
    autoPrintReceipt: true,
  });

  // 2. Categories
  const initialCategories: Category[] = [
    { id: 'cat-deals', name: 'Deals & Combos', icon: 'Sparkles', order: 1 },
    { id: 'cat-broast', name: 'Crispy Broast', icon: 'Flame', order: 2 },
    { id: 'cat-burgers', name: 'Burgers & Sandwiches', icon: 'UtensilsCrossed', order: 3 },
    { id: 'cat-sides', name: 'Loaded Fries & Wings', icon: 'Cookie', order: 4 },
    { id: 'cat-drinks', name: 'Beverages & Shakes', icon: 'Coffee', order: 5 },
  ];
  await db.categories.bulkPut(initialCategories);

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

  // 4. Menu Items
  const initialMenuItems: MenuItem[] = [
    {
      id: 'item-1',
      name: 'HFC Zinger Burger',
      description: 'Extra crispy chicken breast fillet, lettuce, signature garlic sauce in a toasted sesame bun.',
      price: 450,
      categoryId: 'cat-burgers',
      categoryName: 'Burgers & Sandwiches',
      isAvailable: true,
      stockTracking: true,
      stockItemId: 'stk-chicken-fillet',
      modifierGroups: [
        {
          id: 'mod-spice',
          name: 'Spice Level',
          required: true,
          choices: [
            { id: 'sp-mild', name: 'Regular Mild', price: 0 },
            { id: 'sp-spicy', name: 'Hot & Spicy', price: 0 },
            { id: 'sp-extra', name: 'Ghost Chili Hot', price: 30 }
          ]
        },
        {
          id: 'mod-addons',
          name: 'Add-Ons',
          required: false,
          choices: [
            { id: 'add-cheese', name: 'Extra Cheddar Cheese', price: 60 },
            { id: 'add-jalapeno', name: 'Pickled Jalapenos', price: 40 },
            { id: 'add-patty', name: 'Double Crunchy Patty', price: 220 }
          ]
        }
      ]
    },
    {
      id: 'item-2',
      name: 'Double Decker Crunch',
      description: 'Two crispy zinger fillets, double melted cheese, secret spicy aioli.',
      price: 690,
      categoryId: 'cat-burgers',
      categoryName: 'Burgers & Sandwiches',
      isAvailable: true,
      stockTracking: true,
      stockItemId: 'stk-chicken-fillet'
    },
    {
      id: 'item-3',
      name: 'Quarter Crispy Broast',
      description: 'Crispy fried chicken (Leg or Chest), bun, seasoned fries, garlic dip.',
      price: 520,
      categoryId: 'cat-broast',
      categoryName: 'Crispy Broast',
      isAvailable: true,
      stockTracking: true,
      stockItemId: 'stk-broast-chicken',
      modifierGroups: [
        {
          id: 'mod-cut',
          name: 'Chicken Piece Preference',
          required: true,
          choices: [
            { id: 'cut-leg', name: 'Juicy Leg Piece', price: 0 },
            { id: 'cut-chest', name: 'Tender Chest Piece', price: 30 }
          ]
        }
      ]
    },
    {
      id: 'item-4',
      name: 'Half Crispy Broast (4 Pcs)',
      description: '4 pieces of golden crispy broast with 2 buns, large fries, and 2 garlic dips.',
      price: 980,
      categoryId: 'cat-broast',
      categoryName: 'Crispy Broast',
      isAvailable: true,
      stockTracking: true,
      stockItemId: 'stk-broast-chicken'
    },
    {
      id: 'item-5',
      name: 'HFC Family Broast Bucket (8 Pcs)',
      description: '8 pieces of crispy broast, 4 buns, jumbo crinkle fries, 4 dips, 1.5L soft drink.',
      price: 1850,
      categoryId: 'cat-deals',
      categoryName: 'Deals & Combos',
      isAvailable: true,
      stockTracking: true,
      stockItemId: 'stk-broast-chicken'
    },
    {
      id: 'item-6',
      name: 'Crispy Hot Wings (6 Pcs)',
      description: 'Spicy hand-breaded wings tossed in signature sweet & spicy glaze.',
      price: 390,
      categoryId: 'cat-sides',
      categoryName: 'Loaded Fries & Wings',
      isAvailable: true,
      stockTracking: true
    },
    {
      id: 'item-7',
      name: 'HFC Loaded Cheese Fries',
      description: 'Crispy crinkle fries drenched in warm cheddar sauce, diced spicy chicken, and jalapeños.',
      price: 480,
      categoryId: 'cat-sides',
      categoryName: 'Loaded Fries & Wings',
      isAvailable: true,
      stockTracking: true,
      stockItemId: 'stk-fries'
    },
    {
      id: 'item-8',
      name: 'Triple Decker Club Sandwich',
      description: 'Grilled chicken shreds, fried egg, cucumber, tomato, cheese with side of fries.',
      price: 460,
      categoryId: 'cat-burgers',
      categoryName: 'Burgers & Sandwiches',
      isAvailable: true,
      stockTracking: true
    },
    {
      id: 'item-9',
      name: 'Cold Drink Can (330ml)',
      description: 'Chilled Pepsi, 7up, Mirinda, or Mountain Dew.',
      price: 120,
      categoryId: 'cat-drinks',
      categoryName: 'Beverages & Shakes',
      isAvailable: true,
      stockTracking: true,
      stockItemId: 'stk-drink-cans',
      modifierGroups: [
        {
          id: 'mod-soda',
          name: 'Flavor Choice',
          required: true,
          choices: [
            { id: 'soda-pepsi', name: 'Pepsi', price: 0 },
            { id: 'soda-7up', name: '7Up', price: 0 },
            { id: 'soda-mirinda', name: 'Mirinda', price: 0 }
          ]
        }
      ]
    },
    {
      id: 'item-10',
      name: 'Fresh Mint Lemonade',
      description: 'Refreshing crushed fresh mint leaves, lemon juice, ice soda.',
      price: 220,
      categoryId: 'cat-drinks',
      categoryName: 'Beverages & Shakes',
      isAvailable: true
    }
  ];
  await db.menuItems.bulkPut(initialMenuItems);

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

  // 6. Employees
  const initialEmployees: Employee[] = [
    { id: 'emp-1', name: 'Waqas (Admin)', role: 'admin', pin: '1111', phone: '+92 300 0000001', isActive: true, avatarColor: '#007AFF' },
    { id: 'emp-2', name: 'Daniyal (Manager)', role: 'manager', pin: '2222', phone: '+92 300 0000002', isActive: true, avatarColor: '#34C759' },
    { id: 'emp-3', name: 'Ayesha (Cashier)', role: 'cashier', pin: '3333', phone: '+92 300 0000003', isActive: true, avatarColor: '#FF9500' },
    { id: 'emp-4', name: 'Chef Tariq (Kitchen)', role: 'chef', pin: '4444', phone: '+92 300 0000004', isActive: true, avatarColor: '#FF3B30' },
    { id: 'emp-5', name: 'Hamza (Rider)', role: 'rider', pin: '5555', phone: '+92 300 0000005', isActive: true, avatarColor: '#5856D6' },
    { id: 'emp-6', name: 'Bilal (Waiter)', role: 'waiter', pin: '6666', phone: '+92 300 0000006', isActive: true, avatarColor: '#5AC8FA' },
  ];
  await db.employees.bulkPut(initialEmployees);

  // 7. Seed initial shift
  await db.shifts.put({
    id: 'shift-current',
    employeeId: 'emp-3',
    employeeName: 'Ayesha (Cashier)',
    role: 'cashier',
    clockIn: new Date().toISOString(),
    openingCash: 5000,
    expectedCash: 5000,
    notes: 'Morning shift opening register'
  });
}
