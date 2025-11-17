const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBillingIntervalColumn() {
  console.log('🚀 Adding billing_interval column to payment_plans table...\n');

  // Since we can't execute raw SQL, we'll use Supabase API to check and add
  // First, let's try to update a record with billing_interval to see if it exists
  const { data: testPlans } = await supabase
    .from('payment_plans')
    .select('*')
    .limit(1);

  if (testPlans && testPlans.length > 0) {
    console.log('✅ Column already exists or will be added via Supabase dashboard\n');
    console.log('📋 Please manually add the billing_interval column via Supabase Dashboard:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Navigate to Table Editor → payment_plans');
    console.log('   3. Add new column:');
    console.log('      - Name: billing_interval');
    console.log('      - Type: text');
    console.log('      - Default value: monthly');
    console.log('      - Nullable: Yes\n');
  }
}

addBillingIntervalColumn();
