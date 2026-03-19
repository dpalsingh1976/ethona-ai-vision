
-- Create fp-product-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('fp-product-images', 'fp-product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "fp product images public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'fp-product-images');

CREATE POLICY "fp product images public upload"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'fp-product-images');

CREATE POLICY "fp product images public update"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'fp-product-images');

CREATE POLICY "fp product images public delete"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'fp-product-images');

-- fp_products: allow public UPDATE, INSERT, DELETE (admin panel)
CREATE POLICY "fp_products admin update"
  ON public.fp_products FOR UPDATE TO public
  USING (true) WITH CHECK (true);

CREATE POLICY "fp_products admin insert"
  ON public.fp_products FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "fp_products admin delete"
  ON public.fp_products FOR DELETE TO public
  USING (true);

-- fp_pickup_locations: allow public write (admin panel)
CREATE POLICY "fp_pickup_locations admin write"
  ON public.fp_pickup_locations FOR ALL TO public
  USING (true) WITH CHECK (true);

-- fp_admin_settings: allow public write (admin panel)
CREATE POLICY "fp_admin_settings admin write"
  ON public.fp_admin_settings FOR ALL TO public
  USING (true) WITH CHECK (true);

-- fp_orders: allow public update (admin status changes)
CREATE POLICY "fp_orders admin update"
  ON public.fp_orders FOR UPDATE TO public
  USING (true);
