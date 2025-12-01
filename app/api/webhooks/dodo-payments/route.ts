import { Webhooks } from '@dodopayments/nextjs'
import { supabaseAdmin } from "@/lib/supabase";

export const POST = Webhooks({
  webhookKey: process.env.DODO_WEBHOOK_SECRET!,

  // Handle successful payments
  onPaymentSucceeded: async (payload) => {
    try {
      console.log("[WEBHOOK] Payment succeeded - Full payload:", JSON.stringify(payload, null, 2));

      // Extract metadata from the payment
      const { metadata } = payload.data;
      const userId = metadata?.userId;
      const planId = metadata?.planId;
      const credits = parseInt(metadata?.credits || "0");
      const billingInterval = metadata?.billing_interval;
      const planName = metadata?.planName;

      console.log("[WEBHOOK] Extracted metadata:", { userId, planId, credits, billingInterval, planName, paymentId: payload.id });

      if (!userId || !planId || !credits) {
        console.error("[WEBHOOK] Missing required metadata:", { userId, planId, credits });
        return;
      }

      // Define plan details from metadata (no DB lookup needed)
      const plan = {
        id: planId,
        name: planName || 'Unknown Plan',
        credits: credits,
        billing_interval: billingInterval || 'unknown'
      };

      // Get the most recent pending purchase for this user
      // We can't match by dodoPaymentId because checkout stores session_id, webhook sends payment_id
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from("purchases")
        .select("*")
        .eq("userId", userId)
        .eq("status", "pending")
        .order("createdAt", { ascending: false })
        .limit(1)
        .single();

      if (purchaseError || !purchase) {
        console.log("[WEBHOOK] No pending purchase found or already processed");
        console.log("[WEBHOOK] Purchase error:", purchaseError);
        return;
      }

      // Update the purchase with the actual payment_id from webhook
      await supabaseAdmin
        .from("purchases")
        .update({ dodoPaymentId: payload.id })
        .eq("id", purchase.id);

      // Get current credit balance
      const { data: creditData, error: creditError } = await supabaseAdmin
        .from("credits")
        .select("balance")
        .eq("userId", userId)
        .single();

      if (creditError) {
        console.error("[WEBHOOK] Error fetching credits:", creditError);
        return;
      }

      const currentBalance = creditData.balance;
      const newBalance = currentBalance + credits;

      // Update credit balance
      const { error: updateError } = await supabaseAdmin
        .from("credits")
        .update({ balance: newBalance })
        .eq("userId", userId);

      if (updateError) {
        console.error("[WEBHOOK] Error updating credits:", updateError);
        return;
      }

      // Log the transaction
      const { error: transactionError } = await supabaseAdmin
        .from("credit_transactions")
        .insert({
          userId: userId,
          type: "purchase",
          amount: credits,
          balanceAfter: newBalance,
          description: `Purchased ${plan.name} plan (${plan.billing_interval}) - ${credits} credits`,
          metadata: {
            planId: planId,
            planName: plan.name,
            billingInterval: plan.billing_interval,
            purchaseId: purchase.id,
            dodoPaymentId: payload.id,
            webhookProcessed: true,
          },
        });

      if (transactionError) {
        console.error("[WEBHOOK] Error logging transaction:", transactionError);
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
        console.error("[WEBHOOK] Error updating purchase:", purchaseUpdateError);
      }

      console.log(`[WEBHOOK] Successfully processed payment for user ${userId}: Added ${credits} credits`);
    } catch (error: any) {
      console.error("[WEBHOOK] Error processing payment:", error);
    }
  },

  // Handle failed payments
  onPaymentFailed: async (payload) => {
    console.log("[WEBHOOK] Payment failed:", payload);

    const { metadata } = payload.data;
    const userId = metadata?.userId;

    if (!userId) return;

    // Update purchase status to failed
    const { error } = await supabaseAdmin
      .from("purchases")
      .update({
        status: "failed",
        completedAt: new Date().toISOString(),
      })
      .eq("userId", userId)
      .eq("dodoPaymentId", payload.id);

    if (error) {
      console.error("[WEBHOOK] Error updating failed purchase:", error);
    }
  },

  // Handle subscription events (for future use)
  onSubscriptionActive: async (payload) => {
    console.log("[WEBHOOK] Subscription activated:", payload);
    // Add subscription logic here if needed
  },

  onSubscriptionCancelled: async (payload) => {
    console.log("[WEBHOOK] Subscription cancelled:", payload);
    // Add subscription cancellation logic here if needed
  },

  // Catch-all for any webhook event
  onPayload: async (payload) => {
    console.log("[WEBHOOK] Received webhook event:", payload.type);
  },
});
