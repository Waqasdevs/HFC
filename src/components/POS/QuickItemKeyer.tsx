'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { MenuItem } from '@/types';
import { 
  Hash, 
  Plus, 
  Minus, 
  CornerDownLeft, 
  Calculator, 
  FileText, 
  X, 
  Check, 
  AlertCircle, 
  Search,
  Printer
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface QuickItemKeyerProps {
  menuItems: MenuItem[];
  onAddItem: (item: MenuItem, quantity: number) => void;
  currency: string;
}

export const QuickItemKeyer: React.FC<QuickItemKeyerProps> = ({
  menuItems,
  onAddItem,
  currency,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showNumpad, setShowNumpad] = useState<boolean>(false);
  const [showCodeSheet, setShowCodeSheet] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [codeSheetSearch, setCodeSheetSearch] = useState<string>('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Clear feedback after 3 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Global hotkey: press '/' or 'F2' to focus the quick item number input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if already typing in another input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        return;
      }

      if (e.key === '/' || e.key === 'F2') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Parse input string: supports single number "14", multiplier "2*14", "14*2", "2x14"
  const parseInput = (raw: string): { itemNumber: number; qty: number } | null => {
    const clean = raw.trim().replace(/^#+/, '');
    if (!clean) return null;

    // Check for multiplier formats (e.g., 2*14, 14*2, 2x14, 14x2)
    if (clean.includes('*') || clean.toLowerCase().includes('x')) {
      const parts = clean.toLowerCase().split(/[*x]/);
      if (parts.length === 2) {
        const val1 = parseInt(parts[0], 10);
        const val2 = parseInt(parts[1], 10);
        if (!isNaN(val1) && !isNaN(val2)) {
          // Rule: Higher number is usually item number if val1 is small (e.g., 2*35 -> qty 2, item 35)
          if (val1 <= 10 && val2 > 10) {
            return { itemNumber: val2, qty: val1 };
          } else if (val2 <= 10 && val1 > 10) {
            return { itemNumber: val1, qty: val2 };
          } else {
            // Default: first is item, second is qty
            return { itemNumber: val1, qty: val2 };
          }
        }
      }
    }

    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 0) {
      return { itemNumber: num, qty: quantity };
    }

    return null;
  };

  const handleExecuteAdd = () => {
    const parsed = parseInput(inputValue);
    if (!parsed) {
      sound.playAlert();
      setFeedback({ type: 'error', message: 'Enter a valid item number (1–135)' });
      inputRef.current?.focus();
      return;
    }

    const targetItem = menuItems.find(i => i.itemNumber === parsed.itemNumber);
    if (!targetItem) {
      sound.playAlert();
      setFeedback({ type: 'error', message: `Item #${parsed.itemNumber} not found in catalog` });
      inputRef.current?.focus();
      inputRef.current?.select();
      return;
    }

    // Execute add action
    onAddItem(targetItem, parsed.qty);
    sound.playTap();

    setFeedback({
      type: 'success',
      message: `✓ Added #${targetItem.itemNumber} ${targetItem.name} ${parsed.qty > 1 ? `(x${parsed.qty})` : ''}`,
    });

    setInputValue('');
    setQuantity(1);
    inputRef.current?.focus();
  };

  const handleNumpadPress = (digit: string) => {
    sound.playTap();
    if (digit === 'C') {
      setInputValue('');
      return;
    }
    if (digit === '⌫') {
      setInputValue(prev => prev.slice(0, -1));
      return;
    }
    if (digit === 'x2') {
      const parsed = parseInt(inputValue, 10);
      if (!isNaN(parsed)) setInputValue(`2*${parsed}`);
      return;
    }
    if (digit === 'x3') {
      const parsed = parseInt(inputValue, 10);
      if (!isNaN(parsed)) setInputValue(`3*${parsed}`);
      return;
    }
    if (digit === 'ENTER') {
      handleExecuteAdd();
      return;
    }

    setInputValue(prev => prev + digit);
  };

  // Group items by category for the cheat sheet
  const groupedCategories = React.useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    menuItems.forEach(item => {
      const cat = item.categoryName || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    });

    // Sort items within each category by itemNumber
    map.forEach(list => list.sort((a, b) => (a.itemNumber || 0) - (b.itemNumber || 0)));
    return Array.from(map.entries());
  }, [menuItems]);

  const filteredCheatSheet = React.useMemo(() => {
    if (!codeSheetSearch.trim()) return groupedCategories;
    const q = codeSheetSearch.toLowerCase().trim();
    return groupedCategories
      .map(([cat, items]) => {
        const filtered = items.filter(i => 
          i.name.toLowerCase().includes(q) ||
          (i.itemNumber && String(i.itemNumber).includes(q)) ||
          cat.toLowerCase().includes(q)
        );
        return [cat, filtered] as [string, MenuItem[]];
      })
      .filter(([_, items]) => items.length > 0);
  }, [groupedCategories, codeSheetSearch]);

  return (
    <div className="relative bg-white dark:bg-[#1C1C1E] rounded-2xl p-3 border border-black/5 dark:border-white/5 shadow-apple-sm transition-all">
      {/* Top Main Fast Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        {/* Fast Input Field */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-apple-blue font-mono font-bold text-sm pointer-events-none">
            <Hash className="w-4 h-4" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleExecuteAdd();
              }
            }}
            placeholder="Quick Add by # (e.g. 1, 14, 2*35)..."
            className="w-full pl-8 pr-8 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl font-mono text-sm font-semibold placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 border border-transparent focus:border-apple-blue focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all"
          />

          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 rounded-xl p-1 border border-black/5 dark:border-white/5 shrink-0">
          <button
            type="button"
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
            title="Decrease Quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(q => q + 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
            title="Increase Quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Add Button */}
        <button
          type="button"
          onClick={handleExecuteAdd}
          className="apple-button px-4 py-2.5 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-bold shadow-apple-sm transition-all flex items-center gap-1.5 shrink-0 active:scale-[0.98]"
          title="Add item by number to order (Enter)"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
          <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 bg-white/20 rounded font-mono text-[10px] font-semibold">
            ↵
          </kbd>
        </button>

        {/* Touch Numpad Toggle */}
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            setShowNumpad(!showNumpad);
          }}
          className={`apple-button px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
            showNumpad
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent shadow-apple-sm'
              : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
          title="Toggle On-Screen Touch Numpad"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Numpad</span>
        </button>

        {/* Menu Code Reference Sheet Modal Button */}
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            setShowCodeSheet(true);
          }}
          className="apple-button px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all"
          title="Open Printable 1-Page Menu Code Sheet"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Code Sheet</span>
        </button>
      </div>

      {/* Instant Feedback Pill */}
      {feedback && (
        <div
          className={`mt-2 p-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-apple-green/15 text-apple-green border border-apple-green/20'
              : 'bg-apple-red/15 text-apple-red border border-apple-red/20'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Expandable Touch Numpad (for Touchscreens / Tablets) */}
      {showNumpad && (
        <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
            {['1', '2', '3', 'x2', 'C', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleNumpadPress(k)}
                className={`h-11 rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all active:scale-[0.96] shadow-2xs ${
                  k === 'C'
                    ? 'bg-apple-red/15 text-apple-red hover:bg-apple-red/25 border border-apple-red/20'
                    : k === 'x2'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {k}
              </button>
            ))}

            {['4', '5', '6', 'x3', '0', 'ENTER'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleNumpadPress(k)}
                className={`h-11 rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all active:scale-[0.96] shadow-2xs ${
                  k === 'ENTER'
                    ? 'col-span-2 bg-apple-blue text-white hover:bg-apple-blue-hover'
                    : k === 'x3'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {k === 'ENTER' ? 'Add ↵' : k}
              </button>
            ))}

            {['7', '8', '9'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleNumpadPress(k)}
                className="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono text-sm font-bold flex items-center justify-center transition-all active:scale-[0.96] shadow-2xs"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- PRINTABLE MENU CODE SHEET MODAL --- */}
      {showCodeSheet && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowCodeSheet(false)}
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/10 dark:border-white/10 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-apple-blue/10 text-apple-blue flex items-center justify-center font-mono font-black text-sm">
                  #
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    Official HFC Menu Code Sheet (1–{menuItems.length})
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Fast counter reference. Type any number on the POS to add directly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="apple-button px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5"
                  title="Print Counter Cheatsheet"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCodeSheet(false)}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Filter inside Cheat Sheet */}
            <div className="p-3 border-b border-black/5 dark:border-white/10 bg-neutral-50/40 dark:bg-neutral-900/40 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={codeSheetSearch}
                  onChange={(e) => setCodeSheetSearch(e.target.value)}
                  placeholder="Filter by name, number (#14) or category..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-800 rounded-xl text-xs placeholder:text-neutral-400 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-apple-blue/30"
                />
              </div>
            </div>

            {/* Modal Body: Two-column responsive table */}
            <div className="p-4 overflow-y-auto space-y-6 flex-1 text-xs">
              {filteredCheatSheet.map(([categoryName, items]) => (
                <div key={categoryName} className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-1">
                    <span className="font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-xs">
                      {categoryName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      ({items.length} items)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onAddItem(item, 1);
                          sound.playTap();
                          setShowCodeSheet(false);
                        }}
                        className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-apple-blue/10 border border-black/5 dark:border-white/5 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-mono font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-apple-blue group-hover:text-white transition-colors">
                            #{item.itemNumber}
                          </span>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-neutral-500 shrink-0">
                          {currency} {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-black/5 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-900/80 text-[11px] text-neutral-500 flex items-center justify-between shrink-0">
              <span>Tip: Click any item row to add it directly to current order.</span>
              <button
                type="button"
                onClick={() => setShowCodeSheet(false)}
                className="apple-button px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
