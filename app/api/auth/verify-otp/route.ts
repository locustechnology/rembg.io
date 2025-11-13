import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setSessionCookie } from "better-auth/cookies";

// OTP Verification endpoint
export async function POST(request: Request) {
  try {
    let { email, otp } = await request.json();

    // Trim whitespace and convert to string
    email = email?.trim();
    otp = String(otp).trim();

    console.log('==========================================');
    console.log('🔐 [OTP VERIFY] Starting verification...');
    console.log('🔐 [OTP VERIFY] Email:', email);
    console.log('🔐 [OTP VERIFY] OTP entered:', otp);
    console.log('🔐 [OTP VERIFY] OTP type:', typeof otp);
    console.log('🔐 [OTP VERIFY] OTP length:', otp.length);
    console.log('==========================================');

    if (!email || !otp) {
      console.log('❌ [OTP VERIFY] Missing email or OTP');
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

    console.log('🔐 [OTP VERIFY] Database query result:');
    console.log('🔐 [OTP VERIFY] Found verification:', !!verification);
    console.log('🔐 [OTP VERIFY] Fetch error:', fetchError?.message || 'none');

    if (verification) {
      console.log('🔐 [OTP VERIFY] Verification details:');
      console.log('🔐 [OTP VERIFY] - ID:', verification.id);
      console.log('🔐 [OTP VERIFY] - Stored OTP:', verification.value);
      console.log('🔐 [OTP VERIFY] - Entered OTP:', otp);
      console.log('🔐 [OTP VERIFY] - Match:', verification.value === otp);
      console.log('🔐 [OTP VERIFY] - Expires:', verification.expiresAt);
    }

    if (fetchError || !verification) {
      // Let's check if ANY OTP exists for this email
      const { data: anyOtp } = await supabaseAdmin
        .from("verification")
        .select("*")
        .eq("identifier", email)
        .maybeSingle();

      if (anyOtp) {
        console.log('⚠️ [OTP VERIFY] OTP exists but doesnt match!');
        console.log('⚠️ [OTP VERIFY] Stored OTP:', anyOtp.value);
        console.log('⚠️ [OTP VERIFY] Entered OTP:', otp);
        console.log('⚠️ [OTP VERIFY] Type comparison:', typeof anyOtp.value, typeof otp);
      } else {
        console.log('❌ [OTP VERIFY] No OTP found in database for this email');
      }

      console.log('==========================================');
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

    // Use Better Auth's internal adapter to create a proper session
    console.log('[OTP Verification] Creating session for user:', userId);

    try {
      // Access Better Auth's internal database adapter
      // @ts-ignore - accessing internal API
      const internalAdapter = auth.options.database;

      // Create session using Better Auth's structure
      const sessionToken = crypto.randomUUID();
      const sessionCreatedAt = new Date();
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Get full user data for session
      const { data: fullUser } = await supabaseAdmin
        .from("user")
        .select("*")
        .eq("id", userId)
        .single();

      if (!fullUser) {
        console.error('[OTP Verification] User not found after creation');
        return NextResponse.json(
          { error: "User not found" },
          { status: 500 }
        );
      }

      console.log('[OTP Verification] Creating session with user data:', {
        userId: fullUser.id,
        email: fullUser.email,
        name: fullUser.name
      });

      // Insert session into database with all required fields
      const { data: sessionData, error: sessionError } = await supabaseAdmin
        .from("session")
        .insert({
          id: crypto.randomUUID(),
          userId: userId,
          token: sessionToken,
          expiresAt: sessionExpiresAt.toISOString(),
          createdAt: sessionCreatedAt.toISOString(),
          updatedAt: sessionCreatedAt.toISOString(),
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        })
        .select()
        .single();

      if (sessionError) {
        console.error('[OTP Verification] Failed to create session:', sessionError);
        return NextResponse.json(
          { error: "Failed to create session" },
          { status: 500 }
        );
      }

      console.log('[OTP Verification] Session created successfully in database');

      // Create response with proper structure
      const response = NextResponse.json({
        success: true,
        message: isNewUser ? "Email verified and signed in successfully" : "Logged in successfully",
        userId,
        isNewUser,
        user: {
          id: fullUser.id,
          email: fullUser.email,
          name: fullUser.name,
          emailVerified: fullUser.emailVerified || true,
        },
      });

      // Set the session cookie with proper attributes
      console.log('[OTP Verification] Setting session cookie:', sessionToken.substring(0, 10) + '...');

      response.cookies.set("better-auth.session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: "/",
        domain: undefined, // Let browser handle domain
      });

      // Also set a secondary cookie for debugging
      response.cookies.set("debug_has_session", "true", {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      console.log('[OTP Verification] Response headers set, returning success');

      return response;
    } catch (sessionCreationError: any) {
      console.error('[OTP Verification] Session creation error:', sessionCreationError);
      return NextResponse.json(
        { error: "Failed to create session", details: sessionCreationError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
