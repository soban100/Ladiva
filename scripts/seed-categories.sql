-- Seed categories for the LADIVA e-commerce store
-- Run this script in your Supabase SQL editor to populate categories

INSERT INTO categories (name, slug, description, image_url) VALUES
('Clothing', 'clothing', 'Fashion apparel for men and women', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'),
('Accessories', 'accessories', 'Fashion accessories and jewelry', 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=400'),
('Footwear', 'footwear', 'Shoes and footwear for all occasions', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'),
('Beauty', 'beauty', 'Cosmetics and beauty products', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'),
('Bags', 'bags', 'Handbags, backpacks and travel bags', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
('Jewelry', 'jewelry', 'Fine jewelry and fashion jewelry', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'),
('Home Living', 'home-living', 'Home decor and living essentials', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
('Electronics', 'electronics', 'Electronic gadgets and accessories', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400')
ON CONFLICT (name) DO NOTHING;

-- Verify categories were inserted
SELECT * FROM categories ORDER BY name;
