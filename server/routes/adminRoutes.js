const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { validate } = require('../middleware/validate');
const { productRules, statusRules } = require('../utils/validators');
const adminController = require('../controllers/adminController');

// All /api/admin routes require auth + admin role
router.get('/stats', requireAuth, requireAdmin, adminController.stats);
router.get('/users', requireAuth, requireAdmin, adminController.listUsers);
router.get('/orders', requireAuth, requireAdmin, adminController.listOrders);
router.get('/orders/:id', requireAuth, requireAdmin, adminController.showOrder);
router.patch('/orders/:id/status', requireAuth, requireAdmin, statusRules, validate, adminController.updateOrderStatus);

router.post('/products', requireAuth, requireAdmin, productRules, validate, adminController.createProduct);
router.put('/products/:id', requireAuth, requireAdmin, productRules, validate, adminController.updateProduct);
router.delete('/products/:id', requireAuth, requireAdmin, adminController.deleteProduct);

module.exports = router;
