// Script to check latest purchase and credit activity
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkLatestActivity() {
  const client = await pool.connect();

  try {
    console.log('Checking latest activity for maheshkamalakar1@gmail.com...\n');

    // Get user ID
    const { rows: [user] } = await client.query(`
      SELECT id, email FROM "user" WHERE email = 'maheshkamalakar1@gmail.com'
    `);

    if (!user) {
      console.log('User not found!');
      return;
    }

    console.log(`User ID: ${user.id}\n`);

    // Get current credit balance
    const { rows: [credits] } = await client.query(`
      SELECT balance, "updatedAt" FROM credits WHERE "userId" = $1
    `, [user.id]);

    console.log('Current Credit Balance:');
    console.log(`  Balance: ${credits.balance}`);
    console.log(`  Last Updated: ${credits.updatedAt}\n`);

    // Get latest purchases (all statuses)
    const { rows: purchases } = await client.query(`
      SELECT
        id,
        "planId",
        "dodoPaymentId",
        status,
        amount,
        "creditsAdded",
        "createdAt",
        "completedAt"
      FROM purchases
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 5
    `, [user.id]);

    console.log('Latest 5 Purchases:');
    console.table(purchases);

    // Get latest credit transactions
    const { rows: transactions } = await client.query(`
      SELECT
        type,
        amount,
        "balanceAfter",
        description,
        "createdAt"
      FROM credit_transactions
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 5
    `, [user.id]);

    console.log('\nLatest 5 Transactions:');
    console.table(transactions);

    // Check for pending purchases
    const { rows: pending } = await client.query(`
      SELECT count(*) as count FROM purchases
      WHERE "userId" = $1 AND status = 'pending'
    `, [user.id]);

    console.log(`\nPending purchases: ${pending[0].count}`);

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkLatestActivity()
  .then(() => {
    console.log('\n✓ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Check failed:', error.message);
    process.exit(1);
  });
