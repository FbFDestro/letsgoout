const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  findByEmail,
  findByFbId,
  findByEmailOrUsernameJoined,
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
const signUpNewUser = async (user, force = false) => {
  const foundLocalUser = await findByEmail(user.email, 'local');
  if (foundLocalUser) {
    throw new UsersServiceException('Email is already in use', 'signUpNewUser', 403);
  }
  const foundByUsername = await findByUsername(user.username);
  if (foundByUsername) {
    throw new UsersServiceException('Username is already in use', 'signInFbUser', 403);
  }
  if (!force) {
    const foundFbUser = await findByEmail(user.email, 'fb');
    if (foundFbUser) {
      throw new UsersServiceException(
        'You already have an account using Facebook Login. To avoid creating multiple acconuts, login with Facebook',
        'signUpNewUser',
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
const signInLocalUser = async (email_username, password) => {
  const foundUser = await findByEmailOrUsernameJoined(email_username, 'local');
  if (!foundUser) {
    const foundFbUser = await findByEmailOrUsernameJoined(email_username, 'fb');
    if (foundFbUser) {
      throw new UsersServiceException(
        'You already have an account using Facebook Login with this email or username. Try to login via Facebook.',
        403
      );
    }
    throw new UsersServiceException(
      'No user found with this email or username',
      'signInLocalUser',
      401
    );
  }

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

const trySignInFbUser = async (user) => {
  const foundUser = await findByFbId(user.fb_id, true);
  if (!foundUser) {
    const foundByLocalEmail = await findByEmail(user.email, 'local'); // suggest to login with local account and merge
    const jwt_fb_id = JWT.sign(user.fb_id, process.env.JWTSECRET); // fb_id can't be modified by user
    delete user.fb_id;
    return {
      fbUserData: { ...user, jwt_fb_id, hasLocalEmailEqual: !!foundByLocalEmail },
    }; // send back user fb data, allowing editting and adding username
  }

  return {
    JWT: signToken({
      email: foundUser.email,
      name: foundUser.name,
      username: foundUser.username,
      fb_id: foundUser.fb_id,
      id: foundUser.id,
    }),
  };
};

const signUpFbUser = async (user) => {
  try {
    var fb_id = JWT.verify(user.jwt_fb_id, process.env.JWTSECRET);
  } catch (error) {
    throw new UsersServiceException(
      'FB id token invalid! Try to login with Facebook again.',
      'signUpFbUser',
      401
    );
  }

  let foundUser = await findByFbId(fb_id, false);
  if (foundUser) {
    throw new UsersServiceException('Fb account is already in use', 'signUpFbUser', 403);
  }
  foundUser = await findByEmail(user.email, 'local');
  foundUser = foundUser || (await findByEmail(user.email, 'fb'));
  if (foundUser) {
    throw new UsersServiceException('Email is already in use', 'signUpFbUser', 403);
  }
  foundUser = await findByUsername(user.username);
  if (foundUser) {
    throw new UsersServiceException('Username is already in use', 'signInFbUser', 403);
  }

  user.fb_id = fb_id; // to be sure if hasn't been changed
  const newUserId = await insertUser(user, 'fb');
  return {
    JWT: signToken({
      ...user,
      id: newUserId,
    }),
  };
};

module.exports = {
  signUpNewUser,
  signInLocalUser,
  trySignInFbUser,
  signUpFbUser,
};
