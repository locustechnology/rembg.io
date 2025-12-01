import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import DodoPayments from "dodopayments";
import { findProductById } from "@/lib/dodo-products";

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

    // Find the plan from our centralized product configuration
    const plan = findProductById(planId);

    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 404 }
      );
    }

    // Initialize Dodo Payments client
    const dodoClient = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
    });

    // Create checkout session with product_cart (new Dodo API format)
    const checkoutSession = await dodoClient.checkoutSessions.create({
      product_cart: [
        {
          product_id: plan.id,
          quantity: 1,
        },
      ],
      customer: {
        email: session.user.email,
        name: session.user.name || session.user.email,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}?payment=success&planId=${planId}`,
      metadata: {
        userId: session.user.id,
        planId: planId,
        credits: plan.credits.toString(),
        billing_interval: plan.billing_interval,
        planName: plan.name,
      },
    });

    if (!checkoutSession.checkout_url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // Create pending purchase record
    const { error: purchaseError} = await supabaseAdmin
      .from("purchases")
      .insert({
        userId: session.user.id,
        planId: null, // Not using DB plan ID anymore
        dodoPaymentId: checkoutSession.session_id,
        status: "pending",
        amount: plan.price,
        creditsAdded: plan.credits,
      });

    if (purchaseError) {
      console.error("Error creating purchase record:", purchaseError);
      // Continue anyway - we can reconcile later
    }

    return NextResponse.json({
      checkoutUrl: checkoutSession.checkout_url,
      paymentId: checkoutSession.session_id,
    });

  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
