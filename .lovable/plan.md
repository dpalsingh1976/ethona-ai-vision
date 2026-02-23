

## E-Grocery Demo with AI-Enhanced Hybrid Search

A standalone Indian grocery e-commerce demo at `/demo/e-grocery` with intelligent search powered by keyword matching + Lovable AI semantic query expansion.

### Architecture

Since OpenAI embeddings API isn't available, we'll implement a smart alternative:
- **Keyword search**: Postgres full-text search (tsvector + GIN index) -- fast and free
- **Semantic search**: Lovable AI expands the user's query into related terms/synonyms (e.g., "healthy snack" becomes "makhana, roasted chana, diet namkeen, murmura"), then runs a second keyword search with those terms
- **Hybrid scoring**: Combines direct keyword score (0.6 weight) with AI-expanded keyword score (0.4 weight)
- Architecture is ready to swap in pgvector embeddings later when an OpenAI key is added

### Database

**New table: `grocery_products`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| name | text | Product name |
| brand | text | Brand name |
| description | text | Product description |
| category | text | e.g., "Spices", "Dal", "Snacks" |
| subcategory | text | e.g., "Whole Spices", "Masoor Dal" |
| price | numeric | Price in INR |
| mrp | numeric | MRP for strikethrough |
| unit | text | e.g., "500g", "1kg", "1L" |
| image_url | text | Product image URL |
| tags | text[] | e.g., {"jain", "vrat", "organic"} |
| in_stock | boolean | default true |
| search_document | tsvector | Generated from name+brand+description+category+tags |
| created_at | timestamptz | default now() |

- GIN index on `search_document`
- RLS: public SELECT (no auth needed for demo), no INSERT/UPDATE/DELETE for anon
- Seed ~50 Indian grocery products across categories (Atta, Dal, Rice, Spices, Snacks, Ghee, Oil, Masala, Pickles, Papad, etc.)
- A trigger to auto-generate `search_document` on INSERT/UPDATE

### Edge Function: `grocery-search`

**POST `/grocery-search`** (public, no JWT)

Request: `{ "query": "string", "tags": ["jain", "diabetic"], "category": "string" }`

Logic:
1. If query is empty, return all products (filtered by tags/category if provided)
2. Run Postgres full-text keyword search using `ts_rank` on `search_document`
3. Send query to Lovable AI asking for related Indian grocery terms/synonyms (fast, using gemini-3-flash-preview)
4. Run a second keyword search using the AI-expanded terms
5. Merge and deduplicate results, combining scores with configurable weights
6. Return top 20 products with `final_score`, `keyword_score`, `semantic_score`

### Frontend Pages and Components

**New route**: `/demo/e-grocery`

**Page: `src/pages/demos/EGrocery.tsx`**
- Standalone page with Navbar + Footer (same pattern as RealEstateChatbot)
- Indian grocery theme (green/orange/saffron color palette)
- Header with store name "FreshBasket" and tagline

**Components in `src/components/e-grocery/`**:

1. **`SearchBar.tsx`** - Sticky search bar with debounced input (300ms), search icon, clear button
2. **`FilterChips.tsx`** - Horizontal scrollable chips: Jain, Diabetic-Friendly, Vrat Special, Organic, Gujarati, Sugar-Free
3. **`CategoryFilter.tsx`** - Category dropdown or horizontal scroll: All, Atta & Flour, Dal & Pulses, Rice, Spices, Snacks, Oil & Ghee, Masala, Pickles & Chutneys
4. **`ProductGrid.tsx`** - Responsive grid (2 cols mobile, 3 tablet, 4 desktop) of product cards
5. **`ProductCard.tsx`** - Card with image placeholder, name, brand, price/MRP, unit, tags as small badges, discount percentage
6. **`ScoreToggle.tsx`** - Debug toggle to show/hide similarity scores on each card (keyword_score, semantic_score, final_score)
7. **`SearchSkeleton.tsx`** - Loading skeleton grid matching the product card layout

**Search hook: `src/hooks/useGrocerySearch.ts`**
- Uses `useQuery` with debounced search term
- Calls the `grocery-search` edge function
- Manages loading, error, and empty states

### UI Design Details

- Color palette: Green (#16a34a) primary, Orange (#ea580c) accents, Saffron (#d97706) highlights
- Product cards with subtle shadows, rounded corners, hover lift effect
- Price shown in INR with rupee symbol, MRP strikethrough if discounted
- Tag badges in muted colors (green for organic, orange for jain, purple for vrat)
- "Powered by AI Search" subtle badge near search bar
- Mobile-first responsive layout
- Empty state with illustration when no results found

### Route and Demo Page Updates

- Add route `/demo/e-grocery` in `App.tsx`
- Add the e-grocery demo card to `Demo.tsx` in a new "E-Commerce" section

### Files to Create/Modify

| Action | File |
|--------|------|
| Create | `src/pages/demos/EGrocery.tsx` |
| Create | `src/components/e-grocery/SearchBar.tsx` |
| Create | `src/components/e-grocery/FilterChips.tsx` |
| Create | `src/components/e-grocery/CategoryFilter.tsx` |
| Create | `src/components/e-grocery/ProductGrid.tsx` |
| Create | `src/components/e-grocery/ProductCard.tsx` |
| Create | `src/components/e-grocery/ScoreToggle.tsx` |
| Create | `src/components/e-grocery/SearchSkeleton.tsx` |
| Create | `src/hooks/useGrocerySearch.ts` |
| Create | `supabase/functions/grocery-search/index.ts` |
| Modify | `src/App.tsx` (add route) |
| Modify | `src/pages/Demo.tsx` (add demo card) |
| Migration | Create `grocery_products` table, GIN index, trigger, seed data, RLS policies |
| Config | Add `grocery-search` to `supabase/config.toml` |

### Seed Data (50 products across categories)

Includes popular Indian grocery items: Tata Salt, Fortune Sunflower Oil, Aashirvaad Atta, MDH Chana Masala, Haldiram's Bhujia, Toor Dal, Basmati Rice, Mother's Recipe Pickle, Lijjat Papad, Amul Ghee, Saffola Gold Oil, Everest Garam Masala, Maggi Noodles, Parle-G Biscuits, Red Label Tea, Nescafe Coffee, etc. Each with realistic prices, categories, tags, and descriptions.

