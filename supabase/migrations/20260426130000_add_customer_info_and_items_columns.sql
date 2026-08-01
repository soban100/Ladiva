-- Add customer_info column to orders table (stores card name, number, address, email as JSONB)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'customer_info'
    ) THEN
        ALTER TABLE orders
        ADD COLUMN customer_info jsonb DEFAULT '{}';
    END IF;
END $$;

-- Add items column to orders table (stores order items as JSONB)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'items'
    ) THEN
        ALTER TABLE orders
        ADD COLUMN items jsonb DEFAULT '[]';
    END IF;
END $$;

-- Migrate existing data to customer_info column with correct field names
UPDATE orders
SET customer_info = jsonb_build_object(
    'full_name', customer_name,
    'phone_number', customer_phone,
    'address', shipping_address->>'street',
    'country', shipping_address->>'country',
    'province', shipping_address->>'province',
    'email', customer_email
)
WHERE customer_info = '{}'::jsonb;

-- Comment on columns
COMMENT ON COLUMN orders.customer_info IS 'Stores customer full_name, phone_number, address, country, province, and email as JSONB';
COMMENT ON COLUMN orders.items IS 'Stores order items as JSONB array';
