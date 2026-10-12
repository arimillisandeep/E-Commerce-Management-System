const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { orderRules } = require('../utils/validators');
const orderController = require('../controllers/orderController');

router.get('/', requireAuth, orderController.listMine);
router.get('/:id', requireAuth, orderController.showMine);
router.post('/', requireAuth, orderRules, validate, orderController.create);

module.exports = router;
