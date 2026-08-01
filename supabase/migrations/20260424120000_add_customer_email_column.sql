-- Add customer_email column to orders table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE orders
        ADD COLUMN customer_email text DEFAULT '';
    END IF;
END $$;

-- Add notes column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE orders
        ADD COLUMN notes text DEFAULT '';
    END IF;
END $$;

-- Add payment_method column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE orders
        ADD COLUMN payment_method text DEFAULT 'Cash on Delivery';
    END IF;
END $$;
