require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const result = await sql`SELECT NOW() AS current_time`;
    console.log('Success! Neon time:', result[0].current_time);
    
    // Test insert
    await sql`INSERT INTO test_auth (message) VALUES ('Test from Node') ON CONFLICT DO NOTHING`;
    console.log('Test insert OK');
  } catch (err) {
    console.error('DB test failed:', err.message);
  }
})();