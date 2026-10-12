const { asyncHandler } = require('../middleware/asyncHandler');
const { generateToken } = require('../utils/jwt');
const userModel = require('../models/userModel');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const user = await userModel.create(req.body);
  const token = generateToken(user);
  res.status(201).json({
    status: 'success',
    message: 'Account created successfully.',
    data: { user, token },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const user = await userModel.findByEmail(req.body.email);
  if (!user || !(await userModel.verifyPassword(user, req.body.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password.',
    });
  }
  const { password_hash, ...safe } = user;
  const token = generateToken(user);
  res.json({
    status: 'success',
    message: 'Logged in successfully.',
    data: { user: safe, token },
  });
});

// GET /api/auth/me  - current user from token
const me = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'User not found.' });
  }
  res.json({ status: 'success', data: { user } });
});

module.exports = { register, login, me };
