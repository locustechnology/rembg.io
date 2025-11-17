-- Migration: Add Bria RMBG 2.0 Model Support
-- This migration adds support for dual-model background removal system
-- Free model (ISNet) and Superior model (Bria RMBG 2.0)

-- 1. Add model type column to credit_transactions
ALTER TABLE credit_transactions
ADD COLUMN IF NOT EXISTS model_used TEXT CHECK (model_used IN ('isnet_free', 'bria_rmbg_2.0'));

-- 2. Update credit_transactions type enum to include new types
ALTER TABLE credit_transactions
DROP CONSTRAINT IF EXISTS credit_transactions_type_check;

ALTER TABLE credit_transactions
ADD CONSTRAINT credit_transactions_type_check
CHECK (type IN ('signup_bonus', 'purchase', 'usage', 'usage_free', 'usage_premium', 'refund'));

-- 3. Add index for model usage analytics
CREATE INDEX IF NOT EXISTS idx_credit_transactions_model_used
ON credit_transactions(model_used)
WHERE model_used IS NOT NULL;

-- 4. Update existing usage records to mark as free model
UPDATE credit_transactions
SET model_used = 'isnet_free',
    type = 'usage_free'
WHERE type = 'usage' AND amount < 0 AND model_used IS NULL;

-- 5. Create model_usage_stats table for analytics
CREATE TABLE IF NOT EXISTS model_usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  model_type TEXT NOT NULL CHECK (model_type IN ('isnet_free', 'bria_rmbg_2.0')),
  image_size_bytes INTEGER,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_model_usage_stats_user ON model_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_stats_model ON model_usage_stats(model_type);
CREATE INDEX IF NOT EXISTS idx_model_usage_stats_created ON model_usage_stats(created_at);
CREATE INDEX IF NOT EXISTS idx_model_usage_stats_success ON model_usage_stats(success);

-- 7. Enable RLS on model_usage_stats table
ALTER TABLE model_usage_stats ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for model_usage_stats
CREATE POLICY "Users can view their own stats" ON model_usage_stats
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own stats" ON model_usage_stats
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 9. Grant necessary permissions
GRANT SELECT, INSERT ON model_usage_stats TO authenticated;
GRANT SELECT ON model_usage_stats TO anon;

-- 10. Add comments for documentation
COMMENT ON TABLE model_usage_stats IS 'Tracks usage statistics for different background removal models';
COMMENT ON COLUMN model_usage_stats.model_type IS 'Type of model used: isnet_free or bria_rmbg_2.0';
COMMENT ON COLUMN model_usage_stats.image_size_bytes IS 'Size of the input image in bytes';
COMMENT ON COLUMN model_usage_stats.processing_time_ms IS 'Time taken to process the image in milliseconds';
COMMENT ON COLUMN credit_transactions.model_used IS 'Model used for this transaction: isnet_free or bria_rmbg_2.0';
