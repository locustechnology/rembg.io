// Script to check and manually process pending purchases
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPendingPurchases() {
  const client = await pool.connect();

  try {
    console.log('Checking for pending purchases...\n');

    // Get all pending purchases
    const result = await client.query(`
      SELECT
        p.id,
        p."userId",
        p."planId",
        p."dodoPaymentId",
        p.status,
        p.amount,
        p."creditsAdded",
        p."createdAt",
        u.email,
        pl.name as "planName",
        pl.credits as "planCredits"
      FROM purchases p
      LEFT JOIN "user" u ON p."userId" = u.id
      LEFT JOIN payment_plans pl ON p."planId" = pl.id
      WHERE p.status = 'pending'
      ORDER BY p."createdAt" DESC
    `);

    if (result.rows.length === 0) {
      console.log('✓ No pending purchases found.\n');
    } else {
      console.log(`Found ${result.rows.length} pending purchase(s):\n`);
      console.table(result.rows);

      // Ask if user wants to manually complete them
      console.log('\nTo manually complete a purchase and add credits:');
      console.log('1. Note the purchase ID from the table above');
      console.log('2. Run: node complete-purchase.js <purchase-id>');
    }

  } catch (error) {
    console.error('Error checking purchases:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkPendingPurchases()
  .then(() => {
    console.log('\n✓ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Check failed:', error.message);
    process.exit(1);
  });
