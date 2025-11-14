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

    // Fetch the payment plan from database
    const { data: plan, error: planError } = await supabaseAdmin
      .from("payment_plans")
      .select("*")
      .eq("id", planId)
      .eq("active", true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 404 }
      );
    }

    if (!plan.dodoProductId) {
      return NextResponse.json(
        { error: "Payment plan not properly configured" },
        { status: 500 }
      );
    }

    // Initialize Dodo Payments client
    const dodoClient = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
    });

    // Create payment link
    const payment = await dodoClient.payments.create({
      productId: plan.dodoProductId,
      quantity: 1,
      customer: {
        email: session.user.email,
        name: session.user.name || session.user.email,
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}?payment=success&planId=${planId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}?payment=cancelled`,
      metadata: {
        userId: session.user.id,
        planId: planId,
        credits: plan.credits.toString(),
      },
    });

    if (!payment.payment_link) {
      return NextResponse.json(
        { error: "Failed to create payment link" },
        { status: 500 }
      );
    }

    // Create pending purchase record
    const { error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        userId: session.user.id,
        planId: planId,
        dodoPaymentId: payment.id,
        status: "pending",
        amount: plan.price,
        creditsAdded: plan.credits,
      });

    if (purchaseError) {
      console.error("Error creating purchase record:", purchaseError);
      // Continue anyway - we can reconcile later
    }

    return NextResponse.json({
      checkoutUrl: payment.payment_link,
      paymentId: payment.id,
    });

  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
