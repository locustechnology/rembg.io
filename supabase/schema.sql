-- =====================================================
-- RemBG Database Schema
-- Drop all existing tables and create fresh schema
-- =====================================================

-- Drop existing tables (cascade to remove dependencies)
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS payment_plans CASCADE;
DROP TABLE IF EXISTS credits CASCADE;
DROP TABLE IF EXISTS verification CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- =====================================================
-- Better Auth Tables
-- =====================================================

-- Users table (Better Auth core)
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    image TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sessions table (Better Auth)
CREATE TABLE session (
    id TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP NOT NULL,
    token TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- OAuth Accounts table (Better Auth)
CREATE TABLE account (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP,
    "refreshTokenExpiresAt" TIMESTAMP,
    scope TEXT,
    password TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Email Verification table (Better Auth)
CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Credits System Tables
-- =====================================================

-- Payment Plans table
CREATE TABLE payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    credits INTEGER NOT NULL,
    "dodoProductId" TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User Credits table
CREATE TABLE credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT UNIQUE NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Credit Transactions table (audit log)
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('signup_bonus', 'purchase', 'usage', 'refund')),
    amount INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "planId" UUID REFERENCES payment_plans(id),
    "dodoPaymentId" TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    "creditsAdded" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "completedAt" TIMESTAMP
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_session_user_id ON session("userId");
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_account_user_id ON account("userId");
CREATE INDEX idx_credits_user_id ON credits("userId");
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions("userId");
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions("createdAt" DESC);
CREATE INDEX idx_purchases_user_id ON purchases("userId");
CREATE INDEX idx_purchases_status ON purchases(status);

-- =====================================================
-- Insert Default Payment Plans
-- =====================================================

INSERT INTO payment_plans (name, price, credits, description) VALUES
    ('Starter', 5.00, 25, 'Perfect for occasional use - 25 credits'),
    ('Pro', 9.00, 50, 'Best value for regular users - 50 credits'),
    ('Premium', 19.00, 125, 'Power users - 125 credits');

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE session ENABLE ROW LEVEL SECURITY;
ALTER TABLE account ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Payment plans are public (read-only)
CREATE POLICY "Payment plans are viewable by everyone"
    ON payment_plans FOR SELECT
    USING (active = true);

-- Users can only read their own data
CREATE POLICY "Users can view own user data"
    ON "user" FOR SELECT
    USING (auth.uid()::text = id);

CREATE POLICY "Users can update own user data"
    ON "user" FOR UPDATE
    USING (auth.uid()::text = id);

-- Users can only view their own credits
CREATE POLICY "Users can view own credits"
    ON credits FOR SELECT
    USING (auth.uid()::text = "userId");

-- Users can view their own credit transactions
CREATE POLICY "Users can view own credit transactions"
    ON credit_transactions FOR SELECT
    USING (auth.uid()::text = "userId");

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
    ON purchases FOR SELECT
    USING (auth.uid()::text = "userId");

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to auto-create credits record when user signs up
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO credits ("userId", balance)
    VALUES (NEW.id, 5);

    INSERT INTO credit_transactions ("userId", type, amount, "balanceAfter", description, metadata)
    VALUES (NEW.id, 'signup_bonus', 5, 5, 'Welcome bonus - 5 free credits', '{"source": "signup"}'::jsonb);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create credits on user signup
CREATE TRIGGER on_user_created
    AFTER INSERT ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits();

-- Function to update 'updatedAt' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updatedAt trigger to relevant tables
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON session
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_updated_at BEFORE UPDATE ON account
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at BEFORE UPDATE ON payment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Schema Complete
-- =====================================================

COMMENT ON TABLE "user" IS 'Better Auth user table - stores user accounts';
COMMENT ON TABLE session IS 'Better Auth session table - stores active sessions';
COMMENT ON TABLE account IS 'Better Auth account table - stores OAuth provider accounts';
COMMENT ON TABLE verification IS 'Better Auth verification table - stores email verification tokens';
COMMENT ON TABLE credits IS 'User credit balances - tracks available credits per user';
COMMENT ON TABLE credit_transactions IS 'Audit log for all credit operations';
COMMENT ON TABLE payment_plans IS 'Available pricing plans';
COMMENT ON TABLE purchases IS 'User purchase history';
