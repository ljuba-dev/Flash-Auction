import getConnection from "./db.js";
/**
 * Get all users
 * @returns {object[]} users
 * */
async function getUsers() {
  try {
    const db = await getConnection();
    const users = await db.query(`select * from auction.users`);
    return users.rows;
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: "No users found",
      statusCode: 404,
    };
  }
}
/**
 * Get user by id
 * @param {number} id
 * @returns {object} user
 * */
async function getUserById(id) {
  try {
    const db = await getConnection();
    const user = await db.query(`select * from auction.users where id = ${id}`);
    if (user.rows.length === 0) {
      throw new Error("User not found");
    }
    return user.rows[0];
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: e.message,
      id,
      statusCode: 404,
    };
  }
}
/**
 * Insert user into database
 * @param {object} user
 * @returns {Promise}
 * */
async function insertUser(user) {
  try {
    const db = await getConnection();
    const checkIfUserExists = await db.query(
      `select * from auction.users where email = '${user.email.trim()}'`,
    );
    if (checkIfUserExists.rows.length > 0) {
      throw new Error("User already exists");
    } else {
      const userCreate = await db.query(
        `INSERT INTO auction.users (username, email, password) VALUES ('${user.username}', '${user.email}', '${user.password}') RETURNING id;`,
      );
      return userCreate.rows[0].id;
    }
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: e.message,
      statusCode: 400,
    };
  }
}
/**
 * Update user based on id
 * @param {number} id
 * @param {object} user
 * */
async function updateUser(id, user) {
  try {
    const db = await getConnection();
    const checkIfUserExists = await db.query(
      `select id from auction.users where id = ${id}`,
    );
    if (checkIfUserExists.rows.length === 0) {
      throw new Error("User not found");
    }
    let query = "update auction.users set ";
    query += Object.keys(user)
      .map((key) => `${key} = '${user[key]}'`)
      .join(", ");
    query += ` where id = ${id}`;
    return await db.query(query);
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: e.message,
      statusCode: 404,
    };
  }
}
/**
 * Delete user based on id
 * @param {number} id
 * @returns {Promise}
 * */
async function deleteUser(id) {
  try {
    if (!id) throw new Error("User id is required");
    if (typeof id !== "number") throw new Error("User id must be a number");
    const db = await getConnection();
    const deleteUser = await db.query(
      `delete from auction.users where id = ${id}`,
    );
    return !!deleteUser;
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: e.message,
      statusCode: 404,
    };
  }
}
export { getUsers, getUserById, insertUser, updateUser, deleteUser };
