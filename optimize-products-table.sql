-- ===================================
-- Products Table Optimization Script
-- ===================================
-- Run this script in your Supabase SQL Editor
-- to optimize the Admin Products table performance

-- 1. Add indexes for frequently queried columns
-- These indexes will dramatically speed up sorting, filtering, and searching

-- Index for product name (optimizes search and name-based filtering)
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Index for category_id (optimizes category filtering)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Index for created_at (optimizes sorting by date)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Composite index for category + created_at (optimizes filtered sorting)
CREATE INDEX IF NOT EXISTS idx_products_category_created_at ON products(category_id, created_at DESC);

-- 2. Full-text search index for better search performance
-- This creates a GIN index for faster ILIKE operations on name
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(name gin_trgm_ops);

-- 3. Partial indexes for common queries
-- Index for products that are in stock (optimizes "active" product queries)
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(created_at DESC) WHERE stock > 0;

-- Index for featured products (if you have this column)
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(created_at DESC) WHERE is_featured = true;

-- 4. Index for price-related queries (useful for filtering by price ranges)
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- 5. Index for discount queries (optimizes discount-based filtering)
CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_price) WHERE discount_price > 0;

-- ===================================
-- Post-Index Verification Queries
-- ===================================

-- Check that indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'products' 
ORDER BY indexname;

-- Analyze the table to update query planner statistics
ANALYZE products;

-- ===================================
-- Performance Testing Queries
-- ===================================

-- Test query performance before and after indexes
-- Run these queries to verify the performance improvement

-- Test 1: Search by name (should use idx_products_name_gin)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, price, stock, created_at 
FROM products 
WHERE name ILIKE '%test%' 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 2: Filter by category (should use idx_products_category_id)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, price, stock, created_at 
FROM products 
WHERE category_id = 'your-category-id-here' 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 3: Category filtering with sorting (should use idx_products_category_created_at)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, price, stock, created_at 
FROM products 
WHERE category_id = 'your-category-id-here' 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 4: In-stock products (should use idx_products_in_stock)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, price, stock, created_at 
FROM products 
WHERE stock > 0 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 5: Pagination query (should use appropriate indexes)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, price, stock, category_id, created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 20;

-- ===================================
-- Expected Performance Improvements
-- ===================================

-- Before indexes: These queries might take 500ms-2s+ depending on table size
-- After indexes: These queries should take 10-50ms even with thousands of products

-- Key improvements:
-- 1. Name searches: 10-50x faster
-- 2. Category filtering: 5-20x faster  
-- 3. Date sorting: 3-10x faster
-- 4. Pagination: 5-15x faster
-- 5. Combined filters: 10-30x faster

-- ===================================
-- Maintenance Notes
-- ===================================

-- 1. The ANALYZE command updates statistics for the query planner
-- 2. Run ANALYZE products periodically or after large data imports
-- 3. Monitor query performance using pg_stat_statements if needed
-- 4. Consider adding more indexes based on your specific query patterns

-- ===================================
-- Rollback Script (if needed)
-- ===================================

-- Uncomment these lines to remove all indexes if they cause issues
/*
DROP INDEX IF EXISTS idx_products_name;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_created_at;
DROP INDEX IF EXISTS idx_products_category_created_at;
DROP INDEX IF EXISTS idx_products_name_gin;
DROP INDEX IF EXISTS idx_products_in_stock;
DROP INDEX IF EXISTS idx_products_featured;
DROP INDEX IF EXISTS idx_products_price;
DROP INDEX IF EXISTS idx_products_discount;
*/
