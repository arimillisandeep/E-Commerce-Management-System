require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await testConnection();
  } catch (err) {
    console.error('ERROR: Could not connect to PostgreSQL.');
    console.error(err.message);
    console.error('Check server/.env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)');
    process.exit(1); // fail fast: never run without a database
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API base URL: http://localhost:${PORT}/api`);
  });
}

start();
