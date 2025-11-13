// Comprehensive OTP Flow Test Script
require('dotenv').config({ path: '.env.local' });

const BASE_URL = "http://localhost:3000";

async function testSignupFlow(email) {
  console.log("\n=== TESTING SIGNUP FLOW ===\n");
  
  console.log(`📧 Testing with email: ${email}`);
  
  // Step 1: Send OTP for signup
  console.log("\n1️⃣ Sending OTP for signup...");
  const sendOtpResponse = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, type: "signup" }),
  });
  
  const sendOtpData = await sendOtpResponse.json();
  console.log("Response:", sendOtpData);
  
  if (!sendOtpResponse.ok) {
    console.error("❌ Failed to send OTP:", sendOtpData.error);
    return false;
  }
  
  console.log("✅ OTP sent successfully!");
  console.log("📧 Check your email at:", email);
  console.log("\n⏳ Please enter the 6-digit OTP from your email:");
  
  return true;
}

async function testLoginFlow(email) {
  console.log("\n=== TESTING LOGIN FLOW ===\n");
  
  console.log(`📧 Testing with email: ${email}`);
  
  // Step 1: Send OTP for login
  console.log("\n1️⃣ Sending OTP for login...");
  const sendOtpResponse = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, type: "login" }),
  });
  
  const sendOtpData = await sendOtpResponse.json();
  console.log("Response:", sendOtpData);
  
  if (!sendOtpResponse.ok) {
    console.error("❌ Failed to send OTP:", sendOtpData.error);
    return false;
  }
  
  console.log("✅ OTP sent successfully!");
  console.log("📧 Check your email at:", email);
  console.log("\n⏳ Please enter the 6-digit OTP from your email:");
  
  return true;
}

async function testVerifyOTP(email, otp) {
  console.log("\n2️⃣ Verifying OTP...");
  
  const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  
  const verifyData = await verifyResponse.json();
  console.log("Response:", verifyData);
  
  if (!verifyResponse.ok) {
    console.error("❌ Failed to verify OTP:", verifyData.error);
    return false;
  }
  
  console.log("✅ OTP verified successfully!");
  console.log("✅ User logged in!");
  
  // Extract session cookie
  const cookies = verifyResponse.headers.get("set-cookie");
  if (cookies) {
    console.log("\n🍪 Session cookie set:", cookies.includes("better-auth.session_token") ? "Yes" : "No");
  }
  
  return true;
}

async function main() {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   RemBG OTP Flow Test Suite          ║");
  console.log("╚════════════════════════════════════════╝\n");
  
  const testEmail = process.env.VERIFIED_TEST_EMAIL || "maheshkamalakar1@gmail.com";
  
  console.log("Configuration:");
  console.log("- Base URL:", BASE_URL);
  console.log("- Test Email:", testEmail);
  console.log("- Resend API Key:", process.env.RESEND_API_KEY?.substring(0, 10) + "...");
  console.log("- From Email:", process.env.FROM_EMAIL);
  console.log("");
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === "signup") {
    const email = args[1] || testEmail;
    await testSignupFlow(email);
  } else if (command === "login") {
    const email = args[1] || testEmail;
    await testLoginFlow(email);
  } else if (command === "verify") {
    const email = args[1] || testEmail;
    const otp = args[2];
    
    if (!otp) {
      console.error("❌ Please provide OTP as the third argument");
      console.log("Usage: node test-otp-flow.js verify <email> <otp>");
      process.exit(1);
    }
    
    await testVerifyOTP(email, otp);
  } else {
    console.log("Usage:");
    console.log("  node test-otp-flow.js signup [email]");
    console.log("  node test-otp-flow.js login [email]");
    console.log("  node test-otp-flow.js verify <email> <otp>");
    console.log("\nExample:");
    console.log(`  node test-otp-flow.js signup ${testEmail}`);
    console.log(`  node test-otp-flow.js verify ${testEmail} 123456`);
  }
}

main().catch(console.error);
