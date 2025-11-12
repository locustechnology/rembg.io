# Supabase Database Setup

## How to Apply the Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/cctmavwcdsqwkaeonqfk
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire content from `schema.sql`
5. Click **Run** (or press Ctrl+Enter)

The script will:
- Drop all existing tables
- Create fresh tables for Better Auth and credits system
- Set up indexes for performance
- Add Row Level Security policies
- Insert default payment plans ($5/25, $9/50, $19/125 credits)
- Create triggers for auto-granting 5 free credits on signup

## Database Structure

### Better Auth Tables
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth provider accounts (Google)
- `verification` - Email verification tokens

### Credits System Tables
- `credits` - User credit balances (default: 5 free credits)
- `credit_transactions` - Audit log of all credit operations
- `payment_plans` - Pricing tiers
- `purchases` - Purchase history

## Important Notes

- Every new user automatically gets 5 free credits (handled by trigger)
- Credits are deducted as: 1 credit (low-res < 2MB) | 3 credits (high-res >= 2MB)
- All credit operations are logged in `credit_transactions` for audit trail
- Row Level Security (RLS) is enabled to protect user data
