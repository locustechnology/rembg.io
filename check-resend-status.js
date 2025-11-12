const { Resend } = require('resend');

const resend = new Resend('re_NSmKvnyj_JAoS7nJ3duDgycLVqh1A1doW');

async function checkEmailStatus() {
  console.log('Checking recent email delivery status...\n');

  try {
    const { data } = await resend.emails.list({ limit: 5 });

    console.log('Recent emails:');
    console.log('='.repeat(60));

    data.data.forEach((email, index) => {
      console.log(`\n${index + 1}. Email ID: ${email.id}`);
      console.log(`   To: ${email.to[0]}`);
      console.log(`   From: ${email.from}`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Status: ${email.last_event}`);
      console.log(`   Created: ${email.created_at}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\nKey Status Values:');
    console.log('- delivered: Email was successfully delivered');
    console.log('- bounced: Email bounced (invalid address or rejected)');
    console.log('- complained: Marked as spam');
    console.log('- opened/clicked: Email was opened/clicked\n');

  } catch (error) {
    console.error('Error checking email status:', error);
  }
}

checkEmailStatus();
