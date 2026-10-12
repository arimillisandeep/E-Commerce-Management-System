const { asyncHandler } = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { pool } = require('../config/db');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');

// GET /api/admin/stats
const stats = asyncHandler(async (req, res) => {
  const data = await orderModel.getStats();
  res.json({ status: 'success', data: { stats: data } });
});

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json({ status: 'success', data: { users: result.rows } });
});

// GET /api/admin/orders
const listOrders = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await orderModel.findAll({ status, page, limit });
  res.json({ status: 'success', data: result });
});

// GET /api/admin/orders/:id
const showOrder = asyncHandler(async (req, res) => {
  const order = await orderModel.findByIdWithUser(req.params.id);
  if (!order) {
    throw new AppError('Order not found.', 404);
  }
  res.json({ status: 'success', data: { order } });
});

// PATCH /api/admin/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderModel.updateStatus(req.params.id, req.body.status);
  if (!order) {
    throw new AppError('Order not found.', 404);
  }
  res.json({ status: 'success', message: 'Order status updated.', data: { order } });
});

// Admin product management re-uses product controllers
const createProduct = asyncHandler(async (req, res) => {
  const product = await productModel.create(req.body);
  res.status(201).json({ status: 'success', message: 'Product created.', data: { product } });
});
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productModel.update(req.params.id, req.body);
  if (!product) throw new AppError('Product not found.', 404);
  res.json({ status: 'success', message: 'Product updated.', data: { product } });
});
const deleteProduct = asyncHandler(async (req, res) => {
  const ok = await productModel.remove(req.params.id);
  if (!ok) throw new AppError('Product not found.', 404);
  res.json({ status: 'success', message: 'Product deleted.' });
});

module.exports = {
  stats,
  listUsers,
  listOrders,
  showOrder,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
};
