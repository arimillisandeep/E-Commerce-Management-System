const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { validate } = require('../middleware/validate');
const { productRules } = require('../utils/validators');
const productController = require('../controllers/productController');

// Public
router.get('/', productController.list);
router.get('/categories', productController.categories);
router.get('/:id', productController.show);

// Admin only
router.post('/', requireAuth, requireAdmin, productRules, validate, productController.create);
router.put('/:id', requireAuth, requireAdmin, productRules, validate, productController.update);
router.delete('/:id', requireAuth, requireAdmin, productController.remove);

module.exports = router;
