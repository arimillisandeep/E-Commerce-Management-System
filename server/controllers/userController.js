const { asyncHandler } = require('../middleware/asyncHandler');
const userModel = require('../models/userModel');

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  res.json({ status: 'success', data: { user } });
});

// PATCH /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userModel.updateProfile(req.user.id, req.body);
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'User not found.' });
  }
  res.json({
    status: 'success',
    message: 'Profile updated.',
    data: { user },
  });
});

module.exports = { getProfile, updateProfile };
