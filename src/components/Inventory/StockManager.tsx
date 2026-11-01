'use client';

import React, { useState } from 'react';
import type { StockItem } from '@/types';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  TrendingDown, 
  DollarSign, 
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface StockManagerProps {
  stockItems: StockItem[];
  currency: string;
  onUpdateStock: (id: string, newStock: number) => void;
  onAddStockItem: (item: Omit<StockItem, 'id' | 'lastRestocked'>) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({
  stockItems,
  currency,
  onUpdateStock,
  onAddStockItem,
}) => {
  const [restockModalItem, setRestockModalItem] = useState<StockItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(10);
  const [showNewItemModal, setShowNewItemModal] = useState(false);

  // New item form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Meat');
  const [newUnit, setNewUnit] = useState<StockItem['unit']>('kg');
  const [newCurrentStock, setNewCurrentStock] = useState(20);
  const [newMinThreshold, setNewMinThreshold] = useState(5);
  const [newCost, setNewCost] = useState(500);

  // Calculations
  const totalValuation = stockItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
  const lowStockItems = stockItems.filter(item => item.currentStock <= item.minThreshold);

  const handleConfirmRestock = () => {
    if (!restockModalItem) return;
    sound.playSuccess();
    onUpdateStock(restockModalItem.id, restockModalItem.currentStock + restockQuantity);
    setRestockModalItem(null);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    sound.playSuccess();
    onAddStockItem({
      name: newName,
      category: newCategory,
      unit: newUnit,
      currentStock: Number(newCurrentStock) || 0,
      minThreshold: Number(newMinThreshold) || 0,
      costPerUnit: Number(newCost) || 0,
    });
    setShowNewItemModal(false);
    setNewName('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-red/15 text-apple-red flex items-center justify-center">
            <Package className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Inventory &amp; Stock Control
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Live ingredient deductions, threshold alerts, and restocking registers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playTap();
              setShowNewItemModal(true);
            }}
            className="apple-button px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs rounded-2xl shadow-apple-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Stock Item
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Stock Value</span>
          <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {currency} {totalValuation.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">{stockItems.length} active tracked items</p>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Low Stock Warnings</span>
          <div className="text-2xl font-black text-apple-red mt-1">
            {lowStockItems.length} Items
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Below minimum reorder threshold</p>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Order Auto-Deduction</span>
          <div className="text-2xl font-black text-apple-green mt-1">
            Active
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Deducts ingredients on POS checkout</p>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-apple-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Stock Inventory List</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold uppercase tracking-wider border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="px-5 py-3">Ingredient / Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Min Threshold</th>
                <th className="px-4 py-3">Unit Cost</th>
                <th className="px-4 py-3">Total Value</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {stockItems.map(item => {
                const isLow = item.currentStock <= item.minThreshold;
                const isOut = item.currentStock <= 0;

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-neutral-900 dark:text-neutral-100">
                      <div className="flex items-center gap-2">
                        {isLow && (
                          <span className="w-2 h-2 rounded-full bg-apple-red"></span>
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-500">{item.category}</td>
                    <td className="px-4 py-3.5 font-extrabold">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${
                        isOut 
                          ? 'bg-apple-red/20 text-apple-red' 
                          : isLow 
                          ? 'bg-apple-orange/20 text-apple-orange' 
                          : 'bg-apple-green/15 text-apple-green'
                      }`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-500 font-medium">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-700 dark:text-neutral-300">
                      {currency} {item.costPerUnit}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-neutral-900 dark:text-neutral-100">
                      {currency} {(item.currentStock * item.costPerUnit).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          sound.playTap();
                          setRestockModalItem(item);
                          setRestockQuantity(10);
                        }}
                        className="apple-button px-3 py-1.5 rounded-xl bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue text-xs font-bold transition-all"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-apple-modal border border-black/5 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Restock {restockModalItem.name}
              </h3>
              <button 
                onClick={() => setRestockModalItem(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Current stock: <strong>{restockModalItem.currentStock} {restockModalItem.unit}</strong>. Enter quantity to add:
            </p>

            <div className="space-y-2">
              <input
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(Number(e.target.value) || 0)}
                className="w-full text-lg font-bold px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-center focus:outline-none focus:ring-2 focus:ring-apple-blue"
              />
              <div className="flex justify-between text-xs text-neutral-400">
                <span>New Total:</span>
                <span className="font-bold text-apple-blue">
                  {restockModalItem.currentStock + restockQuantity} {restockModalItem.unit}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmRestock}
              className="w-full apple-button py-3 rounded-2xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm transition-all"
            >
              Confirm Restock
            </button>
          </div>
        </div>
      )}

      {/* Add New Stock Item Modal */}
      {showNewItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-apple-modal border border-black/5 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Add New Inventory Item
              </h3>
              <button 
                onClick={() => setShowNewItemModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Item Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Fresh Chicken Patties"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Unit</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
                  >
                    <option value="kg">kg</option>
                    <option value="pieces">pieces</option>
                    <option value="liters">liters</option>
                    <option value="packets">packets</option>
                    <option value="cans">cans</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Opening Stock</label>
                  <input
                    type="number"
                    value={newCurrentStock}
                    onChange={(e) => setNewCurrentStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Min Alert</label>
                  <input
                    type="number"
                    value={newMinThreshold}
                    onChange={(e) => setNewMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Unit Cost ({currency})</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full apple-button py-3 rounded-2xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm transition-all"
                >
                  Create Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
