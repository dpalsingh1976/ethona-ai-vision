
-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================
-- fp_categories
-- =====================
CREATE TABLE public.fp_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  occasion_tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fp_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_categories public read" ON public.fp_categories FOR SELECT USING (true);
CREATE POLICY "fp_categories service write" ON public.fp_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================
-- fp_products
-- =====================
CREATE TABLE public.fp_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.fp_categories(id) ON DELETE SET NULL,
  is_perishable BOOLEAN NOT NULL DEFAULT true,
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2),
  prep_time_days INTEGER NOT NULL DEFAULT 1,
  inventory_count INTEGER NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  shipping_class TEXT NOT NULL DEFAULT 'perishable' CHECK (shipping_class IN ('perishable', 'non_perishable')),
  delivery_constraints JSONB DEFAULT '{}',
  embedding VECTOR(1536),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fp_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_products public read" ON public.fp_products FOR SELECT USING (true);
CREATE POLICY "fp_products service write" ON public.fp_products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_fp_products_category ON public.fp_products(category_id);
CREATE INDEX idx_fp_products_tags ON public.fp_products USING GIN(tags);
CREATE TRIGGER fp_products_updated_at BEFORE UPDATE ON public.fp_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- fp_pickup_locations
-- =====================
CREATE TABLE public.fp_pickup_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  phone TEXT,
  hours TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fp_pickup_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_pickup_locations public read" ON public.fp_pickup_locations FOR SELECT USING (true);
CREATE POLICY "fp_pickup_locations service write" ON public.fp_pickup_locations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================
-- fp_admin_settings
-- =====================
CREATE TABLE public.fp_admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fp_admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_admin_settings public read" ON public.fp_admin_settings FOR SELECT USING (true);
CREATE POLICY "fp_admin_settings service write" ON public.fp_admin_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER fp_admin_settings_updated_at BEFORE UPDATE ON public.fp_admin_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- fp_cart_sessions
-- =====================
CREATE TABLE public.fp_cart_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  event_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fp_cart_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_cart_sessions public access" ON public.fp_cart_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER fp_cart_sessions_updated_at BEFORE UPDATE ON public.fp_cart_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- fp_orders
-- =====================
CREATE TABLE public.fp_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  guest_email TEXT,
  guest_name TEXT,
  event_type TEXT NOT NULL,
  custom_event_name TEXT,
  event_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('pickup', 'delivery')),
  pickup_location_id UUID REFERENCES public.fp_pickup_locations(id) ON DELETE SET NULL,
  shipping_address JSONB DEFAULT '{}',
  shipping_groups JSONB DEFAULT '[]',
  shipping_cost_breakdown JSONB DEFAULT '{}',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  stripe_payment_intent TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fp_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_orders owner read" ON public.fp_orders FOR SELECT USING (
  (user_id IS NOT NULL AND auth.uid() = user_id) OR user_id IS NULL
);
CREATE POLICY "fp_orders public insert" ON public.fp_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "fp_orders service update" ON public.fp_orders FOR UPDATE TO service_role USING (true);
CREATE TRIGGER fp_orders_updated_at BEFORE UPDATE ON public.fp_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- fp_order_items
-- =====================
CREATE TABLE public.fp_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.fp_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.fp_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  is_perishable BOOLEAN NOT NULL DEFAULT true,
  shipping_group TEXT DEFAULT 'perishable',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fp_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_order_items public insert" ON public.fp_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "fp_order_items service read" ON public.fp_order_items FOR SELECT TO service_role USING (true);

-- =====================
-- fp_inventory_events
-- =====================
CREATE TABLE public.fp_inventory_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.fp_products(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES public.fp_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fp_inventory_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_inventory_events service all" ON public.fp_inventory_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================
-- Seed: fp_admin_settings
-- =====================
INSERT INTO public.fp_admin_settings (key, value) VALUES
  ('delivery_radius_miles', '30'),
  ('local_delivery_price', '15'),
  ('min_perishable_advance_days', '8'),
  ('blackout_dates', '[]'),
  ('carriers', '{"ups": true, "fedex": true, "usps": true}'),
  ('same_day_cutoff_hour', '10'),
  ('warehouse_address', '{"street": "123 Flower Lane", "city": "San Jose", "state": "CA", "zip": "95112"}');

-- =====================
-- Seed: fp_pickup_locations
-- =====================
INSERT INTO public.fp_pickup_locations (name, address, city, state, zip, phone, hours) VALUES
  ('Downtown Flower Studio', '456 Rose Ave', 'San Jose', 'CA', '95110', '(408) 555-0101', 'Mon-Sat 9am-6pm, Sun 10am-4pm'),
  ('Eastside Garden Hub', '789 Blossom Blvd', 'Santa Clara', 'CA', '95050', '(408) 555-0202', 'Mon-Fri 8am-7pm, Sat-Sun 9am-5pm');

-- =====================
-- Seed: fp_categories
-- =====================
INSERT INTO public.fp_categories (name, slug, icon, occasion_tags, display_order) VALUES
  ('Garlands', 'garlands', '🌸', ARRAY['wedding','pooja','temple','festival'], 1),
  ('Bouquets', 'bouquets', '💐', ARRAY['birthday','anniversary','romantic','valentine'], 2),
  ('Décor', 'decor', '🌿', ARRAY['wedding','event','party','home'], 3),
  ('Puja Items', 'puja-items', '🪔', ARRAY['pooja','temple','festival','vrat'], 4),
  ('Centerpieces', 'centerpieces', '🌹', ARRAY['wedding','anniversary','event'], 5),
  ('Loose Flowers', 'loose-flowers', '🌼', ARRAY['pooja','temple','garland','bulk'], 6);
