'use client';

import React, { useState } from 'react';
import type { MenuItem, ModifierChoice } from '@/types';
import { X, Check, Plus, Minus } from 'lucide-react';
import { sound } from '@/lib/sound';

interface ItemModifierModalProps {
  item: MenuItem | null;
  currency: string;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem, 
    quantity: number, 
    selectedModifiers: { groupName: string; choiceName: string; price: number }[],
    notes: string
  ) => void;
}

export const ItemModifierModal: React.FC<ItemModifierModalProps> = ({
  item,
  currency,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, ModifierChoice>>(() => {
    // initialize required choices with the first choice
    const initial: Record<string, ModifierChoice> = {};
    item.modifierGroups?.forEach((group) => {
      if (group.required && group.choices.length > 0) {
        initial[group.name] = group.choices[0];
      }
    });
    return initial;
  });
  const [selectedAddons, setSelectedAddons] = useState<Record<string, ModifierChoice[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const toggleAddon = (groupName: string, choice: ModifierChoice) => {
    sound.playTap();
    setSelectedAddons((prev) => {
      const list = prev[groupName] || [];
      const exists = list.some((c) => c.id === choice.id);
      if (exists) {
        return { ...prev, [groupName]: list.filter((c) => c.id !== choice.id) };
      } else {
        return { ...prev, [groupName]: [...list, choice] };
      }
    });
  };

  const selectSingleChoice = (groupName: string, choice: ModifierChoice) => {
    sound.playTap();
    setSelectedChoices((prev) => ({
      ...prev,
      [groupName]: choice,
    }));
  };

  // Calculate unit price including modifiers
  let extraModifierTotal = 0;
  Object.values(selectedChoices).forEach((c) => (extraModifierTotal += c.price));
  Object.values(selectedAddons).forEach((list) => {
    list.forEach((c) => (extraModifierTotal += c.price));
  });

  const unitTotal = item.price + extraModifierTotal;
  const lineTotal = unitTotal * quantity;

  const handleConfirm = () => {
    sound.playTap();
    const formattedModifiers: { groupName: string; choiceName: string; price: number }[] = [];

    Object.entries(selectedChoices).forEach(([groupName, choice]) => {
      formattedModifiers.push({
        groupName,
        choiceName: choice.name,
        price: choice.price,
      });
    });

    Object.entries(selectedAddons).forEach(([groupName, choices]) => {
      choices.forEach((c) => {
        formattedModifiers.push({
          groupName,
          choiceName: c.name,
          price: c.price,
        });
      });
    });

    onAddToCart(item, quantity, formattedModifiers, specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/5 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{item.name}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Base: {currency} {item.price.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {item.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded-2xl border border-black/5 dark:border-white/5">
              {item.description}
            </p>
          )}

          {/* Modifier Groups */}
          {item.modifierGroups?.map((group) => {
            const isSingleSelect = group.required;

            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {group.name}
                  </h4>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    group.required 
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  }`}>
                    {group.required ? 'Required (Pick 1)' : 'Optional'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.choices.map((choice) => {
                    const isSelected = isSingleSelect
                      ? selectedChoices[group.name]?.id === choice.id
                      : (selectedAddons[group.name] || []).some((c) => c.id === choice.id);

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => {
                          if (isSingleSelect) {
                            selectSingleChoice(group.name, choice);
                          } else {
                            toggleAddon(group.name, choice);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-apple-blue bg-apple-blue/10 dark:bg-apple-blue/20 text-neutral-900 dark:text-white font-semibold'
                            : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected
                              ? 'bg-apple-blue border-apple-blue text-white'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs">{choice.name}</span>
                        </div>
                        {choice.price > 0 && (
                          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                            +{currency} {choice.price}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Kitchen / Special Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Kitchen Notes (e.g. extra crispy, sauce on side)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. no mayo, pack extra tissues"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
            />
          </div>
        </div>

        {/* Footer with Quantity Stepper and Add Button */}
        <div className="p-5 border-t border-black/5 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-900/80 flex items-center justify-between gap-4">
          {/* Apple Quantity Stepper */}
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <button
              onClick={() => {
                if (quantity > 1) {
                  sound.playTap();
                  setQuantity((q) => q - 1);
                }
              }}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm min-w-[20px] text-center text-neutral-900 dark:text-neutral-100">
              {quantity}
            </span>
            <button
              onClick={() => {
                sound.playTap();
                setQuantity((q) => q + 1);
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Primary Button */}
          <button
            onClick={handleConfirm}
            className="flex-1 apple-button py-3 px-6 rounded-2xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-sm shadow-apple-sm transition-all"
          >
            <span>Add to Order</span>
            <span className="mx-2 opacity-50">•</span>
            <span>{currency} {lineTotal.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
