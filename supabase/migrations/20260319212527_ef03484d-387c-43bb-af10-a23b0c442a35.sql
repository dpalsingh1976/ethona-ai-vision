-- Insert Asian Blooms category
INSERT INTO fp_categories (name, slug, icon, display_order, occasion_tags)
VALUES ('Asian Blooms', 'asian-blooms', '🌸', 7, ARRAY['lunar-new-year', 'chuseok', 'wedding', 'home-decor'])
ON CONFLICT (slug) DO NOTHING;

-- === INDIAN OCCASION FLOWERS (Perishable) ===
INSERT INTO fp_products (name, description, category_id, is_perishable, price, mrp, prep_time_days, inventory_count, shipping_class, tags, images)
VALUES 
(
  'Premium Marigold Wedding Garland',
  'Lush double-strand marigold garland, 6ft long — perfect for mandap decoration, varmala exchange, and entrance gates.',
  'bf47daa3-1a2d-4e8f-94e1-556574740743',
  true, 24.99, 32.00, 5, 80, 'perishable',
  ARRAY['wedding', 'pooja', 'marigold', 'garland', 'varmala', 'mandap', 'indian'],
  ARRAY['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop']
),
(
  'Jasmine Gajra Hair Garland',
  'Delicate mogra (jasmine) hair garland, 18 inches — the signature adornment for Indian brides and bridesmaids. Fragrant and fresh.',
  'bf47daa3-1a2d-4e8f-94e1-556574740743',
  true, 12.99, 18.00, 3, 60, 'perishable',
  ARRAY['wedding', 'mehendi', 'jasmine', 'gajra', 'bridal', 'mogra', 'indian'],
  ARRAY['https://images.unsplash.com/photo-1583759136431-9d70db3a1c99?w=800&auto=format&fit=crop']
),
(
  'Rose Mandap Garland — Red & Gold',
  'Showstopping 8ft garland of red roses and gold marigolds for mandap pillars and arches.',
  'bf47daa3-1a2d-4e8f-94e1-556574740743',
  true, 34.99, 45.00, 7, 40, 'perishable',
  ARRAY['wedding', 'mandap', 'rose', 'garland', 'ceremony', 'indian', 'decor'],
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop']
),
(
  'Rajnigandha (Tuberose) Temple Garland',
  'Pure white tuberose garland — revered in South Indian temples. Heavenly fragrance lasts all day.',
  'bf47daa3-1a2d-4e8f-94e1-556574740743',
  true, 15.99, 20.00, 2, 50, 'perishable',
  ARRAY['pooja', 'temple', 'tuberose', 'rajnigandha', 'jasmine', 'religious', 'south-indian'],
  ARRAY['https://images.unsplash.com/photo-1585116938217-1ff21427a38c?w=800&auto=format&fit=crop']
),
(
  'Sacred Lotus Bundle (12 stems)',
  'Fresh pink lotus flowers for Ganesh Puja, Lakshmi Pooja, and Buddhist offerings.',
  '7c460cdf-7d46-4660-ba6b-163937ccf25f',
  true, 19.99, 26.00, 2, 35, 'perishable',
  ARRAY['pooja', 'lotus', 'temple', 'religious', 'ganesh', 'lakshmi', 'buddhist', 'asian'],
  ARRAY['https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=800&auto=format&fit=crop']
),
(
  'Chrysanthemum (Guldaudi) Pooja Wreath',
  'Vibrant yellow and white chrysanthemum wreath for deity decoration and Navratri.',
  '7c460cdf-7d46-4660-ba6b-163937ccf25f',
  true, 16.99, 22.00, 3, 45, 'perishable',
  ARRAY['pooja', 'navratri', 'chrysanthemum', 'guldaudi', 'temple', 'wreath', 'indian'],
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop']
),
(
  'Bulk Marigold Loose Flowers — 1 kg',
  'Fresh bulk marigolds by the kilo — ideal for puja thali, floor rangoli, and entrance path decoration.',
  '7c460cdf-7d46-4660-ba6b-163937ccf25f',
  true, 9.99, 14.00, 1, 200, 'perishable',
  ARRAY['pooja', 'marigold', 'diwali', 'navratri', 'festival', 'bulk', 'rangoli', 'indian'],
  ARRAY['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop']
),
(
  'Wedding Sehra — Groom''s Flower Veil',
  'Traditional groom''s sehra made with fresh jasmine, rose petals, and marigolds. Made to order.',
  '87919e58-9437-4a0f-a9e3-9e84e1163edb',
  true, 39.99, 55.00, 7, 20, 'perishable',
  ARRAY['wedding', 'sehra', 'groom', 'bridal', 'jasmine', 'marigold', 'indian-wedding'],
  ARRAY['https://images.unsplash.com/photo-1583244685026-d8519b977e5d?w=800&auto=format&fit=crop']
),
(
  'Mehendi Ceremony Flower Basket',
  'Curated basket of rose petals, marigolds, and jasmine strands for the bride''s henna space.',
  '87919e58-9437-4a0f-a9e3-9e84e1163edb',
  true, 28.99, 38.00, 4, 30, 'perishable',
  ARRAY['mehendi', 'wedding', 'bridal', 'henna', 'rose', 'jasmine', 'indian-wedding'],
  ARRAY['https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?w=800&auto=format&fit=crop']
),
(
  'Haldi Ceremony Marigold Shower Bundle',
  'Specially designed bundle for haldi ritual — loose marigold petals and turmeric marigold mix.',
  '7c460cdf-7d46-4660-ba6b-163937ccf25f',
  true, 22.99, 30.00, 3, 40, 'perishable',
  ARRAY['haldi', 'wedding', 'marigold', 'turmeric', 'indian-wedding', 'ceremony', 'petals'],
  ARRAY['https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&auto=format&fit=crop']
),
(
  'Navratri Nine-Color Flower Bundle',
  'Nine bunches of flowers in Navratri''s nine sacred colors — ideal for daily pooja during the festival.',
  '7c460cdf-7d46-4660-ba6b-163937ccf25f',
  true, 29.99, 40.00, 2, 30, 'perishable',
  ARRAY['navratri', 'pooja', 'festival', 'nine-colors', 'indian', 'religious', 'devi'],
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop']
),
(
  'Pooja Thali Flower Set',
  'Pre-arranged set of marigold, rose, tulsi, and lotus — neatly packed and ready for offering.',
  '87919e58-9437-4a0f-a9e3-9e84e1163edb',
  true, 8.99, 12.00, 1, 100, 'perishable',
  ARRAY['pooja', 'thali', 'temple', 'daily-puja', 'marigold', 'rose', 'tulsi', 'lotus'],
  ARRAY['https://images.unsplash.com/photo-1585116938217-1ff21427a38c?w=800&auto=format&fit=crop']
),
(
  'Indian Rose Bouquet — Red & Pink Mix',
  'Hand-tied bouquet of 24 red and pink Indian roses with traditional satin ribbon.',
  '1092f982-b33c-407e-836d-66a97e8fc3c9',
  true, 32.99, 42.00, 3, 55, 'perishable',
  ARRAY['birthday', 'anniversary', 'rose', 'romantic', 'indian', 'bouquet', 'wedding'],
  ARRAY['https://images.unsplash.com/photo-1548094878-84ced0f0f90e?w=800&auto=format&fit=crop']
),
(
  'Rajasthani Mogra Jasmine Bouquet',
  'Dense cloud-like bouquet of fresh mogra buds — the legendary fragrance of Rajasthan.',
  '1092f982-b33c-407e-836d-66a97e8fc3c9',
  true, 18.99, 25.00, 2, 40, 'perishable',
  ARRAY['jasmine', 'mogra', 'romantic', 'pooja', 'gift', 'rajasthani', 'fragrant', 'indian'],
  ARRAY['https://images.unsplash.com/photo-1583759136431-9d70db3a1c99?w=800&auto=format&fit=crop']
),
(
  'Gerbera Daisy Bollywood Bouquet',
  '20 mixed-color gerbera daisies in the spirit of Bollywood — the most cheerful birthday gift.',
  '1092f982-b33c-407e-836d-66a97e8fc3c9',
  true, 26.99, 35.00, 2, 65, 'perishable',
  ARRAY['birthday', 'gerbera', 'colorful', 'bollywood', 'cheerful', 'indian', 'gift'],
  ARRAY['https://images.unsplash.com/photo-1490750967868-88df5691cc9e?w=800&auto=format&fit=crop']
),
(
  'Turmeric & Marigold Bridal Shower Bundle',
  'Golden marigold and turmeric flower bundle for bridal shower decoration.',
  '1092f982-b33c-407e-836d-66a97e8fc3c9',
  true, 44.99, 60.00, 5, 25, 'perishable',
  ARRAY['bridal-shower', 'wedding', 'marigold', 'turmeric', 'golden', 'indian-wedding', 'decor'],
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop']
),
(
  'Carnation & Marigold Festival Bunch',
  'Festive mixed bunch of carnations and marigolds in orange, yellow, and red for Diwali gifting.',
  '1092f982-b33c-407e-836d-66a97e8fc3c9',
  true, 14.99, 20.00, 2, 70, 'perishable',
  ARRAY['diwali', 'festival', 'carnation', 'marigold', 'gift', 'indian', 'colorful'],
  ARRAY['https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&fit=crop']
),
(
  'Phalaenopsis Orchid Arrangement',
  'Elegant white and purple orchids in a modern pot — the classic Chinese New Year gift for luck and prosperity.',
  (SELECT id FROM fp_categories WHERE slug = 'asian-blooms'),
  true, 48.99, 65.00, 5, 25, 'perishable',
  ARRAY['orchid', 'lunar-new-year', 'chinese-new-year', 'home-decor', 'lucky', 'asian', 'elegant'],
  ARRAY['https://images.unsplash.com/photo-1490750967868-88df5691cc9e?w=800&auto=format&fit=crop']
),
(
  'Peony Bouquet — Blush & White',
  'Lush peonies in soft blush and white — treasured for Chinese weddings symbolizing good luck.',
  (SELECT id FROM fp_categories WHERE slug = 'asian-blooms'),
  true, 54.99, 72.00, 4, 20, 'perishable',
  ARRAY['peony', 'chinese-wedding', 'lunar-new-year', 'blush', 'luck', 'asian', 'wedding'],
  ARRAY['https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop']
),
(
  'White Chrysanthemum Bundle — Korean Style',
  '12 stems of premium white chrysanthemums for Chuseok ancestral offerings and Korean home décor.',
  (SELECT id FROM fp_categories WHERE slug = 'asian-blooms'),
  true, 21.99, 28.00, 2, 35, 'perishable',
  ARRAY['chrysanthemum', 'chuseok', 'korean', 'white', 'ancestral', 'offering', 'asian'],
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop']
),
(
  'Mixed Tropical Festival Bouquet',
  'Bold hibiscus, bird of paradise, and heliconia — the vibrant soul of Southeast Asian festivals.',
  '1092f982-b33c-407e-836d-66a97e8fc3c9',
  true, 38.99, 50.00, 3, 30, 'perishable',
  ARRAY['tropical', 'hibiscus', 'bird-of-paradise', 'festival', 'asian', 'southeast-asian', 'bold'],
  ARRAY['https://images.unsplash.com/photo-1444930694458-01babdd27337?w=800&auto=format&fit=crop']
),
(
  'Artificial Marigold Toran Door Hanging',
  'Handcrafted 5ft decorative toran of faux marigolds for doors and windows. Reusable across festivals.',
  'aa742a96-ac10-4951-8354-d2af4b051acb',
  false, 17.99, 25.00, 1, 150, 'non_perishable',
  ARRAY['diwali', 'toran', 'door', 'marigold', 'artificial', 'reusable', 'festival', 'decor'],
  ARRAY['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop']
),
(
  'Cherry Blossom Branch Décor — Set of 3',
  'Realistic silk cherry blossom branches, 36 inches each. Stunning for Chinese New Year and Japanese-inspired décor.',
  (SELECT id FROM fp_categories WHERE slug = 'asian-blooms'),
  false, 29.99, 40.00, 1, 60, 'non_perishable',
  ARRAY['cherry-blossom', 'sakura', 'lunar-new-year', 'japanese', 'home-decor', 'silk', 'asian'],
  ARRAY['https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=800&auto=format&fit=crop']
),
(
  'Lotus Silk Vase Arrangement',
  'Handcrafted lotus and lily pad arrangement in a celadon ceramic vase. Timeless Asian aesthetic.',
  (SELECT id FROM fp_categories WHERE slug = 'asian-blooms'),
  false, 44.99, 60.00, 1, 40, 'non_perishable',
  ARRAY['lotus', 'silk', 'vase', 'home-decor', 'asian', 'zen', 'office', 'gift'],
  ARRAY['https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=800&auto=format&fit=crop']
),
(
  'Silk Rose Garland 6ft — Gold & Red',
  'Premium silk rose garland in auspicious gold and red for Chinese New Year, Diwali, and Indian wedding backdrops.',
  'bf47daa3-1a2d-4e8f-94e1-556574740743',
  false, 22.99, 32.00, 1, 80, 'non_perishable',
  ARRAY['silk', 'garland', 'gold', 'red', 'chinese-new-year', 'diwali', 'wedding', 'reusable'],
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop']
),
(
  'Diwali Marigold Decoration Kit',
  'Complete Diwali décor kit: 3 marigold garlands, 1 toran, loose flower pack, and petal rangoli mix.',
  'aa742a96-ac10-4951-8354-d2af4b051acb',
  false, 52.99, 70.00, 1, 45, 'non_perishable',
  ARRAY['diwali', 'marigold', 'toran', 'garland', 'rangoli', 'kit', 'festival', 'indian'],
  ARRAY['https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&auto=format&fit=crop']
);
