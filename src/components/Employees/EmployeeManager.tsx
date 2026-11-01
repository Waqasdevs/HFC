'use client';

import React, { useState } from 'react';
import type { Employee, Shift, Order } from '@/types';
import { 
  Users, 
  KeyRound, 
  Clock, 
  ShieldCheck, 
  Plus, 
  UserCheck, 
  Receipt,
  Banknote,
  CreditCard,
  CheckCircle2,
  Lock
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
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  currentShift,
  orders,
  currency,
  onAddEmployee,
  onClockIn,
  onClockOut,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [shiftNotes, setShiftNotes] = useState('');

  // New employee state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Employee['role']>('cashier');
  const [newPin, setNewPin] = useState('1234');
  const [newPhone, setNewPhone] = useState('+92 300 ');

  // Register calculations for current shift
  const cashSales = orders
    .filter(o => o.paymentMethod === 'cash' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = orders
    .filter(o => o.paymentMethod === 'card' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const openingCash = currentShift?.openingCash || 5000;
  const expectedCashDrawer = openingCash + cashSales;

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPin) return;
    sound.playSuccess();
    onAddEmployee({
      name: newName,
      role: newRole,
      pin: newPin,
      phone: newPhone,
      isActive: true,
      avatarColor: newRole === 'admin' ? '#007AFF' : newRole === 'chef' ? '#FF3B30' : '#34C759'
    });
    setShowAddModal(false);
    setNewName('');
    setNewPin('');
  };

  const handleConfirmClockOut = () => {
    sound.playSuccess();
    onClockOut(Number(actualCashInput) || 0, shiftNotes);
    setShowClockOutModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-blue/15 text-apple-blue flex items-center justify-center">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Staff &amp; Cash Register Management
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Role permissions, 4-digit PIN unlock, shifts, and cash drawer reconciliation
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playTap();
            setShowAddModal(true);
          }}
          className="apple-button px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs rounded-2xl shadow-apple-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Team Member
        </button>
      </div>

      {/* Cash Drawer & Shift Reconciliation Card */}
      <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-[#1C1C1E] dark:to-neutral-900 rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-apple-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-apple-green/15 text-apple-green flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-apple-green">
                Active Shift: {currentShift?.employeeName || 'Ayesha (Cashier)'}
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
            className="apple-button px-4 py-2 rounded-xl bg-apple-orange/15 hover:bg-apple-orange/25 text-apple-orange font-bold text-xs transition-all"
          >
            End Shift &amp; Reconcile Drawer
          </button>
        </div>

        {/* Financial Drawer Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-black/5 dark:border-white/5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase">Opening Cash Float</span>
            <div className="text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
              {currency} {openingCash.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-black/5 dark:border-white/5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-apple-green" />
              Cash Sales Today
            </span>
            <div className="text-lg font-black text-apple-green mt-1">
              +{currency} {cashSales.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-black/5 dark:border-white/5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-apple-blue" />
              Card / POS Sales
            </span>
            <div className="text-lg font-black text-apple-blue mt-1">
              +{currency} {cardSales.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-apple-blue/10 dark:bg-apple-blue/20 rounded-2xl border border-apple-blue/20">
            <span className="text-[11px] font-bold text-apple-blue uppercase">Expected Cash in Drawer</span>
            <div className="text-lg font-black text-apple-blue mt-1">
              {currency} {expectedCashDrawer.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Team Roster Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Restaurant Team Directory</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => (
            <div
              key={emp.id}
              className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm"
                  style={{ backgroundColor: emp.avatarColor || '#007AFF' }}
                >
                  {emp.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{emp.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {emp.role}
                    </span>
                    <span className="text-[11px] text-neutral-400">{emp.phone}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  PIN: ••••
                </span>
              </div>
            </div>
          ))}
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
                className="w-full text-base font-black px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-center"
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
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Shift Notes</label>
              <input
                type="text"
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                placeholder="Any discrepancy reason or handover notes"
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
                className="flex-1 apple-button py-2.5 rounded-xl bg-apple-blue text-white text-xs font-bold shadow-apple-sm"
              >
                Close Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-apple-modal border border-black/5 dark:border-white/10 space-y-4">
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Add New Staff Member
            </h3>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="chef">Kitchen Chef</option>
                    <option value="rider">Delivery Rider</option>
                    <option value="waiter">Waiter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="4444"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Phone</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 apple-button py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 apple-button py-2.5 rounded-xl bg-apple-blue text-white text-xs font-bold shadow-apple-sm"
                >
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
