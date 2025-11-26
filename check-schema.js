const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.cctmavwcdsqwkaeonqfk:UmxOShaKozFNISgw@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
});

async function checkSchema() {
  console.log('\n===== SESSION TABLE SCHEMA =====\n');

  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'rembg_session'
    ORDER BY ordinal_position
  `);

  console.log('Columns:');
  result.rows.forEach(row => {
    console.log(`  ${row.column_name}:`);
    console.log(`    Type: ${row.data_type}`);
    console.log(`    Nullable: ${row.is_nullable}`);
    console.log(`    Default: ${row.column_default || 'none'}`);
    console.log();
  });

  console.log('\n===== USER TABLE SCHEMA =====\n');

  const userResult = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'rembg_user'
    ORDER BY ordinal_position
  `);

  console.log('Columns:');
  userResult.rows.forEach(row => {
    console.log(`  ${row.column_name}:`);
    console.log(`    Type: ${row.data_type}`);
    console.log(`    Nullable: ${row.is_nullable}`);
    console.log(`    Default: ${row.column_default || 'none'}`);
    console.log();
  });

  await pool.end();
}

checkSchema().catch(err => {
  console.error('Error:', err);
  pool.end();
});
