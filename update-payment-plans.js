// Script to update payment plans with Dodo Product IDs
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updatePaymentPlans() {
  const client = await pool.connect();

  try {
    console.log('Updating payment plans with Dodo Product IDs...\n');

    // Update Starter plan
    await client.query(`
      UPDATE payment_plans
      SET "dodoProductId" = $1
      WHERE name = 'Starter' AND price = 5.00
    `, ['pdt_CC0BK8AcBiY1y7ZaDU7aL']);
    console.log('✓ Updated Starter plan');

    // Update Pro plan
    await client.query(`
      UPDATE payment_plans
      SET "dodoProductId" = $1
      WHERE name = 'Pro' AND price = 9.00
    `, ['pdt_CWlfT9vuJpdXo2vAmxNpR']);
    console.log('✓ Updated Pro plan');

    // Update Premium plan
    await client.query(`
      UPDATE payment_plans
      SET "dodoProductId" = $1
      WHERE name = 'Premium' AND price = 19.00
    `, ['pdt_61yyMlLFg6e3kiflzoylL']);
    console.log('✓ Updated Premium plan');

    // Verify updates
    const result = await client.query(`
      SELECT id, name, price, credits, "dodoProductId"
      FROM payment_plans
      ORDER BY price
    `);

    console.log('\n✓ All payment plans updated successfully!\n');
    console.log('Current payment plans:');
    console.table(result.rows);

  } catch (error) {
    console.error('Error updating payment plans:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updatePaymentPlans()
  .then(() => {
    console.log('\n✓ Database update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Database update failed:', error.message);
    process.exit(1);
  });
