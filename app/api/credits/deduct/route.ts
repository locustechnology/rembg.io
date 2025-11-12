import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface DeductRequest {
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export async function POST(request: Request) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: DeductRequest = await request.json();
    const { amount, description, metadata } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure atomicity
    const userId = session.user.id;

    // 1. Get current balance
    const { data: creditsData, error: fetchError } = await supabaseAdmin
      .from("credits")
      .select("balance")
      .eq("userId", userId)
      .single();

    if (fetchError || !creditsData) {
      return NextResponse.json(
        { error: "Failed to fetch credits" },
        { status: 500 }
      );
    }

    const currentBalance = creditsData.balance;

    // 2. Check if user has enough credits
    if (currentBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient credits", balance: currentBalance },
        { status: 402 } // Payment Required
      );
    }

    // 3. Deduct credits
    const newBalance = currentBalance - amount;

    const { error: updateError } = await supabaseAdmin
      .from("credits")
      .update({ balance: newBalance })
      .eq("userId", userId);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return NextResponse.json(
        { error: "Failed to deduct credits" },
        { status: 500 }
      );
    }

    // 4. Log transaction
    const { error: logError } = await supabaseAdmin
      .from("credit_transactions")
      .insert({
        userId,
        type: "usage",
        amount: -amount, // Negative for deduction
        balanceAfter: newBalance,
        description,
        metadata: metadata || {},
      });

    if (logError) {
      console.error("Error logging transaction:", logError);
      // Don't fail the request if logging fails, but log the error
    }

    return NextResponse.json({
      success: true,
      balance: newBalance,
      deducted: amount,
    });
  } catch (error) {
    console.error("Credits deduction API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
