const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const productModel = require('./productModel');
const cartModel = require('./cartModel');

// List orders for a user (newest first), with item counts
async function findByUser(userId, { page = 1, limit = 10 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const countRes = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [userId]);
  const total = parseInt(countRes.rows[0].count, 10);

  const res = await pool.query(
    `SELECT id, status, total_amount, shipping_address, created_at, updated_at
     FROM orders WHERE user_id = $1
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limitNum, offset]
  );

  return {
    orders: res.rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

// Single order (scoped to a user) including its items
async function findByIdForUser(orderId, userId) {
  const orderRes = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
    [orderId, userId]
  );
  if (!orderRes.rows[0]) return null;

  const itemsRes = await pool.query(
    `SELECT oi.product_id, oi.product_name, oi.unit_price, oi.quantity
     FROM order_items oi WHERE oi.order_id = $1 ORDER BY oi.id`,
    [orderId]
  );

  return { ...orderRes.rows[0], items: itemsRes.rows };
}

// Place an order: transactionally move cart -> order, decrement stock, clear cart.
async function createFromCart(userId, { shipping_address } = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cart = await cartModel.getCartWithItems(userId);
    if (cart.items.length === 0) {
      throw new AppError('Your cart is empty.', 400);
    }

    const totalAmount = cart.subtotal;
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, totalAmount, shipping_address || '']
    );
    const order = orderRes.rows[0];

    for (const item of cart.items) {
      const product = await productModel.decrementStock(client, item.product_id, item.quantity);
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (order_id, product_id) DO UPDATE
           SET quantity = EXCLUDED.quantity, unit_price = EXCLUDED.unit_price`,
        [order.id, item.product_id, product.name, item.price, item.quantity]
      );
    }

    await cartModel.clearCart(userId);
    await client.query('COMMIT');

    return findByIdForUser(order.id, userId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ---- Admin-side queries ----

async function findAll({ status, page = 1, limit = 20 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const values = [];
  if (status) {
    conditions.push('status = $1');
    values.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(`SELECT COUNT(*) FROM orders ${where}`, values);
  const total = parseInt(countRes.rows[0].count, 10);

  const res = await pool.query(
    `SELECT o.id, o.status, o.total_amount, o.shipping_address, o.created_at,
            u.name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limitNum, offset]
  );

  return {
    orders: res.rows,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
}

async function findByIdWithUser(orderId) {
  const res = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = $1`,
    [orderId]
  );
  if (!res.rows[0]) return null;
  const items = await pool.query(
    `SELECT product_id, product_name, unit_price, quantity FROM order_items WHERE order_id = $1`,
    [orderId]
  );
  return { ...res.rows[0], items: items.rows };
}

async function updateStatus(orderId, status) {
  const res = await pool.query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return res.rows[0] || null;
}

// Basic sales statistics for the admin dashboard
async function getStats() {
  const res = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM orders) AS total_orders,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') AS total_revenue,
      (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
      (SELECT COUNT(*) FROM products) AS total_products,
      (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders
  `);
  const row = res.rows[0];
  return {
    total_orders: Number(row.total_orders),
    total_revenue: Number(row.total_revenue),
    total_customers: Number(row.total_customers),
    total_products: Number(row.total_products),
    pending_orders: Number(row.pending_orders),
  };
}

module.exports = {
  findByUser,
  findByIdForUser,
  createFromCart,
  findAll,
  findByIdWithUser,
  updateStatus,
  getStats,
};
