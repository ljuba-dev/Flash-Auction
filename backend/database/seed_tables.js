import { DB as db } from '../server/services/db.js';
import bcrypt from 'bcrypt';
import { userData, itemsData } from './seed_data.js';

/**
 * Seed user table
 * */
async function seedUsersTable() {
  let counter = 0;
  let counterExits = 0;
  for (const user of userData) {
    const pwd = bcrypt.hashSync(user.password, 10);
    const checkIfUserExists = await db.query(`SELECT 1 FROM auction.users WHERE email = '${user.email}'`);
    if (checkIfUserExists.rows.length > 0) {
      counterExits++;
    } else {
      await db.query(
        `INSERT INTO auction.users (username, email, password) VALUES ('${user.username}','${user.email}','${pwd}')`,
      );
      counter++;
    }
  }
  return {
    error: false,
    continue: true,
    message: 'User created successfully',
  };
}
/**
 * Seed items table
 */
async function seedItemsTable() {
  let counter = 0;
  for (const item of itemsData) {
    await db.query(
      `INSERT INTO auction.items (name, description, starting_bid, current_bid, end_time) VALUES ('${item.name}', '${item.description}', ${item.starting_bid}, ${item.current_bid}, '${new Date(item.end_time).toISOString()}')`,
    );
    counter++;
  }
  return {
    error: false,
    continue: true,
    message: 'Item created successfully',
  };
}
export { seedUsersTable, seedItemsTable };
