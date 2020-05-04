const signUp = async (req, res, next) => {
  const { email, name, username, password, force } = req.body;
  // force = true -> register a new user even with a facebook login with same email
  const { registerNewUser } = require('../services/users');
  try {
    const newUserJWT = await registerNewUser({ email, name, username, password }, force);
    res.status(200).json({ token: newUserJWT });
  } catch (error) {
    console.error(error);
    return res.status(error.code || 500).json({ errors: [{ msg: error.message }] });
  }
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body; // COULD HANDLE WHEN TRY TO LOGIN WITH USERNAME INSTEAD OF EMAIL
  const { signInLocalUser } = require('../services/users');
  try {
    const loggedUserJWT = await signInLocalUser(email, password);
    res.status(200).json({ token: loggedUserJWT });
  } catch (error) {
    if (error.code === 401) {
      return res.status(401).json({ errors: [{ msg: 'Invalid email or password' }] });
    }
    return res.status(error.code || 500).json({ errors: [{ msg: error.message }] });
  }
};

const signInFB = async (req, res, next) => {
  const { signInFBUser } = require('../services/users');
  /*
  if (!req.user) {
    req.user = req.body.user;
  }
  */

  const { username } = req.body;
  const user = { ...req.user, username };
  try {
    const signInResponse = await signInFBUser(user);
    if (signInResponse.JWT) {
      // successful login
      res.status(200).json({ token: signInResponse.JWT });
    } else {
      res.status(200).json({ user: signInResponse.user });
      // start to register new user, send user data waiting to recieve another q
    }
  } catch (error) {
    console.log(error);
    return res.status(error.code || 500).json({ errors: [{ msg: error.message }] });
  }
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
