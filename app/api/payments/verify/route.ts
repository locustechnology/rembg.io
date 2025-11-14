import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log("[VERIFY] Manual payment verification requested");

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

    console.log(`[VERIFY] Checking for pending purchase: userId=${session.user.id}, planId=${planId}`);

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
      console.log("[VERIFY] No pending purchase found");
      return NextResponse.json(
        { error: "No pending purchase found or already processed" },
        { status: 404 }
      );
    }

    console.log(`[VERIFY] Found pending purchase: ${purchase.id}`);

    // Get the payment plan details
    const { data: plan, error: planError } = await supabaseAdmin
      .from("payment_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      console.error("[VERIFY] Payment plan not found:", planError);
      return NextResponse.json(
        { error: "Payment plan not found" },
        { status: 404 }
      );
    }

    // Get current credit balance
    const { data: creditData, error: creditError } = await supabaseAdmin
      .from("credits")
      .select("balance")
      .eq("userId", session.user.id)
      .single();

    if (creditError) {
      console.error("[VERIFY] Error fetching credits:", creditError);
      return NextResponse.json(
        { error: "Failed to fetch credit balance" },
        { status: 500 }
      );
    }

    const currentBalance = creditData.balance;
    const newBalance = currentBalance + plan.credits;

    console.log(`[VERIFY] Adding credits: ${currentBalance} + ${plan.credits} = ${newBalance}`);

    // Update credit balance
    const { error: updateError } = await supabaseAdmin
      .from("credits")
      .update({ balance: newBalance })
      .eq("userId", session.user.id);

    if (updateError) {
      console.error("[VERIFY] Error updating credits:", updateError);
      return NextResponse.json(
        { error: "Failed to update credit balance" },
        { status: 500 }
      );
    }

    // Log the transaction
    const { error: transactionError } = await supabaseAdmin
      .from("credit_transactions")
      .insert({
        userId: session.user.id,
        type: "purchase",
        amount: plan.credits,
        balanceAfter: newBalance,
        description: `Purchased ${plan.name} plan - ${plan.credits} credits`,
        metadata: {
          planId: planId,
          planName: plan.name,
          purchaseId: purchase.id,
          dodoPaymentId: purchase.dodoPaymentId,
          manuallyVerified: true,
        },
      });

    if (transactionError) {
      console.error("[VERIFY] Error logging transaction:", transactionError);
    }

    // Update purchase status
    const { error: purchaseUpdateError } = await supabaseAdmin
      .from("purchases")
      .update({
        status: "completed",
        completedAt: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    if (purchaseUpdateError) {
      console.error("[VERIFY] Error updating purchase:", purchaseUpdateError);
    }

    console.log(`[VERIFY] Successfully verified payment and added ${plan.credits} credits`);

    return NextResponse.json({
      success: true,
      creditsAdded: plan.credits,
      newBalance: newBalance,
      planName: plan.name,
    });

  } catch (error: any) {
    console.error("[VERIFY] Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
