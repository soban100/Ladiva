-- ========================================
-- Migration: Allow NULL values in stock column
-- ========================================

-- This migration allows the stock column to accept NULL values
-- for products with unlimited stock

-- Step 1: Drop the default value constraint
ALTER TABLE products ALTER COLUMN stock DROP DEFAULT;

-- Step 2: Allow NULL values in the stock column
ALTER TABLE products ALTER COLUMN stock DROP NOT NULL;

-- Step 3: Set existing 0 values to NULL for unlimited stock (optional)
-- Uncomment the following line if you want to convert existing 0 stock to NULL
-- UPDATE products SET stock = NULL WHERE stock = 0;

-- Step 4: Add a comment to document the change
COMMENT ON COLUMN products.stock IS 'Stock quantity. NULL means unlimited stock, 0 means out of stock, positive number means limited stock';

-- Step 5: Verify the changes
SELECT 
  column_name, 
  is_nullable, 
  column_default,
  data_type
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'stock';

-- Test queries to verify NULL handling:
-- INSERT INTO products (name, slug, price, stock) VALUES ('Test Product', 'test-product', 29.99, NULL);
-- SELECT * FROM products WHERE stock IS NULL;
-- SELECT * FROM products WHERE stock IS NOT NULL;
