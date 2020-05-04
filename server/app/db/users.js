const pool = require('../db/pool');

function UsersDbException(message, owner) {
  this.message = message;
  this.name = 'UsersDbException';
  this.ownerFunction = owner;
  this.code = 500;
}

/**
 * Find all users by email
 * @param {string} email
 * @param {string} type - local, fb
 * @returns User rows with specific email for a specific type (local or fb)
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

const findByFBId = async (fb_id) => {
  try {
    const result = await pool.query({
      text: `select * from fb_users where fb_id = $1`,
      values: [fb_id],
    });
    return result.rows[0];
  } catch (error) {
    throw new UsersDbException(error.message, 'findByFBId'); // this message can be customized
  }
};

const findByUsername = async (username) => {
  try {
    const result = await pool.query({
      text: 'select * from users where username = $1',
      values: [username],
    });
    return result.rows[0];
  } catch (error) {
    throw new UsersDbException(error.message, 'findByUsername'); // this message can be customized
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
  findByFBId,
  insertUser,
  joinUser,
};
