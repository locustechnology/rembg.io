import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { removeBackgroundBria } from "@/lib/fal-client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BRIA_CREDIT_COST = 2;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required for Bria Superior model" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[BRIA API] Processing request for user:', userId);

    // 2. Parse request
    const { imageUrl, fileName, fileSize } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // 3. Check credit balance
    const { data: creditData, error: creditError } = await supabase
      .from("credits")
      .select("balance")
      .eq("userId", userId)
      .single();

    if (creditError || !creditData) {
      console.error('[BRIA API] Failed to fetch credits:', creditError);
      return NextResponse.json(
        { error: "Failed to fetch credit balance" },
        { status: 500 }
      );
    }

    if (creditData.balance < BRIA_CREDIT_COST) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: BRIA_CREDIT_COST,
          available: creditData.balance,
          message: `You need ${BRIA_CREDIT_COST} credits to use the Superior model, but you only have ${creditData.balance} credits.`
        },
        { status: 402 }
      );
    }

    // 4. Process with Bria model via fal.ai
    console.log('[BRIA API] Starting background removal with Bria RMBG 2.0');

    const result = await removeBackgroundBria(imageUrl);

    const processingTime = Date.now() - startTime;
    console.log(`[BRIA API] Processing completed in ${processingTime}ms`);

    // 5. Deduct credits
    const { data: updatedCredits, error: deductError } = await supabase
      .from("credits")
      .update({
        balance: creditData.balance - BRIA_CREDIT_COST,
        updatedAt: new Date().toISOString()
      })
      .eq("userId", userId)
      .select()
      .single();

    if (deductError) {
      console.error('[BRIA API] Failed to deduct credits:', deductError);
      return NextResponse.json(
        { error: "Failed to deduct credits. Please contact support." },
        { status: 500 }
      );
    }

    console.log(`[BRIA API] Deducted ${BRIA_CREDIT_COST} credits. New balance: ${updatedCredits.balance}`);

    // 6. Log credit transaction
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        userId,
        type: "usage_premium",
        amount: -BRIA_CREDIT_COST,
        balanceAfter: updatedCredits.balance,
        description: `Bria RMBG 2.0 - ${fileName || 'image'}`,
        model_used: "bria_rmbg_2.0",
        metadata: {
          fileName: fileName || 'unknown',
          fileSize: fileSize || 0,
          processingTimeMs: processingTime,
          creditCost: BRIA_CREDIT_COST,
          timestamp: new Date().toISOString(),
          resultImageUrl: result.image.url,
        },
      });

    if (transactionError) {
      console.error('[BRIA API] Failed to log transaction:', transactionError);
      // Don't fail the request, just log the error
    }

    // 7. Log usage stats for analytics
    const { error: statsError } = await supabase
      .from("model_usage_stats")
      .insert({
        user_id: userId,
        model_type: "bria_rmbg_2.0",
        image_size_bytes: fileSize || 0,
        processing_time_ms: processingTime,
        success: true,
      });

    if (statsError) {
      console.error('[BRIA API] Failed to log stats:', statsError);
      // Don't fail the request, just log the error
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      imageUrl: result.image.url,
      image: result.image,
      creditsUsed: BRIA_CREDIT_COST,
      newBalance: updatedCredits.balance,
      processingTime,
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('[BRIA API] Error:', error);

    // Log failed attempt if user is authenticated
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.user) {
        await supabase.from("model_usage_stats").insert({
          user_id: session.user.id,
          model_type: "bria_rmbg_2.0",
          success: false,
          error_message: error.message || 'Unknown error',
          processing_time_ms: processingTime,
        });
      }
    } catch (logError) {
      console.error('[BRIA API] Failed to log error stats:', logError);
    }

    return NextResponse.json(
      {
        error: "Background removal failed",
        details: error.message || 'Unknown error occurred',
        help: "Please try again or contact support if the problem persists."
      },
      { status: 500 }
    );
  }
}
