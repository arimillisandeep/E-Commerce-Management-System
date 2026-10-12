const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// Get the cart for a user, creating an empty cart row if needed.
async function getOrCreateCart(userId) {
  let res = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (res.rows[0]) return res.rows[0];
  res = await pool.query(
    'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  return res.rows[0];
}

// Full cart: items joined with product name/price/image
async function getCartWithItems(userId) {
  const cart = await getOrCreateCart(userId);
  const res = await pool.query(
    `SELECT ci.id AS cart_item_id, ci.quantity,
            p.id AS product_id, p.name, p.price, p.image_url, p.stock
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id DESC`,
    [cart.id]
  );

  const items = res.rows;
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0
  );

  return { cart_id: cart.id, items, subtotal: Number(subtotal.toFixed(2)) };
}

// Add product to cart, or increment quantity if already present.
async function addItem(userId, productId, quantity) {
  const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
  if (!product.rows[0]) throw new AppError('Product not found.', 404);

  const cart = await getOrCreateCart(userId);

  const res = await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING quantity`,
    [cart.id, productId, quantity]
  );

  const newQty = res.rows[0].quantity;
  if (newQty > product.rows[0].stock) {
    throw new AppError(`Only ${product.rows[0].stock} units available.`, 400);
  }
  return getCartWithItems(userId);
}

// Set an exact quantity (0 or negative removes the item)
async function updateItem(userId, cartItemId, quantity) {
  const cart = await getOrCreateCart(userId);

  const existing = await pool.query(
    'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.id = $1 AND ci.cart_id = $2',
    [cartItemId, cart.id]
  );
  if (!existing.rows[0]) throw new AppError('Cart item not found.', 404);

  if (quantity <= 0) {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
    return getCartWithItems(userId);
  }
  if (quantity > existing.rows[0].stock) {
    throw new AppError(`Only ${existing.rows[0].stock} units available.`, 400);
  }

  await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, cartItemId]);
  return getCartWithItems(userId);
}

async function removeItem(userId, cartItemId) {
  const cart = await getOrCreateCart(userId);
  const res = await pool.query(
    'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2',
    [cartItemId, cart.id]
  );
  if (res.rowCount === 0) throw new AppError('Cart item not found.', 404);
  return getCartWithItems(userId);
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
}

module.exports = { getOrCreateCart, getCartWithItems, addItem, updateItem, removeItem, clearCart };
