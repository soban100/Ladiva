-- ========================================
-- Stock Management Test Script
-- ========================================

-- This script tests the stock deduction functionality
-- Run this in your Supabase SQL Editor to verify everything works

-- Step 1: Create test products with known stock quantities
INSERT INTO products (id, name, slug, description, price, stock, category_id, created_at, updated_at) VALUES
  ('test-product-1', 'Test Product 1', 'test-product-1', 'Test product for stock deduction', 29.99, 10, 
   (SELECT id FROM categories LIMIT 1), NOW(), NOW()),
  ('test-product-2', 'Test Product 2', 'test-product-2', 'Another test product', 49.99, 5,
   (SELECT id FROM categories LIMIT 1), NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  stock = EXCLUDED.stock,
  updated_at = NOW();

-- Step 2: Create a test user (if needed)
INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'test-stock@example.com',
  'Stock Test User',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'test-stock@example.com');

-- Step 3: Create a test order with items
INSERT INTO orders (id, user_id, order_number, total_amount, status, customer_name, customer_phone, customer_email, created_at, updated_at)
SELECT 
  'test-order-1',
  (SELECT id FROM profiles WHERE email = 'test-stock@example.com' LIMIT 1),
  'TEST-001',
  79.98,
  'pending',
  'Test Customer',
  '123-456-7890',
  'customer@example.com',
  NOW(),
  NOW()
ON CONFLICT (id) DO UPDATE SET
  status = 'pending',
  updated_at = NOW;

-- Step 4: Create order items
INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, created_at)
VALUES
  ('test-order-1', 'test-product-1', 'Test Product 1', 29.99, 2, NOW()),
  ('test-order-1', 'test-product-2', 'Test Product 2', 49.99, 1, NOW())
ON CONFLICT DO NOTHING;

-- Step 5: Test 1 - Verify initial stock levels
SELECT 
  p.id,
  p.name,
  p.stock as current_stock,
  oi.quantity as required_quantity,
  CASE 
    WHEN p.stock >= oi.quantity THEN '✅ Sufficient Stock'
    ELSE '❌ Insufficient Stock'
  END as stock_status
FROM products p
JOIN order_items oi ON p.id = oi.product_id
WHERE oi.order_id = 'test-order-1';

-- Step 6: Test 2 - Test successful order confirmation
SELECT * FROM confirm_order_with_stock_deduction('test-order-1', 'confirmed');

-- Step 7: Test 3 - Verify stock was deducted
SELECT 
  p.id,
  p.name,
  p.stock as stock_after_confirmation,
  oi.quantity as deducted_quantity
FROM products p
JOIN order_items oi ON p.id = oi.product_id
WHERE oi.order_id = 'test-order-1';

-- Step 8: Test 4 - Test duplicate confirmation (should fail)
SELECT * FROM confirm_order_with_stock_deduction('test-order-1', 'confirmed');

-- Step 9: Test 5 - Test order cancellation with stock restoration
SELECT * FROM cancel_order_with_stock_restoration('test-order-1', 'cancelled');

-- Step 10: Test 6 - Verify stock was restored
SELECT 
  p.id,
  p.name,
  p.stock as stock_after_cancellation,
  oi.quantity as restored_quantity
FROM products p
JOIN order_items oi ON p.id = oi.product_id
WHERE oi.order_id = 'test-order-1';

-- Step 11: Test 7 - Create insufficient stock scenario
UPDATE products SET stock = 1 WHERE id = 'test-product-1';
UPDATE products SET stock = 0 WHERE id = 'test-product-2';

-- Step 12: Test 8 - Try to confirm with insufficient stock (should fail)
SELECT * FROM confirm_order_with_stock_deduction('test-order-1', 'confirmed');

-- Step 13: Cleanup - Reset stock levels
UPDATE products SET stock = 10 WHERE id = 'test-product-1';
UPDATE products SET stock = 5 WHERE id = 'test-product-2';

-- Step 14: Final verification
SELECT 
  p.id,
  p.name,
  p.stock as final_stock
FROM products p
WHERE p.id IN ('test-product-1', 'test-product-2');

-- ========================================
-- Expected Results:
-- 
-- Test 1: Should show sufficient stock for both products
-- Test 2: Should return success=true
-- Test 3: Should show reduced stock (product1: 8, product2: 4)
-- Test 4: Should return success=false with "already confirmed" message
-- Test 5: Should return success=true
-- Test 6: Should show restored stock (product1: 10, product2: 5)
-- Test 8: Should return success=false with "Insufficient stock" message
-- Test 14: Should show original stock levels restored
-- ========================================
