
## Important Technical Note

The user requested Next.js 14 (App Router), but this is a **React + Vite + TypeScript** Lovable project. The platform will be built with the existing stack: React, Vite, Tailwind, shadcn/ui, Supabase. All routing will use React Router under the `/flouristPlace` prefix. The feature set, AI search, and backend architecture remain identical.

---

## Plan: FleuristPlace — AI-Powered Flower eCommerce Platform

This is a large, multi-phase build. It will be structured as a complete mini-app mounted at `/flouristPlace/*` routes, fully self-contained within the existing project.

---

### Phase 1 — Database Schema (Migration)

New tables to create:

```text
fp_categories         — id, name, slug, icon, occasion_tags[]
fp_products           — id, name, desc, category_id, is_perishable, price, 
                        prep_time_days, inventory_count, tags[], images[],
                        shipping_class, delivery_constraints (jsonb), embedding (vector)
fp_pickup_locations   — id, name, address, city, state, zip, is_active
fp_orders             — id, user_id, event_type, custom_event_name, event_date,
                        delivery_date, delivery_mode, pickup_location_id,
                        shipping_groups (jsonb), shipping_cost_breakdown (jsonb),
                        status, stripe_payment_intent, total_amount, created_at
fp_order_items        — id, order_id, product_id, quantity, unit_price, is_perishable
fp_inventory_events   — id, product_id, delta, reason, order_id, created_at
fp_admin_settings     — id, key, value (jsonb), updated_at
fp_cart_sessions      — id, session_token, items (jsonb), event_details (jsonb),
                        created_at, updated_at
```

Enable `pgvector` extension for AI semantic search on `fp_products.embedding`.

RLS:
- `fp_products`, `fp_categories`, `fp_pickup_locations`: public read
- `fp_orders`, `fp_order_items`: owner read/insert
- `fp_admin_settings`: service-role only write, authenticated read
- `fp_inventory_events`: service-role write only

---

### Phase 2 — Edge Functions

| Function | Purpose |
|---|---|
| `fp-search` | AI semantic search — embed query via Lovable AI, cosine similarity on `fp_products`, hybrid keyword + vector ranking, return ranked products |
| `fp-shipping-rules` | Rules engine — evaluate perishable/non-perishable split, apply min-days rules, fetch rates from configured carriers, return shipping groups |
| `fp-checkout` | Create order, deduct inventory, create Stripe PaymentIntent, return client_secret |
| `fp-delivery-dates` | Given product list + location, return valid delivery date calendar (block holidays, prep time, cutoff) |

---

### Phase 3 — Frontend Pages & Components

**Pages** under `src/pages/flourist-place/`:

```text
Index.tsx              — Home: hero, featured categories, occasion tiles
Products.tsx           — Product listing with filters + AI search bar
ProductDetail.tsx      — Detail page: images, event suitability, delivery estimate
Cart.tsx               — Cart: items grouped perishable/non-perishable
Checkout.tsx           — Multi-step: Event Details → Delivery Mode → Payment
OrderConfirmation.tsx  — Summary with event + delivery details
Admin.tsx              — Admin dashboard: settings, locations, products
```

**Shared components** under `src/components/flourist-place/`:

```text
layout/
  FPNavbar.tsx         — Floral-branded nav with cart icon
  FPFooter.tsx

shop/
  ProductCard.tsx      — Card with perishable badge, delivery estimate
  ProductGrid.tsx      — Responsive grid
  SearchBar.tsx        — AI search with auto-suggestions
  CategoryFilter.tsx
  OccasionTiles.tsx    — Wedding, Birthday, Pooja, Anniversary tiles

cart/
  CartItem.tsx
  CartGroupSummary.tsx — Perishable / non-perishable group split UI
  ShippingBreakdown.tsx

checkout/
  EventDetailsStep.tsx — Event type, event date, delivery date
  DeliveryModeStep.tsx — Pickup locations or shipping options
  PaymentStep.tsx      — Stripe Elements

admin/
  SettingsPanel.tsx
  PickupLocationsTable.tsx
  InventoryTable.tsx
```

