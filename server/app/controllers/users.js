const pool = require('../db/pool');

const signUp = async (req, res, next) => {
  const { email, name, password } = req.body;

  // check if ther is a user with the same email
  const foundUser = await pool.query({
    text: 'select * from users where email = $1',
    values: [email],
  });

  if (foundUser.rowCount > 0) {
    return res.status(403).json({ errors: [{ msg: 'Email is already in use' }] });
  }

  // I need to change the table to contain a password field!
  const newUser = await pool.query({
    text: 'insert into users (email, name) VALUES ($1, $2) returning id',
    values: [email, name],
  });

  console.log(newUser);

  // return token

  res.status(200).send('rola');
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
