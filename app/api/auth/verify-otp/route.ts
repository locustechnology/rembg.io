import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

    // For now, redirect to password login since OTP session persistence is complex
    // User should use password auth or Google OAuth instead
    console.log('[OTP Verification] OTP verified successfully for user:', userId);
    console.log('[OTP Verification] Redirecting to password setup...');

    return NextResponse.json({
      success: true,
      message: isNewUser
        ? "Email verified! Please set a password to complete signup."
        : "Email verified! Please use password login or Google sign-in.",
      userId,
      isNewUser,
      requirePasswordSetup: true, // Flag to show password setup UI
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
