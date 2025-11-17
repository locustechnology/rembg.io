# RemBG.io - AI-Powered Background Removal

![RemBG Logo](public/rembg_photo_2025-11-17_13-29-10_2025-11-17_07-59-47_isnet.png)

Remove backgrounds from images instantly with AI. 100% automatic, fast, and powered by advanced AI models.

## 🌟 Features

### Core Features
- **AI Background Removal** - Remove backgrounds from images using state-of-the-art AI models
- **Dual-Model System**
  - **Free ISNet Model** - Fast and accurate for general use
  - **Premium Bria Model** - Superior quality for professional results
- **Multi-Format Support** - Download in PNG, JPG, or WebP formats
- **Drag & Drop Upload** - Easy-to-use interface with drag-and-drop functionality

### Authentication & User Management
- **Multiple Login Options**
  - Email/Password authentication
  - Google OAuth integration
  - Magic link (OTP) email login
- **Password Management**
  - Secure password reset via email
  - Password visibility toggle on all forms
  - Minimum 8-character requirement
- **User Dashboard**
  - Credits balance tracking
  - Transaction history
  - Profile management

### Payment & Credits System
- **Credit-Based System** - Pay only for what you use
- **Multiple Plans**
  - Free trial with 5 credits
  - Starter: 50 credits
  - Pro: 200 credits
  - Business: 500 credits
- **Secure Payments** - Integrated with Dodo Payments
- **Automatic Credit Deduction** - Credits deducted per image processed

### Additional Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Contact Support** - WhatsApp and email integration
- **SEO Optimized** - Fully optimized for search engines
- **Fast Performance** - Optimized build with Next.js 14

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Icon library

### Backend & Database
- **Better Auth** - Modern authentication library
- **PostgreSQL** - Relational database via Supabase
- **Supabase** - Backend as a Service (BaaS)

### AI & Image Processing
- **ISNet** - Free background removal model
- **Bria RMBG 2.0** - Premium background removal API

### Email & Notifications
- **Resend** - Transactional email service
- **Sonner** - Toast notifications

### Payment Integration
- **Dodo Payments** - Payment gateway for credit purchases

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database (or Supabase account)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/locustechnology/rembg.io.git
cd rembg.io
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_postgresql_connection_string

# Better Auth (for sessions and authentication)
BETTER_AUTH_SECRET=your_random_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Bria AI API (Premium Model)
BRIA_API_KEY=your_bria_api_key

# Payment Gateway
DODO_PAYMENTS_API_KEY=your_dodo_payments_api_key
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Database Setup

Run the database migrations to set up the required tables:

```sql
-- Users table (managed by Better Auth)
-- Credits table
-- Transactions table
-- Sessions table
```

Or use the Supabase dashboard to run the SQL migrations from the `/database` folder.

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
rembg.io/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── background-removal/   # Image processing endpoints
│   │   ├── credits/              # Credits management
│   │   ├── payments/             # Payment processing
│   │   └── webhooks/             # Webhook handlers
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   ├── pricing/                  # Pricing page
│   ├── contact/                  # Contact page
│   ├── reset-password/           # Password reset page
│   ├── forgot-password/          # Forgot password page
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── Footer.tsx                # Footer component
│   ├── Navbar.tsx                # Navigation bar
│   └── HeroSection.tsx           # Hero/Upload section
├── lib/                          # Utility functions
│   ├── auth.ts                   # Better Auth configuration
│   ├── auth-client.ts            # Auth client hooks
│   ├── supabase.ts               # Supabase client
│   └── store.ts                  # State management
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── package.json                  # Dependencies
```

## 🔐 Authentication Flow

### Email/Password Authentication
1. User signs up with email and password
2. Email verification sent (optional)
3. User logs in with credentials
4. Session created with Better Auth

### Google OAuth
1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. After approval, user is authenticated
4. Session created automatically

### Magic Link (OTP)
1. User enters email address
2. 6-digit OTP sent to email
3. User enters OTP to verify
4. Session created upon successful verification

## 💳 Payment Flow

1. User selects a credit plan on pricing page
2. Redirected to Dodo Payments checkout
3. User completes payment
4. Webhook receives payment confirmation
5. Credits automatically added to user account
6. Transaction recorded in database

## 🖼️ Image Processing Flow

1. User uploads image (drag-drop or click)
2. Image sent to selected AI model (ISNet or Bria)
3. Background removed by AI
4. Credits deducted from user account
5. Processed image returned to user
6. User can download in PNG, JPG, or WebP format

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically

```bash
# Or use Vercel CLI
vercel --prod
```

### Environment Variables on Vercel
Make sure to add all environment variables from `.env.local` to your Vercel project settings.

## 📊 Database Schema

### Users Table
- `id` - Unique user identifier
- `email` - User email address
- `name` - User display name
- `password` - Hashed password (if using email/password)
- `emailVerified` - Email verification status
- `image` - Profile picture URL
- `createdAt` - Account creation timestamp

### Credits Table
- `id` - Unique record ID
- `user_id` - Foreign key to users table
- `balance` - Current credit balance
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

### Transactions Table
- `id` - Unique transaction ID
- `user_id` - Foreign key to users table
- `amount` - Credits added/deducted
- `type` - Transaction type (purchase, deduction)
- `description` - Transaction description
- `created_at` - Transaction timestamp

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, email support@gostudio.ai or contact us via WhatsApp.

## 🙏 Acknowledgments

- **Better Auth** - Modern authentication library
- **Bria AI** - Premium background removal API
- **ISNet** - Free background removal model
- **Supabase** - Backend as a Service
- **Vercel** - Hosting platform
- **Resend** - Email service

---

**Built with ❤️ by GoStudio.ai**

Visit us at [gostudio.ai](https://gostudio.ai)
