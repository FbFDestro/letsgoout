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
  name: check('name', 'Name is required').not().isEmpty(),
  username: [
    check('username', 'Username is required').not().isEmpty(),
    check('username', "An username can' be an email").not().isEmail(),
  ],
  password: check('password', 'Password is required').not().isEmpty(),
  email_username: check('email_username', 'Email or username is required')
    .not()
    .isEmpty(),
};

const signUpValidationRules = () => {
  return [...checkers.email, checkers.name, ...checkers.username, checkers.password];
};

const signUpFbValidationRules = () => {
  return [...checkers.email, checkers.name, ...checkers.username];
};

const signInValidationRules = () => {
  return [checkers.email_username, checkers.password];
};

module.exports = {
  validator,
  signUpValidationRules,
  signUpFbValidationRules,
  signInValidationRules,
};
