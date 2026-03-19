
## Plan: FleuristPlace — Indian/Asian Flower Catalog + Modern UI Redesign + End-to-End Cart Fix

### What needs to be done

**3 main goals:**
1. Add ~25 Indian/Asian flower products seeded into the database via the insert tool
2. Complete modern UI overhaul — premium feel with better hero, cards, typography, transitions
3. Fix end-to-end cart/checkout bugs — inventory deduction duplicate logic in `fp-checkout`, shipping options for pickup flow, and `DeliveryModeStep` edge case where delivery mode shows no options on first load

---

### Issue Audit Before Building

**fp-checkout/index.ts bugs (lines 120-162):**
- Inventory is deducted TWICE — once via failed RPC, and again via a direct update loop. The second loop also has a `placeholder` dummy update that hits no real row. Need to strip all but the working direct-update loop.

**DeliveryModeStep / Checkout.tsx:**
- Shipping rules are only fetched on "Continue to Delivery" from EventDetails step, but if user switches between pickup↔delivery, it re-fetches correctly via `handleDeliveryModeChange`. This flow is correct but needs `shippingAddress` field wired into ReviewStep — currently no address input is collected for delivery mode.

**ReviewStep:** No shipping address collection when `deliveryMode === "delivery"`. The `fp-checkout` edge function receives `shipping_address: {}` always. Need to add a simple address form inside ReviewStep or DeliveryModeStep.

---

### Phase 1 — Seed Indian/Asian Products (insert tool, NOT migration)

Insert ~28 new products covering:

**Indian Occasion Flowers:**
- Marigold Garland (pooja, temple, wedding) — fresh, perishable
- Jasmine Gajra Hair Garland (wedding, mehendi) — fresh
- Rose Mandap Garland (wedding) — fresh
- Tuberose (Rajnigandha) Garland — fresh
- Lotus Flowers Bundle (pooja) — fresh
- Chrysanthemum (Guldaudi) Wreath — fresh
- Marigold Loose Flowers 1kg (bulk pooja) — fresh
- Banana Leaf Decoration Pack (non-perishable)

**Asian / Chinese / Korean Flowers:**
- Orchid Arrangement (Chinese New Year, home décor) — fresh
- Peony Bouquet (Chinese New Year, wedding) — fresh
- Cherry Blossom Branch Décor — non-perishable
- Lotus Silk Flower Vase Arrangement — non-perishable
- White Chrysanthemum Bundle (Korean Chuseok) — fresh

