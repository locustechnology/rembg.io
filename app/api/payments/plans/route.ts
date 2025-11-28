import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all active payment plans
    const { data, error } = await supabaseAdmin
      .from("payment_plans")
      .select("*")
      .eq("active", true)
      .order("price", { ascending: true });

    if (error) {
      console.error("Error fetching payment plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment plans" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      plans: data || [],
    });
  } catch (error) {
    console.error("Payment plans API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
