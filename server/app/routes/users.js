//const express = require('express');
const router = require('express-promise-router')();

const UsersController = require('../controllers/users');
const { signUp, signIn, secret } = UsersController;

const { validator, authValidationRules } = require('../helpers/routerValidator');

router.route('/signup').post(authValidationRules(), validator, signUp);

router.route('/singin').post(signIn);

router.route('/secret').get(secret);

module.exports = router;
