require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');
const { initDb } = require('./config/initDb');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await testConnection();
    // Idempotent: creates missing tables and seeds an empty database.
    // Safe to run on every deploy (never deletes existing data).
    const seeded = await initDb();
    console.log('Database schema ready.' + (seeded ? ' Sample data seeded.' : ''));
  } catch (err) {
    console.error('ERROR: Could not connect to PostgreSQL.');
    console.error(err.message);
    console.error('Local:  check server/.env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)');
    console.error('Render: link a PostgreSQL database to this service (it provides DATABASE_URL)');
    process.exit(1); // fail fast: never run without a database
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API base URL: http://localhost:${PORT}/api`);
  });
}

start();
