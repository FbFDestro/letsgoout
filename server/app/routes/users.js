const router = require('express-promise-router')();

const passport = require('passport');
const passportConf = require('../middlewares/fb-authentication');
const passportFB = passport.authenticate('facebookToken', { session: false });

const UsersController = require('../controllers/users');
const { signUp, signIn, signInFB, secret } = UsersController;
const { verifyToken } = require('../middlewares/authentication');

const {
  validator,
  signUpValidationRules,
  signInValidationRules,
} = require('../helpers/routerValidator');

router.route('/signup').post(signUpValidationRules(), validator, signUp);
router.route('/signin').post(signInValidationRules(), validator, signIn);
router.route('/oauth/fb').post(passportFB, signInFB);
router.route('/secret').get(verifyToken, secret);

module.exports = router;
