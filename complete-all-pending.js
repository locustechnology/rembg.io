// Script to complete all pending purchases and add credits
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function completeAllPendingPurchases() {
  const client = await pool.connect();

  try {
    console.log('Processing all pending purchases...\n');

    // Get all pending purchases
    const { rows: purchases } = await client.query(`
      SELECT
        p.id,
        p."userId",
        p."planId",
        p.amount,
        p."creditsAdded",
        pl.name as "planName",
        u.email
      FROM purchases p
      LEFT JOIN "user" u ON p."userId" = u.id
      LEFT JOIN payment_plans pl ON p."planId" = pl.id
      WHERE p.status = 'pending'
      ORDER BY p."createdAt" ASC
    `);

    if (purchases.length === 0) {
      console.log('✓ No pending purchases to process.\n');
      return;
    }

    console.log(`Found ${purchases.length} pending purchase(s) to process:\n`);

    for (const purchase of purchases) {
      console.log(`\nProcessing purchase ${purchase.id}:`);
      console.log(`  User: ${purchase.email}`);
      console.log(`  Plan: ${purchase.planName}`);
      console.log(`  Credits: ${purchase.creditsAdded}`);

      // Begin transaction
      await client.query('BEGIN');

      try {
        // 1. Get current credit balance
        const { rows: [creditData] } = await client.query(
          'SELECT balance FROM credits WHERE "userId" = $1',
          [purchase.userId]
        );

        if (!creditData) {
          console.log(`  ❌ No credits record found for user`);
          await client.query('ROLLBACK');
          continue;
        }

        const currentBalance = creditData.balance;
        const newBalance = currentBalance + purchase.creditsAdded;

        console.log(`  Current balance: ${currentBalance}`);
        console.log(`  Adding: ${purchase.creditsAdded}`);
        console.log(`  New balance: ${newBalance}`);

        // 2. Update credit balance
        await client.query(
          'UPDATE credits SET balance = $1 WHERE "userId" = $2',
          [newBalance, purchase.userId]
        );

        // 3. Log the transaction
        await client.query(`
          INSERT INTO credit_transactions ("userId", type, amount, "balanceAfter", description, metadata)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          purchase.userId,
          'purchase',
          purchase.creditsAdded,
          newBalance,
          `Purchased ${purchase.planName} plan - ${purchase.creditsAdded} credits`,
          JSON.stringify({
            planId: purchase.planId,
            planName: purchase.planName,
            purchaseId: purchase.id,
            manuallyProcessed: true,
            processedAt: new Date().toISOString()
          })
        ]);

        // 4. Mark purchase as completed
        await client.query(
          'UPDATE purchases SET status = $1, "completedAt" = $2 WHERE id = $3',
          ['completed', new Date().toISOString(), purchase.id]
        );

        // Commit transaction
        await client.query('COMMIT');
        console.log(`  ✅ Successfully processed! Balance: ${currentBalance} → ${newBalance}`);

      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Error processing purchase:`, error.message);
      }
    }

    console.log('\n✅ All pending purchases processed!\n');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

completeAllPendingPurchases()
  .then(() => {
    console.log('✓ Script complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Script failed:', error.message);
    process.exit(1);
  });
