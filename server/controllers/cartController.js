const { asyncHandler } = require('../middleware/asyncHandler');
const cartModel = require('../models/cartModel');

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await cartModel.getCartWithItems(req.user.id);
  res.json({ status: 'success', data: { cart } });
});

// POST /api/cart/items
const addItem = asyncHandler(async (req, res) => {
  const cart = await cartModel.addItem(req.user.id, req.body.product_id, req.body.quantity);
  res.status(201).json({
    status: 'success',
    message: 'Product added to cart.',
    data: { cart },
  });
});

// PUT /api/cart/items/:cartItemId
const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartModel.updateItem(req.user.id, req.params.cartItemId, req.body.quantity);
  res.json({ status: 'success', data: { cart } });
});

// DELETE /api/cart/items/:cartItemId
const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartModel.removeItem(req.user.id, req.params.cartItemId);
  res.json({ status: 'success', message: 'Item removed from cart.', data: { cart } });
});

module.exports = { getCart, addItem, updateItem, removeItem };
