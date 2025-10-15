-- Create PaymentMethods table for storing safe card metadata
CREATE TABLE public."PaymentMethods" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  brand VARCHAR(50) NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  exp_month VARCHAR(2) NOT NULL,
  exp_year VARCHAR(2) NOT NULL,
  cardholder_name VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'stripe',
  provider_payment_method_id VARCHAR(255),
  label VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public."PaymentMethods" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PaymentMethods
CREATE POLICY "Users can view their own payment methods"
ON public."PaymentMethods"
FOR SELECT
USING (user_id IN (
  SELECT user_id FROM public."Users" WHERE auth_uid = auth.uid()
));

CREATE POLICY "Users can insert their own payment methods"
ON public."PaymentMethods"
FOR INSERT
WITH CHECK (user_id IN (
  SELECT user_id FROM public."Users" WHERE auth_uid = auth.uid()
));

CREATE POLICY "Users can update their own payment methods"
ON public."PaymentMethods"
FOR UPDATE
USING (user_id IN (
  SELECT user_id FROM public."Users" WHERE auth_uid = auth.uid()
));

CREATE POLICY "Users can delete their own payment methods"
ON public."PaymentMethods"
FOR DELETE
USING (user_id IN (
  SELECT user_id FROM public."Users" WHERE auth_uid = auth.uid()
));

-- Function to ensure only one default card per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_payment_method()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If setting this card as default, unset all other defaults for this user
  IF NEW.is_default = true THEN
    UPDATE public."PaymentMethods"
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to enforce single default
CREATE TRIGGER enforce_single_default_payment_method
BEFORE INSERT OR UPDATE ON public."PaymentMethods"
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_payment_method();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_payment_methods_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_payment_methods_timestamp
BEFORE UPDATE ON public."PaymentMethods"
FOR EACH ROW
EXECUTE FUNCTION public.update_payment_methods_updated_at();