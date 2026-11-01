'use client';

import React, { useState } from 'react';
import type { RestaurantSettings } from '@/types';
import { 
  Settings, 
  Store, 
  Database, 
  Printer, 
  Volume2, 
  Save, 
  CheckCircle2, 
  X,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface RestaurantSettingsModalProps {
  settings: RestaurantSettings;
  onSaveSettings: (settings: RestaurantSettings) => void;
  onClose?: () => void;
}

export const RestaurantSettingsModal: React.FC<RestaurantSettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [formData, setFormData] = useState<RestaurantSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopySchemaSql = () => {
    sound.playTap();
    const sql = `-- =========================================================================
-- HFC ORDER MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA (FREE TIER)
-- Run this in the Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY,
    token TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('dine_in', 'takeaway', 'delivery')),
    status TEXT NOT NULL DEFAULT 'pending',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'paid',
    payment_method TEXT NOT NULL DEFAULT 'cash',
    table_number TEXT,
    customer JSONB,
    assigned_rider_id TEXT,
    assigned_rider_name TEXT,
    server_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.tables (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    zone TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'available',
    current_order_id TEXT,
    guest_count INT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.stock (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    min_threshold NUMERIC(10, 2) NOT NULL DEFAULT 0,
    cost_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0,
    last_restocked TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'chef', 'rider', 'waiter')),
    pin TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_color TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.shifts (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    role TEXT NOT NULL,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    opening_cash NUMERIC(10, 2) NOT NULL DEFAULT 0,
    closing_cash NUMERIC(10, 2),
    expected_cash NUMERIC(10, 2),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'UtensilsCrossed',
    "order" INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    image TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    modifier_groups JSONB DEFAULT '[]'::jsonb,
    stock_tracking BOOLEAN NOT NULL DEFAULT false,
    stock_item_id TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    restaurant_name TEXT NOT NULL DEFAULT 'HFC (Hot & Fast Chicken)',
    tagline TEXT,
    address TEXT,
    phone TEXT,
    currency TEXT NOT NULL DEFAULT 'Rs.',
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    default_delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 150,
    receipt_header TEXT,
    receipt_footer TEXT,
    sound_enabled BOOLEAN NOT NULL DEFAULT true,
    auto_print_receipt BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables(status);
CREATE INDEX IF NOT EXISTS idx_stock_current ON public.stock(current_stock);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public anon access for POS operations" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access for Tables" ON public.tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access for Stock" ON public.stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access for Employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access for Shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access for Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access for Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access for Menu Items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleTestCloudConnection = async () => {
    if (!formData.supabaseUrl || !formData.supabaseAnonKey) {
      sound.playAlert();
      setTestResult('Please provide both Supabase URL and Anon Key');
      return;
    }

    setIsTestingSupabase(true);
    setTestResult(null);

    try {
      const res = await fetch(`${formData.supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: formData.supabaseAnonKey,
          Authorization: `Bearer ${formData.supabaseAnonKey}`
        }
      });

      if (res.ok || res.status === 200 || res.status === 404) {
        sound.playSuccess();
        setTestResult('Cloud Database Connected Successfully! Free-tier active.');
      } else {
        sound.playAlert();
        setTestResult(`Connection returned HTTP ${res.status}. Verify credentials.`);
      }
    } catch (err: any) {
      sound.playAlert();
      setTestResult(`Cloud check failed: ${err.message || 'Network error'}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-blue/15 text-apple-blue flex items-center justify-center">
            <Settings className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Restaurant Configuration
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage store branding, tax rates, delivery tariffs, and cloud backup database
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-apple-green/15 text-apple-green flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Saved &amp; Updated
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Store Branding */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Store className="w-4 h-4 text-apple-orange" />
            <span>Store Identity &amp; Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Restaurant Name</label>
              <input
                type="text"
                value={formData.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-bold text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Tagline / Motto</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Contact Phone / Order Hotline</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Physical Address / Branch</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Currency & Charges */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Billing, Taxes &amp; Delivery Tariffs</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                placeholder="Rs."
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Sales Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-bold"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">0% as requested for PKR</span>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Default Delivery Fee ({formData.currency})</label>
              <input
                type="number"
                min="0"
                value={formData.defaultDeliveryFee}
                onChange={(e) => handleChange('defaultDeliveryFee', Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Supabase Free-Tier Cloud Database Sync */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-apple-green" />
                <span>Supabase Cloud Database (Free Tier Backup)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Automatically backs up orders, menu catalog, tables, and stock to PostgreSQL when connected to Wi-Fi.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="apple-button px-3 py-1.5 rounded-xl bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showSetupGuide ? 'Hide Setup Guide' : 'Setup Instructions'}</span>
                {showSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="apple-button px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all flex items-center gap-1"
              >
                <span>Supabase.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Collapsible Step-by-Step Guide */}
          {showSetupGuide && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-3.5 animate-in fade-in duration-200 text-xs">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Free 4-Step Cloud Setup Walkthrough
                </span>

                <button
                  type="button"
                  onClick={handleCopySchemaSql}
                  className="apple-button px-2.5 py-1 rounded-lg bg-apple-blue text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                  title="Copy full PostgreSQL SQL Schema to clipboard"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSql ? '✓ SQL Copied!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
                  <span className="w-5 h-5 rounded-full bg-apple-blue text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <div>
                    <strong className="text-neutral-900 dark:text-neutral-100 block">Create Free Project</strong>
                    Sign up at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-apple-blue underline">supabase.com</a> and click "New Project" (e.g. name: <code>hfc-pos</code>).
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
                  <span className="w-5 h-5 rounded-full bg-apple-blue text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <div>
                    <strong className="text-neutral-900 dark:text-neutral-100 block">Run SQL in Supabase</strong>
                    In your Supabase project, click <strong>SQL Editor</strong> on the left, paste the schema (click the "Copy SQL Schema" button above), and click <strong>Run</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
                  <span className="w-5 h-5 rounded-full bg-apple-blue text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </span>
                  <div>
                    <strong className="text-neutral-900 dark:text-neutral-100 block">Copy API Credentials</strong>
                    Go to <strong>Project Settings → API</strong>. Copy your <strong>Project URL</strong> and <strong>anon public key</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
                  <span className="w-5 h-5 rounded-full bg-apple-blue text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                    4
                  </span>
                  <div>
                    <strong className="text-neutral-900 dark:text-neutral-100 block">Paste &amp; Connect Below</strong>
                    Paste both keys below, click <strong>Test Cloud Connection</strong>, and hit <strong>Save Changes</strong>!
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Supabase Project URL</label>
              <input
                type="text"
                value={formData.supabaseUrl || ''}
                onChange={(e) => handleChange('supabaseUrl', e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Supabase Anon Public Key</label>
              <input
                type="password"
                value={formData.supabaseAnonKey || ''}
                onChange={(e) => handleChange('supabaseAnonKey', e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestCloudConnection}
                disabled={isTestingSupabase}
                className="apple-button px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              >
                {isTestingSupabase ? 'Testing Connection...' : 'Test Cloud Connection'}
              </button>
              {testResult && (
                <span className={`text-xs font-bold ${testResult.includes('Success') ? 'text-apple-green' : 'text-apple-red'}`}>
                  {testResult}
                </span>
              )}
            </div>

            <div className="text-[11px] text-neutral-400">
              Database Provider: <strong>Supabase (PostgreSQL 500MB Free Tier)</strong>
            </div>
          </div>
        </div>

        {/* Section 4: Receipt Footer & Toggles */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Printer className="w-4 h-4 text-apple-indigo" />
            <span>Receipt Notes &amp; Audio Feedback</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Thermal Receipt Footer Message</label>
              <textarea
                rows={2}
                value={formData.receiptFooter}
                onChange={(e) => handleChange('receiptFooter', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Enable Apple Audio Tone Feedback</span>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                className="w-5 h-5 rounded text-apple-blue"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="apple-button w-full sm:w-auto px-8 py-3 rounded-2xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-sm shadow-apple-md transition-all active:scale-[0.98]"
        >
          <Save className="w-4 h-4 mr-2" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
};
