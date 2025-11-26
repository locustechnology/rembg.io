const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.cctmavwcdsqwkaeonqfk:UmxOShaKozFNISgw@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
});

const TEST_EMAIL = 'maheshkamalakar1@gmail.com';
const BASE_URL = 'http://localhost:3000';

async function testCompleteOTPFlow() {
  console.log('\n========== COMPLETE OTP AUTHENTICATION FLOW TEST ==========\n');

  try {
    // Step 1: Send OTP
    console.log('Step 1: Sending OTP to', TEST_EMAIL);
    const sendOtpResponse = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, type: 'login' }),
    });

    if (!sendOtpResponse.ok) {
      const error = await sendOtpResponse.text();
      console.error('❌ Failed to send OTP:', error);
      return;
    }

    const sendResult = await sendOtpResponse.json();
    console.log('✅ OTP sent successfully');

    // Step 2: Get OTP from database
    console.log('\nStep 2: Retrieving OTP from database');
    const otpQuery = await pool.query(
      'SELECT * FROM rembg_verification WHERE identifier = $1 ORDER BY "createdAt" DESC LIMIT 1',
      [TEST_EMAIL]
    );

    if (otpQuery.rows.length === 0) {
      console.error('❌ No OTP found in database');
      return;
    }

    const otpCode = otpQuery.rows[0].value;
    console.log('✅ Retrieved OTP from database:', otpCode);

    // Step 3: Verify OTP
    console.log('\nStep 3: Verifying OTP');
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, otp: otpCode }),
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error('❌ OTP verification failed:', verifyResult);
      return;
    }

    console.log('✅ OTP verified successfully');
    console.log('Response:', JSON.stringify(verifyResult, null, 2));

    // Get the session cookie
    const setCookieHeader = verifyResponse.headers.get('set-cookie');
    console.log('\nSet-Cookie header:', setCookieHeader);

    if (!setCookieHeader) {
      console.error('❌ No cookies were set!');
      return;
    }

    // Parse cookies (set-cookie can contain multiple cookies separated by comma)
    const cookies = setCookieHeader.split(',').map(c => c.trim());
    const sessionCookie = cookies.find(c => c.includes('better-auth.session_token'));

    if (!sessionCookie) {
      console.error('❌ No session cookie was set!');
      console.error('Cookies received:', cookies);
      return;
    }

    const sessionToken = sessionCookie.split(';')[0].split('=')[1];
    console.log('✅ Session token cookie set:', sessionToken);

    // Step 4: Verify session was created in database
    console.log('\nStep 4: Verifying session in database');
    const sessionQuery = await pool.query(
      'SELECT * FROM rembg_session WHERE token = $1',
      [sessionToken]
    );

    if (sessionQuery.rows.length === 0) {
      console.error('❌ Session not found in database!');
      return;
    }

    console.log('✅ Session found in database');
    console.log('Session details:', JSON.stringify(sessionQuery.rows[0], null, 2));

    // Step 5: Test session validation via Better Auth
    console.log('\nStep 5: Testing session validation via Better Auth API');
    const getSessionResponse = await fetch(`${BASE_URL}/api/auth/get-session`, {
      headers: {
        'Cookie': `better-auth.session_token=${sessionToken}`
      }
    });

    const sessionData = await getSessionResponse.json();
    console.log('Get-session response:', JSON.stringify(sessionData, null, 2));

    if (sessionData && sessionData.user) {
      console.log('\n✅✅✅ SUCCESS! OTP authentication is working correctly! ✅✅✅');
      console.log('User session:', sessionData.user.email);
    } else {
      console.log('\n⚠️ Session was created but Better Auth is not validating it');
      console.log('This is the issue we need to fix!');
    }

    // Step 6: Cleanup - delete test session
    console.log('\nCleaning up test session...');
    await pool.query('DELETE FROM rembg_session WHERE token = $1', [sessionToken]);
    console.log('✅ Cleanup complete');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testCompleteOTPFlow();
