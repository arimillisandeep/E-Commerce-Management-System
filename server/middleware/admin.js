// Admin-only middleware. Must be used AFTER requireAuth.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: admin access required.',
    });
  }
  next();
}

module.exports = { requireAdmin };
