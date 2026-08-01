-- Update categories table with image URLs from Home page hardcoded categories
-- This script adds the Unsplash image URLs to the existing categories

UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop'
WHERE name = 'Clothing' OR slug = 'clothing';

UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=400&h=400&fit=crop'
WHERE name = 'Accessories' OR slug = 'accessories';

UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
WHERE name = 'Footwear' OR slug = 'footwear';

UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop'
WHERE name = 'Beauty & Health' OR slug = 'beauty';

UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
WHERE name = 'Bags & Wallets' OR slug = 'bags';

UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400&h=400&fit=crop'
WHERE name = 'Jewelry' OR slug = 'jewelry';

UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c403348?w=400&h=400&fit=crop'
WHERE name = 'Home & Living' OR slug = 'home';

UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop'
WHERE name = 'Electronics' OR slug = 'electronics';

-- Verify the updates
SELECT id, name, slug, image_url 
FROM categories 
ORDER BY name;
