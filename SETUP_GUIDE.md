# RemBG Authentication & Credits System - Setup Guide

## What Was Implemented

### 1. Complete Authentication System (Better Auth)
- ✅ Google OAuth login
- ✅ Email OTP (magic link) login
- ✅ Session management
- ✅ Protected routes
- ✅ Login/Signup pages with beautiful UI

### 2. Credit System
- ✅ 5 free credits on signup (automatic via database trigger)
- ✅ Variable pricing based on image size:
  - **Low-res (< 2MB)**: 1 credit
  - **High-res (≥ 2MB)**: 3 credits
- ✅ Credit balance displayed in Navbar
- ✅ Credit deduction before image processing
- ✅ Complete transaction history logging

### 3. Database Schema (Supabase)
- ✅ User accounts table
- ✅ Sessions & OAuth accounts
- ✅ Credits tracking
- ✅ Credit transactions audit log
- ✅ Payment plans ($5/25, $9/50, $19/125 credits)
- ✅ Purchases history
- ✅ Row Level Security policies

### 4. API Routes
- ✅ `/api/auth/*` - Authentication endpoints
- ✅ `/api/credits/balance` - Get user credit balance
- ✅ `/api/credits/deduct` - Deduct credits (with transaction logging)
- ✅ `/api/credits/transactions` - Get transaction history
- ✅ `/api/payments/plans` - Get available pricing plans

### 5. UI Components
- ✅ Navbar with user menu & credit display
- ✅ Login page (Google + Email OTP)
- ✅ Signup page with "5 FREE credits" highlight
- ✅ Credit-gated image processing
- ✅ Insufficient credits messages

---

## CRITICAL: Steps You Must Complete

### Step 1: Apply Database Schema in Supabase ⚠️ REQUIRED

1. Go to your Supabase project dashboard:
   ```
   https://supabase.com/dashboard/project/cctmavwcdsqwkaeonqfk
   ```

2. Click **"SQL Editor"** in the left sidebar

3. Click **"New Query"**

4. Open the file `supabase/schema.sql` and copy its entire contents

5. Paste into the SQL Editor

6. Click **"Run"** (or press Ctrl+Enter)

**This will:**
- Drop all existing tables
- Create fresh tables for Better Auth + Credits system
- Insert default payment plans ($5, $9, $19)
- Set up triggers to auto-grant 5 credits on signup
- Enable Row Level Security

### Step 2: Update Google OAuth Redirect URI

1. Go to Google Cloud Console:
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. Find your OAuth 2.0 Client ID: `21012646205-lkuh1r3gito1lbgn6ddgb4dpasi8gkif.apps.googleusercontent.com`

3. Click Edit

4. Add this to **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

5. Save changes

### Step 3: Test the Complete Flow

**Server is running at:** http://localhost:3000

#### Test Signup Flow:
1. Visit http://localhost:3000
2. Click "Sign up" in the Navbar
3. Sign up with Google OR enter email for magic link
4. If using email:
   - Check your email (`maheshkumarkamalakar@gmail.com` for Resend free tier)
   - Click the verification link
5. After login, you should see:
   - Your avatar in the Navbar
   - **5 credits** displayed in the credit badge

#### Test Credit System:
1. Upload a small image (< 2MB)
   - Should require **1 credit**
2. Click "Remove Background"
3. Check credit balance decreases to **4 credits**
4. Upload a large image (≥ 2MB)
   - Should require **3 credits**
5. Process it, credits should go to **1 credit**
6. Try to process another high-res image
   - Should show "Insufficient credits" error

#### Test Transaction History:
Visit: http://localhost:3000/api/credits/transactions

Should show JSON with all your credit operations

---

## File Structure Created

