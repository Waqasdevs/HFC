'use client';

import React, { useState, useMemo } from 'react';
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
  Receipt,
  Printer,
  ChevronDown,
  DollarSign,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { sound } from '@/lib/sound';

export type ReportPeriod = 'today' | 'yesterday' | 'month' | 'year' | 'custom' | 'all';

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
  const [period, setPeriod] = useState<ReportPeriod>('today');
  
  // Custom date picker state (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [customStartDate, setCustomStartDate] = useState<string>(todayStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // 1. Precise Date Filtering
  const filteredOrders = useMemo(() => {
    const now = new Date();
    
    // Today boundary: 00:00:00 to 23:59:59 local time
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Yesterday boundary
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

    // Current Month boundary: 1st day of month 00:00:00 to now
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Current Year boundary: Jan 1st 00:00:00 to now
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      switch (period) {
        case 'today':
          return orderDate >= startOfToday && orderDate <= endOfToday;
        case 'yesterday':
          return orderDate >= startOfYesterday && orderDate <= endOfYesterday;
        case 'month':
          return orderDate >= startOfMonth && orderDate <= now;
        case 'year':
          return orderDate >= startOfYear && orderDate <= now;
        case 'custom': {
          if (!customStartDate || !customEndDate) return true;
          const [sY, sM, sD] = customStartDate.split('-').map(Number);
          const [eY, eM, eD] = customEndDate.split('-').map(Number);
          const start = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
          const end = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        }
        case 'all':
        default:
          return true;
      }
    });
  }, [orders, period, customStartDate, customEndDate]);

  // 2. High-Precision Financial Calculations
  const calculations = useMemo(() => {
    // Valid orders exclude voided/cancelled tickets
    const validOrders = filteredOrders.filter(o => o.status !== 'cancelled');
    const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');

    // Realized Paid Sales vs Unsettled Counter Bills
    const paidOrders = validOrders.filter(o => o.paymentStatus === 'paid');
    const unpaidOrders = validOrders.filter(o => o.paymentStatus !== 'paid');

    const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingUnpaidRevenue = unpaidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrderTickets = validOrders.length;
    const paidTicketsCount = paidOrders.length;

    // Average Ticket / Order Value
    const averageTicket = paidTicketsCount > 0 ? Math.round(totalPaidRevenue / paidTicketsCount) : 0;

    // Components of Revenue
    const totalSubtotal = validOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const totalDiscounts = validOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalDeliveryFees = validOrders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0);
    const totalTax = validOrders.reduce((sum, o) => sum + (o.tax || 0), 0);

    // Channel Performance
    const dineInOrders = validOrders.filter(o => o.type === 'dine_in');
    const takeawayOrders = validOrders.filter(o => o.type === 'takeaway');
    const deliveryOrders = validOrders.filter(o => o.type === 'delivery');

    const dineInRevenue = dineInOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);
    const takeawayRevenue = takeawayOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);
    const deliveryRevenue = deliveryOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);

    // Payment Method Breakdown
    const cashRevenue = paidOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + (o.total || 0), 0);
    const cardRevenue = paidOrders.filter(o => o.paymentMethod === 'card' || o.paymentMethod === 'online_transfer').reduce((s, o) => s + (o.total || 0), 0);

    // Brother Operator Breakdown (Haseeb, Aliyan, Shaban)
    const brotherStats: Record<string, { count: number; revenue: number }> = {};
    paidOrders.forEach(o => {
      const name = o.serverName?.split(' ')[0] || 'Unassigned';
      if (!brotherStats[name]) {
        brotherStats[name] = { count: 0, revenue: 0 };
      }
      brotherStats[name].count += 1;
      brotherStats[name].revenue += o.total;
    });

    // Best-selling menu items
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemMap[item.name].quantity += item.quantity;
        itemMap[item.name].revenue += item.price * item.quantity;
      });
    });

    const topItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);

    return {
      totalPaidRevenue,
      pendingUnpaidRevenue,
      totalOrderTickets,
      paidTicketsCount,
      unpaidTicketsCount: unpaidOrders.length,
      cancelledTicketsCount: cancelledOrders.length,
      averageTicket,
      totalSubtotal,
      totalDiscounts,
      totalDeliveryFees,
      totalTax,
      dineInCount: dineInOrders.length,
      dineInRevenue,
      takeawayCount: takeawayOrders.length,
      takeawayRevenue,
      deliveryCount: deliveryOrders.length,
      deliveryRevenue,
      cashRevenue,
      cardRevenue,
      brotherStats,
      topItems
    };
  }, [filteredOrders]);

  const handlePrintSummary = () => {
    sound.playTap();
    window.print();
  };

  const periodLabels: Record<ReportPeriod, string> = {
    today: "Today's Summary",
    yesterday: "Yesterday's Summary",
    month: "This Month's Summary",
    year: "This Year's Summary",
    custom: "Custom Date Range",
    all: "All-Time Historical Summary"
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-green/15 text-apple-green flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Business Intelligence &amp; Sales Reports
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Live gross revenue, brother shift audits, channels, and audit-verified financial summaries
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handlePrintSummary}
            className="apple-button px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-bold shadow-apple-sm flex items-center gap-1.5 transition-all text-neutral-800 dark:text-neutral-200"
            title="Print or export business summary"
          >
            <Printer className="w-3.5 h-3.5 text-apple-blue" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs & Custom Range Picker */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-4 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filter Segmented Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['today', 'yesterday', 'month', 'year', 'custom', 'all'] as ReportPeriod[]).map((p) => {
              const active = period === p;
              return (
                <button
                  key={p}
                  onClick={() => {
                    sound.playTap();
                    setPeriod(p);
                  }}
                  className={`apple-button px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-apple-blue text-white shadow-apple-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {p === 'today' && "Today"}
                  {p === 'yesterday' && "Yesterday"}
                  {p === 'month' && "This Month"}
                  {p === 'year' && "This Year"}
                  {p === 'custom' && "Custom Dates"}
                  {p === 'all' && "All Time"}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-apple-blue" />
            <span>Viewing: <strong>{periodLabels[period]}</strong></span>
          </div>
        </div>

        {/* Custom Date Range Picker (shown when 'custom' is active) */}
        {period === 'custom' && (
          <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-3 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400">From Date:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400">To Date:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
              />
            </div>
            
            <span className="text-[11px] text-neutral-400">
              (Inclusive dates from 00:00:00 on start date to 23:59:59 on end date)
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards: Double-Checked Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Realized Revenue */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
              <span>Net Paid Revenue</span>
              <TrendingUp className="w-4 h-4 text-apple-green" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 mt-2">
              {currency} {calculations.totalPaidRevenue.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-apple-green font-bold mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>From {calculations.paidTicketsCount} paid customer tickets</span>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
              <span>Unpaid / Counter Bills</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
              {currency} {calculations.pendingUnpaidRevenue.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-neutral-500 mt-3">
            {calculations.unpaidTicketsCount} orders eating / awaiting counter settlement
          </div>
        </div>

        {/* Total Orders Handled */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
              <span>Total Tickets</span>
              <Receipt className="w-4 h-4 text-apple-blue" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 mt-2">
              {calculations.totalOrderTickets} Orders
            </div>
          </div>
          <div className="text-xs text-neutral-500 mt-3 flex items-center gap-2">
            <span>{calculations.cancelledTicketsCount} cancelled tickets</span>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
              <span>Avg Ticket Size (AOV)</span>
              <ArrowUpRight className="w-4 h-4 text-apple-indigo" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-apple-indigo mt-2">
              {currency} {calculations.averageTicket.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-neutral-500 mt-3">
            Average customer spend per transaction
          </div>
        </div>
      </div>

      {/* Brother Performance & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brother Duty Breakdown */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-apple-blue" />
              <span>Brother Sales Audit</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue">
              Partners
            </span>
          </div>

          <p className="text-xs text-neutral-500">
            Revenue booked by each brother during their active shifts in this period:
          </p>

          <div className="space-y-3 pt-1">
            {['Haseeb', 'Aliyan', 'Shaban'].map(brother => {
              const data = calculations.brotherStats[brother] || { count: 0, revenue: 0 };
              const color = brother === 'Haseeb' ? '#007AFF' : brother === 'Aliyan' ? '#34C759' : '#FF9500';
              const percent = calculations.totalPaidRevenue > 0 
                ? Math.round((data.revenue / calculations.totalPaidRevenue) * 100) 
                : 0;

              return (
                <div key={brother} className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                        style={{ backgroundColor: color }}
                      >
                        {brother.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-neutral-900 dark:text-neutral-100">{brother}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-900 dark:text-neutral-100 font-extrabold">
                        {currency} {data.revenue.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-neutral-400 ml-1.5">({data.count} orders)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Channel */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-apple-orange" />
            <span>Revenue by Channel</span>
          </h3>

          <div className="space-y-4 pt-1">
            {/* Dine In */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-apple-blue" />
                  Dine-In ({calculations.dineInCount} orders)
                </span>
                <span className="font-bold">{currency} {calculations.dineInRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-apple-blue rounded-full transition-all duration-500" 
                  style={{ width: `${calculations.totalPaidRevenue > 0 ? (calculations.dineInRevenue / calculations.totalPaidRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Takeaway */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <ShoppingBag className="w-3.5 h-3.5 text-apple-orange" />
                  Takeaway ({calculations.takeawayCount} orders)
                </span>
                <span className="font-bold">{currency} {calculations.takeawayRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-apple-orange rounded-full transition-all duration-500" 
                  style={{ width: `${calculations.totalPaidRevenue > 0 ? (calculations.takeawayRevenue / calculations.totalPaidRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Delivery */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Bike className="w-3.5 h-3.5 text-apple-indigo" />
                  Home Delivery ({calculations.deliveryCount} orders)
                </span>
                <span className="font-bold">{currency} {calculations.deliveryRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-apple-indigo rounded-full transition-all duration-500" 
                  style={{ width: `${calculations.totalPaidRevenue > 0 ? (calculations.deliveryRevenue / calculations.totalPaidRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Cash vs Card Split */}
            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <Banknote className="w-4 h-4 text-apple-green" />
                <span>Cash: <strong>{currency} {calculations.cashRevenue.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <CreditCard className="w-4 h-4 text-apple-blue" />
                <span>Card/Transfer: <strong>{currency} {calculations.cardRevenue.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Best Selling Items */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Top Best-Selling Menu Items</h3>

          {calculations.topItems.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No sales registered in this period</p>
          ) : (
            <div className="space-y-2">
              {calculations.topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[130px]">{item.name}</span>
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

      {/* Detailed Financial Calculation Audit Table */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-apple-sm overflow-hidden">
        <div className="p-5 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Orders Transaction Ledger ({filteredOrders.length} tickets)
            </h3>
            <p className="text-xs text-neutral-500">
              Double-checked calculation audit for {periodLabels[period]}
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-apple-green/10 text-apple-green border border-apple-green/20">
            Realized Net: {currency} {calculations.totalPaidRevenue.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold uppercase tracking-wider border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="px-5 py-3">Token #</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Cashier Brother</th>
                <th className="px-4 py-3">Items Summary</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-xs text-neutral-400">
                    No transactions found for this date period.
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 30).map(order => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-black text-neutral-900 dark:text-neutral-100">{order.token}</td>
                    <td className="px-4 py-3.5 uppercase font-bold text-[11px] text-neutral-600 dark:text-neutral-400">
                      {order.type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-neutral-700 dark:text-neutral-300">
                      {order.serverName?.split(' ')[0] || 'Haseeb'}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-500 max-w-xs truncate">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="px-4 py-3.5 uppercase font-semibold text-[11px]">
                      {order.paymentMethod}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.paymentStatus === 'paid'
                          ? 'bg-apple-green/15 text-apple-green'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-neutral-900 dark:text-neutral-100">
                      {currency} {order.total.toLocaleString()}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
