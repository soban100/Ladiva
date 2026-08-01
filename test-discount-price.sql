-- Test discount_price handling in products table
-- This script verifies that the database schema matches the TypeScript types

-- 1. Check products table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND column_name IN ('price', 'discount_price')
ORDER BY column_name;

-- 2. Test inserting a product with null discount_price
INSERT INTO products (
    name, 
    slug, 
    description, 
    price, 
    discount_price, 
    category_id, 
    images, 
    stock, 
    sizes, 
    colors, 
    is_featured
) VALUES (
    'Test Product - No Discount',
    'test-product-no-discount',
    'Testing null discount_price',
    29.99,
    NULL,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    10,
    ARRAY['S', 'M', 'L'],
    ARRAY['Red', 'Blue'],
    false
);

-- 3. Test inserting a product with valid discount_price
INSERT INTO products (
    name, 
    slug, 
    description, 
    price, 
    discount_price, 
    category_id, 
    images, 
    stock, 
    sizes, 
    colors, 
    is_featured
) VALUES (
    'Test Product - With Discount',
    'test-product-with-discount',
    'Testing valid discount_price',
    29.99,
    19.99,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    15,
    ARRAY['S', 'M', 'L'],
    ARRAY['Green', 'Yellow'],
    false
);

-- 4. Verify the inserted products
SELECT 
    id,
    name,
    price,
    discount_price,
    (discount_price IS NULL) as has_no_discount,
    (discount_price < price) as discount_is_valid
FROM products 
WHERE name LIKE 'Test Product -%'
ORDER BY name;

-- 5. Clean up test data
DELETE FROM products 
WHERE name LIKE 'Test Product -%';
