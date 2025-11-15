const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 Starting pricing plans migration...\n');

    // Step 1: Deactivate all existing payment plans (keep for historical data)
    console.log('🔒 Deactivating old payment plans...');
    const { error: deactivateError } = await supabase
      .from('payment_plans')
      .update({ active: false })
      .eq('active', true);

    if (deactivateError) {
      console.error('❌ Error deactivating old plans:', deactivateError);
      throw deactivateError;
    }
    console.log('✅ Old plans deactivated (preserved for historical data)\n');

    // Step 2: Insert new payment plans
    console.log('📝 Inserting new payment plans...\n');

    const newPlans = [
      {
        name: 'Starter',
        price: 5.00,
        credits: 100,
        description: 'Perfect for casual users - 100 credits (billed monthly)',
        dodoProductId: 'pdt_CC0BK8AcBiY1y7ZaDU7aL',
        active: true
      },
      {
        name: 'Starter Yearly',
        price: 48.00,
        credits: 1200,
        description: 'Best value - 1,200 credits (billed yearly, save 20%)',
        dodoProductId: 'pdt_tbQAdChZMcZlYCoB57kbn',
        active: true
      },
      {
        name: 'Premium',
        price: 10.00,
        credits: 250,
        description: 'For power users - 250 credits (billed monthly)',
        dodoProductId: 'pdt_61yyMlLFg6e3kiflzoylL',
        active: true
      },
      {
        name: 'Premium Yearly',
        price: 96.00,
        credits: 3000,
        description: 'Ultimate value - 3,000 credits (billed yearly, save 20%)',
        dodoProductId: 'pdt_7yagVrNjNowMgElsXCjlM',
        active: true
      }
    ];

    const { data: insertedPlans, error: insertError } = await supabase
      .from('payment_plans')
      .insert(newPlans)
      .select();

    if (insertError) {
      console.error('❌ Error inserting new plans:', insertError);
      throw insertError;
    }

    console.log('✅ New plans inserted successfully!\n');

    // Verify the new plans
    console.log('🔍 Verifying new payment plans...\n');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .order('name', { ascending: true })
      .order('price', { ascending: true });

    if (plansError) {
      console.error('❌ Error fetching plans:', plansError);
    } else {
      console.log('📊 Current payment plans in database:\n');
      plans.forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.name}`);
        console.log(`   💰 Price: $${plan.price}`);
        console.log(`   🪙  Credits: ${plan.credits}`);
        console.log(`   📝 Description: ${plan.description}`);
        console.log(`   🆔 Product ID: ${plan.dodoProductId}`);
        console.log(`   ${plan.active ? '✅' : '❌'} Active: ${plan.active}`);
        console.log('');
      });
    }

    console.log('✨ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
