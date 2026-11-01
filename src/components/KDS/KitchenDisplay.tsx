'use client';

import React, { useState, useEffect } from 'react';
import type { Order } from '@/types';
import { 
  Flame, 
  Clock, 
  CheckCircle, 
  UtensilsCrossed, 
  Bike, 
  ShoppingBag,
  AlertTriangle,
  Volume2
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface KitchenDisplayProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  orders,
  onUpdateOrderStatus,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [, setTick] = useState(0);

  // Re-render every 10 seconds to update live elapsed order timers
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const kitchenOrders = orders.filter(
    o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  );

  const toggleCheck = (itemKey: string) => {
    sound.playTap();
    setCheckedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const getElapsedMinutes = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* KDS Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-orange/15 text-apple-orange flex items-center justify-center">
            <Flame className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Kitchen Display System (KDS)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Live fry &amp; grill tickets with real-time timers and modifier alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-apple-orange/15 text-apple-orange flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-apple-orange animate-pulse"></span>
            {kitchenOrders.length} Active Tickets
          </span>
          <button
            onClick={() => sound.playKitchenBell()}
            className="apple-button px-3.5 py-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 flex items-center gap-1.5"
            title="Test Bell Chime"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Bell</span>
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
          <CheckCircle className="w-14 h-14 stroke-[1.2] text-apple-green mb-3" />
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">Kitchen All Caught Up!</h3>
          <p className="text-xs text-neutral-400 mt-1">No pending orders. New orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {kitchenOrders.map(order => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isLate = elapsed >= 15;
            const isWarning = elapsed >= 8 && elapsed < 15;

            let timerColor = 'text-apple-green bg-apple-green/10';
            if (isLate) timerColor = 'text-white bg-apple-red animate-pulse';
            else if (isWarning) timerColor = 'text-apple-orange bg-apple-orange/10';

            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-[#1C1C1E] rounded-3xl border shadow-apple-sm flex flex-col justify-between overflow-hidden transition-all ${
                  isLate 
                    ? 'border-apple-red shadow-apple-md ring-2 ring-apple-red/20' 
                    : 'border-black/10 dark:border-white/10'
                }`}
              >
                {/* Ticket Header */}
                <div className="p-4 border-b border-black/5 dark:border-white/5 bg-neutral-50/80 dark:bg-neutral-900/80 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-neutral-900 dark:text-neutral-100">
                      {order.token}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase mt-0.5">
                      {order.type === 'dine_in' && <UtensilsCrossed className="w-3.5 h-3.5" />}
                      {order.type === 'takeaway' && <ShoppingBag className="w-3.5 h-3.5" />}
                      {order.type === 'delivery' && <Bike className="w-3.5 h-3.5" />}
                      <span>
                        {order.type.replace('_', ' ')}
                        {order.tableNumber && ` • Table ${order.tableNumber}`}
                      </span>
                    </div>
                  </div>

                  {/* Timer Badge */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${timerColor}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsed}m</span>
                  </div>
                </div>

                {/* Items Checklist for Chef */}
                <div className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-72">
                  {order.items.map((item, idx) => {
                    const itemKey = `${order.id}-${idx}`;
                    const isChecked = !!checkedItems[itemKey];

                    return (
                      <div
                        key={itemKey}
                        onClick={() => toggleCheck(itemKey)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-neutral-100/60 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 opacity-50 line-through'
                            : 'bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 shadow-apple-sm'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-black flex items-center justify-center shrink-0">
                          {item.quantity}
                        </span>
                        <div className="flex-1">
                          <div className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">
                            {item.name}
                          </div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <div className="text-[11px] font-bold text-apple-orange mt-0.5">
                              {item.selectedModifiers.map(m => m.choiceName).join(' • ')}
                            </div>
                          )}
                          {item.notes && (
                            <div className="text-[10px] font-semibold text-neutral-500 italic mt-0.5">
                              Note: {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Advancement Button */}
                <div className="p-3 border-t border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/50">
                  {order.status === 'pending' ? (
                    <button
                      onClick={() => {
                        sound.playTap();
                        onUpdateOrderStatus(order.id, 'preparing');
                      }}
                      className="w-full apple-button py-2.5 rounded-2xl bg-apple-orange hover:bg-orange-600 text-white font-bold text-xs shadow-apple-sm transition-all"
                    >
                      <Flame className="w-4 h-4 mr-1.5" />
                      Start Preparing
                    </button>
                  ) : order.status === 'preparing' ? (
                    <button
                      onClick={() => {
                        sound.playSuccess();
                        onUpdateOrderStatus(order.id, 'ready');
                      }}
                      className="w-full apple-button py-2.5 rounded-2xl bg-apple-green hover:bg-apple-green-hover text-white font-bold text-xs shadow-apple-sm transition-all"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Mark Ready for Pickup / Delivery
                    </button>
                  ) : (
                    <div className="text-center py-2 text-xs font-bold text-apple-green flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Ready at Pass Counter
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
