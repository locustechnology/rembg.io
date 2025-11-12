const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cctmavwcdsqwkaeonqfk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdG1hdndjZHNxd2thZW9ucWZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI3OTczNCwiZXhwIjoyMDc3ODU1NzM0fQ.cBHLITkbWv1FAJORSm-Q6pqn0QDV1GMhYekjWH_0GPw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testDatabase() {
  console.log('Testing database connection...\n');

  // Test 1: Check if user table exists
  console.log('1. Checking if "user" table exists...');
  const { data: userData, error: userError } = await supabase
    .from('user')
    .select('*')
    .limit(1);

  if (userError) {
    console.error('❌ Error with user table:', userError.message);
  } else {
    console.log('✅ User table exists');
  }

  // Test 2: Check if session table exists
  console.log('\n2. Checking if "session" table exists...');
  const { data: sessionData, error: sessionError } = await supabase
    .from('session')
    .select('*')
    .limit(1);

  if (sessionError) {
    console.error('❌ Error with session table:', sessionError.message);
  } else {
    console.log('✅ Session table exists');
  }

  // Test 3: Check if account table exists
  console.log('\n3. Checking if "account" table exists...');
  const { data: accountData, error: accountError } = await supabase
    .from('account')
    .select('*')
    .limit(1);

  if (accountError) {
    console.error('❌ Error with account table:', accountError.message);
  } else {
    console.log('✅ Account table exists');
  }

  // Test 4: Check if credits table exists
  console.log('\n4. Checking if "credits" table exists...');
  const { data: creditsData, error: creditsError } = await supabase
    .from('credits')
    .select('*')
    .limit(1);

  if (creditsError) {
    console.error('❌ Error with credits table:', creditsError.message);
  } else {
    console.log('✅ Credits table exists');
  }

  // Test 5: Check payment_plans
  console.log('\n5. Checking if "payment_plans" table exists...');
  const { data: plansData, error: plansError } = await supabase
    .from('payment_plans')
    .select('*');

  if (plansError) {
    console.error('❌ Error with payment_plans table:', plansError.message);
  } else {
    console.log('✅ Payment plans table exists');
    console.log(`   Found ${plansData.length} plans:`, plansData.map(p => `${p.name} ($${p.price})`).join(', '));
  }

  // Test 6: Check verification table
  console.log('\n6. Checking if "verification" table exists...');
  const { data: verificationData, error: verificationError } = await supabase
    .from('verification')
    .select('*')
    .limit(5);

  if (verificationError) {
    console.error('❌ Error with verification table:', verificationError.message);
  } else {
    console.log('✅ Verification table exists');
    console.log(`   Found ${verificationData.length} verification records`);
    if (verificationData.length > 0) {
      const latestRecord = verificationData[0];
      console.log('   Latest record:');
      console.log('     - Email:', latestRecord.identifier);
      console.log('     - OTP:', latestRecord.value);
      console.log('     - Expires At:', latestRecord.expiresAt);
      console.log('     - Created At:', latestRecord.createdAt);

      // Test timestamp comparison
      const expiresAt = new Date(latestRecord.expiresAt);
      const now = new Date();
      console.log('     - Current Time:', now.toISOString());
      console.log('     - Is Expired?:', expiresAt < now);
      console.log('     - Time Until Expiry:', Math.round((expiresAt - now) / 1000 / 60), 'minutes');
    }
  }

  console.log('\n=================================');
  console.log('Database test complete!');
  console.log('=================================\n');
}

testDatabase().catch(console.error);
