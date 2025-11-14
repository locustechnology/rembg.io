import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import DodoPayments from "dodopayments";

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Get the latest pending purchase for this user and plan
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .eq("userId", session.user.id)
      .eq("planId", planId)
      .eq("status", "pending")
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: "No pending purchase found" },
        { status: 404 }
      );
    }

    // Initialize Dodo Payments client
    const dodoClient = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
    });

    // Get payment status from Dodo
    const payment = await dodoClient.payments.get(purchase.dodoPaymentId);

    if (payment.status !== "completed") {
      return NextResponse.json(
        {
          error: "Payment not completed",
          status: payment.status,
        },
        { status: 400 }
      );
    }

    // Get the payment plan details
    const { data: plan, error: planError } = await supabaseAdmin
      .from("payment_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Payment plan not found" },
        { status: 404 }
      );
    }

    // Start a transaction-like operation using multiple queries
    // 1. Get current credit balance
    const { data: creditData, error: creditError } = await supabaseAdmin
      .from("credits")
      .select("balance")
      .eq("userId", session.user.id)
      .single();

    if (creditError) {
      console.error("Error fetching credits:", creditError);
      return NextResponse.json(
        { error: "Failed to fetch credit balance" },
        { status: 500 }
      );
    }

    const currentBalance = creditData.balance;
    const newBalance = currentBalance + plan.credits;

    // 2. Update credit balance
    const { error: updateError } = await supabaseAdmin
      .from("credits")
      .update({ balance: newBalance })
      .eq("userId", session.user.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return NextResponse.json(
        { error: "Failed to update credit balance" },
        { status: 500 }
      );
    }

    // 3. Log the transaction
    const { error: transactionError } = await supabaseAdmin
      .from("credit_transactions")
      .insert({
        userId: session.user.id,
        type: "purchase",
        amount: plan.credits,
        balanceAfter: newBalance,
        metadata: {
          planId: planId,
          planName: plan.name,
          purchaseId: purchase.id,
          dodoPaymentId: purchase.dodoPaymentId,
        },
      });

    if (transactionError) {
      console.error("Error logging transaction:", transactionError);
      // Continue anyway - credits were added
    }

    // 4. Update purchase status
    const { error: purchaseUpdateError } = await supabaseAdmin
      .from("purchases")
      .update({
        status: "completed",
        completedAt: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    if (purchaseUpdateError) {
      console.error("Error updating purchase:", purchaseUpdateError);
      // Continue anyway - credits were added
    }

    return NextResponse.json({
      success: true,
      creditsAdded: plan.credits,
      newBalance: newBalance,
      planName: plan.name,
    });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
