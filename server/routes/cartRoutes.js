const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { cartRules } = require('../utils/validators');
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');

router.get('/', requireAuth, cartController.getCart);
router.post('/items', requireAuth, cartRules, validate, cartController.addItem);
router.put(
  '/items/:cartItemId',
  requireAuth,
  [body('quantity').isInt({ min: 0, max: 999 }).withMessage('Quantity must be between 0 and 999.')],
  validate,
  cartController.updateItem
);
router.delete('/items/:cartItemId', requireAuth, cartController.removeItem);

module.exports = router;
