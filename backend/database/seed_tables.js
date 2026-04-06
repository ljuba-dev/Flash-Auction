import getConnection from '../server/services/db.js';
import bcrypt from 'bcrypt';
const db = await getConnection();
/**
 * Seed user table with one user
 * 1. username: ljuba
 * 2. email: ljuba@ljuba.com
 * 3. password: ljuba */
async function seedUsersTable() {
  const pwd = bcrypt.hashSync('ljuba', 10);
  const checkIfUserExists = await db.query(`SELECT 1 FROM auction.users WHERE email = 'ljuba@ljuba.com'`);
  if (checkIfUserExists.length > 0) {
    return {
      error: true,
      message: 'User already exists',
    };
  } else {
    await db.query(`INSERT INTO auction.users (username, email, password) VALUES ('ljuba','ljuba@ljuba.com','${pwd}')`);
    return {
      error: false,
      message: 'User created successfully',
    };
  }
}
/**
 * Seed items table with one item
 * 1. name: Laptop
 * 2. description: A powerful laptop
 * 3. starting_bid: 10
 * 4. current_bid: 10
 * 5. end_time: 2027-01-01 00:00:00
 */
async function seedItemsTable() {
  const checkIfItemExists = await db.query(`SELECT 1 FROM auction.items WHERE name = 'Laptop'`);
  if (checkIfItemExists.length > 0) {
    return {
      error: true,
      message: 'Item already exists',
    };
  } else {
    await db.query(
      `INSERT INTO auction.items (name, description, starting_bid, current_bid, end_time) VALUES ('Laptop', 'A powerful laptop', 10, 10, '2027-01-01 00:00:00')`,
    );
    return {
      error: false,
      message: 'Item created successfully',
    };
  }
}
export { seedUsersTable, seedItemsTable };
