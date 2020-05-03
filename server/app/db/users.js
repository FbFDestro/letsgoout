const pool = require('../db/pool');

function UsersDbException(message, owner) {
  this.message = message;
  this.name = 'UsersDbException';
  this.ownerFunction = owner;
  this.code = 500;
}

/**
 * Find all users by email
 * @param {*} email
 * @returns All users rows with specific email
 */
const findByEmail = async (email) => {
  try {
    const result = await pool.query({
      text: 'select * from users where email = $1',
      values: [email],
    });
    return result.rows;
  } catch (error) {
    throw new UsersDbException(error.message, 'findByEmail'); // this message can be customized
  }
};

const insertUser = async ({ email, name, password }) => {
  try {
    const result = await pool.query({
      text: 'insert into users (email, name, password) VALUES ($1, $2, $3) returning id',
      values: [email, name, password],
    });
    return result.rows[0].id;
  } catch (error) {
    throw new UsersDbException(error.message, 'insertUser'); // this message can be customized
  }
};

module.exports = {
  findByEmail,
  insertUser,
};
