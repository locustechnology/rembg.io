const { Resend } = require('resend');

const resend = new Resend('re_NSmKvnyj_JAoS7nJ3duDgycLVqh1A1doW');

async function testResend() {
  console.log('Testing Resend API key...\n');

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'neeraj.gmf@gmail.com',
      subject: 'RemBG Test Email',
      html: '<p>This is a test email from RemBG. Your API key is working! ✅</p>',
    });

    if (error) {
      console.error('❌ Error sending email:');
      console.error(error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', data.id);
    console.log('\nCheck your inbox at: maheshkumarkamalakar@gmail.com');
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error.message);
  }
}

testResend();
