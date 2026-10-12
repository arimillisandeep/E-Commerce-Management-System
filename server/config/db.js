const { Pool } = require('pg');
require('dotenv').config();

// Connection pool reused across the app (Phase 3).
// Supports either individual DB_* variables or a single DATABASE_URL
// (used by platforms like Render, Heroku, Supabase).
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 20,                // max connections in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

// Verify connection on startup
async function testConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW()');
    console.log('PostgreSQL connected:', res.rows[0].now);
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
