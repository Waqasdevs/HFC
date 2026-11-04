'use client';

import React from 'react';
import type { MenuItem, StockItem } from '@/types';
import { Plus, AlertCircle } from 'lucide-react';
import { sound } from '@/lib/sound';

interface MenuGridProps {
  items: MenuItem[];
  stockMap: Record<string, StockItem>;
  currency: string;
  onItemClick: (item: MenuItem) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  stockMap,
  currency,
  onItemClick,
}) => {
  if (items.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
        <p className="text-sm font-semibold text-neutral-500">No menu items found</p>
        <p className="text-xs text-neutral-400 mt-1">Try another category or search keyword</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 min-w-0">
      {items.map((item) => {
        const stockItem = item.stockItemId ? stockMap[item.stockItemId] : null;
        const isOutOfStock = stockItem ? stockItem.currentStock <= 0 : false;
        const isLowStock = stockItem ? stockItem.currentStock > 0 && stockItem.currentStock <= stockItem.minThreshold : false;

        return (
          <div
            key={item.id}
            onClick={() => {
              if (isOutOfStock) {
                sound.playAlert();
                return;
              }
              sound.playTap();
              onItemClick(item);
            }}
            className={`group relative bg-white dark:bg-[#1C1C1E] rounded-3xl p-4 border border-black/5 dark:border-white/5 shadow-apple-sm hover:shadow-apple-md transition-all duration-200 flex flex-col justify-between cursor-pointer select-none ${
              isOutOfStock 
                ? 'opacity-50 grayscale cursor-not-allowed' 
                : 'hover:-translate-y-0.5 active:scale-[0.98]'
            }`}
          >
            {/* Stock status indicator pill & Item Number Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {item.itemNumber ? (
                  <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs shrink-0 tracking-tight">
                    #{item.itemNumber}
                  </span>
                ) : null}
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate">
                  {item.categoryName}
                </span>
              </div>
              {isOutOfStock ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-apple-red/10 text-apple-red flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-apple-orange/15 text-apple-orange">
                  Low: {stockItem?.currentStock} {stockItem?.unit} left
                </span>
              ) : null}
            </div>

            {/* Item Title & Description */}
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-apple-blue transition-colors leading-tight">
                {item.name}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Price & Add Action */}
            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-400 mr-1">{currency}</span>
                <span className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
                  {item.price.toLocaleString()}
                </span>
              </div>

              <button
                disabled={isOutOfStock}
                className="w-9 h-9 rounded-2xl bg-apple-blue text-white flex items-center justify-center shadow-apple-sm group-hover:bg-apple-blue-hover transition-colors"
                aria-label={`Add ${item.name} to order`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
