'use client';

import React from 'react';
import { 
  Store, 
  UtensilsCrossed, 
  Receipt, 
  ChefHat, 
  LayoutGrid, 
  Bike, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  Download,
  BookOpen
} from 'lucide-react';
import type { Employee } from '@/types';

export type NavTab = 
  | 'pos' 
  | 'catalog'
  | 'orders' 
  | 'tables' 
  | 'delivery' 
  | 'inventory' 
  | 'employees' 
  | 'reports' 
  | 'settings';

interface AppleSidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeOrdersCount: number;
  activeDeliveryCount: number;
  lowStockCount: number;
  currentStaff: Employee | null;
  onOpenPinSwitch: () => void;
  onOpenInstall?: () => void;
}

export const AppleSidebar: React.FC<AppleSidebarProps> = ({
  currentTab,
  onSelectTab,
  activeOrdersCount,
  activeDeliveryCount,
  lowStockCount,
  currentStaff,
  onOpenPinSwitch,
  onOpenInstall,
}) => {
  const navItems = [
    { id: 'pos' as NavTab, label: 'POS Terminal', icon: UtensilsCrossed, badge: 0 },
    { id: 'catalog' as NavTab, label: 'Menu & Catalog', icon: BookOpen, badge: 0 },
    { id: 'orders' as NavTab, label: 'Live Orders', icon: Receipt, badge: activeOrdersCount, badgeColor: 'bg-apple-blue' },
    { id: 'tables' as NavTab, label: 'Table Layout', icon: LayoutGrid, badge: 0 },
    { id: 'delivery' as NavTab, label: 'Home Delivery', icon: Bike, badge: activeDeliveryCount, badgeColor: 'bg-apple-indigo' },
    { id: 'inventory' as NavTab, label: 'Inventory / Stock', icon: Package, badge: lowStockCount, badgeColor: 'bg-apple-red' },
    { id: 'employees' as NavTab, label: 'Brothers & Shifts', icon: Users, badge: 0 },
    { id: 'reports' as NavTab, label: 'Sales Reports', icon: BarChart3, badge: 0 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings, badge: 0 },
  ];

  return (
    <aside className="w-56 lg:w-60 xl:w-64 h-screen flex flex-col justify-between border-r border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#18181b]/70 backdrop-blur-2xl select-none z-30 transition-all shrink-0">
      {/* Brand Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-apple-md shadow-orange-500/20 text-white font-extrabold text-xl tracking-tight">
            HFC
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              HFC POS
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue">
                Pro
              </span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Hot &amp; Fast Chicken</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-[14px] transition-all duration-150 ${
                isActive
                  ? 'bg-apple-blue text-white shadow-apple-sm font-semibold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-white/25 text-white' 
                      : `${item.badgeColor || 'bg-apple-blue'} text-white shadow-sm`
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Download / Install App Trigger */}
      {onOpenInstall && (
        <div className="px-3 pb-2">
          <button
            onClick={onOpenInstall}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Desktop App</span>
          </button>
        </div>
      )}

      {/* Staff Account & Terminal Switch */}
      <div className="p-3 border-t border-black/5 dark:border-white/10">
        <div 
          onClick={onOpenPinSwitch}
          className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-between"
          title="Click to Switch Brother (1-Click Switch)"
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
              style={{ backgroundColor: currentStaff?.avatarColor || '#007AFF' }}
            >
              {currentStaff ? currentStaff.name.slice(0, 2).toUpperCase() : 'HA'}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                {currentStaff?.name || 'Haseeb'}
              </div>
              <div className="text-[11px] capitalize text-neutral-500 dark:text-neutral-400 font-medium">
                Partner &bull; On Duty
              </div>
            </div>
          </div>
          <button 
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Switch Brother"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
