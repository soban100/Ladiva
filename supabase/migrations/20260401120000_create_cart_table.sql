-- ============================================================
-- SUPABASE CART TABLE - PERSISTENT CART STORAGE
-- ============================================================
-- This table stores cart items linked to authenticated users
-- ============================================================

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS public.cart_items;

-- Create the cart_items table
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure each user can only have one entry per product
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Users can only view their own cart items
CREATE POLICY "Users can view own cart items" ON public.cart_items
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can only insert their own cart items
CREATE POLICY "Users can insert own cart items" ON public.cart_items
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can only update their own cart items
CREATE POLICY "Users can update own cart items" ON public.cart_items
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can only delete their own cart items
CREATE POLICY "Users can delete own cart items" ON public.cart_items
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Admins can view all cart items (for admin functionality)
CREATE POLICY "Admins can view all cart items" ON public.cart_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Index for fast cart lookups by user
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);

-- Index for product lookups
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- Composite index for user+product lookups (upsert operations)
CREATE INDEX idx_cart_items_user_product ON public.cart_items(user_id, product_id);

-- ============================================================
-- TRIGGER FOR UPDATING updated_at
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_updated_at();

-- ============================================================
-- UTILITY FUNCTION: SYNC CART ITEM
-- ============================================================
-- This function handles the increment-or-insert logic
-- Usage: SELECT sync_cart_item('user-uuid', 'product-uuid', 1);
-- ============================================================

CREATE OR REPLACE FUNCTION sync_cart_item(
    p_user_id UUID,
    p_product_id UUID,
    p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_existing_quantity INTEGER;
BEGIN
    -- Check if item already exists in cart
    SELECT quantity INTO v_existing_quantity
    FROM public.cart_items
    WHERE user_id = p_user_id AND product_id = p_product_id;
    
    IF v_existing_quantity IS NOT NULL THEN
        -- Item exists: increment quantity
        UPDATE public.cart_items
        SET quantity = quantity + p_quantity
        WHERE user_id = p_user_id AND product_id = p_product_id
        RETURNING to_jsonb(cart_items.*) INTO v_result;
        
        RETURN jsonb_build_object(
            'action', 'incremented',
            'item', v_result,
            'previous_quantity', v_existing_quantity,
            'new_quantity', v_existing_quantity + p_quantity
        );
    ELSE
        -- Item doesn't exist: insert new row
        INSERT INTO public.cart_items (user_id, product_id, quantity)
        VALUES (p_user_id, p_product_id, p_quantity)
        RETURNING to_jsonb(cart_items.*) INTO v_result;
        
        RETURN jsonb_build_object(
            'action', 'inserted',
            'item', v_result,
            'quantity', p_quantity
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ENABLE REALTIME (optional - for live cart updates)
-- ============================================================

-- Add cart_items to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
