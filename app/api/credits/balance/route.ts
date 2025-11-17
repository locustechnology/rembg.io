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
      .from("credits")
      .select("balance")
      .eq("userId", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching credits:", error);
      return NextResponse.json(
        { error: "Failed to fetch credits" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      balance: data?.balance || 0,
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
