
## Plan: Fix All Product Images — Accurate, Unique, Reliable Flower Photos

### Root Cause
All Unsplash `images.unsplash.com/photo-{id}` CDN URLs are broken (Unsplash now requires authorization headers for direct CDN access). Additionally, many products share the same URL, and some point to photos of people rather than flowers.

### Solution

**Two-part fix:**

**Part 1 — SQL Migration to update all 37 product image URLs**

Switch all products from broken `images.unsplash.com/photo-{id}` URLs to `source.unsplash.com/600x600/?{keyword}` format. This uses Unsplash's public redirect service (no auth needed in the browser) which returns the best matching photo for a keyword query. Every product gets a unique, accurate keyword that matches its actual flower type.

Complete mapping (all 37 products):

| Product | New Image URL |
|---|---|
| Rose Wedding Garland | `?rose,garland,wedding` |
| Marigold Pooja Garland | `?marigold,garland,flower` |
| Romantic Red Rose Bouquet | `?red,rose,bouquet` |
| Wedding Table Centerpiece | `?flower,centerpiece,arrangement` |
| Loose Marigold Flowers (1kg) | `?marigold,loose,orange,flower` |
| Lotus Flowers for Pooja | `?lotus,pink,flower,water` |
| Premium Flower Vase (Ceramic) | `?flower,vase,arrangement` |
| Dried Flower Wreath | `?dried,flower,wreath` |
| Anniversary Mixed Bouquet | `?mixed,bouquet,colorful,flower` |
| Jasmine Gajra (Hair Flowers) | `?jasmine,white,flower` |
| Artisan Floral Arrangement | `?floral,arrangement,stand` |
| Sunflower Cheer Bouquet | `?sunflower,bouquet,yellow` |
| Premium Marigold Wedding Garland | `?marigold,orange,garland,wedding` |
| Jasmine Gajra Hair Garland | `?jasmine,white,mogra,flower` |
| Rose Mandap Garland | `?rose,red,gold,garland` |
| Rajnigandha Tuberose Temple Garland | `?tuberose,white,flower,temple` |
| Sacred Lotus Bundle | `?lotus,pink,sacred,flower` |
| Chrysanthemum Pooja Wreath | `?chrysanthemum,yellow,flower` |
| Bulk Marigold Loose Flowers | `?marigold,orange,bulk,flower` |
| Wedding Sehra | `?jasmine,marigold,flower,garland` |
| Mehendi Ceremony Flower Basket | `?rose,jasmine,flower,basket` |
| Haldi Ceremony Marigold Bundle | `?marigold,yellow,flower,petals` |
| Navratri Nine-Color Flower Bundle | `?colorful,flower,bouquet,festive` |
| Pooja Thali Flower Set | `?marigold,rose,flower,offering` |
| Indian Rose Bouquet Red Pink | `?rose,red,pink,bouquet` |
| Rajasthani Mogra Jasmine Bouquet | `?jasmine,white,mogra,bouquet` |
| Gerbera Daisy Bollywood Bouquet | `?gerbera,daisy,colorful,bouquet` |
| Turmeric Marigold Bridal Shower | `?marigold,yellow,bridal,flower` |
| Carnation Marigold Festival Bunch | `?carnation,orange,flower,festival` |
| Phalaenopsis Orchid Arrangement | `?orchid,purple,white,flower` |
| Peony Bouquet Blush White | `?peony,blush,white,flower` |
| White Chrysanthemum Korean Bundle | `?chrysanthemum,white,flower` |
| Mixed Tropical Festival Bouquet | `?hibiscus,tropical,flower,bird-of-paradise` |
| Artificial Marigold Toran | `?marigold,decoration,door,flower` |
| Cherry Blossom Branch Décor | `?cherry,blossom,sakura,pink` |
| Lotus Silk Vase Arrangement | `?lotus,vase,silk,flower` |
| Diwali Marigold Decoration Kit | `?marigold,diwali,orange,decoration` |
| Silk Rose Garland Gold Red | `?rose,gold,red,garland` |

**Part 2 — Add `onError` fallback in ProductCard and ProductDetail**

If `source.unsplash.com` returns a redirect that fails in any browser, the `<img>` tag fires `onError`. Add a handler that replaces the `src` with a gradient CSS background (set image to empty string + show a beautiful flower emoji + colored gradient background per product type). This guarantees zero broken/blank images ever.

The fallback logic in `ProductCard.tsx`:
- Add `useState` for `imgError`
- `onError={() => setImgError(true)}`
- When `imgError=true`, show a styled div with a gradient background (warm gold for marigold, pink for rose, etc.) with a large flower emoji centered

### Files to Change

| File | Change |
|---|---|
| New migration file | `UPDATE fp_products SET images = ARRAY[...] WHERE id = '...'` for all 37 products — unique `source.unsplash.com` keyword URL per product |
| `src/components/flourist-place/shop/ProductCard.tsx` | Add `onError` fallback — replace broken image with gradient+emoji placeholder |
| `src/pages/flourist-place/ProductDetail.tsx` | Same `onError` fallback on the main product image |

### Build Order
1. SQL migration with `UPDATE` statements for all 37 product image URLs
2. Update `ProductCard.tsx` with `onError` image fallback
3. Update `ProductDetail.tsx` with `onError` image fallback
