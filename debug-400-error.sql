-- Debug script for 400 Bad Request error on products insert
-- Run this in Supabase SQL Editor to verify schema and test inserts

-- 1. Check the exact products table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Check table constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'products'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. Test a minimal insert to isolate the issue
-- This should work if basic schema is correct
INSERT INTO products (
    name, 
    slug, 
    price, 
    category_id
) VALUES (
    'Debug Test Product',
    'debug-test-product-' || EXTRACT(EPOCH FROM NOW()),
    29.99,
    (SELECT id FROM categories LIMIT 1)
) RETURNING *;

-- 4. Test insert with arrays
INSERT INTO products (
    name, 
    slug, 
    description,
    price, 
    category_id,
    images,
    sizes,
    colors,
    stock,
    is_featured
) VALUES (
    'Debug Test Product with Arrays',
    'debug-test-product-arrays-' || EXTRACT(EPOCH FROM NOW()),
    'Test description',
    39.99,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    ARRAY['S', 'M', 'L'],
    ARRAY['Red', 'Blue'],
    10,
    false
) RETURNING *;

-- 5. Test insert with discount_price
INSERT INTO products (
    name, 
    slug, 
    description,
    price, 
    discount_price,
    category_id,
    images,
    sizes,
    colors,
    stock,
    is_featured
) VALUES (
    'Debug Test Product with Discount',
    'debug-test-product-discount-' || EXTRACT(EPOCH FROM NOW()),
    'Test description with discount',
    49.99,
    39.99,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    ARRAY['S', 'M', 'L'],
    ARRAY['Green', 'Yellow'],
    15,
    true
) RETURNING *;

-- 6. Check if categories table has data
SELECT id, name FROM categories LIMIT 5;

-- 7. Clean up test data
DELETE FROM products 
WHERE name LIKE 'Debug Test Product%';

-- 8. Check RLS policies that might affect inserts
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products';
