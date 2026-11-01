'use client';

import React, { useState } from 'react';
import type { Employee } from '@/types';
import { X, CheckCircle2, UserCheck, Banknote, ArrowRightLeft, ShieldCheck, Heart } from 'lucide-react';
import { sound } from '@/lib/sound';

interface PinQuickSwitchModalProps {
  employees: Employee[];
  currentStaff: Employee | null;
  onSwitchStaff: (emp: Employee) => void;
  onClose: () => void;
}

export const PinQuickSwitchModal: React.FC<PinQuickSwitchModalProps> = ({
  employees,
  currentStaff,
  onSwitchStaff,
  onClose,
}) => {
  // Ensure we display Haseeb, Aliyan, Shaban
  const brothers = employees.length > 0 ? employees : [
    { id: 'emp-haseeb', name: 'Haseeb', role: 'manager' as const, pin: '', phone: '', isActive: true, avatarColor: '#007AFF' },
    { id: 'emp-aliyan', name: 'Aliyan', role: 'manager' as const, pin: '', phone: '', isActive: true, avatarColor: '#34C759' },
    { id: 'emp-shaban', name: 'Shaban', role: 'manager' as const, pin: '', phone: '', isActive: true, avatarColor: '#FF9500' },
  ];

  const [handoverCash, setHandoverCash] = useState<string>('');
  const [showHandoverNote, setShowHandoverNote] = useState<boolean>(false);

  const handleSelectBrother = (brother: Employee) => {
    sound.playSuccess();
    onSwitchStaff(brother);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-apple-modal border border-black/10 dark:border-white/10 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
              HFC
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <span>Brother Shift Handover</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                1-Click terminal switch (No password required)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Status */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
          <span className="text-neutral-500 dark:text-neutral-400">Currently on Duty:</span>
          <span className="font-extrabold text-apple-blue flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-apple-green animate-pulse" />
            {currentStaff?.name || 'Haseeb'} (Managing Counter)
          </span>
        </div>

        {/* The 3 Brothers Cards */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Select Brother Taking Over:
          </p>

          {brothers.map(brother => {
            const isCurrent = currentStaff?.id === brother.id || currentStaff?.name === brother.name;
            const color = brother.avatarColor || (brother.name === 'Haseeb' ? '#007AFF' : brother.name === 'Aliyan' ? '#34C759' : '#FF9500');

            return (
              <button
                key={brother.id}
                onClick={() => handleSelectBrother(brother)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'border-apple-blue/50 bg-apple-blue/10 dark:bg-apple-blue/20 ring-2 ring-apple-blue/30'
                    : 'border-black/5 dark:border-white/5 bg-white dark:bg-neutral-800/40 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-apple-sm"
                    style={{ backgroundColor: color }}
                  >
                    {brother.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <span>{brother.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-apple-green/15 text-apple-green">
                          Active Now
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Partner &bull; Co-Owner
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-apple-blue">
                  {isCurrent ? (
                    <CheckCircle2 className="w-5 h-5 text-apple-green" />
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-apple-blue text-white text-xs shadow-apple-sm hover:bg-apple-blue-hover">
                      Switch to {brother.name}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional Shift Handover Cash Note Toggle */}
        <div className="pt-2">
          {!showHandoverNote ? (
            <button
              type="button"
              onClick={() => setShowHandoverNote(true)}
              className="text-xs text-neutral-500 hover:text-apple-blue flex items-center gap-1.5 transition-colors"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Optional: Count drawer cash upon handover</span>
            </button>
          ) : (
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-black/5 dark:border-white/5 space-y-2 text-xs">
              <label className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>Cash Handed Over to Brother (Rs.)</span>
                <button
                  type="button"
                  onClick={() => setShowHandoverNote(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  Close
                </button>
              </label>
              <input
                type="number"
                value={handoverCash}
                onChange={(e) => setHandoverCash(e.target.value)}
                placeholder="e.g. 15400"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold font-mono"
              />
              <p className="text-[10px] text-neutral-400">
                Logged in the shift history for today's financial audit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
