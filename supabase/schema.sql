-- =========================================================================
-- HFC ORDER MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA (FREE TIER)
-- Run this in the Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- Note: This schema is 100% idempotent (safe to run multiple times).
-- =========================================================================

-- 1. Orders Table
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

-- 2. Restaurant Dining Tables
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

-- 3. Stock & Ingredients Inventory
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

-- 4. Staff & Employees
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'chef', 'rider', 'waiter')),
    pin TEXT DEFAULT '',
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_color TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Shifts & Cash Register Reconciliation
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

-- 6. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'UtensilsCrossed',
    "order" INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. Menu Items Catalog
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

-- 8. Restaurant Settings
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

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON public.orders(type);
CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables(status);
CREATE INDEX IF NOT EXISTS idx_stock_current ON public.stock(current_stock);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);

-- Safely Enable Supabase Realtime Broadcasting (Prevents 42710 "already member of publication" error)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tables') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'stock') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stock;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'menu_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'categories') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  END IF;
END $$;

-- Row Level Security (Permissive for POS Terminal with Anon Key)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Idempotent Security Policies (drops if exists before creating to prevent duplicate policy errors)
DROP POLICY IF EXISTS "Allow public anon access for POS operations" ON public.orders;
CREATE POLICY "Allow public anon access for POS operations" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for Tables" ON public.tables;
CREATE POLICY "Allow public anon access for Tables" ON public.tables FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for Stock" ON public.stock;
CREATE POLICY "Allow public anon access for Stock" ON public.stock FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for Employees" ON public.employees;
CREATE POLICY "Allow public anon access for Employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for Shifts" ON public.shifts;
CREATE POLICY "Allow public anon access for Shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for Settings" ON public.settings;
CREATE POLICY "Allow public anon access for Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for Categories" ON public.categories;
CREATE POLICY "Allow public anon access for Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anon access for Menu Items" ON public.menu_items;
CREATE POLICY "Allow public anon access for Menu Items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
