const pool = require('../db/pool');

function UsersDbException(message, owner) {
  this.message = message;
  this.name = 'UsersDbException';
  this.ownerFunction = owner;
  this.code = 500;
}

/**
 * Find a local or fb user by email
 * @param {string} email
 * @param {string} type - local, fb
 * @returns User rows with specific email for a specific type (local or fb)!
 */
const findByEmail = async (email, type) => {
  try {
    const result = await pool.query({
      text: `select * from ${type}_users where email = $1`,
      values: [email],
    });
    return result.rows[0];
  } catch (error) {
    throw new UsersDbException(error.message, 'findLocalByEmail'); // this message can be customized
  }
};

/**
 * Find a user by username
 * @param {string} username
 * @returns User row with specific username!
 */
const findByUsername = async (username) => {
  try {
    const result = await pool.query({
      text: 'select * from users where username = $1',
      values: [username],
    });
    return result.rows[0];
  } catch (error) {
    throw new UsersDbException(error.message, 'findByUsername');
  }
};

/**
 * Find a fb user with specific fb_id
 * @param {*} fb_id
 * @param {boolean} join - join full data with users table or not
 * @returns Fb User row joined or not with users
 */
const findByFbId = async (fb_id, join) => {
  let queryText;
  if (!join) {
    queryText = 'select * from fb_users where fb_id = $1';
  } else {
    queryText =
      'select * from users u inner join fb_users fu on u.id = fu.users_id where fu.fb_id = $1';
  }

  try {
    const result = await pool.query({
      text: queryText,
      values: [fb_id],
    });
    return result.rows[0];
  } catch (error) {
    throw new UsersDbException(error.message, 'findByFbId');
  }
};

/**
 * Find an user by email or username
 * @param {*} email_username
 * @param {*} type - local or fb
 * @returns Joined user data with an email or username
 */
const findByEmailOrUsernameJoined = async (email_username, type) => {
  try {
    const result = await pool.query({
      text: `select * from users u inner join ${type}_users tu on u.id = tu.users_id where u.username = $1 or tu.email = $1`,
      values: [email_username],
    });
    return result.rows[0];
  } catch (error) {
    throw new UsersDbException(error.message, 'findByUsername');
  }
};

const joinUser = async (id, type) => {
  try {
    const result = await pool.query({
      text: `select * from users u inner join ${type}_users tu on u.id = tu.users_id where u.id = $1`,
      values: [id],
    });
    return result.rows[0];
  } catch (error) {
    throw new UsersDbException(error.message, 'joinUser');
  }
};

const insertUser = async ({ email, name, username, password, fb_id }, type) => {
  try {
    const result = await pool.query({
      text: 'insert into users (name, username) values ($1, $2) returning id',
      values: [name, username],
    });

    const userId = result.rows[0].id;

    if (type === 'local') {
      await pool.query({
        text: 'insert into local_users (email, password, users_id) values ($1, $2, $3)',
        values: [email, password, userId],
      });
    } else if (type === 'fb') {
      await pool.query({
        text: 'insert into fb_users (fb_id, email, users_id) values ($1, $2, $3)',
        values: [fb_id, email, userId],
      });
    } else {
      throw new UsersDbException('Invalid user type on InserUser', 'insertUser');
    }

    return userId;
  } catch (error) {
    throw new UsersDbException(error.message, 'insertUser'); // this message can be customized
  }
};

module.exports = {
  findByEmail,
  findByUsername,
  findByEmailOrUsernameJoined,
  findByFbId,
  insertUser,
  joinUser,
};
