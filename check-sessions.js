const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.cctmavwcdsqwkaeonqfk:UmxOShaKozFNISgw@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
});

async function checkSessions() {
  console.log('\n===== CHECKING ALL SESSIONS FOR USER =====\n');

  const userId = '22c605ef-c066-4edb-8aa1-333b3f7495a6';

  const result = await pool.query(
    'SELECT * FROM session WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
    [userId]
  );

  console.log(`Found ${result.rows.length} sessions:\n`);

  result.rows.forEach((session, index) => {
    console.log(`Session ${index + 1}:`);
    console.log(JSON.stringify(session, null, 2));
    console.log('---');
  });

  await pool.end();
}

checkSessions().catch(err => {
  console.error('Error:', err);
  pool.end();
});
