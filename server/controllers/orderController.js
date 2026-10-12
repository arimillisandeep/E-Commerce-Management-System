const { asyncHandler } = require('../middleware/asyncHandler');
const orderModel = require('../models/orderModel');

// GET /api/orders
const listMine = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await orderModel.findByUser(req.user.id, { page, limit });
  res.json({ status: 'success', data: result });
});

// GET /api/orders/:id
const showMine = asyncHandler(async (req, res) => {
  const order = await orderModel.findByIdForUser(req.params.id, req.user.id);
  if (!order) {
    return res.status(404).json({ status: 'error', message: 'Order not found.' });
  }
  res.json({ status: 'success', data: { order } });
});

// POST /api/orders
const create = asyncHandler(async (req, res) => {
  const order = await orderModel.createFromCart(req.user.id, req.body);
  res.status(201).json({
    status: 'success',
    message: 'Order placed successfully.',
    data: { order },
  });
});

module.exports = { listMine, showMine, create };
