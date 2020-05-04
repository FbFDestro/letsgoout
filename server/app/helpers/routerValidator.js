const { body, check, validationResult } = require('express-validator');

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  return next();
};

const checkers = {
  email: [
    check('email', 'Email is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    body('email').normalizeEmail(),
  ],
  password: check('password', 'Password is required').not().isEmpty(),
};

const signUpValidationRules = () => {
  return [
    ...checkers.email,
    check('name', 'Name is required').not().isEmpty(),
    check('username', 'Username is required').not().isEmpty(),
    checkers.password,
  ];
};

const signInValidationRules = () => {
  return [...checkers.email, checkers.password];
};

module.exports = {
  validator,
  signUpValidationRules,
  signInValidationRules,
};
