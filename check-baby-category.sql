-- Check the baby category in database
SELECT id, name, slug, image_url, description 
FROM categories 
WHERE name ILIKE '%baby%' OR slug ILIKE '%baby%';

-- If image_url is empty, update it with a baby category image
UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop'
WHERE name ILIKE '%baby%' OR slug ILIKE '%baby%';

-- Verify the update
SELECT id, name, slug, image_url, description 
FROM categories 
WHERE name ILIKE '%baby%' OR slug ILIKE '%baby%';
