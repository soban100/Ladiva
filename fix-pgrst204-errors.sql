-- Comprehensive script to handle PGRST204 errors
-- This ensures all Product type columns exist in the database

-- 1. Check current products table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Compare with TypeScript Product interface columns:
-- id: string (uuid) - should exist
-- name: string (text) - should exist  
-- slug: string (text) - should exist
-- description: string (text) - should exist
-- price: number (numeric) - should exist
-- discount_price?: number (numeric) - should exist, nullable
-- category_id: string (uuid) - should exist, nullable
-- images: string[] (text[]) - should exist
-- stock: number (integer) - should exist
-- sizes: string[] (text[]) - should exist
-- colors: string[] (text[]) - should exist
-- is_featured: boolean (boolean) - should exist
-- created_at: string (timestamptz) - should exist
-- updated_at: string (timestamptz) - should exist

-- 3. Add any missing columns (run if PGRST204 error occurs)
-- This section adds all required columns in one go

DO $$
BEGIN
    -- Add created_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE products ADD COLUMN created_at timestamptz DEFAULT now();
        RAISE NOTICE 'Added created_at column';
    END IF;

    -- Add updated_at if missing  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE products ADD COLUMN updated_at timestamptz DEFAULT now();
        RAISE NOTICE 'Added updated_at column';
    END IF;

    -- Add other potentially missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'slug'
    ) THEN
        ALTER TABLE products ADD COLUMN slug text NOT NULL UNIQUE;
        RAISE NOTICE 'Added slug column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'discount_price'
    ) THEN
        ALTER TABLE products ADD COLUMN discount_price numeric;
        RAISE NOTICE 'Added discount_price column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sizes'
    ) THEN
        ALTER TABLE products ADD COLUMN sizes text[] DEFAULT '{}';
        RAISE NOTICE 'Added sizes column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'colors'
    ) THEN
        ALTER TABLE products ADD COLUMN colors text[] DEFAULT '{}';
        RAISE NOTICE 'Added colors column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE products ADD COLUMN is_featured boolean DEFAULT false;
        RAISE NOTICE 'Added is_featured column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'images'
    ) THEN
        ALTER TABLE products ADD COLUMN images text[] DEFAULT '{}';
        RAISE NOTICE 'Added images column';
    END IF;

END $$;

-- 4. Verify all columns exist after potential additions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 5. Test insert with all fields to verify schema completeness
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
    is_featured,
    created_at,
    updated_at
) VALUES (
    'Schema Test Product ' || EXTRACT(EPOCH FROM NOW()),
    'schema-test-product-' || EXTRACT(EPOCH FROM NOW()),
    'Testing complete schema compatibility',
    99.99,
    79.99,
    (SELECT id FROM categories LIMIT 1),
    ARRAY['https://via.placeholder.com/300x300'],
    25,
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Red', 'Blue', 'Green'],
    true,
    now(),
    now()
) RETURNING *;

-- 6. Clean up test data
DELETE FROM products 
WHERE name LIKE 'Schema Test Product%';

-- 7. Show final schema comparison
-- Expected vs Actual columns
WITH expected_columns AS (
    SELECT unnest(ARRAY[
        'id', 'name', 'slug', 'description', 'price', 'discount_price', 
        'category_id', 'images', 'stock', 'sizes', 'colors', 
        'is_featured', 'created_at', 'updated_at'
    ]) as column_name
),
actual_columns AS (
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'products'
)
SELECT 
    ec.column_name as expected,
    CASE WHEN ac.column_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM expected_columns ec
LEFT JOIN actual_columns ac ON ec.column_name = ac.column_name
ORDER BY ec.column_name;
