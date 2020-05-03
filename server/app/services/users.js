const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findByEmail, insertUser } = require('../db/users');

function UsersServiceException(message, owner, code) {
  this.message = message;
  this.name = 'UsersServiceException';
  this.ownerFunction = owner;
  this.code = code;
}

/**
 * Sign an user jwt
 * @param {*} userId
 * @returns JWT signed
 */
const signToken = (user) => {
  return JWT.sign(
    {
      user,
      iat: new Date().getTime(), // current time
    },
    process.env.JWTSECRET,
    { expiresIn: '3 days' }
  );
};

/**
 * Checks if an user can be found with a specific email
 * @param {*} email
 * @returns True if an user was found, false otherwise
 */
const foundUserByEmail = async (email) => {
  const foundUser = await findByEmail(email);
  if (foundUser) {
    return true;
  }
  return false;
};

/**
 * Register a new user
 * @param {*} user (email, name, password)
 * @returns Json web token of the new user
 */
const registerNewUser = async (user) => {
  if (await foundUserByEmail(user.email)) {
    throw new UsersServiceException('Email is already in use', 'registerNewUser', 403);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const newUserId = await insertUser(user);
  return signToken({ email: user.email, name: user.name, id: newUserId });
};

/**
 * Sign in an user
 * @param {*} email
 * @param {*} password
 * @returns JWT of logged user
 */

const signInUser = async (email, password) => {
  const foundUser = await findByEmail(email);
  if (!foundUser) {
    throw new UsersServiceException('No user found with this email', 'signInUser', 401);
  }
  if (!(await bcrypt.compare(password, foundUser.password))) {
    throw new UsersServiceException('Invalid password', 'signInUser', 401);
  }

  return signToken({ email: foundUser.email, name: foundUser.name, id: foundUser.id });
};

module.exports = {
  registerNewUser,
  signInUser,
};
