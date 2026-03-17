

## Generate Unique AI Images for All 50 Grocery Products

### Overview
Generate an individual, unique AI image for each of the 50 products in the database and store them locally in the `public/grocery/` directory, then update the database URLs to point to the new files.

### Approach
Use the AI image generation model (`google/gemini-2.5-flash-image`) to create a realistic product photo for each item. Each image will be prompted with the product name, brand, and category to ensure uniqueness.

### Steps

**Step 1: Generate images in batches**
Generate all 50 product images using prompts like:
> "A realistic product photo of [Brand] [Product Name] package on a clean white background, Indian grocery product, professional product photography"

Save each image to `public/grocery/` with a slug-based filename (e.g., `aashirvaad-whole-wheat-atta.jpg`).

Images will be generated in parallel batches of ~5-6 at a time to stay efficient.

**Step 2: Update database URLs**
Run a single SQL UPDATE mapping each product name to its new unique image path (e.g., `/grocery/aashirvaad-whole-wheat-atta.jpg`).

### All 50 Products

| # | Product | Brand | File |
|---|---------|-------|------|
| 1 | Aashirvaad Whole Wheat Atta | Aashirvaad | aashirvaad-whole-wheat-atta.jpg |
| 2 | Besan (Gram Flour) | Rajdhani | besan-gram-flour.jpg |
| 3 | Maida (Refined Flour) | Aashirvaad | maida-refined-flour.jpg |
| 4 | Pillsbury Chakki Fresh Atta | Pillsbury | pillsbury-chakki-fresh-atta.jpg |
| 5 | Sooji (Semolina) | Aashirvaad | sooji-semolina.jpg |
| 6 | Bru Instant Coffee | Bru | bru-instant-coffee.jpg |
| 7 | Nescafe Classic Coffee | Nescafe | nescafe-classic-coffee.jpg |
| 8 | Red Label Tea | Brooke Bond | red-label-tea.jpg |
| 9 | Tata Tea Premium | Tata | tata-tea-premium.jpg |
| 10 | Chana Dal | Tata Sampann | chana-dal.jpg |
| 11 | Kabuli Chana (Chickpeas) | Tata Sampann | kabuli-chana.jpg |
| 12 | Masoor Dal | Tata Sampann | masoor-dal.jpg |
| 13 | Moong Dal | Tata Sampann | moong-dal.jpg |
| 14 | Rajma (Kidney Beans) | Tata Sampann | rajma-kidney-beans.jpg |
| 15 | Toor Dal (Arhar) | India Gate | toor-dal.jpg |
| 16 | Dry Fruits Mix | Nutraj | dry-fruits-mix.jpg |
| 17 | Jaggery (Gur) | Miltop | jaggery-gur.jpg |
| 18 | Sabudana (Tapioca Pearls) | Swad | sabudana-tapioca.jpg |
| 19 | Sugar (Sulphurless) | Trust | sugar-sulphurless.jpg |
| 20 | Catch Turmeric Powder | Catch | catch-turmeric-powder.jpg |
| 21 | Everest Garam Masala | Everest | everest-garam-masala.jpg |
| 22 | MDH Chana Masala | MDH | mdh-chana-masala.jpg |
| 23 | MDH Deggi Mirch | MDH | mdh-deggi-mirch.jpg |
| 24 | Sendha Namak (Rock Salt) | Tata | sendha-namak.jpg |
| 25 | Tata Salt | Tata | tata-salt.jpg |
| 26 | Whole Coriander Seeds | Catch | whole-coriander-seeds.jpg |
| 27 | Whole Cumin Seeds (Jeera) | Catch | whole-cumin-seeds.jpg |
| 28 | Amul Pure Ghee | Amul | amul-pure-ghee.jpg |
| 29 | Coconut Oil | Parachute | coconut-oil.jpg |
| 30 | Fortune Sunflower Oil | Fortune | fortune-sunflower-oil.jpg |
| 31 | Mustard Oil (Kachi Ghani) | Fortune | mustard-oil.jpg |
| 32 | Saffola Gold Refined Oil | Saffola | saffola-gold-oil.jpg |
| 33 | Lijjat Papad - Moong | Lijjat | lijjat-papad-moong.jpg |
| 34 | Lijjat Papad - Urad | Lijjat | lijjat-papad-urad.jpg |
| 35 | Mother's Recipe Mango Pickle | Mother's Recipe | mango-pickle.jpg |
| 36 | Pravin Mixed Pickle | Pravin | pravin-mixed-pickle.jpg |
| 37 | MTR Ready to Eat Poha | MTR | mtr-poha.jpg |
| 38 | MTR Ready to Eat Upma | MTR | mtr-upma.jpg |
| 39 | Saffola Oats | Saffola | saffola-oats.jpg |
| 40 | Daawat Rozana Gold Basmati | Daawat | daawat-basmati.jpg |
| 41 | India Gate Basmati Rice | India Gate | india-gate-rice.jpg |
| 42 | Bikaji Bikaneri Bhujia | Bikaji | bikaji-bhujia.jpg |
| 43 | Britannia Good Day Cookies | Britannia | britannia-good-day.jpg |
| 44 | Haldiram Aloo Bhujia | Haldiram | haldiram-aloo-bhujia.jpg |
| 45 | Haldiram Bhujia | Haldiram | haldiram-bhujia.jpg |
| 46 | Maggi 2-Minute Noodles | Maggi | maggi-noodles.jpg |
| 47 | Murmura (Puffed Rice) | Local | murmura-puffed-rice.jpg |
| 48 | Parle-G Biscuits | Parle | parle-g-biscuits.jpg |
| 49 | Roasted Chana | Jabsons | roasted-chana.jpg |
| 50 | Roasted Makhana (Fox Nuts) | Farmley | roasted-makhana.jpg |

### Technical Details

| Item | Detail |
|------|--------|
| AI model | google/gemini-2.5-flash-image |
| Image count | 50 unique images |
| Storage | `public/grocery/` directory (local assets) |
| Database | Single UPDATE query mapping product names to new paths |
| Code changes | None needed -- ProductCard already renders images correctly |
| Estimated batches | ~10 batches of 5 images each |