---

### Phase 4 — Routes in App.tsx

Add under `/flouristPlace`:

```text
/flouristPlace                   → Home
/flouristPlace/products          → Product listing
/flouristPlace/products/:id      → Product detail
/flouristPlace/cart              → Cart
/flouristPlace/checkout          → Multi-step checkout
/flouristPlace/order/:id         → Order confirmation
/flouristPlace/admin             → Admin dashboard
```

---

### Phase 5 — AI Search Logic (`fp-search` edge function)

1. Receive `query` string + optional `occasion`, `max_price`, `date`
2. Call Lovable AI (`google/gemini-3-flash-preview`) with function-calling to:
   - Expand query into synonyms / occasion tags (e.g. "temple flowers" → ["pooja", "garland", "marigold"])
3. Generate text embedding via AI gateway for vector similarity
4. Run hybrid search: `pgvector` cosine similarity + PostgreSQL `ts_rank` keyword match
5. Filter by `inventory_count > 0` and delivery feasibility if date provided
6. Return ranked products + `ai_terms` for UI display

---

### Phase 6 — Shipping Rules Engine

**`fp-shipping-rules` edge function logic:**

```text
1. Read admin_settings: delivery_radius, local_delivery_price, 
   min_perishable_days, blackout_dates, carrier_toggles
2. Split cart items into perishable[] and non_perishable[]
3. For each group:
   a. If distance <= radius → local delivery (flat rate from settings)
   b. Else → fetch UPS/FedEx/USPS rates (stubbed with real API hooks)
4. For perishable group:
   - Enforce min advance days (configurable, default 8)
   - Only allow Overnight / 2-Day shipping options
   - Check if real-time inventory override applies
5. Return: { groups: [{type, items, shipping_options[], recommended}] }
```

---

### Phase 7 — Admin Settings Seed Data

Seed `fp_admin_settings` with defaults:

```json
{
  "delivery_radius_miles": 30,
  "local_delivery_price": 15,
  "min_perishable_advance_days": 8,
  "blackout_dates": [],
  "carriers": { "ups": true, "fedex": true, "usps": true },
  "same_day_cutoff_hour": 10,
  "warehouse_address": ""
}
```

Seed `fp_pickup_locations` with 2 example locations.

Seed `fp_categories` with: Garlands, Bouquets, Décor, Puja Items, Centerpieces, Loose Flowers.

Seed `fp_products` with ~12 sample products (perishable and non-perishable mix) with proper tags and categories.

---

### What This Build Produces

- Full shop UI with floral premium design (green/pink/cream palette)
- AI semantic search via Lovable AI gateway + pgvector hybrid scoring
- 3-step checkout with event capture, delivery mode selection, and Stripe payment
- Mixed cart split UI showing perishable vs non-perishable shipping groups
- Admin dashboard for no-code business rule management
- 8 new edge functions covering search, rules, checkout, and delivery calendar
- 1 migration with 8 new tables (all prefixed `fp_` to avoid collision)
- All routes mounted cleanly at `/flouristPlace/*`
- Fully self-contained — zero impact on existing routes

---

### Files to Create (~45 files)

**Migration**: 1 SQL migration file

**Edge Functions**: 4 new functions
- `supabase/functions/fp-search/index.ts`
- `supabase/functions/fp-shipping-rules/index.ts`
- `supabase/functions/fp-checkout/index.ts`
- `supabase/functions/fp-delivery-dates/index.ts`

**Pages**: 7 under `src/pages/flourist-place/`

**Components**: ~22 under `src/components/flourist-place/`

**Hooks**: 4 under `src/hooks/` (`useFleuristCart`, `useFleuristSearch`, `useFleuristProducts`, `useFleuristCheckout`)

**App.tsx**: Add 7 new routes

---

### Build Order

1. Database migration (tables + RLS + pgvector + seed data)
2. Edge functions (search, shipping rules, checkout, delivery dates)
3. React hooks (cart state, search, checkout flow)
4. UI components (bottom-up: atoms → molecules → pages)
5. Route wiring in App.tsx
6. Admin dashboard
