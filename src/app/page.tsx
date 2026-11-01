'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialData } from '@/lib/db';
import { syncManager } from '@/lib/sync';
import { sound } from '@/lib/sound';
import type { 
  MenuItem, 
  Category,
  OrderItem, 
  OrderType, 
  PaymentMethod, 
  PaymentStatus,
  CustomerInfo, 
  Order, 
  Table, 
  Employee, 
  OrderStatus, 
  RestaurantSettings,
  StockItem 
} from '@/types';

// Components
import { AppleSidebar, type NavTab } from '@/components/Navigation/AppleSidebar';
import { TopStatusBar } from '@/components/Navigation/TopStatusBar';
import { CategoryPills } from '@/components/POS/CategoryPills';
import { MenuGrid } from '@/components/POS/MenuGrid';
import { CartDrawer } from '@/components/POS/CartDrawer';
import { ItemModifierModal } from '@/components/POS/ItemModifierModal';
import { LiveOrdersList } from '@/components/POS/LiveOrdersList';
import { TableGrid } from '@/components/Tables/TableGrid';
import { DeliveryManager } from '@/components/Delivery/DeliveryManager';
import { StockManager } from '@/components/Inventory/StockManager';
import { EmployeeManager } from '@/components/Employees/EmployeeManager';
import { SalesAnalytics } from '@/components/Reports/SalesAnalytics';
import { RestaurantSettingsModal } from '@/components/Settings/RestaurantSettingsModal';
import { PinQuickSwitchModal } from '@/components/Auth/PinQuickSwitchModal';
import { ThermalReceiptModal } from '@/components/Receipt/ThermalReceiptModal';
import { InstallModal } from '@/components/Install/InstallModal';
import { CatalogManager } from '@/components/Catalog/CatalogManager';

