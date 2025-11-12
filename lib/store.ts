import { create } from "zustand";
import type { User, Session } from "./auth";

interface AuthStore {
  user: User | null;
  session: Session | null;
  credits: number;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setCredits: (credits: number) => void;
  setLoading: (loading: boolean) => void;

  // Fetch user's credit balance
  fetchCredits: () => Promise<void>;

  // Deduct credits
  deductCredits: (amount: number, description: string, metadata?: Record<string, any>) => Promise<boolean>;

  // Reset store
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  credits: 0,
  isLoading: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setCredits: (credits) => set({ credits }),
  setLoading: (loading) => set({ isLoading: loading }),

  fetchCredits: async () => {
    try {
      const response = await fetch("/api/credits/balance");
      if (response.ok) {
        const data = await response.json();
        set({ credits: data.balance });
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    }
  },

  deductCredits: async (amount, description, metadata) => {
    try {
      const response = await fetch("/api/credits/deduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          metadata,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        set({ credits: data.balance });
        return true;
      } else if (response.status === 402) {
        // Insufficient credits
        const data = await response.json();
        set({ credits: data.balance });
        return false;
      }

      return false;
    } catch (error) {
      console.error("Failed to deduct credits:", error);
      return false;
    }
  },

  reset: () => set({ user: null, session: null, credits: 0, isLoading: false }),
}));
