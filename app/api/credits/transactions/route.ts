import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch user's transaction history
    const { data, error, count } = await supabaseAdmin
      .from("credit_transactions")
      .select("*", { count: "exact" })
      .eq("userId", session.user.id)
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transactions: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
