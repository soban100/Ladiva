-- Create orders table for checkout flow
-- This table stores customer orders with shipping info and cart items

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- Customer information (JSON)
  customer_info JSONB NOT NULL,
  
  -- Order items (JSONB array of products)
  items JSONB NOT NULL,
  
  -- Pricing
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional order metadata
  notes TEXT,
  tracking_number VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Create a function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  prefix TEXT := 'LADIVA';
BEGIN
  -- Generate order number with prefix, date, and random number
  order_num := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                LPAD(floor(random() * 10000)::text, 4, '0');
  
  -- Ensure uniqueness (retry if collision)
  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = order_num) LOOP
    order_num := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                  LPAD(floor(random() * 10000)::text, 4, '0');
  END LOOP;
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to orders table
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-generate order numbers
CREATE TRIGGER set_order_number 
  BEFORE INSERT ON orders 
  FOR EACH ROW 
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- 1. Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create a view for admin order management
CREATE OR REPLACE VIEW admin_orders_view AS
SELECT 
  o.*,
  p.email as customer_email,
  p.full_name as customer_name
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id;

-- Grant permissions
GRANT ALL ON orders TO authenticated;
GRANT SELECT ON admin_orders_view TO authenticated;

-- Sample customer_info JSON structure:
-- {
--   "full_name": "John Doe",
--   "phone_number": "+1234567890",
--   "address": "123 Main St, Apt 4B",
--   "province": "California",
--   "country": "United States"
-- }

-- Sample items JSONB structure:
-- [
--   {
--     "product_id": "uuid",
--     "name": "Product Name",
--     "price": 29.99,
--     "quantity": 2,
--     "size": "M",
--     "color": "Blue",
--     "image": "https://..."
--   }
-- ]
