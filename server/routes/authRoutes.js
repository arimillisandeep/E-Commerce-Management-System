const express = require('express');
const router = express.Router();
const { registerRules, loginRules } = require('../utils/validators');
const { validate } = require('../middleware/validate');
const authController = require('../controllers/authController');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.get('/me', require('../middleware/auth').requireAuth, authController.me);

module.exports = router;