```
rembg.io/
├── .env.local                          ✅ Environment variables
├── supabase/
│   ├── schema.sql                     ✅ Database schema
│   └── README.md                       ✅ Setup instructions
├── lib/
│   ├── auth.ts                         ✅ Better Auth server config
│   ├── auth-client.ts                  ✅ Better Auth client hooks
│   ├── supabase.ts                     ✅ Supabase client
│   └── store.ts                        ✅ Zustand state management
├── app/
│   ├── api/
│   │   ├── auth/[...all]/route.ts     ✅ Auth handler
│   │   ├── credits/
│   │   │   ├── balance/route.ts       ✅ Get balance
│   │   │   ├── deduct/route.ts        ✅ Deduct credits
│   │   │   └── transactions/route.ts  ✅ Get history
│   │   └── payments/
│   │       └── plans/route.ts         ✅ Get pricing plans
│   ├── login/page.tsx                  ✅ Login page
│   ├── signup/page.tsx                 ✅ Signup page
│   └── page.tsx                        ✅ Updated with credit logic
└── components/
    └── Navbar.tsx                      ✅ Updated with auth UI
```

---

## How Credits Work

### Automatic 5 Free Credits on Signup
When a user signs up, a database trigger automatically:
1. Creates a `credits` record with balance = 5
2. Logs a transaction: `type: 'signup_bonus'`, `amount: 5`

### Credit Deduction Flow
1. User uploads image
2. System calculates cost based on file size:
   ```typescript
   const TWO_MB = 2 * 1024 * 1024;
   const cost = fileSize >= TWO_MB ? 3 : 1;
   ```
3. Checks if user has enough credits
4. Deducts credits via API: `POST /api/credits/deduct`
5. Processes image with `@imgly/background-removal`
6. Transaction logged with metadata (filename, size, timestamp)

### Credit Costs
- **Low-resolution (< 2MB)**: 1 credit
- **High-resolution (≥ 2MB)**: 3 credits

---

## Payment Plans (Database Seeded)

| Plan    | Price | Credits | Description              |
|---------|-------|---------|--------------------------|
| Starter | $5.00 | 25      | Perfect for occasional use |
| Pro     | $9.00 | 50      | Best value for regular users |
| Premium | $19.00| 125     | Power users              |

These are already in your database after running the schema.

---

## Security Features

### Row Level Security (RLS)
- Users can only view/modify their own data
- Credits table protected
- Transactions are read-only for users

### Authentication
- Secure session management via Better Auth
- Email verification required
- OAuth with Google

### Credit System
- Atomic transactions (no double-spending possible)
- Server-side validation
- Complete audit trail

---

## Troubleshooting

### "Unauthorized" error when checking credits
- Make sure you're logged in
- Check browser dev tools → Network tab for session cookie

### Email verification not sending
- Resend free tier only sends to: `maheshkumarkamalakar@gmail.com`
- To send to other emails, verify a domain at https://resend.com/domains

### Google OAuth not working
- Verify redirect URI is correct in Google Console
- Check BETTER_AUTH_URL matches your server port (currently 3000)

### Database errors
- Ensure you ran the `schema.sql` in Supabase SQL Editor
- Check Supabase logs in the dashboard

---

## Next Steps (Optional)

1. **Payment Integration**:
   - We prepared for DoDo Payments but didn't implement checkout yet
   - Need to create `/app/pricing/page.tsx` and payment flow

2. **Dashboard Page**:
   - Create `/app/dashboard/page.tsx`
   - Show credit history, usage stats

3. **Admin Panel**:
   - Manage users, add credits manually, view analytics

4. **Production Deployment**:
   - Update environment variables for production URLs
   - Configure Google OAuth for production domain
   - Set up proper email domain with Resend

---

## Testing Checklist

- [ ] Database schema applied in Supabase
- [ ] Google OAuth redirect URI updated
- [ ] Can sign up with Google
- [ ] Can sign up with email OTP
- [ ] Receive 5 free credits on signup
- [ ] Credit balance shows in Navbar
- [ ] Can remove background from image
- [ ] Credits deducted correctly (1 for small, 3 for large)
- [ ] Insufficient credits message appears when balance is 0
- [ ] Can view transaction history via API

---

## Support

If you encounter any issues:

1. Check browser console for errors
2. Check Network tab for failed API requests
3. Verify all environment variables are correct
4. Ensure database schema was applied successfully
5. Check Supabase logs for database errors

---

**Implementation Complete!** 🎉

All code is ready. Just complete Steps 1-3 above to have a fully functional authentication and credit system.
