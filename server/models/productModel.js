const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// Build a parameterized WHERE clause from optional filters.
// search: ILIKE on name/description; category; minPrice/maxPrice;
// sort: 'newest' | 'price_asc' | 'price_desc' | 'name' | 'stock'
function buildFilter({ search, category, minPrice, maxPrice, sort }) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (category) {
    conditions.push(`category ILIKE $${idx}`);
    values.push(category);
    idx++;
  }
  if (minPrice !== undefined) {
    conditions.push(`price >= $${idx}`);
    values.push(minPrice);
    idx++;
  }
  if (maxPrice !== undefined) {
    conditions.push(`price <= $${idx}`);
    values.push(maxPrice);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortMap = {
    newest: 'created_at DESC',
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    name: 'name ASC',
    stock: 'stock DESC',
  };
  const orderBy = sortMap[sort] || 'created_at DESC';

  return { where, values, orderBy };
}

// List products with pagination + filtering + sorting
async function findAll({ search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const { where, values, orderBy } = buildFilter({ search, category, minPrice, maxPrice, sort });

  const countRes = await pool.query(`SELECT COUNT(*) FROM products ${where}`, values);
  const total = parseInt(countRes.rows[0].count, 10);

  const res = await pool.query(
    `SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limitNum, offset]
  );

  return {
    products: res.rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

// Distinct categories for the filter UI
async function findCategories() {
  const res = await pool.query(
    'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
  );
  return res.rows.map((r) => r.category);
}

async function findById(id) {
  const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function create(data) {
  const { name, description, price, stock, category, image_url } = data;
  const res = await pool.query(
    `INSERT INTO products (name, description, price, stock, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description || '', price, stock, category || '', image_url || '']
  );
  return res.rows[0];
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const key of ['name', 'description', 'price', 'stock', 'category', 'image_url']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
  }
  if (fields.length === 0) return findById(id);
  fields.push(`updated_at = NOW()`);
  values.push(id);
  const res = await pool.query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] || null;
}

async function remove(id) {
  const res = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return res.rowCount > 0;
}

// Decrement stock inside an order transaction. Throws 400 when insufficient.
async function decrementStock(client, productId, quantity) {
  const res = await client.query(
    'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2 AND stock >= $1 RETURNING *',
    [quantity, productId]
  );
  if (res.rowCount === 0) {
    throw new AppError('Insufficient stock for one or more products.', 400);
  }
  return res.rows[0];
}

module.exports = { findAll, findCategories, findById, create, update, remove, decrementStock };
