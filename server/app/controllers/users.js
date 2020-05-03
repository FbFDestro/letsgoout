const signUp = async (req, res, next) => {
  const { email, name, password } = req.body;
  const { registerNewUser } = require('../services/users');
  try {
    var newUserJWT = await registerNewUser({ email, name, password });
  } catch (error) {
    console.error(error);
    return res.status(error.code || 500).json({ errors: [{ msg: error.message }] });
  }

  res.status(200).json({ token: newUserJWT });
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const { signInUser } = require('../services/users');
  try {
    var loggedUserJWT = await signInUser(email, password);
  } catch (error) {
    if (error.code === 401) {
      return res.status(401).json({ errors: [{ msg: 'Invalid email or password' }] });
    }
    return res.status(error.code || 500).json({ errors: [{ msg: error.message }] });
  }

  res.status(200).json({ token: loggedUserJWT });

  console.log('UserController.signIn() called!');
};

const signInFB = async (req, res, next) => {
  console.log(req.user);
  res.status(200).json({ rola: 'rola' });
};

const secret = async (req, res, next) => {
  console.log('UserController.secret() called!');
  res.status(200).send('Protected route available');
};

module.exports = {
  signUp,
  signIn,
  signInFB,
  secret,
};
