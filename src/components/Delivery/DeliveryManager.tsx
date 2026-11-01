'use client';

import React from 'react';
import type { Order, Employee } from '@/types';
import { 
  Bike, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Navigation,
  Banknote
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface DeliveryManagerProps {
  orders: Order[];
  riders: Employee[];
  currency: string;
  onAssignRider: (orderId: string, riderId: string, riderName: string) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export const DeliveryManager: React.FC<DeliveryManagerProps> = ({
  orders,
  riders,
  currency,
  onAssignRider,
  onUpdateStatus,
}) => {
  const deliveryOrders = orders.filter(o => o.type === 'delivery');
  
  const pendingDispatch = deliveryOrders.filter(
    o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  );
  const outOnRoad = deliveryOrders.filter(o => o.status === 'out_for_delivery');
  const deliveredToday = deliveryOrders.filter(o => o.status === 'delivered');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-indigo/15 text-apple-indigo flex items-center justify-center">
            <Bike className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Home Delivery &amp; Rider Dispatch
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage rider assignments, live transit status, and cash-on-delivery reconciliation
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 shadow-apple-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-indigo animate-pulse"></span>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {outOnRoad.length} In Transit
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 shadow-apple-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-green"></span>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {deliveredToday.length} Delivered
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Delivery Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Ready for Dispatch */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-apple-orange" />
              <span>Awaiting Dispatch ({pendingDispatch.length})</span>
            </h3>
          </div>

          {pendingDispatch.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-neutral-400 bg-white/40 dark:bg-neutral-900/40 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
              No orders waiting for rider dispatch
            </div>
          ) : (
            pendingDispatch.map(order => (
              <div
                key={order.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <span>{order.token}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'ready' 
                          ? 'bg-apple-green/15 text-apple-green' 
                          : 'bg-apple-orange/15 text-apple-orange'
                      }`}>
                        {order.status === 'ready' ? 'Packed & Ready' : 'Kitchen Preparing'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-1">
                      {order.customer?.name} • {order.customer?.phone}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-apple-blue">
                      {currency} {order.total.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Fee: +{currency} {order.deliveryCharge}
                    </div>
                  </div>
                </div>

                {/* Delivery Address Box */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                  <MapPin className="w-4 h-4 text-apple-red shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {order.customer?.address || 'No address specified'}
                    </p>
                    {order.customer?.landmark && (
                      <p className="text-[11px] text-neutral-500 mt-0.5">Near: {order.customer.landmark}</p>
                    )}
                  </div>
                </div>

                {/* Rider Assign & Dispatch Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="flex-1 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-neutral-400" />
                    <select
                      value={order.assignedRiderId || ''}
                      onChange={(e) => {
                        const r = riders.find(rd => rd.id === e.target.value);
                        if (r) onAssignRider(order.id, r.id, r.name);
                      }}
                      className="w-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700"
                    >
                      <option value="">-- Assign Rider --</option>
                      {riders.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.phone})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (!order.assignedRiderId) {
                        sound.playAlert();
                        alert('Please assign a delivery rider first');
                        return;
                      }
                      sound.playSuccess();
                      onUpdateStatus(order.id, 'out_for_delivery');
                    }}
                    className="apple-button px-4 py-2 bg-apple-indigo hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-apple-sm transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1.5" />
                    Dispatch on Road
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 2: Out for Delivery (Live Transit) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Bike className="w-4 h-4 text-apple-indigo" />
              <span>Out with Riders ({outOnRoad.length})</span>
            </h3>
          </div>

          {outOnRoad.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-neutral-400 bg-white/40 dark:bg-neutral-900/40 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
              No riders currently on the road
            </div>
          ) : (
            outOnRoad.map(order => (
              <div
                key={order.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-apple-indigo/30 shadow-apple-md space-y-4 ring-1 ring-apple-indigo/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <span>{order.token}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-apple-indigo text-white flex items-center gap-1">
                        <Bike className="w-3 h-3" />
                        In Transit
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Rider: <strong className="text-neutral-800 dark:text-neutral-200">{order.assignedRiderName || 'Hamza'}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-neutral-500">Collect Cash</div>
                    <div className="text-base font-black text-apple-green">
                      {currency} {order.total.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-neutral-800 dark:text-neutral-200">
                    <span>{order.customer?.name}</span>
                    <a 
                      href={`tel:${order.customer?.phone}`}
                      className="text-apple-blue flex items-center gap-1 text-[11px] hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {order.customer?.phone}
                    </a>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                    {order.customer?.address}
                  </p>
                </div>

                {/* Mark Completed Button */}
                <button
                  onClick={() => {
                    sound.playSuccess();
                    onUpdateStatus(order.id, 'delivered');
                  }}
                  className="w-full apple-button py-2.5 rounded-2xl bg-apple-green hover:bg-apple-green-hover text-white font-bold text-xs shadow-apple-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Confirm Delivered &amp; Cash Received
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
