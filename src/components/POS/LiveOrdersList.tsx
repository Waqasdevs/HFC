'use client';

import React, { useState, useEffect } from 'react';
import type { Order, OrderStatus, Table, PaymentMethod, MenuItem, OrderItem, OrderType, CustomerInfo } from '@/types';
import { 
  Receipt, 
  Clock, 
  UtensilsCrossed, 
  ShoppingBag, 
  Bike, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  Banknote,
  CreditCard,
  ChefHat,
  X,
  Share2,
  Pencil,
  Plus,
  Minus,
  Trash2,
  Search,
  Save
} from 'lucide-react';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';

interface LiveOrdersListProps {
  orders: Order[];
  tables: Table[];
  currency: string;
  menuItems?: MenuItem[];
  taxRate?: number;
  deliveryFee?: number;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onViewReceipt: (order: Order) => void;
  onSettleBill: (orderId: string, tableId: string, paymentMethod: PaymentMethod) => Promise<void> | void;
  onSaveOrder?: (updatedOrder: Order, previousTableNumber?: string) => Promise<void> | void;
}

export const LiveOrdersList: React.FC<LiveOrdersListProps> = ({
  orders,
  tables,
  currency,
  menuItems = [],
  taxRate = 0,
  deliveryFee = 150,
  onUpdateStatus,
  onViewReceipt,
  onSettleBill,
  onSaveOrder,
}) => {
  const [filterTab, setFilterTab] = useState<string>('active');
  const [, setTick] = useState<number>(0);

  // Settle Bill Modal state
  const [settleModalOrder, setSettleModalOrder] = useState<Order | null>(null);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [isSettling, setIsSettling] = useState(false);

  // Kitchen Slip (KOT) Preview Modal state
  const [kotModalOrder, setKotModalOrder] = useState<Order | null>(null);

  // Edit Order Modal state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [editType, setEditType] = useState<OrderType>('dine_in');
  const [editTable, setEditTable] = useState<string>('');
  const [editCustomer, setEditCustomer] = useState<CustomerInfo>({ name: '', phone: '', address: '' });
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Timer tick every 10 seconds to update live elapsed minutes on cards
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filterTabs = [
    { id: 'active', label: 'Active Orders' },
    { id: 'dine_in', label: 'Dine-In (Tables)' },
    { id: 'takeaway', label: 'Takeaways (To-Go)' },
    { id: 'delivery', label: 'Home Deliveries' },
    { id: 'completed', label: 'Completed Today' },
    { id: 'all', label: 'All History' },
  ];

  const filteredOrders = orders.filter(o => {
    const isCompleted = o.status === 'delivered' || o.status === 'cancelled';
    if (filterTab === 'active') return !isCompleted;
    if (filterTab === 'dine_in') return o.type === 'dine_in' && !isCompleted;
    if (filterTab === 'takeaway') return o.type === 'takeaway' && !isCompleted;
    if (filterTab === 'delivery') return o.type === 'delivery' && !isCompleted;
    if (filterTab === 'completed') return isCompleted;
    return true; // 'all'
  });

  // Calculate elapsed time in minutes
  const getElapsedMinutes = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const handleOpenSettleModal = (order: Order) => {
    sound.playTap();
    setSettleModalOrder(order);
    setSettlePaymentMethod('cash');
    setCashTendered(order.total.toString());
  };

  const handleConfirmSettlement = async () => {
    if (!settleModalOrder || isSettling) return;
    setIsSettling(true);
    sound.playSuccess();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#34C759', '#007AFF', '#FF9500']
      });
    } catch {}

    const tableId = settleModalOrder.tableNumber 
      ? tables.find(t => t.number === settleModalOrder.tableNumber)?.id || '' 
      : '';

    await onSettleBill(settleModalOrder.id, tableId, settlePaymentMethod);
    setIsSettling(false);
    setSettleModalOrder(null);
  };

  const handleOpenEditOrder = (order: Order) => {
    sound.playTap();
    setEditingOrder(order);
    setEditItems(JSON.parse(JSON.stringify(order.items || [])));
    setEditType(order.type);
    setEditTable(order.tableNumber || '');
    setEditCustomer(order.customer ? { ...order.customer } : { name: '', phone: '', address: '' });
    setEditDiscount(order.discount || 0);
    setCatalogSearch('');
  };

  const handleQuantityChange = (index: number, delta: number) => {
    sound.playTap();
    setEditItems(prev => {
      const copy = [...prev];
      const item = copy[index];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        copy.splice(index, 1);
      } else {
        copy[index] = { ...item, quantity: newQty };
      }
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    sound.playTap();
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddItemFromCatalog = (item: MenuItem) => {
    sound.playTap();
    setEditItems(prev => {
      const existingIndex = prev.findIndex(i => i.menuItemId === item.id);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + 1
        };
        return copy;
      } else {
        const newItem: OrderItem = {
          id: crypto.randomUUID(),
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        };
        return [...prev, newItem];
      }
    });
  };

  // Calculations for Order Editing
  const editSubtotal = editItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const editTax = taxRate ? Math.round(Math.max(0, editSubtotal - editDiscount) * (taxRate / 100)) : 0;
  const editDelivery = editType === 'delivery' ? (deliveryFee !== undefined ? deliveryFee : 150) : 0;
  const editTotal = Math.max(0, editSubtotal - editDiscount + editTax + editDelivery);

  const handleSaveEditedOrder = async (andPrintKOT: boolean = false) => {
    if (!editingOrder || isSavingEdit) return;
    if (editItems.length === 0) {
      sound.playAlert();
      alert('An order must have at least one item.');
      return;
    }
    if (editType === 'dine_in' && !editTable) {
      sound.playAlert();
      alert('Please select a Table for this Dine-In order.');
      return;
    }

    setIsSavingEdit(true);
    sound.playSuccess();

    const updatedOrder: Order = {
      ...editingOrder,
      type: editType,
      tableNumber: editType === 'dine_in' ? editTable : undefined,
      customer: editType === 'delivery' ? editCustomer : undefined,
      items: editItems,
      subtotal: editSubtotal,
      discount: editDiscount,
      tax: editTax,
      deliveryCharge: editDelivery,
      total: editTotal,
      updatedAt: new Date().toISOString(),
    };

    if (onSaveOrder) {
      await onSaveOrder(updatedOrder, editingOrder.tableNumber);
    }

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    setIsSavingEdit(false);
    const savedOrder = { ...updatedOrder };
    setEditingOrder(null);

    if (andPrintKOT) {
      handlePrintKOT(savedOrder);
    }
  };

  const handlePrintKOT = (order: Order) => {
    sound.playTap();
    setKotModalOrder(order);
  };

  const handleExecuteKOTPrint = () => {
    sound.playTap();
    window.print();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-blue/15 text-apple-blue flex items-center justify-center">
            <Receipt className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Live Order Operations
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Active tickets with live elapsed timers, kitchen slips, and counter bill settlement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-apple-blue/10 text-apple-blue">
            {filteredOrders.length} Orders Listed
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playTap();
              setFilterTab(tab.id);
            }}
            className={`apple-button px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterTab === tab.id
                ? 'bg-apple-blue text-white shadow-apple-sm'
                : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
          <p className="text-sm font-semibold text-neutral-500">No active orders in this view</p>
          <p className="text-xs text-neutral-400 mt-1">Place new orders from the POS Terminal tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
          {filteredOrders.map(order => {
            const elapsedMins = getElapsedMinutes(order.createdAt);
            const isCompleted = order.status === 'delivered' || order.status === 'cancelled';
            const isFoodDeliveredToGuest = order.status === 'served' || order.status === 'ready' || order.status === 'out_for_delivery';
            // Overdue warning ONLY triggers if guests are still waiting for unserved food from kitchen!
            const isOverdue = !isCompleted && !isFoodDeliveredToGuest && elapsedMins >= 15;
            const isWarning = !isCompleted && !isFoodDeliveredToGuest && elapsedMins >= 10 && elapsedMins < 15;

            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border shadow-apple-sm flex flex-col justify-between space-y-4 hover:shadow-apple-md transition-all ${
                  isOverdue 
                    ? 'border-apple-red/50 ring-2 ring-apple-red/20 dark:ring-apple-red/30' 
                    : isWarning 
                    ? 'border-amber-400/50 ring-1 ring-amber-400/20' 
                    : order.status === 'served'
                    ? 'border-apple-green/30 ring-1 ring-apple-green/10'
                    : 'border-black/5 dark:border-white/5'
                }`}
              >
                {/* Overdue Banner if food is cooking in kitchen for > 15 mins */}
                {isOverdue && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-apple-red/15 text-apple-red text-xs font-bold flex items-center justify-between gap-2 whitespace-nowrap animate-pulse">
                    <span className="flex items-center gap-1.5 truncate">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Kitchen Delay: Waiting {elapsedMins} mins for Food!
                    </span>
                    <span className="text-[10px] uppercase font-black shrink-0 px-1.5 py-0.5 rounded bg-apple-red text-white">Check Cooks</span>
                  </div>
                )}

                {/* Card Top: Tier 1 - Token, Status/Timer, Total Price */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
                      <span className="text-xl font-black text-neutral-900 dark:text-neutral-100 whitespace-nowrap tracking-tight">
                        {order.token}
                      </span>

                      {/* Quick Edit Badge & Trigger */}
                      {order.paymentStatus === 'pending' && onSaveOrder && (
                        <button
                          onClick={() => handleOpenEditOrder(order)}
                          className="px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                          title="Edit items, change quantities or details before bill settlement"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      
                      {/* Kitchen / Food Delivery Status Badge */}
                      {order.type === 'dine_in' && !isCompleted && (
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap shrink-0 ${
                          order.status === 'served' 
                            ? 'bg-apple-green/15 text-apple-green border border-apple-green/20' 
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.status === 'served' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-apple-green" />
                              <span>Served</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>In Kitchen</span>
                            </>
                          )}
                        </span>
                      )}

                      {order.type === 'takeaway' && !isCompleted && (
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap shrink-0 ${
                          order.status === 'ready'
                            ? 'bg-apple-blue/15 text-apple-blue border border-apple-blue/20'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{order.status === 'ready' ? 'Ready' : 'Packaging'}</span>
                        </span>
                      )}

                      {/* Live elapsed timer badge */}
                      {!isCompleted ? (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap shrink-0 ${
                          isOverdue 
                            ? 'bg-apple-red text-white' 
                            : isWarning 
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' 
                            : order.status === 'served'
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            : 'bg-apple-green/15 text-apple-green'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{elapsedMins}m ago</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 whitespace-nowrap shrink-0">
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Total Price */}
                    <div className="text-right whitespace-nowrap shrink-0">
                      <span className="text-xl font-black text-apple-blue">
                        {currency} {order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Top: Tier 2 - Channel/Table & Payment Status in One Clean Row */}
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-neutral-500 pt-0.5">
                    <div className="flex items-center gap-1.5 whitespace-nowrap uppercase">
                      {order.type === 'dine_in' && <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />}
                      {order.type === 'takeaway' && <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />}
                      {order.type === 'delivery' && <Bike className="w-3.5 h-3.5 text-indigo-600" />}
                      <span>{order.type.replace('_', ' ')}</span>
                      {order.tableNumber && (
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          • TABLE {order.tableNumber}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-bold uppercase whitespace-nowrap shrink-0">
                      {order.paymentStatus === 'paid' ? (
                        <span className="text-apple-green font-bold">PAID</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">
                          UNPAID • {order.type === 'dine_in' ? 'PAY AT COUNTER' : order.type === 'takeaway' ? 'PAY ON PICKUP' : 'COD'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-1 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between font-medium text-neutral-800 dark:text-neutral-200">
                      <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                      <span className="text-neutral-500 whitespace-nowrap shrink-0">{currency} {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Customer info if delivery */}
                {order.customer && (
                  <div className="text-xs text-neutral-500 space-y-0.5">
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap truncate">
                      {order.customer.name || 'Delivery Customer'} {order.customer.phone && `(${order.customer.phone})`}
                    </div>
                    {order.customer.address && (
                      <div className="text-[11px] truncate">{order.customer.address}</div>
                    )}
                  </div>
                )}

                {/* Action Buttons: Clean 1 Line, Never squished */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                  <div className="text-xs text-neutral-400 flex items-center gap-1 whitespace-nowrap shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* 1. Dine-In: Mark Served */}
                    {order.type === 'dine_in' && order.status !== 'served' && !isCompleted && (
                      <button
                        onClick={() => {
                          sound.playSuccess();
                          onUpdateStatus(order.id, 'served');
                        }}
                        className="apple-button px-3 py-1.5 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-bold shadow-apple-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        title="Waiter served food to table. Clears kitchen delay warning."
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>Mark Served</span>
                      </button>
                    )}

                    {/* 2. Takeaway: Mark Ready */}
                    {order.type === 'takeaway' && order.status !== 'ready' && !isCompleted && (
                      <button
                        onClick={() => {
                          sound.playSuccess();
                          onUpdateStatus(order.id, 'ready');
                        }}
                        className="apple-button px-3 py-1.5 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-bold shadow-apple-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        title="Food packaged and ready for pickup at counter"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    )}

                    {/* 3. Print Kitchen Slip (KOT) */}
                    {!isCompleted && (
                      <button
                        onClick={() => handlePrintKOT(order)}
                        className="apple-button px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1 text-neutral-700 dark:text-neutral-300 whitespace-nowrap shrink-0"
                        title="Print Kitchen Slip to send upstairs to cooks"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>KOT Slip</span>
                      </button>
                    )}

                    {/* 5. Settle Bill Button */}
                    {order.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handleOpenSettleModal(order)}
                        className="apple-button px-3.5 py-1.5 rounded-xl bg-apple-green hover:bg-apple-green-hover text-white text-xs font-bold shadow-apple-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        title="Collect payment at counter and complete order"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>
                          {order.type === 'dine_in' 
                            ? 'Settle Bill' 
                            : order.type === 'takeaway' 
                            ? 'Settle & Handover' 
                            : 'Settle COD'}
                        </span>
                      </button>
                    )}

                    {/* 5. Delivery Dispatch Action */}
                    {order.type === 'delivery' && order.status !== 'out_for_delivery' && order.status !== 'delivered' && (
                      <button
                        onClick={() => {
                          sound.playTap();
                          onUpdateStatus(order.id, 'out_for_delivery');
                        }}
                        className="apple-button px-3 py-1.5 rounded-xl bg-apple-indigo hover:bg-indigo-600 text-white text-xs font-bold shadow-apple-sm transition-all flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Dispatch</span>
                      </button>
                    )}

                    {/* 6. Customer Receipt Reprint */}
                    <button
                      onClick={() => {
                        sound.playTap();
                        onViewReceipt(order);
                      }}
                      className="apple-button p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 whitespace-nowrap shrink-0"
                      title="View / Print Customer Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- SETTLE BILL & CHECKOUT MODAL --- */}
      {settleModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/10 dark:border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/80">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-apple-green" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    Settle Bill — {settleModalOrder.token}
                  </h3>
                  <p className="text-[11px] text-neutral-500 uppercase">
                    {settleModalOrder.type.replace('_', ' ')} 
                    {settleModalOrder.tableNumber && ` • TABLE ${settleModalOrder.tableNumber}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettleModalOrder(null)}
                className="w-8 h-8 rounded-full bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Order Items Review */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 text-xs">
                {settleModalOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-neutral-800 dark:text-neutral-200">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">{currency} {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-2xl bg-apple-blue/10 dark:bg-apple-blue/15 border border-apple-blue/20 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Total Due</span>
                  {settleModalOrder.discount > 0 && (
                    <span className="block text-[10px] text-apple-green font-bold">
                      Discount: -{currency} {settleModalOrder.discount}
                    </span>
                  )}
                </div>
                <span className="text-2xl font-black text-apple-blue">
                  {currency} {settleModalOrder.total.toLocaleString()}
                </span>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setSettlePaymentMethod('cash');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      settlePaymentMethod === 'cash'
                        ? 'bg-apple-green text-white border-apple-green shadow-sm'
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setSettlePaymentMethod('card');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      settlePaymentMethod === 'card'
                        ? 'bg-apple-blue text-white border-apple-blue shadow-sm'
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / POS</span>
                  </button>
                </div>
              </div>

              {/* Cash Tendered & Change Calculator */}
              {settlePaymentMethod === 'cash' && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl space-y-2 border border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Cash Received:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-neutral-500">{currency}</span>
                      <input
                        type="number"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="w-24 text-right font-extrabold text-sm px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick Tender Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setCashTendered(settleModalOrder.total.toString())}
                      className="px-2 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-[10px] font-bold text-neutral-700 dark:text-neutral-300"
                    >
                      Exact
                    </button>
                    {[1000, 2000, 5000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashTendered(amt.toString())}
                        className="px-2 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-[10px] font-bold text-neutral-700 dark:text-neutral-300"
                      >
                        {amt}
                      </button>
                    ))}
                  </div>

                  {/* Change Due Display */}
                  {Number(cashTendered) >= settleModalOrder.total && (
                    <div className="flex justify-between items-baseline pt-1 border-t border-black/5 dark:border-white/5 text-xs font-bold text-apple-green">
                      <span>Change to Return:</span>
                      <span className="text-sm">
                        {currency} {(Number(cashTendered) - settleModalOrder.total).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleConfirmSettlement}
                disabled={isSettling}
                className="w-full apple-button py-3.5 rounded-2xl bg-gradient-to-r from-apple-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm shadow-apple-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment &amp; Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- KITCHEN SLIP (KOT) PREVIEW & PRINT MODAL --- */}
      {kotModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/10 dark:border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Kitchen Slip (KOT)
                </h3>
              </div>
              <button
                onClick={() => setKotModalOrder(null)}
                className="w-8 h-8 rounded-full bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kitchen Slip Paper View */}
            <div className="p-5 bg-neutral-100 dark:bg-neutral-950 flex justify-center">
              <div className="w-full max-w-[72mm] bg-white text-black p-4 font-mono text-xs shadow-apple-sm rounded-xl space-y-2 border border-neutral-300">
                <div className="text-center border-b-2 border-dashed border-black pb-2">
                  <h4 className="font-black text-sm uppercase tracking-wider">*** KITCHEN SLIP ***</h4>
                  <div className="text-xl font-black mt-0.5">{kotModalOrder.token}</div>
                  <div className="text-[11px] font-bold uppercase mt-0.5">
                    {kotModalOrder.type.replace('_', ' ')}
                    {kotModalOrder.tableNumber && ` • TABLE ${kotModalOrder.tableNumber}`}
                  </div>
                  <div className="text-[10px] text-neutral-600 mt-0.5">
                    Time: {new Date(kotModalOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="space-y-2 py-2 border-b-2 border-dashed border-black">
                  {kotModalOrder.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between font-black text-sm">
                        <span>{item.quantity}x {item.name}</span>
                      </div>
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="text-[10px] text-neutral-700 pl-3">
                          {item.selectedModifiers.map(m => m.choiceName).join(', ')}
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] font-bold text-red-600 pl-3">
                          NOTE: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center text-[10px] font-bold pt-1">
                  Total Items: {kotModalOrder.items.reduce((sum, i) => sum + i.quantity, 0)}
                  <div className="text-[9px] text-neutral-500 font-normal">HFC Kitchen Dispatch Slip</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
              <button
                onClick={() => setKotModalOrder(null)}
                className="apple-button px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>
              <button
                onClick={handleExecuteKOTPrint}
                className="flex-1 apple-button py-2.5 px-4 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Kitchen Slip (Send to Kitchen)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT ORDER MODAL (PRE-PAYMENT) --- */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/10 dark:border-white/10 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <span>Edit Order</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue font-bold">
                      {editingOrder.token}
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Modify items, quantities, table or customer before bill payment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="w-8 h-8 rounded-full bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* 1. Items in this Order */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Order Items ({editItems.reduce((acc, i) => acc + i.quantity, 0)})
                  </h4>
                  <span className="text-[11px] text-neutral-400">Tap + / - to adjust quantity</span>
                </div>

                <div className="divide-y divide-black/5 dark:divide-white/5 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden bg-neutral-50/60 dark:bg-neutral-900/40">
                  {editItems.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-neutral-800 dark:text-neutral-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-medium">
                          {currency} {item.price.toLocaleString()} each
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <span className="ml-1 text-neutral-500 italic">
                              ({item.selectedModifiers.map(m => m.choiceName).join(', ')})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(idx, -1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-xs"
                          title="Decrease Quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-black text-xs text-neutral-900 dark:text-neutral-100">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(idx, 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-xs"
                          title="Increase Quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total & Delete */}
                      <div className="text-right flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-xs text-neutral-900 dark:text-neutral-100 w-20 text-right">
                          {currency} {(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-neutral-400 hover:text-apple-red transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Remove item from order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {editItems.length === 0 && (
                    <div className="p-6 text-center text-xs text-neutral-400 italic">
                      No items in order. Search below to add items.
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Add More Items from Catalog */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Add Items from Menu Catalog
                  </h4>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search burgers, broast, drinks to add..."
                    className="w-full pl-8 pr-3 py-2 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-xs placeholder:text-neutral-400 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 border border-black/5 dark:border-white/5"
                  />
                </div>

                {/* Filtered Catalog Items Grid */}
                <div className="max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
                  {menuItems
                    .filter(m => m.isAvailable !== false)
                    .filter(m => {
                      if (!catalogSearch.trim()) return true;
                      const q = catalogSearch.toLowerCase();
                      return m.name.toLowerCase().includes(q) || m.categoryName?.toLowerCase().includes(q);
                    })
                    .slice(0, 8)
                    .map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleAddItemFromCatalog(m)}
                        className="apple-button p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 hover:border-apple-blue/50 flex items-center justify-between text-left text-xs transition-all shadow-xs group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-apple-blue">
                            {m.name}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {currency} {m.price.toLocaleString()}
                          </div>
                        </div>
                        <span className="shrink-0 px-2 py-1 rounded-lg bg-apple-blue/10 text-apple-blue font-bold text-[10px] group-hover:bg-apple-blue group-hover:text-white transition-all flex items-center gap-0.5">
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              {/* 3. Order Details: Type, Table, Delivery, Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                {/* Order Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Order Channel</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'dine_in', label: 'Dine In' },
                      { id: 'takeaway', label: 'Takeaway' },
                      { id: 'delivery', label: 'Delivery' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          setEditType(t.id as OrderType);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          editType === t.id
                            ? 'bg-apple-blue text-white shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table or Delivery Information */}
                {editType === 'dine_in' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Assigned Table</label>
                    <select
                      value={editTable}
                      onChange={(e) => setEditTable(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 focus:outline-none"
                    >
                      <option value="">Select Table...</option>
                      {tables.map(tbl => (
                        <option key={tbl.id} value={tbl.number}>
                          Table {tbl.number} ({tbl.zone.replace('_', ' ')} • {tbl.capacity}P)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : editType === 'delivery' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Customer Name &amp; Phone</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={editCustomer.name}
                        onChange={(e) => setEditCustomer(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={editCustomer.phone}
                        onChange={(e) => setEditCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-28 px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Takeaway Pickup</label>
                    <div className="text-xs text-neutral-500 py-1.5">
                      Customer picks up order at restaurant front counter.
                    </div>
                  </div>
                )}

                {/* Discount */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Discount Amount ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={editDiscount === 0 ? '' : editDiscount}
                    onChange={(e) => setEditDiscount(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer: Live Totals & Save Actions */}
            <div className="p-4 border-t border-black/5 dark:border-white/10 bg-neutral-50/90 dark:bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-baseline gap-3 text-xs w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-neutral-500">
                  Subtotal: <strong>{currency} {editSubtotal.toLocaleString()}</strong>
                </span>
                {editDiscount > 0 && (
                  <span className="text-apple-green font-bold">
                    Disc: -{currency} {editDiscount.toLocaleString()}
                  </span>
                )}
                {editTax > 0 && (
                  <span className="text-neutral-500">
                    Tax: {currency} {editTax.toLocaleString()}
                  </span>
                )}
                <div className="text-base font-black text-apple-blue pl-2 border-l border-neutral-300 dark:border-neutral-700">
                  {currency} {editTotal.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEditedOrder(false)}
                  disabled={isSavingEdit || editItems.length === 0}
                  className="flex-1 sm:flex-initial apple-button py-2.5 px-4 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEditedOrder(true)}
                  disabled={isSavingEdit || editItems.length === 0}
                  className="apple-button py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200 font-bold text-xs shadow-xs flex items-center justify-center gap-1"
                  title="Save and print updated KOT slip for kitchen cooks"
                >
                  <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                  <span>Save &amp; KOT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
