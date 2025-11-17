import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handlers = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    console.log("[AUTH] GET request to:", request.url);
    console.log("[AUTH] Path:", url.pathname);
    console.log("[AUTH] Cookies:", request.cookies.toString());

    const response = await handlers.GET(request);
    console.log("[AUTH] Response status:", response.status);

    // Log response body for debugging (clone to not consume the stream)
    if (url.pathname.includes("get-session")) {
      const clonedResponse = response.clone();
      const body = await clonedResponse.text();
      console.log("[AUTH] /get-session Response body:", body);
    }

    return response;
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
    const response = await handlers.POST(request);
    console.log("[AUTH] Response status:", response.status);
    return response;
  } catch (error: any) {
    console.error("[AUTH] POST Error:", error.message);
    console.error("[AUTH] Stack:", error.stack);
    return NextResponse.json(
      { error: error.message, details: error.stack },
      { status: 500 }
    );
  }
}
