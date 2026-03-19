

## Plan: Complete Admin Dashboard — Product Image Upload + Full CRUD + All Business Settings

### What's Currently Missing

The current `Admin.tsx` is a stub with:
- Read-only inventory table (only stock count can be edited inline)
- No product photo upload
- No product create/edit/delete
- No ability to add/edit pickup locations
- No holiday/blackout date management
- No warehouse address setting
- Settings tab has no "Add Location" button and can't edit location details
- No storage bucket for product images

### What We're Building

**5 fully working admin tabs:**

1. **Products** (new) — full product CRUD with image upload per product
2. **Business Rules** (existing, enhanced) — add warehouse address + holiday blackouts
3. **Pickup Locations** (existing, enhanced) — add/edit/delete locations inline
4. **Inventory** (existing, enhanced) — bulk stock adjustment with visual indicators
5. **Orders** (new) — read-only recent orders view

---

### Phase 1 — Storage Bucket Migration

Create `fp-product-images` Supabase Storage bucket (public) via SQL migration:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('fp-product-images', 'fp-product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']);

-- Allow public read
CREATE POLICY "fp product images public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'fp-product-images');

-- Allow anyone to upload (admin panel — no auth required for demo)
CREATE POLICY "fp product images public upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'fp-product-images');

-- Allow update/delete too
CREATE POLICY "fp product images public update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'fp-product-images');
CREATE POLICY "fp product images public delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'fp-product-images');
```

Also add an `fp_products` UPDATE policy for the public role (currently only `service_role` can write):
```sql
CREATE POLICY "fp_products admin update" ON public.fp_products FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "fp_products admin insert" ON public.fp_products FOR INSERT TO public WITH CHECK (true);
```

And for pickup locations:
```sql
CREATE POLICY "fp_pickup_locations admin write" ON public.fp_pickup_locations FOR ALL TO public USING (true) WITH CHECK (true);
```

---

### Phase 2 — Rewrite `Admin.tsx` (Complete)

Replace the existing stub with a full 5-tab admin dashboard:

**Tab: Products**
- Product list with thumbnail, name, price, category, stock, active toggle
- "Add Product" button → opens slide-over panel
- Each row has Edit and Delete actions
- Image upload: click product row → image upload section at top of edit form
  - Upload button → `<input type="file" accept="image/*">` → uploads to `fp-product-images` storage bucket → stores public URL in `fp_products.images[0]`
  - Shows current image preview OR fallback gradient
  - "Replace image" to upload new one
- Edit fields: Name, Description, Price, MRP, Category, Tags (comma-sep), is_perishable toggle, prep_time_days, inventory_count, is_active toggle, shipping_class

**Tab: Business Rules**
- All existing fields (delivery radius, local delivery price, min perishable days, same-day cutoff)
- NEW: Warehouse Address (text input → stored as `warehouse_address` in `fp_admin_settings`)
- NEW: Holiday Blackout Dates — date picker that adds dates to a list, shows them as chips with ×remove
- Carrier toggles (already exist)
- Save button

**Tab: Pickup Locations**
- List of locations with full details
- "Add Location" button → inline form at top
- Edit button per row → expands inline edit form with all fields: name, address, city, state, zip, phone, hours
- Enable/Disable toggle (already exists)
- Delete button with confirmation

**Tab: Inventory**
- Existing table but with:
  - Product thumbnail
  - Low stock warning (red if ≤ 5, amber if ≤ 10)
  - Quick +/− buttons alongside the number input
  - "Save All" batch update button

**Tab: Orders** (new, read-only)
- Recent 50 orders from `fp_orders`
- Columns: Order #, Guest Name/Email, Event Type, Event Date, Delivery Date, Mode, Total, Status
- Status badge (pending/confirmed/shipped/delivered)
- Expandable row showing order items

---

### Phase 3 — Image Upload Helper Component

Create `src/components/flourist-place/admin/ProductImageUpload.tsx`:
- Receives `productId` + current `images[]` array
- Shows image preview (or gradient fallback)
- `<label>` wrapping hidden `<input type="file">` 
- On change: uploads file to `fp-product-images/${productId}/${filename}` using `supabase.storage.from('fp-product-images').upload()`
- Gets public URL via `supabase.storage.from('fp-product-images').getPublicUrl(path)`
- Calls `supabase.from('fp_products').update({ images: [publicUrl] }).eq('id', productId)`
- Shows upload progress spinner
- Toast on success/error

---

### Phase 4 — Product List/Edit Panel Component

Create `src/components/flourist-place/admin/ProductEditPanel.tsx` (slide-over drawer):
- Slide in from right (using existing `Sheet` component from shadcn/ui)
- All product fields with `useFleuristProducts` style data
- Save calls `supabase.from('fp_products').update(...)` or `.insert(...)` 
- Image upload section at top
- Categories dropdown populated from `fp_categories`

---

### Phase 5 — ProductCard and ProductDetail: Real-time Image Refresh

After admin uploads a new image, the products listing should show the new image. Since we're already reading from DB, a simple page refresh or re-query picks it up. The `useFleuristProducts.reload()` function already exists — we just need to call it after any product save in admin.

---

### Files to Create/Edit

| File | Action |
|---|---|
| New migration | Storage bucket + RLS policies for fp-product-images + fp_products public write |
| `src/pages/flourist-place/Admin.tsx` | Complete rewrite — 5-tab full admin |
| `src/components/flourist-place/admin/ProductImageUpload.tsx` | New — image upload component |
| `src/components/flourist-place/admin/ProductEditPanel.tsx` | New — slide-over edit/create panel |

### Technical Notes

- No auth needed on admin for this demo (matches original spec — admin is an internal tool page)
- Storage public URL format: `https://{project}.supabase.co/storage/v1/object/public/fp-product-images/{path}`
- After image upload, update `fp_products.images = ARRAY[newUrl]` so all existing ProductCard and ProductDetail components immediately reflect the change on next load
- The `fp_products` RLS currently only allows service_role writes. The migration must add a public write policy so the browser client can do `update`/`insert` from the admin page