**South Asian Occasions:**
- Diwali Marigold Decoration Kit — mixed (garland + loose)
- Navratri Flower Bundle — fresh
- Pooja Thali Flower Set — fresh
- Wedding Sehra (groom's flower veil) — fresh
- Mehendi Ceremony Flower Basket — fresh
- Haldi Ceremony Marigold Shower Bundle — fresh

**General Indian/Asian bouquets:**
- Indian Rose Bouquet (red/pink mix) — fresh
- Rajasthani Mogra (Jasmine) Bouquet — fresh
- Mixed Tropical Bouquet (hibiscus, bird of paradise) — fresh
- Carnation & Marigold Festival Bunch — fresh
- Gerbera Daisy Bollywood Bouquet — fresh
- Turmeric & Marigold Bridal Shower Bundle — fresh

**Non-perishable décor:**
- Artificial Marigold Toran Door Hanging — non-perishable
- Brass Puja Flower Stand Decoration — non-perishable
- Silk Rose Garland 6ft — non-perishable

Each product will use Unsplash/Pexels URLs for real flower images, proper tags matching occasion categories, and appropriate prep_time_days (3-10 days for wedding items).

---

### Phase 2 — Fix fp-checkout Edge Function

Remove the broken double-inventory-deduction. Keep only the working single direct-update loop. Also remove the `placeholder` dummy `.update()` call.

**File:** `supabase/functions/fp-checkout/index.ts` — lines 120-162 condensed to single clean loop.

---

### Phase 3 — Add Shipping Address Form to DeliveryModeStep

Add a collapsible address form (name, street, city, state, zip) inside `DeliveryModeStep` when mode is "delivery". Wire the address state from `useFleuristCheckout`'s `shippingAddress` / `setShippingAddress`.

**File:** `src/components/flourist-place/checkout/DeliveryModeStep.tsx`

Update `canProceed` logic to also require address fields when delivery mode is selected.

---

### Phase 4 — Modern UI Redesign

**Homepage (`src/pages/flourist-place/Index.tsx`):**
- Richer hero: full-width gradient with diagonal split, large serif headline with word highlight animation, two CTA buttons with better styling
- New "Why FleuristPlace" section: 3 horizontal feature cards with icons (freshness guarantee, event specialists, Indian/Asian occasions)
- Occasion tiles: redesign to larger cards with gradient backgrounds and hover lift effect
- Add a "Best Sellers" horizontal scroll rail for featured products on mobile

**Navbar (`FPNavbar.tsx`):**
- Add "Occasions" dropdown with Indian occasion links (Pooja, Wedding, Diwali, Mehendi)
- Add Cart count badge animation on add-to-cart

**ProductCard (`src/components/flourist-place/shop/ProductCard.tsx`):**
- Bigger image area (h-56 instead of h-52)
- Gradient overlay at bottom instead of white info box
- Star rating placeholder (4.5 stars visual)
- "Add to Cart" button visible on mobile (not just hover)
- Tags as colored chips below product name
- Occasion badge (e.g. "🪔 Pooja")

**OccasionTiles (`src/components/flourist-place/shop/OccasionTiles.tsx`):**
- Add more Indian occasions: Diwali, Navratri, Mehendi, Haldi, Eid
- Richer design: real photo backgrounds with overlay text (using CSS bg-image or gradient)

**ProductGrid:** Add "No results" state with AI suggestions.

**Cart Page (`src/pages/flourist-place/Cart.tsx`):**
- Sticky floating mini-cart summary at bottom on mobile
- More visual item rows with image thumbnails

**Checkout Progress Bar (`src/pages/flourist-place/Checkout.tsx`):**
- Animate step transitions
- Numbered circles with completed checkmarks

**OrderConfirmation (`src/pages/flourist-place/OrderConfirmation.tsx`):**
- Confetti effect (CSS animation)
- More detailed "What's next" timeline

**Global CSS (`src/index.css`):**
- Import Google Fonts: `Playfair Display` for serif, `Inter` for sans
- Add `font-serif` mapping to Playfair Display
- Refine `fp-*` color tokens: slightly warmer rose, deeper forest green
- Add `animate-float` keyframe for hero petals

---

### Phase 5 — Add Address Form in Checkout

**`src/components/flourist-place/checkout/DeliveryModeStep.tsx`:**
Add address fields section below shipping options when mode is "delivery":
- Full Name, Street Address, City, State, ZIP
- Validate all required before allowing "Review Order →"

---

### Files to Create/Edit

| File | Action |
|---|---|
| `supabase/functions/fp-checkout/index.ts` | Fix double inventory deduction |
| `src/pages/flourist-place/Index.tsx` | Hero redesign, new sections |
| `src/pages/flourist-place/Cart.tsx` | Mobile sticky summary, image thumbnails |
| `src/pages/flourist-place/OrderConfirmation.tsx` | Confetti, better timeline |
| `src/components/flourist-place/layout/FPNavbar.tsx` | Occasions dropdown, animations |
| `src/components/flourist-place/shop/ProductCard.tsx` | Modern card design |
| `src/components/flourist-place/shop/OccasionTiles.tsx` | More occasions, richer tiles |
| `src/components/flourist-place/checkout/DeliveryModeStep.tsx` | Address form, wire state |
| `src/index.css` | Playfair Display font, refined tokens |

**Data inserts (via insert tool):**
- ~28 new Indian/Asian products into `fp_products`
- Ensure categories have `asian-flowers` and `indian-occasions` entries

### Build Order
1. Insert product data (categories first, then products)
2. Fix fp-checkout edge function
3. Update CSS/fonts
4. Redesign UI components (ProductCard, OccasionTiles, Navbar)
5. Redesign pages (Home, Cart, OrderConfirmation)
6. Add address form to DeliveryModeStep
