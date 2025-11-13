import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, type = "signup" } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("user")
      .select("id, email")
      .eq("email", email)
      .single();

    // For signup, reject if user exists
    if (type === "signup" && existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please login instead." },
        { status: 409 }
      );
    }

    // For login, reject if user doesn't exist
    if (type === "login" && !existingUser) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up instead." },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await supabaseAdmin
      .from("verification")
      .delete()
      .eq("identifier", email);

    // Store OTP in verification table
    const { error: insertError } = await supabaseAdmin
      .from("verification")
      .insert({
        id: crypto.randomUUID(),
        identifier: email,
        value: otp,
        expiresAt: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return NextResponse.json(
        { error: "Failed to generate OTP" },
        { status: 500 }
      );
    }

    // Send OTP email
    const isLogin = type === "login";
    console.log('==========================================');
    console.log('📧 [EMAIL] Starting email send process...');
    console.log('📧 [EMAIL] Type:', isLogin ? 'LOGIN' : 'SIGNUP');
    console.log('📧 [EMAIL] To:', email);
    console.log('📧 [EMAIL] From:', process.env.FROM_EMAIL);
    console.log('📧 [EMAIL] OTP Code:', otp);
    console.log('==========================================');

    try {
      const emailResult = await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: [email],
        subject: `Your RemBG ${isLogin ? 'login' : 'verification'} code`,
        reply_to: process.env.REPLY_TO_EMAIL,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
                .logo { text-align: center; margin-bottom: 32px; }
                .logo h1 { color: #6366f1; font-size: 32px; margin: 0; font-weight: 700; }
                .content { color: #374151; font-size: 16px; line-height: 1.6; text-align: center; }
                .otp-code { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 36px; font-weight: 700; letter-spacing: 8px; padding: 20px; border-radius: 12px; margin: 24px 0; display: inline-block; }
                .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
                .warning { background-color: #fef3c7; border: 1px solid #fbbf24; color: #92400e; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">
                  <h1>RemBG</h1>
                </div>
                <div class="content">
                  <h2 style="color: #111827; margin-top: 0;">${isLogin ? 'Login to Your Account' : 'Verify Your Email'}</h2>
                  <p>Enter this code to complete your ${isLogin ? 'login' : 'signup'}:</p>

                  <div class="otp-code">${otp}</div>

                  <div class="warning">
                    ⏱️ This code expires in 10 minutes
                  </div>

                  <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                    If you didn't request this code, you can safely ignore this email.
                  </p>
                </div>
                <div class="footer">
                  <p>&copy; 2025 RemBG. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      // Check if Resend returned an error
      if (emailResult.error) {
        console.log('==========================================');
        console.error('❌ [EMAIL] Resend API returned error!');
        console.error('❌ [EMAIL] Error:', JSON.stringify(emailResult.error, null, 2));
        console.log('==========================================');
        throw emailResult.error;
      }

      console.log('==========================================');
      console.log('✅ [EMAIL] Email sent successfully!');
      console.log('✅ [EMAIL] Full Response:', JSON.stringify(emailResult, null, 2));
      console.log('✅ [EMAIL] Resend Email ID:', emailResult.data?.id || 'N/A');
      console.log('✅ [EMAIL] Recipient:', email);
      console.log('✅ [EMAIL] OTP Code:', otp);
      console.log('✅ [EMAIL] Check your inbox at:', email);
      console.log('==========================================');

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to your email",
      });
    } catch (emailError: any) {
      console.log('==========================================');
      console.error('❌ [EMAIL] Failed to send email!');
      console.error('❌ [EMAIL] Error:', emailError);
      console.error('❌ [EMAIL] Error message:', emailError.message);

      // Check if it's a Resend validation error (response in error object)
      if (emailError.error) {
        console.error('❌ [EMAIL] Resend API Error:', JSON.stringify(emailError.error, null, 2));
      }
      console.log('==========================================');

      // If email fails but it's the verified test email, still return success for development
      if (email === process.env.VERIFIED_TEST_EMAIL) {
        console.log('⚠️ [EMAIL] Using verified test email - showing OTP in response');
        return NextResponse.json({
          success: true,
          message: "OTP sent successfully",
          otp, // Show OTP in response for verified test email
        });
      }

      // Check if it's a domain verification error
      const errorMessage = emailError.error?.message || emailError.message || '';
      if (errorMessage.includes('verify a domain') || errorMessage.includes('testing emails')) {
        return NextResponse.json(
          {
            error: `Email delivery restricted. For testing, use ${process.env.VERIFIED_TEST_EMAIL} or verify a domain at resend.com/domains`,
            details: errorMessage,
            otp: otp // Show OTP in development so they can still test
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to send OTP email. Please try again or use Google login.",
          details: errorMessage,
          otp: process.env.NODE_ENV === 'development' ? otp : undefined // Show OTP in dev mode
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
