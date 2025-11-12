import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test if auth object exists
    console.log("Auth object exists:", !!auth);

    // Try to get a simple response
    return NextResponse.json({
      success: true,
      message: "Auth API is working",
      baseURL: process.env.BETTER_AUTH_URL,
      hasGoogleClient: !!process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error: any) {
    console.error("Auth test error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