export default function Home() {
  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<NavTab>('pos');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Cart & POS Order state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    landmark: '',
  });
  const [deliveryCharge, setDeliveryCharge] = useState<number>(150);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Modals state
  const [modifierModalItem, setModifierModalItem] = useState<MenuItem | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isPinSwitchOpen, setIsPinSwitchOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [currentStaff, setCurrentStaff] = useState<Employee | null>(null);

  // Initialize Dexie Seed Data & PWA Install Listener on mount
  useEffect(() => {
    seedInitialData();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallModalOpen(false);
      }
    }
  };

  // Sync Dark Mode class with <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Reactive Dexie Live Queries (0ms latency local IndexedDB)
  const menuItems = useLiveQuery(() => db.menuItems.toArray()) || [];
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray()) || [];
  const tables = useLiveQuery(() => db.diningTables.toArray()) || [];
  const stockItems = useLiveQuery(() => db.stock.toArray()) || [];
  const employees = useLiveQuery(() => db.employees.toArray()) || [];
  const orders = useLiveQuery(() => db.orders.reverse().toArray()) || [];
  const currentShift = useLiveQuery(() => db.shifts.get('shift-current')) || null;
  const dbSettings = useLiveQuery(() => db.settings.get('default'));

  // Default fallback settings
  const settings: RestaurantSettings = dbSettings || {
    id: 'default',
    restaurantName: 'HFC (Hot & Fast Chicken)',
    tagline: 'Freshly Fried, Crispy & Delicious',
    address: 'Main Commercial Avenue, Block 4',
    phone: '+92 300 1234567',
    currency: 'Rs.',
    taxRate: 0,
    defaultDeliveryFee: 150,
    receiptHeader: '*** THANK YOU FOR DINING WITH HFC ***',
    receiptFooter: 'For Home Delivery Call: +92 300 1234567\nOrder Online: hfc-orders.vercel.app',
    soundEnabled: true,
    autoPrintReceipt: true,
  };

  // Set default cashier if none active
  useEffect(() => {
    if (!currentStaff && employees.length > 0) {
      const cashier = employees.find(e => e.role === 'cashier') || employees[0];
      setCurrentStaff(cashier);
    }
  }, [employees, currentStaff]);

  // Create quick stock map for fast lookup
  const stockMap = useMemo(() => {
    const map: Record<string, StockItem> = {};
    stockItems.forEach(item => {
      map[item.id] = item;
    });
    return map;
  }, [stockItems]);

  // Filter menu items by search and category
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = selectedCategoryId ? item.categoryId === selectedCategoryId : true;
      const matchesSearch = searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

  // Badge Counts
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  }, [orders]);

  const activeDeliveryCount = useMemo(() => {
    return orders.filter(o => o.type === 'delivery' && o.status !== 'delivered' && o.status !== 'cancelled').length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return stockItems.filter(s => s.currentStock <= s.minThreshold).length;
  }, [stockItems]);

  const riders = useMemo(() => {
    return employees.filter(e => e.role === 'rider');
  }, [employees]);

  // --- Handlers ---
  const handleItemClick = (item: MenuItem) => {
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setModifierModalItem(item);
    } else {
      handleAddToCart(item, 1, [], '');
    }
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    selectedModifiers: { groupName: string; choiceName: string; price: number }[],
    notes: string
  ) => {
    const extraPrice = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
    const effectivePrice = item.price + extraPrice;

    setCart(prev => {
      // Check if identical item with identical modifiers exists in cart
      const existingIdx = prev.findIndex(ci => 
        ci.menuItemId === item.id && 
        JSON.stringify(ci.selectedModifiers) === JSON.stringify(selectedModifiers) &&
        ci.notes === notes
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      } else {
        const newCartItem: OrderItem = {
          id: crypto.randomUUID(),
          menuItemId: item.id,
          name: item.name,
          price: effectivePrice,
          quantity,
          selectedModifiers,
          notes,
        };
        return [...prev, newCartItem];
      }
    });
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      const updatedQty = next[index].quantity + delta;
      if (updatedQty <= 0) {
        return next.filter((_, i) => i !== index);
      } else {
        next[index].quantity = updatedQty;
        return next;
      }
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleNewOrder = () => {
    setCart([]);
    setSelectedTable(null);
    setCustomerInfo({ name: '', phone: '', address: '', landmark: '' });
    setDiscountPercentage(0);
    setCurrentTab('pos');
  };

  // --- Complete Order & Commit to Local DB + Sync Queue ---
  const handleCompleteOrder = async (
    paymentMethod: PaymentMethod,
    paymentStatus: PaymentStatus = 'paid'
  ) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = Math.round((subtotal * discountPercentage) / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round((taxableAmount * settings.taxRate) / 100);
    const effectiveDelivery = orderType === 'delivery' ? deliveryCharge : 0;
    const grandTotal = taxableAmount + taxAmount + effectiveDelivery;

    // Generate Order Token (e.g. HFC-101)
    const orderCount = await db.orders.count();
    const token = `HFC-${(orderCount + 101).toString().slice(-3)}`;

    const newOrder: Order = {
      id: crypto.randomUUID(),
      token,
      type: orderType,
      status: 'pending',
      items: [...cart],
      subtotal,
      tax: taxAmount,
      deliveryCharge: effectiveDelivery,
      discount: discountAmount,
      total: grandTotal,
      paymentStatus,
      paymentMethod,
      tableNumber: orderType === 'dine_in' ? selectedTable || undefined : undefined,
      customer: orderType === 'delivery' ? { ...customerInfo } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverName: currentStaff?.name || 'Haseeb',
    };

    // 1. Commit Order to Dexie
    await db.orders.put(newOrder);

    // 2. If Dine-in, mark table as Occupied and lock it with currentOrderId
    if (orderType === 'dine_in' && selectedTable) {
      const tbl = tables.find(t => t.number === selectedTable);
      if (tbl) {
        await db.diningTables.update(tbl.id, {
          status: 'occupied',
          currentOrderId: newOrder.id,
        });
        await syncManager.queueMutation('tables', 'UPDATE', { 
          id: tbl.id, 
          status: 'occupied', 
          currentOrderId: newOrder.id 
        });
      }
    }

    // 3. Deduct Stock for ordered items with linked stock items
    for (const item of cart) {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (menuItem?.stockItemId) {
        const stockRecord = stockMap[menuItem.stockItemId];
        if (stockRecord) {
          const newStock = Math.max(0, stockRecord.currentStock - item.quantity);
          await db.stock.update(stockRecord.id, { currentStock: newStock });
          await syncManager.queueMutation('stock', 'UPDATE', { id: stockRecord.id, currentStock: newStock });
        }
      }
    }

    // 4. Queue Order Creation in Sync Outbox
    await syncManager.queueMutation('orders', 'CREATE', newOrder);

    // 5. Lifecycle Action:
    // For Takeaway & Paid Delivery: open official paid receipt
    // For Dine-in: order sent to kitchen; table is locked; bill settled when guests finish
    if (paymentStatus === 'paid') {
      setActiveReceiptOrder(newOrder);
    } else if (orderType === 'dine_in') {
      sound.playSuccess();
    } else {
      // Cash on delivery: open receipt for rider slip
      setActiveReceiptOrder(newOrder);
    }

    setCart([]);
    setSelectedTable(null);
    setCustomerInfo({ name: '', phone: '', address: '', landmark: '' });
  };

  // --- Settle Bill (Dine-In counter checkout) ---
  const handleSettleBill = async (
    orderId: string, 
    tableId: string, 
    paymentMethod: PaymentMethod = 'cash'
  ) => {
    const order = await db.orders.get(orderId);
    if (!order) return;

    const updatedOrder: Order = {
      ...order,
      paymentStatus: 'paid',
      paymentMethod,
      status: 'delivered',
      updatedAt: new Date().toISOString(),
    };

    // Update order in local DB & sync queue
    await db.orders.put(updatedOrder);
    await syncManager.queueMutation('orders', 'UPDATE', {
      id: orderId,
      paymentStatus: 'paid',
      paymentMethod,
      status: 'delivered',
    });

    // Free the table
    const targetTable = tableId 
      ? await db.diningTables.get(tableId) 
      : (order.tableNumber ? tables.find(t => t.number === order.tableNumber) : null);

    if (targetTable) {
      await db.diningTables.update(targetTable.id, {
        status: 'available',
        currentOrderId: undefined,
      });
      await syncManager.queueMutation('tables', 'UPDATE', {
        id: targetTable.id,
        status: 'available',
        currentOrderId: null,
      });
    }

    // Open final paid receipt for printing
    setActiveReceiptOrder(updatedOrder);
  };

  // --- Table Layout Management Handlers ---
  const handleAddTable = async (tableData: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tableData,
      id: `tbl-${crypto.randomUUID().slice(0, 8)}`,
    };
    await db.diningTables.put(newTable);
    await syncManager.queueMutation('tables', 'CREATE', newTable);
  };

  const handleUpdateTableDetails = async (table: Table) => {
    await db.diningTables.put(table);
    await syncManager.queueMutation('tables', 'UPDATE', table);
  };

  const handleDeleteTable = async (tableId: string) => {
    await db.diningTables.delete(tableId);
    await syncManager.queueMutation('tables', 'DELETE', { id: tableId });
  };

  // --- Order Status Lifecycle Transitions ---
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = await db.orders.get(orderId);
    const updates: Partial<Order> = { 
      status, 
      updatedAt: new Date().toISOString() 
    };
    
    // If completing the order, mark as paid as well
    if (status === 'delivered') {
      updates.paymentStatus = 'paid';
    }

    await db.orders.update(orderId, updates);
    await syncManager.queueMutation('orders', 'UPDATE', { id: orderId, ...updates });

    // If delivered/completed or cancelled, free the table if dine-in
    if (status === 'delivered' || status === 'cancelled') {
      const tableNum = order?.tableNumber;
      if (tableNum) {
        const tbl = tables.find(t => t.number === tableNum);
        if (tbl) {
          await db.diningTables.update(tbl.id, { status: 'available', currentOrderId: undefined });
          await syncManager.queueMutation('tables', 'UPDATE', { id: tbl.id, status: 'available', currentOrderId: null });
        }
      }
    }
  };

  const handleUpdateTableStatus = async (tableId: string, status: Table['status']) => {
    await db.diningTables.update(tableId, { status });
    await syncManager.queueMutation('tables', 'UPDATE', { id: tableId, status });
  };

  const handleAssignRider = async (orderId: string, riderId: string, riderName: string) => {
    sound.playTap();
    await db.orders.update(orderId, {
      assignedRiderId: riderId,
      assignedRiderName: riderName,
      status: 'out_for_delivery',
      updatedAt: new Date().toISOString(),
    });
    await syncManager.queueMutation('orders', 'UPDATE', {
      id: orderId,
      assignedRiderId: riderId,
      assignedRiderName: riderName,
      status: 'out_for_delivery',
    });
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    await db.stock.update(id, { currentStock: newStock, lastRestocked: new Date().toISOString() });
    await syncManager.queueMutation('stock', 'UPDATE', { id, currentStock: newStock });
  };

  const handleAddStockItem = async (item: Omit<StockItem, 'id' | 'lastRestocked'>) => {
    const newItem: StockItem = {
      ...item,
      id: `stk-${Date.now()}`,
      lastRestocked: new Date().toISOString(),
    };
    await db.stock.put(newItem);
    await syncManager.queueMutation('stock', 'CREATE', newItem);
  };

  const handleAddEmployee = async (emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
    };
    await db.employees.put(newEmp);
    await syncManager.queueMutation('employees', 'CREATE', newEmp);
  };

  const handleClockIn = async (employeeId: string, employeeName: string, role: Employee['role'], openingCash: number) => {
    const shift = {
      id: 'shift-current',
      employeeId,
      employeeName,
      role,
      clockIn: new Date().toISOString(),
      openingCash,
      expectedCash: openingCash,
      notes: `${employeeName} active on shift`
    };
    await db.shifts.put(shift);
    const emp = employees.find(e => e.id === employeeId);
    if (emp) setCurrentStaff(emp);
  };

  const handleSwitchStaff = async (emp: Employee) => {
    setCurrentStaff(emp);
    await db.shifts.put({
      id: 'shift-current',
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.role,
      clockIn: new Date().toISOString(),
      openingCash: currentShift?.openingCash || 5000,
      expectedCash: currentShift?.expectedCash || 5000,
      notes: `${emp.name} active on duty`
    });
  };

  const handleClockOut = async (closingCash: number, notes: string) => {
    if (currentShift) {
      await db.shifts.update(currentShift.id, {
        clockOut: new Date().toISOString(),
        closingCash,
        notes,
      });
      alert(`Shift closed. Drawer balanced: ${settings.currency} ${closingCash.toLocaleString()}`);
    }
  };

  const handleSaveSettings = async (newSettings: RestaurantSettings) => {
    await db.settings.put(newSettings);
    await syncManager.queueMutation('settings', 'UPDATE', newSettings);
    await syncManager.reconnectCloud();
  };

  // --- Catalog (Menu & Categories) Handlers ---
  const handleSaveMenuItem = async (item: MenuItem) => {
    const existing = await db.menuItems.get(item.id);
    await db.menuItems.put(item);
    await syncManager.queueMutation('menuItems', existing ? 'UPDATE' : 'CREATE', item);
  };

  const handleDeleteMenuItem = async (id: string) => {
    await db.menuItems.delete(id);
    await syncManager.queueMutation('menuItems', 'DELETE', { id });
  };

  const handleToggleItemAvailability = async (id: string, isAvailable: boolean) => {
    await db.menuItems.update(id, { isAvailable });
    await syncManager.queueMutation('menuItems', 'UPDATE', { id, isAvailable });
  };

  const handleSaveCategory = async (category: Category) => {
    const existing = await db.categories.get(category.id);
    await db.categories.put(category);
    await syncManager.queueMutation('categories', existing ? 'UPDATE' : 'CREATE', category);
  };

  const handleDeleteCategory = async (id: string) => {
    await db.categories.delete(id);
    await syncManager.queueMutation('categories', 'DELETE', { id });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans">
      {/* 1. Apple macOS / iPadOS Frosted Sidebar */}
      <AppleSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (soundEnabled) sound.playTap();
          setCurrentTab(tab);
        }}
        activeOrdersCount={activeOrders.length}
        activeDeliveryCount={activeDeliveryCount}
        lowStockCount={lowStockCount}
        currentStaff={currentStaff}
        onOpenPinSwitch={() => setIsPinSwitchOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* 2. Main Central Work Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Apple Top Status Bar */}
        <TopStatusBar
          onNewOrder={handleNewOrder}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onOpenInstall={() => setIsInstallModalOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
        />

        {/* Tab Content Router */}
        <div className="flex-1 overflow-y-auto">
          {currentTab === 'pos' && (
            <div className="p-6 space-y-4">
              {/* Category Pills Selector */}
              <CategoryPills
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={(id) => {
                  if (soundEnabled) sound.playTap();
                  setSelectedCategoryId(id);
                }}
                onOpenCatalog={() => setCurrentTab('catalog')}
              />

              {/* Menu Item Grid */}
              <MenuGrid
                items={filteredMenuItems}
                stockMap={stockMap}
                currency={settings.currency}
                onItemClick={handleItemClick}
              />
            </div>
          )}

          {currentTab === 'catalog' && (
            <CatalogManager
              menuItems={menuItems}
              categories={categories}
              stockItems={stockItems}
              currency={settings.currency}
              onSaveMenuItem={handleSaveMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onToggleItemAvailability={handleToggleItemAvailability}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {currentTab === 'orders' && (
            <LiveOrdersList
              orders={orders}
              tables={tables}
              currency={settings.currency}
              onUpdateStatus={handleUpdateOrderStatus}
              onViewReceipt={(order) => setActiveReceiptOrder(order)}
              onSettleBill={handleSettleBill}
            />
          )}

          {currentTab === 'tables' && (
            <TableGrid
              tables={tables}
              activeOrders={activeOrders}
              currency={settings.currency}
              onSelectTableForOrder={(tableNumber) => {
                setSelectedTable(tableNumber);
                setOrderType('dine_in');
                setCurrentTab('pos');
              }}
              onUpdateTableStatus={handleUpdateTableStatus}
              onViewOrderReceipt={(order) => setActiveReceiptOrder(order)}
              onAddTable={handleAddTable}
              onUpdateTableDetails={handleUpdateTableDetails}
              onDeleteTable={handleDeleteTable}
              onSettleBill={handleSettleBill}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {currentTab === 'delivery' && (
            <DeliveryManager
              orders={orders}
              riders={riders}
              currency={settings.currency}
              onAssignRider={handleAssignRider}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {currentTab === 'inventory' && (
            <StockManager
              stockItems={stockItems}
              currency={settings.currency}
              onUpdateStock={handleUpdateStock}
              onAddStockItem={handleAddStockItem}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeeManager
              employees={employees}
              currentShift={currentShift}
              orders={orders}
              currency={settings.currency}
              onAddEmployee={handleAddEmployee}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
            />
          )}

          {currentTab === 'reports' && (
            <SalesAnalytics
              orders={orders}
              currency={settings.currency}
              onViewReceipt={(order) => setActiveReceiptOrder(order)}
            />
          )}

          {currentTab === 'settings' && (
            <RestaurantSettingsModal
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>
      </main>

      {/* 3. POS Order Cart Drawer (Visible when on POS tab) */}
      {currentTab === 'pos' && (
        <CartDrawer
          cart={cart}
          orderType={orderType}
          onChangeOrderType={setOrderType}
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
          availableTables={tables}
          customerInfo={customerInfo}
          onChangeCustomerInfo={setCustomerInfo}
          deliveryCharge={deliveryCharge}
          onChangeDeliveryCharge={setDeliveryCharge}
          discountPercentage={discountPercentage}
          onChangeDiscount={setDiscountPercentage}
          currency={settings.currency}
          taxRate={settings.taxRate}
          currentStaff={currentStaff}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onCompleteOrder={handleCompleteOrder}
        />
      )}

      {/* --- Modals & Sheets --- */}
      {/* A. Item Modifiers Sheet */}
      {modifierModalItem && (
        <ItemModifierModal
          item={modifierModalItem}
          currency={settings.currency}
          onClose={() => setModifierModalItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* B. Thermal 80mm Printable Receipt Modal */}
      {activeReceiptOrder && (
        <ThermalReceiptModal
          order={activeReceiptOrder}
          settings={settings}
          onClose={() => setActiveReceiptOrder(null)}
        />
      )}

      {/* C. Brother Shift Handover Modal */}
      {isPinSwitchOpen && (
        <PinQuickSwitchModal
          employees={employees}
          currentStaff={currentStaff}
          onSwitchStaff={handleSwitchStaff}
          onClose={() => setIsPinSwitchOpen(false)}
        />
      )}

      {/* D. Desktop PWA Download / Installation Guidance Modal */}
      {isInstallModalOpen && (
        <InstallModal
          onClose={() => setIsInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
          onTriggerInstall={handleTriggerInstall}
        />
      )}
    </div>
  );
}
