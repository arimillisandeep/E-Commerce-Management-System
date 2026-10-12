// Wrapper that converts async route-handler rejections into Express errors,
// so the central error handler catches them (avoids unhandled rejections).
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { asyncHandler };
