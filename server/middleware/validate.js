const { validationResult } = require('express-validator');

// Central request-validation middleware used with express-validator rules.
// Returns 400 with { errors: [{ msg, param, location }] } on failure.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map((e) => ({ msg: e.msg, param: e.param })),
    });
  }
  next();
}

module.exports = { validate };
