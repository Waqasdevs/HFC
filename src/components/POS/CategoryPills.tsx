'use client';

import React from 'react';
import type { Category } from '@/types';
import { Sparkles, Flame, UtensilsCrossed, Cookie, Coffee, Grid, Edit3 } from 'lucide-react';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onOpenCatalog?: () => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles': return Sparkles;
    case 'Flame': return Flame;
    case 'UtensilsCrossed': return UtensilsCrossed;
    case 'Cookie': return Cookie;
    case 'Coffee': return Coffee;
    default: return Grid;
  }
};

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onOpenCatalog,
}) => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none w-full min-w-0 flex-nowrap">
      <button
        onClick={() => onSelectCategory(null)}
        className={`apple-button shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
          selectedCategoryId === null
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-apple-sm ring-1 ring-neutral-900/10'
            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-neutral-700'
        }`}
      >
        <Grid className="w-3.5 h-3.5 mr-2 shrink-0" />
        <span>All Items</span>
      </button>

      {categories.map((cat) => {
        const Icon = getCategoryIcon(cat.icon);
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`apple-button shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              isSelected
                ? 'bg-apple-blue text-white shadow-apple-sm ring-1 ring-apple-blue/20'
                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5 mr-2 shrink-0" />
            <span>{cat.name}</span>
          </button>
        );
      })}

      {onOpenCatalog && (
        <>
          <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 shrink-0 mx-1" />
          <button
            onClick={onOpenCatalog}
            className="apple-button shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold text-apple-blue bg-apple-blue/10 hover:bg-apple-blue/20 transition-all whitespace-nowrap"
            title="Add or Edit Menu Items and Categories"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Edit Catalog</span>
          </button>
        </>
      )}
    </div>
  );
};
