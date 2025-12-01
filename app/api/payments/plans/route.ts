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

    // Verify the products exist in Dodo Payments (optional validation)
    try {
      const productChecks = await Promise.all(
        filteredPlans.map(async (plan) => {
          try {
            await dodoClient.products.retrieve(plan.id);
            return plan;
          } catch (error) {
            console.error(`Product ${plan.id} not found in Dodo Payments:`, error);
            return null;
          }
        })
      );
      
      filteredPlans = productChecks.filter(plan => plan !== null) as DodoProduct[];
    } catch (error) {
      console.warn("Could not validate products with Dodo Payments:", error);
      // Continue with predefined plans if validation fails
    }

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
