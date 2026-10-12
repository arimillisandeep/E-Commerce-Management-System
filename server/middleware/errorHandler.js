// Custom application error with a safe HTTP status code.
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Central error-handling middleware (must have 4 args).
// Never leaks stack traces or internal details to the client.
function errorHandler(err, req, res, next) {
  // Duplicate email / unique-constraint violations from PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({
      status: 'error',
      message: 'A record with this email already exists.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    console.error('Server error:', err);
  }

  res.status(statusCode).json({ status: 'error', message });
}

module.exports = { AppError, errorHandler };
