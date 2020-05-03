//const express = require('express');
const router = require('express-promise-router')();

const UsersController = require('../controllers/users');
const { signUp, signIn, secret } = UsersController;
const { verifyToken } = require('../middlewares/authentication');

const {
  validator,
  signUpValidationRules,
  signInValidationRules,
} = require('../helpers/routerValidator');

router.route('/signup').post(signUpValidationRules(), validator, signUp);
router.route('/signin').post(signInValidationRules(), validator, signIn);
router.route('/secret').get(verifyToken, secret);

module.exports = router;
