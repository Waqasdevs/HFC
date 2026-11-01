'use client';

import React, { useState } from 'react';
import type { Table, Order, PaymentMethod } from '@/types';
import { 
  Users, 
  Clock, 
  UtensilsCrossed, 
  CheckCircle2, 
  Bookmark,
  Receipt,
  Plus,
  Pencil,
  Trash2,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';

interface TableGridProps {
  tables: Table[];
  activeOrders: Order[];
  currency: string;
  onSelectTableForOrder: (tableNumber: string) => void;
  onUpdateTableStatus: (tableId: string, status: Table['status']) => void;
  onViewOrderReceipt: (order: Order) => void;
  onAddTable: (table: Omit<Table, 'id'>) => Promise<void> | void;
  onUpdateTableDetails: (table: Table) => Promise<void> | void;
  onDeleteTable: (tableId: string) => Promise<void> | void;
  onSettleBill: (orderId: string, tableId: string, paymentMethod: PaymentMethod) => Promise<void> | void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables,
  activeOrders,
  currency,
  onSelectTableForOrder,
  onUpdateTableStatus,
  onViewOrderReceipt,
  onAddTable,
  onUpdateTableDetails,
  onDeleteTable,
  onSettleBill,
  onUpdateOrderStatus,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  
  // Table Modal (Add / Edit)
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableFormData, setTableFormData] = useState<{
    number: string;
    zone: 'indoor' | 'terrace' | 'vip_family';
    capacity: number;
  }>({
    number: '',
    zone: 'indoor',
    capacity: 4,
  });

  // Settle Bill Modal
  const [settleModalData, setSettleModalData] = useState<{
    table: Table;
    order: Order;
  } | null>(null);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [isSettling, setIsSettling] = useState(false);

  const zones = [
    { id: 'all', label: 'All Tables' },
    { id: 'indoor', label: 'Indoor Hall' },
    { id: 'terrace', label: 'Terrace & Outdoor' },
    { id: 'vip_family', label: 'VIP Family Rooms' },
  ];

  const filteredTables = selectedZone === 'all' 
    ? tables 
    : tables.filter(t => t.zone === selectedZone);

  // Stats
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const availableTables = tables.filter(t => t.status === 'available').length;

  const handleOpenAddModal = () => {
    sound.playTap();
    setEditingTable(null);
    // Suggest next table number (e.g. T-11)
    const nextNum = `T-${(tables.length + 1).toString().padStart(2, '0')}`;
    setTableFormData({
      number: nextNum,
      zone: 'indoor',
      capacity: 4,
    });
    setIsTableModalOpen(true);
  };

  const handleOpenEditModal = (table: Table) => {
    sound.playTap();
    setEditingTable(table);
    setTableFormData({
      number: table.number,
      zone: table.zone,
      capacity: table.capacity,
    });
    setIsTableModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableFormData.number.trim()) {
      sound.playAlert();
      alert('Please enter a valid Table Number or Label');
      return;
    }

    // Check duplicate table number
    const duplicate = tables.find(
      t => t.number.trim().toLowerCase() === tableFormData.number.trim().toLowerCase() &&
           t.id !== editingTable?.id
    );
    if (duplicate) {
      sound.playAlert();
      alert(`A table with number "${tableFormData.number}" already exists!`);
      return;
    }

    sound.playSuccess();
    if (editingTable) {
      await onUpdateTableDetails({
        ...editingTable,
        number: tableFormData.number.trim().toUpperCase(),
        zone: tableFormData.zone,
        capacity: Number(tableFormData.capacity) || 4,
      });
    } else {
      await onAddTable({
        number: tableFormData.number.trim().toUpperCase(),
        zone: tableFormData.zone,
        capacity: Number(tableFormData.capacity) || 4,
        status: 'available',
      });
    }

    setIsTableModalOpen(false);
  };

  const handleDeleteTableClick = async (table: Table) => {
    sound.playTap();
    if (table.status === 'occupied') {
      sound.playAlert();
      alert(`Cannot delete Table ${table.number} while it is occupied with an active order! Please settle the bill first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete Table ${table.number}?`)) {
      sound.playSuccess();
      await onDeleteTable(table.id);
    }
  };

  const handleOpenSettleModal = (table: Table, order: Order) => {
    sound.playTap();
    setSettleModalData({ table, order });
    setSettlePaymentMethod('cash');
    setCashTendered(order.total.toString());
  };

  const handleConfirmSettlement = async () => {
    if (!settleModalData || isSettling) return;
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

    await onSettleBill(settleModalData.order.id, settleModalData.table.id, settlePaymentMethod);
    setIsSettling(false);
    setSettleModalData(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Dining Floor Management
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Monitor real-time table occupancy, take dine-in orders, and settle customer bills at the counter
          </p>
        </div>

        {/* Status Metrics & Add Table Button */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 shadow-apple-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-green"></span>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {availableTables} Vacant
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 shadow-apple-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-orange"></span>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {occupiedTables} Occupied
            </span>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="apple-button px-4 py-2 rounded-2xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Zone Segmented Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {zones.map(z => (
          <button
            key={z.id}
            onClick={() => {
              sound.playTap();
              setSelectedZone(z.id);
            }}
            className={`apple-button px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              selectedZone === z.id
                ? 'bg-apple-blue text-white shadow-apple-sm'
                : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-white'
            }`}
          >
            {z.label}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {filteredTables.map(table => {
          const tableOrder = activeOrders.find(
            o => o.tableNumber === table.number && o.status !== 'delivered' && o.status !== 'cancelled'
          );

          const isOccupied = table.status === 'occupied' || !!tableOrder;
          const isBilled = table.status === 'billed';
          const isReserved = table.status === 'reserved';

          let statusBg = 'bg-apple-green/10 text-apple-green border-apple-green/20';
          let statusLabel = 'Available';
          if (isOccupied) {
            statusBg = 'bg-apple-orange/15 text-apple-orange border-apple-orange/30';
            statusLabel = 'Occupied';
          } else if (isBilled) {
            statusBg = 'bg-apple-blue/15 text-apple-blue border-apple-blue/30';
            statusLabel = 'Bill Printed';
          } else if (isReserved) {
            statusBg = 'bg-apple-purple/15 text-apple-purple border-apple-purple/30';
            statusLabel = 'Reserved';
          }

          return (
            <div
              key={table.id}
              className={`bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border shadow-apple-sm flex flex-col justify-between space-y-4 hover:shadow-apple-md transition-all ${
                isOccupied 
                  ? 'border-apple-orange/30 ring-1 ring-apple-orange/10' 
                  : 'border-black/5 dark:border-white/5'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xl text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {table.number}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(table)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                        title="Edit Table Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTableClick(table)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-apple-red transition-colors"
                        title="Delete Table"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1 whitespace-nowrap">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>{table.capacity} Persons</span>
                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                    <span className="capitalize">{table.zone.replace('_', ' ')}</span>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${statusBg}`}>
                  {statusLabel}
                </span>
              </div>

              {/* Order summary if occupied */}
              {tableOrder ? (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-1.5 border border-black/5 dark:border-white/5">
                  <div className="flex justify-between items-center text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    <span>{tableOrder.token}</span>
                    <span className="text-apple-blue font-extrabold">{currency} {tableOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 line-clamp-1">
                    {tableOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-0.5">
                    <div className="text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(tableOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] uppercase ${
                      tableOrder.status === 'served' 
                        ? 'bg-apple-green/15 text-apple-green' 
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {tableOrder.status === 'served' ? 'Food Served (Dining)' : 'Cooking in Kitchen'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-16 flex items-center justify-center text-xs text-neutral-400 italic bg-neutral-50/50 dark:bg-neutral-800/20 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                  Ready for Guests
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {!isOccupied ? (
                  <>
                    <button
                      onClick={() => {
                        sound.playTap();
                        onSelectTableForOrder(table.number);
                      }}
                      className="flex-1 apple-button py-2 px-3 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Take Order</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playTap();
                        onUpdateTableStatus(table.id, isReserved ? 'available' : 'reserved');
                      }}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
                      title={isReserved ? 'Clear Reservation' : 'Reserve Table'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Mark Served quick trigger if food was just delivered to table */}
                    {tableOrder && tableOrder.status !== 'served' && onUpdateOrderStatus && (
                      <button
                        onClick={() => {
                          sound.playSuccess();
                          onUpdateOrderStatus(tableOrder.id, 'served');
                        }}
                        className="apple-button py-2 px-2.5 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm transition-all flex items-center gap-1 whitespace-nowrap shrink-0"
                        title="Mark food as served to table"
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>Served</span>
                      </button>
                    )}

                    {tableOrder && (
                      <button
                        onClick={() => handleOpenSettleModal(table, tableOrder)}
                        className="flex-1 apple-button py-2 px-3 rounded-xl bg-apple-green hover:bg-apple-green-hover text-white font-bold text-xs shadow-apple-sm transition-all flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
                        title="Collect payment at counter and free table"
                      >
                        <Banknote className="w-3.5 h-3.5 mr-0.5" />
                        <span>Settle Bill</span>
                      </button>
                    )}
                    {tableOrder && (
                      <button
                        onClick={() => {
                          sound.playTap();
                          onViewOrderReceipt(tableOrder);
                        }}
                        className="apple-button p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-all whitespace-nowrap shrink-0"
                        title="Print Running KOT / Bill"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        sound.playTap();
                        onUpdateTableStatus(table.id, 'available');
                      }}
                      className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 whitespace-nowrap shrink-0"
                      title="Clear Table Without Billing"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- ADD / EDIT TABLE MODAL --- */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/10 dark:border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                {editingTable ? `Edit Table: ${editingTable.number}` : 'Add New Dining Table'}
              </h3>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Table Number / Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-11 or VIP-03"
                  value={tableFormData.number}
                  onChange={(e) => setTableFormData({ ...tableFormData, number: e.target.value })}
                  className="w-full text-sm font-bold bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-apple-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Floor Zone / Section
                </label>
                <select
                  value={tableFormData.zone}
                  onChange={(e) => setTableFormData({ ...tableFormData, zone: e.target.value as any })}
                  className="w-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 focus:outline-none"
                >
                  <option value="indoor">Indoor Hall</option>
                  <option value="terrace">Terrace &amp; Outdoor</option>
                  <option value="vip_family">VIP Family Rooms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Seating Capacity (Guests)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={tableFormData.capacity}
                  onChange={(e) => setTableFormData({ ...tableFormData, capacity: Number(e.target.value) || 2 })}
                  className="w-full text-sm font-bold bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="apple-button px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-button px-5 py-2.5 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm transition-all"
                >
                  {editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SETTLE BILL & CHECKOUT MODAL --- */}
      {settleModalData && (
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
                    Settle Table Bill — {settleModalData.table.number}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Token: {settleModalData.order.token} • {settleModalData.order.items.reduce((s, i) => s + i.quantity, 0)} items
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettleModalData(null)}
                className="w-8 h-8 rounded-full bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Order Items Review */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 text-xs">
                {settleModalData.order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-neutral-800 dark:text-neutral-200">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">{currency} {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-2xl bg-apple-blue/10 dark:bg-apple-blue/15 border border-apple-blue/20 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Total Payable</span>
                  {settleModalData.order.discount > 0 && (
                    <span className="block text-[10px] text-apple-green font-bold">
                      Discount applied: -{currency} {settleModalData.order.discount}
                    </span>
                  )}
                </div>
                <span className="text-2xl font-black text-apple-blue">
                  {currency} {settleModalData.order.total.toLocaleString()}
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

              {/* Cash Tendered Calculator (if cash) */}
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
                      onClick={() => setCashTendered(settleModalData.order.total.toString())}
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

                  {/* Change Due */}
                  {Number(cashTendered) >= settleModalData.order.total && (
                    <div className="flex justify-between items-baseline pt-1 border-t border-black/5 dark:border-white/5 text-xs font-bold text-apple-green">
                      <span>Change to Return:</span>
                      <span className="text-sm">
                        {currency} {(Number(cashTendered) - settleModalData.order.total).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Confirmation Button */}
              <button
                type="button"
                onClick={handleConfirmSettlement}
                disabled={isSettling}
                className="w-full apple-button py-3.5 rounded-2xl bg-gradient-to-r from-apple-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm shadow-apple-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment, Free Table &amp; Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
