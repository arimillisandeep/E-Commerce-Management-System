const { verifyToken } = require('../utils/jwt');

// Authentication middleware:
// expects "Authorization: Bearer <token>" header.
// Attaches decoded payload to req.user on success.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No token provided.',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }

  req.user = decoded; // { id, role, email }
  next();
}

module.exports = { requireAuth };
