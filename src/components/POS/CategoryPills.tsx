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
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      <button
        onClick={() => onSelectCategory(null)}
        className={`apple-button px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
          selectedCategoryId === null
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-apple-sm'
            : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-neutral-700'
        }`}
      >
        <Grid className="w-3.5 h-3.5 mr-2" />
        All Items
      </button>

      {categories.map((cat) => {
        const Icon = getCategoryIcon(cat.icon);
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`apple-button px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-apple-blue text-white shadow-apple-sm'
                : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-neutral-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5 mr-2" />
            {cat.name}
          </button>
        );
      })}

      {onOpenCatalog && (
        <button
          onClick={onOpenCatalog}
          className="apple-button px-3.5 py-2 rounded-2xl text-xs font-bold text-apple-blue bg-apple-blue/10 hover:bg-apple-blue/20 transition-all whitespace-nowrap ml-auto"
          title="Add or Edit Menu Items and Categories"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
          Edit Catalog
        </button>
      )}
    </div>
  );
};
