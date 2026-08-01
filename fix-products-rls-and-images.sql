-- Fix products table RLS policies and clean up broken image links
-- This file contains SQL commands to:
-- 1. Enable public read access to products table
-- 2. Clean up broken placeholder links in the database

-- Allow public access to products table to prevent timeout/cancellation
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON products;
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);

-- Clean up any broken placeholder links in the database
UPDATE products 
SET image_url = 'https://placehold.co' 
WHERE image_url LIKE '%://placeholder.com%' OR image_url IS NULL OR image_url = '';

-- Verify the changes
SELECT 'RLS Policies Updated' as status;
SELECT 'Products with cleaned image URLs:' as description, COUNT(*) as count 
FROM products 
WHERE image_url = 'https://placehold.co';

-- Show sample of cleaned products
SELECT id, name, image_url 
FROM products 
WHERE image_url = 'https://placehold.co' 
LIMIT 5;
