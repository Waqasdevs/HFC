'use client';

import React from 'react';
import type { Order, RestaurantSettings } from '@/types';
import { Printer, X, CheckCircle, Share2, Copy } from 'lucide-react';
import { sound } from '@/lib/sound';

interface ThermalReceiptModalProps {
  order: Order | null;
  settings: RestaurantSettings;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  settings,
  onClose,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  const handleCopyTextReceipt = () => {
    sound.playTap();
    const paymentText = order.paymentStatus === 'paid' ? `PAID VIA: ${order.paymentMethod.toUpperCase()}` : `UNPAID (${order.type === 'dine_in' ? 'PAY AT COUNTER' : 'COD'})`;
    const text = `==============================\n${settings.restaurantName}\n${settings.address}\nTel: ${settings.phone}\n==============================\nTOKEN: ${order.token}\nTYPE: ${order.type.toUpperCase()}${order.tableNumber ? ` | TABLE: ${order.tableNumber}` : ''}\nDATE: ${new Date(order.createdAt).toLocaleString()}\nCASHIER: ${order.serverName}\n------------------------------\n${order.items.map(i => `${i.quantity}x ${i.name} - ${settings.currency} ${i.price * i.quantity}`).join('\n')}\n------------------------------\nSUBTOTAL: ${settings.currency} ${order.subtotal}\n${order.deliveryCharge > 0 ? `DELIVERY: ${settings.currency} ${order.deliveryCharge}\n` : ''}${order.discount > 0 ? `DISCOUNT: -${settings.currency} ${order.discount}\n` : ''}TOTAL: ${settings.currency} ${order.total}\n${paymentText}\n==============================\n${settings.receiptFooter}`;
    
    navigator.clipboard.writeText(text);
    alert('Receipt copied to clipboard for WhatsApp/SMS dispatch!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/80">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-apple-green" />
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              {order.paymentStatus === 'paid' ? 'Bill Settled & Paid Successfully' : 'Order Placed Successfully'}
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Paper Container */}
        <div className="p-6 overflow-y-auto bg-neutral-100 dark:bg-neutral-950 flex justify-center">
          <div 
            id="thermal-receipt"
            className="w-full max-w-[78mm] bg-white text-black p-5 font-mono text-xs shadow-apple-sm rounded-xl space-y-3 leading-tight"
          >
            {/* Restaurant Brand Header */}
            <div className="text-center space-y-1">
              <h2 className="font-black text-lg tracking-wider uppercase font-sans">
                {settings.restaurantName}
              </h2>
              <p className="text-[11px] font-medium">{settings.tagline}</p>
              <p className="text-[10px] text-neutral-600">{settings.address}</p>
              <p className="text-[10px] text-neutral-600">Ph: {settings.phone}</p>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2"></div>

            {/* Token & Order Metadata */}
            <div className="text-center py-1">
              <div className="text-2xl font-black tracking-tight">{order.token}</div>
              <div className="text-[11px] font-bold uppercase mt-0.5">
                {order.type.replace('_', ' ')} 
                {order.tableNumber && ` • TABLE ${order.tableNumber}`}
              </div>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2"></div>

            {/* Date & Cashier Details */}
            <div className="text-[10px] space-y-0.5 text-neutral-700">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{order.serverName}</span>
              </div>
              {order.customer && (
                <>
                  <div className="flex justify-between font-bold">
                    <span>Customer:</span>
                    <span>{order.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{order.customer.phone}</span>
                  </div>
                  {order.customer.address && (
                    <div className="text-[10px] text-left mt-1 pt-1 border-t border-dotted border-neutral-300">
                      <span className="font-bold">Address: </span>
                      <span>{order.customer.address}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2"></div>

            {/* Items Breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-neutral-200">
                <span>ITEM</span>
                <span>QTY x PRICE = TOTAL</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>{item.name}</span>
                    <span>{settings.currency} {item.price * item.quantity}</span>
                  </div>
                  <div className="text-[10px] text-neutral-600 pl-2">
                    {item.quantity} @ {settings.currency} {item.price}
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <span className="block text-[9px] text-neutral-500">
                        {item.selectedModifiers.map(m => m.choiceName).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2"></div>

            {/* Totals */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{settings.currency} {order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{settings.currency} {order.discount}</span>
                </div>
              )}
              {order.deliveryCharge > 0 && (
                <div className="flex justify-between font-semibold">
                  <span>Delivery Fee:</span>
                  <span>+{settings.currency} {order.deliveryCharge}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({settings.taxRate}%):</span>
                  <span>+{settings.currency} {order.tax}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
                <span>GRAND TOTAL:</span>
                <span>{settings.currency} {order.total}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-0.5">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase">
                  {order.paymentStatus === 'paid' 
                    ? `${order.paymentMethod} (PAID)` 
                    : `UNPAID (${order.type === 'dine_in' ? 'PAY AT COUNTER' : 'COD'})`}
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2"></div>

            {/* Footer message and simulated QR / Barcode */}
            <div className="text-center text-[10px] space-y-1 pt-1">
              <p className="font-semibold whitespace-pre-line">{settings.receiptFooter}</p>
              <div className="text-center py-2 flex flex-col items-center">
                <div className="font-mono tracking-widest text-[16px] font-bold">
                  ||||| ||| ||||||| || |||||
                </div>
                <span className="text-[9px] text-neutral-500">{order.id}</span>
              </div>
              <p className="text-[9px] text-neutral-400">Powered by HFC Offline POS</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#1C1C1E] flex items-center gap-3">
          <button
            onClick={handleCopyTextReceipt}
            className="apple-button px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          >
            <Copy className="w-4 h-4 mr-1.5" />
            <span>Copy Text</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="apple-button px-4 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all"
          >
            Done
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 apple-button py-3 px-6 rounded-2xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-sm shadow-apple-md transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4 mr-2" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
