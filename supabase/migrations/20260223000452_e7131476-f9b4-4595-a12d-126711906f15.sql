
-- Create grocery_products table
CREATE TABLE public.grocery_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL,
  description text,
  category text NOT NULL,
  subcategory text,
  price numeric NOT NULL,
  mrp numeric,
  unit text NOT NULL DEFAULT '1 unit',
  image_url text,
  tags text[] DEFAULT '{}',
  in_stock boolean DEFAULT true,
  search_document tsvector,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GIN index on search_document
CREATE INDEX idx_grocery_products_search ON public.grocery_products USING GIN(search_document);

-- Index on category and tags for filtering
CREATE INDEX idx_grocery_products_category ON public.grocery_products(category);
CREATE INDEX idx_grocery_products_tags ON public.grocery_products USING GIN(tags);

-- Trigger to auto-generate search_document
CREATE OR REPLACE FUNCTION public.grocery_products_search_document()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.search_document := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.subcategory, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_grocery_products_search
BEFORE INSERT OR UPDATE ON public.grocery_products
FOR EACH ROW
EXECUTE FUNCTION public.grocery_products_search_document();

-- Enable RLS
ALTER TABLE public.grocery_products ENABLE ROW LEVEL SECURITY;

-- Public read access (demo)
CREATE POLICY "Anyone can view grocery products"
ON public.grocery_products FOR SELECT
USING (true);

