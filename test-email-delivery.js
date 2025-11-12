const { Resend } = require('resend');

const resend = new Resend('re_NSmKvnyj_JAoS7nJ3duDgycLVqh1A1doW');

async function testEmailDelivery() {
  console.log('==========================================');
  console.log('🧪 TESTING EMAIL DELIVERY');
  console.log('==========================================\n');

  const testEmail = 'mahesh@simsinfotech.com'; // Change this to your email
  const testOTP = '123456';

  console.log('📧 Test Configuration:');
  console.log('   From: onboarding@resend.dev');
  console.log('   To:', testEmail);
  console.log('   OTP Code:', testOTP);
  console.log('\n==========================================\n');

  try {
    console.log('📤 Sending email via Resend API...\n');

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: testEmail,
      subject: 'TEST - Your RemBG Verification Code',
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
                <h1>RemBG TEST</h1>
              </div>
              <div class="content">
                <h2 style="color: #111827; margin-top: 0;">🧪 Email Delivery Test</h2>
                <p>This is a test email to verify email delivery is working.</p>

                <div class="otp-code">${testOTP}</div>

                <div class="warning">
                  ⏱️ This is a TEST code
                </div>

                <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                  If you received this email, delivery is working correctly!
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

    console.log('==========================================');
    console.log('📨 RESEND API RESPONSE:');
    console.log('==========================================');
    console.log('Full Response:', JSON.stringify(result, null, 2));
    console.log('==========================================\n');

    if (result.data && result.data.id) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Email ID:', result.data.id);
      console.log('\n🔍 Checking delivery status...\n');

      // Wait 2 seconds then check status
      await new Promise(resolve => setTimeout(resolve, 2000));

      const emailInfo = await resend.emails.get(result.data.id);

      console.log('==========================================');
      console.log('📊 EMAIL DELIVERY STATUS:');
      console.log('==========================================');
      console.log('Email ID:', emailInfo.data.id);
      console.log('To:', emailInfo.data.to);
      console.log('From:', emailInfo.data.from);
      console.log('Subject:', emailInfo.data.subject);
      console.log('Status:', emailInfo.data.last_event);
      console.log('Created:', emailInfo.data.created_at);
      console.log('==========================================\n');

      if (emailInfo.data.last_event === 'delivered') {
        console.log('✅ EMAIL DELIVERED SUCCESSFULLY!');
        console.log('📬 Check your inbox at:', testEmail);
      } else {
        console.log('⚠️ Email Status:', emailInfo.data.last_event);
        console.log('📝 Note: It may take a few seconds to deliver. Check again in a moment.');
      }

    } else if (result.error) {
      console.log('❌ RESEND API ERROR:');
      console.log('Error:', result.error);
    } else {
      console.log('⚠️ UNEXPECTED RESPONSE FORMAT:');
      console.log('Result:', result);
    }

  } catch (error) {
    console.log('==========================================');
    console.error('❌ ERROR OCCURRED:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.log('==========================================');
  }

  console.log('\n==========================================');
  console.log('🧪 TEST COMPLETE');
  console.log('==========================================\n');
}

testEmailDelivery();
