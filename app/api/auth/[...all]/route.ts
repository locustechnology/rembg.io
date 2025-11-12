import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handlers = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  try {
    console.log("[AUTH] GET request to:", request.url);
    return await handlers.GET(request);
  } catch (error: any) {
    console.error("[AUTH] GET Error:", error.message);
    console.error("[AUTH] Stack:", error.stack);
    return NextResponse.json(
      { error: error.message, details: error.stack },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[AUTH] POST request to:", request.url);
    const body = await request.clone().json().catch(() => ({}));
    console.log("[AUTH] Request body:", JSON.stringify(body, null, 2));
    return await handlers.POST(request);
  } catch (error: any) {
    console.error("[AUTH] POST Error:", error.message);
    console.error("[AUTH] Stack:", error.stack);
    return NextResponse.json(
      { error: error.message, details: error.stack },
      { status: 500 }
    );
  }
}
