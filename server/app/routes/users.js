const router = require('express-promise-router')();

const passport = require('passport');
const passportConf = require('../middlewares/fb-authentication');
const passportFb = passport.authenticate('facebookToken', { session: false });

const UsersController = require('../controllers/users');
const { signUp, signIn, signInFb, signUpFb, secret } = UsersController;
const { verifyToken } = require('../middlewares/authentication');

const {
  validator,
  signUpValidationRules,
  signInValidationRules,
} = require('../helpers/routerValidator');

router.route('/signup').post(signUpValidationRules(), validator, signUp);
router.route('/signin').post(signInValidationRules(), validator, signIn);
router.route('/oauth/fb/signin').post(passportFb, signInFb);
router.route('/oauth/fb/signup').post(signUpFb); // need validation
router.route('/secret').get(verifyToken, secret);

module.exports = router;
