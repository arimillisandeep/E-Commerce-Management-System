const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.'),
  body('email').isEmail().withMessage('Provide a valid email.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

const loginRules = [
  body('email').isEmail().withMessage('Provide a valid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('category').optional().trim(),
  body('image_url').optional().isURL().withMessage('Image URL must be a valid URL.'),
];

const cartRules = [
  body('product_id').isInt({ min: 1 }).withMessage('Product ID must be a positive integer.'),
  body('quantity').isInt({ min: 1, max: 999 }).withMessage('Quantity must be between 1 and 999.'),
];

const orderRules = [
  body('shipping_address').optional().trim().isLength({ max: 1000 }),
];

const statusRules = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, processing, shipped, delivered, cancelled.'),
];

module.exports = { registerRules, loginRules, productRules, cartRules, orderRules, statusRules };
