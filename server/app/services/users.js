const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findByEmail, insertUser } = require('../db/users');

function UsersServiceException(message, owner) {
  this.message = message;
  this.name = 'UsersServiceException';
  this.ownerFunction = owner;
  this.code = 403;
}

/**
 * Sign an user jwt
 * @param {*} userId
 * @returns JWT signed
 */
const signToken = (userId) => {
  return JWT.sign(
    {
      user: userId, // change user ID to some more relevant info (Name, email)
      iat: new Date().getTime(), // current time
      exp: new Date().setDate(new Date().getDate() + 2), // current time + 1 day ahead
    },
    process.env.JWTSECRET
  );
};

/**
 * Checks if an user can be found with a specific email
 * @param {*} email
 * @returns True if an user was found, false otherwise
 */
const foundUserByEmail = async (email) => {
  const foundUser = await findByEmail(email);
  if (foundUser.length > 0) {
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
    throw new UsersServiceException('Email is already in use', 'registerNewUser');
  }

  const newUserId = await insertUser(user);
  return signToken(newUserId);
};

module.exports = {
  registerNewUser,
};
