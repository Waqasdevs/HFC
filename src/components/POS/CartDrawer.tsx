'use client';

import React, { useState } from 'react';
import type { 
  OrderItem, 
  OrderType, 
  Table, 
  PaymentMethod, 
  PaymentStatus,
  CustomerInfo,
  Employee
} from '@/types';
import { 
  Trash2, 
  Plus, 
  Minus, 
  UtensilsCrossed, 
  ShoppingBag, 
  Bike, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Percent, 
  ChevronRight,
  Receipt
} from 'lucide-react';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  cart: OrderItem[];
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
  selectedTable: string | null;
  onSelectTable: (tbl: string | null) => void;
  availableTables: Table[];
  customerInfo: CustomerInfo;
  onChangeCustomerInfo: (info: CustomerInfo) => void;
  deliveryCharge: number;
  onChangeDeliveryCharge: (charge: number) => void;
  discountPercentage: number;
  onChangeDiscount: (disc: number) => void;
  currency: string;
  taxRate: number;
  currentStaff: Employee | null;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCompleteOrder: (paymentMethod: PaymentMethod, paymentStatus: PaymentStatus) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  orderType,
  onChangeOrderType,
  selectedTable,
  onSelectTable,
  availableTables,
  customerInfo,
  onChangeCustomerInfo,
  deliveryCharge,
  onChangeDeliveryCharge,
  discountPercentage,
  onChangeDiscount,
  currency,
  taxRate,
  currentStaff,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCompleteOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);
  const effectiveDelivery = orderType === 'delivery' ? deliveryCharge : 0;
  const grandTotal = taxableAmount + taxAmount + effectiveDelivery;

  const handleCheckout = () => {
    if (cart.length === 0 || isSubmitting) return;

    if (orderType === 'dine_in') {
      if (!selectedTable) {
        sound.playAlert();
        alert('Please select a Table Number for Dine-In order');
        return;
      }
      const currentTbl = availableTables.find(t => t.number === selectedTable);
      if (currentTbl && (currentTbl.status === 'occupied' || currentTbl.status === 'billed')) {
        sound.playAlert();
        alert(`Table ${selectedTable} already has an active order and is occupied! Please choose a vacant table, or settle Table ${selectedTable}'s bill first.`);
        return;
      }
    }

    // Delivery validation removed as requested - customer info is optional

    setIsSubmitting(true);
    sound.playSuccess();

    try {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#007AFF', '#34C759', '#FF9500']
      });
    } catch {}

    // Determine initial payment status:
    // - Dine-in: Pay-Later (guests pay at counter after dining)
    // - Takeaway: Pay on Pickup (customer pays when collecting packaged food)
    // - Delivery: COD (rider collects payment at doorstep)
    const paymentStatus: PaymentStatus = 
      orderType === 'dine_in' 
        ? 'pending' 
        : orderType === 'takeaway'
        ? 'pending'
        : (orderType === 'delivery' && paymentMethod === 'cash' ? 'pending' : 'paid');

    onCompleteOrder(paymentMethod, paymentStatus);
    setIsSubmitting(false);
  };

  return (
    <div className="w-80 lg:w-84 xl:w-96 h-screen flex flex-col justify-between border-l border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#18181b]/70 backdrop-blur-2xl select-none z-20 shrink-0">
      {/* Header & Order Type Segmented Control */}
      <div className="p-4 border-b border-black/5 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-neutral-900 dark:text-neutral-100">Order Tray</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue">
              {cart.reduce((total, i) => total + i.quantity, 0)} items
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => {
                sound.playTap();
                onClearCart();
              }}
              className="text-xs text-apple-red hover:underline font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Cupertino Segmented Control for Order Type */}
        <div className="p-1 bg-black/[0.05] dark:bg-white/[0.06] rounded-2xl flex items-center gap-1">
          <button
            onClick={() => {
              sound.playTap();
              onChangeOrderType('dine_in');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              orderType === 'dine_in'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-apple-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Dine-In</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onChangeOrderType('takeaway');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              orderType === 'takeaway'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-apple-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onChangeOrderType('delivery');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              orderType === 'delivery'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-apple-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Context Specific Inputs */}
        {orderType === 'dine_in' && (
          <div className="space-y-1.5 bg-neutral-100/70 dark:bg-neutral-800/50 p-2.5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Select Table:</span>
              <select
                value={selectedTable || ''}
                onChange={(e) => {
                  sound.playTap();
                  onSelectTable(e.target.value || null);
                }}
                className="text-xs font-bold bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-600 focus:outline-none max-w-[200px]"
              >
                <option value="">-- Choose Vacant Table --</option>
                {availableTables.map((t) => {
                  const isOccupied = t.status === 'occupied' || t.status === 'billed';
                  return (
                    <option 
                      key={t.id} 
                      value={t.number}
                      disabled={isOccupied && t.number !== selectedTable}
                      className={isOccupied ? 'text-neutral-400 bg-neutral-100 dark:bg-neutral-800' : ''}
                    >
                      {t.number} ({t.zone} - {t.capacity}p) {isOccupied ? '🔴 [Occupied]' : '🟢 [Vacant]'}
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic">
              * Occupied tables are locked. Bill is settled at counter after dining.
            </p>
          </div>
        )}

        {orderType === 'delivery' && (
          <div className="space-y-2 p-3 bg-neutral-100/70 dark:bg-neutral-800/50 rounded-2xl">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Customer Name"
                value={customerInfo.name}
                onChange={(e) => onChangeCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full text-xs bg-white dark:bg-neutral-700 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <input
                type="tel"
                placeholder="Phone (e.g. 0300-1234567)"
                value={customerInfo.phone}
                onChange={(e) => onChangeCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full text-xs bg-white dark:bg-neutral-700 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Street / Sector / House #"
                value={customerInfo.address}
                onChange={(e) => onChangeCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full text-xs bg-white dark:bg-neutral-700 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-semibold text-neutral-500">Delivery Fee ({currency}):</span>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => onChangeDeliveryCharge(Number(e.target.value) || 0)}
                className="w-20 text-xs font-bold text-right bg-white dark:bg-neutral-700 px-2 py-1 rounded-xl border border-neutral-200 dark:border-neutral-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400">
            <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-2 opacity-40" />
            <p className="text-sm font-semibold">Your Tray is Empty</p>
            <p className="text-xs text-neutral-400 mt-0.5">Click any food item on the menu to begin</p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="p-3 bg-white dark:bg-neutral-800/80 rounded-2xl border border-black/5 dark:border-white/5 shadow-apple-sm flex flex-col gap-1.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                    {item.name}
                  </h4>
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 space-y-0.5">
                      {item.selectedModifiers.map((mod, mi) => (
                        <div key={mi}>• {mod.choiceName} {mod.price > 0 ? `(+${mod.price})` : ''}</div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-[10px] italic text-amber-600 dark:text-amber-400 mt-0.5">
                      "{item.notes}"
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">
                    {currency} {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Remove */}
              <div className="flex items-center justify-between pt-1 mt-1 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => {
                    sound.playTap();
                    onRemoveItem(index);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-apple-red transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-700/60 px-2 py-0.5 rounded-xl">
                  <button
                    onClick={() => {
                      sound.playTap();
                      onUpdateQuantity(index, -1);
                    }}
                    className="w-5 h-5 flex items-center justify-center text-neutral-600 dark:text-neutral-300 font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold min-w-[14px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => {
                      sound.playTap();
                      onUpdateQuantity(index, 1);
                    }}
                    className="w-5 h-5 flex items-center justify-center text-neutral-600 dark:text-neutral-300 font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Summary & Payment Section */}
      <div className="p-4 border-t border-black/5 dark:border-white/10 bg-neutral-50/70 dark:bg-neutral-900/70 space-y-3">
        {/* Subtotals */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span>{currency} {subtotal.toLocaleString()}</span>
          </div>

          {/* Discount line */}
          <div className="flex justify-between items-center text-neutral-500">
            <button
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              className="text-apple-blue hover:underline flex items-center gap-1 font-semibold text-[11px]"
            >
              <Percent className="w-3 h-3" />
              {discountPercentage > 0 ? `Discount (${discountPercentage}%)` : 'Add Discount'}
            </button>
            {discountPercentage > 0 && (
              <span className="text-apple-green font-semibold">
                -{currency} {discountAmount.toLocaleString()}
              </span>
            )}
          </div>

          {showDiscountInput && (
            <div className="flex items-center gap-2 py-1">
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercentage || ''}
                onChange={(e) => onChangeDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                placeholder="Discount %"
                className="w-24 text-xs px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
              />
              <span className="text-[11px] text-neutral-400">% applied</span>
            </div>
          )}

          {orderType === 'delivery' && (
            <div className="flex justify-between text-neutral-500">
              <span>Delivery Fee</span>
              <span>+{currency} {deliveryCharge.toLocaleString()}</span>
            </div>
          )}

          {taxRate > 0 && (
            <div className="flex justify-between text-neutral-500">
              <span>Tax ({taxRate}%)</span>
              <span>+{currency} {taxAmount.toLocaleString()}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between items-baseline pt-2 border-t border-black/5 dark:border-white/5 font-extrabold text-base text-neutral-900 dark:text-neutral-100">
            <span>Total Payable</span>
            <span className="text-lg text-apple-blue">{currency} {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method Selector or Pay-Later Notices */}
        {orderType === 'dine_in' ? (
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center gap-2 text-xs">
            <UtensilsCrossed className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Guests pay at counter after finishing meal. Table remains occupied until settled.</span>
          </div>
        ) : orderType === 'takeaway' ? (
          <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 flex items-center gap-2 text-xs">
            <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Kitchen packages food to-go. Customer pays at counter when collecting order.</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 flex items-center gap-2 text-xs">
              <Bike className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Doorstep delivery. Rider collects cash upon handover.</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playTap();
                  setPaymentMethod('cash');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-apple-green text-white border-apple-green shadow-sm'
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash on Delivery</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  setPaymentMethod('card');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-apple-blue text-white border-apple-blue shadow-sm'
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Paid Online / Card</span>
              </button>
            </div>
          </div>
        )}

        {/* Complete Order Primary Trigger */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || isSubmitting}
          className={`w-full apple-button py-3.5 rounded-2xl text-white font-bold text-sm shadow-apple-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 ${
            orderType === 'dine_in'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
              : orderType === 'takeaway'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
          }`}
        >
          {orderType === 'dine_in' ? (
            <>
              <UtensilsCrossed className="w-4 h-4" />
              <span>Send to Kitchen (Pay Later)</span>
            </>
          ) : orderType === 'takeaway' ? (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Send Takeaway Order (Pay on Pickup)</span>
            </>
          ) : (
            <>
              <Bike className="w-4 h-4" />
              <span>Place Delivery Order {paymentMethod === 'cash' ? '(COD)' : '(Paid)'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
