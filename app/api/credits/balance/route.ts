import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
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

    // Fetch user's credit balance from Supabase
    const { data, error } = await supabaseAdmin
      .from("rembg_credits")
      .select("balance")
      .eq("userId", session.user.id)
      .maybeSingle();

    // If no credits record exists, create one with default 5 credits
    if (error || !data) {
      console.log("No credits record found, creating one with default 5 credits");
      
      // Create credits record with default 5 credits
      const { data: newCredits, error: createError } = await supabaseAdmin
        .from("rembg_credits")
        .insert({
          userId: session.user.id,
          balance: 5,
        })
        .select("balance")
        .single();

      if (createError) {
        console.error("Error creating credits:", createError);
        return NextResponse.json(
          { error: "Failed to create credits record" },
          { status: 500 }
        );
      }

      // Log the signup bonus transaction
      await supabaseAdmin
        .from("rembg_credit_transactions")
        .insert({
          userId: session.user.id,
          type: "signup_bonus",
          amount: 5,
          balanceAfter: 5,
          description: "Welcome bonus - 5 free credits",
          metadata: { source: "auto_created" },
        });

      return NextResponse.json({
        balance: newCredits?.balance || 5,
        userId: session.user.id,
      });
    }

    return NextResponse.json({
      balance: data.balance,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Credits balance API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
