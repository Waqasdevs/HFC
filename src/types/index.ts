export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export type OrderStatus = 
  | 'pending'          // New order received
  | 'preparing'        // In the kitchen
  | 'ready'            // Ready for pickup / delivery
  | 'served'           // Food served to dine-in table (guests eating)
  | 'out_for_delivery' // Rider dispatched
  | 'delivered'        // Completed / Delivered
  | 'cancelled';       // Voided

export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'online_transfer';

export interface ModifierChoice {
  id: string;
  name: string;
  price: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  required: boolean;
  choices: ModifierChoice[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedModifiers?: {
    groupName: string;
    choiceName: string;
    price: number;
  }[];
  notes?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  landmark?: string;
  notes?: string;
}

export interface Order {
  id: string;
  token: string; // E.g. HFC-101
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  tableNumber?: string;
  customer?: CustomerInfo;
  assignedRiderId?: string;
  assignedRiderName?: string;
  createdAt: string;
  updatedAt: string;
  serverName: string;
  notes?: string;
}

export interface Table {
  id: string;
  number: string;
  zone: 'indoor' | 'terrace' | 'vip_family';
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'billed';
  currentOrderId?: string;
  guestCount?: number;
}

export interface MenuItem {
  id: string;
  itemNumber?: number;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  image?: string;
  isAvailable: boolean;
  modifierGroups?: ModifierOption[];
  stockTracking?: boolean;
  stockItemId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'pieces' | 'liters' | 'packets' | 'cans';
  currentStock: number;
  minThreshold: number;
  costPerUnit: number;
  lastRestocked: string;
}

export type EmployeeRole = 'admin' | 'manager' | 'cashier' | 'chef' | 'rider' | 'waiter';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  pin: string; // 4-digit PIN for instant terminal unlock
  phone: string;
  isActive: boolean;
  avatarColor?: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  clockIn: string;
  clockOut?: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  notes?: string;
}

export interface RestaurantSettings {
  id: string;
  restaurantName: string;
  tagline: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number; // percentage (default 0%)
  defaultDeliveryFee: number;
  receiptHeader: string;
  receiptFooter: string;
  soundEnabled: boolean;
  autoPrintReceipt: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface SyncMutation {
  id: string;
  entity: 'orders' | 'tables' | 'stock' | 'employees' | 'settings' | 'shifts' | 'menuItems' | 'categories';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  clientTimestamp: number;
  synced: boolean;
}
