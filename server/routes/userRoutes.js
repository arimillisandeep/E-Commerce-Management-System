const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');
const userController = require('../controllers/userController');

const profileRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

router.get('/profile', requireAuth, userController.getProfile);
router.patch('/profile', requireAuth, profileRules, validate, userController.updateProfile);

module.exports = router;
