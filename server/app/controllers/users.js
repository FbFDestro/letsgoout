const signUp = async (req, res, next) => {
  const { email, name, username, password, force } = req.body;
  // force = true -> signUp a new user even with a facebook login with same email
  const { signUpNewUser } = require('../services/users');
  try {
    const newUserJWT = await signUpNewUser({ email, name, username, password }, force);
    res.status(200).json({ token: newUserJWT });
  } catch (error) {
    console.error(error);
    return res.status(error.code || 500).json({ errors: [{ msg: error.message }] });
  }
};

const signIn = async (req, res, next) => {
  const { email_username, password } = req.body; // COULD HANDLE WHEN TRY TO LOGIN WITH USERNAME INSTEAD OF EMAIL
  const { signInLocalUser } = require('../services/users');
  try {
    const loggedUserJWT = await signInLocalUser(email_username, password);
    res.status(200).json({ token: loggedUserJWT });
  } catch (error) {
    if (error.code === 401) {
      return res
        .status(401)
        .json({ errors: [{ msg: 'Invalid email/username or password' }] });
    }
    return res.status(error.code || 500).json({ errors: [{ msg: error.message }] });
  }
};

const signInFb = async (req, res, next) => {
  const { trySignInFbUser } = require('../services/users');
  const { user } = req;
  try {
    const trySignInResponse = await trySignInFbUser(user);
    console.log(trySignInResponse);
    if (!!trySignInResponse.JWT) {
      // successful login
      res.status(200).json({ token: trySignInResponse.JWT });
    } else {
      res.status(200).json({ fbUserData: trySignInResponse.fbUserData });
      // start to signUp new user, send user data waiting to recieve another q
    }
  } catch (error) {
    console.log(error);
    return res.status(error.code || 500).json({ errors: [{ msg: error.message }] });
  }
};

const signUpFb = async (req, res, next) => {
  const { signUpFbUser } = require('../services/users');
  const { user } = req.body;
  try {
    const signUpJWT = await signUpFbUser(user);
    res.status(200).json({ token: signUpJWT });
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
  signInFb,
  signUpFb,
  secret,
};
