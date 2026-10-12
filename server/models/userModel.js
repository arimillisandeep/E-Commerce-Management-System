const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/errorHandler');

// Find user by email (used at login to check credentials)
async function findByEmail(email) {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

// Find user by id (used by auth middleware / profile)
async function findById(id) {
  const res = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return res.rows[0] || null;
}

// Create user with hashed password; rejects duplicate emails with 409
async function create({ name, email, password, role = 'customer' }) {
  const password_hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 10));
  try {
    const res = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, password_hash, role]
    );
    return res.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Email already registered. Please log in.', 409);
    }
    throw err;
  }
}

// Verify plaintext password against stored hash
async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

// Update profile fields (name always; password only when provided)
async function updateProfile(id, { name, password }) {
  if (password) {
    const password_hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 10));
    const res = await pool.query(
      'UPDATE users SET name = $1, password_hash = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role, created_at',
      [name, password_hash, id]
    );
    return res.rows[0];
  }
  const res = await pool.query(
    'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role, created_at',
    [name, id]
  );
  return res.rows[0];
}

module.exports = { findByEmail, findById, create, verifyPassword, updateProfile };
