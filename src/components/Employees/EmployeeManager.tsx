'use client';

import React, { useState } from 'react';
import type { Employee, Shift, Order } from '@/types';
import { 
  Users, 
  Clock, 
  Plus, 
  UserCheck, 
  Banknote, 
  CreditCard, 
  CheckCircle2,
  ArrowRightLeft,
  DollarSign,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface EmployeeManagerProps {
  employees: Employee[];
  currentShift: Shift | null;
  orders: Order[];
  currency: string;
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onClockIn: (employeeId: string, employeeName: string, role: Employee['role'], openingCash: number) => void;
  onClockOut: (closingCash: number, notes: string) => void;
  onUpdateOpeningCash: (newOpeningCash: number) => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  currentShift,
  orders,
  currency,
  onAddEmployee,
  onClockIn,
  onClockOut,
  onUpdateOpeningCash,
}) => {
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [shiftNotes, setShiftNotes] = useState('');
  const [isEditingFloat, setIsEditingFloat] = useState(false);
  const [editFloatValue, setEditFloatValue] = useState<string>((currentShift?.openingCash || 5000).toString());

  // The 3 Brothers list
  const brothersList = employees.length > 0 ? employees : [
    { id: 'emp-haseeb', name: 'Haseeb', role: 'manager' as const, pin: '', phone: '+92 300 1111111', isActive: true, avatarColor: '#007AFF' },
    { id: 'emp-aliyan', name: 'Aliyan', role: 'manager' as const, pin: '', phone: '+92 300 2222222', isActive: true, avatarColor: '#34C759' },
    { id: 'emp-shaban', name: 'Shaban', role: 'manager' as const, pin: '', phone: '+92 300 3333333', isActive: true, avatarColor: '#FF9500' },
  ];

  // Register calculations for current shift
  const openingCash = currentShift?.openingCash !== undefined ? currentShift.openingCash : 5000;
  const cashSales = orders
    .filter(o => o.paymentMethod === 'cash' && o.status !== 'cancelled' && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const cardSales = orders
    .filter(o => (o.paymentMethod === 'card' || o.paymentMethod === 'online_transfer') && o.status !== 'cancelled' && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const expectedCashDrawer = openingCash + cashSales;

  const handleSaveFloat = () => {
    const val = Math.max(0, Number(editFloatValue) || 0);
    sound.playSuccess();
    onUpdateOpeningCash(val);
    setIsEditingFloat(false);
  };

  const handleConfirmClockOut = () => {
    sound.playSuccess();
    onClockOut(Number(actualCashInput) || 0, shiftNotes);
    setShowClockOutModal(false);
  };

  const handleDirectSwitch = (brother: Employee) => {
    sound.playSuccess();
    onClockIn(brother.id, brother.name, brother.role, openingCash);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-blue/15 text-apple-blue flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Partner Brothers &amp; Cash Register Management
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Operated by Haseeb, Aliyan, and Shaban. Seamless shift handovers with zero passwords.
            </p>
          </div>
        </div>
      </div>

      {/* Cash Drawer & Shift Reconciliation Card */}
      <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-[#1C1C1E] dark:to-neutral-900 rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-apple-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-apple-green/15 text-apple-green flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-apple-green flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-apple-green animate-pulse" />
                Active Shift: {currentShift?.employeeName || 'Haseeb'}
              </div>
              <div className="text-[11px] text-neutral-500">
                Clocked in at {new Date(currentShift?.clockIn || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              setActualCashInput(expectedCashDrawer);
              setShowClockOutModal(true);
            }}
            className="apple-button px-4 py-2 rounded-xl bg-apple-orange/15 hover:bg-apple-orange/25 text-apple-orange font-bold text-xs transition-all self-start sm:self-auto"
          >
            End Shift &amp; Reconcile Cash Drawer
          </button>
        </div>

        {/* Financial Drawer Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* 1. Opening Cash Float (Editable) */}
          <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-black/5 dark:border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Opening Cash Float</span>
              {!isEditingFloat && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setEditFloatValue(openingCash.toString());
                    setIsEditingFloat(true);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-apple-blue hover:bg-apple-blue/10 transition-colors flex items-center gap-1 text-[11px] font-bold"
                  title="Click to edit opening cash float"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingFloat ? (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-bold text-neutral-400">{currency}</span>
                <input
                  type="number"
                  value={editFloatValue}
                  onChange={(e) => setEditFloatValue(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-apple-blue font-black text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveFloat();
                    if (e.key === 'Escape') setIsEditingFloat(false);
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveFloat}
                  className="p-1.5 rounded-lg bg-apple-green text-white hover:bg-apple-green-hover transition-colors shrink-0"
                  title="Save Float"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingFloat(false)}
                  className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors shrink-0"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
                {currency} {openingCash.toLocaleString()}
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-black/5 dark:border-white/5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-apple-green" />
              Cash Sales on Duty
            </span>
            <div className="text-lg font-black text-apple-green mt-1">
              +{currency} {cashSales.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-black/5 dark:border-white/5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-apple-blue" />
              Card / Online Sales
            </span>
            <div className="text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
              {currency} {cardSales.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-apple-blue/10 dark:bg-apple-blue/20 rounded-2xl border border-apple-blue/20">
            <span className="text-[11px] font-bold text-apple-blue uppercase">Expected Drawer Cash</span>
            <div className="text-lg font-black text-apple-blue mt-1">
              {currency} {expectedCashDrawer.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Brothers Directory & Instant Duty Switcher */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-apple-blue" />
          <span>Brother Profiles &bull; Instant Duty Handover</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {brothersList.map(brother => {
            const isDuty = currentShift?.employeeId === brother.id || currentShift?.employeeName === brother.name;
            const color = brother.avatarColor || (brother.name === 'Haseeb' ? '#007AFF' : brother.name === 'Aliyan' ? '#34C759' : '#FF9500');

            return (
              <div
                key={brother.id}
                className={`bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border shadow-apple-sm flex flex-col justify-between space-y-4 transition-all ${
                  isDuty
                    ? 'border-apple-blue ring-2 ring-apple-blue/30 bg-apple-blue/[0.02]'
                    : 'border-black/5 dark:border-white/5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {brother.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100">{brother.name}</h4>
                      <p className="text-xs text-neutral-500 font-medium">Managing Partner &bull; Co-Owner</p>
                    </div>
                  </div>

                  {isDuty && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-apple-green/15 text-apple-green border border-apple-green/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-apple-green animate-pulse" />
                      On Duty
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">No Password Required</span>
                  {isDuty ? (
                    <span className="font-bold text-apple-green text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Active Terminal
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDirectSwitch(brother)}
                      className="apple-button px-3.5 py-1.5 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-xs shadow-apple-sm transition-all"
                    >
                      Start Shift
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clock Out / Register Reconciliation Modal */}
      {showClockOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-apple-modal border border-black/5 dark:border-white/10 space-y-4">
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              End Shift &amp; Reconcile Cash Drawer
            </h3>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Opening Cash Float:</span>
                <span className="font-bold">{currency} {openingCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Cash Sales Registered:</span>
                <span className="font-bold text-apple-green">+{currency} {cashSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-black/5 font-extrabold text-sm">
                <span>Expected Drawer Total:</span>
                <span className="text-apple-blue">{currency} {expectedCashDrawer.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Counted Actual Cash in Drawer ({currency})
              </label>
              <input
                type="number"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(Number(e.target.value) || 0)}
                className="w-full text-base font-black px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-center font-mono"
              />
              {actualCashInput !== expectedCashDrawer && (
                <p className={`text-[11px] font-bold text-center ${
                  actualCashInput > expectedCashDrawer ? 'text-apple-green' : 'text-apple-red'
                }`}>
                  Variance: {actualCashInput > expectedCashDrawer ? '+' : ''}
                  {currency} {(actualCashInput - expectedCashDrawer).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Shift Handover Notes</label>
              <input
                type="text"
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                placeholder="e.g. Handed over register to Aliyan with Rs. 5000 float"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClockOutModal(false)}
                className="flex-1 apple-button py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClockOut}
                className="flex-1 apple-button py-2.5 rounded-xl bg-apple-blue text-white text-xs font-bold shadow-apple-sm hover:bg-apple-blue-hover"
              >
                Close &amp; Hand Over Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
