'use client';

import React, { useState } from 'react';
import type { Employee } from '@/types';
import { X, Lock, CheckCircle2, Delete } from 'lucide-react';
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
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(currentStaff || employees[0] || null);
  const [pinDigits, setPinDigits] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDigitPress = (digit: string) => {
    sound.playTap();
    if (pinDigits.length >= 4) return;
    const nextPin = pinDigits + digit;
    setPinDigits(nextPin);
    setErrorMsg(null);

    // Auto verify when 4 digits reached
    if (nextPin.length === 4 && selectedEmp) {
      if (selectedEmp.pin === nextPin) {
        sound.playSuccess();
        onSwitchStaff(selectedEmp);
        onClose();
      } else {
        sound.playAlert();
        setErrorMsg('Invalid PIN. Please try again.');
        setTimeout(() => setPinDigits(''), 600);
      }
    }
  };

  const handleDeleteDigit = () => {
    sound.playTap();
    setPinDigits(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-apple-modal border border-black/10 dark:border-white/10 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-apple-blue" />
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Switch Staff Terminal</h3>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Staff Horizontal Avatars */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {employees.map(emp => {
            const isSelected = selectedEmp?.id === emp.id;
            return (
              <button
                key={emp.id}
                onClick={() => {
                  sound.playTap();
                  setSelectedEmp(emp);
                  setPinDigits('');
                  setErrorMsg(null);
                }}
                className={`flex flex-col items-center p-2 rounded-2xl min-w-[72px] transition-all ${
                  isSelected 
                    ? 'bg-apple-blue/10 dark:bg-apple-blue/20 ring-2 ring-apple-blue' 
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm mb-1"
                  style={{ backgroundColor: emp.avatarColor || '#007AFF' }}
                >
                  {emp.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 truncate w-full text-center">
                  {emp.name.split(' ')[0]}
                </span>
                <span className="text-[9px] uppercase font-semibold text-neutral-400">
                  {emp.role}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Staff Info & PIN dots */}
        <div className="text-center space-y-3 pt-1">
          <p className="text-xs text-neutral-500">
            Enter 4-digit PIN for <strong>{selectedEmp?.name}</strong>
          </p>

          {/* 4-Pin Bubble Dots */}
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3].map(idx => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all ${
                  pinDigits.length > idx
                    ? 'bg-apple-blue border-apple-blue scale-110'
                    : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-apple-red animate-shake">{errorMsg}</p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigitPress(d)}
              className="apple-button h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold text-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all active:scale-95"
            >
              {d}
            </button>
          ))}

          {/* Demo quick unlock button */}
          <button
            onClick={() => {
              if (selectedEmp) {
                sound.playSuccess();
                onSwitchStaff(selectedEmp);
                onClose();
              }
            }}
            className="apple-button h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-apple-blue hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title="Demo instant bypass"
          >
            Bypass
          </button>

          <button
            onClick={() => handleDigitPress('0')}
            className="apple-button h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold text-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95"
          >
            0
          </button>

          <button
            onClick={handleDeleteDigit}
            className="apple-button h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
