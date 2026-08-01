-- Add sample orders for testing the dynamic order list
-- Run this in Supabase SQL Editor to create test data

-- Clear existing test orders (optional)
-- DELETE FROM orders WHERE order_number LIKE 'TEST-%';

-- Insert sample orders with different statuses
INSERT INTO orders (order_number, user_id, status, total_amount, customer_info, created_at, updated_at) VALUES
('TEST-001', '00000000-0000-0000-0000-000000000001', 'pending', 299.99, 
 '{"full_name": "John Doe", "phone_number": "+1234567890", "email": "john@example.com", "address": "123 Main St", "province": "California"}',
 NOW(), NOW()),
 
('TEST-002', '00000000-0000-0000-0000-000000000001', 'confirmed', 159.50,
 '{"full_name": "Jane Smith", "phone_number": "+0987654321", "email": "jane@example.com", "address": "456 Oak Ave", "province": "New York"}',
 NOW(), NOW()),
 
('TEST-003', '00000000-0000-0000-0000-000000000001', 'delivered', 425.00,
 '{"full_name": "Bob Johnson", "phone_number": "+1122334455", "email": "bob@example.com", "address": "789 Pine Rd", "province": "Texas"}',
 NOW(), NOW()),
 
('TEST-004', '00000000-0000-0000-0000-000000000001', 'cancelled', 89.99,
 '{"full_name": "Alice Brown", "phone_number": "+5544332211", "email": "alice@example.com", "address": "321 Elm St", "province": "Florida"}',
 NOW(), NOW());

-- Verify the test data was inserted
SELECT order_number, status, total_amount, 
       customer_info->>'full_name' as customer_name,
       created_at
FROM orders 
WHERE order_number LIKE 'TEST-%'
ORDER BY created_at DESC;
