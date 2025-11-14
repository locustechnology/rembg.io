// Comprehensive test script for credit flow
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testCreditFlow() {
  const client = await pool.connect();

  try {
    console.log('=== COMPREHENSIVE CREDIT FLOW TEST ===\n');

    const testEmail = 'maheshkamalakar1@gmail.com';

    // 1. Get user from database
    console.log('1. Checking user in database...');
    const { rows: [user] } = await client.query(`
      SELECT id, email FROM "user" WHERE email = $1
    `, [testEmail]);

    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    console.log(`✅ User found: ${user.id}\n`);

    // 2. Get credits from database
    console.log('2. Checking credits in database...');
    const { rows: [dbCredits] } = await client.query(`
      SELECT balance, "updatedAt" FROM credits WHERE "userId" = $1
    `, [user.id]);

    console.log(`✅ Database credits: ${dbCredits.balance}`);
    console.log(`   Last updated: ${dbCredits.updatedAt}\n`);

    // 3. Test the API endpoint that frontend uses
    console.log('3. Testing /api/credits/balance endpoint...');
    console.log('   (Simulating what the frontend fetchCredits() does)\n');

    // Simulate the API call
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/credits/balance`;
    console.log(`   API URL: ${apiUrl}`);
    console.log('   Note: This test shows what the database has.');
    console.log('   The actual API requires authentication, so we cannot test it directly from here.\n');

    // 4. Check if there are any pending purchases
    console.log('4. Checking for pending purchases...');
    const { rows: pending } = await client.query(`
      SELECT id, "planId", "dodoPaymentId", amount, "creditsAdded", "createdAt"
      FROM purchases
      WHERE "userId" = $1 AND status = 'pending'
      ORDER BY "createdAt" DESC
    `, [user.id]);

    if (pending.length > 0) {
      console.log(`⚠️  Found ${pending.length} pending purchase(s):`);
      console.table(pending);
      console.log('   These need to be completed to add credits!\n');
    } else {
      console.log('✅ No pending purchases\n');
    }

    // 5. Show latest completed purchases
    console.log('5. Latest 3 completed purchases:');
    const { rows: completed } = await client.query(`
      SELECT id, "planId", amount, "creditsAdded", "completedAt"
      FROM purchases
      WHERE "userId" = $1 AND status = 'completed'
      ORDER BY "completedAt" DESC
      LIMIT 3
    `, [user.id]);

    console.table(completed);

    // 6. Show latest transactions
    console.log('\n6. Latest 3 credit transactions:');
    const { rows: transactions } = await client.query(`
      SELECT type, amount, "balanceAfter", description, "createdAt"
      FROM credit_transactions
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 3
    `, [user.id]);

    console.table(transactions);

    // 7. Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Current Balance in DB: ${dbCredits.balance} credits`);
    console.log(`Pending Purchases: ${pending.length}`);
    console.log(`\nIf the frontend shows different credits:`);
    console.log('1. Check browser console for errors');
    console.log('2. Hard refresh browser (Ctrl+Shift+R)');
    console.log('3. Check if user is logged in with correct account');
    console.log('4. Look at Network tab to see /api/credits/balance response');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

testCreditFlow()
  .then(() => {
    console.log('\n✓ Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  });
