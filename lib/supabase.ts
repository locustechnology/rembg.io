import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set. Please check your .env.local file.");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set. Please check your .env.local file.");
}

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Please check your .env.local file.");
}

// Client for client-side operations (uses anon key)
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    db: {
      schema: 'public'
    }
  }
);

// Admin client for server-side operations (uses service role key)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    db: {
      schema: 'public'
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database types
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Credits {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: "signup_bonus" | "purchase" | "usage" | "refund";
  amount: number;
  balanceAfter: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  dodoProductId?: string;
  active: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  planId?: string;
  dodoPaymentId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  amount: number;
  creditsAdded: number;
  createdAt: string;
  completedAt?: string;
}
