-- Update payment plans with Dodo Product IDs
-- Run this script in your Supabase SQL Editor

UPDATE payment_plans
SET "dodoProductId" = 'pdt_CC0BK8AcBiY1y7ZaDU7aL'
WHERE name = 'Starter' AND price = 5.00;

UPDATE payment_plans
SET "dodoProductId" = 'pdt_CWlfT9vuJpdXo2vAmxNpR'
WHERE name = 'Pro' AND price = 9.00;

UPDATE payment_plans
SET "dodoProductId" = 'pdt_61yyMlLFg6e3kiflzoylL'
WHERE name = 'Premium' AND price = 19.00;

-- Verify the updates
SELECT id, name, price, credits, "dodoProductId"
FROM payment_plans
ORDER BY price;
