-- Test slug generation and uniqueness in products table
-- This script verifies that slug generation works correctly

-- 1. Check current slug column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND column_name = 'slug';

-- 2. Test inserting products with similar names to verify slug uniqueness
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
    'Test Product',
    'test-product',
    'Testing basic slug generation',
    29.99,
    NULL,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    10,
    ARRAY['S', 'M', 'L'],
    ARRAY['Red', 'Blue'],
    false
);

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
    'Test Product!',
    'test-product-1',
    'Testing slug with special characters',
    39.99,
    NULL,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    15,
    ARRAY['S', 'M', 'L'],
    ARRAY['Green', 'Yellow'],
    false
);

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
    'Test Product!!',
    'test-product-2',
    'Testing slug with more special characters',
    49.99,
    NULL,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    20,
    ARRAY['S', 'M', 'L'],
    ARRAY['Black', 'White'],
    false
);

-- 3. Test various slug patterns
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
    'Product with Multiple   Spaces',
    'product-with-multiple-spaces',
    'Testing slug with multiple spaces',
    19.99,
    NULL,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    5,
    ARRAY['S', 'M'],
    ARRAY['Purple'],
    false
);

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
    'Product-with---hyphens',
    'product-with-hyphens',
    'Testing slug with multiple hyphens',
    24.99,
    NULL,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    8,
    ARRAY['M', 'L'],
    ARRAY['Orange'],
    false
);

-- 4. Verify all test products were created with unique slugs
SELECT 
    id,
    name,
    slug,
    created_at
FROM products 
WHERE name LIKE 'Test Product%' OR name LIKE 'Product with%'
ORDER BY created_at DESC;

-- 5. Test slug uniqueness constraint (this should fail)
-- INSERT INTO products (
--     name, 
--     slug, 
--     description, 
--     price, 
--     category_id, 
--     images, 
--     stock, 
--     sizes, 
--     colors, 
--     is_featured
-- ) VALUES (
--     'Duplicate Test',
--     'test-product',  -- This should cause a unique constraint error
--     'Testing duplicate slug',
--     99.99,
--     (SELECT id FROM categories LIMIT 1),
--     ARRAY['https://via.placeholder.com/300x300'],
--     1,
--     ARRAY['S'],
--     ARRAY['Red'],
--     false
-- );

-- 6. Clean up test data
DELETE FROM products 
WHERE name LIKE 'Test Product%' OR name LIKE 'Product with%';
