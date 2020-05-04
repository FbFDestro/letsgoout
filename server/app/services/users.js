const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  findByEmail,
  findByFBId,
  findByUsername,
  insertUser,
  joinUser,
} = require('../db/users');

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
  if (user.access_token) {
    delete user.access_token;
  }
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
  const foundUser = await findByEmail(email, 'local');
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
const registerNewUser = async (user, force = false) => {
  const foundLocalUser = await findByEmail(user.email, 'local');
  if (foundLocalUser) {
    throw new UsersServiceException('Email is already in use', 'registerNewUser', 403);
  }
  const foundByUsername = await findByUsername(user.username);
  if (foundByUsername) {
    throw new UsersServiceException('Username is already in use', 'signInFBUser', 403);
  }
  if (!force) {
    const foundFbUser = await findByEmail(user.email, 'fb');
    if (foundFbUser) {
      throw new UsersServiceException(
        'You already have an account using Facebook Login. To avoid creating multiple acconuts, login with Facebook',
        'registerNewUser',
        409
      );
    }
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const newUserId = await insertUser(user, 'local');
  return signToken({
    email: user.email,
    name: user.name,
    username: user.username,
    fb_id: null,
    id: newUserId,
  });
};

/**
 * Sign in an user
 * @param {*} email
 * @param {*} password
 * @returns JWT of logged user
 */
const signInLocalUser = async (email, password) => {
  let foundUser = await findByEmail(email, 'local');
  if (!foundUser) {
    const foundFbUser = await findByEmail(email, 'fb');
    if (foundFbUser) {
      throw new UsersServiceException(
        'You already have an account using Facebook Login. Try to login via Facebook.',
        403
      );
    }
    throw new UsersServiceException(
      'No user found with this email',
      'signInLocalUser',
      401
    );
  }

  foundUser = await joinUser(foundUser.users_id, 'local'); // get local user info by inner join

  if (!(await bcrypt.compare(password, foundUser.password))) {
    throw new UsersServiceException('Invalid password', 'signInLocalUser', 401);
  }

  return signToken({
    email: foundUser.email,
    name: foundUser.name,
    username: foundUser.username,
    fb_id: null,
    id: foundUser.id,
  });
};

const signInFBUser = async (user, force = false) => {
  let foundUser = await findByFBId(user.fb_id);
  if (!foundUser) {
    // check if there is an account with this email already in local login to suggest to login that account and merge those accounts
    // maybe by adding force (same as in registernewuser)
    if (!force) {
      const foundByLocalEmail = await findByEmail(user.email, 'local');
      if (foundByLocalEmail) {
        throw new UsersServiceException(
          'You already have an account with the same email as your Facebook. To avoid creating multiple acconuts, login with your account and connect your Facebook with it if desired.',
          'signInFbUser',
          409
        );
      }
    }

    if (!user.username) {
      // send info to client asking for username to complete insertion
      return { user };
    }
    const foundByUsername = await findByUsername(user.username);
    if (foundByUsername) {
      throw new UsersServiceException('Username is already in use', 'signInFBUser', 403);
    }
    // check if username is availabe

    const newUserId = await insertUser(user, 'fb');
    return {
      JWT: signToken({
        ...user,
        id: newUserId,
      }),
    };
  }

  foundUser = await joinUser(foundUser.users_id, 'fb'); // get local user info by inner join

  return {
    JWT: signToken({
      email: foundUser.email,
      name: foundUser.name,
      username: foundUser.username,
      fb_id: foundUser.fb_id,
      id: foundUser.id,
    }),
  };
  // check if current user already exists, if so, login into it, otherwise createit
};

module.exports = {
  registerNewUser,
  signInLocalUser,
  signInFBUser,
};
