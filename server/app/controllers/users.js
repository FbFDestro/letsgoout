const signUp = async (req, res, next) => {
  const { email, name, password } = req.body;
  const { registerNewUser } = require('../services/users');
  try {
    var newUserJWT = await registerNewUser({ email, name, password });
  } catch (error) {
    console.error(error);
    return res
      .status(error.code || 500)
      .json({ errors: [{ msg: `${error.name} - ${error.message}` }] });
  }

  res.status(200).json({ newUserJWT });
};

const signIn = async (req, res, next) => {
  console.log('UserController.signIn() called!');
};

const secret = async (req, res, next) => {
  console.log('UserController.secret() called!');
};

module.exports = {
  signUp,
  signIn,
  secret,
};
