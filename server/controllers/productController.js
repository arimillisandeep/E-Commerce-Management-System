const { asyncHandler } = require('../middleware/asyncHandler');
const productModel = require('../models/productModel');

// GET /api/products
const list = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page, limit } = req.query;
  const result = await productModel.findAll({
    search,
    category,
    minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
    sort,
    page,
    limit,
  });
  res.json({ status: 'success', data: result });
});

// GET /api/products/categories
const categories = asyncHandler(async (req, res) => {
  const cats = await productModel.findCategories();
  res.json({ status: 'success', data: { categories: cats } });
});

// GET /api/products/:id
const show = asyncHandler(async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ status: 'error', message: 'Product not found.' });
  }
  res.json({ status: 'success', data: { product } });
});

// POST /api/products  (admin)
const create = asyncHandler(async (req, res) => {
  const product = await productModel.create(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Product created.',
    data: { product },
  });
});

// PUT /api/products/:id  (admin)
const update = asyncHandler(async (req, res) => {
  const product = await productModel.update(req.params.id, req.body);
  if (!product) {
    return res.status(404).json({ status: 'error', message: 'Product not found.' });
  }
  res.json({ status: 'success', message: 'Product updated.', data: { product } });
});

// DELETE /api/products/:id  (admin)
const remove = asyncHandler(async (req, res) => {
  const ok = await productModel.remove(req.params.id);
  if (!ok) {
    return res.status(404).json({ status: 'error', message: 'Product not found.' });
  }
  res.json({ status: 'success', message: 'Product deleted.' });
});

module.exports = { list, categories, show, create, update, remove };
