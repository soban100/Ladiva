-- Add performance indexes for product and order management

-- Indexes for products table to speed up filtering and sorting
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING btree (name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products USING btree (category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products USING btree (stock) WHERE stock IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products USING btree (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products USING btree (created_at DESC);

-- Composite index for common product queries
CREATE INDEX IF NOT EXISTS idx_products_category_created ON products USING btree (category_id, created_at DESC);

-- Indexes for orders table to speed up status filtering and sorting
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders USING btree (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders USING btree (user_id);

-- Composite index for orders by status and date (common admin query)
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders USING btree (status, created_at DESC);

-- Indexes for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items USING btree (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items USING btree (product_id);

-- Index for categories lookup
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories USING btree (name);

-- Index for profiles lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles USING btree (email);

-- Update statistics for query planner
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE categories;
ANALYZE profiles;
