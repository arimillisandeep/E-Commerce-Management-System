const { pool } = require('./db');

// Idempotent schema (CREATE ... IF NOT EXISTS) — safe to run on every
// startup. Used for automatic database initialization on platforms
// like Render. For a clean local reset, use database/schema.sql instead
// (which drops and recreates the tables).
const ID_EMPOTENT_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE (order_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
`;

// Same bcrypt hashes as database/seed.sql
// admin@example.com / admin123
// customer@example.com / customer123
const SEED_USERS = [
  ['Admin User', 'admin@example.com',
    '$2a$10$jhB5h7/cfoSsp0fZqvbrnuouom4Hp0XoVsmg1LikXEV0bZXZz5pBO', 'admin'],
  ['John Customer', 'customer@example.com',
    '$2a$10$.46JA9sh6ak0Y6UEMw29w.70V3Vh7wfXGbYwE1xDz5Cqar8Ex7om2', 'customer'],
];

const SEED_PRODUCTS = [
  ['Wireless Headphones', 'Noise-cancelling over-ear Bluetooth headphones', 199.99, 50, 'Electronics', 'https://picsum.photos/seed/headphones/400/300'],
  ['Smart Watch', 'Fitness tracker with heart-rate monitor', 149.50, 30, 'Electronics', 'https://picsum.photos/seed/watch/400/300'],
  ['Running Shoes', 'Lightweight breathable running shoes', 89.99, 100, 'Sports', 'https://picsum.photos/seed/shoes/400/300'],
  ['Backpack', 'Water-resistant 30L travel backpack', 59.99, 75, 'Accessories', 'https://picsum.photos/seed/backpack/400/300'],
  ['Coffee Maker', 'Programmable 12-cup coffee maker', 74.00, 20, 'Home', 'https://picsum.photos/seed/coffee/400/300'],
  ['Desk Lamp', 'LED adjustable desk lamp', 34.99, 60, 'Home', 'https://picsum.photos/seed/lamp/400/300'],
  ['Yoga Mat', 'Non-slip 6mm yoga mat', 24.99, 120, 'Sports', 'https://picsum.photos/seed/yoga/400/300'],
  ['Sunglasses', 'UV400 polarized sunglasses', 45.00, 80, 'Accessories', 'https://picsum.photos/seed/sunglasses/400/300'],
  ['Laptop Stand', 'Aluminum ergonomic laptop stand', 42.50, 40, 'Electronics', 'https://picsum.photos/seed/stand/400/300'],
  ['Water Bottle', 'Insulated stainless steel 750ml bottle', 19.99, 150, 'Sports', 'https://picsum.photos/seed/bottle/400/300'],
];

// Creates tables if missing and seeds sample data only when the
// database is empty. Never deletes or modifies existing data.
async function initDb() {
  await pool.query(ID_EMPOTENT_SCHEMA);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM users');
  if (rows[0].c > 0) return false; // already initialized

  for (const [name, email, password_hash, role] of SEED_USERS) {
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      [name, email, password_hash, role]
    );
  }

  for (const [name, description, price, stock, category, image_url] of SEED_PRODUCTS) {
    await pool.query(
      `INSERT INTO products (name, description, price, stock, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [name, description, price, stock, category, image_url]
    );
  }

  return true;
}

module.exports = { initDb };
