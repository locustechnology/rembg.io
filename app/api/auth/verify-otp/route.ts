import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// OTP Verification endpoint
export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find the OTP verification record
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from("verification")
      .select("*")
      .eq("identifier", email)
      .eq("value", otp)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    // Note: Database returns timestamps without 'Z', so we need to handle timezone properly
    const expiresAt = new Date(verification.expiresAt + 'Z'); // Ensure UTC interpretation
    const now = new Date();

    console.log('[OTP Verification] Expires At:', expiresAt.toISOString());
    console.log('[OTP Verification] Current Time:', now.toISOString());
    console.log('[OTP Verification] Is Expired?:', expiresAt < now);

    if (expiresAt < now) {
      // Delete expired OTP
      await supabaseAdmin
        .from("verification")
        .delete()
        .eq("id", verification.id);

      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("user")
      .select("id, email, name")
      .eq("email", email)
      .single();

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // Existing user - this is a login
      userId = existingUser.id;
      console.log(`Existing user logging in: ${email}`);
    } else {
      // New user - create account
      userId = crypto.randomUUID();
      const { error: createUserError } = await supabaseAdmin
        .from("user")
        .insert({
          id: userId,
          email,
          name: email.split("@")[0], // Use email username as name
          emailVerified: true,
        });

      if (createUserError) {
        console.error("Error creating user:", createUserError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
      isNewUser = true;
      console.log(`User created successfully: ${email}`);
    }

    // Delete used OTP
    await supabaseAdmin
      .from("verification")
      .delete()
      .eq("id", verification.id);

    // Create a session for the user manually
    const sessionToken = crypto.randomUUID();
    const sessionCreatedAt = new Date();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { error: sessionError } = await supabaseAdmin
      .from("session")
      .insert({
        id: crypto.randomUUID(),
        userId: userId,
        token: sessionToken,
        expiresAt: sessionExpiresAt.toISOString(),
        createdAt: sessionCreatedAt.toISOString(),
        updatedAt: sessionCreatedAt.toISOString(),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });

    if (sessionError) {
      console.error('[OTP Verification] Failed to create session:', sessionError);
      return NextResponse.json({
        success: true,
        message: "Email verified successfully. Please login with Google.",
        userId,
        requiresLogin: true,
      });
    }

    console.log('[OTP Verification] Session created successfully');

    // Set the session cookie
    const response = NextResponse.json({
      success: true,
      message: isNewUser ? "Email verified and signed in successfully" : "Logged in successfully",
      userId,
      isNewUser,
    });

    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
