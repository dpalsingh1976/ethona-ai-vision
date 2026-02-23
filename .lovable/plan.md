

## Populate Product Images in Database

All 50 grocery products currently have `image_url = null`, so every product shows the fallback placeholder icon. The `ProductCard` component's image rendering and error fallback logic are working correctly -- we just need data.

### What We'll Do

Run a database update to set `image_url` for all 50 products using publicly accessible product image URLs from Indian grocery brands and e-commerce platforms.

### Image Sources

We'll use high-quality, publicly available product images from sources like:
- **Brand official websites** (e.g., Amul, Tata, Britannia, ITC)
- **Open product image APIs** (e.g., Open Food Facts)
- **Retailer CDNs** (BigBasket, JioMart, Swiggy Instamart)

### Technical Details

- Single SQL migration with `UPDATE` statements mapping each product name to its image URL
- No schema changes needed
- Images load lazily (`loading="lazy"` already set) for performance
- Error fallback already implemented in `ProductCard` -- any broken URLs will gracefully show the placeholder

### Products to Update (all 50)

Covering all categories: Atta and Flour, Dal and Pulses, Rice, Masala and Spices, Oil and Ghee, Snacks, Beverages, Pickles and Chutneys, Papad, Dairy, Instant Food, Dry Fruits, and Sweeteners.

