// Test script for Resend email verification - matching curl format
const { Resend } = require("resend");

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testResendEmail() {
  console.log("\n🔍 Testing Resend Email Configuration (Curl Format)...\n");

  // Check if API key is loaded
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set in .env.local");
    process.exit(1);
  }

  if (!process.env.FROM_EMAIL) {
    console.error("❌ FROM_EMAIL is not set in .env.local");
    process.exit(1);
  }

  console.log("✅ API Key loaded:", process.env.RESEND_API_KEY.substring(0, 10) + "...");
  console.log("✅ From Email:", process.env.FROM_EMAIL);

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Test email recipient
  const testEmail = process.env.VERIFIED_TEST_EMAIL || "maheshkamalakar1@gmail.com";
  const replyTo = process.env.REPLY_TO_EMAIL || "maheshkamalakar1@gmail.com";

  console.log(`📧 Sending test email to: ${testEmail}`);
  console.log(`📧 Reply-to: ${replyTo}\n`);

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [testEmail],
      subject: "Verify your RemBG account - Test",
      reply_to: replyTo,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
              .logo { text-align: center; margin-bottom: 32px; }
              .logo h1 { color: #6366f1; font-size: 32px; margin: 0; font-weight: 700; }
              .content { color: #374151; font-size: 16px; line-height: 1.6; }
              .button { display: inline-block; background-color: #6366f1; color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
              .button:hover { background-color: #4f46e5; }
              .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
              .credits-badge { background-color: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 12px 20px; border-radius: 8px; margin: 24px 0; text-align: center; font-weight: 600; }
              .test-badge { background-color: #fef3c7; border: 1px solid #fbbf24; color: #92400e; padding: 8px 16px; border-radius: 6px; margin-bottom: 16px; text-align: center; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="test-badge">🧪 TEST EMAIL - Matching Curl Format</div>
              <div class="logo">
                <h1>RemBG</h1>
              </div>
              <div class="content">
                <h2 style="color: #111827; margin-top: 0;">Welcome to RemBG!</h2>
                <p>Hi there,</p>
                <p><strong>It works!</strong> 🎉</p>
                <p>This test email confirms that the Resend integration is working correctly with your curl format.</p>
                <p>Click the button below to verify your email address:</p>
                <div style="text-align: center;">
                  <a href="http://localhost:3000/verify-email?token=test-token-12345" class="button">Verify Email Address</a>
                </div>
                <div class="credits-badge">
                  🎉 You'll receive 5 FREE credits after verification!
                </div>
                <p style="font-size: 14px; color: #6b7280;">
                  Configuration details:
                  <br>• From: ${process.env.FROM_EMAIL}
                  <br>• To: ${testEmail}
                  <br>• Reply-To: ${replyTo}
                </p>
              </div>
              <div class="footer">
                <p>This is a test email from your RemBG application.</p>
                <p style="margin-top: 8px;">&copy; 2025 RemBG. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("\n📋 Response data:");
    console.log(JSON.stringify(data, null, 2));
    console.log("\n✨ Check your inbox at:", testEmail);
    console.log("\n🎉 Resend integration is working correctly with curl format!\n");
  } catch (error) {
    console.error("\n❌ Failed to send email:");
    console.error(error);
    console.log("\n🔍 Debugging tips:");
    console.log("1. Verify your API key is correct");
    console.log("2. Check if the FROM_EMAIL domain is verified in Resend");
    console.log("3. Ensure you have credits in your Resend account");
    console.log("4. Verify the email format matches: 'Name <email@domain.com>'");
    process.exit(1);
  }
}

testResendEmail();