-- Seed 50 Indian grocery products
INSERT INTO public.grocery_products (name, brand, description, category, subcategory, price, mrp, unit, tags) VALUES
('Aashirvaad Whole Wheat Atta', 'Aashirvaad', 'Premium whole wheat flour made from the finest grains for soft rotis', 'Atta & Flour', 'Wheat Flour', 285, 310, '5 kg', '{"vegetarian"}'),
('Pillsbury Chakki Fresh Atta', 'Pillsbury', 'Fresh chakki ground wheat flour for everyday cooking', 'Atta & Flour', 'Wheat Flour', 270, 295, '5 kg', '{"vegetarian"}'),
('Saffola Gold Refined Oil', 'Saffola', 'Dual seed technology oil with rice bran and sunflower oil for a healthy heart', 'Oil & Ghee', 'Blended Oil', 189, 210, '1 L', '{"heart-healthy","diabetic-friendly"}'),
('Fortune Sunflower Oil', 'Fortune', 'Light and healthy refined sunflower oil rich in Vitamin E', 'Oil & Ghee', 'Sunflower Oil', 155, 175, '1 L', '{"heart-healthy"}'),
('Amul Pure Ghee', 'Amul', 'Made from fresh cream, rich aroma and granular texture', 'Oil & Ghee', 'Ghee', 560, 590, '1 L', '{"vegetarian","jain"}'),
('Tata Salt', 'Tata', 'Vacuum evaporated iodised salt for everyday use', 'Masala & Spices', 'Salt', 28, 28, '1 kg', '{"jain","vrat"}'),
('Toor Dal (Arhar)', 'India Gate', 'Premium quality unpolished toor dal, high in protein', 'Dal & Pulses', 'Toor Dal', 165, 185, '1 kg', '{"organic","jain","high-protein"}'),
('Moong Dal', 'Tata Sampann', 'Unpolished moong dal, easy to digest and rich in nutrients', 'Dal & Pulses', 'Moong Dal', 145, 160, '1 kg', '{"jain","vrat","high-protein"}'),
('Masoor Dal', 'Tata Sampann', 'Unpolished masoor dal for quick-cooking everyday meals', 'Dal & Pulses', 'Masoor Dal', 110, 125, '1 kg', '{"high-protein"}'),
('Chana Dal', 'Tata Sampann', 'Premium chana dal, great for dal fry and sweets', 'Dal & Pulses', 'Chana Dal', 120, 135, '1 kg', '{"jain","high-protein"}'),
('India Gate Basmati Rice', 'India Gate', 'Classic long grain basmati rice with natural aroma', 'Rice', 'Basmati Rice', 399, 450, '5 kg', '{"jain","gujarati"}'),
('Daawat Rozana Gold Basmati', 'Daawat', 'Everyday basmati rice for daily meals', 'Rice', 'Basmati Rice', 345, 380, '5 kg', '{}'),
('MDH Chana Masala', 'MDH', 'Perfect blend of spices for authentic chana masala', 'Masala & Spices', 'Blended Spices', 75, 85, '100 g', '{"jain","gujarati"}'),
('Everest Garam Masala', 'Everest', 'Aromatic blend of whole spices ground to perfection', 'Masala & Spices', 'Blended Spices', 95, 105, '100 g', '{}'),
('MDH Deggi Mirch', 'MDH', 'Bright red chilli powder for color and mild heat', 'Masala & Spices', 'Chilli Powder', 85, 95, '100 g', '{"jain"}'),
('Catch Turmeric Powder', 'Catch', 'Pure turmeric powder with high curcumin content', 'Masala & Spices', 'Turmeric', 55, 65, '200 g', '{"organic","jain","vrat"}'),
('Whole Coriander Seeds', 'Catch', 'Premium whole coriander seeds for tempering and grinding', 'Masala & Spices', 'Whole Spices', 45, 55, '100 g', '{"jain","vrat"}'),
('Whole Cumin Seeds (Jeera)', 'Catch', 'Aromatic whole cumin seeds essential for Indian cooking', 'Masala & Spices', 'Whole Spices', 120, 135, '200 g', '{"jain","vrat"}'),
('Haldiram Bhujia', 'Haldiram', 'Classic besan bhujia namkeen, crispy and spicy', 'Snacks', 'Namkeen', 80, 90, '200 g', '{"jain","gujarati"}'),
('Haldiram Aloo Bhujia', 'Haldiram', 'Potato-based crispy namkeen with a tangy flavor', 'Snacks', 'Namkeen', 85, 95, '200 g', '{"vegetarian"}'),
('Bikaji Bikaneri Bhujia', 'Bikaji', 'Authentic Rajasthani bhujia with a crunchy texture', 'Snacks', 'Namkeen', 75, 85, '200 g', '{"jain"}'),
('Roasted Makhana (Fox Nuts)', 'Farmley', 'Lightly roasted makhana, perfect healthy snack', 'Snacks', 'Healthy Snacks', 199, 249, '200 g', '{"vrat","jain","diabetic-friendly","organic","sugar-free"}'),
('Parle-G Biscuits', 'Parle', 'India''s favourite glucose biscuit since 1939', 'Snacks', 'Biscuits', 10, 10, '80 g', '{"vegetarian"}'),
('Britannia Good Day Butter Cookies', 'Britannia', 'Rich butter cookies with a melt-in-mouth texture', 'Snacks', 'Biscuits', 35, 40, '75 g', '{"vegetarian"}'),
('Maggi 2-Minute Noodles', 'Maggi', 'India''s favourite instant noodles with masala flavor', 'Snacks', 'Instant Noodles', 56, 60, '280 g (4 pack)', '{"vegetarian"}'),
('Red Label Tea', 'Brooke Bond', 'Rich and aromatic CTC tea for a perfect cup', 'Beverages', 'Tea', 340, 370, '500 g', '{"jain","gujarati"}'),
('Tata Tea Premium', 'Tata', 'Premium blend of long leaves for a strong, rich taste', 'Beverages', 'Tea', 310, 340, '500 g', '{}'),
('Nescafe Classic Coffee', 'Nescafe', '100% pure instant coffee with rich aroma', 'Beverages', 'Coffee', 375, 410, '200 g', '{}'),
('Bru Instant Coffee', 'Bru', 'Smooth and aromatic instant coffee blend', 'Beverages', 'Coffee', 290, 320, '200 g', '{}'),
('Mother''s Recipe Mango Pickle', 'Mother''s Recipe', 'Traditional Indian mango pickle with spices and mustard oil', 'Pickles & Chutneys', 'Pickle', 120, 135, '500 g', '{"gujarati"}'),
('Pravin Mixed Pickle', 'Pravin', 'Tangy mixed vegetable pickle with authentic taste', 'Pickles & Chutneys', 'Pickle', 95, 110, '500 g', '{"jain","gujarati"}'),
('Lijjat Papad - Moong', 'Lijjat', 'Crispy moong dal papad, sun-dried for the best taste', 'Papad & Fryums', 'Papad', 65, 75, '200 g', '{"jain","gujarati","vrat"}'),
('Lijjat Papad - Urad', 'Lijjat', 'Traditional urad dal papad with black pepper', 'Papad & Fryums', 'Papad', 62, 72, '200 g', '{"jain","gujarati"}'),
('MTR Ready to Eat Poha', 'MTR', 'Instant breakfast poha, ready in 3 minutes', 'Ready to Eat', 'Breakfast', 55, 65, '180 g', '{"jain","gujarati"}'),
('MTR Ready to Eat Upma', 'MTR', 'Instant rava upma with vegetables, ready in 3 minutes', 'Ready to Eat', 'Breakfast', 55, 65, '180 g', '{"vegetarian"}'),
('Saffola Oats', 'Saffola', 'Rolled oats for a healthy and filling breakfast', 'Ready to Eat', 'Oats', 150, 170, '500 g', '{"diabetic-friendly","heart-healthy","sugar-free"}'),
('Sugar (Sulphurless)', 'Trust', 'Premium sulphurless sugar for everyday use', 'Essentials', 'Sugar', 48, 52, '1 kg', '{"jain","vrat"}'),
('Besan (Gram Flour)', 'Rajdhani', 'Premium quality gram flour for pakoras and sweets', 'Atta & Flour', 'Gram Flour', 85, 95, '500 g', '{"jain","gujarati","vrat"}'),
('Sooji (Semolina)', 'Aashirvaad', 'Fine semolina for upma, halwa and rava dosa', 'Atta & Flour', 'Semolina', 52, 58, '500 g', '{"jain","vrat"}'),
('Maida (Refined Flour)', 'Aashirvaad', 'Fine refined wheat flour for baking and naan', 'Atta & Flour', 'Refined Flour', 42, 48, '1 kg', '{"vegetarian"}'),
('Rajma (Kidney Beans)', 'Tata Sampann', 'Premium Jammu rajma, rich in protein and fiber', 'Dal & Pulses', 'Rajma', 160, 180, '1 kg', '{"jain","high-protein"}'),
('Kabuli Chana (Chickpeas)', 'Tata Sampann', 'Large white chickpeas perfect for chole and salads', 'Dal & Pulses', 'Chickpeas', 140, 155, '1 kg', '{"jain","high-protein","diabetic-friendly"}'),
('Mustard Oil (Kachi Ghani)', 'Fortune', 'Cold-pressed mustard oil with natural pungent aroma', 'Oil & Ghee', 'Mustard Oil', 185, 205, '1 L', '{}'),
('Coconut Oil', 'Parachute', '100% pure coconut oil for cooking and hair care', 'Oil & Ghee', 'Coconut Oil', 130, 145, '500 ml', '{"organic","jain","vrat"}'),
('Jaggery (Gur)', 'Miltop', 'Natural organic jaggery, unrefined and chemical-free', 'Essentials', 'Sweetener', 95, 110, '500 g', '{"organic","jain","vrat","diabetic-friendly"}'),
('Sendha Namak (Rock Salt)', 'Tata', 'Pure rock salt, ideal for fasting and everyday cooking', 'Masala & Spices', 'Salt', 40, 48, '1 kg', '{"jain","vrat","organic"}'),
('Sabudana (Tapioca Pearls)', 'Swad', 'Premium quality sabudana for khichdi and vada', 'Essentials', 'Fasting Foods', 75, 85, '500 g', '{"vrat","jain","gujarati"}'),
('Dry Fruits Mix', 'Nutraj', 'Premium mix of almonds, cashews, raisins and pistachios', 'Dry Fruits', 'Mixed Dry Fruits', 450, 520, '250 g', '{"jain","vrat","organic","sugar-free","diabetic-friendly"}'),
('Roasted Chana', 'Jabsons', 'Crunchy roasted chana, high protein healthy snack', 'Snacks', 'Healthy Snacks', 60, 70, '150 g', '{"jain","diabetic-friendly","high-protein","sugar-free"}'),
('Murmura (Puffed Rice)', 'Local', 'Light and crispy puffed rice for bhel and chivda', 'Snacks', 'Traditional', 30, 35, '500 g', '{"jain","gujarati","vrat","sugar-free"}');
