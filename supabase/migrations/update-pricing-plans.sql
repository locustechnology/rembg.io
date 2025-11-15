-- Migration: Update pricing plans to new structure
-- Date: 2025-11-15
-- Description: Replace old pricing with Starter and Premium plans (monthly + yearly)

-- Add billing_interval column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_plans' AND column_name = 'billing_interval'
  ) THEN
    ALTER TABLE payment_plans ADD COLUMN billing_interval TEXT DEFAULT 'monthly';
  END IF;
END $$;

-- First, delete all existing payment plans
DELETE FROM payment_plans;

-- Insert new Starter and Premium plans with monthly and yearly options
-- Starter Pack - Monthly: $5 for 100 credits
INSERT INTO payment_plans (
  id,
  name,
  price,
  credits,
  billing_interval,
  description,
  "dodoProductId",
  active
) VALUES (
  gen_random_uuid(),
  'Starter',
  5.00,
  100,
  'monthly',
  'Perfect for casual users - 100 credits monthly',
  'pdt_CC0BK8AcBiY1y7ZaDU7aL',
  true
);

-- Starter Pack - Yearly: $48 for 1,200 credits (20% discount, normally $60)
INSERT INTO payment_plans (
  id,
  name,
  price,
  credits,
  billing_interval,
  description,
  "dodoProductId",
  active
) VALUES (
  gen_random_uuid(),
  'Starter',
  48.00,
  1200,
  'yearly',
  'Best value - 1,200 credits yearly (Save 20%)',
  'pdt_tbQAdChZMcZlYCoB57kbn',
  true
);

-- Premium Pack - Monthly: $10 for 250 credits
INSERT INTO payment_plans (
  id,
  name,
  price,
  credits,
  billing_interval,
  description,
  "dodoProductId",
  active
) VALUES (
  gen_random_uuid(),
  'Premium',
  10.00,
  250,
  'monthly',
  'For power users - 250 credits monthly',
  'pdt_61yyMlLFg6e3kiflzoylL',
  true
);

-- Premium Pack - Yearly: $96 for 3,000 credits (20% discount, normally $120)
INSERT INTO payment_plans (
  id,
  name,
  price,
  credits,
  billing_interval,
  description,
  "dodoProductId",
  active
) VALUES (
  gen_random_uuid(),
  'Premium',
  96.00,
  3000,
  'yearly',
  'Ultimate value - 3,000 credits yearly (Save 20%)',
  'pdt_7yagVrNjNowMgElsXCjlM',
  true
);
