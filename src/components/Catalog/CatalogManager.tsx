'use client';

import React, { useState, useMemo } from 'react';
import type { MenuItem, Category, StockItem, ModifierOption, ModifierChoice } from '@/types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  UtensilsCrossed, 
  Cookie, 
  Coffee, 
  Grid, 
  Layers, 
  Package, 
  Sliders, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface CatalogManagerProps {
  menuItems: MenuItem[];
  categories: Category[];
  stockItems: StockItem[];
  currency: string;
  onSaveMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onToggleItemAvailability: (id: string, isAvailable: boolean) => void;
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles, label: 'Deals/Specials' },
  { name: 'Flame', icon: Flame, label: 'Fried/Grilled' },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed, label: 'Main Courses' },
  { name: 'Cookie', icon: Cookie, label: 'Sides/Snacks' },
  { name: 'Coffee', icon: Coffee, label: 'Drinks/Beverages' },
  { name: 'Layers', icon: Layers, label: 'Burgers/Sandwiches' },
  { name: 'Grid', icon: Grid, label: 'General' },
];

const getCategoryIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles': return Sparkles;
    case 'Flame': return Flame;
    case 'UtensilsCrossed': return UtensilsCrossed;
    case 'Cookie': return Cookie;
    case 'Coffee': return Coffee;
    case 'Layers': return Layers;
    default: return Grid;
  }
};

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  menuItems,
  categories,
  stockItems,
  currency,
  onSaveMenuItem,
  onDeleteMenuItem,
  onToggleItemAvailability,
  onSaveCategory,
  onDeleteCategory,
}) => {
  // Filters & State
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states for Item Modal
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemIsAvailable, setItemIsAvailable] = useState(true);
  const [itemStockTracking, setItemStockTracking] = useState(false);
  const [itemStockItemId, setItemStockItemId] = useState('');
  const [itemModifiers, setItemModifiers] = useState<ModifierOption[]>([]);

  // Form states for Category Modal
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('UtensilsCrossed');
  const [catOrder, setCatOrder] = useState<number>(1);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = selectedCatId ? item.categoryId === selectedCatId : true;
      const matchesSearch = searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'available'
          ? item.isAvailable
          : !item.isAvailable;
      return matchesCat && matchesSearch && matchesStatus;
    });
  }, [menuItems, selectedCatId, searchQuery, statusFilter]);

  // Open Add Item Modal
  const handleOpenAddItem = () => {
    sound.playTap();
    setEditingItem(null);
    setItemName('');
    setItemDesc('');
    setItemPrice(350);
    setItemCategoryId(categories[0]?.id || '');
    setItemIsAvailable(true);
    setItemStockTracking(false);
    setItemStockItemId('');
    setItemModifiers([]);
    setItemModalOpen(true);
  };

  // Open Edit Item Modal
  const handleOpenEditItem = (item: MenuItem) => {
    sound.playTap();
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description);
    setItemPrice(item.price);
    setItemCategoryId(item.categoryId);
    setItemIsAvailable(item.isAvailable);
    setItemStockTracking(!!item.stockTracking);
    setItemStockItemId(item.stockItemId || '');
    setItemModifiers(item.modifierGroups ? JSON.parse(JSON.stringify(item.modifierGroups)) : []);
    setItemModalOpen(true);
  };

  // Submit Menu Item Save
  const handleSaveItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || itemPrice < 0) {
      alert('Please enter a valid item name and price.');
      return;
    }

    sound.playSuccess();
    const targetCat = categories.find((c) => c.id === itemCategoryId) || categories[0];

    const newItemData: MenuItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      name: itemName.trim(),
      description: itemDesc.trim(),
      price: Number(itemPrice) || 0,
      categoryId: targetCat?.id || 'general',
      categoryName: targetCat?.name || 'General',
      isAvailable: itemIsAvailable,
      stockTracking: itemStockTracking,
      stockItemId: itemStockTracking ? itemStockItemId : undefined,
      modifierGroups: itemModifiers.length > 0 ? itemModifiers : undefined,
    };

    onSaveMenuItem(newItemData);
    setItemModalOpen(false);
  };

  // Open Add Category Modal
  const handleOpenAddCategory = () => {
    sound.playTap();
    setEditingCategory(null);
    setCatName('');
    setCatIcon('Flame');
    setCatOrder(categories.length + 1);
    setCategoryModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: Category) => {
    sound.playTap();
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatIcon(cat.icon);
    setCatOrder(cat.order);
    setCategoryModalOpen(true);
  };

  // Submit Category Save
  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert('Please enter a category name');
      return;
    }

    sound.playSuccess();
    const newCatData: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: catName.trim(),
      icon: catIcon,
      order: Number(catOrder) || 1,
    };

    onSaveCategory(newCatData);
    setCategoryModalOpen(false);
  };

  // Modifier Group Builders inside Item Modal
  const handleAddModifierGroup = () => {
    sound.playTap();
    const newGroup: ModifierOption = {
      id: `mod-${Date.now()}`,
      name: 'Spice Level',
      required: true,
      choices: [
        { id: `c-${Date.now()}-1`, name: 'Mild', price: 0 },
        { id: `c-${Date.now()}-2`, name: 'Spicy', price: 0 },
      ],
    };
    setItemModifiers([...itemModifiers, newGroup]);
  };

  const handleRemoveModifierGroup = (groupId: string) => {
    sound.playTap();
    setItemModifiers(itemModifiers.filter((g) => g.id !== groupId));
  };

  const handleAddChoiceToGroup = (groupId: string) => {
    sound.playTap();
    setItemModifiers(
      itemModifiers.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          choices: [
            ...group.choices,
            { id: `c-${Date.now()}`, name: 'Extra Cheese', price: 60 },
          ],
        };
      })
    );
  };

  const handleRemoveChoice = (groupId: string, choiceId: string) => {
    sound.playTap();
    setItemModifiers(
      itemModifiers.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          choices: group.choices.filter((c) => c.id !== choiceId),
        };
      })
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-blue/15 text-apple-blue flex items-center justify-center">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Menu &amp; Catalog Management
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Add and edit food dishes, customize prices, modifiers, and link ingredients
            </p>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddCategory}
            className="apple-button px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-apple-blue" />
            <span>New Category</span>
          </button>

          <button
            onClick={handleOpenAddItem}
            className="apple-button px-4 py-2 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-bold shadow-apple-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Food Item</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-apple-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Menu Items
            </span>
            <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
              {menuItems.length}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {categories.length} Categories
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-apple-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Available For Ordering
            </span>
            <div className="text-2xl font-black text-apple-green mt-1">
              {menuItems.filter((i) => i.isAvailable).length}
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-apple-green"></span>
        </div>

        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-apple-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Sold Out / Inactive
            </span>
            <div className="text-2xl font-black text-apple-red mt-1">
              {menuItems.filter((i) => !i.isAvailable).length}
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-apple-red"></span>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Categories</span>
          <span className="text-[11px] text-neutral-400">Click a category pill to filter, or hover to edit</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              sound.playTap();
              setSelectedCatId(null);
            }}
            className={`apple-button px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCatId === null
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-apple-sm'
                : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5 mr-2" />
            All ({menuItems.length})
          </button>

          {categories.map((cat) => {
            const IconComp = getCategoryIconComponent(cat.icon);
            const isSelected = selectedCatId === cat.id;
            const count = menuItems.filter((m) => m.categoryId === cat.id).length;

            return (
              <div key={cat.id} className="relative group inline-flex items-center">
                <button
                  onClick={() => {
                    sound.playTap();
                    setSelectedCatId(cat.id);
                  }}
                  className={`apple-button pl-3.5 pr-8 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-apple-blue text-white shadow-apple-sm'
                      : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/5 hover:bg-white'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 mr-1.5" />
                  <span>{cat.name}</span>
                  <span className="ml-1.5 opacity-60">({count})</span>
                </button>

                {/* Edit Category Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditCategory(cat);
                  }}
                  className={`absolute right-1.5 p-1 rounded-lg transition-opacity ${
                    isSelected
                      ? 'text-white/80 hover:text-white'
                      : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                  title={`Edit Category "${cat.name}"`}
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/60 dark:bg-[#1C1C1E]/60 p-3 rounded-2xl border border-black/5 dark:border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or description..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] font-bold text-neutral-400 mr-1">Status:</span>
          {(['all', 'available', 'unavailable'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.playTap();
                setStatusFilter(s);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            No dishes found matching your filter
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Try choosing another category, clearing your search, or add a new food item.
          </p>
          <button
            onClick={handleOpenAddItem}
            className="mt-4 apple-button px-4 py-2 bg-apple-blue text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const stockRecord = item.stockItemId
              ? stockItems.find((s) => s.id === item.stockItemId)
              : null;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-apple-sm flex flex-col justify-between space-y-4 hover:shadow-apple-md transition-all group"
              >
                {/* Top Badge & Availability Toggle */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {item.itemNumber && (
                        <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs">
                          #{item.itemNumber}
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {item.categoryName}
                      </span>
                    </div>

                    {/* Quick 1-Click Availability Switch */}
                    <button
                      onClick={() => {
                        sound.playTap();
                        onToggleItemAvailability(item.id, !item.isAvailable);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100'
                      }`}
                      title="Click to toggle Available vs Sold Out"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isAvailable ? 'bg-apple-green' : 'bg-apple-red'
                        }`}
                      />
                      <span>{item.isAvailable ? 'Available' : 'Sold Out'}</span>
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-apple-blue transition-colors leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                {/* Modifiers & Stock Linking Metadata */}
                <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5 text-[11px]">
                  {/* Stock Link */}
                  {item.stockTracking && stockRecord && (
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 font-medium">
                      <Package className="w-3.5 h-3.5 text-apple-orange" />
                      <span>
                        Deducts: <strong>{stockRecord.name}</strong> ({stockRecord.currentStock} {stockRecord.unit} left)
                      </span>
                    </div>
                  )}

                  {/* Modifier Groups Count */}
                  {item.modifierGroups && item.modifierGroups.length > 0 && (
                    <div className="flex items-center gap-1.5 text-apple-blue font-semibold">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>
                        {item.modifierGroups.length} Modifier Group
                        {item.modifierGroups.length > 1 ? 's' : ''} ({item.modifierGroups.map((g) => g.name).join(', ')})
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Price & Actions */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 mr-1">{currency}</span>
                    <span className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                      {item.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditItem(item)}
                      className="apple-button px-3 py-1.5 rounded-xl bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue text-xs font-bold transition-all flex items-center gap-1"
                      title="Edit Item details & price"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playTap();
                        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                          onDeleteMenuItem(item.id);
                        }
                      }}
                      className="p-2 rounded-xl text-neutral-400 hover:text-apple-red hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT MENU ITEM MODAL SHEET */}
      {/* ========================================================================= */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-modal border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-apple-blue/15 text-apple-blue flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                    {editingItem ? `Edit Dish: ${editingItem.name}` : 'Add New Food Item'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Update catalog pricing, description, and custom modifiers
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  setItemModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveItemSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Food Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Crispy Zinger Burger"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-semibold mt-1 focus:outline-none focus:ring-2 focus:ring-apple-blue"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Category *
                  </label>
                  <select
                    value={itemCategoryId}
                    onChange={(e) => setItemCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-semibold mt-1 focus:outline-none focus:ring-2 focus:ring-apple-blue"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Price ({currency}) *
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                      {currency}
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(Number(e.target.value) || 0)}
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-black text-apple-blue focus:outline-none focus:ring-2 focus:ring-apple-blue"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Availability
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700">
                    <input
                      type="checkbox"
                      checked={itemIsAvailable}
                      onChange={(e) => setItemIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded text-apple-blue"
                    />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      Active (Guests can order this dish)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300">Description</label>
                <textarea
                  rows={2}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Ingredients, cut, sauce, and serving details..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 focus:outline-none focus:ring-2 focus:ring-apple-blue"
                />
              </div>

              {/* Inventory Stock Linking */}
              <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-apple-orange" />
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      Link to Inventory Stock Deductions
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={itemStockTracking}
                    onChange={(e) => setItemStockTracking(e.target.checked)}
                    className="w-4 h-4 rounded text-apple-blue"
                  />
                </div>

                {itemStockTracking && (
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">
                      Choose which stock item to decrement by 1 each time this dish is ordered:
                    </label>
                    <select
                      value={itemStockItemId}
                      onChange={(e) => setItemStockItemId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-semibold"
                    >
                      <option value="">-- Select Linked Stock Item --</option>
                      {stockItems.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.currentStock} {s.unit} remaining)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Modifiers & Options Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-apple-blue" />
                      <span>Modifiers &amp; Add-ons (e.g. Spice Level, Extra Cheese)</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Configure customization groups for when cashier adds this item to cart
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddModifierGroup}
                    className="apple-button px-3 py-1.5 rounded-xl bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Modifier Group
                  </button>
                </div>

                {itemModifiers.map((group, gIdx) => (
                  <div
                    key={group.id}
                    className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 flex items-center gap-3">
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => {
                            const updated = [...itemModifiers];
                            updated[gIdx].name = e.target.value;
                            setItemModifiers(updated);
                          }}
                          placeholder="Group Name (e.g. Spice Level)"
                          className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 font-bold text-xs"
                        />

                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                          <input
                            type="checkbox"
                            checked={group.required}
                            onChange={(e) => {
                              const updated = [...itemModifiers];
                              updated[gIdx].required = e.target.checked;
                              setItemModifiers(updated);
                            }}
                            className="w-3.5 h-3.5 rounded text-apple-blue"
                          />
                          <span>Required (Pick 1)</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveModifierGroup(group.id)}
                        className="text-apple-red hover:underline text-[11px] font-semibold"
                      >
                        Remove Group
                      </button>
                    </div>

                    {/* Choices in this group */}
                    <div className="space-y-2 pl-2 border-l-2 border-neutral-200 dark:border-neutral-700">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Choices &amp; Extra Price:</span>

                      {group.choices.map((choice, cIdx) => (
                        <div key={choice.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={choice.name}
                            onChange={(e) => {
                              const updated = [...itemModifiers];
                              updated[gIdx].choices[cIdx].name = e.target.value;
                              setItemModifiers(updated);
                            }}
                            placeholder="Choice (e.g. Hot & Spicy)"
                            className="flex-1 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-xs"
                          />

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-neutral-400">+{currency}</span>
                            <input
                              type="number"
                              min="0"
                              value={choice.price}
                              onChange={(e) => {
                                const updated = [...itemModifiers];
                                updated[gIdx].choices[cIdx].price = Number(e.target.value) || 0;
                                setItemModifiers(updated);
                              }}
                              className="w-16 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-xs font-bold"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveChoice(group.id, choice.id)}
                            className="p-1 text-neutral-400 hover:text-apple-red"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddChoiceToGroup(group.id)}
                        className="text-[11px] font-bold text-apple-blue hover:underline flex items-center gap-1 mt-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Choice
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="flex-1 apple-button py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 apple-button py-2.5 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-bold shadow-apple-sm transition-all"
                >
                  Save Dish to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT CATEGORY MODAL */}
      {/* ========================================================================= */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-apple-modal border border-black/10 dark:border-white/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Crispy Broast, Wraps & Shawarma"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300">
                  Select Icon
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {AVAILABLE_ICONS.map((iconItem) => {
                    const Comp = iconItem.icon;
                    const isSelected = catIcon === iconItem.name;
                    return (
                      <button
                        key={iconItem.name}
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          setCatIcon(iconItem.name);
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-apple-blue bg-apple-blue/15 text-apple-blue font-bold shadow-sm'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <Comp className="w-4 h-4" />
                        <span className="text-[9px] truncate w-full text-center">{iconItem.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300">
                  Display Order Priority
                </label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-bold"
                />
              </div>

              {editingCategory && (
                <div className="pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      if (
                        confirm(
                          `Delete category "${editingCategory.name}"? Note: Items belonging to this category will become uncategorized.`
                        )
                      ) {
                        onDeleteCategory(editingCategory.id);
                        setCategoryModalOpen(false);
                      }
                    }}
                    className="text-apple-red hover:underline font-bold text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete this Category
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="flex-1 apple-button py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 apple-button py-2.5 rounded-xl bg-apple-blue text-white text-xs font-bold shadow-apple-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
