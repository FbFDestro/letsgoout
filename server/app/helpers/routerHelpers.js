const { check, validationResult } = require('express-validator');

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  return next();
};

const authValidationRules = () => {
  return [
    check('email', 'Email is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
  ];
};

module.exports = {
  validator,
  authValidationRules,
};
