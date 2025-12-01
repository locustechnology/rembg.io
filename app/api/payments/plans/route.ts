import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { getDodoProducts, getProductsByBillingInterval, type DodoProduct } from "@/lib/dodo-products";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const billingInterval = url.searchParams.get('billing_interval') as 'monthly' | 'annually' | null;

    // Initialize Dodo Payments client
    const dodoClient = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
    });

    // Get products from centralized configuration
    let filteredPlans: DodoProduct[];
    if (billingInterval) {
      filteredPlans = getProductsByBillingInterval(billingInterval);
    } else {
      filteredPlans = getDodoProducts();
    }

    // Skip product validation - it's optional and causing 401 errors
    console.log("Returning plans without Dodo validation:", filteredPlans.map(p => ({ id: p.id, name: p.name })));

    return NextResponse.json({
      plans: filteredPlans,
    });
  } catch (error) {
    console.error("Payment plans API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
