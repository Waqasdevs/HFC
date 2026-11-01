'use client';

import React from 'react';
import type { Order } from '@/types';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  UtensilsCrossed, 
  Bike, 
  CreditCard, 
  Banknote,
  Calendar,
  Receipt
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface SalesAnalyticsProps {
  orders: Order[];
  currency: string;
  onViewReceipt: (order: Order) => void;
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({
  orders,
  currency,
  onViewReceipt,
}) => {
  const completedOrders = orders.filter(o => o.status !== 'cancelled');
  
  // High-level KPIs
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = completedOrders.length;
  const averageTicket = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Order Type Breakdown
  const dineInCount = completedOrders.filter(o => o.type === 'dine_in').length;
  const takeawayCount = completedOrders.filter(o => o.type === 'takeaway').length;
  const deliveryCount = completedOrders.filter(o => o.type === 'delivery').length;

  const dineInRevenue = completedOrders.filter(o => o.type === 'dine_in').reduce((s, o) => s + o.total, 0);
  const takeawayRevenue = completedOrders.filter(o => o.type === 'takeaway').reduce((s, o) => s + o.total, 0);
  const deliveryRevenue = completedOrders.filter(o => o.type === 'delivery').reduce((s, o) => s + o.total, 0);

  // Payment Breakdown
  const cashTotal = completedOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0);
  const cardTotal = completedOrders.filter(o => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0);

  // Top Selling Items Aggregation
  const itemCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      itemCounts[item.name].quantity += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });

  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-green/15 text-apple-green flex items-center justify-center">
            <BarChart3 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Restaurant Analytics &amp; Reports
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Live gross revenue, channel performance, and best-selling menu analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 shadow-apple-sm text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>Today's Business Summary</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Gross Revenue</span>
          <div className="text-3xl font-black text-neutral-900 dark:text-neutral-100 mt-2">
            {currency} {totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-apple-green font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across all 3 dining channels</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Orders</span>
          <div className="text-3xl font-black text-neutral-900 dark:text-neutral-100 mt-2">
            {totalOrdersCount} Tickets
          </div>
          <p className="text-xs text-neutral-500 mt-2">Fulfilled &amp; active orders</p>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Average Ticket Size</span>
          <div className="text-3xl font-black text-apple-blue mt-2">
            {currency} {averageTicket.toLocaleString()}
          </div>
          <p className="text-xs text-neutral-500 mt-2">Revenue per completed order</p>
        </div>
      </div>

      {/* Breakdown by Dining Channel & Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Revenue by Channel</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-apple-blue" />
                  Dine-In ({dineInCount} orders)
                </span>
                <span className="font-bold">{currency} {dineInRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-apple-blue rounded-full transition-all duration-500" 
                  style={{ width: `${totalRevenue > 0 ? (dineInRevenue / totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <ShoppingBag className="w-3.5 h-3.5 text-apple-orange" />
                  Takeaway ({takeawayCount} orders)
                </span>
                <span className="font-bold">{currency} {takeawayRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-apple-orange rounded-full transition-all duration-500" 
                  style={{ width: `${totalRevenue > 0 ? (takeawayRevenue / totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Bike className="w-3.5 h-3.5 text-apple-indigo" />
                  Home Delivery ({deliveryCount} orders)
                </span>
                <span className="font-bold">{currency} {deliveryRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-apple-indigo rounded-full transition-all duration-500" 
                  style={{ width: `${totalRevenue > 0 ? (deliveryRevenue / totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Top Items */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Top 5 Selling Items</h3>

          {topItems.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No sales registered yet</p>
          ) : (
            <div className="space-y-2.5">
              {topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-apple-blue">{item.quantity} sold</span>
                    <div className="text-[10px] text-neutral-400">{currency} {item.revenue.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-apple-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 dark:border-white/5">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">All Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold uppercase tracking-wider border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="px-5 py-3">Token #</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Items Summary</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {orders.slice(0, 10).map(order => (
                <tr key={order.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-black text-neutral-900 dark:text-neutral-100">{order.token}</td>
                  <td className="px-4 py-3.5 uppercase font-bold text-[11px] text-neutral-600 dark:text-neutral-400">
                    {order.type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3.5 text-neutral-500 max-w-xs truncate">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-neutral-900 dark:text-neutral-100">
                    {currency} {order.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 uppercase font-semibold text-apple-green text-[11px]">
                    {order.paymentMethod}
                  </td>
                  <td className="px-4 py-3.5 text-neutral-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => {
                        sound.playTap();
                        onViewReceipt(order);
                      }}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-apple-blue hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Reprint Receipt"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
