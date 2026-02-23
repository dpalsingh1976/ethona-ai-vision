

## Add Product Images to Grocery Products

Update all 50 grocery products with real product image URLs and modify the `ProductCard` component to display actual images instead of the placeholder icon.

### Approach

We'll use publicly available product images from popular Indian e-commerce CDNs (BigBasket, JioMart, Amazon India) or brand websites. These are publicly accessible image URLs that work well for demo purposes.

### Changes

**1. Update `ProductCard.tsx`**

Replace the static `Package` icon placeholder with an `<img>` tag that:
- Shows the product image when `image_url` is available
- Falls back to the `Package` icon placeholder when no image exists
- Uses `object-contain` to properly display product images without cropping
- Adds an `onError` handler to gracefully fall back to placeholder if an image fails to load

**2. Update product image URLs in the database**

Run a SQL update to set `image_url` for all 50 products using publicly available product image URLs from Indian grocery brands and retailers. Each URL will be a direct link to a product image.

### Technical Details

- No schema changes needed -- `image_url` column already exists
- Images will be loaded directly from external URLs (no storage needed for demo)
- The `ProductCard` will use a state-based fallback: try loading the image, show placeholder on error
- Images will use `object-contain` with a white/light background to look clean regardless of source image format

### Files to Modify

| Action | File |
|--------|------|
| Modify | `src/components/e-grocery/ProductCard.tsx` -- add image rendering with fallback |
| Data | SQL UPDATE statements to set `image_url` for all 50 products |

