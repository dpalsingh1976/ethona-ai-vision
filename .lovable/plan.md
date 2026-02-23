

## Fix Product Images - Replace Blocked URLs

### Problem
All 50 product image URLs point to BigBasket's CDN (`bigbasket.com/media/uploads/...`), which blocks hotlinking from external domains. Every image fails to load, triggering the fallback placeholder icon.

### Solution
Replace all 50 image URLs with publicly accessible alternatives. We have two options:

**Option A (Recommended): Use product images from open/permissive sources**
- Use URLs from sources that allow external embedding, such as:
  - Open Food Facts (`images.openfoodfacts.org`)
  - Wikimedia Commons
  - Brand official product pages that allow hotlinking
  - Placeholder product images from `via.placeholder.com` or `placehold.co` as a last resort

**Option B: Upload images to project storage**
- Download product images and upload them to the project's file storage bucket
- More reliable long-term but requires more setup

### Implementation (Option A)

Run a single SQL migration to update `image_url` for all 50 products with working URLs from sources that permit embedding. The `ProductCard` component already handles images correctly -- no code changes needed.

### Technical Details

| Item | Detail |
|------|--------|
| Root cause | BigBasket CDN blocks hotlinking (returns 403 or redirect) |
| Fix | Replace all 50 `image_url` values with embeddable URLs |
| Code changes | None -- `ProductCard.tsx` image rendering and fallback already work |
| Database changes | Single `UPDATE` query on `grocery_products` table |
| Fallback | Any still-broken URLs will gracefully show the placeholder icon |

