-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  mod_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own purchases
CREATE POLICY view_own_purchases ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert purchases (will be further restricted by application logic)
CREATE POLICY insert_purchases ON public.purchases
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Add indexes for better performance
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_mod_id ON public.purchases(mod_id);
CREATE INDEX idx_purchases_transaction_id ON public.purchases(transaction_id); 